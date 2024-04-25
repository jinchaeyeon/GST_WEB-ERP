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
import {
  Input,
  NumericTextBox,
  RadioGroup,
} from "@progress/kendo-react-inputs";
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
  dateformat,
  dateformat2,
  getGridItemChangedData,
  getQueryFromBizComponent,
  numberWithCommas,
  numberWithCommas3,
  setDefaultDate,
  toDate,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { gridList } from "../store/columns/SA_A1100_603W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

import { DatePicker } from "@progress/kendo-react-dateinputs";
import { bytesToBase64 } from "byte-base64";
import { useHistory, useLocation } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { IAttachmentData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";

type TdataArr = {
  rowstatus_s: string[];
  seq_s: string[];
  wonamt_s: string[];
  taxamt_s: string[];
  amt_s: string[];
  contractgb_s: string[];
  quonum_s: string[];
  quorev_s: string[];
  quoseq_s: string[];
};

type TdataArr2 = {
  rowstatus_s: string[];
  seq_s: string[];
  payment_s: string[];
  amt_s: string[];
  paydt_s: string[];
  remark_s: string[];
};

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY6 = "num";
let targetRowIndex: null | number = null;
const DateField = ["strdt", "enddt", "recdt", "paydt"];
const NumberField = [
  "cnt1",
  "amt",
  "taxamt",
  "contraamt",
  "change_contraamt",
  "fin_contraamt",
  "wonamt",
  "totamt",
  "week_b",
  "week_r",
  "qty_t",
  "totqty",
];

const NumberField2 = ["wonamt", "taxamt", "amt", "totamt"];

const customField = ["insert_userid"];

const centerField = ["num"];
const centerField2 = ["seq"];

let temp = 0;
let temp2 = 0;
let temp6 = 0;
const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_sysUserMaster_001",
    // 구분, 단위, 불량유형
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "insert_userid" ? "L_sysUserMaster_001" : "";

  const fieldName = field == "insert_userid" ? "user_name" : undefined;
  const fieldValue = field == "insert_userid" ? "user_id" : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={fieldName}
      valueField={fieldValue}
      {...props}
    />
  ) : (
    <td />
  );
};

