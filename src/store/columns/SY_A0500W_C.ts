import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_location",
        field: "location",
        caption: "사업장",
        width: 120,
      },
      {
        id: "col_layout_id",
        field: "layout_id",
        caption: "레이아웃ID",
        width: 120,
      },
      {
        id: "col_layout_name",
        field: "layout_name",
        caption: "레이아웃명",
        width: 120,
      },
    ],
  },
];
