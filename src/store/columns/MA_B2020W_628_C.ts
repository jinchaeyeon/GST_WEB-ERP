import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_dlvdt",
        field: "dlvdt",
        caption: "본사출고일",
        width: 120,
      },
      {
        id: "col_ordsts",
        field: "ordsts",
        caption: "상태",
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
        id: "col_spec",
        field: "spec",
        caption: "사이즈",
        width: 150,
      },
      {
        id: "col_origin",
        field: "origin",
        caption: "원산지",
        width: 150,
      },
      {
        id: "col_bnatur_insiz",
        field: "bnatur_insiz",
        caption: "규격",
        width: 150,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "수량",
        width: 100,
      },
      {
        id: "col_qtyunit",
        field: "qtyunit",
        caption: "단위",
        width: 120,
      },
      {
        id: "col_hsqty",
        field: "hsqty",
        caption: "환산수량",
        width: 100,
      },
      {
        id: "col_hscode",
        field: "hscode",
        caption: "환산단위",
        width: 120,
      },
      {
        id: "col_rcvcustnm",
        field: "rcvcustnm",
        caption: "납품처",
        width: 150,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 200,
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
        id: "col_itemtype",
        field: "itemtype",
        caption: "형태",
        width: 120,
      },
      {
        id: "col_edityn",
        field: "edityn",
        caption: "구분",
        width: 120,
      },
      {
        id: "col_itemacnt",
        field: "itemacnt",
        caption: "품목계정",
        width: 120,
      },
    ],
  },
];
