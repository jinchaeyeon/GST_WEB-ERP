import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
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
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  ThreeNumberceil,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  dateformat2,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import EmailWindow from "../components/Windows/CommonWindows/EmailWindow";
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import SA_A1001_603W_Window from "../components/Windows/SA_A1001_603W_Window";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/SA_A1001_603W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";

const dateField = ["quodt"];

const numberField = [
  "quoamt",
  "quorev",
  "quounp",
  "margin",
  "discount",
  "finalquowonamt",
];

const centerField = ["designyn"];

const numberField2 = ["quounp", "finalquowonamt"];

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

type TdataArr = {
  quoseq_s: string[];
  itemcd_s: string[];
  quowonamt_s: string[];
  margin_s: string[];
  discount_s: string[];
  amt_s: string[];
};

const SA_A1001_603W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);

  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SA_A1001_603W", setCustomOptionData);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("SA_A1001_603W", setMessagesData);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");

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
        rev: defaultOption.find((item: any) => item.id === "rev").valueCode,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent(
    "L_sysUserMaster_001, L_SA001_603, L_Requestgb",
    setBizComponentData
  );
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [materialtypeListData, setMaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [requestgbListData, setRequestgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData.length > 0) {
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const materialtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA001_603"
        )
      );
      const requestgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_Requestgb"
        )
      );
      fetchQueryData(materialtypeQueryStr, setMaterialtypeListData);
      fetchQueryData(userQueryStr, setUserListData);
      fetchQueryData(requestgbQueryStr, setRequestgbListData);
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
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: true,
        pgNum: 1,
      }));
    } else if (e.selected == 1) {
      const data = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setFilters2((prev) => ({
        ...prev,
        quonum: data.quonum,
        quorev: data.quorev,
        isSearch: true,
        pgNum: 1,
      }));

      setInformation((prev) => ({
        ...prev,
        quonum: data.quonum,
        custnm: data.custnm,
        custprsnnm: data.custprsnnm,
        materialtype: data.materialtype,
        requestgb: data.requestgb,
        quofinyn: data.quofinyn,
        quorev: data.quorev,
        quodt: data.quodt,
        quoamt: data.quoamt,
      }));
    }

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
    work_type: "LIST",
    orgdiv: "01",
    frdt: new Date(),
    todt: new Date(),
    quonum: "",
    quorev: 0,
    quoseq: 0,
    custcd: "",
    custnm: "",
    custprsnnm: "",
    materialtype: "",
    person: "",
    personnm: "",
    remark: "",
    rev: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    work_type: "DETAIL",
    quonum: "",
    quorev: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  interface ICustData {
    address: string;
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

  const [information, setInformation] = useState<{ [name: string]: any }>({
    num: 1,
    quonum: "",
    custnm: "",
    custprsnnm: "",
    materialtype: "",
    requestgb: "",
    quofinyn: "",
    quorev: 0,
    quodt: "",
    quoamt: 0,
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
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1001_603W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": "01",
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_quonum": filters.quonum,
        "@p_quorev": filters.quorev,
        "@p_quoseq": filters.quoseq,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_materialtype": filters.materialtype,
        "@p_person": filters.personnm == "" ? "" : filters.person,
        "@p_personnm": filters.personnm,
        "@p_remark": filters.remark,
        "@p_rev": filters.rev,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.quokey == filters.find_row_value
          );
          targetRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef.current) {
          targetRowIndex = 0;
        }
      }

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value === ""
            ? rows[0]
            : rows.find((row: any) => row.quokey == filters.find_row_value);
        if (selectedRow != undefined) {
          setInformation((prev) => ({
            ...prev,
            quonum: selectedRow.quonum,
            custnm: selectedRow.custnm,
            custprsnnm: selectedRow.custprsnnm,
            materialtype: selectedRow.materialtype,
            requestgb: selectedRow.requestgb,
            quofinyn: selectedRow.quofinyn,
            quorev: selectedRow.quorev,
            quodt: selectedRow.quodt,
            quoamt: selectedRow.quoamt,
          }));

          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setInformation((prev) => ({
            ...prev,
            quonum: rows[0].quonum,
            custnm: rows[0].custnm,
            custprsnnm: rows[0].custprsnnm,
            materialtype: rows[0].materialtype,
            requestgb: rows[0].requestgb,
            quofinyn: rows[0].quofinyn,
            quorev: rows[0].quorev,
            quodt: rows[0].quodt,
            quoamt: rows[0].quoamt,
          }));

          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }

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
  const fetchMainGrid2 = async (filters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1001_603W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": "01",
        "@p_frdt": "",
        "@p_todt": "",
        "@p_quonum": filters2.quonum,
        "@p_quorev": filters2.quorev,
        "@p_quoseq": 0,
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_custprsnnm": "",
        "@p_materialtype": "",
        "@p_person": "",
        "@p_personnm": "",
        "@p_remark": "",
        "@p_rev": "",
        "@p_find_row_value": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
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

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
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
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A1001_603W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A1001_603W_001");
      } else {
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
        setTabSelected(0);
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const onRowDoubleClick = (props: any) => {
    const datas = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    setFilters2((prev) => ({
      ...prev,
      quonum: datas.quonum,
      quorev: datas.quorev,
      isSearch: true,
      pgNum: 1,
    }));

    setInformation((prev) => ({
      ...prev,
      quonum: datas.quonum,
      custnm: datas.custnm,
      custprsnnm: datas.custprsnnm,
      materialtype: datas.materialtype,
      requestgb: datas.requestgb,
      quofinyn: datas.quofinyn,
      quorev: datas.quorev,
      quodt: datas.quodt,
      quoamt: datas.quoamt,
    }));
    setTabSelected(1);
  };

  const [emailWindowVisible, setEmailWindowVisible] = useState<boolean>(false);
  const [printWindowVisible, setPrintWindowVisible] = useState<boolean>(false);

  const onSendEmail = () => {
    setEmailWindowVisible(true);
  };

  const onPrint = () => {
    setPrintWindowVisible(true);
  };

  const [PrsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);

  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };

  interface IPrsnnum {
    user_id: string;
    user_name: string;
  }

  const setPrsnnumData = (data: IPrsnnum) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        personnm: data.user_name,
        person: data.user_id,
      };
    });
  };

  const onCal = () => {
    const dataItem = mainDataResult2.data.filter((item) => item.chk == true);

    if (dataItem.length === 0) {
      alert("선택된 데이터가 없습니다.");
      return false;
    }

    let dataArr: TdataArr = {
      quoseq_s: [],
      itemcd_s: [],
      quowonamt_s: [],
      margin_s: [],
      discount_s: [],
      amt_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        quoseq = "",
        itemcd = "",
        quounp = "",
        margin = "",
        discount = "",
        finalquowonamt = "",
      } = item;

      dataArr.quoseq_s.push(quoseq);
      dataArr.itemcd_s.push(itemcd);
      dataArr.quowonamt_s.push(quounp);
      dataArr.margin_s.push(margin);
      dataArr.discount_s.push(discount);
      dataArr.amt_s.push(finalquowonamt);
    });

    setParaData({
      workType: "CAL",
      orgdiv: "01",
      quonum: information.quonum,
      quorev: information.quorev,
      quoseq_s: dataArr.quoseq_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      quowonamt_s: dataArr.quowonamt_s.join("|"),
      margin_s: dataArr.margin_s.join("|"),
      discount_s: dataArr.discount_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
    });
  };

  const onSALTRN = () => {
    const dataItem = mainDataResult2.data.filter((item) => item.chk == true);

    if (dataItem.length === 0) {
      alert("선택된 데이터가 없습니다.");
      return false;
    }

    let dataArr: TdataArr = {
      quoseq_s: [],
      itemcd_s: [],
      quowonamt_s: [],
      margin_s: [],
      discount_s: [],
      amt_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        quoseq = "",
        itemcd = "",
        quounp = "",
        margin = "",
        discount = "",
        finalquowonamt = "",
      } = item;

      dataArr.quoseq_s.push(quoseq);
      dataArr.itemcd_s.push(itemcd);
      dataArr.quowonamt_s.push(quounp);
      dataArr.margin_s.push(margin);
      dataArr.discount_s.push(discount);
      dataArr.amt_s.push(finalquowonamt);
    });

    setParaData({
      workType: "SALTRN",
      orgdiv: "01",
      quonum: information.quonum,
      quorev: information.quorev,
      quoseq_s: dataArr.quoseq_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      quowonamt_s: dataArr.quowonamt_s.join("|"),
      margin_s: dataArr.margin_s.join("|"),
      discount_s: dataArr.discount_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
    });
  };

  const onSave = () => {
    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0) return false;

    let dataArr: TdataArr = {
      quoseq_s: [],
      itemcd_s: [],
      quowonamt_s: [],
      margin_s: [],
      discount_s: [],
      amt_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        quoseq = "",
        itemcd = "",
        quounp = "",
        margin = "",
        discount = "",
        finalquowonamt = "",
      } = item;

      dataArr.quoseq_s.push(quoseq);
      dataArr.itemcd_s.push(itemcd);
      dataArr.quowonamt_s.push(quounp);
      dataArr.margin_s.push(margin);
      dataArr.discount_s.push(discount);
      dataArr.amt_s.push(finalquowonamt);
    });

    setParaData({
      workType: "U",
      orgdiv: "01",
      quonum: information.quonum,
      quorev: information.quorev,
      quoseq_s: dataArr.quoseq_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      quowonamt_s: dataArr.quowonamt_s.join("|"),
      margin_s: dataArr.margin_s.join("|"),
      discount_s: dataArr.discount_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
    });
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    quonum: "",
    quorev: "",
    quoseq_s: "",
    itemcd_s: "",
    quowonamt_s: "",
    margin_s: "",
    discount_s: "",
    amt_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_SA_A1001_603W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_quonum": ParaData.quonum,
      "@p_quorev": ParaData.quorev,
      "@p_quoseq_s": ParaData.quoseq_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_quowonamt_s": ParaData.quowonamt_s,
      "@p_margin_s": ParaData.margin_s,
      "@p_discount_s": ParaData.discount_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SA_A1001_603W",
    },
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setPage(initialPageState);
      setPage2(initialPageState);
      setValues2(false);
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
        pgNum: 1,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
      setParaData({
        workType: "",
        orgdiv: "01",
        quonum: "",
        quorev: "",
        quoseq_s: "",
        itemcd_s: "",
        quowonamt_s: "",
        margin_s: "",
        discount_s: "",
        amt_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus === "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult2((prev) => {
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
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
    if (field != "rowstatus" && field != "itemcd" && field != "testitem") {
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
                  ? ThreeNumberceil(
                      item.quounp +
                        ThreeNumberceil(item.quounp * (item.margin / 100)) -
                        ThreeNumberceil(
                          (item.quounp +
                            ThreeNumberceil(
                              item.quounp * (item.margin / 100)
                            )) *
                            (item.discount / 100)
                        )
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
              pathname="SA_A1001_603W"
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
            <FilterBox
              onKeyPress={(e) => handleKeyPressSearch(e, search)}
              style={{ height: "10%" }}
            >
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
                      className="required"
                    />
                  </td>
                  <th>프로젝트번호</th>
                  <td>
                    <Input
                      name="quonum"
                      type="text"
                      value={filters.quonum}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>의뢰기관코드</th>
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
                  <th>의뢰기관명</th>
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
                    <Input
                      name="personnm"
                      type="text"
                      value={filters.personnm}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type="button"
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onPrsnnumWndClick}
                      />
                    </ButtonInInput>
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
                  <th>리비전번호</th>
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
                    materialtype: materialtypeListData.find(
                      (items: any) => items.sub_code == row.materialtype
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
                              : centerField.includes(item.fieldName)
                              ? CenterCell
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
              <Button themeColor={"primary"} onClick={onPrint} icon="print">
                견적서 출력
              </Button>
              <Button themeColor={"primary"} onClick={onSendEmail} icon="email">
                이메일 전송
              </Button>
              <Button
                themeColor={"primary"}
                fillMode="outline"
                onClick={onCal}
                icon="calculator"
              >
                견적 산출
              </Button>
              <Button
                onClick={onSave}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              >
                저장
              </Button>
              <Button
                themeColor={"primary"}
                onClick={onSALTRN}
                fillMode="outline"
                icon="dictionary-add"
              >
                계약 전환
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <FormBoxWrap border={true}>
            <FormBox>
              <tbody>
                <tr>
                  <th>프로젝트번호</th>
                  <td>
                    <Input
                      name="quonum"
                      type="text"
                      value={information.quonum}
                      className="readonly"
                    />
                  </td>
                  <th>의뢰기관</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={information.custnm}
                      className="readonly"
                    />
                  </td>
                  <th>의뢰자</th>
                  <td>
                    <Input
                      name="custprsnnm"
                      type="text"
                      value={information.custprsnnm}
                      className="readonly"
                    />
                  </td>
                  <th>의뢰목적</th>
                  <td>
                    <Input
                      name="requestgb"
                      type="text"
                      value={
                        requestgbListData.find(
                          (items: any) =>
                            items.sub_code == information.requestgb
                        )?.code_name
                      }
                      className="readonly"
                    />
                  </td>
                  <th>물질분야</th>
                  <td>
                    <Input
                      name="materialtype"
                      type="text"
                      value={
                        materialtypeListData.find(
                          (items: any) =>
                            items.sub_code == information.materialtype
                        )?.code_name
                      }
                      className="readonly"
                    />
                  </td>
                </tr>
                <tr>
                  <th>리비전번호</th>
                  <td>
                    <Input
                      name="quorev"
                      type="text"
                      value={information.quorev}
                      className="readonly"
                    />
                  </td>
                  <th>견적 발행일</th>
                  <td>
                    <Input
                      name="quodt"
                      type="text"
                      value={dateformat2(information.quodt)}
                      className="readonly"
                    />
                  </td>
                  <th>견적금액</th>
                  <td>
                    <Input
                      name="quoamt"
                      type="text"
                      value={numberWithCommas(parseFloat(information.quoamt))}
                      className="readonly"
                      style={{ textAlign: "end" }}
                    />
                  </td>
                  <th>견적확정여부</th>
                  <td>
                    <Input
                      name="quofinyn"
                      type="text"
                      value={information.quofinyn}
                      className="readonly"
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
                onItemChange={onMainItemChange}
                cellRender={customCellRender}
                rowRender={customRowRender}
                editField={EDIT_FIELD}
              >
                <GridColumn field="rowstatus" title=" " width="50px" />
                <GridColumn
                  field="chk"
                  title=" "
                  width="45px"
                  headerCell={CustomCheckBoxCell2}
                  cell={CheckBoxCell}
                />
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
                              : numberField2.includes(item.fieldName)
                              ? editNumberFooterCell
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
              <div
                style={{
                  border: "solid 1px rgba(0, 0, 0, 0.08)",
                  height: "65.5vh",
                }}
              ></div>
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
      {emailWindowVisible && (
        <EmailWindow
          setVisible={setEmailWindowVisible}
          quonum={
            mainDataResult.data.filter(
              (item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
            )[0] != undefined
              ? mainDataResult.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedState)[0]
                )[0].quonum
              : ""
          }
          quorev={
            mainDataResult.data.filter(
              (item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
            )[0] != undefined
              ? mainDataResult.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedState)[0]
                )[0].quorev
              : 0
          }
          modal={true}
        />
      )}
      {printWindowVisible && (
        <SA_A1001_603W_Window
          setVisible={setPrintWindowVisible}
          quonum={
            mainDataResult.data.filter(
              (item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
            )[0] != undefined
              ? mainDataResult.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedState)[0]
                )[0].quonum
              : ""
          }
          quorev={
            mainDataResult.data.filter(
              (item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
            )[0] != undefined
              ? mainDataResult.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedState)[0]
                )[0].quorev
              : 0
          }
          modal={true}
        />
      )}
      {PrsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType="N"
          setData={setPrsnnumData}
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
