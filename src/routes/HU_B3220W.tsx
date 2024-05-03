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
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
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
import CenterCell from "../components/Cells/CenterCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

const HU_B3220W: React.FC = () => {
  const processApi = useApi();

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
    }));
    setPage2(initialPageState);
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

    setDetailFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_dptcd_001", setBizComponentData);
  //공통코드 리스트 조회 ()
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_dptcd_001"
        )
      );

      fetchQuery(dptcdQueryStr, setdptcdListData);
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

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_B3220W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        baseyt: setDefaultDate(customOptionData, "baseyt"),
      }));
    }
  }, [customOptionData]);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailselectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    baseyt: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailfilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Detail",
    orgdiv: sessionOrgdiv,
    baseyt: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B3220W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_baseyt": convertDateToStr(filters.baseyt).substring(0, 4),
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        setDetailFilters((prev) => ({
          ...prev,
          baseyt: rows[0].payyrmm,
          isSearch: true,
          pgNum: 1,
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
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B3220W_Q",
      pageNumber: detailFilters.pgNum,
      pageSize: detailFilters.pgSize,
      parameters: {
        "@p_work_type": detailFilters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_baseyt": detailFilters.baseyt,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setDetailSelectedState({ [rows[0][DATA_ITEM_KEY2]]: true });
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
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
  }, [filters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailfilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailfilters]);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [detailDataResult]);

  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "기본정보";
      optionsGridOne.sheets[1].title = "상세정보";
      _export.save(optionsGridOne);
    }
  };

  const search = () => {
    resetAllGrid();
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
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

  //그리드 푸터
  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
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

    setDetailFilters((prev) => ({
      ...prev,
      baseyt: selectedRowData.payyrmm,
      isSearch: true,
      pgNum: 1,
    }));
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setDetailSelectedState(newSelectedState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
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
  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    detailDataResult.data.forEach((item) =>
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

  const createColumn = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"medamt"}
        title={"건강고지"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field={"med_amt"}
        title={"건강급여"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field={"med_amt2"}
        title={"건강차액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"hiramt"}
        title={"고용고지"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field={"hir_amt"}
        title={"고용급여"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field={"hir_amt2"}
        title={"고용차액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    return array;
  };

  const createColumn3 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"anuamt"}
        title={"국민고지"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field={"anu_amt"}
        title={"국민급여"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field={"anu_amt2"}
        title={"국민차액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    return array;
  };

  const createColumn4 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"safetyamt"}
        title={"산재고지"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field={"safety_amt"}
        title={"산재급여"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field={"safetyamt2"}
        title={"산재차액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    return array;
  };

  const createColumn5 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"anuamt"}
        title={"국민고지"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"anu_amt"}
        title={"국민급여"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"anu_amt2"}
        title={"국민차액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    return array;
  };

  const createColumn6 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"hiramt"}
        title={"고용고지"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"hir_amt"}
        title={"고용급여"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"hir_amt2"}
        title={"고용차액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    return array;
  };

  const createColumn7 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"medamt"}
        title={"건강고지"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"med_amt"}
        title={"건강급여"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"med_amt2"}
        title={"건강차액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    return array;
  };

  const createColumn8 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"safetyamt"}
        title={"산재고지"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"safety_amt"}
        title={"산재급여"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"safety_amt2"}
        title={"산재차액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    return array;
  };

  return (
    <>
      <TitleContainer>
        <Title>사회보험현황집계표</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_B3220W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>일자</th>
              <td>
                <DatePicker
                  name="baseyt"
                  value={filters.baseyt}
                  format={"yyyy"}
                  onChange={filterInputChange}
                  placeholder=""
                  calendar={YearCalendar}
                />
              </td>
              <th></th>
              <td></td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <GridTitleContainer>
          <GridTitle>기본정보</GridTitle>
        </GridTitleContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="사회보험현황집계표"
        >
          <Grid
            style={{ height: "38vh" }}
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
              field={"payyrmm"}
              title={"기준년월"}
              width="120px"
              cell={CenterCell}
              footerCell={mainTotalFooterCell}
            />
            <GridColumn title="건강보험">{createColumn()}</GridColumn>
            <GridColumn title="고용보혐">{createColumn2()}</GridColumn>
            <GridColumn title="국민연금">{createColumn3()}</GridColumn>
            <GridColumn title="산재보험">{createColumn4()}</GridColumn>
          </Grid>
        </ExcelExport>
      </GridContainer>
      <GridContainer>
        <GridTitleContainer>
          <GridTitle>상세정보</GridTitle>
        </GridTitleContainer>
        <ExcelExport
          data={detailDataResult.data}
          ref={(exporter) => {
            _export2 = exporter;
          }}
          fileName="사회보험현황집계표"
        >
          <Grid
            style={{ height: "38vh" }}
            data={process(
              detailDataResult.data.map((row) => ({
                ...row,
                dptcd: dptcdListData.find(
                  (item: any) => item.dptcd == row.dptcd
                )?.dptnm,
                [SELECTED_FIELD]: detailselectedState[idGetter2(row)],
              })),
              detailDataState
            )}
            {...detailDataState}
            onDataStateChange={onDetailDataStateChange}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY2}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onDetailSelectionChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={detailDataResult.total}
            skip={page2.skip}
            take={page2.take}
            pageable={true}
            onPageChange={pageChange2}
            //원하는 행 위치로 스크롤 기능
            ref={gridRef2}
            rowHeight={30}
            //정렬기능
            sortable={true}
            onSortChange={onDetailSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            <GridColumn
              field={"prsnnm"}
              title={"성명"}
              width="120px"
              footerCell={detailTotalFooterCell}
            />
            <GridColumn
              field={"rtrdt"}
              title={"퇴사일"}
              width="120px"
              cell={DateCell}
            />
            <GridColumn title="국민연금">{createColumn5()}</GridColumn>
            <GridColumn title="고용보혐">{createColumn6()}</GridColumn>
            <GridColumn field={"dptcd"} title={"부서명"} width="120px" />
            <GridColumn
              field={"regorgdt"}
              title={"입사일"}
              width="120px"
              cell={DateCell}
            />
            <GridColumn title="건강보험">{createColumn7()}</GridColumn>
            <GridColumn title="산재보험">{createColumn8()}</GridColumn>
          </Grid>
        </ExcelExport>
      </GridContainer>
    </>
  );
};

export default HU_B3220W;
