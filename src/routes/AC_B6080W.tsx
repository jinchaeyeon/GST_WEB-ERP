import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartSeries,
  ChartSeriesItem,
  ChartSeriesItemTooltip,
  ChartTooltip,
  ChartValueAxis,
  ChartValueAxisItem,
} from "@progress/kendo-react-charts";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInInput,
  DDGDcolorList,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
  WebErpcolorList,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat2,
  findMessage,
  getHeight,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import {
  heightstate,
  isLoading,
  isMobileState,
  loginResultState,
} from "../store/atoms";
import { gridList } from "../store/columns/AC_B6080W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";

const numberField = ["금액", "미수금", "미지급금"];
const dateField = ["매출일자", "Tax발행일자", "입고일자"];

const AC_B6080W: React.FC = () => {
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = getHeight(".k-tabstrip-items-wrapper");
  var height1 = getHeight(".ButtonContainer");
  const [tabSelected, setTabSelected] = React.useState(0);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();

    const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_B6080W", setCustomOptionData);
  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        yyyymm: setDefaultDate(customOptionData, "yyyymm"),
        totalamt: defaultOption.find((item: any) => item.id == "totalamt")
          ?.valueCode,
        taxtype: defaultOption.find((item: any) => item.id == "taxtype")
          ?.valueCode,
        worktype2: defaultOption.find((item: any) => item.id == "worktype2")
          ?.valueCode,
        worktype3: defaultOption.find((item: any) => item.id == "worktype3")
          ?.valueCode,
      }));

      const year = setDefaultDate(customOptionData, "yyyymm").getFullYear(); // 년
      const month = setDefaultDate(customOptionData, "yyyymm").getMonth(); // 월
      const day = 1; // 일
      setDate(new Date(year, month, day));
      setDate2(new Date(year, month - 1, day));
      setDate3(new Date(year, month - 2, day));
      setDate4(new Date(year, month - 3, day));
      setDate5(new Date(year, month - 4, day));
      setDate6(new Date(year, month - 5, day));
      setDate7(new Date(year, month - 6, day));
      setDate8(new Date(year, month - 7, day));
      setDate9(new Date(year, month - 8, day));
      setDate10(new Date(year, month - 9, day));
      setDate11(new Date(year, month - 10, day));
      setDate12(new Date(year, month - 11, day));
    }
  }, [customOptionData]);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters((prev) => ({
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

    setDetailFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("AC_B6080W", setMessagesData);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  let _export5: any;
  let _export6: any;
  let _export7: any;
  let _export8: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[0].title = "매출TAX미처리 요약정보";
        optionsGridOne.sheets[1].title = "매출TAX미처리 상세정보";
        _export.save(optionsGridOne);
      }
    }
    if (_export3 !== null && _export3 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridThree = _export3.workbookOptions();
        const optionsGridFour = _export4.workbookOptions();
        optionsGridThree.sheets[1] = optionsGridFour.sheets[0];
        optionsGridThree.sheets[0].title = "미수금내역 요약정보";
        optionsGridThree.sheets[1].title = "미수금내역 상세정보";
        _export3.save(optionsGridThree);
      }
    }
    if (_export5 !== null && _export5 !== undefined) {
      if (tabSelected == 2) {
        const optionsGridFive = _export5.workbookOptions();
        const optionsGridSix = _export6.workbookOptions();
        optionsGridFive.sheets[1] = optionsGridSix.sheets[0];
        optionsGridFive.sheets[0].title = "매입TAX미처리 요약정보";
        optionsGridFive.sheets[1].title = "매입TAX미처리 상세정보";
        _export5.save(optionsGridFive);
      }
    }
    if (_export7 !== null && _export7 !== undefined) {
      if (tabSelected == 3) {
        const optionsGridSeven = _export7.workbookOptions();
        const optionsGridEight = _export8.workbookOptions();
        optionsGridSeven.sheets[1] = optionsGridEight.sheets[0];
        optionsGridSeven.sheets[0].title = "미지급금내역 요약정보";
        optionsGridSeven.sheets[1].title = "미지급금내역 상세정보";
        _export7.save(optionsGridSeven);
      }
    }
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    if (name == "worktype2" || name == "worktype3") {
      if (tabSelected == 0) {
        if (value == "A" || value == "C") {
          setFilters((prev) => ({
            ...prev,
            worktype: "SALETOTAL",
            [name]: value,
            isSearch: true,
          }));
        } else {
          setFilters((prev) => ({
            ...prev,
            worktype: "SALEDETAIL",
            [name]: value,
            isSearch: true,
          }));
        }
      } else if (tabSelected == 1) {
        setFilters((prev) => ({
          ...prev,
          worktype: "COLLECT",
          [name]: value,
          isSearch: true,
        }));
      } else if (tabSelected == 2) {
        if (value == "A" || value == "C") {
          setFilters((prev) => ({
            ...prev,
            worktype: "PURCHASETOTAL",
            [name]: value,
            isSearch: true,
          }));
        } else {
          setFilters((prev) => ({
            ...prev,
            worktype: "PURCHASEDETAIL",
            [name]: value,
            isSearch: true,
          }));
        }
      } else if (tabSelected == 3) {
        setFilters((prev) => ({
          ...prev,
          worktype: "PAYMENT",
          [name]: value,
          isSearch: true,
        }));
      }
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const [allChartDataResult, setAllChartDataResult] = useState({
    mm: [""],
    series: [""],
    list: [],
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    worktype: "SALETOTAL",
    worktype2: "A",
    worktype3: "1",
    orgdiv: sessionOrgdiv,
    yyyymm: new Date(),
    custcd: "",
    custnm: "",
    inoutdiv: "",
    taxtype: "",
    totalamt: "A",
    companyCode: companyCode,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    worktype: "SALESTAXBILL",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [detailFilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    worktype: "DETAIL01",
    custcd: "",
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
      procedureName: "P_AC_B6080W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_Type": filters.worktype,
        "@p_orgdiv": sessionOrgdiv,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_taxtype": filters.taxtype,
        "@p_totalamt": filters.totalamt,
        "@p_inoutdiv": filters.inoutdiv,
        "@p_company_code": filters.companyCode,
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

      let mm: any[] = [];
      let series: any[] = [];

      if (rows.length == 0) {
        mm.push("");
        series.push("");
      }
      rows.forEach((row: any) => {
        if (!mm.includes(row.mm)) {
          mm.push(row.mm);
        }
        if (!series.includes(row.series)) {
          series.push(row.series);
        }
      });

      setAllChartDataResult({
        mm: mm,
        series: series,
        list: rows,
      });

      if (tabSelected == 0) {
        setDetailFilters((prev) => ({
          ...prev,
          worktype: "SALESTAXBILL",
          isSearch: true,
        }));
      } else if (tabSelected == 1) {
        setDetailFilters((prev) => ({
          ...prev,
          worktype: "COLLECT2",
          isSearch: true,
        }));
      } else if (tabSelected == 2) {
        setDetailFilters((prev) => ({
          ...prev,
          worktype: "PURCHASETAXBILL",
          isSearch: true,
        }));
      } else if (tabSelected == 3) {
        setDetailFilters((prev) => ({
          ...prev,
          worktype: "PAYMENT2",
          isSearch: true,
        }));
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

  //그리드 데이터 조회
  const fetchDetailGrid = async (detailFilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B6080W_Q",
      pageNumber: detailFilters.pgNum,
      pageSize: detailFilters.pgSize,
      parameters: {
        "@p_work_Type": detailFilters.worktype,
        "@p_orgdiv": sessionOrgdiv,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_taxtype": filters.taxtype,
        "@p_totalamt": filters.totalamt,
        "@p_inoutdiv": filters.inoutdiv,
        "@p_company_code": filters.companyCode,
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

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        if (tabSelected == 0) {
          setDetailFilters2((prev) => ({
            ...prev,
            isSearch: true,
            worktype: "DETAIL01",
            custcd: rows[0].업체코드,
            pgNum: 1,
          }));
        } else if (tabSelected == 1) {
          setDetailFilters2((prev) => ({
            ...prev,
            isSearch: true,
            worktype: "DETAIL02",
            custcd: rows[0].업체코드,
            pgNum: 1,
          }));
        } else if (tabSelected == 2) {
          setDetailFilters2((prev) => ({
            ...prev,
            isSearch: true,
            worktype: "DETAIL03",
            custcd: rows[0].업체코드,
            pgNum: 1,
          }));
        } else if (tabSelected == 3) {
          setDetailFilters2((prev) => ({
            ...prev,
            isSearch: true,
            worktype: "DETAIL04",
            custcd: rows[0].업체코드,
            pgNum: 1,
          }));
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setDetailFilters((prev) => ({
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
  const fetchDetailGrid2 = async (detailFilters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B6080W_Q",
      pageNumber: detailFilters2.pgNum,
      pageSize: detailFilters2.pgSize,
      parameters: {
        "@p_work_Type": detailFilters2.worktype,
        "@p_orgdiv": sessionOrgdiv,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
        "@p_custcd": detailFilters2.custcd,
        "@p_custnm": filters.custnm,
        "@p_taxtype": filters.taxtype,
        "@p_totalamt": filters.totalamt,
        "@p_inoutdiv": filters.inoutdiv,
        "@p_company_code": filters.companyCode,
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
    setDetailFilters2((prev) => ({
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
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailFilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailFilters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailFilters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters2);
      setDetailFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid2(deepCopiedFilters);
    }
  }, [detailFilters2, permissions]);

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
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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

  //그리드 푸터
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
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

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters2((prev) => ({
      ...prev,
      isSearch: true,
      custcd: selectedRowData.업체코드,
      pgNum: 1,
    }));

    if (swiper && isMobile) {
      swiper.slideTo(2);
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
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setAllChartDataResult({
      mm: [""],
      series: [""],
      list: [],
    });
    setPage(initialPageState);
    setPage2(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.yyyymm).substring(0, 4) < "1997" ||
        convertDateToStr(filters.yyyymm).substring(6, 8) > "31" ||
        convertDateToStr(filters.yyyymm).substring(6, 8) < "01" ||
        convertDateToStr(filters.yyyymm).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B6080W_001");
      } else {
        resetAllGrid();
        if (tabSelected == 0) {
          setFilters((prev) => ({
            ...prev,
            worktype: "SALETOTAL",
            worktype2: "A",
            isSearch: true,
          }));
        } else if (tabSelected == 1) {
          setFilters((prev) => ({
            ...prev,
            worktype: "COLLECT",
            worktype3: "1",
            isSearch: true,
          }));
        } else if (tabSelected == 2) {
          setFilters((prev) => ({
            ...prev,
            worktype: "PURCHASETOTAL",
            worktype2: "A",
            isSearch: true,
          }));
        } else {
          setFilters((prev) => ({
            ...prev,
            worktype: "PAYMENT",
            worktype3: "1",
            isSearch: true,
          }));
        }

        const year = filters.yyyymm.getFullYear(); // 년
        const month = filters.yyyymm.getMonth(); // 월
        const day = 1; // 일
        setDate(new Date(year, month, day));
        setDate2(new Date(year, month - 1, day));
        setDate3(new Date(year, month - 2, day));
        setDate4(new Date(year, month - 3, day));
        setDate5(new Date(year, month - 4, day));
        setDate6(new Date(year, month - 5, day));
        setDate7(new Date(year, month - 6, day));
        setDate8(new Date(year, month - 7, day));
        setDate9(new Date(year, month - 8, day));
        setDate10(new Date(year, month - 9, day));
        setDate11(new Date(year, month - 10, day));
        setDate12(new Date(year, month - 11, day));

        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

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
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };
  const handleSelectTab = (e: any) => {
    resetAllGrid();
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        worktype: "SALETOTAL",
        worktype2: "A",
        isSearch: true,
      }));
    } else if (e.selected == 1) {
      setFilters((prev) => ({
        ...prev,
        worktype: "COLLECT",
        worktype3: "1",
        isSearch: true,
      }));
    } else if (e.selected == 2) {
      setFilters((prev) => ({
        ...prev,
        worktype: "PURCHASETOTAL",
        worktype2: "A",
        isSearch: true,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        worktype: "PAYMENT",
        worktype3: "1",
        isSearch: true,
      }));
    }
    setTabSelected(e.selected);
  };

  const Barchart = () => {
    let array: any[] = [];
    allChartDataResult.series.map((item) => {
      let series2: any[] = [];
      let series: any[] = [];
      for (var i = 0; i < allChartDataResult.mm.length; i++) {
        let valid = true;
        allChartDataResult.list.map((item2: any) => {
          if (allChartDataResult.mm[i] == item2.mm && item == item2.series) {
            series.push(item2.value);
            valid = false;
          }
        });
        if (valid == true) {
          series.push(0);
        }
      }
      series2.push(series);

      array.push(
        <ChartSeriesItem
          labels={{
            visible: true,
            content: (e) =>
              e.value == 0 ? "" : numberWithCommas(e.value) + "",
          }}
          type="column"
          data={series2[0]}
        >
          <ChartSeriesItemTooltip format={item + " : {0}"} />
        </ChartSeriesItem>
      );
    });

    return array;
  };

  const Linechart = () => {
    let array: any[] = [];
    allChartDataResult.series.map((item) => {
      let series2: any[] = [];
      let series: any[] = [];
      for (var i = 0; i < allChartDataResult.mm.length; i++) {
        let valid = true;
        allChartDataResult.list.map((item2: any) => {
          if (allChartDataResult.mm[i] == item2.mm && item == item2.series) {
            series.push(item2.value);
            valid = false;
          }
        });
        if (valid == true) {
          series.push(0);
        }
      }
      series2.push(series);

      array.push(
        <ChartSeriesItem
          labels={{
            visible: true,
            content: (e) =>
              e.value == 0 ? "" : numberWithCommas(e.value) + "",
          }}
          type="line"
          data={series2[0]}
        >
          <ChartSeriesItemTooltip format={item + " : {0}"} />
        </ChartSeriesItem>
      );
    });

    return array;
  };

  const [date, setDate] = useState(new Date());
  const [date2, setDate2] = useState(new Date());
  const [date3, setDate3] = useState(new Date());
  const [date4, setDate4] = useState(new Date());
  const [date5, setDate5] = useState(new Date());
  const [date6, setDate6] = useState(new Date());
  const [date7, setDate7] = useState(new Date());
  const [date8, setDate8] = useState(new Date());
  const [date9, setDate9] = useState(new Date());
  const [date10, setDate10] = useState(new Date());
  const [date11, setDate11] = useState(new Date());
  const [date12, setDate12] = useState(new Date());
  let column1 = dateformat2(convertDateToStr(date)).substring(0, 7);
  let column2 = dateformat2(convertDateToStr(date2)).substring(0, 7);
  let column3 = dateformat2(convertDateToStr(date3)).substring(0, 7);
  let column4 = dateformat2(convertDateToStr(date4)).substring(0, 7);
  let column5 = dateformat2(convertDateToStr(date5)).substring(0, 7);
  let column6 = dateformat2(convertDateToStr(date6)).substring(0, 7);
  let column7 = dateformat2(convertDateToStr(date7)).substring(0, 7);
  let column8 = dateformat2(convertDateToStr(date8)).substring(0, 7);
  let column9 = dateformat2(convertDateToStr(date9)).substring(0, 7);
  let column10 = dateformat2(convertDateToStr(date10)).substring(0, 7);
  let column11 = dateformat2(convertDateToStr(date11)).substring(0, 7);
  let column12 = dateformat2(convertDateToStr(date12)).substring(0, 7);

  return (
    <>
      <TitleContainer>
        <Title>미수금/미지급현황</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_B6080W"
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
        <TabStripTab title="매출TAX미처리">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준년월</th>
                  <td>
                    <DatePicker
                      name="yyyymm"
                      value={filters.yyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </td>
                  <th>단위</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="totalamt"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>계획구분</th>
                  <td colSpan={3}>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="worktype2"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>업체코드</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={filters.custcd}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>업체명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={filterInputChange}
                    />
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
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                      >
                        테이블 보기
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Chart
                    seriesColors={
                      window.location.href.split("/")[2].split(".")[1] == "ddgd"
                        ? DDGDcolorList
                        : WebErpcolorList
                    }
                    style={{ height: deviceHeight - height - height1 }}
                  >
                    <ChartTooltip format="{0}" />
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.mm}
                      />
                    </ChartCategoryAxis>
                    <ChartSeries>
                      {filters.worktype2 == "A" || filters.worktype2 == "B"
                        ? Barchart()
                        : Linechart()}
                    </ChartSeries>
                  </Chart>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%", overflow: "auto" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                      >
                        차트 보기
                      </Button>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(2);
                          }
                        }}
                      >
                        상세정보 보기
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName="미수금/미지급현황"
                  >
                    <Grid
                      style={{ height: deviceHeight - height - height1 }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
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
                      <GridColumn
                        field="업체코드"
                        title="업체코드"
                        width="120px"
                        footerCell={mainTotalFooterCell}
                      />
                      <GridColumn field="업체명" title="업체명" width="120px" />
                      <GridColumn
                        field="1년초과"
                        title="1년초과"
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column12}
                        title={column12}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column11}
                        title={column11}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column10}
                        title={column10}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column9}
                        title={column9}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column8}
                        title={column8}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column7}
                        title={column7}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column6}
                        title={column6}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column5}
                        title={column5}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column4}
                        title={column4}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />

                      <GridColumn
                        field={column3}
                        title={column3}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column2}
                        title={column2}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column1}
                        title={column1}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="TOTAL"
                        title="TOTAL"
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={2}>
                <GridContainer style={{ width: "100%", overflow: "auto" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                      >
                        요약정보 보기
                      </Button>
                    </GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult2.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName="미수금/미지급현황"
                  >
                    <Grid
                      style={{ height: deviceHeight - height - height1 }}
                      data={process(
                        mainDataResult2.data.map((row) => ({
                          ...row,
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
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef2}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange2}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
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
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : dateField.includes(item.fieldName)
                                      ? DateCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell2
                                      : numberField.includes(item.fieldName)
                                      ? gridSumQtyFooterCell2
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
              <GridContainer width="100%">
                <GridContainer height="25vh">
                  <Chart
                    seriesColors={
                      window.location.href.split("/")[2].split(".")[1] == "ddgd"
                        ? DDGDcolorList
                        : WebErpcolorList
                    }
                    style={{ height: "100%" }}
                  >
                    <ChartTooltip format="{0}" />
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.mm}
                      />
                    </ChartCategoryAxis>
                    <ChartSeries>
                      {filters.worktype2 == "A" || filters.worktype2 == "B"
                        ? Barchart()
                        : Linechart()}
                    </ChartSeries>
                  </Chart>
                </GridContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="미수금/미지급현황"
                >
                  <Grid
                    style={{ height: "25vh" }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
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
                    <GridColumn
                      field="업체코드"
                      title="업체코드"
                      width="120px"
                      footerCell={mainTotalFooterCell}
                    />
                    <GridColumn field="업체명" title="업체명" width="120px" />
                    <GridColumn
                      field="1년초과"
                      title="1년초과"
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column12}
                      title={column12}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column11}
                      title={column11}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column10}
                      title={column10}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column9}
                      title={column9}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column8}
                      title={column8}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column7}
                      title={column7}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column6}
                      title={column6}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column5}
                      title={column5}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column4}
                      title={column4}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />

                    <GridColumn
                      field={column3}
                      title={column3}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column2}
                      title={column2}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column1}
                      title={column1}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="TOTAL"
                      title="TOTAL"
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="미수금/미지급현황"
                >
                  <Grid
                    style={{ height: "20vh" }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
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
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef2}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
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
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell2
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell2
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </>
          )}
        </TabStripTab>
        <TabStripTab title="미수금내역">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준년월</th>
                  <td>
                    <DatePicker
                      name="yyyymm"
                      value={filters.yyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </td>
                  <th>단위</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="totalamt"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>계획구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="worktype3"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>업체코드</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={filters.custcd}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>업체명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={filterInputChange}
                    />
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
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                      >
                        테이블 보기
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Chart style={{ height: deviceHeight - height - height1 }}>
                    <ChartTooltip format="{0}" />
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.mm}
                      />
                    </ChartCategoryAxis>
                    <ChartSeries>
                      {filters.worktype3 == "1" ? Barchart() : Linechart()}
                    </ChartSeries>
                  </Chart>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%", overflow: "auto" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                      >
                        차트 보기
                      </Button>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(2);
                          }
                        }}
                      >
                        상세정보 보기
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName="미수금/미지급현황"
                  >
                    <Grid
                      style={{ height: deviceHeight - height - height1 }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
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
                      <GridColumn
                        field="업체코드"
                        title="업체코드"
                        width="120px"
                        footerCell={mainTotalFooterCell}
                      />
                      <GridColumn field="업체명" title="업체명" width="120px" />
                      <GridColumn
                        field="1년초과"
                        title="1년초과"
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column12}
                        title={column12}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column11}
                        title={column11}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column10}
                        title={column10}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column9}
                        title={column9}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column8}
                        title={column8}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column7}
                        title={column7}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column6}
                        title={column6}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column5}
                        title={column5}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column4}
                        title={column4}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />

                      <GridColumn
                        field={column3}
                        title={column3}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column2}
                        title={column2}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column1}
                        title={column1}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="TOTAL"
                        title="TOTAL"
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={2}>
                <GridContainer style={{ width: "100%", overflow: "auto" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                      >
                        요약정보 보기
                      </Button>
                    </GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult2.data}
                    ref={(exporter) => {
                      _export4 = exporter;
                    }}
                    fileName="미수금/미지급현황"
                  >
                    <Grid
                      style={{ height: deviceHeight - height - height1 }}
                      data={process(
                        mainDataResult2.data.map((row) => ({
                          ...row,
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
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef2}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange2}
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
                                  cell={
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : dateField.includes(item.fieldName)
                                      ? DateCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell2
                                      : numberField.includes(item.fieldName)
                                      ? gridSumQtyFooterCell2
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
              <GridContainer width="100%">
                <GridContainer height="25vh">
                  <Chart style={{ height: "100%" }}>
                    <ChartTooltip format="{0}" />
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.mm}
                      />
                    </ChartCategoryAxis>
                    <ChartSeries>
                      {filters.worktype3 == "1" ? Barchart() : Linechart()}
                    </ChartSeries>
                  </Chart>
                </GridContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName="미수금/미지급현황"
                >
                  <Grid
                    style={{ height: "25vh" }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
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
                    <GridColumn
                      field="업체코드"
                      title="업체코드"
                      width="120px"
                      footerCell={mainTotalFooterCell}
                    />
                    <GridColumn field="업체명" title="업체명" width="120px" />
                    <GridColumn
                      field="1년초과"
                      title="1년초과"
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column12}
                      title={column12}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column11}
                      title={column11}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column10}
                      title={column10}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column9}
                      title={column9}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column8}
                      title={column8}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column7}
                      title={column7}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column6}
                      title={column6}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column5}
                      title={column5}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column4}
                      title={column4}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />

                    <GridColumn
                      field={column3}
                      title={column3}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column2}
                      title={column2}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column1}
                      title={column1}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="TOTAL"
                      title="TOTAL"
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export4 = exporter;
                  }}
                  fileName="미수금/미지급현황"
                >
                  <Grid
                    style={{ height: "20vh" }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
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
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef2}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange2}
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
                                cell={
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell2
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell2
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </>
          )}
        </TabStripTab>
        <TabStripTab title="매입TAX미처리">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준년월</th>
                  <td>
                    <DatePicker
                      name="yyyymm"
                      value={filters.yyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </td>
                  <th>단위</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="totalamt"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>계획구분</th>
                  <td colSpan={3}>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="worktype2"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>업체코드</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={filters.custcd}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>업체명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>증빙유형</th>
                  <td colSpan={3}>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="taxtype"
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
                    <ButtonContainer>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                      >
                        테이블 보기
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Chart style={{ height: deviceHeight - height - height1 }}>
                    <ChartTooltip format="{0}" />
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.mm}
                      />
                    </ChartCategoryAxis>
                    <ChartSeries>
                      {filters.worktype2 == "A" || filters.worktype2 == "B"
                        ? Barchart()
                        : Linechart()}
                    </ChartSeries>
                  </Chart>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%", overflow: "auto" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                      >
                        차트 보기
                      </Button>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(2);
                          }
                        }}
                      >
                        상세정보 보기
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export5 = exporter;
                    }}
                    fileName="미수금/미지급현황"
                  >
                    <Grid
                      style={{ height: deviceHeight - height - height1 }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
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
                      <GridColumn
                        field="업체코드"
                        title="업체코드"
                        width="120px"
                        footerCell={mainTotalFooterCell}
                      />
                      <GridColumn field="업체명" title="업체명" width="120px" />
                      <GridColumn
                        field="1년초과"
                        title="1년초과"
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column12}
                        title={column12}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column11}
                        title={column11}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column10}
                        title={column10}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column9}
                        title={column9}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column8}
                        title={column8}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column7}
                        title={column7}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column6}
                        title={column6}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column5}
                        title={column5}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column4}
                        title={column4}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />

                      <GridColumn
                        field={column3}
                        title={column3}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column2}
                        title={column2}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column1}
                        title={column1}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="TOTAL"
                        title="TOTAL"
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={2}>
                <GridContainer style={{ width: "100%", overflow: "auto" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                      >
                        요약정보 보기
                      </Button>
                    </GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult2.data}
                    ref={(exporter) => {
                      _export6 = exporter;
                    }}
                    fileName="미수금/미지급현황"
                  >
                    <Grid
                      style={{ height: deviceHeight - height - height1 }}
                      data={process(
                        mainDataResult2.data.map((row) => ({
                          ...row,
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
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef2}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange2}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
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
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : dateField.includes(item.fieldName)
                                      ? DateCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell2
                                      : numberField.includes(item.fieldName)
                                      ? gridSumQtyFooterCell2
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
              <GridContainer width="100%">
                <GridContainer height="25vh">
                  <Chart style={{ height: "100%" }}>
                    <ChartTooltip format="{0}" />
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.mm}
                      />
                    </ChartCategoryAxis>
                    <ChartSeries>
                      {filters.worktype2 == "A" || filters.worktype2 == "B"
                        ? Barchart()
                        : Linechart()}
                    </ChartSeries>
                  </Chart>
                </GridContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export5 = exporter;
                  }}
                  fileName="미수금/미지급현황"
                >
                  <Grid
                    style={{ height: "25vh" }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
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
                    <GridColumn
                      field="업체코드"
                      title="업체코드"
                      width="120px"
                      footerCell={mainTotalFooterCell}
                    />
                    <GridColumn field="업체명" title="업체명" width="120px" />
                    <GridColumn
                      field="1년초과"
                      title="1년초과"
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column12}
                      title={column12}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column11}
                      title={column11}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column10}
                      title={column10}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column9}
                      title={column9}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column8}
                      title={column8}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column7}
                      title={column7}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column6}
                      title={column6}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column5}
                      title={column5}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column4}
                      title={column4}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />

                    <GridColumn
                      field={column3}
                      title={column3}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column2}
                      title={column2}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column1}
                      title={column1}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="TOTAL"
                      title="TOTAL"
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export6 = exporter;
                  }}
                  fileName="미수금/미지급현황"
                >
                  <Grid
                    style={{ height: "20vh" }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
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
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef2}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
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
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell2
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell2
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </>
          )}
        </TabStripTab>
        <TabStripTab title="미지급금내역">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준년월</th>
                  <td>
                    <DatePicker
                      name="yyyymm"
                      value={filters.yyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </td>
                  <th>단위</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="totalamt"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>계획구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="worktype3"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>업체코드</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={filters.custcd}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>업체명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={filterInputChange}
                    />
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
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                      >
                        테이블 보기
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Chart style={{ height: deviceHeight - height - height1 }}>
                    <ChartTooltip format="{0}" />
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.mm}
                      />
                    </ChartCategoryAxis>
                    <ChartSeries>
                      {filters.worktype3 == "1" ? Barchart() : Linechart()}
                    </ChartSeries>
                  </Chart>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%", overflow: "auto" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                      >
                        차트 보기
                      </Button>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(2);
                          }
                        }}
                      >
                        상세정보 보기
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export7 = exporter;
                    }}
                    fileName="미수금/미지급현황"
                  >
                    <Grid
                      style={{ height: deviceHeight - height - height1 }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
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
                      <GridColumn
                        field="업체코드"
                        title="업체코드"
                        width="120px"
                        footerCell={mainTotalFooterCell}
                      />
                      <GridColumn field="업체명" title="업체명" width="120px" />
                      <GridColumn
                        field="1년초과"
                        title="1년초과"
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column12}
                        title={column12}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column11}
                        title={column11}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column10}
                        title={column10}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column9}
                        title={column9}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column8}
                        title={column8}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column7}
                        title={column7}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column6}
                        title={column6}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column5}
                        title={column5}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column4}
                        title={column4}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />

                      <GridColumn
                        field={column3}
                        title={column3}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column2}
                        title={column2}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field={column1}
                        title={column1}
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                      <GridColumn
                        field="TOTAL"
                        title="TOTAL"
                        width="100px"
                        cell={NumberCell}
                        footerCell={gridSumQtyFooterCell}
                      />
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={2}>
                <GridContainer style={{ width: "100%", overflow: "auto" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                      >
                        요약정보 보기
                      </Button>
                    </GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult2.data}
                    ref={(exporter) => {
                      _export8 = exporter;
                    }}
                    fileName="미수금/미지급현황"
                  >
                    <Grid
                      style={{ height: deviceHeight - height - height1 }}
                      data={process(
                        mainDataResult2.data.map((row) => ({
                          ...row,
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
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef2}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange2}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList4"]
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
                                      : dateField.includes(item.fieldName)
                                      ? DateCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell2
                                      : numberField.includes(item.fieldName)
                                      ? gridSumQtyFooterCell2
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
              <GridContainer width="100%">
                <GridContainer height="25vh">
                  <Chart style={{ height: "100%" }}>
                    <ChartTooltip format="{0}" />
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.mm}
                      />
                    </ChartCategoryAxis>
                    <ChartSeries>
                      {filters.worktype3 == "1" ? Barchart() : Linechart()}
                    </ChartSeries>
                  </Chart>
                </GridContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export7 = exporter;
                  }}
                  fileName="미수금/미지급현황"
                >
                  <Grid
                    style={{ height: "25vh" }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
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
                    <GridColumn
                      field="업체코드"
                      title="업체코드"
                      width="120px"
                      footerCell={mainTotalFooterCell}
                    />
                    <GridColumn field="업체명" title="업체명" width="120px" />
                    <GridColumn
                      field="1년초과"
                      title="1년초과"
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column12}
                      title={column12}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column11}
                      title={column11}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column10}
                      title={column10}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column9}
                      title={column9}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column8}
                      title={column8}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column7}
                      title={column7}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column6}
                      title={column6}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column5}
                      title={column5}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column4}
                      title={column4}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />

                    <GridColumn
                      field={column3}
                      title={column3}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column2}
                      title={column2}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field={column1}
                      title={column1}
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                    <GridColumn
                      field="TOTAL"
                      title="TOTAL"
                      width="100px"
                      cell={NumberCell}
                      footerCell={gridSumQtyFooterCell}
                    />
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export8 = exporter;
                  }}
                  fileName="미수금/미지급현황"
                >
                  <Grid
                    style={{ height: "20vh" }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
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
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef2}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList4"]
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
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell2
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell2
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </>
          )}
        </TabStripTab>
      </TabStrip>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"ROW_ADD"}
          setData={setCustData}
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

export default AC_B6080W;
