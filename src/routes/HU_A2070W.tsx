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
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
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
  handleKeyPressSearch,
  setDefaultDate,
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
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import {
  heightstate,
  isLoading,
  isMobileState,
  loginResultState,
} from "../store/atoms";
import { gridList } from "../store/columns/HU_A2070W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
var index = 0;

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const dateField = ["dutydt"];
const CheckField = ["lateyn"];
const requiredField = ["orgdiv", "dutydt", "prsnnum"];
const customField = ["orgdiv", "prsnnum"];
let deletedMainRows2: object[] = [];
let targetRowIndex: null | number = null;
let temp2 = 0;
type TdataArr = {
  rowstatus: string[];
  orgdiv: string[];
  dutydt: string[];
  prsnnum: string[];
  shh: string[];
  smm: string[];
  ehh: string[];
  emm: string[];
  remark: string[];
};

//그리드 내부 글씨 색 정의
const customData = [
  {
    color: "blue",
    fontweight: "bold",
  },
  {
    color: "red",
    fontweight: "bold",
  },
  {
    color: "black",
    fontweight: "bold",
  },
  {
    color: "black",
    fontweight: "normal",
  },
];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA001, L_HU250T", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "orgdiv" ? "L_BA001" : field == "prsnnum" ? "L_HU250T" : "";

  const valueField = field == "prsnnum" ? "prsnnum" : undefined;
  const textField = field == "prsnnum" ? "prsnnm" : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      myProp={customData}
      {...props}
    />
  ) : (
    <td />
  );
};

var height = 0;
var height2 = 0;
var height3 = 0;

