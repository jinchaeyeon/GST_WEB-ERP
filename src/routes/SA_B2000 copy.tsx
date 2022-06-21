import * as React from "react";
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
} from "@progress/kendo-react-grid";
import { DropDownList } from "@progress/kendo-react-dropdowns";
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
//import { Order } from "./interfaces";

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
import { Input, RadioButton } from "@progress/kendo-react-inputs";

import { useRecoilState, useSetRecoilState } from "recoil";
import { useApi } from "../hooks/api";
//import {useAuth} from "../../hooks/auth";

interface LocaleInterface {
  language: string;
  locale: string;
}

const DATE_FORMAT = "yyyy-mm-dd hh:mm:ss.SSS";
const intl = new IntlService("en");

// orders.forEach((o: Order) => {
//   o.orderDate = intl.parseDate(
//     o.orderDate ? o.orderDate : "20/20/2020",
//     DATE_FORMAT
//   );
//   o.shippedDate = o.shippedDate
//     ? undefined
//     : intl.parseDate(
//         o.shippedDate ? o.orderDate.toString() : "20/20/2020",
//         DATE_FORMAT
//       );
// });

const DetailComponent = (props: GridDetailRowProps) => {
  const dataItem = props.dataItem;
  return (
    <div>
      <section style={{ width: "200px", float: "left" }}>
        <p>
          <strong>Street:</strong> {dataItem.shipAddress.street}
        </p>
        <p>
          <strong>City:</strong> {dataItem.shipAddress.city}
        </p>
        <p>
          <strong>Country:</strong> {dataItem.shipAddress.country}
        </p>
        <p>
          <strong>Postal Code:</strong> {dataItem.shipAddress.postalCode}
        </p>
      </section>
      <Grid style={{ width: "500px" }} data={dataItem.details} />
    </div>
  );
};

