import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_gubun",
        field: "gubun",
        caption: "구분",
        width: 120,
      },
      {
        id: "col_regdt",
        field: "regdt",
        caption: "입력시간",
        width: 150,
      },
      {
        id: "col_custabbr",
        field: "custabbr",
        caption: "고객처명",
        width: 150,
      },
      {
        id: "col_dlvdt",
        field: "dlvdt",
        caption: "납기일자",
        width: 120,
      },
      {
        id: "col_itemnm",
        field: "itemnm",
        caption: "품목명",
        width: 150,
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
        id: "col_bnatur_insiz",
        field: "bnatur_insiz",
        caption: "규격",
        width: 120,
      },
      {
        id: "col_qty",
        field: "qty",
        caption: "수주량",
        width: 100,
      },
      {
        id: "col_qtyunit",
        field: "qtyunit",
        caption: "단위",
        width: 120,
      },
      {
        id: "col_hsqty",
        field: "hsqty",
        caption: "환산수량",
        width: 100,
      },
      {
        id: "col_hscode",
        field: "hscode",
        caption: "환산단위",
        width: 120,
      },
      {
        id: "col_rcvcustnm",
        field: "rcvcustnm",
        caption: "납품처",
        width: 150,
      },
      {
        id: "col_remark",
        field: "remark",
        caption: "비고",
        width: 200,
      },
      {
        id: "col_basinvunp",
        field: "basinvunp",
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
        id: "col_taxamt",
        field: "taxamt",
        caption: "세액",
        width: 100,
      },
      {
        id: "col_totamt",
        field: "totamt",
        caption: "합계",
        width: 100,
      },
    ],
  },
];
