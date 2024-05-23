import { DataResult, State, process } from "@progress/kendo-data-query";
import { getter } from "@progress/kendo-react-common";
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
import React, { useEffect, useRef, useState } from "react";
// ES2015 module syntax
import { Button } from "@progress/kendo-react-buttons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { NumericTextBox } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  DayView,
  MonthView,
  Scheduler,
  SchedulerDataChangeEvent,
  TimelineView,
  WeekView,
} from "@progress/kendo-react-scheduler";
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
  UsePermissions,
  convertDateToStr,
  convertDateToStrWithTime,
  dateformat,
  findMessage,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  handleKeyPressSearch,
  setDefaultDate
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  OLD_COMPANY,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { FormWithCustomEditor } from "../components/Scheduler/custom-form";
import { CustomEditItem } from "../components/Scheduler/custom-item";
import { CustomItem } from "../components/Scheduler/customItem";
import { useApi } from "../hooks/api";
import {
  OSState,
  heightstate,
  isLoading,
  loginResultState,
} from "../store/atoms";
import { gridList } from "../store/columns/CM_A1600W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let deletedTodoRows: object[] = [];
let deletedTodoRows2: object[] = [];
let temp = 0;
let temp2 = 0;
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

let ok = true;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_APPOINTMENT_COLOR, L_BA400", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "colorID"
      ? "L_APPOINTMENT_COLOR"
      : field == "kind1"
      ? "L_BA400"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    field == "colorID" ? (
      <ComboBoxCell bizComponent={bizComponent} colorprops={true} {...props} />
    ) : (
      <ComboBoxCell bizComponent={bizComponent} {...props} />
    )
  ) : (
    <td />
  );
};

const dateField = ["strtime", "endtime"];
const requiredField = ["contents", "strtime"];
const checkboxField = ["finyn"];
const numberField = ["strhh", "strmm", "endhh", "endmm"];
const comboField = ["colorID", "kind1"];
const requiredField2 = [
  "strtime",
  "strhh",
  "strmm",
  "endtime",
  "endhh",
  "endmm",
  "title",
];

