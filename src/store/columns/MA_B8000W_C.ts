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
        caption: "입고금액",
        width: 100,
      },
      {
        id: "col_colamt5",
        field: "colamt5",
        caption: "순수 지급액",
        width: 100,
      },
      {
        id: "col_colamt6",
        field: "colamt6",
        caption: "대체 지급액",
        width: 100,
      },
      {
        id: "col_balance",
        field: "balance",
        caption: "미지급잔액",
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
        id: "col_amt",
        field: "amt",
        caption: "입고금액",
        width: 100,
      },
      {
        id: "col_payamt",
        field: "payamt",
        caption: "지급금액",
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
