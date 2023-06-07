import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_pgmdiv",
        field: "pgmdiv",
        caption: "구분",
        width: 120,
      },
      {
        id: "col_qcdt",
        field: "qcdt",
        caption: "검사일자",
        width: 120,
      },
      {
        id: "col_strtime",
        field: "strtime",
        caption: "측정시작시간",
        width: 150,
      },
      {
        id: "col_endtime",
        field: "endtime",
        caption: "측정종료시간",
        width: 150,
      },
      {
        id: "col_qctime",
        field: "qctime",
        caption: "소요시간",
        width: 100,
      },
      {
        id: "col_qcno",
        field: "qcno",
        caption: "검사차수",
        width: 100,
      },
      {
        id: "col_qcperson",
        field: "qcperson",
        caption: "검사자",
        width: 100,
      },
      {
        id: "col_qcdicision",
        field: "qcdicision",
        caption: "판정",
        width: 100,
      },
      {
        id: "col_prodemp",
        field: "prodemp",
        caption: "작업자",
        width: 100,
      },
      {
        id: "col_proccd",
        field: "proccd",
        caption: "공정",
        width: 120,
      },
      {
        id: "col_lotnum",
        field: "lotnum",
        caption: "LOT NO",
        width: 120,
      },
      {
        id: "col_itemcd",
        field: "itemcd",
        caption: "품목코드",
        width: 120,
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
        id: "col_inspeccd",
        field: "inspeccd",
        caption: "검사항목",
        width: 120,
      },
      {
        id: "col_qc_spec",
        field: "qc_spec",
        caption: "측정기준명",
        width: 150,
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
      {
        id: "col_qckey",
        field: "qckey",
        caption: "검사실적번호",
        width: 150,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_proddt",
        field: "proddt",
        caption: "생산일자",
        width: 120,
      },
      {
        id: "col_rekey",
        field: "rekey",
        caption: "생산번호",
        width: 150,
      },
      {
        id: "col_prodemp",
        field: "prodemp",
        caption: "작업자",
        width: 120,
      },

      {
        id: "col_itemcd2",
        field: "itemcd",
        caption: "제공품코드",
        width: 150,
      },
      {
        id: "col_itemnm2",
        field: "itemnm",
        caption: "제공품명",
        width: 150,
      },
      {
        id: "col_insiz2",
        field: "insiz",
        caption: "제공품규격",
        width: 120,
      },

      {
        id: "col_goodqty",
        field: "goodqty",
        caption: "양품수량",
        width: 100,
      },
      {
        id: "col_badqty",
        field: "badqty",
        caption: "불량수량",
        width: 100,
      },
      {
        id: "col_inproccd",
        field: "inproccd",
        caption: "투입품공정",
        width: 120,
      },
      {
        id: "col_inqty",
        field: "inqty",
        caption: "투입량",
        width: 100,
      },
      {
        id: "col_initemcd",
        field: "initemcd",
        caption: "투입품코드",
        width: 150,
      },
      {
        id: "col_initemnm",
        field: "initemnm",
        caption: "투입품명",
        width: 150,
      },
      {
        id: "col_usetype",
        field: "usetype",
        caption: "투입경로",
        width: 100,
      },
      {
        id: "col_procseq",
        field: "procseq",
        caption: "공정순서",
        width: 100,
      },
    ],
  },{
    gridName: "grdList4",
    columns: [
      {
        id: "col_outdt",
        field: "outdt",
        caption: "불출일자",
        width: 120,
      },
      {
        id: "col_lotnum3",
        field: "lotnum",
        caption: "LOT NO",
        width: 150,
      },
      {
        id: "col_itemcd3",
        field: "itemcd",
        caption: "품목코드",
        width: 150,
      },
      {
        id: "col_itemnm3",
        field: "itemnm",
        caption: "품목명",
        width: 150,
      },
      {
        id: "col_insiz3",
        field: "insiz",
        caption: "규격",
        width: 150,
      },
      {
        id: "col_user_name",
        field: "user_name",
        caption: "사용자명",
        width: 120,
      },
      {
        id: "col_qty3",
        field: "qty",
        caption: "수량",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_indt2",
        field: "indt",
        caption: "입고일자",
        width: 120,
      },
      {
        id: "col_gubun2",
        field: "gubun",
        caption: "구분",
        width: 120,
      },
      {
        id: "col_itemcd4",
        field: "itemcd",
        caption: "품목코드",
        width: 150,
      },
      {
        id: "col_itemnm4",
        field: "itemnm",
        caption: "품목명",
        width: 150,
      },
      {
        id: "col_insiz4",
        field: "insiz",
        caption: "규격",
        width: 150,
      },
      {
        id: "col_lotnum4",
        field: "lotnum",
        caption: "LOT NO",
        width: 150,
      },
      {
        id: "col_inqty2",
        field: "inqty",
        caption: "입고량",
        width: 100,
      },
      {
        id: "col_outqty2",
        field: "outqty",
        caption: "출고량",
        width: 100,
      },
      {
        id: "col_custnm2",
        field: "custnm",
        caption: "업체명",
        width: 150,
      },
    ],
  },
];
