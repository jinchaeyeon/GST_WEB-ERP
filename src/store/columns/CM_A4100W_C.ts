import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_edunum",
        field: "edunum",
        caption: "교육번호",
        width: 150,
      },
      {
        id: "col_recdt",
        field: "recdt",
        caption: "일자",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "담당자",
        width: 120,
      },
      {
        id: "col_title",
        field: "title",
        caption: "제목",
        width: 200,
      },
      {
        id: "col_contents",
        field: "contents",
        caption: "내용",
        width: 300,
      },
      {
        id: "col_finyn",
        field: "finyn",
        caption: "필수여부",
        width: 80,
      },
      {
        id: "col_edtime",
        field: "edtime",
        caption: "교육시간",
        width: 120,
      },
      {
        id: "col_edudiv",
        field: "edudiv",
        caption: "교육구분",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_recdt2",
        field: "recdt",
        caption: "일자",
        width: 120,
      },
      {
        id: "col_title2",
        field: "title",
        caption: "제목",
        width: 200,
      },
      {
        id: "col_person2",
        field: "person",
        caption: "담당자",
        width: 120,
      },
      {
        id: "col_cnt",
        field: "cnt",
        caption: "참여자",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_person3",
        field: "person",
        caption: "참여자",
        width: 120,
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
    ],
  },
];
