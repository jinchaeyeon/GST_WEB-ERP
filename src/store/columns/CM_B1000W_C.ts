import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_strday",
        field: "strday",
        caption: "작성일자",
        width: 120,
      },
      {
        id: "col_dptnm",
        field: "dptnm",
        caption: "부서명",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "사번",
        width: 120,
      },
      {
        id: "col_user_name",
        field: "user_name",
        caption: "사용자명",
        width: 120,
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
        caption: "전체분류",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 120,
      },
      {
        id: "col_custperson",
        field: "custperson",
        caption: "업체담당자명",
        width: 120,
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
        id: "col_files",
        field: "files",
        caption: "첨부파일",
        width: 100,
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
      {
        id: "col_usetime",
        field: "usetime",
        caption: "소요시간",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_user_name2",
        field: "user_name",
        caption: "사용자",
        width: 120,
      },
      {
        id: "col_exptime",
        field: "exptime",
        caption: "지시",
        width: 80,
      },
      {
        id: "col_usetimey",
        field: "usetimey",
        caption: "계획",
        width: 80,
      },
      {
        id: "col_usetimen",
        field: "usetimen",
        caption: "실행",
        width: 80,
      },
    ],
  },
];
