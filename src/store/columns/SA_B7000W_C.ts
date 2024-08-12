import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_custcd",
        field: "custcd",
        caption: "업체코드",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
      {
        id: "col_iwol",
        field: "iwol",
        caption: "전월잔액",
        width: 100,
      },
      {
        id: "col_wonamt",
        field: "wonamt",
        caption: "출고금액",
        width: 100,
      },
      {
        id: "col_colamt2",
        field: "colamt2",
        caption: "순수 수금액",
        width: 100,
      },
      {
        id: "col_colamt3",
        field: "colamt3",
        caption: "대체 수금액",
        width: 100,
      },
      {
        id: "col_balance",
        field: "balance",
        caption: "외상출고잔액",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_outdt",
        field: "outdt",
        caption: "일자",
        width: 120,
      },
      {
        id: "col_gb",
        field: "gb",
        caption: "구분",
        width: 120,
      },
      {
        id: "col_itemcd",
        field: "itemcd",
        caption: "적요1",
        width: 120,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "적요2",
        width: 150,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "수량",
        width: 100,
      },
      {
        id: "col_unp",
        field: "unp",
        caption: "단가",
        width: 100,
      },
      {
        id: "col_totamt",
        field: "totamt",
        caption: "출고금액",
        width: 100,
      },
      {
        id: "col_colamt",
        field: "colamt",
        caption: "수금금액",
        width: 100,
      },
      {
        id: "col_janamt",
        field: "janamt",
        caption: "잔액",
        width: 100,
      },
      {
        id: "col_insiz",
        field: "insiz",
        caption: "비고",
        width: 200,
      },
    ],
  },
];
