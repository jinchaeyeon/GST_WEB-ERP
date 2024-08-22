import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
  ChartValueAxis,
  ChartValueAxisItem
} from "@progress/kendo-react-charts";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import "swiper/css";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import YearCalendar from "../components/Calendars/YearCalendar";
import NumberCell from "../components/Cells/NumberCell";
import {
  convertDateToStr,
  findMessage,
  getDeviceHeight,
  getHeight,
  getMenuName,
  GetPropertyValueByName,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { ICustData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/CM_B1000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
var height = 0;
var height2 = 0;
const MAX_CHARACTERS = 6;

const CM_B1000W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [checked, setChecked] = useState(true);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  const [webheight, setWebHeight] = useState(0);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setWebHeight((getDeviceHeight(true) - height) / 2 - height2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);

  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        yyyy: setDefaultDate(customOptionData, "fyyyyrdt"),
        custdiv: defaultOption.find((item: any) => item.id == "custdiv")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.yyyy).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "CM_B1104W_001");
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

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
  };

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    yyyy: new Date(),
    custcd: "",
    custnm: "",
    custdiv: "",
    pgNum: 1,
    isSearch: false,
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
  const [chartDataResult, setChartDataResult] = useState([]);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    const parameters: Iparameters = {
      procedureName: "P_CM_B1104W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "CUST_MONTH",
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custdiv": filters.custdiv,
      },
    };

    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        let sale = Object.entries(rows[0]).filter(([key, value]) => key.includes("sale") && !key.includes("total")&& !key.includes("tot"));
        let amt = Object.entries(rows[0]).filter(([key, value]) => key.includes("amt") && !key.includes("total")&& !key.includes("tot"))
        console.log(sale)
        //setChartDataResult(rows);
      } else {
        setChartDataResult([]);
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
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

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  useEffect(() => {
    if (filters.isSearch && customOptionData !== null && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
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

  const createColumn = (numbers: any) => {
    const array = [];
    if (numbers == 0) {
      array.push(
        <GridColumn
          field="sale_tot"
          title="판매"
          width="100px"
          cell={NumberCell}
          footerCell={gridSumQtyFooterCell}
        />
      );
      if (checked == true) {
        array.push(
          <GridColumn
            field="amt_tot"
            title="원가"
            width="100px"
            cell={NumberCell}
            footerCell={gridSumQtyFooterCell}
          />
        );
      }
    } else {
      array.push(
        <GridColumn
          field={`sale_${numbers}`}
          title="판매"
          width="100px"
          cell={NumberCell}
          footerCell={gridSumQtyFooterCell}
        />
      );
      if (checked == true) {
        array.push(
          <GridColumn
            field={`amt_${numbers}`}
            title="원가"
            width="100px"
            cell={NumberCell}
            footerCell={gridSumQtyFooterCell}
          />
        );
      }
    }

    return array;
  };

  const InputChange = (e: any) => {
    const { value } = e.target;

    setChecked(value);
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
              <th>기준년도</th>
              <td>
                <DatePicker
                  name="yyyy"
                  value={filters.yyyy}
                  format="yyyy"
                  onChange={filterInputChange}
                  calendar={YearCalendar}
                  placeholder=""
                  className="required"
                />
              </td>
              <th>업체코드</th>
              <td>
                <Input
                  name="custcd"
                  type="text"
                  value={filters.custcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onCustWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>업체명</th>
              <td>
                <Input
                  name="custnm"
                  type="text"
                  value={filters.custnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>업체구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="custdiv"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>
                <Checkbox
                  checked={checked}
                  label="판매조회"
                  onChange={InputChange}
                ></Checkbox>
              </th>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <GridTitleContainer className="ButtonContainer">
          <GridTitle>업체별월별원가</GridTitle>
        </GridTitleContainer>
        <Grid
          style={{ height: webheight }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
            })),
            mainDataState
          )}
          onDataStateChange={onMainDataStateChange}
          {...mainDataState}
          //선택 subDataState
          dataItemKey={DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onSelectionChange}
          //스크롤 조회기능
          fixedScroll={true}
          total={mainDataResult.total}
          skip={page.skip}
          take={page.take}
          pageable={true}
          onPageChange={pageChange}
          //정렬기능
          sortable={true}
          onSortChange={onMainSortChange}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
        >
          <GridColumn
            field="custcd"
            title="업체코드"
            width="120px"
            locked={isMobile ? false : true}
            footerCell={mainTotalFooterCell}
          />
          <GridColumn
            field="custnm"
            title="업체명"
            width="150px"
            locked={isMobile ? false : true}
          />
          <GridColumn title="합계">{createColumn(0)}</GridColumn>
          <GridColumn title="1월">{createColumn(1)}</GridColumn>
          <GridColumn title="2월">{createColumn(2)}</GridColumn>
          <GridColumn title="3월">{createColumn(3)}</GridColumn>
          <GridColumn title="4월">{createColumn(4)}</GridColumn>
          <GridColumn title="5월">{createColumn(5)}</GridColumn>
          <GridColumn title="6월">{createColumn(6)}</GridColumn>
          <GridColumn title="7월">{createColumn(7)}</GridColumn>
          <GridColumn title="8월">{createColumn(8)}</GridColumn>
          <GridColumn title="9월">{createColumn(9)}</GridColumn>
          <GridColumn title="10월">{createColumn(10)}</GridColumn>
          <GridColumn title="11월">{createColumn(11)}</GridColumn>
          <GridColumn title="12월">{createColumn(12)}</GridColumn>
        </Grid>
      </GridContainer>
      <GridContainer>
        <Chart className="Chart">
          {/* <ChartTitle text="Units sold" /> */}
          <ChartValueAxis>
            <ChartValueAxisItem
              labels={{
                visible: true,
                content: (e) => numberWithCommas(e.value) + "",
              }}
            />
          </ChartValueAxis>
          <ChartCategoryAxis>
            <ChartCategoryAxisItem
              categories={[
                ...new Set(chartDataResult.map((item: any) => item.mm)),
              ]}
            ></ChartCategoryAxisItem>
          </ChartCategoryAxis>
          <ChartLegend position="bottom" orientation="horizontal" />
          <ChartSeries>
            <ChartSeriesItem
              name="원가"
              labels={{
                visible: true,
                // content: (e) =>
                //   typeof e.value == "number"
                //     ? numberWithCommas(e.value) + ""
                //     : e.value,
              }}
              type="column"
              data={chartDataResult
                .filter((item: any) => item.series == "원가")
                .map((item: any) => item)}
              field="amt"
              categoryField="mm"
            />
            <ChartSeriesItem
              name="판매"
              labels={{
                visible: true,
                // content: (e) =>
                //   typeof e.value == "number"
                //     ? numberWithCommas(e.value) + ""
                //     : e.value,
              }}
              type="column"
              data={chartDataResult
                .filter((item: any) => item.series == "판매")
                .map((item: any) => item)}
              field="sale"
              categoryField="mm"
            />
          </ChartSeries>
        </Chart>
      </GridContainer>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
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

export default CM_B1000W;
