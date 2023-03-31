import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_prsnnum",
        field: "prsnnum",
        caption: "사번",
        width: 150,
      },
      {
        id: "col_prsnnm",
        field: "prsnnm",
        caption: "성명",
        width: 150,
      },
      {
        id: "col_bankcd",
        field: "bankcd",
        caption: "은행코드",
        width: 150,
      },
      {
        id: "col_banknm",
        field: "banknm",
        caption: "은행명",
        width: 150,
      },
      {
        id: "col_bankacnt",
        field: "bankacnt",
        caption: "계좌번호",
        width: 250,
      },
      {
        id: "col_bankacntuser",
        field: "bankacntuser",
        caption: "예금주",
        width: 150,
      },
      {
        id: "col_totpayamt",
        field: "totpayamt",
        caption: "지급총액",
        width: 220,
      },
      {
        id: "col_totded",
        field: "totded",
        caption: "공제총액",
        width: 220,
      },
      {
        id: "col_rlpayamt",
        field: "rlpayamt",
        caption: "실지급액",
        width: 220,
      },
    ]
  },
];
