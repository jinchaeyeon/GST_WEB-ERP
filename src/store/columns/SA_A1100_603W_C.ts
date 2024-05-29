import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    // 요약정보
    gridName: "grdList",
    columns: [
      {
        id: "col_quokey_list",
        field: "quokey",
        caption: "PJT NO.",
        width: 150,
      },
      {
        id: "col_ordnum_list",
        field: "ordnum",
        caption: "수주번호",
        width: 150,
      },
      {
        id: "col_contractno_list",
        field: "contractno",
        caption: "계약번호",
        width: 120,
      },
      {
        id: "col_strdt_list",
        field: "strdt",
        caption: "계약시작일",
        width: 120,
      },
      {
        id: "col_enddt_list",
        field: "enddt",
        caption: "계약종료일",
        width: 120,
      },
      {
        id: "col_contracyn",
        field: "contracyn",
        caption: "계약완료여부",
        width: 120,
      },
      {
        id: "col_project_list",
        field: "project",
        caption: "계약명",
        width: 120,
      },
      {
        id: "col_custnm_list",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
      {
        id: "col_custprsnnm_list",
        field: "custprsnnm",
        caption: "의뢰자",
        width: 150,
      },
      {
        id: "col_chkperson_list",
        field: "chkperson",
        caption: "영업담당자",
        width: 120,
      },
      {
        id: "col_materialtype_list",
        field: "materialtype",
        caption: "물질분야",
        width: 120,
      },
      {
        id: "col_extra_field2_list",
        field: "extra_field2",
        caption: "물질상세분야",
        width: 120,
      },
      {
        id: "col_materialnm_list",
        field: "materialnm",
        caption: "시험물질명",
        width: 150,
      },
      {
        id: "col_cnt1_list",
        field: "cnt1",
        caption: "계약품목수",
        width: 100,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "금액",
        width: 130,
      },
      {
        id: "col_taxamt",
        field: "taxamt",
        caption: "세액",
        width: 120,
      },
      {
        id: "col_contraamt",
        field: "contraamt",
        caption: "계약금액",
        width: 130,
      },
      {
        id: "col_change_contraamt",
        field: "change_contraamt",
        caption: "변경계약금액",
        width: 130,
      },
      {
        id: "col_fin_contraamt",
        field: "fin_contraamt",
        caption: "최종계약금액",
        width: 130,
      },
    ],
  },
  {
    // 시험리스트
    gridName: "grdList2",
    columns: [
      {
        id: "col_seq",
        field: "seq",
        caption: "No",
        width: 100,
      },
      {
        id: "col_ordnum",
        field: "ordnum",
        caption: "수주번호",
        width: 150,
      },
      {
        id: "col_testnum",
        field: "testnum",
        caption: "시험번호",
        width: 150,
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
        id: "col_week_b",
        field: "week_b",
        caption: "기본(주차)",
        width: 100,
      },
      {
        id: "col_week_r",
        field: "week_r",
        caption: "기본(회복)",
        width: 100,
      },
      {
        id: "col_qty_t",
        field: "qty_t",
        caption: "TK",
        width: 100,
      },
      {
        id: "col_totqty",
        field: "totqty",
        caption: "총 마리수",
        width: 100,
      },
      {
        id: "col_contractgb",
        field: "contractgb",
        caption: "계약형태",
        width: 120,
      },
      {
        id: "col_amt2",
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
        id: "col_taxamt2",
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
    // 코멘트
    gridName: "grdList3",
    columns: [
      {
        id: "col_num_com",
        field: "num",
        caption: "NO",
        width: 100,
      },
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
        caption: "내용",
        width: 200,
      },
    ],
  },
  {
    // 요약정보
    gridName: "grdList6",
    columns: [
      {
        id: "col_num",
        field: "num",
        caption: "차수",
        width: 100,
      },
      {
        id: "col_payment",
        field: "payment",
        caption: "지급항목",
        width: 120,
      },
      {
        id: "col_paydt",
        field: "paydt",
        caption: "청구년월일",
        width: 120,
      },
      {
        id: "col_amt_detail2",
        field: "amt",
        caption: "금액",
        width: 100,
      },
      {
        id: "col_remark_detail2",
        field: "remark",
        caption: "비고",
        width: 200,
      },
    ],
  },
];
