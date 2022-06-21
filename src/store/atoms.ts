import { atom, AtomEffect, DefaultValue } from "recoil";
import { CommonCode, Token } from "./types";

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

export const totalDataNumber = atom({
  key: "totalDataNumber",
  default: 0,
});

export const itemacntState = atom<CommonCode>({
  key: "itemacntState",
  default: { sub_code: "", code_name: "전체" },
});

export const itemlvl1State = atom<CommonCode>({
  key: "itemlvl1State",
  default: { sub_code: "", code_name: "전체" },
});

export const itemlvl2State = atom<CommonCode>({
  key: "itemlvl2State",
  default: { sub_code: "", code_name: "전체" },
});

export const itemlvl3State = atom<CommonCode>({
  key: "itemlvl3State",
  default: { sub_code: "", code_name: "전체" },
});

export const locationState = atom<CommonCode>({
  key: "locationState",
  default: { sub_code: "", code_name: "전체" },
});

export const ordstsState = atom<CommonCode>({
  key: "ordstsState",
  default: { sub_code: "", code_name: "전체" },
});

export const ordtypeState = atom<CommonCode>({
  key: "ordtypeState",
  default: { sub_code: "", code_name: "전체" },
});

export const departmentsState = atom<CommonCode>({
  key: "departmentsState",
  default: { sub_code: "", code_name: "전체" },
});

export const usersState = atom<CommonCode>({
  key: "usersState",
  default: { sub_code: "", code_name: "전체" },
});

export const doexdivState = atom<CommonCode>({
  key: "doexdivState",
  default: { sub_code: "", code_name: "전체" },
});

export const deletedRowsState = atom<object[]>({
  key: "deletedRowsState",
  default: [],
});
