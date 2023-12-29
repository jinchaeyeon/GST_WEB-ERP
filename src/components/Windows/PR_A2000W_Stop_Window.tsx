import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { useApi } from "../../hooks/api";
import { 
  GetPropertyValueByName, 
  UseCustomOption, 
  UseGetValueFromSessionItem, 
  UseMessages, 
  UseParaPc, 
  findMessage 
} from "../CommonFunction";
import { IWindowPosition } from "../../hooks/interfaces";
import { useEffect, useState } from "react";
import { 
  BottomContainer, 
  ButtonContainer, 
  FormBox, 
  FormBoxWrap 
} from "../../CommonStyled";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import { Iparameters } from "../../store/types";
import React from "react";
import { Button } from "@progress/kendo-react-buttons";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../../store/atoms";

type TData = {
  prodmac: string;
  prodemp: string;
};

type TKendoWindow = {
  setVisible(visible: boolean): void;
  data: TData;
  setData(workType: string): void;  // 비가동 입력시 workType 전달
  modal? : boolean;
  pathname: string;
};

const KendoWindow = ({ 
  setVisible, 
  data, 
  setData,
  modal = false,
  pathname
}: TKendoWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const processApi = useApi();
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");

  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const setLoading = useSetRecoilState(isLoading);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  useEffect(() => {
    if (customOptionData !== null)  {
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, 
        "query");
      setParaSaved((prev) => ({
        ...prev,
        prodemp: userId,
        prodmac: data.prodmac,
      }));
    }
  }, [customOptionData]);

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 400,
    height: 330,
  });

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };

  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    setVisible(false);
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setParaSaved((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [paraSaved, setParaSaved] = useState({
    workType: "",
    prodmac: data.prodmac,
    prodemp: userId,
    stopcd: "",
    isSearch: true,
  });

  const onCheckClick = () => {
    let valid = true;

    try {
      if (paraSaved.stopcd === "" ||
          paraSaved.stopcd === undefined ||
          paraSaved.stopcd === null
      ) {
        throw findMessage(messagesData, "PR_A2000W_001");
      }
    } catch(e) {
      alert(e);
      valid = false;
    }

    if (valid) {
      fetchTodoSave();
    }
  };

  const fetchTodoSave = async () => {
    let data: any;
    setLoading(true);

    const parameters: Iparameters = {
      procedureName: "P_PR_A2000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "StopS",
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_renum": "",
        "@p_reseq": 0,
        "@p_gonum": "",
        "@p_goseq": 0,
        "@p_planno": "",
        "@p_planseq": 0,
        "@p_prodmac": paraSaved.prodmac,
        "@p_prodemp": paraSaved.prodemp,
        "@p_proccd": "",
        "@p_qty": 0,
        "@p_badqty": 0,
        "@p_remark": "",
        "@p_gubun_s": "",
        "@p_initemcd_s": "",
        "@p_inlotnum_s": "",
        "@p_inqty_s": "",
        "@p_qtyunit_s": "",
        "@p_proccd_s": "",
        "@p_renum_s": "",
        "@p_reseq_s": "",
        "@p_rowstatus_s": "",
        "@p_badnum_s": "",
        "@p_badseq_s": "",
        "@p_baddt_s": "",
        "@p_badcd_s": "",
        "@p_qty_s": "",
        "@p_remark_s": "",
        "@p_stopnum": "",
        "@p_stopcd": paraSaved.stopcd,
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A2000W",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setData("end");
      onClose();
    } else {
      console.log("[에러 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    setLoading(false);
  };

  return (
    <Window
      title={"비가동 입력"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <FormBoxWrap border={true}>
        <FormBox>
          <tbody>
            <tr>
              <th>작업자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox 
                    name="prodemp"
                    value={paraSaved.prodemp}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
                    className="required"
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>설비</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="prodmac"
                    value={paraSaved.prodmac}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="fxfull"
                    valueField="fxcode"
                    className="readonly"
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>비가동유형</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="stopcd"
                    value={paraSaved.stopcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <BottomContainer style={{ marginTop: "40px" }}>
        <ButtonContainer>
          <Button 
            themeColor={"primary"}
            fillMode={"outline"}
            onClick={onCheckClick}
          >
            확인
          </Button>
          <Button
            themeColor={"primary"}
            fillMode={"outline"}
            onClick={onClose}
          >
            취소
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default KendoWindow;
