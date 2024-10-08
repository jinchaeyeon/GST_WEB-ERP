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
import { Input } from "@progress/kendo-react-inputs";
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
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  dateformat,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  numberWithCommas,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import DetailWindow from "../components/Windows/BA_A0100W_Window";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/BA_A0100W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var index = 0;

const DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];
let temp = 0;
let temp2 = 0;
const CustomComboField = ["roomdiv", "animalkind", "testpart"];
const checkField = ["inspect_yn", "use_yn", "calculate_yn"];
const numberField = ["cageqty"];
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  // 화폐단위
  UseBizComponent("L_BA006_603, L_BA173, L_BA171", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "roomdiv"
      ? "L_BA006_603"
      : field == "animalkind"
      ? "L_BA173"
      : field == "testpart"
      ? "L_BA171"
      : "";

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td></td>
  );
};

var height = 0;
var height2 = 0;
var height3 = 0;

const BA_A0100W: React.FC = () => {
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
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });

  UsePermissions(setPermissions);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        roomdiv: defaultOption.find((item: any) => item.id == "roomdiv")
          ?.valueCode,
        animalkind: defaultOption.find((item: any) => item.id == "animalkind")
          ?.valueCode,
        testpart: defaultOption.find((item: any) => item.id == "testpart")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [subDataState, setSubDataState] = useState<State>({
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

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);

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

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    roomnum: "",
    roomdiv: "",
    animalkind: "",
    testpart: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    roomcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });

    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));

    setPage2(initialPageState);
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0100W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_roomdiv": filters.roomdiv,
        "@p_roomcd": "",
        "@p_roomnum": filters.roomnum,
        "@p_animalkind": filters.animalkind,
        "@p_testpart": filters.testpart,
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
            (row: any) => row.roomcd == filters.find_row_value
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
      if (totalRowCnt >= 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.roomcd == filters.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            roomcd: selectedRow.roomcd,
            isSearch: true,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            roomcd: rows[0].roomcd,
            isSearch: true,
          }));
        }
      }
    } else {
      console.log("[에러발생]");
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
  const fetchSubGrid = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters2: Iparameters = {
      procedureName: "P_BA_A0100W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_roomdiv": filters.roomdiv,
        "@p_roomcd": filters2.roomcd,
        "@p_roomnum": filters.roomnum,
        "@p_animalkind": filters.animalkind,
        "@p_testpart": filters.testpart,
        "@p_find_row_value": filters2.find_row_value,
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

      if (filters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.seq == filters2.find_row_value
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

      if (totalRowCnt > 0) {
        const selectedRow =
          filters2.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.seq == filters2.find_row_value);

        if (selectedRow != undefined) {
          setSelectedsubDataState({ [selectedRow[SUB_DATA_ITEM_KEY]]: true });
        } else {
          setSelectedsubDataState({ [rows[0][SUB_DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[에러발생]");
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
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  useEffect(() => {
    if (filters2.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      //SY_A0010W에만 if문사용
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchSubGrid(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [subDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
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
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setPage2(initialPageState);
    setFilters2((prev) => ({
      ...prev,
      roomcd: selectedRowData.roomcd,
      isSearch: true,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
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
      optionsGridOne.sheets[0].title = "기본정보";
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
      <td colSpan={props.colSpan} style={props.style} {...props}>
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
  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {subDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    subDataResult.data.forEach((item) =>
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

  const search = () => {
    deletedMainRows = [];
    deletedMainRows2 = [];
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    resetAllGrid();
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(0);
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

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = subDataResult.data.map((item) =>
        item[SUB_DATA_ITEM_KEY] == dataItem[SUB_DATA_ITEM_KEY]
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
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev) => {
        return {
          data: subDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != subDataResult.data) {
      const newData = subDataResult.data.map((item) =>
        item[SUB_DATA_ITEM_KEY] ==
        Object.getOwnPropertyNames(selectedsubDataState)[0]
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
      setTempResult2((prev) => {
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
      subDataResult,
      setSubDataResult,
      SUB_DATA_ITEM_KEY
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
      animalkind: "",
      area: "",
      calculate_yn: "Y",
      inspect_yn: "Y",
      load_place: "",
      remark: "",
      roomcd: "",
      roomdiv: "",
      roomnum: "",
      testpart: "",
      use_yn: "Y",
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

  const onAddClick2 = () => {
    subDataResult.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });
    const data = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    const newDataItem = {
      [SUB_DATA_ITEM_KEY]: ++temp2,
      cageqty: 0,
      lacno: "",
      remark: "",
      roomcd: data.roomcd,
      use_yn: "Y",
      rowstatus: "N",
    };

    setSubDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage2((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setSelectedsubDataState({ [newDataItem[SUB_DATA_ITEM_KEY]]: true });
  };

  const onAddData = (number: number) => {
    subDataResult.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });
    const data = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    for (var i = 0; i < number; i++) {
      const newDataItem = {
        [SUB_DATA_ITEM_KEY]: ++temp2,
        cageqty: 0,
        lacno: "",
        remark: "",
        roomcd: data.roomcd,
        use_yn: "Y",
        rowstatus: "N",
      };

      setSubDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      setPage2((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 1,
      }));
      setSelectedsubDataState({ [newDataItem[SUB_DATA_ITEM_KEY]]: true });
    }
  };
  const [paraData, setParaData] = useState({
    workType: "LIST_N",
    user_id: userId,
    form_id: "BA_A0100W",
    pc: pc,
    orgdiv: sessionOrgdiv,
    roomcd: "",
    rowstatus_s: "",
    roomcd_s: "",
    roomnum_s: "",
    roomdiv_s: "",
    load_place_s: "",
    area_s: "",
    animalkind_s: "",
    testpart_s: "",
    inspect_yn_s: "",
    use_yn_s: "",
    calculate_yn_s: "",
    remark_s: "",
    seq_s: "",
    lacno_s: "",
    cageqty_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_BA_A0100W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_roomcd": paraData.roomcd,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_roomcd_s": paraData.roomcd_s,
      "@p_roomnum_s": paraData.roomnum_s,
      "@p_roomdiv_s": paraData.roomdiv_s,
      "@p_load_place_s": paraData.load_place_s,
      "@p_area_s": paraData.area_s,
      "@p_animalkind_s": paraData.animalkind_s,
      "@p_testpart_s": paraData.testpart_s,
      "@p_inspect_yn_s": paraData.inspect_yn_s,
      "@p_use_yn_s": paraData.use_yn_s,
      "@p_calculate_yn_s": paraData.calculate_yn_s,
      "@p_remark_s": paraData.remark_s,
      "@p_seq_s": paraData.seq_s,
      "@p_lacno_s": paraData.lacno_s,
      "@p_cageqty_s": paraData.cageqty_s,
      "@p_userid": paraData.user_id,
      "@p_form_id": paraData.form_id,
      "@p_pc": paraData.pc,
    },
  };

  type TdataArr = {
    rowstatus_s: string[];
    roomcd_s: string[];
    roomnum_s: string[];
    roomdiv_s: string[];
    load_place_s: string[];
    area_s: string[];
    animalkind_s: string[];
    testpart_s: string[];
    inspect_yn_s: string[];
    use_yn_s: string[];
    calculate_yn_s: string[];
    remark_s: string[];
    seq_s: string[];
    lacno_s: string[];
    cageqty_s: string[];
  };

  const onSaveClick = async () => {
    if (!permissions.save) return;
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      roomcd_s: [],
      roomnum_s: [],
      roomdiv_s: [],
      load_place_s: [],
      area_s: [],
      animalkind_s: [],
      testpart_s: [],
      inspect_yn_s: [],
      use_yn_s: [],
      calculate_yn_s: [],
      remark_s: [],
      seq_s: [],
      lacno_s: [],
      cageqty_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        roomcd = "",
        roomnum = "",
        roomdiv = "",
        load_place = "",
        area = "",
        animalkind = "",
        testpart = "",
        inspect_yn = "",
        use_yn = "",
        calculate_yn = "",
        remark = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.roomcd_s.push(roomcd);
      dataArr.roomnum_s.push(roomnum);
      dataArr.roomdiv_s.push(roomdiv);
      dataArr.load_place_s.push(load_place);
      dataArr.area_s.push(area);
      dataArr.animalkind_s.push(animalkind);
      dataArr.testpart_s.push(testpart);
      dataArr.inspect_yn_s.push(
        inspect_yn == true ? "Y" : inspect_yn == false ? "N" : inspect_yn
      );
      dataArr.use_yn_s.push(
        use_yn == true ? "Y" : use_yn == false ? "N" : use_yn
      );
      dataArr.calculate_yn_s.push(
        calculate_yn == true ? "Y" : calculate_yn == false ? "N" : calculate_yn
      );
      dataArr.remark_s.push(remark);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        roomcd = "",
        roomnum = "",
        roomdiv = "",
        load_place = "",
        area = "",
        animalkind = "",
        testpart = "",
        inspect_yn = "",
        use_yn = "",
        calculate_yn = "",
        remark = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.roomcd_s.push(roomcd);
      dataArr.roomnum_s.push(roomnum);
      dataArr.roomdiv_s.push(roomdiv);
      dataArr.load_place_s.push(load_place);
      dataArr.area_s.push(area);
      dataArr.animalkind_s.push(animalkind);
      dataArr.testpart_s.push(testpart);
      dataArr.inspect_yn_s.push(
        inspect_yn == true ? "Y" : inspect_yn == false ? "N" : inspect_yn
      );
      dataArr.use_yn_s.push(
        use_yn == true ? "Y" : use_yn == false ? "N" : use_yn
      );
      dataArr.calculate_yn_s.push(
        calculate_yn == true ? "Y" : calculate_yn == false ? "N" : calculate_yn
      );
      dataArr.remark_s.push(remark);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "LIST_N",
      user_id: userId,
      form_id: "AC_A0100W",
      pc: pc,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      roomcd_s: dataArr.roomcd_s.join("|"),
      roomnum_s: dataArr.roomnum_s.join("|"),
      roomdiv_s: dataArr.roomdiv_s.join("|"),
      load_place_s: dataArr.load_place_s.join("|"),
      area_s: dataArr.area_s.join("|"),
      animalkind_s: dataArr.animalkind_s.join("|"),
      testpart_s: dataArr.testpart_s.join("|"),
      inspect_yn_s: dataArr.inspect_yn_s.join("|"),
      use_yn_s: dataArr.use_yn_s.join("|"),
      calculate_yn_s: dataArr.calculate_yn_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
    }));
  };

  const onSaveClick2 = async () => {
    if (!permissions.save) return;
    const dataItem = subDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedMainRows2.length == 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      roomcd_s: [],
      roomnum_s: [],
      roomdiv_s: [],
      load_place_s: [],
      area_s: [],
      animalkind_s: [],
      testpart_s: [],
      inspect_yn_s: [],
      use_yn_s: [],
      calculate_yn_s: [],
      remark_s: [],
      seq_s: [],
      lacno_s: [],
      cageqty_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        roomcd = "",
        remark = "",
        seq = "",
        lacno = "",
        cageqty = "",
        use_yn = "",
      } = item;

      dataArr.roomcd_s.push(roomcd);
      dataArr.remark_s.push(remark);
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.lacno_s.push(lacno);
      dataArr.cageqty_s.push(cageqty);
      dataArr.use_yn_s.push(
        use_yn == true ? "Y" : use_yn == false ? "N" : use_yn
      );
    });
    deletedMainRows2.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        roomcd = "",
        remark = "",
        seq = "",
        lacno = "",
        cageqty = "",
        use_yn = "",
      } = item;

      dataArr.roomcd_s.push(roomcd);
      dataArr.remark_s.push(remark);
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.lacno_s.push(lacno);
      dataArr.cageqty_s.push(cageqty);
      dataArr.use_yn_s.push(
        use_yn == true ? "Y" : use_yn == false ? "N" : use_yn
      );
    });
    const data = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    setParaData((prev) => ({
      ...prev,
      workType: "DETAIL_N",
      user_id: userId,
      form_id: "AC_A0100W",
      pc: pc,
      roomcd: data.roomcd,
      roomcd_s: dataArr.roomcd_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      seq_s: dataArr.seq_s.join("|"),
      lacno_s: dataArr.lacno_s.join("|"),
      cageqty_s: dataArr.cageqty_s.join("|"),
      use_yn_s: dataArr.use_yn_s.join("|"),
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
      if (paraData.workType == "LIST_N") {
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
          setFilters((prev: any) => ({
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
          setFilters((prev: any) => ({
            ...prev,
            find_row_value: data.returnString.split("|")[0],
            pgNum: prev.pgNum,
            isSearch: true,
          }));
        }
      } else {
        const isLastDataDeleted =
          subDataResult.data.length == 0 && filters2.pgNum > 1;

        if (isLastDataDeleted) {
          setPage2({
            skip:
              filters2.pgNum == 1 || filters2.pgNum == 0
                ? 0
                : PAGE_SIZE * (filters2.pgNum - 2),
            take: PAGE_SIZE,
          });
          setFilters2((prev: any) => ({
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
          setFilters2((prev: any) => ({
            ...prev,
            find_row_value: data.returnString.split("|")[1],
            pgNum: prev.pgNum,
            isSearch: true,
          }));
        }
      }

      setParaData({
        workType: "LIST_N",
        user_id: userId,
        form_id: "AC_A0100W",
        pc: pc,
        orgdiv: sessionOrgdiv,
        roomcd: "",
        rowstatus_s: "",
        roomcd_s: "",
        roomnum_s: "",
        roomdiv_s: "",
        load_place_s: "",
        area_s: "",
        animalkind_s: "",
        testpart_s: "",
        inspect_yn_s: "",
        use_yn_s: "",
        calculate_yn_s: "",
        remark_s: "",
        seq_s: "",
        lacno_s: "",
        cageqty_s: "",
      });
      deletedMainRows = [];
      deletedMainRows2 = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.rowstatus_s != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [paraData, permissions]);

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
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
    //newData 생성
    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    subDataResult.data.forEach((item: any, index: number) => {
      if (!selectedsubDataState[item[SUB_DATA_ITEM_KEY]]) {
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
      data = subDataResult.data[Math.min(...Object2)];
    } else {
      data = subDataResult.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setSubDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedsubDataState({
      [data != undefined ? data[SUB_DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onAddClick3 = () => {
    setDetailWindowVisible(true);
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
              <th>룸번호</th>
              <td>
                <Input
                  name="roomnum"
                  type="text"
                  value={filters.roomnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="roomdiv"
                    value={filters.roomdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>동물종</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="animalkind"
                    value={filters.animalkind}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>시험파트</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="testpart"
                    value={filters.testpart}
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
              <GridContainer style={{ width: "100%", overflow: "auto" }}>
                <GridTitleContainer className="ButtonContainer">
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
                    _export = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: mobileheight }}
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
                                  CustomComboField.includes(item.fieldName)
                                    ? CustomComboBoxCell
                                    : checkField.includes(item.fieldName)
                                    ? CheckBoxCell
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
            <SwiperSlide
              key={1}
              style={{
                display: "flex",
                flexDirection: "column",
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
                      onClick={onAddClick3}
                      themeColor={"primary"}
                      icon="file-add"
                      disabled={permissions.save ? false : true}
                    >
                      일괄생성
                    </Button>
                    <Button
                      onClick={onAddClick2}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                      disabled={permissions.save ? false : true}
                    ></Button>
                    <Button
                      onClick={onDeleteClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                      disabled={permissions.save ? false : true}
                    ></Button>
                    <Button
                      onClick={onSaveClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                      disabled={permissions.save ? false : true}
                    ></Button>
                  </div>
                </ButtonContainer>
              </GridTitleContainer>
              <GridContainer
                style={{
                  width: "100%",
                }}
              >
                <ExcelExport
                  data={subDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: mobileheight2 }}
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
                    //incell 수정 기능
                    onItemChange={onSubItemChange}
                    cellRender={customCellRender2}
                    rowRender={customRowRender2}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn
                      field="rowstatus"
                      title=" "
                      width="50px"
                      editable={false}
                    />
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
                                cell={
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : checkField.includes(item.fieldName)
                                    ? CheckBoxCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? subTotalFooterCell
                                    : numberField.includes(item.fieldName)
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
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width={`65%`}>
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>기본정보</GridTitle>
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
                  _export = exporter;
                }}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: webheight }}
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
                                CustomComboField.includes(item.fieldName)
                                  ? CustomComboBoxCell
                                  : checkField.includes(item.fieldName)
                                  ? CheckBoxCell
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
            <GridContainer width={`calc(35% - ${GAP}px)`}>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>상세정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick3}
                    themeColor={"primary"}
                    icon="file-add"
                    disabled={permissions.save ? false : true}
                  >
                    일괄생성
                  </Button>
                  <Button
                    onClick={onAddClick2}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                    disabled={permissions.save ? false : true}
                  ></Button>
                  <Button
                    onClick={onDeleteClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                    disabled={permissions.save ? false : true}
                  ></Button>
                  <Button
                    onClick={onSaveClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                    disabled={permissions.save ? false : true}
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={subDataResult.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: webheight2 }}
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
                  //incell 수정 기능
                  onItemChange={onSubItemChange}
                  cellRender={customCellRender2}
                  rowRender={customRowRender2}
                  editField={EDIT_FIELD}
                >
                  <GridColumn
                    field="rowstatus"
                    title=" "
                    width="50px"
                    editable={false}
                  />
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
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : checkField.includes(item.fieldName)
                                  ? CheckBoxCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? subTotalFooterCell
                                  : numberField.includes(item.fieldName)
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
      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          setData={onAddData}
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

export default BA_A0100W;
