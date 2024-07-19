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
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
  toDate,
  useSysMessage,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/BA_A0070W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var index = 0;
let temp = 0;
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
  const bizComponentIdVal = field == "amtunit" ? "L_BA020" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td></td>
  );
};
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

var height = 0;
var height2 = 0;
var height3 = 0;

const BA_A0070W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [swiper, setSwiper] = useState<SwiperCore>();

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height3);
        setMobileHeight2(getDeviceHeight(true) - height2 - height3);
        setWebHeight(getDeviceHeight(true) - height - height3);
        setWebHeight2(getDeviceHeight(true) - height2 - height3);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
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

    setSubFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });

    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));

    setPage(initialPageState);
  };

  const userId = UseGetValueFromSessionItem("user_id");

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });

  UsePermissions(setPermissions);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setSubFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        site: defaultOption.find((item: any) => item.id == "site")?.valueCode,
        amtunit: defaultOption.find((item: any) => item.id == "amtunit")
          ?.valueCode,
        isSearch: true,
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
      setSiteListData(getBizCom(bizComponentData, "L_SA010"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [subDataState, setSubDataState] = useState<State>({
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
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setSubFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [subfilters, setSubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "BASEDT",
    frdt: new Date(),
    todt: new Date(),
    amtunit: "",
    wonchgrat: "",
    uschgrat: "",
    baseamt: "",
    site: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    frdt: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  //그리드 데이터 조회
  const fetchSubGrid = async (subfilters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0070W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": subfilters.workType,
        "@p_frdt": convertDateToStr(subfilters.frdt),
        "@p_todt": convertDateToStr(subfilters.todt),
        "@p_amtunit": subfilters.amtunit,
        "@p_wonchgrat": subfilters.wonchgrat,
        "@p_uschgrat": subfilters.uschgrat,
        "@p_baseamt": subfilters.baseamt,
        "@p_find_row_value": subfilters.find_row_value,
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

      if (subfilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.basedt == subfilters.find_row_value
          );
          targetRowIndex2 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage2({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef2.current) {
          targetRowIndex2 = 0;
        }
      }
      setSubDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt >= 0) {
        const selectedRow =
          subfilters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.basedt == subfilters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedsubDataState({ [selectedRow[SUB_DATA_ITEM_KEY]]: true });

          setFilters((prev) => ({
            ...prev,
            workType: "Q",
            frdt: toDate(selectedRow.basedt),
            isSearch: true,
          }));
        } else {
          setSelectedsubDataState({ [rows[0][SUB_DATA_ITEM_KEY]]: true });

          setFilters((prev) => ({
            ...prev,
            workType: "Q",
            frdt: toDate(rows[0].basedt),
            isSearch: true,
          }));
        }
      } else {
        setMainDataResult(process([], mainDataState));
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
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters2: Iparameters = {
      procedureName: "P_BA_A0070W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(subfilters.todt),
        "@p_amtunit": subfilters.amtunit,
        "@p_wonchgrat": subfilters.wonchgrat,
        "@p_uschgrat": subfilters.uschgrat,
        "@p_baseamt": subfilters.baseamt,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.basedt + "_" + row.amtunit == filters.find_row_value
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
                  row.basedt + "_" + row.amtunit == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
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
      setSubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters, permissions, bizComponentData, customOptionData]);

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

  //그리드 리셋
  const resetAllGrid = () => {
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
    setPage(initialPageState);
    setFilters((prev) => ({
      ...prev,
      workType: "Q",
      frdt: toDate(selectedRowData.basedt),
      pgNum: 1,
      isSearch: true,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  //엑셀 내보내기
  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "기준일자";
      optionsGridOne.sheets[1].title = "상세정보";
      _export.save(optionsGridOne);
    }
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
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const SubTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
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
        convertDateToStr(subfilters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(subfilters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(subfilters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(subfilters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "BA_A0070W_002");
      } else if (
        convertDateToStr(subfilters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(subfilters.todt).substring(6, 8) > "31" ||
        convertDateToStr(subfilters.todt).substring(6, 8) < "01" ||
        convertDateToStr(subfilters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "BA_A0070W_002");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState); // 페이지 초기화
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
        }));
        setSubFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        deletedMainRows = [];
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
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
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      amtunit: subfilters.amtunit,
      amtyn: 0,
      baseamt: 0,
      basedt: convertDateToStr(new Date()),
      codeyn: "Y",
      remark: "",
      uschgrat: 0,
      wonchgrat: 0,
      rowstatus: "N",
    };
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
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
    if (!permissions.save) return;
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
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    const dataItem2 = mainDataResult.data.filter((item: any) => {
      return item.rowstatus == "N";
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
    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
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
    if (!permissions.save && paraData.workType != "D") return;
    if (!permissions.delete && paraData.workType == "D") return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted2 =
        subDataResult.data.length == 1 && subfilters.pgNum > 0;
      if (paraData.workType == "SAVE") {
        const isLastDataDeleted =
          mainDataResult.data.length == 0 && filters.pgNum > 0;

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
          }));
          if (isLastDataDeleted2 == true) {
            setPage2({
              skip:
                subfilters.pgNum == 1 || subfilters.pgNum == 0
                  ? 0
                  : PAGE_SIZE * (subfilters.pgNum - 2),
              take: PAGE_SIZE,
            });
            setSubFilters((prev) => ({
              ...prev,
              find_row_value: data.returnString.split("|")[0],
              pgNum: isLastDataDeleted2
                ? prev.pgNum != 1
                  ? prev.pgNum - 1
                  : prev.pgNum
                : prev.pgNum,
              isSearch: true,
            }));
          } else {
            setSubFilters((prev) => ({
              ...prev,
              find_row_value: data.returnString.split("|")[0],
              isSearch: true,
            }));
          }
        } else {
          const findRow = mainDataResult.data.filter(
            (row: any) =>
              row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          )[0];
          setFilters((prev) => ({
            ...prev,
            find_row_value:
              findRow == undefined
                ? ""
                : findRow.basedt + "_" + findRow.amtunit,
          }));
          if (isLastDataDeleted2 == true) {
            setPage2({
              skip:
                subfilters.pgNum == 1 || subfilters.pgNum == 0
                  ? 0
                  : PAGE_SIZE * (subfilters.pgNum - 2),
              take: PAGE_SIZE,
            });
            setSubFilters((prev) => ({
              ...prev,
              find_row_value: data.returnString.split("|")[0],
              pgNum: isLastDataDeleted2 ? prev.pgNum - 1 : prev.pgNum,
              isSearch: true,
            }));
          } else {
            setSubFilters((prev) => ({
              ...prev,
              find_row_value: data.returnString.split("|")[0],
              isSearch: true,
            }));
          }
        }
      }
      if (paraData.workType == "D") {
        const findRowIndex = subDataResult.data.findIndex(
          (row: any) =>
            row[SUB_DATA_ITEM_KEY] ==
            Object.getOwnPropertyNames(selectedsubDataState)[0]
        );
        if (isLastDataDeleted2) {
          setPage2({
            skip:
              subfilters.pgNum == 1 || subfilters.pgNum == 0
                ? 0
                : PAGE_SIZE * (subfilters.pgNum - 2),
            take: PAGE_SIZE,
          });
          setSubFilters((prev) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted2 ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
        } else {
          setSubFilters((prev) => ({
            ...prev,
            find_row_value:
              subDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
              undefined
                ? ""
                : subDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                    .basedt,
            pgNum: isLastDataDeleted2 ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
        }
      }
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
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.rowstatus != "" && permissions.save) {
      fetchTodoGridSaved();
    }
    if (paraData.workType == "D" && permissions.delete) {
      fetchTodoGridSaved();
    }
  }, [paraData, permissions]);

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let ObjectArray: any[] = [];
    let ObjectArray2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        ObjectArray2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
        ObjectArray.push(index);
      }
    });
    if (Math.min(...ObjectArray) < Math.min(...ObjectArray2)) {
      data = mainDataResult.data[Math.min(...ObjectArray2)];
    } else {
      data = mainDataResult.data[Math.min(...ObjectArray) - 1];
    }

    //newData 생성
    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick2 = (e: any) => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (subDataResult.data.length == 0) {
      alert("데이터가 없습니다");
    } else {
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
    }
  };

  const onSite = () => {
    let link = "";
    siteListData.map((item) => {
      if (item.sub_code == subfilters.site) {
        link = item.memo;
      }
    });

    window.open(link, "_blank", "noopener, noreferrer");
  };

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
              <th>기준일</th>
              <td>
                <CommonDateRangePicker
                  value={{
                    start: subfilters.frdt,
                    end: subfilters.todt,
                  }}
                  onChange={(e: { value: { start: any; end: any } }) =>
                    setSubFilters((prev) => ({
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
                    value={subfilters.amtunit}
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
                      value={subfilters.site}
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
                <ButtonContainer>
                  <Button
                    style={{ marginTop: "5px" }}
                    onClick={onDeleteClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    disabled={permissions.delete ? false : true}
                  >
                    기준일삭제
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={subDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="환율관리"
              >
                <Grid
                  style={{ height: mobileheight }}
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
                              cell={DateCell}
                              footerCell={
                                item.sortOrder == 0
                                  ? SubTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide
            key={1}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <GridContainer
              style={{
                width: "100%",
                overflow: "auto",
              }}
            >
              <GridTitleContainer className="ButtonContainer2">
                <ButtonContainer style={{ justifyContent: "space-between" }}>
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(0);
                      }
                    }}
                    icon="arrow-left"
                  >
                    이전
                  </Button>
                  <div>
                    <Button
                      onClick={onAddClick}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                      disabled={permissions.save ? false : true}
                    ></Button>
                    <Button
                      onClick={onDeleteClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                      disabled={permissions.save ? false : true}
                    ></Button>
                    <Button
                      onClick={onSaveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                      disabled={permissions.save ? false : true}
                    ></Button>
                  </div>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="환율관리"
              >
                <Grid
                  style={{ height: mobileheight2 }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      basedt: row.basedt
                        ? new Date(dateformat(row.basedt))
                        : new Date(dateformat("19000101")),
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
        </Swiper>
      ) : (
        <GridContainerWrap>
          <GridContainer width={"15%"}>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>기준일자</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onDeleteClick2}
                  fillMode="outline"
                  themeColor={"primary"}
                  disabled={permissions.delete ? false : true}
                >
                  기준일삭제
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <ExcelExport
              data={subDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="환율관리"
            >
              <Grid
                style={{ height: webheight }}
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
                            cell={DateCell}
                            footerCell={
                              item.sortOrder == 0
                                ? SubTotalFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
          <GridContainer width={`calc(85% - ${GAP}px)`}>
            <GridTitleContainer className="ButtonContainer2">
              <GridTitle>상세정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick}
                  themeColor={"primary"}
                  icon="plus"
                  title="행 추가"
                  disabled={permissions.save ? false : true}
                ></Button>
                <Button
                  onClick={onDeleteClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="minus"
                  title="행 삭제"
                  disabled={permissions.save ? false : true}
                ></Button>
                <Button
                  onClick={onSaveClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  title="저장"
                  disabled={permissions.save ? false : true}
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export2 = exporter;
              }}
              fileName="환율관리"
            >
              <Grid
                style={{ height: webheight2 }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    basedt: row.basedt
                      ? new Date(dateformat(row.basedt))
                      : new Date(dateformat("19000101")),
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
        </GridContainerWrap>
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

export default BA_A0070W;
