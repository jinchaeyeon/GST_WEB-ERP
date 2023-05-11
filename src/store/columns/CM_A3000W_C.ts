import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_datnum",
        field: "datnum",
        caption: "문서번호",
        width: 200,
      },
      {
        id: "col_recdt",
        field: "recdt",
        caption: "작성일",
        width: 120,
      },
      {
        id: "col_title",
        field: "title",
        caption: "제목",
        width: 600,
      },
      {
        id: "col_person",
        field: "person",
        caption: "작성자",
        width: 200,
      },
    ],
  },
];
