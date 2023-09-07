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
        id: "col_orgdiv",
        field: "orgdiv",
        caption: "회사구분",
        width: 120,
      },
      {
        id: "col_location",
        field: "location",
        caption: "사업장",
        width: 120,
      },
      {
        id: "col_position",
        field: "position",
        caption: "사업부",
        width: 120,
      },
      {
        id: "col_usediv",
        field: "usediv",
        caption: "실사용자",
        width: 100,
      },
      {
        id: "col_tel_no",
        field: "tel_no",
        caption: "전화번호",
        width: 150,
      },
      {
        id: "col_mobile_no",
        field: "mobile_no",
        caption: "휴대폰번호",
        width: 150,
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
        width: 150,
      },
      {
        id: "col_memo",
        field: "memo",
        caption: "메모",
        width: 150,
      },
      {
        id: "col_profile_image",
        field: "profile_image",
        caption: "이미지",
        width: 200,
      },
    ],
  },
];

