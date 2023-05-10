import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_recdt",
        field: "recdt",
        caption: "일자",
        width: 120,
      },
      {
        id: "col_gubun",
        field: "gubun",
        caption: "항목",
        width: 100,
      },
      {
        id: "col_position",
        field: "position",
        caption: "사업부",
        width: 120,
      },
      {
        id: "col_gubunnm",
        field: "gubunnm",
        caption: "항목명",
        width: 250,
      },
      {
        id: "col_remark3",
        field: "remark3",
        caption: "참조",
        width: 200,
      },
      {
        id: "col_rate",
        field: "rate",
        caption: "비율",
        width: 100,
      },
      {
        id: "col_insert_userid",
        field: "insert_userid",
        caption: "등록자",
        width: 120,
      },
      {
        id: "col_insert_time",
        field: "insert_time",
        caption: "등록일자",
        width: 150,
      },
      {
        id: "col_insert_pc",
        field: "insert_pc",
        caption: "등록PC",
        width: 200,
      },
    ],
  },
];
