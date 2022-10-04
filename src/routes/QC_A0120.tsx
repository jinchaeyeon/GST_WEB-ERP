import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridItemChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
} from "@progress/kendo-react-grid";

import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Icon, getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";

import {
  Title,
  FilterBoxWrap,
  FilterBox,
  GridContainer,
  GridTitle,
  GridContainerWrap,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import {
  Input,
  RadioButton,
  RadioButtonChangeEvent,
  RadioGroup,
  RadioGroupChangeEvent,
} from "@progress/kendo-react-inputs";

import {
  Chart,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
  ChartTitle,
} from "@progress/kendo-react-charts";

import "hammerjs";

import { useRecoilState, useRecoilValue } from "recoil";
import { useApi } from "../hooks/api";
import ItemacntDDL from "../components/DropDownLists/ItemacntDDL";
import {
  itemacntState,
  itemlvl1State,
  itemlvl2State,
  itemlvl3State,
  locationState,
} from "../store/atoms";
import { Iparameters } from "../store/types";
import Itemlvl1DDL from "../components/DropDownLists/Itemlvl1DDL";
import Itemlvl2DDL from "../components/DropDownLists/Itemlvl2DDL";
import Itemlvl3DDL from "../components/DropDownLists/Itemlvl3DDL";
import LocationDDL from "../components/DropDownLists/LocationDDL";
import YearCalendar from "../components/Calendars/YearCalendar";
import {
  chkScrollHandler,
  convertDateToStr,
  UseCommonQuery,
} from "../components/CommonFunction";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { IItemData } from "../hooks/interfaces";
import {
  commonCodeDefaultValue,
  itemgradeQuery,
  itemlvl1Query,
  itemlvl2Query,
  itemlvl3Query,
  pageSize,
  proccdQuery,
  prodmacQuery,
  usersQuery,
  useynRadioButtonData,
  zeroynRadioButtonData,
} from "../components/CommonString";
import NumberCell from "../components/Cells/NumberCell";
import DateCell from "../components/Cells/DateCell";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { LabelProps } from "@progress/kendo-react-progressbars";
//import {useAuth} from "../../hooks/auth";

const dummyData: any = [
  {
    name: "itemacnt",
    value: "1",
  },
  {
    name: "useyn",
    value: "%",
  },
];

const QC_A0120: React.FC = () => {
  const DATA_ITEM_KEY = "itemcd";
  const DETAIL_DATA_ITEM_KEY = "lotnum";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);
  const detailIdGetter = getter(DETAIL_DATA_ITEM_KEY);
  const processApi = useApi();
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [detail1DataState, setDetail1DataState] = useState<State>({
    sort: [],
  });

  const [detail2DataState, setDetail2DataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState([]);

  const [detail1DataResult, setDetail1DataResult] = useState<DataResult>(
    process([], detail1DataState)
  );

  const [detail2DataResult, setDetail2DataResult] = useState<DataResult>(
    process([], detail2DataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [filterData, setFilterData] = useState(dummyData);

  const [mainPgNum, setMainPgNum] = useState(1);
  const [detail1PgNum, setDetail1PgNum] = useState(1);
  const [detail2PgNum, setDetail2PgNum] = useState(1);

  const itemacntVal = useRecoilValue(itemacntState);
  const itemlvl1Val = useRecoilValue(itemlvl1State);
  const itemlvl2Val = useRecoilValue(itemlvl2State);
  const itemlvl3Val = useRecoilValue(itemlvl3State);
  const [locationVal, setLocationVal] = useRecoilState(locationState);

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    onRefreshClick();
    setTabSelected(e.selected);
    resetAllGrid();
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const initFrdt = new Date();
  initFrdt.setMonth(initFrdt.getMonth() - 2);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: 200,
    work_type: "CHART",
    orgdiv: "01",
    //div: "0",
    location: "01",
    frdt: initFrdt,
    todt: new Date(),
    proccd: "",
    fxcode: "",
    badcd: "",
    itemcd: "",
    itemnm: "",
    select_item: "all",
    select_code: "%",
    dptcd: "",
  });

  const [detailFilters1, setDetailFilters1] = useState({
    pgSize: pageSize,
    work_type: "DETAIL",
    orgdiv: "01",
    div: "0",
    location: "01",
    frdt: initFrdt,
    todt: new Date(),
    proccd: "",
    fxcode: "",
    badcd: "",
    itemcd: "",
    itemnm: "",
    select_item: "all",
    select_code: "%",
    dptcd: "",
  });

  const [detailFilters2, setDetailFilters2] = useState({
    pgSize: pageSize,
    work_type: "DETAIL2",
    orgdiv: "01",
    itemcd: "",
    itemnm: "",
    insiz: "",
    yyyymm: new Date(),
    itemacnt: "",
    zeroyn: "%",
    lotnum: "",
    load_place: "",
    heatno: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    useyn: "Y",
    service_id: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_QC_A0120W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "CHART",
      // "@p_orgdiv": filters.orgdiv,
      // "@p_location": locationVal.sub_code ? locationVal.sub_code : "01",
      // "@p_yyyymm": convertDateToStr(filters.yyyymm),
      // "@p_itemcd": filters.itemcd,
      // "@p_itemnm": filters.itemnm,
      // "@p_insiz": filters.insiz,
      // "@p_itemacnt": itemacntVal.sub_code,
      // "@p_zeroyn": filters.zeroyn,
      // "@p_lotnum": filters.lotnum,
      // "@p_load_place": filters.load_place,
      // "@p_heatno": filters.heatno,
      // "@p_itemlvl1": itemlvl1Val.sub_code,
      // "@p_itemlvl2": itemlvl2Val.sub_code,
      // "@p_itemlvl3": itemlvl3Val.sub_code,
      // "@p_useyn": filters.useyn,
      // "@p_service_id": filters.service_id,

      "@p_orgdiv": filters.orgdiv,
      "@p_div": tabSelected,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_proccd": filters.proccd,
      "@p_fxcode": filters.fxcode,
      "@p_badcd": filters.badcd,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_select_item": filters.select_item,
      "@p_select_code": filters.select_code,
      "@p_dptcd": filters.dptcd,
    },
  };

  const detailParameters: Iparameters = {
    procedureName: "P_QC_A0120W_Q",
    pageNumber: detail1PgNum,
    pageSize: detailFilters1.pgSize,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_orgdiv": filters.orgdiv,
      "@p_div": tabSelected,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_proccd": filters.proccd,
      "@p_fxcode": filters.fxcode,
      "@p_badcd": filters.badcd,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_select_item": filters.select_item,
      "@p_select_code": filters.select_code,
      "@p_dptcd": filters.dptcd,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;

      setMainDataResult(rows);
    }
  };

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    // if (mainDataResult.total > 0) {
    //   const firstRowData = mainDataResult.data[0];
    //   setSelectedState({ [firstRowData.itemcd]: true });
    //   // setDetailFilters1((prev) => ({
    //   //   ...prev,
    //   //   itemacnt: firstRowData.itemacnt,
    //   //   itemcd: firstRowData.itemcd,
    //   //   work_type: "DETAIL1",
    //   // }));
    // }
  }, [mainDataResult]);

  //디테일1 그리드 데이터 변경 되었을 때
  // useEffect(() => {
  //   if (detail1DataResult.total > 0) {
  //     const firstRowData = detail1DataResult.data[0];
  //     setDetailSelectedState({ [firstRowData.lotnum]: true });

  //     setDetailFilters2((prev) => ({
  //       ...prev,
  //       lotnum: firstRowData.lotnum,
  //       work_type: "DETAIL2",
  //     }));
  //   }
  // }, [detail1DataResult]);

  const fetchDetailGrid1 = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setDetail1DataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    }
  };

  useEffect(() => {
    setLocationVal({ sub_code: "01", code_name: "본사" });
    fetchMainGrid();
  }, [mainPgNum]);

  useEffect(() => {
    fetchDetailGrid1();
  }, [detail1PgNum]);

  useEffect(() => {
    resetAllGrid();
    //fetchDetailGrid1();
  }, [detailFilters1]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setDetail1PgNum(1);
    setDetail2PgNum(1);
    setMainDataResult([]);
    setDetail1DataResult(process([], detail1DataState));
    setDetail2DataResult(process([], detail2DataState));
  };

  const resetAllDetailGrid = () => {
    setDetail1PgNum(1);
    setDetail2PgNum(1);
    setDetail1DataResult(process([], detail1DataState));
    setDetail2DataResult(process([], detail2DataState));
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

    setDetailFilters1((prev) => ({
      ...prev,
      itemacnt: selectedRowData.itemacnt,
      itemcd: selectedRowData.itemcd,
      work_type: "DETAIL1",
    }));
  };

  //디테일1 그리드 선택 이벤트 => 디테일2 그리드 조회
  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters2({
      ...detailFilters2,
      lotnum: selectedRowData.lotnum,
      work_type: "DETAIL2",
    });
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, pageSize))
      setMainPgNum((prev) => prev + 1);
  };
  const onDetail1ScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detail1PgNum, pageSize))
      setDetail1PgNum((prev) => prev + 1);
  };
  const onDetail2ScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detail2PgNum, pageSize))
      setDetail2PgNum((prev) => prev + 1);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onDetail1DataStateChange = (event: GridDataStateChangeEvent) => {
    setDetail1DataState(event.dataState);
  };
  const onDetail2DataStateChange = (event: GridDataStateChangeEvent) => {
    setDetail2DataState(event.dataState);
  };
  //그리드 푸터

  const detail1TotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detail1DataResult.total}건
      </td>
    );
  };

  const detail2TotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detail2DataResult.total}건
      </td>
    );
  };

  //품목마스터 팝업
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };
  const getItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetail1SortChange = (e: any) => {
    setDetail1DataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetail2SortChange = (e: any) => {
    setDetail2DataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //공통코드 리스트 조회 (대분류, 중분류, 소분류, 품목등급)
  const [itemlvl1ListData, setItemlvl1ListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemlvl1Query, setItemlvl1ListData);

  const [itemlvl2ListData, setItemlvl2ListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemlvl2Query, setItemlvl2ListData);

  const [itemlvl3ListData, setItemlvl3ListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemlvl3Query, setItemlvl3ListData);

  const [itemgradeListData, setItemgradeListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemgradeQuery, setItemgradeListData);

  //공통코드 리스트 조회 후 그리드 데이터 세팅
  useEffect(() => {
    // setMainDataResult((prev) => {
    //   const rows = prev.data.map((row: any) => ({
    //     ...row,
    //     itemlvl1: itemlvl1ListData.find(
    //       (item: any) => item.sub_code === row.itemlvl1
    //     )?.code_name,
    //   }));
    //   console.log(rows);
    //   return {
    //     data: [...rows],
    //     total: prev.total,
    //   };
    // });
  }, [itemlvl1ListData]);

  useEffect(() => {
    // setMainDataResult((prev) => {
    //   const rows = prev.data.map((row: any) => ({
    //     ...row,
    //     itemlvl2: itemlvl2ListData.find(
    //       (item: any) => item.sub_code === row.itemlvl2
    //     )?.code_name,
    //   }));
    //   return {
    //     data: [...rows],
    //     total: prev.total,
    //   };
    // });
  }, [itemlvl2ListData]);

  useEffect(() => {
    // setMainDataResult((prev) => {
    //   const rows = prev.data.map((row: any) => ({
    //     ...row,
    //     itemlvl3: itemlvl3ListData.find(
    //       (item: any) => item.sub_code === row.itemlvl3
    //     )?.code_name,
    //   }));
    //   return {
    //     data: [...rows],
    //     total: prev.total,
    //   };
    // });
  }, [itemlvl3ListData]);

  useEffect(() => {
    // setMainDataResult((prev) => {
    //   const rows = prev.data.map((row: any) => ({
    //     ...row,
    //     itemgrade: itemgradeListData.find(
    //       (item: any) => item.sub_code === row.itemgrade
    //     )?.code_name,
    //   }));
    //   return {
    //     data: [...rows],
    //     total: prev.total,
    //   };
    // });
  }, [itemgradeListData]);

  const [proccdListData, setProccdListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [prodmacListData, setProdmacListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [prodempListData, setProdempListData] = useState([
    commonCodeDefaultValue,
  ]);

  UseCommonQuery(proccdQuery, setProccdListData);
  UseCommonQuery(prodmacQuery, setProdmacListData);
  UseCommonQuery(usersQuery, setProdempListData);

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
    console.log("props");
    console.log(props);
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
  };

  const onRefreshClick = () => {
    setSelectedChartData({
      gubun: "전체",
      argument: "-",
    });

    setDetail1DataState({});
  };

  type TCusomizedGrid = {
    maxWidth: string;
  };
  const CusomizedGrid = (props: TCusomizedGrid) => {
    const { maxWidth } = props;
    return (
      <GridContainer maxWidth={maxWidth}>
        <GridTitleContainer>
          <GridTitle>상세정보</GridTitle>
          <ButtonContainer>
            <Input
              name="gubun"
              type="text"
              value={selectedChartData.gubun}
              readOnly
            />
            <Input
              name="argument"
              type="text"
              value={selectedChartData.argument}
              readOnly
            />
            <Button
              onClick={onRefreshClick}
              themeColor={"primary"}
              fillMode={"outline"}
              icon="refresh"
            ></Button>
          </ButtonContainer>
        </GridTitleContainer>
        <Grid
          style={{ height: "680px" }}
          data={process(
            detail1DataResult.data.map((row) => ({
              ...row,
              proccd: proccdListData.find(
                (item: any) => item.sub_code === row.proccd
              )?.code_name,
              prodmac: prodmacListData.find(
                (item: any) => item.sub_code === row.prodmac
              )?.code_name,
              prodemp: prodempListData.find(
                (item: any) => item.sub_code === row.prodemp
              )?.code_name,
              badpct: Math.round(row.badpct),
            })),
            detail1DataState
          )}
          {...detail1DataState}
          onDataStateChange={onDetail1DataStateChange}
          //정렬기능
          sortable={true}
          onSortChange={onDetail1SortChange}
          //스크롤 조회 기능
          fixedScroll={true}
          total={detail1DataResult.total}
          onScroll={onDetail1ScrollHandler}
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
      </GridContainer>
    );
  };
  return (
    <>
      <TitleContainer>
        <Title>불량내역조회</Title>

        <ButtonContainer>
          <Button
            onClick={() => {
              resetAllGrid();
              fetchMainGrid();
              fetchDetailGrid1();
            }}
            icon="search"
            //fillMode="outline"
            themeColor={"primary"}
          >
            조회
          </Button>
          <Button
            title="Export Excel"
            onClick={exportExcel}
            icon="download"
            fillMode="outline"
            themeColor={"primary"}
          >
            Excel
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterBoxWrap>
        <FilterBox>
          <tbody>
            <tr>
              <th>불량일자</th>
              <td colSpan={3} className="item-box">
                <DatePicker
                  name="frdt"
                  defaultValue={filters.frdt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                />
                ~
                <DatePicker
                  name="todt"
                  defaultValue={filters.todt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
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
              <th></th>
              <td></td>
            </tr>
            <tr>
              <th>불량유형</th>
              <td>
                <ItemacntDDL />
              </td>

              <th>공정</th>
              <td>
                <Itemlvl1DDL />
              </td>

              <th>설비</th>
              <td>
                <Itemlvl2DDL />
              </td>

              <th>부서</th>
              <td>
                <Itemlvl3DDL />
              </td>

              <th></th>
              <td></td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>

      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
        <TabStripTab title="공정불량">
          <GridContainerWrap>
            <GridContainer>
              <GridContainerWrap>
                <Chart
                  onSeriesClick={onChartSeriesClick}
                  className={"QC_A0120_TAB1"}
                >
                  <ChartTitle text="공정별" />
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem
                      //autoFit={true}
                      type="pie"
                      data={mainDataResult.filter(
                        (item: any) => item.gubun === "공정별"
                      )}
                      field="value"
                      categoryField="category"
                      labels={{ visible: true, content: labelContent }}
                    />
                  </ChartSeries>
                </Chart>
                <Chart
                  onSeriesClick={onChartSeriesClick}
                  className={"QC_A0120_TAB1"}
                >
                  <ChartTitle text="설비별" />
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem
                      type="pie"
                      width={850}
                      data={mainDataResult.filter(
                        (item: any) => item.gubun === "설비별"
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
                  onSeriesClick={onChartSeriesClick}
                  className={"QC_A0120_TAB1"}
                >
                  <ChartTitle text="불량유형별" />
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem
                      type="pie"
                      data={mainDataResult.filter(
                        (item: any) => item.gubun === "불량유형별"
                      )}
                      field="value"
                      categoryField="category"
                      labels={{ visible: true, content: labelContent }}
                    />
                  </ChartSeries>
                </Chart>
                <Chart
                  onSeriesClick={onChartSeriesClick}
                  className={"QC_A0120_TAB1"}
                >
                  <ChartTitle text="품목별" />
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem
                      type="pie"
                      data={mainDataResult.filter(
                        (item: any) => item.gubun === "품목별"
                      )}
                      field="value"
                      categoryField="category"
                      labels={{ visible: true, content: labelContent }}
                    />
                  </ChartSeries>
                </Chart>
              </GridContainerWrap>
            </GridContainer>

            <CusomizedGrid maxWidth="850px"></CusomizedGrid>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="소재불량">
          <GridContainerWrap>
            <GridContainer maxWidth="100%">
              <GridContainerWrap>
                <Chart
                  onSeriesClick={onChartSeriesClick}
                  className={"QC_A0120_TAB2"}
                >
                  <ChartTitle text="공정별" />
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem
                      type="pie"
                      data={mainDataResult.filter(
                        (item: any) => item.gubun === "공정별"
                      )}
                      field="value"
                      categoryField="category"
                      labels={{ visible: true, content: labelContent }}
                    />
                  </ChartSeries>
                </Chart>
                <Chart
                  onSeriesClick={onChartSeriesClick}
                  className={"QC_A0120_TAB2"}
                >
                  <ChartTitle text="설비별" />
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem
                      type="pie"
                      width={850}
                      data={mainDataResult.filter(
                        (item: any) => item.gubun === "설비별"
                      )}
                      //data={mainDataResult}
                      field="value"
                      categoryField="category"
                      labels={{ visible: true, content: labelContent }}
                    />
                  </ChartSeries>
                </Chart>
              </GridContainerWrap>
              <GridContainerWrap>
                <Chart
                  onSeriesClick={onChartSeriesClick}
                  className={"QC_A0120_TAB2"}
                >
                  <ChartTitle text="불량유형별" />
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem
                      type="pie"
                      data={mainDataResult.filter(
                        (item: any) => item.gubun === "불량유형별"
                      )}
                      //data={mainDataResult}
                      field="value"
                      categoryField="category"
                      labels={{ visible: true, content: labelContent }}
                    />
                  </ChartSeries>
                </Chart>
                <Chart
                  onSeriesClick={onChartSeriesClick}
                  className={"QC_A0120_TAB2"}
                >
                  <ChartTitle text="품목별" />
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem
                      type="pie"
                      data={mainDataResult.filter(
                        (item: any) => item.gubun === "품목별"
                      )}
                      //data={mainDataResult}
                      field="value"
                      categoryField="category"
                      labels={{ visible: true, content: labelContent }}
                    />
                  </ChartSeries>
                </Chart>
              </GridContainerWrap>
            </GridContainer>

            <CusomizedGrid maxWidth="850px"></CusomizedGrid>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="검사불량">
          <GridContainerWrap>
            <GridContainer maxWidth="100%">
              <GridContainerWrap>
                <Chart
                  onSeriesClick={onChartSeriesClick}
                  className={"QC_A0120_TAB3"}
                >
                  <ChartTitle text="불량유형별" />
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem
                      type="pie"
                      data={mainDataResult.filter(
                        (item: any) => item.gubun === "불량유형별"
                      )}
                      //data={mainDataResult}
                      field="value"
                      categoryField="category"
                      labels={{ visible: true, content: labelContent }}
                    />
                  </ChartSeries>
                </Chart>
              </GridContainerWrap>
              <GridContainerWrap>
                <Chart
                  onSeriesClick={onChartSeriesClick}
                  className={"QC_A0120_TAB3"}
                >
                  <ChartTitle text="품목별" />
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem
                      type="pie"
                      data={mainDataResult.filter(
                        (item: any) => item.gubun === "품목별"
                      )}
                      //data={mainDataResult}
                      field="value"
                      categoryField="category"
                      labels={{ visible: true, content: labelContent }}
                    />
                  </ChartSeries>
                </Chart>
              </GridContainerWrap>
            </GridContainer>

            <CusomizedGrid maxWidth="1050px"></CusomizedGrid>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>

      {itemWindowVisible && (
        <ItemsWindow
          getVisible={setItemWindowVisible}
          workType={"FILTER"}
          getData={getItemData}
          para={undefined}
        />
      )}
    </>
  );
};

export default QC_A0120;
