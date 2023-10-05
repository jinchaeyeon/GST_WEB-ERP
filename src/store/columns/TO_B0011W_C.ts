import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_itemcd",
        field: "itemcd",
        caption: "목형관리코드",
        width: 150,
      },
      {
        id: "col_model",
        field: "model",
        caption: "목형코드",
        width: 150,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "목형명",
        width: 150,
      },
      {
        id: "col_insiz",
        field: "insiz",
        caption: "규격",
        width: 150,
      },
      {
        id: "col_bnatur",
        field: "bnatur",
        caption: "재질",
        width: 120,
      },
      {
        id: "col_itemlvl1",
        field: "itemlvl1",
        caption: "대분류",
        width: 120,
      },
      {
        id: "col_itemlvl2",
        field: "itemlvl2",
        caption: "중분류",
        width: 120,
      },
      {
        id: "col_itemlvl3",
        field: "itemlvl3",
        caption: "소분류",
        width: 120,
      },
      {
        id: "col_stockqty",
        field: "stockqty",
        caption: "현재고",
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
