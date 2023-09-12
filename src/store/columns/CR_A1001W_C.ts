import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_class",
        field: "class",
        caption: "그룹",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "등원예정",
        width: 150,
      },
      {
        id: "col_finyn",
        field: "finyn",
        caption: "등원여부",
        width: 150,
      },
      {
        id: "col_add1",
        field: "add1",
        caption: "양치신청",
        width: 150,
      },
      {
        id: "col_add2",
        field: "add2",
        caption: "목욕신청",
        width: 150,
      },
      {
        id: "col_add3",
        field: "add3",
        caption: "산소방신청",
        width: 150,
      },
      {
        id: "col_addetc",
        field: "addetc",
        caption: "그 외",
        width: 150,
      },
    ],
  },
];
