import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_orgdiv",
        field: "orgdiv",
        caption: "회사구분",
        width: 120,
      },
      {
        id: "col_tragetnum",
        field: "tragetnum",
        caption: "고유번호",
        width: 150,
      },
      {
        id: "col_yyyy",
        field: "yyyy",
        caption: "년도",
        width: 100,
      },
      {
        id: "col_mm",
        field: "mm",
        caption: "월",
        width: 100,
      },
      {
        id: "col_position",
        field: "position",
        caption: "사업부",
        width: 120,
      },
      {
        id: "col_dptcd",
        field: "dptcd",
        caption: "부서",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "담당자",
        width: 120,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "금액",
        width: 100,
      },
    ],
  },
];
