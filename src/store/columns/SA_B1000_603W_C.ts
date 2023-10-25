import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    // 요약정보
    gridName: "grdList",
    columns: [ 
      {
        id: "col_ref_key",
        field: "ref_key",
        caption: "프로젝트 번호",
        width: 150,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "고객사",
        width: 150,
      },
      {
        id: "col_smperson",
        field: "smperson",
        caption: "SM담당자",
        width: 120,
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
    ],
  },
  {
    // 요약정보
    gridName: "grdList2",
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
        id: "col_person",
        field: "person",
        caption: "작성자",
        width: 120,
      },
    ],
  },
  {
    // 요약정보
    gridName: "grdList3",
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
    gridName: "grdList4",
    columns: [ 
      {
        id: "col_quokey",
        field: "quokey",
        caption: "견적번호",
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
    ],
  },
];