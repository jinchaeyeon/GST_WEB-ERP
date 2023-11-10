import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
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
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
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
import CenterCell from "../components/Cells/CenterCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
  GetPropertyValueByName,
  numberWithCommas,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/QC_B0040W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartCategoryAxisTitle,
  ChartSeries,
  ChartSeriesItem,
  ChartSeriesItemTooltip,
  ChartTooltip,
  ChartValueAxis,
  ChartValueAxisItem,
} from "@progress/kendo-react-charts";

const AC_B6080W: React.FC = () => {
  const [tabSelected, setTabSelected] = React.useState(0);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        yyyymm: setDefaultDate(customOptionData, "yyyymm"),
        totalamt: defaultOption.find((item: any) => item.id === "totalamt")
          .valueCode,
        taxtype: defaultOption.find((item: any) => item.id === "taxtype")
          .valueCode,
        worktype2: defaultOption.find((item: any) => item.id === "worktype2")
          .valueCode,
        worktype3: defaultOption.find((item: any) => item.id === "worktype3")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
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

    if (name == "worktype2" || name == "worktype3") {
      if (tabSelected == 0) {
        if (value == "A" || value == "C") {
          setFilters((prev) => ({
            ...prev,
            worktype: "SALETOTAL",
            [name]: value,
            isSearch: true,
          }));
        } else {
          setFilters((prev) => ({
            ...prev,
            worktype: "SALEDETAIL",
            [name]: value,
            isSearch: true,
          }));
        }
      } else if (tabSelected == 1) {
        setFilters((prev) => ({
          ...prev,
          worktype: "COLLECT",
          [name]: value,
          isSearch: true,
        }));
      } else if (tabSelected == 2) {
        if (value == "A" || value == "C") {
          setFilters((prev) => ({
            ...prev,
            worktype: "PURCHASETOTAL",
            [name]: value,
            isSearch: true,
          }));
        } else {
          setFilters((prev) => ({
            ...prev,
            worktype: "PURCHASEDETAIL",
            [name]: value,
            isSearch: true,
          }));
        }
      } else if (tabSelected == 3) {
        setFilters((prev) => ({
          ...prev,
          worktype: "PAYMENT",
          [name]: value,
          isSearch: true,
        }));
      }
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const [allChartDataResult, setAllChartDataResult] = useState({
    mm: [""],
    series: [""],
    list: [],
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    worktype: "SALETOTAL",
    worktype2: "A",
    worktype3: "1",
    orgdiv: "01",
    yyyymm: new Date(),
    custcd: "",
    custnm: "",
    inoutdiv: "",
    taxtype: "",
    totalamt: "A",
    companyCode: companyCode,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B6080W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_Type": filters.worktype,
        "@p_orgdiv": "01",
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_taxtype": filters.taxtype,
        "@p_totalamt": filters.totalamt,
        "@p_inoutdiv": filters.inoutdiv,
        "@p_company_code": filters.companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      let mm: any[] = [];
      let series: any[] = [];

      if (rows.length == 0) {
        mm.push("");
        series.push("");
      }
      rows.forEach((row: any) => {
        if (!mm.includes(row.mm)) {
          mm.push(row.mm);
        }
        if (!series.includes(row.series)) {
          series.push(row.series);
        }
      });

      setAllChartDataResult({
        mm: mm,
        series: series,
        list: rows,
      });
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  const search = () => {
    try {
      if (
        convertDateToStr(filters.yyyymm).substring(0, 4) < "1997" ||
        convertDateToStr(filters.yyyymm).substring(6, 8) > "31" ||
        convertDateToStr(filters.yyyymm).substring(6, 8) < "01" ||
        convertDateToStr(filters.yyyymm).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B6080W_001");
      } else {
        // resetAllGrid();
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

  interface ICustData {
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };
  const handleSelectTab = (e: any) => {
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        worktype: "SALETOTAL",
        worktype2: "A",
        isSearch: true,
      }));
    } else if (e.selected == 1) {
      setFilters((prev) => ({
        ...prev,
        worktype: "COLLECT",
        worktype3: "1",
        isSearch: true,
      }));
    } else if (e.selected == 2) {
      setFilters((prev) => ({
        ...prev,
        worktype: "PURCHASETOTAL",
        worktype2: "A",
        isSearch: true,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        worktype: "PAYMENT",
        worktype3: "1",
        isSearch: true,
      }));
    }
    setTabSelected(e.selected);
  };

  const Barchart = () => {
    let array: any[] = [];
    allChartDataResult.series.map((item) => {
      let series2: any[] = [];
      let series: any[] = [];
      for (var i = 0; i < allChartDataResult.mm.length; i++) {
        let valid = true;
        allChartDataResult.list.map((item2: any) => {
          if (allChartDataResult.mm[i] == item2.mm && item == item2.series) {
            series.push(item2.value);
            valid = false;
          }
        });
        if (valid == true) {
          series.push(0);
        }
      }
      series2.push(series);

      array.push(
        <ChartSeriesItem
          labels={{
            visible: true,
            content: (e) =>
              e.value == 0 ? "" : numberWithCommas(e.value) + "",
          }}
          type="column"
          data={series2[0]}
        >
          <ChartSeriesItemTooltip format={item + " : {0}"} />
        </ChartSeriesItem>
      );
    });

    return array;
  };

  const Linechart = () => {
    let array: any[] = [];
    allChartDataResult.series.map((item) => {
      let series2: any[] = [];
      let series: any[] = [];
      for (var i = 0; i < allChartDataResult.mm.length; i++) {
        let valid = true;
        allChartDataResult.list.map((item2: any) => {
          if (allChartDataResult.mm[i] == item2.mm && item == item2.series) {
            series.push(item2.value);
            valid = false;
          }
        });
        if (valid == true) {
          series.push(0);
        }
      }
      series2.push(series);

      array.push(
        <ChartSeriesItem
          labels={{
            visible: true,
            content: (e) =>
              e.value == 0 ? "" : numberWithCommas(e.value) + "",
          }}
          type="line"
          data={series2[0]}
        >
          <ChartSeriesItemTooltip format={item + " : {0}"} />
        </ChartSeriesItem>
      );
    });

    return array;
  };

  return (
    <>
      <TitleContainer>
        <Title>미수금/미지급현황</Title>

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
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="매출TAX미처리">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준년월</th>
                  <td>
                    <DatePicker
                      name="yyyymm"
                      value={filters.yyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </td>
                  <th>단위</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="totalamt"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>계획구분</th>
                  <td colSpan={3}>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="worktype2"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th></th>
                  <td></td>
                </tr>
                <tr>
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
                  <th></th>
                  <td></td>
                  <th></th>
                  <td></td>
                  <th></th>
                  <td></td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer height="30vh">
            <Chart style={{ height: "100%" }}>
              <ChartTooltip format="{0}" />
              <ChartValueAxis>
                <ChartValueAxisItem
                  labels={{
                    visible: true,
                    content: (e) => numberWithCommas(e.value) + "",
                  }}
                />
              </ChartValueAxis>
              <ChartCategoryAxis>
                <ChartCategoryAxisItem categories={allChartDataResult.mm} />
              </ChartCategoryAxis>
              <ChartSeries>
                {filters.worktype2 == "A" || filters.worktype2 == "B"
                  ? Barchart()
                  : Linechart()}
              </ChartSeries>
            </Chart>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="미수금내역">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준년월</th>
                  <td>
                    <DatePicker
                      name="yyyymm"
                      value={filters.yyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </td>
                  <th>단위</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="totalamt"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>계획구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="worktype3"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
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
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
        </TabStripTab>
        <TabStripTab title="매입TAX미처리">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준년월</th>
                  <td>
                    <DatePicker
                      name="yyyymm"
                      value={filters.yyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </td>
                  <th>단위</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="totalamt"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>계획구분</th>
                  <td colSpan={3}>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="worktype2"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th></th>
                  <td></td>
                </tr>
                <tr>
                  <th>증빙유형</th>
                  <td colSpan={3}>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="taxtype"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
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
                  <th></th>
                  <td></td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
        </TabStripTab>
        <TabStripTab title="미지급금내역">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준년월</th>
                  <td>
                    <DatePicker
                      name="yyyymm"
                      value={filters.yyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </td>
                  <th>단위</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="totalamt"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>계획구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="worktype3"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
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
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
        </TabStripTab>
      </TabStrip>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"ROW_ADD"}
          setData={setCustData}
          modal={true}
        />
      )}
    </>
  );
};

export default AC_B6080W;
