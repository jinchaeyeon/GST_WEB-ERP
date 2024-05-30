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
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
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
  UseMessages,
  UsePermissions,
  findMessage,
  getGridItemChangedData,
  getHeight,
  handleKeyPressSearch,
  numberWithCommas
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import {
  heightstate,
  isLoading,
  isMobileState,
  loginResultState,
} from "../store/atoms";
import { gridList } from "../store/columns/CM_A8000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY2 = "num";
const DETAIL_DATA_ITEM_KEY3 = "num";
let deletedMainRows: object[] = [];

const NumberField = ["fnscore", "exptime", "absolutedays"];
const NumberField2 = ["fnscore", "exptime"];
const CustomComboField = [
  "level",
  "DesignPerson",
  "DevPerson",
  "itemlvl1",
  "itemlvl2",
  "itemlvl3",
];
const requiredField = ["valueboxnm"];
const CheckField = ["useyn"];
let temp = 0;
let temp2 = 0;
let temp3 = 0;

let targetRowIndex: null | number = null;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_BA010_GST,L_BA011_GST,L_BA012_GST,L_sysUserMaster_001,L_CM000100_002",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "itemlvl1"
      ? "L_BA010_GST"
      : field == "itemlvl2"
      ? "L_BA011_GST"
      : field == "itemlvl3"
      ? "L_BA012_GST"
      : field == "DesignPerson"
      ? "L_sysUserMaster_001"
      : field == "DevPerson"
      ? "L_sysUserMaster_001"
      : field == "level"
      ? "L_CM000100_002"
      : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  if (bizComponentIdVal == "L_CM000100_002") {
    return bizComponent ? (
      <ComboBoxCell
        bizComponent={bizComponent}
        valueField="code"
        textField="name"
        {...props}
      />
    ) : (
      <td />
    );
  } else if (bizComponentIdVal == "L_sysUserMaster_001") {
    return bizComponent ? (
      <ComboBoxCell
        bizComponent={bizComponent}
        valueField="user_id"
        textField="user_name"
        {...props}
      />
    ) : (
      <td />
    );
  } else {
    return bizComponent ? (
      <ComboBoxCell bizComponent={bizComponent} {...props} />
    ) : (
      <td />
    );
  }
};

