import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_taxnum",
        field: "taxnum",
        caption: "계산서번호",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
      {
        id: "col_custregnum",
        field: "custregnum",
        caption: "사업자등록번호",
        width: 150,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "수량",
        width: 100,
      },
      {
        id: "col_splyamt",
        field: "splyamt",
        caption: "공급가액",
        width: 100,
      },
      {
        id: "col_taxamt",
        field: "taxamt",
        caption: "부가세액",
        width: 100,
      },
      {
        id: "col_totamt",
        field: "totamt",
        caption: "합계금액",
        width: 100,
      },
      {
        id: "col_items",
        field: "items",
        caption: "거래품목",
        width: 200,
      },
      {
        id: "col_taxtype",
        field: "taxtype",
        caption: "계산서유형",
        width: 120,
      },
      {
        id: "col_rtxisuyn",
        field: "rtxisuyn",
        caption: "역발행여부",
        width: 120,
      },
      {
        id: "col_etax",
        field: "etax",
        caption: "TAX구분",
        width: 120,
      },
      {
        id: "col_exceptyn",
        field: "exceptyn",
        caption: "구분",
        width: 120,
      },
      {
        id: "col_actkey",
        field: "actkey",
        caption: "전표번호",
        width: 120,
      },
      {
        id: "col_insert_userid",
        field: "insert_userid",
        caption: "등록자",
        width: 120,
      },
      {
        id: "col_update_userid",
        field: "update_userid",
        caption: "수정자",
        width: 120,
      },
      {
        id: "col_update_time",
        field: "update_time",
        caption: "수정일자",
        width: 120,
      },
      {
        id: "col_paymentnum",
        field: "paymentnum",
        caption: "지급번호",
        width: 120,
      },
      {
        id: "col_paydt",
        field: "paydt",
        caption: "지급예정일",
        width: 120,
      },
      {
        id: "col_payactkey",
        field: "payactkey",
        caption: "지급전표번호",
        width: 120,
      },
      {
        id: "col_actdt",
        field: "actdt",
        caption: "전표일자",
        width: 120,
      },
    ],
  },
];
