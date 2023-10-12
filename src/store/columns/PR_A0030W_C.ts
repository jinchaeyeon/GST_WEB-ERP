import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_pattern_id",
        field: "pattern_id",
        caption: "패턴ID",
        width: 150,
      },
      {
        id: "col_pattern_name",
        field: "pattern_name",
        caption: "패턴명",
        width: 150,
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
        id: "col_sub_code",
        field: "sub_code",
        caption: "공정코드",
        width: 150,
      },
      {
        id: "col_code_name",
        field: "code_name",
        caption: "공정명",
        width: 150,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_proccd",
        field: "proccd",
        caption: "공정",
        width: 150,
      },
      {
        id: "col_procseq",
        field: "procseq",
        caption: "공정순서",
        width: 100,
      },
      {
        id: "col_outprocyn",
        field: "outprocyn",
        caption: "외주구분",
        width: 120,
      },
    ],
  },
];
