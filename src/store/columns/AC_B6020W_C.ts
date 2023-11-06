import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_acntdt",
        field: "acntdt",
        caption: "일자",
        width: 120,
      },
      {
        id: "col_remark3",
        field: "remark3",
        caption: "적요",
        width: 200,
      },
      {
        id: "col_depositmoney",
        field: "depositmoney",
        caption: "입금",
        width: 100,
      },
      {
        id: "col_withdrawmoney",
        field: "withdrawmoney",
        caption: "출금",
        width: 100,
      },
      {
        id: "col_balamt",
        field: "balamt",
        caption: "잔액",
        width: 100,
      },
    ],
  },
];
