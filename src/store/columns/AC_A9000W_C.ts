import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_acntcd",
        field: "acntcd",
        caption: "재고계정",
        width: 100,
      }, 
      {
        id: "col_baseamt",
        field: "baseamt",
        caption: "기초금액",
        width: 100,
      },   
      {
        id: "col_inamt",
        field: "inamt",
        caption: "입고금액",
        width: 100,
      },    
      {
        id: "col_chainamt",
        field: "chainamt",
        caption: "타계정대체입금액",
        width: 100,
      },    
      {
        id: "col_outamt",
        field: "outamt",
        caption: "출고금액",
        width: 100,
      },    
      {
        id: "col_chaoutamt",
        field: "chaoutamt",
        caption: "타계정대체출금액",
        width: 100,
      },    
      {
        id: "col_inoutamt",
        field: "inoutamt",
        caption: "재고금액",
        width: 100,
      },    
      {
        id: "col_adjustamt",
        field: "adjustamt",
        caption: "기초+입고-출고-재고",
        width: 100,
      },          
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_acntcd3",
        field: "acntcd",
        caption: "계정코드",
        width: 100,
      },
      {
        id: "col_acntnm3",
        field: "acntnm",
        caption: "계정과목명",
        width: 100,
      },
      {
        id: "col_slipmat3",
        field: "slipmat",
        caption: "누적금액",
        width: 100,
      },
      {
        id: "col_stdamt3",
        field: "stdamt",
        caption: "당월금액",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList4",
    columns: [
      {
        id: "col_acntcd4",
        field: "acntcd",
        caption: "계정코드",
        width: 100,
      },
      {
        id: "col_acntnm4",
        field: "acntnm",
        caption: "계정과목명",
        width: 100,
      },
      {
        id: "col_slipmat4",
        field: "slipmat",
        caption: "누적금액",
        width: 100,
      },
      {
        id: "col_stdamt4",
        field: "stdamt",
        caption: "당월금액",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList5",
    columns: [
      {
        id: "col_acntcd5",
        field: "acntcd",
        caption: "계정코드",
        width: 100,
      },
      {
        id: "col_acntnm5",
        field: "acntnm",
        caption: "계정과목명",
        width: 100,
      },
      {
        id: "col_slipmat5",
        field: "slipmat",
        caption: "누적금액",
        width: 100,
      },
      {
        id: "col_stdamt5",
        field: "stdamt",
        caption: "당월금액",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList6",
    columns: [
      {
        id: "col_acntcd6",
        field: "acntcd",
        caption: "계정코드",
        width: 100,
      },
      {
        id: "col_acntnm6",
        field: "acntnm",
        caption: "계정과목명",
        width: 100,
      },
      {
        id: "col_slipmat6",
        field: "slipmat",
        caption: "누적금액",
        width: 100,
      },
      {
        id: "col_stdamt6",
        field: "stdamt",
        caption: "당월금액",
        width: 100,
      },
    ],
  },
];