import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartCategoryAxisTitle,
  ChartSeries,
  ChartSeriesItem,
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
  GridTitleContainer,
  Title,
  TitleContainer,
  WebErpcolorList,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
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
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { IItemData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_B5080W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
const MAX_CHARACTERS = 6;
const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;

var height = 0;
var height2 = 0;

const AC_B6060W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height2);
        setWebHeight((getDeviceHeight(true) - height) / 2);
        setWebHeight2((getDeviceHeight(true) - height) / 2);
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
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
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

      setFilters((prev) => ({
        ...prev,
        yrmm: setDefaultDate(customOptionData, "yrmm"),
        finyn: defaultOption.find((item: any) => item.id == "finyn")?.valueCode,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        itemacnt: defaultOption.find((item: any) => item.id == "itemacnt")
          ?.valueCode,

        isSearch: true,
      }));
    }
  }, [customOptionData]);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [allChartDataResult, setAllChartDataResult] = useState({
    companies: [""],
    series: [0],
  });

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };
  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
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
    orgdiv: sessionOrgdiv,
    yrmm: new Date(),
    finyn: "",
    location: "",
    itemacnt: "",
    itemcd: "",
    itemnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_B7300W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt": filters.itemacnt,
        "@p_yrmm": convertDateToStr(filters.yrmm),
        "@p_finyn": filters.finyn,
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

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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
  const fetchMainGrid2 = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_B7300W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "CHART",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt": filters.itemacnt,
        "@p_yrmm": convertDateToStr(filters.yrmm),
        "@p_finyn": filters.finyn,
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

      let newRows: any = { companies: [], series: [] };

      rows.forEach((row: any) => {
        if (!newRows.companies.includes(row.argument)) {
          newRows.companies.push(row.yyyymm);
          newRows.series.push(row.amt);
        }
      });

      setAllChartDataResult({
        companies: newRows.companies,
        series: newRows.series,
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

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
    setMainDataResult(process([], mainDataState));
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

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "기본정보";
      _export.save(optionsGridOne);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
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

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.yrmm).substring(0, 4) < "1997" ||
        convertDateToStr(filters.yrmm).substring(6, 8) > "31" ||
        convertDateToStr(filters.yrmm).substring(6, 8) < "01" ||
        convertDateToStr(filters.yrmm).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_B7300W_001");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
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

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const createColumn = (numbers: any) => {
    const array = [];
    array.push(
      <GridColumn
        field={`now_qty${numbers}`}
        title="수량"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field={`now_amt${numbers}`}
        title="금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    return array;
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
              <th>전표일자</th>
              <td>
                <DatePicker
                  name="yrmm"
                  value={filters.yrmm}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                />
              </td>
              <th>완료여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="finyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
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
              <th>품목코드</th>
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
              <th>품목명</th>
              <td>
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
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
            <GridContainer style={{ width: "100%" }}>
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
                    type="column"
                    // gap={2}
                    // spacing={0.25}
                    data={allChartDataResult.series}
                  />
                </ChartSeries>
              </Chart>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={1}>
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer">
                <ButtonContainer style={{ justifyContent: "space-between" }}>
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
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: mobileheight2 }}
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
                    field="itemcd"
                    title="품목코드"
                    width="120px"
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn field="itemnm" title="품목명" width="120px" />
                  <GridColumn title={"12개월 이전"} width="100px">
                    {createColumn(12)}
                  </GridColumn>
                  <GridColumn title={"11개월 이전"} width="100px">
                    {createColumn(11)}
                  </GridColumn>
                  <GridColumn title={"10개월 이전"} width="100px">
                    {createColumn(10)}
                  </GridColumn>
                  <GridColumn title={"9개월 이전"} width="100px">
                    {createColumn(9)}
                  </GridColumn>
                  <GridColumn title={"8개월 이전"} width="100px">
                    {createColumn(8)}
                  </GridColumn>
                  <GridColumn title={"7개월 이전"} width="100px">
                    {createColumn(7)}
                  </GridColumn>
                  <GridColumn title={"6개월 이전"} width="100px">
                    {createColumn(6)}
                  </GridColumn>
                  <GridColumn title={"5개월 이전"} width="100px">
                    {createColumn(5)}
                  </GridColumn>
                  <GridColumn title={"4개월 이전"} width="100px">
                    {createColumn(4)}
                  </GridColumn>
                  <GridColumn title={"3개월 이전"} width="100px">
                    {createColumn(3)}
                  </GridColumn>
                  <GridColumn title={"2개월 이전"} width="100px">
                    {createColumn(2)}
                  </GridColumn>
                  <GridColumn title={"1개월 이전"} width="100px">
                    {createColumn(1)}
                  </GridColumn>
                  <GridColumn
                    field={"totamt"}
                    title={"현재고"}
                    width="100px"
                    cell={NumberCell}
                    footerCell={gridSumQtyFooterCell}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
          </SwiperSlide>
        </Swiper>
      ) : (
        <>
          <GridContainer width="100%">
            <GridContainer>
              <Chart
                seriesColors={
                  window.location.href.split("/")[2].split(".")[1] == "ddgd"
                    ? DDGDcolorList
                    : WebErpcolorList
                }
                className="Chart"
                style={{ height: webheight }}
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
                    <ChartCategoryAxisTitle text="품목" />
                  </ChartCategoryAxisItem>
                </ChartCategoryAxis>
                <ChartSeries>
                  <ChartSeriesItem
                    labels={{
                      visible: true,
                      content: (e) => numberWithCommas(e.value) + "",
                    }}
                    type="column"
                    // gap={2}
                    // spacing={0.25}
                    data={allChartDataResult.series}
                  />
                </ChartSeries>
              </Chart>
            </GridContainer>
            <GridContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: webheight2 }}
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
                    field="itemcd"
                    title="품목코드"
                    width="120px"
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn field="itemnm" title="품목명" width="120px" />
                  <GridColumn title={"12개월 이전"} width="100px">
                    {createColumn(12)}
                  </GridColumn>
                  <GridColumn title={"11개월 이전"} width="100px">
                    {createColumn(11)}
                  </GridColumn>
                  <GridColumn title={"10개월 이전"} width="100px">
                    {createColumn(10)}
                  </GridColumn>
                  <GridColumn title={"9개월 이전"} width="100px">
                    {createColumn(9)}
                  </GridColumn>
                  <GridColumn title={"8개월 이전"} width="100px">
                    {createColumn(8)}
                  </GridColumn>
                  <GridColumn title={"7개월 이전"} width="100px">
                    {createColumn(7)}
                  </GridColumn>
                  <GridColumn title={"6개월 이전"} width="100px">
                    {createColumn(6)}
                  </GridColumn>
                  <GridColumn title={"5개월 이전"} width="100px">
                    {createColumn(5)}
                  </GridColumn>
                  <GridColumn title={"4개월 이전"} width="100px">
                    {createColumn(4)}
                  </GridColumn>
                  <GridColumn title={"3개월 이전"} width="100px">
                    {createColumn(3)}
                  </GridColumn>
                  <GridColumn title={"2개월 이전"} width="100px">
                    {createColumn(2)}
                  </GridColumn>
                  <GridColumn title={"1개월 이전"} width="100px">
                    {createColumn(1)}
                  </GridColumn>
                  <GridColumn
                    field={"totamt"}
                    title={"현재고"}
                    width="100px"
                    cell={NumberCell}
                    footerCell={gridSumQtyFooterCell}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
          </GridContainer>
        </>
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"ROW_ADD"}
          setData={setItemData}
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

export default AC_B6060W;
