export class List<T> {
  private items: Array<T>;

  constructor() {
    this.items = [];
  }

  size(): number {
    return this.items.length;
  }

  add(value: T): Array<T> {
    this.items.push(value);
    return this.items;
  }

  get(index: number): T {
    return this.items[index];
  }

  remove(index: number): Array<T> {
    this.items.splice(index, 1);
    return this.items;
  }
}

export interface Iparameters {
  procedureName: string;
  pageNumber: number;
  pageSize: number;
  parameters: {};
}

export type Token = {
  token: string;
  userId: string;
  userName: string;
  role: string;
  companyCode: string;
  serviceName: string;
  customerName: string;
  serviceUrl: string;
  internalIp: string;
};

export type CategoryDto = {
  id?: number;
  name?: string;
  key: string;
};

export type Category = {
  sub_code: string;
  code_name?: string;
};

export type TCommonCode = {
  sub_code: string;
  code_name: string;
};

export type User = {
  nick: string;
  route: string;
  username: string;
  realName: string;
};

export type TGrid = {
  gridName: string;
  columns: Array<TColumn>;
};

export type TColumn = {
  id: string;
  field: string;
  caption: string;
  width: number;
};

export type TcontrolObj = {
  rowstatus: string;
  form_id: string;
  control_name: string;
  field_name: string;
  parent: string;
  type: string;
  word_id: string;
  word_text: string;
};
