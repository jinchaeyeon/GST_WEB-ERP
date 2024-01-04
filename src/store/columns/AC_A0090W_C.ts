import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_gisu",
        field: "gisu",
        caption: "기수",
        width: 120,
      },
      {
        id: "col_chasu",
        field: "chasu",
        caption: "신고차수",
        width: 120,
      },
      {
        id: "col_taxdt1",
        field: "taxdt1",
        caption: "신고일자1",
        width: 120,
      },
      {
        id: "col_taxdt2",
        field: "taxdt2",
        caption: "신고일자2",
        width: 120,
      },
      {
        id: "col_inputdt",
        field: "inputdt",
        caption: "작성일자",
        width: 120,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "제출사유",
        width: 200,
      },
      {
        id: "col_chr1",
        field: "chr1",
        caption: "총괄납부신고번호",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_docunm",
        field: "docunm",
        caption: "서류명",
        width: 120,
      },
      {
        id: "col_inname",
        field: "inname",
        caption: "발급자",
        width: 120,
      },
      {
        id: "col_indate",
        field: "indate",
        caption: "발급일자",
        width: 120,
      },
      {
        id: "col_shipdt",
        field: "shipdt",
        caption: "선적일자",
        width: 120,
      },
      {
        id: "col_paycd",
        field: "paycd",
        caption: "통화코드",
        width: 120,
      },
      {
        id: "col_payrate",
        field: "payrate",
        caption: "환율",
        width: 100,
      },
      {
        id: "col_jypay",
        field: "jypay",
        caption: "제출외화금액",
        width: 100,
      },
      {
        id: "col_jwpay",
        field: "jwpay",
        caption: "제출원화금액",
        width: 100,
      },
      {
        id: "col_sypay",
        field: "sypay",
        caption: "신고외화금액",
        width: 100,
      },
      {
        id: "col_swpay",
        field: "swpay",
        caption: "신고원화금액",
        width: 100,
      },
      {
        id: "col_docuno",
        field: "docuno",
        caption: "전자발급서류번호",
        width: 150,
      },
      {
        id: "col_bizregnum",
        field: "bizregnum",
        caption: "사업자번호",
        width: 150,
      },
    ],
  },
];
