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
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
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
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
  useSysMessage,
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
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { heightstate, isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/MA_A3500W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
const DATA_ITEM_KEY5 = "num";
const dateField = ["purdt"];
const numberField = [
  "purqty",
  "amt",
  "wonamt",
  "taxamt",
  "totamt",
  "qty",
  "unitwgt",
  "wgt",
  "unp",
  "now_qty",
  "doqty",
];
const numberField2 = ["amt", "wonamt", "taxamt", "totamt"];
const numberField3 = ["now_qty"];
const numberField4 = ["doqty"];
const requiredField = ["doqty"];
type TdataArr = {
  rowstatus_s: string[];
  recdt_s: string[];
  seq1_s: string[];
  seq2_s: string[];
  itemcd_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  lotnum_s: string[];
  remark_s: string[];
  itemacnt_s: string[];
  person_s: string[];
  custprsncd_s: string[];
  load_place_s: string[];
  orglot_s: string[];
  heatno_s: string[];
};
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
let targetRowIndex4: null | number = null;
let temp = 0;
let deletedMainRows: object[] = [];
var index = 0;
var index2 = 0;

const MA_A3500W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  let deviceWidth = window.innerWidth;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);

  let isMobile = deviceWidth <= 1200;

  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  UseParaPc(setPc);
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [swiper2, setSwiper2] = useState<SwiperCore>();
  const [isVisibleDetail, setIsVisableDetail] = useState(false);
  const [isVisibleDetail2, setIsVisableDetail2] = useState(false);
  const [isVisibleDetail3, setIsVisableDetail3] = useState(false);

  var height = 0;
  const [height2, setHeight2] = useState(0);
  const [height3, setHeight3] = useState(0);
  const [height4, setHeight4] = useState(0);
  var height5 = 0;

  var container = document.querySelector(".ButtonContainer");
  var container2 = document.querySelector(".ButtonContainer2");
  var container3 = document.querySelector(".ButtonContainer3");
  var container4 = document.querySelector(".ButtonContainer4");
  var container5 = document.querySelector(".ButtonContainer5");
  useEffect(() => {
    if (container?.clientHeight != undefined) {
      height = container == undefined ? 0 : container.clientHeight;
    }
    if (container2?.clientHeight != undefined) {
      setHeight2(container2 == undefined ? 0 : container2.clientHeight);
    }
    if (container3?.clientHeight != undefined) {
      setHeight3(container3 == undefined ? 0 : container3.clientHeight);
    }
    if (container4?.clientHeight != undefined) {
      setHeight4(container4 == undefined ? 0 : container4.clientHeight);
    }
    if (container5?.clientHeight != undefined) {
      height5 = container5 == undefined ? 0 : container5.clientHeight;
    }
  }, []);

  const updateHeight = () => {
    setTimeout(() => {
      if (container2?.clientHeight != undefined) {
        setHeight2(container2 == undefined ? 0 : container2.clientHeight);
      }
      if (container3?.clientHeight != undefined) {
        setHeight3(container3 == undefined ? 0 : container3.clientHeight);
      }
      if (container4?.clientHeight != undefined) {
        setHeight4(container4 == undefined ? 0 : container4.clientHeight);
      }
    }, 200);
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
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

    setInfomation((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setInfomation3((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
    setPage4(initialPageState);
    setInfomation2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setInfomation3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [tabSelected, setTabSelected] = React.useState(0);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("MA_A3500W", setMessagesData);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("MA_A3500W", setCustomOptionData);

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    if (e.selected == 0) {
      setInfomation((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
    } else {
      setInfomation2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
    }
  };

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
      }));
      setInfomation((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setInfomation2((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_SYS012, L_MA036,L_SA002,L_BA005,L_BA029,L_BA002,L_dptcd_001,L_BA061,L_BA015,L_finyn",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [purstsListData, setPurstsListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [ordstsListData, setOrdstsListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [doexdivListData, setDoexdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxdivListData, setTaxdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [departmentsListData, setDepartmentsListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [finynListData, setFinynListData] = useState([{ code: "", name: "" }]);
  const [outpgmListData, setOutpgmListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const outpgmQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_SYS012")
      );
      const purstsQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_MA036")
      );
      const ordstsQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_SA002")
      );
      const doexdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA005")
      );
      const taxdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA029")
      );
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA002")
      );
      const departmentQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_dptcd_001"
        )
      );
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA061")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA015")
      );
      const finynQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_finyn")
      );

      fetchQuery(outpgmQueryStr, setOutpgmListData);
      fetchQuery(purstsQueryStr, setPurstsListData);
      fetchQuery(ordstsQueryStr, setOrdstsListData);
      fetchQuery(doexdivQueryStr, setDoexdivListData);
      fetchQuery(taxdivQueryStr, setTaxdivListData);
      fetchQuery(locationQueryStr, setLocationListData);
      fetchQuery(departmentQueryStr, setDepartmentsListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(finynQueryStr, setFinynListData);
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [subDataState2, setSubDataState2] = useState<State>({
    sort: [],
  });
  const [BOMDataState, setBOMDataState] = useState<State>({
    sort: [],
  });
  const [BOMDataState2, setBOMDataState2] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [tempState3, setTempState3] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );
  const [subDataResult2, setSubDataResult2] = useState<DataResult>(
    process([], subDataState2)
  );
  const [BOMDataResult, setBOMDataResult] = useState<DataResult>(
    process([], BOMDataState)
  );
  const [BOMDataResult2, setBOMDataResult2] = useState<DataResult>(
    process([], BOMDataState2)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [tempResult3, setTempResult3] = useState<DataResult>(
    process([], tempState3)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedSubState, setSelectedSubState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedSubState2, setSelectedSubState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedBOMState, setSelectedBOMState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedBOMState2, setSelectedBOMState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    if (value !== null)
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      setInfomation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const InputChange2 = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      setInfomation2((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const InputChange3 = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      setInfomation3((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const InputChange4 = (e: any) => {
    const newData = BOMDataResult2.data.map((item) =>
      item.chk == true
        ? {
            ...item,
            doqty:
              item.now_qty < infomation3.doqty
                ? item.now_qty
                : infomation3.doqty,
          }
        : {
            ...item,
          }
    );

    setBOMDataResult2((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
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

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: !values,
        [EDIT_FIELD]: props.field,
      }));
      setValues(!values);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = subDataResult.data.map((item) => ({
        ...item,
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setSubDataResult((prev) => {
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

  const [values3, setValues3] = React.useState<boolean>(false);
  const CustomCheckBoxCell3 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = BOMDataResult2.data.map((item) => ({
        ...item,
        chk: !values3,
        [EDIT_FIELD]: props.field,
      }));
      setValues3(!values3);
      setBOMDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values3} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: "",
    frdt: new Date(),
    todt: new Date(),
    itemcd: "",
    itemnm: "",
    insiz: "",
    lotnum: "",
    outkey: "",
    person: "",
    remark: "",
    dptcd: "",
    ordnum: "",
    ordseq: 0,
    itemacnt: "",
    reckey_s: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [infomation, setInfomation] = useState({
    pgSize: PAGE_SIZE,
    workType: "STOCK",
    itemcd: "",
    itemnm: "",
    itemacnt: "",
    lotnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [infomation2, setInfomation2] = useState({
    pgSize: PAGE_SIZE,
    workType: "BOMITEM",
    itemcd: "",
    itemnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [infomation3, setInfomation3] = useState({
    pgSize: PAGE_SIZE,
    workType: "TREESTOCK",
    itemcd: "",
    itemnm: "",
    doqty: 0,
    lotnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_A3500W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "SA210T",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_lotnum": filters.lotnum,
        "@p_outkey": filters.outkey,
        "@p_person": filters.person,
        "@p_remark": filters.remark,
        "@p_dptcd": filters.dptcd,
        "@p_ordnum": filters.ordnum,
        "@p_ordseq": filters.ordseq,
        "@p_itemacnt": filters.itemacnt,
        "@p_reckey_s": filters.reckey_s,
        "@p_find_row_value": filters.find_row_value,
        "@p_company_code": companyCode,
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
            (row: any) => row.recdt + "-" + row.seq1 == filters.find_row_value
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
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.recdt + "-" + row.seq1 == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
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

  const fetchSubGrid = async (infomation: any) => {
    let data: any;
    setLoading(true);
    const stockparameters: Iparameters = {
      procedureName: "P_MA_A3500W_Q",
      pageNumber: infomation.pgNum,
      pageSize: infomation.pgSize,
      parameters: {
        "@p_work_type": infomation.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": infomation.itemcd,
        "@p_itemnm": infomation.itemnm,
        "@p_insiz": filters.insiz,
        "@p_lotnum": infomation.lotnum,
        "@p_outkey": filters.outkey,
        "@p_person": filters.person,
        "@p_remark": filters.remark,
        "@p_dptcd": filters.dptcd,
        "@p_ordnum": filters.ordnum,
        "@p_ordseq": filters.ordseq,
        "@p_itemacnt": infomation.itemacnt,
        "@p_reckey_s": filters.reckey_s,
        "@p_find_row_value": infomation.find_row_value,
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", stockparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setSubDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          infomation.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY2] == infomation.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedSubState({ [selectedRow[DATA_ITEM_KEY2]]: true });
        } else {
          setSelectedSubState({ [rows[0][DATA_ITEM_KEY2]]: true });
        }
      }
    }
    setInfomation((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchSubGrid2 = async (infomation2: any) => {
    let data: any;
    setLoading(true);
    const BOMparameters: Iparameters = {
      procedureName: "P_MA_A3500W_Q",
      pageNumber: infomation2.pgNum,
      pageSize: infomation2.pgSize,
      parameters: {
        "@p_work_type": infomation2.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": infomation2.itemcd,
        "@p_itemnm": infomation2.itemnm,
        "@p_insiz": filters.insiz,
        "@p_lotnum": filters.lotnum,
        "@p_outkey": filters.outkey,
        "@p_person": filters.person,
        "@p_remark": filters.remark,
        "@p_dptcd": filters.dptcd,
        "@p_ordnum": filters.ordnum,
        "@p_ordseq": filters.ordseq,
        "@p_itemacnt": filters.itemacnt,
        "@p_reckey_s": filters.reckey_s,
        "@p_find_row_value": infomation2.find_row_value,
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", BOMparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setBOMDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          infomation2.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY3] == infomation2.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedBOMState({ [selectedRow[DATA_ITEM_KEY3]]: true });
          setInfomation3((prev) => ({
            ...prev,
            itemcd: selectedRow.itemcd,
            itemnm: selectedRow.itemnm,
            doqty: 0,
            isSearch: true,
            pgNum: 1,
            find_row_value: "",
          }));
        } else {
          setSelectedBOMState({ [rows[0][DATA_ITEM_KEY3]]: true });
          setInfomation3((prev) => ({
            ...prev,
            itemcd: rows[0].itemcd,
            itemnm: rows[0].itemnm,
            doqty: 0,
            isSearch: true,
            pgNum: 1,
            find_row_value: "",
          }));
        }
      } else {
        setBOMDataResult2(process([], BOMDataState2));
      }
    }
    setInfomation2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchSubGrid3 = async (infomation3: any) => {
    let data: any;
    setLoading(true);
    const BOMparameters2: Iparameters = {
      procedureName: "P_MA_A3500W_Q",
      pageNumber: infomation3.pgNum,
      pageSize: infomation3.pgSize,
      parameters: {
        "@p_work_type": infomation3.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": infomation3.itemcd,
        "@p_itemnm": "",
        "@p_insiz": filters.insiz,
        "@p_lotnum": infomation3.lotnum,
        "@p_outkey": filters.outkey,
        "@p_person": filters.person,
        "@p_remark": filters.remark,
        "@p_dptcd": filters.dptcd,
        "@p_ordnum": filters.ordnum,
        "@p_ordseq": filters.ordseq,
        "@p_itemacnt": filters.itemacnt,
        "@p_reckey_s": filters.reckey_s,
        "@p_find_row_value": infomation3.find_row_value,
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", BOMparameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setBOMDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          infomation3.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY4] == infomation3.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedBOMState2({ [selectedRow[DATA_ITEM_KEY4]]: true });
        } else {
          setSelectedBOMState2({ [rows[0][DATA_ITEM_KEY4]]: true });
        }
      }
    }
    setInfomation3((prev) => ({
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
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (infomation.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(infomation);
      setInfomation((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid(deepCopiedFilters);
    }
  }, [infomation]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (infomation2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(infomation2);
      setInfomation2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid2(deepCopiedFilters);
    }
  }, [infomation2]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (infomation3.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(infomation3);
      setInfomation3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid3(deepCopiedFilters);
    }
  }, [infomation3]);

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
  }, [subDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [BOMDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex4 !== null && gridRef4.current) {
      gridRef4.current.scrollIntoView({ rowIndex: targetRowIndex4 });
      targetRowIndex4 = null;
    }
  }, [BOMDataResult2]);

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    recdt: "",
    seq1: "",
    seq2: "",
  });

  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    const selectRows = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );
    if (selectRows != undefined) {
      let dataArr: TdataArr = {
        rowstatus_s: [],
        recdt_s: [],
        seq1_s: [],
        seq2_s: [],
        itemcd_s: [],
        qty_s: [],
        qtyunit_s: [],
        lotnum_s: [],
        remark_s: [],
        itemacnt_s: [],
        person_s: [],
        custprsncd_s: [],
        load_place_s: [],
        orglot_s: [],
        heatno_s: [],
      };

      selectRows.forEach((item: any, idx: number) => {
        const { recdt = "", seq1 = "", seq2 = "" } = item;
        dataArr.recdt_s.push(recdt);
        dataArr.seq1_s.push(seq1);
        dataArr.seq2_s.push(seq2);
      });

      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        recdt: dataArr.recdt_s.join("|"),
        seq1: dataArr.seq1_s.join("|"),
        seq2: dataArr.seq2_s.join("|"),
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
    setSubDataResult2(process([], subDataState2));
    setBOMDataResult(process([], BOMDataState));
    setBOMDataResult2(process([], BOMDataState2));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);

    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSubSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedSubState,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedSubState(newSelectedState);
  };

  const onSubSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedSubState2,
      dataItemKey: DATA_ITEM_KEY5,
    });
    setSelectedSubState2(newSelectedState);
  };

  const onBOMSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedBOMState,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedBOMState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setInfomation3((prev) => ({
      ...prev,
      itemcd: selectedRowData.itemcd,
      itemnm: selectedRowData.itemnm,
      doqty: 0,
      isSearch: true,
      pgNum: 1,
    }));

    if (swiper2 && isMobile) {
      swiper2.slideTo(1);
    }
  };

  const onBOMSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedBOMState2,
      dataItemKey: DATA_ITEM_KEY4,
    });
    setSelectedBOMState2(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  let _export5: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridTwo = _export2.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[2] = optionsGridThree.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "품목참조";
        optionsGridOne.sheets[2].title = "처리정보";
        _export.save(optionsGridOne);
      } else if (tabSelected == 1) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridFour = _export4.workbookOptions();
        const optionsGridFive = _export5.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridFour.sheets[0];
        optionsGridOne.sheets[2] = optionsGridFive.sheets[0];
        optionsGridOne.sheets[3] = optionsGridThree.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "품목참조";
        optionsGridOne.sheets[2].title = "품목참조상세";
        optionsGridOne.sheets[3].title = "처리정보";
        _export.save(optionsGridOne);
      }
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };
  const onSubDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setSubDataState2(event.dataState);
  };

  const onBOMDataStateChange = (event: GridDataStateChangeEvent) => {
    setBOMDataState(event.dataState);
  };

  const onBOMDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setBOMDataState2(event.dataState);
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

  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {subDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const subTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = subDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {subDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const BOMTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = BOMDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {BOMDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const BOMTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = BOMDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {BOMDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    subDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    BOMDataResult2.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const editNumberFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    subDataResult2.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" ||
              item[props.field] == undefined ||
              item[props.field] == undefined
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

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    subDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" ||
              item[props.field] == undefined ||
              item[props.field] == undefined
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

  const onAddClick = () => {
    let valid = 0;

    const selectRows = subDataResult.data.filter(
      (item: any) => item.chk == true
    );
    selectRows.map((item) => {
      if (item.doqty == 0) {
        valid = 1;
      } else if (item.doqty > item.now_qty) {
        valid = 2;
      }
    });

    if (valid == 0) {
      const newData = subDataResult.data.map((item) =>
        item.chk == true
          ? {
              ...item,
              now_qty: item.now_qty - item.doqty,
              doqty: 0,
              chk: false,
            }
          : {
              ...item,
            }
      );

      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });

      subDataResult2.data.map((item) => {
        if (item.num > temp) {
          temp = item.num;
        }
      });

      selectRows.map((selectRow: any) => {
        const newDataItem = {
          [DATA_ITEM_KEY5]: ++temp,
          boxqty: selectRow.boxqty,
          doqty: selectRow.doqty,
          insiz: selectRow.insiz,
          itemacnt: selectRow.itemacnt,
          itemcd: selectRow.itemcd,
          itemnm: selectRow.itemnm,
          itemno: selectRow.itemno,
          len: selectRow.len,
          location: selectRow.location,
          lotnum: selectRow.lotnum,
          now_qty: selectRow.now_qty,
          orgdiv: selectRow.orgdiv,
          poregnum: selectRow.poregnum,
          qtyunit: selectRow.qtyunit,
          stritem: selectRow.stritem,
          wgtunit: selectRow.wgtunit,
          rowstatus: "N",
        };

        setSubDataResult2((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
        setSelectedSubState2({ [newDataItem[DATA_ITEM_KEY5]]: true });
      });
      if (swiper && isMobile) {
        swiper.slideTo(2);
      }
    } else if (valid == 1) {
      alert("불출량을 입력해주세요.");
    } else if (valid == 2) {
      alert("불출량이 재고량을 초과하였습니다");
    }
  };

  const onAddClick2 = () => {
    let valid = true;
    let seq = BOMDataResult2.total + 1;

    const selectRows = BOMDataResult2.data.filter(
      (item: any) => item.chk == true
    );
    selectRows.map((item) => {
      if (item.doqty == 0 || item.doqty > item.now_qty) {
        valid = false;
      }
    });

    if (valid == true) {
      const newData = BOMDataResult2.data.map((item) =>
        item.chk == true
          ? {
              ...item,
              now_qty: item.now_qty - item.doqty,
              doqty: 0,
              chk: false,
            }
          : {
              ...item,
            }
      );

      setBOMDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });

      subDataResult2.data.map((item) => {
        if (item.num > temp) {
          temp = item.num;
        }
      });

      selectRows.map((selectRow: any) => {
        const newDataItem = {
          [DATA_ITEM_KEY5]: ++temp,
          boxqty: selectRow.boxqty,
          doqty: selectRow.doqty,
          insiz: selectRow.insiz,
          itemacnt: selectRow.itemacnt,
          itemcd: selectRow.itemcd,
          itemnm: selectRow.itemnm,
          itemno: selectRow.itemno,
          len: selectRow.len,
          location: selectRow.location,
          lotnum: selectRow.lotnum,
          now_qty: selectRow.now_qty,
          orgdiv: selectRow.orgdiv,
          poregnum: selectRow.poregnum,
          qtyunit: selectRow.qtyunit,
          stritem: selectRow.stritem,
          wgtunit: selectRow.wgtunit,
          rowstatus: "N",
        };

        setSubDataResult2((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
        setSelectedSubState2({ [newDataItem[DATA_ITEM_KEY5]]: true });
      });

      if (swiper && isMobile) {
        swiper.slideTo(2);
      }
    } else {
      alert("불출량을 입력해주세요.");
    }
  };

  useEffect(() => {
    if (paraDataDeleted.work_type == "D") fetchToDelete();
  }, [paraDataDeleted]);

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setValues(false);
      setValues2(false);
      setValues3(false);
      const isLastDataDeleted =
        mainDataResult.data.length == 1 && filters.pgNum > 0;
      const findRowIndex = mainDataResult.data.findIndex(
        (row: any) =>
          row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      );

      if (isLastDataDeleted) {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });

        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: isLastDataDeleted
            ? prev.pgNum != 1
              ? prev.pgNum - 1
              : prev.pgNum
            : prev.pgNum,
          isSearch: true,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          find_row_value:
            mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1].recdt +
            "-" +
            mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1].seq1,
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      }
      setTabSelected(0);
      setInfomation((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.recdt = "";
    paraDataDeleted.seq1 = "";
    paraDataDeleted.seq2 = "";
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    const datas = subDataResult2.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedSubState2)[0]
    )[0];

    if (tabSelected == 0) {
      const newDatas = subDataResult.data.map((item) =>
        datas.lotnum == item.lotnum
          ? {
              ...item,
              now_qty: item.now_qty + datas.doqty,
            }
          : {
              ...item,
            }
      );

      setSubDataResult((prev) => {
        return {
          data: newDatas,
          total: prev.total,
        };
      });
    } else {
      const newDatas = BOMDataResult2.data.map((item) =>
        datas.lotnum == item.lotnum
          ? {
              ...item,
              now_qty: item.now_qty + datas.doqty,
            }
          : {
              ...item,
            }
      );

      setBOMDataResult2((prev) => {
        return {
          data: newDatas,
          total: prev.total,
        };
      });
    }

    let newData: any[] = [];
    let Object3: any[] = [];
    let Object2: any[] = [];
    let data;
    subDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedSubState2[item[DATA_ITEM_KEY5]]) {
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
      data = subDataResult2.data[Math.min(...Object2)];
    } else {
      data = subDataResult2.data[Math.min(...Object3) - 1];
    }

    setSubDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object3.length,
    }));
    setSelectedSubState2({
      [data != undefined ? data[DATA_ITEM_KEY5] : newData[0]]: true,
    });
  };

  interface IItemData {
    itemcd: string;
    itemno: string;
    itemnm: string;
    insiz: string;
    model: string;
    itemacnt: string;
    itemacntnm: string;
    bnatur: string;
    spec: string;
    invunit: string;
    invunitnm: string;
    unitwgt: string;
    wgtunit: string;
    wgtunitnm: string;
    maker: string;
    dwgno: string;
    remark: string;
    itemlvl1: string;
    itemlvl2: string;
    itemlvl3: string;
    extra_field1: string;
    extra_field2: string;
    extra_field7: string;
    extra_field6: string;
    extra_field8: string;
    packingsiz: string;
    unitqty: string;
    color: string;
    gubun: string;
    qcyn: string;
    outside: string;
    itemthick: string;
    itemlvl4: string;
    itemlvl5: string;
    custitemnm: string;
  }

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onSubSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onSubSortChange2 = (e: any) => {
    setSubDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onBOMSortChange = (e: any) => {
    setBOMDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onBOMSortChange2 = (e: any) => {
    setBOMDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A3500W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A3500W_001");
      } else if (
        filters.location == null ||
        filters.location == "" ||
        filters.location == undefined
      ) {
        throw findMessage(messagesData, "MA_A3500W_002");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState); // 페이지 초기화
        setPage3(initialPageState); // 페이지 초기화
        setPage4(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        if (tabSelected == 0) {
          setInfomation((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            find_row_value: "",
          }));
        } else {
          setInfomation2((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            find_row_value: "",
          }));
        }
      }
    } catch (e) {
      alert(e);
    }
    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
  };

  const onSearch2 = () => {
    setPage2(initialPageState);
    setInfomation((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
      find_row_value: "",
    }));
  };
  const onSearch3 = () => {
    setPage3(initialPageState);
    setPage4(initialPageState);
    setInfomation2((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
      find_row_value: "",
    }));
  };
  const onSearch4 = () => {
    setPage4(initialPageState);
    setInfomation3((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
      find_row_value: "",
    }));
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    outdt: new Date(),
    dptcd: "",
    person: "admin",
    rowstatus_s: "",
    recdt_s: "",
    seq1_s: "",
    seq2_s: "",
    itemcd_s: "",
    qty_s: "",
    qtyunit_s: "",
    lotnum_s: "",
    remark_s: "",
    itemacnt_s: "",
    person_s: "",
    custprsncd_s: "",
    load_place_s: "",
    orglot_s: "",
    heatno_s: "",
  });

  const setCopyData = () => {
    let dataArr: TdataArr = {
      rowstatus_s: [],
      recdt_s: [],
      seq1_s: [],
      seq2_s: [],
      itemcd_s: [],
      qty_s: [],
      qtyunit_s: [],
      lotnum_s: [],
      remark_s: [],
      itemacnt_s: [],
      person_s: [],
      custprsncd_s: [],
      load_place_s: [],
      orglot_s: [],
      heatno_s: [],
    };

    subDataResult2.data.forEach((item: any, idx: number) => {
      const {
        itemacnt = "",
        itemcd = "",
        rowstatus = "",
        lotnum = "",
        doqty = "",
        seq1 = "",
        seq2 = "",
        qtyunit = "",
        person = "",
        remark = "",
        custprsncd = "",
        load_place = "",
        heatno = "",
      } = item;
      dataArr.rowstatus_s.push("N");
      dataArr.recdt_s.push("");
      dataArr.seq1_s.push("0");
      dataArr.seq2_s.push("0");
      dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
      dataArr.qty_s.push(doqty == "" ? 0 : doqty);
      dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
      dataArr.lotnum_s.push(lotnum == undefined ? "" : lotnum);
      dataArr.remark_s.push(remark == undefined ? "" : remark);
      dataArr.itemacnt_s.push(itemacnt == undefined ? "" : itemacnt);
      dataArr.person_s.push(userId);
      dataArr.person_s.push(userId);
      dataArr.custprsncd_s.push(custprsncd == undefined ? "" : custprsncd);
      dataArr.load_place_s.push(load_place == undefined ? "" : load_place);
      dataArr.heatno_s.push("");
      dataArr.orglot_s.push("");
    });
    setParaData((prev) => ({
      ...prev,
      workType: "N",
      location: filters.location,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      recdt_s: dataArr.recdt_s.join("|"),
      seq1_s: dataArr.seq1_s.join("|"),
      seq2_s: dataArr.seq2_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      qty_s: dataArr.qty_s.join("|"),
      qtyunit_s: dataArr.qtyunit_s.join("|"),
      lotnum_s: dataArr.lotnum_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      itemacnt_s: dataArr.itemacnt_s.join("|"),
      person_s: dataArr.person_s.join("|"),
      custprsncd_s: dataArr.custprsncd_s.join("|"),
      load_place_s: dataArr.load_place_s.join("|"),
      orglot_s: dataArr.orglot_s.join("|"),
      heatno_s: dataArr.heatno_s.join("|"),
    }));
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_MA_A3500W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": ParaData.location,
      "@p_outdt": convertDateToStr(ParaData.outdt),
      "@p_dptcd": ParaData.dptcd,
      "@p_person": ParaData.person,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_recdt_s": paraDataDeleted.recdt,
      "@p_seq1_s": paraDataDeleted.seq1,
      "@p_seq2_s": paraDataDeleted.seq2,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_lotnum_s": ParaData.lotnum_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_person_s": ParaData.person_s,
      "@p_custprsncd_s": ParaData.custprsncd_s,
      "@p_load_place_s": ParaData.load_place_s,
      "@p_orglot_s": ParaData.orglot_s,
      "@p_heatno_s": ParaData.heatno_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_MA_A3500W",
    },
  };

  const para: Iparameters = {
    procedureName: "P_MA_A3500W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": ParaData.location,
      "@p_outdt": convertDateToStr(ParaData.outdt),
      "@p_dptcd": ParaData.dptcd,
      "@p_person": ParaData.person,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_recdt_s": ParaData.recdt_s,
      "@p_seq1_s": ParaData.seq1_s,
      "@p_seq2_s": ParaData.seq2_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_lotnum_s": ParaData.lotnum_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_person_s": ParaData.person_s,
      "@p_custprsncd_s": ParaData.custprsncd_s,
      "@p_load_place_s": ParaData.load_place_s,
      "@p_orglot_s": ParaData.orglot_s,
      "@p_heatno_s": ParaData.heatno_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_MA_A3500W",
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

    if (data.isSuccess == true) {
      setValues(false);
      setValues2(false);
      setValues3(false);
      resetAllGrid();
      deletedMainRows = [];
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
        find_row_value: data.returnString,
      }));
      setTabSelected(0);
      setInfomation((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s.length != 0) {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onSubItemChange = (event: GridItemChangeEvent) => {
    setSubDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult,
      setSubDataResult,
      DATA_ITEM_KEY
    );
  };

  const onItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const onBOMItemChange = (event: GridItemChangeEvent) => {
    setBOMDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      BOMDataResult2,
      setBOMDataResult2,
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

  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
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
    if (field == "doqty" || field == "chk") {
      const newData = subDataResult.data.map((item) =>
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

      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });

      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev: { total: any }) => {
        return {
          data: subDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field == "doqty" || field == "chk") {
      const newData = BOMDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY4] == dataItem[DATA_ITEM_KEY4]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });

      setBOMDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev: { total: any }) => {
        return {
          data: BOMDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit3 = (dataItem: any, field: string) => {
    if (field == "chk") {
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
      setTempResult3((prev) => {
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
      setTempResult3((prev) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != subDataResult.data) {
      const newData = subDataResult.data.map((item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedSubState)[0]
          ? {
              ...item,
              chk:
                typeof item.chk == "boolean"
                  ? item.chk
                  : item.chk == "Y"
                  ? true
                  : false,
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
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = subDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != BOMDataResult2.data) {
      const newData = BOMDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedBOMState2)[0]
          ? {
              ...item,
              chk:
                typeof item.chk == "boolean"
                  ? item.chk
                  : item.chk == "Y"
                  ? true
                  : false,
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
      setBOMDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = BOMDataResult2.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setBOMDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit3 = () => {
    if (tempResult3.data != mainDataResult.data) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          ? {
              ...item,
              chk:
                typeof item.chk == "boolean"
                  ? item.chk
                  : item.chk == "Y"
                  ? true
                  : false,
              [EDIT_FIELD]: undefined,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setTempResult3((prev) => {
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
      setTempResult3((prev) => {
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

  return (
    <>
      <TitleContainer>
        <Title>자재불출</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="MA_A3500W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>불출일자</th>
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
              <th>불출번호</th>
              <td>
                <Input
                  name="outkey"
                  type="text"
                  value={filters.outkey}
                  onChange={filterInputChange}
                />
              </td>
              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onItemWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>품목명</th>
              <td>
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>비고</th>
              <td>
                <Input
                  name="remark"
                  type="text"
                  value={filters.remark}
                  onChange={filterInputChange}
                />
              </td>
              <th>LOT NO</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>
              <th>담당자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="person"
                    value={filters.person}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
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
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      {isMobile ? (
        <>
          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
            onActiveIndexChange={(swiper) => {
              index = swiper.activeIndex;
            }}
          >
            <SwiperSlide key={0}>
              <GridContainer
                style={{ width: `${deviceWidth - 30}px`, overflow: "auto" }}
              >
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>요약정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onDeleteClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="delete"
                    >
                      삭제
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="자재불출"
                >
                  <Grid
                    style={{ height: deviceHeight - height }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        itemacnt: itemacntListData.find(
                          (item: any) => item.sub_code == row.itemacnt
                        )?.code_name,
                        qtyunit: qtyunitListData.find(
                          (item: any) => item.sub_code == row.qtyunit
                        )?.code_name,
                        outpgm: outpgmListData.find(
                          (item: any) => item.sub_code == row.outpgm
                        )?.code_name,
                        [SELECTED_FIELD]: selectedState[idGetter(row)],
                        chk: row.chk == "" ? false : row.chk,
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
                    onItemChange={onItemChange}
                    cellRender={customCellRender3}
                    rowRender={customRowRender3}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn
                      field="chk"
                      title=" "
                      width="45px"
                      headerCell={CustomCheckBoxCell}
                      cell={CheckBoxCell}
                    />
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList"]?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : dateField.includes(item.fieldName)
                                  ? DateCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell
                                  : numberField2.includes(item.fieldName)
                                  ? gridSumQtyFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer
                style={{ width: `${deviceWidth - 30}px`, overflow: "auto" }}
              >
                <TabStrip
                  style={{
                    width: "100%",
                  }}
                  selected={tabSelected}
                  onSelect={handleSelectTab}
                >
                  <TabStripTab title="품목참조">
                    <GridContainer>
                      <GridTitleContainer>
                        <div
                          style={{
                            paddingBottom: "10px",
                            display: "flex",
                            justifyContent: "space-between",
                            flexDirection: isVisibleDetail ? "column" : "row",
                          }}
                          className="ButtonContainer2"
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "left",
                              width: "100%",
                            }}
                          >
                            <Button
                              onClick={() => {
                                setIsVisableDetail((prev) => !prev);
                                updateHeight();
                              }}
                              icon={
                                isVisibleDetail ? "chevron-up" : "chevron-down"
                              }
                              fillMode={"flat"}
                              themeColor={"secondary"}
                            >
                              조회조건
                            </Button>
                          </div>
                          {isVisibleDetail && (
                            <FormBoxWrap border={true}>
                              <FormBox style={{ width: "100%" }}>
                                <tbody>
                                  <tr>
                                    <th>품목코드</th>
                                    <td>
                                      <Input
                                        name="itemcd"
                                        type="text"
                                        value={infomation.itemcd}
                                        onChange={InputChange}
                                      />
                                    </td>
                                    <th>품목명</th>
                                    <td>
                                      <Input
                                        name="itemnm"
                                        type="text"
                                        value={infomation.itemnm}
                                        onChange={InputChange}
                                      />
                                    </td>
                                    <th>LOT NO</th>
                                    <td>
                                      <Input
                                        name="lotnum"
                                        type="text"
                                        value={infomation.lotnum}
                                        onChange={InputChange}
                                      />
                                    </td>
                                    <th>품목계정</th>
                                    <td>
                                      {bizComponentData !== null && (
                                        <BizComponentComboBox
                                          name="itemacnt"
                                          value={infomation.itemacnt}
                                          bizComponentId="L_BA061"
                                          bizComponentData={bizComponentData}
                                          changeData={ComboBoxChange}
                                        />
                                      )}
                                    </td>
                                    <td
                                      colSpan={4}
                                      style={{ textAlign: "center" }}
                                    >
                                      <Button
                                        onClick={onSearch2}
                                        themeColor={"primary"}
                                        icon="search"
                                      >
                                        조회
                                      </Button>
                                    </td>
                                  </tr>
                                </tbody>
                              </FormBox>
                            </FormBoxWrap>
                          )}
                          <ButtonContainer>
                            <Button
                              onClick={onAddClick}
                              themeColor={"primary"}
                              icon="plus"
                            ></Button>
                          </ButtonContainer>
                        </div>
                      </GridTitleContainer>
                      <ExcelExport
                        data={subDataResult.data}
                        ref={(exporter) => {
                          _export2 = exporter;
                        }}
                        fileName="자재불출"
                      >
                        <Grid
                          style={{ height: deviceHeight - height2 }}
                          data={process(
                            subDataResult.data.map((row) => ({
                              ...row,
                              itemacnt: itemacntListData.find(
                                (item: any) => item.sub_code == row.itemacnt
                              )?.code_name,
                              chk: row.chk == "" ? false : row.chk,
                              [SELECTED_FIELD]:
                                selectedSubState[idGetter2(row)],
                            })),
                            subDataState
                          )}
                          {...subDataState}
                          onDataStateChange={onSubDataStateChange}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY2}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onSubSelectionChange}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={subDataResult.total}
                          skip={page2.skip}
                          take={page2.take}
                          pageable={true}
                          onPageChange={pageChange2}
                          //원하는 행 위치로 스크롤 기능
                          ref={gridRef2}
                          rowHeight={30}
                          //정렬기능
                          sortable={true}
                          onSortChange={onSubSortChange}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                          onItemChange={onSubItemChange}
                          cellRender={customCellRender}
                          rowRender={customRowRender}
                          editField={EDIT_FIELD}
                        >
                          <GridColumn
                            field="chk"
                            title=" "
                            width="45px"
                            headerCell={CustomCheckBoxCell2}
                            cell={CheckBoxCell}
                          />
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions[
                              "grdList2"
                            ]?.map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    cell={
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? subTotalFooterCell
                                        : numberField3.includes(item.fieldName)
                                        ? gridSumQtyFooterCell2
                                        : numberField4.includes(item.fieldName)
                                        ? editNumberFooterCell
                                        : undefined
                                    }
                                    headerCell={
                                      requiredField.includes(item.fieldName)
                                        ? RequiredHeader
                                        : undefined
                                    }
                                  />
                                )
                            )}
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                  </TabStripTab>
                  <TabStripTab title="BOM참조">
                    <Swiper
                      onSwiper={(swiper2) => {
                        setSwiper2(swiper2);
                      }}
                      onActiveIndexChange={(swiper2) => {
                        index2 = swiper2.activeIndex;
                      }}
                    >
                      <SwiperSlide key={0}>
                        <GridContainer
                          style={{
                            width: `${deviceWidth - 30}px`,
                            overflow: "auto",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "left",
                              flexDirection: isVisibleDetail2
                                ? "column"
                                : "row",
                            }}
                            className="ButtonContainer3"
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "left",
                                width: "100%",
                              }}
                            >
                            <Button
                              onClick={() => {
                                setIsVisableDetail2((prev) => !prev);
                                updateHeight();
                              }}
                              icon={
                                isVisibleDetail2 ? "chevron-up" : "chevron-down"
                              }
                              fillMode={"flat"}
                              themeColor={"secondary"}
                            >
                              조회조건
                            </Button>
                            </div>
                          {isVisibleDetail2 && (
                            <FormBoxWrap border={true}>
                              <FormBox>
                                <tbody>
                                  <tr>
                                    <th style={{ minWidth: "70px" }}>
                                      품목코드
                                    </th>
                                    <td>
                                      <Input
                                        name="itemcd"
                                        type="text"
                                        value={infomation2.itemcd}
                                        onChange={InputChange2}
                                      />
                                    </td>
                                    <th style={{ minWidth: "70px" }}>품목명</th>
                                    <td>
                                      <Input
                                        name="itemnm"
                                        type="text"
                                        value={infomation2.itemnm}
                                        onChange={InputChange2}
                                      />
                                    </td>
                                    <td>
                                      <Button
                                        onClick={onSearch3}
                                        themeColor={"primary"}
                                        icon="search"
                                      >
                                        조회
                                      </Button>
                                    </td>
                                  </tr>
                                </tbody>
                              </FormBox>
                            </FormBoxWrap>
                          )}
                          </div>
                          <ExcelExport
                            data={BOMDataResult.data}
                            ref={(exporter) => {
                              _export4 = exporter;
                            }}
                            fileName="자재불출"
                          >
                            <Grid
                              style={{ height: deviceHeight - height3 }}
                              data={process(
                                BOMDataResult.data.map((row) => ({
                                  ...row,
                                  itemacnt: itemacntListData.find(
                                    (item: any) => item.sub_code == row.itemacnt
                                  )?.code_name,
                                  qtyunit: qtyunitListData.find(
                                    (item: any) => item.sub_code == row.qtyunit
                                  )?.code_name,
                                  [SELECTED_FIELD]:
                                    selectedBOMState[idGetter3(row)],
                                })),
                                BOMDataState
                              )}
                              {...BOMDataState}
                              onDataStateChange={onBOMDataStateChange}
                              //선택 기능
                              dataItemKey={DATA_ITEM_KEY3}
                              selectedField={SELECTED_FIELD}
                              selectable={{
                                enabled: true,
                                mode: "single",
                              }}
                              onSelectionChange={onBOMSelectionChange}
                              //스크롤 조회 기능
                              fixedScroll={true}
                              total={BOMDataResult.total}
                              skip={page3.skip}
                              take={page3.take}
                              pageable={true}
                              onPageChange={pageChange3}
                              //원하는 행 위치로 스크롤 기능
                              ref={gridRef3}
                              rowHeight={30}
                              //정렬기능
                              sortable={true}
                              onSortChange={onBOMSortChange}
                              //컬럼순서조정
                              reorderable={true}
                              //컬럼너비조정
                              resizable={true}
                            >
                              <GridColumn
                                field="itemcd"
                                title="품목코드"
                                width="150px"
                                footerCell={BOMTotalFooterCell}
                              />
                              <GridColumn
                                field="itemnm"
                                title="품목명"
                                width="150px"
                              />
                              <GridColumn
                                field="insiz"
                                title="규격"
                                width="120px"
                              />
                            </Grid>
                          </ExcelExport>
                        </GridContainer>
                      </SwiperSlide>
                      <SwiperSlide key={1}>
                        <GridContainer
                          style={{
                            width: `${deviceWidth - 30}px`,
                            overflow: "auto",
                          }}
                        >
                          <div
                            style={{
                              paddingBottom: "10px",
                              display: "flex",
                              justifyContent: "space-between",
                              flexDirection: isVisibleDetail3
                                ? "column"
                                : "row",
                            }}
                            className="ButtonContainer4"
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "left",
                                width: "100%",
                              }}
                            >
                              <Button
                                onClick={() => {
                                  setIsVisableDetail3((prev) => !prev);
                                  updateHeight();
                                }}
                                icon={
                                  isVisibleDetail3
                                    ? "chevron-up"
                                    : "chevron-down"
                                }
                                fillMode={"flat"}
                                themeColor={"secondary"}
                              >
                                조회조건
                              </Button>
                            </div>
                            {isVisibleDetail3 && (
                              <FormBoxWrap border={true}>
                                <FormBox>
                                  <tbody>
                                    <tr>
                                      <th style={{ minWidth: "70px" }}>
                                        품목코드
                                      </th>
                                      <td>
                                        <Input
                                          name="itemcd"
                                          type="text"
                                          value={infomation3.itemcd}
                                          className="readonly"
                                        />
                                      </td>
                                      <th style={{ minWidth: "70px" }}>
                                        품목명
                                      </th>
                                      <td>
                                        <Input
                                          name="itemnm"
                                          type="text"
                                          value={infomation3.itemnm}
                                          className="readonly"
                                        />
                                      </td>
                                    </tr>
                                    <tr>
                                      <th style={{ minWidth: "70px" }}>
                                        생산량
                                      </th>
                                      <td>
                                        <Input
                                          name="doqty"
                                          type="number"
                                          value={infomation3.doqty}
                                          onChange={InputChange3}
                                        />
                                        <ButtonInInput>
                                          <Button
                                            onClick={InputChange4}
                                            icon="check"
                                            fillMode="flat"
                                          />
                                        </ButtonInInput>
                                      </td>
                                      <th style={{ minWidth: "70px" }}>
                                        LOT NO
                                      </th>
                                      <td>
                                        <Input
                                          name="lotnum"
                                          type="text"
                                          value={infomation3.lotnum}
                                          onChange={InputChange3}
                                        />
                                      </td>
                                      <td>
                                        <Button
                                          onClick={onSearch4}
                                          themeColor={"primary"}
                                          icon="search"
                                        >
                                          조회
                                        </Button>
                                      </td>
                                    </tr>
                                  </tbody>
                                </FormBox>
                              </FormBoxWrap>
                            )}
                            <ButtonContainer>
                              <Button
                                onClick={onAddClick2}
                                themeColor={"primary"}
                                icon="plus"
                                title="행 추가"
                              ></Button>
                            </ButtonContainer>
                          </div>
                          <ExcelExport
                            data={BOMDataResult2.data}
                            ref={(exporter) => {
                              _export5 = exporter;
                            }}
                            fileName="자재불출"
                          >
                            <Grid
                              style={{ height: deviceHeight - height4 }}
                              data={process(
                                BOMDataResult2.data.map((row) => ({
                                  ...row,
                                  itemacnt: itemacntListData.find(
                                    (item: any) => item.sub_code == row.itemacnt
                                  )?.code_name,
                                  qtyunit: qtyunitListData.find(
                                    (item: any) => item.sub_code == row.qtyunit
                                  )?.code_name,
                                  outpgm: outpgmListData.find(
                                    (item: any) => item.sub_code == row.outpgm
                                  )?.code_name,
                                  chk: row.chk == "" ? false : row.chk,
                                  [SELECTED_FIELD]:
                                    selectedBOMState2[idGetter4(row)],
                                })),
                                BOMDataState2
                              )}
                              {...BOMDataState2}
                              onDataStateChange={onBOMDataStateChange2}
                              //선택 기능
                              dataItemKey={DATA_ITEM_KEY4}
                              selectedField={SELECTED_FIELD}
                              selectable={{
                                enabled: true,
                                mode: "single",
                              }}
                              onSelectionChange={onBOMSelectionChange2}
                              //스크롤 조회 기능
                              fixedScroll={true}
                              total={BOMDataResult2.total}
                              skip={page4.skip}
                              take={page4.take}
                              pageable={true}
                              onPageChange={pageChange4}
                              //원하는 행 위치로 스크롤 기능
                              ref={gridRef4}
                              rowHeight={30}
                              //정렬기능
                              sortable={true}
                              onSortChange={onBOMSortChange2}
                              //컬럼순서조정
                              reorderable={true}
                              //컬럼너비조정
                              resizable={true}
                              onItemChange={onBOMItemChange}
                              cellRender={customCellRender2}
                              rowRender={customRowRender2}
                              editField={EDIT_FIELD}
                            >
                              <GridColumn
                                field="chk"
                                title=" "
                                width="45px"
                                headerCell={CustomCheckBoxCell3}
                                cell={CheckBoxCell}
                              />
                              {customOptionData !== null &&
                                customOptionData.menuCustomColumnOptions[
                                  "grdList2"
                                ]?.map(
                                  (item: any, idx: number) =>
                                    item.sortOrder !== -1 && (
                                      <GridColumn
                                        key={idx}
                                        field={item.fieldName}
                                        title={item.caption}
                                        width={item.width}
                                        cell={
                                          numberField.includes(item.fieldName)
                                            ? NumberCell
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? BOMTotalFooterCell2
                                            : numberField2.includes(
                                                item.fieldName
                                              )
                                            ? gridSumQtyFooterCell3
                                            : undefined
                                        }
                                        headerCell={
                                          requiredField.includes(item.fieldName)
                                            ? RequiredHeader
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                            </Grid>
                          </ExcelExport>
                        </GridContainer>
                      </SwiperSlide>
                    </Swiper>
                  </TabStripTab>
                </TabStrip>
              </GridContainer>
            </SwiperSlide>

            <SwiperSlide key={2}>
              <GridContainer
                style={{ width: `${deviceWidth - 30}px`, overflow: "auto" }}
              >
                <GridTitleContainer className="ButtonContainer5">
                  <GridTitle>처리정보</GridTitle>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <ButtonContainer>
                      <Button
                        onClick={() => {
                          if (swiper) {
                            swiper.slideTo(0);
                          }
                        }}
                        icon="arrow-left"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        처음으로
                      </Button>
                    </ButtonContainer>
                    <ButtonContainer>
                      <Button
                        onClick={onDeleteClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                      ></Button>
                      <Button
                        onClick={setCopyData}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="save"
                        title="저장"
                      ></Button>
                    </ButtonContainer>
                  </div>
                </GridTitleContainer>
                <ExcelExport
                  data={subDataResult2.data}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName="자재불출"
                >
                  <Grid
                    style={{ height: deviceHeight - height5 }}
                    data={process(
                      subDataResult2.data.map((row) => ({
                        ...row,
                        ordsts: ordstsListData.find(
                          (item: any) => item.sub_code == row.ordsts
                        )?.code_name,
                        doexdiv: doexdivListData.find(
                          (item: any) => item.sub_code == row.doexdiv
                        )?.code_name,
                        taxdiv: taxdivListData.find(
                          (item: any) => item.sub_code == row.taxdiv
                        )?.code_name,
                        location: locationListData.find(
                          (item: any) => item.sub_code == row.location
                        )?.code_name,
                        dptcd: departmentsListData.find(
                          (item: any) => item.dptcd == row.dptcd
                        )?.dptnm,
                        finyn: finynListData.find(
                          (item: any) => item.code == row.finyn
                        )?.name,
                        pursts: purstsListData.find(
                          (item: any) => item.sub_code == row.pursts
                        )?.code_name,
                        itemacnt: itemacntListData.find(
                          (item: any) => item.sub_code == row.itemacnt
                        )?.code_name,
                        qtyunit: qtyunitListData.find(
                          (item: any) => item.sub_code == row.qtyunit
                        )?.code_name,
                        outpgm: outpgmListData.find(
                          (item: any) => item.sub_code == row.outpgm
                        )?.code_name,
                        [SELECTED_FIELD]: selectedSubState2[idGetter5(row)],
                      })),
                      subDataState2
                    )}
                    {...subDataState2}
                    onDataStateChange={onSubDataStateChange2}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY5}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSubSelectionChange2}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={subDataResult2.total}
                    //정렬기능
                    sortable={true}
                    onSortChange={onSubSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList3"]?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? subTotalFooterCell2
                                  : numberField4.includes(item.fieldName)
                                  ? editNumberFooterCell2
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>요약정보</GridTitle>
              <Button
                onClick={onDeleteClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="delete"
              >
                삭제
              </Button>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="자재불출"
            >
              <Grid
                style={{ height: "27.2vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    itemacnt: itemacntListData.find(
                      (item: any) => item.sub_code == row.itemacnt
                    )?.code_name,
                    qtyunit: qtyunitListData.find(
                      (item: any) => item.sub_code == row.qtyunit
                    )?.code_name,
                    outpgm: outpgmListData.find(
                      (item: any) => item.sub_code == row.outpgm
                    )?.code_name,
                    [SELECTED_FIELD]: selectedState[idGetter(row)],
                    chk: row.chk == "" ? false : row.chk,
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
                onItemChange={onItemChange}
                cellRender={customCellRender3}
                rowRender={customRowRender3}
                editField={EDIT_FIELD}
              >
                <GridColumn
                  field="chk"
                  title=" "
                  width="45px"
                  headerCell={CustomCheckBoxCell}
                  cell={CheckBoxCell}
                />
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"]?.map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            numberField.includes(item.fieldName)
                              ? NumberCell
                              : dateField.includes(item.fieldName)
                              ? DateCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 0
                              ? mainTotalFooterCell
                              : numberField2.includes(item.fieldName)
                              ? gridSumQtyFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
          <GridContainerWrap>
            <GridContainer width="55%">
              <TabStrip
                style={{ width: "100%", height: "48.5vh" }}
                selected={tabSelected}
                onSelect={handleSelectTab}
              >
                <TabStripTab title="품목참조">
                  <FormBoxWrap>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th style={{ minWidth: "70px" }}>품목코드</th>
                          <td>
                            <Input
                              name="itemcd"
                              type="text"
                              value={infomation.itemcd}
                              onChange={InputChange}
                            />
                          </td>
                          <th style={{ minWidth: "70px" }}>품목명</th>
                          <td>
                            <Input
                              name="itemnm"
                              type="text"
                              value={infomation.itemnm}
                              onChange={InputChange}
                            />
                          </td>
                          <th style={{ minWidth: "70px" }}>LOT NO</th>
                          <td>
                            <Input
                              name="lotnum"
                              type="text"
                              value={infomation.lotnum}
                              onChange={InputChange}
                            />
                          </td>
                          <th style={{ minWidth: "70px" }}>품목계정</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="itemacnt"
                                value={infomation.itemacnt}
                                bizComponentId="L_BA061"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <td>
                            <Button
                              onClick={onSearch2}
                              themeColor={"primary"}
                              icon="search"
                            >
                              조회
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                  <GridContainer>
                    <GridTitleContainer>
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick}
                          themeColor={"primary"}
                          icon="plus"
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={subDataResult.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName="자재불출"
                    >
                      <Grid
                        style={{ height: "29.8vh" }}
                        data={process(
                          subDataResult.data.map((row) => ({
                            ...row,
                            itemacnt: itemacntListData.find(
                              (item: any) => item.sub_code == row.itemacnt
                            )?.code_name,
                            chk: row.chk == "" ? false : row.chk,
                            [SELECTED_FIELD]: selectedSubState[idGetter2(row)],
                          })),
                          subDataState
                        )}
                        {...subDataState}
                        onDataStateChange={onSubDataStateChange}
                        //선택 기능
                        dataItemKey={DATA_ITEM_KEY2}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onSubSelectionChange}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={subDataResult.total}
                        skip={page2.skip}
                        take={page2.take}
                        pageable={true}
                        onPageChange={pageChange2}
                        //원하는 행 위치로 스크롤 기능
                        ref={gridRef2}
                        rowHeight={30}
                        //정렬기능
                        sortable={true}
                        onSortChange={onSubSortChange}
                        //컬럼순서조정
                        reorderable={true}
                        //컬럼너비조정
                        resizable={true}
                        onItemChange={onSubItemChange}
                        cellRender={customCellRender}
                        rowRender={customRowRender}
                        editField={EDIT_FIELD}
                      >
                        <GridColumn
                          field="chk"
                          title=" "
                          width="45px"
                          headerCell={CustomCheckBoxCell2}
                          cell={CheckBoxCell}
                        />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions[
                            "grdList2"
                          ]?.map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={idx}
                                  field={item.fieldName}
                                  title={item.caption}
                                  width={item.width}
                                  cell={
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? subTotalFooterCell
                                      : numberField3.includes(item.fieldName)
                                      ? gridSumQtyFooterCell2
                                      : numberField4.includes(item.fieldName)
                                      ? editNumberFooterCell
                                      : undefined
                                  }
                                  headerCell={
                                    requiredField.includes(item.fieldName)
                                      ? RequiredHeader
                                      : undefined
                                  }
                                />
                              )
                          )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </TabStripTab>
                <TabStripTab title="BOM참조">
                  <GridContainerWrap>
                    <GridContainer width="50%">
                      <FormBoxWrap>
                        <FormBox>
                          <tbody>
                            <tr>
                              <th style={{ minWidth: "70px" }}>품목코드</th>
                              <td>
                                <Input
                                  name="itemcd"
                                  type="text"
                                  value={infomation2.itemcd}
                                  onChange={InputChange2}
                                />
                              </td>
                              <th style={{ minWidth: "70px" }}>품목명</th>
                              <td>
                                <Input
                                  name="itemnm"
                                  type="text"
                                  value={infomation2.itemnm}
                                  onChange={InputChange2}
                                />
                              </td>
                              <td>
                                <Button
                                  onClick={onSearch3}
                                  themeColor={"primary"}
                                  icon="search"
                                >
                                  조회
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </FormBox>
                      </FormBoxWrap>
                      <ExcelExport
                        data={BOMDataResult.data}
                        ref={(exporter) => {
                          _export4 = exporter;
                        }}
                        fileName="자재불출"
                      >
                        <Grid
                          style={{ height: "27vh" }}
                          data={process(
                            BOMDataResult.data.map((row) => ({
                              ...row,
                              itemacnt: itemacntListData.find(
                                (item: any) => item.sub_code == row.itemacnt
                              )?.code_name,
                              qtyunit: qtyunitListData.find(
                                (item: any) => item.sub_code == row.qtyunit
                              )?.code_name,
                              [SELECTED_FIELD]:
                                selectedBOMState[idGetter3(row)],
                            })),
                            BOMDataState
                          )}
                          {...BOMDataState}
                          onDataStateChange={onBOMDataStateChange}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY3}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onBOMSelectionChange}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={BOMDataResult.total}
                          skip={page3.skip}
                          take={page3.take}
                          pageable={true}
                          onPageChange={pageChange3}
                          //원하는 행 위치로 스크롤 기능
                          ref={gridRef3}
                          rowHeight={30}
                          //정렬기능
                          sortable={true}
                          onSortChange={onBOMSortChange}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                        >
                          <GridColumn
                            field="itemcd"
                            title="품목코드"
                            width="150px"
                            footerCell={BOMTotalFooterCell}
                          />
                          <GridColumn
                            field="itemnm"
                            title="품목명"
                            width="150px"
                          />
                          <GridColumn
                            field="insiz"
                            title="규격"
                            width="120px"
                          />
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                    <GridContainer style={{ width: "100%", height: "100%" }}>
                      <FormBoxWrap>
                        <FormBox>
                          <tbody>
                            <tr>
                              <th style={{ minWidth: "70px" }}>품목코드</th>
                              <td>
                                <Input
                                  name="itemcd"
                                  type="text"
                                  value={infomation3.itemcd}
                                  className="readonly"
                                />
                              </td>
                              <th style={{ minWidth: "70px" }}>품목명</th>
                              <td>
                                <Input
                                  name="itemnm"
                                  type="text"
                                  value={infomation3.itemnm}
                                  className="readonly"
                                />
                              </td>
                            </tr>
                            <tr>
                              <th style={{ minWidth: "70px" }}>생산량</th>
                              <td>
                                <Input
                                  name="doqty"
                                  type="number"
                                  value={infomation3.doqty}
                                  onChange={InputChange3}
                                />
                                <ButtonInInput>
                                  <Button
                                    onClick={InputChange4}
                                    icon="check"
                                    fillMode="flat"
                                  />
                                </ButtonInInput>
                              </td>
                              <th style={{ minWidth: "70px" }}>LOT NO</th>
                              <td>
                                <Input
                                  name="lotnum"
                                  type="text"
                                  value={infomation3.lotnum}
                                  onChange={InputChange3}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </FormBox>
                      </FormBoxWrap>
                      <GridTitleContainer>
                        <Button
                          onClick={onAddClick2}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                        ></Button>
                        <ButtonContainer>
                          <Button
                            onClick={onSearch4}
                            themeColor={"primary"}
                            icon="search"
                          >
                            조회
                          </Button>
                        </ButtonContainer>
                      </GridTitleContainer>
                      <ExcelExport
                        data={BOMDataResult2.data}
                        ref={(exporter) => {
                          _export5 = exporter;
                        }}
                        fileName="자재불출"
                      >
                        <Grid
                          style={{ height: "25.5vh" }}
                          data={process(
                            BOMDataResult2.data.map((row) => ({
                              ...row,
                              itemacnt: itemacntListData.find(
                                (item: any) => item.sub_code == row.itemacnt
                              )?.code_name,
                              qtyunit: qtyunitListData.find(
                                (item: any) => item.sub_code == row.qtyunit
                              )?.code_name,
                              outpgm: outpgmListData.find(
                                (item: any) => item.sub_code == row.outpgm
                              )?.code_name,
                              chk: row.chk == "" ? false : row.chk,
                              [SELECTED_FIELD]:
                                selectedBOMState2[idGetter4(row)],
                            })),
                            BOMDataState2
                          )}
                          {...BOMDataState2}
                          onDataStateChange={onBOMDataStateChange2}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY4}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onBOMSelectionChange2}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={BOMDataResult2.total}
                          skip={page4.skip}
                          take={page4.take}
                          pageable={true}
                          onPageChange={pageChange4}
                          //원하는 행 위치로 스크롤 기능
                          ref={gridRef4}
                          rowHeight={30}
                          //정렬기능
                          sortable={true}
                          onSortChange={onBOMSortChange2}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                          onItemChange={onBOMItemChange}
                          cellRender={customCellRender2}
                          rowRender={customRowRender2}
                          editField={EDIT_FIELD}
                        >
                          <GridColumn
                            field="chk"
                            title=" "
                            width="45px"
                            headerCell={CustomCheckBoxCell3}
                            cell={CheckBoxCell}
                          />
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions[
                              "grdList2"
                            ]?.map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    cell={
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? BOMTotalFooterCell2
                                        : numberField2.includes(item.fieldName)
                                        ? gridSumQtyFooterCell3
                                        : undefined
                                    }
                                    headerCell={
                                      requiredField.includes(item.fieldName)
                                        ? RequiredHeader
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
            </GridContainer>
            <GridContainer width={`calc(45% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>처리정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                  <Button
                    onClick={setCopyData}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={subDataResult2.data}
                ref={(exporter) => {
                  _export3 = exporter;
                }}
                fileName="자재불출"
              >
                <Grid
                  style={{ height: "45vh" }}
                  data={process(
                    subDataResult2.data.map((row) => ({
                      ...row,
                      ordsts: ordstsListData.find(
                        (item: any) => item.sub_code == row.ordsts
                      )?.code_name,
                      doexdiv: doexdivListData.find(
                        (item: any) => item.sub_code == row.doexdiv
                      )?.code_name,
                      taxdiv: taxdivListData.find(
                        (item: any) => item.sub_code == row.taxdiv
                      )?.code_name,
                      location: locationListData.find(
                        (item: any) => item.sub_code == row.location
                      )?.code_name,
                      dptcd: departmentsListData.find(
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
                      finyn: finynListData.find(
                        (item: any) => item.code == row.finyn
                      )?.name,
                      pursts: purstsListData.find(
                        (item: any) => item.sub_code == row.pursts
                      )?.code_name,
                      itemacnt: itemacntListData.find(
                        (item: any) => item.sub_code == row.itemacnt
                      )?.code_name,
                      qtyunit: qtyunitListData.find(
                        (item: any) => item.sub_code == row.qtyunit
                      )?.code_name,
                      outpgm: outpgmListData.find(
                        (item: any) => item.sub_code == row.outpgm
                      )?.code_name,
                      [SELECTED_FIELD]: selectedSubState2[idGetter5(row)],
                    })),
                    subDataState2
                  )}
                  {...subDataState2}
                  onDataStateChange={onSubDataStateChange2}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY5}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSubSelectionChange2}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={subDataResult2.total}
                  //정렬기능
                  sortable={true}
                  onSortChange={onSubSortChange2}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList3"]?.map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
                                ? subTotalFooterCell2
                                : numberField4.includes(item.fieldName)
                                ? editNumberFooterCell2
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
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

export default MA_A3500W;
