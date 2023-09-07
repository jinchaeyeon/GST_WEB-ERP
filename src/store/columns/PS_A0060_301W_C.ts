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
        width: 150,
      },
      {
        id: "col_datnum",
        field: "datnum",
        caption: "문서번호",
        width: 120,
      },
      {
        id: "col_date",
        field: "date",
        caption: "일자",
        width: 150,
      },
      {
        id: "col_description",
        field: "description",
        caption: "비고",
        width: 500,
      },
    ],
  },
];