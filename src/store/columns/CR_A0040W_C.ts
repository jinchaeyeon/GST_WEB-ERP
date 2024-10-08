import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
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
        caption: "그룹",
        width: 120,
      },
      {
        id: "col_gender",
        field: "gender",
        caption: "성별",
        width: 120,
      },
      {
        id: "col_mobile_no",
        field: "mobile_no",
        caption: "휴대폰",
        width: 120,
      },
      {
        id: "col_gubun",
        field: "gubun",
        caption: "종류",
        width: 120,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "메모",
        width: 200,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "금액",
        width: 100,
      },
      {
        id: "col_strdt",
        field: "strdt",
        caption: "시작일자",
        width: 120,
      },
      {
        id: "col_enddt",
        field: "enddt",
        caption: "만기일자",
        width: 120,
      },
      {
        id: "col_janqty",
        field: "janqty",
        caption: "등원가능",
        width: 100,
      },
      {
        id: "col_dayofweek",
        field: "dayofweek",
        caption: "등원요일",
        width: 120,
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
