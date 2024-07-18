import {
  CompositeFilterDescriptor,
  DataResult,
  State,
  filterBy,
  process,
} from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFilterChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
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
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  numberWithCommas,
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
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/PR_A0040W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY = "sub_code";
const SUB_DATA_ITEM_KEY2 = "num";

let deletedMainRows: object[] = [];
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
const CustomComboField = [
  "proccd",
  "outprocyn",
  "prodemp",
  "qtyunit",
  "procunit",
];

const NumberField = ["procseq", "stdtime", "procqty"];

const NumberField2 = ["procqty"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_PR010,L_BA011,L_sysUserMaster_001,L_BA015",
    // 공정, 외주여부, 사용자, 수량단위, 공정단위
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "proccd"
      ? "L_PR010"
      : field == "outprocyn"
      ? "L_BA011"
      : field == "prodemp"
      ? "L_sysUserMaster_001"
      : field == "qtyunit"
      ? "L_BA015"
      : field == "procunit"
      ? "L_BA015"
      : "";

  const fieldName = field == "prodemp" ? "user_name" : undefined;
  const filedValue = field == "prodemp" ? "user_id" : undefined;
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={fieldName}
      valueField={filedValue}
      {...props}
    />
  ) : (
    <td />
  );
};

type TdataArr = {
  rowstatus_s: string[];
  seq_s: string[];
  itemcd_s: string[];
  proccd_s: string[];
  procseq_s: string[];
  remark_s: string[];
  outprocyn_s: string[];
  stdtime_s: string[];
  procqty_s: string[];
  procunit_s: string[];
  workcnt_s: string[];
};
let temp = 0;
const initialFilter: CompositeFilterDescriptor = {
  logic: "and",
  filters: [{ field: "code_name", operator: "contains", value: "" }],
};

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;

