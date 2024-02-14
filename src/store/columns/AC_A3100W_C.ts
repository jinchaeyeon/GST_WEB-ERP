import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_fxcode",
        field: "fxcode",
        caption: "자산코드",
        width: 120,
      },
      {
        id: "col_fxnum",
        field: "fxnum",
        caption: "자산고유번호",
        width: 120,
      },
      {
        id: "col_fxnm",
        field: "fxnm",
        caption: "자산명",
        width: 150,
      },
      {
        id: "col_fxsize",
        field: "fxsize",
        caption: "자산규격",
        width: 120,
      },
      {
        id: "col_indt",
        field: "indt",
        caption: "취득일자",
        width: 120,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "수량",
        width: 100,
      },
      {
        id: "col_fxdepyrmm",
        field: "fxdepyrmm",
        caption: "내용년수",
        width: 100,
      },
      {
        id: "col_rate",
        field: "rate",
        caption: "상각율",
        width: 100,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
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
