import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_acntdate",
        field: "acntdate",
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
        id: "col_cramt",
        field: "cramt",
        caption: "입금",
        width: 100,
      },
      {
        id: "col_dramt",
        field: "dramt",
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
