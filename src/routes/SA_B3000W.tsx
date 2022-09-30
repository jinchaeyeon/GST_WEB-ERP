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
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartCategoryAxisTitle,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
  ChartTitle,
} from "@progress/kendo-react-charts";

import "hammerjs";

import { useApi } from "../hooks/api";

import { Iparameters } from "../store/types";
import YearCalendar from "../components/Calendars/YearCalendar";
import {
  chkScrollHandler,
  convertDateToStr,
  setDefaultDate,
  UseBizComponent,
  UseCommonQuery,
  UseCustomOption,
  UseDesignInfo,
} from "../components/CommonFunction";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { IItemData } from "../hooks/interfaces";
import {
  clientWidth,
  commonCodeDefaultValue,
  gnvWidth,
  gridMargin,
  itemgradeQuery,
  itemlvl1Query,
  itemlvl2Query,
  itemlvl3Query,
  pageSize,
  proccdQuery,
  prodmacQuery,
  usersQuery,
} from "../components/CommonString";
import NumberCell from "../components/Cells/NumberCell";
import DateCell from "../components/Cells/DateCell";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { LabelProps } from "@progress/kendo-react-progressbars";
import CommonRadioGroup from "../components/CommonRadioGroup";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { gridList } from "../store/columns/SA_B3000W_C";
import { filter } from "jszip";
//import {useAuth} from "../../hooks/auth";

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

