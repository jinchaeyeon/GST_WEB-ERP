import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_code",
        field: "code",
        caption: "코드",
        width: 120,
      },
      {
        id: "col_codename",
        field: "name",
        caption: "코드명",
        width: 120,
      },
    ],
  },
];
