import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_recdt",
        field: "recdt",
        caption: "작성일자",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
      {
        id: "col_custprsnnm",
        field: "custprsnnm",
        caption: "의뢰자",
        width: 120,
      },
      {
        id: "col_title",
        field: "title",
        caption: "제목",
        width: 250,
      },
      {
        id: "col_usegb",
        field: "usegb",
        caption: "목적",
        width: 120,
      },
      {
        id: "col_ref_key",
        field: "ref_key",
        caption: "PJT NO.",
        width: 150,
      },
      {
        id: "col_person",
        field: "person",
        caption: "작성자",
        width: 120,
      },
      {
        id: "col_type",
        field: "type",
        caption: "유형",
        width: 120,
      },
      {
        id: "col_materialtype",
        field: "materialtype",
        caption: "물질분야",
        width: 120,
      },
      {
        id: "col_extra_field2",
        field: "extra_field2",
        caption: "물질상세분야",
        width: 120,
      },
    ],
  },
];
