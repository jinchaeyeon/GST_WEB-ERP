import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_inoutdiv",
        field: "inoutdiv",
        caption: "구분",
        width: 150,
      },
      {
        id: "col_custcd",
        field: "custcd",
        caption: "업체코드",
        width: 150,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
      {
        id: "col_amtunit",
        field: "amtunit",
        caption: "화폐단위",
        width: 120,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "금액",
        width: 100,
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
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_custcd2",
        field: "custcd",
        caption: "업체코드",
        width: 150,
      },
      {
        id: "col_custnm2",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
      {
        id: "col_baseamt",
        field: "baseamt",
        caption: "기초금액",
        width: 100,
      },
      {
        id: "col_saleamt",
        field: "saleamt",
        caption: "판매금액",
        width: 100,
      },
      {
        id: "col_collectamt",
        field: "collectamt",
        caption: "수금액",
        width: 100,
      },
      {
        id: "col_nowamt",
        field: "nowamt",
        caption: "현재잔액",
        width: 100,
      },
      {
        id: "col_taxamt2",
        field: "taxamt",
        caption: "계산서금액",
        width: 100,
      },
    ],
  },
];
