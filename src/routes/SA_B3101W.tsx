import React, { useEffect, useState } from "react";
import { gridList } from "../store/columns/SA_B3101W_C";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import TopButtons from "../components/Buttons/TopButtons";
import { DataResult, State, process } from "@progress/kendo-data-query";
import {
  CLIENT_WIDTH,
  GNV_WIDTH,
  GRID_MARGIN,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import {
  UseBizComponent,
  UseCustomOption,
  UseDesignInfo,
  UseMessages,
  UsePermissions,
  chkScrollHandler,
  convertDateToStr,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import YearCalendar from "../components/Calendars/YearCalendar";
import CommonRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartSeries,
  ChartSeriesItem,
  ChartValueAxis,
  ChartValueAxisItem,
} from "@progress/kendo-react-charts";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridFooterCellProps,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
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
import { ScrollDirection } from "@progress/kendo-react-dateinputs/dist/npm/virtualization/Virtualization";

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
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  // //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        yyyy: setDefaultDate(customOptionData, "yyyy"),
        //   itemacnt: defaultOption.find((item: any) => item.id === "itemacnt")
        //   .valueCode,
        //   rdoAmtdiv: defaultOption.find((item: any) => item.id === "rdoAmtdiv")
        //   .valueCode,
      }));
    }
  }, [customOptionData]);

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
  //스크롤 핸들러
  const onGridScrollHandler = (event: GridEvent) => {
    if (filters.isSearch) return false;
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

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
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
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

  //업체마스터 팝업
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  return (
    <>
      <TitleContainer>
        <Title>매입매출현황</Title>
        <ButtonContainer></ButtonContainer>
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
                {/* {customOptionData !== null && (
                                <CommonRadioGroup
                                    name="radAmtdiv"
                                    customOptionData={customOptionData}
                                    changeData={filterRadioChange}
                                />
                            )} */}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridTitleContainer>
      <GridTitle>차트</GridTitle>
      </GridTitleContainer>
      <Chart></Chart>
      <GridContainer>
        <GridTitleContainer>
          <GridTitle>차트</GridTitle>
        </GridTitleContainer>
        <Grid
          style={{ height: "32vh" }}
          data={process(
            gridDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: selectedState[idGetter(row)],
            })),
            gridDataState
          )}
          {...gridDataState}
          onDataStateChange={onGridDataStateChange}
          //스크롤 조회 기증
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
          {/* {customOptionData !== null && 
                        customOptionData.menuCustomColumnOptions["gridList"].map(
                            (item: any, idx: number) =>
                                item.sortOrder !== -1 &&
                                (numberField.includes(item.fieldName) ? (
                                    <GridColumn
                                        key={idx}
                                        field={item.fieldName}
                                        title={item.caption}
                                        footerCell={
                                            item.sortOrder === 0
                                            ? gridTotalFooterCell
                                            : undefined
                                        }
                                    >

                                    </GridColumn>
                                    ) : (
                                        <GridColumn
                                            key={idx}
                                            field={item.fieldName}
                                            title={item.caption}
                                            footerCell={
                                                item.sortOrder === 0
                                                ? gridTotalFooterCell
                                                : numberField.includes(item.fieldName)
                                                ? gridSumQtyFooterCell
                                                : undefined
                                            }
                                        />
                                    )
                                )                                
                        )
                    } */}
        </Grid>
      </GridContainer>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
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

export default SA_B3101W;
