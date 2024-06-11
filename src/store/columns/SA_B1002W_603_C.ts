import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_quonum",
        field: "quonum",
        caption: "PJT NO.",
        width: 150,
      },
      {
        id: "col_quorev",
        field: "quorev",
        caption: "REV",
        width: 100,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 120,
      },
      {
        id: "col_custprsnm",
        field: "custprsnm",
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
        id: "col_quotype",
        field: "quotype",
        caption: "의뢰유형",
        width: 120,
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
        id: "col_week_b",
        field: "week_b",
        caption: "기본(주차)",
        width: 100,
      },
      {
        id: "col_week_r",
        field: "week_r",
        caption: "회복(주차)",
        width: 100,
      },
      {
        id: "col_qty_t",
        field: "qty_t",
        caption: "TK",
        width: 100,
      },
      {
        id: "col_tkyn",
        field: "tkyn",
        caption: "TK여부",
        width: 100,
      },
      {
        id: "col_totqty",
        field: "totqty",
        caption: "총 마리수",
        width: 100,
      },

      {
        id: "col_designyn_quo",
        field: "designyn",
        caption: "디자인 입력여부",
        width: 120,
      },
      {
        id: "col_quocalyn",
        field: "quocalyn",
        caption: "견적산출여부",
        width: 120,
      },
      {
        id: "col_confinyn",
        field: "confinyn",
        caption: "계약전환여부",
        width: 110,
      },
      {
        id: "col_pubdt",
        field: "pubdt",
        caption: "견적발행일",
        width: 120,
      },
      {
        id: "col_cotracdt",
        field: "cotracdt",
        caption: "계약일자",
        width: 120,
      },
      {
        id: "col_quounp",
        field: "quounp",
        caption: "견적원가",
        width: 100,
      },
      {
        id: "col_margin",
        field: "margin",
        caption: "마진률",
        width: 100,
      },
      {
        id: "col_marginamt",
        field: "marginamt",
        caption: "마진금액",
        width: 100,
      },
      {
        id: "col_discount",
        field: "discount",
        caption: "할인률",
        width: 100,
      },
      {
        id: "col_discountamt",
        field: "discountamt",
        caption: "할인금액",
        width: 100,
      },
      {
        id: "col_finalquowonamt",
        field: "finalquowonamt",
        caption: "최종견적금액",
        width: 100,
      }
    ]
  }
];
