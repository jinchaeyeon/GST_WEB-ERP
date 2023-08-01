import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_basedt",
        field: "basedt",
        caption: "기준일",
        width: 120,
      },
      {
        id: "col_amtunit",
        field: "amtunit",
        caption: "화폐단위",
        width: 100,
      },
      {
        id: "col_wonchgrat",
        field: "wonchgrat",
        caption: "원화환율",
        width: 100,
      },
      {
        id: "col_uschgrat",
        field: "uschgrat",
        caption: "대미환율",
        width: 100,
      },
      {
        id: "col_baseamt",
        field: "baseamt",
        caption: "기준금액",
        width: 100,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 400,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_basedt2",
        field: "basedt",
        caption: "기준일",
        width: 200,
      },
    ],
  },
];
