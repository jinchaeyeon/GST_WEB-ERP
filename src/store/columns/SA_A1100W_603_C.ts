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
      {
        id: "col_fin_contraamt_won",
        field: "fin_contraamt_won",
        caption: "최종계약금액(원화)",
        width: 140,
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
        width: 70,
      },
      {
        id: "col_contractgb",
        field: "contractgb",
        caption: "계약형태",
        width: 120,
      },
      {
        id: "col_quotestnum",
        field: "quotestnum",
        caption: "예약번호",
        width: 140,
      },
      {
        id: "col_testnum",
        field: "testnum",
        caption: "시험번호",
        width: 140,
      },
      {
        id: "col_ordnum",
        field: "ordnum",
        caption: "수주번호",
        width: 140,
      },
      {
        id: "col_itemcd",
        field: "itemcd",
        caption: "품목코드",
        width: 140,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 250,
      },
      {
        id: "col_week_b",
        field: "week_b",
        caption: "기본(주차)",
        width: 90,
      },
      {
        id: "col_week_r",
        field: "week_r",
        caption: "회복(주차)",
        width: 90,
      },
      {
        id: "col_tkyn",
        field: "tkyn",
        caption: "TK",
        width: 80,
      },
      {
        id: "col_wgtyn",
        field: "wgtyn",
        caption: "용량",
        width: 80,
      },  
      {
        id: "col_quoamt",
        field: "quoamt",
        caption: "견적금액",
        width: 120,
      },
      {
        id: "col_amt2",
        field: "amt",
        caption: "공급가액",
        width: 120,
      },
      {
        id: "col_wonamt",
        field: "wonamt",
        caption: "공급가액(원화)",
        width: 120,
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
        width: 80,
      },
      {
        id: "col_insert_userid_com",
        field: "insert_userid",
        caption: "등록자",
        width: 170,
      },
      {
        id: "col_recdt_com",
        field: "recdt",
        caption: "등록일자",
        width: 170,
      },
      {
        id: "col_comment_com",
        field: "comment",
        caption: "내용",
        width: 320,
      },
    ],
  },
  {
    // 청구조건
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
        caption: "청구조건",
        width: 320,
      },
      {
        id: "col_paydt",
        field: "paydt",
        caption: "청구예정일",
        width: 170,
      },
      {
        id: "col_amt_detail2",
        field: "amt",
        caption: "청구예정금액",
        width: 170,
      },    
    ],
  },
];
