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
        id: "col_dutydt",
        field: "dutydt",
        caption: "근태일자",
        width: 120,
      },
      {
        id: "col_prsnnum",
        field: "prsnnum",
        caption: "사용자",
        width: 120,
      },
      {
        id: "col_location",
        field: "location",
        caption: "사업장",
        width: 120,
      },
      {
        id: "col_dptcd",
        field: "dptcd",
        caption: "부서",
        width: 120,
      },
      {
        id: "col_shh",
        field: "shh",
        caption: "출근시",
        width: 100,
      },
      {
        id: "col_smm",
        field: "smm",
        caption: "출근분",
        width: 100,
      },
      {
        id: "col_ehh",
        field: "ehh",
        caption: "퇴근시",
        width: 100,
      },
      {
        id: "col_emm",
        field: "emm",
        caption: "퇴근분",
        width: 100,
      },
      {
        id: "col_lateyn",
        field: "lateyn",
        caption: "지각",
        width: 100,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },
];
