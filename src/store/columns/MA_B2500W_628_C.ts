import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_outdt",
        field: "outdt",
        caption: "매입일자",
        width: 120,
      },
      {
        id: "col_itemcd",
        field: "itemcd",
        caption: "품목코드",
        width: 150,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 150,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "수량",
        width: 75,
      },
      {
        id: "col_qtyunit",
        field: "qtyunit",
        caption: "단위",
        width: 75,
      },
      {
        id: "col_hsqty",
        field: "hsqty",
        caption: "환산수량",
        width: 100,
      },
      {
        id: "col_sqtyunit",
        field: "sqtyunit",
        caption: "환산단위",
        width: 100,
      },
      {
        id: "col_unp",
        field: "unp",
        caption: "단가",
        width: 100,
      },
      {
        id: "col_wonamt",
        field: "wonamt",
        caption: "금액",
        width: 100,
      },
      {
        id: "col_taxamt",
        field: "taxamt",
        caption: "세액",
        width: 100,
      },
      {
        id: "col_totamt",
        field: "totamt",
        caption: "합계액",
        width: 100,
      },
      {
        id: "col_rcvcustnm",
        field: "rcvcustnm",
        caption: "납품처",
        width: 150,
      },
      {
        id: "col_bnatur_insiz",
        field: "bnatur_insiz",
        caption: "규격",
        width: 75,
      },
      {
        id: "col_spec",
        field: "spec",
        caption: "사이즈",
        width: 150,
      },
      {
        id: "col_itemdiv",
        field: "itemdiv",
        caption: "형태",
        width: 120,
      },
      {
        id: "col_specnum",
        field: "specnum",
        caption: "원산지",
        width: 75,
      },     
    ],
  },
];
