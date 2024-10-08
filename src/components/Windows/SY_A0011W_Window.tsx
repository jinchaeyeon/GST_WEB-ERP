import { Button } from "@progress/kendo-react-buttons";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { Iparameters, TPermissions } from "../../store/types";
import {
  UseGetValueFromSessionItem,
  UsePermissions,
  getHeight,
  getWindowDeviceHeight
} from "../CommonFunction";
import Window from "./WindowComponent/Window";

type TKendoWindow = {
  setVisible(t: boolean): void;
  reloadData(workType: string, group_id?: string | undefined): void;
  setGroupId(groupCode: string): void;
  workType: string;
  user_group_id?: string;
  isCopy?: boolean;
  para?: Iparameters; //{};
  modal?: boolean;
};

var height = 0;
var height2 = 0;

const KendoWindow = ({
  setVisible,
  reloadData,
  setGroupId,
  workType,
  user_group_id = "",
  isCopy,
  para,
  modal = false,
}: TKendoWindow) => {
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 500) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 320) / 2,
    width: isMobile == true ? deviceWidth : 500,
    height: isMobile == true ? deviceHeight : 320,
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
    if (permissions.view && (workType == "U" || isCopy == true)) {
      fetchMain();
    }
  }, [permissions]);

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
      "@p_culture_name": "",
      "@p_use_yn": "%",
      "@p_find_row_value": "",
    },
  };

  //요약정보 조회
  const fetchMain = async () => {
    if (!permissions.view) return;
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const row = data.tables[0].Rows[0];
      const totalRowCnt = data.tables[0].RowCount;

      if (totalRowCnt > 0) {
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
    if (!permissions.save) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (workType == "U") {
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

      alert(data.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  const handleSubmit = () => {
    if (!permissions.save) return;
    let valid = true;

    if (!initialVal.user_group_id) {
      alert("사용자 그룹 ID를 입력하세요.");
    } else {
      valid = false;
    }

    if (!initialVal.user_group_name) {
      alert("사용자 그룹명를 입력하세요.");
    } else {
      valid = false;
    }

    if (!valid) return false;
    setParaData((prev) => ({
      ...prev,
      work_type: workType,
      user_group_id: initialVal.user_group_id,
      user_group_name: initialVal.user_group_name,
      memo: initialVal.memo,
      use_yn: initialVal.use_yn == "Y" ? "Y" : "N",
    }));
  };

  useEffect(() => {
    if (paraData.work_type !== "" && permissions.save) fetchMainSaved();
  }, [paraData, permissions]);

  return (
    <Window
      titles={workType == "N" ? "사용자그룹 생성" : "사용자그룹 정보"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <FormBoxWrap style={{ height: isMobile ? mobileheight : webheight }}>
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
                  type="text"
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
      <BottomContainer className="BottomContainer">
        <ButtonContainer>
          {permissions.save && (
            <Button themeColor={"primary"} onClick={handleSubmit}>
              저장
            </Button>
          )}
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default KendoWindow;
