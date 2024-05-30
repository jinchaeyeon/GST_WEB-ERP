import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid as GridMui,
  Typography,
} from "@mui/material";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
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
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import {
  heightstate,
  isLoading,
  isMobileState,
  sessionItemState,
} from "../store/atoms";
import { gridList } from "../store/columns/QC_B9020_615W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var index = 0;
const DATA_ITEM_KEY2 = "num";
const numberField = ["temperature", "humidity"];
const centerField = ["insert_date", "insert_time", "defrost"];

const QC_B9020_615W: React.FC = () => {
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  let gridRef: any = useRef(null);
  const processApi = useApi();
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("QC_B9020_615W", setMessagesData);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("QC_B9020_615W", setCustomOptionData);
  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    if (e.selected == 0) {
      setFilters2((prev) => ({
        ...prev,
        yyyymmdd: new Date(),
        prodmac: "",
      }));
    }
    setTabSelected(e.selected);
  };

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters2((prev) => ({
        ...prev,
        yyyymmdd: setDefaultDate(customOptionData, "yyyymmdd"),
      }));
    }
  }, [customOptionData]);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page2, setPage2] = useState(initialPageState);
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

  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "상세정보";
      _export.save(optionsGridOne);
    }
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters2.yyyymmdd).substring(0, 4) < "1997" ||
        convertDateToStr(filters2.yyyymmdd).substring(6, 8) > "31" ||
        convertDateToStr(filters2.yyyymmdd).substring(6, 8) < "01" ||
        convertDateToStr(filters2.yyyymmdd).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_B9020_615W_001");
      } else {
        resetAllGrid();
        setPage2(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          yyyymmdd: new Date(),
          prodmac: "",
        }));
        if (isMobile) {
          if (swiper) {
            swiper.slideTo(0);
          }
        } else {
          setTabSelected(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [sessionItem] = useRecoilState(sessionItemState);
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "CARD",
    orgdiv: sessionItem.find((sessionItem) => sessionItem.code == "orgdiv")
      ?.value,
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    work_type: "Q",
    orgdiv: sessionItem.find((sessionItem) => sessionItem.code == "orgdiv")
      ?.value,
    yyyymmdd: new Date(),
    prodmac: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    setLoading(true);
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_B9020W_615_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_yyyymmdd": "",
        "@p_prodmac": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      const rows2 = data.tables[1].Rows;
      const rows3 = data.tables[2].Rows;
      setMainDataResult([rows, rows2, rows3]);
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
  const fetchMainGrid2 = async (filters2: any) => {
    //if (!permissions?.view) return;
    setLoading(true);
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_B9020W_615_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.work_type,
        "@p_yyyymmdd": convertDateToStr(filters2.yyyymmdd),
        "@p_prodmac": filters2.prodmac,
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
    } else {
      console.log("[오류 발생]");
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
  }, [filters, permissions]);

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
  }, [filters2, permissions]);

  //그리드 데이터 스테이트
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<any[]>([]);

  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );

  //선택 상태
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  console.log(mainDataResult);
  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
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
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult([]);
    setMainDataResult2(process([], mainDataState2));
  };

  const changeSwiper = (fxcode: string) => {
    if (isMobile) {
      if (swiper) {
        swiper.slideTo(1);
      }
    } else {
      setTabSelected(1);
    }

    setFilters2((prev) => ({
      ...prev,
      prodmac: fxcode,
      yyyymmdd: new Date(),
      isSearch: true,
    }));
  };

  return (
    <>
      <TitleContainer>
        <Title>온습도 모니터링</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="QC_B9020_615W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
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
            <GridContainer
              style={{
                width: "100%",
                overflow: "scroll",
                height: deviceHeight,
              }}
            >
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <Typography
                    component="div"
                    variant="h6"
                    style={{ fontWeight: 600 }}
                  >
                    B1층
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <GridMui container spacing={2}>
                    {mainDataResult.length > 0
                      ? mainDataResult[0].map((item: any) => (
                          <GridMui
                            item
                            xs={12}
                            sm={6}
                            md={6}
                            lg={4}
                            xl={3}
                            onClick={() => changeSwiper(item.fxcode)}
                          >
                            <Card sx={{ display: "flex", cursor: "pointer" }}>
                              <CardMedia
                                component="div"
                                sx={{
                                  width: "5%",
                                  backgroundColor: "greenyellow",
                                }}
                              />
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "100%",
                                }}
                              >
                                <CardContent
                                  sx={{ flex: "1 0 auto", textAlign: "left" }}
                                >
                                  <Typography
                                    component="div"
                                    variant="body1"
                                    style={{ fontWeight: 600 }}
                                  >
                                    {item.prodmac}
                                  </Typography>
                                  <Typography
                                    variant="h4"
                                    color="text.secondary"
                                    component="div"
                                    style={{ fontWeight: 600 }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <p style={{ color: "red" }}>
                                        {item.temperature + " "}
                                      </p>
                                      °C&nbsp;&nbsp;
                                      <p style={{ color: "blue" }}>
                                        {item.humidity + " "}
                                      </p>
                                      %
                                    </div>
                                  </Typography>
                                  <Typography
                                    component="div"
                                    variant="caption"
                                    style={{
                                      fontWeight: 600,
                                      textAlign: "right",
                                    }}
                                  >
                                    {item.insert_date + " " + item.insert_time}
                                  </Typography>
                                </CardContent>
                              </Box>
                            </Card>
                          </GridMui>
                        ))
                      : ""}
                  </GridMui>
                </AccordionDetails>
              </Accordion>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <Typography
                    component="div"
                    variant="h6"
                    style={{ fontWeight: 600 }}
                  >
                    1층
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <GridMui container spacing={2}>
                    {mainDataResult.length > 0
                      ? mainDataResult[1].map((item: any) => (
                          <GridMui
                            item
                            xs={12}
                            sm={6}
                            md={6}
                            lg={4}
                            xl={3}
                            onClick={() => changeSwiper(item.fxcode)}
                          >
                            <Card sx={{ display: "flex", cursor: "pointer" }}>
                              <CardMedia
                                component="div"
                                sx={{
                                  width: "5%",
                                  backgroundColor: "greenyellow",
                                }}
                              />
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "100%",
                                }}
                              >
                                <CardContent
                                  sx={{ flex: "1 0 auto", textAlign: "left" }}
                                >
                                  <Typography
                                    component="div"
                                    variant="body1"
                                    style={{ fontWeight: 600 }}
                                  >
                                    {item.prodmac}
                                  </Typography>
                                  <Typography
                                    variant="h4"
                                    color="text.secondary"
                                    component="div"
                                    style={{ fontWeight: 600 }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <p style={{ color: "red" }}>
                                        {item.temperature + " "}
                                      </p>
                                      °C&nbsp;&nbsp;
                                      <p style={{ color: "blue" }}>
                                        {item.humidity + " "}
                                      </p>
                                      %
                                    </div>
                                  </Typography>
                                  <Typography
                                    component="div"
                                    variant="caption"
                                    style={{
                                      fontWeight: 600,
                                      textAlign: "right",
                                    }}
                                  >
                                    {item.insert_date + " " + item.insert_time}
                                  </Typography>
                                </CardContent>
                              </Box>
                            </Card>
                          </GridMui>
                        ))
                      : ""}
                  </GridMui>
                </AccordionDetails>
              </Accordion>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <Typography
                    component="div"
                    variant="h6"
                    style={{ fontWeight: 600 }}
                  >
                    기타
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <GridMui container spacing={2}>
                    {mainDataResult.length > 0
                      ? mainDataResult[2].map((item: any) => (
                          <GridMui
                            item
                            xs={12}
                            sm={6}
                            md={6}
                            lg={4}
                            xl={3}
                            onClick={() => changeSwiper(item.fxcode)}
                          >
                            <Card sx={{ display: "flex", cursor: "pointer" }}>
                              <CardMedia
                                component="div"
                                sx={{
                                  width: "5%",
                                  backgroundColor: "greenyellow",
                                }}
                              />
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "100%",
                                }}
                              >
                                <CardContent
                                  sx={{ flex: "1 0 auto", textAlign: "left" }}
                                >
                                  <Typography
                                    component="div"
                                    variant="body1"
                                    style={{ fontWeight: 600 }}
                                  >
                                    {item.prodmac}
                                  </Typography>
                                  <Typography
                                    variant="h4"
                                    color="text.secondary"
                                    component="div"
                                    style={{ fontWeight: 600 }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <p style={{ color: "red" }}>
                                        {item.temperature + " "}
                                      </p>
                                      °C&nbsp;&nbsp;
                                      <p style={{ color: "blue" }}>
                                        {item.humidity + " "}
                                      </p>
                                      %
                                    </div>
                                  </Typography>
                                  <Typography
                                    component="div"
                                    variant="caption"
                                    style={{
                                      fontWeight: 600,
                                      textAlign: "right",
                                    }}
                                  >
                                    {item.insert_date + " " + item.insert_time}
                                  </Typography>
                                </CardContent>
                              </Box>
                            </Card>
                          </GridMui>
                        ))
                      : ""}
                  </GridMui>
                </AccordionDetails>
              </Accordion>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={1}>
            <GridContainer
              style={{
                width: "100%",
                overflow: "scroll",
              }}
            >
              <FilterContainer>
                <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                  <tbody>
                    <tr>
                      <th>일자</th>
                      <td>
                        <DatePicker
                          name="yyyymmdd"
                          value={filters2.yyyymmdd}
                          format="yyyy-MM-dd"
                          onChange={filterInputChange}
                          placeholder=""
                          className="required"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FilterBox>
              </FilterContainer>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="온습도 모니터링"
                >
                  <Grid
                    style={{
                      height: deviceHeight,
                      overflow: "auto",
                    }}
                    data={process(
                      mainDataResult2.data.map((row, idx) => ({
                        ...row,
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
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef}
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
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                cell={
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : centerField.includes(item.fieldName)
                                    ? CenterCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell2
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
          </SwiperSlide>
        </Swiper>
      ) : (
        <TabStrip
          selected={tabSelected}
          onSelect={handleSelectTab}
          scrollable={isMobile}
        >
          <TabStripTab title="수집위치">
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography
                  component="div"
                  variant="h6"
                  style={{ fontWeight: 600 }}
                >
                  B1층
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <GridMui container spacing={2}>
                  {mainDataResult.length > 0
                    ? mainDataResult[0].map((item: any) => (
                        <GridMui
                          item
                          xs={12}
                          sm={6}
                          md={6}
                          lg={4}
                          xl={3}
                          onClick={() => changeSwiper(item.fxcode)}
                        >
                          <Card
                            sx={{
                              display: "flex",
                              cursor: "pointer",
                            }}
                          >
                            <CardMedia
                              component="div"
                              sx={{
                                width: "5%",
                                backgroundColor: "greenyellow",
                              }}
                            />
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                              }}
                            >
                              <CardContent sx={{ flex: "1 0 auto" }}>
                                <Typography
                                  component="div"
                                  variant="body1"
                                  style={{ fontWeight: 600 }}
                                >
                                  {item.prodmac}
                                </Typography>
                                <Typography
                                  variant="h4"
                                  color="text.secondary"
                                  component="div"
                                  style={{ fontWeight: 600 }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <p style={{ color: "red" }}>
                                      {item.temperature + " "}
                                    </p>
                                    °C&nbsp;&nbsp;
                                    <p style={{ color: "blue" }}>
                                      {item.humidity + " "}
                                    </p>
                                    %
                                  </div>
                                </Typography>
                                <Typography
                                  component="div"
                                  variant="caption"
                                  style={{
                                    fontWeight: 600,
                                    textAlign: "right",
                                  }}
                                >
                                  {item.insert_date + " " + item.insert_time}
                                </Typography>
                              </CardContent>
                            </Box>
                          </Card>
                        </GridMui>
                      ))
                    : ""}
                </GridMui>
              </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography
                  component="div"
                  variant="h6"
                  style={{ fontWeight: 600 }}
                >
                  1층
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <GridMui container spacing={2}>
                  {mainDataResult.length > 0
                    ? mainDataResult[1].map((item: any) => (
                        <GridMui
                          item
                          xs={12}
                          sm={6}
                          md={6}
                          lg={4}
                          xl={3}
                          onClick={() => changeSwiper(item.fxcode)}
                        >
                          <Card sx={{ display: "flex", cursor: "pointer" }}>
                            <CardMedia
                              component="div"
                              sx={{
                                width: "5%",
                                backgroundColor: "greenyellow",
                              }}
                            />
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                              }}
                            >
                              <CardContent sx={{ flex: "1 0 auto" }}>
                                <Typography
                                  component="div"
                                  variant="body1"
                                  style={{ fontWeight: 600 }}
                                >
                                  {item.prodmac}
                                </Typography>
                                <Typography
                                  variant="h4"
                                  color="text.secondary"
                                  component="div"
                                  style={{ fontWeight: 600 }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <p style={{ color: "red" }}>
                                      {item.temperature + " "}
                                    </p>
                                    °C&nbsp;&nbsp;
                                    <p style={{ color: "blue" }}>
                                      {item.humidity + " "}
                                    </p>
                                    %
                                  </div>
                                </Typography>
                                <Typography
                                  component="div"
                                  variant="caption"
                                  style={{
                                    fontWeight: 600,
                                    textAlign: "right",
                                  }}
                                >
                                  {item.insert_date + " " + item.insert_time}
                                </Typography>
                              </CardContent>
                            </Box>
                          </Card>
                        </GridMui>
                      ))
                    : ""}
                </GridMui>
              </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography
                  component="div"
                  variant="h6"
                  style={{ fontWeight: 600 }}
                >
                  기타
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <GridMui container spacing={2}>
                  {mainDataResult.length > 0
                    ? mainDataResult[2].map((item: any) => (
                        <GridMui
                          item
                          xs={12}
                          sm={6}
                          md={6}
                          lg={4}
                          xl={3}
                          onClick={() => changeSwiper(item.fxcode)}
                        >
                          <Card sx={{ display: "flex", cursor: "pointer" }}>
                            <CardMedia
                              component="div"
                              sx={{
                                width: "5%",
                                backgroundColor: "greenyellow",
                              }}
                            />
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                              }}
                            >
                              <CardContent sx={{ flex: "1 0 auto" }}>
                                <Typography
                                  component="div"
                                  variant="body1"
                                  style={{ fontWeight: 600 }}
                                >
                                  {item.prodmac}
                                </Typography>
                                <Typography
                                  variant="h4"
                                  color="text.secondary"
                                  component="div"
                                  style={{ fontWeight: 600 }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <p style={{ color: "red" }}>
                                      {item.temperature + " "}
                                    </p>
                                    °C&nbsp;&nbsp;
                                    <p style={{ color: "blue" }}>
                                      {item.humidity + " "}
                                    </p>
                                    %
                                  </div>
                                </Typography>
                                <Typography
                                  component="div"
                                  variant="caption"
                                  style={{
                                    fontWeight: 600,
                                    textAlign: "right",
                                  }}
                                >
                                  {item.insert_date + " " + item.insert_time}
                                </Typography>
                              </CardContent>
                            </Box>
                          </Card>
                        </GridMui>
                      ))
                    : ""}
                </GridMui>
              </AccordionDetails>
            </Accordion>
          </TabStripTab>
          <TabStripTab
            title="세부정보"
            disabled={filters2.prodmac == "" ? true : false}
          >
            <FilterContainer>
              <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                <tbody>
                  <tr>
                    <th>일자</th>
                    <td>
                      <DatePicker
                        name="yyyymmdd"
                        value={filters2.yyyymmdd}
                        format="yyyy-MM-dd"
                        onChange={filterInputChange}
                        placeholder=""
                        className="required"
                      />
                    </td>
                    <th></th>
                    <td></td>
                  </tr>
                </tbody>
              </FilterBox>
            </FilterContainer>
            <GridContainer>
              <ExcelExport
                data={mainDataResult2.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="온습도 모니터링"
              >
                <Grid
                  style={{ height: "80vh" }}
                  data={process(
                    mainDataResult2.data.map((row, idx) => ({
                      ...row,
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
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef}
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
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : centerField.includes(item.fieldName)
                                  ? CenterCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell2
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

export default QC_B9020_615W;
