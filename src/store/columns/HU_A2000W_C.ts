import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_yyyymmdd",
        field: "yyyymmdd",
        caption: "일자",
        width: 120,
      },
      {
        id: "col_dayofweek",
        field: "dayofweek",
        caption: "요일",
        width: 100,
      },
      {
        id: "col_workgb",
        field: "workgb",
        caption: "근무형태",
        width: 120,
      },
      {
        id: "col_workcls",
        field: "workcls",
        caption: "근무조",
        width: 100,
      },
      {
        id: "col_daygb",
        field: "daygb",
        caption: "근무직",
        width: 120,
      },
      {
        id: "col_workdiv",
        field: "workdiv",
        caption: "근태구분",
        width: 150,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "휴무명",
        width: 200,
      },
      {
        id: "col_week",
        field: "week",
        caption: "년주차",
        width: 100,
      },
      {
        id: "col_mweek",
        field: "mweek",
        caption: "월주차",
        width: 100,
      },
    ],
  },
];
