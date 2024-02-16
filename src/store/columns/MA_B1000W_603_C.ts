import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList1",
    columns: [
      {
        id: "col_ordcustnm",
        field: "ordcustnm",
        caption: "의뢰처명",
        width: 150,
      },
      {
        id: "col_testnum",
        field: "testnum",
        caption: "시험번호",
        width: 150,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "시험명",
        width: 200,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "구매요청수량",
        width: 100,
      },
      {
        id: "col_reqdt",
        field: "reqdt",
        caption: "구매요청일",
        width: 120,
      },
      {
        id: "col_inexpdt",
        field: "inexpdt",
        caption: "입고예정일",
        width: 120,
      },
      {
        id: "col_puryn",
        field: "puryn",
        caption: "발주여부",
        width: 100,
      },
      {
        id: "col_inqty",
        field: "inqty",
        caption: "입고수량",
        width: 100,
      },
    ],
  },
];
