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

export type TToken = {
  token: string;
  userId: string;
  langCode: string;
  userName: string;
  role: string;
  companyCode: string;
  serviceName: string;
  customerName: string;
  loginKey: string;
};

export type TCommonCode = {
  sub_code: string;
  code_name: string;
};

export type TSessionItem = {
  code: TSessionItemCode;
  value: string;
};

// Ok (정상)
// Expired (만료됨) → 반드시 비밀번호 변경
// BeforeExpiry (만료전) → 비밀번호 변경 알림
// Initial (초기값) → 반드시 비밀번호 변경
export type TPasswordExpirationInfo = {
  status: "Ok" | "Expired" | "BeforeExpiry" | "Initial";
  useExpiration: boolean;
  lastChangePasswordDate: string;
  expirationDate: string;
  remainingDays: number;
};
export type TPasswordRequirements = {
  useExpiration: boolean;
  expirationPeriodMonths: number;
  minimumLength: number;
  useSpecialChar: boolean;
  useChangeNext: boolean;
  useAccessRestriction: boolean;
  maximumNumberOfWrongs: number;
  useNotifyBeforePeriod: boolean;
  notifyBeforePeriodDays: number;
};

export type TSessionItemCode =
  | "user_id"
  | "user_name"
  | "orgdiv"
  | "location"
  | "position"
  | "dptcd";

export type TPermissions = {
  view: boolean;
  save: boolean;
  delete: boolean;
  print: boolean;
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
  fixed?: "None" | "Left" | "Right";
};

export type TControlObj = {
  rowstatus: string;
  form_id: string;
  control_name: string;
  field_name: string;
  parent: string;
  type: string;
  word_id: string;
  word_text: string;
};

export type TMenu = {
  level: number;
  menuId: string;
  menuName: string;
  parentMenuId: string;
  formId: string;
  assemblyFile: string;
  fileFolder: string;
  parameterInfo: string;
  releaseStatus: string;
  menuCategory: string;
  sort: number;
};

export type TPath = {
  path: string;
  menuName: string;
  index: string;
  menuId: string;
  parentMenuId: string;
  menuCategory: string;
};

// TypeScript에서 string key로 객체에 접근하기 위한 객체 타입
export type TObject = {
  [key: string]: string;
};

export type TLogParaVal = {
  work_type: string;
  form_id: string;
  form_name: string;
  form_login_key: string;
};
