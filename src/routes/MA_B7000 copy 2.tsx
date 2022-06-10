import React, { useCallback, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDetailRow,
  GridToolbar,
  GridDetailRowProps,
  GridDataStateChangeEvent,
  GridExpandChangeEvent,
  GridItemChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import {
  DropDownList,
  DropDownListChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  IntlProvider,
  load,
  LocalizationProvider,
  loadMessages,
  IntlService,
} from "@progress/kendo-react-intl";
import { Icon, getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import orders from "./orders.json";
import { Order, CategoryDto } from "./interfaces";

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
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import {
  Input,
  RadioButton,
  RadioButtonChangeEvent,
} from "@progress/kendo-react-inputs";

import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useApi } from "../hooks/api";
import ItemacntDDL from "../components/DropDownLists/ItemacntDDL";
import {
  itemacntState,
  itemlvl1State,
  itemlvl2State,
  itemlvl3State,
  locationState,
} from "../store/atoms";
import Itemlvl1DDL from "../components/DropDownLists/Itemlvl1DDL";
import Itemlvl2DDL from "../components/DropDownLists/Itemlvl2DDL";
import Itemlvl3DDL from "../components/DropDownLists/Itemlvl3DDL";
import LocationDDL from "../components/DropDownLists/LocationDDL";
//import {useAuth} from "../../hooks/auth";

const MA_B70002: React.FC = () => {
  const DATA_ITEM_KEY = "itemcd";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [dataState, setDataState] = React.useState<State>({
    skip: 0,
    take: 20,
    //sort: [{ field: "customerID", dir: "asc" }],
    //group: [{ field: "itemacnt" }],
  });
  const [data, setData] = React.useState<DataResult[]>(
    [].map((dataItem: DataResult) =>
      Object.assign({ selected: false }, dataItem)
    )
  );
  const [dataResult, setDataResult] = React.useState<DataResult>(
    process(data, dataState)
  );

  const [selectedState, setSelectedState] = React.useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailDataResult, setDetailDataResult] = React.useState<DataResult>(
    process([], dataState)
  );

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgNum: 1,
    pgSize: 10,
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

  const itemacntVal = useRecoilValue(itemacntState);
  const itemlvl1Val = useRecoilValue(itemlvl1State);
  const itemlvl2Val = useRecoilValue(itemlvl2State);
  const itemlvl3Val = useRecoilValue(itemlvl3State);
  const locationVal = useRecoilValue(locationState);

  //조회조건 Input Change 함수
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  //조회조건 Radio button Change 함수
  const filterRadioChange = (e: RadioButtonChangeEvent) => {
    const name = e.syntheticEvent.currentTarget.name;
    const value = e.value;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  //조회조건 DropDownList Change 함수
  const filterDropDownListChange = (e: DropDownListChangeEvent) => {
    const { value, name } = e.target;

    if (name) {
      setFilters({
        ...filters,
        [name]: value,
      });
    }
  };

  const dataStateChange = (event: GridDataStateChangeEvent) => {
    setDataResult(process(orders, event.dataState));
    setDataState(event.dataState);
  };

  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const editField: string = "inEdit";

  const itemChange = (event: GridItemChangeEvent) => {
    const newData = dataResult.data.map((item) =>
      item.ProductID === event.dataItem.ProductID
        ? { ...item, [event.field || ""]: event.value }
        : item
    );

    setDataResult({ data: newData, total: newData.length });
  };

  const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (1 + date.getMonth())).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    return year + month + day;
  };

  const convertDateToStr = (date: Date) => {
    const year = date.getFullYear();
    const month = ("0" + (1 + date.getMonth())).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    return year + month + day;
  };

  interface IformData {
    procedureName: string;
    pageNumber: number;
    pageSize: number;
    parameters: {};
  }

  const formData: IformData = {
    procedureName: "P_TEST_WEB_MA_B7000_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": locationVal.sub_code,
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

  const fetchMainGrid = async () => {
    let data: any; // :CategoryDto[] = []
    console.log(formData);
    console.log("formData");
    try {
      data = await processApi<any>("procedure", formData);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowsCnt = data.result.totalRowCount;
      const rows = data.result.data.Rows;

      setDataResult({ data: rows, total: totalRowsCnt });
    }
  };

  // const fetchItemacnt = useCallback(async () => {
  //   let data: any;
  //   let queryStr =
  //     "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA061' AND system_yn = 'Y'";

  //   let query = {
  //     query: "query?query=" + queryStr,
  //   };

  //   try {
  //     data = await processApi<any>("query", query);
  //   } catch (error) {
  //     data = null;
  //   }

  //   if (data != null) {
  //     const rows = data.result.data.Rows;
  //     setItemacnts(rows);
  //   }
  // }, []);

  React.useEffect(() => {
    fetchMainGrid();
    //  fetchItemacnt();
  }, []);

  // const onSelectionChange = (event: GridSelectionChangeEvent) => {
  //   const selectedState = getSelectedState({
  //     event,
  //     selectedState: this.state.selectedState,
  //     dataItemKey: DATA_ITEM_KEY,
  //   });

  //   this.setState({ selectedState });

  //   this.setState({
  //     lotData: products.map((dataItem: Product) =>
  //       Object.assign({ selected: true }, dataItem)
  //     ),
  //   });
  //   console.log(Object.keys(this.state.selectedState));
  // };

  const scrollHandler = (event: GridEvent) => {
    const e = event.nativeEvent;
    if (
      e.target.scrollTop + 10 >=
      e.target.scrollHeight - e.target.clientHeight
    ) {
      alert(1);
      // const moreData = availableProducts.splice(0, 10);
      // if (moreData.length > 0) {
      //   alert(2);
      //   setGridData((oldData) => oldData.concat(moreData));
      // }
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>재고조회</Title>

        <ButtonContainer>
          <Button
            onClick={fetchMainGrid}
            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"
          >
            <Icon name="search" />
            조회
          </Button>

          <Button
            title="Export Excel"
            className="k-button k-button-md k-rounded-md k-button-solid"
            onClick={exportExcel}
          >
            <Icon name="download" />
            Excel
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterBoxWrap>
        <FilterBox>
          <tbody>
            <tr>
              <th>재고년도</th>
              <td>
                <DatePicker
                  name="yyyymm"
                  defaultValue={filters.yyyymm}
                  format="yyyy"
                  onChange={filterInputChange}
                  // calendar={CustomCalendar}
                />
              </td>

              <th>품목</th>
              <td colSpan={3} className="item-box">
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
                  onChange={filterInputChange}
                />
              </td>

              <th>품목계정</th>
              <td>
                <ItemacntDDL />
              </td>

              <th>대분류</th>
              <td>
                <Itemlvl1DDL />
              </td>

              <th>중분류</th>
              <td>
                <Itemlvl2DDL />
              </td>

              <th>소분류</th>
              <td>
                <Itemlvl3DDL />
              </td>
            </tr>

            <tr>
              <th>사용여부</th>
              <td>
                <RadioButton
                  name="useyn"
                  value="Y"
                  checked={filters.useyn === "Y"}
                  onChange={filterRadioChange}
                  label="Y"
                />
                <RadioButton
                  name="useyn"
                  value="N"
                  checked={filters.useyn === "N"}
                  onChange={filterRadioChange}
                  label="N"
                />
                <RadioButton
                  name="useyn"
                  value="%"
                  checked={filters.useyn === "%"}
                  onChange={filterRadioChange}
                  label="전체"
                />
              </td>

              <th>재고수량</th>
              <td colSpan={3}>
                <div className="radio_form_box">
                  <div className="radio_inner">
                    <RadioButton
                      name="zeroyn"
                      value="Y"
                      checked={filters.zeroyn === "Y"}
                      onChange={filterRadioChange}
                      label="0만"
                    />

                    <RadioButton
                      name="zeroyn"
                      value="N"
                      checked={filters.zeroyn === "N"}
                      onChange={filterRadioChange}
                      label="0 제외"
                    />

                    <RadioButton
                      name="zeroyn"
                      value="B"
                      checked={filters.zeroyn === "B"}
                      onChange={filterRadioChange}
                      label="안전재고 미만"
                    />

                    <RadioButton
                      name="zeroyn"
                      value="%"
                      checked={filters.zeroyn === "%"}
                      onChange={filterRadioChange}
                      label="전체"
                    />
                  </div>
                </div>
              </td>
              <th>사업장</th>
              <td>
                <LocationDDL />
              </td>

              <th>LOT NO</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
              </td>

              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>

              <th>적재장소</th>
              <td>
                <Input
                  name="load_place"
                  type="text"
                  value={filters.load_place}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>

      <GridContainer>
        <ExcelExport
          data={orders}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <GridTitleContainer>
            <GridTitle>요약정보</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "370px" }}
            sortable={true}
            //filterable={true}
            groupable={false}
            reorderable={true}
            //data={dataResult}
            data={data.map((item) => ({
              ...item,
              [SELECTED_FIELD]: selectedState[idGetter(item)],
            }))}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            //onSelectionChange={onSelectionChange}
            onDataStateChange={dataStateChange}
            onItemChange={itemChange}
            editField={editField}
            {...dataState}
          >
            <GridColumn field="itemcd" title="품목코드" />
            <GridColumn field="itemnm" title="품목명" />
            <GridColumn field="itemlvl1" title="대분류" />
            <GridColumn field="itemlvl2" title="중분류" />
            <GridColumn field="itemlvl3" title="소분류" />
            <GridColumn field="insiz" title="규격" />
            <GridColumn field="spec" title="사양" />
            <GridColumn field="bnatur_insiz" title="소재규격" />
            <GridColumn field="safeqty" title="안전재고량" />
            <GridColumn field="stockqty" title="재고수량" />
            <GridColumn field="stockwgt" title="재고중량" />
            <GridColumn field="load_place_bc" title="적재장소" />
          </Grid>
        </ExcelExport>
      </GridContainer>
      <GridContainerWrap>
        <GridContainer>
          <GridTitleContainer>
            <GridTitle>계정별LOT</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "370px" }}
            sortable={true}
            groupable={false}
            reorderable={true}
            data={detailDataResult}
            {...dataState}
            onDataStateChange={dataStateChange}
          >
            <GridColumn field="shipName" title="LOT NO" />
            <GridColumn field="freight" title="재고수량" />
          </Grid>
        </GridContainer>
        <GridContainer>
          <GridTitleContainer>
            <GridTitle>LOT별 상세이력</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "370px" }}
            sortable={true}
            reorderable={true}
            data={detailDataResult}
            {...dataState}
            onDataStateChange={dataStateChange}
          >
            <GridColumn field="ProductName" title="구분" />
            <GridColumn field="ProductName" title="발생일자" />
            <GridColumn field="UnitsInStock" title="기초재고수량" />
            <GridColumn field="UnitsInStock" title="입고수량" />
            <GridColumn field="UnitsInStock" title="출고수량" />
            <GridColumn field="UnitsInStock" title="입고중량" />
            <GridColumn field="ProductName" title="업체명" />
            <GridColumn field="ProductName" title="관리번호" />
            <GridColumn field="ProductName" title="비고" />
          </Grid>
        </GridContainer>
      </GridContainerWrap>
    </>
  );
};

export default MA_B70002;
