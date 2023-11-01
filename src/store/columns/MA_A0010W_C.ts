import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_sub_code",
        field: "sub_code",
        caption: "적재장소코드",
        width: 150,
      },
      {
        id: "col_code_name",
        field: "code_name",
        caption: "적재장소명",
        width: 150,
      },
      {
        id: "col_extra_field6",
        field: "extra_field6",
        caption: "동",
        width: 120,
      },
      {
        id: "col_numref1",
        field: "numref1",
        caption: "부하율",
        width: 100,
      },
      {
        id: "col_use_yn",
        field: "use_yn",
        caption: "사용여부",
        width: 100,
      },
    ],
  },
];