const SA_B3000W: React.FC = () => {
  const DATA_ITEM_KEY = "custcd";
  const DETAIL_DATA_ITEM_KEY = "lotnum";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);
  const detailIdGetter = getter(DETAIL_DATA_ITEM_KEY);
  const processApi = useApi();
  const pathname: string = window.location.pathname.replace("/", "");

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const [wordInfoData, setWordInfoData] = React.useState<any>(null);
  UseDesignInfo(pathname, setWordInfoData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001,L_sysUserMaster_001,L_EA002,L_HU089,L_appyn,L_USERS,L_HU005,L_EA004",
    //부서,담당자,결재문서,근태구분,결재유무,사용자,직위,결재라인
    setBizComponentData
  );

  const [isInitSearch, setIsInitSearch] = useState(false);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        yyyy: setDefaultDate(customOptionData, "yyyy"),
        cboLocation: defaultOption.find(
          (item: any) => item.id === "cboLocation"
        ).value,
        cboDiv: defaultOption.find((item: any) => item.id === "cboDiv").value,
        rdoAmtdiv: defaultOption.find((item: any) => item.id === "rdoAmtdiv")
          .value,
      }));
    }
  }, [customOptionData]);

  const [allGridDataState, setAllGridDataState] = useState<State>({
    sort: [],
  });

  const [detail1DataState, setDetail1DataState] = useState<State>({
    sort: [],
  });

  const [detail2DataState, setDetail2DataState] = useState<State>({
    sort: [],
  });

  const [allGridDataResult, setAllGridDataResult] = useState<DataResult>(
    process([], allGridDataState)
  );
  const [allGraphDataResult, setAllGraphDataResult] = useState({
    companies: [""],
    series: [0],
  });
  const [monthGraphDataResult, setMonthGraphDataResult] = useState([]);

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

  const [allGridPgNum, setAllGridPgNum] = useState(1);
  const [detail1PgNum, setDetail1PgNum] = useState(1);
  const [detail2PgNum, setDetail2PgNum] = useState(1);

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    onRefreshClick();
    setTabSelected(e.selected);
    resetAllGrid();
    console.log("e.selected");
    if (e.selected === 0) {
      fetchGrid("TOTAL");
      fetchGrid("GRID");
    } else if (e.selected === 1) {
      fetchGrid("MONTH");
      fetchGrid("MCHART");
    } else if (e.selected === 2) {
      fetchGrid("QUARTER");
      fetchGrid("QCHART");
    } else if (e.selected === 3) {
      fetchGrid("5year");
      fetchGrid("CHART");
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
    cboLocation: "",
    yyyy: new Date(),
    custcd: "",
    custnm: "",
    cboDiv: "",
    mm: "",
    rdoAmtdiv: "",
    yyyymm: "",
    txtBnatur: "",
    doexdiv: "%",
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

  const detailParameters: Iparameters = {
    procedureName: "P_SA_B3000W_Q",
    pageNumber: detail1PgNum,
    pageSize: detailFilters1.pgSize,
    parameters: {
      // "@p_work_type": "DETAIL",
      // "@p_orgdiv": filters.orgdiv,
      // "@p_div": tabSelected,
      // "@p_location": filters.location,
      // "@p_frdt": convertDateToStr(filters.frdt),
      // "@p_todt": convertDateToStr(filters.todt),
      // "@p_proccd": filters.proccd,
      // "@p_fxcode": filters.fxcode,
      // "@p_badcd": filters.badcd,
      // "@p_itemcd": filters.itemcd,
      // "@p_itemnm": filters.itemnm,
      // "@p_select_item": filters.select_item,
      // "@p_select_code": filters.select_code,
      // "@p_dptcd": filters.dptcd,
    },
  };

  //그리드 데이터 조회
  const fetchGrid = async (workType: string, custcd?: string) => {
    let data: any;

    const selectedRowKeyVal: number =
      Number(Object.getOwnPropertyNames(selectedState)[0]) ?? null;

    let selectedRowData;
    if (selectedRowKeyVal) {
      selectedRowData = allGridDataResult.data.find(
        (item) => item[DATA_ITEM_KEY] === selectedRowKeyVal
      );
    }

    console.log("selectedRowData");
    console.log(selectedRowKeyVal);
    console.log(selectedRowData);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_B3000W_Q",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.cboLocation,
        "@p_yyyy": convertDateToStr(filters.yyyy).substr(0, 4),
        "@p_custcd": custcd ? custcd : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_div": filters.cboDiv,
        "@p_mm": filters.mm,
        "@p_amtdiv": filters.rdoAmtdiv,
        "@p_yyyymm": convertDateToStr(filters.yyyy).substr(0, 6),
        "@p_bnatur": filters.txtBnatur,
        "@p_doexdiv": filters.doexdiv,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;

      if (
        workType === "GRID" ||
        workType === "MONTH" ||
        workType === "QUARTER" ||
        workType === "5year"
      ) {
        setAllGridDataResult(process(rows, allGridDataState));
      } else if (workType === "TOTAL") {
        let newRows = { companies: [""], series: [0] };

        rows.forEach((row: any) => {
          if (!newRows.companies.includes(row.argument)) {
            newRows.companies.push(row.argument);
            newRows.series.push(row.sort_amt);
          }
        });

        setAllGraphDataResult({
          companies: newRows.companies,
          series: newRows.series,
        });
      } else if (
        workType === "MCHART" ||
        workType === "QCHART" ||
        workType === "CHART"
      ) {
        setMonthGraphDataResult(rows);
      }
    }

    setFilters((prev) => ({ ...prev, work_type: "", custcd: "" }));
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (customOptionData !== null && isInitSearch === false) {
      fetchGrid("GRID");
      fetchGrid("TOTAL");
      setIsInitSearch(true);
    }
  }, [filters]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    // if (allGridDataResult.total > 0) {
    //   const firstRowData = allGridDataResult.data[0];
    //   setSelectedState({ [firstRowData.itemcd]: true });
    //   // setDetailFilters1((prev) => ({
    //   //   ...prev,
    //   //   itemacnt: firstRowData.itemacnt,
    //   //   itemcd: firstRowData.itemcd,
    //   //   work_type: "DETAIL1",
    //   // }));
    // }
  }, [allGridDataResult]);

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
    if (customOptionData !== null) {
      fetchDetailGrid1();
    }
  }, [detail1PgNum]);

  useEffect(() => {
    resetAllGrid();
    //fetchDetailGrid1();
  }, [detailFilters1]);

  //그리드 리셋
  const resetAllGrid = () => {
    setAllGridPgNum(1);
    setDetail1PgNum(1);
    setDetail2PgNum(1);
    setAllGridDataResult(process([], allGridDataState));
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
  const onAllGridSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);

    // const selectedIdx = event.startRowIndex;
    // const selectedRowData = event.dataItems[selectedIdx];

    // setDetailFilters1((prev) => ({
    //   ...prev,
    //   itemacnt: selectedRowData.itemacnt,
    //   itemcd: selectedRowData.itemcd,
    //   work_type: "DETAIL1",
    // }));
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
    fetchGrid("MCHRAT", selectedRowData.custcd);
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
  const onAllGridScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, allGridPgNum, pageSize))
      setAllGridPgNum((prev) => prev + 1);
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
  const onAllGridDataStateChange = (event: GridDataStateChangeEvent) => {
    setAllGridDataState(event.dataState);
  };
  const onDetail1DataStateChange = (event: GridDataStateChangeEvent) => {
    setDetail1DataState(event.dataState);
  };
  const onDetail2DataStateChange = (event: GridDataStateChangeEvent) => {
    setDetail2DataState(event.dataState);
  };
  //그리드 푸터

  const allGridTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {allGridDataResult.total}건
      </td>
    );
  };
  const allGridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    allGridDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum += item[props.field]) : ""
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {sum}
      </td>
    );
  };

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

  const onAllGridSortChange = (e: any) => {
    setAllGridDataState((prev) => ({ ...prev, sort: e.sort }));
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
    // setAllGridDataResult((prev) => {
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
    // setAllGridDataResult((prev) => {
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
    // setAllGridDataResult((prev) => {
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
    // setAllGridDataResult((prev) => {
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
    return `${props.dataItem.mm} : ${formatedNumber}`;
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

  return (
    <>
      <TitleContainer>
        <Title>매출집계(업체)</Title>

        <ButtonContainer>
          <Button
            onClick={() => {
              // resetAllGrid();
              // fetchDetailGrid1();

              if (tabSelected === 0) {
                fetchGrid("TOTAL");
                fetchGrid("GRID");
              } else if (tabSelected === 1) {
                fetchGrid("MONTH");
                fetchGrid("MCHART");
              } else if (tabSelected === 2) {
                fetchGrid("QUARTER");
                fetchGrid("QCHART");
              } else if (tabSelected === 3) {
                fetchGrid("5year");
                fetchGrid("CHART");
              }
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
              <th data-control-name="lblYyyy">기준년도</th>
              <td>
                <DatePicker
                  name="yyyy"
                  value={filters.yyyy}
                  format="yyyy"
                  onChange={filterInputChange}
                  calendar={YearCalendar}
                />
              </td>

              <th data-control-name="lblDiv">업체구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboDiv"
                    value={filters.cboDiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="name"
                    valueField="code"
                  />
                )}
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
                    onClick={onItemWndClick}
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

              <th data-control-name="lblBnatur">재질</th>
              <td>
                <Input
                  name="txtBnatur"
                  type="text"
                  value={filters.txtBnatur}
                  onChange={filterInputChange}
                />
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
      </FilterBoxWrap>

      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
        <TabStripTab title="전체">
          <GridContainerWrap flexDirection="column">
            <GridContainer>
              {/* <Chart
                  onSeriesClick={onChartSeriesClick}
                  className={"SA_B3000W_TAB1"}
                >
                  <ChartTitle text="공정별" />
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem
                      //autoFit={true}
                      type="pie"
                      data={allGridDataResult.filter(
                        (item: any) => item.gubun === "공정별"
                      )}
                      field="value"
                      categoryField="category"
                      labels={{ visible: true, content: labelContent }}
                    />
                  </ChartSeries>
                </Chart> */}

              <Chart>
                {/* <ChartTitle text="Units sold" /> */}
                <ChartCategoryAxis>
                  <ChartCategoryAxisItem
                    categories={allGraphDataResult.companies}
                  >
                    <ChartCategoryAxisTitle text="업체" />
                  </ChartCategoryAxisItem>
                </ChartCategoryAxis>
                <ChartSeries>
                  <ChartSeriesItem
                    labels={{ visible: true }}
                    type="bar"
                    // gap={2}
                    // spacing={0.25}
                    data={allGraphDataResult.series}
                  />
                  {/* <ChartSeriesItem
                      type="bar"
                      data={allGraphDataResult.series}
                    />
                    <ChartSeriesItem type="bar" data={thirdSeries} />
                    <ChartSeriesItem type="bar" data={fourthSeries} /> */}
                </ChartSeries>
              </Chart>
            </GridContainer>

            <GridContainer
              width={clientWidth - gnvWidth - gridMargin - 60 + "px"}
            >
              <Grid
                style={{ height: "280px" }}
                data={process(
                  allGridDataResult.data.map((row) => ({
                    ...row,
                    // person: personListData.find(
                    //   (item: any) => item.code === row.person
                    // )?.name,
                    [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                  })),
                  allGridDataState
                )}
                {...allGridDataState}
                onDataStateChange={onAllGridDataStateChange}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onAllGridSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={allGridDataResult.total}
                onScroll={onAllGridScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onAllGridSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdAllList"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          width={"100%"}
                          cell={
                            numberField.includes(item.fieldName)
                              ? NumberCell
                              : dateField.includes(item.fieldName)
                              ? DateCell
                              : ""
                          }
                          footerCell={
                            item.sortOrder === 1
                              ? allGridTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? allGridSumQtyFooterCell
                              : ""
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="월별">
          <GridContainerWrap flexDirection="column">
            <GridContainer
              width={clientWidth - gnvWidth - gridMargin - 60 + "px"}
            >
              <Grid
                style={{ height: "280px" }}
                data={process(
                  allGridDataResult.data.map((row) => ({
                    ...row,
                    // person: personListData.find(
                    //   (item: any) => item.code === row.person
                    // )?.name,
                    [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                  })),
                  allGridDataState
                )}
                {...allGridDataState}
                onDataStateChange={onAllGridDataStateChange}
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
                total={allGridDataResult.total}
                onScroll={onAllGridScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onAllGridSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdMonthList"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 &&
                      (numberField.includes(item.fieldName) ? (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          // cell={
                          //   numberField.includes(item.fieldName)
                          //     ? NumberCell
                          //     : dateField.includes(item.fieldName)
                          //     ? DateCell
                          //     : ""
                          // }
                          footerCell={
                            item.sortOrder === 1
                              ? allGridTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? allGridSumQtyFooterCell
                              : ""
                          }
                        >
                          <GridColumn
                            title={"수량"}
                            cell={NumberCell}
                            field={item.fieldName}
                          />

                          <GridColumn
                            title={"금액"}
                            cell={NumberCell}
                            field={item.fieldName.replace("qty", "amt")}
                          />
                        </GridColumn>
                      ) : (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          // cell={
                          //   numberField.includes(item.fieldName)
                          //     ? NumberCell
                          //     : dateField.includes(item.fieldName)
                          //     ? DateCell
                          //     : ""
                          // }
                          footerCell={
                            item.sortOrder === 1
                              ? allGridTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? allGridSumQtyFooterCell
                              : ""
                          }
                        />
                      ))
                  )}
              </Grid>
            </GridContainer>
            <GridContainerWrap>
              <GridContainer
                width={clientWidth - gnvWidth - gridMargin - 60 - 600 + "px"}
              >
                <Chart>
                  {/* <ChartTitle text="Units sold" /> */}
                  <ChartCategoryAxis>
                    <ChartCategoryAxisItem
                      categories={monthGraphDataResult.map(
                        (item: any) => item.mm
                      )}
                    ></ChartCategoryAxisItem>
                  </ChartCategoryAxis>
                  <ChartSeries>
                    <ChartSeriesItem
                      labels={{ visible: true }}
                      type="line"
                      data={monthGraphDataResult.map((item: any) => item.qty)}
                    />
                    <ChartSeriesItem
                      labels={{ visible: true }}
                      type="bar"
                      // gap={2}
                      // spacing={0.25}
                      data={monthGraphDataResult.map((item: any) => item.amt)}
                    />
                  </ChartSeries>
                </Chart>
              </GridContainer>
              <GridContainer width="600px">
                <Chart>
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem
                      //autoFit={true}
                      type="pie"
                      data={monthGraphDataResult}
                      field="amt"
                      categoryField="mm"
                      labels={{ visible: true, content: labelContent }}
                    />
                  </ChartSeries>
                </Chart>
              </GridContainer>
            </GridContainerWrap>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="분기별">
          <GridContainerWrap flexDirection="column">
            <GridContainer
              width={clientWidth - gnvWidth - gridMargin - 60 + "px"}
            >
              <Grid
                style={{ height: "280px" }}
                data={process(
                  allGridDataResult.data.map((row) => ({
                    ...row,
                    // person: personListData.find(
                    //   (item: any) => item.code === row.person
                    // )?.name,
                    [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                  })),
                  allGridDataState
                )}
                {...allGridDataState}
                onDataStateChange={onAllGridDataStateChange}
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
                total={allGridDataResult.total}
                onScroll={onAllGridScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onAllGridSortChange}
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
                      (item.fieldName !== "custcd" &&
                      item.fieldName !== "custnm" ? (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          // cell={
                          //   numberField.includes(item.fieldName)
                          //     ? NumberCell
                          //     : dateField.includes(item.fieldName)
                          //     ? DateCell
                          //     : ""
                          // }
                          footerCell={
                            item.sortOrder === 1
                              ? allGridTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? allGridSumQtyFooterCell
                              : ""
                          }
                        >
                          <GridColumn title={"1/4분기"}>
                            <GridColumn
                              title={"수량"}
                              cell={NumberCell}
                              field={item.caption === "전기" ? "q1" : "q11"}
                            />

                            <GridColumn
                              title={"금액"}
                              cell={NumberCell}
                              field={item.caption === "전기" ? "jm1" : "dm1"}
                            />
                          </GridColumn>
                          <GridColumn title={"2/4분기"}>
                            <GridColumn
                              title={"수량"}
                              cell={NumberCell}
                              field={item.caption === "전기" ? "q2" : "q22"}
                            />

                            <GridColumn
                              title={"금액"}
                              cell={NumberCell}
                              field={item.caption === "전기" ? "jm2" : "dm2"}
                            />
                          </GridColumn>
                          <GridColumn title={"3/4분기"}>
                            <GridColumn
                              title={"수량"}
                              cell={NumberCell}
                              field={item.caption === "전기" ? "q3" : "q33"}
                            />

                            <GridColumn
                              title={"금액"}
                              cell={NumberCell}
                              field={item.caption === "전기" ? "jm3" : "dm3"}
                            />
                          </GridColumn>
                          <GridColumn title={"4/4분기"}>
                            <GridColumn
                              title={"수량"}
                              cell={NumberCell}
                              field={item.caption === "전기" ? "q4" : "q44"}
                            />

                            <GridColumn
                              title={"금액"}
                              cell={NumberCell}
                              field={item.caption === "전기" ? "jm4" : "dm4"}
                            />
                          </GridColumn>

                          <GridColumn
                            title={"합계"}
                            cell={NumberCell}
                            field={
                              item.caption === "전기" ? "jtotal" : "dtotal"
                            }
                          />
                        </GridColumn>
                      ) : (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          // cell={
                          //   numberField.includes(item.fieldName)
                          //     ? NumberCell
                          //     : dateField.includes(item.fieldName)
                          //     ? DateCell
                          //     : ""
                          // }
                          footerCell={
                            item.sortOrder === 1
                              ? allGridTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? allGridSumQtyFooterCell
                              : ""
                          }
                        />
                      ))
                  )}
              </Grid>
            </GridContainer>
            <GridContainerWrap>
              <GridContainer
                width={clientWidth - gnvWidth - gridMargin - 60 - 600 + "px"}
              >
                <Chart>
                  {/* <ChartTitle text="Units sold" /> */}
                  <ChartCategoryAxis>
                    <ChartCategoryAxisItem
                      categories={monthGraphDataResult
                        .filter((item: any) => item.series === "당기")
                        .map((item: any) => item.mm)}
                    ></ChartCategoryAxisItem>
                  </ChartCategoryAxis>

                  <ChartLegend position="bottom" orientation="horizontal" />
                  <ChartSeries>
                    <ChartSeriesItem
                      name="당기수량"
                      labels={{ visible: true }}
                      type="line"
                      data={monthGraphDataResult
                        .filter((item: any) => item.series === "당기")
                        .map((item: any) => item.qty)}
                    />
                    <ChartSeriesItem
                      name="전기수량"
                      labels={{ visible: true }}
                      type="line"
                      data={monthGraphDataResult
                        .filter((item: any) => item.series === "전기")
                        .map((item: any) => item.qty)}
                    />
                    <ChartSeriesItem
                      name="당기"
                      labels={{ visible: true }}
                      type="bar"
                      // gap={2}
                      // spacing={0.25}
                      data={monthGraphDataResult
                        .filter((item: any) => item.series === "당기")
                        .map((item: any) => item.amt)}
                    />
                    <ChartSeriesItem
                      name="전기"
                      labels={{ visible: true }}
                      type="bar"
                      // gap={2}
                      // spacing={0.25}"
                      data={monthGraphDataResult
                        .filter((item: any) => item.series === "전기")
                        .map((item: any) => item.amt)}
                    />
                  </ChartSeries>
                </Chart>
              </GridContainer>
              <GridContainer width="600px">
                <Chart>
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem
                      //autoFit={true}
                      type="pie"
                      data={monthGraphDataResult}
                      field="amt"
                      categoryField="mm"
                      labels={{ visible: true, content: labelContent }}
                    />
                  </ChartSeries>
                </Chart>
              </GridContainer>
            </GridContainerWrap>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="5년분석">
          <GridContainerWrap flexDirection="column">
            <GridContainer
              width={clientWidth - gnvWidth - gridMargin - 60 + "px"}
            >
              <Grid
                style={{ height: "280px" }}
                data={process(
                  allGridDataResult.data.map((row) => ({
                    ...row,
                    // person: personListData.find(
                    //   (item: any) => item.code === row.person
                    // )?.name,
                    [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                  })),
                  allGridDataState
                )}
                {...allGridDataState}
                onDataStateChange={onAllGridDataStateChange}
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
                total={allGridDataResult.total}
                onScroll={onAllGridScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onAllGridSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grd5YearList"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 &&
                      (item.fieldName !== "custcd" &&
                      item.fieldName !== "custnm" ? (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          // cell={
                          //   numberField.includes(item.fieldName)
                          //     ? NumberCell
                          //     : dateField.includes(item.fieldName)
                          //     ? DateCell
                          //     : ""
                          // }
                          footerCell={
                            item.sortOrder === 1
                              ? allGridTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? allGridSumQtyFooterCell
                              : ""
                          }
                        >
                          <GridColumn
                            title={"(1-6)분기"}
                            cell={NumberCell}
                            field={
                              "amt" +
                              (item.caption === "2022"
                                ? "01"
                                : item.caption === "2021"
                                ? "21"
                                : item.caption === "2010"
                                ? "31"
                                : item.caption === "2019"
                                ? "41"
                                : item.caption === "2018"
                                ? "51"
                                : "")
                            }
                          />
                          <GridColumn
                            title={"(7-12)분기"}
                            cell={NumberCell}
                            field={
                              "amt" +
                              (item.caption === "2022"
                                ? "02"
                                : item.caption === "2021"
                                ? "22"
                                : item.caption === "2010"
                                ? "32"
                                : item.caption === "2019"
                                ? "42"
                                : item.caption === "2018"
                                ? "52"
                                : "")
                            }
                          />

                          <GridColumn
                            title={"합계"}
                            cell={NumberCell}
                            field={
                              "tamt" + item.caption === "2022"
                                ? "01"
                                : item.caption === "2021"
                                ? "02"
                                : item.caption === "2010"
                                ? "03"
                                : item.caption === "2019"
                                ? "04"
                                : item.caption === "2018"
                                ? "05"
                                : ""
                            }
                          />
                        </GridColumn>
                      ) : (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          // cell={
                          //   numberField.includes(item.fieldName)
                          //     ? NumberCell
                          //     : dateField.includes(item.fieldName)
                          //     ? DateCell
                          //     : ""
                          // }
                          footerCell={
                            item.sortOrder === 1
                              ? allGridTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? allGridSumQtyFooterCell
                              : ""
                          }
                        />
                      ))
                  )}
              </Grid>
            </GridContainer>
            <GridContainerWrap>
              <GridContainer
                width={clientWidth - gnvWidth - gridMargin - 60 - 600 + "px"}
              >
                <Chart>
                  {/* <ChartTitle text="Units sold" /> */}
                  <ChartCategoryAxis>
                    <ChartCategoryAxisItem
                      categories={["2022", "2021", "2020"]}
                    ></ChartCategoryAxisItem>
                  </ChartCategoryAxis>

                  <ChartLegend position="bottom" orientation="horizontal" />
                  <ChartSeries>
                    <ChartSeriesItem
                      name="(1-6)분기"
                      labels={{ visible: true }}
                      type="bar"
                      data={monthGraphDataResult
                        .filter((item: any) => item.series === "(1-6)분기")
                        .map((item: any) => item.amt)}
                    />
                    <ChartSeriesItem
                      name="(7-12)분기"
                      labels={{ visible: true }}
                      type="bar"
                      data={monthGraphDataResult
                        .filter((item: any) => item.series === "(7-12)분기")
                        .map((item: any) => item.amt)}
                    />
                    <ChartSeriesItem
                      name="합계"
                      labels={{ visible: true }}
                      type="bar"
                      // gap={2}
                      // spacing={0.25}
                      data={monthGraphDataResult
                        .filter((item: any) => item.series === "합계")
                        .map((item: any) => item.amt)}
                    />
                  </ChartSeries>
                </Chart>
              </GridContainer>
              <GridContainer width="600px">
                <Chart>
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem
                      //autoFit={true}
                      type="pie"
                      data={monthGraphDataResult}
                      field="amt"
                      categoryField="mm"
                      labels={{ visible: true, content: labelContent }}
                    />
                  </ChartSeries>
                </Chart>
              </GridContainer>
            </GridContainerWrap>
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
      {/* 컨트롤 네임 불러오기 용 */}
      {gridList.map((grid: any) =>
        grid.columns.map((column: any) => (
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

export default SA_B3000W;
