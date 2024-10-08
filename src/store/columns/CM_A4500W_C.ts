import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_bookcd",
        field: "bookcd",
        caption: "도서코드",
        width: 150,
      },
      {
        id: "col_booknm",
        field: "booknm",
        caption: "도서명",
        width: 150,
      },
      {
        id: "col_bookacnt",
        field: "bookacnt",
        caption: "도서계정",
        width: 120,
      },
      {
        id: "col_location",
        field: "location",
        caption: "사업장",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "담당자",
        width: 120,
      },
      {
        id: "col_dptcd",
        field: "dptcd",
        caption: "부서코드",
        width: 120,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "금액",
        width: 100,
      },
      {
        id: "col_maker",
        field: "maker",
        caption: "제조사",
        width: 120,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_date2",
        field: "date",
        caption: "일시",
        width: 120,
      },
      {
        id: "col_inoutdiv2",
        field: "inoutdiv",
        caption: "입출구분",
        width: 120,
      },
      {
        id: "col_bookcd2",
        field: "bookcd",
        caption: "도서코드",
        width: 150,
      },
      {
        id: "col_booknm2",
        field: "booknm",
        caption: "도서명",
        width: 150,
      },
      {
        id: "col_bookacnt2",
        field: "bookacnt",
        caption: "도서계정",
        width: 120,
      },
      {
        id: "col_person2",
        field: "person",
        caption: "담당자",
        width: 120,
      },
      {
        id: "col_remark2",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },
];
