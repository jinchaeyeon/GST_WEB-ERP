import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    // 요약정보
    gridName: "grdList",
    columns: [
      {
        id: "col_quokey",
        field: "quokey",
        caption: "PJT NO.",
        width: 150,
      },
      {
        id: "col_contractno",
        field: "contractno",
        caption: "계약번호",
        width: 150,
      },
      {
        id: "col_cotracdt",
        field: "cotracdt",
        caption: "계약일자",
        width: 120,
      },
      {
        id: "col_strdt",
        field: "strdt",
        caption: "계약시작일자",
        width: 120,
      },
      {
        id: "col_enddt",
        field: "enddt",
        caption: "계약종료일자",
        width: 120,
      },
      {
        id: "col_project",
        field: "project",
        caption: "계약명",
        width: 200,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 120,
      },
      {
        id: "col_custprsnnm",
        field: "custprsnnm",
        caption: "의뢰자",
        width: 120,
      },
      {
        id: "col_chkperson",
        field: "chkperson",
        caption: "영업담당자",
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
        id: "col_totamt",
        field: "totamt",
        caption: "최종계약금액",
        width: 120,
      },
      {
        id: "col_payment",
        field: "payment",
        caption: "지급조건",
        width: 150,
      },
      {
        id: "col_paydt",
        field: "paydt",
        caption: "청구예정일",
        width: 120,
      },
    ],
  },
];
