import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_recdt",
        field: "recdt",
        caption: "출석일자",
        width: 120,
      },
      {
        id: "col_plandt",
        field: "plandt",
        caption: "등원예정일자",
        width: 120,
      },
      {
        id: "col_custcd",
        field: "custcd",
        caption: "반려견코드",
        width: 150,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "반려견명",
        width: 150,
      },
      {
        id: "col_class",
        field: "class",
        caption: "반",
        width: 120,
      },
      {
        id: "col_owner",
        field: "owner",
        caption: "반려인",
        width: 120,
      },
      {
        id: "col_species",
        field: "species",
        caption: "종",
        width: 120,
      },
      {
        id: "col_gender",
        field: "gender",
        caption: "성별",
        width: 120,
      },
      {
        id: "col_age",
        field: "age",
        caption: "나이",
        width: 100,
      },
      {
        id: "col_mobile_no",
        field: "mobile_no",
        caption: "휴대폰번호",
        width: 120,
      },
      {
        id: "col_gubun",
        field: "gubun",
        caption: "회원권구분",
        width: 120,
      },
      {
        id: "col_att_check",
        field: "att_check",
        caption: "등원상태",
        width: 80,
      },
      {
        id: "col_manager",
        field: "manager",
        caption: "담당자",
        width: 120,
      },
    ],
  },
];