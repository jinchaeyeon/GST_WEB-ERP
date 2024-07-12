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
];
