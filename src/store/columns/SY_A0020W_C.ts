import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_yyyymm",
        field: "yyyymm",
        caption: "마감년월",
        width: 120,
      },
      {
        id: "col_closeyn",
        field: "closeyn",
        caption: "승인여부",
        width: 150,
      },
      {
        id: "col_insert_userid",
        field: "insert_userid",
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
        id: "col_insert_pc",
        field: "insert_pc",
        caption: "등록PC",
        width: 200,
      },
      {
        id: "col_update_userid",
        field: "update_userid",
        caption: "수정자",
        width: 120,
      },
      {
        id: "col_update_time",
        field: "update_time",
        caption: "수정일자",
        width: 150,
      },
      {
        id: "col_update_pc",
        field: "update_pc",
        caption: "수정PC",
        width: 200,
      },
    ],
  },
];
