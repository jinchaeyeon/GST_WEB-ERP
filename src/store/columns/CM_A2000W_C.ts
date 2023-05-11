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
        id: "col_personnm",
        field: "personnm",
        caption: "작성자",
        width: 120,
      },
      {
        id: "col_rcvperson",
        field: "rcvperson",
        caption: "수리자",
        width: 120,
      },
      {
        id: "col_title",
        field: "title",
        caption: "제목",
        width: 300,
      },
      {
        id: "col_reqdt",
        field: "reqdt",
        caption: "완료요청일",
        width: 120,
      },
      {
        id: "col_finexpdt",
        field: "finexpdt",
        caption: "완료예정일",
        width: 120,
      },
      {
        id: "col_findt",
        field: "findt",
        caption: "완료일",
        width: 120,
      },
      {
        id: "col_endyn2",
        field: "endyn2",
        caption: "처리여부",
        width: 100,
      },
      {
        id: "col_commcnt",
        field: "commcnt",
        caption: "코멘트",
        width: 100,
      },
      {
        id: "col_chooses",
        field: "chooses",
        caption: "참조",
        width: 80,
      },
      {
        id: "col_loadok",
        field: "loadok",
        caption: "확인",
        width: 80,
      },
      {
        id: "col_readok",
        field: "readok",
        caption: "열람",
        width: 80,
      },
      {
        id: "col_recno",
        field: "recno",
        caption: "작성번호",
        width: 150,
      },
    ],
  },
];
