import { atom, AtomEffect, DefaultValue } from "recoil";
import { DEFAULT_SESSION_ITEM } from "../components/CommonString";
import {
  TInfoItem,
  TLoginResult,
  TMenu,
  TPasswordExpirationInfo,
  TpointsItem,
  TSessionItem,
} from "./types";
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();

const localStorageEffect: <T>(key: string) => AtomEffect<T> =
  (key: string) =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key);

    if (savedValue != null) {
      try {
        setSelf(JSON.parse(savedValue));
      } catch (e) {
        localStorage.removeItem(key);
        setSelf(new DefaultValue());
      }
    }
    onSet((newValue: any) => {
      if (newValue instanceof DefaultValue || newValue == null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    });
  };
export const accessTokenState = atom<String | null>({
  key: "accessTokenState",
  default: null as any,
});

export const loginResultState = atom<TLoginResult>({
  key: "loginResultState",
  default: null as any,
  effects_UNSTABLE: [localStorageEffect("loginResult")],
});

export const menusState = atom<Array<TMenu>>({
  key: "menusState",
  default: null as any,
  effects_UNSTABLE: [persistAtom]
});

export const clickedState = atom<string>({
  key: "clickedState",
  default: "",
});

export const linkState = atom<any>({
  key: "linkState",
  default: "",
  effects_UNSTABLE: [persistAtom]
});

export const infoState = atom<TInfoItem>({
  key: "infoState",
  default: {
    caption: "",
    form_id: "",
    key: "",
  },
});

export const pointsState = atom<TpointsItem>({
  key: "pointsState",
  default: {
    x: 0,
    y: 0,
  },
});

export const sessionItemState = atom<Array<TSessionItem>>({
  key: "sessionItemState",
  default: DEFAULT_SESSION_ITEM,
  effects_UNSTABLE: [localStorageEffect("sessionItem")],
});

export const passwordExpirationInfoState = atom<TPasswordExpirationInfo>({
  key: "passwordExpirationInfoState",
  default: null as any,
  effects_UNSTABLE: [localStorageEffect("passwordExpirationInfo")],
});

export const totalDataNumber = atom({
  key: "totalDataNumber",
  default: 0,
});

export const deletedRowsState = atom<object[]>({
  key: "deletedRowsState",
  default: [],
});

export const isMobileMenuOpendState = atom<boolean>({
  key: "isMobileMenuOpendState",
  default: false,
});
export const isMenuOpendState = atom<boolean>({
  key: "isMenuOpendState",
  default: true,
});

export const isLoading = atom<boolean>({
  key: "isLoading",
  default: false,
});

// 삭제된 데이터의 첨부파일 번호를 저장하는 용도
// 값이 set되면  PanelBarNavContainer에서 useEffect로 서버에서 파일을 삭제 처리하도록 함
export const deletedAttadatnumsState = atom<string[]>({
  key: "deletedAttadatnums",
  default: [],
});
export const deletedNameState = atom<string[]>({
  key: "deletedNameState",
  default: [],
});
// 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 번호를 저장하는 용도.
// unsavedAttadatnums 값이 존재하는데 저장화면을 벗어나면(path 변경, 팝업닫기, 새로고침 시) 서버에서 파일을 삭제 처리하도록 함
export const unsavedAttadatnumsState = atom<string[]>({
  key: "unsavedAttadatnums",
  default: [],
});
export const unsavedNameState = atom<string[]>({
  key: "unsavedNameState",
  default: [],
});
export const menuList = atom<any[]>({
  key: "menuList",
  default: [],
  effects_UNSTABLE: [persistAtom]
});
export const colors = atom<string[]>({
  key: "colors",
  default: ["#2196f3", "#1976d2", "#64b5f6", "#bbdefb"],
});

export const colorsName = atom<string>({
  key: "colorsName",
  default: "Blue",
});

export const OSState = atom<boolean>({
  key: "OSState",
  default: false,
  effects_UNSTABLE: [persistAtom]
});

export const heightstate = atom<number>({
  key: "heightstate",
  default: document.documentElement.clientHeight - 170,
});

export const isFilterheightstate = atom<number>({
  key: "isFilterheightstate",
  default: 0,
});

export const isFilterHideState = atom<boolean>({
  key: "isFilterHideState",
  default: document.documentElement.clientWidth <= 1200,
});

export const isFilterHideState2 = atom<boolean>({
  key: "isFilterHideState2",
  default: document.documentElement.clientWidth <= 1200,
});

export const isMobileState = atom<boolean>({
  key: "isMobileState",
  default: document.documentElement.clientWidth <= 1200,
});

export const isDeviceWidthState = atom<number>({
  key: "isDeviceWidthState",
  default: document.documentElement.clientWidth,
});
