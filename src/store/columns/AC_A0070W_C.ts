import { TGrid } from "../types";

export const gridList: Array<TGrid> = [
  {
    gridName: "grdMaster",
    columns: [{
        id: "col_bookregyn",
        field: "bookregyn",
        caption: "장부반영여부",
        width: 114
    }, {
        id: "col_acntcd",
        field: "acntcd",
        caption: "계정과목코드",
        width: 104
    }, {
        id: "col_acntnm",
        field: "acntnm",
        caption: "계정과목명",
        width: 127
    }, {
        id: "col_cbalamt",
        field: "cbalamt",
        caption: "차변",
        width: 110
    }, {
        id: "col_Dbalamt",
        field: "dbalamt",
        caption: "대변",
        width: 127
    }, {
        id: "col_custcd",
        field: "custcd",
        caption: "업체코드",
        width: 110
    }, {
        id: "col_custnm",
        field: "custnm",
        caption: "업체명",
        width: 421
    }]
  }, 
  {
    gridName: "grdItem",
    columns: [{
        id: "col_mngitemnm",
        field: "mngitemnm",
        caption: "관리항목",
        width: 100
    }, {
        id: "col_mngdata",
        field: "mngdata",
        caption: "데이터",
        width: 127
    }, {
        id: "col_mngdatanm",
        field: "mngdatanm",
        caption: "데이터명",
        width: 169
    }]
  }];
