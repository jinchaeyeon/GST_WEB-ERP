import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_acntcd",
        field: "acntcd",
        caption: "계정코드",
        width: 150,
      },
      {
        id: "col_acntnm",
        field: "acntnm",
        caption: "계정코드명",
        width: 150,
      },
      {
        id: "col_carriedamt",
        field: "carriedamt",
        caption: "이월금액",
        width: 100,
      },
      {
        id: "col_cramt",
        field: "cramt",
        caption: "차변합계",
        width: 100,
      },
      {
        id: "col_dramt",
        field: "dramt",
        caption: "대변합계",
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
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_actkey",
        field: "actkey",
        caption: "전표번호",
        width: 150,
      },
      {
        id: "col_remark3",
        field: "remark3",
        caption: "적요",
        width: 200,
      },
      {
        id: "col_camt",
        field: "camt",
        caption: "차변합계",
        width: 100,
      },
      {
        id: "col_damt",
        field: "damt",
        caption: "대변합계",
        width: 100,
      },
      {
        id: "col_balamt2",
        field: "balamt",
        caption: "잔액",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_drcrdiv",
        field: "drcrdiv",
        caption: "차대구분",
        width: 150,
      },
      {
        id: "col_acntcd2",
        field: "acntcd",
        caption: "계정코드",
        width: 150,
      },
      {
        id: "col_acntnm2",
        field: "acntnm",
        caption: "계정코드명",
        width: 150,
      },
      {
        id: "col_silpamt_C",
        field: "silpamt_C",
        caption: "차변금액",
        width: 100,
      },
      {
        id: "col_silpamt_D",
        field: "silpamt_D",
        caption: "대변금액",
        width: 100,
      },
      {
        id: "col_remark32",
        field: "remark3",
        caption: "적요",
        width: 200,
      },
    ],
  },
];
