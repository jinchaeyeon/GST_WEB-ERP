import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../../hooks/interfaces";
import {
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedNameState,
} from "../../../store/atoms";
import { Iparameters } from "../../../store/types";
import CheckBoxCell from "../../Cells/CheckBoxCell";
import ComboBoxCell from "../../Cells/ComboBoxCell";
import NumberCell from "../../Cells/NumberCell";
import CustomOptionComboBox from "../../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  convertDateToStr,
  convertDateToStrWithTime2,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch
} from "../../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../../CommonString";
import FilterContainer from "../../Containers/FilterContainer";
import RequiredHeader from "../../HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../../Renderers/Renderers";

type TdataArr = {
  postcd: string[];
  resno: string[];
  appgb: string[];
  appseq: string[];
  arbitragb: string[];
  aftergb: string[];
  appline: string[];
};

type IKendoWindow = {
  setVisible(t: boolean): void;
  setData(data: string): void;
  pgmgb: string;
  pathname: string;
  para?: any;
  modal?: boolean;
};
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "saved_name";
let temp = 0;
let temp2 = 0;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_sysUserMaster_001, L_EA004", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "resno"
      ? "L_sysUserMaster_001"
      : field == "appline"
      ? "L_EA004"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  const textField = field == "resno" ? "user_name" : "code_name";
  const valueField = field == "resno" ? "user_id" : "sub_code";

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      page="Approval"
      {...props}
    />
  ) : (
    <td />
  );
};

const KendoWindow = ({
  setVisible,
  setData,
  pgmgb,
  para,
  pathname,
  modal = false,
}: IKendoWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 900,
  });

  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
