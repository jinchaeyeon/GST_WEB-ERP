import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_ref_key",
        field: "ref_key",
        caption: "프로젝트번호",
        width: 120,
      },
      {
        id: "col_testnum",
        field: "testnum",
        caption: "시험번호",
        width: 120,
      },
      {
        id: "col_status",
        field: "status",
        caption: "진행상태",
        width: 120,
      },
      {
        id: "col_ncrdiv",
        field: "ncrdiv",
        caption: "이슈 유형",
        width: 120,
      },
      {
        id: "col_combytype",
        field: "combytype",
        caption: "세부유형",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "고객사",
        width: 120,
      },
      {
        id: "col_chkperson ",
        field: "chkperson ",
        caption: "시험책임자",
        width: 120,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 120,
      },
      {
        id: "col_smperson",
        field: "smperson",
        caption: "SM담당자",
        width: 120,
      },
      {
        id: "col_cpmperson",
        field: "cpmperson",
        caption: "CPM담당자",
        width: 120,
      },
    ],
  },
];
