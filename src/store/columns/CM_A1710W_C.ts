import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_user_id",
        field: "user_id",
        caption: "사번",
        width: 120,
      },
      {
        id: "col_user_name",
        field: "user_name",
        caption: "성명",
        width: 120,
      },
      {
        id: "col_birdt",
        field: "birdt",
        caption: "생년월일",
        width: 120,
      },
      {
        id: "col_bircd",
        field: "bircd",
        caption: "음양",
        width: 200,
      },
      {
        id: "col_tel_no",
        field: "tel_no",
        caption: "전화번호",
        width: 120,
      },
      {
        id: "col_mobile_no",
        field: "mobile_no",
        caption: "핸드폰번호",
        width: 120,
      },
      {
        id: "col_user_ip",
        field: "user_ip",
        caption: "IP",
        width: 120,
      },
    ],
  },
];
