import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_reckey",
        field: "reckey",
        caption: "입고번호",
        width: 150,
      },
      {
        id: "col_indt",
        field: "indt",
        caption: "입고일자",
        width: 120,
      },
      {
        id: "col_person",
        field: "person",
        caption: "담당자",
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
        id: "col_insiz",
        field: "insiz",
        caption: "규격",
        width: 120,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "수량",
        width: 100,
      },
      {
        id: "col_lotnum",
        field: "lotnum",
        caption: "LOT NO",
        width: 120,
      },
      {
        id: "col_ordkey",
        field: "ordkey",
        caption: "수주번호",
        width: 150,
      },
      {
        id: "col_qcyn",
        field: "qcyn",
        caption: "검사유무",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_qcdt",
        field: "qcdt",
        caption: "검사일자",
        width: 120,
      },
      {
        id: "col_person2",
        field: "person",
        caption: "담당자",
        width: 120,
      },
      {
        id: "col_qcno",
        field: "qcno",
        caption: "검사차수",
        width: 120,
      },
      {
        id: "col_qcqty",
        field: "qcqty",
        caption: "검사수량",
        width: 100,
      },
      {
        id: "col_badqty",
        field: "badqty",
        caption: "불량수량",
        width: 100,
      },
      {
        id: "col_strtime",
        field: "strtime",
        caption: "시작시간",
        width: 150,
      },
      {
        id: "col_endtime",
        field: "endtime",
        caption: "종료시간",
        width: 150,
      },
      {
        id: "col_result1",
        field: "result1",
        caption: "판정",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_qc_sort",
        field: "qc_sort",
        caption: "검사순번",
        width: 100,
      },
      {
        id: "col_inspeccd",
        field: "inspeccd",
        caption: "검사항목",
        width: 120,
      },
      {
        id: "col_qc_spec",
        field: "qc_spec",
        caption: "측정기준명",
        width: 120,
      },
      {
        id: "col_qcvalue1",
        field: "qcvalue1",
        caption: "측정값",
        width: 100,
      },
      {
        id: "col_qcresult1",
        field: "qcresult1",
        caption: "측정결과",
        width: 120,
      },
    ],
  },
];
