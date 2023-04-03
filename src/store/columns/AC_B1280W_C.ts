import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_ackey",
        field: "ackey",
        caption: "전표번호",
        width: 200,
      },
      {
        id: "col_acntcd",
        field: "acntcd",
        caption: "계정코드",
        width: 120,
      },
      {
        id: "col_acntnm",
        field: "acntnm",
        caption: "계정코드명",
        width: 200,
      },
      {
        id: "col_stdrmkcd",
        field: "stdrmkcd",
        caption: "단축코드",
        width: 120,
      },
      {
        id: "col_stdrmknm1",
        field: "stdrmknm1",
        caption: "단축코드명",
        width: 200,
      },
      {
        id: "col_dramt",
        field: "dramt",
        caption: "차변금액",
        width: 100,
      },
      {
        id: "col_cramt",
        field: "cramt",
        caption: "대변금액",
        width: 100,
      },
      {
        id: "col_remark3",
        field: "remark3",
        caption: "적요",
        width: 250,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "거래처명",
        width: 200,
      },
      {
        id: "col_custcd",
        field: "custcd",
        caption: "거래처코드",
        width: 150,
      },
    ],
  },
];
