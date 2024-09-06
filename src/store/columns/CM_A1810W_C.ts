import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체",
        width: 120,
      },
      {
        id: "col_project",
        field: "project",
        caption: "프로젝트",
        width: 150,
      },
      {
        id: "col_cotracdt",
        field: "cotracdt",
        caption: "계약일",
        width: 120,
      },
      {
        id: "col_recdt",
        field: "recdt",
        caption: "PJ요청일",
        width: 120,
      },
      {
        id: "col_finexpdt",
        field: "finexpdt",
        caption: "PJ완료예정일",
        width: 120,
      },
      {
        id: "col_progress_status",
        field: "progress_status",
        caption: "진행",
        width: 80,
      },
      {
        id: "col_is_finished",
        field: "is_finished",
        caption: "완료",
        width: 80,
      },
      {
        id: "col_pjtperson",
        field: "pjtperson",
        caption: "사업진행담당",
        width: 120,
      },
      {
        id: "col_pjtmanager",
        field: "pjtmanager",
        caption: "담당PM",
        width: 120,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 200,
      },
      {
        id: "col_devmngnum",
        field: "devmngnum",
        caption: "개발관리번호",
        width: 150,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_date",
        field: "date",
        caption: "일자",
        width: 120,
      },
      {
        id: "col_title",
        field: "title",
        caption: "제목",
        width: 300,
      },
      {
        id: "col_is_monitoring",
        field: "is_monitoring",
        caption: "모니터링",
        width: 100,
      },
      {
        id: "col_user_name",
        field: "user_name",
        caption: "작성자 ",
        width: 120,
      },
      {
        id: "col_finyn",
        field: "finyn",
        caption: "완료",
        width: 80,
      },
    ],
  },
];
