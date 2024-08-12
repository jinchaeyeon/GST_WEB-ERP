import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_extra_field1",
        field: "extra_field1",
        caption: "기준년도",
        width: 120,
      },
      {
        id: "col_extra_field2",
        field: "extra_field2",
        caption: "역할코드",
        width: 120,
      },
      {
        id: "col_code_name",
        field: "code_name",
        caption: "역할코드명",
        width: 150,
      },
      {
        id: "col_numref1",
        field: "numref1",
        caption: "일평균임금",
        width: 100,
      },
      {
        id: "col_numref2",
        field: "numref2",
        caption: "월평균임금",
        width: 100,
      },
      {
        id: "col_numref3",
        field: "numref3",
        caption: "시간평균임금",
        width: 100,
      },
    ],
  },
];
