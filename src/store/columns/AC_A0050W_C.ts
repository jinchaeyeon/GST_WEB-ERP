import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_acntsrtnum",
        field: "acntsrtnum",
        caption: "예금코드",
        width: 120,
      },
      {
        id: "col_acntsrtnm",
        field: "acntsrtnm",
        caption: "예적금명",
        width: 150,
      },
      {
        id: "col_acntnm",
        field: "acntnm",
        caption: "계정과목명",
        width: 150,
      },
      {
        id: "col_bankacntnum",
        field: "bankacntnum",
        caption: "결제계좌번호",
        width: 150,
      },
      {
        id: "col_banknm",
        field: "banknm",
        caption: "은행명",
        width: 120,
      },
      {
        id: "col_cotracdt",
        field: "cotracdt",
        caption: "계약일자",
        width: 120,
      },
      {
        id: "col_contracamt",
        field: "contracamt",
        caption: "계약금액",
        width: 100,
      },
      {
        id: "col_monsaveamt",
        field: "monsaveamt",
        caption: "월불입액",
        width: 100,
      },
      {
        id: "col_dptcd",
        field: "dptcd",
        caption: "관리부서",
        width: 120,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList2_1",
    columns: [
      {
        id: "col_paydt",
        field: "paydt",
        caption: "불입일자",
        width: 120,
      },
      {
        id: "col_payamt",
        field: "payamt",
        caption: "불입금액",
        width: 100,
      },
      {
        id: "col_intrat",
        field: "intrat",
        caption: "이율",
        width: 100,
      },
      {
        id: "col_remark2",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList2_2",
    columns: [
      {
        id: "col_acntdt",
        field: "acntdt",
        caption: "전표일자",
        width: 120,
      },
      {
        id: "col_acseq1",
        field: "acseq1",
        caption: "전표순번1",
        width: 80,
      },
      {
        id: "col_acseq2",
        field: "acseq2",
        caption: "전표순번2",
        width: 80,
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
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_brwnum",
        field: "brwnum",
        caption: "차입번호",
        width: 120,
      },
      {
        id: "col_brwnm",
        field: "brwnm",
        caption: "차입명",
        width: 150,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "차입처",
        width: 150,
      },
      {
        id: "col_bankacntnum2",
        field: "bankacntnum",
        caption: "계좌번호",
        width: 150,
      },
      {
        id: "col_brwdt",
        field: "brwdt",
        caption: "차입일자",
        width: 120,
      },
      {
        id: "col_enddt",
        field: "enddt",
        caption: "만기일자",
        width: 120,
      },
      {
        id: "col_brwamt",
        field: "brwamt",
        caption: "차입금액",
        width: 100,
      },
      {
        id: "col_brwdesc",
        field: "brwdesc",
        caption: "차입금내역",
        width: 150,
      },
      {
        id: "col_remark4",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList3_1",
    columns: [
      {
        id: "col_paydt2",
        field: "paydt",
        caption: "상환일자",
        width: 120,
      },
      {
        id: "col_payamt2",
        field: "payamt",
        caption: "상환금액",
        width: 100,
      },
      {
        id: "col_intamt",
        field: "intamt",
        caption: "상환이자금액",
        width: 100,
      },
      {
        id: "col_remark5",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList3_2",
    columns: [
      {
        id: "col_acntdt3",
        field: "acntdt",
        caption: "전표일자",
        width: 120,
      },
      {
        id: "col_acseq13",
        field: "acseq1",
        caption: "전표순번1",
        width: 80,
      },
      {
        id: "col_acseq23",
        field: "acseq2",
        caption: "전표순번2",
        width: 80,
      },
      {
        id: "col_dramt3",
        field: "dramt",
        caption: "차변금액",
        width: 100,
      },
      {
        id: "col_cramt3",
        field: "cramt",
        caption: "대변금액",
        width: 100,
      },
      {
        id: "col_remark33",
        field: "remark3",
        caption: "적요",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList4",
    columns: [
      {
        id: "col_notediv",
        field: "notediv",
        caption: "어음구분",
        width: 120,
      },
      {
        id: "col_notenum",
        field: "notenum",
        caption: "어음번호",
        width: 150,
      },
      {
        id: "col_notedec",
        field: "notedec",
        caption: "어음내역",
        width: 150,
      },
      {
        id: "col_custnm4",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
      {
        id: "col_banknm4",
        field: "banknm",
        caption: "지급은행",
        width: 120,
      },
      {
        id: "col_enddt4",
        field: "enddt",
        caption: "만기일자",
        width: 120,
      },
      {
        id: "col_pubdt",
        field: "pubdt",
        caption: "발행일자",
        width: 120,
      },
      {
        id: "col_pubbank",
        field: "pubbank",
        caption: "발행은행명",
        width: 150,
      },
      {
        id: "col_pubamt",
        field: "pubamt",
        caption: "발행금액",
        width: 100,
      },
      {
        id: "col_remark1",
        field: "remark1",
        caption: "비고",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList4_1",
    columns: [
      {
        id: "col_acntdt4_1",
        field: "acntdt",
        caption: "전표일자",
        width: 120,
      },
      {
        id: "col_acseq14_1",
        field: "acseq1",
        caption: "전표순번1",
        width: 80,
      },
      {
        id: "col_acseq24_1",
        field: "acseq2",
        caption: "전표순번2",
        width: 80,
      },
      {
        id: "col_dramt4_1",
        field: "dramt",
        caption: "차변금액",
        width: 100,
      },
      {
        id: "col_cramt4_1",
        field: "cramt",
        caption: "대변금액",
        width: 100,
      },
      {
        id: "col_remark34_1",
        field: "remark3",
        caption: "적요",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList5",
    columns: [
      {
        id: "col_creditcd",
        field: "creditcd",
        caption: "신용카드단축코드",
        width: 120,
      },
      {
        id: "col_creditdiv",
        field: "creditdiv",
        caption: "신용카드구분",
        width: 120,
      },
      {
        id: "col_creditnum",
        field: "creditnum",
        caption: "신용카드번호",
        width: 150,
      },
      {
        id: "col_creditnm",
        field: "creditnm",
        caption: "신용카드명",
        width: 150,
      },
      {
        id: "col_cordiv",
        field: "cordiv",
        caption: "법인개인구분",
        width: 120,
      },
      {
        id: "col_custnm5",
        field: "custnm",
        caption: "결제은행",
        width: 150,
      },
      {
        id: "col_paydt5",
        field: "paydt",
        caption: "결제일자",
        width: 120,
      },
      {
        id: "col_useyn",
        field: "useyn",
        caption: "사용유무",
        width: 100,
      },
      {
        id: "col_remark6",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList5_1",
    columns: [
      {
        id: "col_acntdt5_1",
        field: "acntdt",
        caption: "전표일자",
        width: 120,
      },
      {
        id: "col_acseq15_1",
        field: "acseq1",
        caption: "전표순번1",
        width: 80,
      },
      {
        id: "col_acseq25_1",
        field: "acseq2",
        caption: "전표순번2",
        width: 80,
      },
      {
        id: "col_dramt5_1",
        field: "dramt",
        caption: "차변금액",
        width: 100,
      },
      {
        id: "col_cramt5_1",
        field: "cramt",
        caption: "대변금액",
        width: 100,
      },
      {
        id: "col_remark35_1",
        field: "remark3",
        caption: "적요",
        width: 200,
      },
    ],
  },
];
