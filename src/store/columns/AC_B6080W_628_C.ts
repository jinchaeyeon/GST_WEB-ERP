import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_ym",
        field: "ym",
        caption: "월",
        width: 50,
      },
      {
        id: "col_iwlamt",
        field: "iwlamt",
        caption: "이월 미지급액",
        width: 150,
      },
      {
        id: "col_wonamt",
        field: "wonamt",
        caption: "매입액",
        width: 150,
      },
      {
        id: "col_taxamt",
        field: "taxamt",
        caption: "세액",
        width: 150,
      },
      {
        id: "col_totamt",
        field: "totamt",
        caption: "합계액",
        width: 150,
      },
      {
        id: "col_colamt",
        field: "colamt",
        caption: "지급액",
        width: 150,
      },
      {
        id: "col_janamt",
        field: "janamt",
        caption: "미지급잔액",
        width: 150,
      },    
    ],
  },
];
