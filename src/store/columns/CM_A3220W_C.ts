import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_appyn",
        field: "appyn",
        caption: "결재",
        width: 120,
      },
      {
        id: "col_draftnum",
        field: "draftnum",
        caption: "기안번호",
        width: 150,
      },
      {
        id: "col_recdt",
        field: "recdt",
        caption: "기안일자",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "기안자",
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
        caption: "품의내용",
        width: 200,
      },
      {
        id: "col_files",
        field: "files",
        caption: "첨부내용",
        width: 150,
      },
    ],
  },
];
