import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  findMessage,
  getAcntQuery,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/GroupRenderers";
import AccountWindow from "../components/Windows/CommonWindows/AccountWindow";
import { useApi } from "../hooks/api";
import { isFilterHideState, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_A0020W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
const DATA_ITEM_KEY5 = "num";
const DATA_ITEM_KEY6 = "num";
const radioField = ["caculationgb"];
const customField = ["controltype", "acntgrpgb", "grpchr", "acntcd"];
const checkField = ["system_yn", "p_line", "p_border", "p_color"];
const numberField = ["p_seq"];
const requiredField = ["acntgrpnm", "acntcd", "stdrmkcd", "stdrmknm1"];
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
let targetRowIndex4: null | number = null;
let targetRowIndex5: null | number = null;
let targetRowIndex6: null | number = null;

type TdataArr = {
  rowstatus_s: string[];
  mngitemcd_s: string[];
  mngitemnm_s: string[];
  system_yn_s: string[];
  extra_field1_s: string[];
  extra_field2_s: string[];
  extra_field3_s: string[];
  table_id_s: string[];
  remark_s: string[];
  controltype_s: string[];
};

type TdataArr2 = {
  rowstatus_s: string[];
  acntgrpcd_s: string[];
  prntacntgrp_s: string[];
  highestyn_s: string[];
  acntgrpgb_s: string[];
  acntgrpnm_s: string[];
  grpchr_s: string[];
  p_line_s: string[];
  p_border_s: string[];
  p_color_s: string[];
  p_seq_s: string[];
  extra_field1_s: string[];
  extra_field2_s: string[];
  extra_field3_s: string[];
  rowstatus2_s: string[];
  acntcd_s: string[];
  acntgrpnm2_s: string[];
  caculationgb_s: string[];
  acntgrpauto_s: string[];
};

type TdataArr3 = {
  rowstatus_s: string[];
  stdrmkcd_s: string[];
  stdrmknm1_s: string[];
  stdrmknm2_s: string[];
  acntcd_s: string[];
  acntnm_s: string[];
};

type TdataArr4 = {
  rowstatus_s: string[];
  itemacnt_s: string[];
  doexdiv_s: string[];
  inoutdiv_s: string[];
  soyn_s: string[];
  dracntcd_s: string[];
  cracntcd_s: string[];
  sodracntcd_s: string[];
  socracntcd_s: string[];
};
let temp = 0;
let temp2 = 0;
let temp3 = 0;
let temp4 = 0;
let temp5 = 0;
var index = 0;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_AC910, L_AC911, L_AC080, L_BA061,L_BA005",
    setBizComponentData
  );
  //보고서구분, 그룹구분, 그룹특성, 품목계정, 내수구분

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "controltype"
      ? "L_AC910"
      : field == "acntgrpgb"
      ? "L_AC911"
      : field == "grpchr"
      ? "L_AC080"
      : field == "itemacnt"
      ? "L_BA061"
      : field == "doexdiv"
      ? "L_BA005"
      : "";

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("R_Calc", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "caculationgb" ? "R_Calc" : "";
  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} {...props} />
  ) : (
    <td />
  );
};

interface IAccountData {
  acntcd: string;
  acntnm: string;
}

const FormContext = createContext<{
  acntcd: string;
  setAcntcd: (d: any) => void;
  acntnm: string;
  setAcntnm: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

const FormContext2 = createContext<{
  acntcd2: string;
  setAcntcd2: (d: any) => void;
  acntnm2: string;
  setAcntnm2: (d: any) => void;
  mainDataState6: State;
  setMainDataState6: (d: any) => void;
}>({} as any);

const FormContext3 = createContext<{
  acntcd3: string;
  setAcntcd3: (d: any) => void;
  acntnm3: string;
  setAcntnm3: (d: any) => void;
  mainDataState6: State;
  setMainDataState6: (d: any) => void;
}>({} as any);

const FormContext4 = createContext<{
  acntcd4: string;
  setAcntcd4: (d: any) => void;
  acntnm4: string;
  setAcntnm4: (d: any) => void;
  mainDataState6: State;
  setMainDataState6: (d: any) => void;
}>({} as any);

const FormContext5 = createContext<{
  acntcd5: string;
  setAcntcd5: (d: any) => void;
  acntnm5: string;
  setAcntnm5: (d: any) => void;
  mainDataState6: State;
  setMainDataState6: (d: any) => void;
}>({} as any);

const FormContext6 = createContext<{
  acntcd6: string;
  setAcntcd6: (d: any) => void;
  acntnm6: string;
  setAcntnm6: (d: any) => void;
  mainDataState5: State;
  setMainDataState5: (d: any) => void;
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
    acntcd,
    acntnm,
    setAcntcd,
    setAcntnm,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext);
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };
  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);

  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
  };

  const setAcntData = (data: IAccountData) => {
    setAcntcd(data.acntcd);
    setAcntnm(data.acntnm);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInInput>
        <Button
          onClick={onAccountWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAcntData}
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
    acntcd2,
    acntnm2,
    setAcntcd2,
    setAcntnm2,
    mainDataState6,
    setMainDataState6,
  } = useContext(FormContext2);
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };
  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);

  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
  };

  const setAcntData = (data: IAccountData) => {
    setAcntcd2(data.acntcd);
    setAcntnm2(data.acntnm);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInInput>
        <Button
          onClick={onAccountWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAcntData}
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
    acntcd3,
    acntnm3,
    setAcntcd3,
    setAcntnm3,
    mainDataState6,
    setMainDataState6,
  } = useContext(FormContext3);
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };
  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);

  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
  };

  const setAcntData = (data: IAccountData) => {
    setAcntcd3(data.acntcd);
    setAcntnm3(data.acntnm);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInInput>
        <Button
          onClick={onAccountWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAcntData}
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
    acntcd4,
    acntnm4,
    setAcntcd4,
    setAcntnm4,
    mainDataState6,
    setMainDataState6,
  } = useContext(FormContext4);
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };
  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);

  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
  };

  const setAcntData = (data: IAccountData) => {
    setAcntcd4(data.acntcd);
    setAcntnm4(data.acntnm);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInInput>
        <Button
          onClick={onAccountWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAcntData}
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
    acntcd5,
    acntnm5,
    setAcntcd5,
    setAcntnm5,
    mainDataState6,
    setMainDataState6,
  } = useContext(FormContext5);
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };
  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);

  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
  };

  const setAcntData = (data: IAccountData) => {
    setAcntcd5(data.acntcd);
    setAcntnm5(data.acntnm);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInInput>
        <Button
          onClick={onAccountWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAcntData}
          modal={true}
        />
      )}
    </>
  );
};

const ColumnCommandCell6 = (props: GridCellProps) => {
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
    acntcd6,
    acntnm6,
    setAcntcd6,
    setAcntnm6,
    mainDataState5,
    setMainDataState5,
  } = useContext(FormContext6);
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };
  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);

  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
  };

  const setAcntData = (data: IAccountData) => {
    setAcntcd6(data.acntcd);
    setAcntnm6(data.acntnm);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInInput>
        <Button
          onClick={onAccountWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAcntData}
          modal={true}
        />
      )}
    </>
  );
};

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;