const PR_A0040W: React.FC = () => {
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const idGetter3 = getter(SUB_DATA_ITEM_KEY2);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

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

    setsubFilters2((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));

    setPage3(initialPageState);
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setsubFilters((prev) => ({
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

    setsubFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("PR_A0040W", setMessagesData);
  const [filter, setFilter] = React.useState(initialFilter);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("PR_A0040W", setCustomOptionData);

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".ButtonContainer2");
      height4 = getHeight(".ButtonContainer3");
      height5 = getHeight(".FormBoxWrap");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height3);
        setMobileHeight3(getDeviceHeight(true) - height - height4 - height5);
        setWebHeight((getDeviceHeight(true) - height) / 2 - height2);
        setWebHeight2((getDeviceHeight(true) - height) / 2 - height3);
        setWebHeight3((getDeviceHeight(true) - height) / 2 - height4 - height5);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, webheight3]);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        proccd2: defaultOption.find((item: any) => item.id == "proccd2")
          ?.valueCode,
        itemacnt: defaultOption.find((item: any) => item.id == "itemacnt")
          ?.valueCode,
        gubun: defaultOption.find((item: any) => item.id == "gubun")?.valueCode,
        isSearch: true,
      }));
      setsubFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061, L_BA015,L_BA029,L_BA005,L_BA020, L_sysUserMaster_001, L_AC014,L_BA003, L_AC006",
    //수량단위, 과세구분, 내수구분, 화폐단위, 사용자, 계산서유형, 입고유형, 전표입력경로
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemacntListData, setItemacntListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [subData2State, setSubData2State] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [subData2Result, setSubData2Result] = useState<DataResult>(
    process([], subData2State)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubData2State, setSelectedsubData2State] = useState<{
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
    pgSize: PAGE_SIZE,
    workType: "ITEM",
    orgdiv: sessionOrgdiv,
    prntitemcd: "",
    itemcd: "",
    itemnm: "",
    gubun: "",
    insiz: "",
    proccd2: "",
    itemacnt: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [subfilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "PROCCD",
    proccd2: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [subfilters2, setsubFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    prntitemcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A0040W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_prntitemcd": filters.prntitemcd,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_gubun": filters.gubun,
        "@p_insiz": filters.insiz,
        "@p_proccd2": filters.proccd2,
        "@p_itemacnt": filters.itemacnt,
        "@p_find_row_value": filters.find_row_value,
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
            (row: any) => row.itemcd == filters.find_row_value
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
            : rows.find((row: any) => row.itemcd == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });

          setsubFilters2((prev) => ({
            ...prev,
            prntitemcd: selectedRow.itemcd,
            pgNum: 1,
            isSearch: true,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });

          setsubFilters2((prev) => ({
            ...prev,
            prntitemcd: rows[0].itemcd,
            pgNum: 1,
            isSearch: true,
          }));
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

  const fetchSubGrid = async (subfilters: any) => {
    if (!permissions.view) return;
    let data: any;

    //조회조건 파라미터
    const subparameters: Iparameters = {
      procedureName: "P_PR_A0040W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": subfilters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_prntitemcd": filters.prntitemcd,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_gubun": filters.gubun,
        "@p_insiz": filters.insiz,
        "@p_proccd2": subfilters.proccd2,
        "@p_itemacnt": filters.itemacnt,
        "@p_find_row_value": "",
      },
    };

    setLoading(true);
    try {
      data = await processApi<any>("procedure", subparameters);
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
        setSelectedsubDataState({ [rows[0][SUB_DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setsubFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };
  const fetchSubGrid2 = async (subfilters2: any) => {
    if (!permissions.view) return;
    let data: any;

    const subparameters2: Iparameters = {
      procedureName: "P_PR_A0040W_Q",
      pageNumber: subfilters2.pgNum,
      pageSize: subfilters2.pgSize,
      parameters: {
        "@p_work_type": subfilters2.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_prntitemcd": subfilters2.prntitemcd,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_gubun": filters.gubun,
        "@p_insiz": filters.insiz,
        "@p_proccd2": filters.proccd2,
        "@p_itemacnt": filters.itemacnt,
        "@p_find_row_value": subfilters2.find_row_value,
      },
    };

    setLoading(true);
    try {
      data = await processApi<any>("procedure", subparameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (subfilters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.seq == subfilters2.find_row_value
          );
          targetRowIndex3 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage3({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef3.current) {
          targetRowIndex3 = 0;
        }
      }
      setSubData2Result((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          subfilters2.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.seq == subfilters2.find_row_value);

        if (selectedRow != undefined) {
          setSelectedsubData2State({ [selectedRow[SUB_DATA_ITEM_KEY2]]: true });
        } else {
          setSelectedsubData2State({ [rows[0][SUB_DATA_ITEM_KEY2]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setsubFilters2((prev) => ({
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
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      subfilters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);
      setsubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters, permissions, bizComponentData, customOptionData]);
  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      subfilters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters2);
      setsubFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchSubGrid2(deepCopiedFilters);
    }
  }, [subfilters2, permissions, bizComponentData, customOptionData]);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
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
  }, [subData2Result]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
    setSubData2Result(process([], subData2State));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setPage3(initialPageState);
    setsubFilters2((prev) => ({
      ...prev,
      prntitemcd: selectedRowData.itemcd,
      isSearch: true,
      pgNum: 1,
      find_row_value: "",
    }));
    if (swiper && isMobile) {
      swiper.slideTo(2);
    }
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
    let valid = true;
    subData2Result.data.forEach((item) => {
      if (Object.getOwnPropertyNames(newSelectedState)[0] == item.proccd) {
        valid = false;
      }
    });

    if (valid == true) {
      let proseq = 1;
      if (subData2Result.total > 0) {
        subData2Result.data.forEach((item) => {
          if (item.procseq >= proseq) {
            proseq = item.procseq;
          }
        });
      }

      subData2Result.data.map((item) => {
        if (item.num > temp) {
          temp = item.num;
        }
      });
      const datas = mainDataResult.data.filter(
        (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      const newDataItem = {
        [SUB_DATA_ITEM_KEY2]: ++temp,
        chlditemcd: "",
        chlditemnm: "",
        custcd: "",
        custnm: "",
        orgdiv: sessionOrgdiv,
        outgb: "",
        outprocyn: "N",
        itemcd: datas.itemcd,
        itemnm: datas.itemnm,
        insiz: datas.insiz,
        prntitemcd: Object.getOwnPropertyNames(selectedState)[0],
        proccd: Object.getOwnPropertyNames(newSelectedState)[0],
        procitemcd: Object.getOwnPropertyNames(selectedState)[0],
        procqty: 1,
        procseq: proseq + 1,
        prodemp: "",
        prodmac: "",
        procunit: "001",
        stdtime: 0,
        recdt: "",
        remark: "",
        seq: 0,
        unitqty: 0,
        workcnt: 0,
        rowstatus: "N",
      };
      setSelectedsubData2State({ [newDataItem.num]: true });
      setPage3((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 1,
      }));
      setSubData2Result((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      if (swiper && isMobile) {
        swiper.slideTo(2);
      }
    } else {
      alert("중복된 공정이 있습니다.");
    }
  };

  const onSubData2SelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubData2State,
      dataItemKey: SUB_DATA_ITEM_KEY2,
    });

    setSelectedsubData2State(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      const optionsGridThree = _export3.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[2] = optionsGridThree.sheets[0];
      optionsGridOne.sheets[0].title = "요약정보";
      optionsGridOne.sheets[1].title = "공정리스트";
      optionsGridOne.sheets[2].title = "표준공정도";
      _export.save(optionsGridOne);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  const onSubData2StateChange = (event: GridDataStateChangeEvent) => {
    setSubData2State(event.dataState);
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

  const sub2TotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subData2Result.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {subData2Result.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    subData2Result.data.forEach((item) =>
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubData2SortChange = (e: any) => {
    setSubData2State((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    deletedMainRows = [];
    setFilters((prev) => ({
      ...prev,
      isSearch: true,
      find_row_value: "",
      pgNum: 1,
    }));
    setsubFilters((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(0);
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

  const onSubItemChange = (event: GridItemChangeEvent) => {
    setSubDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subData2Result,
      setSubData2Result,
      SUB_DATA_ITEM_KEY2
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = subData2Result.data.map((item) =>
        item[SUB_DATA_ITEM_KEY2] == dataItem[SUB_DATA_ITEM_KEY2]
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
      setSubData2Result((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev) => {
        return {
          data: subData2Result.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != subData2Result.data) {
      const newData = subData2Result.data.map((item) =>
        item[SUB_DATA_ITEM_KEY2] ==
        Object.getOwnPropertyNames(selectedsubData2State)[0]
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
      setSubData2Result((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = subData2Result.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubData2Result((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    var many = mainDataResult.data.filter((item) => item.chk_org == true);
    if (!(many.length >= 1 && field == "chk_org") || dataItem.chk_org == true) {
      if (field == "chk_org" || field == "chk_tar") {
        const newData = mainDataResult.data.map((item) =>
          item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
            ? {
                ...item,
                chk_org:
                  typeof item.chk_org == "boolean"
                    ? item.chk_org
                    : item.chk_org == "Y"
                    ? true
                    : false,
                chk_tar:
                  typeof item.chk_tar == "boolean"
                    ? item.chk_tar
                    : item.chk_tar == "Y"
                    ? true
                    : false,
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
    }
  };

  const exitEdit2 = () => {
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

  const onCopyClick = (e: any) => {
    if (!permissions.save) return;
    if (
      !window.confirm(
        "공정 복사 처리 하시겠습니까?\n(주의, 대상의 공정은 삭제됩니다)"
      )
    ) {
      return false;
    }
    const datas = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    const chk_org = mainDataResult.data.filter(
      (item) => item.chk_org == true
    )[0];
    const chk_tar = mainDataResult.data.filter((item) => item.chk_tar == true);

    if (chk_org != undefined && chk_tar != undefined) {
      let chk_tar_s: any[] = [];
      chk_tar.forEach((item: any, idx: number) => {
        const { itemcd = "" } = item;
        chk_tar_s.push(itemcd);
      });
      setParaData((prev) => ({
        ...prev,
        workType: "COPY",
        orgdiv: sessionOrgdiv,
        prntitemcd: datas.itemcd,
        chk_itemcd_org: chk_org.itemcd,
        chk_itemcd_tar: chk_tar_s.join("|"),
      }));
    } else {
      alert("선택해주세요");
    }
  };

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "D",
    prntitemcd: "",
  });

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult.data.length == 0) {
      alert("데이터가 없습니다.");
    } else {
      const datas = mainDataResult.data.filter(
        (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        prntitemcd: datas.itemcd,
      }));
    }
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_PR_A0040W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_rowstatus_s": "",
      "@p_orgdiv": sessionOrgdiv,
      "@p_prntitemcd": paraDataDeleted.prntitemcd,
      "@p_seq_s": "",
      "@p_itemcd_s": "",
      "@p_proccd_s": "",
      "@p_procseq_s": "",
      "@p_remark_s": "",
      "@p_outprocyn_s": "",
      "@p_stdtime_s": "",
      "@p_procqty_s": "",
      "@p_procunit_s": "",
      "@p_workcnt_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "PR_A0040W",
      "@p_chk_itemcd_org": "",
      "@p_chk_itemcd_tar": "",
    },
  };

  useEffect(() => {
    if (paraDataDeleted.prntitemcd != "" && permissions.delete) fetchToDelete();
  }, [paraDataDeleted]);

  const fetchToDelete = async () => {
    if (!permissions.delete) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted =
        mainDataResult.data.length == 1 && filters.pgNum > 1;
      const findRowIndex = mainDataResult.data.findIndex(
        (row: any) =>
          row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      );
      resetAllGrid();
      if (isLastDataDeleted) {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });
      }

      setFilters((prev) => ({
        ...prev,
        find_row_value:
          mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
          undefined
            ? ""
            : mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                .itemcd,
        pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
        isSearch: true,
      }));
      setsubFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    paraDataDeleted.work_type = "D"; //초기화
    paraDataDeleted.prntitemcd = "";
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    subData2Result.data.forEach((item: any, index: number) => {
      if (!selectedsubData2State[item[SUB_DATA_ITEM_KEY2]]) {
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
      data = subData2Result.data[Math.min(...Object2)];
    } else {
      data = subData2Result.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setSubData2Result((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedsubData2State({
      [data != undefined ? data[SUB_DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };

  const [paraData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    rowstatus_s: "",
    orgdiv: sessionOrgdiv,
    prntitemcd: "",
    seq_s: "",
    itemcd_s: "",
    proccd_s: "",
    procseq_s: "",
    remark_s: "",
    outprocyn_s: "",
    stdtime_s: "",
    procqty_s: "",
    procunit_s: "",
    workcnt_s: "",
    userid: userId,
    pc: pc,
    form_id: "PR_A0040W",
    chk_itemcd_org: "",
    chk_itemcd_tar: "",
  });

  const para: Iparameters = {
    procedureName: "P_PR_A0040W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_orgdiv": paraData.orgdiv,
      "@p_prntitemcd": paraData.prntitemcd,
      "@p_seq_s": paraData.seq_s,
      "@p_itemcd_s": paraData.itemcd_s,
      "@p_proccd_s": paraData.proccd_s,
      "@p_procseq_s": paraData.procseq_s,
      "@p_remark_s": paraData.remark_s,
      "@p_outprocyn_s": paraData.outprocyn_s,
      "@p_stdtime_s": paraData.stdtime_s,
      "@p_procqty_s": paraData.procqty_s,
      "@p_procunit_s": paraData.procunit_s,
      "@p_workcnt_s": paraData.workcnt_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "PR_A0040W",
      "@p_chk_itemcd_org": paraData.chk_itemcd_org,
      "@p_chk_itemcd_tar": paraData.chk_itemcd_tar,
    },
  };

  const onSaveClick = async () => {
    if (!permissions.save) return;
    let valid = true;

    const dataItem = subData2Result.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (subData2Result.data.length == 0) {
      alert("데이터가 없습니다.");
      valid = false;
      return false;
    }

    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      seq_s: [],
      itemcd_s: [],
      proccd_s: [],
      procseq_s: [],
      remark_s: [],
      outprocyn_s: [],
      stdtime_s: [],
      procqty_s: [],
      procunit_s: [],
      workcnt_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = "",
        itemcd = "",
        proccd = "",
        procseq = "",
        remark = "",
        outprocyn = "",
        stdtime = "",
        procqty = "",
        procunit = "",
        workcnt = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.itemcd_s.push(itemcd);
      dataArr.proccd_s.push(proccd);
      dataArr.procseq_s.push(procseq);
      dataArr.remark_s.push(remark);
      dataArr.outprocyn_s.push(outprocyn);
      dataArr.stdtime_s.push(stdtime);
      dataArr.procqty_s.push(procqty);
      dataArr.procunit_s.push(procunit);
      dataArr.workcnt_s.push(workcnt);
    });

    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = "",
        itemcd = "",
        proccd = "",
        procseq = "",
        remark = "",
        outprocyn = "",
        stdtime = "",
        procqty = "",
        procunit = "",
        workcnt = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.itemcd_s.push(itemcd);
      dataArr.proccd_s.push(proccd);
      dataArr.procseq_s.push(procseq);
      dataArr.remark_s.push(remark);
      dataArr.outprocyn_s.push(outprocyn);
      dataArr.stdtime_s.push(stdtime);
      dataArr.procqty_s.push(procqty);
      dataArr.procunit_s.push(procunit);
      dataArr.workcnt_s.push(workcnt);
    });
    const datas = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    setParaData((prev) => ({
      ...prev,
      workType: "U",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      orgdiv: sessionOrgdiv,
      prntitemcd: datas.itemcd,
      seq_s: dataArr.seq_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      proccd_s: dataArr.proccd_s.join("|"),
      procseq_s: dataArr.procseq_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      outprocyn_s: dataArr.outprocyn_s.join("|"),
      stdtime_s: dataArr.stdtime_s.join("|"),
      procqty_s: dataArr.procqty_s.join("|"),
      procunit_s: dataArr.procunit_s.join("|"),
      workcnt_s: dataArr.workcnt_s.join("|"),
    }));
  };

  const fetchTodoGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      resetAllGrid();
      setsubFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString.split("|")[0],
        isSearch: true,
      }));
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "",
        rowstatus_s: "",
        orgdiv: sessionOrgdiv,
        prntitemcd: "",
        seq_s: "",
        itemcd_s: "",
        proccd_s: "",
        procseq_s: "",
        remark_s: "",
        outprocyn_s: "",
        stdtime_s: "",
        procqty_s: "",
        procunit_s: "",
        workcnt_s: "",
        userid: userId,
        pc: pc,
        form_id: "PR_A0040W",
        chk_itemcd_org: "",
        chk_itemcd_tar: "",
      });
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (
      (paraData.rowstatus_s != "" ||
        (paraData.chk_itemcd_org != "" && paraData.chk_itemcd_tar != "")) &&
      permissions.save
    ) {
      fetchTodoGridSaved();
    }
  }, [paraData, permissions]);

  type TDataInfo = {
    SUB_DATA_ITEM_KEY2: string;
    selectedsubData2State: {
      [id: string]: boolean | number[];
    };
    dataResult: DataResult;
    setDataResult: (p: any) => any;
  };

  type TArrowBtnClick = {
    direction: string;
    dataInfo: TDataInfo;
  };

  const arrowBtnClickPara = {
    SUB_DATA_ITEM_KEY2: SUB_DATA_ITEM_KEY2,
    selectedsubData2State: selectedsubData2State,
    dataResult: subData2Result,
    setDataResult: setSubData2Result,
  };

  const onArrowsBtnClick = (para: TArrowBtnClick) => {
    const { direction, dataInfo } = para;
    const {
      SUB_DATA_ITEM_KEY2,
      selectedsubData2State,
      dataResult,
      setDataResult,
    } = dataInfo;
    const selectedField = Object.getOwnPropertyNames(selectedsubData2State)[0];

    const rowData = dataResult.data.find(
      (row) => row[SUB_DATA_ITEM_KEY2] == selectedField
    );

    const rowIndex = dataResult.data.findIndex(
      (row) => row[SUB_DATA_ITEM_KEY2] == selectedField
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
        replaceData = dataResult.data[rowIndex - 1].procseq;
      } else {
        replaceData = dataResult.data[rowIndex + 1].procseq;
      }

      newData.splice(rowIndex, 1);
      newData.splice(rowIndex + (direction == "UP" ? -1 : 1), 0, rowData);
      if (direction == "UP" && rowIndex != 0) {
        const newDatas = newData.map((item) =>
          item[SUB_DATA_ITEM_KEY2] == rowData[SUB_DATA_ITEM_KEY2]
            ? {
                ...item,
                procseq: replaceData,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : item[SUB_DATA_ITEM_KEY2] == dataResult.data[rowIndex - 1].num
            ? {
                ...item,
                procseq: rowData.procseq,
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
          item[SUB_DATA_ITEM_KEY2] == rowData[SUB_DATA_ITEM_KEY2]
            ? {
                ...item,
                procseq: replaceData,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : item[SUB_DATA_ITEM_KEY2] == dataResult.data[rowIndex + 1].num
            ? {
                ...item,
                procseq: rowData.procseq,
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

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
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

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>

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
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>품목계정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemacnt"
                    value={filters.itemacnt}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>공정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="proccd2"
                    value={filters.proccd2}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>등록여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="gubun"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      {isMobile ? (
        <Swiper
          onSwiper={(swiper) => {
            setSwiper(swiper);
          }}
          onActiveIndexChange={(swiper) => {
            index = swiper.activeIndex;
          }}
        >
          <SwiperSlide key={0}>
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer">
                <ButtonContainer style={{ justifyContent: "space-between" }}>
                  <GridTitle>요약정보</GridTitle>
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(1);
                      }
                    }}
                    icon="chevron-right"
                    themeColor={"primary"}
                    fillMode={"flat"}
                  ></Button>
                </ButtonContainer>
                <ButtonContainer>
                  <Button
                    onClick={onCopyClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="copy"
                    disabled={permissions.save ? false : true}
                  >
                    공정복사
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                    disabled={permissions.delete ? false : true}
                  >
                    공정삭제
                  </Button>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    disabled={permissions.save ? false : true}
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="표준공정도"
              >
                <Grid
                  style={{
                    height: mobileheight,
                  }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      invunit: qtyunitListData.find(
                        (item: any) => item.sub_code == row.invunit
                      )?.code_name,
                      itemacnt: itemacntListData.find(
                        (item: any) => item.sub_code == row.itemacnt
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
                  onItemChange={onMainItemChange}
                  cellRender={customCellRender2}
                  rowRender={customRowRender2}
                  editField={EDIT_FIELD}
                >
                  <GridColumn
                    field="chk_org"
                    title="원본"
                    width="45px"
                    cell={CheckBoxCell}
                  />
                  <GridColumn
                    field="chk_tar"
                    title="대상"
                    width="45px"
                    cell={CheckBoxCell}
                  />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell
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
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer2">
                <ButtonContainer style={{ justifyContent: "space-between" }}>
                  <ButtonContainer>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(0);
                        }
                      }}
                      icon="chevron-left"
                      themeColor={"primary"}
                      fillMode={"flat"}
                    ></Button>
                    <GridTitle>공정리스트</GridTitle>
                  </ButtonContainer>
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(2);
                      }
                    }}
                    icon="chevron-right"
                    themeColor={"primary"}
                    fillMode={"flat"}
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={subDataResult.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="표준공정도"
              >
                <Grid
                  style={{
                    height: mobileheight2,
                  }}
                  data={filterBy(
                    subDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedsubDataState[idGetter2(row)],
                    })),
                    filter
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
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef2}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onSubDataSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  filterable={true}
                  filter={filter}
                  onFilterChange={(e: GridFilterChangeEvent) => {
                    setFilter(e.filter);
                    setSelectedsubDataState({
                      [filterBy(subDataResult.data, e.filter)[0][
                        SUB_DATA_ITEM_KEY
                      ]]: true,
                    });
                  }}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList2"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              footerCell={
                                item.sortOrder == 0
                                  ? subTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={2}>
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer3">
                <ButtonContainer style={{ justifyContent: "left" }}>
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(1);
                      }
                    }}
                    icon="chevron-left"
                    themeColor={"primary"}
                    fillMode={"flat"}
                  ></Button>
                  <GridTitle>표준공정도</GridTitle>
                </ButtonContainer>
                <ButtonContainer>
                  <Button
                    onClick={onDeleteClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                    disabled={permissions.save ? false : true}
                  />
                  <Button
                    onClick={() =>
                      onArrowsBtnClick({
                        direction: "UP",
                        dataInfo: arrowBtnClickPara,
                      })
                    }
                    fillMode="outline"
                    themeColor={"primary"}
                    title="행 위로 이동"
                    icon="chevron-up"
                    disabled={permissions.save ? false : true}
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
                    disabled={permissions.save ? false : true}
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap border={true} className="FormBoxWrap">
                <FormBox>
                  <tbody>
                    <tr>
                      <th>품목코드</th>
                      <td>
                        <Input
                          name="itemcd"
                          type="text"
                          value={
                            mainDataResult.data.filter(
                              (item) =>
                                item.num ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult.data.filter(
                                  (item) =>
                                    item.num ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].itemcd
                          }
                          className="readonly"
                        />
                      </td>
                      <th>품목명</th>
                      <td>
                        <Input
                          name="itemnm"
                          type="text"
                          value={
                            mainDataResult.data.filter(
                              (item) =>
                                item.num ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult.data.filter(
                                  (item) =>
                                    item.num ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].itemnm
                          }
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <ExcelExport
                data={subData2Result.data}
                ref={(exporter) => {
                  _export3 = exporter;
                }}
                fileName="표준공정도"
              >
                <Grid
                  style={{
                    height: mobileheight3,
                  }}
                  data={process(
                    subData2Result.data.map((row) => ({
                      ...row,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      [SELECTED_FIELD]: selectedsubData2State[idGetter3(row)],
                    })),
                    subData2State
                  )}
                  {...subData2State}
                  onDataStateChange={onSubData2StateChange}
                  //선택 기능
                  dataItemKey={SUB_DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSubData2SelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={subData2Result.total}
                  skip={page3.skip}
                  take={page3.take}
                  pageable={true}
                  onPageChange={pageChange3}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef3}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onSubData2SortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onSubItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList3"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                CustomComboField.includes(item.fieldName)
                                  ? CustomComboBoxCell
                                  : NumberField.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? sub2TotalFooterCell
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
          </SwiperSlide>
        </Swiper>
      ) : (
        <>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>요약정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onCopyClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="copy"
                  disabled={permissions.save ? false : true}
                >
                  공정복사
                </Button>
                <Button
                  onClick={onDeleteClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="delete"
                  disabled={permissions.delete ? false : true}
                >
                  공정삭제
                </Button>
                <Button
                  onClick={onSaveClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  disabled={permissions.save ? false : true}
                >
                  저장
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="표준공정도"
            >
              <Grid
                style={{ height: webheight }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    invunit: qtyunitListData.find(
                      (item: any) => item.sub_code == row.invunit
                    )?.code_name,
                    itemacnt: itemacntListData.find(
                      (item: any) => item.sub_code == row.itemacnt
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
                onItemChange={onMainItemChange}
                cellRender={customCellRender2}
                rowRender={customRowRender2}
                editField={EDIT_FIELD}
              >
                <GridColumn
                  field="chk_org"
                  title="원본"
                  width="45px"
                  cell={CheckBoxCell}
                />
                <GridColumn
                  field="chk_tar"
                  title="대상"
                  width="45px"
                  cell={CheckBoxCell}
                />
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"]
                    ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                    ?.map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            footerCell={
                              item.sortOrder == 0
                                ? mainTotalFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
          <GridContainerWrap>
            <GridContainer width={`25%`}>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>공정리스트</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={subDataResult.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="표준공정도"
              >
                <Grid
                  style={{ height: webheight2 }}
                  data={filterBy(
                    subDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedsubDataState[idGetter2(row)],
                    })),
                    filter
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
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef2}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onSubDataSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  filterable={true}
                  filter={filter}
                  onFilterChange={(e: GridFilterChangeEvent) => {
                    setFilter(e.filter);
                    setSelectedsubDataState({
                      [filterBy(subDataResult.data, e.filter)[0][
                        SUB_DATA_ITEM_KEY
                      ]]: true,
                    });
                  }}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList2"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              footerCell={
                                item.sortOrder == 0
                                  ? subTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(75% - ${GAP}px)`}>
              <GridTitleContainer className="ButtonContainer3">
                <GridTitle>표준공정도</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onDeleteClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                    disabled={permissions.save ? false : true}
                  />
                  <Button
                    onClick={() =>
                      onArrowsBtnClick({
                        direction: "UP",
                        dataInfo: arrowBtnClickPara,
                      })
                    }
                    fillMode="outline"
                    themeColor={"primary"}
                    title="행 위로 이동"
                    icon="chevron-up"
                    disabled={permissions.save ? false : true}
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
                    disabled={permissions.save ? false : true}
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap border={true} className="FormBoxWrap">
                <FormBox>
                  <tbody>
                    <tr>
                      <th>품목코드</th>
                      <td>
                        <Input
                          name="itemcd"
                          type="text"
                          value={
                            mainDataResult.data.filter(
                              (item) =>
                                item.num ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult.data.filter(
                                  (item) =>
                                    item.num ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].itemcd
                          }
                          className="readonly"
                        />
                      </td>
                      <th>품목명</th>
                      <td>
                        <Input
                          name="itemnm"
                          type="text"
                          value={
                            mainDataResult.data.filter(
                              (item) =>
                                item.num ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult.data.filter(
                                  (item) =>
                                    item.num ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].itemnm
                          }
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <ExcelExport
                data={subData2Result.data}
                ref={(exporter) => {
                  _export3 = exporter;
                }}
                fileName="표준공정도"
              >
                <Grid
                  style={{ height: webheight3 }}
                  data={process(
                    subData2Result.data.map((row) => ({
                      ...row,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      [SELECTED_FIELD]: selectedsubData2State[idGetter3(row)],
                    })),
                    subData2State
                  )}
                  {...subData2State}
                  onDataStateChange={onSubData2StateChange}
                  //선택 기능
                  dataItemKey={SUB_DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSubData2SelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={subData2Result.total}
                  skip={page3.skip}
                  take={page3.take}
                  pageable={true}
                  onPageChange={pageChange3}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef3}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onSubData2SortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onSubItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList3"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                CustomComboField.includes(item.fieldName)
                                  ? CustomComboBoxCell
                                  : NumberField.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? sub2TotalFooterCell
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
        </>
      )}

      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"ROW_ADD"}
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

export default PR_A0040W;
