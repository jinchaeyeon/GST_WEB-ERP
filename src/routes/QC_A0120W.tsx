import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Chart,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
  ChartTitle,
} from "@progress/kendo-react-charts";
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
import { bytesToBase64 } from "byte-base64";
import "hammerjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInInput,
  DDGDcolorList,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
  WebErpcolorList,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { IItemData } from "../hooks/interfaces";
import { heightstate, isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";

var index = 0;

const QC_A0120: React.FC = () => {
  let deviceWidth = window.innerWidth;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = 0;
  var container = document.querySelector(".ButtonContainer");
  if (container?.clientHeight != undefined) {
    height = container == undefined ? 0 : container.clientHeight;
  }
  let isMobile = deviceWidth <= 1200;
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();

  let gridRef: any = useRef(null);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const idGetter = getter(DATA_ITEM_KEY);
  const [swiper, setSwiper] = useState<SwiperCore>();
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters1((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("QC_A0120W", setCustomOptionData);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("QC_A0120W", setMessagesData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        ymdFrdt: setDefaultDate(customOptionData, "ymdFrdt"),
        ymdTodt: setDefaultDate(customOptionData, "ymdTodt"),
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_QC002,L_PR010,L_fxcode,L_dptcd_001,L_sysUserMaster_001",
    //불량유형, 공정, 설비, 부서코드, 담당자
    setBizComponentData
  );

  //공통코드 리스트 조회
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [prodmacListData, setProdmacListData] = useState([
    { fxfull: "", fxcode: "" },
  ]);
  const [prodempListData, setProdempListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_PR010")
      );
      const prodmacQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_fxcode")
      );
      const prodempQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_001"
        )
      );

      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(prodmacQueryStr, setProdmacListData);
      fetchQuery(prodempQueryStr, setProdempListData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr: string, setListData: any) => {
    let data: any;

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const [detail1DataState, setDetail1DataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState([]);

  const [detail1DataResult, setDetail1DataResult] = useState<DataResult>(
    process([], detail1DataState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    setPage(initialPageState); // 페이지 초기화
    fetchMainGrid(e.selected);
    setDetailFilters1((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
  };

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
    pgSize: 200,
    work_type: "CHART",
    orgdiv: sessionOrgdiv,
    //div: "0",
    location: sessionLocation,
    ymdFrdt: new Date(),
    ymdTodt: new Date(),
    cboProccd: "",
    cboFxcode: "",
    cboBadcd: "",
    itemcd: "",
    itemnm: "",
    select_item: "all",
    select_code: "%",
    cboDptcd: "",
  });

  const [detailFilters1, setDetailFilters1] = useState({
    pgSize: PAGE_SIZE,
    work_type: "DETAIL",
    orgdiv: sessionOrgdiv,
    div: "0",
    location: sessionLocation,
    frdt: new Date(),
    todt: new Date(),
    proccd: "",
    fxcode: "",
    badcd: "",
    itemcd: "",
    itemnm: "",
    select_item: "all",
    select_code: "%",
    dptcd: "",
    isSearch: true,
    pgNum: 1,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (tab: any) => {
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_A0120W_Q",
      pageNumber: 1,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "CHART",
        "@p_orgdiv": filters.orgdiv,
        "@p_div": tab,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.ymdFrdt),
        "@p_todt": convertDateToStr(filters.ymdTodt),
        "@p_proccd": filters.cboProccd,
        "@p_fxcode": filters.cboFxcode,
        "@p_badcd": filters.cboBadcd,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_select_item": filters.select_item,
        "@p_select_code": filters.select_code,
        "@p_dptcd": filters.cboDptcd,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;

      setMainDataResult(rows);
      setDetailFilters1((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
    }
    setLoading(false);
  };

  const fetchDetailGrid1 = async (detailFilters1: any) => {
    let data: any;
    setLoading(true);

    const detailParameters: Iparameters = {
      procedureName: "P_QC_A0120W_Q",
      pageNumber: detailFilters1.pgNum,
      pageSize: detailFilters1.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_div": tabSelected,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.ymdFrdt),
        "@p_todt": convertDateToStr(filters.ymdTodt),
        "@p_proccd": filters.cboProccd,
        "@p_fxcode": filters.cboFxcode,
        "@p_badcd": filters.cboBadcd,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_select_item": filters.select_item,
        "@p_select_code": filters.select_code,
        "@p_dptcd": filters.cboDptcd,
      },
    };

    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      setDetail1DataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    }
    setLoading(false);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setTabSelected(0);
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult([]);
    setDetail1DataResult(process([], detail1DataState));
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      if (tabSelected == 0) {
        optionsGridOne.sheets[0].title = "공정불량";
      } else if (tabSelected == 1) {
        optionsGridOne.sheets[0].title = "소재불량";
      } else {
        optionsGridOne.sheets[0].title = "검사불량";
      }

      _export.save(optionsGridOne);
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onDetail1DataStateChange = (event: GridDataStateChangeEvent) => {
    setDetail1DataState(event.dataState);
  };

  const detail1TotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detail1DataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detail1DataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //품목마스터 팝업
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onDetail1SortChange = (e: any) => {
    setDetail1DataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const labelContent = (props: any) => {
    let formatedNumber = Number(props.percentage).toLocaleString(undefined, {
      style: "percent",
      //minimumFractionDigits: 2, //소수점
    });
    return `${props.dataItem.argument} : ${formatedNumber}`;
  };

  const [selectedChartData, setSelectedChartData] = useState({
    gubun: "전체",
    argument: "-",
  });

  const onChartSeriesClick = (props: any) => {
    const { item, argument, gubun } = props.dataItem;

    setSelectedChartData({
      gubun,
      argument,
    });

    setDetail1DataState({
      filter: {
        logic: "and",
        filters: [
          { field: item /*"proccd"*/, operator: "eq", value: argument },
          //{ field: "unitPrice", operator: "lt", value: 22 },
        ],
      },
    });

    if (swiper && isMobile) {
      swiper.slideTo(4);
    }
  };

  type TCusomizedGrid = {
    maxWidth: string;
  };

  const [isInitSearch, setIsInitSearch] = useState(false);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData !== null &&
      isInitSearch == false &&
      permissions !== null
    ) {
      fetchMainGrid(tabSelected);
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (
      detailFilters1.isSearch &&
      permissions !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters1);
      setDetailFilters1((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchDetailGrid1(deepCopiedFilters);
    }
  }, [detailFilters1, permissions]);

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  const CusomizedGrid = (props: TCusomizedGrid) => {
    const { maxWidth } = props;
    return (
      <GridContainer maxWidth={maxWidth}>
        <GridTitleContainer className="ButtonContainer">
          <GridTitle>상세정보</GridTitle>
          {isMobile ? (
            <div style={{ flexDirection: "row" }}>
              <FormBoxWrap border={true}>
                <FormBox>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "10px",
                    }}
                  >
                    <Input
                      name="gubun"
                      type="text"
                      value={selectedChartData.gubun}
                      className="readonly"
                      style={{ maxWidth: "30%" }}
                    />
                    <Input
                      name="argument"
                      type="text"
                      value={selectedChartData.argument}
                      className="readonly"
                      style={{ maxWidth: "70%" }}
                    />
                  </div>
                </FormBox>
              </FormBoxWrap>
            </div>
          ) : (
            <ButtonContainer>
              <Input
                name="gubun"
                type="text"
                value={selectedChartData.gubun}
                className="readonly"
              />
              <Input
                name="argument"
                type="text"
                value={selectedChartData.argument}
                className="readonly"
              />
            </ButtonContainer>
          )}
        </GridTitleContainer>
        <ExcelExport
          data={detail1DataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="불량내역조회"
        >
          <Grid
            style={{
              height: !isMobile ? "67vh" : deviceHeight - height,
            }}
            data={process(
              detail1DataResult.data.map((row) => ({
                ...row,
                proccd: proccdListData.find(
                  (item: any) => item.sub_code == row.proccd
                )?.code_name,
                prodmac: prodmacListData.find(
                  (item: any) => item.fxcode == row.prodmac
                )?.fxfull,
                prodemp: prodempListData.find(
                  (item: any) => item.user_id == row.prodemp
                )?.user_name,
                badpct: Math.round(row.badpct),
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
              detail1DataState
            )}
            {...detail1DataState}
            onDataStateChange={onDetail1DataStateChange}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onDetailSelectionChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={detail1DataResult.total}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            //원하는 행 위치로 스크롤 기능
            ref={gridRef}
            rowHeight={30}
            //정렬기능
            sortable={true}
            onSortChange={onDetail1SortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            <GridColumn
              field="baddt"
              title="불량일자"
              width="120px"
              cell={DateCell}
            />
            <GridColumn
              field="lotnum"
              title="LOT NO"
              footerCell={detail1TotalFooterCell}
              width="150px"
            />
            <GridColumn
              field="prodqty"
              title="생산량"
              cell={NumberCell}
              width="120px"
            />
            <GridColumn
              field="goodqty"
              title="양품수량"
              cell={NumberCell}
              width="120px"
            />
            <GridColumn
              field="totbadqty"
              title="불량수량"
              cell={NumberCell}
              width="120px"
            />
            <GridColumn
              field="badpct"
              title="불량률(%)"
              cell={NumberCell}
              width="120px"
            />
            <GridColumn field="proccd" title="공정" width="120px" />
            <GridColumn field="prodmac" title="설비" width="120px" />
            <GridColumn field="prodemp" title="작업자" width="120px" />
            <GridColumn field="orglot" title="제조번호" width="120px" />
            <GridColumn field="itemcd" title="품목코드" width="120px" />
            <GridColumn field="itemnm" title="품목명" width="120px" />
            <GridColumn field="bnatur" title="재질" width="120px" />
            <GridColumn field="insiz" title="규격" width="120px" />
            <GridColumn field="rekey" title="실적번호" width="150px" />
          </Grid>
        </ExcelExport>
      </GridContainer>
    );
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.ymdFrdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.ymdFrdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.ymdFrdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.ymdFrdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A0120W_001");
      } else if (
        convertDateToStr(filters.ymdTodt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.ymdTodt).substring(6, 8) > "31" ||
        convertDateToStr(filters.ymdTodt).substring(6, 8) < "01" ||
        convertDateToStr(filters.ymdTodt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A0120W_001");
      } else {
        resetAllGrid();
        fetchMainGrid(0);
        setDetailFilters1((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>불량내역조회</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="QC_A0120W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>불량일자</th>
              <td>
                <CommonDateRangePicker
                  value={{
                    start: filters.ymdFrdt,
                    end: filters.ymdTodt,
                  }}
                  onChange={(e: { value: { start: any; end: any } }) =>
                    setFilters((prev) => ({
                      ...prev,
                      ymdFrdt: e.value.start,
                      ymdTodt: e.value.end,
                    }))
                  }
                  className="required"
                />
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
            <tr>
              <th>불량유형</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="cboBadcd"
                    value={filters.cboBadcd}
                    bizComponentId="L_QC002"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>

              <th>공정</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="cboProccd"
                    value={filters.cboProccd}
                    bizComponentId="L_PR010"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>

              <th>설비</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="cboFxcode"
                    value={filters.cboFxcode}
                    bizComponentId="L_fxcode"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                    textField="fxfull"
                    valueField="fxcode"
                  />
                )}
              </td>

              <th>부서</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="cboDptcd"
                    value={filters.cboDptcd}
                    bizComponentId="L_dptcd_001"
                    bizComponentData={bizComponentData}
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
          <TabStrip
            style={{
              width: "100%",
            }}
            selected={tabSelected}
            onSelect={handleSelectTab}
          >
            <TabStripTab title="공정불량">
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <GridContainer
                  style={{
                    width: "100%",
                  }}
                >
                  <SwiperSlide key={0}>
                    <Chart
                      style={{ width: "100%", height: deviceHeight }}
                      seriesColors={
                        window.location.href.split("/")[2].split(".")[1] ==
                        "ddgd"
                          ? DDGDcolorList
                          : WebErpcolorList
                      }
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB1"}
                    >
                      <ChartTitle text="공정별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "공정별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </SwiperSlide>
                  <SwiperSlide key={1}>
                    <Chart
                      style={{ width: "100%", height: deviceHeight }}
                      seriesColors={
                        window.location.href.split("/")[2].split(".")[1] ==
                        "ddgd"
                          ? DDGDcolorList
                          : WebErpcolorList
                      }
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB1"}
                    >
                      <ChartTitle text="설비별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "설비별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </SwiperSlide>
                  <SwiperSlide key={2}>
                    <Chart
                      style={{ width: "100%", height: deviceHeight }}
                      seriesColors={
                        window.location.href.split("/")[2].split(".")[1] ==
                        "ddgd"
                          ? DDGDcolorList
                          : WebErpcolorList
                      }
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB1"}
                    >
                      <ChartTitle text="불량유형별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "불량유형별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </SwiperSlide>
                  <SwiperSlide key={3}>
                    <Chart
                      style={{ width: "100%", height: deviceHeight }}
                      seriesColors={
                        window.location.href.split("/")[2].split(".")[1] ==
                        "ddgd"
                          ? DDGDcolorList
                          : WebErpcolorList
                      }
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB1"}
                    >
                      <ChartTitle text="품목별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "품목별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </SwiperSlide>
                </GridContainer>
                <GridContainer width="100%">
                  <SwiperSlide key={4}>
                    <CusomizedGrid maxWidth="100%"></CusomizedGrid>
                  </SwiperSlide>
                </GridContainer>
              </Swiper>
            </TabStripTab>
            <TabStripTab title="소재불량">
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <GridContainer
                  style={{
                    width: "100%",
                  }}
                >
                  <SwiperSlide key={0}>
                    <Chart
                      style={{ width: "100%", height: deviceHeight }}
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB2"}
                    >
                      <ChartTitle text="공정별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "공정별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </SwiperSlide>
                  <SwiperSlide key={1}>
                    <Chart
                      style={{ width: "100%", height: deviceHeight }}
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB2"}
                    >
                      <ChartTitle text="설비별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          width={1200}
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "설비별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </SwiperSlide>
                  <SwiperSlide key={2}>
                    <Chart
                      style={{ width: "100%", height: deviceHeight }}
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB2"}
                    >
                      <ChartTitle text="불량유형별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "불량유형별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </SwiperSlide>
                  <SwiperSlide key={3}>
                    <Chart
                      style={{ width: "100%", height: deviceHeight }}
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB2"}
                    >
                      <ChartTitle text="품목별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "품목별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </SwiperSlide>
                </GridContainer>
                <GridContainer width="100%">
                  <SwiperSlide key={4}>
                    <CusomizedGrid maxWidth="100%"></CusomizedGrid>
                  </SwiperSlide>
                </GridContainer>
              </Swiper>
            </TabStripTab>
            <TabStripTab title="검사불량">
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <GridContainer
                  style={{
                    width: "100%",
                  }}
                >
                  <SwiperSlide key={0}>
                    <Chart
                      style={{ width: "100%", height: deviceHeight }}
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB3"}
                    >
                      <ChartTitle text="불량유형별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "불량유형별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </SwiperSlide>
                  <SwiperSlide key={1}>
                    <Chart
                      style={{ width: "100%" }}
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB3"}
                    >
                      <ChartTitle text="품목별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "품목별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </SwiperSlide>
                </GridContainer>
                <GridContainer width="100%">
                  <SwiperSlide key={4}>
                    <CusomizedGrid maxWidth="100%"></CusomizedGrid>
                  </SwiperSlide>
                </GridContainer>
              </Swiper>
            </TabStripTab>
          </TabStrip>
        </>
      ) : (
        <>
          <TabStrip
            style={{ width: "100%", height: "79vh" }}
            selected={tabSelected}
            onSelect={handleSelectTab}
          >
            <TabStripTab title="공정불량">
              <GridContainerWrap>
                <GridContainer
                  style={{
                    width: "60%",
                    height: deviceHeight,
                  }}
                >
                  <GridContainerWrap>
                    <Chart
                      style={{ height: "36vh" }}
                      seriesColors={
                        window.location.href.split("/")[2].split(".")[1] ==
                        "ddgd"
                          ? DDGDcolorList
                          : WebErpcolorList
                      }
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB1"}
                    >
                      <ChartTitle text="공정별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "공정별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                    <Chart
                      style={{ height: "36vh" }}
                      seriesColors={
                        window.location.href.split("/")[2].split(".")[1] ==
                        "ddgd"
                          ? DDGDcolorList
                          : WebErpcolorList
                      }
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB1"}
                    >
                      <ChartTitle text="설비별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "설비별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </GridContainerWrap>
                  <GridContainerWrap>
                    <Chart
                      style={{ height: "36vh" }}
                      seriesColors={
                        window.location.href.split("/")[2].split(".")[1] ==
                        "ddgd"
                          ? DDGDcolorList
                          : WebErpcolorList
                      }
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB1"}
                    >
                      <ChartTitle text="불량유형별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "불량유형별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                    <Chart
                      style={{ height: "36vh" }}
                      seriesColors={
                        window.location.href.split("/")[2].split(".")[1] ==
                        "ddgd"
                          ? DDGDcolorList
                          : WebErpcolorList
                      }
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB1"}
                    >
                      <ChartTitle text="품목별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "품목별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </GridContainerWrap>
                </GridContainer>
                <GridContainer width={`calc(40% - ${GAP}px)`}>
                  <CusomizedGrid maxWidth="1200px"></CusomizedGrid>
                </GridContainer>
              </GridContainerWrap>
            </TabStripTab>
            <TabStripTab title="소재불량">
              <GridContainerWrap>
                <GridContainer width="60%">
                  <GridContainerWrap>
                    <Chart
                      style={{ height: "36vh" }}
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB2"}
                    >
                      <ChartTitle text="공정별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "공정별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                    <Chart
                      style={{ height: "36vh" }}
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB2"}
                    >
                      <ChartTitle text="설비별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          width={1200}
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "설비별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </GridContainerWrap>
                  <GridContainerWrap>
                    <Chart
                      style={{ height: "36vh" }}
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB2"}
                    >
                      <ChartTitle text="불량유형별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "불량유형별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                    <Chart
                      style={{ height: "36vh" }}
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB2"}
                    >
                      <ChartTitle text="품목별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "품목별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </GridContainerWrap>
                </GridContainer>
                <GridContainer width={`calc(40% - ${GAP}px)`}>
                  <CusomizedGrid maxWidth="1200px"></CusomizedGrid>
                </GridContainer>
              </GridContainerWrap>
            </TabStripTab>
            <TabStripTab title="검사불량">
              <GridContainerWrap>
                <GridContainer width="30%">
                  <GridContainerWrap>
                    <Chart
                      style={{ height: "36vh" }}
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB3"}
                    >
                      <ChartTitle text="불량유형별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "불량유형별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </GridContainerWrap>
                  <GridContainerWrap>
                    <Chart
                      style={{ height: "36vh" }}
                      onSeriesClick={onChartSeriesClick}
                      className={"QC_A0120_TAB3"}
                    >
                      <ChartTitle text="품목별" />
                      <ChartLegend position="bottom" />
                      <ChartSeries>
                        <ChartSeriesItem
                          type="pie"
                          data={mainDataResult.filter(
                            (item: any) => item.gubun == "품목별"
                          )}
                          field="value"
                          categoryField="category"
                          labels={{ visible: true, content: labelContent }}
                        />
                      </ChartSeries>
                    </Chart>
                  </GridContainerWrap>
                </GridContainer>
                <GridContainer width={`calc(70% - ${GAP}px)`}>
                  <CusomizedGrid maxWidth="1200px"></CusomizedGrid>
                </GridContainer>
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
    </>
  );
};

export default QC_A0120;
