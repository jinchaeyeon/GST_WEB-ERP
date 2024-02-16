import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
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
        id: "col_birdt",
        field: "birdt",
        caption: "생일",
        width: 120,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "메모",
        width: 200,
      },
      {
        id: "col_class",
        field: "class",
        caption: "반",
        width: 120,
      },
    ],
  },
];
