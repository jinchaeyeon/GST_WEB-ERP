import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    // 사용자별 연차집계
    gridName: "grdUserAdj",
    columns: [
      {
        id: "col_prsnnum_user",
        field: "prsnnum",
        caption: "사번",
        width: 100,
      },
      {
        id: "col_prsnnm_user",
        field: "prsnnm",
        caption: "성명",
        width: 100,
      },
      {
        id: "col_regorgdt_user",
        field: "regorgdt",
        caption: "입사일",
        width: 120,
      },
      {
        id: "col_rtrdt_user",
        field: "rtrdt",
        caption: "퇴사일",
        width: 120,
      },

      {
        id: "col_totalday_user",
        field: "totalday",
        caption: "발생",
        width: 70,
      },
      {
        id: "col_usedday_user",
        field: "usedday",
        caption: "사용",
        width: 70,
      },
      {
        id: "col_ramainday_user",
        field: "ramainday",
        caption: "잔여",
        width: 70,
      },
    ],
  },
  {
    // 연차상세
    gridName: "grdAdjDetail",
    columns: [
      {
        id: "col_startdate_adj",
        field: "startdate",
        caption: "연차사용일",
        width: 100,
      },
      {
        id: "col_usedday_adj",
        field: "usedday",
        caption: "횟수",
        width: 70,
      },
    ],
  },
];