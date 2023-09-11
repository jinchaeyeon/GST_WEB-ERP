import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_orgdiv",
        field: "orgdiv",
        caption: "회사구분",
        width: 150,
      },
      {
        id: "col_location",
        field: "location",
        caption: "사업장",
        width: 150
      },
      {
        id: "col_recdt",
        field: "recdt",
        caption: "출석일자",
        width: 200,
      },
      {
        id: "col_membership_id",
        field: "membership_id",
        caption: "회원권ID",
        width: 100,
      },
      {
        id: "col_seq",
        field: "seq",
        caption: "순번",
        width: 80,
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
        width: 250,
      },
      {
        id: "col_class",
        field: "class",
        caption: "반",
        width: 200,
      },
      {
        id: "col_owner",
        field: "owner",
        caption: "반려인",
        width: 150,
      },
      {
        id: "col_species",
        field: "species",
        caption: "종",
        width: 200,
      },
      {
        id: "col_gender",
        field: "gender",
        caption: "성별",
        width: 100,
      },
      {
        id: "col_age",
        field: "age",
        caption: "나이",
        width: 100,
      },
      {
        id: "col_tel_no",
        field: "tel_no",
        caption: "전화번호",
        width: 150,
      },
      {
        id: "col_gubun",
        field: "gubun",
        caption: "회원권구분",
        width: 250,
      },
      {
        id: "col_minus",
        field: "minus",
        caption: "차감",
        width: 100,
      },
      {
        id: "col_manager",
        field: "manager",
        caption: "담당자",
        width: 150,
      },
    ],
  },
];