import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_user_id",
        field: "user_id",
        caption: "사용자ID",
        width: 150,
      },
      {
        id: "col_user_name",
        field: "user_name",
        caption: "사용자명",
        width: 150,
      },
      {
        id: "col_postcd",
        field: "postcd",
        caption: "직위",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_user_group_id",
        field: "user_group_id",
        caption: "사용자ID",
        width: 120,
      },
      {
        id: "col_user_group_name",
        field: "user_group_name",
        caption: "그룹명",
        width: 120,
      },
    ],
  },
];
