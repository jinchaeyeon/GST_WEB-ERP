import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_kind1",
        field: "kind1",
        caption: "전체분류",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "작성자",
        width: 120,
      },
      {
        id: "col_title",
        field: "title",
        caption: "제목",
        width: 150,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 120,
      },
      {
        id: "col_strtime",
        field: "strtime",
        caption: "시작시간",
        width: 150,
      },
      {
        id: "col_endtime",
        field: "endtime",
        caption: "종료시간",
        width: 150,
      },
      {
        id: "col_usetime",
        field: "usetime",
        caption: "소요시간",
        width: 80,
      },
      {
        id: "col_finyn",
        field: "finyn",
        caption: "완료여부",
        width: 80,
      },
      {
        id: "col_planyn",
        field: "planyn",
        caption: "계획여부",
        width: 80,
      },
      {
        id: "col_datnum",
        field: "datnum",
        caption: "문서번호",
        width: 150,
      },
      {
        id: "col_ref_key",
        field: "ref_key",
        caption: "참조번호",
        width: 150,
      },
    ],
  },
];
