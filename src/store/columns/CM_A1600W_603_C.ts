import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_strtime",
        field: "strtime",
        caption: "일자",
        width: 120,
      },
      {
        id: "col_contents",
        field: "contents",
        caption: "내용",
        width: 200,
      },
      {
        id: "col_finyn",
        field: "finyn",
        caption: "완료",
        width: 80,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_strtime2",
        field: "strtime",
        caption: "시작일자",
        width: 120,
      },
      {
        id: "col_strhh",
        field: "strhh",
        caption: "시작시간",
        width: 80,
      },
      {
        id: "col_strmm",
        field: "strmm",
        caption: "시작분",
        width: 80,
      },
      {
        id: "col_endtime",
        field: "endtime",
        caption: "종료일자",
        width: 120,
      },
      {
        id: "col_endhh",
        field: "endhh",
        caption: "종료시간",
        width: 80,
      },
      {
        id: "col_endmm",
        field: "endmm",
        caption: "종료분",
        width: 80,
      },
      {
        id: "col_title",
        field: "title",
        caption: "제목",
        width: 150,
      },
      {
        id: "col_kind1",
        field: "kind1",
        caption: "활동 목적",
        width: 120,
      },
      {
        id: "col_colorID",
        field: "colorID",
        caption: "라벨(색상)",
        width: 120,
      },
      {
        id: "col_custcd",
        field: "custcd",
        caption: "업체",
        width: 120,
      },
      {
        id: "col_contents2",
        field: "contents",
        caption: "내용",
        width: 200,
      },
    ],
  },
];