const SA_B2000 = () => {
  // const setUserDetail = useSetRecoilState(userDetailState);
  // const processApi = useApi();
  // const fetchData = React.useCallback(async () => {
  //   try {
  //     const userData = await processApi<any>("user");
  //     setUserDetail((data) => {
  //       return { ...data, ...userData };
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }, []);

  // React.useEffect(() => {
  //   fetchData();
  //   //setIsEmailAccount(user.route === "email");
  // }, []);

  const locales: LocaleInterface[] = [
    {
      language: "en-US",
      locale: "en",
    },
  ];
  const [dataState, setDataState] = React.useState<State>({
    skip: 0,
    take: 20,
    sort: [{ field: "customerID", dir: "asc" }],
    //group: [{ field: "customerID" }],
  });
  const [currentLocale] = React.useState<LocaleInterface>(locales[0]);
  const [dataResult, setDataResult] = React.useState<DataResult>(
    process(orders, dataState)
  );

  const [detailDataResult, setDetailDataResult] = React.useState<DataResult>(
    process(orders, dataState)
  );

  const dataStateChange = (event: GridDataStateChangeEvent) => {
    setDataResult(process(orders, event.dataState));
    setDataState(event.dataState);
  };

  const expandChange = (event: GridExpandChangeEvent) => {
    const isExpanded =
      event.dataItem.expanded === undefined
        ? event.dataItem.aggregates
        : event.dataItem.expanded;
    event.dataItem.expanded = !isExpanded;

    console.log("{ ...dataResult }");
    console.log({ ...dataResult });
    setDataResult({ ...dataResult });
  };

  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };
  const addNew = () => {
    const newDataItem = {};
    const totalNum = dataResult.total + 1;
    console.log("dataResult");
    console.log(dataResult);
    console.log({
      data: [newDataItem, ...dataResult.data],
      total: totalNum,
    });

    setDataResult({
      data: [newDataItem, ...dataResult.data],
      total: totalNum,
    });
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

  interface IformData {
    procedureName: string;
    pageNumber: number;
    pageSize: number;
    parameters: {};
  }
  const processApi = useApi();
  const processTEST = React.useCallback(async () => {
    //console.log("processLogin", formData);
    try {
      console.log("sstart");

      console.log(formData);
      const response = await processApi<any>("test", formData);

      console.log("response!!!");
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const formData: IformData = {
    procedureName: "P_TEST_WEB_MA_B7000_Q",
    pageNumber: 2,
    pageSize: 10,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": "01",
      "@p_location": "01",
      "@p_yyyymm": "2022",
      "@p_itemcd": "",
      "@p_itemnm": "",
      "@p_insiz": "",
      "@p_itemacnt": "",
      "@p_zeroyn": "%",
      "@p_lotnum": "",
      "@p_load_place": "",
      "@p_heatno": "",
      "@p_itemlvl1": "",
      "@p_itemlvl2": "",
      "@p_itemlvl3": "",
      "@p_useyn": "Y",
      "@p_service_id": "",
    },
  };
  const getFetch = async () => {
    console.log(JSON.stringify(formData));
    const json = await (
      await fetch("http://125.141.105.80:50555/api/data/procedure", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      })
    ).json();
    console.log("json===>");
    console.log(json.result.data.Rows);
  };
  React.useEffect(() => {
    getFetch();

    //processTEST();
  }, []);

  return (
    <LocalizationProvider language={currentLocale.language}>
      <IntlProvider locale={currentLocale.locale}>
        <TitleContainer>
          <Title>수주처리</Title>

          <ButtonContainer>
            <Button className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary">
              <Icon name="search" />
              조회
            </Button>

            <Button
              title="Export Excel"
              className="k-button k-button-md k-rounded-md k-button-solid"
              //onClick={export}
            >
              <Icon name="download" />
              Excel
            </Button>
          </ButtonContainer>
        </TitleContainer>
        <FilterBoxWrap>
          <FilterBox>
            <tr>
              <th>일자</th>
              <td></td>

              <th>품목</th>
              <td className="item-box">
                <Input id="f_itemcd" type="text" />
                <Input id="f_itemnm" type="text" />
              </td>

              <th>수주상태</th>
              <td>
                <Input id="f_location" type="text" />
              </td>

              <th>사업장</th>
              <td>
                <Input id="f_location" type="text" />
              </td>

              <th>부서</th>
              <td>
                <Input id="f_location" type="text" />
              </td>

              <th>담당자</th>
              <td>
                <Input id="f_location" type="text" />
              </td>
            </tr>

            <tr>
              <th>완료여부</th>
              <td>
                <div className="radio_form_box">
                  <div className="radio_inner">
                    <RadioButton
                      name="f_finyn"
                      value="Y"
                      //checked={state.f_zeroynValue === "Y"}
                      //onChange={this.f_zeroynHandleChange}
                      label="Y"
                    />

                    <RadioButton
                      name="f_finyn"
                      value="N"
                      //   checked={this.state.f_zeroynValue === "N"}
                      //   onChange={this.f_zeroynHandleChange}
                      label="N"
                    />

                    <RadioButton name="f_finyn" value="%" label="전체" />
                  </div>
                </div>
              </td>
              <th>업체</th>
              <td className="item-box">
                <Input id="f_itemcd" type="text" />
                <Input id="f_itemnm" type="text" />
              </td>

              <th>수주형태</th>
              <td>
                <Input id="f_location" type="text" />
              </td>

              <th>내수구분</th>
              <td>
                <Input id="f_lotnum" type="text" />
              </td>

              <th>수주번호</th>
              <td>
                <Input id="f_insiz" type="text" />
              </td>

              <th>PO번호</th>
              <td>
                <Input id="f_load-place" type="text" />
              </td>
            </tr>
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
              <div>
                <button
                  title="신규"
                  className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"
                  onClick={addNew}
                >
                  신규
                </button>
                <button
                  title="Excel"
                  className="k-button k-button-md k-rounded-md k-button-solid"
                  onClick={exportExcel}
                >
                  Excel
                </button>
              </div>
            </GridTitleContainer>
            <Grid
              style={{ height: "370px" }}
              sortable={true}
              //filterable={true}
              groupable={false}
              reorderable={true}
              pageable={{ buttonCount: 4, pageSizes: true }}
              data={dataResult}
              {...dataState}
              onDataStateChange={dataStateChange}
              detail={DetailComponent}
              expandField="expanded"
              onExpandChange={expandChange}
              onItemChange={itemChange}
              editField={editField}
            >
              <GridColumn
                field="orderDate"
                filter="date"
                title="수주일자"
                format="{0:D}"
                width="200px"
              />
              <GridColumn field="customerID" title="납기일자" width="200px" />
              <GridColumn field="customerID" title="수주번호" width="200px" />
              <GridColumn field="shipName" title="업체명" width="280px" />
              <GridColumn
                field="freight"
                title=""
                filter="numeric"
                width="200px"
              />
              <GridColumn
                field="shippedDate"
                title="수주상태"
                filter="date"
                format="{0:D}"
                width="300px"
              />
              <GridColumn
                field="employeeID"
                title=""
                filter="numeric"
                width="200px"
              />
              <GridColumn
                //locked={true}
                field="orderID"
                filterable={false}
                title="ID"
                width="90px"
              />
            </Grid>
          </ExcelExport>
        </GridContainer>

        <GridContainer>
          <ExcelExport
            data={orders}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>상세정보</GridTitle>
              <button
                title="Export to Excel"
                className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"
                onClick={exportExcel}
              >
                Excel
              </button>
            </GridTitleContainer>
            <Grid
              style={{ height: "370px" }}
              sortable={true}
              //filterable={true}
              groupable={false}
              reorderable={true}
              pageable={{ buttonCount: 4, pageSizes: true }}
              data={detailDataResult}
              {...dataState}
              onDataStateChange={dataStateChange}
              detail={DetailComponent}
              expandField="expanded"
              onExpandChange={expandChange}
            >
              <GridColumn field="customerID" width="200px" />
              <GridColumn
                field="orderDate"
                filter="date"
                format="{0:D}"
                width="300px"
              />
              <GridColumn field="shipName" width="280px" />
              <GridColumn field="freight" filter="numeric" width="200px" />
              <GridColumn
                field="shippedDate"
                filter="date"
                format="{0:D}"
                width="300px"
              />
              <GridColumn field="employeeID" filter="numeric" width="200px" />
              <GridColumn
                locked={true}
                field="orderID"
                filterable={false}
                title="ID"
                width="90px"
              />
            </Grid>
          </ExcelExport>
        </GridContainer>
      </IntlProvider>
    </LocalizationProvider>
  );
};

export default SA_B2000;
