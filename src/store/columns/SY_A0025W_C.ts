import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_numbering_id",
        field: "numbering_id",
        caption: "관리번호ID",
        width: 120,
      },
      {
        id: "col_numbering_name",
        field: "numbering_name",
        caption: "관리번호명",
        width: 150,
      },
      {
        id: "col_use_yn",
        field: "use_yn",
        caption: "사용여부",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_number_prefix",
        field: "number_prefix",
        caption: "채번접두사",
        width: 155,
      },
      {
        id: "col_last_serno",
        field: "last_serno",
        caption: "최종순번",
        width: 150,
      },
    ],
  },
];
