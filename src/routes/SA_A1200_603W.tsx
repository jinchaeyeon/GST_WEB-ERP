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
  convertDateToStrWithTime,
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
import { gridList } from "../store/columns/SA_A1200_603W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

import { DatePicker } from "@progress/kendo-react-dateinputs";
import { bytesToBase64 } from "byte-base64";
import { useHistory, useLocation } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import ProjectsWindow from "../components/Windows/CM_A7000W_Project_Window";
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
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";

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
const DateField = ["quodt", "cotracdt", "recdt", "quorev"];
const NumberField = ["passdt", "seq"];

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
    field === "insert_userid" ? "L_sysUserMaster_001" : "";

  const fieldName = field === "insert_userid" ? "user_name" : undefined;
  const fieldValue = field === "insert_userid" ? "user_id" : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
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
const SA_A1200_603W: React.FC = () => {
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

  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;

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

  interface IGradeData {
    materialgb: string;
    assaygbe: string;
    startschgb: string;
    financegb: string;
    amtgb: string;
    addordgb: string;
    relationgb: string;
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
  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);
  const onProejctWndClick = () => {
    setProjectWindowVisible(true);
  };
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent(
    "L_sysUserMaster_001, L_SA001_603, L_BA037, L_SA012_603, L_SA013_603, L_SA014_603, L_SA015_603, L_SA016_603, L_SA017_603, L_SA018_603, R_YESNOALL, L_LEVEL_603",
    setBizComponentData
  );

  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [feasibilityListData, setFeasibilityListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [weightListData, setWeightListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [contractgbListData, setcontractgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [materialtypeListData, setMaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [materialgbListData, setMaterialgbListData] = React.useState([
    { sub_code: "", code_name: "", numref1: 0 },
  ]);
  const [assaygbeListData, setAssaygbeListData] = React.useState([
    { sub_code: "", code_name: "", numref1: 0 },
  ]);
  const [startschgbListData, setStartschgbListData] = React.useState([
    { sub_code: "", code_name: "", numref1: 0 },
  ]);
  const [financegbListData, setFinancegbListData] = React.useState([
    { sub_code: "", code_name: "", numref1: 0 },
  ]);
  const [amtgbListData, setAmtgbListData] = React.useState([
    { sub_code: "", code_name: "", numref1: 0 },
  ]);
  const [addordgbListData, setAddordgbListData] = React.useState([
    { sub_code: "", code_name: "", numref1: 0 },
  ]);
  const [relationgbListData, setRelationgbListData] = React.useState([
    { sub_code: "", code_name: "", numref1: 0 },
  ]);

  useEffect(() => {
    if (bizComponentData.length > 0) {
      const contractgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA037")
      );
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );

      const feasibilityQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_LEVEL_603"
        )
      );

      const weightQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_LEVEL_603"
        )
      );

      const materialtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA001_603"
        )
      );

      //상세정보
      const materialgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA012_603"
        )
      );
      const assaygbeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA013_603"
        )
      );
      const startschgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA014_603"
        )
      );
      const financegbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA015_603"
        )
      );
      const amtgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA016_603"
        )
      );
      const addordgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA017_603"
        )
      );
      const relationgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA018_603"
        )
      );

      fetchQueryData(contractgbQueryStr, setcontractgbListData);
      fetchQueryData(userQueryStr, setUserListData);
      fetchQueryData(materialtypeQueryStr, setMaterialtypeListData);
      fetchQueryData(feasibilityQueryStr, setFeasibilityListData);
      fetchQueryData(weightQueryStr, setWeightListData);

      //상세정보
      fetchQueryData(materialgbQueryStr, setMaterialgbListData);
      fetchQueryData(assaygbeQueryStr, setAssaygbeListData);
      fetchQueryData(startschgbQueryStr, setStartschgbListData);
      fetchQueryData(financegbQueryStr, setFinancegbListData);
      fetchQueryData(amtgbQueryStr, setAmtgbListData);
      fetchQueryData(addordgbQueryStr, setAddordgbListData);
      fetchQueryData(relationgbQueryStr, setRelationgbListData);
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

  // 조회조건
  const [filters, setFilters] = useState({
    orgdiv: "01",
    location: "01",
    quokey: "",
    custnm: "",
    custcd: "",
    custprsnnm: "",
    chkperson: "",
    finyn: "%",
    quodt: new Date(),
    cotracdt: new Date(),
    feasibility: "",
    weight: "",
    stdt: 0,
    endt: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  const [subFilters, setSubFilters] = useState<{ [name: string]: any }>({
    orgdiv: "01",
    location: "01",
    quokey: "",
    custnm: "",
    custcd: "",
    custprsnnm: "",
    chkperson: "",
    finyn: "%",
    quodt: new Date(),
    cotracdt: "",
    find_row_value: "",
    pgNum: 1,
    contractno: "", 
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

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    quonum: "",
    quorev: 0,
    pgNum: 1,
    isSearch: true,
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

  const [Information2, setInformation2] = useState<{ [name: string]: any }>({
    quokey: "",
    addordgb: "",
    amtgb: "",
    assaygbe: "",
    financegb: "",
    grade1: 0,
    grade2: 0,
    grade3: 0,
    grade4: 0,
    grade5: 0,
    grade6: 0,
    grade7: 0,
    materialgb: "",
    orgdiv: "01",
    relationgb: "",
    startschgb: "",
    totgrade1: 0,
    totgrade2: 0,
    level1: "",
    level2: "",
    chkperson: "",
    quorev: "",
    quodt: "",
    passdt: "",
    commentcnt: "",
    seq: "",
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

  const setProjectData = (data: any) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        quokey: data.quokey,
      };
    });
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onRowDoubleClick = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = event.dataItem;
    setSelectedState({ [selectedRowData[DATA_ITEM_KEY]]: true });
    setChecked(true);
    const grade1 =
      materialgbListData.find(
        (items: any) => items.sub_code == selectedRowData.materialgb
      )?.numref1 ?? 0;
    const grade2 =
      assaygbeListData.find(
        (items: any) => items.sub_code == selectedRowData.assaygbe
      )?.numref1 ?? 0;
    const grade3 =
      startschgbListData.find(
        (items: any) => items.sub_code == selectedRowData.startschgb
      )?.numref1 ?? 0;
    const grade4 =
      financegbListData.find(
        (items: any) => items.sub_code == selectedRowData.financegb
      )?.numref1 ?? 0;
    const grade5 =
      amtgbListData.find(
        (items: any) => items.sub_code == selectedRowData.amtgb
      )?.numref1 ?? 0;
    const grade6 =
      addordgbListData.find(
        (items: any) => items.sub_code == selectedRowData.addordgb
      )?.numref1 ?? 0;
    const grade7 =
      relationgbListData.find(
        (items: any) => items.sub_code == selectedRowData.relationgb
      )?.numref1 ?? 0;

    const totgrade1 = grade1 + grade2 + grade3 + grade4;
    const totgrade2 = grade5 + grade6 + grade7;

    const level1 = calculateLevel1(totgrade1);
    const level2 = calculateLevel2(totgrade2);

    setInformation2((prev) => ({
      ...prev,
      quokey: selectedRowData.quokey,
      materialgb: selectedRowData.materialgb,
      assaygbe: selectedRowData.assaygbe,
      startschgb: selectedRowData.startschgb,
      financegb: selectedRowData.financegb,
      amtgb: selectedRowData.amtgb,
      addordgb: selectedRowData.addordgb,
      relationgb: selectedRowData.relationgb,
      quorev: selectedRowData.quorev,
      quodt: selectedRowData.quodt,
      passdt: selectedRowData.passdt,
      seq: selectedRowData.seq,
      grade1: grade1,
      grade2: grade2,
      grade3: grade3,
      grade4: grade4,
      grade5: grade5,
      grade6: grade6,
      grade7: grade7,
      totgrade1: totgrade1,
      totgrade2: totgrade2,
      level1: selectedRowData.feasibility,
      level2: selectedRowData.weight,
      pgNum: 1,
      isSearch: true,
    }));

    setSubFilters((prev) => ({
      ...prev,
      contractno: selectedRowData.contractno,
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

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;
    let grade1 = Information2.grade1;
    let grade2 = Information2.grade2;
    let grade3 = Information2.grade3;
    let grade4 = Information2.grade4;
    let grade5 = Information2.grade5;
    let grade6 = Information2.grade6;
    let grade7 = Information2.grade7;

    if (name === "materialgb") {
      grade1 = value !== "" ? materialgbListData[0].numref1 : 0;
    } else if (name === "assaygbe") {
      grade2 = value !== "" ? assaygbeListData[0].numref1 : 0;
    } else if (name === "startschgb") {
      grade3 = value !== "" ? startschgbListData[0].numref1 : 0;
    } else if (name === "financegb") {
      grade4 = value !== "" ? financegbListData[0].numref1 : 0;
    } else if (name === "amtgb") {
      grade5 = value !== "" ? amtgbListData[0].numref1 : 0;
    } else if (name === "addordgb") {
      grade6 = value !== "" ? addordgbListData[0].numref1 : 0;
    } else if (name === "relationgb") {
      grade7 = value !== "" ? relationgbListData[0].numref1 : 0;
    }

    const totgrade1 = grade1 + grade2 + grade3 + grade4;
    const totgrade2 = grade5 + grade6 + grade7;

    const level1 = calculateLevel1(totgrade1);
    const level2 = calculateLevel2(totgrade2);

    setInformation2((prev) => ({
      ...prev,
      [name]: value,
      grade1,
      grade2,
      grade3,
      grade4,
      totgrade1,
      level1,
      level2,
    }));
  };

  const calculateLevel1 = (totgrade1: number) => {
    if (totgrade1 >= 12) {
      return "상";
    } else if (totgrade1 >= 7) {
      return "중";
    } else if (totgrade1 >= 1) {
      return "하";
    } else {
      return "";
    }
  };

  const calculateLevel2 = (totgrade1: number) => {
    if (totgrade1 >= 7) {
      return "상";
    } else if (totgrade1 >= 4) {
      return "중";
    } else if (totgrade1 >= 1) {
      return "하";
    } else {
      return "";
    }
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;
    setFilters((prev) => ({
      ...prev,
      finyn: value,
    }));
  };

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SA_A1200_603W", setCustomOptionData);

  const history = useHistory();
  const location = useLocation();

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        chkperson: defaultOption.find((item: any) => item.id === "chkperson")
          ?.valueCode,    
            
      }));
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
    if (subFilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters);
      setSubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid2(deepCopiedFilters);
    }
  }, [subFilters]);

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

  function getLevelToString(input: string): string {
    // 입력 문자열에 따라서 적절한 기간을 반환합니다.
    switch (input) {
      case "A":
        return "상";
      case "B":
        return "중";
      case "C":
        return "하";
      default:
        return "";
    }
  }

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;

    setLoading(true);

    //조회프로시저  파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1200_603W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_quonum": filters.quokey,
        "@p_custcd": filters.custcd,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_chkperson": filters.chkperson,
        "@p_finyn": filters.finyn,
        "@p_quodt": convertDateToStr(filters.quodt),
        "@p_cotracdt": convertDateToStr(filters.cotracdt),
        "@p_feasibility": filters.feasibility,
        "@p_weight": filters.weight,
        "@p_stdt": filters.stdt,
        "@p_endt": filters.endt,
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
            : rows.find((row: any) => row.quokey == filters.find_row_value);

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

  function formatDateToDateString(number: number): Date {
    // 숫자를 문자열로 변환 후 8자리로 포맷팅
    const dateString = String(number).padStart(8, "0");

    // 연, 월, 일 추출
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);

    // Date 객체를 생성하여 반환
    return new Date(`${year}-${month}-${day}`);
  }

  //그리드 데이터 조회 - 계약성사관리 코멘트
  const fetchSubGrid2 = async (subFilters: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    const parameters2: Iparameters = {
      procedureName: "P_SA_A1100_603W_Q",
      pageNumber: subFilters.pgNum,
      pageSize: subFilters.pgSize,
      parameters: {
        "@p_work_type": "COMMENT",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_quokey": filters.quokey,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_contractno": subFilters.contractno,
        "@p_project": "",
        "@p_chkperson": filters.chkperson,
        "@p_materialtype": "",
        "@p_extra_field2": "",
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

      setInformation2((prev) => ({
        ...prev,
        commentcnt: totalRowCnt == -1 ? 0 : totalRowCnt,
      }));
      setLoading(false);
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

  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    quonum: "",
    materialgb: "",
    assaygbe: "",
    startschgb: "",
    financegb: "",
    amtgb: "",
    addordgb: "",
    relationgb: "",
  });

  const infopara: Iparameters = {
    procedureName: "P_SA_A1200_603W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": "01",
      "@p_location": "01",
      "@p_quonum": ParaData.quonum,
      "@p_materialgb": ParaData.materialgb,
      "@p_assaygbe": ParaData.assaygbe,
      "@p_startschgb": ParaData.startschgb,
      "@p_financegb": ParaData.financegb,
      "@p_amtgb": ParaData.amtgb,
      "@p_addordgb": ParaData.addordgb,
      "@p_relationgb": ParaData.relationgb,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SA_A1100_603W",
    },
  };

  const onSaveClick = () => {
    // console.log(Information2.quokey);
    setParaData((prev) => ({
      ...prev,
      workType: "N",
      quonum: Information2.quokey,
      materialgb: Information2.materialgb,
    }));
    // const dataItem = mainDataResult.data.filter((item: any) => {
    //   return (
    //     (item.rowstatus === "N" || item.rowstatus === "U") &&
    //     item.rowstatus !== undefined
    //   );
    // });
    // if (dataItem.length === 0 && deletedMainRows2.length === 0) {
    //   setParaData((prev) => ({
    //     ...prev,
    //     workType: "N",
    //   }));
    // } else {
    //   let dataArr: TdataArr = {
    //     rowstatus_s: [],
    //     seq_s: [],
    //     wonamt_s: [],
    //     taxamt_s: [],
    //     amt_s: [],
    //     contractgb_s: [],
    //     quonum_s: [],
    //     quorev_s: [],
    //     quoseq_s: [],
    //   };

    //   dataItem.forEach((item: any, idx: number) => {
    //     const {
    //       rowstatus = "",
    //       amt = "",
    //       seq = "",
    //       wonamt = "",
    //       taxamt = "",
    //       contractgb = "",
    //       quonum = "",
    //       quorev = "",
    //       quoseq = "",
    //     } = item;

    //     dataArr.rowstatus_s.push(rowstatus);
    //     dataArr.seq_s.push(seq);
    //     dataArr.wonamt_s.push(wonamt);
    //     dataArr.taxamt_s.push(taxamt);
    //     dataArr.amt_s.push(amt);
    //     dataArr.contractgb_s.push(contractgb);
    //     dataArr.quonum_s.push(quonum);
    //     dataArr.quorev_s.push(quorev);
    //     dataArr.quoseq_s.push(quoseq);
    //   });

    //   deletedMainRows2.forEach((item: any, idx: number) => {
    //     const {
    //       rowstatus = "",
    //       amt = "",
    //       seq = "",
    //       wonamt = "",
    //       taxamt = "",
    //       contractgb = "",
    //       quonum = "",
    //       quorev = "",
    //       quoseq = "",
    //     } = item;

    //     dataArr.rowstatus_s.push("D");
    //     dataArr.seq_s.push(seq);
    //     dataArr.wonamt_s.push(wonamt);
    //     dataArr.taxamt_s.push(taxamt);
    //     dataArr.amt_s.push(amt);
    //     dataArr.contractgb_s.push(contractgb);
    //     dataArr.quonum_s.push(quonum);
    //     dataArr.quorev_s.push(quorev);
    //     dataArr.quoseq_s.push(quoseq);
    //   });

    //   setParaData((prev) => ({
    //     ...prev,
    //     workType: "N",
    //     rowstatus_s: dataArr.rowstatus_s.join("|"),
    //     seq_s: dataArr.seq_s.join("|"),
    //     wonamt_s: dataArr.wonamt_s.join("|"),
    //     taxamt_s: dataArr.taxamt_s.join("|"),
    //     amt_s: dataArr.amt_s.join("|"),
    //     contractgb_s: dataArr.contractgb_s.join("|"),
    //     quonum_s: dataArr.quonum_s.join("|"),
    //     quorev_s: dataArr.quorev_s.join("|"),
    //     quoseq_s: dataArr.quoseq_s.join("|"),
    //   }));
    // }
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
    if (data.isSuccess === true) {
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
        quonum: "",
        materialgb: "",
        assaygbe: "",
        startschgb: "",
        financegb: "",
        amtgb: "",
        addordgb: "",
        relationgb: "",
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
    if (data.isSuccess === true) {
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
        <Title>계약가능성관리</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="SA_A1200_603W"
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
                  <th>PJT NO.</th>
                  <td>
                    <Input
                      name="quokey"
                      type="text"
                      value={filters.quokey}
                      onChange={InputChange}
                    />
                    <ButtonInInput>
                      <Button
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onProejctWndClick}
                      />
                    </ButtonInInput>
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
                  <th>의뢰자</th>
                  <td>
                    <Input
                      name="custprsnnm"
                      type="text"
                      value={filters.custprsnnm}
                      onChange={InputChange}
                    />
                  </td>
                  <th>영업담당자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="chkperson"
                        value={filters.chkperson}
                        customOptionData={customOptionData}
                        textField="user_name"
                        valueField="user_id"
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>계약여부</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="raduseyn"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>계약목표일</th>
                  <td>
                    <DatePicker
                      name="quodt"
                      value={filters.quodt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                    />
                  </td>
                  <th>의뢰일자</th>
                  <td>
                    <DatePicker
                      name="cotracdt"
                      value={filters.cotracdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                    />
                  </td>
                  <th>경과기간</th>
                  <td>
                    <NumericTextBox
                      name="stdt"
                      width={90}
                      value={filters.stdt}
                      defaultValue={0}
                      onChange={InputChange}
                    />
                    ~
                    <NumericTextBox
                      name="endt"
                      width={90}
                      value={filters.endt}
                      defaultValue={0}
                      onChange={InputChange}
                    />
                  </td>
                  <th>Feasibility</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="feasibility"
                        value={filters.feasibility}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>Weight</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="weight"
                        value={filters.weight}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
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
              fileName="계약가능성관리"
            >
              <Grid
                style={{ height: "65vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    chkperson: userListData.find(
                      (items: any) => items.user_id == row.chkperson
                    )?.user_name,
                    feasibility: getLevelToString(row.feasibility),
                    weight: getLevelToString(row.weight),
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
                          // footerCell={
                          //   item.sortOrder === 0
                          //     ? mainTotalFooterCell
                          //     : NumberField.includes(item.fieldName)
                          //     ? gridSumQtyFooterCell
                          //     : undefined
                          // }
                        />
                      )
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>

        <TabStripTab title="상세정보" disabled={checked == true ? false : true}>
          <ButtonContainer>
            <Button themeColor={"primary"} icon="save" onClick={onSaveClick}>
              저장
            </Button>
          </ButtonContainer>
          <GridContainerWrap style={{ flexDirection: "column" }}>
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>계약가능성관리</GridTitle>
              </GridTitleContainer>
            </GridContainer>
            <FormBoxWrap
              border={true}
              style={{ display: isMobile ? "block" : "flex" }}
            >
              <FormBox width={"50%"}>
                <GridTitleContainer>
                  <GridTitle>Feasibility</GridTitle>
                </GridTitleContainer>
                <tbody>
                  <tr>
                    <th>물질확보여부</th>
                    <td>
                      <BizComponentComboBox
                        name="materialgb"
                        value={Information2.materialgb}
                        bizComponentId="L_SA012_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    </td>
                    <td>
                      <Input
                        name="grade1"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information2.grade1)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>분석법 보유 여부</th>
                    <td>
                      <BizComponentComboBox
                        name="assaygbe"
                        value={Information2.assaygbe}
                        bizComponentId="L_SA013_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    </td>
                    <td>
                      <Input
                        name="grade2"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information2.grade2)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>시작예정</th>
                    <td>
                      <BizComponentComboBox
                        name="startschgb"
                        value={Information2.startschgb}
                        bizComponentId="L_SA014_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    </td>
                    <td>
                      <Input
                        name="grade3"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information2.grade3)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>재무/투자현황</th>
                    <td>
                      <BizComponentComboBox
                        name="financegb"
                        value={Information2.financegb}
                        bizComponentId="L_SA015_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    </td>
                    <td>
                      <Input
                        name="grade4"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information2.grade4)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>합계</th>
                    <td colSpan={2}>
                      <Input
                        name="totgrade1"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information2.totgrade1)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>결과</th>
                    <td colSpan={2}>
                      <Input
                        name="level1"
                        type="text"
                        style={{
                          textAlign: "center",
                        }}
                        value={Information2.level1}
                        className="readonly"
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
              <FormBox style={{ width: "100%" }}>
                <GridTitleContainer>
                  <GridTitle>Weight</GridTitle>
                </GridTitleContainer>
                <tbody>
                  <tr>
                    <th>금액</th>
                    <td>
                      <BizComponentComboBox
                        name="amtgb"
                        value={Information2.amtgb}
                        bizComponentId="L_SA016_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    </td>
                    <td>
                      <Input
                        name="grade5"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information2.grade5)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>추가수주</th>
                    <td>
                      <BizComponentComboBox
                        name="addordgb"
                        value={Information2.addordgb}
                        bizComponentId="L_SA017_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    </td>
                    <td>
                      <Input
                        name="grade6"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information2.grade6)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>BTT관계사 확장</th>
                    <td>
                      <BizComponentComboBox
                        name="relationgb"
                        value={Information2.relationgb}
                        bizComponentId="L_SA018_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    </td>
                    <td>
                      <Input
                        name="grade7"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information2.grade7)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>합계</th>
                    <td colSpan={2}>
                      <Input
                        name="totgrade2"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information2.totgrade2)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>결과</th>
                    <td colSpan={2}>
                      <Input
                        name="level2"
                        type="text"
                        style={{
                          textAlign: "center",
                        }}
                        value={Information2.level2}
                        className="readonly"
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>

            <GridTitleContainer>
              <GridTitle>계약성사관리</GridTitle>
            </GridTitleContainer>
            <FormBoxWrap
              border={true}
              style={{ display: isMobile ? "block" : "flex" }}
            >
              <GridContainer style={{ flexDirection: "column" }}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ textAlign: "right"}}>견적차수</th>
                      <td>
                        <Input
                          name="quorev"
                          type="text"
                          style={{
                            textAlign: "center",
                          }}
                          value={Information2.quorev}
                          className="readonly"
                        />
                      </td>
                      <th style={{ textAlign: "right"}}>견적제출일</th>
                      <td>
                        <DatePicker
                          name="quodt"
                          value={formatDateToDateString(Information2.quodt)}
                          format="yyyy-MM-dd"
                          className="readonly"
                        />
                      </td>
                      <th style={{ textAlign: "right"}}>활동차수</th>
                      <td>
                        <Input
                          name="commnetcnt"
                          type="text"
                          style={{
                            textAlign: "center",
                          }}
                          value={Information2.commentcnt}
                          className="readonly"
                        />
                      </td>
                      <th style={{ textAlign: "right"}}>계약목표일</th>
                      <td>
                        <DatePicker
                          name="quodt"
                          value={formatDateToDateString(Information2.quodt)}
                          format="yyyy-MM-dd"
                          placeholder=""
                          className="readonly"
                        />
                      </td>
                      <th style={{ textAlign: "right"}}>경과기간</th>
                      <td>
                        <Input
                          name="passdt"
                          type="text"
                          style={{
                            textAlign: "center",
                          }}
                          value={Information2.passdt}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
                <GridContainer>
                  <Grid
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
                </GridContainer>
              </GridContainer>
            </FormBoxWrap>
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
      {projectWindowVisible && (
        <ProjectsWindow
          setVisible={setProjectWindowVisible}
          setData={setProjectData}
          modal={true}
          pathname="SA_A1200W_603"
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

export default SA_A1200_603W;
