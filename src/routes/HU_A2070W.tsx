import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
  GridItemChangeEvent,
} from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
} from "../CommonStyled";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  UseBizComponent,
  UsePermissions,
  handleKeyPressSearch,
  UseParaPc,
  UseGetValueFromSessionItem,
  UseCustomOption,
  getGridItemChangedData,
  dateformat,
  setDefaultDate,
  findMessage,
  UseMessages,
  getQueryFromBizComponent,
} from "../components/CommonFunction";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import {
  SELECTED_FIELD,
  EDIT_FIELD,
  COM_CODE_DEFAULT_VALUE,
} from "../components/CommonString";
import TopButtons from "../components/Buttons/TopButtons";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { gridList } from "../store/columns/HU_A2070W_C";
import DateCell from "../components/Cells/DateCell";
import { Button } from "@progress/kendo-react-buttons";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { bytesToBase64 } from "byte-base64";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
const dateField = ["dutydt"];
const CheckField = ["lateyn"];
const requiredField = ["orgdiv", "dutydt", "prsnnum"];
const customField = ["orgdiv", "prsnnum"];
let deletedMainRows: object[] = [];
let temp = 0;
type TdataArr = {
  rowstatus: string[];
  orgdiv: string[];
  dutydt: string[];
  prsnnum: string[];
  shh: string[];
  smm: string[];
  ehh: string[];
  emm: string[];
  remark: string[];
};

//그리드 내부 글씨 색 정의
const customData = [
  {
    color: "blue",
    fontweight: "bold",
  },
  {
    color: "red",
    fontweight: "bold",
  },
  {
    color: "black",
    fontweight: "bold",
  },
  {
    color: "black",
    fontweight: "normal",
  },
];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA001, L_HU250T", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "orgdiv" ? "L_BA001" : field === "prsnnum" ? "L_HU250T" : "";

  const valueField = field === "prsnnum" ? "prsnnum" : undefined;
  const textField = field === "prsnnum" ? "prsnnm" : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      myProp={customData}
      {...props}
    />
  ) : (
    <td />
  );
};

