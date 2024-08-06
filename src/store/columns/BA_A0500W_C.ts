import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdList",
    columns: [
      {
        id: "col_group_name",
        field: "group_name",
        caption: "바코드명",
        width: 150,
      },
      {
        id: "col_barcodeinformation_yn",
        field: "barcodeinformation_yn",
        caption: "바코드정보(유무)",
        width: 100,
      },
      {
        id: "col_codeinformation_cnt",
        field: "codeinformation_cnt",
        caption: "코드정보 개수",
        width: 100,
      },
      {
        id: "col_use_yn",
        field: "use_yn",
        caption: "사용유무",
        width: 80,
      },
    ],
  },
  {
    gridName: "grdList2",
    columns: [
      {
        id: "col_code_name",
        field: "code_name",
        caption: "항목",
        width: 120,
      },
      {
        id: "col_extra_field1",
        field: "extra_field1",
        caption: "단위중량",
        width: 100,
      },
      {
        id: "col_extra_field2",
        field: "extra_field2",
        caption: "중량단위",
        width: 120,
      },
      {
        id: "col_extra_field3",
        field: "extra_field3",
        caption: "소수점",
        width: 120,
      },
      {
        id: "col_extra_field4",
        field: "extra_field4",
        caption: "처리",
        width: 120,
      },
      {
        id: "col_extra_field5",
        field: "extra_field5",
        caption: "일자형식",
        width: 120,
      },
      {
        id: "col_code_value",
        field: "code_value",
        caption: "항목값",
        width: 120,
      },
      {
        id: "col_code_length",
        field: "code_length",
        caption: "자리수",
        width: 100,
      },
      {
        id: "col_sort_seq",
        field: "sort_seq",
        caption: "정렬순서",
        width: 100,
      },
      {
        id: "col_memo",
        field: "memo",
        caption: "메모",
        width: 200,
      },
      {
        id: "col_sample",
        field: "sample",
        caption: "샘플",
        width: 120,
      },
    ],
  },
  {
    gridName: "grdList3",
    columns: [
      {
        id: "col_code",
        field: "code",
        caption: "코드",
        width: 120,
      },
      {
        id: "col_code_name2",
        field: "code_name",
        caption: "코드명",
        width: 150,
      },
      {
        id: "col_memo2",
        field: "memo",
        caption: "비고",
        width: 200,
      },
      {
        id: "col_process_item",
        field: "process_item",
        caption: "품목코드",
        width: 150,
      },
      {
        id: "col_process_itemnm",
        field: "process_itemnm",
        caption: "품목명",
        width: 150,
      },
    ],
  },
];
