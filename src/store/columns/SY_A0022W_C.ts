import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_custcd",
        field: "custcd",
        caption: "업체코드",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 120,
      },
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
        id: "col_password",
        field: "password",
        caption: "비밀번호",
        width: 120,
      },
      {
        id: "col_temp",
        field: "temp",
        caption: "비밀번호 확인",
        width: 120,
      },
      {
        id: "col_apply_start_date",
        field: "apply_start_date",
        caption: "시작일",
        width: 120,
      },
      {
        id: "col_apply_end_date",
        field: "apply_end_date",
        caption: "종료일",
        width: 120,
      },
      {
        id: "col_usediv",
        field: "usediv",
        caption: "사용여부",
        width: 80,
      },
      {
        id: "col_memo",
        field: "memo",
        caption: "비고",
        width: 200,
      },
    ],
  },
];
