import { atom, AtomEffect, DefaultValue } from "recoil";
import { TMenu, TSessionItem, TToken } from "./types";

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
export const tokenState = atom<TToken>({
  key: "tokenState",
  default: null as any,
  effects_UNSTABLE: [localStorageEffect("accessToken")],
});

export const menusState = atom<Array<TMenu>>({
  key: "menusState",
  default: null as any,
  effects_UNSTABLE: [localStorageEffect("menus")],
});

export const sessionItemState = atom<Array<TSessionItem>>({
  key: "sessionItemState",
  default: [
    { code: "user_id", value: "" },
    { code: "user_name", value: "" },
    { code: "orgdiv", value: "" },
    { code: "location", value: "" },
    { code: "position", value: "" },
    { code: "dptcd", value: "" },
  ],
  effects_UNSTABLE: [localStorageEffect("sessionItem")],
});

export const totalDataNumber = atom({
  key: "totalDataNumber",
  default: 0,
});

export const deletedRowsState = atom<object[]>({
  key: "deletedRowsState",
  default: [],
});

export const isMenuOpendState = atom<boolean>({
  key: "isMenuOpendState",
  default: false,
});

export const isLoading = atom<boolean>({
  key: "isLoading",
  default: false,
});
