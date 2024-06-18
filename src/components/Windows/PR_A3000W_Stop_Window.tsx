import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Field,
  Form,
  FormElement,
  FormRenderProps,
} from "@progress/kendo-react-form";
import * as React from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FieldWrap,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { sessionItemState } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  UsePermissions,
  getHeight,
  getWindowDeviceHeight,
} from "../CommonFunction";
import { FormComboBox, FormReadOnly } from "../Editors";
import Window from "./WindowComponent/Window";

type TData = {
  prodmac: string;
  prodemp: string;
};
type TKendoWindow = {
  setVisible(visible: boolean): void;
  data: TData;
  setData(): void;
  pathname: string;
};

var height = 0;
var height2 = 0;

const KendoWindow = ({ setVisible, data, setData, pathname }: TKendoWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 400) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 330) / 2,
    width: isMobile == true ? deviceWidth : 400,
    height: isMobile == true ? deviceHeight : 330,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".BottomContainer"); //하단 버튼부분

    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height - height2
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
  }, []);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
  };

  // 세션 아이템
  const [sessionItem] = useRecoilState(sessionItemState);

  const onClose = () => {
    setVisible(false);
  };

  const [formKey, setFormKey] = React.useState(1);
  const resetForm = () => {
    setFormKey(formKey + 1);
  };
  //수정 없이 submit 가능하도록 임의 value를 change 시켜줌
  useEffect(() => {
    const valueChanged = document.getElementById("valueChanged");
    valueChanged!.click();
  }, [formKey]);
  const processApi = useApi();
  const [dataState, setDataState] = useState<State>({
    skip: 0,
    take: 20,
  });

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], dataState)
  );

  //비가동유형, 사용자, 설비
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_PR011,L_sysUserMaster_001,L_fxcode", setBizComponentData);

  useEffect(() => {
    if (bizComponentData !== null) {
      setInitialVal((prev) => {
        return {
          ...prev,
          prodmac: bizComponentData
            .find((item: any) => item.bizComponentId == "L_fxcode")
            .data.Rows.find((item: any) => item.fxcode == data.prodmac).fxfull,
        };
      });
    }
  }, [bizComponentData]);

  const [initialVal, setInitialVal] = useState({
    prodmac: "",
    stopcd: "",
    prodemp: data.prodemp,
  });

  //fetch된 데이터가 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetForm();
  }, [initialVal]);

  //fetch된 그리드 데이터가 그리드 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetForm();
  }, [detailDataResult]);

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    user_group_id: "",
    user_group_name: "",
    memo: "",
    use_yn: "",
    userid: userId,
    pc: pc,
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_PR_A3000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_orgdiv": sessionItem.find(
        (sessionItem) => sessionItem.code == "orgdiv"
      )?.value,
      "@p_location": sessionItem.find(
        (sessionItem) => sessionItem.code == "location"
      )?.value,
      "@p_prodemp": initialVal.prodemp,
      "@p_prodmac": data.prodmac,
      "@p_qty": 0,
      "@p_badqty": 0,
      "@p_plankey": "",
      "@p_rekey": "",
      "@p_stopcd": initialVal.stopcd,
      "@p_serviceid": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": pathname,
    },
  };

  const fetchMainSaved = async () => {
    if (!permissions.save) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setData();
      onClose();
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert(data.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  const handleSubmit = (dataItem: { [name: string]: any }) => {
    setParaData((prev) => ({
      ...prev,
      work_type: "StopS",
    }));
  };

  useEffect(() => {
    if (paraData.work_type !== "" && permissions.save) fetchMainSaved();
  }, [paraData, permissions]);

  return (
    <Window
      titles={"비가동 입력"}
      positions={position}
      Close={onClose}
      modals={true}
      onChangePostion={onChangePostion}
    >
      <Form
        onSubmit={handleSubmit}
        key={formKey}
        initialValues={{
          prodmac: initialVal.prodmac,
          stopcd: initialVal.stopcd,
          prodemp: initialVal.prodemp,
        }}
        render={(formRenderProps: FormRenderProps) => (
          <FormElement horizontal={true}>
            <fieldset
              className={"k-form-fieldset"}
              style={{
                height: isMobile ? mobileheight : webheight,
                overflow: "auto",
              }}
            >
              <button
                id="valueChanged"
                style={{ display: "none" }}
                onClick={(e) => {
                  e.preventDefault(); // Changing desired field value
                  formRenderProps.onChange("valueChanged", {
                    value: "1",
                  });
                }}
              ></button>
              <FieldWrap fieldWidth="100%">
                <Field
                  name={"prodmac"}
                  label={"설비"}
                  component={FormReadOnly}
                  className="readonly"
                />
              </FieldWrap>
              <FieldWrap fieldWidth="100%">
                {bizComponentData !== null && (
                  <Field
                    name={"stopcd"}
                    label={"비가동유형"}
                    component={FormComboBox}
                    data={
                      bizComponentData.find(
                        (item: any) => item.bizComponentId == "L_PR011"
                      ).data.Rows
                    }
                    columns={
                      bizComponentData.find(
                        (item: any) => item.bizComponentId == "L_PR011"
                      ).bizComponentItems
                    }
                    className="required"
                  />
                )}
              </FieldWrap>
              <FieldWrap fieldWidth="100%">
                {bizComponentData !== null && (
                  <Field
                    name={"prodemp"}
                    label={"작업자"}
                    component={FormComboBox}
                    data={
                      bizComponentData.find(
                        (item: any) =>
                          item.bizComponentId == "L_sysUserMaster_001"
                      ).data.Rows
                    }
                    columns={
                      bizComponentData.find(
                        (item: any) =>
                          item.bizComponentId == "L_sysUserMaster_001"
                      ).bizComponentItems
                    }
                    valueField="user_id"
                    textField="user_name"
                    className="required"
                  />
                )}
              </FieldWrap>
            </fieldset>
            <BottomContainer className="BottomContainer">
              <ButtonContainer>
                {permissions.save && (
                  <Button type={"submit"} themeColor={"primary"}>
                    확인
                  </Button>
                )}

                <Button
                  type={"button"}
                  themeColor={"primary"}
                  fillMode={"outline"}
                  onClick={() => setVisible(false)}
                >
                  취소
                </Button>
              </ButtonContainer>
            </BottomContainer>
          </FormElement>
        )}
      />
    </Window>
  );
};

export default KendoWindow;
