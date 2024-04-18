import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_status",
        field: "status",
        caption: "상태",
        width: 120,
      },
      {
        id: "col_is_emergency",
        field: "is_emergency",
        caption: "긴급여부",
        width: 80,
      },
      {
        id: "col_request_date",
        field: "request_date",
        caption: "문의일자",
        width: 120,
      },
      {
        id: "col_finexpdt",
        field: "finexpdt",
        caption: "답변기한일",
        width: 120,
      },
      {
        id: "col_completion_date",
        field: "completion_date",
        caption: "답변일자",
        width: 120,
      },
      {
        id: "col_extra_field2",
        field: "extra_field2",
        caption: "물질상세분야",
        width: 120,
      },
      {
        id: "col_user_name",
        field: "user_name",
        caption: "영업담당자",
        width: 120,
      },
      {
        id: "col_customernm",
        field: "customernm",
        caption: "업체명",
        width: 120,
      },
      {
        id: "col_title",
        field: "title",
        caption: "제목",
        width: 120,
      },
      {
        id: "col_project",
        field: "project",
        caption: "PJT NO.",
        width: 120,
      },
      {
        id: "col_document_id",
        field: "document_id",
        caption: "등록번호",
        width: 150,
      },
      {
        id: "col_materialtype",
        field: "materialtype",
        caption: "물질분야",
        width: 120,
      },
      {
        id: "col_require_type",
        field: "require_type",
        caption: "문의분야",
        width: 120,
      },
      {
        id: "col_completion_method",
        field: "completion_method",
        caption: "문의답변방법",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "PM담당자",
        width: 120,
      }, 
    ],
  },
];
