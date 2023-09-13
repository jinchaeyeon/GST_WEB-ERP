import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridHeaderSelectionChangeEvent,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  GridSortChangeEvent,
  GridToolbar,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import {
  deletedAttadatnumsState,
  isLoading,
  unsavedAttadatnumsState,
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  convertDateToStr,
  dateformat,
} from "../CommonFunction";
import { EDIT_FIELD, GAP, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import CommentsGrid from "../Grids/CommentsGrid";
import RequiredHeader from "../HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../Renderers/Renderers";
import AttachmentsWindow from "./CommonWindows/AttachmentsWindow";
import { DatePicker } from "@progress/kendo-react-dateinputs";

enum weekDay
{
  None = 0,
  Sunday = 1 << 0,
  Monday = 1 << 1,
  Tuesday = 1 << 2,
  Wednesday = 1 << 3,
  Thursday = 1 << 4,
  Friday = 1 << 5,
  Saturday = 1 << 6
}

type TKendoWindow = {
  setVisible(t: boolean): void;
  setFilters(t: any): void;
  workType: string;
  orgdiv: string;
  custcd?: string;
  modal?: boolean;
};

const KendoWindow = ({
  setVisible,
  setFilters,
  workType,
  orgdiv,
  custcd,
  modal = false,
}: TKendoWindow) => {
  const location = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);

  const setLoading = useSetRecoilState(isLoading);

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "useyn") {
      setInitialVal((prev) => ({
        ...prev,
        [name]: value == true ? "Y" : "N",
      }));
    }
    else if (name == "bircd") {
      setInitialVal((prev) => ({
        ...prev,
        [name]: value == true ? "N" : "Y",
      }));
    }
    else if (name in weekDay) 
    {
      const day:any = weekDay[name];

      if (value) {
        setInitialVal((prev) => ({
          ...prev,
          dayofweek: prev.dayofweek | day,
        }));
      }
      else {
        setInitialVal((prev) => ({
          ...prev,
          dayofweek: prev.dayofweek & ~day,
        }));
      }
    } 
    else {
      setInitialVal((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInitialVal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const pathname: string = window.location.pathname.replace("/", "");

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && workType == "N") {
      const defaultOption = customOptionData.menuCustomDefaultOptions.new;
      setInitialVal((prev) => ({
        ...prev,
        class: defaultOption.find((item: any) => item.id === "class")
          .valueCode,
        gender: defaultOption.find((item: any) => item.id === "gender")
          .valueCode,
        manager: defaultOption.find((item: any) => item.id === "manager")
          .valueCode,
        species: defaultOption.find((item: any) => item.id === "species")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  // // 비즈니스 컴포넌트 조회
  // const [bizComponentData, setBizComponentData] = useState<any>([]);
  // UseBizComponent("L_sysUserMaster_001, L_BA000", setBizComponentData);

  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1000,
    height: 400,
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

  const processApi = useApi();

  useEffect(() => {
    if (workType === "U") {
      fetchMain();
    }
  }, []);

  const [initialVal, setInitialVal] = useState({
    custcd: "",
    custnm: "",
    class: "",
    owner: "",
    species: "",
    gender: "",
    manager: "",
    strdt: convertDateToStr(new Date()),
    enddt: "20991231",
    dayofweek: 0,
    birdt: "19991231",
    bircd: "Y",
    remark: "",
    useyn: "Y",
  });

  const parameters: Iparameters = {
    procedureName: "P_CR_A0020W_Q ",
    pageNumber: 1,
    pageSize: 1,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": orgdiv,
      "@p_manager": "",
      "@p_species": "",
      "@p_custcd": custcd,
      "@p_custnm": "",
      "@p_find_row_value": "",
    },
  };

  //요약정보 조회
  const fetchMain = async () => {
    let data: any;
    setLoading(true);
    //조회조건 파라미터

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
          custcd: row.custcd ?? "",
          custnm: row.custnm ?? "",
          class: row.class ?? "",
          owner: row.owner ?? "",
          species: row.species ?? "",
          gender: row.gender ?? "",
          manager: row.manager ?? "",
          strdt: row.strdt ?? "",
          enddt: row.enddt ?? "",
          dayofweek: row.dayofweek ?? "",
          birdt: row.birdt ?? "",
          bircd: row.bircd ?? "",
          remark: row.remark ?? "",
          useyn: row.useyn ?? "",
        };
      });
    }
    setLoading(false);
  };

  // //메시지 조회
  // const [messagesData, setMessagesData] = useState<any>(null);
  // UseMessages(pathname, setMessagesData);

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    custcd: "",
    custnm: "",
    class: "",
    owner: "",
    species: "",
    gender: "",
    manager: "",
    strdt: convertDateToStr(new Date()),
    enddt: "20991231",
    dayofweek: 0,
    birdt: "19991231",
    bircd: "Y",
    remark: "",
    useyn: "Y",
    userid: userId,
    pc: pc,
    form_id: pathname,
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_CR_A0020W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_orgdiv": orgdiv,
      "@p_custcd": paraData.custcd,
      "@p_location": location,
      "@p_custnm": paraData.custnm,
      "@p_class": paraData.class,
      "@p_owner": paraData.owner,
      "@p_species": paraData.species,
      "@p_gender": paraData.gender,
      "@p_age": 0,
      "@p_manager": paraData.manager,
      "@p_strdt": paraData.strdt,
      "@p_enddt": paraData.enddt,
      "@p_dayofweek": paraData.dayofweek,
      "@p_birdt": paraData.birdt,
      "@p_bircd": paraData.bircd,
      "@p_useyn": paraData.useyn,
      "@p_color": "",
      "@p_remark": paraData.remark,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_form_id": paraData.form_id,
    },
  };

  const fetchMainSaved = async () => {
    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      if (workType === "U") {
        setFilters((prev:any) => ({ ...prev, find_row_value: paraData.custcd, isSearch: true })); // 한번만 조회되도록
        fetchMain();
      } else {
        setVisible(false);
        setFilters((prev:any) => ({ ...prev, find_row_value: paraData.custcd, isSearch: true })); // 한번만 조회되도록
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert(data.resultMessage);
    }

    paraData.work_type = ""; //초기화
    setLoading(false);
  };

  const handleSubmit = () => {
    let valid = true;

    //검증
    if (!valid) return false;

    const {
      custcd,
      custnm,
      //class: string,
      owner,
      species,
      gender,
      manager,
      strdt,
      enddt,
      dayofweek,
      birdt,
      bircd,
      remark,
      useyn,
    } = initialVal;

    setParaData((prev) => ({
      ...prev,
      work_type: workType,
      custcd: custcd,
      custnm: custnm,
      class: initialVal.class,
      owner: owner,
      species: species,
      gender: gender,
      manager: manager,
      strdt: strdt,
      enddt: enddt,
      dayofweek: dayofweek,
      birdt: birdt,
      bircd: bircd,
      remark: remark,
      useyn: useyn,
    }));
  };

  useEffect(() => {
    if (paraData.work_type !== "") fetchMainSaved();
  }, [paraData]);

  return (
    <Window
      title={workType === "N" ? "반려견 등록" : "반려견 정보"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
        {/* <GridContainer width={`68%`}> */}
          <FormBoxWrap>
            <FormBox>
              <tbody>
                <tr>
                  <th>반려견코드</th>
                  <td>
                    {workType == "N" ? (
                      <Input
                        name="custcd"
                        type="text"
                        value={initialVal.custcd}
                        className="required"
                        onChange={filterInputChange}
                      />
                    ) : (
                      <Input
                        name="custcd"
                        type="text"
                        value={initialVal.custcd}
                        className="readonly"
                      />
                    )}
                  </td>
                  <th>반려견명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={initialVal.custnm}
                      className="required"
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>반려인</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        type="new"
                        name="owner"
                        value={initialVal.owner}
                        customOptionData={customOptionData}
                        valueField="code"
                        textField="name"
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>그룹</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        type="new"
                        name="species"
                        value={initialVal.species}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>반</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        type="new"
                        name="class"
                        value={initialVal.class}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>성별</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        type="new"
                        name="gender"
                        value={initialVal.gender}
                        customOptionData={customOptionData}
                        valueField="code"
                        textField="name"
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>담당자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        type="new"
                        name="manager"
                        value={initialVal.manager}
                        customOptionData={customOptionData}
                        valueField="code"
                        textField="name"
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>등록일자</th>
                  <td>
                    <DatePicker
                      name="strdt"
                      value={new Date(dateformat(initialVal.strdt))}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      placeholder=""
                    />
                  </td>
                  <th>만기일자</th>
                  <td>
                    <DatePicker
                      name="enddt"
                      value={new Date(dateformat(initialVal.enddt))}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      placeholder=""
                    />
                  </td>
                </tr>
                <tr>
                <th>요일</th>
                  <td>
                    {" 월"}
                    <Checkbox
                      title="월"
                      name="Monday"
                      value={(initialVal.dayofweek & weekDay.Monday) ? true : false}
                      onChange={filterInputChange}
                    />
                    {" 화"}
                    <Checkbox
                      title="화"
                      name="Tuesday"
                      value={(initialVal.dayofweek & weekDay.Tuesday) ? true : false}
                      onChange={filterInputChange}
                    />
                    {" 수"}
                    <Checkbox
                      title="수"
                      name="Wednesday"
                      value={(initialVal.dayofweek & weekDay.Wednesday) ? true : false}
                      onChange={filterInputChange}
                    />
                    {" 목"}
                    <Checkbox
                      title="목"
                      name="Thursday"
                      value={(initialVal.dayofweek & weekDay.Thursday) ? true : false}
                      onChange={filterInputChange}
                    />
                    {" 금"}
                    <Checkbox
                      title="금"
                      name="Friday"
                      value={(initialVal.dayofweek & weekDay.Friday) ? true : false}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>생일</th>
                  <td>
                    <DatePicker
                      width={"calc(100% - 52px)"}
                      name="birdt"
                      value={new Date(dateformat(initialVal.birdt))}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      placeholder=""
                    />
                    {" 음력"}
                    <Checkbox
                      title="음력"
                      //width={"16px"}
                      name="bircd"
                      value={initialVal.bircd == "Y" ? false : true}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>메모</th>
                  <td colSpan={7}>
                    <TextArea
                      value={initialVal.remark}
                      name="remark"
                      rows={2}
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
            확인
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
