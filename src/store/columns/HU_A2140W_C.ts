import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_appyn",
        field: "appyn",
        caption: "결재",
        width: 100,
      },
      {
        id: "col_stddt",
        field: "stddt",
        caption: "신청일자",
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
        id: "col_postcd",
        field: "postcd",
        caption: "직위",
        width: 120,
      },
      {
        id: "col_dptcd",
        field: "dptcd",
        caption: "부서",
        width: 120,
      },
      {
        id: "col_stddiv",
        field: "stddiv",
        caption: "근태구분",
        width: 120,
      },
      {
        id: "col_startdate",
        field: "startdate",
        caption: "시작일자",
        width: 120,
      },
      {
        id: "col_enddate",
        field: "enddate",
        caption: "종료일자",
        width: 120,
      },
      {
        id: "col_shh",
        field: "shh",
        caption: "출근시",
        width: 100,
      },
      {
        id: "col_smm",
        field: "smm",
        caption: "출근분",
        width: 100,
      },
      {
        id: "col_ehh",
        field: "ehh",
        caption: "퇴근시",
        width: 100,
      },
      {
        id: "col_emm",
        field: "emm",
        caption: "퇴근분",
        width: 100,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "사유",
        width: 200,
      },
      {
        id: "col_files",
        field: "files",
        caption: "첨부파일",
        width: 150,
      },
    ],
  },
];
