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
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInInput,
  DDGDcolorList,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitleContainer,
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
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getDeviceHeight,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { ICustData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/MA_B3000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var index = 0;

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
];
const dateField = ["recdt", "time"];
const DATA_ITEM_KEY = "num";

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const MA_B3000W: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();

  const [swiper, setSwiper] = useState<SwiperCore>();
  const MAX_CHARACTERS = 6;

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const setLoading = useSetRecoilState(isLoading);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  const [tabSelected, setTabSelected] = React.useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".k-tabstrip-items-wrapper");
      height4 = getHeight(".Chart");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2 - height3);
        setWebHeight(getDeviceHeight(true) - height - height3 - height4);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, tabSelected]);

  const [wordInfoData, setWordInfoData] = React.useState<any>(null);
  UseDesignInfo("MA_B3000W", setWordInfoData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001,L_sysUserMaster_001,L_EA002,L_HU089,L_appyn,L_USERS,L_HU005,L_EA004",
    //부서,담당자,결재문서,근태구분,결재유무,사용자,직위,결재라인
    setBizComponentData
  );

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
        cboLocation: defaultOption.find((item: any) => item.id == "cboLocation")
          ?.valueCode,
        rdoAmtdiv: defaultOption.find((item: any) => item.id == "rdoAmtdiv")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [messagesData, setMessagesData] = useState<any>(null);
  UseMessages(setMessagesData);

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

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    resetGrid();
    search();
  };
  let gridRef: any = useRef(null);

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
    orgdiv: sessionOrgdiv,
    cboLocation: sessionLocation,
    yyyy: new Date(),
    custcd: "",
    custnm: "",
    mm: "",
    rdoAmtdiv: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
    pgSize: PAGE_SIZE,
  });

  //그리드 데이터 조회
  const fetchGrid = async (workType: string, custcd?: string) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_B3000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.cboLocation,
        "@p_yyyy": convertDateToStr(filters.yyyy).substr(0, 4),
        "@p_custcd": custcd ? custcd : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_mm": filters.mm,
        "@p_amtdiv": filters.rdoAmtdiv,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;

      if (workType == "GRID" || workType == "MONTH" || workType == "QUARTER") {
        const totalRowCnt = data.tables[0].TotalRowCount;
        setGridDataResult((prev) => {
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
                  (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
                );

          if (selectedRow != undefined) {
            setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          } else {
            setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          }
        }
        if (totalRowCnt > 0) {
          const selectedRow =
            filters.find_row_value == ""
              ? rows[0]
              : rows.find(
                  (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
                );

          if (selectedRow != undefined) {
            setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          } else {
            setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          }
        }

        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      }
      // 공통 차트
      else if (workType == "MCHART" || workType == "QCHART") {
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
      setFilters((prev) => ({ ...prev, isSearch: false }));

      const selectedRowData = gridDataResult.data.filter(
        (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      if (selectedRowData != undefined) {
        if (tabSelected == 0) {
          fetchGrid("TOTAL");
          fetchGrid("GRID");
        } else if (tabSelected == 1) {
          fetchGrid("MONTH");
          fetchGrid("MCHART", selectedRowData.itemcd);
        } else if (tabSelected == 2) {
          fetchGrid("QUARTER");
          fetchGrid("QCHART", selectedRowData.itemcd);
        }
      } else {
        if (tabSelected == 0) {
          fetchGrid("TOTAL");
          fetchGrid("GRID");
        } else if (tabSelected == 1) {
          fetchGrid("MONTH");
          fetchGrid("MCHART");
        } else if (tabSelected == 2) {
          fetchGrid("QUARTER");
          fetchGrid("QCHART");
        }
      }
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  //그리드 리셋
  const resetGrid = () => {
    setGridDataResult(process([], gridDataState));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onGridSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
    if (swiper && isMobile) {
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
      fetchGrid("MCHART", selectedRowData.custcd);
    } else if (tabSelected == 2) {
      fetchGrid("QCHART", selectedRowData.custcd);
    }
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
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
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onGridDataStateChange = (event: GridDataStateChangeEvent) => {
    setGridDataState(event.dataState);
  };
  //그리드 푸터

  const gridTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총 {gridDataResult.total}건
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
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
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

  const search = () => {
    try {
      if (filters.yyyy == null || filters.yyyy == undefined) {
        throw findMessage(messagesData, "MA_B3000W_001");
      } else {
        resetGrid();
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
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

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

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
  };

  return (
    <>
      {isMobile ? (
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
                  <th data-control-name="lblCustcd">업체코드</th>
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

                  <th data-control-name="lblCustnm">업체명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th data-control-name="lblLocation">사업장</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="cboLocation"
                        value={filters.cboLocation}
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
            scrollable={isMobile}
          >
            <TabStripTab
              title="전체"
              disabled={permissions.view ? false : true}
            >
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <SwiperSlide key={0}>
                  <GridContainer>
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
                        window.location.href.split("/")[2].split(".")[1] ==
                        "ddgd"
                          ? DDGDcolorList
                          : WebErpcolorList
                      }
                      style={{
                        width: "100%",
                        height: mobileheight,
                      }}
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
                          categories={allChartDataResult.companies.map((name) =>
                            isMobile && name.length > MAX_CHARACTERS
                              ? name.slice(0, MAX_CHARACTERS) + "..."
                              : name
                          )}
                        >
                          <ChartCategoryAxisTitle text="업체" />
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
                <SwiperSlide key={1}>
                  <GridContainer>
                    <ExcelExport
                      data={gridDataResult.data}
                      ref={(exporter) => {
                        _export = exporter;
                      }}
                      fileName={getMenuName()}
                    >
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
                        </ButtonContainer>
                      </GridTitleContainer>
                      <Grid
                        style={{
                          height: mobileheight,
                        }}
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
                          customOptionData.menuCustomColumnOptions["grdAllList"]
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
            </TabStripTab>

            <TabStripTab
              title="월별"
              disabled={permissions.view ? false : true}
            >
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <SwiperSlide key={0}>
                  <GridContainer>
                    <ExcelExport
                      data={gridDataResult.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <GridTitleContainer className="ButtonContainer">
                        <ButtonContainer>
                          <Button
                            onClick={() => {
                              if (swiper && isMobile) {
                                swiper.slideTo(1);
                              }
                            }}
                          >
                            차트 보기
                          </Button>
                        </ButtonContainer>
                      </GridTitleContainer>
                      <Grid
                        style={{
                          height: mobileheight,
                        }}
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
                            "grdMonthList"
                          ]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName.replace("qty", "amt")}
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
                <SwiperSlide key={1}>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer">
                      <ButtonContainer
                        style={{
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(0);
                            }
                          }}
                        >
                          테이블 보기
                        </Button>

                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(2);
                            }
                          }}
                        >
                          도넛차트 보기
                        </Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <Chart
                      style={{
                        height: mobileheight,
                      }}
                    >
                      {/* <ChartTitle text="Units sold" /> */}
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
                </SwiperSlide>
                <SwiperSlide key={2}>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer">
                      <ButtonContainer>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(1);
                            }
                          }}
                        >
                          차트보기
                        </Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <Chart
                      style={{
                        height: mobileheight,
                      }}
                    >
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          //autoFit={true}
                          type="pie"
                          data={chartDataResult}
                          field="amt"
                          categoryField="mm"
                          labels={{
                            visible: true,
                            content: (e) =>
                              e.percentage !== 0 ? labelContent(e) : "",
                          }}
                        />
                      </ChartSeries>
                    </Chart>
                  </GridContainer>
                </SwiperSlide>
              </Swiper>
            </TabStripTab>

            <TabStripTab
              title="분기별"
              disabled={permissions.view ? false : true}
            >
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <SwiperSlide key={0}>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer">
                      <ButtonContainer>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(1);
                            }
                          }}
                        >
                          차트 보기
                        </Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={gridDataResult.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{
                          height: mobileheight,
                        }}
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
                        id="gridQuarterList"
                      >
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions[
                            "grdQuarterList"
                          ]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 &&
                                (item.fieldName !== "custcd" &&
                                item.fieldName !== "custnm" ? (
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
                                      title={"1/4분기"}
                                      cell={NumberCell}
                                      field={
                                        item.caption == "전기" ? "jm1" : "dm1"
                                      }
                                      footerCell={gridSumQtyFooterCell}
                                      width={item.width}
                                    />
                                    <GridColumn
                                      title={"2/4분기"}
                                      cell={NumberCell}
                                      field={
                                        item.caption == "전기" ? "jm2" : "dm2"
                                      }
                                      footerCell={gridSumQtyFooterCell}
                                      width={item.width}
                                    />
                                    <GridColumn
                                      title={"3/4분기"}
                                      cell={NumberCell}
                                      field={
                                        item.caption == "전기" ? "jm3" : "dm3"
                                      }
                                      footerCell={gridSumQtyFooterCell}
                                      width={item.width}
                                    />
                                    <GridColumn
                                      title={"4/4분기"}
                                      cell={NumberCell}
                                      field={
                                        item.caption == "전기" ? "jm4" : "dm4"
                                      }
                                      footerCell={gridSumQtyFooterCell}
                                      width={item.width}
                                    />
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
                <SwiperSlide key={1}>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer">
                      <ButtonContainer
                        style={{
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(0);
                            }
                          }}
                        >
                          테이블 보기
                        </Button>

                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(2);
                            }
                          }}
                        >
                          도넛차트 보기
                        </Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <Chart
                      style={{
                        height: mobileheight,
                      }}
                    >
                      {/* <ChartTitle text="Units sold" /> */}
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
                </SwiperSlide>
                <SwiperSlide key={2}>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer">
                      <ButtonContainer>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(1);
                            }
                          }}
                        >
                          차트 보기
                        </Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <Chart
                      style={{
                        height: mobileheight,
                      }}
                    >
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
              </Swiper>
            </TabStripTab>
          </TabStrip>
        </>
      ) : (
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
                  <th data-control-name="lblCustcd">업체코드</th>
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

                  <th data-control-name="lblCustnm">업체명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th data-control-name="lblLocation">사업장</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="cboLocation"
                        value={filters.cboLocation}
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
            scrollable={isMobile}
          >
            <TabStripTab
              title="전체"
              disabled={permissions.view ? false : true}
            >
              <GridContainerWrap flexDirection="column">
                <GridContainer>
                  <Chart
                    seriesColors={
                      window.location.href.split("/")[2].split(".")[1] == "ddgd"
                        ? DDGDcolorList
                        : WebErpcolorList
                    }
                    className="Chart"
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
                        <ChartCategoryAxisTitle text="업체" />
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

                <GridContainer>
                  <ExcelExport
                    data={gridDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: webheight }}
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
                        customOptionData.menuCustomColumnOptions["grdAllList"]
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
            <TabStripTab
              title="월별"
              disabled={permissions.view ? false : true}
            >
              <GridContainerWrap flexDirection="column">
                <GridContainer>
                  <ExcelExport
                    data={gridDataResult.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: webheight }}
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
                        customOptionData.menuCustomColumnOptions["grdMonthList"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={idx}
                                  field={item.fieldName.replace("qty", "amt")}
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
                <GridContainerWrap>
                  <GridContainer width={"70%"}>
                    <Chart className="Chart">
                      {/* <ChartTitle text="Units sold" /> */}
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
                    <Chart className="Chart">
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          //autoFit={true}
                          type="pie"
                          data={chartDataResult}
                          field="amt"
                          categoryField="mm"
                          labels={{
                            visible: true,
                            content: (e) =>
                              e.percentage !== 0 ? labelContent(e) : "",
                          }}
                        />
                      </ChartSeries>
                    </Chart>
                  </GridContainer>
                </GridContainerWrap>
              </GridContainerWrap>
            </TabStripTab>
            <TabStripTab
              title="분기별"
              disabled={permissions.view ? false : true}
            >
              <GridContainerWrap flexDirection="column">
                <GridContainer>
                  <ExcelExport
                    data={gridDataResult.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: webheight }}
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
                      id="gridQuarterList"
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions[
                          "grdQuarterList"
                        ]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 &&
                              (item.fieldName !== "custcd" &&
                              item.fieldName !== "custnm" ? (
                                <GridColumn
                                  key={idx}
                                  field={item.fieldName}
                                  title={item.caption}
                                  footerCell={
                                    item.sortOrder == 0
                                      ? gridTotalFooterCell
                                      : undefined
                                  }
                                >
                                  <GridColumn
                                    title={"1/4분기"}
                                    cell={NumberCell}
                                    field={
                                      item.caption == "전기" ? "jm1" : "dm1"
                                    }
                                    footerCell={gridSumQtyFooterCell}
                                  />
                                  <GridColumn
                                    title={"2/4분기"}
                                    cell={NumberCell}
                                    field={
                                      item.caption == "전기" ? "jm2" : "dm2"
                                    }
                                    footerCell={gridSumQtyFooterCell}
                                  />
                                  <GridColumn
                                    title={"3/4분기"}
                                    cell={NumberCell}
                                    field={
                                      item.caption == "전기" ? "jm3" : "dm3"
                                    }
                                    footerCell={gridSumQtyFooterCell}
                                  />
                                  <GridColumn
                                    title={"4/4분기"}
                                    cell={NumberCell}
                                    field={
                                      item.caption == "전기" ? "jm4" : "dm4"
                                    }
                                    footerCell={gridSumQtyFooterCell}
                                  />
                                  <GridColumn
                                    title={"합계"}
                                    cell={NumberCell}
                                    field={
                                      item.caption == "전기"
                                        ? "jtotal"
                                        : "dtotal"
                                    }
                                    footerCell={gridSumQtyFooterCell}
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
                                />
                              ))
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
                <GridContainerWrap>
                  <GridContainer width={"60%"}>
                    <Chart className="Chart">
                      {/* <ChartTitle text="Units sold" /> */}
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
                    <Chart className="Chart">
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
          </TabStrip>
        </>
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"FILTER"}
          setData={setCustData}
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

export default MA_B3000W;
