import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_ordnum",
        field: "ordnum",
        caption: "수주번호",
        width: 120,
      },
      {
        id: "col_orddt",
        field: "orddt",
        caption: "수주일자",
        width: 120,
      },
      {
        id: "col_dlvdt",
        field: "dlvdt",
        caption: "납기일자",
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
        id: "col_rcvcustcd",
        field: "rcvcustcd",
        caption: "인수처코드",
        width: 150,
      },
      {
        id: "col_rcvcustnm",
        field: "rcvcustnm",
        caption: "인수처명",
        width: 150,
      },
      {
        id: "col_ordsts",
        field: "ordsts",
        caption: "수주상태",
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
        id: "col_itemacnt",
        field: "itemacnt",
        caption: "품목계정",
        width: 120,
      },
      {
        id: "col_insiz",
        field: "insiz",
        caption: "규격",
        width: 120,
      },
      {
        id: "col_lotnum",
        field: "lotnum",
        caption: "LOT NO",
        width: 100,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "수주수량",
        width: 100,
      },
      {
        id: "col_outqty",
        field: "outqty",
        caption: "출하수량",
        width: 100,
      },
      {
        id: "col_saleqty",
        field: "saleqty",
        caption: "판매수량",
        width: 100,
      },
      {
        id: "col_qtyunit",
        field: "qtyunit",
        caption: "수량단위",
        width: 100,
      },
      {
        id: "col_unp",
        field: "unp",
        caption: "단가",
        width: 100,
      },
      {
        id: "col_amt",
        field: "amt",
        caption: "공급가액",
        width: 100,
      },
      {
        id: "col_wonamt",
        field: "wonamt",
        caption: "원화금액",
        width: 100,
      },
      {
        id: "col_taxamt",
        field: "taxamt",
        caption: "세액",
        width: 100,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 200,
      },
      {
        id: "col_finyn",
        field: "finyn",
        caption: "완료여부",
        width: 120,
      },
      {
        id: "col_project",
        field: "project",
        caption: "프로젝트",
        width: 120,
      },
      {
        id: "col_poregnum",
        field: "poregnum",
        caption: "PO번호",
        width: 120,
      },
    ],
  },
];
