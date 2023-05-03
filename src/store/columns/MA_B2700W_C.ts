import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_finyn",
        field: "finyn",
        caption: "A/S 진행여부",
        width: 120,
      },
      {
        id: "col_strdt",
        field: "strdt",
        caption: "A/S 일자",
        width: 120,
      },
      {
        id: "col_reqcustcd",
        field: "reqcustcd",
        caption:"A/S 요청업체",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "발송업체",
        width: 120,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 180,
      },
      {
        id: "col_insiz",
        field: "insiz",
        caption: "규격",
        width: 120,
      },
      {
        id: "col_serialno",
        field: "serialno",
        caption: "시리얼No.",
        width: 120,
      },
      {
        id: "col_fxmngnum",
        field: "fxmngnum",
        caption: "장비관리번호",
        width: 120,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "증상",
        width: 250,
      },
      {
        id: "col_extra_field5",
        field: "extra_field5",
        caption: "조치내용",
        width: 250,
      },
      {
        id: "col_enddt",
        field: "enddt",
        caption: "수령일자",
        width: 120,
      },
      {
        id: "col_outdt",
        field: "outdt",
        caption: "재출하일자",
        width: 120,
      },
      {
        id: "col_outcustnm",
        field: "outcustnm",
        caption: "재출하업체",
        width: 120,
      },
    ],
  },
];
