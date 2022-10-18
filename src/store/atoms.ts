import { atom, AtomEffect, DefaultValue } from "recoil";
import {
  User,
  TCommonCode,
  Token,
  Tmenu,
  TSessionItem,
  TPermissions,
} from "./types";

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
export const tokenState = atom<Token>({
  key: "tokenState",
  default: null as any,
  effects_UNSTABLE: [localStorageEffect("accessToken")],
});

export const userState = atom<User>({
  key: "userState",
  default: null as any,
});

export const menusState = atom<Array<Tmenu>>({
  key: "menusState",
  default: null as any,
  effects_UNSTABLE: [localStorageEffect("menus")],
});

export const sessionItemState = atom<Array<TSessionItem>>({
  key: "sessionItemState",
  default: null as any,
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
