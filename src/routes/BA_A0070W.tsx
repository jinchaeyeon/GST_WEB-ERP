import React, { useCallback, useEffect, useState } from "react";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridCellProps,
} from "@progress/kendo-react-grid";
import { gridList } from "../store/columns/BA_A0070W_C";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { bytesToBase64 } from "byte-base64";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  GridContainerWrap,
} from "../CommonStyled";
import FilterContainer from "../components/Containers/FilterContainer";
import { Button } from "@progress/kendo-react-buttons";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  getGridItemChangedData,
  dateformat,
  UseParaPc,
  UseGetValueFromSessionItem,
  setDefaultDate,
  toDate,
  useSysMessage,
} from "../components/CommonFunction";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
  GAP,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";

const DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];

const DateField = ["basedt"];
const NumberField = ["wonchgrat", "uschgrat", "baseamt"];
const CustomComboField = ["amtunit"];
const requiredField = ["basedt", "amtunit"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 화폐단위
  UseBizComponent("L_BA020", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field === "amtunit" ? "L_BA020" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td></td>
  );
};

const BA_A0070W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);

  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);

  UsePermissions(setPermissions);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        site: defaultOption.find((item: any) => item.id === "site").valueCode,
        amtunit: defaultOption.find((item: any) => item.id === "amtunit")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_SA010",
    //환율사이트
    setBizComponentData
  );
  const [siteListData, setSiteListData] = useState([
    { sub_code: "", memo: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const siteQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_SA010")
      );

      fetchQuery(siteQueryStr, setSiteListData);
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [isInitSearch, setIsInitSearch] = useState(false);

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [mainPgNum, setMainPgNum] = useState(1);

  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  const [ifSelectFirstRow2, setIfSelectFirstRow2] = useState(true);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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
    pgSize: PAGE_SIZE,
    workType: "BASEDT",
    frdt: new Date(),
    todt: new Date(),
    amtunit: "",
    wonchgrat: "",
    uschgrat: "",
    baseamt: "",
    site: "",
  });

  //조회조건 초기값
  const [mainfilters, setMainFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    frdt: new Date(),
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_BA_A0070W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_amtunit": filters.amtunit,
      "@p_wonchgrat": filters.wonchgrat,
      "@p_uschgrat": filters.uschgrat,
      "@p_baseamt": filters.baseamt,
    },
  };

  //조회조건 파라미터
  const parameters2: Iparameters = {
    procedureName: "P_BA_A0070W_Q",
    pageNumber: mainPgNum,
    pageSize: mainfilters.pgSize,
    parameters: {
      "@p_work_type": mainfilters.workType,
      "@p_frdt": convertDateToStr(mainfilters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_amtunit": filters.amtunit,
      "@p_wonchgrat": filters.wonchgrat,
      "@p_uschgrat": filters.uschgrat,
      "@p_baseamt": filters.baseamt,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      if (totalRowCnt >= 0) {
        setSubDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });
      }

      setIfSelectFirstRow2(true);
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid2 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      if (totalRowCnt >= 0) {
        setMainDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });
      }

      setIfSelectFirstRow(true);
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData !== null &&
      isInitSearch === false &&
      permissions !== null
    ) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchMainGrid();
    }
  }, [filters]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchMainGrid2();
    }
  }, [mainfilters]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];

        if (firstRowData != null) {
          setSelectedState({ [firstRowData.num]: true });
        } else {
          setSelectedState({});
        }

        setIfSelectFirstRow(false);
      }
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (ifSelectFirstRow2) {
      if (subDataResult.total > 0) {
        const firstRowData = subDataResult.data[0];

        if (firstRowData != null) {
          setSelectedsubDataState({ [firstRowData.num]: true });
          setMainFilters((prev) => ({
            ...prev,
            workType: "Q",
            frdt: toDate(firstRowData.basedt),
          }));
        } else {
          setSelectedsubDataState({});
        }
        setIfSelectFirstRow2(false);
      }
    }
  }, [subDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setMainFilters((prev) => ({
      ...prev,
      workType: "Q",
      frdt: toDate(selectedRowData.basedt),
    }));
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
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
      setMainPgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "BA_A0070W_002");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "BA_A0070W_002");
      } else {
        resetAllGrid();
        fetchMainGrid();
        deletedMainRows = [];
      }
    } catch (e) {
      alert(e);
    }
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      if (
        !((dataItem.rowstatus != "N" && field == "basedt") ||
        (dataItem.rowstatus != "N" && field == "amtunit")
      )) {
        const newData = mainDataResult.data.map((item) =>
          item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
            ? {
                ...item,
                rowstatus: item.rowstatus === "N" ? "N" : "U",
                [EDIT_FIELD]: field,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setIfSelectFirstRow(false);
        setMainDataResult((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      }
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const onAddClick = () => {
    let seq = mainDataResult.total + deletedMainRows.length + 1;

    const newDataItem = {
      [DATA_ITEM_KEY]: seq,
      amtunit: filters.amtunit,
      amtyn: 0,
      baseamt: 0,
      basedt: convertDateToStr(new Date()),
      codeyn: "Y",
      remark: "",
      uschgrat: 0,
      wonchgrat: 0,
      rowstatus: "N",
    };
    setSelectedState({ [newDataItem.num]: true });
    setIfSelectFirstRow(false);
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const [paraData, setParaData] = useState({
    workType: "SAVE",
    user_id: userId,
    form_id: "BA_A0070W",
    pc: pc,
    basedt: "",
    rowstatus: "",
    amtunit: "",
    wonchgrat: "",
    uschgrat: "",
    remark: "",
    baseamt: "",
  });

  const para: Iparameters = {
    procedureName: "P_BA_A0070W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_basedt": paraData.basedt,
      "@p_rowstatus": paraData.rowstatus,
      "@p_wonchgrat": paraData.wonchgrat,
      "@p_uschgrat": paraData.uschgrat,
      "@p_baseamt": paraData.baseamt,
      "@p_remark": paraData.remark,
      "@p_userid": paraData.user_id,
      "@p_amtunit": paraData.amtunit,
      "@p_form_id": paraData.form_id,
      "@p_pc": paraData.pc,
    },
  };

  type TdataArr = {
    basedt: string[];
    rowstatus: string[];
    amtunit: string[];
    wonchgrat: string[];
    uschgrat: string[];
    baseamt: string[];
    remark: string[];
  };

  const onSaveClick = async () => {
    let valid = true;
    let valid2 = true;
    try {
      mainDataResult.data.map((item: any) => {
        if (
          item.basedt.substring(0, 4) < "1997" ||
          item.basedt.substring(6, 8) > "31" ||
          item.basedt.substring(6, 8) < "01" ||
          item.basedt.substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "BA_A0070W_001");
        }
        if (item.amtunit == "") {
          throw findMessage(messagesData, "BA_A0070W_001");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    const dataItem2 = mainDataResult.data.filter((item: any) => {
      return item.rowstatus === "N";
    });

    const selectRow = subDataResult.data.filter(
      (item: any) =>
        item.num == Object.getOwnPropertyNames(selectedsubDataState)[0]
    )[0];

    dataItem2.map((item) => {
      dataItem2.map((item2) => {
        if (
          item.num != item2.num &&
          item.basedt == item2.basedt &&
          item.amtunit == item2.amtunit
        ) {
          valid2 = false;
        }
      });
    });

    if (!valid2) {
      alert("기준일과 화폐단위가 둘다 중복됩니다.");
      return false;
    }
    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;
    let dataArr: TdataArr = {
      basedt: [],
      rowstatus: [],
      amtunit: [],
      wonchgrat: [],
      uschgrat: [],
      baseamt: [],
      remark: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        basedt = "",
        rowstatus = "",
        amtunit = "",
        wonchgrat = "",
        uschgrat = "",
        baseamt = "",
        remark = "",
      } = item;

      dataArr.basedt.push(basedt);
      dataArr.rowstatus.push(rowstatus);
      dataArr.amtunit.push(amtunit);
      dataArr.wonchgrat.push(wonchgrat);
      dataArr.uschgrat.push(uschgrat);
      dataArr.remark.push(remark);
      dataArr.baseamt.push(baseamt);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        basedt = "",
        rowstatus = "",
        amtunit = "",
        wonchgrat = "",
        uschgrat = "",
        baseamt = "",
        remark = "",
      } = item;

      dataArr.basedt.push(basedt);
      dataArr.rowstatus.push(rowstatus);
      dataArr.amtunit.push(amtunit);
      dataArr.wonchgrat.push(wonchgrat);
      dataArr.uschgrat.push(uschgrat);
      dataArr.remark.push(remark);
      dataArr.baseamt.push(baseamt);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "SAVE",
      user_id: userId,
      form_id: "BA_A0070W",
      pc: pc,
      basedt: dataArr.basedt.join("|"),
      rowstatus: dataArr.rowstatus.join("|"),
      amtunit: dataArr.amtunit.join("|"),
      wonchgrat: dataArr.wonchgrat.join("|"),
      uschgrat: dataArr.uschgrat.join("|"),
      remark: dataArr.remark.join("|"),
      baseamt: dataArr.baseamt.join("|"),
    }));
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
      fetchMainGrid();
      setParaData({
        workType: "SAVE",
        user_id: userId,
        form_id: "BA_A0070W",
        pc: pc,
        basedt: "",
        rowstatus: "",
        amtunit: "",
        wonchgrat: "",
        uschgrat: "",
        remark: "",
        baseamt: "",
      });
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.rowstatus != "" || paraData.workType == "D") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];

    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows.push(newData2);
      }
    });
    setMainDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));

    setMainDataState({});
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    const selectRow = subDataResult.data.filter(
      (item: any) =>
        item.num == Object.getOwnPropertyNames(selectedsubDataState)[0]
    )[0];

    setParaData({
      workType: "D",
      user_id: userId,
      form_id: "BA_A0070W",
      pc: pc,
      basedt: selectRow.basedt,
      rowstatus: "",
      amtunit: "",
      wonchgrat: "",
      uschgrat: "",
      remark: "",
      baseamt: "",
    });
  };

  const onSite = () => {
    let link = "";
    siteListData.map((item) => {
      if (item.sub_code == filters.site) {
        link = item.memo;
      }
    });

    window.open(link, "_blank", "noopener, noreferrer");
  };

  return (
    <>
      <TitleContainer>
        <Title>환율관리</Title>

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
              <th>기준일</th>
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
              <th>화폐단위</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="amtunit"
                    value={filters.amtunit}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>환율정보</th>
              <td>
                <div className="filter-item-wrap">
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="site"
                      value={filters.site}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                  <Button
                    style={{ marginLeft: "5px" }}
                    onClick={onSite}
                    themeColor={"primary"}
                  >
                    이동
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainerWrap>
        <GridContainer width={`15%`}>
          <GridTitleContainer>
            <GridTitle>기준일자</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onDeleteClick2}
                fillMode="outline"
                themeColor={"primary"}
              >
                기준일삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "80vh" }}
            data={process(
              subDataResult.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selectedsubDataState[idGetter2(row)],
              })),
              subDataState
            )}
            {...subDataState}
            onDataStateChange={onSubDataStateChange}
            //선택 기능
            dataItemKey={SUB_DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSubDataSelectionChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={subDataResult.total}
            //정렬기능
            sortable={true}
            onSortChange={onSubDataSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            <GridColumn
              field="basedt"
              cell={DateCell}
              title="기준일"
              width="220px"
            />
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(85% - ${GAP}px)`}>
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>상세정보</GridTitle>
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
              style={{ height: "80vh" }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  basedt: row.basedt
                    ? new Date(dateformat(row.basedt))
                    : new Date(),
                  rowstatus:
                    row.rowstatus == null ||
                    row.rowstatus == "" ||
                    row.rowstatus == undefined
                      ? ""
                      : row.rowstatus,
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
                mode: "multiple",
              }}
              onSelectionChange={onSelectionChange}
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
              //incell 수정 기능
              onItemChange={onMainItemChange}
              cellRender={customCellRender}
              rowRender={customRowRender}
              editField={EDIT_FIELD}
            >
              <GridColumn
                field="rowstatus"
                title=" "
                width="50px"
                editable={false}
              />
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList"].map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        id={item.id}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        cell={
                          DateField.includes(item.fieldName)
                            ? DateCell
                            : CustomComboField.includes(item.fieldName)
                            ? CustomComboBoxCell
                            : NumberField.includes(item.fieldName)
                            ? NumberCell
                            : undefined
                        }
                        className={
                          requiredField.includes(item.fieldName)
                            ? "required"
                            : undefined
                        }
                        headerCell={
                          requiredField.includes(item.fieldName)
                            ? RequiredHeader
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0 ? mainTotalFooterCell : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </ExcelExport>
        </GridContainer>
      </GridContainerWrap>
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

export default BA_A0070W;