const CM_A8000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DETAIL_DATA_ITEM_KEY);
  const idGetter3 = getter(DETAIL_DATA_ITEM_KEY2);
  const idGetter4 = getter(DETAIL_DATA_ITEM_KEY3);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  const [permissions, setPermissions] = useState<TPermissions | null>(null);

  UsePermissions(setPermissions);
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
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

    setFilters1((prev) => ({
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

    setFilters2((prev) => ({
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

    setFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("CM_A8000W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("CM_A8000W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        itemlvl1: defaultOption.find((item: any) => item.id == "itemlvl1")
          ?.valueCode,
        itemlvl2: defaultOption.find((item: any) => item.id == "itemlvl2")
          ?.valueCode,
        itemlvl3: defaultOption.find((item: any) => item.id == "itemlvl3")
          ?.valueCode,
      }));
      setFilters1((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState2, setDetailDataState2] = useState<State>({
    sort: [],
  });
  const [detailDataState3, setDetailDataState3] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailDataState2)
  );
  const [detailDataResult3, setDetailDataResult3] = useState<DataResult>(
    process([], detailDataState3)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailSelectedState2, setDetailSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailSelectedState3, setDetailSelectedState3] = useState<{
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
    workType: "Q",
    orgdiv: sessionOrgdiv,
    valueboxcd: "",
    valueboxnm: "",
    remark2: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    DesignPerson: "",
    DevPerson: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters1, setFilters1] = useState({
    pgSize: PAGE_SIZE,
    workType: "LVL1",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "LVL2",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    workType: "LVL3",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_valueboxcd": filters.valueboxcd,
        "@p_valueboxnm": filters.valueboxnm,
        "@p_remark2": filters.remark2,
        "@p_itemlvl1": filters.itemlvl1,
        "@p_itemlvl2": filters.itemlvl2,
        "@p_itemlvl3": filters.itemlvl3,
        "@p_DesignPerson": filters.DesignPerson,
        "@p_DevPerson": filters.DevPerson,
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
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.valueboxcd == filters.find_row_value
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
            : rows.find((row: any) => row.valueboxcd == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
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
  const fetchMainGrid2 = async (filters1: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters2: Iparameters = {
      procedureName: "P_CM_A8000W_Q",
      pageNumber: filters1.pgNum,
      pageSize: filters1.pgSize,
      parameters: {
        "@p_work_type": filters1.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_valueboxcd": filters.valueboxcd,
        "@p_valueboxnm": filters.valueboxnm,
        "@p_remark2": filters.remark2,
        "@p_itemlvl1": filters.itemlvl1,
        "@p_itemlvl2": filters.itemlvl2,
        "@p_itemlvl3": filters.itemlvl3,
        "@p_DesignPerson": filters.DesignPerson,
        "@p_DevPerson": filters.DevPerson,
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
      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt >= 0) {
        setDetailSelectedState({ [rows[0][DETAIL_DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters1((prev) => ({
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
  const fetchMainGrid3 = async (filters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters3: Iparameters = {
      procedureName: "P_CM_A8000W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_valueboxcd": filters.valueboxcd,
        "@p_valueboxnm": filters.valueboxnm,
        "@p_remark2": filters.remark2,
        "@p_itemlvl1": filters.itemlvl1,
        "@p_itemlvl2": filters.itemlvl2,
        "@p_itemlvl3": filters.itemlvl3,
        "@p_DesignPerson": filters.DesignPerson,
        "@p_DevPerson": filters.DevPerson,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters3);
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

      setDetailDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt >= 0) {
        setDetailSelectedState2({ [rows[0][DETAIL_DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
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

  //그리드 데이터 조회
  const fetchMainGrid4 = async (filters3: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters4: Iparameters = {
      procedureName: "P_CM_A8000W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_valueboxcd": filters.valueboxcd,
        "@p_valueboxnm": filters.valueboxnm,
        "@p_remark2": filters.remark2,
        "@p_itemlvl1": filters.itemlvl1,
        "@p_itemlvl2": filters.itemlvl2,
        "@p_itemlvl3": filters.itemlvl3,
        "@p_DesignPerson": filters.DesignPerson,
        "@p_DevPerson": filters.DevPerson,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters4);
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

      setDetailDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt >= 0) {
        setDetailSelectedState3({ [rows[0][DETAIL_DATA_ITEM_KEY3]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters3((prev) => ({
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
    if (filters1.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters1);
      setFilters1((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters1]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters2]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters3.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters3]);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
    setDetailDataResult2(process([], detailDataState2));
    setDetailDataResult3(process([], detailDataState3));
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

  const ondetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);

    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const ondetailSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState2,
      dataItemKey: DETAIL_DATA_ITEM_KEY2,
    });
    setDetailSelectedState2(newSelectedState);

    if (swiper && isMobile) {
      swiper.slideTo(2);
    }
  };

  const ondetailSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState3,
      dataItemKey: DETAIL_DATA_ITEM_KEY3,
    });
    setDetailSelectedState3(newSelectedState);

    if (swiper && isMobile) {
      swiper.slideTo(3);
    }
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      const optionsGridThree = _export3.workbookOptions();
      const optionsGridFour = _export4.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[2] = optionsGridThree.sheets[0];
      optionsGridOne.sheets[3] = optionsGridFour.sheets[0];
      optionsGridOne.sheets[0].title = "대분류";
      optionsGridOne.sheets[1].title = "중분류";
      optionsGridOne.sheets[2].title = "소분류";
      optionsGridOne.sheets[3].title = "상세정보";
      _export.save(optionsGridOne);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  const onDetailDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setDetailDataState2(event.dataState);
  };
  const onDetailDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setDetailDataState3(event.dataState);
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

  const detailTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = detailDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult3.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = detailDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
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
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange3 = (e: any) => {
    setDetailDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    setFilters1((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    setFilters2((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    setFilters3((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    deletedMainRows = [];
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

      setTempResult((prev: { total: any }) => {
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
      setTempResult((prev: { total: any }) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                useyn:
                  typeof item.useyn == "boolean"
                    ? item.useyn
                    : item.useyn == "Y"
                    ? true
                    : false,
                [EDIT_FIELD]: undefined,
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
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev: { total: any }) => {
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
      DesignPerson: "",
      DevPerson: "",
      absolutedays: 0,
      exptime: 0,
      fnscore: 0,
      itemlvl1: "",
      itemlvl2: "",
      itemlvl3: "",
      level: "",
      orgdiv: sessionOrgdiv,
      remark2: "",
      useyn: "N",
      valBasecode: "",
      valueboxcd: "",
      valueboxnm: "",
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem.num]: true });
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onCopyClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });
    const data = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp2,
      DesignPerson: "",
      DevPerson: "",
      absolutedays: 0,
      exptime: data.exptime,
      fnscore: data.fnscore,
      itemlvl1: data.itemlvl1,
      itemlvl2: data.itemlvl2,
      itemlvl3: data.itemlvl3,
      level: data.level,
      orgdiv: sessionOrgdiv,
      remark2: data.remark2,
      useyn: data.useyn,
      valBasecode: data.valBasecode,
      valueboxcd: "",
      valueboxnm: data.valueboxnm,
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem.num]: true });
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const [paraData, setParaData] = useState({
    workType: "N",
    orgdiv: sessionOrgdiv,
    rowstatus_s: "",
    valueboxcd_s: "",
    valueboxnm_s: "",
    itemlvl1_s: "",
    itemlvl2_s: "",
    itemlvl3_s: "",
    fnscore_s: "",
    level_s: "",
    exptime_s: "",
    useyn_s: "",
    remark2_s: "",
    valBasecode_s: "",
    absolutedays_s: "",
    DesignPerson_s: "",
    DevPerson_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_CM_A8000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_valueboxcd_s": paraData.valueboxcd_s,
      "@p_valueboxnm_s": paraData.valueboxnm_s,
      "@p_itemlvl1_s": paraData.itemlvl1_s,
      "@p_itemlvl2_s": paraData.itemlvl2_s,
      "@p_itemlvl3_s": paraData.itemlvl3_s,
      "@p_fnscore_s": paraData.fnscore_s,
      "@p_level_s": paraData.level_s,
      "@p_exptime_s": paraData.exptime_s,
      "@p_useyn_s": paraData.useyn_s,
      "@p_remark2_s": paraData.remark2_s,
      "@p_valBasecode_s": paraData.valBasecode_s,
      "@p_absolutedays_s": paraData.absolutedays_s,
      "@p_DesignPerson_s": paraData.DesignPerson_s,
      "@p_DevPerson_s": paraData.DevPerson_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "CM_A8000W",
    },
  };

  type TdataArr = {
    rowstatus_s: string[];
    valueboxcd_s: string[];
    valueboxnm_s: string[];
    itemlvl1_s: string[];
    itemlvl2_s: string[];
    itemlvl3_s: string[];
    fnscore_s: string[];
    level_s: string[];
    exptime_s: string[];
    useyn_s: string[];
    remark2_s: string[];
    valBasecode_s: string[];
    absolutedays_s: string[];
    DesignPerson_s: string[];
    DevPerson_s: string[];
  };

  const onSaveClick = async () => {
    let valid = true;
    try {
      mainDataResult.data.map((item: any) => {
        if (item.valueboxnm == "") {
          throw findMessage(messagesData, "CM_A8000W_001");
        }
        mainDataResult.data.map((item2: any) => {
          if (item.valueboxcd == item2.valueboxcd && item.num != item2.num) {
            throw findMessage(messagesData, "CM_A8000W_002");
          }
        });
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

    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      valueboxcd_s: [],
      valueboxnm_s: [],
      itemlvl1_s: [],
      itemlvl2_s: [],
      itemlvl3_s: [],
      fnscore_s: [],
      level_s: [],
      exptime_s: [],
      useyn_s: [],
      remark2_s: [],
      valBasecode_s: [],
      absolutedays_s: [],
      DesignPerson_s: [],
      DevPerson_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        valueboxcd = "",
        valueboxnm = "",
        itemlvl1 = "",
        itemlvl2 = "",
        itemlvl3 = "",
        fnscore = "",
        level = "",
        exptime = "",
        useyn = "",
        remark2 = "",
        valBasecode = "",
        absolutedays = "",
        DesignPerson = "",
        DevPerson = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.valueboxcd_s.push(valueboxcd);
      dataArr.valueboxnm_s.push(valueboxnm);
      dataArr.itemlvl1_s.push(itemlvl1);
      dataArr.itemlvl2_s.push(itemlvl2);
      dataArr.itemlvl3_s.push(itemlvl3);
      dataArr.fnscore_s.push(fnscore);
      dataArr.level_s.push(level);
      dataArr.exptime_s.push(exptime);
      dataArr.useyn_s.push(useyn == true ? "Y" : "N");
      dataArr.remark2_s.push(remark2);
      dataArr.valBasecode_s.push(valBasecode);
      dataArr.absolutedays_s.push(absolutedays);
      dataArr.DesignPerson_s.push(DesignPerson);
      dataArr.DevPerson_s.push(DevPerson);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        valueboxcd = "",
        valueboxnm = "",
        itemlvl1 = "",
        itemlvl2 = "",
        itemlvl3 = "",
        fnscore = "",
        level = "",
        exptime = "",
        useyn = "",
        remark2 = "",
        valBasecode = "",
        absolutedays = "",
        DesignPerson = "",
        DevPerson = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.valueboxcd_s.push(valueboxcd);
      dataArr.valueboxnm_s.push(valueboxnm);
      dataArr.itemlvl1_s.push(itemlvl1);
      dataArr.itemlvl2_s.push(itemlvl2);
      dataArr.itemlvl3_s.push(itemlvl3);
      dataArr.fnscore_s.push(fnscore);
      dataArr.level_s.push(level);
      dataArr.exptime_s.push(exptime);
      dataArr.useyn_s.push(useyn == true ? "Y" : "N");
      dataArr.remark2_s.push(remark2);
      dataArr.valBasecode_s.push(valBasecode);
      dataArr.absolutedays_s.push(absolutedays);
      dataArr.DesignPerson_s.push(DesignPerson);
      dataArr.DevPerson_s.push(DevPerson);
    });

    setParaData((prev) => ({
      ...prev,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      valueboxcd_s: dataArr.valueboxcd_s.join("|"),
      valueboxnm_s: dataArr.valueboxnm_s.join("|"),
      itemlvl1_s: dataArr.itemlvl1_s.join("|"),
      itemlvl2_s: dataArr.itemlvl2_s.join("|"),
      itemlvl3_s: dataArr.itemlvl3_s.join("|"),
      fnscore_s: dataArr.fnscore_s.join("|"),
      level_s: dataArr.level_s.join("|"),
      exptime_s: dataArr.exptime_s.join("|"),
      useyn_s: dataArr.useyn_s.join("|"),
      remark2_s: dataArr.remark2_s.join("|"),
      valBasecode_s: dataArr.valBasecode_s.join("|"),
      absolutedays_s: dataArr.absolutedays_s.join("|"),
      DesignPerson_s: dataArr.DesignPerson_s.join("|"),
      DevPerson_s: dataArr.DevPerson_s.join("|"),
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

    if (data.isSuccess == true) {
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
          find_row_value: data.returnString,
          pgNum: prev.pgNum,
          isSearch: true,
        }));
      }
      setParaData({
        workType: "N",
        orgdiv: sessionOrgdiv,
        rowstatus_s: "",
        valueboxcd_s: "",
        valueboxnm_s: "",
        itemlvl1_s: "",
        itemlvl2_s: "",
        itemlvl3_s: "",
        fnscore_s: "",
        level_s: "",
        exptime_s: "",
        useyn_s: "",
        remark2_s: "",
        valBasecode_s: "",
        absolutedays_s: "",
        DesignPerson_s: "",
        DevPerson_s: "",
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
    if (paraData.rowstatus_s != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

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

  const onItemlvl1Click = (props: any) => {
    const selectedData = props.dataItem;

    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            itemlvl1: selectedData.sub_code,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setTempResult((prev: { total: any }) => {
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
  };
  const onItemlvl2Click = (props: any) => {
    const selectedData = props.dataItem;

    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            itemlvl2: selectedData.sub_code,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setTempResult((prev: { total: any }) => {
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
  };
  const onItemlvl3Click = (props: any) => {
    const selectedData = props.dataItem;

    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            itemlvl3: selectedData.sub_code,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setTempResult((prev: { total: any }) => {
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
  };

  const onPlusClick = async () => {
    if (companyCode == "2207A046") {
      //조회조건 파라미터
      const parameters: Iparameters = {
        procedureName: "P_CM_A8000W_Q",
        pageNumber: 1,
        pageSize: PAGE_SIZE,
        parameters: {
          "@p_work_type": "PGM",
          "@p_orgdiv": filters.orgdiv,
          "@p_valueboxcd": filters.valueboxcd,
          "@p_valueboxnm": filters.valueboxnm,
          "@p_remark2": filters.remark2,
          "@p_itemlvl1": filters.itemlvl1,
          "@p_itemlvl2": filters.itemlvl2,
          "@p_itemlvl3": filters.itemlvl3,
          "@p_DesignPerson": filters.DesignPerson,
          "@p_DevPerson": filters.DevPerson,
          "@p_find_row_value": filters.find_row_value,
        },
      };
      let data: any;
      try {
        data = await processApi<any>("procedure", parameters);
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

        if (totalRowCnt >= 0) {
          rows.map((row: any) => {
            mainDataResult.data.map((item) => {
              if (item.num > temp3) {
                temp3 = item.num;
              }
            });
            const newDataItem = {
              [DATA_ITEM_KEY]: ++temp3,
              DesignPerson: row.DesignPerson,
              DevPerson: row.DevPerson,
              absolutedays: row.absolutedays,
              exptime: row.exptime,
              fnscore: row.fnscore,
              itemlvl1: row.itemlvl1,
              itemlvl2: row.itemlvl2,
              itemlvl3: row.itemlvl3,
              level: row.level,
              orgdiv: row.orgdiv,
              remark2: row.remark2,
              useyn: row.useyn,
              valBasecode: row.valBasecode,
              valueboxcd: row.valueboxcd,
              valueboxnm: row.valueboxnm,
              rowstatus: "N",
            };
            setSelectedState({ [newDataItem.num]: true });
            setPage((prev) => ({
              ...prev,
              skip: 0,
              take: prev.take + 1,
            }));
            setMainDataResult((prev) => {
              return {
                data: [newDataItem, ...prev.data],
                total: prev.total + 1,
              };
            });
          });
        }
      } else {
        console.log("[오류 발생]");
        console.log(data);
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>ValueBox</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="CM_A8000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>ValueBox코드</th>
              <td>
                <Input
                  name="valueboxcd"
                  type="text"
                  value={filters.valueboxcd}
                  onChange={filterInputChange}
                />
              </td>
              <th>ValueBox명</th>
              <td>
                <Input
                  name="valueboxnm"
                  type="text"
                  value={filters.valueboxnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>비고</th>
              <td>
                <Input
                  name="remark2"
                  type="text"
                  value={filters.remark2}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>대분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemlvl1"
                    value={filters.itemlvl1}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>중분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemlvl2"
                    value={filters.itemlvl2}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>소분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemlvl3"
                    value={filters.itemlvl3}
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
                <GridTitle>대분류</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={detailDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="ValueBox"
              >
                <Grid
                  style={{
                    height: deviceHeight - height,
                  }}
                  data={process(
                    detailDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: detailSelectedState[idGetter2(row)],
                    })),
                    detailDataState
                  )}
                  {...detailDataState}
                  onDataStateChange={onDetailDataStateChange}
                  //선택 기능
                  dataItemKey={DETAIL_DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={ondetailSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef2}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onDetailSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onRowDoubleClick={onItemlvl1Click}
                >
                  <GridColumn
                    field="code_name"
                    title="대분류"
                    width="150px"
                    footerCell={detailTotalFooterCell}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={1}>
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>중분류</GridTitle>
                <ButtonContainer style={{ justifyContent: "space-between" }}>
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
                    이전
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={detailDataResult2.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="ValueBox"
              >
                <Grid
                  style={{
                    height: deviceHeight - height2,
                  }}
                  data={process(
                    detailDataResult2.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: detailSelectedState2[idGetter3(row)],
                    })),
                    detailDataState2
                  )}
                  {...detailDataState2}
                  onDataStateChange={onDetailDataStateChange2}
                  dataItemKey={DETAIL_DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={ondetailSelectionChange2}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult2.total}
                  skip={page3.skip}
                  take={page3.take}
                  pageable={true}
                  onPageChange={pageChange3}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef3}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onDetailSortChange2}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onRowDoubleClick={onItemlvl2Click}
                >
                  <GridColumn
                    field="code_name"
                    title="중분류"
                    width="150px"
                    footerCell={detailTotalFooterCell2}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={2}>
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>소분류</GridTitle>
                <ButtonContainer style={{ justifyContent: "space-between" }}>
                  <Button
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(1);
                      }
                    }}
                    icon="arrow-left"
                    themeColor={"primary"}
                    fillMode={"outline"}
                  >
                    이전
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={detailDataResult3.data}
                ref={(exporter) => {
                  _export3 = exporter;
                }}
                fileName="ValueBox"
              >
                <Grid
                  style={{
                    height: deviceHeight - height2,
                  }}
                  data={process(
                    detailDataResult3.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: detailSelectedState3[idGetter4(row)],
                    })),
                    detailDataState3
                  )}
                  {...detailDataState3}
                  onDataStateChange={onDetailDataStateChange3}
                  dataItemKey={DETAIL_DATA_ITEM_KEY3}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={ondetailSelectionChange3}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult3.total}
                  skip={page4.skip}
                  take={page4.take}
                  pageable={true}
                  onPageChange={pageChange4}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef4}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onDetailSortChange3}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onRowDoubleClick={onItemlvl3Click}
                >
                  <GridColumn
                    field="code_name"
                    title="소분류"
                    width="150px"
                    footerCell={detailTotalFooterCell3}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={3}>
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>상세정보</GridTitle>
                <ButtonContainer style={{ justifyContent: "space-between" }}>
                  <Button
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(2);
                      }
                    }}
                    icon="arrow-left"
                    themeColor={"primary"}
                    fillMode={"outline"}
                  >
                    이전
                  </Button>
                  <ButtonContainer>
                    <Button
                      style={{ marginLeft: "10px" }}
                      onClick={onPlusClick}
                      themeColor={"primary"}
                    >
                      [추가]
                    </Button>
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
                      onClick={onCopyClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="copy"
                      title="행 복사"
                    ></Button>
                    <Button
                      onClick={onSaveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                    ></Button>
                  </ButtonContainer>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export4 = exporter;
                }}
                fileName="ValueBox"
              >
                <Grid
                  style={{
                    height: deviceHeight - height2,
                  }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
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
                                  : NumberField.includes(item.fieldName)
                                  ? NumberCell
                                  : CheckField.includes(item.fieldName)
                                  ? CheckBoxCell
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
          <GridContainerWrap>
            <GridContainer width={`13%`}>
              <GridTitleContainer>
                <GridTitle>대분류</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={detailDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="ValueBox"
              >
                <Grid
                  style={{ height: "76.2vh" }}
                  data={process(
                    detailDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: detailSelectedState[idGetter2(row)],
                    })),
                    detailDataState
                  )}
                  {...detailDataState}
                  onDataStateChange={onDetailDataStateChange}
                  //선택 기능
                  dataItemKey={DETAIL_DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={ondetailSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef2}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onDetailSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onRowDoubleClick={onItemlvl1Click}
                >
                  <GridColumn
                    field="code_name"
                    title="대분류"
                    width="150px"
                    footerCell={detailTotalFooterCell}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`13%`}>
              <GridTitleContainer>
                <GridTitle>중분류</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={detailDataResult2.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="ValueBox"
              >
                <Grid
                  style={{ height: "76.2vh" }}
                  data={process(
                    detailDataResult2.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: detailSelectedState2[idGetter3(row)],
                    })),
                    detailDataState2
                  )}
                  {...detailDataState2}
                  onDataStateChange={onDetailDataStateChange2}
                  dataItemKey={DETAIL_DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={ondetailSelectionChange2}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult2.total}
                  skip={page3.skip}
                  take={page3.take}
                  pageable={true}
                  onPageChange={pageChange3}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef3}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onDetailSortChange2}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onRowDoubleClick={onItemlvl2Click}
                >
                  <GridColumn
                    field="code_name"
                    title="중분류"
                    width="150px"
                    footerCell={detailTotalFooterCell2}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`13%`}>
              <GridTitleContainer>
                <GridTitle>소분류</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={detailDataResult3.data}
                ref={(exporter) => {
                  _export3 = exporter;
                }}
                fileName="ValueBox"
              >
                <Grid
                  style={{ height: "76.2vh" }}
                  data={process(
                    detailDataResult3.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: detailSelectedState3[idGetter4(row)],
                    })),
                    detailDataState3
                  )}
                  {...detailDataState3}
                  onDataStateChange={onDetailDataStateChange3}
                  dataItemKey={DETAIL_DATA_ITEM_KEY3}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={ondetailSelectionChange3}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult3.total}
                  skip={page4.skip}
                  take={page4.take}
                  pageable={true}
                  onPageChange={pageChange4}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef4}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onDetailSortChange3}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onRowDoubleClick={onItemlvl3Click}
                >
                  <GridColumn
                    field="code_name"
                    title="소분류"
                    width="150px"
                    footerCell={detailTotalFooterCell3}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(61% - ${GAP * 3}px)`}>
              <GridTitleContainer>
                <GridTitle
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <div>
                    상세정보
                    <Button
                      style={{ marginLeft: "10px" }}
                      onClick={onPlusClick}
                      themeColor={"primary"}
                    >
                      [추가]
                    </Button>
                  </div>
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
                      onClick={onCopyClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="copy"
                      title="행 복사"
                    ></Button>
                    <Button
                      onClick={onSaveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                    ></Button>
                  </ButtonContainer>
                </GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export4 = exporter;
                }}
                fileName="ValueBox"
              >
                <Grid
                  style={{ height: "74.8vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
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
                                  : NumberField.includes(item.fieldName)
                                  ? NumberCell
                                  : CheckField.includes(item.fieldName)
                                  ? CheckBoxCell
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

export default CM_A8000W;
