import { GridCellProps } from "@progress/kendo-react-grid";

export type TCommonCodeData = {
  sub_code: string;
  code_name: string;
};

export interface IWindowPosition {
  left: any;
  top: any;
  width: number;
  height: number;
  transform?:any;
}

export interface IAttachmentData {
  attdatnum: string;
  original_name: string;
  rowCount: number;
}

export interface ICustData {
  address: string;
  custcd: string;
  custnm: string;
  custabbr: string;
  bizregnum: string;
  custdivnm: string;
  useyn: string;
  remark: string;
  compclass: string;
  ceonm: string;
}
export interface IItemData {
  itemcd: string;
  itemno: string;
  itemnm: string;
  insiz: string;
  model: string;
  itemacnt: string;
  itemacntnm: string;
  bnatur: string;
  bnatur_insiz: number;
  spec: string;
  invunit: string;
  invunitnm: string;
  unitwgt: string;
  wgtunit: string;
  wgtunitnm: string;
  maker: string;
  dwgno: string;
  remark: string;
  itemlvl1: string;
  itemlvl2: string;
  itemlvl3: string;
  extra_field1: string;
  extra_field2: string;
  extra_field7: string;
  extra_field6: string;
  extra_field8: string;
  packingsiz: string;
  unitqty: string;
  color: string;
  gubun: string;
  qcyn: string;
  outside: string;
  itemthick: string;
  itemlvl4: string;
  itemlvl5: string;
  custitemnm: string;
  origin: string;
  hscode: string;
  numref1: number;
  numref2: number;
  itemdiv: string;
  itemtype: string;
  pac: string;
  taxdiv: string;
  unpcalmeth: string;
}

export interface IUnpList {
  custcd: string;
  list: [];
}

export interface IComboBoxColumns {
  sortOrder: number;
  fieldName: string;
  caption: string;
  columnWidth: number;
  dataAlignment: string;
}

export interface IFormComboBoxCell extends GridCellProps {
  bizComponent?: any;
  valueField?: string;
  textField?: string;
  data?: any[];
  columns?: IComboBoxColumns[];
}
