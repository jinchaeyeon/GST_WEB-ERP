import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_ackey",
        field: "ackey",
        caption: "전표번호",
        width: 120,
      },
      {
        id: "col_acntdt",
        field: "acntdt",
        caption: "전표일자",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 120,
      },
      {
        id: "col_remark3",
        field: "remark3",
        caption: "적요",
        width: 120,
      },
      {
        id: "col_sumslipamt_1",
        field: "sumslipamt_1",
        caption: "차변합계",
        width: 120,
      },
      {
        id: "col_sumslipamt_2",
        field: "sumslipamt_2",
        caption: "대변합계",
        width: 120,
      },
      {
        id: "col_sumslipamt",
        field: "sumslipamt",
        caption: "차이",
        width: 120,
      },
      {
        id: "col_inputpath",
        field: "inputpath",
        caption: "경로",
        width: 100,
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
      {
        id: "col_insert_pc",
        field: "insert_pc",
        caption: "등록PC",
        width: 200,
      },
      {
        id: "col_slipdiv",
        field: "slipdiv",
        caption: "전표구분",
        width: 80,
      },
      {
        id: "col_att_cnt",
        field: "att_cnt",
        caption: "첨부건수",
        width: 80,
      },
    ],
  },
];
