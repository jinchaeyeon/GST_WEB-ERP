import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdAllList",
    columns: [
      {
        id: "col_user_id",
        field: "user_id",
        caption: "사용자ID",
        width: 230,
      },
      {
        id: "col_user_name",
        field: "user_name",
        caption: "사용자명",
        width: 250,
      },
      {
        id: "col_login_time",
        field: "login_time",
        caption: "접속시간",
        width: 250,
      },
      {
        id: "col_login_pc",
        field: "login_pc",
        caption: "접속PC",
        width: 300,
      },
      {
        id: "col_login_ip",
        field: "login_ip",
        caption: "접속IP",
        width: 250,
      },
      {
        id: "col_orgdiv",
        field: "orgdiv",
        caption: "회사구분",
        width: 200,
      },
      {
        id: "col_location",
        field: "location",
        caption: "사업장",
        width: 200,
      },
    ],
  },
];
