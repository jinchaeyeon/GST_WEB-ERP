import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_itemcd",
        field: "itemcd",
        caption: "품목코드",
        width: 350,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 350,
      },
      {
        id: "col_spec",
        field: "spec",
        caption: "사양",
        width: 250,
      },
      {
        id: "col_insiz",
        field: "insiz",
        caption: "규격",
        width: 250,
      },
      {
        id: "col_invunit",
        field: "invunit",
        caption: "구매단위",
        width: 120,
      },
      {
        id: "col_itemacnt",
        field: "itemacnt",
        caption: "품목계정",
        width: 120,
      },
      {
        id: "col_cnt",
        field: "cnt",
        caption: "건수",
        width: 100,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_sub_code",
        field: "sub_code",
        caption: "공정코드",
        width: 200,
      },
      {
        id: "col_code_name",
        field: "code_name",
        caption: "공정명",
        width: 200,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_proccd",
        field: "proccd",
        caption: "공정",
        width: 120,
      },
      {
        id: "col_procseq",
        field: "procseq",
        caption: "공정순서",
        width: 120,
      },
      {
        id: "col_outprocyn",
        field: "outprocyn",
        caption: "외주구분",
        width: 120,
      },
      {
        id: "col_itemcd2",
        field: "itemcd",
        caption: "재공품코드",
        width: 120,
      },
      {
        id: "col_itemnm2",
        field: "itemnm",
        caption: "재공품명",
        width: 120,
      },
      {
        id: "col_insiz2",
        field: "insiz",
        caption: "재공품규격",
        width: 120,
      },
      {
        id: "col_procqty",
        field: "procqty",
        caption: "재공생산량",
        width: 100,
      },
      {
        id: "col_procunit",
        field: "procunit",
        caption: "생산량단위",
        width: 120,
      },
      {
        id: "col_stdtime",
        field: "stdtime",
        caption: "표준시간",
        width: 100,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 150,
      },
    ],
  },
];
