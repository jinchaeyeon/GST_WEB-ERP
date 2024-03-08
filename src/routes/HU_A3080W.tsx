import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInGridInput,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import MonthDateCell from "../components/Cells/MonthDateCell";
import NumberCell from "../components/Cells/NumberCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
  toDate,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import HU_A3080W_Window from "../components/Windows/HU_A3080W_Window";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/HU_A3080W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
const DATA_ITEM_KEY5 = "num";
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
let targetRowIndex4: null | number = null;
let targetRowIndex5: null | number = null;
let temp = 0;
let temp2 = 0;
let temp3 = 0;
let temp4 = 0;
let temp5 = 0;
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];
let deletedMainRows3: object[] = [];
let deletedMainRows4: object[] = [];
let deletedMainRows5: object[] = [];

const comboField = ["paytype", "dptcd", "payitemcd"];
const requiredField = ["prsnnum", "paydeductdiv", "payitemcd"];
const requiredField2 = [
  "prsnnum",
  "paytype",
  "paydeductdiv",
  "payitemcd",
  "payyrmm",
];
const commendField = ["prsnnum"];
const radioField = ["paydeductdiv"];
const numberField = ["amt", "bnsrat"];
const dateField = ["payyrmm"];

interface IPrsnnum {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_HU032, L_HU130T, L_dptcd_001", setBizComponentData);
  //보고서구분, 그룹구분, 그룹특성, 품목계정, 내수구분

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "paytype"
      ? "L_HU032"
      : field === "payitemcd"
      ? "L_HU130T"
      : field === "dptcd"
      ? "L_dptcd_001"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );
  const textField =
    field == "payitemcd"
      ? "payitemnm"
      : field == "dptcd"
      ? "dptnm"
      : "code_name";
  const valueField =
    field == "payitemcd"
      ? "payitemcd"
      : field == "dptcd"
      ? "dptcd"
      : "sub_code";

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      {...props}
    />
  ) : (
    <td />
  );
};

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("R_HU038", setBizComponentData);
  //합부판정
  const field = props.field ?? "";
  const bizComponentIdVal = field == "paydeductdiv" ? "R_HU038" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell
      bizComponentData={bizComponent}
      {...props}
      disabled={props.dataItem.rowstatus == "N" ? false : true}
    />
  ) : (
    <td />
  );
};

export const FormContext = createContext<{
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  setPrsnnum: (d: any) => void;
  setPrsnnm: (d: any) => void;
  setDptcd: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext2 = createContext<{
  prsnnum2: string;
  prsnnm2: string;
  dptcd2: string;
  setPrsnnum2: (d: any) => void;
  setPrsnnm2: (d: any) => void;
  setDptcd2: (d: any) => void;
  mainDataState2: State;
  setMainDataState2: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext3 = createContext<{
  prsnnum3: string;
  prsnnm3: string;
  dptcd3: string;
  setPrsnnum3: (d: any) => void;
  setPrsnnm3: (d: any) => void;
  setDptcd3: (d: any) => void;
  mainDataState3: State;
  setMainDataState3: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext4 = createContext<{
  prsnnum4: string;
  prsnnm4: string;
  dptcd4: string;
  setPrsnnum4: (d: any) => void;
  setPrsnnm4: (d: any) => void;
  setDptcd4: (d: any) => void;
  mainDataState4: State;
  setMainDataState4: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext5 = createContext<{
  prsnnum5: string;
  prsnnm5: string;
  dptcd5: string;
  setPrsnnum5: (d: any) => void;
  setPrsnnm5: (d: any) => void;
  setDptcd5: (d: any) => void;
  mainDataState5: State;
  setMainDataState5: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

const ColumnCommandCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const {
    prsnnum,
    prsnnm,
    dptcd,
    setPrsnnum,
    setPrsnnm,
    setDptcd,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext);
  let isInEdit = field === dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    if (dataItem["rowstatus"] == "N") {
      setuserWindowVisible(true);
    } else {
      alert("사번은 수정이 불가합니다.");
    }
  };

  const setUserData = (data: IPrsnnum) => {
    setPrsnnm(data.prsnnm);
    setPrsnnum(data.prsnnum);
    setDptcd(data.dptcd);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {value}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onUserWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
    </>
  );
};

const ColumnCommandCell2 = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const {
    prsnnum2,
    prsnnm2,
    dptcd2,
    setPrsnnum2,
    setPrsnnm2,
    setDptcd2,
    mainDataState2,
    setMainDataState2,
  } = useContext(FormContext2);
  let isInEdit = field === dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    if (dataItem["rowstatus"] == "N") {
      setuserWindowVisible(true);
    } else {
      alert("사번은 수정이 불가합니다.");
    }
  };

  const setUserData = (data: IPrsnnum) => {
    setPrsnnm2(data.prsnnm);
    setPrsnnum2(data.prsnnum);
    setDptcd2(data.dptcd);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {value}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onUserWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
    </>
  );
};

const ColumnCommandCell3 = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const {
    prsnnum3,
    prsnnm3,
    dptcd3,
    setPrsnnum3,
    setPrsnnm3,
    setDptcd3,
    mainDataState3,
    setMainDataState3,
  } = useContext(FormContext3);
  let isInEdit = field === dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    if (dataItem["rowstatus"] == "N") {
      setuserWindowVisible(true);
    } else {
      alert("사번은 수정이 불가합니다.");
    }
  };

  const setUserData = (data: IPrsnnum) => {
    setPrsnnm3(data.prsnnm);
    setPrsnnum3(data.prsnnum);
    setDptcd3(data.dptcd);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {value}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onUserWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
    </>
  );
};

const ColumnCommandCell4 = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const {
    prsnnum4,
    prsnnm4,
    dptcd4,
    setPrsnnum4,
    setPrsnnm4,
    setDptcd4,
    mainDataState4,
    setMainDataState4,
  } = useContext(FormContext4);
  let isInEdit = field === dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    if (dataItem["rowstatus"] == "N") {
      setuserWindowVisible(true);
    } else {
      alert("사번은 수정이 불가합니다.");
    }
  };

  const setUserData = (data: IPrsnnum) => {
    setPrsnnm4(data.prsnnm);
    setPrsnnum4(data.prsnnum);
    setDptcd4(data.dptcd);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {value}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onUserWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
    </>
  );
};

const ColumnCommandCell5 = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const {
    prsnnum5,
    prsnnm5,
    dptcd5,
    setPrsnnum5,
    setPrsnnm5,
    setDptcd5,
    mainDataState5,
    setMainDataState5,
  } = useContext(FormContext5);
  let isInEdit = field === dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    if (dataItem["rowstatus"] == "N") {
      setuserWindowVisible(true);
    } else {
      alert("사번은 수정이 불가합니다.");
    }
  };

  const setUserData = (data: IPrsnnum) => {
    setPrsnnm5(data.prsnnm);
    setPrsnnum5(data.prsnnum);
    setDptcd5(data.dptcd);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {value}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onUserWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
    </>
  );
};

type TdataArr = {
  rowstatus_s: string[];
  payyrmm_s: string[];
  paytype_s: string[];
  prsnnum_s: string[];
  payitemcd_s: string[];
  amt_s: string[];
  remark_s: string[];
  bonusrat_s: string[];
};

