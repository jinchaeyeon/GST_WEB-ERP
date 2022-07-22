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
};
export type Api = {
  api: string;
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
