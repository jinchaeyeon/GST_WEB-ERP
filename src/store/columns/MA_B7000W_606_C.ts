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
        id: "col_itemlv3",
        field: "itemlv3",
        caption: "소분류",
        width: 120,
      },
      {
        id: "col_insiz",
        field: "insiz",
        caption: "규격",
        width: 120,
      },
      {
        id: "col_stockqty",
        field: "stockqty",
        caption: "재고수량",
        width: 100,
      },
      {
        id: "col_stockwgt",
        field: "stockwgt",
        caption: "재고중량",
        width: 100,
      },
      {
        id: "col_load_place_bc",
        field: "load_place_bc",
        caption: "적재장소",
        width: 120,
      },
      {
        id: "col_itemgrade",
        field: "itemgrade",
        caption: "품목등급",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_lotnum",
        field: "lotnum",
        caption: "LOT NO",
        width: 200,
      },
      {
        id: "col_stockqty2",
        field: "stockqty",
        caption: "재고수량",
        width: 100,
      },
    ],
  },
];
