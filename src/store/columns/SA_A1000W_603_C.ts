import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_quonum",
        field: "quonum",
        caption: "PJT NO.",
        width: 150,
      },
      {
        id: "col_quorev",
        field: "quorev",
        caption: "REV",
        width: 100,
      },
      {
        id: "col_status",
        field: "status",
        caption: "상태",
        width: 120,
      },
      {
        id: "col_quosts",
        field: "quosts",
        caption: "진행단계",
        width: 120,
      },
      {
        id: "col_quotype",
        field: "quotype",
        caption: "의뢰유형",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
      {
        id: "col_chkperson",
        field: "custprsnnm",
        caption: "의뢰자",
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
      {
        id: "col_smpersonnm",
        field: "smpersonnm",
        caption: "영업담당자",
        width: 120,
      },
      {
        id: "col_itemcnt",
        field: "itemcnt",
        caption: "의뢰품목 수",
        width: 100,
      },
      {
        id: "col_pubdt",
        field: "pubdt",
        caption: "견적발행일",
        width: 120,
      },
      {
        id: "col_quodt",
        field: "quodt",
        caption: "계약목표일",
        width: 120,
      },
      {
        id: "col_passdt",
        field: "passdt",
        caption: "경과기간",
        width: 100,
      },
      {
        id: "col_cotracdt",
        field: "cotracdt",
        caption: "계약일",
        width: 120,
      },
      {
        id: "col_feasibility",
        field: "feasibility",
        caption: "Feasibility",
        width: 120,
      },
      {
        id: "col_weight",
        field: "weight",
        caption: "Weight",
        width: 120,
      },
      {
        id: "col_recdt2",
        field: "recdt",
        caption: "등록일",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_quoseq",
        field: "quoseq",
        caption: "No",
        width: 100,
      },
      {
        id: "col_quosts2",
        field: "quosts",
        caption: "진행단계",
        width: 120,
      },
      {
        id: "col_ordsts",
        field: "ordsts",
        caption: "수주상태",
        width: 120,
      },
      {
        id: "col_quotestnum",
        field: "quotestnum",
        caption: "예약번호",
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
        width: 120,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 120,
      },
      {
        id: "col_glpyn",
        field: "glpyn",
        caption: "GLP/N-GLP",
        width: 150,
      },
      {
        id: "col_startdt",
        field: "startdt",
        caption: "시작요청일",
        width: 120,
      },
      {
        id: "col_enddt",
        field: "enddt",
        caption: "종료요청일",
        width: 120,
      },
      {
        id: "col_remark2",
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
        id: "col_num_com",
        field: "num",
        caption: "활동차수",
        width: 100,
      },
      {
        id: "col_recdt_com",
        field: "recdt",
        caption: "활동날짜",
        width: 120,
      },
      {
        id: "col_comment_com",
        field: "comment",
        caption: "활동내역",
        width: 200,
      },
    ],
  },
  {
    // 요약정보
    gridName: "grdList4",
    columns: [
      {
        id: "col_meetingnum",
        field: "meetingnum",
        caption: "회의록번호",
        width: 150,
      },
      {
        id: "col_recdt",
        field: "recdt",
        caption: "회의일자",
        width: 120,
      },
      {
        id: "col_title",
        field: "title",
        caption: "회의제목",
        width: 150,
      },
      {
        id: "col_person2",
        field: "person",
        caption: "작성자",
        width: 120,
      },
    ],
  },
  {
    // 요약정보
    gridName: "grdList5",
    columns: [
      {
        id: "col_document_id",
        field: "document_id",
        caption: "관리번호",
        width: 150,
      },
      {
        id: "col_require_type",
        field: "require_type",
        caption: "문의분야",
        width: 120,
      },
      {
        id: "col_request_date",
        field: "request_date",
        caption: "문의일",
        width: 120,
      },
      {
        id: "col_title2",
        field: "title",
        caption: "제목",
        width: 150,
      },
      {
        id: "col_user_id",
        field: "user_id",
        caption: "요청자",
        width: 120,
      },
      {
        id: "col_ans_person",
        field: "ans_person",
        caption: "답변자",
        width: 120,
      },
    ],
  },
  {
    // 요약정보
    gridName: "grdList6",
    columns: [
      {
        id: "col_quokey2",
        field: "quokey",
        caption: "견적번호",
        width: 150,
      },
      {
        id: "col_quorev2",
        field: "quorev",
        caption: "REV",
        width: 100,
      },
      {
        id: "col_pubdt2",
        field: "pubdt",
        caption: "견적발행일",
        width: 120,
      },
      {
        id: "col_contractyn2",
        field: "contractyn",
        caption: "계약확정여부",
        width: 120,
      },
      {
        id: "col_itemcnt2",
        field: "itemcnt",
        caption: "의뢰품목수",
        width: 100,
      },
      {
        id: "col_quounp2",
        field: "quounp",
        caption: "금액",
        width: 100,
      },
      {
        id: "col_margin2",
        field: "margin",
        caption: "마진률",
        width: 100,
      },
      {
        id: "col_marginamt2",
        field: "marginamt",
        caption: "마진금액",
        width: 100,
      },
      {
        id: "col_discount2",
        field: "discount",
        caption: "할인률",
        width: 100,
      },
      {
        id: "col_discountamt2",
        field: "discountamt",
        caption: "할인금액",
        width: 100,
      },
      {
        id: "col_finalquowonamt2",
        field: "finalquowonamt",
        caption: "최종견적금액",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList7",
    columns: [
      {
        id: "col_quoseq2",
        field: "quoseq",
        caption: "NO",
        width: 100,
      },
      {
        id: "col_quotestnum2",
        field: "quotestnum",
        caption: "예약번호",
        width: 150,
      },
      {
        id: "col_testnum",
        field: "testnum",
        caption: "시험번호",
        width: 150,
      },
      {
        id: "col_status2",
        field: "status",
        caption: "진행상황",
        width: 120,
      },
      {
        id: "col_rate",
        field: "rate",
        caption: "진행률",
        width: 120,
      },
      {
        id: "col_itemcd2",
        field: "itemcd",
        caption: "품목코드",
        width: 120,
      },
      {
        id: "col_itemnm2",
        field: "itemnm",
        caption: "품목명",
        width: 120,
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
        caption: "회복(주차)",
        width: 100,
      },
      {
        id: "col_tkyn",
        field: "tkyn",
        caption: "TK 여부",
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
    ],
  },
];
