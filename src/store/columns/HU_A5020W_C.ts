import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_payyrmm",
        field: "payyrmm",
        caption: "년월",
        width: 120,
      },
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
        id: "col_dptcd",
        field: "dptcd",
        caption: "부서코드",
        width: 120,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "퇴직연금금액",
        width: 100,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 200,
      },
      {
        id: "col_files",
        field: "files",
        caption: "첨부파일",
        width: 150,
      },
    ]
  },
];
