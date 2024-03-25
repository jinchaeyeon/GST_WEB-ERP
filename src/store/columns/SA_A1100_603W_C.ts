import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    // 요약정보
    gridName: "grdList",
    columns: [
      {
        id: "col_reckey_list",
        field: "reckey",
        caption: "계약번호",
        width: 120,
      },
      {
        id: "col_quokey_list",
        field: "quokey",
        caption: "프로젝트번호",
        width: 120,
      },
      {
        id: "col_person_list",
        field: "person",
        caption: "담당자",
        width: 120,
      },
      {
        id: "col_dptcd_list",
        field: "dptcd",
        caption: "부서",
        width: 120,
      },
      {
        id: "col_chkperson_list",
        field: "chkperson",
        caption: "CS담당자",
        width: 120,
      },
      {
        id: "col_custcd_list",
        field: "custcd",
        caption: "업체코드",
        width: 150,
      },
      {
        id: "col_custnm_list",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
      {
        id: "col_materialtype_list",
        field: "materialtype",
        caption: "물질분류",
        width: 120,
      },
      {
        id: "col_materialnm_list",
        field: "materialnm",
        caption: "시험물질명",
        width: 150,
      },
      {
        id: "col_materialindt_list",
        field: "materialindt",
        caption: "물질입고예상일",
        width: 120,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "금액",
        width: 100,
      },
      {
        id: "col_wonamt",
        field: "wonamt",
        caption: "원화금액",
        width: 100,
      },
      {
        id: "col_taxamt",
        field: "taxamt",
        caption: "세액",
        width: 100,
      },
      {
        id: "col_totamt",
        field: "totamt",
        caption: "합계금액",
        width: 100,
      },
    ],
  },
  {
    // 시험리스트
    gridName: "grdList2",
    columns: [
      {
        id: "col_testnum",
        field: "testnum",
        caption: "시험번호",
        width: 150,
      },
      {
        id: "col_quonum",
        field: "quonum",
        caption: "견적번호",
        width: 150,
      },
      {
        id: "col_quorev",
        field: "quorev",
        caption: "리비전번호",
        width: 100,
      },
      {
        id: "col_quoseq",
        field: "quoseq",
        caption: "No",
        width: 100,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 150,
      },
      {
        id: "col_outtype",
        field: "outtype",
        caption: "출고형태",
        width: 120,
      },
      {
        id: "col_amt_detail",
        field: "amt",
        caption: "금액",
        width: 100,
      },
      {
        id: "col_wonamt_detail",
        field: "wonamt",
        caption: "원화금액",
        width: 100,
      },
      {
        id: "col_taxamt_detail",
        field: "taxamt",
        caption: "세액",
        width: 100,
      },
      {
        id: "col_totamt_detail",
        field: "totamt",
        caption: "합계금액",
        width: 100,
      },
      {
        id: "col_remark_adj",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },

  {
    // 코멘트
    gridName: "grdList3",
    columns: [
      {
        id: "col_recdt_com",
        field: "recdt",
        caption: "작성일",
        width: 120,
      },
      {
        id: "col_insert_userid_com",
        field: "insert_userid",
        caption: "작성자",
        width: 120,
      },
      {
        id: "col_comment_com",
        field: "comment",
        caption: "코멘트",
        width: 200,
      },
    ],
  },
  {
    // 기존 거래내역
    gridName: "grdList4",
    columns: [
      {
        id: "col_quokey_sale",
        field: "quokey",
        caption: "프로젝트번호",
        width: 150,
      },
      {
        id: "col_ordamt_sale",
        field: "ordamt",
        caption: "수주금액",
        width: 100,
      },
      {
        id: "col_saleamt_sale",
        field: "saleamt",
        caption: "거래금액",
        width: 100,
      },
      {
        id: "col_collamt_sale",
        field: "collamt",
        caption: "수금금액",
        width: 100,
      },
      {
        id: "col_janamt_sale",
        field: "janamt",
        caption: "미수잔액",
        width: 100,
      },
    ],
  },
  {
    // 회의록
    gridName: "grdList5",
    columns: [
      {
        id: "col_meetingnum_meet",
        field: "meetingnum",
        caption: "회의록번호",
        width: 150,
      },
      {
        id: "col_recdt_meet",
        field: "recdt",
        caption: "회의일",
        width: 120,
      },
      {
        id: "col_person_meet",
        field: "person",
        caption: "작성자",
        width: 120,
      },
      {
        id: "col_title_meet",
        field: "title",
        caption: "제목",
        width: 150,
      },
    ],
  },
];
