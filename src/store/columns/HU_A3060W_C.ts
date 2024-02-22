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
  {
    gridName: "grdList4",
    columns: [
      {
        id: "col_paycd",
        field: "paycd",
        caption: "급여지급유형",
        width: 120,
      },
      {
        id: "col_payitemcd",
        field: "payitemcd",
        caption: "공제_지급코드",
        width: 120,
      },
      {
        id: "col_dutycd",
        field: "dutycd",
        caption: "근태코드",
        width: 120,
      },
      {
        id: "col_dutymngdiv",
        field: "dutymngdiv",
        caption: "근태관리코드",
        width: 120,
      },
      {
        id: "col_text1",
        field: "text1",
        caption: "*",
        width: 50,
      },
      {
        id: "col_stdamt",
        field: "stdamt",
        caption: "기준금액",
        width: 100,
      },
      {
        id: "col_text2",
        field: "text2",
        caption: "*",
        width: 50,
      },
      {
        id: "col_text3",
        field: "text3",
        caption: "급여기준",
        width: 120,
      },
      {
        id: "col_text4",
        field: "text4",
        caption: "*",
        width: 50,
      },
      {
        id: "col_cal2n",
        field: "cal2n",
        caption: "식2",
        width: 100,
      },
      {
        id: "col_text5",
        field: "text5",
        caption: "+",
        width: 50,
      },
      {
        id: "col_cal2s",
        field: "cal2s",
        caption: "통상임금",
        width: 80,
      },
      {
        id: "col_text6",
        field: "text6",
        caption: "/",
        width: 50,
      },
      {
        id: "col_cal3n",
        field: "cal3n",
        caption: "식3",
        width: 100,
      },
      {
        id: "col_text7",
        field: "text7",
        caption: "*",
        width: 50,
      },
      {
        id: "col_cal4n",
        field: "cal4n",
        caption: "식4",
        width: 100,
      },
    ],
  },
];
