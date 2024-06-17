import { Card, CardContent, Grid as GridMUI, Typography } from "@mui/material";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import YearCalendar from "../components/Calendars/YearCalendar";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import YearDateCell from "../components/Cells/YearDateCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getBizCom,
  getDeviceHeight,
  getHeight,
  handleKeyPressSearch,
  numberWithCommas3,
  setDefaultDate,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import ApprovalWindow from "../components/Windows/CommonWindows/ApprovalWindow";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import DetailWindow from "../components/Windows/HU_A4110W_Window";
import { useApi } from "../hooks/api";
import {
  deletedAttadatnumsState,
  isFilterHideState,
  isLoading,
  loginResultState
} from "../store/atoms";
import { gridList } from "../store/columns/HU_A4110W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
var index = 0;

const DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY = "num";
const numberField = ["amt", "taxamt"];
const dateField = ["carddt", "expensedt"];
const yeardateField = ["yyyy"];
let targetRowIndex: null | number = null;

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;

const HU_A4110W: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_A4110W", setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".ButtonContainer3");
      height4 = getHeight(".FormBoxWrap");
      height5 = getHeight(".filterbox_HU_A4110W");
      height6 = getHeight(".TitleContainer");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(
          getDeviceHeight(true) - height - height2 - height4 - height6
        );
        setMobileHeight2(getDeviceHeight(true) - height3 - height6);
        setWebHeight(
          (getDeviceHeight(true) - height4 - height5 - height6) / 2 - height
        );
        setWebHeight2(
          (getDeviceHeight(true) - height4 - height5 - height6) / 2 - height2
        );
        setWebHeight3(getDeviceHeight(true) - height3 - height6);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, webheight3]);
  console.log(height3);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  const idSubGetter = getter(SUB_DATA_ITEM_KEY);
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const userName = loginResult ? loginResult.userName : "";
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [workType, setWorkType] = useState<"N" | "U" | "C">("N");
  const pc = UseGetValueFromSessionItem("pc");
  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        strdt: setDefaultDate(customOptionData, "strdt"),
        enddt: setDefaultDate(customOptionData, "enddt"),
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        position: defaultOption.find((item: any) => item.id == "position")
          ?.valueCode,
        appsts: defaultOption.find((item: any) => item.id == "appsts")
          ?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        acntdiv: defaultOption.find((item: any) => item.id == "acntdiv")
          ?.valueCode,
      }));
      setSubFilters((prev) => ({
        ...prev,
        yyyy: setDefaultDate(customOptionData, "yyyy"),
        semiannualgb: defaultOption.find(
          (item: any) => item.id == "semiannualgb"
        )?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001, L_BA002",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setLocationListData(getBizCom(bizComponentData, "L_BA002"));
      setdptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
    }
  }, [bizComponentData]);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [subpage, setSubPage] = useState(initialPageState);
  const [page, setPage] = useState(initialPageState);

  const subpageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setSubPage({
      skip: page.skip,
      take: initialPageState.take,
    });
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

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "복지포인트 사용내역";
      optionsGridOne.sheets[1].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  const search = () => {
    setPage(initialPageState);
    setFilters((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
  };

  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  //그리드 데이터 결과값
  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [subselectedState, setSubSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [SubInformation, setSubInformation] = useState({
    amt: 0,
    janamt: 0,
    list: [],
  });

  const [subfilters, setSubFilters] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    work_type: "POINT",
    orgdiv: sessionOrgdiv,
    yyyy: new Date(),
    semiannualgb: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST",
    orgdiv: sessionOrgdiv,
    strdt: new Date(),
    enddt: new Date(),
    location: "",
    position: "",
    appsts: "",
    prsnnum: userId,
    prsnnm: userName,
    dptcd: "",
    acntdiv: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [detailWindowVisible2, setDetailWindowVisible2] =
    useState<boolean>(false);
  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);
  const onUserWndClick = () => {
    setuserWindowVisible(true);
  };

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.num]: true });

      setWorkType("U");
      setDetailWindowVisible(true);
    };

    return (
      <td className="k-command-cell">
        <Button
          className="k-grid-edit-command"
          themeColor={"primary"}
          fillMode="outline"
          onClick={onEditClick}
          icon="edit"
        ></Button>
      </td>
    );
  };

  const onAddClick = () => {
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const onCopyClick = () => {
    if (mainDataResult.total > 0) {
      setWorkType("C");
      setDetailWindowVisible(true);
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onCheckClick = () => {
    if (mainDataResult.total > 0) {
      const selectRow = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      if (selectRow.appsts == "") {
        setDetailWindowVisible2(true);
      } else {
        alert("이미 결제처리 중입니다.");
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };

  interface IPrsnnum {
    prsnnum: string;
    prsnnm: string;
    dptcd: string;
    abilcd: string;
    postcd: string;
  }

  const setUserData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setSubFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setSubFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterInputChange2 = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange2 = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterRadioChange2 = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const search2 = () => {
    setSubPage(initialPageState);
    setSubFilters((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
  };
  //그리드 데이터 조회
  const fetchSubGrid = async (subfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A4110W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": subfilters.work_type,
        "@p_orgdiv": subfilters.orgdiv,
        "@p_strdt": convertDateToStr(filters.strdt),
        "@p_enddt": convertDateToStr(filters.enddt),
        "@p_location": filters.location,
        "@p_prsnnum": filters.prsnnum,
        "@p_dptcd": filters.dptcd,
        "@p_expensedt": "",
        "@p_expenseseq1": 0,
        "@p_prsnnm": filters.prsnnm,
        "@p_appsts": filters.appsts,
        "@p_position": filters.position,
        "@p_acntdiv": filters.acntdiv,
        "@p_company_code": companyCode,

        "@p_yyyy": convertDateToStr(subfilters.yyyy).substring(0, 4),
        "@p_semiannualgb": subfilters.semiannualgb,

        "@p_find_row_value": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[2].TotalRowCount;
      const rows = data.tables[0].Rows;
      const rows2 = data.tables[1].Rows;
      const rows3 = data.tables[2].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      setSubInformation({
        amt: rows[0].amt,
        janamt: rows[0].janamt,
        list: rows2,
      });
      setSubDataResult((prev) => {
        return {
          data: rows3,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSubSelectedState({ [rows3[0][SUB_DATA_ITEM_KEY]]: true });
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
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A4110W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_strdt": convertDateToStr(filters.strdt),
        "@p_enddt": convertDateToStr(filters.enddt),
        "@p_location": filters.location,
        "@p_prsnnum": filters.prsnnum,
        "@p_dptcd": filters.dptcd,
        "@p_expensedt": "",
        "@p_expenseseq1": 0,
        "@p_prsnnm": filters.prsnnm,
        "@p_appsts": filters.appsts,
        "@p_position": filters.position,
        "@p_acntdiv": filters.acntdiv,
        "@p_company_code": companyCode,

        "@p_yyyy": "",
        "@p_semiannualgb": "",

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
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.expenseno == filters.find_row_value
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
            : rows.find((row: any) => row.expenseno == filters.find_row_value);
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
  let gridRef: any = useRef(null);
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (subfilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);
      setSubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && customOptionData !== null) {
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

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onSubSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: subselectedState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });

    setSubSelectedState(newSelectedState);
  };
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };
  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  //그리드 푸터
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

  const gridSubSumQtyFooterCell = (props: GridFooterCellProps) => {
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
  //그리드 정렬 이벤트
  const onSubSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult.total > 0) {
      const data = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        expensedt: data.expensedt,
        expenseseq1: data.expenseseq1,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    expensedt: "",
    expenseseq1: 0,
  });

  const paraDeleted: Iparameters = {
    procedureName: "P_HU_A4110W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,

      "@p_orgdiv": sessionOrgdiv,

      "@p_expensedt": paraDataDeleted.expensedt,
      "@p_expenseseq1": paraDataDeleted.expenseseq1,
      "@p_location": "",
      "@p_prsnnum": "",
      "@p_dptcd": "",
      "@p_position": "",

      "@p_rowstatus_s": "",
      "@p_expenseseq2_s": "",
      "@p_indt_s": "",
      "@p_usekind_s": "",
      "@p_cardcd_s": "",
      "@p_taxdiv_s": "",
      "@p_etax_s": "",
      "@p_dptcd_s": "",
      "@p_custcd_s": "",
      "@p_custnm_s": "",
      "@p_rcvcustcd_s": "",
      "@p_rcvcustnm_s": "",
      "@p_itemcd_s": "",
      "@p_itemnm_s": "",
      "@p_qty_s": "",
      "@p_amt_s": "",
      "@p_taxamt_s": "",
      "@p_incidentalamt_s": "",
      "@p_amtunit_s": "",
      "@p_unp_s": "",
      "@p_wonamt_s": "",
      "@p_acntcd_s": "",
      "@p_acntnm_s": "",
      "@p_attdatnum_s": "",
      "@p_fxassetcd_s": "",
      "@p_ordnum_s": "",
      "@p_remark_s": "",
      "@p_carddt_s": "",
      "@p_taxtype_s": "",
      "@p_creditcd_s": "",
      "@p_creditnm_s": "",
      "@p_auto_transfer_s": "",
      "@p_printdiv_s": "",
      "@p_ma210t_recdt_s": "",
      "@p_ma210t_seq1_s": "",
      "@p_ma210t_seq2_s": "",
      "@p_expenseno_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A4110W",
    },
  };

  const resetAllGrid = () => {
    setPage(initialPageState);
    setSubPage(initialPageState);
    setSubDataResult(process([], subDataState));
    setMainDataResult(process([], mainDataState));
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted =
        mainDataResult.data.length == 1 && filters.pgNum > 0;
      const findRowIndex = mainDataResult.data.findIndex(
        (row: any) => row.num == Object.getOwnPropertyNames(selectedState)[0]
      );

      if (data.returnString != "") {
        let array: any[] = [];

        data.returnString.split("|").map((item: any) => {
          array.push(item);
        });
        setDeletedAttadatnums(array);
      }
      resetAllGrid();

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
        setSubFilters((prev) => ({
          ...prev,
          isSearch: true,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          find_row_value:
            mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
              .expenseno,
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
        setSubFilters((prev) => ({
          ...prev,
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    //초기화
    setParaDataDeleted((prev) => ({
      work_type: "",
      expensedt: "",
      expenseseq1: 0,
    }));
  };

  useEffect(() => {
    if (paraDataDeleted.work_type == "D") fetchToDelete();
  }, [paraDataDeleted]);

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>POINT ZONE</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A4110W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      {swiper?.activeIndex == 0 && isMobile ? (
        <FilterContainer>
          <FilterBox>
            <tbody>
              <tr>
                <th>기준년도</th>
                <td>
                  <div className="flex align-items-center">
                    <DatePicker
                      name="yyyy"
                      format="yyyy"
                      value={subfilters.yyyy}
                      onChange={filterInputChange}
                      placeholder=""
                      calendar={YearCalendar}
                      className="required"
                    />
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="semiannualgb"
                        value={subfilters.semiannualgb}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        valueField="code"
                        textField="codenm"
                      />
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  <Button
                    themeColor={"primary"}
                    fillMode="outline"
                    onClick={() => search2()}
                    icon="search"
                    style={{ width: "100%" }}
                  >
                    포인트 조회하기
                  </Button>
                </td>
              </tr>
            </tbody>
          </FilterBox>
        </FilterContainer>
      ) : (
        <FilterContainer>
          <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
            <tbody>
              <tr>
                <th>일자</th>
                <td>
                  <CommonDateRangePicker
                    value={{
                      start: filters.strdt,
                      end: filters.enddt,
                    }}
                    onChange={(e: { value: { start: any; end: any } }) =>
                      setFilters((prev) => ({
                        ...prev,
                        strdt: e.value.start,
                        enddt: e.value.end,
                      }))
                    }
                    className="required"
                  />
                </td>
                <th>사업장</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="location"
                      value={filters.location}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange2}
                    />
                  )}
                </td>
                <th>사업부</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="position"
                      value={filters.position}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange2}
                    />
                  )}
                </td>
                <th>결재승인구분</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionRadioGroup
                      name="appsts"
                      customOptionData={customOptionData}
                      changeData={filterRadioChange2}
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>사번</th>
                <td>
                  <Input
                    name="prsnnum"
                    type="text"
                    value={filters.prsnnum}
                    onChange={filterInputChange2}
                  />
                  <ButtonInInput>
                    <Button
                      onClick={onUserWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
                <th>성명</th>
                <td>
                  <Input
                    name="prsnnm"
                    type="text"
                    value={filters.prsnnm}
                    onChange={filterInputChange2}
                  />
                </td>
                <th>비용부서</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="dptcd"
                      value={filters.dptcd}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange2}
                      valueField="dptcd"
                      textField="dptnm"
                    />
                  )}
                </td>
                <th>전표처리구분</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionRadioGroup
                      name="acntdiv"
                      customOptionData={customOptionData}
                      changeData={filterRadioChange2}
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </FilterBox>
        </FilterContainer>
      )}
      {isMobile ? (
        <>
          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
            onActiveIndexChange={(swiper) => {
              index = swiper.activeIndex;
              setIsFilterHideStates(true);
            }}
          >
            <SwiperSlide key={0}>
              <GridContainer style={{ width: "100%" }}>
                <FormBoxWrap border={true} className="FormBoxWrap">
                  <FormBox>
                    <tbody>
                      <tr style={{ display: "flax", flexDirection: "row" }}>
                        <th style={{ width: "30%", minWidth: "100px" }}>
                          지급포인트
                        </th>
                        <td style={{ width: "70%" }}>
                          <Input
                            name="amt"
                            type="text"
                            style={{
                              textAlign: "right",
                            }}
                            value={numberWithCommas3(SubInformation.amt)}
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr style={{ display: "flax", flexDirection: "row" }}>
                        <th style={{ width: "30%", minWidth: "100px" }}>
                          잔여포인트
                        </th>
                        <td style={{ width: "70%" }}>
                          <Input
                            name="janamt"
                            type="text"
                            style={{
                              textAlign: "right",
                            }}
                            value={numberWithCommas3(SubInformation.janamt)}
                            className="readonly"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
                <GridContainer>
                  <GridContainer className="ButtonContainer">
                    <GridTitleContainer>
                      <GridTitle>복지포인트 사용가능 범위</GridTitle>
                    </GridTitleContainer>
                    <GridMUI container spacing={1}>
                      {SubInformation.list.map((item: any) => (
                        <GridMUI item xs={4} sm={4} md={4} lg={12} xl={6}>
                          <Card
                            style={{
                              width: "100%",
                              backgroundColor: "yellow",
                            }}
                          >
                            <CardContent
                              style={{ textAlign: "center", padding: 3 }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {item.code_name}
                              </Typography>
                            </CardContent>
                          </Card>
                        </GridMUI>
                      ))}
                    </GridMUI>
                  </GridContainer>
                  <GridContainer>
                    <GridTitleContainer
                      style={{
                        paddingTop: "10px",
                        justifyContent: "space-between",
                      }}
                      className="ButtonContainer2"
                    >
                      <GridTitle>
                        <ButtonContainer
                          style={{ justifyContent: "space-between" }}
                        >
                          복지포인트 사용내역
                          <Button
                            onClick={() => {
                              if (swiper && isMobile) {
                                swiper.slideTo(1);
                              }
                            }}
                            themeColor="primary"
                            icon="chevron-right"
                            fillMode="flat"
                          ></Button>
                        </ButtonContainer>
                      </GridTitle>
                    </GridTitleContainer>
                    <ExcelExport
                      data={subDataResult.data}
                      ref={(exporter) => {
                        _export = exporter;
                      }}
                      fileName="POINT ZONE"
                    >
                      <Grid
                        style={{
                          height: mobileheight,
                        }}
                        data={process(
                          subDataResult.data.map((row) => ({
                            ...row,
                            [SELECTED_FIELD]:
                              subselectedState[idSubGetter(row)], //선택된 데이터
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
                        onSelectionChange={onSubSelectionChange}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={subDataResult.total}
                        skip={subpage.skip}
                        take={subpage.take}
                        pageable={true}
                        onPageChange={subpageChange}
                        //정렬기능
                        sortable={true}
                        onSortChange={onSubSortChange}
                        //컬럼순서조정
                        reorderable={true}
                        //컬럼너비조정
                        resizable={true}
                      >
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdSubList"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
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
                                        : yeardateField.includes(item.fieldName)
                                        ? YearDateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? subTotalFooterCell
                                        : numberField.includes(item.fieldName)
                                        ? gridSubSumQtyFooterCell
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </GridContainer>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer
                style={{
                  width: "100%",
                }}
              >
                <GridTitleContainer className="ButtonContainer3">
                  <ButtonContainer style={{ justifyContent: "left" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(0);
                        }
                      }}
                      themeColor={"primary"}
                      fillMode={"flat"}
                      icon="chevron-left"
                    ></Button>
                  </ButtonContainer>
                  <ButtonContainer>
                    <Button
                      onClick={onCheckClick}
                      themeColor={"primary"}
                      icon="track-changes-accept"
                    >
                      지출결의서결재
                    </Button>
                    <Button
                      onClick={onAddClick}
                      themeColor={"primary"}
                      icon="file-add"
                    >
                      지출결의서생성
                    </Button>
                  </ButtonContainer>
                  <ButtonContainer>
                    <Button
                      onClick={onCopyClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="copy"
                    >
                      지출결의서복사
                    </Button>
                    <Button
                      onClick={onDeleteClick}
                      icon="delete"
                      fillMode="outline"
                      themeColor={"primary"}
                    >
                      지출결의서삭제
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="POINT ZONE"
                >
                  <Grid
                    style={{ height: mobileheight2 }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        location: locationListData.find(
                          (item: any) => item.sub_code == row.location
                        )?.code_name,
                        dptcd: dptcdListData.find(
                          (item: any) => item.dptcd == row.dptcd
                        )?.dptnm,
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
                  >
                    <GridColumn cell={CommandCell} width="50px" />
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
                                    : numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell
                                    : undefined
                                }
                              ></GridColumn>
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
            <GridContainer width="20%">
              <div className="filterbox_HU_A4110W">
                <FilterContainer>
                  <FilterBox>
                    <tbody>
                      <tr>
                        <th>기준년도</th>
                        <td>
                          <div className="flex align-items-center">
                            <DatePicker
                              name="yyyy"
                              format="yyyy"
                              value={subfilters.yyyy}
                              onChange={filterInputChange}
                              placeholder=""
                              calendar={YearCalendar}
                              className="required"
                            />
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="semiannualgb"
                                value={subfilters.semiannualgb}
                                customOptionData={customOptionData}
                                changeData={filterComboBoxChange}
                                valueField="code"
                                textField="codenm"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>
                          <Button
                            themeColor={"primary"}
                            fillMode="outline"
                            onClick={() => search2()}
                            icon="search"
                            style={{ width: "100%" }}
                          >
                            포인트 조회하기
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </FilterBox>
                </FilterContainer>
              </div>
              <FormBoxWrap border={true} className="FormBoxWrap">
                <FormBox>
                  <tbody>
                    <tr>
                      <th>지급포인트</th>
                      <td>
                        <Input
                          name="amt"
                          type="text"
                          style={{
                            textAlign: "right",
                          }}
                          value={numberWithCommas3(SubInformation.amt)}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>잔여포인트</th>
                      <td>
                        <Input
                          name="janamt"
                          type="text"
                          style={{
                            textAlign: "right",
                          }}
                          value={numberWithCommas3(SubInformation.janamt)}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>복지포인트 사용가능 범위</GridTitle>
                </GridTitleContainer>
                <GridContainer style={{ height: webheight, overflowY: "auto" }}>
                  <GridMUI container spacing={2}>
                    {SubInformation.list.map((item: any) => (
                      <GridMUI item xs={6} sm={6} md={6} lg={12} xl={6}>
                        <Card
                          style={{
                            width: "100%",
                            backgroundColor: "yellow",
                            height: "50px",
                          }}
                        >
                          <CardContent style={{ textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                              {item.code_name}
                            </Typography>
                          </CardContent>
                        </Card>
                      </GridMUI>
                    ))}
                  </GridMUI>
                </GridContainer>
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>복지포인트 사용내역</GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={subDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName="POINT ZONE"
                  >
                    <Grid
                      style={{ height: webheight2 }}
                      data={process(
                        subDataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: subselectedState[idSubGetter(row)], //선택된 데이터
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
                      onSelectionChange={onSubSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={subDataResult.total}
                      skip={subpage.skip}
                      take={subpage.take}
                      pageable={true}
                      onPageChange={subpageChange}
                      //정렬기능
                      sortable={true}
                      onSortChange={onSubSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdSubList"]
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
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : dateField.includes(item.fieldName)
                                      ? DateCell
                                      : yeardateField.includes(item.fieldName)
                                      ? YearDateCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? subTotalFooterCell
                                      : numberField.includes(item.fieldName)
                                      ? gridSubSumQtyFooterCell
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </GridContainer>
            </GridContainer>
            <GridContainer width={`calc(80% - ${GAP}px)`}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>요약정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onCheckClick}
                      themeColor={"primary"}
                      icon="track-changes-accept"
                    >
                      지출결의서결재
                    </Button>
                    <Button
                      onClick={onAddClick}
                      themeColor={"primary"}
                      icon="file-add"
                    >
                      지출결의서생성
                    </Button>
                    <Button
                      onClick={onCopyClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="copy"
                    >
                      지출결의서복사
                    </Button>
                    <Button
                      onClick={onDeleteClick}
                      icon="delete"
                      fillMode="outline"
                      themeColor={"primary"}
                    >
                      지출결의서삭제
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="POINT ZONE"
                >
                  <Grid
                    style={{ height: webheight3 }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        location: locationListData.find(
                          (item: any) => item.sub_code == row.location
                        )?.code_name,
                        dptcd: dptcdListData.find(
                          (item: any) => item.dptcd == row.dptcd
                        )?.dptnm,
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
                  >
                    <GridColumn cell={CommandCell} width="50px" />
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
                                    : numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell
                                    : undefined
                                }
                              ></GridColumn>
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : A
          setData={(str) => {
            setFilters((prev) => ({
              ...prev,
              find_row_value: str,
              isSearch: true,
            }));
            setSubFilters((prev) => ({
              ...prev,
              isSearch: true,
            }));
          }}
          para={
            mainDataResult.data.filter(
              (item: any) =>
                item.num == Object.getOwnPropertyNames(selectedState)[0]
            )[0] == undefined
              ? ""
              : mainDataResult.data.filter(
                  (item: any) =>
                    item.num == Object.getOwnPropertyNames(selectedState)[0]
                )[0]
          }
          modal={true}
          pathname="HU_A4110W"
        />
      )}
      {detailWindowVisible2 && (
        <ApprovalWindow
          setVisible={setDetailWindowVisible2}
          para={
            mainDataResult.data.filter(
              (item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
            )[0] != undefined
              ? mainDataResult.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedState)[0]
                )[0]
              : ""
          }
          pathname="HU_A4110W"
          pgmgb="P"
          setData={(str) =>
            setFilters((prev) => ({
              ...prev,
              find_row_value: str,
              isSearch: true,
            }))
          }
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

export default HU_A4110W;
