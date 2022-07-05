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
import DoexdivDDL from "../components/DropDownLists/DoexdivDDL";
// ES2015 module syntax
import {
  Scheduler,
  AgendaView,
  TimelineView,
  DayView,
  WeekView,
  MonthView,
} from "@progress/kendo-react-scheduler";
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
  ApprovalInner,
  ApprovalBox,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import {
  Input,
  RadioButton,
  RadioButtonChangeEvent,
  RadioGroup,
  RadioGroupChangeEvent,
} from "@progress/kendo-react-inputs";

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
import YearCalendar from "../components/YearCalendar";
import {
  chkScrollHandler,
  convertDateToStr,
  pageSize,
  UseCommonQuery,
} from "../components/CommonFunction";
import ItemsWindow from "../components/Windows/ItemsWindow";
import { IItemData } from "../hooks/interfaces";
import {
  commonCodeDefaultValue,
  itemgradeQuery,
  itemlvl1Query,
  itemlvl2Query,
  itemlvl3Query,
  useynRadioButtonData,
  zeroynRadioButtonData,
} from "../components/CommonString";
import NumberCell from "../components/Cells/NumberCell";
import DateCell from "../components/Cells/DateCell";
//import {useAuth} from "../../hooks/auth";

const Main: React.FC = () => {
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

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

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

  const [mainPgNum, setMainPgNum] = useState(1);
  const [detail1PgNum, setDetail1PgNum] = useState(1);
  const [detail2PgNum, setDetail2PgNum] = useState(1);

  const itemacntVal = useRecoilValue(itemacntState);
  const itemlvl1Val = useRecoilValue(itemlvl1State);
  const itemlvl2Val = useRecoilValue(itemlvl2State);
  const itemlvl3Val = useRecoilValue(itemlvl3State);
  const [locationVal, setLocationVal] = useRecoilState(locationState);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: RadioGroupChangeEvent) => {
    const name = e.syntheticEvent.currentTarget.name;
    const value = e.value;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: pageSize,
    work_type: "LIST",
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

  const [detailFilters1, setDetailFilters1] = useState({
    pgSize: pageSize,
    work_type: "DETAIL1",
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
    procedureName: "P_TEST_WEB_MA_B7000_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": locationVal.sub_code ? locationVal.sub_code : "01",
      "@p_yyyymm": convertDateToStr(filters.yyyymm),
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_itemacnt": itemacntVal.sub_code,
      "@p_zeroyn": filters.zeroyn,
      "@p_lotnum": filters.lotnum,
      "@p_load_place": filters.load_place,
      "@p_heatno": filters.heatno,
      "@p_itemlvl1": itemlvl1Val.sub_code,
      "@p_itemlvl2": itemlvl2Val.sub_code,
      "@p_itemlvl3": itemlvl3Val.sub_code,
      "@p_useyn": filters.useyn,
      "@p_service_id": filters.service_id,
    },
  };

  const detailParameters: Iparameters = {
    procedureName: "P_TEST_WEB_MA_B7000_Q",
    pageNumber: detail1PgNum,
    pageSize: detailFilters1.pgSize,
    parameters: {
      "@p_work_type": "DETAIL1",
      "@p_orgdiv": detailFilters1.orgdiv,
      "@p_location": locationVal.sub_code,
      "@p_yyyymm": convertDateToStr(detailFilters1.yyyymm),
      "@p_itemcd": detailFilters1.itemcd,
      "@p_itemnm": detailFilters1.itemnm,
      "@p_insiz": detailFilters1.insiz,
      "@p_itemacnt": detailFilters1.itemacnt,
      "@p_zeroyn": detailFilters1.zeroyn,
      "@p_lotnum": detailFilters1.lotnum,
      "@p_load_place": detailFilters1.load_place,
      "@p_heatno": detailFilters1.heatno,
      "@p_itemlvl1": itemlvl1Val.sub_code,
      "@p_itemlvl2": itemlvl2Val.sub_code,
      "@p_itemlvl3": itemlvl3Val.sub_code,
      "@p_useyn": detailFilters1.useyn,
      "@p_service_id": detailFilters1.service_id,
    },
  };

  const detail2Parameters: Iparameters = {
    procedureName: "P_TEST_WEB_MA_B7000_Q",
    pageNumber: detail2PgNum,
    pageSize: detailFilters2.pgSize,
    parameters: {
      "@p_work_type": "DETAIL2",
      "@p_orgdiv": detailFilters2.orgdiv,
      "@p_location": locationVal.sub_code,
      "@p_yyyymm": convertDateToStr(detailFilters2.yyyymm),
      "@p_itemcd": detailFilters1.itemcd,
      "@p_itemnm": detailFilters2.itemnm,
      "@p_insiz": "",
      "@p_itemacnt": detailFilters1.itemacnt,
      "@p_zeroyn": "",
      "@p_lotnum": detailFilters2.lotnum,
      "@p_load_place": "",
      "@p_heatno": detailFilters2.heatno,
      "@p_itemlvl1": "",
      "@p_itemlvl2": "",
      "@p_itemlvl3": "",
      "@p_useyn": "",
      "@p_service_id": detailFilters2.service_id,
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

    if (data !== null) {
      const totalRowsCnt = data.result.totalRowCount;
      const rows = data.result.data.Rows;

      setMainDataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowsCnt,
        };
      });
    }
  };

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (mainDataResult.total > 0) {
      const firstRowData = mainDataResult.data[0];
      setSelectedState({ [firstRowData.itemcd]: true });

      setDetailFilters1((prev) => ({
        ...prev,
        itemacnt: firstRowData.itemacnt,
        itemcd: firstRowData.itemcd,
        work_type: "DETAIL1",
      }));
    }
  }, [mainDataResult]);

  //디테일1 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (detail1DataResult.total > 0) {
      const firstRowData = detail1DataResult.data[0];
      setDetailSelectedState({ [firstRowData.lotnum]: true });

      setDetailFilters2((prev) => ({
        ...prev,
        lotnum: firstRowData.lotnum,
        work_type: "DETAIL2",
      }));
    }
  }, [detail1DataResult]);

  const fetchDetailGrid1 = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowsCnt = data.result.totalRowCount;
      const rows = data.result.data.Rows;

      setDetail1DataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowsCnt,
        };
      });
    }
  };

  const fetchDetailGrid2 = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", detail2Parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowsCnt = data.result.totalRowCount;
      const rows = data.result.data.Rows;

      setDetail2DataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowsCnt,
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
    fetchDetailGrid2();
  }, [detail2PgNum]);

  useEffect(() => {
    resetAllDetailGrid();
    fetchDetailGrid1();
  }, [detailFilters1]);

  useEffect(() => {
    resetDetail2Grid();
    fetchDetailGrid2();
  }, [detailFilters2]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setDetail1PgNum(1);
    setDetail2PgNum(1);
    setMainDataResult(process([], mainDataState));
    setDetail1DataResult(process([], detail1DataState));
    setDetail2DataResult(process([], detail2DataState));
  };

  const resetAllDetailGrid = () => {
    setDetail1PgNum(1);
    setDetail2PgNum(1);
    setDetail1DataResult(process([], detail1DataState));
    setDetail2DataResult(process([], detail2DataState));
  };

  const resetDetail2Grid = () => {
    setDetail2PgNum(1);
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
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
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
    setMainDataResult((prev) => {
      const rows = prev.data.map((row: any) => ({
        ...row,
        itemlvl1: itemlvl1ListData.find(
          (item: any) => item.sub_code === row.itemlvl1
        )?.code_name,
      }));

      console.log(rows);

      return {
        data: [...prev.data, ...rows],
        total: prev.total,
      };
    });
  }, [itemlvl1ListData]);

  useEffect(() => {
    setMainDataResult((prev) => {
      const rows = prev.data.map((row: any) => ({
        ...row,
        itemlvl2: itemlvl2ListData.find(
          (item: any) => item.sub_code === row.itemlvl2
        )?.code_name,
      }));

      return {
        data: [...prev.data, ...rows],
        total: prev.total,
      };
    });
  }, [itemlvl2ListData]);

  useEffect(() => {
    setMainDataResult((prev) => {
      const rows = prev.data.map((row: any) => ({
        ...row,
        itemlvl3: itemlvl3ListData.find(
          (item: any) => item.sub_code === row.itemlvl3
        )?.code_name,
      }));

      return {
        data: [...prev.data, ...rows],
        total: prev.total,
      };
    });
  }, [itemlvl3ListData]);

  useEffect(() => {
    setMainDataResult((prev) => {
      const rows = prev.data.map((row: any) => ({
        ...row,
        itemgrade: itemgradeListData.find(
          (item: any) => item.sub_code === row.itemgrade
        )?.code_name,
      }));

      return {
        data: [...prev.data, ...rows],
        total: prev.total,
      };
    });
  }, [itemgradeListData]);

  return (
    <>
      <TitleContainer>
        <GridContainerWrap>
          <ApprovalBox>
            <ApprovalInner>
              <div>미결</div>
              <div>0</div>
            </ApprovalInner>
            <ApprovalInner>
              <div>참조</div>
              <div>0</div>
            </ApprovalInner>
            <ApprovalInner>
              <div>반려</div>
              <div>0</div>
            </ApprovalInner>
          </ApprovalBox>
        </GridContainerWrap>

        <ButtonContainer>
          <Button
            icon={"home"}
            //fillMode="outline"
            themeColor={"primary"}
          >
            HOMEPAGE
          </Button>
          <Button
            icon={"email"}
            //fillMode="outline"
            themeColor={"primary"}
          >
            E-MAIL
          </Button>
        </ButtonContainer>
      </TitleContainer>

      <GridContainerWrap>
        <GridContainer>
          <GridTitleContainer>
            <GridTitle>Work Calendar</GridTitle>
            <div>
              <DoexdivDDL />
            </div>
            {/* <ButtonContainer>
              <Button fillMode="outline">개인일정</Button>
              <Button fillMode="outline">생산계획</Button>
            </ButtonContainer> */}
          </GridTitleContainer>
          <Scheduler
            height={"718px"} /*data={sampleData} defaultDate={displayDate}*/
          >
            <MonthView />
            <DayView />
            <WeekView />
          </Scheduler>
        </GridContainer>
        <GridContainerWrap flexDirection="column" maxWidth="650px">
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>공지사항</GridTitle>
            </GridTitleContainer>
            <Grid
              style={{ height: "339px" }}
              data={process(
                detail1DataResult.data.map((row) => ({
                  ...row,
                  [SELECTED_FIELD]: detailSelectedState[detailIdGetter(row)],
                })),
                detail1DataState
              )}
              {...detail1DataState}
              onDataStateChange={onDetail1DataStateChange}
              //선택기능
              dataItemKey={DETAIL_DATA_ITEM_KEY}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                mode: "single",
              }}
              onSelectionChange={onDetailSelectionChange}
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
                field="lotnum"
                title="작성일"
                footerCell={detail1TotalFooterCell}
              />
              <GridColumn field="stockqty" title="작성자" cell={NumberCell} />
              <GridColumn field="lotnum" title="제목" />
            </Grid>
          </GridContainer>
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>업무지시요청</GridTitle>
            </GridTitleContainer>
            <Grid
              style={{ height: "339px" }}
              data={process(detail2DataResult.data, detail2DataState)}
              {...detail2DataState}
              onDataStateChange={onDetail2DataStateChange}
              //정렬기능
              sortable={true}
              onSortChange={onDetail2SortChange}
              //스크롤 조회 기능
              fixedScroll={true}
              total={detail2DataResult.total}
              onScroll={onDetail2ScrollHandler}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              <GridColumn
                field="gubun"
                title="작성일"
                footerCell={detail2TotalFooterCell}
              />
              <GridColumn field="recnum" title="작성자" />
              <GridColumn field="remark" title="제목" />
            </Grid>
          </GridContainer>
        </GridContainerWrap>
      </GridContainerWrap>
    </>
  );
};

export default Main;
