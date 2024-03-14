import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_prsnnum",
        field: "prsnnum",
        caption: "사번",
        width: 150,
      },
      {
        id: "col_prsnnm",
        field: "prsnnm",
        caption: "성명",
        width: 150,
      },
      {
        id: "col_perregnum",
        field: "perregnum",
        caption: "주민번호",
        width: 200,
      },
      {
        id: "col_dptnm",
        field: "dptnm",
        caption: "부서명",
        width: 120,
      },
      {
        id: "col_abilcd",
        field: "abilcd",
        caption: "직책",
        width: 120,
      },
      {
        id: "col_telephone",
        field: "telephone",
        caption: "휴대폰번호",
        width: 150,
      },
      {
        id: "col_regorgdt",
        field: "regorgdt",
        caption: "입사일",
        width: 120,
      },
      {
        id: "col_rtrdt",
        field: "rtrdt",
        caption: "퇴사일",
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
];
