import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_name",
        field: "name",
        caption: "작성자",
        width: 120,
      },
      {
        id: "col_recdt",
        field: "recdt",
        caption: "작성일",
        width: 120,
      },
      {
        id: "col_contents",
        field: "contents",
        caption: "내용",
        width: 200,
      },
    ],
  },
];