const HU_A3080W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_A3080W", setCustomOptionData);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_A3080W", setMessagesData);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        payyrmm: setDefaultDate(customOptionData, "payyrmm"),
        paydeductdiv: defaultOption.find(
          (item: any) => item.id === "paydeductdiv"
        ).valueCode,
        payitemcd: defaultOption.find((item: any) => item.id === "payitemcd")
          .valueCode,
        paytype: defaultOption.find((item: any) => item.id === "paytype")
          .valueCode,
        rtrchk: defaultOption.find((item: any) => item.id === "rtrchk")
          .valueCode,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        payyrmm: setDefaultDate(customOptionData, "payyrmm"),
        paydeductdiv: defaultOption.find(
          (item: any) => item.id === "paydeductdiv"
        ).valueCode,
        payitemcd: defaultOption.find((item: any) => item.id === "payitemcd")
          .valueCode,
        paytype: defaultOption.find((item: any) => item.id === "paytype")
          .valueCode,
        rtrchk: defaultOption.find((item: any) => item.id === "rtrchk")
          .valueCode,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        payyrmm: setDefaultDate(customOptionData, "payyrmm"),
        paydeductdiv: defaultOption.find(
          (item: any) => item.id === "paydeductdiv"
        ).valueCode,
        payitemcd: defaultOption.find((item: any) => item.id === "payitemcd")
          .valueCode,
        paytype: defaultOption.find((item: any) => item.id === "paytype")
          .valueCode,
        rtrchk: defaultOption.find((item: any) => item.id === "rtrchk")
          .valueCode,
        isSearch: true,
      }));
      setFilters4((prev) => ({
        ...prev,
        payyrmm: setDefaultDate(customOptionData, "payyrmm"),
        paydeductdiv: defaultOption.find(
          (item: any) => item.id === "paydeductdiv"
        ).valueCode,
        payitemcd: defaultOption.find((item: any) => item.id === "payitemcd")
          .valueCode,
        paytype: defaultOption.find((item: any) => item.id === "paytype")
          .valueCode,
        rtrchk: defaultOption.find((item: any) => item.id === "rtrchk")
          .valueCode,
        isSearch: true,
      }));
      setFilters5((prev) => ({
        ...prev,
        payyrmm: setDefaultDate(customOptionData, "payyrmm"),
        paydeductdiv: defaultOption.find(
          (item: any) => item.id === "paydeductdiv"
        ).valueCode,
        payitemcd: defaultOption.find((item: any) => item.id === "payitemcd")
          .valueCode,
        paytype: defaultOption.find((item: any) => item.id === "paytype")
          .valueCode,
        rtrchk: defaultOption.find((item: any) => item.id === "rtrchk")
          .valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [prsnnm, setPrsnnm] = useState<string>("");
  const [prsnnm2, setPrsnnm2] = useState<string>("");
  const [prsnnm3, setPrsnnm3] = useState<string>("");
  const [prsnnm4, setPrsnnm4] = useState<string>("");
  const [prsnnm5, setPrsnnm5] = useState<string>("");
  const [prsnnum, setPrsnnum] = useState<string>("");
  const [prsnnum2, setPrsnnum2] = useState<string>("");
  const [prsnnum3, setPrsnnum3] = useState<string>("");
  const [prsnnum4, setPrsnnum4] = useState<string>("");
  const [prsnnum5, setPrsnnum5] = useState<string>("");
  const [dptcd, setDptcd] = useState<string>("");
  const [dptcd2, setDptcd2] = useState<string>("");
  const [dptcd3, setDptcd3] = useState<string>("");
  const [dptcd4, setDptcd4] = useState<string>("");
  const [dptcd5, setDptcd5] = useState<string>("");

  //FormContext로 받아온 데이터 set
  useEffect(() => {
    if (prsnnum != "") {
      const newData = mainDataResult.data.map((item) =>
        item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
          ? {
              ...item,
              prsnnm: prsnnm,
              prsnnum: prsnnum,
              dptcd: dptcd,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
            }
          : {
              ...item,
            }
      );
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setPrsnnum("");
      setPrsnnm("");
      setDptcd("");
    }
  }, [prsnnm, prsnnum, dptcd]);

  //FormContext로 받아온 데이터 set
  useEffect(() => {
    if (prsnnum2 != "") {
      const newData = mainDataResult2.data.map((item) =>
        item.num == parseInt(Object.getOwnPropertyNames(selectedState2)[0])
          ? {
              ...item,
              prsnnm: prsnnm2,
              prsnnum: prsnnum2,
              dptcd: dptcd2,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
            }
          : {
              ...item,
            }
      );
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setPrsnnum2("");
      setPrsnnm2("");
      setDptcd2("");
    }
  }, [prsnnm2, prsnnum2, dptcd2]);

  useEffect(() => {
    if (prsnnum3 != "") {
      const newData = mainDataResult3.data.map((item) =>
        item.num == parseInt(Object.getOwnPropertyNames(selectedState3)[0])
          ? {
              ...item,
              prsnnm: prsnnm3,
              prsnnum: prsnnum3,
              dptcd: dptcd3,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
            }
          : {
              ...item,
            }
      );
      setTempResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setPrsnnum3("");
      setPrsnnm3("");
      setDptcd3("");
    }
  }, [prsnnm3, prsnnum3, dptcd3]);

  //FormContext로 받아온 데이터 set
  useEffect(() => {
    if (prsnnum4 != "") {
      const newData = mainDataResult4.data.map((item) =>
        item.num == parseInt(Object.getOwnPropertyNames(selectedState4)[0])
          ? {
              ...item,
              prsnnm: prsnnm4,
              prsnnum: prsnnum4,
              dptcd: dptcd4,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
            }
          : {
              ...item,
            }
      );
      setTempResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setPrsnnum4("");
      setPrsnnm4("");
      setDptcd4("");
    }
  }, [prsnnm4, prsnnum4, dptcd4]);

  //FormContext로 받아온 데이터 set
  useEffect(() => {
    if (prsnnum5 != "") {
      const newData = mainDataResult5.data.map((item) =>
        item.num == parseInt(Object.getOwnPropertyNames(selectedState5)[0])
          ? {
              ...item,
              prsnnm: prsnnm5,
              prsnnum: prsnnum5,
              dptcd: dptcd5,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
            }
          : {
              ...item,
            }
      );
      setTempResult5((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult5((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setPrsnnum5("");
      setPrsnnm5("");
      setDptcd5("");
    }
  }, [prsnnm5, prsnnum5, dptcd5]);

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  let _export5: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "고정지급공제";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridTwo.sheets[0].title = "일시지급공제";
        _export2.save(optionsGridTwo);
      }
    }
    if (_export3 !== null && _export3 !== undefined) {
      if (tabSelected == 2) {
        const optionsGridThree = _export3.workbookOptions();
        optionsGridThree.sheets[0].title = "예외지급공제";
        _export3.save(optionsGridThree);
      }
    }
    if (_export4 !== null && _export4 !== undefined) {
      if (tabSelected == 3) {
        const optionsGridFour = _export4.workbookOptions();
        optionsGridFour.sheets[0].title = "추가지급공제";
        _export4.save(optionsGridFour);
      }
    }
    if (_export5 !== null && _export5 !== undefined) {
      if (tabSelected == 4) {
        const optionsGridFive = _export5.workbookOptions();
        optionsGridFive.sheets[0].title = "상여예외지급공제";
        _export5.save(optionsGridFive);
      }
    }
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.payyrmm).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "HU_A3080W_001");
      } else {
        resetAllGrid();
        deletedMainRows = [];
        deletedMainRows2 = [];
        deletedMainRows3 = [];
        deletedMainRows4 = [];
        deletedMainRows5 = [];
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters4((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters5((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);
  let gridRef5: any = useRef(null);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setPage5(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
    setMainDataResult5(process([], mainDataState5));
  };
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters4((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange5 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters5((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage5({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataState4, setMainDataState4] = useState<State>({
    sort: [],
  });
  const [mainDataState5, setMainDataState5] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [tempState3, setTempState3] = useState<State>({
    sort: [],
  });
  const [tempState4, setTempState4] = useState<State>({
    sort: [],
  });
  const [tempState5, setTempState5] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [mainDataResult4, setMainDataResult4] = useState<DataResult>(
    process([], mainDataState4)
  );
  const [mainDataResult5, setMainDataResult5] = useState<DataResult>(
    process([], mainDataState5)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [tempResult3, setTempResult3] = useState<DataResult>(
    process([], tempState3)
  );
  const [tempResult4, setTempResult4] = useState<DataResult>(
    process([], tempState4)
  );
  const [tempResult5, setTempResult5] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState4, setSelectedState4] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState5, setSelectedState5] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "190",
    orgdiv: "01",
    payyrmm: new Date(),
    paydeductdiv: "",
    payitemcd: "",
    paytype: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    work_type: "180",
    orgdiv: "01",
    payyrmm: new Date(),
    paydeductdiv: "",
    payitemcd: "",
    paytype: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    work_type: "210",
    orgdiv: "01",
    payyrmm: new Date(),
    paydeductdiv: "",
    payitemcd: "",
    paytype: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    work_type: "212",
    orgdiv: "01",
    payyrmm: new Date(),
    paydeductdiv: "",
    payitemcd: "",
    paytype: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters5, setFilters5] = useState({
    pgSize: PAGE_SIZE,
    work_type: "110",
    orgdiv: "01",
    payyrmm: new Date(),
    paydeductdiv: "",
    payitemcd: "",
    paytype: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters5((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters5((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters5((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3080W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_payyrmm": convertDateToStr(filters.payyrmm).substring(0, 6),
        "@p_paytype": filters.paytype,
        "@p_paydeductdiv": filters.paydeductdiv,
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_rtrchk": filters.rtrchk,
        "@p_payitemcd": filters.payitemcd,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        chk: row.chk == "" || row.chk == "N" ? false : true,
      }));

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.findkey == filters.find_row_value
          );
          targetRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef.current) {
          targetRowIndex = 0;
        }
      }

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.findkey == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3080W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.work_type,
        "@p_orgdiv": filters2.orgdiv,
        "@p_payyrmm": convertDateToStr(filters2.payyrmm).substring(0, 6),
        "@p_paytype": filters2.paytype,
        "@p_paydeductdiv": filters2.paydeductdiv,
        "@p_prsnnum": filters2.prsnnum,
        "@p_prsnnm": filters2.prsnnm,
        "@p_rtrchk": filters2.rtrchk,
        "@p_payitemcd": filters2.payitemcd,
        "@p_find_row_value": filters2.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        chk: row.chk == "" || row.chk == "N" ? false : true,
      }));

      if (filters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.findkey == filters2.find_row_value
          );
          targetRowIndex2 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage2({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef2.current) {
          targetRowIndex2 = 0;
        }
      }

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters2.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.findkey == filters2.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState2({ [selectedRow[DATA_ITEM_KEY2]]: true });
        } else {
          setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid3 = async (filters3: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3080W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.work_type,
        "@p_orgdiv": filters3.orgdiv,
        "@p_payyrmm": convertDateToStr(filters3.payyrmm).substring(0, 6),
        "@p_paytype": filters3.paytype,
        "@p_paydeductdiv": filters3.paydeductdiv,
        "@p_prsnnum": filters3.prsnnum,
        "@p_prsnnm": filters3.prsnnm,
        "@p_rtrchk": filters3.rtrchk,
        "@p_payitemcd": filters3.payitemcd,
        "@p_find_row_value": filters3.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        chk: row.chk == "" || row.chk == "N" ? false : true,
      }));

      if (filters3.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.findkey == filters3.find_row_value
          );
          targetRowIndex3 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage3({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef3.current) {
          targetRowIndex3 = 0;
        }
      }

      setMainDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters3.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.findkey == filters3.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState3({ [selectedRow[DATA_ITEM_KEY3]]: true });
        } else {
          setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters3((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid4 = async (filters4: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3080W_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": filters4.work_type,
        "@p_orgdiv": filters4.orgdiv,
        "@p_payyrmm": convertDateToStr(filters4.payyrmm).substring(0, 6),
        "@p_paytype": filters4.paytype,
        "@p_paydeductdiv": filters4.paydeductdiv,
        "@p_prsnnum": filters4.prsnnum,
        "@p_prsnnm": filters4.prsnnm,
        "@p_rtrchk": filters4.rtrchk,
        "@p_payitemcd": filters4.payitemcd,
        "@p_find_row_value": filters4.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        chk: row.chk == "" || row.chk == "N" ? false : true,
      }));

      if (filters4.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef4.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.findkey == filters4.find_row_value
          );
          targetRowIndex4 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage4({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef4.current) {
          targetRowIndex4 = 0;
        }
      }

      setMainDataResult4((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters4.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.findkey == filters4.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState4({ [selectedRow[DATA_ITEM_KEY4]]: true });
        } else {
          setSelectedState4({ [rows[0][DATA_ITEM_KEY4]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters4((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid5 = async (filters5: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3080W_Q",
      pageNumber: filters5.pgNum,
      pageSize: filters5.pgSize,
      parameters: {
        "@p_work_type": filters5.work_type,
        "@p_orgdiv": filters5.orgdiv,
        "@p_payyrmm": convertDateToStr(filters5.payyrmm).substring(0, 6),
        "@p_paytype": filters5.paytype,
        "@p_paydeductdiv": filters5.paydeductdiv,
        "@p_prsnnum": filters5.prsnnum,
        "@p_prsnnm": filters5.prsnnm,
        "@p_rtrchk": filters5.rtrchk,
        "@p_payitemcd": filters5.payitemcd,
        "@p_find_row_value": filters5.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        chk: row.chk == "" || row.chk == "N" ? false : true,
      }));

      if (filters5.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef5.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.findkey == filters5.find_row_value
          );
          targetRowIndex5 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage5({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef5.current) {
          targetRowIndex5 = 0;
        }
      }

      setMainDataResult5((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters5.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.findkey == filters5.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState5({ [selectedRow[DATA_ITEM_KEY5]]: true });
        } else {
          setSelectedState5({ [rows[0][DATA_ITEM_KEY5]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters5((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && customOptionData !== null && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, customOptionData, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters2.isSearch &&
      customOptionData !== null &&
      permissions !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, customOptionData, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters3.isSearch &&
      customOptionData !== null &&
      permissions !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, customOptionData, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters4.isSearch &&
      customOptionData !== null &&
      permissions !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);
      setFilters4((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters4, customOptionData, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters5.isSearch &&
      customOptionData !== null &&
      permissions !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters5);
      setFilters5((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid5(deepCopiedFilters);
    }
  }, [filters5, customOptionData, permissions]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [mainDataResult2]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [mainDataResult3]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex4 !== null && gridRef4.current) {
      gridRef4.current.scrollIntoView({ rowIndex: targetRowIndex4 });
      targetRowIndex4 = null;
    }
  }, [mainDataResult4]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex5 !== null && gridRef5.current) {
      gridRef5.current.scrollIntoView({ rowIndex: targetRowIndex5 });
      targetRowIndex5 = null;
    }
  }, [mainDataResult5]);

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);
  const [UserMultiWindowVisible, setUserMultiWindowVisible] =
    useState<boolean>(false);
  const [UserMultiWindowVisible2, setUserMultiWindowVisible2] =
    useState<boolean>(false);
  const [UserMultiWindowVisible3, setUserMultiWindowVisible3] =
    useState<boolean>(false);
  const [UserMultiWindowVisible4, setUserMultiWindowVisible4] =
    useState<boolean>(false);
  const [UserMultiWindowVisible5, setUserMultiWindowVisible5] =
    useState<boolean>(false);

  const onUserWndClick = () => {
    setuserWindowVisible(true);
  };
  const onUserMultiWndClick = () => {
    setUserMultiWindowVisible(true);
  };
  const onUserMultiWndClick2 = () => {
    setUserMultiWindowVisible2(true);
  };
  const onUserMultiWndClick3 = () => {
    setUserMultiWindowVisible3(true);
  };
  const onUserMultiWndClick4 = () => {
    setUserMultiWindowVisible4(true);
  };
  const onUserMultiWndClick5 = () => {
    setUserMultiWindowVisible5(true);
  };

  interface IPrsnnum {
    prsnnum: string;
    prsnnm: string;
    dptcd: string;
    abilcd: string;
    postcd: string;
  }

  const setUserData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };

  const [tabSelected, setTabSelected] = React.useState(0);

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState3(newSelectedState);
  };
  const onSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY4,
    });

    setSelectedState4(newSelectedState);
  };
  const onSelectionChange5 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState5,
      dataItemKey: DATA_ITEM_KEY5,
    });

    setSelectedState5(newSelectedState);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };
  const onMainDataStateChange4 = (event: GridDataStateChangeEvent) => {
    setMainDataState4(event.dataState);
  };
  const onMainDataStateChange5 = (event: GridDataStateChangeEvent) => {
    setMainDataState5(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult3.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell4 = (props: GridFooterCellProps) => {
    var parts = mainDataResult4.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult4.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell5 = (props: GridFooterCellProps) => {
    var parts = mainDataResult5.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult5.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };
  const editNumberFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };
  const editNumberFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult3.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };
  const editNumberFooterCell4 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult4.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };
  const editNumberFooterCell5 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult5.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange4 = (e: any) => {
    setMainDataState4((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange5 = (e: any) => {
    setMainDataState5((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };
  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
    );
  };
  const onMainItemChange3 = (event: GridItemChangeEvent) => {
    setMainDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
    );
  };
  const onMainItemChange4 = (event: GridItemChangeEvent) => {
    setMainDataState4((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult4,
      setMainDataResult4,
      DATA_ITEM_KEY4
    );
  };
  const onMainItemChange5 = (event: GridItemChangeEvent) => {
    setMainDataState5((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult5,
      setMainDataResult5,
      DATA_ITEM_KEY5
    );
  };

  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender4 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit4}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender5 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit5}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender3 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender4 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit4}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender5 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit5}
      editField={EDIT_FIELD}
    />
  );
  const enterEdit = (dataItem: any, field: string) => {
    let valid = true;

    if (
      (dataItem.rowstatus != "N" && field == "paytype") ||
      (dataItem.rowstatus != "N" && field == "payitemcd")
    ) {
      valid = false;
    }

    if (
      field != "rowstatus" &&
      field != "prsnnm" &&
      field != "dptcd" &&
      valid == true
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev: { total: any }) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };
  const enterEdit2 = (dataItem: any, field: string) => {
    let valid = true;

    if (
      (dataItem.rowstatus != "N" && field == "paytype") ||
      (dataItem.rowstatus != "N" && field == "payitemcd") ||
      (dataItem.rowstatus != "N" && field == "payyrmm")
    ) {
      valid = false;
    }

    if (
      field != "rowstatus" &&
      field != "prsnnm" &&
      field != "dptcd" &&
      valid == true
    ) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] === dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev: { total: any }) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit3 = (dataItem: any, field: string) => {
    let valid = true;

    if (
      (dataItem.rowstatus != "N" && field == "paytype") ||
      (dataItem.rowstatus != "N" && field == "payitemcd") ||
      (dataItem.rowstatus != "N" && field == "payyrmm")
    ) {
      valid = false;
    }

    if (
      field != "rowstatus" &&
      field != "prsnnm" &&
      field != "dptcd" &&
      valid == true
    ) {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] === dataItem[DATA_ITEM_KEY3]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult3((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult3((prev: { total: any }) => {
        return {
          data: mainDataResult3.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit4 = (dataItem: any, field: string) => {
    let valid = true;

    if (
      (dataItem.rowstatus != "N" && field == "payitemcd") ||
      (dataItem.rowstatus != "N" && field == "payyrmm")
    ) {
      valid = false;
    }

    if (
      field != "rowstatus" &&
      field != "prsnnm" &&
      field != "dptcd" &&
      valid == true
    ) {
      const newData = mainDataResult4.data.map((item) =>
        item[DATA_ITEM_KEY4] === dataItem[DATA_ITEM_KEY4]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult4((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult4((prev: { total: any }) => {
        return {
          data: mainDataResult4.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit5 = (dataItem: any, field: string) => {
    let valid = true;

    if (
      (dataItem.rowstatus != "N" && field == "paytype") ||
      (dataItem.rowstatus != "N" && field == "payitemcd") ||
      (dataItem.rowstatus != "N" && field == "payyrmm")
    ) {
      valid = false;
    }

    if (
      field != "rowstatus" &&
      field != "prsnnm" &&
      field != "dptcd" &&
      valid == true
    ) {
      const newData = mainDataResult5.data.map((item) =>
        item[DATA_ITEM_KEY5] === dataItem[DATA_ITEM_KEY5]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult5((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult5((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult5((prev: { total: any }) => {
        return {
          data: mainDataResult5.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
      );
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
      );
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult2.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit3 = () => {
    if (tempResult3.data != mainDataResult3.data) {
      const newData = mainDataResult3.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
      );
      setTempResult3((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult3.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult3((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit4 = () => {
    if (tempResult4.data != mainDataResult4.data) {
      const newData = mainDataResult4.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedState4)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
      );
      setTempResult4((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult4((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult4.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult4((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult4((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit5 = () => {
    if (tempResult5.data != mainDataResult5.data) {
      const newData = mainDataResult5.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY5] == Object.getOwnPropertyNames(selectedState5)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
      );
      setTempResult5((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult5((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult5.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult5((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult5((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const [values, setValues] = React.useState<boolean>(false);
  const [values2, setValues2] = React.useState<boolean>(false);
  const [values3, setValues3] = React.useState<boolean>(false);
  const [values4, setValues4] = React.useState<boolean>(false);
  const [values5, setValues5] = React.useState<boolean>(false);

  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: !values,
        [EDIT_FIELD]: props.field,
      }));
      setValues(!values);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const CustomCheckBoxCell3 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult3.data.map((item) => ({
        ...item,
        chk: !values3,
        [EDIT_FIELD]: props.field,
      }));
      setValues3(!values3);
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values3} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const CustomCheckBoxCell4 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult4.data.map((item) => ({
        ...item,
        chk: !values4,
        [EDIT_FIELD]: props.field,
      }));
      setValues4(!values4);
      setMainDataResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values4} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const CustomCheckBoxCell5 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult5.data.map((item) => ({
        ...item,
        chk: !values5,
        [EDIT_FIELD]: props.field,
      }));
      setValues5(!values5);
      setMainDataResult5((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values5} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      amt: 0,
      chk: false,
      dptcd: "",
      findkey: "",
      orgdiv: "01",
      paydeductdiv: filters.paydeductdiv,
      payitemcd: "",
      paytype: "",
      prsnnm: "",
      prsnnum: "",
      remark: "",
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick2 = () => {
    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY2]: ++temp2,
      amt: 0,
      chk: false,
      dptcd: "",
      findkey: "",
      orgdiv: "01",
      paydeductdiv: filters2.paydeductdiv,
      payitemcd: "",
      paytype: "",
      payyrmm: convertDateToStr(filters2.payyrmm),
      prsnnm: "",
      prsnnum: "",
      remark: "",
      rowstatus: "N",
    };

    setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    setPage2((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick3 = () => {
    mainDataResult3.data.map((item) => {
      if (item.num > temp3) {
        temp3 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY3]: ++temp3,
      amt: 0,
      chk: false,
      dptcd: "",
      findkey: "",
      orgdiv: "01",
      paydeductdiv: filters3.paydeductdiv,
      payitemcd: "",
      paytype: "",
      payyrmm: convertDateToStr(filters3.payyrmm),
      prsnnm: "",
      prsnnum: "",
      remark: "",
      rowstatus: "N",
    };

    setSelectedState3({ [newDataItem[DATA_ITEM_KEY3]]: true });
    setPage3((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult3((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick4 = () => {
    mainDataResult4.data.map((item) => {
      if (item.num > temp4) {
        temp4 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY4]: ++temp4,
      amt: 0,
      chk: false,
      dptcd: "",
      findkey: "",
      orgdiv: "01",
      paydeductdiv: filters4.paydeductdiv,
      payitemcd: "",
      payyrmm: convertDateToStr(filters4.payyrmm),
      prsnnm: "",
      prsnnum: "",
      remark: "",
      rowstatus: "N",
    };

    setSelectedState4({ [newDataItem[DATA_ITEM_KEY4]]: true });
    setPage4((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult4((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick5 = () => {
    mainDataResult5.data.map((item) => {
      if (item.num > temp5) {
        temp5 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY5]: ++temp5,
      amt: 0,
      bnsrat: 0,
      chk: false,
      dptcd: "",
      findkey: "",
      orgdiv: "01",
      paydeductdiv: "",
      paytype: "",
      payyrmm: convertDateToStr(filters5.payyrmm),
      prsnnm: "",
      prsnnum: "",
      remark: "",
      rowstatus: "N",
    };

    setSelectedState5({ [newDataItem[DATA_ITEM_KEY5]]: true });
    setPage5((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult5((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (item.chk != true) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult2.data.forEach((item: any, index: number) => {
      if (item.chk != true) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows2.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object) - 1];
    }

    setMainDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState2({
        [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick3 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult3.data.forEach((item: any, index: number) => {
      if (item.chk != true) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows3.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult3.data[Math.min(...Object2)];
    } else {
      data = mainDataResult3.data[Math.min(...Object) - 1];
    }

    setMainDataResult3((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState3({
        [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick4 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult4.data.forEach((item: any, index: number) => {
      if (item.chk != true) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows4.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult4.data[Math.min(...Object2)];
    } else {
      data = mainDataResult4.data[Math.min(...Object) - 1];
    }

    setMainDataResult4((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState4({
        [data != undefined ? data[DATA_ITEM_KEY4] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick5 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult5.data.forEach((item: any, index: number) => {
      if (item.chk != true) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows5.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult5.data[Math.min(...Object2)];
    } else {
      data = mainDataResult5.data[Math.min(...Object) - 1];
    }

    setMainDataResult5((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState5({
        [data != undefined ? data[DATA_ITEM_KEY5] : newData[0]]: true,
      });
    }
  };

  const onSaveClick = () => {
    let valid = true;

    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    dataItem.map((item) => {
      if (
        item.prsnnum == "" ||
        item.paydeductdiv == "" ||
        item.payitemcd == ""
      ) {
        valid = false;
      }
    });

    if (valid != true) {
      alert("필수 값을 채워주세요.");
      return false;
    }

    if (dataItem.length === 0 && deletedMainRows.length == 0) return false;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      payyrmm_s: [],
      paytype_s: [],
      prsnnum_s: [],
      payitemcd_s: [],
      amt_s: [],
      remark_s: [],
      bonusrat_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        paytype = "",
        prsnnum = "",
        payitemcd = "",
        amt = "",
        remark = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.paytype_s.push(paytype);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.payitemcd_s.push(payitemcd);
      dataArr.amt_s.push(amt);
      dataArr.remark_s.push(remark);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        paytype = "",
        prsnnum = "",
        payitemcd = "",
        amt = "",
        remark = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.paytype_s.push(paytype);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.payitemcd_s.push(payitemcd);
      dataArr.amt_s.push(amt);
      dataArr.remark_s.push(remark);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "190",
      orgdiv: "01",
      paydeductdiv: filters.paydeductdiv,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      paytype_s: dataArr.paytype_s.join("|"),
      prsnnum_s: dataArr.prsnnum_s.join("|"),
      payitemcd_s: dataArr.payitemcd_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
    }));
  };

  const onSaveClick2 = () => {
    let valid = true;

    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    dataItem.map((item) => {
      if (
        item.prsnnum == "" ||
        item.paydeductdiv == "" ||
        item.payitemcd == "" ||
        item.paytype == "" ||
        item.payyrmm == "" ||
        item.payyrmm == undefined ||
        item.payyrmm == null
      ) {
        valid = false;
      }
    });

    if (valid != true) {
      alert("필수 값을 채워주세요.");
      return false;
    }

    if (dataItem.length === 0 && deletedMainRows2.length == 0) return false;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      payyrmm_s: [],
      paytype_s: [],
      prsnnum_s: [],
      payitemcd_s: [],
      amt_s: [],
      remark_s: [],
      bonusrat_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        payyrmm = "",
        paytype = "",
        prsnnum = "",
        payitemcd = "",
        amt = "",
        remark = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.payyrmm_s.push(
        typeof payyrmm == "string"
          ? payyrmm.substring(0, 6)
          : convertDateToStr(payyrmm).substr(0, 6)
      );
      dataArr.paytype_s.push(paytype);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.payitemcd_s.push(payitemcd);
      dataArr.amt_s.push(amt);
      dataArr.remark_s.push(remark);
    });
    deletedMainRows2.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        payyrmm = "",
        paytype = "",
        prsnnum = "",
        payitemcd = "",
        amt = "",
        remark = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.payyrmm_s.push(
        typeof payyrmm == "string"
          ? payyrmm.substring(0, 6)
          : convertDateToStr(payyrmm).substr(0, 6)
      );
      dataArr.paytype_s.push(paytype);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.payitemcd_s.push(payitemcd);
      dataArr.amt_s.push(amt);
      dataArr.remark_s.push(remark);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "180",
      orgdiv: "01",
      paydeductdiv: filters2.paydeductdiv,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      payyrmm_s: dataArr.payyrmm_s.join("|"),
      paytype_s: dataArr.paytype_s.join("|"),
      prsnnum_s: dataArr.prsnnum_s.join("|"),
      payitemcd_s: dataArr.payitemcd_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
    }));
  };

  const onSaveClick3 = () => {
    let valid = true;

    const dataItem = mainDataResult3.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    dataItem.map((item) => {
      if (
        item.prsnnum == "" ||
        item.paydeductdiv == "" ||
        item.payitemcd == "" ||
        item.paytype == "" ||
        item.payyrmm == "" ||
        item.payyrmm == undefined ||
        item.payyrmm == null
      ) {
        valid = false;
      }
    });

    if (valid != true) {
      alert("필수 값을 채워주세요.");
      return false;
    }

    if (dataItem.length === 0 && deletedMainRows3.length == 0) return false;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      payyrmm_s: [],
      paytype_s: [],
      prsnnum_s: [],
      payitemcd_s: [],
      amt_s: [],
      remark_s: [],
      bonusrat_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        payyrmm = "",
        paytype = "",
        prsnnum = "",
        payitemcd = "",
        amt = "",
        remark = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.payyrmm_s.push(
        typeof payyrmm == "string"
          ? payyrmm.substring(0, 6)
          : convertDateToStr(payyrmm).substr(0, 6)
      );
      dataArr.paytype_s.push(paytype);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.payitemcd_s.push(payitemcd);
      dataArr.amt_s.push(amt);
      dataArr.remark_s.push(remark);
    });
    deletedMainRows3.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        payyrmm = "",
        paytype = "",
        prsnnum = "",
        payitemcd = "",
        amt = "",
        remark = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.payyrmm_s.push(
        typeof payyrmm == "string"
          ? payyrmm.substring(0, 6)
          : convertDateToStr(payyrmm).substr(0, 6)
      );
      dataArr.paytype_s.push(paytype);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.payitemcd_s.push(payitemcd);
      dataArr.amt_s.push(amt);
      dataArr.remark_s.push(remark);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "210",
      orgdiv: "01",
      paydeductdiv: filters3.paydeductdiv,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      payyrmm_s: dataArr.payyrmm_s.join("|"),
      paytype_s: dataArr.paytype_s.join("|"),
      prsnnum_s: dataArr.prsnnum_s.join("|"),
      payitemcd_s: dataArr.payitemcd_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
    }));
  };

  const onSaveClick4 = () => {
    let valid = true;

    const dataItem = mainDataResult4.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    dataItem.map((item) => {
      if (
        item.prsnnum == "" ||
        item.paydeductdiv == "" ||
        item.payitemcd == "" ||
        item.payyrmm == "" ||
        item.payyrmm == undefined ||
        item.payyrmm == null
      ) {
        valid = false;
      }
    });

    if (valid != true) {
      alert("필수 값을 채워주세요.");
      return false;
    }

    if (dataItem.length === 0 && deletedMainRows4.length == 0) return false;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      payyrmm_s: [],
      paytype_s: [],
      prsnnum_s: [],
      payitemcd_s: [],
      amt_s: [],
      remark_s: [],
      bonusrat_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        payyrmm = "",
        prsnnum = "",
        payitemcd = "",
        amt = "",
        remark = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.payyrmm_s.push(
        typeof payyrmm == "string"
          ? payyrmm.substring(0, 6)
          : convertDateToStr(payyrmm).substr(0, 6)
      );
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.payitemcd_s.push(payitemcd);
      dataArr.amt_s.push(amt);
      dataArr.remark_s.push(remark);
    });
    deletedMainRows4.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        payyrmm = "",
        prsnnum = "",
        payitemcd = "",
        amt = "",
        remark = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.payyrmm_s.push(
        typeof payyrmm == "string"
          ? payyrmm.substring(0, 6)
          : convertDateToStr(payyrmm).substr(0, 6)
      );
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.payitemcd_s.push(payitemcd);
      dataArr.amt_s.push(amt);
      dataArr.remark_s.push(remark);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "212",
      orgdiv: "01",
      paydeductdiv: filters4.paydeductdiv,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      payyrmm_s: dataArr.payyrmm_s.join("|"),
      prsnnum_s: dataArr.prsnnum_s.join("|"),
      payitemcd_s: dataArr.payitemcd_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
    }));
  };

  const onSaveClick5 = () => {
    let valid = true;

    const dataItem = mainDataResult5.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    dataItem.map((item) => {
      if (
        item.prsnnum == "" ||
        item.paytype == "" ||
        item.payyrmm == "" ||
        item.payyrmm == undefined ||
        item.payyrmm == null
      ) {
        valid = false;
      }
    });

    if (valid != true) {
      alert("필수 값을 채워주세요.");
      return false;
    }

    if (dataItem.length === 0 && deletedMainRows5.length == 0) return false;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      payyrmm_s: [],
      paytype_s: [],
      prsnnum_s: [],
      payitemcd_s: [],
      amt_s: [],
      remark_s: [],
      bonusrat_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        payyrmm = "",
        paytype = "",
        prsnnum = "",
        amt = "",
        remark = "",
        bnsrat = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.payyrmm_s.push(
        typeof payyrmm == "string"
          ? payyrmm.substring(0, 6)
          : convertDateToStr(payyrmm).substr(0, 6)
      );
      dataArr.payitemcd_s.push(
        filters5.paydeductdiv == "1" ? "" : filters5.payitemcd
      );
      dataArr.paytype_s.push(paytype);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.amt_s.push(amt);
      dataArr.remark_s.push(remark);
      dataArr.bonusrat_s.push(bnsrat);
    });
    deletedMainRows5.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        payyrmm = "",
        paytype = "",
        prsnnum = "",
        amt = "",
        remark = "",
        bnsrat = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.payyrmm_s.push(
        typeof payyrmm == "string"
          ? payyrmm.substring(0, 6)
          : convertDateToStr(payyrmm).substr(0, 6)
      );
      dataArr.payitemcd_s.push(
        filters5.paydeductdiv == "1" ? "" : filters5.payitemcd
      );
      dataArr.paytype_s.push(paytype);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.amt_s.push(amt);
      dataArr.remark_s.push(remark);
      dataArr.bonusrat_s.push(bnsrat);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "110",
      orgdiv: "01",
      paydeductdiv: filters5.paydeductdiv,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      payyrmm_s: dataArr.payyrmm_s.join("|"),
      payitemcd_s: dataArr.payitemcd_s.join("|"),
      paytype_s: dataArr.paytype_s.join("|"),
      prsnnum_s: dataArr.prsnnum_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      bonusrat_s: dataArr.bonusrat_s.join("|"),
    }));
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    paydeductdiv: "",
    rowstatus_s: "",
    payyrmm_s: "",
    paytype_s: "",
    prsnnum_s: "",
    payitemcd_s: "",
    amt_s: "",
    remark_s: "",
    bonusrat_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A3080W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_paydeductdiv": paraData.paydeductdiv,

      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_payyrmm_s": paraData.payyrmm_s,
      "@p_paytype_s": paraData.paytype_s,
      "@p_prsnnum_s": paraData.prsnnum_s,
      "@p_payitemcd_s": paraData.payitemcd_s,
      "@p_amt_s": paraData.amt_s,
      "@p_remark_s": paraData.remark_s,
      "@p_bonusrat_s": paraData.bonusrat_s,

      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A3080W",
      "@p_service_id": companyCode,
    },
  };

  useEffect(() => {
    if (paraData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      deletedMainRows = [];
      deletedMainRows2 = [];
      deletedMainRows3 = [];
      deletedMainRows4 = [];
      deletedMainRows5 = [];
      resetAllGrid();
      if (tabSelected == 0) {
        setFilters((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: 1,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters4((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters5((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
      } else if (tabSelected == 1) {
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters4((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters5((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
      } else if (tabSelected == 2) {
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: 1,
          isSearch: true,
        }));
        setFilters4((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters5((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
      } else if (tabSelected == 3) {
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters4((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: 1,
          isSearch: true,
        }));
        setFilters5((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
      } else if (tabSelected == 4) {
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters4((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters5((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: 1,
          isSearch: true,
        }));
      }
      setValues(false);
      setValues2(false);
      setValues3(false);
      setValues4(false);
      setValues5(false);
      setParaData({
        workType: "",
        orgdiv: "01",
        paydeductdiv: "",
        rowstatus_s: "",
        payyrmm_s: "",
        paytype_s: "",
        prsnnum_s: "",
        payitemcd_s: "",
        amt_s: "",
        remark_s: "",
        bonusrat_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const setUserMultiData = (data: IPrsnnum[]) => {
    data.map((item) => {
      mainDataResult.data.map((item) => {
        if (item.num > temp) {
          temp = item.num;
        }
      });
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        amt: 0,
        chk: false,
        dptcd: item.dptcd,
        findkey: "",
        orgdiv: "01",
        paydeductdiv: filters.paydeductdiv,
        payitemcd: "100",
        paytype: "",
        prsnnm: item.prsnnm,
        prsnnum: item.prsnnum,
        remark: "",
        rowstatus: "N",
      };
      const newDataItem2 = {
        [DATA_ITEM_KEY]: ++temp,
        amt: 0,
        chk: false,
        dptcd: item.dptcd,
        findkey: "",
        orgdiv: "01",
        paydeductdiv: filters.paydeductdiv,
        payitemcd: "150",
        paytype: "",
        prsnnm: item.prsnnm,
        prsnnum: item.prsnnum,
        remark: "",
        rowstatus: "N",
      };
      setMainDataResult((prev) => {
        return {
          data: [newDataItem, newDataItem2, ...prev.data],
          total: prev.total + 2,
        };
      });
      setPage((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 2,
      }));
      setSelectedState({ [newDataItem2[DATA_ITEM_KEY]]: true });
    });
  };

  const setUserMultiData2 = (data: IPrsnnum[]) => {
    data.map((item) => {
      mainDataResult2.data.map((item) => {
        if (item.num > temp2) {
          temp2 = item.num;
        }
      });
      const newDataItem = {
        [DATA_ITEM_KEY2]: ++temp2,
        amt: 0,
        chk: false,
        dptcd: item.dptcd,
        findkey: "",
        orgdiv: "01",
        paydeductdiv: filters2.paydeductdiv,
        payitemcd: "100",
        paytype: "",
        payyrmm: convertDateToStr(filters2.payyrmm),
        prsnnm: item.prsnnm,
        prsnnum: item.prsnnum,
        remark: "",
        rowstatus: "N",
      };
      const newDataItem2 = {
        [DATA_ITEM_KEY2]: ++temp2,
        amt: 0,
        chk: false,
        dptcd: item.dptcd,
        findkey: "",
        orgdiv: "01",
        paydeductdiv: filters2.paydeductdiv,
        payitemcd: "150",
        paytype: "",
        payyrmm: convertDateToStr(filters2.payyrmm),
        prsnnm: item.prsnnm,
        prsnnum: item.prsnnum,
        remark: "",
        rowstatus: "N",
      };
      setMainDataResult2((prev) => {
        return {
          data: [newDataItem, newDataItem2, ...prev.data],
          total: prev.total + 2,
        };
      });
      setPage2((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 2,
      }));
      setSelectedState2({ [newDataItem2[DATA_ITEM_KEY2]]: true });
    });
  };

  const setUserMultiData3 = (data: IPrsnnum[]) => {
    data.map((item) => {
      mainDataResult3.data.map((item) => {
        if (item.num > temp3) {
          temp3 = item.num;
        }
      });
      const newDataItem = {
        [DATA_ITEM_KEY3]: ++temp3,
        amt: 0,
        chk: false,
        dptcd: item.dptcd,
        findkey: "",
        orgdiv: "01",
        paydeductdiv: filters3.paydeductdiv,
        payitemcd: "100",
        paytype: "",
        payyrmm: convertDateToStr(filters3.payyrmm),
        prsnnm: item.prsnnm,
        prsnnum: item.prsnnum,
        remark: "",
        rowstatus: "N",
      };
      const newDataItem2 = {
        [DATA_ITEM_KEY3]: ++temp3,
        amt: 0,
        chk: false,
        dptcd: item.dptcd,
        findkey: "",
        orgdiv: "01",
        paydeductdiv: filters3.paydeductdiv,
        payitemcd: "150",
        paytype: "",
        payyrmm: convertDateToStr(filters3.payyrmm),
        prsnnm: item.prsnnm,
        prsnnum: item.prsnnum,
        remark: "",
        rowstatus: "N",
      };
      setMainDataResult3((prev) => {
        return {
          data: [newDataItem, newDataItem2, ...prev.data],
          total: prev.total + 2,
        };
      });
      setPage3((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 2,
      }));
      setSelectedState3({ [newDataItem2[DATA_ITEM_KEY3]]: true });
    });
  };

  const setUserMultiData4 = (data: IPrsnnum[]) => {
    data.map((item) => {
      mainDataResult4.data.map((item) => {
        if (item.num > temp4) {
          temp4 = item.num;
        }
      });
      const newDataItem = {
        [DATA_ITEM_KEY4]: ++temp4,
        amt: 0,
        chk: false,
        dptcd: item.dptcd,
        findkey: "",
        orgdiv: "01",
        paydeductdiv: filters4.paydeductdiv,
        payitemcd: "100",
        payyrmm: convertDateToStr(filters4.payyrmm),
        prsnnm: item.prsnnm,
        prsnnum: item.prsnnum,
        remark: "",
        rowstatus: "N",
      };
      const newDataItem2 = {
        [DATA_ITEM_KEY4]: ++temp4,
        amt: 0,
        chk: false,
        dptcd: item.dptcd,
        findkey: "",
        orgdiv: "01",
        paydeductdiv: filters4.paydeductdiv,
        payitemcd: "150",
        payyrmm: convertDateToStr(filters4.payyrmm),
        prsnnm: item.prsnnm,
        prsnnum: item.prsnnum,
        remark: "",
        rowstatus: "N",
      };
      setMainDataResult4((prev) => {
        return {
          data: [newDataItem, newDataItem2, ...prev.data],
          total: prev.total + 2,
        };
      });
      setPage4((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 2,
      }));
      setSelectedState4({ [newDataItem2[DATA_ITEM_KEY4]]: true });
    });
  };

  const setUserMultiData5 = (data: IPrsnnum[]) => {
    data.map((item) => {
      mainDataResult5.data.map((item) => {
        if (item.num > temp5) {
          temp5 = item.num;
        }
      });
      const newDataItem = {
        [DATA_ITEM_KEY5]: ++temp5,
        amt: 0,
        bnsrat: 0,
        chk: false,
        dptcd: item.dptcd,
        findkey: "",
        orgdiv: "01",
        paydeductdiv: "",
        paytype: "",
        payyrmm: convertDateToStr(filters5.payyrmm),
        prsnnm: item.prsnnm,
        prsnnum: item.prsnnum,
        remark: "",
        rowstatus: "N",
      };

      setMainDataResult5((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      setPage5((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 1,
      }));
      setSelectedState5({ [newDataItem[DATA_ITEM_KEY5]]: true });
    });
  };

  const onCopyClick2 = async () => {
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3080W_Q",
      pageNumber: 1,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": "COPY2",
        "@p_orgdiv": filters2.orgdiv,
        "@p_payyrmm": convertDateToStr(filters2.payyrmm).substring(0, 6),
        "@p_paytype": filters2.paytype,
        "@p_paydeductdiv": filters2.paydeductdiv,
        "@p_prsnnum": filters2.prsnnum,
        "@p_prsnnm": filters2.prsnnm,
        "@p_rtrchk": filters2.rtrchk,
        "@p_payitemcd": filters2.payitemcd,
        "@p_find_row_value": filters2.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      if (totalRowCnt > 0) {
        mainDataResult2.data.map((item) => {
          if (item.num > temp2) {
            temp2 = item.num;
          }
        });

        rows.map((item: any, idx: number) => {
          const newDataItem = {
            [DATA_ITEM_KEY2]: ++temp2,
            amt: item.amt,
            chk: item.chk == "" || item.chk == "N" ? false : true,
            dptcd: item.dptcd,
            findkey: "",
            orgdiv: "01",
            paydeductdiv: item.paydeductdiv,
            payitemcd: item.payitemcd,
            paytype: item.paytype,
            payyrmm: item.payyrmm + "01",
            prsnnm: item.prsnnm,
            prsnnum: item.prsnnum,
            remark: item.remark,
            rowstatus: "N",
          };

          setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
          setMainDataResult2((prev) => {
            return {
              data: [newDataItem, ...prev.data],
              total: prev.total + 1,
            };
          });
        });
      } else {
        alert("데이터가 없습니다.");
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const onCopyClick3 = async () => {
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3080W_Q",
      pageNumber: 1,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": "COPY",
        "@p_orgdiv": filters3.orgdiv,
        "@p_payyrmm": convertDateToStr(filters3.payyrmm).substring(0, 6),
        "@p_paytype": filters3.paytype,
        "@p_paydeductdiv": filters3.paydeductdiv,
        "@p_prsnnum": filters3.prsnnum,
        "@p_prsnnm": filters3.prsnnm,
        "@p_rtrchk": filters3.rtrchk,
        "@p_payitemcd": filters3.payitemcd,
        "@p_find_row_value": filters3.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      if (totalRowCnt > 0) {
        mainDataResult3.data.map((item) => {
          if (item.num > temp3) {
            temp3 = item.num;
          }
        });

        rows.map((item: any, idx: number) => {
          const newDataItem = {
            [DATA_ITEM_KEY3]: ++temp3,
            amt: item.amt,
            chk: item.chk == "" || item.chk == "N" ? false : true,
            dptcd: item.dptcd,
            findkey: "",
            orgdiv: "01",
            paydeductdiv: item.paydeductdiv,
            payitemcd: item.payitemcd,
            paytype: item.paytype,
            payyrmm: item.payyrmm + "01",
            prsnnm: item.prsnnm,
            prsnnum: item.prsnnum,
            remark: item.remark,
            rowstatus: "N",
          };

          setSelectedState3({ [newDataItem[DATA_ITEM_KEY3]]: true });
          setMainDataResult3((prev) => {
            return {
              data: [newDataItem, ...prev.data],
              total: prev.total + 1,
            };
          });
        });
      } else {
        alert("데이터가 없습니다.");
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  return (
    <>
      <TitleContainer>
        <Title>지급공제처리</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A3080W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>급여년월</th>
              <td>
                {tabSelected == 0 ? (
                  <DatePicker
                    name="payyrmm"
                    value={filters.payyrmm}
                    format="yyyy-MM"
                    className="readonly"
                    placeholder=""
                    calendar={MonthCalendar}
                  />
                ) : (
                  <DatePicker
                    name="payyrmm"
                    value={filters.payyrmm}
                    format="yyyy-MM"
                    onChange={filterInputChange}
                    className="required"
                    placeholder=""
                    calendar={MonthCalendar}
                  />
                )}
              </td>
              <th>수당구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="paydeductdiv"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>재직여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="rtrchk"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>급여유형</th>
              <td>
                {tabSelected == 3
                  ? customOptionData !== null && (
                      <CustomOptionComboBox
                        name="paytype"
                        value={filters.paytype}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        disabled={true}
                        className="readonly"
                      />
                    )
                  : customOptionData !== null && (
                      <CustomOptionComboBox
                        name="paytype"
                        value={filters.paytype}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
              </td>
              <th>사번</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onUserWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>성명</th>
              <td>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  onChange={filterInputChange}
                />
              </td>
              {tabSelected == 4 && filters5.paydeductdiv == "1" ? (
                ""
              ) : (
                <>
                  <th>지급항목코드</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="payitemcd"
                        value={filters.payitemcd}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="payitemnm"
                        valueField="payitemcd"
                      />
                    )}
                  </td>
                </>
              )}
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="고정지급공제">
          <FormContext.Provider
            value={{
              prsnnum,
              prsnnm,
              dptcd,
              setPrsnnum,
              setPrsnnm,
              setDptcd,
              mainDataState,
              setMainDataState,
              // fetchGrid,
            }}
          >
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>기본정보</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    onClick={onUserMultiWndClick}
                    icon="folder-open"
                  >
                    일괄등록
                  </Button>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="지급공제처리"
              >
                <Grid
                  style={{ height: "70vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                    mainDataState
                  )}
                  {...mainDataState}
                  onDataStateChange={onMainDataStateChange}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult.total}
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={pageChange}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  <GridColumn
                    field="chk"
                    title=" "
                    width="45px"
                    headerCell={CustomCheckBoxCell}
                    cell={CheckBoxCell}
                  />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : comboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : radioField.includes(item.fieldName)
                                ? CustomRadioCell
                                : commendField.includes(item.fieldName)
                                ? ColumnCommandCell
                                : undefined
                            }
                            headerCell={
                              requiredField.includes(item.fieldName)
                                ? RequiredHeader
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell
                                : numberField.includes(item.fieldName)
                                ? editNumberFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </FormContext.Provider>
        </TabStripTab>
        <TabStripTab title="일시지급공제">
          <FormContext2.Provider
            value={{
              prsnnum2,
              prsnnm2,
              dptcd2,
              setPrsnnum2,
              setPrsnnm2,
              setDptcd2,
              mainDataState2,
              setMainDataState2,
              // fetchGrid,
            }}
          >
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>기본정보</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    onClick={onUserMultiWndClick2}
                    icon="folder-open"
                  >
                    일괄등록
                  </Button>
                  <Button
                    themeColor={"primary"}
                    onClick={onCopyClick2}
                    icon="copy"
                  >
                    전월복사
                  </Button>
                  <Button
                    onClick={onAddClick2}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
                  <Button
                    onClick={onDeleteClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                  <Button
                    onClick={onSaveClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult2.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="지급공제처리"
              >
                <Grid
                  style={{ height: "70vh" }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      payyrmm: toDate(row.payyrmm + "01"),
                      [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
                    })),
                    mainDataState2
                  )}
                  {...mainDataState2}
                  onDataStateChange={onMainDataStateChange2}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange2}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult2.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef2}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange2}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange2}
                  cellRender={customCellRender2}
                  rowRender={customRowRender2}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  <GridColumn
                    field="chk"
                    title=" "
                    width="45px"
                    headerCell={CustomCheckBoxCell2}
                    cell={CheckBoxCell}
                  />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList2"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : comboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : radioField.includes(item.fieldName)
                                ? CustomRadioCell
                                : commendField.includes(item.fieldName)
                                ? ColumnCommandCell2
                                : dateField.includes(item.fieldName)
                                ? MonthDateCell
                                : undefined
                            }
                            headerCell={
                              requiredField2.includes(item.fieldName)
                                ? RequiredHeader
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell2
                                : numberField.includes(item.fieldName)
                                ? editNumberFooterCell2
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </FormContext2.Provider>
        </TabStripTab>
        <TabStripTab title="예외지급공제">
          <FormContext3.Provider
            value={{
              prsnnum3,
              prsnnm3,
              dptcd3,
              setPrsnnum3,
              setPrsnnm3,
              setDptcd3,
              mainDataState3,
              setMainDataState3,
              // fetchGrid,
            }}
          >
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>기본정보</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    onClick={onUserMultiWndClick3}
                    icon="folder-open"
                  >
                    일괄등록
                  </Button>
                  <Button
                    themeColor={"primary"}
                    onClick={onCopyClick3}
                    icon="copy"
                  >
                    전월복사
                  </Button>
                  <Button
                    onClick={onAddClick3}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
                  <Button
                    onClick={onDeleteClick3}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                  <Button
                    onClick={onSaveClick3}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult3.data}
                ref={(exporter) => {
                  _export3 = exporter;
                }}
                fileName="지급공제처리"
              >
                <Grid
                  style={{ height: "70vh" }}
                  data={process(
                    mainDataResult3.data.map((row) => ({
                      ...row,
                      payyrmm: toDate(row.payyrmm + "01"),
                      [SELECTED_FIELD]: selectedState3[idGetter3(row)], //선택된 데이터
                    })),
                    mainDataState3
                  )}
                  {...mainDataState3}
                  onDataStateChange={onMainDataStateChange3}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY3}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange3}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult3.total}
                  skip={page3.skip}
                  take={page3.take}
                  pageable={true}
                  onPageChange={pageChange3}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef3}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange3}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange3}
                  cellRender={customCellRender3}
                  rowRender={customRowRender3}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  <GridColumn
                    field="chk"
                    title=" "
                    width="45px"
                    headerCell={CustomCheckBoxCell3}
                    cell={CheckBoxCell}
                  />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList3"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : comboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : radioField.includes(item.fieldName)
                                ? CustomRadioCell
                                : commendField.includes(item.fieldName)
                                ? ColumnCommandCell3
                                : dateField.includes(item.fieldName)
                                ? MonthDateCell
                                : undefined
                            }
                            headerCell={
                              requiredField2.includes(item.fieldName)
                                ? RequiredHeader
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell3
                                : numberField.includes(item.fieldName)
                                ? editNumberFooterCell3
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </FormContext3.Provider>
        </TabStripTab>
        <TabStripTab title="추가지급공제">
          <FormContext4.Provider
            value={{
              prsnnum4,
              prsnnm4,
              dptcd4,
              setPrsnnum4,
              setPrsnnm4,
              setDptcd4,
              mainDataState4,
              setMainDataState4,
              // fetchGrid,
            }}
          >
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>기본정보</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    onClick={onUserMultiWndClick4}
                    icon="folder-open"
                  >
                    일괄등록
                  </Button>
                  <Button
                    onClick={onAddClick4}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
                  <Button
                    onClick={onDeleteClick4}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                  <Button
                    onClick={onSaveClick4}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult4.data}
                ref={(exporter) => {
                  _export4 = exporter;
                }}
                fileName="지급공제처리"
              >
                <Grid
                  style={{ height: "70vh" }}
                  data={process(
                    mainDataResult4.data.map((row) => ({
                      ...row,
                      payyrmm: toDate(row.payyrmm + "01"),
                      [SELECTED_FIELD]: selectedState4[idGetter4(row)], //선택된 데이터
                    })),
                    mainDataState4
                  )}
                  {...mainDataState4}
                  onDataStateChange={onMainDataStateChange4}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY4}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange4}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult4.total}
                  skip={page4.skip}
                  take={page4.take}
                  pageable={true}
                  onPageChange={pageChange4}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef4}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange4}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange4}
                  cellRender={customCellRender4}
                  rowRender={customRowRender4}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  <GridColumn
                    field="chk"
                    title=" "
                    width="45px"
                    headerCell={CustomCheckBoxCell4}
                    cell={CheckBoxCell}
                  />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList4"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : comboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : radioField.includes(item.fieldName)
                                ? CustomRadioCell
                                : commendField.includes(item.fieldName)
                                ? ColumnCommandCell4
                                : dateField.includes(item.fieldName)
                                ? MonthDateCell
                                : undefined
                            }
                            headerCell={
                              requiredField2.includes(item.fieldName)
                                ? RequiredHeader
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell4
                                : numberField.includes(item.fieldName)
                                ? editNumberFooterCell4
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </FormContext4.Provider>
        </TabStripTab>
        <TabStripTab title="상여예외지급공제">
          <FormContext5.Provider
            value={{
              prsnnum5,
              prsnnm5,
              dptcd5,
              setPrsnnum5,
              setPrsnnm5,
              setDptcd5,
              mainDataState5,
              setMainDataState5,
              // fetchGrid,
            }}
          >
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>기본정보</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    onClick={onUserMultiWndClick5}
                    icon="folder-open"
                  >
                    일괄등록
                  </Button>
                  <Button
                    onClick={onAddClick5}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
                  <Button
                    onClick={onDeleteClick5}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                  <Button
                    onClick={onSaveClick5}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult5.data}
                ref={(exporter) => {
                  _export5 = exporter;
                }}
                fileName="지급공제처리"
              >
                <Grid
                  style={{ height: "70vh" }}
                  data={process(
                    mainDataResult5.data.map((row) => ({
                      ...row,
                      payyrmm: toDate(row.payyrmm + "01"),
                      [SELECTED_FIELD]: selectedState5[idGetter5(row)], //선택된 데이터
                    })),
                    mainDataState5
                  )}
                  {...mainDataState5}
                  onDataStateChange={onMainDataStateChange5}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY5}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange5}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult5.total}
                  skip={page5.skip}
                  take={page5.take}
                  pageable={true}
                  onPageChange={pageChange5}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef5}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange5}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange5}
                  cellRender={customCellRender5}
                  rowRender={customRowRender5}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  <GridColumn
                    field="chk"
                    title=" "
                    width="45px"
                    headerCell={CustomCheckBoxCell5}
                    cell={CheckBoxCell}
                  />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList5"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : comboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : radioField.includes(item.fieldName)
                                ? CustomRadioCell
                                : commendField.includes(item.fieldName)
                                ? ColumnCommandCell5
                                : dateField.includes(item.fieldName)
                                ? MonthDateCell
                                : undefined
                            }
                            headerCell={
                              requiredField2.includes(item.fieldName)
                                ? RequiredHeader
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell5
                                : numberField.includes(item.fieldName)
                                ? editNumberFooterCell5
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </FormContext5.Provider>
        </TabStripTab>
      </TabStrip>
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
      {UserMultiWindowVisible && (
        <HU_A3080W_Window
          setVisible={setUserMultiWindowVisible}
          setData={setUserMultiData}
          modal={true}
        />
      )}
      {UserMultiWindowVisible2 && (
        <HU_A3080W_Window
          setVisible={setUserMultiWindowVisible2}
          setData={setUserMultiData2}
          modal={true}
        />
      )}
      {UserMultiWindowVisible3 && (
        <HU_A3080W_Window
          setVisible={setUserMultiWindowVisible3}
          setData={setUserMultiData3}
          modal={true}
        />
      )}
      {UserMultiWindowVisible4 && (
        <HU_A3080W_Window
          setVisible={setUserMultiWindowVisible4}
          setData={setUserMultiData4}
          modal={true}
        />
      )}
      {UserMultiWindowVisible5 && (
        <HU_A3080W_Window
          setVisible={setUserMultiWindowVisible5}
          setData={setUserMultiData5}
          modal={true}
        />
      )}
      {gridList.map((grid: TGrid) =>
        grid.columns.map((column: TColumn) => (
          <div
            key={column.id}
            id={column.id}
            data-grid-name={grid.gridName}
            data-field={column.field}
            data-caption={column.caption}
            data-width={column.width}
            hidden
          />
        ))
      )}
    </>
  );
};

export default HU_A3080W;
