import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_payyrmm",
        field: "payyrmm",
        caption: "급여년월",
        width: 120,
      },
      {
        id: "col_prsnnum",
        field: "prsnnum",
        caption: "사번",
        width: 120,
      },
      {
        id: "col_prsnnm",
        field: "prsnnm",
        caption: "성명",
        width: 120,
      },
      {
        id: "col_dptcd",
        field: "dptcd",
        caption: "부서코드",
        width: 120,
      },
      {
        id: "col_anuamt",
        field: "anuamt",
        caption: "국민연금",
        width: 100,
      },
      {
        id: "col_hiramt",
        field: "hiramt",
        caption: "고용보험",
        width: 100,
      },
      {
        id: "col_medamt",
        field: "medamt",
        caption: "건강보험",
        width: 100,
      },
      {
        id: "col_safetyamt",
        field: "safetyamt",
        caption: "산재보험",
        width: 100,
      }
    ],
  },
];
