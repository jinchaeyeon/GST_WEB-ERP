import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridRowDoubleClickEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  GetPropertyValueByName,
  ThreeNumberceil,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  getGridItemChangedData,
  getQueryFromBizComponent,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { gridList } from "../store/columns/SA_A1001_603W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

import { bytesToBase64 } from "byte-base64";
import { useHistory, useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import TopButtons from "../components/Buttons/TopButtons";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCommaCell from "../components/Cells/NumberCommaCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { isLoading } from "../store/atoms";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";

const dateField = ["quodt"];

const numberField = [
  "quoamt",
  "quowonamt",
  "marginpercent",
  "discountpercent",
  "finalquowonamt",
];

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

const SA_A1001_603W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const pathname: string = window.location.pathname.replace("/", "");
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        materialtype: defaultOption.find(
          (item: any) => item.id === "materialtype"
        ).valueCode,
        person: defaultOption.find((item: any) => item.id === "person")
          .valueCode,
        rev: defaultOption.find((item: any) => item.id === "rev").valueCode,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
      }));
    }
  }, [customOptionData]);
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent("L_sysUserMaster_001", setBizComponentData);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData.length > 0) {
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      fetchQueryData(userQueryStr, setUserListData);
    }
  }, [bizComponentData]);

  const fetchQueryData = useCallback(
    async (queryStr: string, setListData: any) => {
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
    },
    []
  );

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

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
    pgSize: PAGE_SIZE,
    work_type: "Q",
    orgdiv: "",
    location: "",
    frdt: new Date(),
    todt: new Date(),
    requestnum: "",
    custcd: "",
    custnm: "",
    custprsnnm: "",
    materialtype: "",
    person: "",
    remark: "",
    rev: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    work_type: "Q",
    requestnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  interface ICustData {
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }

  const [information, setInformation] = useState({
    num: 1,
    requestnum: "TEST20231114",
    custnm: "셀트리온",
    custprsnnm: "손흥민",
    materialtype: "1",
    requestreason: "허가",
    quonum: "E20231118",
    quofinyn: "",
    quorev: "2",
    quodt: "2023-11-18",
    quoamt: 500000000,
  });

  const setCustData = (data: ICustData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    // //조회조건 파라미터
    // const parameters: Iparameters = {
    //   procedureName: "P_QC_A3000W_Q",
    //   pageNumber: filters.pgNum,
    //   pageSize: filters.pgSize,
    //   parameters: {
    //     "@p_work_type": "PRLIST",
    //     "@p_orgdiv": filters.orgdiv,
    //     "@p_location": filters.location,
    //     "@p_frdt": convertDateToStr(filters.frdt),
    //     "@p_todt": convertDateToStr(filters.todt),
    //     "@p_proccd": filters.proccd,
    //     "@p_itemcd": filters.itemcd,
    //     "@p_itemnm": filters.itemnm,
    //     "@p_prodemp": filters.prodemp,
    //     "@p_prodmac": filters.prodmac,
    //     "@p_qcyn": filters.qcyn,
    //     "@p_lotnum": filters.lotnum,
    //     "@p_plankey": filters.plankey,
    //     "@p_rekey": filters.rekey,
    //     "@p_renum": filters.renum,
    //     "@p_reseq": filters.reseq,
    //     "@p_qcnum": filters.qcnum,
    //     "@p_company_code": filters.company_code,
    //     "@p_find_row_value": filters.find_row_value,
    //   },
    // };
    // try {
    //   data = await processApi<any>("procedure", parameters);
    // } catch (error) {
    //   data = null;
    // }
    // if (data.isSuccess === true) {
    // const totalRowCnt = data.tables[0].TotalRowCount;
    // const rows = data.tables[0].Rows;

    const totalRowCnt = 8;
    const rows: any[] = [
      {
        num: 1,
        requestnum: "TEST20231114",
        custnm: "셀트리온",
        custprsnnm: "손흥민",
        materialtype: "1",
        designyn: "",
        quocalyn: "",
        quofinyn: "",
        quorev: "2",
        quodt: "20231118",
        quoamt: 500000000,
        person: "admin",
        total_quoamt: 750000000,
      },
      {
        num: 2,
        requestnum: "TEST20231115",
        custnm: "",
        custprsnnm: "",
        materialtype: "",
        designyn: "",
        quocalyn: "",
        quofinyn: "",
        quorev: "1",
        quodt: "20231120",
        quoamt: 250000000,
        person: "admin",
        total_quoamt: 750000000,
      },
      {
        num: 3,
        requestnum: "TEST20231116",
        custnm: "",
        custprsnnm: "",
        materialtype: "",
        designyn: "",
        quocalyn: "",
        quofinyn: "",
        quorev: "",
        quodt: "",
        quoamt: 0,
        person: "admin",
        total_quoamt: 750000000,
      },
      {
        num: 4,
        requestnum: "TEST20231117",
        custnm: "",
        custprsnnm: "",
        materialtype: "",
        designyn: "",
        quocalyn: "",
        quofinyn: "",
        quorev: "",
        quodt: "",
        quoamt: 0,
        person: "admin",
        total_quoamt: 750000000,
      },
      {
        num: 5,
        requestnum: "TEST20231118",
        custnm: "",
        custprsnnm: "",
        materialtype: "",
        designyn: "",
        quocalyn: "",
        quofinyn: "",
        quorev: "",
        quodt: "",
        quoamt: 0,
        person: "admin",
        total_quoamt: 750000000,
      },
      {
        num: 6,
        requestnum: "TEST20231119",
        custnm: "",
        custprsnnm: "",
        materialtype: "",
        designyn: "",
        quocalyn: "",
        quofinyn: "",
        quorev: "",
        quodt: "",
        quoamt: 0,
        person: "admin",
        total_quoamt: 750000000,
      },
      {
        num: 7,
        requestnum: "TEST20231120",
        custnm: "",
        custprsnnm: "",
        materialtype: "",
        designyn: "",
        quocalyn: "",
        quofinyn: "",
        quorev: "",
        quodt: "",
        quoamt: 0,
        person: "admin",
        total_quoamt: 750000000,
      },
      {
        num: 8,
        requestnum: "TEST20231121",
        custnm: "",
        custprsnnm: "",
        materialtype: "",
        designyn: "",
        quocalyn: "",
        quofinyn: "",
        quorev: "",
        quodt: "",
        quoamt: 0,
        person: "admin",
        total_quoamt: 750000000,
      },
    ];

    setMainDataResult((prev) => {
      return {
        data: rows,
        // total: totalRowCnt == -1 ? 0 : totalRowCnt,
        total: totalRowCnt,
      };
    });

    if (totalRowCnt > 0) {
      setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
    }
    // } else {
    //   console.log("[오류 발생]");
    //   console.log(data);
    // }
    // 필터 isSearch false처리, pgNum 세팅
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters: any) => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    // //조회조건 파라미터
    // const parameters: Iparameters = {
    //   procedureName: "P_QC_A3000W_Q",
    //   pageNumber: filters.pgNum,
    //   pageSize: filters.pgSize,
    //   parameters: {
    //     "@p_work_type": "PRLIST",
    //     "@p_orgdiv": filters.orgdiv,
    //     "@p_location": filters.location,
    //     "@p_frdt": convertDateToStr(filters.frdt),
    //     "@p_todt": convertDateToStr(filters.todt),
    //     "@p_proccd": filters.proccd,
    //     "@p_itemcd": filters.itemcd,
    //     "@p_itemnm": filters.itemnm,
    //     "@p_prodemp": filters.prodemp,
    //     "@p_prodmac": filters.prodmac,
    //     "@p_qcyn": filters.qcyn,
    //     "@p_lotnum": filters.lotnum,
    //     "@p_plankey": filters.plankey,
    //     "@p_rekey": filters.rekey,
    //     "@p_renum": filters.renum,
    //     "@p_reseq": filters.reseq,
    //     "@p_qcnum": filters.qcnum,
    //     "@p_company_code": filters.company_code,
    //     "@p_find_row_value": filters.find_row_value,
    //   },
    // };
    // try {
    //   data = await processApi<any>("procedure", parameters);
    // } catch (error) {
    //   data = null;
    // }
    // if (data.isSuccess === true) {
    // const totalRowCnt = data.tables[0].TotalRowCount;
    // const rows = data.tables[0].Rows;

    const totalRowCnt = 2;
    const rows: any[] = [
      {
        num: 1,
        itemcd: "#000",
        testitem: "시험품목1",
        quowonamt: 100,
        marginpercent: 10,
        discountpercent: 5,
        finalquowonamt: 104.5,
      },
      {
        num: 2,
        itemcd: "#000",
        testitem: "시험품목2",
        quowonamt: 50,
        marginpercent: 0,
        discountpercent: 5,
        finalquowonamt: 45,
      },
    ];

    setMainDataResult2((prev) => {
      return {
        data: rows,
        // total: totalRowCnt == -1 ? 0 : totalRowCnt,
        total: totalRowCnt,
      };
    });

    if (totalRowCnt > 0) {
      setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
    }
    // } else {
    //   console.log("[오류 발생]");
    //   console.log(data);
    // }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions]);

  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [mainDataResult2]);

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

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
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseInt(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const search = () => {
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    setTabSelected(0);
  };

  const onRowDoubleClick = (props: any) => {
    const datas = props.dataItem;
    setFilters2((prev) => ({
      ...prev,
      requestnum: datas.requestnum,
      isSearch: true,
      pgNum: 1,
    }));
    setTabSelected(1);
  };

  const onItemChange = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
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
    if (field != "itemcd" && field != "testitem" && field != "rowstatus") {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );
      setEditIndex(dataItem[DATA_ITEM_KEY2]);
      if (field) {
        setEditedField(field);
      }

      setTempResult((prev) => {
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
      setTempResult((prev) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              finalquowonamt:
                editedField != "finalquowonamt"
                  ? (item.quowonamt +
                    ThreeNumberceil(
                      (item.quowonamt * (item.marginpercent/ 100)) 
                    )) -
                    ThreeNumberceil(
                      ((item.quowonamt +
                        ThreeNumberceil(
                          (item.quowonamt * (item.marginpercent/ 100)) 
                        )) *
                          (item.discountpercent /
                          100)) 
                    )
                  : item.finalquowonamt,
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
      setTempResult((prev) => {
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

  return (
    <>
      <TitleContainer>
        <Title>견적처리</Title>
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
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
      >
        <TabStripTab title="견적(조회)">
          <FilterContainer>
            <FilterBox style={{ height: "10%" }}>
              <tbody>
                <tr>
                  <th>의뢰기간</th>
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
                    />
                  </td>
                  <th>의뢰번호</th>
                  <td>
                    <Input
                      name="requestnum"
                      type="text"
                      value={filters.requestnum}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>의뢰기간코드</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={filters.custcd}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>의뢰기간명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>의뢰자명</th>
                  <td>
                    <Input
                      name="custprsnnm"
                      type="text"
                      value={filters.custprsnnm}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>물질분야</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="materialtype"
                        value={filters.materialtype}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>담당자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="person"
                        value={filters.person}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        valueField="user_id"
                        textField="user_name"
                      />
                    )}
                  </td>
                  <th>비고</th>
                  <td>
                    <Input
                      name="remark"
                      type="text"
                      value={filters.remark}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>견적Rev</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="rev"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
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
                <GridTitle>요약정보</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "72vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    person: userListData.find(
                      (items: any) => items.user_id == row.person
                    )?.user_name,
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
                onSelectionChange={onSelectionChange}
                onRowDoubleClick={onRowDoubleClick}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult.total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
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
                            dateField.includes(item.fieldName)
                              ? DateCell
                              : numberField.includes(item.fieldName)
                              ? NumberCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab
          title="견적(처리)"
          disabled={mainDataResult.total == 0 ? true : false}
        >
          <GridTitleContainer>
            <GridTitle>상세정보</GridTitle>
            <ButtonContainer>
              <Button themeColor={"primary"}>견적 산출</Button>
              <Button themeColor={"primary"}>계약 전환</Button>
            </ButtonContainer>
          </GridTitleContainer>
          <FormBoxWrap>
            <FormBox>
              <tbody>
                <tr>
                  <th>의뢰번호</th>
                  <td>
                    <Input
                      name="requestnum"
                      type="text"
                      value={information.requestnum}
                    />
                  </td>
                  <th>의뢰기관</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={information.custnm}
                    />
                  </td>
                  <th>의뢰자</th>
                  <td>
                    <Input
                      name="custprsnnm"
                      type="text"
                      value={information.custprsnnm}
                    />
                  </td>
                  <th>의뢰목적</th>
                  <td>
                    <Input
                      name="requestreason"
                      type="text"
                      value={information.requestreason}
                    />
                  </td>
                  <th>물질분야</th>
                  <td>
                    <Input
                      name="materialtype"
                      type="text"
                      value={information.materialtype}
                    />
                  </td>
                </tr>
                <tr>
                  <th>견적번호</th>
                  <td>
                    <Input
                      name="quonum"
                      type="text"
                      value={information.quonum}
                    />
                  </td>
                  <th>견적rev</th>
                  <td>
                    <Input
                      name="quorev"
                      type="text"
                      value={information.quorev}
                    />
                  </td>
                  <th>견적 발행일</th>
                  <td>
                    <Input name="quodt" type="text" value={information.quodt} />
                  </td>
                  <th>견적금액</th>
                  <td>
                    <Input
                      name="quoamt"
                      type="number"
                      value={information.quoamt}
                    />
                  </td>
                  <th>견적확정여부</th>
                  <td>
                    <Input
                      name="quofinyn"
                      type="text"
                      value={information.quofinyn}
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
          <GridContainerWrap>
            <GridContainer width="55%">
              <GridTitleContainer>
                <GridTitle>견적리스트</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "65vh" }}
                data={process(
                  mainDataResult2.data.map((row) => ({
                    ...row,
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
                onSelectionChange={onSelectionChange2}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult2.total}
                skip={page2.skip}
                take={page2.take}
                pageable={true}
                onPageChange={pageChange2}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef2}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange2}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                onItemChange={onItemChange}
                cellRender={customCellRender}
                rowRender={customRowRender}
                editField={EDIT_FIELD}
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList2"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          id={item.id}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            numberField.includes(item.fieldName)
                              ? NumberCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell2
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(45% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>시험상세디자인</GridTitle>
              </GridTitleContainer>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
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

export default SA_A1001_603W;
