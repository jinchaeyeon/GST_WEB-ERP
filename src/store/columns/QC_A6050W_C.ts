import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_qcnum",
        field: "qcnum",
        caption: "검사관리번호",
        width: 150,
      },
      {
        id: "col_qcdt",
        field: "qcdt",
        caption: "검사일자",
        width: 120,
      },
      {
        id: "col_extra_field1",
        field: "extra_field1",
        caption: "업체코드",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
      {
        id: "col_person",
        field: "person",
        caption: "품질담당자",
        width: 120,
      },
      {
        id: "col_extra_field2",
        field: "extra_field2",
        caption: "제목",
        width: 200,
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
