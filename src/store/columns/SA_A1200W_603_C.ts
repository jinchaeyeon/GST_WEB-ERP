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
        id: "col_conplandt_list",
        field: "conplandt",
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
        id: "col_contradt_list",
        field: "contradt",
        caption: "계약일",
        width: 150,
      },
      {
        id: "col_seq_list",
        field: "seq",
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
    ],
  },
  {
    // 코멘트
    gridName: "grdList2",
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
];
