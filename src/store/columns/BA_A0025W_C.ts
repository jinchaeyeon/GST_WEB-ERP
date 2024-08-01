import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_recdt",
        field: "recdt",
        caption: "등록일자",
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
        id: "col_log_info",
        field: "log_info",
        caption: "서버 ID/PW",
        width: 200,
      },
      {
        id: "col_AgentID",
        field: "AgentID",
        caption: "AgentID",
        width: 120,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 200,
      },
      {
        id: "col_log_ip",
        field: "log_ip",
        caption: "접속 IP",
        width: 150,
      },
      {
        id: "col_bizregnum",
        field: "bizregnum",
        caption: "사업자등록번호",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "담당자",
        width: 120,
      },
      {
        id: "col_phonenum",
        field: "phonenum",
        caption: "전화번호",
        width: 120,
      },
      {
        id: "col_send_id",
        field: "send_id",
        caption: "샌드빌 ID",
        width: 120,
      },
      {
        id: "col_send_pw",
        field: "send_pw",
        caption: "샌드빌 pw",
        width: 120,
      },
      {
        id: "col_certification",
        field: "certification",
        caption: "인증서",
        width: 120,
      },
      {
        id: "col_certification_pw",
        field: "certification_pw",
        caption: "인증서 pw",
        width: 120,
      },
    ],
  },
];