const HU_A2070W: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_A2070W", setCustomOptionData);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
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
  }, [customOptionData, webheight]);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const pc = UseGetValueFromSessionItem("pc");
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
    }));
    setPage2(initialPageState);

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

  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const userId = UseGetValueFromSessionItem("user_id");
    const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  //커스텀 옵션 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_A2070W", setMessagesData);


  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        orgdiv: defaultOption.find((item: any) => item.id == "orgdiv")
          ?.valueCode,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        rtrchk: defaultOption.find((item: any) => item.id == "rtrchk")
          ?.valueCode,
        prsnnum: defaultOption.find((item: any) => item.id == "prsnnum")
          ?.valueCode,
        latechk: defaultOption.find((item: any) => item.id == "latechk")
          ?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_HU250T",
    //부서, 사업장
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [prsnnumListData, setPrsnnumListData] = React.useState([
    { prsnnum: "", prsnnm: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setPrsnnumListData(getBizCom(bizComponentData, "L_HU250T"));
    }
  }, [bizComponentData]);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

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
    orgdiv: "",
    location: "",
    rtrchk: "",
    prsnnum: "",
    frdt: new Date(),
    todt: new Date(),
    latechk: "",
    dptcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    work_type: "DETAIL",
    prsnnum: "",
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
      procedureName: "P_HU_A2070W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_rtrchk": filters.rtrchk,
        "@p_prsnnum": filters.prsnnum,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_latechk": filters.latechk,
        "@p_dptcd": filters.dptcd,
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
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.prsnnum == filters.find_row_value
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
            : rows.find((row: any) => row.prsnnum == filters.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setPage2(initialPageState);
          setFilters2((prev) => ({
            ...prev,
            prsnnum: selectedRow.prsnnum,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setPage2(initialPageState);
          setFilters2((prev) => ({
            ...prev,
            prsnnum: rows[0].prsnnum,
            isSearch: true,
            pgNum: 1,
          }));
        }
      } else {
        setPage2(initialPageState);
        setMainDataResult2(process([], mainDataState2));
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
  const fetchMainGrid2 = async (filters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A2070W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_rtrchk": filters.rtrchk,
        "@p_prsnnum": filters2.prsnnum,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_latechk": filters.latechk,
        "@p_dptcd": filters.dptcd,
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
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
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
    if (filters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2]);

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
    setPage(initialPageState);
    setPage2(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    const prsnnum = prsnnumListData.find(
      (item: any) => item.prsnnm == selectedRowData.prsnnum
    )?.prsnnum;
    setPage2(initialPageState);
    setFilters2((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
      prsnnum: prsnnum != undefined ? prsnnum : "",
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
      swiper.update();
    }
  };

  const onMainSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "사용자 리스트";
      optionsGridOne.sheets[1].title = "출퇴근 조회";
      _export.save(optionsGridOne);
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
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

  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "HU_A2070W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "HU_A2070W_001");
      } else if (
        filters.orgdiv == null ||
        filters.orgdiv == "" ||
        filters.orgdiv == undefined
      ) {
        throw findMessage(messagesData, "HU_A2070W_002");
      } else {
        resetAllGrid();
        setPage(initialPageState);
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        deletedMainRows2 = [];
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
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

  const enterEdit2 = (dataItem: any, field: string) => {
    if (
      field == "shh" ||
      field == "smm" ||
      field == "ehh" ||
      field == "emm" ||
      field == "remark" ||
      (field == "dutydt" && dataItem.rowstatus == "N")
    ) {
      const newData = mainDataResult2.data.map((item) =>
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

      setTempResult2((prev: { total: any }) => {
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
      setTempResult2((prev: { total: any }) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
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
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult2.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const onSaveClick = () => {
    let valid = true;
    let valid2 = true;
    try {
      const dataItem = mainDataResult2.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });
      dataItem.map((item) => {
        if (
          item.orgdiv == undefined ||
          item.orgdiv == null ||
          item.orgdiv == ""
        ) {
          valid = false;
        }
        if (
          item.dutydt == undefined ||
          item.dutydt == null ||
          item.dutydt == ""
        ) {
          valid = false;
        }
        if (
          item.prsnnum == undefined ||
          item.prsnnum == null ||
          item.prsnnum == ""
        ) {
          valid = false;
        }
        if (item.shh != "") {
          if (!isNaN(item.shh) == false || item.shh.length != 2) {
            valid2 = false;
          } else {
            if (item.shh > 24 || item.shh < 0) {
              valid2 = false;
            }
          }
        }
        if (item.smm != "") {
          if (!isNaN(item.smm) == false || item.smm.length != 2) {
            valid2 = false;
          } else {
            if (item.smm > 60 || item.smm < 0) {
              valid2 = false;
            }
          }
        }
        if (item.ehh != "") {
          if (!isNaN(item.ehh) == false || item.ehh.length != 2) {
            valid2 = false;
          } else {
            if (item.ehh > 24 || item.ehh < 0) {
              valid2 = false;
            }
          }
        }
        if (item.emm != "") {
          if (!isNaN(item.emm) == false || item.emm.length != 2) {
            valid2 = false;
          } else {
            if (item.emm > 60 || item.emm < 0) {
              valid2 = false;
            }
          }
        }
      });
      let dataArr: TdataArr = {
        rowstatus: [],
        orgdiv: [],
        dutydt: [],
        prsnnum: [],
        shh: [],
        smm: [],
        ehh: [],
        emm: [],
        remark: [],
      };
      if (valid2 == true) {
        if (valid == true) {
          if (dataItem.length == 0 && deletedMainRows2.length == 0)
            return false;
          dataItem.forEach((item: any, idx: number) => {
            const {
              rowstatus = "",
              orgdiv = "",
              dutydt = "",
              prsnnum = "",
              shh = "",
              smm = "",
              ehh = "",
              emm = "",
              remark = "",
            } = item;
            dataArr.rowstatus.push(rowstatus);
            dataArr.orgdiv.push(orgdiv);
            dataArr.dutydt.push(dutydt == "99991231" ? "" : dutydt);
            dataArr.prsnnum.push(prsnnum);
            dataArr.shh.push(shh);
            dataArr.smm.push(smm);
            dataArr.ehh.push(ehh);
            dataArr.emm.push(emm);
            dataArr.remark.push(remark);
          });
          deletedMainRows2.forEach((item: any, idx: number) => {
            const {
              rowstatus = "",
              orgdiv = "",
              dutydt = "",
              prsnnum = "",
              shh = "",
              smm = "",
              ehh = "",
              emm = "",
              remark = "",
            } = item;
            dataArr.rowstatus.push(rowstatus);
            dataArr.orgdiv.push(orgdiv);
            dataArr.dutydt.push(dutydt == "99991231" ? "" : dutydt);
            dataArr.prsnnum.push(prsnnum);
            dataArr.shh.push(shh);
            dataArr.smm.push(smm);
            dataArr.ehh.push(ehh);
            dataArr.emm.push(emm);
            dataArr.remark.push(remark);
          });
          const datas = mainDataResult.data.filter(
            (item) =>
              item[DATA_ITEM_KEY] ==
              Object.getOwnPropertyNames(selectedState)[0]
          )[0];

          setParaData((prev) => ({
            ...prev,
            rowstatus: dataArr.rowstatus.join("|"),
            orgdiv: datas.orgdiv,
            dutydt: dataArr.dutydt.join("|"),
            prsnnum: datas.prsnnum,
            shh: dataArr.shh.join("|"),
            smm: dataArr.smm.join("|"),
            ehh: dataArr.ehh.join("|"),
            emm: dataArr.emm.join("|"),
            remark: dataArr.remark.join("|"),
          }));
        } else {
          alert("필수항목을 채워주세요.");
        }
      } else {
        alert("시간 형식을 맞춰주세요.(ex. 09 )");
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "S",
    userid: userId,
    orgdiv: "",
    dutydt: "",
    prsnnum: "",
    shh: "",
    smm: "",
    ehh: "",
    emm: "",
    rowstatus: "",
    remark: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A2070W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_dutydt": ParaData.dutydt,
      "@p_prsnnum": ParaData.prsnnum,
      "@p_shh": ParaData.shh,
      "@p_smm": ParaData.smm,
      "@p_ehh": ParaData.ehh,
      "@p_emm": ParaData.emm,
      "@p_userid": userId,
      "@p_remark": ParaData.remark,
      "@p_row_status": ParaData.rowstatus,
      "@p_pc": pc,
      "@p_form_id": "HU_A2070W",
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
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      setParaData({
        workType: "S",
        userid: userId,
        orgdiv: "",
        dutydt: "",
        prsnnum: "",
        shh: "",
        smm: "",
        ehh: "",
        emm: "",
        rowstatus: "",
        remark: "",
      });
      deletedMainRows2 = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    let valid = true;
    let valid2 = true;
    mainDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedState2[item[DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          if (
            newData2.orgdiv == undefined ||
            newData2.orgdiv == null ||
            newData2.orgdiv == ""
          ) {
            valid = false;
          }
          if (
            newData2.dutydt == undefined ||
            newData2.dutydt == null ||
            newData2.dutydt == ""
          ) {
            valid = false;
          }
          if (
            newData2.prsnnum == undefined ||
            newData2.prsnnum == null ||
            newData2.prsnnum == ""
          ) {
            valid = false;
          }
          if (newData2.shh != "") {
            if (!isNaN(newData2.shh) == false || newData2.shh.length != 2) {
              valid2 = false;
            } else {
              if (newData2.shh > 24 || newData2.shh < 0) {
                valid2 = false;
              }
            }
          }
          if (newData2.smm != "") {
            if (!isNaN(newData2.smm) == false || newData2.smm.length != 2) {
              valid2 = false;
            } else {
              if (newData2.smm > 60 || newData2.smm < 0) {
                valid2 = false;
              }
            }
          }
          if (newData2.ehh != "") {
            if (!isNaN(newData2.ehh) == false || newData2.ehh.length != 2) {
              valid2 = false;
            } else {
              if (newData2.ehh > 24 || newData2.ehh < 0) {
                valid2 = false;
              }
            }
          }
          if (newData2.emm != "") {
            if (!isNaN(newData2.emm) == false || newData2.emm.length != 2) {
              valid2 = false;
            } else {
              if (newData2.emm > 60 || newData2.emm < 0) {
                valid2 = false;
              }
            }
            if (valid == true && valid2 == true) {
              deletedMainRows2.push(newData2);
            }
          }
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object) - 1];
    }
    if (valid2 == true) {
      if (valid == true) {
        //newData 생성
        setMainDataResult2((prev) => ({
          data: newData,
          total: prev.total - Object.length,
        }));
        setSelectedState2({
          [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
        });
      } else {
        alert("필수항목의 형식을 맞춰주세요.");
      }
    } else {
      alert("시간 형식을 맞춰주세요.(ex. 1404 )");
    }
  };

  const onAddClick2 = () => {
    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });
    const datas = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    const newDataItem = {
      [DATA_ITEM_KEY2]: ++temp2,
      b_time: "",
      dayofweek: 0,
      dutydt: convertDateToStr(new Date()),
      ehh: "",
      emm: "",
      lateyn: "",
      orgdiv: datas.orgdiv,
      prsnnum: datas.prsnnum,
      remark: "",
      s_time: "",
      shh: "",
      smm: "",
      workcls: datas.workcls,
      rowstatus: "N",
    };

    setSelectedState2({ [newDataItem.num]: true });
    setPage2((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>출퇴근관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A2070W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>회사구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="orgdiv"
                    value={filters.orgdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
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
              <th>재직여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="rtrchk"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>사용자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="prsnnum"
                    value={filters.prsnnum}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="prsnnm"
                    valueField="prsnnum"
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>기준일자</th>
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
              <th>지각</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="latechk"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>부서</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
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
                style={{
                  width: "100%",
                  overflow: "auto",
                }}
              >
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>사용자 리스트</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="출퇴근관리"
                >
                  <Grid
                    style={{ height: mobileheight }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        prsnnum: prsnnumListData.find(
                          (item: any) => item.prsnnum == row.prsnnum
                        )?.prsnnm,
                        [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
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
                    onSelectionChange={onMainSelectionChange}
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
                    <GridColumn
                      field="prsnnum"
                      title="성명"
                      width="150px"
                      footerCell={mainTotalFooterCell}
                    />
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer
                style={{
                  width: "100%",
                  overflow: "auto",
                }}
              >
                <GridTitleContainer className="ButtonContainer2">
                  {companyCode == "2309DA41" ? (
                    <GridTitle>출퇴근 조회</GridTitle>
                  ) : (
                    <GridTitle>
                      출퇴근 조회(8시반 출근자: 검은색/ 9시 출근자: 파란색 /
                      주말: 빨간색)
                    </GridTitle>
                  )}
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(0);
                        }
                      }}
                      icon="arrow-left"
                      style={{ marginRight: "5px" }}
                    >
                      이전
                    </Button>
                    <div>
                      <Button
                        onClick={onAddClick2}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                        disabled={mainDataResult.total > 0 ? false : true}
                      ></Button>
                      <Button
                        onClick={onDeleteClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                        disabled={mainDataResult.total > 0 ? false : true}
                      ></Button>
                      <Button
                        onClick={onSaveClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="save"
                        title="저장"
                        disabled={mainDataResult.total > 0 ? false : true}
                      ></Button>
                    </div>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="출퇴근관리"
                >
                  <Grid
                    style={{ height: mobileheight2 }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        dutydt: row.dutydt
                          ? new Date(dateformat(row.dutydt))
                          : new Date(dateformat("99991231")),
                        [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
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
                    onSelectionChange={onMainSelectionChange2}
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
                    onItemChange={onMainItemChange2}
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
                      customOptionData.menuCustomColumnOptions["grdList"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
                          (item: any, idx: number) =>
                            item.sortOrder !== -1 && (
                              <GridColumn
                                key={idx}
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                cell={
                                  customField.includes(item.fieldName)
                                    ? CustomComboBoxCell
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : CheckField.includes(item.fieldName)
                                    ? CheckBoxReadOnlyCell
                                    : undefined
                                }
                                headerCell={
                                  requiredField.includes(item.fieldName)
                                    ? RequiredHeader
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 2
                                    ? mainTotalFooterCell2
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
            <GridContainer width="15%">
              <GridTitleContainer>
                <GridTitle>사용자 리스트</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="출퇴근관리"
              >
                <Grid
                  style={{ height: "77vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      prsnnum: prsnnumListData.find(
                        (item: any) => item.prsnnum == row.prsnnum
                      )?.prsnnm,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
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
                  onSelectionChange={onMainSelectionChange}
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
                  <GridColumn
                    field="prsnnum"
                    title="성명"
                    width="150px"
                    footerCell={mainTotalFooterCell}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(85% - ${GAP}px)`}>
              <GridTitleContainer>
                {companyCode == "2309DA41" ? (
                  <GridTitle>출퇴근 조회</GridTitle>
                ) : (
                  <GridTitle>
                    출퇴근 조회(8시반 출근자: 검은색/ 9시 출근자: 파란색 / 주말:
                    빨간색)
                  </GridTitle>
                )}
                <ButtonContainer>
                  <Button
                    onClick={onAddClick2}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                    disabled={mainDataResult.total > 0 ? false : true}
                  ></Button>
                  <Button
                    onClick={onDeleteClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                    disabled={mainDataResult.total > 0 ? false : true}
                  ></Button>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                    disabled={mainDataResult.total > 0 ? false : true}
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult2.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="출퇴근관리"
              >
                <Grid
                  style={{ height: "77vh" }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      dutydt: row.dutydt
                        ? new Date(dateformat(row.dutydt))
                        : new Date(dateformat("99991231")),
                      [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
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
                  onSelectionChange={onMainSelectionChange2}
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
                  onItemChange={onMainItemChange2}
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
                    customOptionData.menuCustomColumnOptions["grdList"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                customField.includes(item.fieldName)
                                  ? CustomComboBoxCell
                                  : dateField.includes(item.fieldName)
                                  ? DateCell
                                  : CheckField.includes(item.fieldName)
                                  ? CheckBoxReadOnlyCell
                                  : undefined
                              }
                              headerCell={
                                requiredField.includes(item.fieldName)
                                  ? RequiredHeader
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 2
                                  ? mainTotalFooterCell2
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

export default HU_A2070W;
