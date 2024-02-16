import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
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
        id: "col_itemacnt",
        field: "itemacnt",
        caption: "품목계정",
        width: 120,
      },
      {
        id: "col_insiz",
        field: "insiz",
        caption: "규격",
        width: 120,
      },
      {
        id: "col_bnatur",
        field: "bnatur",
        caption: "재질",
        width: 120,
      },
      {
        id: "col_spec",
        field: "spec",
        caption: "사양",
        width: 120,
      },
      {
        id: "col_lotnum",
        field: "lotnum",
        caption: "LOT NO",
        width: 150,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "재고량",
        width: 100,
      },
      {
        id: "col_qtyunit",
        field: "qtyunit",
        caption: "수량단위",
        width: 120,
      },
      {
        id: "col_wgt",
        field: "wgt",
        caption: "중량",
        width: 100,
      },
      {
        id: "col_wgtunit",
        field: "wgtunit",
        caption: "중량단위",
        width: 120,
      },
      {
        id: "col_len",
        field: "len",
        caption: "단위길이",
        width: 100,
      },
      {
        id: "col_lenunit",
        field: "lenunit",
        caption: "길이단위",
        width: 120,
      },
      {
        id: "col_wonamt",
        field: "wonamt",
        caption: "원화금액",
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
        caption: "합계금액",
        width: 100,
      },
      {
        id: "col_load_place",
        field: "load_place",
        caption: "적재장소",
        width: 120,
      },
    ],
  },
];
