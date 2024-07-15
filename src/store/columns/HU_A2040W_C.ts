import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_dutydt",
        field: "dutydt",
        caption: "근태일자",
        width: 120,
      },
      {
        id: "col_prsnnum",
        field: "prsnnum",
        caption: "사번",
        width: 80,
      },
      {
        id: "col_prsnnm",
        field: "prsnnm",
        caption: "성명",
        width: 120,
      },
      {
        id: "col_dptcd",
        field: "dptcd",
        caption: "부서",
        width: 80,
      },
      {
        id: "col_postcd",
        field: "postcd",
        caption: "직위",
        width: 80,
      },
      {
        id: "col_starttime",
        field: "starttime",
        caption: "시작일자",
        width: 80,
      },
      {
        id: "col_endtime",
        field: "endtime",
        caption: "종료일자",
        width: 80,
      },
      {
        id: "col_stime",
        field: "stime",
        caption: "시작시간",
        width: 80,
      },
      {
        id: "col_etime",
        field: "etime",
        caption: "종료시간",
        width: 80,
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