const AC_A0020W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const idGetter6 = getter(DATA_ITEM_KEY6);
  const processApi = useApi();
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [mobileheight5, setMobileHeight5] = useState(0);
  const [mobileheight6, setMobileHeight6] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);
  const [webheight5, setWebHeight5] = useState(0);
  const [webheight6, setWebHeight6] = useState(0);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [tabSelected, setTabSelected] = React.useState(0);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".TitleContainer");
      height3 = getHeight(".ButtonContainer3");
      height4 = getHeight(".ButtonContainer4");
      height5 = getHeight(".ButtonContainer5");
      height6 = getHeight(".ButtonContainer6");
      height7 = getHeight(".k-tabstrip-items-wrapper");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2 - height7);
        setMobileHeight2(getDeviceHeight(true) - height2 - height7);
        setMobileHeight3(getDeviceHeight(true) - height2 - height3 - height7);
        setMobileHeight4(getDeviceHeight(true) - height2 - height4 - height7);
        setMobileHeight5(getDeviceHeight(true) - height2 - height5 - height7);
        setMobileHeight6(getDeviceHeight(true) - height2 - height6 - height7);
        setWebHeight(getDeviceHeight(true) - height - height2 - height7);
        setWebHeight2(getDeviceHeight(true) - height2 - height7);
        setWebHeight3(getDeviceHeight(true) - height2 - height3 - height7);
        setWebHeight4(getDeviceHeight(true) - height2 - height4 - height7);
        setWebHeight5(getDeviceHeight(true) - height2 - height5 - height7);
        setWebHeight6(getDeviceHeight(true) - height2 - height6 - height7);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [
    customOptionData,
    tabSelected,
    webheight,
    webheight2,
    webheight3,
    webheight4,
    webheight5,
    webheight6,
  ]);

  UsePermissions(setPermissions);
  const [acntcd, setAcntcd] = useState<string>("");
  const [acntnm, setAcntnm] = useState<string>("");
  const [acntcd2, setAcntcd2] = useState<string>("");
  const [acntnm2, setAcntnm2] = useState<string>("");
  const [acntcd3, setAcntcd3] = useState<string>("");
  const [acntnm3, setAcntnm3] = useState<string>("");
  const [acntcd4, setAcntcd4] = useState<string>("");
  const [acntnm4, setAcntnm4] = useState<string>("");
  const [acntcd5, setAcntcd5] = useState<string>("");
  const [acntcd6, setAcntcd6] = useState<string>("");
  const [acntnm5, setAcntnm5] = useState<string>("");
  const [acntnm6, setAcntnm6] = useState<string>("");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);
  const [page6, setPage6] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
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
      find_row_value: "",
      isSearch: true,
    }));
    setDetailFilter2((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setDetailFilter2_1((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setPage3(initialPageState);
    setPage4(initialPageState);

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilter2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));
    setDetailFilter2_1((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setPage4(initialPageState);

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilter2_1((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange5 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage5({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange6 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters4((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage6({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));

      setFilters2((prev) => ({
        ...prev,
        acntses: defaultOption.find((item: any) => item.id == "acntses")
          ?.valueCode,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setFilters4((prev) => ({
        ...prev,
        inoutdiv: defaultOption.find((item: any) => item.id == "inoutdiv")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  useEffect(() => {
    const newData = mainDataResult4.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState4)[0])
        ? {
            ...item,
            acntcd: acntcd,
            acntnm: acntnm,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [EDIT_FIELD]: undefined,
          }
        : {
            ...item,
          }
    );
    setMainDataResult4((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [acntcd, acntnm]);

  useEffect(() => {
    const newData = mainDataResult6.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState6)[0])
        ? {
            ...item,
            cracntcd: acntcd2,
            cracntnm: acntnm2,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [EDIT_FIELD]: undefined,
          }
        : {
            ...item,
          }
    );
    setMainDataResult6((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [acntcd2, acntnm2]);

  useEffect(() => {
    const newData = mainDataResult6.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState6)[0])
        ? {
            ...item,
            dracntcd: acntcd3,
            dracntnm: acntnm3,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [EDIT_FIELD]: undefined,
          }
        : {
            ...item,
          }
    );
    setMainDataResult6((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [acntcd3, acntnm3]);

  useEffect(() => {
    const newData = mainDataResult6.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState6)[0])
        ? {
            ...item,
            socracntcd: acntcd4,
            socracntnm: acntnm4,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [EDIT_FIELD]: undefined,
          }
        : {
            ...item,
          }
    );
    setMainDataResult6((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [acntcd4, acntnm4]);

  useEffect(() => {
    const newData = mainDataResult6.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState6)[0])
        ? {
            ...item,
            sodracntcd: acntcd5,
            sodracntnm: acntnm5,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [EDIT_FIELD]: undefined,
          }
        : {
            ...item,
          }
    );
    setMainDataResult6((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [acntcd5, acntnm5]);

  useEffect(() => {
    const newData = mainDataResult5.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState5)[0])
        ? {
            ...item,
            acntcd: acntcd6,
            acntnm: acntnm6,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [EDIT_FIELD]: undefined,
          }
        : {
            ...item,
          }
    );
    setMainDataResult5((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [acntcd6, acntnm6]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_AC062",
    //보고서구분
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [reportgbListData, setReportgbListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setReportgbListData(getBizCom(bizComponentData, "L_AC062"));
    }
  }, [bizComponentData]);

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
  const [mainDataState6, setMainDataState6] = useState<State>({
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
  const [mainDataResult6, setMainDataResult6] = useState<DataResult>(
    process([], mainDataState6)
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
    process([], tempState5)
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
  const [selectedState6, setSelectedState6] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const [editIndex2, setEditIndex2] = useState<number | undefined>();
  const [editedField2, setEditedField2] = useState("");
  const [editIndex3, setEditIndex3] = useState<number | undefined>();
  const [editedField3, setEditedField3] = useState("");

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (tabSelected == 0) {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (tabSelected == 1) {
      setFilters2((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (tabSelected == 2) {
      setFilters3((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    if (tabSelected == 0) {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (tabSelected == 1) {
      setFilters2((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (tabSelected == 2) {
      setFilters3((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    mngitemcd: "",
    mngitemnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    acntses: "",
    reportgb: "",
    acntgrpcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    stdrmkcd: "",
    stdrmknm1: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    inoutdiv: "1",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [detailfilters2, setDetailFilter2] = useState({
    pgSize: PAGE_SIZE,
    reportgb: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [detailfilters2_1, setDetailFilter2_1] = useState({
    pgSize: PAGE_SIZE,
    reportgb: "",
    acntgrpcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0020W_tab1_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_mngitemcd": filters.mngitemcd,
        "@p_mngitemnm": filters.mngitemnm,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.mngitemcd == filters.find_row_value
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
            : rows.find((row: any) => row.mngitemcd == filters.find_row_value);

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
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    const parameters2: Iparameters = {
      procedureName: "P_AC_A0020W_tab2_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "REPORTGB",
        "@p_orgdiv": filters2.orgdiv,
        "@p_acntses": filters2.acntses,
        "@p_reportgb": filters2.reportgb,
        "@p_acntgrpcd": filters2.acntgrpcd,
        "@p_find_row_value": filters2.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (filters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.acntgrpcd == filters2.find_row_value
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
            : rows.find((row: any) => row.acntgrpcd == filters2.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState2({ [selectedRow[DATA_ITEM_KEY2]]: true });
          setDetailFilter2((prev) => ({
            ...prev,
            pgNum: 1,
            reportgb: selectedRow.reportgb,
            isSearch: true,
          }));
        } else {
          setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
          setDetailFilter2((prev) => ({
            ...prev,
            pgNum: 1,
            reportgb: rows[0].reportgb,
            isSearch: true,
          }));
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

  const fetchMainGrid3 = async (detailfilters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    const parameters3: Iparameters = {
      procedureName: "P_AC_A0020W_tab2_Q",
      pageNumber: detailfilters2.pgNum,
      pageSize: detailfilters2.pgSize,
      parameters: {
        "@p_work_type": "FIN1",
        "@p_orgdiv": filters2.orgdiv,
        "@p_acntses": filters2.acntses,
        "@p_reportgb": detailfilters2.reportgb,
        "@p_acntgrpcd": "",
        "@p_find_row_value": detailfilters2.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (detailfilters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.acntgrpcd == detailfilters2.find_row_value
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
          detailfilters2.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.acntgrpcd == detailfilters2.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState3({ [selectedRow[DATA_ITEM_KEY3]]: true });
          setDetailFilter2_1((prev) => ({
            ...prev,
            reportgb: selectedRow.reportgb,
            acntgrpcd: selectedRow.acntgrpcd,
            pgNum: 1,
            isSearch: true,
          }));
        } else {
          setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
          setDetailFilter2_1((prev) => ({
            ...prev,
            reportgb: rows[0].reportgb,
            acntgrpcd: rows[0].acntgrpcd,
            pgNum: 1,
            isSearch: true,
          }));
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setDetailFilter2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchMainGrid4 = async (detailfilters2_1: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    const parameters4: Iparameters = {
      procedureName: "P_AC_A0020W_tab2_Q",
      pageNumber: detailfilters2_1.pgNum,
      pageSize: detailfilters2_1.pgSize,
      parameters: {
        "@p_work_type": "FIN2",
        "@p_orgdiv": filters2.orgdiv,
        "@p_acntses": filters2.acntses,
        "@p_reportgb": detailfilters2_1.reportgb,
        "@p_acntgrpcd": detailfilters2_1.acntgrpcd,
        "@p_find_row_value": detailfilters2_1.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters4);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (detailfilters2_1.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef4.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.acntgrpcd == detailfilters2_1.find_row_value
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
          detailfilters2_1.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.acntgrpcd == detailfilters2_1.find_row_value
              );

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
    setDetailFilter2_1((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchMainGrid5 = async (filters3: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    const parameters5: Iparameters = {
      procedureName: "P_AC_A0020W_tab3_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": "STCD",
        "@p_orgdiv": filters3.orgdiv,
        "@p_stdrmkcd": filters3.stdrmkcd,
        "@p_stdrmknm1": filters3.stdrmknm1,
        "@p_find_row_value": filters3.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters5);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));
      if (filters3.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef5.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.stdrmkcd == filters3.find_row_value
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
          filters3.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.stdrmkcd == filters3.find_row_value);

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

  const fetchMainGrid6 = async (filters4: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    const parameters6: Iparameters = {
      procedureName: "P_AC_A0020W_tab4_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": "AUTO",
        "@p_orgdiv": filters4.orgdiv,
        "@p_inoutdiv": filters4.inoutdiv,
        "@p_find_row_value": filters4.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters6);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));
      if (filters4.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef6.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.itemacnt + "-" + row.doexdiv == filters4.find_row_value
          );
          targetRowIndex6 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage6({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef6.current) {
          targetRowIndex6 = 0;
        }
      }
      setMainDataResult6((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters4.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.itemacnt + "-" + row.doexdiv == filters4.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState6({ [selectedRow[DATA_ITEM_KEY6]]: true });
        } else {
          setSelectedState6({ [rows[0][DATA_ITEM_KEY6]]: true });
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      filters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      detailfilters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters2);
      setDetailFilter2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [detailfilters2, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      detailfilters2_1.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters2_1);
      setDetailFilter2_1((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid4(deepCopiedFilters);
    }
  }, [detailfilters2_1, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      filters3.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid5(deepCopiedFilters);
    }
  }, [filters3, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      filters4.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);
      setFilters4((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid6(deepCopiedFilters);
    }
  }, [filters4, permissions, bizComponentData, customOptionData]);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);
  let gridRef5: any = useRef(null);
  let gridRef6: any = useRef(null);

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

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex6 !== null && gridRef6.current) {
      gridRef6.current.scrollIntoView({ rowIndex: targetRowIndex6 });
      targetRowIndex6 = null;
    }
  }, [mainDataResult6]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setPage5(initialPageState);
    setPage6(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
    setMainDataResult5(process([], mainDataState5));
    setMainDataResult6(process([], mainDataState6));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    if (tabSelected == 0) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState(newSelectedState);
    } else if (tabSelected == 1) {
      setPage3(initialPageState);
      setPage4(initialPageState);
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState2,
        dataItemKey: DATA_ITEM_KEY2,
      });

      setSelectedState2(newSelectedState);

      const selectedIdx = event.startRowIndex;
      const selectedRowData = event.dataItems[selectedIdx];

      const report = reportgbListData.find(
        (item: any) => item.code_name == selectedRowData.reportgb
      )?.sub_code;
      setDetailFilter2((prev) => ({
        ...prev,
        reportgb: report == undefined ? "" : report,
        pgNum: 1,
        isSearch: true,
      }));
    } else if (tabSelected == 2) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState5,
        dataItemKey: DATA_ITEM_KEY5,
      });

      setSelectedState5(newSelectedState);
    } else if (tabSelected == 3) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState6,
        dataItemKey: DATA_ITEM_KEY6,
      });

      setSelectedState6(newSelectedState);
    }
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState3(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setPage4(initialPageState);
    setDetailFilter2_1((prev) => ({
      ...prev,
      reportgb: selectedRowData.reportgb,
      acntgrpcd: selectedRowData.acntgrpcd,
      pgNum: 1,
      isSearch: true,
    }));
  };

  const onDetailSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY4,
    });

    setSelectedState4(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  let _export5: any;
  let _export6: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "관리항목";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        const optionsGridFour = _export4.workbookOptions();
        optionsGridTwo.sheets[1] = optionsGridThree.sheets[0];
        optionsGridTwo.sheets[2] = optionsGridFour.sheets[0];
        optionsGridTwo.sheets[0].title = "보고서구분";
        optionsGridTwo.sheets[1].title = "재무제표";
        optionsGridTwo.sheets[2].title = "재무제표상세";
        _export2.save(optionsGridTwo);
      }
    }
    if (_export5 !== null && _export5 !== undefined) {
      if (tabSelected == 2) {
        const optionsGridFive = _export5.workbookOptions();
        optionsGridFive.sheets[0].title = "단축코드";
        _export5.save(optionsGridFive);
      }
    }
    if (_export6 !== null && _export6 !== undefined) {
      if (tabSelected == 3) {
        const optionsGridSix = _export6.workbookOptions();
        optionsGridSix.sheets[0].title = "자동전표기준";
        _export6.save(optionsGridSix);
      }
    }
  };

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
  const onMainDataStateChange6 = (event: GridDataStateChangeEvent) => {
    setMainDataState6(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
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
      <td colSpan={props.colSpan} style={props.style} {...props}>
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
      <td colSpan={props.colSpan} style={props.style} {...props}>
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
      <td colSpan={props.colSpan} style={props.style} {...props}>
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
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult5.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell6 = (props: GridFooterCellProps) => {
    var parts = mainDataResult6.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult6.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
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

  const onMainSortChange6 = (e: any) => {
    setMainDataState6((prev) => ({ ...prev, sort: e.sort }));
  };

  const handleSelectTab = (e: any) => {
    if (isMobile) {
      setIsFilterHideStates(true);
    }

    setTabSelected(e.selected);
    resetAllGrid();

    if (e.selected == 0) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (e.selected == 1) {
      setFilters2((prev: any) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (e.selected == 2) {
      setFilters3((prev: any) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (e.selected == 3) {
      setFilters4((prev: any) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    }
    deletedMainRows = [];
    deletedMainRows2 = [];
  };

  const search = () => {
    resetAllGrid();
    if (tabSelected == 0) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (tabSelected == 1) {
      try {
        if (
          filters2.acntses == "" ||
          filters2.acntses == undefined ||
          filters2.acntses == null
        ) {
          throw findMessage(messagesData, "AC_A0020W_002");
        } else {
          setFilters2((prev: any) => ({
            ...prev,
            find_row_value: "",
            pgNum: 1,
            isSearch: true,
          }));
          if (swiper && isMobile) {
            swiper.slideTo(0);
          }
        }
      } catch (e) {
        alert(e);
      }
    } else if (tabSelected == 2) {
      setFilters3((prev: any) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (tabSelected == 3) {
      setFilters4((prev: any) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    }
    deletedMainRows = [];
    deletedMainRows2 = [];
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
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

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
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

  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
    );
  };

  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
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

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == dataItem[DATA_ITEM_KEY3]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setTempResult2((prev: { total: any }) => {
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
      setTempResult2((prev: { total: any }) => {
        return {
          data: mainDataResult3.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult3.data) {
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
      setTempResult2((prev: { total: any }) => {
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
      setTempResult2((prev: { total: any }) => {
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

  const onMainItemChange3 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult4,
      setMainDataResult4,
      DATA_ITEM_KEY4
    );
  };

  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
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

  const enterEdit3 = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "acntnm") {
      const newData = mainDataResult4.data.map((item) =>
        item[DATA_ITEM_KEY4] == dataItem[DATA_ITEM_KEY4]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setEditIndex(dataItem[DATA_ITEM_KEY4]);
      if (field) {
        setEditedField(field);
      }
      setTempResult3((prev: { total: any }) => {
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
      setTempResult3((prev: { total: any }) => {
        return {
          data: mainDataResult4.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit3 = () => {
    if (tempResult3.data != mainDataResult4.data) {
      if (editedField !== "acntcd") {
        const newData = mainDataResult4.data.map(
          (item: { [x: string]: string; rowstatus: string }) =>
            item[DATA_ITEM_KEY4] ==
            Object.getOwnPropertyNames(selectedState4)[0]
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
        setMainDataResult4((prev: { total: any }) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else {
        mainDataResult4.data.map((item: { [x: string]: any; acntcd: any }) => {
          if (editIndex == item[DATA_ITEM_KEY4]) {
            fetchAcntData(item.acntcd);
          }
        });
      }
    } else {
      const newData = mainDataResult4.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult3((prev: { total: any }) => {
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

  const onMainItemChange4 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult5,
      setMainDataResult5,
      DATA_ITEM_KEY5
    );
  };

  const customCellRender4 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit4}
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

  const enterEdit4 = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "acntnm") {
      const newData = mainDataResult5.data.map((item) =>
        item[DATA_ITEM_KEY5] == dataItem[DATA_ITEM_KEY5]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setEditIndex3(dataItem[DATA_ITEM_KEY5]);
      if (field) {
        setEditedField3(field);
      }
      setTempResult4((prev: { total: any }) => {
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
      setTempResult4((prev: { total: any }) => {
        return {
          data: mainDataResult5.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit4 = () => {
    if (tempResult4.data != mainDataResult5.data) {
      if (editedField3 !== "acntcd") {
        const newData = mainDataResult5.data.map(
          (item: { [x: string]: string; rowstatus: string }) =>
            item[DATA_ITEM_KEY5] ==
            Object.getOwnPropertyNames(selectedState5)[0]
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
        setMainDataResult5((prev: { total: any }) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else {
        mainDataResult5.data.map((item: { [x: string]: any; acntcd: any }) => {
          if (editIndex3 == item[DATA_ITEM_KEY5]) {
            fetchAcntData2(item.acntcd);
          }
        });
      }
    } else {
      const newData = mainDataResult5.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult4((prev: { total: any }) => {
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

  const onMainItemChange5 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult6,
      setMainDataResult6,
      DATA_ITEM_KEY6
    );
  };

  const customCellRender5 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit5}
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

  const enterEdit5 = (dataItem: any, field: string) => {
    if (
      field == "soyn" ||
      field == "dracntcd" ||
      field == "cracntcd" ||
      field == "socracntcd" ||
      field == "sodracntcd" ||
      (field == "itemacnt" && dataItem.rowstatus == "N") ||
      (field == "doexdiv" && dataItem.rowstatus == "N")
    ) {
      const newData = mainDataResult6.data.map((item) =>
        item[DATA_ITEM_KEY6] == dataItem[DATA_ITEM_KEY6]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setEditIndex2(dataItem[DATA_ITEM_KEY6]);
      if (field) {
        setEditedField2(field);
      }

      setTempResult5((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult6((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult5((prev: { total: any }) => {
        return {
          data: mainDataResult6.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit5 = () => {
    if (tempResult5.data != mainDataResult6.data) {
      if (
        editedField2 !== "dracntcd" &&
        editedField2 !== "cracntcd" &&
        editedField2 !== "socracntcd" &&
        editedField2 !== "sodracntcd"
      ) {
        const newData = mainDataResult6.data.map(
          (item: { [x: string]: string; rowstatus: string }) =>
            item[DATA_ITEM_KEY6] ==
            Object.getOwnPropertyNames(selectedState6)[0]
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
        setMainDataResult6((prev: { total: any }) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else if (editedField2 == "cracntcd") {
        mainDataResult6.data.map((item: { [x: string]: any; acntcd: any }) => {
          if (editIndex2 == item[DATA_ITEM_KEY6]) {
            fetchAcntData3(item.cracntcd);
          }
        });
      } else if (editedField2 == "dracntcd") {
        mainDataResult6.data.map((item: { [x: string]: any; acntcd: any }) => {
          if (editIndex2 == item[DATA_ITEM_KEY6]) {
            fetchAcntData4(item.dracntcd);
          }
        });
      } else if (editedField2 == "socracntcd") {
        mainDataResult6.data.map((item: { [x: string]: any; acntcd: any }) => {
          if (editIndex2 == item[DATA_ITEM_KEY6]) {
            fetchAcntData5(item.socracntcd);
          }
        });
      } else if (editedField2 == "sodracntcd") {
        mainDataResult6.data.map((item: { [x: string]: any; acntcd: any }) => {
          if (editIndex2 == item[DATA_ITEM_KEY6]) {
            fetchAcntData6(item.sodracntcd);
          }
        });
      }
    } else {
      const newData = mainDataResult6.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult5((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult6((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      acntdt: undefined,
      controltype: "",
      extra_field1: "",
      extra_field2: "",
      extra_field3: "",
      mngitemcd: "",
      mngitemnm: "",
      orgdiv: sessionOrgdiv,
      remark: "",
      system_yn: "N",
      table_id: "",
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
  };

  const onAddClick2 = () => {
    mainDataResult3.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY3]: ++temp2,
      acntgrpauto: "",
      acntgrpcd: "",
      acntgrpgb: "",
      acntgrpnm: "",
      extra_field1: "",
      extra_field2: "",
      extra_field3: "",
      grpchr: "",
      highestyn: "N",
      p_border: "N",
      p_color: "N",
      p_line: "N",
      p_seq: 0,
      prntacntgrp: "",
      reportgb: "01",
      rowstatus: "N",
    };

    setMainDataResult3((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage3((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setSelectedState3({ [newDataItem[DATA_ITEM_KEY3]]: true });
  };

  const onAddClick3 = () => {
    mainDataResult4.data.map((item) => {
      if (item.num > temp3) {
        temp3 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY4]: ++temp3,
      acntcd: "",
      acntnm: "",
      caculationgb: "P",
      rowstatus: "N",
    };

    setMainDataResult4((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage4((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setSelectedState4({ [newDataItem[DATA_ITEM_KEY4]]: true });
  };

  const onAddClick4 = () => {
    mainDataResult5.data.map((item) => {
      if (item.num > temp4) {
        temp4 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp4,
      acntcd: "",
      acntnm: "",
      stdrmkcd: "",
      stdrmknm1: "",
      stdrmknm2: "",
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
  };

  const onAddClick5 = () => {
    mainDataResult6.data.map((item) => {
      if (item.num > temp5) {
        temp5 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp5,
      cracntcd: "",
      cracntnm: "",
      doexdiv: "",
      dracntcd: "",
      dracntnm: "",
      inoutdiv: filters4.inoutdiv,
      socracntcd: "",
      socracntnm: "",
      sodracntcd: "",
      sodracntnm: "",
      soyn: "N",
      rowstatus: "N",
    };

    setMainDataResult6((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage6((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setSelectedState6({ [newDataItem[DATA_ITEM_KEY6]]: true });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
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
    //newData 생성
    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    let valid = true;
    mainDataResult3.data.forEach((item: any, index: number) => {
      if (!selectedState3[item[DATA_ITEM_KEY3]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (mainDataResult4.total != 0) {
          valid = false;
          throw findMessage(messagesData, "AC_A0020W_001");
        } else {
          if (!item.rowstatus || item.rowstatus != "N") {
            const newData2 = item;
            newData2.rowstatus = "D";
            deletedMainRows.push(newData2);
          }
          Object.push(index);
        }
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult3.data[Math.min(...Object2)];
    } else {
      data = mainDataResult3.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setMainDataResult3((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState3({
      [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
    });
  };

  const onDeleteClick3 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult4.data.forEach((item: any, index: number) => {
      if (!selectedState4[item[DATA_ITEM_KEY4]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows2.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult4.data[Math.min(...Object2)];
    } else {
      data = mainDataResult4.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setMainDataResult4((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState4({
      [data != undefined ? data[DATA_ITEM_KEY4] : newData[0]]: true,
    });
  };

  const onDeleteClick4 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult5.data.forEach((item: any, index: number) => {
      if (!selectedState5[item[DATA_ITEM_KEY5]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult5.data[Math.min(...Object2)];
    } else {
      data = mainDataResult5.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setMainDataResult5((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState5({
      [data != undefined ? data[DATA_ITEM_KEY5] : newData[0]]: true,
    });
  };

  const onDeleteClick5 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult6.data.forEach((item: any, index: number) => {
      if (!selectedState6[item[DATA_ITEM_KEY6]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult6.data[Math.min(...Object2)];
    } else {
      data = mainDataResult6.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setMainDataResult6((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState6({
      [data != undefined ? data[DATA_ITEM_KEY6] : newData[0]]: true,
    });
  };

  const onSaveClick = () => {
    if (!permissions.save) return;
    let valid = true;
    try {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });
      dataItem.map((item) => {
        if (
          item.mngitemcd == undefined ||
          item.mngitemcd == null ||
          item.mngitemcd == ""
        ) {
          valid = false;
        }
      });
      let dataArr: TdataArr = {
        rowstatus_s: [],
        mngitemcd_s: [],
        mngitemnm_s: [],
        system_yn_s: [],
        extra_field1_s: [],
        extra_field2_s: [],
        extra_field3_s: [],
        table_id_s: [],
        remark_s: [],
        controltype_s: [],
      };

      if (valid == true) {
        if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            mngitemcd = "",
            mngitemnm = "",
            system_yn = "",
            extra_field1 = "",
            extra_field2 = "",
            extra_field3 = "",
            table_id = "",
            remark = "",
            controltype = "",
          } = item;

          dataArr.rowstatus_s.push(rowstatus);
          dataArr.mngitemcd_s.push(mngitemcd);
          dataArr.mngitemnm_s.push(mngitemnm);
          dataArr.system_yn_s.push(
            system_yn == true ? "Y" : system_yn == false ? "N" : system_yn
          );
          dataArr.extra_field1_s.push(extra_field1);
          dataArr.extra_field2_s.push(extra_field2);
          dataArr.extra_field3_s.push(extra_field3);
          dataArr.table_id_s.push(table_id);
          dataArr.remark_s.push(remark);
          dataArr.controltype_s.push(controltype);
        });
        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            mngitemcd = "",
            mngitemnm = "",
            system_yn = "",
            extra_field1 = "",
            extra_field2 = "",
            extra_field3 = "",
            table_id = "",
            remark = "",
            controltype = "",
          } = item;
          dataArr.rowstatus_s.push(rowstatus);
          dataArr.mngitemcd_s.push(mngitemcd);
          dataArr.mngitemnm_s.push(mngitemnm);
          dataArr.system_yn_s.push(
            system_yn == true ? "Y" : system_yn == false ? "N" : system_yn
          );
          dataArr.extra_field1_s.push(extra_field1);
          dataArr.extra_field2_s.push(extra_field2);
          dataArr.extra_field3_s.push(extra_field3);
          dataArr.table_id_s.push(table_id);
          dataArr.remark_s.push(remark);
          dataArr.controltype_s.push(controltype);
        });
        setParaData((prev) => ({
          ...prev,
          workType: "MNGITEM",
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          mngitemcd_s: dataArr.mngitemcd_s.join("|"),
          mngitemnm_s: dataArr.mngitemnm_s.join("|"),
          system_yn_s: dataArr.system_yn_s.join("|"),
          extra_field1_s: dataArr.extra_field1_s.join("|"),
          extra_field2_s: dataArr.extra_field2_s.join("|"),
          extra_field3_s: dataArr.extra_field3_s.join("|"),
          table_id_s: dataArr.table_id_s.join("|"),
          remark_s: dataArr.remark_s.join("|"),
          controltype_s: dataArr.controltype_s.join("|"),
        }));
      } else {
        alert("필수항목을 채워주세요.");
      }
    } catch (e) {
      alert(e);
    }
  };

  const onSaveClick2 = () => {
    if (!permissions.save) return;
    let valid = true;
    try {
      const dataItem = mainDataResult3.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      const dataItem2 = mainDataResult4.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length != 0) {
        dataItem.map((item) => {
          if (
            item.acntgrpnm == undefined ||
            item.acntgrpnm == null ||
            item.acntgrpnm == ""
          ) {
            valid = false;
          }
        });
      }

      let dataArr: TdataArr2 = {
        rowstatus_s: [],
        acntgrpcd_s: [],
        prntacntgrp_s: [],
        highestyn_s: [],
        acntgrpgb_s: [],
        acntgrpnm_s: [],
        grpchr_s: [],
        p_line_s: [],
        p_border_s: [],
        p_color_s: [],
        p_seq_s: [],
        extra_field1_s: [],
        extra_field2_s: [],
        extra_field3_s: [],
        rowstatus2_s: [],
        acntcd_s: [],
        acntgrpnm2_s: [],
        caculationgb_s: [],
        acntgrpauto_s: [],
      };

      if (valid == true) {
        if (
          dataItem.length == 0 &&
          dataItem2.length == 0 &&
          deletedMainRows.length == 0 &&
          deletedMainRows2.length == 0
        )
          return false;
        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            acntgrpcd = "",
            prntacntgrp = "",
            highestyn = "",
            acntgrpgb = "",
            acntgrpnm = "",
            grpchr = "",
            p_line = "",
            p_border = "",
            p_color = "",
            p_seq = "",
            extra_field1 = "",
            extra_field2 = "",
            extra_field3 = "",
            acntgrpauto = "",
          } = item;

          dataArr.acntgrpauto_s.push(
            acntgrpauto == undefined ? "" : acntgrpauto
          );
          dataArr.rowstatus_s.push(rowstatus);
          dataArr.acntgrpcd_s.push(acntgrpcd);
          dataArr.prntacntgrp_s.push(prntacntgrp);
          dataArr.highestyn_s.push(
            highestyn == true ? "Y" : highestyn == false ? "N" : highestyn
          );
          dataArr.acntgrpgb_s.push(acntgrpgb);
          dataArr.acntgrpnm_s.push(acntgrpnm);
          dataArr.grpchr_s.push(grpchr);
          dataArr.p_line_s.push(
            p_line == true ? "Y" : p_line == false ? "N" : p_line
          );
          dataArr.p_border_s.push(
            p_border == true ? "Y" : p_border == false ? "N" : p_border
          );
          dataArr.p_color_s.push(
            p_color == true ? "Y" : p_color == false ? "N" : p_color
          );
          dataArr.p_seq_s.push(p_seq);
          dataArr.extra_field1_s.push(extra_field1);
          dataArr.extra_field2_s.push(extra_field2);
          dataArr.extra_field3_s.push(extra_field3);
        });
        dataItem2.forEach((item: any, idx: number) => {
          const {
            acntcd = "",
            acntgrpnm2 = "",
            caculationgb = "",
            rowstatus = "",
          } = item;
          dataArr.rowstatus2_s.push(rowstatus == undefined ? "" : rowstatus);
          dataArr.caculationgb_s.push(caculationgb);
          dataArr.acntcd_s.push(acntcd);
          dataArr.acntgrpnm2_s.push(acntgrpnm2);
        });
        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            acntgrpcd = "",
            prntacntgrp = "",
            highestyn = "",
            acntgrpgb = "",
            acntgrpnm = "",
            grpchr = "",
            p_line = "",
            p_border = "",
            p_color = "",
            p_seq = "",
            extra_field1 = "",
            extra_field2 = "",
            extra_field3 = "",
            acntgrpauto = "",
          } = item;
          dataArr.acntgrpauto_s.push(
            acntgrpauto == undefined ? "" : acntgrpauto
          );
          dataArr.rowstatus_s.push(rowstatus);
          dataArr.acntgrpcd_s.push(acntgrpcd);
          dataArr.prntacntgrp_s.push(prntacntgrp);
          dataArr.highestyn_s.push(
            highestyn == true ? "Y" : highestyn == false ? "N" : highestyn
          );
          dataArr.acntgrpgb_s.push(acntgrpgb);
          dataArr.acntgrpnm_s.push(acntgrpnm);
          dataArr.grpchr_s.push(grpchr);
          dataArr.p_line_s.push(
            p_line == true ? "Y" : p_line == false ? "N" : p_line
          );
          dataArr.p_border_s.push(
            p_border == true ? "Y" : p_border == false ? "N" : p_border
          );
          dataArr.p_color_s.push(
            p_color == true ? "Y" : p_color == false ? "N" : p_color
          );
          dataArr.p_seq_s.push(p_seq);
          dataArr.extra_field1_s.push(extra_field1);
          dataArr.extra_field2_s.push(extra_field2);
          dataArr.extra_field3_s.push(extra_field3);
        });
        deletedMainRows2.forEach((item: any, idx: number) => {
          const {
            acntcd = "",
            acntgrpnm2 = "",
            caculationgb = "",
            rowstatus = "",
          } = item;
          dataArr.rowstatus2_s.push(rowstatus == undefined ? "" : rowstatus);
          dataArr.caculationgb_s.push(caculationgb);
          dataArr.acntcd_s.push(acntcd);
          dataArr.acntgrpnm2_s.push(acntgrpnm2);
        });
        if (dataArr.acntcd_s.length != 0) {
          setParaData2((prev) => ({
            ...prev,
            workType: "FIN1",
            acntses_s: filters2.acntses,
            reportgb_s: detailfilters2.reportgb,
            rowstatus_s: dataArr.rowstatus_s.join("|"),
            acntgrpcd_s: dataArr.acntgrpcd_s.join("|"),
            prntacntgrp_s: dataArr.prntacntgrp_s.join("|"),
            highestyn_s: dataArr.highestyn_s.join("|"),
            acntgrpgb_s: dataArr.acntgrpgb_s.join("|"),
            acntgrpnm_s: dataArr.acntgrpnm_s.join("|"),
            grpchr_s: dataArr.grpchr_s.join("|"),
            p_line_s: dataArr.p_line_s.join("|"),
            p_border_s: dataArr.p_border_s.join("|"),
            p_color_s: dataArr.p_color_s.join("|"),
            p_seq_s: dataArr.p_seq_s.join("|"),
            extra_field1_s: dataArr.extra_field1_s.join("|"),
            extra_field2_s: dataArr.extra_field2_s.join("|"),
            extra_field3_s: dataArr.extra_field3_s.join("|"),
            rowstatus2_s: dataArr.rowstatus2_s.join("|"),
            acntgrpcd: detailfilters2_1.acntgrpcd,
            acntcd_s: dataArr.acntcd_s.join("|"),
            acntgrpnm2_s: dataArr.acntgrpnm2_s.join("|"),
            caculationgb_s: dataArr.caculationgb_s.join("|"),
            acntgrpauto_s: dataArr.acntgrpauto_s.join("|"),
          }));
        } else {
          setParaData2((prev) => ({
            ...prev,
            workType: "FIN1",
            acntses_s: filters2.acntses,
            reportgb_s: detailfilters2.reportgb,
            rowstatus_s: dataArr.rowstatus_s.join("|"),
            acntgrpcd_s: dataArr.acntgrpcd_s.join("|"),
            prntacntgrp_s: dataArr.prntacntgrp_s.join("|"),
            highestyn_s: dataArr.highestyn_s.join("|"),
            acntgrpgb_s: dataArr.acntgrpgb_s.join("|"),
            acntgrpnm_s: dataArr.acntgrpnm_s.join("|"),
            grpchr_s: dataArr.grpchr_s.join("|"),
            p_line_s: dataArr.p_line_s.join("|"),
            p_border_s: dataArr.p_border_s.join("|"),
            p_color_s: dataArr.p_color_s.join("|"),
            p_seq_s: dataArr.p_seq_s.join("|"),
            extra_field1_s: dataArr.extra_field1_s.join("|"),
            extra_field2_s: dataArr.extra_field2_s.join("|"),
            extra_field3_s: dataArr.extra_field3_s.join("|"),
            rowstatus2_s: "",
            acntgrpcd: "",
            acntcd_s: "",
            acntgrpnm2_s: "",
            caculationgb_s: "",
            acntgrpauto_s: dataArr.acntgrpauto_s.join("|"),
          }));
        }
      } else {
        alert("필수항목을 채워주세요.");
      }
    } catch (e) {
      alert(e);
    }
  };

  const onSaveClick3 = () => {
    if (!permissions.save) return;
    let valid = true;
    try {
      const dataItem = mainDataResult5.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });
      dataItem.map((item) => {
        if (
          item.acntcd == undefined ||
          item.acntcd == null ||
          item.acntcd == ""
        ) {
          valid = false;
        } else if (
          item.stdrmkcd == undefined ||
          item.stdrmkcd == null ||
          item.stdrmkcd == ""
        ) {
          valid = false;
        } else if (
          item.stdrmknm1 == undefined ||
          item.stdrmknm1 == null ||
          item.stdrmknm1 == ""
        ) {
          valid = false;
        }
      });

      let dataArr: TdataArr3 = {
        rowstatus_s: [],
        stdrmkcd_s: [],
        stdrmknm1_s: [],
        stdrmknm2_s: [],
        acntcd_s: [],
        acntnm_s: [],
      };

      if (valid == true) {
        if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            stdrmkcd = "",
            stdrmknm1 = "",
            stdrmknm2 = "",
            acntcd = "",
            acntnm = "",
          } = item;

          dataArr.rowstatus_s.push(rowstatus);
          dataArr.stdrmkcd_s.push(stdrmkcd);
          dataArr.stdrmknm1_s.push(stdrmknm1);
          dataArr.stdrmknm2_s.push(stdrmknm2);
          dataArr.acntcd_s.push(acntcd);
          dataArr.acntnm_s.push(acntnm);
        });
        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            stdrmkcd = "",
            stdrmknm1 = "",
            stdrmknm2 = "",
            acntcd = "",
            acntnm = "",
          } = item;

          dataArr.rowstatus_s.push(rowstatus);
          dataArr.stdrmkcd_s.push(stdrmkcd);
          dataArr.stdrmknm1_s.push(stdrmknm1);
          dataArr.stdrmknm2_s.push(stdrmknm2);
          dataArr.acntcd_s.push(acntcd);
          dataArr.acntnm_s.push(acntnm);
        });
        setParaData3((prev) => ({
          ...prev,
          workType: "STCD",
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          stdrmkcd_s: dataArr.stdrmkcd_s.join("|"),
          stdrmknm1_s: dataArr.stdrmknm1_s.join("|"),
          stdrmknm2_s: dataArr.stdrmknm2_s.join("|"),
          acntcd_s: dataArr.acntcd_s.join("|"),
          acntnm_s: dataArr.acntnm_s.join("|"),
        }));
      } else {
        alert("필수항목을 채워주세요.");
      }
    } catch (e) {
      alert(e);
    }
  };

  const onSaveClick4 = () => {
    if (!permissions.save) return;
    try {
      const dataItem = mainDataResult6.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      let dataArr: TdataArr4 = {
        rowstatus_s: [],
        itemacnt_s: [],
        doexdiv_s: [],
        inoutdiv_s: [],
        soyn_s: [],
        dracntcd_s: [],
        cracntcd_s: [],
        sodracntcd_s: [],
        socracntcd_s: [],
      };

      if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          itemacnt = "",
          doexdiv = "",
          inoutdiv = "",
          soyn = "",
          dracntcd = "",
          cracntcd = "",
          sodracntcd = "",
          socracntcd = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.itemacnt_s.push(itemacnt);
        dataArr.doexdiv_s.push(doexdiv);
        dataArr.inoutdiv_s.push(inoutdiv);
        dataArr.soyn_s.push(soyn == true ? "Y" : soyn == false ? "N" : soyn);
        dataArr.dracntcd_s.push(dracntcd);
        dataArr.cracntcd_s.push(cracntcd);
        dataArr.sodracntcd_s.push(sodracntcd);
        dataArr.socracntcd_s.push(socracntcd);
      });
      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          itemacnt = "",
          doexdiv = "",
          inoutdiv = "",
          soyn = "",
          dracntcd = "",
          cracntcd = "",
          sodracntcd = "",
          socracntcd = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.itemacnt_s.push(itemacnt);
        dataArr.doexdiv_s.push(doexdiv);
        dataArr.inoutdiv_s.push(inoutdiv);
        dataArr.soyn_s.push(soyn == true ? "Y" : soyn == false ? "N" : soyn);
        dataArr.dracntcd_s.push(dracntcd);
        dataArr.cracntcd_s.push(cracntcd);
        dataArr.sodracntcd_s.push(sodracntcd);
        dataArr.socracntcd_s.push(socracntcd);
      });
      setParaData4((prev) => ({
        ...prev,
        workType: "AUTO",
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        itemacnt_s: dataArr.itemacnt_s.join("|"),
        doexdiv_s: dataArr.doexdiv_s.join("|"),
        inoutdiv_s: dataArr.inoutdiv_s.join("|"),
        soyn_s: dataArr.soyn_s.join("|"),
        dracntcd_s: dataArr.dracntcd_s.join("|"),
        cracntcd_s: dataArr.cracntcd_s.join("|"),
        sodracntcd_s: dataArr.sodracntcd_s.join("|"),
        socracntcd_s: dataArr.socracntcd_s.join("|"),
      }));
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "MNGITEM",
    orgdiv: sessionOrgdiv,
    rowstatus_s: "",
    mngitemcd_s: "",
    mngitemnm_s: "",
    system_yn_s: "",
    extra_field1_s: "",
    extra_field2_s: "",
    extra_field3_s: "",
    table_id_s: "",
    remark_s: "",
    controltype_s: "",
  });

  const [ParaData2, setParaData2] = useState({
    pgSize: PAGE_SIZE,
    workType: "FIN1",
    orgdiv: sessionOrgdiv,
    rowstatus_s: "",
    acntses_s: "",
    reportgb_s: "",
    acntgrpcd_s: "",
    prntacntgrp_s: "",
    highestyn_s: "",
    acntgrpgb_s: "",
    acntgrpnm_s: "",
    grpchr_s: "",
    p_line_s: "",
    p_border_s: "",
    p_color_s: "",
    p_seq_s: "",
    extra_field1_s: "",
    extra_field2_s: "",
    extra_field3_s: "",
    rowstatus2_s: "",
    acntgrpcd: "",
    acntcd_s: "",
    acntgrpnm2_s: "",
    caculationgb_s: "",
    acntgrpauto_s: "",
  });

  const [ParaData3, setParaData3] = useState({
    pgSize: PAGE_SIZE,
    workType: "STCD",
    orgdiv: sessionOrgdiv,
    rowstatus_s: "",
    stdrmkcd_s: "",
    stdrmknm1_s: "",
    stdrmknm2_s: "",
    acntcd_s: "",
    acntnm_s: "",
  });

  const [ParaData4, setParaData4] = useState({
    pgSize: PAGE_SIZE,
    workType: "AUTO",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    position: "",
    rowstatus_s: "",
    itemacnt_s: "",
    doexdiv_s: "",
    inoutdiv_s: "",
    soyn_s: "",
    dracntcd_s: "",
    cracntcd_s: "",
    sodracntcd_s: "",
    socracntcd_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_AC_A0020W_tab1_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_mngitemcd_s": ParaData.mngitemcd_s,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_mngitemnm_s": ParaData.mngitemnm_s,
      "@p_system_yn_s": ParaData.system_yn_s,
      "@p_extra_field1_s": ParaData.extra_field1_s,
      "@p_extra_field2_s": ParaData.extra_field2_s,
      "@p_extra_field3_s": ParaData.extra_field3_s,
      "@p_table_id_s": ParaData.table_id_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_controltype_s": ParaData.controltype_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A0020W",
    },
  };

  const para2: Iparameters = {
    procedureName: "P_AC_A0020W_tab2_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData2.workType,
      "@p_orgdiv": ParaData2.orgdiv,
      "@p_rowstatus_s": ParaData2.rowstatus_s,
      "@p_acntses_s": ParaData2.acntses_s,
      "@p_reportgb_s": ParaData2.reportgb_s,
      "@p_acntgrpcd_s": ParaData2.acntgrpcd_s,
      "@p_prntacntgrp_s": ParaData2.prntacntgrp_s,
      "@p_highestyn_s": ParaData2.highestyn_s,
      "@p_acntgrpgb_s": ParaData2.acntgrpgb_s,
      "@p_acntgrpnm_s": ParaData2.acntgrpnm_s,
      "@p_grpchr_s": ParaData2.grpchr_s,
      "@p_p_line_s": ParaData2.p_line_s,
      "@p_p_border_s": ParaData2.p_border_s,
      "@p_p_color_s": ParaData2.p_color_s,
      "@p_p_seq_s": ParaData2.p_seq_s,
      "@p_extra_field11_s": ParaData2.extra_field1_s,
      "@p_extra_field21_s": ParaData2.extra_field2_s,
      "@p_extra_field31_s": ParaData2.extra_field3_s,
      "@p_rowstatus2_s": ParaData2.rowstatus2_s,
      "@p_acntgrpcd": ParaData2.acntgrpcd,
      "@p_acntcd_s": ParaData2.acntcd_s,
      "@p_acntgrpnm2_s": ParaData2.acntgrpnm2_s,
      "@p_caculationgb_s": ParaData2.caculationgb_s,
      "@p_acntgrpauto_s": ParaData2.acntgrpauto_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A0020W",
    },
  };

  const para3: Iparameters = {
    procedureName: "P_AC_A0020W_tab3_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData3.workType,
      "@p_orgdiv": ParaData3.orgdiv,
      "@p_rowstatus_s": ParaData3.rowstatus_s,
      "@p_stdrmkcd_s": ParaData3.stdrmkcd_s,
      "@p_stdrmknm1_s": ParaData3.stdrmknm1_s,
      "@p_stdrmknm2_s": ParaData3.stdrmknm2_s,
      "@p_acntcd_s": ParaData3.acntcd_s,
      "@p_acntnm_s": ParaData3.acntnm_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A0020W",
    },
  };

  const para4: Iparameters = {
    procedureName: "P_AC_A0020W_tab4_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData4.workType,
      "@p_orgdiv": ParaData4.orgdiv,
      "@p_location": ParaData4.location,
      "@p_position": ParaData4.position,
      "@p_rowstatus_s": ParaData4.rowstatus_s,
      "@p_itemacnt_s": ParaData4.itemacnt_s,
      "@p_doexdiv_s": ParaData4.doexdiv_s,
      "@p_inoutdiv_s": ParaData4.inoutdiv_s,
      "@p_soyn_s": ParaData4.soyn_s,
      "@p_dracntcd_s": ParaData4.dracntcd_s,
      "@p_cracntcd_s": ParaData4.cracntcd_s,
      "@p_sodracntcd_s": ParaData4.sodracntcd_s,
      "@p_socracntcd_s": ParaData4.socracntcd_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A0020W",
    },
  };

  useEffect(() => {
    if (ParaData.rowstatus_s != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  useEffect(() => {
    if (
      (ParaData2.rowstatus_s != "" ||
        ParaData2.acntcd_s != "" ||
        ParaData2.workType == "COPY") &&
      permissions.save
    ) {
      fetchTodoGridSaved2();
    }
  }, [ParaData2, permissions]);

  useEffect(() => {
    if (ParaData3.rowstatus_s != "" && permissions.save) {
      fetchTodoGridSaved3();
    }
  }, [ParaData3, permissions]);

  useEffect(() => {
    if (ParaData4.rowstatus_s != "" && permissions.save) {
      fetchTodoGridSaved4();
    }
  }, [ParaData4, permissions]);

  const fetchTodoGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted =
        mainDataResult.data.length == 0 && filters.pgNum > 0;
      if (isLastDataDeleted) {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: "",
          pgNum: isLastDataDeleted
            ? prev.pgNum != 1
              ? prev.pgNum - 1
              : prev.pgNum
            : prev.pgNum,
          isSearch: true,
        }));
      } else {
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: prev.pgNum,
          isSearch: true,
        }));
      }
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "MNGITEM",
        orgdiv: sessionOrgdiv,
        rowstatus_s: "",
        mngitemcd_s: "",
        mngitemnm_s: "",
        system_yn_s: "",
        extra_field1_s: "",
        extra_field2_s: "",
        extra_field3_s: "",
        table_id_s: "",
        remark_s: "",
        controltype_s: "",
      });
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved2 = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (ParaData2.acntcd_s.length == 0) {
        const isLastDataDeleted =
          mainDataResult3.data.length == 0 && detailfilters2.pgNum > 0;
        if (isLastDataDeleted) {
          setPage3({
            skip:
              detailfilters2.pgNum == 1 || detailfilters2.pgNum == 0
                ? 0
                : PAGE_SIZE * (detailfilters2.pgNum - 2),
            take: PAGE_SIZE,
          });
          setDetailFilter2((prev: any) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted
              ? prev.pgNum != 1
                ? prev.pgNum - 1
                : prev.pgNum
              : prev.pgNum,
            isSearch: true,
          }));
        } else {
          setDetailFilter2((prev: any) => ({
            ...prev,
            find_row_value: data.returnString,
            pgNum: prev.pgNum,
            isSearch: true,
          }));
        }
      } else {
        const isLastDataDeleted =
          mainDataResult4.data.length == 0 && detailfilters2_1.pgNum > 0;
        setPage4(initialPageState);
        setMainDataResult4(process([], mainDataState4));
        if (isLastDataDeleted) {
          setPage4({
            skip:
              detailfilters2_1.pgNum == 1 || detailfilters2_1.pgNum == 0
                ? 0
                : PAGE_SIZE * (detailfilters2_1.pgNum - 2),
            take: PAGE_SIZE,
          });
          setDetailFilter2_1((prev: any) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted
              ? prev.pgNum != 1
                ? prev.pgNum - 1
                : prev.pgNum
              : prev.pgNum,
            isSearch: true,
          }));
        } else {
          setDetailFilter2_1((prev: any) => ({
            ...prev,
            find_row_value: data.returnString,
            pgNum: prev.pgNum,
            isSearch: true,
          }));
        }
      }

      setParaData2({
        pgSize: PAGE_SIZE,
        workType: "FIN1",
        orgdiv: sessionOrgdiv,
        rowstatus_s: "",
        acntses_s: "",
        reportgb_s: "",
        acntgrpcd_s: "",
        prntacntgrp_s: "",
        highestyn_s: "",
        acntgrpgb_s: "",
        acntgrpnm_s: "",
        grpchr_s: "",
        p_line_s: "",
        p_border_s: "",
        p_color_s: "",
        p_seq_s: "",
        extra_field1_s: "",
        extra_field2_s: "",
        extra_field3_s: "",
        rowstatus2_s: "",
        acntgrpcd: "",
        acntcd_s: "",
        acntgrpnm2_s: "",
        caculationgb_s: "",
        acntgrpauto_s: "",
      });
      deletedMainRows = [];
      deletedMainRows2 = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved3 = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted =
        mainDataResult5.data.length == 0 && filters3.pgNum > 0;
      if (isLastDataDeleted) {
        setPage5({
          skip:
            filters3.pgNum == 1 || filters3.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters3.pgNum - 2),
          take: PAGE_SIZE,
        });
        setFilters3((prev: any) => ({
          ...prev,
          find_row_value: "",
          pgNum: isLastDataDeleted
            ? prev.pgNum != 1
              ? prev.pgNum - 1
              : prev.pgNum
            : prev.pgNum,
          isSearch: true,
        }));
      } else {
        setFilters3((prev: any) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: prev.pgNum,
          isSearch: true,
        }));
      }
      setParaData3({
        pgSize: PAGE_SIZE,
        workType: "STCD",
        orgdiv: sessionOrgdiv,
        rowstatus_s: "",
        stdrmkcd_s: "",
        stdrmknm1_s: "",
        stdrmknm2_s: "",
        acntcd_s: "",
        acntnm_s: "",
      });
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved4 = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para4);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted =
        mainDataResult6.data.length == 0 && filters4.pgNum > 0;
      if (isLastDataDeleted) {
        setPage6({
          skip:
            filters4.pgNum == 1 || filters4.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters4.pgNum - 2),
          take: PAGE_SIZE,
        });
        setFilters4((prev: any) => ({
          ...prev,
          find_row_value: "",
          pgNum: isLastDataDeleted
            ? prev.pgNum != 1
              ? prev.pgNum - 1
              : prev.pgNum
            : prev.pgNum,
          isSearch: true,
        }));
      } else {
        setFilters4((prev: any) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: prev.pgNum,
          isSearch: true,
        }));
      }
      setParaData4({
        pgSize: PAGE_SIZE,
        workType: "AUTO",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        position: "",
        rowstatus_s: "",
        itemacnt_s: "",
        doexdiv_s: "",
        inoutdiv_s: "",
        soyn_s: "",
        dracntcd_s: "",
        cracntcd_s: "",
        sodracntcd_s: "",
        socracntcd_s: "",
      });
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const onCopyClick = () => {
    if (!permissions.save) return;
    if (!window.confirm("전월복사를 하시겠습니까?")) {
      return false;
    }
    setParaData2((prev) => ({
      pgSize: PAGE_SIZE,
      workType: "COPY",
      orgdiv: sessionOrgdiv,
      rowstatus_s: "",
      acntses_s: filters2.acntses,
      reportgb_s: "",
      acntgrpcd_s: "",
      prntacntgrp_s: "",
      highestyn_s: "",
      acntgrpgb_s: "",
      acntgrpnm_s: "",
      grpchr_s: "",
      p_line_s: "",
      p_border_s: "",
      p_color_s: "",
      p_seq_s: "",
      extra_field1_s: "",
      extra_field2_s: "",
      extra_field3_s: "",
      rowstatus2_s: "",
      acntgrpcd: "",
      acntcd_s: "",
      acntgrpnm2_s: "",
      caculationgb_s: "",
      acntgrpauto_s: "",
    }));
  };

  const createColumn = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"cracntcd"}
        title={"계정과목"}
        cell={ColumnCommandCell2}
        width="150px"
      />
    );
    array.push(
      <GridColumn field={"cracntnm"} title={"계정명"} width="150px" />
    );
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"dracntcd"}
        title={"계정과목"}
        cell={ColumnCommandCell3}
        width="150px"
      />
    );
    array.push(
      <GridColumn field={"dracntnm"} title={"계정명"} width="150px" />
    );
    return array;
  };

  const createColumn3 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"socracntcd"}
        title={"계정과목"}
        cell={ColumnCommandCell4}
        width="150px"
      />
    );
    array.push(
      <GridColumn field={"socracntnm"} title={"계정명"} width="150px" />
    );
    return array;
  };

  const createColumn4 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"sodracntcd"}
        title={"계정과목"}
        cell={ColumnCommandCell5}
        width="150px"
      />
    );
    array.push(
      <GridColumn field={"sodracntnm"} title={"계정명"} width="150px" />
    );
    return array;
  };

  const fetchAcntData = React.useCallback(
    async (acntcd: string) => {
      if (!permissions.view) return;
      let data: any;
      const queryStr = getAcntQuery(acntcd);
      const bytes = require("utf8-bytes");
      const convertedQueryStr = bytesToBase64(bytes(queryStr));

      let query = {
        query: convertedQueryStr,
      };

      try {
        data = await processApi<any>("query", query);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess == true) {
        const rows = data.tables[0].Rows;
        const rowCount = data.tables[0].RowCount;

        if (rowCount > 0) {
          const { acntcd, acntnm } = rows[0];
          setAcntcd(acntcd);
          setAcntnm(acntnm);
        } else {
          const newData = mainDataResult4.data.map((item: any) =>
            item[DATA_ITEM_KEY4] ==
            Object.getOwnPropertyNames(selectedState4)[0]
              ? {
                  ...item,
                  acntcd: item.acntcd,
                  acntnm: "",
                  rowstatus: item.rowstatus == "N" ? "N" : "U",
                  [EDIT_FIELD]: undefined,
                }
              : {
                  ...item,
                  [EDIT_FIELD]: undefined,
                }
          );
          setMainDataResult4((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [mainDataResult4]
  );
  const fetchAcntData2 = React.useCallback(
    async (acntcd: string) => {
      if (!permissions.view) return;
      let data: any;
      const queryStr = getAcntQuery(acntcd);
      const bytes = require("utf8-bytes");
      const convertedQueryStr = bytesToBase64(bytes(queryStr));

      let query = {
        query: convertedQueryStr,
      };

      try {
        data = await processApi<any>("query", query);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess == true) {
        const rows = data.tables[0].Rows;
        const rowCount = data.tables[0].RowCount;

        if (rowCount > 0) {
          const { acntcd, acntnm } = rows[0];
          setAcntcd6(acntcd);
          setAcntnm6(acntnm);
        } else {
          const newData = mainDataResult5.data.map((item: any) =>
            item[DATA_ITEM_KEY5] ==
            Object.getOwnPropertyNames(selectedState5)[0]
              ? {
                  ...item,
                  acntcd: item.acntcd,
                  acntnm: "",
                  rowstatus: item.rowstatus == "N" ? "N" : "U",
                  [EDIT_FIELD]: undefined,
                }
              : {
                  ...item,
                  [EDIT_FIELD]: undefined,
                }
          );
          setMainDataResult5((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [mainDataResult5]
  );

  const fetchAcntData3 = React.useCallback(
    async (acntcd: string) => {
      if (!permissions.view) return;
      let data: any;
      const queryStr = getAcntQuery(acntcd);
      const bytes = require("utf8-bytes");
      const convertedQueryStr = bytesToBase64(bytes(queryStr));

      let query = {
        query: convertedQueryStr,
      };

      try {
        data = await processApi<any>("query", query);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess == true) {
        const rows = data.tables[0].Rows;
        const rowCount = data.tables[0].RowCount;

        if (rowCount > 0) {
          const { acntcd, acntnm } = rows[0];
          setAcntcd2(acntcd);
          setAcntnm2(acntnm);
        } else {
          const newData = mainDataResult6.data.map((item: any) =>
            item[DATA_ITEM_KEY6] ==
            Object.getOwnPropertyNames(selectedState6)[0]
              ? {
                  ...item,
                  cracntcd: item.acntcd,
                  cracntnm: "",
                  rowstatus: item.rowstatus == "N" ? "N" : "U",
                  [EDIT_FIELD]: undefined,
                }
              : {
                  ...item,
                  [EDIT_FIELD]: undefined,
                }
          );
          setMainDataResult6((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [mainDataResult6]
  );

  const fetchAcntData4 = React.useCallback(
    async (acntcd: string) => {
      if (!permissions.view) return;
      let data: any;
      const queryStr = getAcntQuery(acntcd);
      const bytes = require("utf8-bytes");
      const convertedQueryStr = bytesToBase64(bytes(queryStr));

      let query = {
        query: convertedQueryStr,
      };

      try {
        data = await processApi<any>("query", query);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess == true) {
        const rows = data.tables[0].Rows;
        const rowCount = data.tables[0].RowCount;

        if (rowCount > 0) {
          const { acntcd, acntnm } = rows[0];
          setAcntcd3(acntcd);
          setAcntnm3(acntnm);
        } else {
          const newData = mainDataResult6.data.map((item: any) =>
            item[DATA_ITEM_KEY6] ==
            Object.getOwnPropertyNames(selectedState6)[0]
              ? {
                  ...item,
                  dracntcd: item.acntcd,
                  dracntnm: "",
                  rowstatus: item.rowstatus == "N" ? "N" : "U",
                  [EDIT_FIELD]: undefined,
                }
              : {
                  ...item,
                  [EDIT_FIELD]: undefined,
                }
          );
          setMainDataResult6((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [mainDataResult6]
  );

  const fetchAcntData5 = React.useCallback(
    async (acntcd: string) => {
      if (!permissions.view) return;
      let data: any;
      const queryStr = getAcntQuery(acntcd);
      const bytes = require("utf8-bytes");
      const convertedQueryStr = bytesToBase64(bytes(queryStr));

      let query = {
        query: convertedQueryStr,
      };

      try {
        data = await processApi<any>("query", query);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess == true) {
        const rows = data.tables[0].Rows;
        const rowCount = data.tables[0].RowCount;

        if (rowCount > 0) {
          const { acntcd, acntnm } = rows[0];
          setAcntcd4(acntcd);
          setAcntnm4(acntnm);
        } else {
          const newData = mainDataResult6.data.map((item: any) =>
            item[DATA_ITEM_KEY6] ==
            Object.getOwnPropertyNames(selectedState6)[0]
              ? {
                  ...item,
                  socracntcd: item.acntcd,
                  socracntnm: "",
                  rowstatus: item.rowstatus == "N" ? "N" : "U",
                  [EDIT_FIELD]: undefined,
                }
              : {
                  ...item,
                  [EDIT_FIELD]: undefined,
                }
          );
          setMainDataResult6((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [mainDataResult6]
  );

  const fetchAcntData6 = React.useCallback(
    async (acntcd: string) => {
      if (!permissions.view) return;
      let data: any;
      const queryStr = getAcntQuery(acntcd);
      const bytes = require("utf8-bytes");
      const convertedQueryStr = bytesToBase64(bytes(queryStr));

      let query = {
        query: convertedQueryStr,
      };

      try {
        data = await processApi<any>("query", query);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess == true) {
        const rows = data.tables[0].Rows;
        const rowCount = data.tables[0].RowCount;

        if (rowCount > 0) {
          const { acntcd, acntnm } = rows[0];
          setAcntcd5(acntcd);
          setAcntnm5(acntnm);
        } else {
          const newData = mainDataResult6.data.map((item: any) =>
            item[DATA_ITEM_KEY6] ==
            Object.getOwnPropertyNames(selectedState6)[0]
              ? {
                  ...item,
                  sodracntcd: item.acntcd,
                  sodracntnm: "",
                  rowstatus: item.rowstatus == "N" ? "N" : "U",
                  [EDIT_FIELD]: undefined,
                }
              : {
                  ...item,
                  [EDIT_FIELD]: undefined,
                }
          );
          setMainDataResult6((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [mainDataResult6]
  );

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab
          title="관리항목"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>관리항목코드</th>
                  <td>
                    <Input
                      name="mngitemcd"
                      type="text"
                      value={filters.mngitemcd}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>관리항목명</th>
                  <td>
                    <Input
                      name="mngitemnm"
                      type="text"
                      value={filters.mngitemnm}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer style={{ width: "100%", overflow: "auto" }}>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle></GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick}
                  themeColor={"primary"}
                  icon="plus"
                  title="행 추가"
                  disabled={permissions.save ? false : true}
                ></Button>
                <Button
                  onClick={onDeleteClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="minus"
                  title="행 삭제"
                  disabled={permissions.save ? false : true}
                ></Button>
                <Button
                  onClick={onSaveClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  title="저장"
                  disabled={permissions.save ? false : true}
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName={getMenuName()}
            >
              <Grid
                style={{
                  height: isMobile ? mobileheight : webheight,
                }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState[idGetter(row)],
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
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"]
                    ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                    ?.map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              customField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : checkField.includes(item.fieldName)
                                ? CheckBoxCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
                                ? mainTotalFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab
          title="재무제표"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>회기</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="acntses"
                        value={filters2.acntses}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        className="required"
                      />
                    )}
                  </td>
                  <td></td>
                  <td>
                    <Button
                      themeColor={"primary"}
                      fillMode="outline"
                      onClick={onCopyClick}
                      icon="copy"
                    >
                      전월복사
                    </Button>
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          {isMobile ? (
            <>
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <SwiperSlide key={0}>
                  <GridContainer style={{ width: "100%", overflow: "auto" }}>
                    <ExcelExport
                      data={mainDataResult2.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: mobileheight2 }}
                        data={process(
                          mainDataResult2.data.map((row) => ({
                            ...row,
                            reportgb: reportgbListData.find(
                              (item: any) => item.sub_code == row.reportgb
                            )?.code_name,
                            [SELECTED_FIELD]: selectedState2[idGetter2(row)],
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
                        onSelectionChange={onSelectionChange}
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
                      >
                        <GridColumn
                          field="reportgb"
                          title="보고서구분"
                          footerCell={mainTotalFooterCell2}
                        />
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </SwiperSlide>
                <SwiperSlide
                  key={1}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <GridContainer
                    style={{
                      width: "100%",
                      overflow: "auto",
                    }}
                  >
                    <GridTitleContainer className="ButtonContainer3">
                      <GridTitle></GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick2}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onDeleteClick2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onSaveClick2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          title="저장"
                          disabled={permissions.save ? false : true}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult3.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: mobileheight3 }}
                        data={process(
                          mainDataResult3.data.map((row) => ({
                            ...row,
                            [SELECTED_FIELD]: selectedState3[idGetter3(row)],
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
                        onSelectionChange={onDetailSelectionChange}
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
                        onItemChange={onMainItemChange2}
                        cellRender={customCellRender2}
                        rowRender={customRowRender2}
                        editField={EDIT_FIELD}
                      >
                        <GridColumn field="rowstatus" title=" " width="50px" />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList2"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <GridColumn
                                    key={idx}
                                    id={item.id}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    cell={
                                      customField.includes(item.fieldName)
                                        ? CustomComboBoxCell
                                        : checkField.includes(item.fieldName)
                                        ? CheckBoxCell
                                        : numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : undefined
                                    }
                                    headerCell={
                                      requiredField.includes(item.fieldName)
                                        ? RequiredHeader
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell3
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </SwiperSlide>
                <SwiperSlide
                  key={2}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <GridContainer
                    style={{
                      width: "100%",
                      overflow: "auto",
                    }}
                  >
                    <FormContext.Provider
                      value={{
                        acntcd,
                        acntnm,
                        setAcntcd,
                        setAcntnm,
                        mainDataState,
                        setMainDataState,
                        // fetchGrid,
                      }}
                    >
                      <GridTitleContainer className="ButtonContainer4">
                        <GridTitle></GridTitle>
                        <ButtonContainer>
                          <Button
                            onClick={onAddClick3}
                            themeColor={"primary"}
                            icon="plus"
                            title="행 추가"
                            disabled={permissions.save ? false : true}
                          ></Button>
                          <Button
                            onClick={onDeleteClick3}
                            fillMode="outline"
                            themeColor={"primary"}
                            icon="minus"
                            title="행 삭제"
                            disabled={permissions.save ? false : true}
                          ></Button>
                          <Button
                            onClick={onSaveClick2}
                            fillMode="outline"
                            themeColor={"primary"}
                            icon="save"
                            title="저장"
                            disabled={permissions.save ? false : true}
                          ></Button>
                        </ButtonContainer>
                      </GridTitleContainer>
                      <ExcelExport
                        data={mainDataResult4.data}
                        ref={(exporter) => {
                          _export4 = exporter;
                        }}
                        fileName={getMenuName()}
                      >
                        <Grid
                          style={{ height: mobileheight4 }}
                          data={process(
                            mainDataResult4.data.map((row) => ({
                              ...row,
                              [SELECTED_FIELD]: selectedState4[idGetter4(row)],
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
                          onSelectionChange={onDetailSelectionChange2}
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
                          onItemChange={onMainItemChange3}
                          cellRender={customCellRender3}
                          rowRender={customRowRender3}
                          editField={EDIT_FIELD}
                        >
                          <GridColumn
                            field="rowstatus"
                            title=" "
                            width="50px"
                          />
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions["grdList3"]
                              ?.sort(
                                (a: any, b: any) => a.sortOrder - b.sortOrder
                              )
                              ?.map(
                                (item: any, idx: number) =>
                                  item.sortOrder !== -1 && (
                                    <GridColumn
                                      key={idx}
                                      id={item.id}
                                      field={item.fieldName}
                                      title={item.caption}
                                      width={item.width}
                                      cell={
                                        customField.includes(item.fieldName)
                                          ? ColumnCommandCell
                                          : radioField.includes(item.fieldName)
                                          ? CustomRadioCell
                                          : undefined
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? mainTotalFooterCell4
                                          : undefined
                                      }
                                    />
                                  )
                              )}
                        </Grid>
                      </ExcelExport>
                    </FormContext.Provider>
                  </GridContainer>
                </SwiperSlide>
              </Swiper>
            </>
          ) : (
            <>
              <GridContainerWrap style={{ width: "100%" }}>
                <GridContainer width={`10%`}>
                  <ExcelExport
                    data={mainDataResult2.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: webheight2 }}
                      data={process(
                        mainDataResult2.data.map((row) => ({
                          ...row,
                          reportgb: reportgbListData.find(
                            (item: any) => item.sub_code == row.reportgb
                          )?.code_name,
                          [SELECTED_FIELD]: selectedState2[idGetter2(row)],
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
                      onSelectionChange={onSelectionChange}
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
                    >
                      <GridColumn
                        field="reportgb"
                        title="보고서구분"
                        footerCell={mainTotalFooterCell2}
                      />
                    </Grid>
                  </ExcelExport>
                </GridContainer>
                <GridContainer width={`calc(65% - ${GAP}px)`}>
                  <GridTitleContainer className="ButtonContainer3">
                    <GridTitle></GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick2}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        onClick={onDeleteClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        onClick={onSaveClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="save"
                        title="저장"
                        disabled={permissions.save ? false : true}
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult3.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: webheight3 }}
                      data={process(
                        mainDataResult3.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState3[idGetter3(row)],
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
                      onSelectionChange={onDetailSelectionChange}
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
                      onItemChange={onMainItemChange2}
                      cellRender={customCellRender2}
                      rowRender={customRowRender2}
                      editField={EDIT_FIELD}
                    >
                      <GridColumn field="rowstatus" title=" " width="50px" />
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList2"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={idx}
                                  id={item.id}
                                  field={item.fieldName}
                                  title={item.caption}
                                  width={item.width}
                                  cell={
                                    customField.includes(item.fieldName)
                                      ? CustomComboBoxCell
                                      : checkField.includes(item.fieldName)
                                      ? CheckBoxCell
                                      : numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : undefined
                                  }
                                  headerCell={
                                    requiredField.includes(item.fieldName)
                                      ? RequiredHeader
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell3
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
                <GridContainer width={`calc(25% - ${GAP}px)`}>
                  <FormContext.Provider
                    value={{
                      acntcd,
                      acntnm,
                      setAcntcd,
                      setAcntnm,
                      mainDataState,
                      setMainDataState,
                      // fetchGrid,
                    }}
                  >
                    <GridTitleContainer className="ButtonContainer4">
                      <GridTitle></GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick3}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onDeleteClick3}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onSaveClick2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          title="저장"
                          disabled={permissions.save ? false : true}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult4.data}
                      ref={(exporter) => {
                        _export4 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: webheight4 }}
                        data={process(
                          mainDataResult4.data.map((row) => ({
                            ...row,
                            [SELECTED_FIELD]: selectedState4[idGetter4(row)],
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
                        onSelectionChange={onDetailSelectionChange2}
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
                        onItemChange={onMainItemChange3}
                        cellRender={customCellRender3}
                        rowRender={customRowRender3}
                        editField={EDIT_FIELD}
                      >
                        <GridColumn field="rowstatus" title=" " width="50px" />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList3"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <GridColumn
                                    key={idx}
                                    id={item.id}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    cell={
                                      customField.includes(item.fieldName)
                                        ? ColumnCommandCell
                                        : radioField.includes(item.fieldName)
                                        ? CustomRadioCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell4
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </FormContext.Provider>
                </GridContainer>
              </GridContainerWrap>
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="단축코드"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>단축계정코드</th>
                  <td>
                    <Input
                      name="stdrmkcd"
                      type="text"
                      value={filters3.stdrmkcd}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>단축계정명</th>
                  <td>
                    <Input
                      name="stdrmknm1"
                      type="text"
                      value={filters3.stdrmknm1}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <FormContext6.Provider
            value={{
              acntcd6,
              acntnm6,
              setAcntcd6,
              setAcntnm6,
              mainDataState5,
              setMainDataState5,
              // fetchGrid,
            }}
          >
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer5">
                <GridTitle></GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick4}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                    disabled={permissions.save ? false : true}
                  ></Button>
                  <Button
                    onClick={onDeleteClick4}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                    disabled={permissions.save ? false : true}
                  ></Button>
                  <Button
                    onClick={onSaveClick3}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                    disabled={permissions.save ? false : true}
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult5.data}
                ref={(exporter) => {
                  _export5 = exporter;
                }}
                fileName={getMenuName()}
              >
                <Grid
                  style={{
                    height: isMobile ? mobileheight5 : webheight5,
                  }}
                  data={process(
                    mainDataResult5.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState5[idGetter5(row)],
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
                  onSelectionChange={onSelectionChange}
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
                  onItemChange={onMainItemChange4}
                  cellRender={customCellRender4}
                  rowRender={customRowRender4}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList4"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              headerCell={
                                requiredField.includes(item.fieldName)
                                  ? RequiredHeader
                                  : undefined
                              }
                              cell={
                                customField.includes(item.fieldName)
                                  ? ColumnCommandCell6
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell5
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </FormContext6.Provider>
        </TabStripTab>
        <TabStripTab
          title="자동전표기준"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>매입매출구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="inoutdiv"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer style={{ width: "100%", overflow: "auto" }}>
            <FormContext2.Provider
              value={{
                acntcd2,
                acntnm2,
                setAcntcd2,
                setAcntnm2,
                mainDataState6,
                setMainDataState6,
                // fetchGrid,
              }}
            >
              <FormContext3.Provider
                value={{
                  acntcd3,
                  acntnm3,
                  setAcntcd3,
                  setAcntnm3,
                  mainDataState6,
                  setMainDataState6,
                  // fetchGrid,
                }}
              >
                <FormContext4.Provider
                  value={{
                    acntcd4,
                    acntnm4,
                    setAcntcd4,
                    setAcntnm4,
                    mainDataState6,
                    setMainDataState6,
                    // fetchGrid,
                  }}
                >
                  <FormContext5.Provider
                    value={{
                      acntcd5,
                      acntnm5,
                      setAcntcd5,
                      setAcntnm5,
                      mainDataState6,
                      setMainDataState6,
                      // fetchGrid,
                    }}
                  >
                    <GridTitleContainer className="ButtonContainer6">
                      <GridTitle></GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick5}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onDeleteClick5}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onSaveClick4}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          title="저장"
                          disabled={permissions.save ? false : true}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult6.data}
                      ref={(exporter) => {
                        _export6 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{
                          height: isMobile ? mobileheight6 : webheight6,
                        }}
                        data={process(
                          mainDataResult6.data.map((row) => ({
                            ...row,
                            [SELECTED_FIELD]: selectedState6[idGetter6(row)],
                          })),
                          mainDataState6
                        )}
                        {...mainDataState6}
                        onDataStateChange={onMainDataStateChange6}
                        //선택 기능
                        dataItemKey={DATA_ITEM_KEY6}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onSelectionChange}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={mainDataResult6.total}
                        skip={page6.skip}
                        take={page6.take}
                        pageable={true}
                        onPageChange={pageChange6}
                        //원하는 행 위치로 스크롤 기능
                        ref={gridRef6}
                        rowHeight={30}
                        //정렬기능
                        sortable={true}
                        onSortChange={onMainSortChange6}
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
                          field="itemacnt"
                          cell={CustomComboBoxCell}
                          title="품목계정"
                          width="120px"
                          footerCell={mainTotalFooterCell6}
                        />
                        <GridColumn
                          field="doexdiv"
                          cell={CustomComboBoxCell}
                          title="내수구분"
                          width="120px"
                        />
                        <GridColumn
                          field="soyn"
                          title="상계여부"
                          cell={CheckBoxCell}
                          width="120px"
                        />
                        <GridColumn title="차변">{createColumn2()}</GridColumn>
                        <GridColumn title="대변">{createColumn()}</GridColumn>
                        <GridColumn title="상계차변">
                          {createColumn4()}
                        </GridColumn>
                        <GridColumn title="상계대변">
                          {createColumn3()}
                        </GridColumn>
                      </Grid>
                    </ExcelExport>
                  </FormContext5.Provider>
                </FormContext4.Provider>
              </FormContext3.Provider>
            </FormContext2.Provider>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
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

export default AC_A0020W;
