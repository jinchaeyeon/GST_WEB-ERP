import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_codnum",
        field: "codnum",
        caption: "관리번호",
        width: 150,
      },
      {
        id: "col_coddt",
        field: "coddt",
        caption: "신고일자",
        width: 120,
      },
      {
        id: "col_importnum",
        field: "importnum",
        caption: "신고번호",
        width: 150,
      },
      {
        id: "col_tottaxamt",
        field: "tottaxamt",
        caption: "초과세액",
        width: 100,
      },
      {
        id: "col_rate",
        field: "rate",
        caption: "환율",
        width: 100,
      },
      {
        id: "col_wonamt",
        field: "wonamt",
        caption: "환산금액",
        width: 100,
      },
      {
        id: "col_annexation",
        field: "annexation",
        caption: "부가가치세과표",
        width: 100,
      },
      {
        id: "col_customs",
        field: "customs",
        caption: "과세",
        width: 100,
      },
      {
        id: "col_taxamt",
        field: "taxamt",
        caption: "과세",
        width: 100,
      },
      {
        id: "col_refundamt",
        field: "refundamt",
        caption: "관세환급금",
        width: 100,
      },
      {
        id: "col_refunddt",
        field: "refunddt",
        caption: "환급일자",
        width: 120,
      },
      {
        id: "col_customscustmn",
        field: "customscustmn",
        caption: "관세사",
        width: 120,
      },
      {
        id: "col_remark3",
        field: "remark3",
        caption: "비고",
        width: 200,
      },
    ],
  },
];
