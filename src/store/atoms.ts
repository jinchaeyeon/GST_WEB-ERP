import { atom, AtomEffect, DefaultValue } from "recoil";
import { User, TCommonCode, Token, Api } from "./types";

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

export const apiState = atom<Api>({
  key: "apiState",
  default: null as any,
  effects_UNSTABLE: [localStorageEffect("accessApi")],
});

export const userState = atom<User>({
  key: "userState",
  default: null as any,
});

export const totalDataNumber = atom({
  key: "totalDataNumber",
  default: 0,
});

export const itemacntState = atom<TCommonCode>({
  key: "itemacntState",
  default: { sub_code: "", code_name: "전체" },
});

export const itemlvl1State = atom<TCommonCode>({
  key: "itemlvl1State",
  default: { sub_code: "", code_name: "전체" },
});

export const itemlvl2State = atom<TCommonCode>({
  key: "itemlvl2State",
  default: { sub_code: "", code_name: "전체" },
});

export const itemlvl3State = atom<TCommonCode>({
  key: "itemlvl3State",
  default: { sub_code: "", code_name: "전체" },
});

export const locationState = atom<TCommonCode>({
  key: "locationState",
  default: { sub_code: "", code_name: "전체" },
});

export const ordstsState = atom<TCommonCode>({
  key: "ordstsState",
  default: { sub_code: "", code_name: "전체" },
});

export const ordtypeState = atom<TCommonCode>({
  key: "ordtypeState",
  default: { sub_code: "", code_name: "전체" },
});

export const departmentsState = atom<TCommonCode>({
  key: "departmentsState",
  default: { sub_code: "", code_name: "전체" },
});

export const usersState = atom<TCommonCode>({
  key: "usersState",
  default: { sub_code: "", code_name: "전체" },
});

export const doexdivState = atom<TCommonCode>({
  key: "doexdivState",
  default: { sub_code: "", code_name: "전체" },
});

export const deletedRowsState = atom<object[]>({
  key: "deletedRowsState",
  default: [],
});
