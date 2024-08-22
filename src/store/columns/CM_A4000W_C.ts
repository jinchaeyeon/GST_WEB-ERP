import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_datnum",
        field: "datnum",
        caption: "문서번호",
        width: 150,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 120,
      },
      {
        id: "col_title",
        field: "title",
        caption: "제목",
        width: 200,
      },
    ],
  },
];
