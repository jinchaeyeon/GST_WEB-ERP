import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_quokey",
        field: "quokey",
        caption: "프로젝트번호",
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
        id: "col_status",
        field: "status",
        caption: "상태",
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
        width: 120,
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
        id: "col_quoseq",
        field: "quoseq",
        caption: "No",
        width: 100,
      },
      {
        id: "col_testnum",
        field: "testnum",
        caption: "예약시험번호",
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
        id: "col_glpyn",
        field: "glpyn",
        caption: "GLP구분",
        width: 120,
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
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_testnum1",
        field: "testnum",
        caption: "예약시험번호",
        width: 120,
      },
      {
        id: "col_itemcd1",
        field: "itemcd",
        caption: "품목코드",
        width: 150,
      },
      {
        id: "col_itemnm1",
        field: "itemnm",
        caption: "품목명",
        width: 180,
      },
      {
        id: "col_remark1",
        field: "remark",
        caption: "비고",
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
        caption: "회의록 번호",
        width: 150,
      },
      {
        id: "col_recdt",
        field: "recdt",
        caption: "회의일",
        width: 120,
      },
      {
        id: "col_title",
        field: "title",
        caption: "제목",
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
        id: "col_user_id",
        field: "user_id",
        caption: "SM담당자",
        width: 120,
      },
      {
        id: "col_request_date",
        field: "request_date",
        caption: "문의일",
        width: 120,
      },
      {
        id: "col_completion_date",
        field: "completion_date",
        caption: "답변기한요청일",
        width: 120,
      },
      {
        id: "col_require_type",
        field: "require_type",
        caption: "문의분야",
        width: 120,
      },
      {
        id: "col_title2",
        field: "title",
        caption: "제목",
        width: 150,
      },
      {
        id: "col_medicine_type",
        field: "medicine_type",
        caption: "의약품 상세분류",
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
        id: "col_itemcd2",
        field: "itemcd",
        caption: "품목코드",
        width: 150,
      },
      {
        id: "col_itemnm2",
        field: "itemnm",
        caption: "품목명",
        width: 150,
      },
    ],
  },
];
