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
        id: "col_request_date",
        field: "request_date",
        caption: "문의일",
        width: 120,
      },
      {
        id: "col_finexpdt",
        field: "finexpdt",
        caption: "답변기한요청일",
        width: 120,
      },
      {
        id: "col_completion_date",
        field: "completion_date",
        caption: "답변완료일",
        width: 120,
      },
      {
        id: "col_medicine_type",
        field: "medicine_type",
        caption: "의약품상세분류",
        width: 120,
      },
      {
        id: "col_user_name",
        field: "user_name",
        caption: "SM담당자",
        width: 120,
      },
      {
        id: "col_customernm",
        field: "customernm",
        caption: "회사명",
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
        caption: "프로젝트",
        width: 120,
      },
    ],
  },
];
