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
  ChartValueAxisItem,
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
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import "swiper/css";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import YearCalendar from "../components/Calendars/YearCalendar";
import DateCell from "../components/Cells/DateCell";
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
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { ICustData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/CM_B1000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

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
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".Chart");
      height4 = getHeight(".ButtonContainer2");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setWebHeight((getDeviceHeight(true) - height) / 2 - height2);
        setWebHeight2(height3 - height4);
        setWebHeight3(height3);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);

  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
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
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "요약정보";
      optionsGridOne.sheets[0].title = "상세정보";
      _export.save(optionsGridOne);
    }
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.yyyy).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "CM_B1104W_001");
      } else {
        resetAllGrid();
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
    setPage2(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
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

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    custcd: "",
    custnm: "",
    pgNum: 1,
    isSearch: false,
  });

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [chartDataResult, setChartDataResult] = useState<any[]>([]);
  const [chartDataResult2, setChartDataResult2] = useState<any[]>([]);

  const [contents, setContents] = useState("");

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
        setFilters2((prev) => ({
          ...prev,
          isSearch: true,
          custcd: rows[0].custcd,
          pgNum: 1,
        }));
      } else {
        setChartDataResult([]);
        setChartDataResult2([]);
        setPage2(initialPageState);
        setMainDataResult2(process([], mainDataState2));
        setContents("");
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    const parameters: Iparameters = {
      procedureName: "P_CM_B1104W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_custcd": filters2.custcd,
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

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      const parameters2: Iparameters = {
        procedureName: "P_CM_B1104W_Q",
        pageNumber: filters2.pgNum,
        pageSize: filters2.pgSize,
        parameters: {
          "@p_work_type": "CUST_MONTH",
          "@p_orgdiv": filters.orgdiv,
          "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
          "@p_custcd": filters2.custcd,
          "@p_custnm": filters.custnm,
          "@p_custdiv": filters.custdiv,
        },
      };
      try {
        data = await processApi<any>("procedure", parameters2);
      } catch (error) {
        data = null;
      }
      const totalRowCnt2 = data.tables[0].RowCount;
      const rows2 = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      let sale = Object.entries(rows2[0])
        .filter(
          ([key, value]) =>
            key.includes("sale") &&
            !key.includes("total") &&
            !key.includes("tot")
        )
        .map((item) => ({
          sale: item[1],
          mm: item[0].replace("sale_", "") + "월",
        }));

      let amt = Object.entries(rows2[0])
        .filter(
          ([key, value]) =>
            key.includes("amt") &&
            !key.includes("total") &&
            !key.includes("tot")
        )
        .map((item) => ({
          amt: item[1],
          mm: item[0].replace("amt_", "") + "월",
        }));
      setChartDataResult(sale);
      setChartDataResult2(amt);

      if (totalRowCnt > 0) {
        setContents(rows[0].contents);
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      } else {
        setContents("");
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
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

  useEffect(() => {
    if (filters2.isSearch && customOptionData !== null && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters2((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
      custcd: selectedRowData.custcd,
    }));
  };

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setContents(selectedRowData.contents);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
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

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
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
  const [page2, setPage2] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setPage2(initialPageState);
    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
    }));
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

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2({
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
      <GridContainerWrap>
        <GridContainer width="40%">
          <Chart className="Chart">
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
                }}
                type="column"
                data={chartDataResult2}
                field="amt"
                categoryField="mm"
              />
              {checked == true ? (
                <ChartSeriesItem
                  name="판매"
                  labels={{
                    visible: true,
                  }}
                  type="column"
                  data={chartDataResult}
                  field="sale"
                  categoryField="mm"
                />
              ) : (
                ""
              )}
            </ChartSeries>
          </Chart>
        </GridContainer>
        <GridContainer width={`calc(30% - ${GAP}px)`}>
          <GridTitleContainer className="ButtonContainer2">
            <GridTitle>업무일지상세</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: webheight2 }}
            data={process(
              mainDataResult2.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
              })),
              mainDataState2
            )}
            onDataStateChange={onMainDataStateChange2}
            {...mainDataState2}
            //선택 subDataState
            dataItemKey={DATA_ITEM_KEY2}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSelectionChange2}
            //스크롤 조회기능
            fixedScroll={true}
            total={mainDataResult2.total}
            skip={page2.skip}
            take={page2.take}
            pageable={true}
            onPageChange={pageChange2}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange2}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            <GridColumn
              field="strday"
              title="작성일자"
              width="120px"
              cell={DateCell}
              footerCell={mainTotalFooterCell2}
            />
            <GridColumn field="user_name" title="작성자" width="120px" />
            <GridColumn field="title" title="제목" width="200px" />
            <GridColumn
              field="usetime"
              title="소요시간"
              width="120px"
              footerCell={gridSumQtyFooterCell2}
            />
            <GridColumn
              field="rate"
              title="시간당 임률"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="amt"
              title="투입원가"
              width="100px"
              cell={NumberCell}
              footerCell={gridSumQtyFooterCell2}
            />
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(30% - ${GAP}px)`}>
          <TextArea
            value={contents}
            name="remark"
            style={{ height: webheight3 }}
            className="readonly"
          />
        </GridContainer>
      </GridContainerWrap>
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
