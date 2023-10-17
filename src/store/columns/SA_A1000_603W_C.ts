import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_quokey",
        field: "quokey",
        caption: "견적번호",
        width: 150,
      },
      {
        id: "col_quotype",
        field: "quotype",
        caption: "견적형태",
        width: 120,
      },
      {
        id: "col_quosts",
        field: "quosts",
        caption: "견적상태",
        width: 120,
      },
      {
        id: "col_quodt",
        field: "quodt",
        caption: "견적일자",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "담당자",
        width: 120,
      },
      {
        id: "col_dptcd",
        field: "dptcd",
        caption: "부서코드",
        width: 120,
      },
      {
        id: "col_chkperson",
        field: "chkperson",
        caption: "CS담당자",
        width: 120,
      },
      {
        id: "col_custcd",
        field: "custcd",
        caption: "업체코드",
        width: 150,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
      {
        id: "col_materialtype",
        field: "materialtype",
        caption: "물질분류",
        width: 120,
      },
      {
        id: "col_materialnm",
        field: "materialnm",
        caption: "시험물질명",
        width: 150,
      },
      {
        id: "col_materialindt",
        field: "materialindt",
        caption: "물질입고예상일",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_group_seq",
        field: "group_seq",
        caption: "패키지번호",
        width: 100,
      },
      {
        id: "col_packagetype",
        field: "packagetype",
        caption: "패키지유형",
        width: 120,
      },
      {
        id: "col_sort_seq",
        field: "sort_seq",
        caption: "순번",
        width: 100,
      },
      {
        id: "col_testnum",
        field: "testnum",
        caption: "시험번호",
        width: 150,
      },
      {
        id: "col_itemlvl1",
        field: "itemlvl1",
        caption: "시험파트",
        width: 120,
      },
      {
        id: "col_itemcd",
        field: "itemcd",
        caption: "품목코드",
        width: 150,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 150,
      },
      {
        id: "col_glpyn",
        field: "glpyn",
        caption: "GLP구분",
        width: 250,
      },
      {
        id: "col_startdt",
        field: "startdt",
        caption: "시작일자",
        width: 120,
      },
      {
        id: "col_enddt",
        field: "enddt",
        caption: "종료일자",
        width: 120,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 200,
      }
    ],
  },
];