let deletedMainRows: any[] = [];
let deletedMainRows2: any[] = [];
let deletedMainRows6: any[] = [];
const SA_A1100_603W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter6 = getter(DATA_ITEM_KEY6);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page6, setPage6] = useState(initialPageState);
  const [checked, setChecked] = useState(false);

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

  const setCustData = (data: ICustData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };

  const data = [
    { label: "시험번호기준으로 보기", value: "B" },
    { label: "상세내역으로 보기", value: "A" },
  ];

  const handleChange = (e: any) => {
    setSubFilters((prev) => ({
      ...prev,
      groupgb: e.value,
      isSearch: true,
      pgNum: 1,
    }));
  };
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent(
    "L_sysUserMaster_001, L_SA001_603, L_BA037",
    setBizComponentData
  );

  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [contractgbListData, setcontractgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [materialtypeListData, setMaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData.length > 0) {
      const contractgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA037")
      );
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_001"
        )
      );

      const materialtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_SA001_603"
        )
      );
      fetchQueryData(contractgbQueryStr, setcontractgbListData);
      fetchQueryData(userQueryStr, setUserListData);
      fetchQueryData(materialtypeQueryStr, setMaterialtypeListData);
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

      if (data.isSuccess == true) {
        const rows = data.tables[0].Rows;
        setListData(rows);
      }
    },
    []
  );

  // 조회조건
  const [filters, setFilters] = useState({
    orgdiv: "01",
    location: "01",
    frdt: new Date(),
    todt: new Date(),
    quokey: "",
    custcd: "",
    custnm: "",
    custprsnnm: "",
    contractno: "",
    project: "",
    chkperson: "",
    materialtype: "",
    extra_field2: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  const [subFilters, setSubFilters] = useState<{ [name: string]: any }>({
    workType: "",
    orgdiv: "01",
    location: "01",
    contractno: "",
    groupgb: "A",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  const [subFilters2, setSubFilters2] = useState<{ [name: string]: any }>({
    workType: "",
    orgdiv: "01",
    location: "01",
    contractno: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  const [subFilters6, setSubFilters6] = useState<{ [name: string]: any }>({
    workType: "",
    orgdiv: "01",
    location: "01",
    contractno: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });
  const [Information, setInformation] = useState({
    amtunit: "",
    change_contraamt: 0,
    contraamt: 0,
    contractno: "",
    custcd: "",
    custnm: "",
    custprsnnm: "",
    enddt: new Date(),
    fin_contraamt: 0,
    project: "",
    strdt: new Date(),
    wonchgrat: 0,
    insert_time: "",
    materialtype: "",
    extra_field2: "",
    cotracdt: new Date(),
    attdatnum: "",
    files: "",
  });
  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState6, setSelectedState6] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [tempState6, setTempState6] = useState<State>({
    sort: [],
  });
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [tempResult6, setTempResult6] = useState<DataResult>(
    process([], tempState6)
  );
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataState6, setMainDataState6] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [mainDataResult6, setMainDataResult6] = useState<DataResult>(
    process([], mainDataState6)
  );
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onRowDoubleClick = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = event.dataItem;
    setSelectedState({ [selectedRowData[DATA_ITEM_KEY]]: true });

    setChecked(true);
    setSubFilters((prev) => ({
      ...prev,
      workType: "DETAIL",
      contractno: selectedRowData.contractno,
      groupgb: "A",
      pgNum: 1,
      isSearch: true,
    }));
    setSubFilters2((prev) => ({
      ...prev,
      workType: "COMMENT",
      contractno: selectedRowData.contractno,
      pgNum: 1,
      isSearch: true,
    }));
    setSubFilters6((prev) => ({
      ...prev,
      workType: "PAYMENT",
      contractno: selectedRowData.contractno,
      pgNum: 1,
      isSearch: true,
    }));
    setTabSelected(1);
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "custnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        custcd: value == "" ? "" : prev.custcd,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const InfoInputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InfoInputChange2 = (e: any) => {
    const { name } = e.target;
    const value = e.value;

    if (name == "wonchgrat") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (Information.amtunit != "KRW") {
        const newData = mainDataResult2.data.map((item) => ({
          ...item,
          wonamt: ThreeNumberceil(item.amt * value),
          taxamt: ThreeNumberceil(ThreeNumberceil(item.amt * value) * 0.1),
          totamt:
            ThreeNumberceil(item.amt * value) +
            ThreeNumberceil(ThreeNumberceil(item.amt * value) * 0.1),
          rowstatus: item.rowstatus == "N" ? "N" : "U",
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
    } else {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (value != "KRW") {
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        wonamt: ThreeNumberceil(item.amt * Information.wonchgrat),
        taxamt: ThreeNumberceil(
          ThreeNumberceil(item.amt * Information.wonchgrat) * 0.1
        ),
        totamt:
          ThreeNumberceil(item.amt * Information.wonchgrat) +
          ThreeNumberceil(
            ThreeNumberceil(item.amt * Information.wonchgrat) * 0.1
          ),
        rowstatus: item.rowstatus == "N" ? "N" : "U",
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

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SA_A1100_603W", setCustomOptionData);

  const history = useHistory();
  const location = useLocation();

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const queryParams = new URLSearchParams(location.search);
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      if (queryParams.has("go")) {
        history.replace({}, "");
        setFilters((prev) => ({
          ...prev,
          frdt: setDefaultDate(customOptionData, "frdt"),
          todt: setDefaultDate(customOptionData, "todt"),
          materialtype: defaultOption.find(
            (item: any) => item.id == "materialtype"
          )?.valueCode,
          chkperson: defaultOption.find((item: any) => item.id == "chkperson")
            ?.valueCode,
          isSearch: true,
          find_row_value: queryParams.get("go") as string,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          frdt: setDefaultDate(customOptionData, "frdt"),
          todt: setDefaultDate(customOptionData, "todt"),
          materialtype: defaultOption.find(
            (item: any) => item.id == "materialtype"
          )?.valueCode,
          chkperson: defaultOption.find((item: any) => item.id == "chkperson")
            ?.valueCode,
          isSearch: true,
        }));
      }
    }
  }, [customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (subFilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters);

      setSubFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchSubGrid(deepCopiedFilters);
    }
  }, [subFilters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (subFilters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters2);

      setSubFilters2((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchSubGrid2(deepCopiedFilters);
    }
  }, [subFilters2, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (subFilters6.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters6);

      setSubFilters6((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchSubGrid6(deepCopiedFilters);
    }
  }, [subFilters6, permissions]);

  let gridRef: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    deletedMainRows = [];
    deletedMainRows2 = [];
    deletedMainRows6 = [];
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage6(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult6(process([], mainDataState6));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;

    setLoading(true);

    //조회프로시저  파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1100_603W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_quokey": filters.quokey,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_contractno": filters.contractno,
        "@p_project": filters.project,
        "@p_chkperson": filters.chkperson,
        "@p_materialtype": filters.materialtype,
        "@p_extra_field2": filters.extra_field2,
        "@p_find_row_value": filters.find_row_value,
        "@p_groupgb": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.contractno == filters.find_row_value
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

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.contractno == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
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
  const fetchSubGrid = async (subFilters: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    const parameters1: Iparameters = {
      procedureName: "P_SA_A1100_603W_Q",
      pageNumber: subFilters.pgNum,
      pageSize: subFilters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_quokey": filters.quokey,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_contractno": subFilters.contractno,
        "@p_project": filters.project,
        "@p_chkperson": filters.chkperson,
        "@p_materialtype": filters.materialtype,
        "@p_extra_field2": filters.extra_field2,
        "@p_find_row_value": filters.find_row_value,
        "@p_groupgb": subFilters.groupgb,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters1);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[1].TotalRowCount;
      const rows = data.tables[1].Rows;

      if (data.tables[0].RowCount > 0) {
        setInformation((prev) => ({
          ...prev,
          amtunit: data.tables[0].Rows[0].amtunit,
          change_contraamt: data.tables[0].Rows[0].change_contraamt,
          contraamt: data.tables[0].Rows[0].contraamt,
          contractno: data.tables[0].Rows[0].contractno,
          custcd: data.tables[0].Rows[0].custcd,
          custnm: data.tables[0].Rows[0].custnm,
          custprsnnm: data.tables[0].Rows[0].custprsnnm,
          enddt:
            data.tables[0].Rows[0].enddt == ""
              ? new Date()
              : toDate(data.tables[0].Rows[0].enddt),
          fin_contraamt: data.tables[0].Rows[0].fin_contraamt,
          project: data.tables[0].Rows[0].project,
          strdt:
            data.tables[0].Rows[0].strdt == ""
              ? new Date()
              : toDate(data.tables[0].Rows[0].strdt),
          wonchgrat: data.tables[0].Rows[0].wonchgrat,
          insert_time: data.tables[0].Rows[0].insert_time.substring(0, 10),
          materialtype: data.tables[0].Rows[0].materialtype,
          extra_field2: data.tables[0].Rows[0].extra_field2,
          cotracdt: toDate(data.tables[0].Rows[0].cotracdt),
          attdatnum: data.tables[0].Rows[0].attdatnum,
          files: data.tables[0].Rows[0].files,
        }));
      } else {
        setInformation((prev) => ({
          ...prev,
          amtunit: "",
          change_contraamt: 0,
          contraamt: 0,
          contractno: "",
          custcd: "",
          custnm: "",
          custprsnnm: "",
          enddt: new Date(),
          fin_contraamt: 0,
          project: "",
          strdt: new Date(),
          wonchgrat: 0,
          insert_time: "",
          materialtype: "",
          extra_field2: "",
          cotracdt: new Date(),
          attdatnum: "",
          files: "",
        }));
      }
      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters((prev) => ({
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
  const fetchSubGrid2 = async (subFilters2: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    //조회프로시저  파라미터
    const parameters2: Iparameters = {
      procedureName: "P_SA_A1100_603W_Q",
      pageNumber: subFilters2.pgNum,
      pageSize: subFilters2.pgSize,
      parameters: {
        "@p_work_type": "COMMENT",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_quokey": filters.quokey,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_contractno": subFilters2.contractno,
        "@p_project": filters.project,
        "@p_chkperson": filters.chkperson,
        "@p_materialtype": filters.materialtype,
        "@p_extra_field2": filters.extra_field2,
        "@p_find_row_value": filters.find_row_value,
        "@p_groupgb": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult3({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters2((prev) => ({
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
  const fetchSubGrid6 = async (subFilters6: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    //조회프로시저  파라미터
    const parameters2: Iparameters = {
      procedureName: "P_SA_A1100_603W_Q",
      pageNumber: subFilters6.pgNum,
      pageSize: subFilters6.pgSize,
      parameters: {
        "@p_work_type": "PAYMENT",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_quokey": filters.quokey,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_contractno": subFilters6.contractno,
        "@p_project": filters.project,
        "@p_chkperson": filters.chkperson,
        "@p_materialtype": filters.materialtype,
        "@p_extra_field2": filters.extra_field2,
        "@p_find_row_value": filters.find_row_value,
        "@p_groupgb": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult6({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
      if (totalRowCnt > 0) {
        setSelectedState6({ [rows[0][DATA_ITEM_KEY6]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters6((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage({
      ...event.page,
    });
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage2({
      ...event.page,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters2((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage3({
      ...event.page,
    });
  };

  const pageChange6 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters6((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage6({
      ...event.page,
    });
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);

    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
  };

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

  const onSelectionChange6 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState6,
      dataItemKey: DATA_ITEM_KEY6,
    });

    setSelectedState6(newSelectedState);
  };
  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    if (e.selected == 0) {
      setChecked(false);
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
      }));
    }
    setTabSelected(e.selected);
  };

  const search = () => {
    try {
      resetAllGrid();
      setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      setTabSelected(0);
      setChecked(false);
      if (unsavedName.length > 0) {
        setDeletedName(unsavedName);
      }
      if (unsavedAttadatnums.length > 0) {
        setDeletedAttadatnums(unsavedAttadatnums);
      }
    } catch (e) {
      alert(e);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };

  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };

  const onMainDataStateChange6 = (event: GridDataStateChangeEvent) => {
    setMainDataState6(event.dataState);
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

  //그리드 푸터
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

  //그리드 푸터
  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell6 = (props: GridFooterCellProps) => {
    var parts = mainDataResult6.total.toString().split(".");
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

  const editNumberFooterCell6 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult6.data.forEach((item) =>
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

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export6: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        const optionsGridSix = _export6.workbookOptions();
        optionsGridTwo.sheets[1] = optionsGridThree.sheets[0];
        optionsGridTwo.sheets[2] = optionsGridSix.sheets[0];
        optionsGridTwo.sheets[0].title = "계약에 대한 코멘트";
        optionsGridTwo.sheets[1].title = "계약 상세내용";
        optionsGridTwo.sheets[2].title = "지급조건";
        _export2.save(optionsGridTwo);
      }
    }
  };

  const ongrdDetailItemChange = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
    );
  };

  const ongrdDetailItemChange6 = (event: GridItemChangeEvent) => {
    setMainDataState6((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult6,
      setMainDataResult6,
      DATA_ITEM_KEY6
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
  const customCellRender6 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit6}
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
  const customRowRender6 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit6}
      editField={EDIT_FIELD}
    />
  );
  const ongrdDetailItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
    );
  };

  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
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

  const enterEdit = (dataItem: any, field: string) => {
    if (
      field == "amt" ||
      field == "wonamt" ||
      field == "taxamt" ||
      field == "remark"
    ) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
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
      setTempResult((prev) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };
  const enterEdit6 = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "num") {
      const newData = mainDataResult6.data.map((item) =>
        item[DATA_ITEM_KEY6] == dataItem[DATA_ITEM_KEY6]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setTempResult6((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult6((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult6((prev) => {
        return {
          data: mainDataResult6.data,
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
              wonamt: ThreeNumberceil(
                Information.amtunit == "KRW"
                  ? item.amt
                  : item.amt * Information.wonchgrat
              ),
              taxamt: ThreeNumberceil(
                ThreeNumberceil(
                  Information.amtunit == "KRW"
                    ? item.amt
                    : item.amt * Information.wonchgrat
                ) * 0.1
              ),
              totamt:
                ThreeNumberceil(
                  Information.amtunit == "KRW"
                    ? item.amt
                    : item.amt * Information.wonchgrat
                ) +
                ThreeNumberceil(
                  ThreeNumberceil(
                    Information.amtunit == "KRW"
                      ? item.amt
                      : item.amt * Information.wonchgrat
                  ) * 0.1
                ),
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

  const exitEdit6 = () => {
    if (tempResult6.data != mainDataResult6.data) {
      const newData = mainDataResult6.data.map((item) =>
        item[DATA_ITEM_KEY6] == Object.getOwnPropertyNames(selectedState6)[0]
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

      setTempResult6((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult6((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult6.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult6((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult6((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "recdt" && field != "seq") {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == dataItem[DATA_ITEM_KEY3]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev) => {
        return {
          data: mainDataResult3.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult3.data) {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
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
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult3.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange6 = (e: any) => {
    setMainDataState6((prev) => ({ ...prev, sort: e.sort }));
  };

  const onAddClick = () => {
    mainDataResult3.data.map((item) => {
      if (item[DATA_ITEM_KEY3] > temp) {
        temp = item[DATA_ITEM_KEY3];
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY3]: ++temp,
      comment: "",
      id: "",
      insert_userid: userId,
      recdt: convertDateToStr(new Date()),
      seq: 0,
      rowstatus: "N",
    };
    setSelectedState3({ [newDataItem[DATA_ITEM_KEY3]]: true });
    setMainDataResult3((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick6 = () => {
    mainDataResult6.data.map((item) => {
      if (item[DATA_ITEM_KEY6] > temp6) {
        temp6 = item[DATA_ITEM_KEY6];
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY6]: ++temp6,
      orgdiv: "01",
      payment: "",
      seq: 0,
      paydt: convertDateToStr(new Date()),
      amt: 0,
      remark: "",
      rowstatus: "N",
    };
    setSelectedState6({ [newDataItem[DATA_ITEM_KEY6]]: true });
    setMainDataResult6((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object3: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult3.data.forEach((item: any, index: number) => {
      if (!selectedState3[item[DATA_ITEM_KEY3]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
        Object3.push(index);
      }
    });

    if (Math.min(...Object3) < Math.min(...Object2)) {
      data = mainDataResult3.data[Math.min(...Object2)];
    } else {
      data = mainDataResult3.data[Math.min(...Object3) - 1];
    }

    setMainDataResult3((prev) => ({
      data: newData,
      total: prev.total - Object3.length,
    }));
    if (Object3.length > 0) {
      setSelectedState3({
        [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
      });
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    rowstatus_s: "",
    wonamt_s: "",
    taxamt_s: "",
    amt_s: "",
    contractgb_s: "",
    quonum_s: "",
    quorev_s: "",
    quoseq_s: "",
    seq_s: "",
    payment_s: "",
    paydt_s: "",
    remark_s: "",
  });

  const infopara: Iparameters = {
    procedureName: "P_SA_A1100_603W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": "01",
      "@p_contractno": subFilters.contractno,
      "@p_location": "01",
      "@p_project": Information.project,
      "@p_cotracdt": convertDateToStr(Information.cotracdt),
      "@p_strdt": convertDateToStr(Information.strdt),
      "@p_enddt": convertDateToStr(Information.enddt),
      "@p_wonchgrat": Information.wonchgrat,
      "@p_amtunit": Information.amtunit,
      "@p_attdatnum": Information.attdatnum,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_seq_s": ParaData.seq_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_contractgb_s": ParaData.contractgb_s,
      "@p_quonum_s": ParaData.quonum_s,
      "@p_quorev_s": ParaData.quorev_s,
      "@p_quoseq_s": ParaData.quoseq_s,

      "@p_payment_s": ParaData.payment_s,
      "@p_paydt_s": ParaData.paydt_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SA_A1100_603W",
    },
  };

  const onSaveClick = () => {
    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length == 0 && deletedMainRows2.length == 0) {
      setParaData((prev) => ({
        ...prev,
        workType: "N",
      }));
    } else {
      let dataArr: TdataArr = {
        rowstatus_s: [],
        seq_s: [],
        wonamt_s: [],
        taxamt_s: [],
        amt_s: [],
        contractgb_s: [],
        quonum_s: [],
        quorev_s: [],
        quoseq_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          amt = "",
          seq = "",
          wonamt = "",
          taxamt = "",
          contractgb = "",
          quonum = "",
          quorev = "",
          quoseq = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.seq_s.push(seq);
        dataArr.wonamt_s.push(wonamt);
        dataArr.taxamt_s.push(taxamt);
        dataArr.amt_s.push(amt);
        dataArr.contractgb_s.push(contractgb);
        dataArr.quonum_s.push(quonum);
        dataArr.quorev_s.push(quorev);
        dataArr.quoseq_s.push(quoseq);
      });

      deletedMainRows2.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          amt = "",
          seq = "",
          wonamt = "",
          taxamt = "",
          contractgb = "",
          quonum = "",
          quorev = "",
          quoseq = "",
        } = item;

        dataArr.rowstatus_s.push("D");
        dataArr.seq_s.push(seq);
        dataArr.wonamt_s.push(wonamt);
        dataArr.taxamt_s.push(taxamt);
        dataArr.amt_s.push(amt);
        dataArr.contractgb_s.push(contractgb);
        dataArr.quonum_s.push(quonum);
        dataArr.quorev_s.push(quorev);
        dataArr.quoseq_s.push(quoseq);
      });

      setParaData((prev) => ({
        ...prev,
        workType: "N",
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        seq_s: dataArr.seq_s.join("|"),
        wonamt_s: dataArr.wonamt_s.join("|"),
        taxamt_s: dataArr.taxamt_s.join("|"),
        amt_s: dataArr.amt_s.join("|"),
        contractgb_s: dataArr.contractgb_s.join("|"),
        quonum_s: dataArr.quonum_s.join("|"),
        quorev_s: dataArr.quorev_s.join("|"),
        quoseq_s: dataArr.quoseq_s.join("|"),
      }));
    }
  };

  const onSaveClick6 = () => {
    const dataItem = mainDataResult6.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length == 0 && deletedMainRows6.length == 0) return false;

    let dataArr: TdataArr2 = {
      rowstatus_s: [],
      seq_s: [],
      payment_s: [],
      amt_s: [],
      paydt_s: [],
      remark_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = "",
        payment = "",
        amt = "",
        paydt = "",
        remark = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.payment_s.push(payment);
      dataArr.amt_s.push(amt);
      dataArr.paydt_s.push(paydt);
      dataArr.remark_s.push(remark);
    });

    deletedMainRows6.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = "",
        payment = "",
        amt = "",
        paydt = "",
        remark = "",
      } = item;

      dataArr.rowstatus_s.push("D");
      dataArr.seq_s.push(seq);
      dataArr.payment_s.push(payment);
      dataArr.amt_s.push(amt);
      dataArr.paydt_s.push(paydt);
      dataArr.remark_s.push(remark);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "PAYMENT",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      seq_s: dataArr.seq_s.join("|"),
      payment_s: dataArr.payment_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
      paydt_s: dataArr.paydt_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
    }));
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
      data = await processApi<any>("procedure", infopara);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      if (ParaData.workType == "D") {
        setDeletedAttadatnums([Information.attdatnum]);
        setTabSelected(0);
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
      } else {
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        if (unsavedAttadatnums.length > 0) {
          setDeletedAttadatnums(unsavedAttadatnums);
        }
        setSubFilters((prev) => ({
          ...prev,
          workType: "DETAIL",
          groupgb: "A",
          pgNum: 1,
          isSearch: true,
        }));
        setSubFilters2((prev) => ({
          ...prev,
          workType: "COMMENT",
          pgNum: 1,
          isSearch: true,
        }));
        setSubFilters6((prev) => ({
          ...prev,
          workType: "PAYMENT",
          pgNum: 1,
          isSearch: true,
        }));
      }
      setParaData({
        workType: "",
        rowstatus_s: "",
        wonamt_s: "",
        taxamt_s: "",
        amt_s: "",
        contractgb_s: "",
        quonum_s: "",
        quorev_s: "",
        quoseq_s: "",
        seq_s: "",
        payment_s: "",
        paydt_s: "",
        remark_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  const onSaveClick3 = () => {
    const dataItem: { [name: string]: any } = mainDataResult3.data.filter(
      (item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      }
    );
    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

    type TData = {
      row_status: string[];
      id: string[];
      seq: string[];
      recdt: string[];
      comment: string[];
      user_id: string[];
    };

    let dataArr: TData = {
      row_status: [],
      id: [],
      comment: [],
      seq: [],
      recdt: [],
      user_id: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { comment, rowstatus, id = "", seq, recdt, insert_userid } = item;

      dataArr.comment.push(comment);
      dataArr.id.push(id);
      dataArr.row_status.push(rowstatus);
      dataArr.seq.push(seq);
      dataArr.recdt.push(recdt);
      dataArr.user_id.push(insert_userid);
    });

    deletedMainRows.forEach((item: any, idx: number) => {
      const { comment, id = "", seq, recdt, insert_userid } = item;

      dataArr.row_status.push("D");
      dataArr.comment.push(comment);
      dataArr.id.push(id);
      dataArr.seq.push(seq);
      dataArr.recdt.push(recdt);
      dataArr.user_id.push(insert_userid);
    });

    setParaDataSaved((prev) => ({
      ...prev,
      work_type: "save",
      row_status: dataArr.row_status.join("|"),
      comment: dataArr.comment.join("|"),
      id: dataArr.id.join("|"),
      seq: dataArr.seq.join("|"),
      recdt: dataArr.recdt.join("|"),
      user_id: dataArr.user_id.join("|"),
      ref_key: subFilters.contractno,
    }));
  };

  const [paraDataSaved, setParaDataSaved] = useState({
    work_type: "",
    row_status: "",
    id: "",
    seq: "",
    recdt: "",
    comment: "",
    user_id: "",
    ref_key: "",
  });

  const paraSaved: Iparameters = {
    procedureName: "sys_sav_comments",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataSaved.work_type,
      "@p_row_status": paraDataSaved.row_status,
      "@p_id": paraDataSaved.id,
      "@p_seq": paraDataSaved.seq,
      "@p_recdt": paraDataSaved.recdt,
      "@p_comment": paraDataSaved.comment,
      "@p_user_id": paraDataSaved.user_id,
      "@p_form_id": "SA_A1100_603W",
      "@p_table_id": "SA204T",
      "@p_orgdiv": "01",
      "@p_ref_key": paraDataSaved.ref_key,
      "@p_exec_pc": pc,
    },
  };

  const fetchTodoGridSaved2 = async () => {
    let data: any;

    setLoading(true);

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      setSubFilters((prev) => ({
        ...prev,
        workType: "DETAIL",
        groupgb: "A",
        pgNum: 1,
        isSearch: true,
      }));
      setSubFilters2((prev) => ({
        ...prev,
        workType: "COMMENT",
        pgNum: 1,
        isSearch: true,
      }));
      setParaDataSaved((prev) => ({ ...prev, work_type: "" }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraDataSaved.work_type !== "") fetchTodoGridSaved2();
  }, [paraDataSaved]);

  const onCopyClick = () => {
    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    if (mainDataResult2.total > 0) {
      const selectRow = mainDataResult2.data.filter(
        (item) => item.num == Object.getOwnPropertyNames(selectedState2)[0]
      )[0];

      const newDataItem = {
        [DATA_ITEM_KEY2]: ++temp2,
        amt: selectRow.amt,
        contractgb: "B",
        contractno: selectRow.contractno,
        itemcd: selectRow.itemcd,
        itemnm: selectRow.itemnm,
        ordnum: selectRow.ordnum,
        qty_t: selectRow.qty_t,
        quonum: selectRow.quonum,
        quorev: selectRow.quorev,
        quoseq: selectRow.quoseq,
        recdt: selectRow.recdt,
        remark: selectRow.remark,
        seq: temp2,
        taxamt: selectRow.taxamt,
        testnum: selectRow.testnum,
        totamt: selectRow.totamt,
        totqty: selectRow.totqty,
        week_b: selectRow.week_b,
        week_r: selectRow.week_r,
        wonamt: selectRow.wonamt,
        rowstatus: "N",
      };

      setMainDataResult2((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    } else {
      alert("복사할 데이터가 없습니다.");
    }
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedState2[item[DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (item.contractgb == "A") {
          alert("계약된 건은 행 삭제가 불가능합니다.");
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
    if (Object.length > 0) {
      setSelectedState2({
        [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick6 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult6.data.forEach((item: any, index: number) => {
      if (!selectedState6[item[DATA_ITEM_KEY6]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows6.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult6.data[Math.min(...Object2)];
    } else {
      data = mainDataResult6.data[Math.min(...Object) - 1];
    }

    setMainDataResult6((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState6({
        [data != undefined ? data[DATA_ITEM_KEY6] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick3 = (e: any) => {
    if (!window.confirm("계약 삭제 하시겠습니까?")) {
      return false;
    }

    setParaData((prev) => ({
      ...prev,
      workType: "D",
    }));
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    if (!Information.attdatnum) {
      setUnsavedAttadatnums((prev) => [...prev, data.attdatnum]);
    }

    setInformation((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  return (
    <>
      <TitleContainer>
        <Title>계약관리</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="SA_A1100_603W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
      >
        <TabStripTab title="요약정보">
          <FilterContainer>
            <FilterBox style={{ height: "10%" }}>
              <tbody>
                <tr>
                  <th>계약일자</th>
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
                  <th>PJT NO.</th>
                  <td>
                    <Input
                      name="quokey"
                      type="text"
                      value={filters.quokey}
                      onChange={InputChange}
                    />
                  </td>
                  <th>업체명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={InputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type={"button"}
                        onClick={onCustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                </tr>
                <tr>
                  <th>의뢰자</th>
                  <td>
                    <Input
                      name="custprsnnm"
                      type="text"
                      value={filters.custprsnnm}
                      onChange={InputChange}
                    />
                  </td>
                  <th>계약번호</th>
                  <td>
                    <Input
                      name="contractno"
                      type="text"
                      value={filters.contractno}
                      onChange={InputChange}
                    />
                  </td>
                  <th>계약명</th>
                  <td>
                    <Input
                      name="project"
                      type="text"
                      value={filters.project}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>영업담당자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="chkperson"
                        value={filters.chkperson}
                        customOptionData={customOptionData}
                        textField="user_name"
                        valueField="user_id"
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>물질분야</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="materialtype"
                        value={filters.materialtype}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>물질상세분야</th>
                  <td>
                    <Input
                      name="extra_field2"
                      type="text"
                      value={filters.extra_field2}
                      onChange={InputChange}
                    />
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
              fileName="계약관리"
            >
              <Grid
                style={{ height: "65vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    chkperson: userListData.find(
                      (items: any) => items.user_id == row.chkperson
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
                  customOptionData.menuCustomColumnOptions["grdList"]?.map(
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
                              : NumberField.includes(item.fieldName)
                              ? NumberCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 0
                              ? mainTotalFooterCell
                              : NumberField.includes(item.fieldName)
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

        <TabStripTab title="상세정보" disabled={checked == true ? false : true}>
          <GridContainerWrap>
            <GridContainer width="30%">
              <GridTitleContainer>
                <GridTitle>계약내용</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>등록일자</th>
                      <td>
                        <Input
                          name="insert_time"
                          type="text"
                          value={dateformat2(Information.insert_time)}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>업체명</th>
                      <td>
                        <Input
                          name="custnm"
                          type="text"
                          value={Information.custnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>의뢰자</th>
                      <td>
                        <Input
                          name="custprsnnm"
                          type="text"
                          value={Information.custprsnnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>물질분야</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="materialtype"
                            type="new"
                            value={Information.materialtype}
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>물질세부분야</th>
                      <td>
                        <Input
                          name="extra_field2"
                          type="text"
                          value={Information.extra_field2}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>계약명 </th>
                      <td>
                        {subFilters.groupgb == "B" ? (
                          <Input
                            name="project"
                            type="text"
                            value={Information.project}
                            className="readonly"
                          />
                        ) : (
                          <Input
                            name="project"
                            type="text"
                            value={Information.project}
                            onChange={InfoInputChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>계약번호</th>
                      <td>
                        <Input
                          name="contractno"
                          type="text"
                          value={Information.contractno}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>계약일자</th>
                      <td>
                        {subFilters.groupgb == "B" ? (
                          <DatePicker
                            name="cotracdt"
                            value={Information.cotracdt}
                            format="yyyy-MM-dd"
                            className="readonly"
                            disabled={true}
                            placeholder=""
                          />
                        ) : (
                          <DatePicker
                            name="cotracdt"
                            value={Information.cotracdt}
                            format="yyyy-MM-dd"
                            placeholder=""
                            onChange={InfoInputChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>계약기간</th>
                      <td>
                        {subFilters.groupgb == "B" ? (
                          <CommonDateRangePicker
                            value={{
                              start: Information.strdt,
                              end: Information.enddt,
                            }}
                            disabled={true}
                          />
                        ) : (
                          <CommonDateRangePicker
                            value={{
                              start: Information.strdt,
                              end: Information.enddt,
                            }}
                            onChange={(e: {
                              value: { start: any; end: any };
                            }) =>
                              setInformation((prev) => ({
                                ...prev,
                                strdt: e.value.start,
                                enddt: e.value.end,
                              }))
                            }
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>계약금액</th>
                      <td>
                        <Input
                          name="contraamt"
                          type="text"
                          value={numberWithCommas3(Information.contraamt)}
                          style={{
                            textAlign: "end",
                          }}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>변경계약금액</th>
                      <td>
                        <Input
                          name="change_contraamt"
                          type="text"
                          value={numberWithCommas3(
                            Information.change_contraamt
                          )}
                          style={{
                            textAlign: "end",
                          }}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>최종계약금액</th>
                      <td>
                        <Input
                          name="fin_contraamt"
                          type="text"
                          value={numberWithCommas3(Information.fin_contraamt)}
                          style={{
                            textAlign: "end",
                          }}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>화폐단위</th>
                      <td>
                        {subFilters.groupgb == "B"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="amtunit"
                                type="new"
                                value={Information.amtunit}
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="readonly"
                                disabled={true}
                              />
                            )
                          : customOptionData !== null && (
                              <CustomOptionComboBox
                                name="amtunit"
                                type="new"
                                value={Information.amtunit}
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                    </tr>
                    <tr>
                      <th> 환율 </th>
                      <td>
                        {subFilters.groupgb == "B" ? (
                          <Input
                            name="wonchgrat"
                            type="text"
                            value={numberWithCommas3(Information.wonchgrat)}
                            style={{
                              textAlign: "end",
                            }}
                            className="readonly"
                          />
                        ) : (
                          <NumericTextBox
                            name="wonchgrat"
                            value={Information.wonchgrat}
                            format="n2"
                            onChange={InfoInputChange2}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>첨부파일</th>
                      <td>
                        <Input
                          name="files"
                          type="text"
                          value={Information.files}
                          className="readonly"
                        />
                        {subFilters.groupgb != "B" ? (
                          <ButtonInInput>
                            <Button
                              type={"button"}
                              onClick={onAttachmentsWndClick}
                              icon="more-horizontal"
                              fillMode="flat"
                            />
                          </ButtonInInput>
                        ) : (
                          ""
                        )}
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>지급조건</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick6}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                    ></Button>
                    <Button
                      onClick={onDeleteClick6}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                    ></Button>
                    <Button
                      onClick={onSaveClick6}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult6.data}
                  ref={(exporter) => {
                    _export6 = exporter;
                  }}
                  fileName="계약관리"
                >
                  <Grid
                    style={{ height: `calc((120vh - 300px)/2)` }}
                    data={process(
                      mainDataResult6.data.map((row) => ({
                        ...row,
                        paydt: row.paydt
                          ? new Date(dateformat(row.paydt))
                          : new Date(dateformat("99991231")),
                        [SELECTED_FIELD]: selectedState6[idGetter6(row)],
                      })),
                      mainDataState6
                    )}
                    {...mainDataState6}
                    onDataStateChange={onMainDataStateChange6}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY6}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange6}
                    fixedScroll={true}
                    total={mainDataResult6.total}
                    skip={page6.skip}
                    take={page6.take}
                    pageable={true}
                    onPageChange={pageChange6}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange6}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    onItemChange={ongrdDetailItemChange6}
                    cellRender={customCellRender6}
                    rowRender={customRowRender6}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn field="rowstatus" title=" " width="50px" />
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList6"]?.map(
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
                                  : NumberField.includes(item.fieldName)
                                  ? NumberCell
                                  : centerField.includes(item.fieldName)
                                  ? CenterCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell6
                                  : NumberField.includes(item.fieldName)
                                  ? editNumberFooterCell6
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>계약에 대한 코멘트</GridTitle>
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
                      onClick={onSaveClick3}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult3.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="계약관리"
                >
                  <Grid
                    style={{ height: `calc((120vh - 300px)/2)` }}
                    data={process(
                      mainDataResult3.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState3[idGetter3(row)],
                      })),
                      mainDataState3
                    )}
                    {...mainDataState3}
                    onDataStateChange={onMainDataStateChange3}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY3}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange3}
                    fixedScroll={true}
                    total={mainDataResult3.total}
                    skip={page3.skip}
                    take={page3.take}
                    pageable={true}
                    onPageChange={pageChange3}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange3}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    onItemChange={ongrdDetailItemChange2}
                    cellRender={customCellRender2}
                    rowRender={customRowRender2}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn field="rowstatus" title=" " width="50px" />
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList3"]?.map(
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
                                  : customField.includes(item.fieldName)
                                  ? CustomComboBoxCell
                                  : centerField.includes(item.fieldName)
                                  ? CenterCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell3
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
            <GridContainer width={`calc(70% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>계약 상세내용</GridTitle>
                <ButtonContainer>
                  <RadioGroup
                    data={data}
                    value={subFilters.groupgb}
                    onChange={handleChange}
                    style={{ flexDirection: "row" }}
                  />
                  <Button
                    themeColor={"primary"}
                    fillMode="outline"
                    onClick={onDeleteClick3}
                    disabled={subFilters.groupgb == "B" ? true : false}
                  >
                    계약삭제
                  </Button>
                  <Button
                    themeColor={"primary"}
                    fillMode="outline"
                    onClick={onCopyClick}
                    disabled={subFilters.groupgb == "B" ? true : false}
                  >
                    계약변경
                  </Button>
                  <Button
                    onClick={onDeleteClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    disabled={subFilters.groupgb == "B" ? true : false}
                  >
                    변경계약 삭제
                  </Button>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    disabled={subFilters.groupgb == "B" ? true : false}
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult2.data}
                ref={(exporter) => {
                  _export3 = exporter;
                }}
                fileName="계약관리"
              >
                <Grid
                  style={{ height: "162.5vh" }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      contractgb: contractgbListData.find(
                        (items: any) => items.sub_code == row.contractgb
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
                  onSelectionChange={onSelectionChange2}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult2.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange2}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={
                    subFilters.groupgb == "B"
                      ? undefined
                      : ongrdDetailItemChange
                  }
                  cellRender={
                    subFilters.groupgb == "B" ? undefined : customCellRender
                  }
                  rowRender={
                    subFilters.groupgb == "B" ? undefined : customRowRender
                  }
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList2"]?.map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              centerField2.includes(item.fieldName)
                                ? CenterCell
                                : NumberField.includes(item.fieldName)
                                ? NumberCell
                                : customField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
                                ? mainTotalFooterCell2
                                : NumberField2.includes(item.fieldName)
                                ? editNumberFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
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
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={Information.attdatnum}
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

export default SA_A1100_603W;