const pc = UseGetValueFromSessionItem("pc");

  const setLoading = useSetRecoilState(isLoading);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001, L_EA001, L_HU005",
    //업체구분, 사용여부,
    setBizComponentData
  );
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [appgbListData, setappgbListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_HU005")
      );
      const appgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_EA001")
      );
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_001"
        )
      );
      fetchQuery(userQueryStr, setUserListData);
      fetchQuery(postcdQueryStr, setpostcdListData);
      fetchQuery(appgbQueryStr, setappgbListData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr: string, setListData: any) => {
    let data: any;

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        pgmgb: pgmgb,
      }));
    }
  }, [customOptionData]);

  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
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
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    setVisible(false);
  };

  const processApi = useApi();
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], {})
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgmgb: "",
    person: para.prsnnum,
    ref_key: para.expenseno,
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  //조회조건 초기값
  const [information, setInformation] = useState({
    recdt: new Date(),
    appnm:
      pgmgb == "Z"
        ? "지출결의서 결재요청(" + para.expenseno + ")"
        : pgmgb == "W"
        ? "근태허가신청 결재요청(" + para.expenseno + ")"
        : pgmgb == "P"
        ? "지출결의서(복지포인트) 결재요청(" + para.expenseno + ")"
        : "",
  });

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (filters.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  //요약정보 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);
    //팝업 조회 파라미터
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_EA_P1000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_pgmgb": filters.pgmgb,
        "@p_person": filters.person,
        "@p_ref_key": filters.ref_key,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (
      data &&
      data.tables &&
      data.tables[0] &&
      data.tables[0].TotalRowCount !== undefined
    ) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow = rows[0];
        setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
      }

      const totalRowCnt2 = data.tables[1].TotalRowCount;
      const rows2 = data.tables[1].Rows;

      setMainDataResult2((prev) => {
        return {
          data: rows2,
          total: totalRowCnt2 == -1 ? 0 : totalRowCnt2,
        };
      });
      if (totalRowCnt2 > 0) {
        const selectedRow = rows2[0];
        setSelectedState2({ [selectedRow[DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onConfirmClick = (props: any) => {
    let valid = true;

    mainDataResult.data.map((item) => {
      if (
        item.appseq == "" ||
        item.appseq == null ||
        item.appseq == undefined ||
        item.appline == ""
      ) {
        valid = false;
      }
    });

    if (valid != true) {
      alert("필수값을 채워주세요.");
      return false;
    }

    let dataArr: TdataArr = {
      postcd: [],
      resno: [],
      appgb: [],
      appseq: [],
      arbitragb: [],
      aftergb: [],
      appline: [],
    };

    mainDataResult.data.forEach((item: any, idx: number) => {
      const {
        postcd = "",
        resno = "",
        appgb = "",
        appseq = "",
        arbitragb = "",
        aftergb = "",
        appline = "",
      } = item;
      dataArr.postcd.push(postcd == undefined ? "" : postcd);
      dataArr.resno.push(resno == undefined ? "" : resno);
      dataArr.appgb.push(appgb == undefined ? "" : appgb);
      dataArr.appseq.push(appseq == undefined ? 0 : appseq);
      dataArr.arbitragb.push(
        arbitragb == undefined
          ? "N"
          : arbitragb == true
          ? "Y"
          : arbitragb == false
          ? "N"
          : arbitragb
      );
      dataArr.aftergb.push("");
      dataArr.appline.push(appline == undefined ? "" : appline);
    });

    mainDataResult2.data.forEach((item: any, idx: number) => {
      const {
        postcd = "",
        resno = "",
        appgb = "",
        appseq = "",
        arbitragb = "",
        aftergb = "",
        appline = "",
      } = item;
      dataArr.postcd.push(postcd == undefined ? "" : postcd);
      dataArr.resno.push(resno == undefined ? "" : resno);
      dataArr.appgb.push(appgb == undefined ? "" : appgb);
      dataArr.appseq.push(appseq == undefined ? 0 : appseq);
      dataArr.arbitragb.push(
        arbitragb == undefined
          ? "N"
          : arbitragb == true
          ? "Y"
          : arbitragb == false
          ? "N"
          : arbitragb
      );
      dataArr.aftergb.push("");
      dataArr.appline.push(appline == undefined ? "" : appline);
    });

    setParaData({
      work_type: "N",
      orgdiv: sessionOrgdiv,
      location: sessionLocation,
      person: filters.person,
      pgmgb: filters.pgmgb,
      appnm: information.appnm,
      recdt: convertDateToStr(information.recdt),
      ref_key: filters.ref_key,
      postcd: dataArr.postcd.join("|"),
      resno: dataArr.resno.join("|"),
      appgb: dataArr.appgb.join("|"),
      appseq: dataArr.appseq.join("|"),
      arbitragb: dataArr.arbitragb.join("|"),
      aftergb: dataArr.aftergb.join("|"),
      appline: dataArr.appline.join("|"),
      attdatnum: attachmentNumber,
    });
  };

  const [ParaData, setParaData] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    person: "",
    pgmgb: "",
    appnm: "",
    recdt: "",
    ref_key: "",
    postcd: "",
    resno: "",
    appgb: "",
    appseq: "",
    arbitragb: "",
    aftergb: "",
    appline: "",
    attdatnum: "",
  });

  const paraSaved: Iparameters = {
    procedureName: "P_EA_P1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.work_type,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_person": ParaData.person,
      "@p_pgmgb": ParaData.pgmgb,
      "@p_appnm": ParaData.appnm,
      "@p_recdt": ParaData.recdt,
      "@p_ref_key": ParaData.ref_key,
      "@p_postcd": ParaData.postcd,
      "@p_resno": ParaData.resno,
      "@p_appgb": ParaData.appgb,
      "@p_appseq": ParaData.appseq,
      "@p_arbitragb": ParaData.arbitragb,
      "@p_aftergb": ParaData.aftergb,
      "@p_appline": ParaData.appline,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": pathname,
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setUnsavedName([]);
      setValues2(false);
      deletedMainRows = [];
      deletedMainRows2 = [];

      setData(data.returnString);
      setVisible(false);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.work_type != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  //메인 그리드 선택 이벤트
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };
  //메인 그리드 선택 이벤트
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState3(newSelectedState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  //그리드 푸터
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  type TDataInfo = {
    DATA_ITEM_KEY: string;
    selectedState: {
      [id: string]: boolean | number[];
    };
    dataResult: DataResult;
    setDataResult: (p: any) => any;
  };

  type TArrowBtnClick = {
    direction: string;
    dataInfo: TDataInfo;
  };

  const onArrowsBtnClick = (para: TArrowBtnClick) => {
    const { direction, dataInfo } = para;
    const { DATA_ITEM_KEY, selectedState, dataResult, setDataResult } =
      dataInfo;
    const selectedField = Object.getOwnPropertyNames(selectedState)[0];

    const rowData = dataResult.data.find(
      (row) => row[DATA_ITEM_KEY] == selectedField
    );

    const rowIndex = dataResult.data.findIndex(
      (row) => row[DATA_ITEM_KEY] == selectedField
    );

    if (rowIndex == -1) {
      alert("이동시킬 행을 선택해주세요.");
      return false;
    }

    if (!(rowIndex == 0 && direction == "UP")) {
      const newData = dataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      let replaceData = 0;
      if (direction == "UP" && rowIndex != 0) {
        replaceData = dataResult.data[rowIndex - 1].appseq;
      } else {
        replaceData = dataResult.data[rowIndex + 1].appseq;
      }

      newData.splice(rowIndex, 1);
      newData.splice(rowIndex + (direction == "UP" ? -1 : 1), 0, rowData);
      if (direction == "UP" && rowIndex != 0) {
        const newDatas = newData.map((item) =>
          item[DATA_ITEM_KEY] == rowData[DATA_ITEM_KEY]
            ? {
                ...item,
                appseq: replaceData,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : item[DATA_ITEM_KEY] == dataResult.data[rowIndex - 1].num
            ? {
                ...item,
                appseq: rowData.appseq,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setDataResult((prev: any) => {
          return {
            data: newDatas,
            total: prev.total,
          };
        });
      } else {
        const newDatas = newData.map((item) =>
          item[DATA_ITEM_KEY] == rowData[DATA_ITEM_KEY]
            ? {
                ...item,
                appseq: replaceData,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : item[DATA_ITEM_KEY] == dataResult.data[rowIndex + 1].num
            ? {
                ...item,
                appseq: rowData.appseq,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setDataResult((prev: any) => {
          return {
            data: newDatas,
            total: prev.total,
          };
        });
      }
    }
  };

  const arrowBtnClickPara = {
    DATA_ITEM_KEY: DATA_ITEM_KEY,
    selectedState: selectedState,
    dataResult: mainDataResult,
    setDataResult: setMainDataResult,
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };
  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
    );
  };
  const onMainItemChange3 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
    );
  };
  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender3 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );
  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "postcd" && field != "appgb") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "postcd") {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit3 = (dataItem: any, field: string) => {
    if (field == "chk") {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == dataItem[DATA_ITEM_KEY3]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              chk:
                typeof item.chk == "boolean"
                  ? item.chk
                  : item.chk == "Y"
                  ? true
                  : false,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              [EDIT_FIELD]: undefined,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };
  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              [EDIT_FIELD]: undefined,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit3 = () => {
    const newData = mainDataResult3.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult3((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult3.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const onDeleteClick = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onDeleteClick2 = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

    mainDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedState2[item[DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows2.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object) - 1];
    }

    setMainDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState2({
      [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    let seq = 1;
    mainDataResult.data.map((item) => {
      if (item.appseq > seq) {
        seq = item.appseq;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      aftergb: "",
      appgb: "S",
      appline: "",
      appseq: ++seq,
      arbitragb: "N",
      orgdiv: sessionOrgdiv,
      pgmgb: pgmgb,
      postcd: "",
      recdt: convertDateToStr(new Date()),
      resno: "",
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick2 = () => {
    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    let seq = 1;
    mainDataResult2.data.map((item) => {
      if (item.appseq > seq) {
        seq = item.appseq;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY2]: ++temp2,
      aftergb: "",
      appgb: "T",
      appline: "",
      appseq: ++seq,
      arbitragb: "N",
      orgdiv: sessionOrgdiv,
      pgmgb: pgmgb,
      postcd: "",
      recdt: convertDateToStr(new Date()),
      resno: "",
      rowstatus: "N",
    };

    setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    setMainDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const [attachmentNumber, setAttachmentNumber] = useState<string>("");

  useEffect(() => {
    fetchAttdatnumGrid();
  }, [attachmentNumber]);

  const deleteFiles = () => {
    const datas = mainDataResult3.data.filter((item) => item.chk == true);

    if (datas.length == 0) {
      alert("선택된 행이 없습니다.");
      return false;
    }

    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }
    let data: any;

    datas.forEach(async (parameter) => {
      try {
        data = await processApi<any>("file-delete", {
          attached: parameter.saved_name,
        });
      } catch (error) {
        data = null;
      }
      fetchAttdatnumGrid();
    });
  };

  const excelsInput: any = React.useRef();

  const downloadFiles = async () => {
    // value 가 false인 속성 삭제
    const datas = mainDataResult3.data.filter((item) => item.chk == true);
    if (datas.length == 0) {
      alert("선택된 행이 없습니다.");
      return false;
    }

    // const parameter = parameters[0];
    let response: any;

    datas.forEach(async (parameter) => {
      try {
        response = await processApi<any>("file-download", {
          attached: parameter.saved_name,
        });
      } catch (error) {
        response = null;
      }

      if (response !== null) {
        const blob = new Blob([response.data]);
        // 특정 타입을 정의해야 경우에는 옵션을 사용해 MIME 유형을 정의 할 수 있습니다.
        // const blob = new Blob([this.content], {type: 'text/plain'})

        // blob을 사용해 객체 URL을 생성합니다.
        const fileObjectUrl = window.URL.createObjectURL(blob);

        // blob 객체 URL을 설정할 링크를 만듭니다.
        const link = document.createElement("a");
        link.href = fileObjectUrl;
        link.style.display = "none";

        // 다운로드 파일 이름을 추출하는 함수
        const extractDownloadFilename = (response: any) => {
          if (response.headers) {
            const disposition = response.headers["content-disposition"];
            let filename = "";
            if (disposition) {
              var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
              var matches = filenameRegex.exec(disposition);
              if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, "");
              }
            }
            return filename;
          } else {
            return "";
          }
        };

        // 다운로드 파일 이름을 지정 할 수 있습니다.
        // 일반적으로 서버에서 전달해준 파일 이름은 응답 Header의 Content-Disposition에 설정됩니다.
        link.download = extractDownloadFilename(response);

        // 다운로드 파일의 이름은 직접 지정 할 수 있습니다.
        // link.download = "sample-file.xlsx";

        // 링크를 body에 추가하고 강제로 click 이벤트를 발생시켜 파일 다운로드를 실행시킵니다.
        document.body.appendChild(link);
        link.click();
        link.remove();

        // 다운로드가 끝난 리소스(객체 URL)를 해제합니다
      }
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (files == null) return false;
    setLoading(true);

    let newAttachmentNumber = "";
    const promises = [];

    for (const file of files) {
      // 최초 등록 시, 업로드 후 첨부번호를 가져옴 (다중 업로드 대응)
      if (!attachmentNumber && !newAttachmentNumber) {
        newAttachmentNumber = await uploadFile(file);
        const promise = newAttachmentNumber;
        promises.push(promise);
        continue;
      }

      const promise = newAttachmentNumber
        ? await uploadFile(file, newAttachmentNumber)
        : await uploadFile(file);
      promises.push(promise);
    }

    const results = await Promise.all(promises);

    // 실패한 파일이 있는지 확인
    if (results.includes(null)) {
      alert("파일 업로드에 실패했습니다.");
    } else {
      // 모든 파일이 성공적으로 업로드된 경우
      if (!attachmentNumber) {
        setAttachmentNumber(newAttachmentNumber);
      } else {
        fetchAttdatnumGrid();
      }
    }
    setLoading(false);
  };

  const uploadFile = async (files: File, newAttachmentNumber?: string) => {
    let data: any;

    const filePara = {
      attached: attachmentNumber
        ? "attached?attachmentNumber=" + attachmentNumber
        : newAttachmentNumber
        ? "attached?attachmentNumber=" + newAttachmentNumber
        : "attached",
      files: files, //.FileList,
    };

    try {
      data = await processApi<any>("file-upload", filePara);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      data.result.map((item: any) => {
        setUnsavedName((prev) => [...prev, item.savedFileName]);
      });
      return data.attachmentNumber;
    } else {
      return data;
    }
  };

  const upload = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput!.click();
  };

  //그리드 조회
  const fetchAttdatnumGrid = async () => {
    let data: any;
    if (attachmentNumber == "") return false;
    const parameters = {
      attached: "list?attachmentNumber=" + attachmentNumber,
    };

    try {
      data = await processApi<any>("file-list", parameters);
    } catch (error) {
      data = null;
    }

    let result: IAttachmentData = {
      attdatnum: "",
      original_name: "",
      rowCount: 0,
    };

    if (data !== null) {
      const totalRowCnt = data.tables[0].RowCount;

      if (totalRowCnt > 0) {
        const rows = data.tables[0].Rows;

        setMainDataResult3((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });

        result = {
          attdatnum: rows[0].attdatnum,
          original_name: rows[0].original_name,
          rowCount: totalRowCnt,
        };

        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
      } else {
        setMainDataResult3((prev) => {
          return {
            data: [],
            total: 0,
          };
        });

        result = {
          attdatnum: attachmentNumber,
          original_name: "",
          rowCount: 0,
        };
      }
    }
  };

  return (
    <Window
      title={"계정코드"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <TitleContainer>
        <Title />
        <ButtonContainer>
          <Button onClick={() => search()} icon="search" themeColor={"primary"}>
            조회
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>결재번호</th>
              <td>
                <Input type="text" value="자동부여" className="readonly" />
              </td>
              <th>작성일자</th>
              <td>
                <DatePicker
                  name="recdt"
                  value={information.recdt}
                  format="yyyy-MM-dd"
                  className="required"
                  onChange={InputChange}
                  placeholder=""
                />
              </td>
              <th>종류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="pgmgb"
                    value={filters.pgmgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    disabled={true}
                    className="readonly"
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>결재제목</th>
              <td colSpan={5}>
                <Input
                  name="appnm"
                  type="text"
                  value={information.appnm}
                  onChange={InputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainerWrap>
        <GridContainer width="50%" height={position.height / 2 - 100 + "px"}>
          <GridTitleContainer>
            <GridTitle>결재/합의 정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="plus"
                title="행 추가"
              ></Button>
              <Button
                onClick={onDeleteClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="minus"
                title="행 삭제"
              ></Button>
              <Button
                onClick={() =>
                  onArrowsBtnClick({
                    direction: "UP",
                    dataInfo: arrowBtnClickPara,
                  })
                }
                fillMode="outline"
                themeColor={"primary"}
                icon="chevron-up"
                title="행 위로 이동"
              ></Button>
              <Button
                onClick={() =>
                  onArrowsBtnClick({
                    direction: "DOWN",
                    dataInfo: arrowBtnClickPara,
                  })
                }
                fillMode="outline"
                themeColor={"primary"}
                icon="chevron-down"
                title="행 아래로 이동"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                postcd: postcdListData.find(
                  (item: any) => item.sub_code == row.postcd
                )?.code_name,
                appgb: appgbListData.find(
                  (item: any) => item.sub_code == row.appgb
                )?.code_name,
                [SELECTED_FIELD]: selectedState[idGetter(row)],
              })),
              mainDataState
            )}
            {...mainDataState}
            onDataStateChange={onMainDataStateChange}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            style={{ height: `calc(100% - 35px)` }}
            onSelectionChange={onSelectionChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={mainDataResult.total}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn field="rowstatus" title=" " width="50px" />
            <GridColumn
              field="resno"
              title="결재자"
              width="120px"
              footerCell={mainTotalFooterCell}
              cell={CustomComboBoxCell}
            />
            <GridColumn field="postcd" title="직위" width="120px" />
            <GridColumn field="appgb" title="결재구분" width="120px" />
            <GridColumn
              field="appseq"
              title="결재순서"
              width="100px"
              cell={NumberCell}
              headerCell={RequiredHeader}
            />
            <GridColumn
              field="appline"
              title="결재라인"
              width="120px"
              headerCell={RequiredHeader}
              cell={CustomComboBoxCell}
            />
            <GridColumn
              field="arbitragb"
              title="전결유무"
              width="80px"
              cell={CheckBoxCell}
            />
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(50% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>참조자 정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick2}
                themeColor={"primary"}
                icon="plus"
                title="행 추가"
              ></Button>
              <Button
                onClick={onDeleteClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="minus"
                title="행 삭제"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            data={process(
              mainDataResult2.data.map((row) => ({
                ...row,
                postcd: postcdListData.find(
                  (item: any) => item.sub_code == row.postcd
                )?.code_name,
                [SELECTED_FIELD]: selectedState2[idGetter2(row)],
              })),
              mainDataState2
            )}
            {...mainDataState2}
            onDataStateChange={onMainDataStateChange2}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY2}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            style={{ height: `calc(100% - 35px)` }}
            onSelectionChange={onSelectionChange2}
            //스크롤 조회 기능
            fixedScroll={true}
            total={mainDataResult2.total}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange2}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onItemChange={onMainItemChange2}
            cellRender={customCellRender2}
            rowRender={customRowRender2}
            editField={EDIT_FIELD}
          >
            <GridColumn field="rowstatus" title=" " width="50px" />
            <GridColumn
              field="resno"
              title="결재자"
              width="120px"
              footerCell={mainTotalFooterCell2}
              cell={CustomComboBoxCell}
            />
            <GridColumn field="postcd" title="직위" width="120px" />
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      <GridContainer>
        <GridTitleContainer>
          <ButtonContainer>
            <Button onClick={upload} themeColor={"primary"} icon={"upload"}>
              업로드
              <input
                id="uploadAttachment"
                style={{ display: "none" }}
                type="file"
                multiple
                ref={excelsInput}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  handleFileUpload(event.target.files);
                }}
              />
            </Button>
            <Button
              onClick={downloadFiles}
              themeColor={"primary"}
              fillMode={"outline"}
              icon={"download"}
            >
              다운로드
            </Button>
            <Button
              onClick={deleteFiles}
              themeColor={"primary"}
              fillMode={"outline"}
              icon={"delete"}
            >
              삭제
            </Button>
          </ButtonContainer>
        </GridTitleContainer>
        <Grid
          style={{ height: position.height / 2 - 250 + "px" }}
          data={process(
            mainDataResult3.data.map((row) => ({
              ...row,
              person: userListData.find(
                (item: any) => item.user_id == row.person
              )?.user_name,
              insert_time: convertDateToStrWithTime2(new Date(row.insert_time)),
              [SELECTED_FIELD]: selectedState3[idGetter3(row)],
            })),
            {}
          )}
          sortable={true}
          groupable={false}
          reorderable={true}
          fixedScroll={true}
          total={mainDataResult3.total}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            drag: false,
            cell: false,
            mode: "single",
          }}
          onSelectionChange={onSelectionChange3}
          onItemChange={onMainItemChange3}
          cellRender={customCellRender3}
          rowRender={customRowRender3}
          editField={EDIT_FIELD}
        >
          <GridColumn
            field="chk"
            title=" "
            width="45px"
            headerCell={CustomCheckBoxCell2}
            cell={CheckBoxCell}
          />
          <GridColumn field="original_name" title="파일이름" width="400px" />
          <GridColumn field="file_size" title="파일SIZE" width="150px" />
          <GridColumn field="user_name" title="등록자명" width="150px" />
          <GridColumn field="insert_time" title="입력시간" width="200px" />
        </Grid>
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={onConfirmClick}>
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
