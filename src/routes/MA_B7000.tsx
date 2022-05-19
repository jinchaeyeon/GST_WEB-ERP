import React, { Component } from "react";
import { render } from "react-dom";

import "@progress/kendo-theme-default/dist/all.css";

import categories from "./categories.json";
import products from "./products.json";
import styles from "./MA_B7000.module.css";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { process, State } from "@progress/kendo-data-query";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  getSelectedStateFromKeyDown,
  GridKeyDownEvent,
  GridRowClickEvent,
  GridCell,
  GridCellProps,
} from "@progress/kendo-react-grid";
import { Label, Hint, Error } from "@progress/kendo-react-labels";
import {
  RadioButton,
  RadioButtonChangeEvent,
  Input,
} from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import {
  DropDownList,
  DropDownListChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { Window, WindowActionsEvent } from "@progress/kendo-react-dialogs";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { CustomCalendar } from "../components/CustomCalendar";
import { Icon, getter } from "@progress/kendo-react-common";

export interface Product {
  ProductID: number;
  ProductName?: string;
  UnitsInStock?: number;
  CategoryID?: number;
}

interface AppProps {}

interface AppState {
  data: Product[];
  lotData: Product[];
  gridDataState: State;
  lotGridDataState: State;
  dropdownlistCategory: string;
  windowVisible: boolean;
  selectedState: {
    [id: string]: boolean | number[];
  };
  gridClickedRow: any;
  f_zeroynValue: string;
  f_useynValue: string;
}

const DATA_ITEM_KEY: string = "ProductID";
const SELECTED_FIELD: string = "selected";
const idGetter = getter(DATA_ITEM_KEY);

class MA_B7000 extends Component<AppProps, AppState> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: products.map((dataItem: Product) =>
        Object.assign({ selected: false }, dataItem)
      ),
      lotData: products.map((dataItem: Product) =>
        Object.assign({ selected: false }, dataItem)
      ),
      dropdownlistCategory: "",
      gridDataState: {
        //sort: [{ field: "ProductName", dir: "asc" }],
        skip: 0,
        take: 10,
        filter: undefined,
      },
      lotGridDataState: {
        //sort: [{ field: "ProductName", dir: "asc" }],
        skip: 0,
        take: 10,
        filter: undefined,
      },
      selectedState: { 1: true },
      windowVisible: false,
      gridClickedRow: null,
      f_zeroynValue: "%",
      f_useynValue: "%",
    };
  }

  _export: ExcelExport | null | undefined;
  export = () => {
    if (this._export !== null && this._export !== undefined) {
      this._export.save();
    }
  };

  handleDropDownChange = (e: DropDownListChangeEvent) => {
    let newDataState = { ...this.state.gridDataState };
    if (e.target.value.CategoryID !== null) {
      newDataState.filter = {
        logic: "and",
        filters: [
          {
            field: "CategoryID",
            operator: "eq",
            value: e.target.value.CategoryID,
          },
        ],
      };
      newDataState.skip = 0;
    } else {
      newDataState.filter = undefined;
      newDataState.skip = 0;
    }
    this.setState({
      dropdownlistCategory: e.target.value.CategoryID,
      gridDataState: newDataState,
    });
  };

  handleGridDataStateChange = (e: GridDataStateChangeEvent) => {
    this.setState({ gridDataState: e.dataState });
  };

  handleLotGridDataStateChange = (e: GridDataStateChangeEvent) => {
    this.setState({ lotGridDataState: e.dataState });
  };

  handleGridRowClick = (e: GridRowClickEvent) => {
    this.setState({
      windowVisible: true,
      gridClickedRow: e.dataItem,
    });
  };

  closeWindow = (e: WindowActionsEvent) => {
    this.setState({
      windowVisible: false,
    });
  };

  onSelectionChange = (event: GridSelectionChangeEvent) => {
    const selectedState = getSelectedState({
      event,
      selectedState: this.state.selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    this.setState({ selectedState });

    this.setState({
      lotData: products.map((dataItem: Product) =>
        Object.assign({ selected: true }, dataItem)
      ),
    });
    console.log(Object.keys(this.state.selectedState));
  };

  onKeyDown = (event: GridKeyDownEvent) => {
    const selectedState = getSelectedStateFromKeyDown({
      event,
      selectedState: this.state.selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    this.setState({ selectedState });
  };

  value = new Date();

  f_zeroynHandleChange = (e: RadioButtonChangeEvent) => {
    this.setState({ f_zeroynValue: e.value });
  };

  f_useynHandleChange = (e: RadioButtonChangeEvent) => {
    this.setState({ f_useynValue: e.value });
  };

  render() {
    return (
      <div>
        <h1 id="programTitle">GST ERP</h1>

        <div className="title-box">
          <h2 id="programTitle">재고조회</h2>
          <div>
            <div className="button-box">
              <Button className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary">
                <Icon name="search" />
                조회
              </Button>

              <Button
                title="Export Excel"
                className="k-button k-button-md k-rounded-md k-button-solid"
                onClick={this.export}
              >
                <Icon name="download" />
                Excel
              </Button>
            </div>
          </div>
        </div>
        <div id="filterBoxWrap" className="">
          <table id="filterBox" className={styles.filterBox}>
            <tr className={styles.filterInner}>
              <th>재고년도</th>
              <td>
                <DatePicker
                  id="f_yyyymm"
                  defaultValue={this.value}
                  format="yyyy"
                  // calendar={CustomCalendar}
                />
              </td>

              <th>품목</th>
              <td colSpan={3} className="item-box">
                <Input id="f_itemcd" type="text" />
                <Input id="f_itemnm" type="text" />
              </td>

              <th>품목계정</th>
              <td>
                <Input id="f_itemacnt" type="text" />
              </td>

              <th>대분류</th>
              <td>
                <DropDownList
                  id="f_itemlvl1"
                  data={categories}
                  dataItemKey="CategoryID"
                  textField="CategoryName"
                  defaultItem={{
                    CategoryID: null,
                    CategoryName: "Product categories",
                  }}
                  onChange={this.handleDropDownChange}
                />
              </td>

              <th>중분류</th>
              <td>
                <DropDownList
                  id="f_itemlvl2"
                  data={categories}
                  dataItemKey="CategoryID"
                  textField="CategoryName"
                  defaultItem={{
                    CategoryID: null,
                    CategoryName: "Product categories",
                  }}
                  onChange={this.handleDropDownChange}
                />
              </td>

              <th>소분류</th>
              <td>
                <DropDownList
                  id="f_itemlvl3"
                  data={categories}
                  dataItemKey="CategoryID"
                  textField="CategoryName"
                  defaultItem={{
                    CategoryID: null,
                    CategoryName: "Product categories",
                  }}
                  onChange={this.handleDropDownChange}
                />
              </td>
            </tr>

            <tr className={styles.filterInner}>
              <th>사용여부</th>
              <td>
                <RadioButton
                  name="f_useyn"
                  value="Y"
                  checked={this.state.f_useynValue === "Y"}
                  onChange={this.f_useynHandleChange}
                  label="Y"
                />
                <RadioButton
                  name="f_useyn"
                  value="N"
                  checked={this.state.f_useynValue === "N"}
                  onChange={this.f_useynHandleChange}
                  label="N"
                />
                <RadioButton
                  name="f_useyn"
                  value="%"
                  checked={this.state.f_useynValue === "%"}
                  onChange={this.f_useynHandleChange}
                  label="전체"
                />
              </td>

              <th>재고수량</th>
              <td colSpan={3}>
                <div className="radio_form_box">
                  <div className="radio_inner">
                    <RadioButton
                      name="f_zeroyn"
                      value="Y"
                      checked={this.state.f_zeroynValue === "Y"}
                      onChange={this.f_zeroynHandleChange}
                      label="0만"
                    />

                    <RadioButton
                      name="f_zeroyn"
                      value="N"
                      checked={this.state.f_zeroynValue === "N"}
                      onChange={this.f_zeroynHandleChange}
                      label="0 제외"
                    />

                    <RadioButton
                      name="f_zeroyn"
                      value="B"
                      checked={this.state.f_zeroynValue === "B"}
                      onChange={this.f_zeroynHandleChange}
                      label="안전재고 미만"
                    />

                    <RadioButton
                      name="f_zeroyn"
                      value="%"
                      checked={this.state.f_zeroynValue === "%"}
                      onChange={this.f_zeroynHandleChange}
                      label="전체"
                    />
                  </div>
                </div>
              </td>

              <th>사업장</th>
              <td>
                <Input id="f_location" type="text" />
              </td>

              <th>LOT NO</th>
              <td>
                <Input id="f_lotnum" type="text" />
              </td>

              <th>규격</th>
              <td>
                <Input id="f_insiz" type="text" />
              </td>

              <th>적재장소</th>
              <td>
                <Input id="f_load-place" type="text" />
              </td>
            </tr>
          </table>
        </div>
        <div className="grid-box">
          <div className="grid-box-inner">
            <div className="grid-title">
              <h3>BOM참조</h3>
            </div>
            <ExcelExport
              data={products}
              ref={(exporter) => (this._export = exporter)}
            >
              <Grid
                data={this.state.data.map((item) => ({
                  ...item,
                  [SELECTED_FIELD]: this.state.selectedState[idGetter(item)],
                }))}
                //data={process(products, this.state.gridDataState)}
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                sortable={true}
                {...this.state.gridDataState}
                onDataStateChange={this.handleGridDataStateChange}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={this.onSelectionChange}
                onKeyDown={this.onKeyDown}
                // onRowClick={this.handleGridRowClick}
                style={{ height: "360px" }}
              >
                <GridColumn field="ProductID" title="품목코드" />
                <GridColumn field="ProductName" title="품목명" />
                <GridColumn field="ProductName" title="대분류" />
                <GridColumn field="ProductName" title="중분류" />
                <GridColumn field="ProductName" title="소분류" />
                <GridColumn field="ProductName" title="규격" />
                <GridColumn field="ProductName" title="사양" />
                <GridColumn field="ProductName" title="소재규격" />
                {/* <GridColumn field="UnitPrice" title="Price" format="{0:c}" /> */}
                <GridColumn field="UnitsInStock" title="안전재고량" />
                <GridColumn field="UnitsInStock" title="재고수량" />
                <GridColumn field="UnitsInStock" title="재고중량" />
                <GridColumn field="ProductName" title="적재장소" />
                {/* <GridColumn field="Discontinued" cell={CheckboxColumn} /> */}
              </Grid>
            </ExcelExport>
          </div>
        </div>
        <div className="grid-box">
          <div className="grid-box-inner">
            <div className="grid-title">
              <h3>계정별LOT</h3>
            </div>
            <Grid
              data={this.state.lotData.map((item) => ({
                ...item,
                [SELECTED_FIELD]: this.state.selectedState[idGetter(item)],
              }))}
              selectedField={SELECTED_FIELD}
              //data={process(products, this.state.lotGridDataState)}
              sortable={true}
              selectable={{
                enabled: true,
                mode: "multiple",
              }}
              {...this.state.lotGridDataState}
              onDataStateChange={this.handleLotGridDataStateChange}
              style={{ height: "260px" }}
            >
              <GridColumn field="ProductName" title="LOT NO" />
              <GridColumn field="UnitsInStock" title="재고수량" />
            </Grid>
          </div>
          <div className="grid-box-inner">
            <div className="grid-title">
              <h3>LOT별 상세이력</h3>
            </div>
            <Grid
              data={process(products, this.state.gridDataState)}
              // pageable={true}
              sortable={true}
              {...this.state.gridDataState}
              onDataStateChange={this.handleGridDataStateChange}
              style={{ height: "260px" }}
              onRowClick={this.handleGridRowClick}
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
          </div>
        </div>
        {this.state.windowVisible && (
          <Window
            title="Product Details"
            onClose={this.closeWindow}
            height={250}
          >
            <dl>
              <dt>Product Name</dt>
              <dd>{this.state.gridClickedRow.ProductName}</dd>
              <dt>Product ID</dt>
              <dd>{this.state.gridClickedRow.ProductID}</dd>
              <dt>Quantity per Unit</dt>
              <dd>{this.state.gridClickedRow.QuantityPerUnit}</dd>
            </dl>
          </Window>
        )}
      </div>
    );
  }
}

// class CheckboxColumn extends GridCell {
//   render() {
//     return (
//       <td>
//         <Input
//           type="checkbox"
//           checked={this.props.dataItem[this.props.field]}
//           disabled={true}
//         />
//       </td>
//     );
//   }
// }

export default MA_B7000;
