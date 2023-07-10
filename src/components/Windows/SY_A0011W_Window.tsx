import { useEffect, useState } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  FieldWrap,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import {
  Form,
  Field,
  FormElement,
  FormRenderProps,
} from "@progress/kendo-react-form";
import { FormInput, FormReadOnly, FormCheckBox } from "../Editors";
import { Iparameters } from "../../store/types";
import {
  validator,
  UseParaPc,
  UseGetValueFromSessionItem,
} from "../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition } from "../../hooks/interfaces";
import { Checkbox, Input } from "@progress/kendo-react-inputs";

type TKendoWindow = {
  setVisible(t: boolean): void;
  reloadData(workType: string, group_id?: string | undefined): void;
  setGroupId(groupCode: string): void;
  workType: string;
  user_group_id?: string;
  isCopy?: boolean;
  para?: Iparameters; //{};
  modal? : boolean;
};

const KendoWindow = ({
  setVisible,
  reloadData,
  setGroupId,
  workType,
  user_group_id = "",
  isCopy,
  para,
  modal = false
}: TKendoWindow) => {
  const userId = UseGetValueFromSessionItem("user_id");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 500,
    height: 320,
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

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "use_yn") {
      setInitialVal((prev) => ({
        ...prev,
        [name]: value == true ? "Y" : "N",
      }));
    } else {
      setInitialVal((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const onClose = () => {
    setVisible(false);
  };
  
  const processApi = useApi();

  useEffect(() => {
    if (workType === "U" || isCopy === true) {
      fetchMain();
    }
  }, []);

  const [initialVal, setInitialVal] = useState({
    user_group_id: "",
    user_group_name: "",
    memo: "",
    use_yn: "Y",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_SY_A0011W_Q ",
    pageNumber: 1,
    pageSize: 1,
    parameters: {
      "@p_work_type": "LIST",
      "@p_user_group_id": user_group_id,
      "@p_user_group_name": "",
      "@p_lang_id": "",
      "@p_use_yn": "",
    },
  };

  //요약정보 조회
  const fetchMain = async () => {
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const row = data.tables[0].Rows[0];

      setInitialVal((prev) => {
        return {
          ...prev,
          user_group_id: row.user_group_id,
          user_group_name: row.user_group_name,
          memo: row.memo,
          use_yn: row.use_yn,
        };
      });
    }
  };

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
    procedureName: "P_SY_A0011W_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_user_group_id": paraData.user_group_id,
      "@p_user_group_name": paraData.user_group_name,
      "@p_memo": paraData.memo,
      "@p_use_yn": paraData.use_yn,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
    },
  };

  const fetchMainSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      if (workType === "U") {
        reloadData("U");
        fetchMain();
      } else {
        setVisible(false);
        setGroupId(paraData.user_group_id);
        reloadData("N", paraData.user_group_id);
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  const handleSubmit = () => {
    setParaData((prev) => ({
      ...prev,
      work_type: workType,
      user_group_id : initialVal.user_group_id,
      user_group_name : initialVal.user_group_name,
      memo: initialVal.memo,
      use_yn: initialVal.use_yn === "Y" ? "Y" : "N",
    }));
  };

  useEffect(() => {
    if (paraData.work_type !== "") fetchMainSaved();
  }, [paraData]);

  return (
    <Window
      title={workType === "N" ? "사용자그룹 생성" : "사용자그룹 정보"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <FormBoxWrap>
        <FormBox>
          <tbody>
            <tr>
              <th>사용자그룹ID</th>
              <td>
                {workType == "N" ? (
                  <Input
                    name="user_group_id"
                    type="text"
                    value={initialVal.user_group_id}
                    className="required"
                    onChange={filterInputChange}
                  />
                ) : (
                  <Input
                    name="user_group_id"
                    type="text"
                    value={initialVal.user_group_id}
                    className="readonly"
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>사용자그룹명</th>
              <td>
                <Input
                  name="user_group_name"
                  type="text"
                  value={initialVal.user_group_name}
                  className="required"
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>메모</th>
              <td>
                <Input
                  name="memo"
                  type="number"
                  value={initialVal.memo}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>사용여부</th>
              <td>
                <Checkbox
                  name="use_yn"
                  value={initialVal.use_yn == "Y" ? true : false}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <BottomContainer>
        <ButtonContainer>
        <Button themeColor={"primary"} onClick={handleSubmit}>
            저장
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default KendoWindow;
