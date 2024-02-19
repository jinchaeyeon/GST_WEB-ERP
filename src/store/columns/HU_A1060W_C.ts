import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_datnum",
        field: "datnum",
        caption: "문서번호",
        width: 120,
      },
      {
        id: "col_pubdt",
        field: "pubdt",
        caption: "발행일자",
        width: 120,
      },
      {
        id: "col_prsnnum",
        field: "prsnnum",
        caption: "사번",
        width: 120,
      },
      {
        id: "col_prsnnm",
        field: "prsnnm",
        caption: "성명",
        width: 120,
      },
      {
        id: "col_kind",
        field: "kind",
        caption: "종류",
        width: 120,
      },
      {
        id: "col_postcd",
        field: "postcd",
        caption: "직위",
        width: 120,
      },
      {
        id: "col_dptcd",
        field: "dptcd",
        caption: "부서코드",
        width: 120,
      },
      {
        id: "col_usekind",
        field: "usekind",
        caption: "용도",
        width: 120,
      },
    ],
  },
];
