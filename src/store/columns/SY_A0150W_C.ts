import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_date",
        field: "date",
        caption: "일자",
        width: 150,
      },
      {
        id: "col_file_name",
        field: "file_name",
        caption: "파일명",
        width: 200,
      },
      {
        id: "col_type",
        field: "type",
        caption: "유형",
        width: 120,
      },
      {
        id: "col_user_name",
        field: "user_name",
        caption: "사용자명",
        width: 120,
      },
      {
        id: "col_user_pc",
        field: "user_pc",
        caption: "사용자 PC",
        width: 250,
      },
    ],
  },
];
