import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_recdt",
        field: "recdt",
        caption: "회의일",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체",
        width: 200,
      },
      {
        id: "col_title",
        field: "title",
        caption: "제목",
        width: 300,
      },
      {
        id: "col_usegb",
        field: "usegb",
        caption: "회의록 구분",
        width: 100,
      },
      {
        id: "col_ref_key",
        field: "ref_key",
        caption: "연결 PJ No.",
        width: 100,
      },
      {
        id: "col_person",
        field: "person",
        caption: "작성자",
        width: 100,
      },
    ],
  },
];
