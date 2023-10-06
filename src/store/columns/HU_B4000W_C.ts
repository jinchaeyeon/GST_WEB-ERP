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
  {
    // 일지상세
    gridName: "grdJournalList",
    columns: [
      {
        id: "col_recdt",
        field: "recdt",
        caption: "등록일자",
        width: 120,
      },
      {
        id: "col_title",
        field: "title",
        caption: "제목",
        width: 150,
      },
      {
        id: "col_contents",
        field: "contents",
        caption: "내용",
        width: 200,
      },
    ],
  },
  {
    // 연차조정
    gridName: "grdAdjList",
    columns: [
      {
        id: "col_yyyy",
        field: "yyyy",
        caption: "기준년도",
        width: 120,
      },
      {
        id: "col_prsnnum",
        field: "prsnnum",
        caption: "사번",
        width: 120,
      },
      {
        id: "col_prsnm",
        field: "prsnm",
        caption: "사원명",
        width: 120,
      },
      {
        id: "col_adjdiv",
        field: "adjdiv",
        caption: "조정구분",
        width: 120,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "연차횟수",
        width: 100,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 200,
      },
      {
        id: "col_recdt_adj",
        field: "recdt",
        caption: "작성일",
        width: 120,
      },
      {
        id: "col_insert_userid",
        field: "insert_userid",
        caption: "등록자",
        width: 120,
      },
    ],
  },
];