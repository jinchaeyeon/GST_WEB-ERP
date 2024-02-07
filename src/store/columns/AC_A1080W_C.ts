import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_closeyn",
        field: "closeyn",
        caption: "승인여부",
        width: 80,
      },
      {
        id: "col_apperson",
        field: "apperson",
        caption: "승인자",
        width: 120,
      },
      {
        id: "col_ackey",
        field: "ackey",
        caption: "전표번호",
        width: 150,
      },
      {
        id: "col_approvaldt",
        field: "approvaldt",
        caption: "승인일자",
        width: 120,
      },
      {
        id: "col_acntcd",
        field: "acntcd",
        caption: "계정과목코드",
        width: 120,
      },
      {
        id: "col_acntnm",
        field: "acntnm",
        caption: "계정과목명",
        width: 120,
      },
      {
        id: "col_slipamt_1",
        field: "slipamt_1",
        caption: "차변금액",
        width: 100,
      },
      {
        id: "col_slipamt_2",
        field: "slipamt_2",
        caption: "대변금액",
        width: 100,
      },
      {
        id: "col_remark3",
        field: "remark3",
        caption: "적요",
        width: 200,
      },
      {
        id: "col_custcd",
        field: "custcd",
        caption: "업체코드",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 120,
      },
      {
        id: "col_inputpath",
        field: "inputpath",
        caption: "경로",
        width: 120,
      },
      {
        id: "col_insert_userid",
        field: "insert_userid",
        caption: "등록자",
        width: 120,
      },
      {
        id: "col_insert_time",
        field: "insert_time",
        caption: "등록일자",
        width: 150,
      },
      {
        id: "col_update_time",
        field: "update_time",
        caption: "수정일자",
        width: 150,
      },
    ],
  },
];
