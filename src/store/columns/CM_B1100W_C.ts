import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "성명",
        width: 120,
      },
      {
        id: "col_tottime",
        field: "tottime",
        caption: "시간",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_custnm2",
        field: "custnm",
        caption: "업체",
        width: 120,
      },
      {
        id: "col_tottime2",
        field: "tottime",
        caption: "시간",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_kind1",
        field: "kind1",
        caption: "전체분류",
        width: 120,
      },
      {
        id: "col_custnm3",
        field: "custnm",
        caption: "업체",
        width: 120,
      },
      {
        id: "col_contents",
        field: "contents",
        caption: "내용",
        width: 200,
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
        width: 100,
      },
      {
        id: "col_planyn",
        field: "planyn",
        caption: "업무계획여부",
        width: 100,
      },
      {
        id: "col_finyn",
        field: "finyn",
        caption: "완료여부",
        width: 100,
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
