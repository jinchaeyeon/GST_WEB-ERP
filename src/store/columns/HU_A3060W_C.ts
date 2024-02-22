import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_taxstdmin",
        field: "taxstdmin",
        caption: "과세표준하한",
        width: 100,
      },
      {
        id: "col_taxstdmax",
        field: "taxstdmax",
        caption: "과세표준상한",
        width: 100,
      },
      {
        id: "col_taxrate",
        field: "taxrate",
        caption: "세율",
        width: 100,
      },
      {
        id: "col_gradualdeduct",
        field: "gradualdeduct",
        caption: "누진공제액",
        width: 100,
      },
    ],
  },
];
