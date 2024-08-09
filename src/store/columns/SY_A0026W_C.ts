import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_decimal_code",
        field: "decimal_code",
        caption: "소수점유형ID",
        width: 150,
      },
      {
        id: "col_code_name",
        field: "code_name",
        caption: "소수점유형명",
        width: 150,
      },
      {
        id: "col_length",
        field: "length",
        caption: "소수자리수",
        width: 100,
      },
      {
        id: "col_is_use",
        field: "is_use",
        caption: "사용여부",
        width: 80,
      },
      {
        id: "col_description",
        field: "description",
        caption: "비고",
        width: 200,
      },
    ],
  },
];
