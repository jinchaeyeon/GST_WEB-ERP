import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_dptcd",
        field: "dptcd",
        caption: "부서코드",
        width: 120,
      },
      {
        id: "col_postcd",
        field: "postcd",
        caption: "직위",
        width: 120,
      },
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
        id: "col_phonenum",
        field: "phonenum",
        caption: "핸드폰번호",
        width: 150,
      },
    ],
  },
];
