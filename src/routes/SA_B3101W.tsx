import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
  ChartTitle,
  ChartValueAxis,
  ChartValueAxisItem,
  ChartValueAxisTitle,
} from "@progress/kendo-react-charts";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import YearCalendar from "../components/Calendars/YearCalendar";
import NumberCell from "../components/Cells/NumberCell";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  chkScrollHandler,
  convertDateToStr,
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
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/SA_B3101W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
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

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

/* v1.3 */
const SA_B3101W: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("SA_B3101W", setMessagesData);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();

  const setLoading = useSetRecoilState(isLoading);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SA_B3101W", setCustomOptionData);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".ButtonContainer2");
      height4 = getHeight(".Chart");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height3);
        setWebHeight(
          getDeviceHeight(true) - height - height2 - height3 - height4
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);

  // //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        yyyy: setDefaultDate(customOptionData, "yyyy"),
        radAmtdiv: defaultOption.find((item: any) => item.id == "radAmtdiv")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [series, setSeries] = useState([
    {
      name: "매입",
      data: [0], // value
    },
    {
      name: "매출",
      data: [0], // value
    },
  ]);
  const [unitTitle, setUnitTitle] = useState("(단위: 천원)");
  const [chartTitle, setChartTitle] = useState(
    convertDateToStr(new Date()).substr(0, 4) + "년 매입/매출현황"
  );
  const [categories, setCategories] = useState<string[]>([]);

  const [gridDataState, setGridDataState] = useState<State>({
    sort: [],
  });

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [gridDataResult, setGridDataResult] = useState<DataResult>(
    process([], gridDataState)
  );
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
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

  const onMonthGridSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    yyyy: new Date(),
    radAmtdiv: "A",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: false,
    pgGap: 0,
  });
  //그리드 데이터 조회
  const fetchGrid = async (workType: string, itemcd?: string) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_B3101W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_recdt": convertDateToStr(filters.yyyy).substr(0, 4),
        "@p_amtdiv": filters.radAmtdiv,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      const totalRowCnt = data.tables[0].TotalRowCount;
      if (workType == "CHART") {
        let newRows: {
          argument: string[];
          income: number[];
          outcome: number[];
        } = { argument: [], income: [], outcome: [] };
        rows.forEach((row: any) => {
          if (!newRows.argument.includes(row.argument)) {
            newRows.argument.push(row.argument);
          }
          if (row.series == "매입") {
            newRows.income.push(row.value);
          } else {
            newRows.outcome.push(row.value);
          }
        });

        setCategories(newRows.argument);
        setSeries([
          { name: "매입", data: newRows.income },
          { name: "매출", data: newRows.outcome },
        ]);
        Object.values(categories);
        Object.values(series);

        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.itemacnt == filters.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      } else if (workType == "LIST") {
        setGridDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchGrid("CHART");
      fetchGrid("LIST");
    }
  }, [filters, permissions, customOptionData]);

  //그리드 리셋
  const resetGrid = () => {
    setGridDataResult(process([], gridDataState));
    setSeries([
      {
        name: "매입",
        data: [0],
      },
      {
        name: "매출",
        data: [0],
      },
    ]);
    // setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };
  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onGridDataStateChange = (event: GridDataStateChangeEvent) => {
    setGridDataState(event.dataState);
  };

  //그리드 푸터
  const gridTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {gridDataResult.total}건
      </td>
    );
  };
  //스크롤 핸들러
  const onGridScrollHandler = (event: GridEvent) => {
    if (filters.isSearch) return false;
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection == "up" ? filters.pgGap : 0);

    //스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));

      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection == "down" ? filters.pgGap : 0);
    //스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        ScrollDirection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
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

  const onGridSortChange = (e: any) => {
    setGridDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetGrid();
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    const unitText = filters.radAmtdiv == "A" ? "(단위: 천원)" : "(단위: 원)";
    const chartTitle =
      convertDateToStr(filters.yyyy).substr(0, 4) + "년 매입/매출현황";
    setUnitTitle(unitText);
    setChartTitle(chartTitle);
    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
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
                  pathname="SA_B3101W"
                />
              )}
            </ButtonContainer>
          </TitleContainer>

          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th data-contol-name="lblYyyy">기준년도</th>
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
                  <th data-control-name="lblradAmtdiv">단위</th>
                  <td>
                    {customOptionData !== null && (
                      <CommonRadioGroup
                        name="radAmtdiv"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>

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
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <GridTitle>차트</GridTitle>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      다음
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Chart
                  style={{
                    height: mobileheight,
                  }}
                >
                  <ChartLegend position="top" orientation="horizontal" />
                  <ChartValueAxis>
                    <ChartValueAxisItem
                      labels={{
                        visible: true,
                        content: (e) => numberWithCommas(e.value) + "",
                      }}
                    >
                      <ChartValueAxisTitle text={unitTitle} />
                    </ChartValueAxisItem>
                  </ChartValueAxis>
                  <ChartCategoryAxis>
                    <ChartCategoryAxisItem categories={categories} />
                  </ChartCategoryAxis>
                  <ChartSeries>
                    {series.map((item, idx) => (
                      <ChartSeriesItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                        key={idx}
                        type="column"
                        tooltip={{ visible: true }}
                        data={item.data}
                        name={item.name}
                      />
                    ))}
                  </ChartSeries>
                  <ChartTitle text={chartTitle} />
                </Chart>
              </GridContainer>
            </SwiperSlide>
            <ExcelExport
              data={gridDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="매입매출현황"
            >
              <SwiperSlide key={1}>
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>상세정보</GridTitle>
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
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
                  <Grid
                    style={{
                      height: mobileheight2,
                    }}
                    data={gridDataResult.data}
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
                    onScroll={onGridScrollHandler}
                    pageable={true}
                    onPageChange={pageChange}
                    //정렬기능
                    sortable={true}
                    onSortChange={onGridSortChange}
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
                            item.sortOrder !== -1 &&
                            (numberField.includes(item.fieldName) ? (
                              <GridColumn
                                key={idx}
                                field={item.fieldName}
                                title={item.caption}
                              >
                                <GridColumn
                                  title={"매입액"}
                                  cell={NumberCell}
                                  field={item.fieldName
                                    .replace("qty0", "inamt")
                                    .replace("qty", "inamt")}
                                  footerCell={gridSumQtyFooterCell}
                                  width={item.width}
                                />
                                <GridColumn
                                  title={"매출액"}
                                  cell={NumberCell}
                                  field={item.fieldName
                                    .replace("qty0", "outamt")
                                    .replace("qty", "outamt")}
                                  footerCell={gridSumQtyFooterCell}
                                  width={item.width}
                                />
                                <GridColumn
                                  title={"%"}
                                  cell={NumberCell}
                                  field={item.fieldName
                                    .replace("qty0", "per")
                                    .replace("qty", "per")}
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
                              />
                            ))
                        )}
                  </Grid>
                </GridContainer>
              </SwiperSlide>
            </ExcelExport>
          </Swiper>
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
                  pathname="SA_B3101W"
                />
              )}
            </ButtonContainer>
          </TitleContainer>

          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th data-contol-name="lblYyyy">기준년도</th>
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
                  <th data-control-name="lblradAmtdiv">단위</th>
                  <td>
                    {customOptionData !== null && (
                      <CommonRadioGroup
                        name="radAmtdiv"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>

          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>차트</GridTitle>
            </GridTitleContainer>
            <Chart className="Chart">
              <ChartLegend position="top" orientation="horizontal" />
              <ChartValueAxis>
                <ChartValueAxisItem
                  labels={{
                    visible: true,
                    content: (e) => numberWithCommas(e.value) + "",
                  }}
                >
                  <ChartValueAxisTitle text={unitTitle} />
                </ChartValueAxisItem>
              </ChartValueAxis>
              <ChartCategoryAxis>
                <ChartCategoryAxisItem categories={categories} />
              </ChartCategoryAxis>
              <ChartSeries>
                {series.map((item, idx) => (
                  <ChartSeriesItem
                    labels={{
                      visible: true,
                      content: (e) => numberWithCommas(e.value) + "",
                    }}
                    key={idx}
                    type="column"
                    tooltip={{ visible: true }}
                    data={item.data}
                    name={item.name}
                  />
                ))}
              </ChartSeries>
              <ChartTitle text={chartTitle} />
            </Chart>
            <GridTitleContainer className="ButtonContainer2">
              <GridTitle>상세정보</GridTitle>
            </GridTitleContainer>
            <ExcelExport
              data={gridDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="매입매출현황"
            >
              <Grid
                style={{ height: webheight }}
                data={process(
                  gridDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState[idGetter(row)],
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
                onScroll={onGridScrollHandler}
                pageable={true}
                onPageChange={pageChange}
                //정렬기능
                sortable={true}
                onSortChange={onGridSortChange}
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
                        item.sortOrder !== -1 &&
                        (numberField.includes(item.fieldName) ? (
                          <GridColumn
                            key={idx}
                            field={item.fieldName}
                            title={item.caption}
                          >
                            <GridColumn
                              title={"매입액"}
                              cell={NumberCell}
                              field={item.fieldName
                                .replace("qty0", "inamt")
                                .replace("qty", "inamt")}
                              footerCell={gridSumQtyFooterCell}
                              width={item.width}
                            />
                            <GridColumn
                              title={"매출액"}
                              cell={NumberCell}
                              field={item.fieldName
                                .replace("qty0", "outamt")
                                .replace("qty", "outamt")}
                              footerCell={gridSumQtyFooterCell}
                              width={item.width}
                            />
                            <GridColumn
                              title={"%"}
                              cell={NumberCell}
                              field={item.fieldName
                                .replace("qty0", "per")
                                .replace("qty", "per")}
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
                          />
                        ))
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </>
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

export default SA_B3101W;