const CM_A1600: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth <= 1200;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
  var height3 = getHeight(".ButtonContainer3");
  var height4 = getHeight(".k-tabstrip-items-wrapper");
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);

  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const processApi = useApi();
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const companyCode = loginResult ? loginResult.companyCode : "";
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const pc = UseGetValueFromSessionItem("pc");
  const [tabSelected, setTabSelected] = useState<number>(0);
  const [orientation, setOrientation] = React.useState<
    "horizontal" | "vertical"
  >("vertical");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setTodoFilter((prev) => ({
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

    setUserFilter((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const [permissions, setPermissions] = useState<TPermissions | null>(
    OLD_COMPANY.includes(companyCode)
      ? {
          view: true,
          save: true,
          delete: true,
          print: true,
        }
      : null
  );

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("CM_A1600W", setMessagesData);
  const [osstate, setOSState] = useRecoilState(OSState);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  if (!OLD_COMPANY.includes(companyCode)) {
    UsePermissions(setPermissions);
    UseCustomOption("CM_A1600W", setCustomOptionData);
  }
  const [colorData, setColorData] = useState<any[]>([]);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001,R_YN,L_APPOINTMENT_COLOR, R_PLANDIV_YN",
    setBizComponentData
  );
  const [userListData, setUserListData] = useState([]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setColorData(getBizCom(bizComponentData, "L_APPOINTMENT_COLOR"));
    }
  }, [bizComponentData]);

  const [todoDataState, setTodoDataState] = useState<State>({
    sort: [],
  });
  const [userDataState, setUserDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [todoDataResult, setTodoDataResult] = useState<DataResult>(
    process([], todoDataState)
  );
  const [userDataResult, setUserDataResult] = useState<DataResult>(
    process([], userDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const defaultData: any[] = [
    {
      id: 0,
      title: "Default Data",
      start: new Date("2021-01-01T08:30:00.000Z"),
      end: new Date("2021-01-01T09:00:00.000Z"),
      colorID: { sub_code: 0, code_name: "없음", color: "" },
      dptcd: { text: "", value: "" },
      person: { text: "", value: "" },
    },
  ];
  const [schedulerDataResult, setSchedulerDataResult] = useState(defaultData);
  const [schedulerDataResult2, setSchedulerDataResult2] = useState([]);

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [todoSelectedState, setTodoSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [userselectedState, setUserSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    if (tabSelected == 0) {
      setSchedulerFilter((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (tabSelected == 2) {
      setUserFilter((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setSchedulerFilter2((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setSchedulerFilter((prev) => ({
      ...prev,
      rdoplandiv: value,
      isSearch: true,
    }));
  };

  const filterRadioChange2 = (e: any) => {
    const { name, value } = e;

    setTodoFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterRadioChange3 = (e: any) => {
    const { name, value } = e;

    setSchedulerFilter2((prev) => ({
      ...prev,
      rdoplandiv2: value,
      isSearch: true,
    }));
  };

  const filterRadioChange4 = (e: any) => {
    const { name, value } = e;

    setUserFilter((prev) => ({
      ...prev,
      rdoplandiv: value,
      isSearch: true,
    }));
  };

  const [todoFilter, setTodoFilter] = useState({
    pgSize: PAGE_SIZE,
    work_type: "TODOLIST",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    rdofinyn: "N",
    frdt: new Date(),
    todt: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [schedulerFilter, setSchedulerFilter] = useState({
    work_type: "MY",
    person: userId,
    rdoplandiv: "Y",
    dptcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [schedulerFilter2, setSchedulerFilter2] = useState({
    work_type: "TEAM",
    person: userId,
    rdoplandiv2: "Y",
    frdt: new Date(),
    todt: new Date(),
    dptcd: "",
    number: 7,
    number2: 24,
    width: 250,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [userFilter, setUserFilter] = useState({
    work_type: "MYGRID",
    person: userId,
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    rdoplandiv: "Y",
    dptcd: "",
    frdt: new Date(),
    todt: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [number, setNumber] = useState(7);
  const [number2, setNumber2] = useState(24);
  const [widths, setWidths] = useState(250);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  const fetchTodoGrid = async (todoFilter: any) => {
    let data: any;
    setLoading(true);
    const todoParameters: Iparameters = {
      procedureName: "P_CM_A1600W_Q",
      pageNumber: todoFilter.pgNum,
      pageSize: todoFilter.pgSize,
      parameters: {
        "@p_work_type": todoFilter.work_type,
        "@p_orgdiv": todoFilter.orgdiv,
        "@p_recdt": "",
        "@p_recdt1": "",
        "@p_dptcd": "",
        "@p_postcd": "",
        "@p_userid": userId,
        "@p_rtrchk": "N",
        "@p_frdt": convertDateToStr(todoFilter.frdt),
        "@p_person": schedulerFilter.person,
        "@p_todt": convertDateToStr(todoFilter.todt),
        "@p_finyn": todoFilter.rdofinyn,
        "@p_plandiv": "Y",
        "@p_stddiv": "",
        "@p_serviceid": "",
        "@p_find_row_value": todoFilter.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", todoParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => ({
        ...row,
        strtime: convertDateToStr(new Date(row.strtime)),
      }));
      if (todoFilter.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.datnum == todoFilter.find_row_value
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
      setTodoDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          todoFilter.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.datnum == todoFilter.find_row_value);

        if (selectedRow != undefined) {
          setTodoSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setTodoSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
    }
    setLoading(false);
    setTodoFilter((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  const fetchUserGrid = async (userFilter: any) => {
    let data: any;
    setLoading(true);
    const todoParameters: Iparameters = {
      procedureName: "P_CM_A1600W_Q",
      pageNumber: userFilter.pgNum,
      pageSize: userFilter.pgSize,
      parameters: {
        "@p_work_type": userFilter.work_type,
        "@p_orgdiv": userFilter.orgdiv,
        "@p_recdt": "",
        "@p_recdt1": "",
        "@p_dptcd": "",
        "@p_postcd": "",
        "@p_userid": userId,
        "@p_rtrchk": "N",
        "@p_frdt": convertDateToStr(userFilter.frdt),
        "@p_person": userFilter.person,
        "@p_todt": convertDateToStr(userFilter.todt),
        "@p_finyn": userFilter.rdofinyn,
        "@p_plandiv": userFilter.rdoplandiv,
        "@p_stddiv": "",
        "@p_serviceid": "",
        "@p_find_row_value": userFilter.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", todoParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => ({
        ...row,
      }));

      if (userFilter.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.datnum == userFilter.find_row_value
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
      setUserDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          userFilter.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.datnum == userFilter.find_row_value);

        if (selectedRow != undefined) {
          setUserSelectedState({ [selectedRow[DATA_ITEM_KEY2]]: true });
        } else {
          setUserSelectedState({ [rows[0][DATA_ITEM_KEY2]]: true });
        }
      }
    }
    setLoading(false);
    setUserFilter((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  const fetchScheduler = async (schedulerFilter: any) => {
    let data: any;

    setLoading(true);
    const schedulerParameters: Iparameters = {
      procedureName: "P_CM_A1600W_Q",
      pageNumber: 1,
      pageSize: 100000,
      parameters: {
        "@p_work_type": schedulerFilter.work_type,
        "@p_orgdiv": sessionOrgdiv,
        "@p_recdt": "",
        "@p_recdt1": "",
        "@p_dptcd": "",
        "@p_postcd": "",
        "@p_userid": userId,
        "@p_rtrchk": "",
        "@p_frdt": "",
        "@p_person": schedulerFilter.person,
        "@p_todt": "",
        "@p_finyn": "",
        "@p_plandiv": schedulerFilter.rdoplandiv,
        "@p_stddiv": "",
        "@p_serviceid": "",
        "@p_find_row_value": "",
      },
    };

    try {
      data = await processApi<any>("procedure", schedulerParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      let rows = data.tables[0].Rows.map((row: any) => {
        const start = new Date(row.strtime);
        const end = new Date(row.endtime);
        const timeDiff = end.getTime() - start.getTime();

        return {
          ...row,
          id: row.datnum,
          title: row.title,
          description: row.contents,
          start: start,
          end: end,
          isAllDay: timeDiff == 8.64e7 ? true : false, // 24시간 차이 시 all day
          colorID: colorData.find((item) => item.sub_code == row.colorID),
        };
      });

      setSchedulerDataResult(rows);
    }
    setLoading(false);
    setSchedulerFilter((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  const fetchScheduler2 = async (schedulerFilter2: any) => {
    let data: any;

    setLoading(true);
    const schedulerParameters: Iparameters = {
      procedureName: "P_CM_A1600W_Q",
      pageNumber: 1,
      pageSize: 100000,
      parameters: {
        "@p_work_type": schedulerFilter2.work_type,
        "@p_orgdiv": sessionOrgdiv,
        "@p_recdt": "",
        "@p_recdt1": "",
        "@p_dptcd": schedulerFilter2.dptcd,
        "@p_postcd": "",
        "@p_userid": userId,
        "@p_rtrchk": "",
        "@p_frdt": "",
        "@p_person": "",
        "@p_todt": "",
        "@p_finyn": "",
        "@p_plandiv": schedulerFilter2.rdoplandiv2,
        "@p_stddiv": "",
        "@p_serviceid": "",
        "@p_find_row_value": "",
      },
    };

    try {
      data = await processApi<any>("procedure", schedulerParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      let rows = data.tables[0].Rows.map((row: any) => {
        const start = new Date(row.strtime);
        const end = new Date(row.endtime);
        const timeDiff = end.getTime() - start.getTime();

        return {
          ...row,
          id: row.datnum,
          title: row.title,
          description: row.contents,
          start: start,
          end: end,
          isAllDay: timeDiff == 8.64e7 ? true : false, // 24시간 차이 시 all day
          colorID: colorData.find((item) => item.sub_code == row.colorID),
        };
      });

      setSchedulerDataResult2(rows);
      let rows2 = data.tables[1].Rows.map((row: any) => {
        return {
          text: row.prsnnm,
          value: row.person,
        };
      });
      setUserListData(rows2);
    }
    setLoading(false);
    setSchedulerFilter2((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (todoFilter.isSearch == true && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(todoFilter);
      setTodoFilter((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchTodoGrid(deepCopiedFilters);
    }
  }, [todoFilter, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (userFilter.isSearch == true && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(userFilter);
      setUserFilter((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchUserGrid(deepCopiedFilters);
    }
  }, [userFilter, permissions]);

  useEffect(() => {
    if (schedulerFilter.isSearch == true && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(schedulerFilter);
      setSchedulerFilter((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchScheduler(deepCopiedFilters);
    }
  }, [schedulerFilter]);

  useEffect(() => {
    if (schedulerFilter2.isSearch == true && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(schedulerFilter2);
      setSchedulerFilter2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchScheduler2(deepCopiedFilters);
    }
  }, [schedulerFilter2]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [todoDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [userDataResult]);

  //디테일1 그리드 선택 이벤트 => 디테일2 그리드 조회
  const onTodoSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: todoSelectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setTodoSelectedState(newSelectedState);
  };

  //디테일1 그리드 선택 이벤트 => 디테일2 그리드 조회
  const onUserSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: userselectedState,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setUserSelectedState(newSelectedState);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onTodoDataStateChange = (event: GridDataStateChangeEvent) => {
    setTodoDataState(event.dataState);
  };
  const onUserDataStateChange = (event: GridDataStateChangeEvent) => {
    setUserDataState(event.dataState);
  };

  let str = false;

  useEffect(() => {
    window.addEventListener("keydown", function (e) {
      if (e.shiftKey) {
        str = true;
      }
    });
    return () => {
      window.removeEventListener("keydown", function () {});
    };
  });

  //그리드 푸터
  const todoTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {todoDataResult.total}건
      </td>
    );
  };

  //그리드 푸터
  const userTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {userDataResult.total}건
      </td>
    );
  };

  const onTodoSortChange = (e: any) => {
    setTodoDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onUserSortChange = (e: any) => {
    setUserDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const displayDate: Date = new Date();

  const handleDataChange = ({
    created,
    updated,
    deleted,
  }: SchedulerDataChangeEvent) => {
    if (schedulerFilter.person !== userId) {
      alert(findMessage(messagesData, "CM_A1600W_001"));
      return false;
    }

    type TdataArr = {
      rowstatus_s: string[];
      datnum_s: string[];
      strtime_s: string[];
      endtime_s: string[];
      contents_s: string[];
      person_s: string[];
      finyn_s: string[];
      kind1_s: string[];
      custcd_s: string[];
      title_s: string[];
      colorid_s: string[];
    };

    let dataArr: TdataArr = {
      rowstatus_s: [],
      datnum_s: [],
      strtime_s: [],
      endtime_s: [],
      contents_s: [],
      person_s: [],
      finyn_s: [],
      kind1_s: [],
      custcd_s: [],
      title_s: [],
      colorid_s: [],
    };

    if (str == false) {
      created.forEach((item) => (item["rowstatus"] = "N"));
      updated.forEach((item) => (item["rowstatus"] = "U"));
      deleted.forEach((item) => (item["rowstatus"] = "D"));
    } else {
      created.forEach((item) => (item["rowstatus"] = "N"));
      updated.forEach((item) => (item["rowstatus"] = "N"));
      deleted.forEach((item) => (item["rowstatus"] = "D"));
    }

    const mergedArr = [...created, ...updated, ...deleted];

    mergedArr.forEach((item) => {
      const {
        datnum = "",
        start,
        end,
        rowstatus = "",
        description = "",
        title = "",
        isAllDay,
        colorID,
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.datnum_s.push(rowstatus == "N" ? "" : datnum);
      dataArr.strtime_s.push(
        isAllDay
          ? convertDateToStrWithTime(start).substr(0, 8) + " 0:0"
          : convertDateToStrWithTime(start)
      );
      dataArr.endtime_s.push(
        isAllDay
          ? convertDateToStrWithTime(
              new Date(start.setDate(start.getDate() + 1))
            ).substr(0, 8) + " 0:0"
          : convertDateToStrWithTime(end)
      );
      dataArr.contents_s.push(description);
      dataArr.person_s.push("");
      dataArr.finyn_s.push("");
      dataArr.kind1_s.push("");
      dataArr.custcd_s.push("");
      dataArr.title_s.push(title);
      dataArr.colorid_s.push(
        typeof colorID == "number"
          ? colorID
          : colorID == undefined
          ? 0
          : colorID.sub_code
      );
    });

    setParaData((prev) => ({
      ...prev,
      work_type: "N",
      planyn_s: schedulerFilter.rdoplandiv,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      datnum_s: dataArr.datnum_s.join("|"),
      contents_s: dataArr.contents_s.join("|"),
      strtime_s: dataArr.strtime_s.join("|"),
      endtime_s: dataArr.endtime_s.join("|"),
      person_s: schedulerFilter.person,
      finyn_s: dataArr.finyn_s.join("|"),
      kind1_s: dataArr.kind1_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      title_s: dataArr.title_s.join("|"),
      colorid_s: dataArr.colorid_s.join("|"),
    }));
  };

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    rowstatus_s: "",
    datnum_s: "",
    docunum_s: "",
    contents_s: "",
    strtime_s: "",
    endtime_s: "",
    person_s: userId,
    planyn_s: "",
    userid: userId,
    pc: pc,
    finyn_s: "",
    kind1_s: "",
    custcd_s: "",
    title_s: "",
    colorid_s: "",
    datnum: "",
    strdt: "",
    enddt: "",
    strhh: "",
    strmm: "",
    endhh: "",
    endmm: "",
    title: "",
    contents: "",
    kind1: "",
    kind2: "",
    custcd: "",
    custperson: "",
    opengb: "",
    attdatnum: "",
    finyn: "",
    usehh: 0,
    usemm: 0,
    planyn: "",
    amt: 0,
    ref_key: "",
    pgmid: "",
    form_id: "CM_A1600W",
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_CM_A1600W_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_datnum_s": paraData.datnum_s,
      "@p_docunum_s": paraData.docunum_s,
      "@p_contents_s": paraData.contents_s,
      "@p_strtime_s": paraData.strtime_s,
      "@p_endtime_s": paraData.endtime_s,
      "@p_person_s": paraData.person_s,
      "@p_planyn_s": paraData.planyn_s,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_finyn_s": paraData.finyn_s,
      "@p_kind1_s": paraData.kind1_s,
      "@p_custcd_s": paraData.custcd_s,
      "@p_title_s": paraData.title_s,
      "@p_colorid_s": paraData.colorid_s,
      "@p_datnum": paraData.datnum,
      "@p_strdt": paraData.strdt,
      "@p_enddt": paraData.enddt,
      "@p_strhh": paraData.strhh,
      "@p_strmm": paraData.strmm,
      "@p_endhh": paraData.endhh,
      "@p_endmm": paraData.endmm,
      "@p_title": paraData.title,
      "@p_contents": paraData.contents,
      "@p_kind1": paraData.kind1,
      "@p_kind2": paraData.kind2,
      "@p_custcd": paraData.custcd,
      "@p_custperson": paraData.custperson,
      "@p_opengb": paraData.opengb,
      "@p_attdatnum": paraData.attdatnum,
      "@p_finyn": paraData.finyn,
      "@p_usehh": paraData.usehh,
      "@p_usemm": paraData.usemm,
      "@p_planyn": paraData.planyn,
      "@p_amt": paraData.amt,
      "@p_ref_key": paraData.ref_key,
      "@p_pgmid": paraData.pgmid,
      "@p_form_id": paraData.form_id,
      "@p_company_code": companyCode,
    },
  };

  const fetchSchedulerSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      ok = true;
      setSchedulerFilter((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setTodoFilter((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
      }));
      setSchedulerFilter2((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setUserFilter((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      str = false;
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  useEffect(() => {
    if (paraData.work_type !== "") fetchSchedulerSaved();
  }, [paraData]);

  const sessionUserId = UseGetValueFromSessionItem("user_id");

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setSchedulerFilter((prev) => ({
        ...prev,
        person:
          defaultOption.find((item: any) => item.id == "person").useSession ==
          true
            ? defaultOption.find((item: any) => item.id == "person")
                .sessionItem == "UserId"
              ? sessionUserId
              : defaultOption.find((item: any) => item.id == "person")
                  ?.valueCode
            : defaultOption.find((item: any) => item.id == "person")?.valueCode,
        rdoplandiv: defaultOption.find((item: any) => item.id == "rdoplandiv")
          ?.valueCode,
        isSearch: true,
      }));
      setSchedulerFilter2((prev) => ({
        ...prev,
        person:
          defaultOption.find((item: any) => item.id == "person").useSession ==
          true
            ? defaultOption.find((item: any) => item.id == "person")
                .sessionItem == "UserId"
              ? sessionUserId
              : defaultOption.find((item: any) => item.id == "person")
                  ?.valueCode
            : defaultOption.find((item: any) => item.id == "person")?.valueCode,
        rdoplandiv2: defaultOption.find((item: any) => item.id == "rdoplandiv2")
          ?.valueCode,
        isSearch: true,
      }));

      setTodoFilter((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        rdofinyn: defaultOption.find((item: any) => item.id == "rdofinyn")
          ?.valueCode,
        isSearch: true,
      }));
      setUserFilter((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        rdofinyn: defaultOption.find((item: any) => item.id == "rdofinyn")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const onTodoItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      todoDataResult,
      setTodoDataResult,
      DATA_ITEM_KEY
    );
  };

  const onUserItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      userDataResult,
      setUserDataResult,
      DATA_ITEM_KEY2
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = todoDataResult.data.map((item) =>
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
      setTodoDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev: { total: any }) => {
        return {
          data: todoDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != todoDataResult.data) {
      const newData = todoDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY] ==
          Object.getOwnPropertyNames(todoSelectedState)[0]
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
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setTodoDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = todoDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setTodoDataResult((prev: { total: any }) => {
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

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = userDataResult.data.map((item) =>
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
      setUserDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev: { total: any }) => {
        return {
          data: userDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != userDataResult.data) {
      const newData = userDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY2] ==
          Object.getOwnPropertyNames(userselectedState)[0]
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
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setUserDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = userDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setUserDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
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

  const onAddClick = () => {
    todoDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const idx: number =
      Number(Object.getOwnPropertyNames(todoSelectedState)[0]) ??
      //Number(planDataResult.data[0].idx) ??
      null;
    if (idx == null) return false;
    const selectedRowData = todoDataResult.data.find(
      (item) => item[DATA_ITEM_KEY] == idx
    );

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      // planno: selectedRowData.planno,
      strtime: convertDateToStr(new Date()),
      rowstatus: "N",
      finyn: "N",
    };
    setTodoDataResult((prev) => {
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
    setTodoSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
  };

  const onAddClick2 = () => {
    userDataResult.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY2]: ++temp2,
      color: "B",
      colorID: 0,
      contents: "",
      custcd: "",
      custnm: "",
      datnum: "",
      strtime: convertDateToStr(new Date()),
      strhh: "00",
      strmm: "00",
      endtime: convertDateToStr(new Date()),
      endhh: "00",
      endmm: "00",
      kind1: "",
      orgdiv: sessionOrgdiv,
      person: userId,
      title: "",
      rowstatus: "N",
      finyn: "",
    };

    setUserDataResult((prev) => {
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
    setUserSelectedState({ [newDataItem[DATA_ITEM_KEY2]]: true });
  };

  const onRemoveClick = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    todoDataResult.data.forEach((item: any, index: number) => {
      if (!todoSelectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedTodoRows.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = todoDataResult.data[Math.min(...Object2)];
    } else {
      data = todoDataResult.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setTodoDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setTodoSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onRemoveClick2 = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    userDataResult.data.forEach((item: any, index: number) => {
      if (!userselectedState[item[DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedTodoRows2.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = userDataResult.data[Math.min(...Object2)];
    } else {
      data = userDataResult.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setUserDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setUserSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };

  const onSaveClick = () => {
    const dataItem: { [name: string]: any } = todoDataResult.data.filter(
      (item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      }
    );
    if (dataItem.length == 0 && deletedTodoRows.length == 0) {
      ok = true;
      return false;
    }

    //검증
    let valid = true;
    try {
      dataItem.forEach((item: any) => {
        if (!item.strtime) {
          throw new Error(findMessage(messagesData, "CM_A1600W_003"));
        }

        if (!item.contents) {
          throw new Error(findMessage(messagesData, "CM_A1600W_004"));
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
      ok = false;
    }

    if (!valid) return false;

    type TData = {
      rowstatus_s: string[];
      datnum_s: string[];
      contents_s: string[];
      strtime_s: string[];
      endtime_s: string[];
      finyn_s: string[];
      kind1_s: string[];
      custcd_s: string[];
      title_s: string[];
      colorid_s: string[];
    };

    let dataArr: TData = {
      rowstatus_s: [],
      datnum_s: [],
      contents_s: [],
      strtime_s: [],
      endtime_s: [],
      finyn_s: [],
      kind1_s: [],
      custcd_s: [],
      title_s: [],
      colorid_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus,
        datnum,
        contents,
        strtime,
        finyn,
        kind1,
        custcd,
        title,
      } = item;

      const strtimeDate = new Date(dateformat(strtime));

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.datnum_s.push(datnum);
      dataArr.contents_s.push(contents);
      dataArr.strtime_s.push(strtime == "99991231" ? "" : strtime);
      dataArr.endtime_s.push(
        strtime == "99991231"
          ? ""
          : convertDateToStr(new Date(strtimeDate.setDate(strtimeDate.getDate() + 1)))
      );
      dataArr.finyn_s.push(finyn == "Y" || finyn == true ? "Y" : "N");
      dataArr.kind1_s.push(kind1);
      dataArr.custcd_s.push(custcd);
      dataArr.title_s.push(title);
    });

    deletedTodoRows.forEach((item: any, idx: number) => {
      const {
        datnum,
        contents,
        strtime,
        finyn,
        kind1,
        custcd,
        title,
        colorID,
      } = item;

      const strtimeDate = new Date(dateformat(strtime));

      dataArr.rowstatus_s.push("D");
      dataArr.datnum_s.push(datnum);
      dataArr.contents_s.push(contents);
      dataArr.strtime_s.push(strtime == "99991231" ? "" : strtime);
      dataArr.endtime_s.push(
        strtime == "99991231"
          ? ""
          : convertDateToStr(new Date(strtimeDate.setDate(strtimeDate.getDate() + 1)))
      );
      dataArr.finyn_s.push(finyn);
      dataArr.kind1_s.push(kind1);
      dataArr.custcd_s.push(custcd);
      dataArr.title_s.push(title);
    });

    setTodoParaDataSaved((prev) => ({
      ...prev,
      work_type: "TODOLIST",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      datnum_s: dataArr.datnum_s.join("|"),
      contents_s: dataArr.contents_s.join("|"),
      strtime_s: dataArr.strtime_s.join("|"),
      endtime_s: dataArr.endtime_s.join("|"),
      finyn_s: dataArr.finyn_s.join("|"),
      kind1_s: dataArr.kind1_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      title_s: dataArr.title_s.join("|"),
      colorid_s: dataArr.colorid_s.join("|"),
    }));
  };

  //계획 저장 파라미터 초기값
  const [todoParaDataSaved, setTodoParaDataSaved] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    rowstatus_s: "",
    datnum_s: "",
    docunum_s: "",
    contents_s: "",
    strtime_s: "",
    endtime_s: "",
    person_s: "",
    planyn_s: "Y",
    userid: userId,
    pc: pc,
    finyn_s: "",
    kind1_s: "",
    custcd_s: "",
    title_s: "",
    colorid_s: "",
    datnum: "",
    strdt: "",
    enddt: "",
    strhh: "",
    strmm: "",
    endhh: "",
    endmm: "",
    title: "",
    contents: "",
    kind1: "",
    kind2: "",
    custcd: "",
    custperson: "",
    opengb: "",
    attdatnum: "",
    finyn: "",
    usehh: 0,
    usemm: 0,
    planyn: "",
    amt: 0,
    ref_key: "",
    pgmid: "",
    form_id: "CM_A1600W",
  });

  const todoParaSaved: Iparameters = {
    procedureName: "P_CM_A1600W_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": todoParaDataSaved.work_type,
      "@p_orgdiv": todoParaDataSaved.orgdiv,
      "@p_location": todoParaDataSaved.location,
      "@p_rowstatus_s": todoParaDataSaved.rowstatus_s,
      "@p_datnum_s": todoParaDataSaved.datnum_s,
      "@p_docunum_s": todoParaDataSaved.docunum_s,
      "@p_contents_s": todoParaDataSaved.contents_s,
      "@p_strtime_s": todoParaDataSaved.strtime_s,
      "@p_endtime_s": todoParaDataSaved.endtime_s,
      "@p_person_s": todoParaDataSaved.person_s,
      "@p_planyn_s": todoParaDataSaved.planyn_s,
      "@p_userid": todoParaDataSaved.userid,
      "@p_pc": todoParaDataSaved.pc,
      "@p_finyn_s": todoParaDataSaved.finyn_s,
      "@p_kind1_s": todoParaDataSaved.kind1_s,
      "@p_custcd_s": todoParaDataSaved.custcd_s,
      "@p_title_s": todoParaDataSaved.title_s,
      "@p_colorid_s": todoParaDataSaved.colorid_s,
      "@p_datnum": todoParaDataSaved.datnum,
      "@p_strdt": todoParaDataSaved.strdt,
      "@p_enddt": todoParaDataSaved.enddt,
      "@p_strhh": todoParaDataSaved.strhh,
      "@p_strmm": todoParaDataSaved.strmm,
      "@p_endhh": todoParaDataSaved.endhh,
      "@p_endmm": todoParaDataSaved.endmm,
      "@p_title": todoParaDataSaved.title,
      "@p_contents": todoParaDataSaved.contents,
      "@p_kind1": todoParaDataSaved.kind1,
      "@p_kind2": todoParaDataSaved.kind2,
      "@p_custcd": todoParaDataSaved.custcd,
      "@p_custperson": todoParaDataSaved.custperson,
      "@p_opengb": todoParaDataSaved.opengb,
      "@p_attdatnum": todoParaDataSaved.attdatnum,
      "@p_finyn": todoParaDataSaved.finyn,
      "@p_usehh": todoParaDataSaved.usehh,
      "@p_usemm": todoParaDataSaved.usemm,
      "@p_planyn": todoParaDataSaved.planyn,
      "@p_amt": todoParaDataSaved.amt,
      "@p_ref_key": todoParaDataSaved.ref_key,
      "@p_pgmid": todoParaDataSaved.pgmid,
      "@p_form_id": todoParaDataSaved.form_id,
      "@p_company_code": companyCode,
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", todoParaSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      ok = true;
      setTodoFilter((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: 1,
        isSearch: true,
      }));
      setSchedulerFilter((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setSchedulerFilter2((prev) => ({
        ...prev,
        isSearch: true,
      }));
      deletedTodoRows = [];
    } else {
      alert(data.resultMessage);
    }
  };

  useEffect(() => {
    if (todoParaDataSaved.work_type !== "") fetchTodoGridSaved();
  }, [todoParaDataSaved]);

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "To-do 리스트";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 0) {
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridTwo.sheets[0].title = "개인 스케줄(표)";
        _export2.save(optionsGridTwo);
      }
    }
  };

  const search = () => {
    try {
      if (tabSelected == 0) {
        if (
          convertDateToStr(todoFilter.frdt).substring(0, 4) < "1997" ||
          convertDateToStr(todoFilter.frdt).substring(6, 8) > "31" ||
          convertDateToStr(todoFilter.frdt).substring(6, 8) < "01" ||
          convertDateToStr(todoFilter.frdt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "CM_A1600W_003");
        } else if (
          convertDateToStr(todoFilter.todt).substring(0, 4) < "1997" ||
          convertDateToStr(todoFilter.todt).substring(6, 8) > "31" ||
          convertDateToStr(todoFilter.todt).substring(6, 8) < "01" ||
          convertDateToStr(todoFilter.todt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "CM_A1600W_003");
        } else if (
          schedulerFilter.person == "" ||
          schedulerFilter.person == undefined ||
          schedulerFilter.person == null
        ) {
          throw findMessage(messagesData, "CM_A1600W_005");
        } else {
          setTodoFilter((prev) => ({
            ...prev,
            find_row_value: "",
            pgNum: 1,
            isSearch: true,
          }));
          setSchedulerFilter((prev) => ({
            ...prev,
            isSearch: true,
          }));
          setSchedulerFilter2((prev) => ({
            ...prev,
            isSearch: true,
            number: number,
            width: widths,
            number2: number2,
          }));
          if (swiper && isMobile) {
            swiper.slideTo(0);
          }
        }
      } else if (tabSelected == 2) {
        if (
          convertDateToStr(userFilter.frdt).substring(0, 4) < "1997" ||
          convertDateToStr(userFilter.frdt).substring(6, 8) > "31" ||
          convertDateToStr(userFilter.frdt).substring(6, 8) < "01" ||
          convertDateToStr(userFilter.frdt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "CM_A1600W_003");
        } else if (
          convertDateToStr(userFilter.todt).substring(0, 4) < "1997" ||
          convertDateToStr(userFilter.todt).substring(6, 8) > "31" ||
          convertDateToStr(userFilter.todt).substring(6, 8) < "01" ||
          convertDateToStr(userFilter.todt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "CM_A1600W_003");
        } else if (
          userFilter.person == "" ||
          userFilter.person == undefined ||
          userFilter.person == null
        ) {
          throw findMessage(messagesData, "CM_A1600W_005");
        } else {
          setUserFilter((prev) => ({
            ...prev,
            find_row_value: "",
            pgNum: 1,
            isSearch: true,
          }));
          if (swiper && isMobile) {
            swiper.slideTo(0);
          }
        }
      } else {
        setTodoFilter((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setSchedulerFilter((prev) => ({
          ...prev,
          isSearch: true,
        }));
        setSchedulerFilter2((prev) => ({
          ...prev,
          number: number,
          width: widths,
          number2: number2,
          isSearch: true,
        }));
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const handleSelectTab = (e: any) => {
    if (tabSelected == 0) {
      ok = true;
      onSaveClick();
    } else if (tabSelected == 2) {
      ok = true;
      onSaveClick2();
    }

    if (ok == true) {
      if (e.selected == 0) {
        setTodoFilter((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setSchedulerFilter((prev) => ({
          ...prev,
          isSearch: true,
        }));
        setSchedulerFilter2((prev) => ({
          ...prev,
          isSearch: true,
          number: number,
          width: widths,
          number2: number2,
        }));
      } else if (e.selected == 2) {
        setUserFilter((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: "",
        }));
      } else {
        setTodoFilter((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setSchedulerFilter((prev) => ({
          ...prev,
          isSearch: true,
        }));
        setSchedulerFilter2((prev) => ({
          ...prev,
          number: number,
          width: widths,
          number2: number2,
          isSearch: true,
        }));
      }
      setTabSelected(e.selected);
    } else {
      ok = true;
    }
  };

  const onSaveClick2 = () => {
    const dataItem = userDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (userFilter.person !== userId) {
      alert(findMessage(messagesData, "CM_A1600W_001"));
      ok = false;
      return false;
    }

    let valid = true;
    try {
      dataItem.forEach((item: any) => {
        if (item.title == "") {
          throw new Error(findMessage(messagesData, "CM_A1600W_006"));
          valid = false;
        }
        if (item.strtime == "") {
          throw new Error(findMessage(messagesData, "CM_A1600W_003"));
          valid = false;
        }
        if (item.endtime == "") {
          throw new Error(findMessage(messagesData, "CM_A1600W_003"));
          valid = false;
        }
        if (item.strhh < 0 || item.strhh > 23) {
          throw new Error(findMessage(messagesData, "CM_A1600W_007"));
          valid = false;
        }

        if (item.strmm < 0 || item.strmm > 59) {
          throw new Error(findMessage(messagesData, "CM_A1600W_007"));
          valid = false;
        }

        if (item.endhh < 0 || item.endhh > 23) {
          throw new Error(findMessage(messagesData, "CM_A1600W_007"));
          valid = false;
        }

        if (item.endmm < 0 || item.endmm > 59) {
          throw new Error(findMessage(messagesData, "CM_A1600W_007"));
          valid = false;
        }
      });
    } catch (e) {
      alert(e);
      ok = false;
      valid = false;
    }

    if (
      (dataItem.length == 0 && deletedTodoRows2.length == 0) ||
      valid == false
    ) {
      ok = true;
      return false;
    }

    type TdataArr = {
      rowstatus_s: string[];
      datnum_s: string[];
      strtime_s: string[];
      endtime_s: string[];
      contents_s: string[];
      person_s: string[];
      finyn_s: string[];
      kind1_s: string[];
      custcd_s: string[];
      title_s: string[];
      colorid_s: string[];
    };

    let dataArr: TdataArr = {
      rowstatus_s: [],
      datnum_s: [],
      strtime_s: [],
      endtime_s: [],
      contents_s: [],
      person_s: [],
      finyn_s: [],
      kind1_s: [],
      custcd_s: [],
      title_s: [],
      colorid_s: [],
    };

    dataItem.forEach((item) => {
      const {
        datnum = "",
        strtime,
        strhh,
        strmm,
        endtime,
        endhh,
        endmm,
        rowstatus = "",
        contents = "",
        title = "",
        kind1 = "",
        isAllDay,
        colorID,
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.datnum_s.push(rowstatus == "N" ? "" : datnum);
      dataArr.strtime_s.push(
        strtime.toString() +
          " " +
          (strhh < 9 ? "0" + strhh.toString() : strhh.toString()) +
          ":" +
          (strmm < 9 ? "0" + strmm.toString() : strmm.toString()) +
          ":00"
      );
      dataArr.endtime_s.push(
        endtime.toString() +
          " " +
          (endhh < 9 ? "0" + endhh.toString() : endhh.toString()) +
          ":" +
          (endmm < 9 ? "0" + endmm.toString() : endmm.toString()) +
          ":00"
      );
      dataArr.contents_s.push(contents);
      dataArr.person_s.push("");
      dataArr.finyn_s.push("");
      dataArr.kind1_s.push(kind1);
      dataArr.custcd_s.push("");
      dataArr.title_s.push(title);
      dataArr.colorid_s.push(
        typeof colorID == "number"
          ? colorID
          : colorID == undefined
          ? 0
          : colorID.sub_code
      );
    });

    deletedTodoRows2.forEach((item: any, idx: number) => {
      const {
        datnum = "",
        strtime,
        strhh,
        strmm,
        endtime,
        endhh,
        endmm,
        rowstatus = "",
        contents = "",
        title = "",
        kind1 = "",
        isAllDay,
        colorID,
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.datnum_s.push(rowstatus == "N" ? "" : datnum);
      dataArr.strtime_s.push(
        strtime.toString() +
          " " +
          (strhh < 9 ? "0" + strhh.toString() : strhh.toString()) +
          ":" +
          (strmm < 9 ? "0" + strmm.toString() : strmm.toString()) +
          ":00"
      );
      dataArr.endtime_s.push(
        endtime.toString() +
          " " +
          (endhh < 9 ? "0" + endhh.toString() : endhh.toString()) +
          ":" +
          (endmm < 9 ? "0" + endmm.toString() : endmm.toString()) +
          ":00"
      );
      dataArr.contents_s.push(contents);
      dataArr.person_s.push("");
      dataArr.finyn_s.push("");
      dataArr.kind1_s.push(kind1);
      dataArr.custcd_s.push("");
      dataArr.title_s.push(title);
      dataArr.colorid_s.push(
        typeof colorID == "number"
          ? colorID
          : colorID == undefined
          ? 0
          : colorID.sub_code
      );
    });

    setParaData((prev) => ({
      ...prev,
      work_type: "N",
      planyn_s: userFilter.rdoplandiv,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      datnum_s: dataArr.datnum_s.join("|"),
      contents_s: dataArr.contents_s.join("|"),
      strtime_s: dataArr.strtime_s.join("|"),
      endtime_s: dataArr.endtime_s.join("|"),
      person_s: userFilter.person,
      finyn_s: dataArr.finyn_s.join("|"),
      kind1_s: dataArr.kind1_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      title_s: dataArr.title_s.join("|"),
      colorid_s: dataArr.colorid_s.join("|"),
    }));
  };

  return (
    <>
      <TitleContainer>
        <Title>Scheduler</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="CM_A1600W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab title="스케줄러">
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
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <FilterContainer>
                      <FilterBox
                        onKeyPress={(e) => handleKeyPressSearch(e, search)}
                      >
                        <tbody>
                          <tr>
                            <th>작성자</th>
                            <td>
                              {bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="person"
                                  value={schedulerFilter.person}
                                  bizComponentId="L_sysUserMaster_001"
                                  bizComponentData={bizComponentData}
                                  changeData={filterComboBoxChange}
                                  valueField="user_id"
                                  textField="user_name"
                                  className="required"
                                />
                              )}
                            </td>
                            <th>계획구분</th>
                            <td>
                              {bizComponentData !== null && (
                                <BizComponentRadioGroup
                                  name="rdoplandiv"
                                  value={schedulerFilter.rdoplandiv}
                                  bizComponentId="R_PLANDIV_YN"
                                  bizComponentData={bizComponentData}
                                  changeData={filterRadioChange}
                                />
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </FilterBox>
                    </FilterContainer>

                    <GridTitle>개인 스케줄(표)</GridTitle>
                  </GridTitleContainer>
                  {osstate == true ? (
                    <div
                      style={{
                        backgroundColor: "#ccc",
                        height: "73vh",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      현재 OS에서는 지원이 불가능합니다.
                    </div>
                  ) : (
                    <Scheduler
                      height={deviceHeight - height - height4}
                      data={schedulerDataResult}
                      onDataChange={handleDataChange}
                      defaultDate={displayDate}
                      editable={true}
                      editItem={CustomEditItem}
                      form={FormWithCustomEditor}
                    >
                      <WeekView />
                      <MonthView />
                      <DayView />
                    </Scheduler>
                  )}
                </GridContainer>
              </SwiperSlide>

              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer2">
                    <FilterContainer>
                      <FilterBox
                        onKeyPress={(e) => handleKeyPressSearch(e, search)}
                      >
                        <tbody>
                          <tr>
                            <th>일자</th>
                            <td>
                              <CommonDateRangePicker
                                value={{
                                  start: todoFilter.frdt,
                                  end: todoFilter.todt,
                                }}
                                onChange={(e: {
                                  value: { start: any; end: any };
                                }) =>
                                  setTodoFilter((prev) => ({
                                    ...prev,
                                    frdt: e.value.start,
                                    todt: e.value.end,
                                  }))
                                }
                                className="required"
                              />
                            </td>
                            <th>완료</th>
                            <td>
                              {bizComponentData !== null && (
                                <BizComponentRadioGroup
                                  name="rdofinyn"
                                  value={todoFilter.rdofinyn}
                                  bizComponentId="R_YN"
                                  bizComponentData={bizComponentData}
                                  changeData={filterRadioChange2}
                                />
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </FilterBox>
                    </FilterContainer>

                    <GridTitle>To-do 리스트</GridTitle>

                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
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
                      {permissions && (
                        <ButtonContainer>
                          <Button
                            onClick={onAddClick}
                            themeColor={"primary"}
                            icon="plus"
                            title="행 추가"
                            disabled={permissions.save ? false : true}
                          ></Button>
                          <Button
                            onClick={onRemoveClick}
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
                      )}
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={todoDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName="Scheduler"
                  >
                    <Grid
                      style={{
                        width: "100%",
                        height: deviceHeight - height2 - height4,
                      }}
                      data={process(
                        todoDataResult.data.map((row) => ({
                          ...row,
                          strtime: row.strtime
                            ? new Date(dateformat(row.strtime))
                            : new Date(dateformat("99991231")),
                          [SELECTED_FIELD]: todoSelectedState[idGetter(row)],
                        })),
                        todoDataState
                      )}
                      {...todoDataState}
                      onDataStateChange={onTodoDataStateChange}
                      //선택기능
                      dataItemKey={DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onTodoSelectionChange}
                      //정렬기능
                      sortable={true}
                      onSortChange={onTodoSortChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={todoDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef}
                      rowHeight={30}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      //incell 수정 기능
                      onItemChange={onTodoItemChange}
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
                                    dateField.includes(item.fieldName)
                                      ? DateCell
                                      : checkboxField.includes(item.fieldName)
                                      ? CheckBoxCell
                                      : undefined
                                  }
                                  headerCell={
                                    requiredField.includes(item.fieldName)
                                      ? RequiredHeader
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? todoTotalFooterCell
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
              <GridContainer width="65%">
                <FilterContainer>
                  <FilterBox
                    onKeyPress={(e) => handleKeyPressSearch(e, search)}
                  >
                    <tbody>
                      <tr>
                        <th>작성자</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="person"
                              value={schedulerFilter.person}
                              bizComponentId="L_sysUserMaster_001"
                              bizComponentData={bizComponentData}
                              changeData={filterComboBoxChange}
                              valueField="user_id"
                              textField="user_name"
                              className="required"
                            />
                          )}
                        </td>
                        <th>계획구분</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentRadioGroup
                              name="rdoplandiv"
                              value={schedulerFilter.rdoplandiv}
                              bizComponentId="R_PLANDIV_YN"
                              bizComponentData={bizComponentData}
                              changeData={filterRadioChange}
                            />
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </FilterBox>
                </FilterContainer>
                <GridTitleContainer>
                  <GridTitle>개인 스케줄(표)</GridTitle>
                </GridTitleContainer>
                {osstate == true ? (
                  <div
                    style={{
                      backgroundColor: "#ccc",
                      height: "73vh",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    현재 OS에서는 지원이 불가능합니다.
                  </div>
                ) : (
                  <Scheduler
                    height={"73vh"}
                    data={schedulerDataResult}
                    onDataChange={handleDataChange}
                    defaultDate={displayDate}
                    editable={true}
                    editItem={CustomEditItem}
                    form={FormWithCustomEditor}
                  >
                    <WeekView />
                    <MonthView />
                    <DayView />
                  </Scheduler>
                )}
              </GridContainer>
              <GridContainer width={`calc(35% - ${GAP}px)`}>
                <FilterContainer>
                  <FilterBox
                    onKeyPress={(e) => handleKeyPressSearch(e, search)}
                  >
                    <tbody>
                      <tr>
                        <th>일자</th>
                        <td>
                          <CommonDateRangePicker
                            value={{
                              start: todoFilter.frdt,
                              end: todoFilter.todt,
                            }}
                            onChange={(e: {
                              value: { start: any; end: any };
                            }) =>
                              setTodoFilter((prev) => ({
                                ...prev,
                                frdt: e.value.start,
                                todt: e.value.end,
                              }))
                            }
                            className="required"
                          />
                        </td>
                        <th>완료</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentRadioGroup
                              name="rdofinyn"
                              value={todoFilter.rdofinyn}
                              bizComponentId="R_YN"
                              bizComponentData={bizComponentData}
                              changeData={filterRadioChange2}
                            />
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </FilterBox>
                </FilterContainer>

                <GridTitleContainer>
                  <GridTitle>To-do 리스트</GridTitle>

                  {permissions && (
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        onClick={onRemoveClick}
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
                  )}
                </GridTitleContainer>
                <ExcelExport
                  data={todoDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="Scheduler"
                >
                  <Grid
                    style={{ height: "73vh" }}
                    data={process(
                      todoDataResult.data.map((row) => ({
                        ...row,
                        strtime: row.strtime
                          ? new Date(dateformat(row.strtime))
                          : new Date(dateformat("99991231")),
                        [SELECTED_FIELD]: todoSelectedState[idGetter(row)],
                      })),
                      todoDataState
                    )}
                    {...todoDataState}
                    onDataStateChange={onTodoDataStateChange}
                    //선택기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onTodoSelectionChange}
                    //정렬기능
                    sortable={true}
                    onSortChange={onTodoSortChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={todoDataResult.total}
                    skip={page.skip}
                    take={page.take}
                    pageable={true}
                    onPageChange={pageChange}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef}
                    rowHeight={30}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    //incell 수정 기능
                    onItemChange={onTodoItemChange}
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
                                  dateField.includes(item.fieldName)
                                    ? DateCell
                                    : checkboxField.includes(item.fieldName)
                                    ? CheckBoxCell
                                    : undefined
                                }
                                headerCell={
                                  requiredField.includes(item.fieldName)
                                    ? RequiredHeader
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? todoTotalFooterCell
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
        </TabStripTab>
        <TabStripTab title="전체 스케줄러">
          <GridTitleContainer>
            <FilterContainer>
              <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                <tbody>
                  <tr>
                    <th>일자간격</th>
                    <td>
                      <NumericTextBox
                        name="number"
                        value={number}
                        onChange={(e: any) => {
                          if (
                            !(
                              e.value == undefined ||
                              e.value == null ||
                              e.value == ""
                            )
                          ) {
                            setNumber(e.target.value);
                          }
                        }}
                      />
                    </td>
                    <th>시간간격</th>
                    <td>
                      <NumericTextBox
                        name="number2"
                        value={number2}
                        onChange={(e: any) => {
                          if (
                            !(
                              e.value == undefined ||
                              e.value == null ||
                              e.value == ""
                            )
                          ) {
                            if (e.target.value > 24) {
                              alert("최대값은 24입니다.");
                              setNumber2(24);
                            } else if (e.target.value < 0) {
                              alert("최소값은 1입니다.");
                              setNumber2(1);
                            } else {
                              setNumber2(e.target.value);
                            }
                          } else {
                            setNumber2(1);
                          }
                        }}
                        placeholder="1~24사이로 입력해주세요."
                      />
                    </td>
                    <th>열 너비</th>
                    <td>
                      <NumericTextBox
                        name="widths"
                        value={widths}
                        onChange={(e: any) => {
                          if (
                            !(
                              e.value == undefined ||
                              e.value == null ||
                              e.value == ""
                            )
                          ) {
                            setWidths(e.target.value);
                          }
                        }}
                      />
                    </td>
                    <th>부서</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="dptcd"
                          value={schedulerFilter2.dptcd}
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                          textField="dptnm"
                          valueField="dptcd"
                        />
                      )}
                    </td>
                    <th>계획구분</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentRadioGroup
                          name="rdoplandiv2"
                          value={schedulerFilter2.rdoplandiv2}
                          bizComponentId="R_PLANDIV_YN"
                          bizComponentData={bizComponentData}
                          changeData={filterRadioChange3}
                        />
                      )}
                    </td>
                  </tr>
                </tbody>
              </FilterBox>
            </FilterContainer>
          </GridTitleContainer>
          <GridContainer>
            {osstate == true ? (
              <div
                style={{
                  backgroundColor: "#ccc",
                  height: "77vh",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                현재 OS에서는 지원이 불가능합니다.
              </div>
            ) : (
              <Scheduler
                height={isMobile ? deviceHeight - height3 - height4 : "77vh"}
                data={schedulerDataResult2}
                defaultDate={displayDate}
                group={{
                  resources: ["person"],
                  orientation,
                }}
                resources={[
                  {
                    name: "person",
                    data: userListData,
                    field: "person",
                    valueField: "value",
                    textField: "text",
                  },
                ]}
                item={CustomItem}
              >
                <TimelineView
                  columnWidth={schedulerFilter2.width}
                  slotDuration={schedulerFilter2.number2 * 60}
                  numberOfDays={schedulerFilter2.number}
                />
              </Scheduler>
            )}
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="개인 스케줄(표)">
          <GridTitleContainer>
            <FilterContainer>
              <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                <tbody>
                  <tr>
                    <th>작성일</th>
                    <td>
                      <CommonDateRangePicker
                        value={{
                          start: userFilter.frdt,
                          end: userFilter.todt,
                        }}
                        onChange={(e: { value: { start: any; end: any } }) =>
                          setUserFilter((prev) => ({
                            ...prev,
                            frdt: e.value.start,
                            todt: e.value.end,
                          }))
                        }
                        className="required"
                      />
                    </td>
                    <th>작성자</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="person"
                          value={userFilter.person}
                          bizComponentId="L_sysUserMaster_001"
                          bizComponentData={bizComponentData}
                          changeData={filterComboBoxChange}
                          valueField="user_id"
                          textField="user_name"
                          className="required"
                        />
                      )}
                    </td>
                    <th>계획구분</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentRadioGroup
                          name="rdoplandiv"
                          value={userFilter.rdoplandiv}
                          bizComponentId="R_PLANDIV_YN"
                          bizComponentData={bizComponentData}
                          changeData={filterRadioChange4}
                        />
                      )}
                    </td>
                  </tr>
                </tbody>
              </FilterBox>
            </FilterContainer>
          </GridTitleContainer>
          <GridContainer width="100%">
            <GridTitleContainer className="ButtonContainer3">
              <GridTitle>개인 스케줄(표)</GridTitle>

              {permissions && (
                <ButtonContainer>
                  <Button
                    onClick={onAddClick2}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                    disabled={permissions.save ? false : true}
                  ></Button>
                  <Button
                    onClick={onRemoveClick2}
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
              )}
            </GridTitleContainer>
            <ExcelExport
              data={userDataResult.data}
              ref={(exporter) => {
                _export2 = exporter;
              }}
              fileName="Scheduler"
            >
              <Grid
                style={{
                  height: isMobile
                    ? deviceHeight - height3 - height4
                    : "73.5vh",
                }}
                data={process(
                  userDataResult.data.map((row) => ({
                    ...row,
                    strtime: row.strtime
                      ? new Date(dateformat(row.strtime))
                      : new Date(dateformat("99991231")),
                    endtime: row.endtime
                      ? new Date(dateformat(row.endtime))
                      : new Date(dateformat("99991231")),
                    [SELECTED_FIELD]: userselectedState[idGetter2(row)],
                  })),
                  userDataState
                )}
                {...userDataState}
                onDataStateChange={onUserDataStateChange}
                //선택기능
                dataItemKey={DATA_ITEM_KEY2}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onUserSelectionChange}
                //정렬기능
                sortable={true}
                onSortChange={onUserSortChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={userDataResult.total}
                skip={page2.skip}
                take={page2.take}
                pageable={true}
                onPageChange={pageChange2}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef2}
                rowHeight={30}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                //incell 수정 기능
                onItemChange={onUserItemChange}
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
                              dateField.includes(item.fieldName)
                                ? DateCell
                                : numberField.includes(item.fieldName)
                                ? NumberCell
                                : comboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : undefined
                            }
                            headerCell={
                              requiredField2.includes(item.fieldName)
                                ? RequiredHeader
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
                                ? userTotalFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
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

export default CM_A1600;
