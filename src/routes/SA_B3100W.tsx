import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartCategoryAxisTitle,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
  ChartSeriesLabels,
  ChartTitle,
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
import "hammerjs";
import React, { useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  DDGDcolorList,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  Title,
  TitleContainer,
  WebErpcolorList,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import YearCalendar from "../components/Calendars/YearCalendar";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseDesignInfo,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { IItemData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/SA_B3100W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

var index = 0;
const MAX_CHARACTERS = 6;

const numberField: string[] = [
  "qty01",
  "qty02",
  "qty03",
  "qty04",
  "qty05",
  "qty06",
  "qty07",
  "qty08",
  "qty09",
  "qty10",
  "qty11",
  "qty12",
  "amt01",
  "amt02",
  "amt03",
  "amt04",
  "amt05",
  "amt06",
  "amt07",
  "amt08",
  "amt09",
  "amt10",
  "amt11",
  "amt12",
];
const dateField = ["recdt", "time"];
const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
let targetRowIndex4: null | number = null;

const SA_B3100W: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const setLoading = useSetRecoilState(isLoading);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("SA_B3100W", setMessagesData);

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

    setFilters((prev) => ({
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

    setFilters((prev) => ({
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

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SA_B3100W", setCustomOptionData);

  const [wordInfoData, setWordInfoData] = React.useState<any>(null);
  UseDesignInfo("SA_B3100W", setWordInfoData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001,L_sysUserMaster_001,L_EA002,L_HU089,L_appyn,L_USERS,L_HU005,L_EA004",
    //부서,담당자,결재문서,근태구분,결재유무,사용자,직위,결재라인
    setBizComponentData
  );

  const [yearTitle, setYearTitle] = useState([]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        yyyy: setDefaultDate(customOptionData, "yyyy"),
        itemacnt: defaultOption.find((item: any) => item.id == "itemacnt")
          .valueCode,
        rdoAmtdiv: defaultOption.find((item: any) => item.id == "rdoAmtdiv")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [gridDataState, setGridDataState] = useState<State>({
    sort: [],
  });

  const [gridDataResult, setGridDataResult] = useState<DataResult>(
    process([], gridDataState)
  );
  const [allChartDataResult, setAllChartDataResult] = useState({
    companies: [""],
    series: [0],
  });
  const [chartDataResult, setChartDataResult] = useState([]);

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
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
  };

  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
    if (targetRowIndex4 !== null && gridRef4.current) {
      gridRef4.current.scrollIntoView({ rowIndex: targetRowIndex4 });
      targetRowIndex4 = null;
    }
  }, [gridDataResult]);

  useEffect(() => {
    search();
  }, [tabSelected]);

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

  const initFrdt = new Date();
  initFrdt.setMonth(initFrdt.getMonth() - 2);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    orgdiv: "01",
    cboLocation: "01",
    yyyy: new Date(),
    custcd: "",
    custnm: "",
    mm: "",
    rdoAmtdiv: "A",
    itemcd: "",
    itemnm: "",
    itemacnt: "",
    itemlvl1: "",
    project: "",
    bnatur: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);

  //그리드 데이터 조회
  const fetchGrid = async (workType: string, itemcd?: string) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_B3100W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.cboLocation,
        "@p_yyyy": convertDateToStr(filters.yyyy).substr(0, 4),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_mm": filters.mm,
        "@p_amtdiv": filters.rdoAmtdiv,
        "@p_itemcd": itemcd ? itemcd : filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt": filters.itemacnt,
        "@p_itemlvl1": filters.itemlvl1,
        "@p_project": filters.project,
        "@p_bnatur": filters.bnatur,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;

      if (gridRef.current) {
        targetRowIndex = 0;
      }
      if (gridRef2.current) {
        targetRowIndex2 = 0;
      }
      if (gridRef3.current) {
        targetRowIndex3 = 0;
      }
      if (gridRef4.current) {
        targetRowIndex4 = 0;
      }

      // 연도 타이틀 (5년)
      if (workType == "TITLE1") {
        setYearTitle(Object.values(rows[0]));
      }
      // 공통 그리드
      else if (
        workType == "GRID" ||
        workType == "MONTH" ||
        workType == "QUARTER" ||
        workType == "5year"
      ) {
        const totalRowCnt2 = data.tables[0].TotalRowCount;
        setGridDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt2 == -1 ? 0 : totalRowCnt2,
          };
        });
        if (totalRowCnt2 > 0) {
          // 첫번째 행 선택하기
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          if (tabSelected == 1) {
            fetchGrid("MCHART", rows[0].itemcd);
          } else if (tabSelected == 2) {
            fetchGrid("QCHART", rows[0].itemcd);
          } else if (tabSelected == 3) {
            fetchGrid("CHART", rows[0].itemcd);
          }
        }
      }
      // 공통 차트
      else if (
        workType == "MCHART" ||
        workType == "QCHART" ||
        workType == "CHART"
      ) {
        setChartDataResult(rows);
      }
      // 전체 탭 그래프 (업체별 데이터로 가공)
      else if (workType == "TOTAL") {
        let newRows = { companies: [""], series: [0] };

        rows.forEach((row: any) => {
          if (!newRows.companies.includes(row.argument)) {
            newRows.companies.push(row.argument);
            newRows.series.push(row.value);
          }
        });

        setAllChartDataResult({
          companies: newRows.companies,
          series: newRows.series,
        });
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
  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchGrid("TITLE1");

      if (tabSelected == 0) {
        fetchGrid("TOTAL");
        fetchGrid("GRID");
      } else if (tabSelected == 1) {
        fetchGrid("MONTH");
        fetchGrid("MCHART");
      } else if (tabSelected == 2) {
        fetchGrid("QUARTER");
        fetchGrid("QCHART");
      } else if (tabSelected == 3) {
        fetchGrid("5year");
        fetchGrid("CHART");
      }
    }
  }, [filters, permissions]);

  //그리드 리셋
  const resetGrid = () => {
    setGridDataResult(process([], gridDataState));
    setAllChartDataResult({
      companies: [""],
      series: [0],
    });
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onGridSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
    if (swiper) {
      swiper.slideTo(0);
    }
  };

  const onMonthGridSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setSelectedState(newSelectedState);
    if (tabSelected == 1) {
      fetchGrid("MCHART", selectedRowData.itemcd);
    } else if (tabSelected == 2) {
      fetchGrid("QCHART", selectedRowData.itemcd);
    } else if (tabSelected == 3) {
      fetchGrid("CHART", selectedRowData.itemcd);
    }
    setSelectedState(newSelectedState);
    if (swiper) {
      swiper.slideTo(1);
    }
  };

  //엑셀 내보내기
  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "전체";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridOne = _export2.workbookOptions();
        optionsGridOne.sheets[0].title = "월별";
        _export2.save(optionsGridOne);
      }
    }
    if (_export3 !== null && _export3 !== undefined) {
      if (tabSelected == 2) {
        const optionsGridOne = _export3.workbookOptions();
        optionsGridOne.sheets[0].title = "분기별";
        _export3.save(optionsGridOne);
      }
    }
    if (_export4 !== null && _export4 !== undefined) {
      if (tabSelected == 3) {
        const optionsGridOne = _export4.workbookOptions();
        optionsGridOne.sheets[0].title = "5년분석";
        _export4.save(optionsGridOne);
      }
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onGridDataStateChange = (event: GridDataStateChangeEvent) => {
    setGridDataState(event.dataState);
  };
  //그리드 푸터
  const gridTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = gridDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {gridDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    gridDataResult.data.forEach((item) =>
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

  //업체마스터 팝업
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };
  const onGridSortChange = (e: any) => {
    setGridDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const labelContent = (props: any) => {
    let formatedNumber = Number(props.percentage).toLocaleString(undefined, {
      style: "percent",
      minimumFractionDigits: 3, //소수점
    });
    return `${props.dataItem.mm} : ${formatedNumber}`;
  };

  const quarterDonutRenderTooltip = (context: any) => {
    const { category, series, value } = context.point || context;

    return (
      <div>
        {category} ({series.name}): {numberWithCommas(value)}
      </div>
    );
  };

  const quarterDonutRenderTooltip2 = (context: any) => {
    const { dataItem, percentage } = context.point || context;

    return (
      <div>
        {dataItem.mm}: {percentage}
      </div>
    );
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.yyyy).substr(0, 4) == "" ||
        convertDateToStr(filters.yyyy).substr(0, 4) == null ||
        convertDateToStr(filters.yyyy).substr(0, 4) == undefined
      ) {
        throw findMessage(messagesData, "SA_B3100W_001");
      } else {
        resetGrid();
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
      }
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
      {isMobile ? (
        <>
          <TitleContainer>
            <Title>매출집계(품목)</Title>

            <ButtonContainer>
              {permissions && (
                <TopButtons
                  search={search}
                  exportExcel={exportExcel}
                  permissions={permissions}
                  pathname="SA_B3100W"
                />
              )}
            </ButtonContainer>
          </TitleContainer>
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th data-control-name="lblYyyy">기준년도</th>
                  <td>
                    <DatePicker
                      name="yyyy"
                      value={filters.yyyy}
                      format="yyyy"
                      onChange={filterInputChange}
                      calendar={YearCalendar}
                      className="required"
                      placeholder=""
                    />
                  </td>
                  <th data-control-name="lblImcd">품목코드</th>
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

                  <th data-control-name="lblItemnm">품목명</th>
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
                  <th data-control-name="lblAmtdiv">단위</th>
                  <td>
                    {customOptionData !== null && (
                      <CommonRadioGroup
                        name="rdoAmtdiv"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th></th>
                  <td></td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <TabStrip
            selected={tabSelected}
            onSelect={handleSelectTab}
            style={{ height: "80vh", width: "100%", paddingBottom: "15px" }}
          >
            <TabStripTab title="전체">
              <GridContainerWrap flexDirection="column">
                <Swiper
                  onSwiper={(swiper) => {
                    setSwiper(swiper);
                  }}
                  onActiveIndexChange={(swiper) => {
                    index = swiper.activeIndex;
                  }}
                >
                  <SwiperSlide key={0} className="swiper-slide">
                    <GridContainer
                      className="leading_70_Swiper"
                      height="100%"
                    >
                      <ButtonContainer style={{ paddingBottom: "10px" }}>
                        <Button
                          onClick={() => {
                            if (swiper) {
                              swiper.slideTo(1);
                            }
                          }}
                        >
                          테이블 보기
                        </Button>
                      </ButtonContainer>
                      <Chart
                        seriesColors={
                          window.location.href.split("/")[2].split(".")[1] ==
                          "ddgd"
                            ? DDGDcolorList
                            : WebErpcolorList
                        }
                        style={{ height: "60vh" }}
                      >
                        <ChartValueAxis>
                          <ChartValueAxisItem
                            labels={{
                              visible: true,
                              content: (e) => numberWithCommas(e.value) + "",
                            }}
                          />
                        </ChartValueAxis>
                        {/* <ChartTitle text="Units sold" /> */}
                        <ChartCategoryAxis>
                          <ChartCategoryAxisItem
                            categories={allChartDataResult.companies.map(
                              (name) =>
                                isMobile && name.length > MAX_CHARACTERS
                                  ? name.slice(0, MAX_CHARACTERS) + "..."
                                  : name
                            )}
                          >
                            <ChartCategoryAxisTitle text="품목" />
                          </ChartCategoryAxisItem>
                        </ChartCategoryAxis>
                        <ChartSeries>
                          <ChartSeriesItem
                            labels={{
                              visible: true,
                              content: (e) => numberWithCommas(e.value) + "",
                            }}
                            type="bar"
                            // gap={2}
                            // spacing={0.25}
                            data={allChartDataResult.series}
                          />
                        </ChartSeries>
                      </Chart>
                    </GridContainer>
                  </SwiperSlide>
                  <SwiperSlide key={1} className="swiper-slide">
                    <GridContainer
                      className="leading_70_Swiper"
                      width={"100%"}
                    >
                      <ExcelExport
                        data={gridDataResult.data}
                        ref={(exporter) => {
                          _export = exporter;
                        }}
                        fileName="매출집계(품목)"
                      >
                        <ButtonContainer style={{ paddingBottom: "10px" }}>
                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(0);
                              }
                            }}
                          >
                            차트 보기
                          </Button>
                        </ButtonContainer>
                        <Grid
                          style={{ height: "63vh" }}
                          data={process(
                            gridDataResult.data.map((row) => ({
                              ...row,
                              // person: personListData.find(
                              //   (item: any) => item.code == row.person
                              // )?.name,
                              [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                            })),
                            gridDataState
                          )}
                          {...gridDataState}
                          onDataStateChange={onGridDataStateChange}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onGridSelectionChange}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={gridDataResult.total}
                          skip={page.skip}
                          take={page.take}
                          pageable={true}
                          onPageChange={pageChange}
                          //원하는 행 위치로 스크롤 기능
                          ref={gridRef}
                          rowHeight={30}
                          //정렬기능
                          sortable={true}
                          onSortChange={onGridSortChange}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                        >
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions[
                              "grdAllList"
                            ].map(
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
                                        ? gridTotalFooterCell
                                        : numberField.includes(item.fieldName)
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
                </Swiper>
              </GridContainerWrap>
            </TabStripTab>
            <TabStripTab title="월별">
              <GridContainerWrap flexDirection="column">
                <Swiper
                  onSwiper={(swiper) => {
                    setSwiper(swiper);
                  }}
                  onActiveIndexChange={(swiper) => {
                    index = swiper.activeIndex;
                  }}
                >
                  <SwiperSlide key={0} className="swiper-slide">
                    <GridContainer
                      className="leading_70_Swiper"
                      width={"100%"}
                    >
                      <ButtonContainer style={{ paddingBottom: "10px" }}>
                        <Button
                          onClick={() => {
                            if (swiper) {
                              swiper.slideTo(1);
                            }
                          }}
                        >
                          차트 보기
                        </Button>
                      </ButtonContainer>
                      <ExcelExport
                        data={gridDataResult.data}
                        ref={(exporter) => {
                          _export2 = exporter;
                        }}
                        fileName="매출집계(풀목)"
                      >
                        <Grid
                          style={{ height: "63vh" }}
                          data={process(
                            gridDataResult.data.map((row) => ({
                              ...row,
                              // person: personListData.find(
                              //   (item: any) => item.code == row.person
                              // )?.name,
                              [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                            })),
                            gridDataState
                          )}
                          {...gridDataState}
                          onDataStateChange={onGridDataStateChange}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onMonthGridSelectionChange}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={gridDataResult.total}
                          skip={page2.skip}
                          take={page2.take}
                          pageable={true}
                          onPageChange={pageChange2}
                          //원하는 행 위치로 스크롤 기능
                          ref={gridRef2}
                          rowHeight={30}
                          //정렬기능
                          sortable={true}
                          onSortChange={onGridSortChange}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                        >
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions[
                              "grdMonthList"
                            ].map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 &&
                                (numberField.includes(item.fieldName) ? (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    title={item.caption}
                                    footerCell={
                                      item.sortOrder == 0
                                        ? gridTotalFooterCell
                                        : undefined
                                    }
                                    width={item.width}
                                  >
                                    <GridColumn
                                      title={"수량"}
                                      cell={NumberCell}
                                      field={item.fieldName.replace(
                                        "amt",
                                        "qty"
                                      )}
                                      footerCell={gridSumQtyFooterCell}
                                      width={item.width}
                                    />

                                    <GridColumn
                                      title={"금액"}
                                      cell={NumberCell}
                                      field={item.fieldName}
                                      footerCell={gridSumQtyFooterCell}
                                      width={item.width}
                                    />
                                  </GridColumn>
                                ) : (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    title={item.caption}
                                    footerCell={
                                      item.sortOrder == 0
                                        ? gridTotalFooterCell
                                        : numberField.includes(item.fieldName)
                                        ? gridSumQtyFooterCell
                                        : undefined
                                    }
                                    width={item.width}
                                  />
                                ))
                            )}
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                  </SwiperSlide>
                  <GridContainerWrap
                    style={{ height: isMobile ? "" : "36.5vh" }}
                  >
                    <SwiperSlide key={1} className="swiper-slide">
                      <GridContainer
                        className="leading_70_Swiper"
                        width={"70%"}
                      >
                        <ButtonContainer
                          style={{
                            paddingBottom: "10px",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(0);
                              }
                            }}
                          >
                            테이블 보기
                          </Button>
                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(2);
                              }
                            }}
                          >
                            도넛차트 보기
                          </Button>
                        </ButtonContainer>
                        <Chart style={{ height: !isMobile ? "100%" : "60vh" }}>
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
                              categories={chartDataResult.map(
                                (item: any) => item.mm
                              )}
                            ></ChartCategoryAxisItem>
                          </ChartCategoryAxis>
                          <ChartSeries>
                            <ChartSeriesItem
                              labels={{
                                visible: true,
                                content: (e) => numberWithCommas(e.value) + "",
                              }}
                              type="line"
                              data={chartDataResult.map(
                                (item: any) => item.qty
                              )}
                            />
                            <ChartSeriesItem
                              labels={{
                                visible: true,
                                content: (e) => numberWithCommas(e.value) + "",
                              }}
                              type="bar"
                              // gap={2}
                              // spacing={0.25}
                              data={chartDataResult.map(
                                (item: any) => item.amt
                              )}
                            />
                          </ChartSeries>
                        </Chart>
                      </GridContainer>
                    </SwiperSlide>
                    <SwiperSlide key={2} className="swiper-slide">
                      <GridContainer
                        className="leading_70_Swiper"
                        width="30%"
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "left",
                            width: "100%",
                          }}
                        >
                          <ButtonContainer style={{ paddingBottom: "10px" }}>
                            <Button
                              onClick={() => {
                                if (swiper) {
                                  swiper.slideTo(1);
                                }
                              }}
                            >
                              차트 보기
                            </Button>
                          </ButtonContainer>
                        </div>
                        <Chart style={{ height: !isMobile ? "100%" : "" }}>
                          <ChartTitle text="월별 매출 금액 비율(%)" />
                          <ChartTooltip render={quarterDonutRenderTooltip2} />
                          <ChartLegend visible={false} position="bottom" />
                          <ChartSeries>
                            <ChartSeriesItem
                              type="donut"
                              data={chartDataResult}
                              field="amt"
                              categoryField="mm"
                              startAngle={150}
                            >
                              <ChartSeriesLabels
                                position="outsideEnd"
                                background="none"
                                content={labelContent}
                              />
                            </ChartSeriesItem>
                          </ChartSeries>
                        </Chart>
                      </GridContainer>
                    </SwiperSlide>
                  </GridContainerWrap>
                </Swiper>
              </GridContainerWrap>
            </TabStripTab>
            <TabStripTab title="분기별">
              <GridContainerWrap flexDirection="column">
                <Swiper
                  onSwiper={(swiper) => {
                    setSwiper(swiper);
                  }}
                  onActiveIndexChange={(swiper) => {
                    index = swiper.activeIndex;
                  }}
                >
                  <SwiperSlide key={0} className="swiper-slide">
                    <GridContainer
                      className="leading_70_Swiper"
                      width={"100%"}
                    >
                      <ButtonContainer style={{ paddingBottom: "10px" }}>
                        <Button
                          onClick={() => {
                            if (swiper) {
                              swiper.slideTo(1);
                            }
                          }}
                        >
                          차트 보기
                        </Button>
                      </ButtonContainer>
                      <ExcelExport
                        data={gridDataResult.data}
                        ref={(exporter) => {
                          _export3 = exporter;
                        }}
                        fileName="매출집계(풀목)"
                      >
                        <Grid
                          style={{ height: "62vh" }}
                          data={process(
                            gridDataResult.data.map((row) => ({
                              ...row,
                              // person: personListData.find(
                              //   (item: any) => item.code == row.person
                              // )?.name,
                              [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                            })),
                            gridDataState
                          )}
                          {...gridDataState}
                          onDataStateChange={onGridDataStateChange}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onMonthGridSelectionChange}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={gridDataResult.total}
                          skip={page3.skip}
                          take={page3.take}
                          pageable={true}
                          onPageChange={pageChange3}
                          //원하는 행 위치로 스크롤 기능
                          ref={gridRef3}
                          rowHeight={30}
                          //정렬기능
                          sortable={true}
                          onSortChange={onGridSortChange}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                        >
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions[
                              "grdQuarterList"
                            ].map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 &&
                                (item.fieldName !== "itemcd" &&
                                item.fieldName !== "itemnm" ? (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    title={item.caption}
                                    footerCell={
                                      item.sortOrder == 0
                                        ? gridTotalFooterCell
                                        : undefined
                                    }
                                    width={item.width}
                                  >
                                    <GridColumn title={"1/4분기"}>
                                      <GridColumn
                                        title={"수량"}
                                        cell={NumberCell}
                                        field={
                                          item.caption == "전기" ? "q1" : "q11"
                                        }
                                        footerCell={gridSumQtyFooterCell}
                                        width={item.width}
                                      />

                                      <GridColumn
                                        title={"금액"}
                                        cell={NumberCell}
                                        field={
                                          item.caption == "전기"
                                            ? "jm1"
                                            : "dm1"
                                        }
                                        footerCell={gridSumQtyFooterCell}
                                        width={item.width}
                                      />
                                    </GridColumn>
                                    <GridColumn title={"2/4분기"}>
                                      <GridColumn
                                        title={"수량"}
                                        cell={NumberCell}
                                        field={
                                          item.caption == "전기" ? "q2" : "q22"
                                        }
                                        footerCell={gridSumQtyFooterCell}
                                        width={item.width}
                                      />

                                      <GridColumn
                                        title={"금액"}
                                        cell={NumberCell}
                                        field={
                                          item.caption == "전기"
                                            ? "jm2"
                                            : "dm2"
                                        }
                                        footerCell={gridSumQtyFooterCell}
                                        width={item.width}
                                      />
                                    </GridColumn>
                                    <GridColumn title={"3/4분기"}>
                                      <GridColumn
                                        title={"수량"}
                                        cell={NumberCell}
                                        field={
                                          item.caption == "전기" ? "q3" : "q33"
                                        }
                                        footerCell={gridSumQtyFooterCell}
                                        width={item.width}
                                      />

                                      <GridColumn
                                        title={"금액"}
                                        cell={NumberCell}
                                        field={
                                          item.caption == "전기"
                                            ? "jm3"
                                            : "dm3"
                                        }
                                        footerCell={gridSumQtyFooterCell}
                                        width={item.width}
                                      />
                                    </GridColumn>
                                    <GridColumn title={"4/4분기"}>
                                      <GridColumn
                                        title={"수량"}
                                        cell={NumberCell}
                                        field={
                                          item.caption == "전기" ? "q4" : "q44"
                                        }
                                        footerCell={gridSumQtyFooterCell}
                                        width={item.width}
                                      />

                                      <GridColumn
                                        title={"금액"}
                                        cell={NumberCell}
                                        field={
                                          item.caption == "전기"
                                            ? "jm4"
                                            : "dm4"
                                        }
                                        footerCell={gridSumQtyFooterCell}
                                        width={item.width}
                                      />
                                    </GridColumn>

                                    <GridColumn
                                      title={"합계"}
                                      cell={NumberCell}
                                      field={
                                        item.caption == "전기"
                                          ? "jtotal"
                                          : "dtotal"
                                      }
                                      footerCell={gridSumQtyFooterCell}
                                      width={item.width}
                                    />
                                  </GridColumn>
                                ) : (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    title={item.caption}
                                    footerCell={
                                      item.sortOrder == 0
                                        ? gridTotalFooterCell
                                        : numberField.includes(item.fieldName)
                                        ? gridSumQtyFooterCell
                                        : undefined
                                    }
                                    width={item.width}
                                  />
                                ))
                            )}
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                  </SwiperSlide>
                  <GridContainerWrap
                    style={{ height: isMobile ? "" : "36.5vh" }}
                  >
                    <SwiperSlide key={1} className="swiper-slide">
                      <GridContainer
                        className="leading_70_Swiper"
                        width={"60%"}
                      >
                        <ButtonContainer
                          style={{
                            paddingBottom: "10px",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(0);
                              }
                            }}
                          >
                            테이블 보기
                          </Button>

                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(2);
                              }
                            }}
                          >
                            도넛차트 보기
                          </Button>
                        </ButtonContainer>
                        <Chart style={{ height: !isMobile ? "100%" : "62vh" }}>
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
                              categories={chartDataResult
                                .filter((item: any) => item.series == "당기")
                                .map((item: any) => item.mm)}
                            ></ChartCategoryAxisItem>
                          </ChartCategoryAxis>

                          <ChartLegend
                            position="bottom"
                            orientation="horizontal"
                          />
                          <ChartSeries>
                            <ChartSeriesItem
                              name="당기수량"
                              labels={{
                                visible: true,
                                content: (e) => numberWithCommas(e.value) + "",
                              }}
                              type="line"
                              data={chartDataResult
                                .filter((item: any) => item.series == "당기")
                                .map((item: any) => item.qty1)}
                            />
                            <ChartSeriesItem
                              name="전기수량"
                              labels={{
                                visible: true,
                                content: (e) => numberWithCommas(e.value) + "",
                              }}
                              type="line"
                              data={chartDataResult
                                .filter((item: any) => item.series == "전기")
                                .map((item: any) => item.qty2)}
                            />
                            <ChartSeriesItem
                              name="당기"
                              labels={{
                                visible: true,
                                content: (e) => numberWithCommas(e.value) + "",
                              }}
                              type="bar"
                              // gap={2}
                              // spacing={0.25}
                              data={chartDataResult
                                .filter((item: any) => item.series == "당기")
                                .map((item: any) => item.amt)}
                            />
                            <ChartSeriesItem
                              name="전기"
                              labels={{
                                visible: true,
                                content: (e) => numberWithCommas(e.value) + "",
                              }}
                              type="bar"
                              // gap={2}
                              // spacing={0.25}"
                              data={chartDataResult
                                .filter((item: any) => item.series == "전기")
                                .map((item: any) => item.amt)}
                            />
                          </ChartSeries>
                        </Chart>
                      </GridContainer>
                    </SwiperSlide>
                    <SwiperSlide key={2} className="swiper-slide">
                      <GridContainer
                        className="leading_70_Swiper"
                        width={"40%"}
                      >
                        <ButtonContainer
                          style={{
                            display: "flex",
                            justifyContent: "left",
                            paddingBottom: "10px",
                          }}
                        >
                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(1);
                              }
                            }}
                          >
                            차트 보기
                          </Button>
                        </ButtonContainer>
                        <Chart style={{ height: !isMobile ? "100%" : "" }}>
                          <ChartTitle text="분기별 매출 금액 비율(%)" />

                          <ChartTooltip render={quarterDonutRenderTooltip} />
                          <ChartLegend visible={false} position="bottom" />
                          <ChartSeries>
                            <ChartSeries>
                              <ChartSeriesItem
                                type="donut"
                                startAngle={150}
                                name={"전기"}
                                data={chartDataResult
                                  .filter((item: any) => item.series == "전기")
                                  .map((item: any) => item)}
                                field="amt"
                                categoryField="mm"
                                colorField="color"
                              ></ChartSeriesItem>
                              <ChartSeriesItem
                                type="donut"
                                startAngle={150}
                                name={"당기"}
                                data={chartDataResult
                                  .filter((item: any) => item.series == "당기")
                                  .map((item: any) => item)}
                                field="amt"
                                categoryField="mm"
                                colorField="color"
                              >
                                <ChartSeriesLabels
                                  position="outsideEnd"
                                  background="none"
                                  content={labelContent}
                                />
                              </ChartSeriesItem>
                            </ChartSeries>
                          </ChartSeries>
                        </Chart>
                      </GridContainer>
                    </SwiperSlide>
                  </GridContainerWrap>
                </Swiper>
              </GridContainerWrap>
            </TabStripTab>
            <TabStripTab title="5년분석">
              <GridContainerWrap flexDirection="column">
                <Swiper
                  onSwiper={(swiper) => {
                    setSwiper(swiper);
                  }}
                  onActiveIndexChange={(swiper) => {
                    index = swiper.activeIndex;
                  }}
                >
                  <SwiperSlide key={0} className="swiper-slide">
                    <GridContainer
                      className="leading_70_Swiper"
                      width={"100%"}
                    >
                      <ButtonContainer style={{ paddingBottom: "10px" }}>
                        <Button
                          onClick={() => {
                            if (swiper) {
                              swiper.slideTo(1);
                            }
                          }}
                        >
                          차트 보기
                        </Button>
                      </ButtonContainer>
                      <ExcelExport
                        data={gridDataResult.data}
                        ref={(exporter) => {
                          _export4 = exporter;
                        }}
                        fileName="매출집계(풀목)"
                      >
                        <Grid
                          style={{ height: "63vh" }}
                          data={process(
                            gridDataResult.data.map((row) => ({
                              ...row,
                              // person: personListData.find(
                              //   (item: any) => item.code == row.person
                              // )?.name,
                              [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                            })),
                            gridDataState
                          )}
                          {...gridDataState}
                          onDataStateChange={onGridDataStateChange}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onMonthGridSelectionChange}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={gridDataResult.total}
                          skip={page4.skip}
                          take={page4.take}
                          pageable={true}
                          onPageChange={pageChange4}
                          //원하는 행 위치로 스크롤 기능
                          ref={gridRef4}
                          rowHeight={30}
                          //정렬기능
                          sortable={true}
                          onSortChange={onGridSortChange}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                        >
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions[
                              "grd5YearList"
                            ].map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 &&
                                (item.fieldName !== "itemcd" &&
                                item.fieldName !== "itemnm" ? (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    //title={item.caption}
                                    title={
                                      yearTitle[
                                        Number(
                                          item.id.replace("col_5year", "")
                                        ) - 1
                                      ]
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? gridTotalFooterCell
                                        : undefined
                                    }
                                    width={item.width}
                                  >
                                    <GridColumn
                                      title={"(1-6)분기"}
                                      cell={NumberCell}
                                      field={
                                        "amt" +
                                        (item.caption ==
                                        parseInt(yearTitle[0]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                          ? "01"
                                          : item.caption ==
                                            parseInt(yearTitle[1]) +
                                              (2023 -
                                                parseInt(
                                                  convertDateToStr(
                                                    filters.yyyy
                                                  ).substr(0, 4)
                                                ))
                                          ? "21"
                                          : item.caption ==
                                            parseInt(yearTitle[2]) +
                                              (2023 -
                                                parseInt(
                                                  convertDateToStr(
                                                    filters.yyyy
                                                  ).substr(0, 4)
                                                ))
                                          ? "31"
                                          : item.caption ==
                                            parseInt(yearTitle[3]) +
                                              (2023 -
                                                parseInt(
                                                  convertDateToStr(
                                                    filters.yyyy
                                                  ).substr(0, 4)
                                                ))
                                          ? "41"
                                          : item.caption ==
                                            parseInt(yearTitle[4]) +
                                              (2023 -
                                                parseInt(
                                                  convertDateToStr(
                                                    filters.yyyy
                                                  ).substr(0, 4)
                                                ))
                                          ? "51"
                                          : "")
                                      }
                                      footerCell={gridSumQtyFooterCell}
                                      width={item.width}
                                    />
                                    <GridColumn
                                      title={"(7-12)분기"}
                                      cell={NumberCell}
                                      field={
                                        "amt" +
                                        (item.caption ==
                                        parseInt(yearTitle[0]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                          ? "02"
                                          : item.caption ==
                                            parseInt(yearTitle[1]) +
                                              (2023 -
                                                parseInt(
                                                  convertDateToStr(
                                                    filters.yyyy
                                                  ).substr(0, 4)
                                                ))
                                          ? "22"
                                          : item.caption ==
                                            parseInt(yearTitle[2]) +
                                              (2023 -
                                                parseInt(
                                                  convertDateToStr(
                                                    filters.yyyy
                                                  ).substr(0, 4)
                                                ))
                                          ? "32"
                                          : item.caption ==
                                            parseInt(yearTitle[3]) +
                                              (2023 -
                                                parseInt(
                                                  convertDateToStr(
                                                    filters.yyyy
                                                  ).substr(0, 4)
                                                ))
                                          ? "42"
                                          : item.caption ==
                                            parseInt(yearTitle[4]) +
                                              (2023 -
                                                parseInt(
                                                  convertDateToStr(
                                                    filters.yyyy
                                                  ).substr(0, 4)
                                                ))
                                          ? "52"
                                          : "")
                                      }
                                      footerCell={gridSumQtyFooterCell}
                                      width={item.width}
                                    />

                                    <GridColumn
                                      title={"합계"}
                                      cell={NumberCell}
                                      field={
                                        "tamt" +
                                        (item.caption ==
                                        parseInt(yearTitle[0]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                          ? "01"
                                          : item.caption ==
                                            parseInt(yearTitle[1]) +
                                              (2023 -
                                                parseInt(
                                                  convertDateToStr(
                                                    filters.yyyy
                                                  ).substr(0, 4)
                                                ))
                                          ? "02"
                                          : item.caption ==
                                            parseInt(yearTitle[2]) +
                                              (2023 -
                                                parseInt(
                                                  convertDateToStr(
                                                    filters.yyyy
                                                  ).substr(0, 4)
                                                ))
                                          ? "03"
                                          : item.caption ==
                                            parseInt(yearTitle[3]) +
                                              (2023 -
                                                parseInt(
                                                  convertDateToStr(
                                                    filters.yyyy
                                                  ).substr(0, 4)
                                                ))
                                          ? "04"
                                          : item.caption ==
                                            parseInt(yearTitle[4]) +
                                              (2023 -
                                                parseInt(
                                                  convertDateToStr(
                                                    filters.yyyy
                                                  ).substr(0, 4)
                                                ))
                                          ? "05"
                                          : "")
                                      }
                                      footerCell={gridSumQtyFooterCell}
                                      width={item.width}
                                    />
                                  </GridColumn>
                                ) : (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    title={item.caption}
                                    footerCell={
                                      item.sortOrder == 0
                                        ? gridTotalFooterCell
                                        : numberField.includes(item.fieldName)
                                        ? gridSumQtyFooterCell
                                        : undefined
                                    }
                                    width={item.width}
                                  />
                                ))
                            )}
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                  </SwiperSlide>
                  <GridContainerWrap
                    style={{ height: isMobile ? "" : "36.5vh" }}
                  >
                    <SwiperSlide key={1} className="swiper-slide">
                      <GridContainer
                        className="leading_70_Swiper"
                        width={"60%"}
                      >
                        <ButtonContainer
                          style={{
                            paddingBottom: "10px",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(0);
                              }
                            }}
                          >
                            테이블 보기
                          </Button>

                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(2);
                              }
                            }}
                          >
                            도넛차트 보기
                          </Button>
                        </ButtonContainer>
                        <Chart style={{ height: !isMobile ? "100%" : "60vh" }}>
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
                              categories={[
                                ...new Set(
                                  chartDataResult.map((item: any) => item.mm)
                                ),
                              ]}
                            ></ChartCategoryAxisItem>
                          </ChartCategoryAxis>

                          <ChartLegend
                            position="bottom"
                            orientation="horizontal"
                          />
                          <ChartSeries>
                            <ChartSeriesItem
                              name="(1-6)분기"
                              labels={{
                                visible: true,
                                // content: (e) =>
                                //   typeof e.value == "number"
                                //     ? numberWithCommas(e.value) + ""
                                //     : e.value,
                              }}
                              type="bar"
                              data={chartDataResult
                                .filter(
                                  (item: any) => item.series == "(1-6)분기"
                                )
                                .map((item: any) => item)}
                              field="amt"
                              categoryField="mm"
                            />
                            <ChartSeriesItem
                              name="(7-12)분기"
                              labels={{
                                visible: true,
                                // content: (e) =>
                                //   typeof e.value == "number"
                                //     ? numberWithCommas(e.value) + ""
                                //     : e.value,
                              }}
                              type="bar"
                              data={chartDataResult
                                .filter(
                                  (item: any) => item.series == "(7-12)분기"
                                )
                                .map((item: any) => item)}
                              field="amt"
                              categoryField="mm"
                            />
                            <ChartSeriesItem
                              name="합계"
                              labels={{
                                visible: true,
                                // content: (e) =>
                                //   typeof e.value == "number"
                                //     ? numberWithCommas(e.value) + ""
                                //     : e.value,
                              }}
                              type="bar"
                              // gap={2}
                              // spacing={0.25}
                              data={chartDataResult
                                .filter((item: any) => item.series == "합계")
                                .map((item: any) => item)}
                              field="amt"
                              categoryField="mm"
                            />
                          </ChartSeries>
                        </Chart>
                      </GridContainer>
                    </SwiperSlide>
                    <SwiperSlide key={2} className="swiper-slide">
                      <GridContainer
                        className="leading_70_Swiper"
                        width={"100%"}
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
                              if (swiper) {
                                swiper.slideTo(1);
                              }
                            }}
                          >
                            차트 보기
                          </Button>
                        </div>
                        <Chart style={{ height: !isMobile ? "100%" : "" }}>
                          <ChartTitle text="연도별 매출 금액 비율(%)" />
                          <ChartTooltip render={quarterDonutRenderTooltip} />
                          <ChartLegend visible={false} position="bottom" />
                          <ChartSeries>
                            <ChartSeries>
                              {yearTitle.map(
                                (year, idx) =>
                                  [
                                    ...new Set(
                                      chartDataResult.map(
                                        (item: any) => item.mm
                                      )
                                    ),
                                  ].includes(year) && (
                                    <ChartSeriesItem
                                      type="donut"
                                      startAngle={150}
                                      name={year}
                                      data={chartDataResult
                                        .filter((item: any) => item.mm == year)
                                        .map((item: any) => item)}
                                      field="amt"
                                      categoryField="series"
                                      colorField="color"
                                    >
                                      {[
                                        ...new Set(
                                          chartDataResult.map(
                                            (item: any) => item.mm
                                          )
                                        ),
                                      ].slice(-1)[0] == year && (
                                        <ChartSeriesLabels
                                          position="outsideEnd"
                                          background="none"
                                          content={labelContent}
                                        />
                                      )}
                                    </ChartSeriesItem>
                                  )
                              )}
                            </ChartSeries>
                          </ChartSeries>
                        </Chart>
                      </GridContainer>
                    </SwiperSlide>
                  </GridContainerWrap>
                </Swiper>
              </GridContainerWrap>
            </TabStripTab>
          </TabStrip>
        </>
      ) : (
        <>
          <TitleContainer>
            <Title>매출집계(품목)</Title>

            <ButtonContainer>
              {permissions && (
                <TopButtons
                  search={search}
                  exportExcel={exportExcel}
                  permissions={permissions}
                  pathname="SA_B3100W"
                />
              )}
            </ButtonContainer>
          </TitleContainer>
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th data-control-name="lblYyyy">기준년도</th>
                  <td>
                    <DatePicker
                      name="yyyy"
                      value={filters.yyyy}
                      format="yyyy"
                      onChange={filterInputChange}
                      calendar={YearCalendar}
                      className="required"
                      placeholder=""
                    />
                  </td>
                  <th data-control-name="lblImcd">품목코드</th>
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

                  <th data-control-name="lblItemnm">품목명</th>
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
                  <th data-control-name="lblAmtdiv">단위</th>
                  <td>
                    {customOptionData !== null && (
                      <CommonRadioGroup
                        name="rdoAmtdiv"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th></th>
                  <td></td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <TabStrip
            selected={tabSelected}
            onSelect={handleSelectTab}
            style={{ height: "80vh", width: "100%", paddingBottom: "15px" }}
          >
            <TabStripTab title="전체">
              <GridContainerWrap flexDirection="column">
                <GridContainer height="35vh">
                  <Chart
                    seriesColors={
                      window.location.href.split("/")[2].split(".")[1] == "ddgd"
                        ? DDGDcolorList
                        : WebErpcolorList
                    }
                    style={{ height: "100%" }}
                  >
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    {/* <ChartTitle text="Units sold" /> */}
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.companies}
                      >
                        <ChartCategoryAxisTitle text="품목" />
                      </ChartCategoryAxisItem>
                    </ChartCategoryAxis>
                    <ChartSeries>
                      <ChartSeriesItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                        type="bar"
                        // gap={2}
                        // spacing={0.25}
                        data={allChartDataResult.series}
                      />
                    </ChartSeries>
                  </Chart>
                </GridContainer>

                <GridContainer width={"100%"}>
                  <ExcelExport
                    data={gridDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName="매출집계(풀목)"
                  >
                    <Grid
                      style={{ height: "35.5vh" }}
                      data={process(
                        gridDataResult.data.map((row) => ({
                          ...row,
                          // person: personListData.find(
                          //   (item: any) => item.code == row.person
                          // )?.name,
                          [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                        })),
                        gridDataState
                      )}
                      {...gridDataState}
                      onDataStateChange={onGridDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onGridSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={gridDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onGridSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions[
                          "grdAllList"
                        ].map(
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
                                    ? gridTotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell
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
            <TabStripTab title="월별">
              <GridContainerWrap flexDirection="column">
                <GridContainer width={"100%"}>
                  <ExcelExport
                    data={gridDataResult.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName="매출집계(풀목)"
                  >
                    <Grid
                      style={{ height: "33.5vh" }}
                      data={process(
                        gridDataResult.data.map((row) => ({
                          ...row,
                          // person: personListData.find(
                          //   (item: any) => item.code == row.person
                          // )?.name,
                          [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                        })),
                        gridDataState
                      )}
                      {...gridDataState}
                      onDataStateChange={onGridDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onMonthGridSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={gridDataResult.total}
                      skip={page2.skip}
                      take={page2.take}
                      pageable={true}
                      onPageChange={pageChange2}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef2}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onGridSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions[
                          "grdMonthList"
                        ].map(
                          (item: any, idx: number) =>
                            item.sortOrder !== -1 &&
                            (numberField.includes(item.fieldName) ? (
                              <GridColumn
                                key={idx}
                                field={item.fieldName}
                                title={item.caption}
                                footerCell={
                                  item.sortOrder == 0
                                    ? gridTotalFooterCell
                                    : undefined
                                }
                                width={item.width}
                              >
                                <GridColumn
                                  title={"수량"}
                                  cell={NumberCell}
                                  field={item.fieldName.replace("amt", "qty")}
                                  footerCell={gridSumQtyFooterCell}
                                  width={item.width}
                                />

                                <GridColumn
                                  title={"금액"}
                                  cell={NumberCell}
                                  field={item.fieldName}
                                  footerCell={gridSumQtyFooterCell}
                                  width={item.width}
                                />
                              </GridColumn>
                            ) : (
                              <GridColumn
                                key={idx}
                                field={item.fieldName}
                                title={item.caption}
                                footerCell={
                                  item.sortOrder == 0
                                    ? gridTotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell
                                    : undefined
                                }
                                width={item.width}
                              />
                            ))
                        )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
                <GridContainerWrap style={{ height: isMobile ? "" : "36.5vh" }}>
                  <GridContainer width={"70%"}>
                    <Chart style={{ height: !isMobile ? "100%" : "" }}>
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
                          categories={chartDataResult.map(
                            (item: any) => item.mm
                          )}
                        ></ChartCategoryAxisItem>
                      </ChartCategoryAxis>
                      <ChartSeries>
                        <ChartSeriesItem
                          labels={{
                            visible: true,
                            content: (e) => numberWithCommas(e.value) + "",
                          }}
                          type="line"
                          data={chartDataResult.map((item: any) => item.qty)}
                        />
                        <ChartSeriesItem
                          labels={{
                            visible: true,
                            content: (e) => numberWithCommas(e.value) + "",
                          }}
                          type="bar"
                          // gap={2}
                          // spacing={0.25}
                          data={chartDataResult.map((item: any) => item.amt)}
                        />
                      </ChartSeries>
                    </Chart>
                  </GridContainer>
                  <GridContainer width="30%">
                    <Chart style={{ height: !isMobile ? "100%" : "" }}>
                      <ChartTitle text="월별 매출 금액 비율(%)" />
                      <ChartTooltip render={quarterDonutRenderTooltip2} />
                      <ChartLegend visible={false} position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="donut"
                          data={chartDataResult}
                          field="amt"
                          categoryField="mm"
                          startAngle={150}
                        >
                          <ChartSeriesLabels
                            position="outsideEnd"
                            background="none"
                            content={labelContent}
                          />
                        </ChartSeriesItem>
                      </ChartSeries>
                    </Chart>
                  </GridContainer>
                </GridContainerWrap>
              </GridContainerWrap>
            </TabStripTab>
            <TabStripTab title="분기별">
              <GridContainerWrap flexDirection="column">
                <GridContainer width={"100%"}>
                  <ExcelExport
                    data={gridDataResult.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName="매출집계(풀목)"
                  >
                    <Grid
                      style={{ height: "33.5vh" }}
                      data={process(
                        gridDataResult.data.map((row) => ({
                          ...row,
                          // person: personListData.find(
                          //   (item: any) => item.code == row.person
                          // )?.name,
                          [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                        })),
                        gridDataState
                      )}
                      {...gridDataState}
                      onDataStateChange={onGridDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onMonthGridSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={gridDataResult.total}
                      skip={page3.skip}
                      take={page3.take}
                      pageable={true}
                      onPageChange={pageChange3}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef3}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onGridSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions[
                          "grdQuarterList"
                        ].map(
                          (item: any, idx: number) =>
                            item.sortOrder !== -1 &&
                            (item.fieldName !== "itemcd" &&
                            item.fieldName !== "itemnm" ? (
                              <GridColumn
                                key={idx}
                                field={item.fieldName}
                                title={item.caption}
                                footerCell={
                                  item.sortOrder == 0
                                    ? gridTotalFooterCell
                                    : undefined
                                }
                                width={item.width}
                              >
                                <GridColumn title={"1/4분기"}>
                                  <GridColumn
                                    title={"수량"}
                                    cell={NumberCell}
                                    field={
                                      item.caption == "전기" ? "q1" : "q11"
                                    }
                                    footerCell={gridSumQtyFooterCell}
                                    width={item.width}
                                  />

                                  <GridColumn
                                    title={"금액"}
                                    cell={NumberCell}
                                    field={
                                      item.caption == "전기" ? "jm1" : "dm1"
                                    }
                                    footerCell={gridSumQtyFooterCell}
                                    width={item.width}
                                  />
                                </GridColumn>
                                <GridColumn title={"2/4분기"}>
                                  <GridColumn
                                    title={"수량"}
                                    cell={NumberCell}
                                    field={
                                      item.caption == "전기" ? "q2" : "q22"
                                    }
                                    footerCell={gridSumQtyFooterCell}
                                    width={item.width}
                                  />

                                  <GridColumn
                                    title={"금액"}
                                    cell={NumberCell}
                                    field={
                                      item.caption == "전기" ? "jm2" : "dm2"
                                    }
                                    footerCell={gridSumQtyFooterCell}
                                    width={item.width}
                                  />
                                </GridColumn>
                                <GridColumn title={"3/4분기"}>
                                  <GridColumn
                                    title={"수량"}
                                    cell={NumberCell}
                                    field={
                                      item.caption == "전기" ? "q3" : "q33"
                                    }
                                    footerCell={gridSumQtyFooterCell}
                                    width={item.width}
                                  />

                                  <GridColumn
                                    title={"금액"}
                                    cell={NumberCell}
                                    field={
                                      item.caption == "전기" ? "jm3" : "dm3"
                                    }
                                    footerCell={gridSumQtyFooterCell}
                                    width={item.width}
                                  />
                                </GridColumn>
                                <GridColumn title={"4/4분기"}>
                                  <GridColumn
                                    title={"수량"}
                                    cell={NumberCell}
                                    field={
                                      item.caption == "전기" ? "q4" : "q44"
                                    }
                                    footerCell={gridSumQtyFooterCell}
                                    width={item.width}
                                  />

                                  <GridColumn
                                    title={"금액"}
                                    cell={NumberCell}
                                    field={
                                      item.caption == "전기" ? "jm4" : "dm4"
                                    }
                                    footerCell={gridSumQtyFooterCell}
                                    width={item.width}
                                  />
                                </GridColumn>

                                <GridColumn
                                  title={"합계"}
                                  cell={NumberCell}
                                  field={
                                    item.caption == "전기"
                                      ? "jtotal"
                                      : "dtotal"
                                  }
                                  footerCell={gridSumQtyFooterCell}
                                  width={item.width}
                                />
                              </GridColumn>
                            ) : (
                              <GridColumn
                                key={idx}
                                field={item.fieldName}
                                title={item.caption}
                                footerCell={
                                  item.sortOrder == 0
                                    ? gridTotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell
                                    : undefined
                                }
                                width={item.width}
                              />
                            ))
                        )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
                <GridContainerWrap style={{ height: isMobile ? "" : "36.5vh" }}>
                  <GridContainer width={"60%"}>
                    <Chart style={{ height: !isMobile ? "100%" : "" }}>
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
                          categories={chartDataResult
                            .filter((item: any) => item.series == "당기")
                            .map((item: any) => item.mm)}
                        ></ChartCategoryAxisItem>
                      </ChartCategoryAxis>

                      <ChartLegend position="bottom" orientation="horizontal" />
                      <ChartSeries>
                        <ChartSeriesItem
                          name="당기수량"
                          labels={{
                            visible: true,
                            content: (e) => numberWithCommas(e.value) + "",
                          }}
                          type="line"
                          data={chartDataResult
                            .filter((item: any) => item.series == "당기")
                            .map((item: any) => item.qty1)}
                        />
                        <ChartSeriesItem
                          name="전기수량"
                          labels={{
                            visible: true,
                            content: (e) => numberWithCommas(e.value) + "",
                          }}
                          type="line"
                          data={chartDataResult
                            .filter((item: any) => item.series == "전기")
                            .map((item: any) => item.qty2)}
                        />
                        <ChartSeriesItem
                          name="당기"
                          labels={{
                            visible: true,
                            content: (e) => numberWithCommas(e.value) + "",
                          }}
                          type="bar"
                          // gap={2}
                          // spacing={0.25}
                          data={chartDataResult
                            .filter((item: any) => item.series == "당기")
                            .map((item: any) => item.amt)}
                        />
                        <ChartSeriesItem
                          name="전기"
                          labels={{
                            visible: true,
                            content: (e) => numberWithCommas(e.value) + "",
                          }}
                          type="bar"
                          // gap={2}
                          // spacing={0.25}"
                          data={chartDataResult
                            .filter((item: any) => item.series == "전기")
                            .map((item: any) => item.amt)}
                        />
                      </ChartSeries>
                    </Chart>
                  </GridContainer>
                  <GridContainer width={"40%"}>
                    <Chart style={{ height: !isMobile ? "100%" : "" }}>
                      <ChartTitle text="분기별 매출 금액 비율(%)" />

                      <ChartTooltip render={quarterDonutRenderTooltip} />
                      <ChartLegend visible={false} position="bottom" />
                      <ChartSeries>
                        <ChartSeries>
                          <ChartSeriesItem
                            type="donut"
                            startAngle={150}
                            name={"전기"}
                            data={chartDataResult
                              .filter((item: any) => item.series == "전기")
                              .map((item: any) => item)}
                            field="amt"
                            categoryField="mm"
                            colorField="color"
                          ></ChartSeriesItem>
                          <ChartSeriesItem
                            type="donut"
                            startAngle={150}
                            name={"당기"}
                            data={chartDataResult
                              .filter((item: any) => item.series == "당기")
                              .map((item: any) => item)}
                            field="amt"
                            categoryField="mm"
                            colorField="color"
                          >
                            <ChartSeriesLabels
                              position="outsideEnd"
                              background="none"
                              content={labelContent}
                            />
                          </ChartSeriesItem>
                        </ChartSeries>
                      </ChartSeries>
                    </Chart>
                  </GridContainer>
                </GridContainerWrap>
              </GridContainerWrap>
            </TabStripTab>
            <TabStripTab title="5년분석">
              <GridContainerWrap flexDirection="column">
                <GridContainer width={"100%"}>
                  <ExcelExport
                    data={gridDataResult.data}
                    ref={(exporter) => {
                      _export4 = exporter;
                    }}
                    fileName="매출집계(풀목)"
                  >
                    <Grid
                      style={{ height: "33.5vh" }}
                      data={process(
                        gridDataResult.data.map((row) => ({
                          ...row,
                          // person: personListData.find(
                          //   (item: any) => item.code == row.person
                          // )?.name,
                          [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                        })),
                        gridDataState
                      )}
                      {...gridDataState}
                      onDataStateChange={onGridDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onMonthGridSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={gridDataResult.total}
                      skip={page4.skip}
                      take={page4.take}
                      pageable={true}
                      onPageChange={pageChange4}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef4}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onGridSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions[
                          "grd5YearList"
                        ].map(
                          (item: any, idx: number) =>
                            item.sortOrder !== -1 &&
                            (item.fieldName !== "itemcd" &&
                            item.fieldName !== "itemnm" ? (
                              <GridColumn
                                key={idx}
                                field={item.fieldName}
                                //title={item.caption}
                                title={
                                  yearTitle[
                                    Number(item.id.replace("col_5year", "")) - 1
                                  ]
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? gridTotalFooterCell
                                    : undefined
                                }
                                width={item.width}
                              >
                                <GridColumn
                                  title={"(1-6)분기"}
                                  cell={NumberCell}
                                  field={
                                    "amt" +
                                    (item.caption ==
                                    parseInt(yearTitle[0]) +
                                      (2023 -
                                        parseInt(
                                          convertDateToStr(filters.yyyy).substr(
                                            0,
                                            4
                                          )
                                        ))
                                      ? "01"
                                      : item.caption ==
                                        parseInt(yearTitle[1]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                      ? "21"
                                      : item.caption ==
                                        parseInt(yearTitle[2]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                      ? "31"
                                      : item.caption ==
                                        parseInt(yearTitle[3]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                      ? "41"
                                      : item.caption ==
                                        parseInt(yearTitle[4]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                      ? "51"
                                      : "")
                                  }
                                  footerCell={gridSumQtyFooterCell}
                                  width={item.width}
                                />
                                <GridColumn
                                  title={"(7-12)분기"}
                                  cell={NumberCell}
                                  field={
                                    "amt" +
                                    (item.caption ==
                                    parseInt(yearTitle[0]) +
                                      (2023 -
                                        parseInt(
                                          convertDateToStr(filters.yyyy).substr(
                                            0,
                                            4
                                          )
                                        ))
                                      ? "02"
                                      : item.caption ==
                                        parseInt(yearTitle[1]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                      ? "22"
                                      : item.caption ==
                                        parseInt(yearTitle[2]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                      ? "32"
                                      : item.caption ==
                                        parseInt(yearTitle[3]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                      ? "42"
                                      : item.caption ==
                                        parseInt(yearTitle[4]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                      ? "52"
                                      : "")
                                  }
                                  footerCell={gridSumQtyFooterCell}
                                  width={item.width}
                                />

                                <GridColumn
                                  title={"합계"}
                                  cell={NumberCell}
                                  field={
                                    "tamt" +
                                    (item.caption ==
                                    parseInt(yearTitle[0]) +
                                      (2023 -
                                        parseInt(
                                          convertDateToStr(filters.yyyy).substr(
                                            0,
                                            4
                                          )
                                        ))
                                      ? "01"
                                      : item.caption ==
                                        parseInt(yearTitle[1]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                      ? "02"
                                      : item.caption ==
                                        parseInt(yearTitle[2]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                      ? "03"
                                      : item.caption ==
                                        parseInt(yearTitle[3]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                      ? "04"
                                      : item.caption ==
                                        parseInt(yearTitle[4]) +
                                          (2023 -
                                            parseInt(
                                              convertDateToStr(
                                                filters.yyyy
                                              ).substr(0, 4)
                                            ))
                                      ? "05"
                                      : "")
                                  }
                                  footerCell={gridSumQtyFooterCell}
                                  width={item.width}
                                />
                              </GridColumn>
                            ) : (
                              <GridColumn
                                key={idx}
                                field={item.fieldName}
                                title={item.caption}
                                footerCell={
                                  item.sortOrder == 0
                                    ? gridTotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell
                                    : undefined
                                }
                                width={item.width}
                              />
                            ))
                        )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
                <GridContainerWrap style={{ height: isMobile ? "" : "36.5vh" }}>
                  <GridContainer width={"60%"}>
                    <Chart style={{ height: !isMobile ? "100%" : "" }}>
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
                          categories={[
                            ...new Set(
                              chartDataResult.map((item: any) => item.mm)
                            ),
                          ]}
                        ></ChartCategoryAxisItem>
                      </ChartCategoryAxis>

                      <ChartLegend position="bottom" orientation="horizontal" />
                      <ChartSeries>
                        <ChartSeriesItem
                          name="(1-6)분기"
                          labels={{
                            visible: true,
                            // content: (e) =>
                            //   typeof e.value == "number"
                            //     ? numberWithCommas(e.value) + ""
                            //     : e.value,
                          }}
                          type="bar"
                          data={chartDataResult
                            .filter((item: any) => item.series == "(1-6)분기")
                            .map((item: any) => item)}
                          field="amt"
                          categoryField="mm"
                        />
                        <ChartSeriesItem
                          name="(7-12)분기"
                          labels={{
                            visible: true,
                            // content: (e) =>
                            //   typeof e.value == "number"
                            //     ? numberWithCommas(e.value) + ""
                            //     : e.value,
                          }}
                          type="bar"
                          data={chartDataResult
                            .filter((item: any) => item.series == "(7-12)분기")
                            .map((item: any) => item)}
                          field="amt"
                          categoryField="mm"
                        />
                        <ChartSeriesItem
                          name="합계"
                          labels={{
                            visible: true,
                            // content: (e) =>
                            //   typeof e.value == "number"
                            //     ? numberWithCommas(e.value) + ""
                            //     : e.value,
                          }}
                          type="bar"
                          // gap={2}
                          // spacing={0.25}
                          data={chartDataResult
                            .filter((item: any) => item.series == "합계")
                            .map((item: any) => item)}
                          field="amt"
                          categoryField="mm"
                        />
                      </ChartSeries>
                    </Chart>
                  </GridContainer>
                  <GridContainer width={"40%"}>
                    <Chart style={{ height: !isMobile ? "100%" : "" }}>
                      <ChartTitle text="연도별 매출 금액 비율(%)" />

                      <ChartTooltip render={quarterDonutRenderTooltip} />
                      <ChartLegend visible={false} position="bottom" />
                      <ChartSeries>
                        <ChartSeries>
                          {yearTitle.map(
                            (year, idx) =>
                              [
                                ...new Set(
                                  chartDataResult.map((item: any) => item.mm)
                                ),
                              ].includes(year) && (
                                <ChartSeriesItem
                                  type="donut"
                                  startAngle={150}
                                  name={year}
                                  data={chartDataResult
                                    .filter((item: any) => item.mm == year)
                                    .map((item: any) => item)}
                                  field="amt"
                                  categoryField="series"
                                  colorField="color"
                                >
                                  {[
                                    ...new Set(
                                      chartDataResult.map(
                                        (item: any) => item.mm
                                      )
                                    ),
                                  ].slice(-1)[0] == year && (
                                    <ChartSeriesLabels
                                      position="outsideEnd"
                                      background="none"
                                      content={labelContent}
                                    />
                                  )}
                                </ChartSeriesItem>
                              )
                          )}
                        </ChartSeries>
                      </ChartSeries>
                    </Chart>
                  </GridContainer>
                </GridContainerWrap>
              </GridContainerWrap>
            </TabStripTab>
          </TabStrip>
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
      {/* 컨트롤 네임 불러오기 용 */}
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

export default SA_B3100W;
