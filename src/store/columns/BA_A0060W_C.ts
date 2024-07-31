import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_recdt",
        field: "recdt",
        caption: "작성일",
        width: 120,
      },
      {
        id: "col_itemcd",
        field: "itemcd",
        caption: "품목코드",
        width: 150,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 150,
      },
      {
        id: "col_dwgno",
        field: "dwgno",
        caption: "도면번호",
        width: 120,
      },
      {
        id: "col_dwgrev",
        field: "dwgrev",
        caption: "REV",
        width: 80,
      },
      {
        id: "col_dwgspec",
        field: "dwgspec",
        caption: "도면사양",
        width: 120,
      },
      {
        id: "col_poregnum",
        field: "poregnum",
        caption: "공사번호",
        width: 120,
      },
      {
        id: "col_project",
        field: "project",
        caption: "프로젝트",
        width: 120,
      },
      {
        id: "col_insiz",
        field: "insiz",
        caption: "규격",
        width: 120,
      },
      {
        id: "col_proccd",
        field: "proccd",
        caption: "공정",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "담당자",
        width: 120,
      },
      {
        id: "col_useyn",
        field: "useyn",
        caption: "사용여부",
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
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_original_name",
        field: "original_name",
        caption: "파일명",
        width: 150,
      },
      {
        id: "col_file_size",
        field: "file_size",
        caption: "파일 SIZE",
        width: 100,
      },
      {
        id: "col_user_name",
        field: "user_name",
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
        id: "col_attdatnum",
        field: "attdatnum",
        caption: "첨부번호",
        width: 150,
      },
    ],
  },
];
