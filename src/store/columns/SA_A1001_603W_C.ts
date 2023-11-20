import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_requestnum",
        field: "requestnum",
        caption: "의뢰번호",
        width: 150,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "의뢰기관",
        width: 120,
      },
      {
        id: "col_custprsnnm",
        field: "custprsnnm",
        caption: "의뢰자",
        width: 120,
      },   
      {
        id: "col_materialtype",
        field: "materialtype",
        caption: "물질분야",
        width: 120,
      },
      {
        id: "col_designyn",
        field: "designyn",
        caption: "디자인 입력 여부",
        width: 120,
      },
      {
        id: "col_quocalyn",
        field: "quocalyn",
        caption: "견적산출여부",
        width: 120,
      },
      {
        id: "col_quofinyn",
        field: "quofinyn",
        caption: "견적확정여부",
        width: 120,
      },
      {
        id: "col_quorev",
        field: "quorev",
        caption: "견적 rev",
        width: 100,
      },
      {
        id: "col_quodt",
        field: "quodt",
        caption: "견적 발행일",
        width: 120,
      },
      {
        id: "col_quoamt",
        field: "quoamt",
        caption: "견적금액",
        width: 100,
      },
      {
        id: "col_person",
        field: "person",
        caption: "담당자",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_itemcd",
        field: "itemcd",
        caption: "품목코드",
        width: 150,
      },
      {
        id: "col_testitem",
        field: "testitem",
        caption: "시험품목",
        width: 150,
      },
      {
        id: "col_quowonamt",
        field: "quowonamt",
        caption: "견적원가",
        width: 100,
      },   
      {
        id: "col_marginamt",
        field: "marginamt",
        caption: "마진률",
        width: 100,
      },
      {
        id: "col_discountamt",
        field: "discountamt",
        caption: "할인률",
        width: 100,
      },
      {
        id: "col_finalquowonamt",
        field: "finalquowonamt",
        caption: "최종견적금액",
        width: 100,
      },
    ],
  },
];
