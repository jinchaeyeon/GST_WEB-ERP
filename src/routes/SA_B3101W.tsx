import React, { useEffect, useState } from "react";
import { gridList } from "../store/columns/SA_B3101W_C";
import { ButtonContainer
    , FilterBox
    , GridContainer
    , Title
    , TitleContainer }
from "../CommonStyled";
import { Iparameters, TPermissions } from "../store/types";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import TopButtons from "../components/Buttons/TopButtons";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { CLIENT_WIDTH, GNV_WIDTH, GRID_MARGIN, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import { UseBizComponent, UseCustomOption, UseDesignInfo, chkScrollHandler, convertDateToStr, handleKeyPressSearch, numberWithCommas, setDefaultDate } from "../components/CommonFunction";
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
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { IItemData } from "../hooks/interfaces";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import { useApi } from "../hooks/api";
import { filter } from "@progress/kendo-data-query/dist/npm/transducers";
import { AnyTxtRecord } from "dns";

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

/* v1.3 */
const SA_B3101W: React.FC = () => {
    const idGetter = getter(DATA_ITEM_KEY);
    const pathname: string = window.location.pathname.replace("/", "");

    //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
    const filterInputChange = (e: any) => {
        const { value, name } = e.target;

        setFilters((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    //조회조건 초기값
    const [filters, setFilters] = useState({
        pgSize: PAGE_SIZE,
        orgdiv: "01",
        location: "",
        yyyy: new Date(),
        radAmtdiv: "A",        
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
    });

    //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
    const filterRadioChange = (e: any) => {
        const { name, value } = e;

        setFilters((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    //커스텀 옵션 조회
    const[customOptionData, setCustomOptionData] = React.useState<any>(null);
    UseCustomOption(pathname, setCustomOptionData);

    // //customOptionData 조회 후 디폴트 값 세팅
    // useEffect(() => {
    //     if (customOptionData !== null) {
    //     const defaultOption = customOptionData.menuCustomDefaultOptions.query;

    //     setFilters((prev) => ({
    //         ...prev,
    //         yyyy: setDefaultDate(customOptionData, "yyyy"),
    //         itemacnt: defaultOption.find((item: any) => item.id === "itemacnt")
    //         .valueCode,
    //         rdoAmtdiv: defaultOption.find((item: any) => item.id === "rdoAmtdiv")
    //         .valueCode,
    //     }));
    //     }
    // }, [customOptionData]);

    const [allChartDataResult, setAllChartDataResult] = useState({
        companies: [""],
        series: [0],
      });
    
    const [gridDataState, setGridDataState] = useState<State>({
        sort: [],
    });

    const [selectedState, setSelectedState] = useState<{
       [id: string]: boolean | number[];
    }>({});
    
    const [gridDataResult, setGridDataResult] = useState<DataResult>(
        process([], gridDataState)
    );

    //그리드 리셋
    const resetGrid = () => {
        setGridDataResult(process([], gridDataState));
        setAllChartDataResult({
        companies: [""],
        series: [0],
        });
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    };

    //그리드 푸터
    const gridTotalFooterCell = (props: GridFooterCellProps) => {
        return (
        <td colSpan={props.colSpan} style={props.style}>
            총 {gridDataResult.total}건
        </td>
        );
    };

    return (
        <>
            <TitleContainer>
                <Title>매입매출현황</Title>
                <ButtonContainer>

                </ButtonContainer>
            </TitleContainer>

            <FilterContainer>
                <FilterBox>
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

            <TitleContainer>
                <Title>차트</Title>
            </TitleContainer>
            <Chart>
            </Chart>
            <GridContainer>
                <Grid
                    style={{height: "32vh"}}
                    data={process(
                        gridDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState[idGetter(row)],
                        })),
                        gridDataState
                    )}
                    {...gridDataState}
                >
                    {/* {customOptionData !== null && 
                        customOptionData.menuCustomColumnOptions["grdList"].map(
                            (item: any, idx: number) =>
                                item.sortOrder !== -1 &&
                                (numberField.includes(item.fieldName))                                
                        )
                    } */}

                </Grid>
            </GridContainer>

        </>
    );
}

export default SA_B3101W;