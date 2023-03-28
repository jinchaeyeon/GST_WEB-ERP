import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_paycd",
        field: "paycd",
        caption: "급여지급유형",
        width: 300,
      },
      {
        id: "col_workgb",
        field: "workgb",
        caption: "근무형태",
        width: 210,
      },
      {
        id: "col_workcls",
        field: "workcls",
        caption: "근무조",
        width: 200,
      },
      {
        id: "col_stddiv",
        field: "stddiv",
        caption: "근태구분",
        width: 200,
      },
      {
        id: "col_workdiv",
        field: "workdiv",
        caption: "근무구분",
        width: 200,
      },
      {
        id: "col_work_strtime",
        field: "work_strtime",
        caption: "시작시간",
        width: 250,
      },
      {
        id: "col_work_endtime",
        field: "work_endtime",
        caption: "종료시간",
        width: 250,
      },
    ]
  },
];
