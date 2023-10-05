import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_taxdt",
        field: "taxdt",
        caption: "계산서일자",
        width: 120,
      },
      {
        id: "col_custcd",
        field: "custcd",
        caption: "업체코드",
        width: 150,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체코드명",
        width: 150,
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
        caption: "세액",
        width: 100,
      },
      {
        id: "col_items",
        field: "items",
        caption: "거래품목",
        width: 150,
      },
      {
        id: "col_taxtype",
        field: "taxtype",
        caption: "계산서유형",
        width: 120,
      },
      {
        id: "col_ackey",
        field: "ackey",
        caption: "회계전표",
        width: 150,
      },
      {
        id: "col_exceptyn",
        field: "exceptyn",
        caption: "예외처리여부",
        width: 100,
      },
      {
        id: "col_prtyn",
        field: "prtyn",
        caption: "출력유무",
        width: 100,
      },
    ],
  },
];
