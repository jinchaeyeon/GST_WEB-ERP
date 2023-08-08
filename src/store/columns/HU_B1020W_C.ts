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
          id: "col_dptcd",
          field: "dptcd",
          caption: "부서",
          width: 150,
        },
        {
            id: "col_postcd",
            field: "postcd",
            caption: "직위",
            width: 150,
          },
          {
            id: "col_birdt",
            field: "birdt",
            caption: "생년월일",
            width: 120,
          },
          {
            id: "col_sexcd",
            field: "sexcd",
            caption: "성별",
            width: 120,
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
            id: "col_paycd",
            field: "paycd",
            caption: "급여지급유형",
            width: 150,
          },
          {
            id: "col_location",
            field: "location",
            caption: "사업장",
            width: 150,
          },
          {
            id: "col_remark",
            field: "remark",
            caption: "비고",
            width : 300,
          },
      ]
    },
];