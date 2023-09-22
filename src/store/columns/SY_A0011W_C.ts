import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdHeaderList",
    columns: [
      {
        id: "col_user_group_id",
        field: "user_group_id",
        caption: "사용자그룹ID",
        width: 150,
      },
      {
        id: "col_user_group_name",
        field: "user_group_name",
        caption: "사용자그룹명",
        width: 150,
      },
      {
        id: "col_use_yn",
        field: "use_yn",
        caption: "사용유무",
        width: 80,
      },
    ],
  }
];
