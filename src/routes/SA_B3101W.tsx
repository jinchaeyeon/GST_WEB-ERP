import React, { useEffect, useState } from "react";
import { gridList } from "../store/columns/SA_B3101W_C";
import { ButtonContainer, FilterBox, GridContainer, Title, TitleContainer } from "../CommonStyled";
import { TPermissions } from "../store/types";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import TopButtons from "../components/Buttons/TopButtons";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import { chkScrollHandler, handleKeyPressSearch, numberWithCommas, setDefaultDate } from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import YearCalendar from "../components/Calendars/YearCalendar";
import CommonRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { Chart, ChartCategoryAxis, ChartCategoryAxisItem, ChartSeries, ChartSeriesItem, ChartValueAxis, ChartValueAxisItem } from "@progress/kendo-react-charts";
import { Grid, GridColumn, GridDataStateChangeEvent, GridEvent, GridFooterCellProps, GridSelectionChangeEvent, getSelectedState } from "@progress/kendo-react-grid";
import { Icon, getter } from "@progress/kendo-react-common";
import { Item } from "devextreme-react/gantt";
import NumberCell from "../components/Cells/NumberCell";
import DateCell from "../components/Cells/DateCell";

const DATA_ITEM_KEY = "num";
const numberField: string[] = [
    "inamt1",
    "outamt1",
    "per1",
    "inamt2",
    "outamt2",
    "per2",
    "inamt3",
    "outamt3",
    "per3",
    "inamt4",
    "outamt4",
    "per4",
    "inamt5",
    "outamt5",
    "per5",
    "inamt6",
    "outamt6",
    "per6",
    "inamt7",
    "outamt7",
    "per7",
    "inamt8",
    "outamt8",
    "per8",
    "inamt9",
    "outamt9",
    "per9",
    "inamt10",
    "outamt10",
    "per10",
    "inamt11",
    "outamt11",
    "per11",
    "inamt12",
    "outamt12",
    "per12",
  ];
const dateField = ["recdt", "time"];

/*v1.1*/
const SA_B3101W: React.FC = () => {
    const idGetter = getter(DATA_ITEM_KEY);
    const [permissions] = useState<TPermissions | null>(null);
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
    const [selectedState, setSelectedState] = useState<{
        [id: string]: boolean | number[];
    }>({});

    //커스텀 옵션 조회
    const [customOptionData, setCustomOptionData] = React.useState<any>(null);

    //customOptionData 조회 후 디폴트 값 세팅
    useEffect(() => {
        if (customOptionData !== null) {
        const defaultOption = customOptionData.menuCustomDefaultOptions.query;

        setFilters((prev) => ({
            ...prev,
            yyyy: setDefaultDate(customOptionData, "yyyy"),
            itemacnt: defaultOption.find((item: any) => item.id === "itemacnt")
            .valueCode,
            rdoAmtdiv: defaultOption.find((item: any) => item.id === "rdoAmtdiv")
            .valueCode,
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

    //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
    const filterRadioChange = (e: any) => {
        const { name, value } = e;

        setFilters((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    //그리드 리셋
    const resetGrid = () => {
        setGridDataResult(process([], gridDataState));
        setAllChartDataResult({
        companies: [""],
        series: [0],
        });
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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

    //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
    const onGridSelectionChange = (event: GridSelectionChangeEvent) => {
        const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
        });

        setSelectedState(newSelectedState);
    };

    //스크롤 핸들러
    const onGridScrollHandler = (event: GridEvent) => {
        if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
        let pgNumWithGap =
        filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

        // 스크롤 최하단 이벤트
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
        filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
            // 스크롤 최상단 이벤트
            if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
            setFilters((prev) => ({
                ...prev,
                scrollDirrection: "up",
                pgNum: pgNumWithGap - 1,
                pgGap: prev.pgGap + 1,
                isSearch: true,
            }));
            }
    };

    const onGridSortChange = (e: any) => {
        setGridDataState((prev) => ({ ...prev, sort: e.sort }));
    };

    //엑셀 내보내기
    let _export: ExcelExport | null | undefined;
    const exportExcel = () => {
        if (_export !== null && _export !== undefined) {
        _export.save();
        }
    };

    const search = () => {
        resetGrid();
    };

    //조회조건 초기값
    const [filters, setFilters] = useState({
        pgSize: PAGE_SIZE,
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
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
    });
    
    return(
        <>
        <TitleContainer>
            <Title>매입매출현황</Title>

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
            <FilterBox onKeyPress ={(e) => handleKeyPressSearch(e, search)}>
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

        <TitleContainer>
            <th>차트</th>
        </TitleContainer>

        <Chart>
            <ChartCategoryAxis></ChartCategoryAxis>

        </Chart>
        <GridContainer>
            <Grid style={{ height: "32vh" }}
                    data={process(
                        gridDataResult.data.map((row) => ({
                        ...row,
                        // person: personListData.find(
                        //   (item: any) => item.code === row.person
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
                    onScroll={onGridScrollHandler}
                    //정렬기능
                    sortable={true}
                    onSortChange={onGridSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
            >
                {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList"].map(
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
                                        :dateField.includes(item.fieldName)
                                        ?DateCell
                                        :undefined
                                    }
                                    footerCell={
                                        item.sortOrder === 0
                                            ? gridTotalFooterCell
                                            : numberField.includes(item.fieldName)
                                            ? gridSumQtyFooterCell
                                            : undefined
                                    }
                                />
                            )
                    )}
            </Grid>
        </GridContainer>

        </>
    );
}

export default SA_B3101W;