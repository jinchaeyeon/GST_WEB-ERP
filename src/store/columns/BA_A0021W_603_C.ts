import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_num",
        field: "num",
        caption: "NO",
        width: 80,
      },
      {
        id: "col_custdiv",
        field: "custdiv",
        caption: "구분",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "회사명",
        width: 120,
      },
      {
        id: "col_itemlvl3",
        field: "itemlvl3",
        caption: "개발분야",
        width: 120,
      },
      {
        id: "col_meet_cnt",
        field: "meet_cnt",
        caption: "상담 수",
        width: 100,
      },
      {
        id: "col_esti_cnt",
        field: "esti_cnt",
        caption: "견적 수",
        width: 100,
      },
      {
        id: "col_cont_cnt",
        field: "cont_cnt",
        caption: "계약 수",
        width: 100,
      },
      {
        id: "col_cont_amt",
        field: "cont_amt",
        caption: "계약금액",
        width: 100,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "기청구액",
        width: 100,
      },
      {
        id: "col_no_amt",
        field: "no_amt",
        caption: "미청구액",
        width: 100,
      },
      {
        id: "col_misu_amt",
        field: "misu_amt",
        caption: "미수금액",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_ref_key",
        field: "ref_key",
        caption: "PJT NO.",
        width: 150,
      },
      {
        id: "col_recdt",
        field: "recdt",
        caption: "작성일자",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "작성자",
        width: 120,
      },
      {
        id: "col_usegb",
        field: "usegb",
        caption: "목적",
        width: 120,
      },
      {
        id: "col_type",
        field: "type",
        caption: "유형",
        width: 120,
      },
      {
        id: "col_custprsnnm",
        field: "custprsnnm",
        caption: "의뢰자명",
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
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_quonum",
        field: "quonum",
        caption: "PJT NO.",
        width: 150,
      },
      {
        id: "col_quodt",
        field: "quodt",
        caption: "견적발행일",
        width: 120,
      },
      {
        id: "col_quoamt",
        field: "quoamt",
        caption: "견적금액",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList4",
    columns: [
      {
        id: "col_conno",
        field: "conno",
        caption: "PJT NO.",
        width: 150,
      },
      {
        id: "col_connum",
        field: "connum",
        caption: "계약번호",
        width: 150,
      },
      {
        id: "col_amt2",
        field: "amt",
        caption: "계약금액",
        width: 100,
      },
    ],
  },
];