const HU_A2070W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const pathname: string = window.location.pathname.replace("/", "");
  //커스텀 옵션 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        orgdiv: defaultOption.find((item: any) => item.id === "orgdiv")
          .valueCode,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        rtrchk: defaultOption.find((item: any) => item.id === "rtrchk")
          .valueCode,
        prsnnum: defaultOption.find((item: any) => item.id === "prsnnum")
          .valueCode,
        latechk: defaultOption.find((item: any) => item.id === "latechk")
          .valueCode,
        dptcd: defaultOption.find((item: any) => item.id === "dptcd").valueCode,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001, L_BA002",
    //부서, 사업장
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [dptcdListData, setDptcdListData] = React.useState([
    { dptcd: "", dptnm: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
      );

      fetchQuery(dptcdQueryStr, setDptcdListData);
      fetchQuery(locationQueryStr, setLocationListData);
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

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: 25,
    work_type: "Q",
    orgdiv: "",
    location: "",
    rtrchk: "",
    prsnnum: "",
    frdt: new Date(),
    todt: new Date(),
    latechk: "",
    dptcd: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_HU_A2070W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.work_type,
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_rtrchk": filters.rtrchk,
      "@p_prsnnum": filters.prsnnum,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_latechk": filters.latechk,
      "@p_dptcd": filters.dptcd,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        rowstatus:
          row.rowstatus == "N" ? "N1" : row.rowstatus == "U" ? "U1" : "",
      }));
      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  let gridRef : any = useRef(null); 

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, 25)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, 25, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  // 최초 한번만 실행
  useEffect(() => {
    if (customOptionData != null && filters.isSearch && permissions !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  const search = () => {
      deletedMainRows = [];
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "HU_A2070W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "HU_A2070W_001");
      } else if (
        filters.orgdiv == null ||
        filters.orgdiv == "" ||
        filters.orgdiv == undefined
      ) {
        throw findMessage(messagesData, "HU_A2070W_002");
      } else {
        resetAllGrid();
      }
    } catch (e) {
      alert(e);
    }
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

  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
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

  const enterEdit = (dataItem: any, field: string) => {
    if (
      field == "dutydt" ||
      field == "shh" ||
      field == "smm" ||
      field == "ehh" ||
      field == "emm" ||
      field == "remark" ||
      (field == "orgdiv" &&
        (dataItem.rowstatus == "N1" || dataItem.rowstatus == "N")) ||
      (field == "prsnnum" &&
        (dataItem.rowstatus == "N1" || dataItem.rowstatus == "N"))
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus:
                item.rowstatus === "N1" || item.rowstatus == "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = mainDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const onSaveClick = () => {
    let valid = true;
    let valid2 = true;
    try {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });
      dataItem.map((item) => {
        if (
          item.orgdiv == undefined ||
          item.orgdiv == null ||
          item.orgdiv == ""
        ) {
          valid = false;
        }
        if (
          item.dutydt == undefined ||
          item.dutydt == null ||
          item.dutydt == ""
        ) {
          valid = false;
        }
        if (
          item.prsnnum == undefined ||
          item.prsnnum == null ||
          item.prsnnum == ""
        ) {
          valid = false;
        }
        if (!isNaN(item.shh) == false || item.shh.length != 2) {
          valid2 = false;
        } else {
          if (item.shh > 24 || item.shh < 0) {
            valid2 = false;
          }
        }
        if (!isNaN(item.smm) == false || item.smm.length != 2) {
          valid2 = false;
        } else {
          if (item.smm > 60 || item.smm < 0) {
            valid2 = false;
          }
        }
        if (!isNaN(item.ehh) == false || item.ehh.length != 2) {
          valid2 = false;
        } else {
          if (item.ehh > 24 || item.ehh < 0) {
            valid2 = false;
          }
        }
        if (!isNaN(item.emm) == false || item.emm.length != 2) {
          valid2 = false;
        } else {
          if (item.emm > 60 || item.emm < 0) {
            valid2 = false;
          }
        }
      });
      let dataArr: TdataArr = {
        rowstatus: [],
        orgdiv: [],
        dutydt: [],
        prsnnum: [],
        shh: [],
        smm: [],
        ehh: [],
        emm: [],
        remark: [],
      };
      if (valid2 == true) {
        if (valid == true) {
          if (dataItem.length === 0 && deletedMainRows.length == 0)
            return false;
          dataItem.forEach((item: any, idx: number) => {
            const {
              rowstatus = "",
              orgdiv = "",
              dutydt = "",
              prsnnum = "",
              shh = "",
              smm = "",
              ehh = "",
              emm = "",
              remark = "",
            } = item;
            dataArr.rowstatus.push(rowstatus);
            dataArr.orgdiv.push(orgdiv);
            dataArr.dutydt.push(dutydt);
            dataArr.prsnnum.push(prsnnum);
            dataArr.shh.push(shh);
            dataArr.smm.push(smm);
            dataArr.ehh.push(ehh);
            dataArr.emm.push(emm);
            dataArr.remark.push(remark);
          });
          deletedMainRows.forEach((item: any, idx: number) => {
            const {
              rowstatus = "",
              orgdiv = "",
              dutydt = "",
              prsnnum = "",
              shh = "",
              smm = "",
              ehh = "",
              emm = "",
              remark = "",
            } = item;
            dataArr.rowstatus.push(rowstatus);
            dataArr.orgdiv.push(orgdiv);
            dataArr.dutydt.push(dutydt);
            dataArr.prsnnum.push(prsnnum);
            dataArr.shh.push(shh);
            dataArr.smm.push(smm);
            dataArr.ehh.push(ehh);
            dataArr.emm.push(emm);
            dataArr.remark.push(remark);
          });
          setParaData((prev) => ({
            ...prev,
            rowstatus: dataArr.rowstatus.join("|"),
            orgdiv: dataArr.orgdiv.join("|"),
            dutydt: dataArr.dutydt.join("|"),
            prsnnum: dataArr.prsnnum.join("|"),
            shh: dataArr.shh.join("|"),
            smm: dataArr.smm.join("|"),
            ehh: dataArr.ehh.join("|"),
            emm: dataArr.emm.join("|"),
            remark: dataArr.remark.join("|"),
          }));
        } else {
          alert("필수항목을 채워주세요.");
        }
      } else {
        alert("시간 형식을 맞춰주세요.(ex. 1404 )");
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: 25,
    workType: "S",
    userid: userId,
    orgdiv: "",
    dutydt: "",
    prsnnum: "",
    shh: "",
    smm: "",
    ehh: "",
    emm: "",
    rowstatus: "",
    remark: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A2070W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_dutydt": ParaData.dutydt,
      "@p_prsnnum": ParaData.prsnnum,
      "@p_shh": ParaData.shh,
      "@p_smm": ParaData.smm,
      "@p_ehh": ParaData.ehh,
      "@p_emm": ParaData.emm,
      "@p_userid": userId,
      "@p_remark": ParaData.remark,
      "@p_row_status": ParaData.rowstatus,
      "@p_pc": pc,
      "@p_form_id": "HU_A2070W",
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setParaData({
        pgSize: 25,
        workType: "S",
        userid: userId,
        orgdiv: "",
        dutydt: "",
        prsnnum: "",
        shh: "",
        smm: "",
        ehh: "",
        emm: "",
        rowstatus: "",
        remark: "",
      });
      deletedMainRows = [];
      resetAllGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let valid = true;
    let valid2 = true;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        if (item.dutydt != "19991231") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          if (
            newData2.orgdiv == undefined ||
            newData2.orgdiv == null ||
            newData2.orgdiv == ""
          ) {
            valid = false;
          }
          if (
            newData2.dutydt == undefined ||
            newData2.dutydt == null ||
            newData2.dutydt == ""
          ) {
            valid = false;
          }
          if (
            newData2.prsnnum == undefined ||
            newData2.prsnnum == null ||
            newData2.prsnnum == ""
          ) {
            valid = false;
          }
          if (!isNaN(newData2.shh) == false || newData2.ssh.length != 2) {
            valid2 = false;
          } else {
            if (newData2.shh > 24 || newData2.shh < 0) {
              valid2 = false;
            }
          }
          if (!isNaN(newData2.smm) == false || newData2.smm.length != 2) {
            valid2 = false;
          } else {
            if (newData2.smm > 60 || newData2.smm < 0) {
              valid2 = false;
            }
          }
          if (!isNaN(newData2.ehh) == false || newData2.ehh.length != 2) {
            valid2 = false;
          } else {
            if (newData2.ehh > 24 || newData2.ehh < 0) {
              valid2 = false;
            }
          }
          if (!isNaN(newData2.emm) == false || newData2.emm.length != 2) {
            valid2 = false;
          } else {
            if (newData2.emm > 60 || newData2.emm < 0) {
              valid2 = false;
            }
          }
          if (valid == true && valid2 == true) {
            deletedMainRows.push(newData2);
          }
        } else {
          const newData = {
            ...item,
            rowstatus: "N",
          };
          if (
            newData.orgdiv == undefined ||
            newData.orgdiv == null ||
            newData.orgdiv == ""
          ) {
            valid = false;
          }
          if (
            newData.dutydt == undefined ||
            newData.dutydt == null ||
            newData.dutydt == ""
          ) {
            valid = false;
          }
          if (
            newData.prsnnum == undefined ||
            newData.prsnnum == null ||
            newData.prsnnum == ""
          ) {
            valid = false;
          }
          if (!isNaN(newData.shh) == false || newData.shh.length != 2) {
            valid2 = false;
          } else {
            if (newData.shh > 24 || newData.shh < 0) {
              valid2 = false;
            }
          }
          if (!isNaN(newData.smm) == false || newData.smm.length != 2) {
            valid2 = false;
          } else {
            if (newData.smm > 60 || newData.smm < 0) {
              valid2 = false;
            }
          }
          if (!isNaN(newData.ehh) == false || newData.ehh.length != 2) {
            valid2 = false;
          } else {
            if (newData.ehh > 24 || newData.ehh < 0) {
              valid2 = false;
            }
          }
          if (!isNaN(newData.emm) == false || newData.emm.length != 2) {
            valid2 = false;
          } else {
            if (newData.emm > 60 || newData.emm < 0) {
              valid2 = false;
            }
          }
          if (valid == true && valid2 == true) {
            deletedMainRows.push(newData);
          }
        }
      }
    });

    if (valid2 == true) {
      if (valid == true) {
        setMainDataResult((prev) => ({
          data: newData,
          total: newData.length,
        }));
        setMainDataState({});
      } else {
        alert("필수항목의 형식을 맞춰주세요.");
      }
    } else {
      alert("시간 형식을 맞춰주세요.(ex. 1404 )");
    }
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if(item.num > temp){
        temp = item.num
      }
  })
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      b_time: "",
      dayofweek: 0,
      dptcd: "",
      dutydt: convertDateToStr(new Date()),
      ehh: 0,
      emm: 0,
      lateyn: "",
      location: "",
      orgdiv: "",
      prsnnum: "",
      remark: "",
      s_time: "",
      shh: 0,
      smm: 0,
      workcls: "",
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  return (
    <>
      <TitleContainer>
        <Title>출퇴근관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>회사구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="orgdiv"
                    value={filters.orgdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>재직여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="rtrchk"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>사용자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="prsnnum"
                    value={filters.prsnnum}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="prsnnm"
                    valueField="prsnnum"
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>기준일자</th>
              <td>
                  <CommonDateRangePicker
                    value={{
                      start: filters.frdt,
                      end: filters.todt,
                    }}
                    onChange={(e: { value: { start: any; end: any } }) =>
                      setFilters((prev) => ({
                        ...prev,
                        frdt: e.value.start,
                        todt: e.value.end,
                      }))
                    }
                    className="required"
                  />
                </td>
              <th>지각</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="latechk"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>부서</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      <GridContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <GridTitleContainer>
            <GridTitle>
              출퇴근 조회(8시반 출근자: 검은색/ 9시 출근자: 파란색 / 주말:
              빨간색)
            </GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick}
                fillMode="outline"
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
                onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
                title="저장"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "75vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                rowstatus:
                  row.rowstatus == "" ||
                  row.rowstatus == "N1" ||
                  row.rowstatus == "U1"
                    ? ""
                    : row.rowstatus,
                dptcd: dptcdListData.find(
                  (item: any) => item.dptcd === row.dptcd
                )?.dptnm,
                location: locationListData.find(
                  (item: any) => item.sub_code === row.location
                )?.code_name,
                dutydt: row.dutydt
                  ? new Date(dateformat(row.dutydt))
                  : new Date(dateformat("19991231")),
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
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
            onSelectionChange={onMainSelectionChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={mainDataResult.total}
            onScroll={onMainScrollHandler}
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
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        customField.includes(item.fieldName)
                          ? CustomComboBoxCell
                          : dateField.includes(item.fieldName)
                          ? DateCell
                          : CheckField.includes(item.fieldName)
                          ? CheckBoxReadOnlyCell
                          : undefined
                      }
                      headerCell={
                        requiredField.includes(item.fieldName)
                          ? RequiredHeader
                          : undefined
                      }
                      footerCell={
                        item.sortOrder === 2 ? mainTotalFooterCell : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {gridList.map((grid: TGrid) =>
        grid.columns.map((column: TColumn) => (
          <div
            key={column.id}
            id={column.id}
            data-grid-name={grid.gridName}
            data-field={column.field}
            data-caption={column.caption}
            data-width={column.width}
            hidden
          />
        ))
      )}
    </>
  );
};

export default HU_A2070W;
