import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_indt",
        field: "indt",
        caption: "입금일자",
        width: 120,
      },
      {
        id: "col_paymentnum",
        field: "paymentnum",
        caption: "지급번호",
        width: 150,
      },
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
        width: 120,
      },
      {
        id: "col_location",
        field: "location",
        caption: "사업장",
        width: 120,
      },
      {
        id: "col_position",
        field: "position",
        caption: "사업부",
        width: 120,
      },
      {
        id: "col_dr_amt",
        field: "dr_amt",
        caption: "차변금액",
        width: 100,
      },
      {
        id: "col_cr_amt",
        field: "cr_amt",
        caption: "대변금액",
        width: 100,
      },
      {
        id: "col_subdrcr",
        field: "subdrcr",
        caption: "차이",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_drcrdiv",
        field: "drcrdiv",
        caption: "차대구분",
        width: 150,
      },
      {
        id: "col_amt_1",
        field: "amt_1",
        caption: "차변금액",
        width: 100,
      },
      {
        id: "col_amt_2",
        field: "amt_2",
        caption: " 대변금액",
        width: 120,
      },
      {
        id: "col_stdmkcd",
        field: "stdmkcd",
        caption: "단축코드",
        width: 120,
      },
      {
        id: "col_acntcd",
        field: "acntcd",
        caption: "계정과목코드",
        width: 120,
      },
      {
        id: "col_stdmknm",
        field: "stdmknm",
        caption: "단축코드명",
        width: 120,
      },
      {
        id: "col_acntnm",
        field: "acntnm",
        caption: "계정과목명",
        width: 120,
      },
      {
        id: "col_custcd2",
        field: "custcd",
        caption: "업체코드",
        width: 120,
      },
      {
        id: "col_custnm2",
        field: "custnm",
        caption: "업체명",
        width: 120,
      },
      {
        id: "col_acntnum",
        field: "acntnum",
        caption: "예적금코드",
        width: 120,
      },
      {
        id: "col_acntsrtnm",
        field: "acntsrtnm",
        caption: "예적금명",
        width: 120,
      },
      {
        id: "col_remark1",
        field: "remark1",
        caption: "적요",
        width: 200,
      },
      {
        id: "col_taxnum",
        field: "taxnum",
        caption: "계산서번호",
        width: 150,
      },
      {
        id: "col_notenum",
        field: "notenum",
        caption: "어음번호",
        width: 150,
      },
      {
        id: "col_enddt",
        field: "enddt",
        caption: "만기일자",
        width: 120,
      },
      {
        id: "col_pubbank",
        field: "pubbank",
        caption: "발행은행명",
        width: 120,
      },
      {
        id: "col_pubdt",
        field: "pubdt",
        caption: "발행일자",
        width: 120,
      },
      {
        id: "col_pubperson",
        field: "pubperson",
        caption: "발행인",
        width: 120,
      },
    ],
  },
];
