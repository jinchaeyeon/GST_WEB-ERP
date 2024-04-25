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
        id: "col_custnm_list",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
      {
        id: "col_custprsnnm_list",
        field: "custprsnnm",
        caption: "의뢰자",
        width: 120,
      },
      {
        id: "col_chkperson_list",
        field: "chkperson",
        caption: "영업담당자",
        width: 120,
      },
      {
        id: "col_quodt_list",
        field: "quodt",
        caption: "계약목표일",
        width: 120,
      },
      {
        id: "col_passdt_list",
        field: "passdt",
        caption: "경과기간",
        width: 120,
      },
      {
        id: "col_cotracdt_list",
        field: "cotracdt",
        caption: "계약일",
        width: 150,
      },
      {
        id: "col_extra_field1_list",
        field: "extra_field1",
        caption: "활동차수",
        width: 150,
      },
      {
        id: "col_feasibility_list",
        field: "feasibility",
        caption: "Feasibility",
        width: 120,
      },
      {
        id: "col_weight_list",
        field: "weight",
        caption: "Weight",
        width: 120,
      },
      {
        id: "col_extra_field2_list",
        field: "extra_field2",
        caption: "PJT 실패 여부",
        width: 120,
      },
      {
        id: "col_materialnm_list",
        field: "materialnm",
        caption: "실패유형",
        width: 150,
      },      
    ],
  },
];
