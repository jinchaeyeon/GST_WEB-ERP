import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_dlvdt",
        field: "dlvdt",
        caption: "납기일자",
        width: 120,
      },
      {
        id: "col_custnm",
        field: "custnm",
        caption: "고객처",
        width: 150,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 150,
      },
      {
        id: "col_itemdiv",
        field: "itemdiv",
        caption: "유형",
        width: 120,
      },
      {
        id: "col_ordsiz",
        field: "ordsiz",
        caption: "사이즈",
        width: 150,
      },
      {
        id: "col_specnum",
        field: "specnum",
        caption: "원산지",
        width: 120,
      },
      {
        id: "col_specsize",
        field: "specsize",
        caption: "규격",
        width: 100,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "수주량",
        width: 100,
      },
      {
        id: "col_sqty",
        field: "sqty",
        caption: "소분량",
        width: 100,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "적요",
        width: 200,
      },
      {
        id: "col_rcvcustnm",
        field: "rcvcustnm",
        caption: "납품처",
        width: 120,
      },
      {
        id: "col_cnt1",
        field: "cnt1",
        caption: "속지",
        width: 100,
      },
      {
        id: "col_cnt2",
        field: "cnt2",
        caption: "겉지",
        width: 100,
      },
      {
        id: "col_ordnum",
        field: "ordnum",
        caption: "수주번호",
        width: 150,
      },
      {
        id: "col_ordseq",
        field: "ordseq",
        caption: "수주순번",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_num",
        field: "num",
        caption: "NO",
        width: 80,
      },
      {
        id: "col_qty2",
        field: "qty",
        caption: "중량",
        width: 100,
      },
      {
        id: "col_prtqty",
        field: "prtqty",
        caption: "인쇄수",
        width: 100,
      },
      {
        id: "col_prtdt",
        field: "prtdt",
        caption: "출력일시",
        width: 150,
      },
      {
        id: "col_moddt",
        field: "moddt",
        caption: "수정일시",
        width: 150,
      },
    ],
  },
];
