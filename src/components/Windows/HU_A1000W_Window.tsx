import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
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
import {
  Checkbox,
  Input,
  InputChangeEvent,
  MaskedTextBox,
  NumericTextBox,
  TextArea,
} from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { Buffer } from "buffer";
import CryptoJS from "crypto-js";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInGridInput,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import ComboBoxCell from "../Cells/ComboBoxCell";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import RadioGroupCell from "../Cells/RadioGroupCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  convertDateToStr,
  dateformat,
  getBizCom,
  getGridItemChangedData,
  toDate
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import CommonDateRangePicker from "../DateRangePicker/CommonDateRangePicker";
import RequiredHeader from "../HeaderCells/RequiredHeader";
import BizComponentRadioGroup from "../RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../Renderers/Renderers";
import BankCDWindow from "./CommonWindows/BankCDWindow";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import ZipCodeWindow from "./CommonWindows/ZipCodeWindow";
import DetailWindow from "./HU_A1000W_Sub_Window";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
const DATA_ITEM_KEY5 = "num";
const DATA_ITEM_KEY6 = "num";
const DATA_ITEM_KEY7 = "num";
const DATA_ITEM_KEY8 = "num";
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];
let deletedMainRows3: object[] = [];
let deletedMainRows4: object[] = [];
let deletedMainRows5: object[] = [];
let deletedMainRows6: object[] = [];
let deletedMainRows7: object[] = [];
let deletedMainRows8: object[] = [];
let temp = 0;
let temp2 = 0;
let temp3 = 0;
let temp4 = 0;
let temp5 = 0;
let temp6 = 0;
let temp7 = 0;
let temp8 = 0;

type TdataArr = {
  rowstatus_s: string[];
  hu251t_seq_s: string[];
  hu251t_fmlynm_s: string[];
  hu251t_relt_s: string[];
  hu251t_perregnum_s: string[];
  hu251t_schcd_s: string[];
  hu251t_gradutype_s: string[];
  hu251t_job_s: string[];
  hu251t_compnm_s: string[];
  hu251t_postnm_s: string[];
  hu251t_birdt_s: string[];
  hu251t_sexcd_s: string[];
  hu251t_payyn_s: string[];
  hu251t_yesyn_s: string[];
  hu251t_dfmyn_s: string[];
  hu251t_rmyn_s: string[];
  hu251t_phoneno_s: string[];
  hu251t_attdatnum_s: string[];
  hu251t_remark_s: string[];
};

type TdataArr2 = {
  hu252t_rowstatus_s: string[];
  hu252t_seq_s: string[];
  hu252t_schdiv_s: string[];
  hu252t_startdate_s: string[];
  hu252t_enddate_s: string[];
  hu252t_schnm_s: string[];
  hu252t_major_s: string[];
  hu252t_schgrade_s: string[];
  attdatnum_s: string[];
};

type TdataArr3 = {
  hu254t_rowstatus_s: string[];
  hu254t_seq_s: string[];
  hu254t_qualkind_s: string[];
  hu254t_qualgrad_s: string[];
  hu254t_qualmach_s: string[];
  hu254t_acqdt_s: string[];
  hu254t_validt_s: string[];
  hu254t_renewdt_s: string[];
  hu254t_qualnum_s: string[];
  attdatnum_s: string[];
};

type TdataArr4 = {
  hu253t_rowstatus_s: string[];
  hu253t_seq_s: string[];
  hu253t_compnm_s: string[];
  hu253t_frdt_s: string[];
  hu253t_todt_s: string[];
  hu253t_dptnm_s: string[];
  hu253t_postnm_s: string[];
  hu253t_jobnm_s: string[];
  hu253t_remark_s: string[];
  attdatnum_s: string[];
};

type TdataArr5 = {
  hu255t_rowstatus_s: string[];
  hu255t_seq_s: string[];
  hu255t_appointcd_s: string[];
  hu255t_appointdt_s: string[];
  hu255t_appointrsn_s: string[];
  hu255t_startdt_s: string[];
  hu255t_enddt_s: string[];
  hu255t_remark_s: string[];
  hu255t_dptcd_s: string[];
  attdatnum_s: string[];
};

type TdataArr6 = {
  hu256t_rowstatus_s: string[];
  hu256t_seq_s: string[];
  hu256t_rnpdiv_s: string[];
  hu256t_reqdt_s: string[];
  hu256t_reloffice_s: string[];
  hu256t_contents_s: string[];
  hu256t_remark_s: string[];
  attdatnum_s: string[];
};

type TdataArr7 = {
  hu257t_rowstatus_s: string[];
  hu257t_seq_s: string[];
  hu257t_startdt_s: string[];
  hu257t_enddt_s: string[];
  hu257t_eduterm_s: string[];
  hu257t_edutime_s: string[];
  hu257t_edunm_s: string[];
  hu257t_contents_s: string[];
  hu257t_edueval_s: string[];
  hu257t_eduoffice_s: string[];
  attdatnum_s: string[];
};

type TdataArr8 = {
  hu258t_rowstatus_s: string[];
  hu258t_seq_s: string[];
  hu258t_educd_s: string[];
  hu258t_testnm_s: string[];
  hu258t_score_s: string[];
  hu258t_testdt_s: string[];
  hu258t_speaking_s: string[];
  hu258t_country_s: string[];
  hu258t_startdt_s: string[];
  hu258t_enddt_s: string[];
  attdatnum_s: string[];
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_HU020, L_HU009, L_HU700, L_HU062, L_dptcd_001, L_HU017, L_HU090",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "relt"
      ? "L_HU020"
      : field == "schcd"
      ? "L_HU009"
      : field == "dfmyn"
      ? "L_HU700"
      : field == "appointcd"
      ? "L_HU062"
      : field == "dptcd"
      ? "L_dptcd_001"
      : field == "rnpdiv"
      ? "L_HU017"
      : field == "educd"
      ? "L_HU090"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  const textField = field == "dptcd" ? "dptnm" : "code_name";
  const valueField = field == "dptcd" ? "dptcd" : "sub_code";

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
  UseBizComponent("R_SEXCD", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "sexcd" ? "R_SEXCD" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} {...props} />
  ) : (
    <td />
  );
};

export const FormContext = createContext<{
  attdatnum: string;
  files: string;
  setAttdatnum: (d: any) => void;
  setFiles: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext2 = createContext<{
  attdatnum2: string;
  files2: string;
  setAttdatnum2: (d: any) => void;
  setFiles2: (d: any) => void;
  mainDataState2: State;
  setMainDataState2: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext3 = createContext<{
  attdatnum3: string;
  files3: string;
  setAttdatnum3: (d: any) => void;
  setFiles3: (d: any) => void;
  mainDataState3: State;
  setMainDataState3: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext4 = createContext<{
  attdatnum4: string;
  files4: string;
  setAttdatnum4: (d: any) => void;
  setFiles4: (d: any) => void;
  mainDataState4: State;
  setMainDataState4: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext5 = createContext<{
  attdatnum5: string;
  files5: string;
  setAttdatnum5: (d: any) => void;
  setFiles5: (d: any) => void;
  mainDataState5: State;
  setMainDataState5: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext6 = createContext<{
  attdatnum6: string;
  files6: string;
  setAttdatnum6: (d: any) => void;
  setFiles6: (d: any) => void;
  mainDataState6: State;
  setMainDataState6: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext7 = createContext<{
  attdatnum7: string;
  files7: string;
  setAttdatnum7: (d: any) => void;
  setFiles7: (d: any) => void;
  mainDataState7: State;
  setMainDataState7: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext8 = createContext<{
  attdatnum8: string;
  files8: string;
  setAttdatnum8: (d: any) => void;
  setFiles8: (d: any) => void;
  mainDataState8: State;
  setMainDataState8: (d: any) => void;
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
  const { setAttdatnum, setFiles } = useContext(FormContext);
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

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum(data.attdatnum);
    setFiles(
      data.original_name +
        (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : "")
    );
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
          onClick={onAttWndClick2}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
          permission={{ upload: true, download: true, delete: true }}
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
  const { setAttdatnum2, setFiles2 } = useContext(FormContext2);
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

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum2(data.attdatnum);
    setFiles2(
      data.original_name +
        (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : "")
    );
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
          onClick={onAttWndClick2}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
          permission={{ upload: true, download: true, delete: true }}
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
  const { setAttdatnum3, setFiles3 } = useContext(FormContext3);
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

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum3(data.attdatnum);
    setFiles3(
      data.original_name +
        (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : "")
    );
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
          onClick={onAttWndClick2}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
          permission={{ upload: true, download: true, delete: true }}
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
  const { setAttdatnum4, setFiles4 } = useContext(FormContext4);
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

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum4(data.attdatnum);
    setFiles4(
      data.original_name +
        (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : "")
    );
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
          onClick={onAttWndClick2}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
          permission={{ upload: true, download: true, delete: true }}
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
  const { setAttdatnum5, setFiles5 } = useContext(FormContext5);
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

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum5(data.attdatnum);
    setFiles5(
      data.original_name +
        (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : "")
    );
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
          onClick={onAttWndClick2}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
          permission={{ upload: true, download: true, delete: true }}
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
  const { setAttdatnum6, setFiles6 } = useContext(FormContext6);
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

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum6(data.attdatnum);
    setFiles6(
      data.original_name +
        (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : "")
    );
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
          onClick={onAttWndClick2}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
          permission={{ upload: true, download: true, delete: true }}
        />
      )}
    </>
  );
};

const ColumnCommandCell7 = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const { setAttdatnum7, setFiles7 } = useContext(FormContext7);
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

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum7(data.attdatnum);
    setFiles7(
      data.original_name +
        (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : "")
    );
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
          onClick={onAttWndClick2}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
          permission={{ upload: true, download: true, delete: true }}
        />
      )}
    </>
  );
};

const ColumnCommandCell8 = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const { setAttdatnum8, setFiles8 } = useContext(FormContext8);
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

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum8(data.attdatnum);
    setFiles8(
      data.original_name +
        (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : "")
    );
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
          onClick={onAttWndClick2}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
          permission={{ upload: true, download: true, delete: true }}
        />
      )}
    </>
  );
};

type IWindow = {
  workType: "N" | "U";
  data?: any;
  setVisible(t: boolean): void;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
  pathname: string;
};

const CopyWindow = ({
  workType,
  data,
  setVisible,
  reload,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [tabSelected, setTabSelected] = useState(0);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const idGetter6 = getter(DATA_ITEM_KEY6);
  const idGetter7 = getter(DATA_ITEM_KEY7);
  const idGetter8 = getter(DATA_ITEM_KEY8);
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 750,
  });
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const pc = UseGetValueFromSessionItem("pc");
  const [attdatnum, setAttdatnum] = useState<string>("");
  const [files, setFiles] = useState<string>("");
  const [attdatnum2, setAttdatnum2] = useState<string>("");
  const [files2, setFiles2] = useState<string>("");
  const [attdatnum3, setAttdatnum3] = useState<string>("");
  const [files3, setFiles3] = useState<string>("");
  const [attdatnum4, setAttdatnum4] = useState<string>("");
  const [files4, setFiles4] = useState<string>("");
  const [attdatnum5, setAttdatnum5] = useState<string>("");
  const [files5, setFiles5] = useState<string>("");
  const [attdatnum6, setAttdatnum6] = useState<string>("");
  const [files6, setFiles6] = useState<string>("");
  const [attdatnum7, setAttdatnum7] = useState<string>("");
  const [files7, setFiles7] = useState<string>("");
  const [attdatnum8, setAttdatnum8] = useState<string>("");
  const [files8, setFiles8] = useState<string>("");

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            attdatnum: attdatnum,
            files: files,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [attdatnum, files]);

  useEffect(() => {
    const newData = mainDataResult2.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState2)[0])
        ? {
            ...item,
            attdatnum: attdatnum2,
            files: files2,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );

    setMainDataResult2((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [attdatnum2, files2]);

  useEffect(() => {
    const newData = mainDataResult3.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState3)[0])
        ? {
            ...item,
            attdatnum: attdatnum3,
            files: files3,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );

    setMainDataResult3((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [attdatnum3, files3]);

  useEffect(() => {
    const newData = mainDataResult4.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState4)[0])
        ? {
            ...item,
            attdatnum: attdatnum4,
            files: files4,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
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
  }, [attdatnum4, files4]);

  useEffect(() => {
    const newData = mainDataResult5.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState5)[0])
        ? {
            ...item,
            attdatnum: attdatnum5,
            files: files5,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
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
  }, [attdatnum5, files5]);

  useEffect(() => {
    const newData = mainDataResult6.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState6)[0])
        ? {
            ...item,
            attdatnum: attdatnum6,
            files: files6,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
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
  }, [attdatnum6, files6]);

  useEffect(() => {
    const newData = mainDataResult7.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState7)[0])
        ? {
            ...item,
            attdatnum: attdatnum7,
            files: files7,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );

    setMainDataResult7((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [attdatnum7, files7]);

  useEffect(() => {
    const newData = mainDataResult8.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState8)[0])
        ? {
            ...item,
            attdatnum: attdatnum8,
            files: files8,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );

    setMainDataResult8((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [attdatnum8, files8]);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const setLoading = useSetRecoilState(isLoading);

  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  const excelInput: any = useRef();
  const [imgBase64, setImgBase64] = useState<string>(); // 파일 base64

  const processApi = useApi();

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);
  const [page6, setPage6] = useState(initialPageState);
  const [page7, setPage7] = useState(initialPageState);
  const [page8, setPage8] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
      setUnsavedName([]);
    }

    setFilters2((prev) => ({
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
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
      setUnsavedName([]);
    }

    setFilters3((prev) => ({
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
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
      setUnsavedName([]);
    }

    setFilters4((prev) => ({
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
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
      setUnsavedName([]);
    }

    setFilters5((prev) => ({
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
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
      setUnsavedName([]);
    }

    setFilters6((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage5({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange6 = (event: GridPageChangeEvent) => {
    const { page } = event;
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
      setUnsavedName([]);
    }

    setFilters7((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage6({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange7 = (event: GridPageChangeEvent) => {
    const { page } = event;
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
      setUnsavedName([]);
    }

    setFilters8((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage7({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange8 = (event: GridPageChangeEvent) => {
    const { page } = event;
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
      setUnsavedName([]);
    }

    setFilters9((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage8({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };
  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    if (unsavedName.length > 0) setDeletedName(unsavedName);
    setVisible(false);
  };

  const handleSelectTab = (e: any) => {
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
      setUnsavedName([]);

      if (tabSelected == 0) {
        setInformation((prev) => ({
          ...prev,
          attdatnum: tempattach.attdatnum,
          files: tempattach.files,
        }));
      } else if (tabSelected == 1) {
        setInformation((prev) => ({
          ...prev,
          bankdatnum: tempattach.bankdatnum,
          bankfiles: tempattach.bankfiles,
        }));
      } else if (tabSelected == 4) {
        if (tempattach.attdatnumList.length > 0) {
          const newData = mainDataResult.data.map((item: any) => {
            return {
              ...item,
              attdatnum: tempattach.attdatnumList[item.num - 1],
              files: tempattach.filesList[item.num - 1],
            };
          });

          setMainDataResult((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        } else {
          const newData = mainDataResult.data.map((item: any) => {
            return {
              ...item,
              attdatnum: "",
              files: "",
            };
          });

          setMainDataResult((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      } else if (tabSelected == 5) {
        if (tempattach.attdatnumList2.length > 0) {
          const newData = mainDataResult2.data.map((item: any) => {
            return {
              ...item,
              attdatnum: tempattach.attdatnumList2[item.num - 1],
              files: tempattach.filesList2[item.num - 1],
            };
          });

          setMainDataResult2((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        } else {
          const newData = mainDataResult2.data.map((item: any) => {
            return {
              ...item,
              attdatnum: "",
              files: "",
            };
          });

          setMainDataResult2((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      } else if (tabSelected == 6) {
        if (tempattach.attdatnumList3.length > 0) {
          const newData = mainDataResult3.data.map((item: any) => {
            return {
              ...item,
              attdatnum: tempattach.attdatnumList3[item.num - 1],
              files: tempattach.filesList3[item.num - 1],
            };
          });

          setMainDataResult3((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        } else {
          const newData = mainDataResult3.data.map((item: any) => {
            return {
              ...item,
              attdatnum: "",
              files: "",
            };
          });

          setMainDataResult3((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      } else if (tabSelected == 7) {
        if (tempattach.attdatnumList4.length > 0) {
          const newData = mainDataResult4.data.map((item: any) => {
            return {
              ...item,
              attdatnum: tempattach.attdatnumList4[item.num - 1],
              files: tempattach.filesList4[item.num - 1],
            };
          });

          setMainDataResult4((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        } else {
          const newData = mainDataResult4.data.map((item: any) => {
            return {
              ...item,
              attdatnum: "",
              files: "",
            };
          });

          setMainDataResult4((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      } else if (tabSelected == 8) {
        if (tempattach.attdatnumList5.length > 0) {
          const newData = mainDataResult5.data.map((item: any) => {
            return {
              ...item,
              attdatnum: tempattach.attdatnumList5[item.num - 1],
              files: tempattach.filesList5[item.num - 1],
            };
          });

          setMainDataResult5((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        } else {
          const newData = mainDataResult5.data.map((item: any) => {
            return {
              ...item,
              attdatnum: "",
              files: "",
            };
          });

          setMainDataResult5((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      } else if (tabSelected == 9) {
        if (tempattach.attdatnumList6.length > 0) {
          const newData = mainDataResult6.data.map((item: any) => {
            return {
              ...item,
              attdatnum: tempattach.attdatnumList6[item.num - 1],
              files: tempattach.filesList6[item.num - 1],
            };
          });

          setMainDataResult6((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        } else {
          const newData = mainDataResult6.data.map((item: any) => {
            return {
              ...item,
              attdatnum: "",
              files: "",
            };
          });

          setMainDataResult6((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      } else if (tabSelected == 10) {
        if (tempattach.attdatnumList7.length > 0) {
          const newData = mainDataResult7.data.map((item: any) => {
            return {
              ...item,
              attdatnum: tempattach.attdatnumList7[item.num - 1],
              files: tempattach.filesList7[item.num - 1],
            };
          });

          setMainDataResult7((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        } else {
          const newData = mainDataResult7.data.map((item: any) => {
            return {
              ...item,
              attdatnum: "",
              files: "",
            };
          });

          setMainDataResult7((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      } else if (tabSelected == 11) {
        if (tempattach.attdatnumList8.length > 0) {
          const newData = mainDataResult8.data.map((item: any) => {
            return {
              ...item,
              attdatnum: tempattach.attdatnumList8[item.num - 1],
              files: tempattach.filesList8[item.num - 1],
            };
          });

          setMainDataResult8((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        } else {
          const newData = mainDataResult8.data.map((item: any) => {
            return {
              ...item,
              attdatnum: "",
              files: "",
            };
          });

          setMainDataResult8((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    }

    if (
      e.selected == 0 ||
      e.selected == 4 ||
      e.selected == 5 ||
      e.selected == 6 ||
      e.selected == 7 ||
      e.selected == 8 ||
      e.selected == 9 ||
      e.selected == 10 ||
      e.selected == 11
    ) {
      setPosition((prev) => ({
        ...prev,
        height: 750,
      }));
    } else if (e.selected == 1) {
      setPosition((prev) => ({
        ...prev,
        height: isMobile == true ? 750 : 630,
      }));
    } else if (e.selected == 2) {
      setPosition((prev) => ({
        ...prev,
        height: isMobile == true ? 750 : 450,
      }));
    } else if (e.selected == 3) {
      setPosition((prev) => ({
        ...prev,
        height: isMobile == true ? 750 : 350,
      }));
    }
    setTabSelected(e.selected);
  };
  const [zipCodeWindowVisible, setZipCodeWindowVisibile] =
    useState<boolean>(false);
  const [zipCodeWindowVisible2, setZipCodeWindowVisibile2] =
    useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const [attachmentsWindowVisible2, setAttachmentsWindowVisible2] =
    useState<boolean>(false);
  const [overtimeWindowVisible, setOvertimeWindowVisible] =
    useState<boolean>(false);
  const [bankcdWindowVisible, setBankcdWindowVisible] =
    useState<boolean>(false);

  const onZipCodeWndClick = () => {
    setZipCodeWindowVisibile(true);
  };
  const onZipCodeWndClick2 = () => {
    setZipCodeWindowVisibile2(true);
  };
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  const onAttachmentsWndClick2 = () => {
    setAttachmentsWindowVisible2(true);
  };
  const onOvertimeWndClick = () => {
    setOvertimeWindowVisible(true);
  };
  const onBankcdWndClick = () => {
    setBankcdWindowVisible(true);
  };
  const onAttWndClick2 = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput!.click();
  };

  const getAttachmentsDataphoto = async (files: FileList | null) => {
    if (files != null) {
      let uint8 = new Uint8Array(await files[0].arrayBuffer());
      let arrHexString = Buffer.from(uint8).toString("hex");
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      return new Promise((resolve) => {
        reader.onload = () => {
          if (reader.result != null) {
            setImgBase64(reader.result.toString());
            setInformation((prev) => ({
              ...prev,
              photodatnum: "0x" + arrHexString,
            }));
          }
        };
      });
    } else {
      alert("새로고침 후 다시 업로드해주세요.");
    }
  };

  const getZipCodeData = (zipcode: string, address: string) => {
    setInformation((prev) => {
      return {
        ...prev,
        hmzipcode: zipcode,
        koraddr: address,
      };
    });
  };
  const getZipCodeData2 = (zipcode: string, address: string) => {
    setInformation((prev) => {
      return {
        ...prev,
        zipcode: zipcode,
        hmaddr: address,
      };
    });
  };
  const getbankcdData = (bankcd: string, banknm: string) => {
    setInformation((prev) => {
      return {
        ...prev,
        bankcd: bankcd,
        banknm: banknm,
      };
    });
  };
  const getAttachmentsData = (data: IAttachmentData) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  const getAttachmentsData2 = (data: IAttachmentData) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        bankdatnum: data.attdatnum,
        bankfiles:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  const [tempattach, setTempAttach] = useState({
    attdatnum: "",
    files: "",
    bankdatnum: "",
    bankfiles: "",
    attdatnumList: [],
    filesList: [],
    attdatnumList2: [],
    filesList2: [],
    attdatnumList3: [],
    filesList3: [],
    attdatnumList4: [],
    filesList4: [],
    attdatnumList5: [],
    filesList5: [],
    attdatnumList6: [],
    filesList6: [],
    attdatnumList7: [],
    filesList7: [],
    attdatnumList8: [],
    filesList8: [],
  });

  const getOvertime = (overtime: string) => {
    setInformation((prev) => {
      return {
        ...prev,
        overtime: overtime,
      };
    });
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedState3(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY4,
    });
    setSelectedState4(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange5 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState5,
      dataItemKey: DATA_ITEM_KEY5,
    });
    setSelectedState5(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange6 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState6,
      dataItemKey: DATA_ITEM_KEY6,
    });
    setSelectedState6(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange7 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState7,
      dataItemKey: DATA_ITEM_KEY7,
    });
    setSelectedState7(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange8 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState8,
      dataItemKey: DATA_ITEM_KEY8,
    });
    setSelectedState8(newSelectedState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  //그리드 푸터
  const mainTotalFooterCell4 = (props: GridFooterCellProps) => {
    var parts = mainDataResult4.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell5 = (props: GridFooterCellProps) => {
    var parts = mainDataResult5.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell6 = (props: GridFooterCellProps) => {
    var parts = mainDataResult6.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell7 = (props: GridFooterCellProps) => {
    var parts = mainDataResult7.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell8 = (props: GridFooterCellProps) => {
    var parts = mainDataResult8.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
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
  const onMainDataStateChange7 = (event: GridDataStateChangeEvent) => {
    setMainDataState7(event.dataState);
  };
  const onMainDataStateChange8 = (event: GridDataStateChangeEvent) => {
    setMainDataState8(event.dataState);
  };
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
  const onMainSortChange7 = (e: any) => {
    setMainDataState7((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange8 = (e: any) => {
    setMainDataState8((prev) => ({ ...prev, sort: e.sort }));
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
  const onMainItemChange6 = (event: GridItemChangeEvent) => {
    setMainDataState6((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult6,
      setMainDataResult6,
      DATA_ITEM_KEY6
    );
  };
  const onMainItemChange7 = (event: GridItemChangeEvent) => {
    setMainDataState7((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult7,
      setMainDataResult7,
      DATA_ITEM_KEY7
    );
  };
  const onMainItemChange8 = (event: GridItemChangeEvent) => {
    setMainDataState8((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult8,
      setMainDataResult8,
      DATA_ITEM_KEY8
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
  const customCellRender6 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit6}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender7 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit7}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender8 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit8}
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
  const customRowRender6 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit6}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender7 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit7}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender8 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit8}
      editField={EDIT_FIELD}
    />
  );
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      attdatnum: "",
      birdt: convertDateToStr(new Date()),
      compnm: "",
      dfmyn: "",
      files: "",
      fmlynm: "",
      form_id: "HU_A1000W",
      gradutype: "",
      job: "",
      orgdiv: sessionOrgdiv,
      payyn: false,
      perregnum: "",
      perregnum1: "",
      phoneno: "",
      postnm: "",
      prsnnum: "",
      relt: "",
      remark: "",
      rmyn: false,
      schcd: "",
      seq: 0,
      sexcd: "M",
      yesyn: false,
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
      area: "",
      attdatnum: "",
      enddate: "99991231",
      files: "",
      form_id: "HU_A1000W",
      major: "",
      majorfield: "",
      orgdiv: sessionOrgdiv,
      prsnnum: "",
      remark: "",
      schdiv: "",
      schgrade: "",
      schnm: "",
      seq: 0,
      startdate: "99991231",
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
      acqdt: "99991231",
      attdatnum: "",
      files: "",
      finyn: "",
      form_id: "HU_A1000W",
      orgdiv: sessionOrgdiv,
      prsnnum: "",
      qualgrad: "",
      qualkind: "",
      qualmach: "",
      qualnum: "",
      renewdt: "99991231",
      seq: 0,
      validt: "99991231",
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
      attdatnum: "",
      compnm: "",
      dptnm: "",
      files: "",
      form_id: "HU_A1000W",
      frdt: "99991231",
      jobnm: "",
      ocptnm: "",
      orgdiv: sessionOrgdiv,
      postnm: "",
      prsnnum: "",
      remark: "",
      seq: 0,
      todt: "99991231",
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
      appointcd: "",
      appointdt: "99991231",
      appointrsn: "",
      attdatnum: "",
      dptcd: "",
      enddt: "99991231",
      files: "",
      form_id: "HU_A1000W",
      orgdiv: sessionOrgdiv,
      prsnnum: "",
      remark: "",
      seq: 0,
      startdt: "99991231",
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

  const onAddClick6 = () => {
    mainDataResult6.data.map((item) => {
      if (item.num > temp6) {
        temp6 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY6]: ++temp6,
      attdatnum: "",
      contents: "",
      files: "",
      form_id: "HU_A1000W",
      orgdiv: sessionOrgdiv,
      prsnnum: "",
      reloffice: "",
      remark: "",
      reqdt: "99991231",
      rnpdiv: "",
      seq: 0,
      rowstatus: "N",
    };

    setSelectedState6({ [newDataItem[DATA_ITEM_KEY6]]: true });
    setPage6((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult6((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick7 = () => {
    mainDataResult7.data.map((item) => {
      if (item.num > temp7) {
        temp7 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY7]: ++temp7,
      attdatnum: "",
      contents: "",
      edueval: "",
      edunm: "",
      eduoffice: "",
      eduterm: 0,
      edutime: 0,
      enddt: "99991231",
      files: "",
      form_id: "HU_A1000",
      gubun: "",
      orgdiv: sessionOrgdiv,
      prsnnum: "",
      remark: "",
      seq: 0,
      startdt: "99991231",
      rowstatus: "N",
    };

    setSelectedState7({ [newDataItem[DATA_ITEM_KEY7]]: true });
    setPage7((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult7((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick8 = () => {
    mainDataResult8.data.map((item) => {
      if (item.num > temp8) {
        temp8 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY8]: ++temp8,
      attdatnum: "",
      country: "",
      educd: "",
      enddt: "99991231",
      files: "",
      form_id: "HU_A1000",
      orgdiv: sessionOrgdiv,
      prsnnum: "",
      score: "",
      seq: 0,
      speaking: "",
      startdt: "99991231",
      testdt: "99991231",
      testnm: "",
      rowstatus: "N",
    };

    setSelectedState8({ [newDataItem[DATA_ITEM_KEY8]]: true });
    setPage8((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult8((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onDeleteClick = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

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

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onDeleteClick2 = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

    mainDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedState2[item[DATA_ITEM_KEY2]]) {
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
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object) - 1];
    }

    setMainDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState2({
      [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };

  const onDeleteClick3 = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

    mainDataResult3.data.forEach((item: any, index: number) => {
      if (!selectedState3[item[DATA_ITEM_KEY3]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
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
    setSelectedState3({
      [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
    });
  };

  const onDeleteClick4 = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

    mainDataResult4.data.forEach((item: any, index: number) => {
      if (!selectedState4[item[DATA_ITEM_KEY4]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
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
    setSelectedState4({
      [data != undefined ? data[DATA_ITEM_KEY4] : newData[0]]: true,
    });
  };

  const onDeleteClick5 = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

    mainDataResult5.data.forEach((item: any, index: number) => {
      if (!selectedState5[item[DATA_ITEM_KEY5]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
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
    setSelectedState5({
      [data != undefined ? data[DATA_ITEM_KEY5] : newData[0]]: true,
    });
  };

  const onDeleteClick6 = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

    mainDataResult6.data.forEach((item: any, index: number) => {
      if (!selectedState6[item[DATA_ITEM_KEY6]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows6.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult6.data[Math.min(...Object2)];
    } else {
      data = mainDataResult6.data[Math.min(...Object) - 1];
    }

    setMainDataResult6((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState6({
      [data != undefined ? data[DATA_ITEM_KEY6] : newData[0]]: true,
    });
  };

  const onDeleteClick7 = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

    mainDataResult7.data.forEach((item: any, index: number) => {
      if (!selectedState7[item[DATA_ITEM_KEY7]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows7.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult7.data[Math.min(...Object2)];
    } else {
      data = mainDataResult7.data[Math.min(...Object) - 1];
    }

    setMainDataResult7((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState7({
      [data != undefined ? data[DATA_ITEM_KEY7] : newData[0]]: true,
    });
  };

  const onDeleteClick8 = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

    mainDataResult8.data.forEach((item: any, index: number) => {
      if (!selectedState8[item[DATA_ITEM_KEY8]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows8.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult8.data[Math.min(...Object2)];
    } else {
      data = mainDataResult8.data[Math.min(...Object) - 1];
    }

    setMainDataResult8((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState8({
      [data != undefined ? data[DATA_ITEM_KEY8] : newData[0]]: true,
    });
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "files" && field != "rowstatus") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
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
    } else {
      setTempResult((prev) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "files" && field != "rowstatus") {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
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
    } else {
      setTempResult2((prev) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit3 = (dataItem: any, field: string) => {
    if (field != "files" && field != "rowstatus") {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == dataItem[DATA_ITEM_KEY3]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
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
    } else {
      setTempResult3((prev) => {
        return {
          data: mainDataResult3.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit4 = (dataItem: any, field: string) => {
    if (field != "files" && field != "rowstatus" && field != "orgdiv") {
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
    } else {
      setTempResult4((prev) => {
        return {
          data: mainDataResult4.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit5 = (dataItem: any, field: string) => {
    if (field != "files" && field != "rowstatus") {
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
    } else {
      setTempResult5((prev) => {
        return {
          data: mainDataResult5.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit6 = (dataItem: any, field: string) => {
    if (field != "files" && field != "rowstatus") {
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
      setTempResult6((prev) => {
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
      setTempResult6((prev) => {
        return {
          data: mainDataResult6.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit7 = (dataItem: any, field: string) => {
    if (field != "files" && field != "rowstatus") {
      const newData = mainDataResult7.data.map((item) =>
        item[DATA_ITEM_KEY7] == dataItem[DATA_ITEM_KEY7]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult7((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult7((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult7((prev) => {
        return {
          data: mainDataResult7.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit8 = (dataItem: any, field: string) => {
    if (field != "files" && field != "rowstatus") {
      const newData = mainDataResult8.data.map((item) =>
        item[DATA_ITEM_KEY8] == dataItem[DATA_ITEM_KEY8]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult8((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult8((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult8((prev) => {
        return {
          data: mainDataResult8.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map((item) =>
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
    } else {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
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
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map((item) =>
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
    } else {
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
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
    }
  };

  const exitEdit3 = () => {
    if (tempResult3.data != mainDataResult3.data) {
      const newData = mainDataResult3.data.map((item) =>
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
    } else {
      const newData = mainDataResult3.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
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
    }
  };

  const exitEdit4 = () => {
    if (tempResult4.data != mainDataResult4.data) {
      const newData = mainDataResult4.data.map((item) =>
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
    } else {
      const newData = mainDataResult4.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
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
    }
  };

  const exitEdit5 = () => {
    if (tempResult5.data != mainDataResult5.data) {
      const newData = mainDataResult5.data.map((item) =>
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
    } else {
      const newData = mainDataResult5.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
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
    }
  };

  const exitEdit6 = () => {
    if (tempResult6.data != mainDataResult6.data) {
      const newData = mainDataResult6.data.map((item) =>
        item[DATA_ITEM_KEY6] == Object.getOwnPropertyNames(selectedState6)[0]
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
      setTempResult6((prev) => {
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
      const newData = mainDataResult6.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult6((prev) => {
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
    }
  };

  const exitEdit7 = () => {
    if (tempResult7.data != mainDataResult7.data) {
      const newData = mainDataResult7.data.map((item) =>
        item[DATA_ITEM_KEY7] == Object.getOwnPropertyNames(selectedState7)[0]
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
      setTempResult7((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult7((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult7.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult7((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult7((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit8 = () => {
    if (tempResult8.data != mainDataResult8.data) {
      const newData = mainDataResult8.data.map((item) =>
        item[DATA_ITEM_KEY8] == Object.getOwnPropertyNames(selectedState8)[0]
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
      setTempResult8((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult8((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult8.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult8((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult8((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "new"
      );

      if (workType == "N") {
        setInformation((prev) => ({
          ...prev,
          abilcd: defaultOption.find((item: any) => item.id == "abilcd")
            ?.valueCode,
          dptcd: defaultOption.find((item: any) => item.id == "dptcd")
            ?.valueCode,
          emptype: defaultOption.find((item: any) => item.id == "emptype")
            ?.valueCode,
          nationcd: defaultOption.find((item: any) => item.id == "nationcd")
            ?.valueCode,
          path: defaultOption.find((item: any) => item.id == "path")?.valueCode,
          postcd: defaultOption.find((item: any) => item.id == "postcd")
            ?.valueCode,
          regcd: defaultOption.find((item: any) => item.id == "regcd")
            ?.valueCode,
          rtrrsn: defaultOption.find((item: any) => item.id == "rtrrsn")
            ?.valueCode,
          schcd: defaultOption.find((item: any) => item.id == "schcd")
            ?.valueCode,
          sexcd: defaultOption.find((item: any) => item.id == "sexcd")
            ?.valueCode,
          bircd: defaultOption.find((item: any) => item.id == "bircd")
            ?.valueCode,
          jobcd: defaultOption.find((item: any) => item.id == "jobcd")
            ?.valueCode,
          location: defaultOption.find((item: any) => item.id == "location")
            ?.valueCode,
          paycd: defaultOption.find((item: any) => item.id == "paycd")
            ?.valueCode,
          workgb: defaultOption.find((item: any) => item.id == "workgb")
            ?.valueCode,
          workcls: defaultOption.find((item: any) => item.id == "workcls")
            ?.valueCode,
        }));
      }
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "R_BIRCD,R_SEXCD,R_dayoffdiv,R_Rtrtype, R_HOUSEYN, R_MARRIAGE, L_BA001",
    setBizComponentData
  );

  const [orgdivListData, setOrgdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setOrgdivListData(getBizCom(bizComponentData, "L_BA001"));
    }
  }, [bizComponentData]);

  const [information, setInformation] = useState<{ [name: string]: any }>({
    orgdiv: sessionOrgdiv,
    prsnnum: "",
    prsnnum2: "",
    location: sessionLocation,
    position: "",
    workplace: "",
    prsnnm: "",
    prsnnmh: "",
    prsnnme: "",
    nationcd: "",
    cardcd: "",
    dptcd: "",
    dptnm: "",
    postcd: "",
    ocptcd: "",
    workgb: "",
    workcls: "",
    jobcd: "",
    abilcd: "",
    paygrad: "",
    salaryclass: "",
    regcd: "",
    perregnum: "",
    salt: "",
    birdt: "",
    bircd: "",
    sexcd: "",
    firredt: "",
    regorgdt: "",
    rtrdt: "",
    rtrrsn: "",
    emptype: "",
    zipcode: "",
    koraddr: "",
    hmzipcode: "",
    hmaddr: "",
    enaddr: "",
    telephon: "",
    phonenum: "",
    extnum: "",
    outnum: "",
    schcd: "",
    laboryn: "N",
    dfmyn: "N",
    milyn: "N",
    paycd: "",
    taxcd: "",
    hirinsuyn: "N",
    payyn: "N",
    caltaxyn: "N",
    yrdclyn: "N",
    bankcd: "",
    banknm: "",
    bankacnt: "",
    bankacntuser: "",
    bankfiles: "",
    bankdatnum: "",
    medgrad: "",
    medinsunum: "",
    pnsgrad: "",
    meddate: "",
    anudate: "",
    hirdate: "",
    sps: "N",
    wmn: "N",
    sptnum: 0,
    dfmnum: 0,
    agenum: 0,
    agenum70: 0,
    brngchlnum: 0,
    fam1: 0,
    fam2: 0,
    notaxe: "N",
    bnskind: "N",
    mailid: "",
    workmail: "",
    childnum: 0,
    dfmyn2: "N",
    houseyn: "",
    remark: "",
    path: "",
    attdatnum: "",
    incgb: "",
    exmtaxgb: "",
    exstartdt: "",
    exenddt: "",
    dayoffdiv: "",
    rtrtype: "",

    workchk: "N",
    yrchk: "N",

    //개인정보
    height: 0,
    weight: 0,
    blood: "",
    color: "",
    leye: 0,
    reye: 0,
    hobby: "",
    hobby2: "",
    religion: "",
    marriage: "",
    marrydt: "",
    orgaddr: "",
    birthplace: "",
    size1: "",
    size2: "",
    size3: "",
    photodatnum: "",

    armygb: "",
    armystartdt: "",
    armyenddt: "",
    armyclass: "",
    armyexrsn: "",
    armydistinctiom: "",
    armyrank: "",
    militarynum: "",
    armykind: "",
    armyspeciality: "",

    below2kyn: "N",
    occudate: "",
    overtime: 0,
  });

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const RadioChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
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
  const [mainDataState6, setMainDataState6] = useState<State>({
    sort: [],
  });
  const [mainDataState7, setMainDataState7] = useState<State>({
    sort: [],
  });
  const [mainDataState8, setMainDataState8] = useState<State>({
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
  const [tempState6, setTempState6] = useState<State>({
    sort: [],
  });
  const [tempState7, setTempState7] = useState<State>({
    sort: [],
  });
  const [tempState8, setTempState8] = useState<State>({
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
  const [mainDataResult7, setMainDataResult7] = useState<DataResult>(
    process([], mainDataState7)
  );
  const [mainDataResult8, setMainDataResult8] = useState<DataResult>(
    process([], mainDataState8)
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
  const [tempResult6, setTempResult6] = useState<DataResult>(
    process([], tempState6)
  );
  const [tempResult7, setTempResult7] = useState<DataResult>(
    process([], tempState7)
  );
  const [tempResult8, setTempResult8] = useState<DataResult>(
    process([], tempState8)
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
  const [selectedState7, setSelectedState7] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState8, setSelectedState8] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "HU250T",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    dptcd: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "HU251T",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    dptcd: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    workType: "HU252T",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    dptcd: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    workType: "HU254T",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    dptcd: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters5, setFilters5] = useState({
    pgSize: PAGE_SIZE,
    workType: "HU253T",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    dptcd: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters6, setFilters6] = useState({
    pgSize: PAGE_SIZE,
    workType: "HU255T",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    dptcd: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters7, setFilters7] = useState({
    pgSize: PAGE_SIZE,
    workType: "HU256T",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    dptcd: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters8, setFilters8] = useState({
    pgSize: PAGE_SIZE,
    workType: "HU257T",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    dptcd: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters9, setFilters9] = useState({
    pgSize: PAGE_SIZE,
    workType: "HU258T",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    dptcd: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  useEffect(() => {
    if (filters.isSearch && workType != "N") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (filters2.isSearch && workType != "N") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  useEffect(() => {
    if (filters3.isSearch && workType != "N") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3]);

  useEffect(() => {
    if (filters4.isSearch && workType != "N") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);
      setFilters4((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters4]);

  useEffect(() => {
    if (filters5.isSearch && workType != "N") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters5);
      setFilters5((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid5(deepCopiedFilters);
    }
  }, [filters5]);

  useEffect(() => {
    if (filters6.isSearch && workType != "N") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters6);
      setFilters6((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid6(deepCopiedFilters);
    }
  }, [filters6]);

  useEffect(() => {
    if (filters7.isSearch && workType != "N") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters7);
      setFilters7((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid7(deepCopiedFilters);
    }
  }, [filters7]);

  useEffect(() => {
    if (filters8.isSearch && workType != "N") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters8);
      setFilters8((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid8(deepCopiedFilters);
    }
  }, [filters8]);

  useEffect(() => {
    if (filters9.isSearch && workType != "N") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters9);
      setFilters9((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid9(deepCopiedFilters);
    }
  }, [filters9]);

  function isResidentRegNoValid(residentRegNo: any) {
    var re = /^[0-9]{6}[0-9]{7}$/;
    if (!re.test(String(residentRegNo).toLowerCase())) {
      return false;
    }

    var regNos = residentRegNo.replace("-", "").split("");
    var checkNos = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
    var sum = 0;
    for (var i = 0; i < checkNos.length; i++) {
      sum = sum + checkNos[i] * Number(regNos[i]);
    }
    return (11 - (sum % 11)) % 10 == Number(regNos[12]);
  }

  const decrypt = (encrypted: any, secretKey: any) => {
    try {
      var decrypted = CryptoJS.AES.decrypt(encrypted, secretKey).toString(
        CryptoJS.enc.Utf8
      );
      return decrypted;
    } catch (e) {
      console.log(e);
    }
  };

  const encrypt = (val: any, secretKey: any) => {
    return CryptoJS.AES.encrypt(val, secretKey).toString();
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A1000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dptcd": filters.dptcd,
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_rtrchk": filters.rtrchk,
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
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        const perregnum = decrypt(rows[0].perregnum, rows[0].salt);
        const telephon = decrypt(rows[0].telephon, rows[0].salt);
        const phonenum = decrypt(rows[0].phonenum, rows[0].salt);
        setTempAttach((prev) => ({
          ...prev,
          attdatnum: rows[0].attdatnum,
          files: rows[0].files,
          bankdatnum: rows[0].bankdatnum,
          bankfiles: rows[0].bankfiles,
        }));

        if (
          rows[0].photodatnum != "" &&
          rows[0].photodatnum != null &&
          rows[0].photodatnum != undefined
        ) {
          if (
            rows[0].photodatnum.slice(0, 1) == "0" &&
            rows[0].photodatnum.slice(1, 2) == "x"
          ) {
            setImgBase64(rows[0].photodatnum);
          } else {
            setImgBase64("data:image/png;base64," + rows[0].photodatnum);
          }
        }
        setInformation({
          orgdiv: sessionOrgdiv,
          prsnnum: rows[0].prsnnum,
          prsnnum2: rows[0].prsnnum2,
          location: rows[0].location,
          position: rows[0].position,
          workplace: rows[0].workplace,
          prsnnm: rows[0].prsnnm,
          prsnnmh: rows[0].prsnnmh,
          prsnnme: rows[0].prsnnme,
          nationcd: rows[0].nationcd,
          cardcd: rows[0].cardcd,
          dptcd: rows[0].dptcd,
          dptnm: rows[0].dptnm,
          postcd: rows[0].postcd,
          ocptcd: rows[0].ocptcd,
          workgb: rows[0].workgb,
          workcls: rows[0].workcls,
          jobcd: rows[0].jobcd,
          abilcd: rows[0].abilcd,
          paygrad: rows[0].paygrad,
          salaryclass: rows[0].salaryclass,
          regcd: rows[0].regcd,
          perregnum: perregnum,
          salt: rows[0].salt,
          birdt: rows[0].birdt == "" ? null : toDate(rows[0].birdt),
          bircd: rows[0].bircd,
          sexcd: rows[0].sexcd,
          firredt: rows[0].firredt == "" ? null : toDate(rows[0].firredt),
          regorgdt: rows[0].regorgdt == "" ? null : toDate(rows[0].regorgdt),
          rtrdt: rows[0].rtrdt == "" ? null : toDate(rows[0].rtrdt),
          rtrrsn: rows[0].rtrrsn,
          emptype: rows[0].emptype,
          koraddr: rows[0].koraddr,
          zipcode: rows[0].zipcode,
          hmzipcode: rows[0].hmzipcode,
          hmaddr: rows[0].hmaddr,
          enaddr: rows[0].enaddr,
          telephon: telephon,
          phonenum: phonenum,
          extnum: rows[0].extnum,
          outnum: rows[0].outnum,
          schcd: rows[0].schcd,
          laboryn: rows[0].laboryn == "" ? "N" : rows[0].laboryn,
          dfmyn: rows[0].dfmyn == "" ? "N" : rows[0].dfmyn,
          milyn: rows[0].milyn == "" ? "N" : rows[0].milyn,
          paycd: rows[0].paycd,
          taxcd: rows[0].taxcd,
          hirinsuyn: rows[0].hirinsuyn == "" ? "N" : rows[0].hirinsuyn,
          payyn: rows[0].payyn == "" ? "N" : rows[0].payyn,
          caltaxyn: rows[0].caltaxyn == "" ? "N" : rows[0].caltaxyn,
          yrdclyn: rows[0].yrdclyn == "" ? "N" : rows[0].yrdclyn,
          bankcd: rows[0].bankcd,
          banknm: rows[0].banknm,
          bankacnt: rows[0].bankacnt,
          bankacntuser: rows[0].bankacntuser,
          bankfiles: rows[0].bankfiles,
          bankdatnum: rows[0].bankdatnum,
          medgrad: rows[0].medgrad,
          medinsunum: rows[0].medinsunum,
          pnsgrad: rows[0].pnsgrad,
          meddate: rows[0].meddate == "" ? null : toDate(rows[0].meddate),
          anudate: rows[0].anudate == "" ? null : toDate(rows[0].anudate),
          hirdate: rows[0].hirdate == "" ? null : toDate(rows[0].hirdate),
          sps: rows[0].sps == "" ? "N" : rows[0].sps,
          wmn: rows[0].wmn == "" ? "N" : rows[0].wmn,
          sptnum: rows[0].sptnum,
          dfmnum: rows[0].dfmnum,
          agenum: rows[0].agenum,
          agenum70: rows[0].agenum70,
          brngchlnum: rows[0].brngchlnum,
          fam1: rows[0].fam1,
          fam2: rows[0].fam2,
          notaxe: rows[0].notaxe == "" ? "N" : rows[0].notaxe,
          bnskind: rows[0].bnskind == "" ? "N" : rows[0].bnskind,
          mailid: rows[0].mailid,
          workmail: rows[0].workmail,
          childnum: rows[0].childnum,
          dfmyn2: rows[0].dfmyn2 == "" ? "N" : rows[0].dfmyn2,
          houseyn: rows[0].houseyn,
          remark: rows[0].remark,
          path: rows[0].path,
          files: rows[0].files,
          attdatnum: rows[0].attdatnum,
          incgb: rows[0].incgb,
          exmtaxgb: rows[0].exmtaxgb,
          exstartdt: rows[0].exstartdt == "" ? null : toDate(rows[0].exstartdt),
          exenddt: rows[0].exenddt == "" ? null : toDate(rows[0].exenddt),
          dayoffdiv: rows[0].dayoffdiv,
          rtrtype: rows[0].rtrtype,

          workchk: rows[0].workchk == "" ? "N" : rows[0].workchk,
          yrchk: rows[0].yrchk == "" ? "N" : rows[0].yrchk,

          //개인정보
          height: rows[0].height,
          weight: rows[0].weight,
          blood: rows[0].blood,
          color: rows[0].color,
          leye: rows[0].leye,
          reye: rows[0].reye,
          hobby: rows[0].hobby,
          hobby2: rows[0].hobby2,
          religion: rows[0].religion,
          marriage: rows[0].marriage,
          marrydt: rows[0].marrydt == "" ? null : toDate(rows[0].marrydt),
          orgaddr: rows[0].orgaddr,
          birthplace: rows[0].birthplace,
          size1: rows[0].size1,
          size2: rows[0].size2,
          size3: rows[0].size3,
          photodatnum:
            rows[0].photodatnum != "" &&
            rows[0].photodatnum != null &&
            rows[0].photodatnum != undefined
              ? rows[0].photodatnum.slice(0, 1) == "0" &&
                rows[0].photodatnum.slice(1, 2) == "x"
                ? rows[0].photodatnum
                : "data:image/png;base64," + rows[0].photodatnum
              : "",
          armygb: rows[0].armygb,
          armystartdt:
            rows[0].armystartdt == "" ? null : toDate(rows[0].armystartdt),
          armyenddt: rows[0].armyenddt == "" ? null : toDate(rows[0].armyenddt),
          armyclass: rows[0].armyclass,
          armyexrsn: rows[0].armyexrsn,
          armydistinctiom: rows[0].armydistinctiom,
          armyrank: rows[0].armyrank,
          militarynum: rows[0].militarynum,
          armykind: rows[0].armykind,
          armyspeciality: rows[0].armyspeciality,

          below2kyn: rows[0].below2kyn == "" ? "N" : rows[0].below2kyn,
          occudate: rows[0].occudate == "" ? null : toDate(rows[0].occudate),
          overtime: rows[0].overtime,
        });
      } else {
        setInformation({
          orgdiv: sessionOrgdiv,
          prsnnum: "",
          prsnnum2: "",
          location: sessionLocation,
          position: "",
          workplace: "",
          prsnnm: "",
          prsnnmh: "",
          prsnnme: "",
          nationcd: "",
          cardcd: "",
          dptcd: "",
          dptnm: "",
          postcd: "",
          ocptcd: "",
          workgb: "",
          workcls: "",
          jobcd: "",
          abilcd: "",
          paygrad: "",
          salaryclass: "",
          regcd: "",
          perregnum: "",
          salt: "",
          birdt: "",
          bircd: "",
          sexcd: "",
          firredt: "",
          regorgdt: "",
          rtrdt: "",
          rtrrsn: "",
          emptype: "",
          zipcode: "",
          koraddr: "",
          hmzipcode: "",
          hmaddr: "",
          enaddr: "",
          telephon: "",
          phonenum: "",
          extnum: "",
          outnum: "",
          schcd: "",
          laboryn: "N",
          dfmyn: "N",
          milyn: "N",
          paycd: "",
          taxcd: "",
          hirinsuyn: "N",
          payyn: "N",
          caltaxyn: "N",
          yrdclyn: "N",
          bankcd: "",
          banknm: "",
          bankacnt: "",
          bankacntuser: "",
          bankfiles: "",
          bankdatnum: "",
          medgrad: "",
          medinsunum: "",
          pnsgrad: "",
          meddate: "",
          anudate: "",
          hirdate: "",
          sps: "N",
          wmn: "N",
          sptnum: 0,
          dfmnum: 0,
          agenum: 0,
          agenum70: 0,
          brngchlnum: 0,
          fam1: 0,
          fam2: 0,
          notaxe: "N",
          bnskind: "N",
          mailid: "",
          workmail: "",
          childnum: 0,
          dfmyn2: "N",
          houseyn: "",
          remark: "",
          path: "",
          attdatnum: "",
          incgb: "",
          exmtaxgb: "",
          exstartdt: "",
          exenddt: "",
          dayoffdiv: "",
          rtrtype: "",

          workchk: "N",
          yrchk: "N",

          //개인정보
          height: 0,
          weight: 0,
          blood: "",
          color: "",
          leye: 0,
          reye: 0,
          hobby: "",
          hobby2: "",
          religion: "",
          marriage: "",
          marrydt: "",
          orgaddr: "",
          birthplace: "",
          size1: "",
          size2: "",
          size3: "",
          photodatnum: "",

          armygb: "",
          armystartdt: "",
          armyenddt: "",
          armyclass: "",
          armyexrsn: "",
          armydistinctiom: "",
          armyrank: "",
          militarynum: "",
          armykind: "",
          armyspeciality: "",

          below2kyn: "N",
          occudate: "",
          overtime: 0,
        });
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
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A1000W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters2.orgdiv,
        "@p_location": filters2.location,
        "@p_dptcd": filters2.dptcd,
        "@p_prsnnum": filters2.prsnnum,
        "@p_prsnnm": filters2.prsnnm,
        "@p_rtrchk": filters2.rtrchk,
        "@p_find_row_value": filters2.find_row_value,
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
        payyn: item.payyn == "Y" ? true : false,
        yesyn: item.yesyn == "Y" ? true : false,
        rmyn: item.rmyn == "Y" ? true : false,
      }));

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        let attdatnumArray: any = [];
        let filesArray: any = [];

        rows.map((item: any) => {
          attdatnumArray.push(item.attdatnum);
          filesArray.push(item.files);
        });
        setTempAttach((prev) => ({
          ...prev,
          attdatnumList: attdatnumArray,
          filesList: filesArray,
        }));
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A1000W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.workType,
        "@p_orgdiv": filters3.orgdiv,
        "@p_location": filters3.location,
        "@p_dptcd": filters3.dptcd,
        "@p_prsnnum": filters3.prsnnum,
        "@p_prsnnm": filters3.prsnnm,
        "@p_rtrchk": filters3.rtrchk,
        "@p_find_row_value": filters3.find_row_value,
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

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        let attdatnumArray: any = [];
        let filesArray: any = [];

        rows.map((item: any) => {
          attdatnumArray.push(item.attdatnum);
          filesArray.push(item.files);
        });
        setTempAttach((prev) => ({
          ...prev,
          attdatnumList2: attdatnumArray,
          filesList2: filesArray,
        }));
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
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
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A1000W_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": filters4.workType,
        "@p_orgdiv": filters4.orgdiv,
        "@p_location": filters4.location,
        "@p_dptcd": filters4.dptcd,
        "@p_prsnnum": filters4.prsnnum,
        "@p_prsnnm": filters4.prsnnm,
        "@p_rtrchk": filters4.rtrchk,
        "@p_find_row_value": filters4.find_row_value,
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

      setMainDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        let attdatnumArray: any = [];
        let filesArray: any = [];

        rows.map((item: any) => {
          attdatnumArray.push(item.attdatnum);
          filesArray.push(item.files);
        });
        setTempAttach((prev) => ({
          ...prev,
          attdatnumList3: attdatnumArray,
          filesList3: filesArray,
        }));
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
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
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A1000W_Q",
      pageNumber: filters5.pgNum,
      pageSize: filters5.pgSize,
      parameters: {
        "@p_work_type": filters5.workType,
        "@p_orgdiv": filters5.orgdiv,
        "@p_location": filters5.location,
        "@p_dptcd": filters5.dptcd,
        "@p_prsnnum": filters5.prsnnum,
        "@p_prsnnm": filters5.prsnnm,
        "@p_rtrchk": filters5.rtrchk,
        "@p_find_row_value": filters5.find_row_value,
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

      setMainDataResult4((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        let attdatnumArray: any = [];
        let filesArray: any = [];

        rows.map((item: any) => {
          attdatnumArray.push(item.attdatnum);
          filesArray.push(item.files);
        });
        setTempAttach((prev) => ({
          ...prev,
          attdatnumList4: attdatnumArray,
          filesList4: filesArray,
        }));
        setSelectedState4({ [rows[0][DATA_ITEM_KEY4]]: true });
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

  //그리드 데이터 조회
  const fetchMainGrid6 = async (filters6: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A1000W_Q",
      pageNumber: filters6.pgNum,
      pageSize: filters6.pgSize,
      parameters: {
        "@p_work_type": filters6.workType,
        "@p_orgdiv": filters6.orgdiv,
        "@p_location": filters6.location,
        "@p_dptcd": filters6.dptcd,
        "@p_prsnnum": filters6.prsnnum,
        "@p_prsnnm": filters6.prsnnm,
        "@p_rtrchk": filters6.rtrchk,
        "@p_find_row_value": filters6.find_row_value,
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

      setMainDataResult5((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        let attdatnumArray: any = [];
        let filesArray: any = [];

        rows.map((item: any) => {
          attdatnumArray.push(item.attdatnum);
          filesArray.push(item.files);
        });
        setTempAttach((prev) => ({
          ...prev,
          attdatnumList5: attdatnumArray,
          filesList5: filesArray,
        }));
        setSelectedState5({ [rows[0][DATA_ITEM_KEY5]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters6((prev) => ({
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
  const fetchMainGrid7 = async (filters7: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A1000W_Q",
      pageNumber: filters7.pgNum,
      pageSize: filters7.pgSize,
      parameters: {
        "@p_work_type": filters7.workType,
        "@p_orgdiv": filters7.orgdiv,
        "@p_location": filters7.location,
        "@p_dptcd": filters7.dptcd,
        "@p_prsnnum": filters7.prsnnum,
        "@p_prsnnm": filters7.prsnnm,
        "@p_rtrchk": filters7.rtrchk,
        "@p_find_row_value": filters7.find_row_value,
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

      setMainDataResult6((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        let attdatnumArray: any = [];
        let filesArray: any = [];

        rows.map((item: any) => {
          attdatnumArray.push(item.attdatnum);
          filesArray.push(item.files);
        });
        setTempAttach((prev) => ({
          ...prev,
          attdatnumList6: attdatnumArray,
          filesList6: filesArray,
        }));
        setSelectedState6({ [rows[0][DATA_ITEM_KEY6]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters7((prev) => ({
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
  const fetchMainGrid8 = async (filters8: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A1000W_Q",
      pageNumber: filters8.pgNum,
      pageSize: filters8.pgSize,
      parameters: {
        "@p_work_type": filters8.workType,
        "@p_orgdiv": filters8.orgdiv,
        "@p_location": filters8.location,
        "@p_dptcd": filters8.dptcd,
        "@p_prsnnum": filters8.prsnnum,
        "@p_prsnnm": filters8.prsnnm,
        "@p_rtrchk": filters8.rtrchk,
        "@p_find_row_value": filters8.find_row_value,
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

      setMainDataResult7((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        let attdatnumArray: any = [];
        let filesArray: any = [];

        rows.map((item: any) => {
          attdatnumArray.push(item.attdatnum);
          filesArray.push(item.files);
        });
        setTempAttach((prev) => ({
          ...prev,
          attdatnumList7: attdatnumArray,
          filesList7: filesArray,
        }));
        setSelectedState7({ [rows[0][DATA_ITEM_KEY7]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters8((prev) => ({
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
  const fetchMainGrid9 = async (filters9: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A1000W_Q",
      pageNumber: filters9.pgNum,
      pageSize: filters9.pgSize,
      parameters: {
        "@p_work_type": filters9.workType,
        "@p_orgdiv": filters9.orgdiv,
        "@p_location": filters9.location,
        "@p_dptcd": filters9.dptcd,
        "@p_prsnnum": filters9.prsnnum,
        "@p_prsnnm": filters9.prsnnm,
        "@p_rtrchk": filters9.rtrchk,
        "@p_find_row_value": filters9.find_row_value,
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

      setMainDataResult8((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        let attdatnumArray: any = [];
        let filesArray: any = [];

        rows.map((item: any) => {
          attdatnumArray.push(item.attdatnum);
          filesArray.push(item.files);
        });
        setTempAttach((prev) => ({
          ...prev,
          attdatnumList8: attdatnumArray,
          filesList8: filesArray,
        }));
        setSelectedState8({ [rows[0][DATA_ITEM_KEY8]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters9((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  useEffect(() => {
    if (workType == "U" && data != undefined) {
      setFilters((prev) => ({
        ...prev,
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        dptcd: "",
        prsnnum: data.prsnnum,
        prsnnm: "",
        rtrchk: "%",
        isSearch: true,
        pgNum: 1,
      }));
      setFilters2((prev) => ({
        ...prev,
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        dptcd: "",
        prsnnum: data.prsnnum,
        prsnnm: "",
        rtrchk: "%",
        isSearch: true,
        pgNum: 1,
      }));
      setFilters3((prev) => ({
        ...prev,
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        dptcd: "",
        prsnnum: data.prsnnum,
        prsnnm: "",
        rtrchk: "%",
        isSearch: true,
        pgNum: 1,
      }));
      setFilters4((prev) => ({
        ...prev,
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        dptcd: "",
        prsnnum: data.prsnnum,
        prsnnm: "",
        rtrchk: "%",
        isSearch: true,
        pgNum: 1,
      }));
      setFilters5((prev) => ({
        ...prev,
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        dptcd: "",
        prsnnum: data.prsnnum,
        prsnnm: "",
        rtrchk: "%",
        isSearch: true,
        pgNum: 1,
      }));
      setFilters6((prev) => ({
        ...prev,
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        dptcd: "",
        prsnnum: data.prsnnum,
        prsnnm: "",
        rtrchk: "%",
        isSearch: true,
        pgNum: 1,
      }));
      setFilters7((prev) => ({
        ...prev,
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        dptcd: "",
        prsnnum: data.prsnnum,
        prsnnm: "",
        rtrchk: "%",
        isSearch: true,
        pgNum: 1,
      }));
      setFilters8((prev) => ({
        ...prev,
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        dptcd: "",
        prsnnum: data.prsnnum,
        prsnnm: "",
        rtrchk: "%",
        isSearch: true,
        pgNum: 1,
      }));
      setFilters9((prev) => ({
        ...prev,
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        dptcd: "",
        prsnnum: data.prsnnum,
        prsnnm: "",
        rtrchk: "%",
        isSearch: true,
        pgNum: 1,
      }));
    }
  }, []);

  const selectData = (selectedData: any) => {
    if (tabSelected == 0) {
      if (
        information.prsnnum == "" ||
        information.prsnnum2 == "" ||
        information.dptcd == "" ||
        information.prsnnm == "" ||
        information.perregnum == ""
      ) {
        alert("필수값을 채워주세요.");
      } else {
        if (isResidentRegNoValid(information.perregnum) == true) {
          const perregnum = encrypt(information.perregnum, information.salt);
          const telephon = encrypt(information.telephon, information.salt);
          const phonenum = encrypt(information.phonenum, information.salt);

          setParaData((prev) => ({
            ...prev,
            work_type: workType,
            orgdiv: sessionOrgdiv,
            prsnnum: information.prsnnum,
            prsnnum2: information.prsnnum2,
            dptcd: information.dptcd,
            nationcd: information.nationcd,
            cardcd: information.cardcd,
            path: information.path,
            prsnnm: information.prsnnm,
            abilcd: information.abilcd,
            postcd: information.postcd,
            rtrdt:
              information.rtrdt == null || information.rtrdt == ""
                ? ""
                : convertDateToStr(information.rtrdt),
            prsnnmh: information.prsnnmh,
            prsnnme: information.prsnnme,
            schcd: information.schcd,
            emptype: information.emptype,
            regcd: information.regcd,
            perregnum: perregnum,
            salt: information.salt,
            sexcd: information.sexcd,
            telephon: telephon,
            phonenum: phonenum,
            extnum: information.extnum,
            occudate:
              information.occudate == null || information.occudate == ""
                ? ""
                : convertDateToStr(information.occudate),
            birdt:
              information.birdt == null || information.birdt == ""
                ? ""
                : convertDateToStr(information.birdt),
            bircd: information.bircd,
            jobcd: information.jobcd,
            regorgdt:
              information.regorgdt == null || information.regorgdt == ""
                ? ""
                : convertDateToStr(information.regorgdt),
            mailid: information.mailid,
            workmail: information.workmail,
            firredt:
              information.firredt == null || information.firredt == ""
                ? ""
                : convertDateToStr(information.firredt),
            hmzipcode: information.hmzipcode,
            koraddr: information.koraddr,
            location: information.location,
            zipcode: information.zipcode,
            hmaddr: information.hmaddr,
            paycd: information.paycd,
            workgb: information.workgb,
            workcls: information.workcls,
            enaddr: information.enaddr,
            remark: information.remark,
            attdatnum: information.attdatnum,
          }));
        } else {
          alert("유효한 주민번호를 입력해주세요.");
        }
      }
    } else if (tabSelected == 1) {
      setParaData((prev) => ({
        ...prev,
        work_type: "DETAIL_U",
        orgdiv: sessionOrgdiv,
        prsnnum: information.prsnnum,
        payyn:
          information.payyn == true
            ? "Y"
            : information.payyn == false
            ? "N"
            : information.payyn,
        bnskind:
          information.bnskind == true
            ? "Y"
            : information.bnskind == false
            ? "N"
            : information.bnskind,
        workchk:
          information.workchk == true
            ? "Y"
            : information.workchk == false
            ? "N"
            : information.workchk,
        yrchk:
          information.yrchk == true
            ? "Y"
            : information.yrchk == false
            ? "N"
            : information.yrchk,
        hirinsuyn:
          information.hirinsuyn == true
            ? "Y"
            : information.hirinsuyn == false
            ? "N"
            : information.hirinsuyn,
        meddate:
          information.meddate == null || information.meddate == ""
            ? ""
            : convertDateToStr(information.meddate),
        anudate:
          information.anudate == null || information.anudate == ""
            ? ""
            : convertDateToStr(information.meddate),
        hirdate:
          information.hirdate == null || information.hirdate == ""
            ? ""
            : convertDateToStr(information.hirdate),
        medinsunum: information.medinsunum,
        medgrad: information.medgrad,
        pnsgrad: information.pnsgrad,
        bankcd: information.bankcd,
        bankacnt: information.bankacnt,
        bankacntuser: information.bankacntuser,
        bankdatnum: information.bankdatnum,
        exstartdt:
          information.exstartdt == null || information.exstartdt == ""
            ? ""
            : convertDateToStr(information.exstartdt),
        exenddt:
          information.exenddt == null || information.exenddt == ""
            ? ""
            : convertDateToStr(information.exenddt),
        taxcd: information.taxcd,
        dayoffdiv: information.dayoffdiv,
        rtrtype: information.rtrtype,
        exmtaxgb: information.exmtaxgb,
        houseyn: information.houseyn,
        incgb: information.incgb,
        below2kyn:
          information.below2kyn == true
            ? "Y"
            : information.below2kyn == false
            ? "N"
            : information.below2kyn,
        caltaxyn:
          information.caltaxyn == true
            ? "Y"
            : information.caltaxyn == false
            ? "N"
            : information.caltaxyn,
        yrdclyn:
          information.yrdclyn == true
            ? "Y"
            : information.yrdclyn == false
            ? "N"
            : information.yrdclyn,
        wmn:
          information.wmn == true
            ? "Y"
            : information.wmn == false
            ? "N"
            : information.wmn,
        sps:
          information.sps == true
            ? "Y"
            : information.sps == false
            ? "N"
            : information.sps,
        laboryn:
          information.laboryn == true
            ? "Y"
            : information.laboryn == false
            ? "N"
            : information.laboryn,
        dfmyn:
          information.dfmyn == true
            ? "Y"
            : information.dfmyn == false
            ? "N"
            : information.dfmyn,
        milyn:
          information.milyn == true
            ? "Y"
            : information.milyn == false
            ? "N"
            : information.milyn,
        dfmyn2:
          information.dfmyn2 == true
            ? "Y"
            : information.dfmyn2 == false
            ? "N"
            : information.dfmyn2,
        notaxe:
          information.notaxe == true
            ? "Y"
            : information.notaxe == false
            ? "N"
            : information.notaxe,
        agenum: information.agenum,
        agenum70: information.agenum70,
        sptnum: information.sptnum,
        brngchlnum: information.brngchlnum,
        dfmnum: information.dfmnum,
        childnum: information.childnum,
        fam1: information.fam1,
        fam2: information.fam2,
      }));
    } else if (tabSelected == 2) {
      setParaData((prev) => ({
        ...prev,
        work_type: "PERSON_U",
        orgdiv: sessionOrgdiv,
        prsnnum: information.prsnnum,
        height: information.height,
        weight: information.weight,
        blood: information.blood,
        color: information.color,
        leye: information.leye,
        reye: information.reye,
        hobby: information.hobby,
        hobby2: information.hobby2,
        religion: information.religion,
        marriage: information.marriage,
        marrydt:
          information.marrydt == null || information.marrydt == ""
            ? ""
            : convertDateToStr(information.marrydt),
        orgaddr: information.orgaddr,
        birthplace: information.birthplace,
        size1: information.size1,
        size2: information.size2,
        size3: information.size3,
        photodatnum:
          information.photodatnum != "" &&
          information.photodatnum != null &&
          information.photodatnum != undefined
            ? information.photodatnum.slice(0, 1) == "0" &&
              information.photodatnum.slice(1, 2) == "x"
              ? information.photodatnum.replace("0x", "")
              : information.photodatnum.replace("data:image/png;base64,", "")
            : "",
      }));
    } else if (tabSelected == 3) {
      setParaData((prev) => ({
        ...prev,
        work_type: "ARMY_U",
        orgdiv: sessionOrgdiv,
        prsnnum: information.prsnnum,
        armygb: information.armygb,
        armystartdt:
          information.armystartdt == null || information.armystartdt == ""
            ? ""
            : convertDateToStr(information.armystartdt),
        armyenddt:
          information.armyenddt == null || information.armyenddt == ""
            ? ""
            : convertDateToStr(information.armyenddt),
        armyclass: information.armyclass,
        armyexrsn: information.armyexrsn,
        armydistinctiom: information.armydistinctiom,
        armyrank: information.armyrank,
        militarynum: information.militarynum,
        armykind: information.armykind,
        armyspeciality: information.armyspeciality,
      }));
    } else if (tabSelected == 4) {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

      let valid = true;
      let valid2 = true;

      dataItem.map((item) => {
        if (
          item.fmlynm == "" ||
          item.relt == "" ||
          item.perregnum == "" ||
          item.sexcd == "" ||
          item.birdt == ""
        ) {
          valid = false;
        }

        if (isResidentRegNoValid(item.perregnum) != true) {
          valid2 = false;
        }
      });

      if (valid != true) {
        alert("필수값을 채워주세요.");
        return false;
      }
      if (valid2 != true) {
        alert("유효한 주민번호를 입력해주세요.");
        return false;
      }

      let dataArr: TdataArr = {
        rowstatus_s: [],
        hu251t_seq_s: [],
        hu251t_fmlynm_s: [],
        hu251t_relt_s: [],
        hu251t_perregnum_s: [],
        hu251t_schcd_s: [],
        hu251t_gradutype_s: [],
        hu251t_job_s: [],
        hu251t_compnm_s: [],
        hu251t_postnm_s: [],
        hu251t_birdt_s: [],
        hu251t_sexcd_s: [],
        hu251t_payyn_s: [],
        hu251t_yesyn_s: [],
        hu251t_dfmyn_s: [],
        hu251t_rmyn_s: [],
        hu251t_phoneno_s: [],
        hu251t_attdatnum_s: [],
        hu251t_remark_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          fmlynm = "",
          relt = "",
          perregnum = "",
          schcd = "",
          gradutype = "",
          job = "",
          compnm = "",
          postnm = "",
          birdt = "",
          sexcd = "",
          payyn = "",
          yesyn = "",
          dfmyn = "",
          rmyn = "",
          phoneno = "",
          attdatnum = "",
          remark = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.hu251t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu251t_fmlynm_s.push(fmlynm == undefined ? "" : fmlynm);
        dataArr.hu251t_relt_s.push(relt == undefined ? "" : relt);
        dataArr.hu251t_perregnum_s.push(
          perregnum == undefined ? "" : perregnum
        );
        dataArr.hu251t_schcd_s.push(schcd == undefined ? "" : schcd);
        dataArr.hu251t_gradutype_s.push(
          gradutype == undefined ? "" : gradutype
        );
        dataArr.hu251t_job_s.push(job == undefined ? "" : job);
        dataArr.hu251t_compnm_s.push(compnm == undefined ? "" : compnm);
        dataArr.hu251t_postnm_s.push(postnm == undefined ? "" : postnm);
        dataArr.hu251t_birdt_s.push(
          birdt == "99991231" || birdt == undefined ? "" : birdt
        );
        dataArr.hu251t_sexcd_s.push(sexcd == undefined ? "" : sexcd);
        dataArr.hu251t_payyn_s.push(
          payyn == true ? "Y" : payyn == false ? "N" : payyn
        );

        dataArr.hu251t_yesyn_s.push(
          yesyn == true ? "Y" : yesyn == false ? "N" : yesyn
        );
        dataArr.hu251t_dfmyn_s.push(dfmyn == undefined ? "" : dfmyn);
        dataArr.hu251t_rmyn_s.push(
          rmyn == true ? "Y" : rmyn == false ? "N" : rmyn
        );

        dataArr.hu251t_phoneno_s.push(phoneno == undefined ? "" : phoneno);
        dataArr.hu251t_attdatnum_s.push(
          attdatnum == undefined ? "" : attdatnum
        );
        dataArr.hu251t_remark_s.push(remark == undefined ? "" : remark);
      });

      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          fmlynm = "",
          relt = "",
          perregnum = "",
          schcd = "",
          gradutype = "",
          job = "",
          compnm = "",
          postnm = "",
          birdt = "",
          sexcd = "",
          payyn = "",
          yesyn = "",
          dfmyn = "",
          rmyn = "",
          phoneno = "",
          attdatnum = "",
          remark = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.hu251t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu251t_fmlynm_s.push(fmlynm == undefined ? "" : fmlynm);
        dataArr.hu251t_relt_s.push(relt == undefined ? "" : relt);
        dataArr.hu251t_perregnum_s.push(
          perregnum == undefined ? "" : perregnum
        );
        dataArr.hu251t_schcd_s.push(schcd == undefined ? "" : schcd);
        dataArr.hu251t_gradutype_s.push(
          gradutype == undefined ? "" : gradutype
        );
        dataArr.hu251t_job_s.push(job == undefined ? "" : job);
        dataArr.hu251t_compnm_s.push(compnm == undefined ? "" : compnm);
        dataArr.hu251t_postnm_s.push(postnm == undefined ? "" : postnm);
        dataArr.hu251t_birdt_s.push(
          birdt == "99991231" || birdt == undefined ? "" : birdt
        );
        dataArr.hu251t_sexcd_s.push(sexcd == undefined ? "" : sexcd);
        dataArr.hu251t_payyn_s.push(
          payyn == true ? "Y" : payyn == false ? "N" : payyn
        );

        dataArr.hu251t_yesyn_s.push(
          yesyn == true ? "Y" : yesyn == false ? "N" : yesyn
        );
        dataArr.hu251t_dfmyn_s.push(dfmyn == undefined ? "" : dfmyn);
        dataArr.hu251t_rmyn_s.push(
          rmyn == true ? "Y" : rmyn == false ? "N" : rmyn
        );

        dataArr.hu251t_phoneno_s.push(phoneno == undefined ? "" : phoneno);
        dataArr.hu251t_attdatnum_s.push(
          attdatnum == undefined ? "" : attdatnum
        );
        dataArr.hu251t_remark_s.push(remark == undefined ? "" : remark);
      });

      setParaData2({
        work_type: "HU251T",
        orgdiv: sessionOrgdiv,
        prsnnum: information.prsnnum,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        hu251t_seq_s: dataArr.hu251t_seq_s.join("|"),
        hu251t_fmlynm_s: dataArr.hu251t_fmlynm_s.join("|"),
        hu251t_relt_s: dataArr.hu251t_relt_s.join("|"),
        hu251t_perregnum_s: dataArr.hu251t_perregnum_s.join("|"),
        hu251t_schcd_s: dataArr.hu251t_schcd_s.join("|"),
        hu251t_gradutype_s: dataArr.hu251t_gradutype_s.join("|"),
        hu251t_job_s: dataArr.hu251t_job_s.join("|"),
        hu251t_compnm_s: dataArr.hu251t_compnm_s.join("|"),
        hu251t_postnm_s: dataArr.hu251t_postnm_s.join("|"),
        hu251t_birdt_s: dataArr.hu251t_birdt_s.join("|"),
        hu251t_sexcd_s: dataArr.hu251t_sexcd_s.join("|"),
        hu251t_payyn_s: dataArr.hu251t_payyn_s.join("|"),
        hu251t_yesyn_s: dataArr.hu251t_yesyn_s.join("|"),
        hu251t_dfmyn_s: dataArr.hu251t_dfmyn_s.join("|"),
        hu251t_rmyn_s: dataArr.hu251t_rmyn_s.join("|"),
        hu251t_phoneno_s: dataArr.hu251t_phoneno_s.join("|"),
        hu251t_attdatnum_s: dataArr.hu251t_attdatnum_s.join("|"),
        hu251t_remark_s: dataArr.hu251t_remark_s.join("|"),
      });
    } else if (tabSelected == 5) {
      const dataItem = mainDataResult2.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length == 0 && deletedMainRows2.length == 0) return false;

      let valid = true;

      dataItem.map((item) => {
        if (item.schdiv == "") {
          valid = false;
        }
      });

      if (valid != true) {
        alert("필수값을 채워주세요.");
        return false;
      }

      let dataArr: TdataArr2 = {
        hu252t_rowstatus_s: [],
        hu252t_seq_s: [],
        hu252t_schdiv_s: [],
        hu252t_startdate_s: [],
        hu252t_enddate_s: [],
        hu252t_schnm_s: [],
        hu252t_major_s: [],
        hu252t_schgrade_s: [],
        attdatnum_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          schdiv = "",
          startdate = "",
          enddate = "",
          schnm = "",
          major = "",
          schgrade = "",
          attdatnum = "",
        } = item;
        dataArr.hu252t_rowstatus_s.push(rowstatus);
        dataArr.hu252t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu252t_schdiv_s.push(schdiv == undefined ? "" : schdiv);
        dataArr.hu252t_startdate_s.push(
          startdate == "99991231" || startdate == undefined ? "" : startdate
        );
        dataArr.hu252t_enddate_s.push(
          enddate == "99991231" || enddate == undefined ? "" : enddate
        );
        dataArr.hu252t_schnm_s.push(schnm == undefined ? "" : schnm);
        dataArr.hu252t_major_s.push(major == undefined ? "" : major);
        dataArr.hu252t_schgrade_s.push(schgrade == undefined ? "" : schgrade);
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      });

      deletedMainRows2.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          schdiv = "",
          startdate = "",
          enddate = "",
          schnm = "",
          major = "",
          schgrade = "",
          attdatnum = "",
        } = item;
        dataArr.hu252t_rowstatus_s.push(rowstatus);
        dataArr.hu252t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu252t_schdiv_s.push(schdiv == undefined ? "" : schdiv);
        dataArr.hu252t_startdate_s.push(
          startdate == "99991231" || startdate == undefined ? "" : startdate
        );
        dataArr.hu252t_enddate_s.push(
          enddate == "99991231" || enddate == undefined ? "" : enddate
        );
        dataArr.hu252t_schnm_s.push(schnm == undefined ? "" : schnm);
        dataArr.hu252t_major_s.push(major == undefined ? "" : major);
        dataArr.hu252t_schgrade_s.push(schgrade == undefined ? "" : schgrade);
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      });

      setParaData3({
        work_type: "HU252T",
        orgdiv: sessionOrgdiv,
        prsnnum: information.prsnnum,
        hu252t_rowstatus_s: dataArr.hu252t_rowstatus_s.join("|"),
        hu252t_seq_s: dataArr.hu252t_seq_s.join("|"),
        hu252t_schdiv_s: dataArr.hu252t_schdiv_s.join("|"),
        hu252t_startdate_s: dataArr.hu252t_startdate_s.join("|"),
        hu252t_enddate_s: dataArr.hu252t_enddate_s.join("|"),
        hu252t_schnm_s: dataArr.hu252t_schnm_s.join("|"),
        hu252t_major_s: dataArr.hu252t_major_s.join("|"),
        hu252t_schgrade_s: dataArr.hu252t_schgrade_s.join("|"),
        attdatnum_s: dataArr.attdatnum_s.join("|"),
      });
    } else if (tabSelected == 6) {
      const dataItem = mainDataResult3.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length == 0 && deletedMainRows3.length == 0) return false;

      let dataArr: TdataArr3 = {
        hu254t_rowstatus_s: [],
        hu254t_seq_s: [],
        hu254t_qualkind_s: [],
        hu254t_qualgrad_s: [],
        hu254t_qualmach_s: [],
        hu254t_acqdt_s: [],
        hu254t_validt_s: [],
        hu254t_renewdt_s: [],
        hu254t_qualnum_s: [],
        attdatnum_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          qualkind = "",
          qualgrad = "",
          qualmach = "",
          acqdt = "",
          validt = "",
          renewdt = "",
          qualnum = "",
          attdatnum = "",
        } = item;
        dataArr.hu254t_rowstatus_s.push(rowstatus);
        dataArr.hu254t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu254t_qualkind_s.push(qualkind == undefined ? "" : qualkind);
        dataArr.hu254t_qualgrad_s.push(qualgrad == undefined ? "" : qualgrad);
        dataArr.hu254t_qualmach_s.push(qualmach == undefined ? "" : qualmach);
        dataArr.hu254t_acqdt_s.push(
          acqdt == "99991231" || acqdt == undefined ? "" : acqdt
        );
        dataArr.hu254t_validt_s.push(
          validt == "99991231" || validt == undefined ? "" : validt
        );
        dataArr.hu254t_renewdt_s.push(
          renewdt == "99991231" || renewdt == undefined ? "" : renewdt
        );
        dataArr.hu254t_qualnum_s.push(qualnum == undefined ? "" : qualnum);
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      });

      deletedMainRows3.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          qualkind = "",
          qualgrad = "",
          qualmach = "",
          acqdt = "",
          validt = "",
          renewdt = "",
          qualnum = "",
          attdatnum = "",
        } = item;
        dataArr.hu254t_rowstatus_s.push(rowstatus);
        dataArr.hu254t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu254t_qualkind_s.push(qualkind == undefined ? "" : qualkind);
        dataArr.hu254t_qualgrad_s.push(qualgrad == undefined ? "" : qualgrad);
        dataArr.hu254t_qualmach_s.push(qualmach == undefined ? "" : qualmach);
        dataArr.hu254t_acqdt_s.push(
          acqdt == "99991231" || acqdt == undefined ? "" : acqdt
        );
        dataArr.hu254t_validt_s.push(
          validt == "99991231" || validt == undefined ? "" : validt
        );
        dataArr.hu254t_renewdt_s.push(
          renewdt == "99991231" || renewdt == undefined ? "" : renewdt
        );
        dataArr.hu254t_qualnum_s.push(qualnum == undefined ? "" : qualnum);
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      });

      setParaData4({
        work_type: "HU254T",
        orgdiv: sessionOrgdiv,
        prsnnum: information.prsnnum,
        hu254t_rowstatus_s: dataArr.hu254t_rowstatus_s.join("|"),
        hu254t_seq_s: dataArr.hu254t_seq_s.join("|"),
        hu254t_qualkind_s: dataArr.hu254t_qualkind_s.join("|"),
        hu254t_qualgrad_s: dataArr.hu254t_qualgrad_s.join("|"),
        hu254t_qualmach_s: dataArr.hu254t_qualmach_s.join("|"),
        hu254t_acqdt_s: dataArr.hu254t_acqdt_s.join("|"),
        hu254t_validt_s: dataArr.hu254t_validt_s.join("|"),
        hu254t_renewdt_s: dataArr.hu254t_renewdt_s.join("|"),
        hu254t_qualnum_s: dataArr.hu254t_qualnum_s.join("|"),
        attdatnum_s: dataArr.attdatnum_s.join("|"),
      });
    } else if (tabSelected == 7) {
      const dataItem = mainDataResult4.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length == 0 && deletedMainRows4.length == 0) return false;

      let valid = true;

      dataItem.map((item) => {
        if (item.compnm == "") {
          valid = false;
        }
      });

      if (valid != true) {
        alert("필수값을 채워주세요.");
        return false;
      }

      let dataArr: TdataArr4 = {
        hu253t_rowstatus_s: [],
        hu253t_seq_s: [],
        hu253t_compnm_s: [],
        hu253t_frdt_s: [],
        hu253t_todt_s: [],
        hu253t_dptnm_s: [],
        hu253t_postnm_s: [],
        hu253t_jobnm_s: [],
        hu253t_remark_s: [],
        attdatnum_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          compnm = "",
          frdt = "",
          todt = "",
          dptnm = "",
          postnm = "",
          jobnm = "",
          remark = "",
          attdatnum = "",
        } = item;
        dataArr.hu253t_rowstatus_s.push(rowstatus);
        dataArr.hu253t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu253t_compnm_s.push(compnm == undefined ? "" : compnm);
        dataArr.hu253t_frdt_s.push(
          frdt == "99991231" || frdt == undefined ? "" : frdt
        );
        dataArr.hu253t_todt_s.push(
          todt == "99991231" || todt == undefined ? "" : todt
        );
        dataArr.hu253t_dptnm_s.push(dptnm == undefined ? "" : dptnm);
        dataArr.hu253t_postnm_s.push(postnm == undefined ? "" : postnm);
        dataArr.hu253t_jobnm_s.push(jobnm == undefined ? "" : jobnm);
        dataArr.hu253t_remark_s.push(remark == undefined ? "" : remark);
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      });

      deletedMainRows4.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          compnm = "",
          frdt = "",
          todt = "",
          dptnm = "",
          postnm = "",
          jobnm = "",
          remark = "",
          attdatnum = "",
        } = item;
        dataArr.hu253t_rowstatus_s.push(rowstatus);
        dataArr.hu253t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu253t_compnm_s.push(compnm == undefined ? "" : compnm);
        dataArr.hu253t_frdt_s.push(
          frdt == "99991231" || frdt == undefined ? "" : frdt
        );
        dataArr.hu253t_todt_s.push(
          todt == "99991231" || todt == undefined ? "" : todt
        );
        dataArr.hu253t_dptnm_s.push(dptnm == undefined ? "" : dptnm);
        dataArr.hu253t_postnm_s.push(postnm == undefined ? "" : postnm);
        dataArr.hu253t_jobnm_s.push(jobnm == undefined ? "" : jobnm);
        dataArr.hu253t_remark_s.push(remark == undefined ? "" : remark);
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      });

      setParaData5({
        work_type: "HU253T",
        orgdiv: sessionOrgdiv,
        prsnnum: information.prsnnum,
        hu253t_rowstatus_s: dataArr.hu253t_rowstatus_s.join("|"),
        hu253t_seq_s: dataArr.hu253t_seq_s.join("|"),
        hu253t_compnm_s: dataArr.hu253t_compnm_s.join("|"),
        hu253t_frdt_s: dataArr.hu253t_frdt_s.join("|"),
        hu253t_todt_s: dataArr.hu253t_todt_s.join("|"),
        hu253t_dptnm_s: dataArr.hu253t_dptnm_s.join("|"),
        hu253t_postnm_s: dataArr.hu253t_postnm_s.join("|"),
        hu253t_jobnm_s: dataArr.hu253t_jobnm_s.join("|"),
        hu253t_remark_s: dataArr.hu253t_remark_s.join("|"),
        attdatnum_s: dataArr.attdatnum_s.join("|"),
      });
    } else if (tabSelected == 8) {
      const dataItem = mainDataResult5.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length == 0 && deletedMainRows5.length == 0) return false;

      let valid = true;

      dataItem.map((item) => {
        if (item.appointcd == "") {
          valid = false;
        }
      });

      if (valid != true) {
        alert("필수값을 채워주세요.");
        return false;
      }

      let dataArr: TdataArr5 = {
        hu255t_rowstatus_s: [],
        hu255t_seq_s: [],
        hu255t_appointcd_s: [],
        hu255t_appointdt_s: [],
        hu255t_appointrsn_s: [],
        hu255t_startdt_s: [],
        hu255t_enddt_s: [],
        hu255t_remark_s: [],
        hu255t_dptcd_s: [],
        attdatnum_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          appointcd = "",
          appointdt = "",
          appointrsn = "",
          startdt = "",
          enddt = "",
          remark = "",
          dptcd = "",
          attdatnum = "",
        } = item;
        dataArr.hu255t_rowstatus_s.push(rowstatus);
        dataArr.hu255t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu255t_appointcd_s.push(
          appointcd == undefined ? "" : appointcd
        );
        dataArr.hu255t_appointdt_s.push(
          appointdt == "99991231" || appointdt == undefined ? "" : appointdt
        );
        dataArr.hu255t_appointrsn_s.push(
          appointrsn == undefined ? "" : appointrsn
        );
        dataArr.hu255t_startdt_s.push(
          startdt == "99991231" || startdt == undefined ? "" : startdt
        );
        dataArr.hu255t_enddt_s.push(
          enddt == "99991231" || enddt == undefined ? "" : enddt
        );
        dataArr.hu255t_remark_s.push(remark == undefined ? "" : remark);
        dataArr.hu255t_dptcd_s.push(dptcd == undefined ? "" : dptcd);
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      });

      deletedMainRows5.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          appointcd = "",
          appointdt = "",
          appointrsn = "",
          startdt = "",
          enddt = "",
          remark = "",
          dptcd = "",
          attdatnum = "",
        } = item;
        dataArr.hu255t_rowstatus_s.push(rowstatus);
        dataArr.hu255t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu255t_appointcd_s.push(
          appointcd == undefined ? "" : appointcd
        );
        dataArr.hu255t_appointdt_s.push(
          appointdt == "99991231" || appointdt == undefined ? "" : appointdt
        );
        dataArr.hu255t_appointrsn_s.push(
          appointrsn == undefined ? "" : appointrsn
        );
        dataArr.hu255t_startdt_s.push(
          startdt == "99991231" || startdt == undefined ? "" : startdt
        );
        dataArr.hu255t_enddt_s.push(
          enddt == "99991231" || enddt == undefined ? "" : enddt
        );
        dataArr.hu255t_remark_s.push(remark == undefined ? "" : remark);
        dataArr.hu255t_dptcd_s.push(dptcd == undefined ? "" : dptcd);
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      });

      setParaData6({
        work_type: "HU255T",
        orgdiv: sessionOrgdiv,
        prsnnum: information.prsnnum,
        hu255t_rowstatus_s: dataArr.hu255t_rowstatus_s.join("|"),
        hu255t_seq_s: dataArr.hu255t_seq_s.join("|"),
        hu255t_appointcd_s: dataArr.hu255t_appointcd_s.join("|"),
        hu255t_appointdt_s: dataArr.hu255t_appointdt_s.join("|"),
        hu255t_appointrsn_s: dataArr.hu255t_appointrsn_s.join("|"),
        hu255t_startdt_s: dataArr.hu255t_startdt_s.join("|"),
        hu255t_enddt_s: dataArr.hu255t_enddt_s.join("|"),
        hu255t_remark_s: dataArr.hu255t_remark_s.join("|"),
        hu255t_dptcd_s: dataArr.hu255t_dptcd_s.join("|"),
        attdatnum_s: dataArr.attdatnum_s.join("|"),
      });
    } else if (tabSelected == 9) {
      const dataItem = mainDataResult6.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length == 0 && deletedMainRows6.length == 0) return false;

      let dataArr: TdataArr6 = {
        hu256t_rowstatus_s: [],
        hu256t_seq_s: [],
        hu256t_rnpdiv_s: [],
        hu256t_reqdt_s: [],
        hu256t_reloffice_s: [],
        hu256t_contents_s: [],
        hu256t_remark_s: [],
        attdatnum_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          rnpdiv = "",
          reqdt = "",
          reloffice = "",
          contents = "",
          remark = "",
          attdatnum = "",
        } = item;
        dataArr.hu256t_rowstatus_s.push(rowstatus);
        dataArr.hu256t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu256t_rnpdiv_s.push(rnpdiv == undefined ? "" : rnpdiv);
        dataArr.hu256t_reqdt_s.push(
          reqdt == "99991231" || reqdt == undefined ? "" : reqdt
        );
        dataArr.hu256t_reloffice_s.push(
          reloffice == undefined ? "" : reloffice
        );
        dataArr.hu256t_contents_s.push(contents == undefined ? "" : contents);
        dataArr.hu256t_remark_s.push(remark == undefined ? "" : remark);
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      });

      deletedMainRows6.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          rnpdiv = "",
          reqdt = "",
          reloffice = "",
          contents = "",
          remark = "",
          attdatnum = "",
        } = item;
        dataArr.hu256t_rowstatus_s.push(rowstatus);
        dataArr.hu256t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu256t_rnpdiv_s.push(rnpdiv == undefined ? "" : rnpdiv);
        dataArr.hu256t_reqdt_s.push(
          reqdt == "99991231" || reqdt == undefined ? "" : reqdt
        );
        dataArr.hu256t_reloffice_s.push(
          reloffice == undefined ? "" : reloffice
        );
        dataArr.hu256t_contents_s.push(contents == undefined ? "" : contents);
        dataArr.hu256t_remark_s.push(remark == undefined ? "" : remark);
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      });

      setParaData7({
        work_type: "HU256T",
        orgdiv: sessionOrgdiv,
        prsnnum: information.prsnnum,
        hu256t_rowstatus_s: dataArr.hu256t_rowstatus_s.join("|"),
        hu256t_seq_s: dataArr.hu256t_seq_s.join("|"),
        hu256t_rnpdiv_s: dataArr.hu256t_rnpdiv_s.join("|"),
        hu256t_reqdt_s: dataArr.hu256t_reqdt_s.join("|"),
        hu256t_reloffice_s: dataArr.hu256t_reloffice_s.join("|"),
        hu256t_contents_s: dataArr.hu256t_contents_s.join("|"),
        hu256t_remark_s: dataArr.hu256t_remark_s.join("|"),
        attdatnum_s: dataArr.attdatnum_s.join("|"),
      });
    } else if (tabSelected == 10) {
      const dataItem = mainDataResult7.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length == 0 && deletedMainRows7.length == 0) return false;

      let dataArr: TdataArr7 = {
        hu257t_rowstatus_s: [],
        hu257t_seq_s: [],
        hu257t_startdt_s: [],
        hu257t_enddt_s: [],
        hu257t_eduterm_s: [],
        hu257t_edutime_s: [],
        hu257t_edunm_s: [],
        hu257t_contents_s: [],
        hu257t_edueval_s: [],
        hu257t_eduoffice_s: [],
        attdatnum_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          startdt = "",
          enddt = "",
          eduterm = "",
          edutime = "",
          edunm = "",
          contents = "",
          edueval = "",
          eduoffice = "",
          attdatnum = "",
        } = item;
        dataArr.hu257t_rowstatus_s.push(rowstatus);
        dataArr.hu257t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu257t_startdt_s.push(
          startdt == "99991231" || startdt == undefined ? "" : startdt
        );
        dataArr.hu257t_enddt_s.push(
          enddt == "99991231" || enddt == undefined ? "" : enddt
        );
        dataArr.hu257t_eduterm_s.push(eduterm == undefined ? "" : eduterm);
        dataArr.hu257t_edutime_s.push(edutime == undefined ? "" : edutime);
        dataArr.hu257t_edunm_s.push(edunm == undefined ? "" : edunm);
        dataArr.hu257t_contents_s.push(contents == undefined ? "" : contents);
        dataArr.hu257t_edueval_s.push(edueval == undefined ? "" : edueval);
        dataArr.hu257t_eduoffice_s.push(
          eduoffice == undefined ? "" : eduoffice
        );
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      });

      deletedMainRows7.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          startdt = "",
          enddt = "",
          eduterm = "",
          edutime = "",
          edunm = "",
          contents = "",
          edueval = "",
          eduoffice = "",
          attdatnum = "",
        } = item;
        dataArr.hu257t_rowstatus_s.push(rowstatus);
        dataArr.hu257t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu257t_startdt_s.push(
          startdt == "99991231" || startdt == undefined ? "" : startdt
        );
        dataArr.hu257t_enddt_s.push(
          enddt == "99991231" || enddt == undefined ? "" : enddt
        );
        dataArr.hu257t_eduterm_s.push(eduterm == undefined ? "" : eduterm);
        dataArr.hu257t_edutime_s.push(edutime == undefined ? "" : edutime);
        dataArr.hu257t_edunm_s.push(edunm == undefined ? "" : edunm);
        dataArr.hu257t_contents_s.push(contents == undefined ? "" : contents);
        dataArr.hu257t_edueval_s.push(edueval == undefined ? "" : edueval);
        dataArr.hu257t_eduoffice_s.push(
          eduoffice == undefined ? "" : eduoffice
        );
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      });

      setParaData8({
        work_type: "HU257T",
        orgdiv: sessionOrgdiv,
        prsnnum: information.prsnnum,
        hu257t_rowstatus_s: dataArr.hu257t_rowstatus_s.join("|"),
        hu257t_seq_s: dataArr.hu257t_seq_s.join("|"),
        hu257t_startdt_s: dataArr.hu257t_startdt_s.join("|"),
        hu257t_enddt_s: dataArr.hu257t_enddt_s.join("|"),
        hu257t_eduterm_s: dataArr.hu257t_eduterm_s.join("|"),
        hu257t_edutime_s: dataArr.hu257t_edutime_s.join("|"),
        hu257t_edunm_s: dataArr.hu257t_edunm_s.join("|"),
        hu257t_contents_s: dataArr.hu257t_contents_s.join("|"),
        hu257t_edueval_s: dataArr.hu257t_edueval_s.join("|"),
        hu257t_eduoffice_s: dataArr.hu257t_eduoffice_s.join("|"),
        attdatnum_s: dataArr.attdatnum_s.join("|"),
      });
    } else if (tabSelected == 11) {
      const dataItem = mainDataResult8.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length == 0 && deletedMainRows8.length == 0) return false;

      let valid = true;

      dataItem.map((item) => {
        if (item.educd == "") {
          valid = false;
        }
      });

      if (valid != true) {
        alert("필수값을 채워주세요.");
        return false;
      }

      let dataArr: TdataArr8 = {
        hu258t_rowstatus_s: [],
        hu258t_seq_s: [],
        hu258t_educd_s: [],
        hu258t_testnm_s: [],
        hu258t_score_s: [],
        hu258t_testdt_s: [],
        hu258t_speaking_s: [],
        hu258t_country_s: [],
        hu258t_startdt_s: [],
        hu258t_enddt_s: [],
        attdatnum_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          educd = "",
          testnm = "",
          score = "",
          testdt = "",
          speaking = "",
          country = "",
          startdt = "",
          enddt = "",
          attdatnum = "",
        } = item;
        dataArr.hu258t_rowstatus_s.push(rowstatus);
        dataArr.hu258t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu258t_educd_s.push(educd == undefined ? "" : educd);
        dataArr.hu258t_testnm_s.push(testnm == undefined ? "" : testnm);
        dataArr.hu258t_score_s.push(score == undefined ? "" : score);
        dataArr.hu258t_testdt_s.push(
          testdt == "99991231" || testdt == undefined ? "" : testdt
        );
        dataArr.hu258t_speaking_s.push(speaking == undefined ? "" : speaking);
        dataArr.hu258t_country_s.push(country == undefined ? "" : country);
        dataArr.hu258t_startdt_s.push(
          startdt == "99991231" || startdt == undefined ? "" : startdt
        );
        dataArr.hu258t_enddt_s.push(
          enddt == "99991231" || enddt == undefined ? "" : enddt
        );
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      });

      deletedMainRows8.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          educd = "",
          testnm = "",
          score = "",
          testdt = "",
          speaking = "",
          country = "",
          startdt = "",
          enddt = "",
          attdatnum = "",
        } = item;
        dataArr.hu258t_rowstatus_s.push(rowstatus);
        dataArr.hu258t_seq_s.push(seq == undefined ? 0 : seq);
        dataArr.hu258t_educd_s.push(educd == undefined ? "" : educd);
        dataArr.hu258t_testnm_s.push(testnm == undefined ? "" : testnm);
        dataArr.hu258t_score_s.push(score == undefined ? "" : score);
        dataArr.hu258t_testdt_s.push(
          testdt == "99991231" || testdt == undefined ? "" : testdt
        );
        dataArr.hu258t_speaking_s.push(speaking == undefined ? "" : speaking);
        dataArr.hu258t_country_s.push(country == undefined ? "" : country);
        dataArr.hu258t_startdt_s.push(
          startdt == "99991231" || startdt == undefined ? "" : startdt
        );
        dataArr.hu258t_enddt_s.push(
          enddt == "99991231" || enddt == undefined ? "" : enddt
        );
        dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
      });

      setParaData9({
        work_type: "HU258T",
        orgdiv: sessionOrgdiv,
        prsnnum: information.prsnnum,
        hu258t_rowstatus_s: dataArr.hu258t_rowstatus_s.join("|"),
        hu258t_seq_s: dataArr.hu258t_seq_s.join("|"),
        hu258t_educd_s: dataArr.hu258t_educd_s.join("|"),
        hu258t_testnm_s: dataArr.hu258t_testnm_s.join("|"),
        hu258t_score_s: dataArr.hu258t_score_s.join("|"),
        hu258t_testdt_s: dataArr.hu258t_testdt_s.join("|"),
        hu258t_speaking_s: dataArr.hu258t_speaking_s.join("|"),
        hu258t_country_s: dataArr.hu258t_country_s.join("|"),
        hu258t_startdt_s: dataArr.hu258t_startdt_s.join("|"),
        hu258t_enddt_s: dataArr.hu258t_enddt_s.join("|"),
        attdatnum_s: dataArr.attdatnum_s.join("|"),
      });
    }
  };

  const [ParaData, setParaData] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    prsnnum: "",
    prsnnum2: "",
    location: sessionLocation,
    position: "",
    workplace: "",
    prsnnm: "",
    prsnnmh: "",
    prsnnme: "",
    nationcd: "",
    cardcd: "",
    dptcd: "",
    dptnm: "",
    postcd: "",
    ocptcd: "",
    workgb: "",
    workcls: "",
    jobcd: "",
    abilcd: "",
    paygrad: "",
    salaryclass: "",
    regcd: "",
    perregnum: "",
    salt: "",
    birdt: "",
    bircd: "",
    sexcd: "",
    firredt: "",
    regorgdt: "",
    rtrdt: "",
    rtrrsn: "",
    emptype: "",
    zipcode: "",
    koraddr: "",
    hmzipcode: "",
    hmaddr: "",
    enaddr: "",
    telephon: "",
    phonenum: "",
    extnum: "",
    outnum: "",
    schcd: "",
    laboryn: "N",
    dfmyn: "N",
    milyn: "N",
    paycd: "",
    taxcd: "",
    hirinsuyn: "N",
    payyn: "N",
    caltaxyn: "N",
    yrdclyn: "N",
    bankcd: "",
    bankacnt: "",
    bankacntuser: "",
    bankdatnum: "",
    medgrad: "",
    medinsunum: "",
    pnsgrad: "",
    meddate: "",
    anudate: "",
    hirdate: "",
    sps: "N",
    wmn: "N",
    sptnum: 0,
    dfmnum: 0,
    agenum: 0,
    agenum70: 0,
    brngchlnum: 0,
    fam1: 0,
    fam2: 0,
    notaxe: "N",
    bnskind: "N",
    mailid: "",
    workmail: "",
    childnum: 0,
    dfmyn2: "N",
    houseyn: "",
    remark: "",
    path: "",
    attdatnum: "",
    incgb: "",
    exmtaxgb: "",
    exstartdt: "",
    exenddt: "",
    dayoffdiv: "",
    rtrtype: "",

    workchk: "N",
    yrchk: "N",

    //개인정보
    height: 0,
    weight: 0,
    blood: "",
    color: "",
    leye: 0,
    reye: 0,
    hobby: "",
    hobby2: "",
    religion: "",
    marriage: "",
    marrydt: "",
    orgaddr: "",
    birthplace: "",
    size1: "",
    size2: "",
    size3: "",
    photodatnum: "",

    armygb: "",
    armystartdt: "",
    armyenddt: "",
    armyclass: "",
    armyexrsn: "",
    armydistinctiom: "",
    armyrank: "",
    militarynum: "",
    armykind: "",
    armyspeciality: "",

    below2kyn: "N",
    occudate: "",
  });

  const [ParaData2, setParaData2] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    prsnnum: "",
    rowstatus_s: "",
    hu251t_seq_s: "",
    hu251t_fmlynm_s: "",
    hu251t_relt_s: "",
    hu251t_perregnum_s: "",
    hu251t_schcd_s: "",
    hu251t_gradutype_s: "",
    hu251t_job_s: "",
    hu251t_compnm_s: "",
    hu251t_postnm_s: "",
    hu251t_birdt_s: "",
    hu251t_sexcd_s: "",
    hu251t_payyn_s: "",
    hu251t_yesyn_s: "",
    hu251t_dfmyn_s: "",
    hu251t_rmyn_s: "",
    hu251t_phoneno_s: "",
    hu251t_attdatnum_s: "",
    hu251t_remark_s: "",
  });

  const [ParaData3, setParaData3] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    prsnnum: "",
    hu252t_rowstatus_s: "",
    hu252t_seq_s: "",
    hu252t_schdiv_s: "",
    hu252t_startdate_s: "",
    hu252t_enddate_s: "",
    hu252t_schnm_s: "",
    hu252t_major_s: "",
    hu252t_schgrade_s: "",
    attdatnum_s: "",
  });

  const [ParaData4, setParaData4] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    prsnnum: "",
    hu254t_rowstatus_s: "",
    hu254t_seq_s: "",
    hu254t_qualkind_s: "",
    hu254t_qualgrad_s: "",
    hu254t_qualmach_s: "",
    hu254t_acqdt_s: "",
    hu254t_validt_s: "",
    hu254t_renewdt_s: "",
    hu254t_qualnum_s: "",
    attdatnum_s: "",
  });

  const [ParaData5, setParaData5] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    prsnnum: "",
    hu253t_rowstatus_s: "",
    hu253t_seq_s: "",
    hu253t_compnm_s: "",
    hu253t_frdt_s: "",
    hu253t_todt_s: "",
    hu253t_dptnm_s: "",
    hu253t_postnm_s: "",
    hu253t_jobnm_s: "",
    hu253t_remark_s: "",
    attdatnum_s: "",
  });

  const [ParaData6, setParaData6] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    prsnnum: "",
    hu255t_rowstatus_s: "",
    hu255t_seq_s: "",
    hu255t_appointcd_s: "",
    hu255t_appointdt_s: "",
    hu255t_appointrsn_s: "",
    hu255t_startdt_s: "",
    hu255t_enddt_s: "",
    hu255t_remark_s: "",
    hu255t_dptcd_s: "",
    attdatnum_s: "",
  });

  const [ParaData7, setParaData7] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    prsnnum: "",
    hu256t_rowstatus_s: "",
    hu256t_seq_s: "",
    hu256t_rnpdiv_s: "",
    hu256t_reqdt_s: "",
    hu256t_reloffice_s: "",
    hu256t_contents_s: "",
    hu256t_remark_s: "",
    attdatnum_s: "",
  });

  const [ParaData8, setParaData8] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    prsnnum: "",
    hu257t_rowstatus_s: "",
    hu257t_seq_s: "",
    hu257t_startdt_s: "",
    hu257t_enddt_s: "",
    hu257t_eduterm_s: "",
    hu257t_edutime_s: "",
    hu257t_edunm_s: "",
    hu257t_contents_s: "",
    hu257t_edueval_s: "",
    hu257t_eduoffice_s: "",
    attdatnum_s: "",
  });

  const [ParaData9, setParaData9] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    prsnnum: "",
    hu258t_rowstatus_s: "",
    hu258t_seq_s: "",
    hu258t_educd_s: "",
    hu258t_testnm_s: "",
    hu258t_score_s: "",
    hu258t_testdt_s: "",
    hu258t_speaking_s: "",
    hu258t_country_s: "",
    hu258t_startdt_s: "",
    hu258t_enddt_s: "",
    attdatnum_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.work_type,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_prsnnum": ParaData.prsnnum,
      "@p_prsnnum2": ParaData.prsnnum2,
      "@p_location": ParaData.location,
      "@p_position": ParaData.position,
      "@p_workplace": ParaData.workplace,
      "@p_prsnnm": ParaData.prsnnm,
      "@p_prsnnmh": ParaData.prsnnmh,
      "@p_prsnnme": ParaData.prsnnme,
      "@p_nationcd": ParaData.nationcd,
      "@p_cardcd": ParaData.cardcd,
      "@p_dptcd": ParaData.dptcd,
      "@p_dptnm": ParaData.dptnm,
      "@p_postcd": ParaData.postcd,
      "@p_ocptcd": ParaData.ocptcd,
      "@p_workgb": ParaData.workgb,
      "@p_workcls": ParaData.workcls,
      "@p_jobcd": ParaData.jobcd,
      "@p_abilcd": ParaData.abilcd,
      "@p_paygrad": ParaData.paygrad,
      "@p_salaryclass": ParaData.salaryclass,
      "@p_regcd": ParaData.regcd,
      "@p_perregnum": ParaData.perregnum,
      "@p_salt": ParaData.salt,
      "@p_birdt": ParaData.birdt,
      "@p_bircd": ParaData.bircd,
      "@p_sexcd": ParaData.sexcd,
      "@p_firredt": ParaData.firredt,
      "@p_regorgdt": ParaData.regorgdt,
      "@p_rtrdt": ParaData.rtrdt,
      "@p_rtrrsn": ParaData.rtrrsn,
      "@p_emptype": ParaData.emptype,
      "@p_zipcode": ParaData.zipcode,
      "@p_koraddr": ParaData.koraddr,
      "@p_hmzipcode": ParaData.hmzipcode,
      "@p_hmaddr": ParaData.hmaddr,
      "@p_enaddr": ParaData.enaddr,
      "@p_telephon": ParaData.telephon,
      "@p_phonenum": ParaData.phonenum,
      "@p_extnum": ParaData.extnum,
      "@p_outnum": ParaData.outnum,
      "@p_schcd": ParaData.schcd,
      "@p_laboryn": ParaData.laboryn,
      "@p_dfmyn": ParaData.dfmyn,
      "@p_milyn": ParaData.milyn,
      "@p_paycd": ParaData.paycd,
      "@p_taxcd": ParaData.taxcd,
      "@p_hirinsuyn": ParaData.hirinsuyn,
      "@p_payyn": ParaData.payyn,
      "@p_caltaxyn": ParaData.caltaxyn,
      "@p_yrdclyn": ParaData.yrdclyn,
      "@p_bankcd": ParaData.bankcd,
      "@p_bankacnt": ParaData.bankacnt,
      "@p_bankacntuser": ParaData.bankacntuser,
      "@p_bankdatnum": ParaData.bankdatnum,
      "@p_medgrad": ParaData.medgrad,
      "@p_medinsunum": ParaData.medinsunum,
      "@p_pnsgrad": ParaData.pnsgrad,
      "@p_meddate": ParaData.meddate,
      "@p_anudate": ParaData.anudate,
      "@p_hirdate": ParaData.hirdate,
      "@p_sps": ParaData.sps,
      "@p_wmn": ParaData.wmn,
      "@p_sptnum": ParaData.sptnum,
      "@p_dfmnum": ParaData.dfmnum,
      "@p_agenum": ParaData.agenum,
      "@p_agenum70": ParaData.agenum70,
      "@p_brngchlnum": ParaData.brngchlnum,
      "@p_fam1": ParaData.fam1,
      "@p_fam2": ParaData.fam2,
      "@p_notaxe": ParaData.notaxe,
      "@p_bnskind": ParaData.bnskind,
      "@p_mailid": ParaData.mailid,
      "@p_workmail": ParaData.workmail,
      "@p_childnum": ParaData.childnum,
      "@p_dfmyn2": ParaData.dfmyn2,
      "@p_houseyn": ParaData.houseyn,
      "@p_remark": ParaData.remark,
      "@p_path": ParaData.path,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_incgb": ParaData.incgb,
      "@p_exmtaxgb": ParaData.exmtaxgb,
      "@p_exstartdt": ParaData.exstartdt,
      "@p_exenddt": ParaData.exenddt,
      "@p_dayoffdiv": ParaData.dayoffdiv,
      "@p_rtrtype": ParaData.rtrtype,

      "@p_userid": userId,
      "@p_pc": pc,

      "@p_workchk": ParaData.workchk,
      "@p_yrchk": ParaData.yrchk,

      //개인정보
      "@p_height": ParaData.height,
      "@p_weight": ParaData.weight,
      "@p_blood": ParaData.blood,
      "@p_color": ParaData.color,
      "@p_leye": ParaData.leye,
      "@p_reye": ParaData.reye,
      "@p_hobby": ParaData.hobby,
      "@p_hobby2": ParaData.hobby2,
      "@p_religion": ParaData.religion,
      "@p_marriage": ParaData.marriage,
      "@p_marrydt": ParaData.marrydt,
      "@p_orgaddr": ParaData.orgaddr,
      "@p_birthplace": ParaData.birthplace,
      "@p_size1": ParaData.size1,
      "@p_size2": ParaData.size2,
      "@p_size3": ParaData.size3,
      "@p_photodatnum": ParaData.photodatnum,

      "@p_armygb": ParaData.armygb,
      "@p_armystartdt": ParaData.armystartdt,
      "@p_armyenddt": ParaData.armyenddt,
      "@p_armyclass": ParaData.armyclass,
      "@p_armyexrsn": ParaData.armyexrsn,
      "@p_armydistinctiom": ParaData.armydistinctiom,
      "@p_armyrank": ParaData.armyrank,
      "@p_militarynum": ParaData.militarynum,
      "@p_armykind": ParaData.armykind,
      "@p_armyspeciality": ParaData.armyspeciality,

      "@p_below2kyn": ParaData.below2kyn,
      "@p_occudate": ParaData.occudate,

      "@p_form_id": "HU_A1000W",
    },
  };

  const para2: Iparameters = {
    procedureName: "P_HU_A1000W_FAM_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData2.work_type,
      "@p_orgdiv": ParaData2.orgdiv,
      "@p_rowstatus_s": ParaData2.rowstatus_s,
      "@p_prsnnum": ParaData2.prsnnum,
      "@p_hu251t_seq_s": ParaData2.hu251t_seq_s,
      "@p_hu251t_fmlynm_s": ParaData2.hu251t_fmlynm_s,
      "@p_hu251t_relt_s": ParaData2.hu251t_relt_s,
      "@p_hu251t_perregnum_s": ParaData2.hu251t_perregnum_s,
      "@p_hu251t_schcd_s": ParaData2.hu251t_schcd_s,
      "@p_hu251t_gradutype_s": ParaData2.hu251t_gradutype_s,
      "@p_hu251t_job_s": ParaData2.hu251t_job_s,
      "@p_hu251t_compnm_s": ParaData2.hu251t_compnm_s,
      "@p_hu251t_postnm_s": ParaData2.hu251t_postnm_s,
      "@p_hu251t_birdt_s": ParaData2.hu251t_birdt_s,
      "@p_hu251t_sexcd_s": ParaData2.hu251t_sexcd_s,
      "@p_hu251t_payyn_s": ParaData2.hu251t_payyn_s,
      "@p_hu251t_yesyn_s": ParaData2.hu251t_yesyn_s,
      "@p_hu251t_dfmyn_s": ParaData2.hu251t_dfmyn_s,
      "@p_hu251t_rmyn_s": ParaData2.hu251t_rmyn_s,
      "@p_hu251t_phoneno_s": ParaData2.hu251t_phoneno_s,
      "@p_hu251t_attdatnum_s": ParaData2.hu251t_attdatnum_s,
      "@p_hu251t_remark_s": ParaData2.hu251t_remark_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A1000W",
    },
  };

  const para3: Iparameters = {
    procedureName: "P_HU_A1000W_EDU_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData3.work_type,
      "@p_orgdiv": ParaData3.orgdiv,
      "@p_hu252t_rowstatus_s": ParaData3.hu252t_rowstatus_s,
      "@p_prsnnum": ParaData3.prsnnum,
      "@p_hu252t_seq_s": ParaData3.hu252t_seq_s,
      "@p_hu252t_schdiv_s": ParaData3.hu252t_schdiv_s,
      "@p_hu252t_startdate_s": ParaData3.hu252t_startdate_s,
      "@p_hu252t_enddate_s": ParaData3.hu252t_enddate_s,
      "@p_hu252t_schnm_s": ParaData3.hu252t_schnm_s,
      "@p_hu252t_major_s": ParaData3.hu252t_major_s,
      "@p_hu252t_schgrade_s": ParaData3.hu252t_schgrade_s,
      "@p_attdatnum_s": ParaData3.attdatnum_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A1000W",
    },
  };

  const para4: Iparameters = {
    procedureName: "P_HU_A1000W_QUA_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData4.work_type,
      "@p_orgdiv": ParaData4.orgdiv,
      "@p_hu254t_rowstatus_s": ParaData4.hu254t_rowstatus_s,
      "@p_prsnnum": ParaData4.prsnnum,
      "@p_hu254t_seq_s": ParaData4.hu254t_seq_s,
      "@p_hu254t_qualkind_s": ParaData4.hu254t_qualkind_s,
      "@p_hu254t_qualgrad_s": ParaData4.hu254t_qualgrad_s,
      "@p_hu254t_qualmach_s": ParaData4.hu254t_qualmach_s,
      "@p_hu254t_acqdt_s": ParaData4.hu254t_acqdt_s,
      "@p_hu254t_validt_s": ParaData4.hu254t_validt_s,
      "@p_hu254t_renewdt_s": ParaData4.hu254t_renewdt_s,
      "@p_hu254t_qualnum_s": ParaData4.hu254t_qualnum_s,
      "@p_attdatnum_s": ParaData4.attdatnum_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A1000W",
    },
  };

  const para5: Iparameters = {
    procedureName: "P_HU_A1000W_CAR_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData5.work_type,
      "@p_orgdiv": ParaData5.orgdiv,
      "@p_hu253t_rowstatus_s": ParaData5.hu253t_rowstatus_s,
      "@p_prsnnum": ParaData5.prsnnum,
      "@p_hu253t_seq_s": ParaData5.hu253t_seq_s,
      "@p_hu253t_compnm_s": ParaData5.hu253t_compnm_s,
      "@p_hu253t_frdt_s": ParaData5.hu253t_frdt_s,
      "@p_hu253t_todt_s": ParaData5.hu253t_todt_s,
      "@p_hu253t_dptnm_s": ParaData5.hu253t_dptnm_s,
      "@p_hu253t_postnm_s": ParaData5.hu253t_postnm_s,
      "@p_hu253t_jobnm_s": ParaData5.hu253t_jobnm_s,
      "@p_hu253t_remark_s": ParaData5.hu253t_remark_s,
      "@p_attdatnum_s": ParaData5.attdatnum_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A1000W",
    },
  };

  const para6: Iparameters = {
    procedureName: "P_HU_A1000W_APP_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData6.work_type,
      "@p_orgdiv": ParaData6.orgdiv,
      "@p_hu255t_rowstatus_s": ParaData6.hu255t_rowstatus_s,
      "@p_prsnnum": ParaData6.prsnnum,
      "@p_hu255t_seq_s": ParaData6.hu255t_seq_s,
      "@p_hu255t_appointcd_s": ParaData6.hu255t_appointcd_s,
      "@p_hu255t_appointdt_s": ParaData6.hu255t_appointdt_s,
      "@p_hu255t_appointrsn_s": ParaData6.hu255t_appointrsn_s,
      "@p_hu255t_startdt_s": ParaData6.hu255t_startdt_s,
      "@p_hu255t_enddt_s": ParaData6.hu255t_enddt_s,
      "@p_hu255t_remark_s": ParaData6.hu255t_remark_s,
      "@p_hu255t_dptcd_s": ParaData6.hu255t_dptcd_s,
      "@p_attdatnum_s": ParaData6.attdatnum_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A1000W",
    },
  };

  const para7: Iparameters = {
    procedureName: "P_HU_A1000W_RNP_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData7.work_type,
      "@p_orgdiv": ParaData7.orgdiv,
      "@p_hu256t_rowstatus_s": ParaData7.hu256t_rowstatus_s,
      "@p_prsnnum": ParaData7.prsnnum,
      "@p_hu256t_seq_s": ParaData7.hu256t_seq_s,
      "@p_hu256t_rnpdiv_s": ParaData7.hu256t_rnpdiv_s,
      "@p_hu256t_reqdt_s": ParaData7.hu256t_reqdt_s,
      "@p_hu256t_reloffice_s": ParaData7.hu256t_reloffice_s,
      "@p_hu256t_contents_s": ParaData7.hu256t_contents_s,
      "@p_hu256t_remark_s": ParaData7.hu256t_remark_s,
      "@p_attdatnum_s": ParaData7.attdatnum_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A1000W",
    },
  };

  const para8: Iparameters = {
    procedureName: "P_HU_A1000W_TRA_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData8.work_type,
      "@p_orgdiv": ParaData8.orgdiv,
      "@p_hu257t_rowstatus_s": ParaData8.hu257t_rowstatus_s,
      "@p_prsnnum": ParaData8.prsnnum,
      "@p_hu257t_seq_s": ParaData8.hu257t_seq_s,
      "@p_hu257t_startdt_s": ParaData8.hu257t_startdt_s,
      "@p_hu257t_enddt_s": ParaData8.hu257t_enddt_s,
      "@p_hu257t_eduterm_s": ParaData8.hu257t_eduterm_s,
      "@p_hu257t_edutime_s": ParaData8.hu257t_edutime_s,
      "@p_hu257t_edunm_s": ParaData8.hu257t_edunm_s,
      "@p_hu257t_contents_s": ParaData8.hu257t_contents_s,
      "@p_hu257t_edueval_s": ParaData8.hu257t_edueval_s,
      "@p_hu257t_eduoffice_s": ParaData8.hu257t_eduoffice_s,
      "@p_attdatnum_s": ParaData8.attdatnum_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A1000W",
    },
  };

  const para9: Iparameters = {
    procedureName: "P_HU_A1000W_LAN_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData9.work_type,
      "@p_orgdiv": ParaData9.orgdiv,
      "@p_hu258t_rowstatus_s": ParaData9.hu258t_rowstatus_s,
      "@p_prsnnum": ParaData9.prsnnum,
      "@p_hu258t_seq_s": ParaData9.hu258t_seq_s,
      "@p_hu258t_educd_s": ParaData9.hu258t_educd_s,
      "@p_hu258t_testnm_s": ParaData9.hu258t_testnm_s,
      "@p_hu258t_score_s": ParaData9.hu258t_score_s,
      "@p_hu258t_testdt_s": ParaData9.hu258t_testdt_s,
      "@p_hu258t_speaking_s": ParaData9.hu258t_speaking_s,
      "@p_hu258t_country_s": ParaData9.hu258t_country_s,
      "@p_hu258t_startdt_s": ParaData9.hu258t_startdt_s,
      "@p_hu258t_enddt_s": ParaData9.hu258t_enddt_s,
      "@p_attdatnum_s": ParaData9.attdatnum_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A1000W",
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setUnsavedName([]);

      deletedMainRows = [];
      deletedMainRows2 = [];
      deletedMainRows3 = [];
      deletedMainRows4 = [];
      deletedMainRows5 = [];
      deletedMainRows6 = [];
      deletedMainRows7 = [];
      deletedMainRows8 = [];
      reload(data.returnString);
      if (workType == "N") {
        setVisible(false);
      } else {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
        setFilters2((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
        setFilters3((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
        setFilters4((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
        setFilters5((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
        setFilters6((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
        setFilters7((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
        setFilters8((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
        setFilters9((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
      }
      setTempAttach({
        attdatnum: "",
        files: "",
        bankdatnum: "",
        bankfiles: "",
        attdatnumList: [],
        filesList: [],
        attdatnumList2: [],
        filesList2: [],
        attdatnumList3: [],
        filesList3: [],
        attdatnumList4: [],
        filesList4: [],
        attdatnumList5: [],
        filesList5: [],
        attdatnumList6: [],
        filesList6: [],
        attdatnumList7: [],
        filesList7: [],
        attdatnumList8: [],
        filesList8: [],
      });
      setParaData({
        work_type: "",
        orgdiv: sessionOrgdiv,
        prsnnum: "",
        prsnnum2: "",
        location: sessionLocation,
        position: "",
        workplace: "",
        prsnnm: "",
        prsnnmh: "",
        prsnnme: "",
        nationcd: "",
        cardcd: "",
        dptcd: "",
        dptnm: "",
        postcd: "",
        ocptcd: "",
        workgb: "",
        workcls: "",
        jobcd: "",
        abilcd: "",
        paygrad: "",
        salaryclass: "",
        regcd: "",
        perregnum: "",
        salt: "",
        birdt: "",
        bircd: "",
        sexcd: "",
        firredt: "",
        regorgdt: "",
        rtrdt: "",
        rtrrsn: "",
        emptype: "",
        zipcode: "",
        koraddr: "",
        hmzipcode: "",
        hmaddr: "",
        enaddr: "",
        telephon: "",
        phonenum: "",
        extnum: "",
        outnum: "",
        schcd: "",
        laboryn: "N",
        dfmyn: "N",
        milyn: "N",
        paycd: "",
        taxcd: "",
        hirinsuyn: "N",
        payyn: "N",
        caltaxyn: "N",
        yrdclyn: "N",
        bankcd: "",
        bankacnt: "",
        bankacntuser: "",
        bankdatnum: "",
        medgrad: "",
        medinsunum: "",
        pnsgrad: "",
        meddate: "",
        anudate: "",
        hirdate: "",
        sps: "N",
        wmn: "N",
        sptnum: 0,
        dfmnum: 0,
        agenum: 0,
        agenum70: 0,
        brngchlnum: 0,
        fam1: 0,
        fam2: 0,
        notaxe: "N",
        bnskind: "N",
        mailid: "",
        workmail: "",
        childnum: 0,
        dfmyn2: "N",
        houseyn: "",
        remark: "",
        path: "",
        attdatnum: "",
        incgb: "",
        exmtaxgb: "",
        exstartdt: "",
        exenddt: "",
        dayoffdiv: "",
        rtrtype: "",

        workchk: "N",
        yrchk: "N",

        //개인정보
        height: 0,
        weight: 0,
        blood: "",
        color: "",
        leye: 0,
        reye: 0,
        hobby: "",
        hobby2: "",
        religion: "",
        marriage: "",
        marrydt: "",
        orgaddr: "",
        birthplace: "",
        size1: "",
        size2: "",
        size3: "",
        photodatnum: "",

        armygb: "",
        armystartdt: "",
        armyenddt: "",
        armyclass: "",
        armyexrsn: "",
        armydistinctiom: "",
        armyrank: "",
        militarynum: "",
        armykind: "",
        armyspeciality: "",

        below2kyn: "N",
        occudate: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved2 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      let array: any[] = [];

      deletedMainRows.map((item: any) => {
        array.push(item.attdatnum);
      });

      setDeletedAttadatnums(array);

      setUnsavedName([]);
      setUnsavedAttadatnums([]);
      deletedMainRows = [];
      deletedMainRows2 = [];
      deletedMainRows3 = [];
      deletedMainRows4 = [];
      deletedMainRows5 = [];
      deletedMainRows6 = [];
      deletedMainRows7 = [];
      deletedMainRows8 = [];
      reload(data.returnString);

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters4((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters5((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters6((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters7((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters8((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters9((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setTempAttach({
        attdatnum: "",
        files: "",
        bankdatnum: "",
        bankfiles: "",
        attdatnumList: [],
        filesList: [],
        attdatnumList2: [],
        filesList2: [],
        attdatnumList3: [],
        filesList3: [],
        attdatnumList4: [],
        filesList4: [],
        attdatnumList5: [],
        filesList5: [],
        attdatnumList6: [],
        filesList6: [],
        attdatnumList7: [],
        filesList7: [],
        attdatnumList8: [],
        filesList8: [],
      });
      setParaData2({
        work_type: "",
        orgdiv: sessionOrgdiv,
        prsnnum: "",
        rowstatus_s: "",
        hu251t_seq_s: "",
        hu251t_fmlynm_s: "",
        hu251t_relt_s: "",
        hu251t_perregnum_s: "",
        hu251t_schcd_s: "",
        hu251t_gradutype_s: "",
        hu251t_job_s: "",
        hu251t_compnm_s: "",
        hu251t_postnm_s: "",
        hu251t_birdt_s: "",
        hu251t_sexcd_s: "",
        hu251t_payyn_s: "",
        hu251t_yesyn_s: "",
        hu251t_dfmyn_s: "",
        hu251t_rmyn_s: "",
        hu251t_phoneno_s: "",
        hu251t_attdatnum_s: "",
        hu251t_remark_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved3 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      let array: any[] = [];

      deletedMainRows2.map((item: any) => {
        array.push(item.attdatnum);
      });

      setDeletedAttadatnums(array);

      setUnsavedName([]);
      setUnsavedAttadatnums([]);
      deletedMainRows = [];
      deletedMainRows2 = [];
      deletedMainRows3 = [];
      deletedMainRows4 = [];
      deletedMainRows5 = [];
      deletedMainRows6 = [];
      deletedMainRows7 = [];
      deletedMainRows8 = [];
      reload(data.returnString);

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters4((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters5((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters6((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters7((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters8((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters9((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setTempAttach({
        attdatnum: "",
        files: "",
        bankdatnum: "",
        bankfiles: "",
        attdatnumList: [],
        filesList: [],
        attdatnumList2: [],
        filesList2: [],
        attdatnumList3: [],
        filesList3: [],
        attdatnumList4: [],
        filesList4: [],
        attdatnumList5: [],
        filesList5: [],
        attdatnumList6: [],
        filesList6: [],
        attdatnumList7: [],
        filesList7: [],
        attdatnumList8: [],
        filesList8: [],
      });
      setParaData3({
        work_type: "",
        orgdiv: sessionOrgdiv,
        prsnnum: "",
        hu252t_rowstatus_s: "",
        hu252t_seq_s: "",
        hu252t_schdiv_s: "",
        hu252t_startdate_s: "",
        hu252t_enddate_s: "",
        hu252t_schnm_s: "",
        hu252t_major_s: "",
        hu252t_schgrade_s: "",
        attdatnum_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved4 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para4);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      let array: any[] = [];

      deletedMainRows3.map((item: any) => {
        array.push(item.attdatnum);
      });

      setDeletedAttadatnums(array);

      setUnsavedName([]);
      setUnsavedAttadatnums([]);
      deletedMainRows = [];
      deletedMainRows2 = [];
      deletedMainRows3 = [];
      deletedMainRows4 = [];
      deletedMainRows5 = [];
      deletedMainRows6 = [];
      deletedMainRows7 = [];
      deletedMainRows8 = [];
      reload(data.returnString);

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters4((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters5((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters6((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters7((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters8((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters9((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setTempAttach({
        attdatnum: "",
        files: "",
        bankdatnum: "",
        bankfiles: "",
        attdatnumList: [],
        filesList: [],
        attdatnumList2: [],
        filesList2: [],
        attdatnumList3: [],
        filesList3: [],
        attdatnumList4: [],
        filesList4: [],
        attdatnumList5: [],
        filesList5: [],
        attdatnumList6: [],
        filesList6: [],
        attdatnumList7: [],
        filesList7: [],
        attdatnumList8: [],
        filesList8: [],
      });
      setParaData4({
        work_type: "",
        orgdiv: sessionOrgdiv,
        prsnnum: "",
        hu254t_rowstatus_s: "",
        hu254t_seq_s: "",
        hu254t_qualkind_s: "",
        hu254t_qualgrad_s: "",
        hu254t_qualmach_s: "",
        hu254t_acqdt_s: "",
        hu254t_validt_s: "",
        hu254t_renewdt_s: "",
        hu254t_qualnum_s: "",
        attdatnum_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved5 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para5);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      let array: any[] = [];

      deletedMainRows4.map((item: any) => {
        array.push(item.attdatnum);
      });

      setDeletedAttadatnums(array);

      setUnsavedName([]);
      setUnsavedAttadatnums([]);
      deletedMainRows = [];
      deletedMainRows2 = [];
      deletedMainRows3 = [];
      deletedMainRows4 = [];
      deletedMainRows5 = [];
      deletedMainRows6 = [];
      deletedMainRows7 = [];
      deletedMainRows8 = [];
      reload(data.returnString);

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters4((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters5((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters6((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters7((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters8((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters9((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setTempAttach({
        attdatnum: "",
        files: "",
        bankdatnum: "",
        bankfiles: "",
        attdatnumList: [],
        filesList: [],
        attdatnumList2: [],
        filesList2: [],
        attdatnumList3: [],
        filesList3: [],
        attdatnumList4: [],
        filesList4: [],
        attdatnumList5: [],
        filesList5: [],
        attdatnumList6: [],
        filesList6: [],
        attdatnumList7: [],
        filesList7: [],
        attdatnumList8: [],
        filesList8: [],
      });
      setParaData5({
        work_type: "",
        orgdiv: sessionOrgdiv,
        prsnnum: "",
        hu253t_rowstatus_s: "",
        hu253t_seq_s: "",
        hu253t_compnm_s: "",
        hu253t_frdt_s: "",
        hu253t_todt_s: "",
        hu253t_dptnm_s: "",
        hu253t_postnm_s: "",
        hu253t_jobnm_s: "",
        hu253t_remark_s: "",
        attdatnum_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved6 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para6);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      let array: any[] = [];

      deletedMainRows5.map((item: any) => {
        array.push(item.attdatnum);
      });

      setDeletedAttadatnums(array);

      setUnsavedName([]);
      setUnsavedAttadatnums([]);
      deletedMainRows = [];
      deletedMainRows2 = [];
      deletedMainRows3 = [];
      deletedMainRows4 = [];
      deletedMainRows5 = [];
      deletedMainRows6 = [];
      deletedMainRows7 = [];
      deletedMainRows8 = [];
      reload(data.returnString);

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters4((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters5((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters6((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters7((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters8((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters9((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setTempAttach({
        attdatnum: "",
        files: "",
        bankdatnum: "",
        bankfiles: "",
        attdatnumList: [],
        filesList: [],
        attdatnumList2: [],
        filesList2: [],
        attdatnumList3: [],
        filesList3: [],
        attdatnumList4: [],
        filesList4: [],
        attdatnumList5: [],
        filesList5: [],
        attdatnumList6: [],
        filesList6: [],
        attdatnumList7: [],
        filesList7: [],
        attdatnumList8: [],
        filesList8: [],
      });
      setParaData6({
        work_type: "",
        orgdiv: sessionOrgdiv,
        prsnnum: "",
        hu255t_rowstatus_s: "",
        hu255t_seq_s: "",
        hu255t_appointcd_s: "",
        hu255t_appointdt_s: "",
        hu255t_appointrsn_s: "",
        hu255t_startdt_s: "",
        hu255t_enddt_s: "",
        hu255t_remark_s: "",
        hu255t_dptcd_s: "",
        attdatnum_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved7 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para7);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      let array: any[] = [];

      deletedMainRows6.map((item: any) => {
        array.push(item.attdatnum);
      });

      setDeletedAttadatnums(array);

      setUnsavedName([]);
      setUnsavedAttadatnums([]);
      deletedMainRows = [];
      deletedMainRows2 = [];
      deletedMainRows3 = [];
      deletedMainRows4 = [];
      deletedMainRows5 = [];
      deletedMainRows6 = [];
      deletedMainRows7 = [];
      deletedMainRows8 = [];
      reload(data.returnString);

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters4((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters5((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters6((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters7((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters8((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters9((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setTempAttach({
        attdatnum: "",
        files: "",
        bankdatnum: "",
        bankfiles: "",
        attdatnumList: [],
        filesList: [],
        attdatnumList2: [],
        filesList2: [],
        attdatnumList3: [],
        filesList3: [],
        attdatnumList4: [],
        filesList4: [],
        attdatnumList5: [],
        filesList5: [],
        attdatnumList6: [],
        filesList6: [],
        attdatnumList7: [],
        filesList7: [],
        attdatnumList8: [],
        filesList8: [],
      });
      setParaData7({
        work_type: "",
        orgdiv: sessionOrgdiv,
        prsnnum: "",
        hu256t_rowstatus_s: "",
        hu256t_seq_s: "",
        hu256t_rnpdiv_s: "",
        hu256t_reqdt_s: "",
        hu256t_reloffice_s: "",
        hu256t_contents_s: "",
        hu256t_remark_s: "",
        attdatnum_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved8 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para8);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      let array: any[] = [];

      deletedMainRows7.map((item: any) => {
        array.push(item.attdatnum);
      });

      setDeletedAttadatnums(array);

      setUnsavedName([]);
      setUnsavedAttadatnums([]);
      deletedMainRows = [];
      deletedMainRows2 = [];
      deletedMainRows3 = [];
      deletedMainRows4 = [];
      deletedMainRows5 = [];
      deletedMainRows6 = [];
      deletedMainRows7 = [];
      deletedMainRows8 = [];
      reload(data.returnString);

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters4((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters5((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters6((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters7((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters8((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters9((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setTempAttach({
        attdatnum: "",
        files: "",
        bankdatnum: "",
        bankfiles: "",
        attdatnumList: [],
        filesList: [],
        attdatnumList2: [],
        filesList2: [],
        attdatnumList3: [],
        filesList3: [],
        attdatnumList4: [],
        filesList4: [],
        attdatnumList5: [],
        filesList5: [],
        attdatnumList6: [],
        filesList6: [],
        attdatnumList7: [],
        filesList7: [],
        attdatnumList8: [],
        filesList8: [],
      });
      setParaData8({
        work_type: "",
        orgdiv: sessionOrgdiv,
        prsnnum: "",
        hu257t_rowstatus_s: "",
        hu257t_seq_s: "",
        hu257t_startdt_s: "",
        hu257t_enddt_s: "",
        hu257t_eduterm_s: "",
        hu257t_edutime_s: "",
        hu257t_edunm_s: "",
        hu257t_contents_s: "",
        hu257t_edueval_s: "",
        hu257t_eduoffice_s: "",
        attdatnum_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved9 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para9);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      let array: any[] = [];

      deletedMainRows8.map((item: any) => {
        array.push(item.attdatnum);
      });

      setDeletedAttadatnums(array);

      setUnsavedName([]);
      setUnsavedAttadatnums([]);
      deletedMainRows = [];
      deletedMainRows2 = [];
      deletedMainRows3 = [];
      deletedMainRows4 = [];
      deletedMainRows5 = [];
      deletedMainRows6 = [];
      deletedMainRows7 = [];
      deletedMainRows8 = [];
      reload(data.returnString);

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters4((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters5((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters6((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters7((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters8((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters9((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setTempAttach({
        attdatnum: "",
        files: "",
        bankdatnum: "",
        bankfiles: "",
        attdatnumList: [],
        filesList: [],
        attdatnumList2: [],
        filesList2: [],
        attdatnumList3: [],
        filesList3: [],
        attdatnumList4: [],
        filesList4: [],
        attdatnumList5: [],
        filesList5: [],
        attdatnumList6: [],
        filesList6: [],
        attdatnumList7: [],
        filesList7: [],
        attdatnumList8: [],
        filesList8: [],
      });
      setParaData9({
        work_type: "",
        orgdiv: sessionOrgdiv,
        prsnnum: "",
        hu258t_rowstatus_s: "",
        hu258t_seq_s: "",
        hu258t_educd_s: "",
        hu258t_testnm_s: "",
        hu258t_score_s: "",
        hu258t_testdt_s: "",
        hu258t_speaking_s: "",
        hu258t_country_s: "",
        hu258t_startdt_s: "",
        hu258t_enddt_s: "",
        attdatnum_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.work_type != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  useEffect(() => {
    if (ParaData2.work_type != "") {
      fetchTodoGridSaved2();
    }
  }, [ParaData2]);

  useEffect(() => {
    if (ParaData3.work_type != "") {
      fetchTodoGridSaved3();
    }
  }, [ParaData3]);

  useEffect(() => {
    if (ParaData4.work_type != "") {
      fetchTodoGridSaved4();
    }
  }, [ParaData4]);

  useEffect(() => {
    if (ParaData5.work_type != "") {
      fetchTodoGridSaved5();
    }
  }, [ParaData5]);

  useEffect(() => {
    if (ParaData6.work_type != "") {
      fetchTodoGridSaved6();
    }
  }, [ParaData6]);

  useEffect(() => {
    if (ParaData7.work_type != "") {
      fetchTodoGridSaved7();
    }
  }, [ParaData7]);

  useEffect(() => {
    if (ParaData8.work_type != "") {
      fetchTodoGridSaved8();
    }
  }, [ParaData8]);

  useEffect(() => {
    if (ParaData9.work_type != "") {
      fetchTodoGridSaved9();
    }
  }, [ParaData9]);

  return (
    <>
      <Window
        title={workType == "N" ? "사용자생성" : "사용자수정"}
        initialWidth={position.width}
        initialHeight={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <TabStrip
          style={{ width: "100%", height: `calc(100% - 55px)` }}
          selected={tabSelected}
          onSelect={handleSelectTab}
          scrollable={isMobile}
        >
          <TabStripTab title="인사기본">
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr>
                    <th>사번</th>
                    <td>
                      {workType == "N" ? (
                        <Input
                          name="prsnnum"
                          type="text"
                          value={information.prsnnum}
                          onChange={InputChange}
                          className="required"
                        />
                      ) : (
                        <Input
                          name="prsnnum"
                          type="text"
                          value={information.prsnnum}
                          className="readonly"
                        />
                      )}
                    </td>
                    <th>사번2</th>
                    <td>
                      <Input
                        name="prsnnum2"
                        type="text"
                        value={information.prsnnum2}
                        onChange={InputChange}
                        className="required"
                      />
                    </td>
                    <th>부서코드</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="dptcd"
                          value={information.dptcd}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          textField="dptnm"
                          valueField="dptcd"
                          type="new"
                          className="required"
                        />
                      )}
                    </td>
                    <th>국적</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="nationcd"
                          value={information.nationcd}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                    <th>지원경로</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="path"
                          value={information.path}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>성명</th>
                    <td>
                      <Input
                        name="prsnnm"
                        type="text"
                        value={information.prsnnm}
                        onChange={InputChange}
                        className="required"
                      />
                    </td>
                    <th>직책</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="abilcd"
                          value={information.abilcd}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                    <th>직위</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="postcd"
                          value={information.postcd}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                    <th>퇴사일</th>
                    <td>
                      <DatePicker
                        name="rtrdt"
                        value={information.rtrdt}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                    <th>퇴직사유</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="rtrrsn"
                          value={information.rtrrsn}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>성명(한문)</th>
                    <td>
                      <Input
                        name="prsnnmh"
                        type="text"
                        value={information.prsnnmh}
                        onChange={InputChange}
                      />
                    </td>
                    <th>성명(영문)</th>
                    <td>
                      <Input
                        name="prsnnme"
                        type="text"
                        value={information.prsnnme}
                        onChange={InputChange}
                      />
                    </td>
                    <th>최종학력</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="schcd"
                          value={information.schcd}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                    <th>사원구분</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="emptype"
                          value={information.emptype}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                    <th>입사구분</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="regcd"
                          value={information.regcd}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>주민번호</th>
                    <td>
                      <MaskedTextBox
                        mask="0000000000000"
                        name="perregnum"
                        value={information.perregnum}
                        onChange={InputChange}
                        className="required"
                      />
                    </td>
                    <th>성별</th>
                    <td>
                      {workType == "N"
                        ? customOptionData !== null && (
                            <CustomOptionRadioGroup
                              name="sexcd"
                              customOptionData={customOptionData}
                              changeData={RadioChange}
                              type="new"
                            />
                          )
                        : bizComponentData !== null && (
                            <BizComponentRadioGroup
                              name="sexcd"
                              value={information.sexcd}
                              bizComponentId="R_SEXCD"
                              bizComponentData={bizComponentData}
                              changeData={RadioChange}
                            />
                          )}
                    </td>
                    <th>전화번호</th>
                    <td>
                      <Input
                        name="telephon"
                        type="text"
                        value={information.telephon}
                        onChange={InputChange}
                      />
                    </td>
                    <th>휴대전화번호</th>
                    <td>
                      <Input
                        name="phonenum"
                        type="text"
                        value={information.phonenum}
                        onChange={InputChange}
                      />
                    </td>
                    <th>내선번호</th>
                    <td>
                      <Input
                        name="extnum"
                        type="text"
                        value={information.extnum}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>연차발생기준일</th>
                    <td>
                      <DatePicker
                        name="occudate"
                        value={information.occudate}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                    <th>생년월일</th>
                    <td>
                      <DatePicker
                        name="birdt"
                        value={information.birdt}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                    <th>양/음</th>
                    <td>
                      {workType == "N"
                        ? customOptionData !== null && (
                            <CustomOptionRadioGroup
                              name="bircd"
                              customOptionData={customOptionData}
                              changeData={RadioChange}
                              type="new"
                            />
                          )
                        : bizComponentData !== null && (
                            <BizComponentRadioGroup
                              name="bircd"
                              value={information.bircd}
                              bizComponentId="R_BIRCD"
                              bizComponentData={bizComponentData}
                              changeData={RadioChange}
                            />
                          )}
                    </td>

                    <th>직무코드</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="jobcd"
                          value={information.jobcd}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                    <th>카드번호</th>
                    <td>
                      <Input
                        name="cardcd"
                        type="text"
                        value={information.cardcd}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>입사일</th>
                    <td>
                      <DatePicker
                        name="regorgdt"
                        value={information.regorgdt}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                    <th>개인메일</th>
                    <td colSpan={3}>
                      <Input
                        name="mailid"
                        type="text"
                        value={information.mailid}
                        onChange={InputChange}
                      />
                    </td>
                    <th>메일주소(회사)</th>
                    <td colSpan={3}>
                      <Input
                        name="workmail"
                        type="text"
                        value={information.workmail}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>정산입사일</th>
                    <td>
                      <DatePicker
                        name="firredt"
                        value={information.firredt}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                    <th>주민등록지우편번호</th>
                    <td colSpan={3}>
                      <Input
                        name="hmzipcode"
                        type="text"
                        value={information.hmzipcode}
                        onChange={InputChange}
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
                          onClick={onZipCodeWndClick}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                    <th>주민등록지주소</th>
                    <td colSpan={3}>
                      <Input
                        name="koraddr"
                        type="text"
                        value={information.koraddr}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>사업장</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="location"
                          value={information.location}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                    <th>우편번호</th>
                    <td colSpan={3}>
                      <Input
                        name="zipcode"
                        type="text"
                        value={information.zipcode}
                        onChange={InputChange}
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
                          onClick={onZipCodeWndClick2}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                    <th>주소</th>
                    <td colSpan={3}>
                      <Input
                        name="hmaddr"
                        type="text"
                        value={information.hmaddr}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>급여지급유형</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="paycd"
                          value={information.paycd}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                    <th>근무형태</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="workgb"
                          value={information.workgb}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                    <th>근무조</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="workcls"
                          value={information.workcls}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                    <th>영문주소</th>
                    <td colSpan={3}>
                      <Input
                        name="enaddr"
                        type="text"
                        value={information.enaddr}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>첨부파일</th>
                    <td colSpan={9}>
                      <Input
                        name="files"
                        type="text"
                        value={information.files}
                        className="readonly"
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
                          onClick={onAttachmentsWndClick}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                  </tr>
                  <tr>
                    <th>비고</th>
                    <td colSpan={9}>
                      <TextArea
                        value={information.remark}
                        name="remark"
                        rows={5}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </TabStripTab>
          <TabStripTab
            title="인사상세"
            disabled={workType == "N" ? true : false}
          >
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr>
                    <th>공지게시여부</th>
                    <td>
                      <Checkbox
                        name="payyn"
                        value={
                          information.payyn == "Y"
                            ? true
                            : information.payyn == "N"
                            ? false
                            : information.payyn
                        }
                        onChange={InputChange}
                      />
                    </td>
                    <th>상여금계산구분</th>
                    <td>
                      <Checkbox
                        name="bnskind"
                        value={
                          information.bnskind == "Y"
                            ? true
                            : information.bnskind == "N"
                            ? false
                            : information.bnskind
                        }
                        onChange={InputChange}
                      />
                    </td>
                    <th>근태관리여부</th>
                    <td>
                      <Checkbox
                        name="workchk"
                        value={
                          information.workchk == "Y"
                            ? true
                            : information.workchk == "N"
                            ? false
                            : information.workchk
                        }
                        onChange={InputChange}
                      />
                    </td>
                    <th>연차관리여부</th>
                    <td>
                      <Checkbox
                        name="yrchk"
                        value={
                          information.yrchk == "Y"
                            ? true
                            : information.yrchk == "N"
                            ? false
                            : information.yrchk
                        }
                        onChange={InputChange}
                      />
                    </td>
                    <th>고용보험여부</th>
                    <td>
                      <Checkbox
                        name="hirinsuyn"
                        value={
                          information.hirinsuyn == "Y"
                            ? true
                            : information.hirinsuyn == "N"
                            ? false
                            : information.hirinsuyn
                        }
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>건강보험취득일</th>
                    <td>
                      <DatePicker
                        name="meddate"
                        value={information.meddate}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                    <th>국민연금취득일</th>
                    <td>
                      <DatePicker
                        name="anudate"
                        value={information.anudate}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                    <th>고용보험취득일</th>
                    <td>
                      <DatePicker
                        name="hirdate"
                        value={information.hirdate}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                    <th>의료보험번호</th>
                    <td>
                      <Input
                        name="medinsunum"
                        type="text"
                        value={information.medinsunum}
                        onChange={InputChange}
                      />
                    </td>
                    <th>의료보험등급</th>
                    <td>
                      <Input
                        name="medgrad"
                        type="text"
                        value={information.medgrad}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>국민보험등급</th>
                    <td>
                      <Input
                        name="pnsgrad"
                        type="text"
                        value={information.pnsgrad}
                        onChange={InputChange}
                      />
                    </td>
                    <th>연장시간</th>
                    <td>
                      <Input
                        name="overtime"
                        type="text"
                        value={information.overtime}
                        className="readonly"
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
                          onClick={onOvertimeWndClick}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                    <th>은행코드</th>
                    <td>
                      <Input
                        name="bankcd"
                        type="text"
                        value={information.bankcd}
                        className="readonly"
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
                          onClick={onBankcdWndClick}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                    <th>은행명</th>
                    <td>
                      <Input
                        name="banknm"
                        type="text"
                        value={information.banknm}
                        className="readonly"
                      />
                    </td>
                    <th>계좌번호</th>
                    <td>
                      <Input
                        name="bankacnt"
                        type="text"
                        value={information.bankacnt}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>예금주</th>
                    <td>
                      <Input
                        name="bankacntuser"
                        type="text"
                        value={information.bankacntuser}
                        onChange={InputChange}
                      />
                    </td>
                    <th>통장사본</th>
                    <td>
                      <Input
                        name="bankfiles"
                        type="text"
                        value={information.bankfiles}
                        className="readonly"
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
                          onClick={onAttachmentsWndClick2}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                    <th>감면시작</th>
                    <td colSpan={3}>
                      <CommonDateRangePicker
                        value={{
                          start: information.exstartdt,
                          end: information.exenddt,
                        }}
                        onChange={(e: { value: { start: any; end: any } }) =>
                          setInformation((prev) => ({
                            ...prev,
                            exstartdt: e.value.start,
                            exenddt: e.value.end,
                          }))
                        }
                      />
                    </td>
                    <th>세액구분</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="taxcd"
                          value={information.taxcd}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>연차발생기준</th>
                    <td colSpan={3}>
                      {bizComponentData !== null && (
                        <BizComponentRadioGroup
                          name="dayoffdiv"
                          value={information.dayoffdiv}
                          bizComponentId="R_dayoffdiv"
                          bizComponentData={bizComponentData}
                          changeData={RadioChange}
                        />
                      )}
                    </td>
                    <th>퇴직급여기준</th>
                    <td colSpan={3}>
                      {bizComponentData !== null && (
                        <BizComponentRadioGroup
                          name="rtrtype"
                          value={information.rtrtype}
                          bizComponentId="R_Rtrtype"
                          bizComponentData={bizComponentData}
                          changeData={RadioChange}
                        />
                      )}
                    </td>
                    <th>업청년세액감면</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="exmtaxgb"
                          value={information.exmtaxgb}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>세대주여부</th>
                    <td colSpan={3}>
                      {bizComponentData !== null && (
                        <BizComponentRadioGroup
                          name="houseyn"
                          value={information.houseyn}
                          bizComponentId="R_HOUSEYN"
                          bizComponentData={bizComponentData}
                          changeData={RadioChange}
                        />
                      )}
                    </td>
                    <th>소득세조정률</th>
                    <td colSpan={2}>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="incgb"
                          value={information.incgb}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                    <th colSpan={2}>직전년도 총급여액 2500만원 이하</th>
                    <td>
                      <Checkbox
                        name="below2kyn"
                        value={
                          information.below2kyn == "Y"
                            ? true
                            : information.below2kyn == "N"
                            ? false
                            : information.below2kyn
                        }
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>세액계산대상여부</th>
                    <td>
                      <Checkbox
                        name="caltaxyn"
                        value={
                          information.caltaxyn == "Y"
                            ? true
                            : information.caltaxyn == "N"
                            ? false
                            : information.caltaxyn
                        }
                        onChange={InputChange}
                      />
                    </td>
                    <th>연말정산신고대</th>
                    <td>
                      <Checkbox
                        name="yrdclyn"
                        value={
                          information.yrdclyn == "Y"
                            ? true
                            : information.yrdclyn == "N"
                            ? false
                            : information.yrdclyn
                        }
                        onChange={InputChange}
                      />
                    </td>
                    <th>부녀자</th>
                    <td>
                      <Checkbox
                        name="wmn"
                        value={
                          information.wmn == "Y"
                            ? true
                            : information.wmn == "N"
                            ? false
                            : information.wmn
                        }
                        onChange={InputChange}
                      />
                    </td>
                    <th>배우자유무</th>
                    <td>
                      <Checkbox
                        name="sps"
                        value={
                          information.sps == "Y"
                            ? true
                            : information.sps == "N"
                            ? false
                            : information.sps
                        }
                        onChange={InputChange}
                      />
                    </td>
                    <th>노조가입</th>
                    <td>
                      <Checkbox
                        name="laboryn"
                        value={
                          information.laboryn == "Y"
                            ? true
                            : information.laboryn == "N"
                            ? false
                            : information.laboryn
                        }
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>신체장애</th>
                    <td>
                      <Checkbox
                        name="dfmyn"
                        value={
                          information.dfmyn == "Y"
                            ? true
                            : information.dfmyn == "N"
                            ? false
                            : information.dfmyn
                        }
                        onChange={InputChange}
                      />
                    </td>
                    <th>병역특례</th>
                    <td>
                      <Checkbox
                        name="milyn"
                        value={
                          information.milyn == "Y"
                            ? true
                            : information.milyn == "N"
                            ? false
                            : information.milyn
                        }
                        onChange={InputChange}
                      />
                    </td>
                    <th>경감보험대상</th>
                    <td>
                      <Checkbox
                        name="dfmyn2"
                        value={
                          information.dfmyn2 == "Y"
                            ? true
                            : information.dfmyn2 == "N"
                            ? false
                            : information.dfmyn2
                        }
                        onChange={InputChange}
                      />
                    </td>
                    <th>국외근로대상</th>
                    <td>
                      <Checkbox
                        name="notaxe"
                        value={
                          information.notaxe == "Y"
                            ? true
                            : information.notaxe == "N"
                            ? false
                            : information.notaxe
                        }
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>경로자65</th>
                    <td>
                      <NumericTextBox
                        name="agenum"
                        value={information.agenum}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>경로자70</th>
                    <td>
                      <NumericTextBox
                        name="agenum70"
                        value={information.agenum70}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>부양자(본인미포함)</th>
                    <td>
                      <NumericTextBox
                        name="sptnum"
                        value={information.sptnum}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>자녀양육</th>
                    <td>
                      <NumericTextBox
                        name="brngchlnum"
                        value={information.brngchlnum}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>장애자</th>
                    <td>
                      <NumericTextBox
                        name="dfmnum"
                        value={information.dfmnum}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>다자녀</th>
                    <td>
                      <NumericTextBox
                        name="childnum"
                        value={information.childnum}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>가족수당배우</th>
                    <td>
                      <NumericTextBox
                        name="fam1"
                        value={information.fam1}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>가족수당자녀</th>
                    <td>
                      <NumericTextBox
                        name="fam2"
                        value={information.fam2}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </TabStripTab>
          <TabStripTab
            title="개인정보"
            disabled={workType == "N" ? true : false}
          >
            <GridContainerWrap>
              <GridContainer width="20%">
                <GridTitleContainer>
                  <GridTitle>사진</GridTitle>
                  <ButtonContainer>
                    <Button onClick={onAttWndClick2} themeColor={"primary"}>
                      사진업로드
                    </Button>
                    <input
                      id="uploadAttachment"
                      style={{ display: "none" }}
                      type="file"
                      accept="image/*"
                      ref={excelInput}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        getAttachmentsDataphoto(event.target.files);
                      }}
                    />
                  </ButtonContainer>
                </GridTitleContainer>
                <div style={{ textAlign: "center", marginTop: "15px" }}>
                  {information.photodatnum != "" ? (
                    <img
                      style={{ display: "block", margin: "auto", width: "80%" }}
                      ref={excelInput}
                      src={imgBase64}
                      alt="UserImage"
                    />
                  ) : (
                    ""
                  )}
                </div>
              </GridContainer>
              <GridContainer width={`calc(80% - ${GAP}px)`}>
                <FormBoxWrap border={true}>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>신장</th>
                        <td>
                          <NumericTextBox
                            name="height"
                            value={information.height}
                            onChange={InputChange}
                            format="n0"
                          />
                        </td>
                        <th>체중</th>
                        <td>
                          <NumericTextBox
                            name="weight"
                            value={information.weight}
                            onChange={InputChange}
                            format="n0"
                          />
                        </td>
                        <th>혈액형</th>
                        <td>
                          <Input
                            name="blood"
                            type="text"
                            value={information.blood}
                            onChange={InputChange}
                          />
                        </td>
                        <th>종교</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="religion"
                              value={information.religion}
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
                              type="new"
                            />
                          )}
                        </td>
                        <th>신발</th>
                        <td>
                          <Input
                            name="size3"
                            type="text"
                            value={information.size3}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>의류(상)</th>
                        <td>
                          <Input
                            name="size1"
                            type="text"
                            value={information.size1}
                            onChange={InputChange}
                          />
                        </td>
                        <th>의류(하)</th>
                        <td>
                          <Input
                            name="size2"
                            type="text"
                            value={information.size2}
                            onChange={InputChange}
                          />
                        </td>
                        <th>색맹</th>
                        <td>
                          <Input
                            name="color"
                            type="text"
                            value={information.color}
                            onChange={InputChange}
                          />
                        </td>
                        <th>시력(좌)</th>
                        <td>
                          <NumericTextBox
                            name="leye"
                            value={information.leye}
                            onChange={InputChange}
                            format="n0"
                          />
                        </td>
                        <th>시력(우)</th>
                        <td>
                          <NumericTextBox
                            name="reye"
                            value={information.reye}
                            onChange={InputChange}
                            format="n0"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>결혼여부</th>
                        <td colSpan={3}>
                          {bizComponentData !== null && (
                            <BizComponentRadioGroup
                              name="marriage"
                              value={information.marriage}
                              bizComponentId="R_MARRIAGE"
                              bizComponentData={bizComponentData}
                              changeData={RadioChange}
                            />
                          )}
                        </td>
                        <th>결혼기념일</th>
                        <td>
                          <DatePicker
                            name="marrydt"
                            value={information.marrydt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            placeholder=""
                          />
                        </td>
                        <th>본적</th>
                        <td>
                          <Input
                            name="orgaddr"
                            type="text"
                            value={information.orgaddr}
                            onChange={InputChange}
                          />
                        </td>
                        <th>출생지</th>
                        <td>
                          <Input
                            name="birthplace"
                            type="text"
                            value={information.birthplace}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>취미</th>
                        <td>
                          <Input
                            name="hobby"
                            type="text"
                            value={information.hobby}
                            onChange={InputChange}
                          />
                        </td>
                        <th>특기</th>
                        <td>
                          <Input
                            name="hobby2"
                            type="text"
                            value={information.hobby2}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </GridContainerWrap>
          </TabStripTab>
          <TabStripTab
            title="병역사항"
            disabled={workType == "N" ? true : false}
          >
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr>
                    <th>병역구분</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="armygb"
                          value={information.armygb}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          type="new"
                        />
                      )}
                    </td>
                    <th>군번</th>
                    <td>
                      <Input
                        name="militarynum"
                        type="text"
                        value={information.militarynum}
                        onChange={InputChange}
                      />
                    </td>
                    <th>입대일</th>
                    <td>
                      <DatePicker
                        name="armystartdt"
                        value={information.armystartdt}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                    <th>군별</th>
                    <td>
                      <Input
                        name="armydistinctiom"
                        type="text"
                        value={information.armydistinctiom}
                        onChange={InputChange}
                      />
                    </td>
                    <th>병과</th>
                    <td>
                      <Input
                        name="armykind"
                        type="text"
                        value={information.armykind}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>면제사유</th>
                    <td>
                      <Input
                        name="armyexrsn"
                        type="text"
                        value={information.armyexrsn}
                        onChange={InputChange}
                      />
                    </td>
                    <th>계급</th>
                    <td>
                      <Input
                        name="armyrank"
                        type="text"
                        value={information.armyrank}
                        onChange={InputChange}
                      />
                    </td>
                    <th>전역일</th>
                    <td>
                      <DatePicker
                        name="armyenddt"
                        value={information.armyenddt}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                    <th>역종</th>
                    <td>
                      <Input
                        name="armyclass"
                        type="text"
                        value={information.armyclass}
                        onChange={InputChange}
                      />
                    </td>
                    <th>주특기</th>
                    <td>
                      <Input
                        name="armyspeciality"
                        type="text"
                        value={information.armyspeciality}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </TabStripTab>
          <TabStripTab
            title="가족관계"
            disabled={workType == "N" ? true : false}
          >
            <FormContext.Provider
              value={{
                attdatnum,
                files,
                setAttdatnum,
                setFiles,
                mainDataState,
                setMainDataState,
                // fetchGrid,
              }}
            >
              <GridContainer height={position.height - 220 + "px"}>
                <GridTitleContainer>
                  <ButtonContainer>
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
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: `calc(100% - 35px)` }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      birdt: row.birdt
                        ? new Date(dateformat(row.birdt))
                        : new Date(dateformat("99991231")),
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                    mainDataState
                  )}
                  onDataStateChange={onMainDataStateChange}
                  {...mainDataState}
                  //선택 subDataState
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange}
                  //스크롤 조회기능
                  fixedScroll={true}
                  total={mainDataResult.total}
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={pageChange}
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
                    field="fmlynm"
                    title="성명"
                    width="120px"
                    footerCell={mainTotalFooterCell}
                    headerCell={RequiredHeader}
                  />
                  <GridColumn
                    field="relt"
                    title="관계"
                    width="120px"
                    cell={CustomComboBoxCell}
                    headerCell={RequiredHeader}
                  />
                  <GridColumn
                    field="perregnum"
                    title="주민번호"
                    width="120px"
                    headerCell={RequiredHeader}
                  />
                  <GridColumn
                    field="schcd"
                    title="최종학력"
                    width="120px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn field="job" title="직업" width="120px" />
                  <GridColumn field="compnm" title="회사명" width="120px" />
                  <GridColumn field="postnm" title="직위명" width="120px" />
                  <GridColumn
                    field="birdt"
                    title="생년월일"
                    width="120px"
                    cell={DateCell}
                    headerCell={RequiredHeader}
                  />
                  <GridColumn
                    field="sexcd"
                    title="성별"
                    width="150px"
                    cell={CustomRadioCell}
                    headerCell={RequiredHeader}
                  />
                  <GridColumn
                    field="phoneno"
                    title="휴대폰번호"
                    width="120px"
                  />
                  <GridColumn
                    field="payyn"
                    title="급여"
                    width="80px"
                    cell={CheckBoxCell}
                  />
                  <GridColumn
                    field="yesyn"
                    title="정산"
                    width="80px"
                    cell={CheckBoxCell}
                  />
                  <GridColumn
                    field="rmyn"
                    title="동거"
                    width="80px"
                    cell={CheckBoxCell}
                  />
                  <GridColumn
                    field="dfmyn"
                    title="신체장애"
                    width="120px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn field="remark" title="비고" width="200px" />
                  <GridColumn
                    field="files"
                    title="첨부파일"
                    width="150px"
                    cell={ColumnCommandCell}
                  />
                </Grid>
              </GridContainer>
            </FormContext.Provider>
          </TabStripTab>
          <TabStripTab
            title="학적사항"
            disabled={workType == "N" ? true : false}
          >
            <FormContext2.Provider
              value={{
                attdatnum2,
                files2,
                setAttdatnum2,
                setFiles2,
                mainDataState2,
                setMainDataState2,
                // fetchGrid,
              }}
            >
              <GridContainer height={position.height - 220 + "px"}>
                <GridTitleContainer>
                  <ButtonContainer>
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
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: `calc(100% - 35px)` }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      startdate: row.startdate
                        ? new Date(dateformat(row.startdate))
                        : new Date(dateformat("99991231")),
                      enddate: row.enddate
                        ? new Date(dateformat(row.enddate))
                        : new Date(dateformat("99991231")),
                      [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
                    })),
                    mainDataState2
                  )}
                  onDataStateChange={onMainDataStateChange2}
                  {...mainDataState2}
                  //선택 subDataState
                  dataItemKey={DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange2}
                  //스크롤 조회기능
                  fixedScroll={true}
                  total={mainDataResult2.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
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
                    field="schdiv"
                    title="학력"
                    width="120px"
                    footerCell={mainTotalFooterCell2}
                    headerCell={RequiredHeader}
                  />
                  <GridColumn
                    field="startdate"
                    title="입학일자"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn
                    field="enddate"
                    title="졸업일자"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn field="schnm" title="학교명" width="150px" />
                  <GridColumn field="major" title="전공명" width="120px" />
                  <GridColumn field="schgrade" title="학점" width="120px" />
                  <GridColumn
                    field="files"
                    title="첨부파일"
                    width="150px"
                    cell={ColumnCommandCell2}
                  />
                </Grid>
              </GridContainer>
            </FormContext2.Provider>
          </TabStripTab>
          <TabStripTab
            title="면허/자격사항"
            disabled={workType == "N" ? true : false}
          >
            <FormContext3.Provider
              value={{
                attdatnum3,
                files3,
                setAttdatnum3,
                setFiles3,
                mainDataState3,
                setMainDataState3,
                // fetchGrid,
              }}
            >
              <GridContainer height={position.height - 220 + "px"}>
                <GridTitleContainer>
                  <ButtonContainer>
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
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: `calc(100% - 35px)` }}
                  data={process(
                    mainDataResult3.data.map((row) => ({
                      ...row,
                      acqdt: row.acqdt
                        ? new Date(dateformat(row.acqdt))
                        : new Date(dateformat("99991231")),
                      validt: row.validt
                        ? new Date(dateformat(row.validt))
                        : new Date(dateformat("99991231")),
                      renewdt: row.renewdt
                        ? new Date(dateformat(row.renewdt))
                        : new Date(dateformat("99991231")),
                      [SELECTED_FIELD]: selectedState3[idGetter3(row)], //선택된 데이터
                    })),
                    mainDataState3
                  )}
                  onDataStateChange={onMainDataStateChange3}
                  {...mainDataState3}
                  //선택 subDataState
                  dataItemKey={DATA_ITEM_KEY3}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange3}
                  //스크롤 조회기능
                  fixedScroll={true}
                  total={mainDataResult3.total}
                  skip={page3.skip}
                  take={page3.take}
                  pageable={true}
                  onPageChange={pageChange3}
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
                    field="qualkind"
                    title="자격종류"
                    width="120px"
                    footerCell={mainTotalFooterCell3}
                  />
                  <GridColumn field="qualgrad" title="자격등급" width="120px" />
                  <GridColumn field="qualmach" title="발행기관" width="120px" />
                  <GridColumn
                    field="acqdt"
                    title="취득일"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn
                    field="validt"
                    title="유효일"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn
                    field="renewdt"
                    title="차기갱신일"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn field="qualnum" title="자격번호" width="150px" />
                  <GridColumn
                    field="files"
                    title="첨부파일"
                    width="150px"
                    cell={ColumnCommandCell3}
                  />
                </Grid>
              </GridContainer>
            </FormContext3.Provider>
          </TabStripTab>
          <TabStripTab
            title="경력사항"
            disabled={workType == "N" ? true : false}
          >
            <FormContext4.Provider
              value={{
                attdatnum4,
                files4,
                setAttdatnum4,
                setFiles4,
                mainDataState4,
                setMainDataState4,
                // fetchGrid,
              }}
            >
              <GridContainer height={position.height - 220 + "px"}>
                <GridTitleContainer>
                  <ButtonContainer>
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
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: `calc(100% - 35px)` }}
                  data={process(
                    mainDataResult4.data.map((row) => ({
                      ...row,
                      frdt: row.frdt
                        ? new Date(dateformat(row.frdt))
                        : new Date(dateformat("99991231")),
                      todt: row.todt
                        ? new Date(dateformat(row.todt))
                        : new Date(dateformat("99991231")),
                      orgdiv: orgdivListData.find(
                        (item: any) => item.sub_code == row.orgdiv
                      )?.code_name,
                      [SELECTED_FIELD]: selectedState4[idGetter4(row)], //선택된 데이터
                    })),
                    mainDataState4
                  )}
                  onDataStateChange={onMainDataStateChange4}
                  {...mainDataState4}
                  //선택 subDataState
                  dataItemKey={DATA_ITEM_KEY4}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange4}
                  //스크롤 조회기능
                  fixedScroll={true}
                  total={mainDataResult4.total}
                  skip={page4.skip}
                  take={page4.take}
                  pageable={true}
                  onPageChange={pageChange4}
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
                    field="orgdiv"
                    title="회사구분"
                    width="120px"
                    footerCell={mainTotalFooterCell4}
                  />
                  <GridColumn
                    field="compnm"
                    title="회사명"
                    width="120px"
                    headerCell={RequiredHeader}
                  />
                  <GridColumn
                    field="frdt"
                    title="시작일"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn
                    field="todt"
                    title="종료일"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn field="dptnm" title="부서명" width="120px" />
                  <GridColumn field="postnm" title="직급" width="120px" />
                  <GridColumn field="jobnm" title="담당업무" width="150px" />
                  <GridColumn field="remark" title="퇴직사유" width="200px" />
                  <GridColumn
                    field="files"
                    title="첨부파일"
                    width="150px"
                    cell={ColumnCommandCell4}
                  />
                </Grid>
              </GridContainer>
            </FormContext4.Provider>
          </TabStripTab>
          <TabStripTab
            title="인사발령사항"
            disabled={workType == "N" ? true : false}
          >
            <FormContext5.Provider
              value={{
                attdatnum5,
                files5,
                setAttdatnum5,
                setFiles5,
                mainDataState5,
                setMainDataState5,
                // fetchGrid,
              }}
            >
              <GridContainer height={position.height - 220 + "px"}>
                <GridTitleContainer>
                  <ButtonContainer>
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
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: `calc(100% - 35px)` }}
                  data={process(
                    mainDataResult5.data.map((row) => ({
                      ...row,
                      startdt: row.startdt
                        ? new Date(dateformat(row.startdt))
                        : new Date(dateformat("99991231")),
                      enddt: row.enddt
                        ? new Date(dateformat(row.enddt))
                        : new Date(dateformat("99991231")),
                      appointdt: row.appointdt
                        ? new Date(dateformat(row.appointdt))
                        : new Date(dateformat("99991231")),
                      [SELECTED_FIELD]: selectedState5[idGetter5(row)], //선택된 데이터
                    })),
                    mainDataState5
                  )}
                  onDataStateChange={onMainDataStateChange5}
                  {...mainDataState5}
                  //선택 subDataState
                  dataItemKey={DATA_ITEM_KEY5}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange5}
                  //스크롤 조회기능
                  fixedScroll={true}
                  total={mainDataResult5.total}
                  skip={page5.skip}
                  take={page5.take}
                  pageable={true}
                  onPageChange={pageChange5}
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
                    field="appointcd"
                    title="발령구분"
                    width="120px"
                    cell={CustomComboBoxCell}
                    footerCell={mainTotalFooterCell5}
                    headerCell={RequiredHeader}
                  />
                  <GridColumn
                    field="appointdt"
                    title="발령일자"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn
                    field="appointrsn"
                    title="발령내용"
                    width="200px"
                  />
                  <GridColumn
                    field="startdt"
                    title="시작일자"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn
                    field="enddt"
                    title="종료일자"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn field="remark" title="비고" width="200px" />
                  <GridColumn
                    field="dptcd"
                    title="부서"
                    width="120px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="files"
                    title="첨부파일"
                    width="150px"
                    cell={ColumnCommandCell5}
                  />
                </Grid>
              </GridContainer>
            </FormContext5.Provider>
          </TabStripTab>
          <TabStripTab
            title="상벌사항"
            disabled={workType == "N" ? true : false}
          >
            <FormContext6.Provider
              value={{
                attdatnum6,
                files6,
                setAttdatnum6,
                setFiles6,
                mainDataState6,
                setMainDataState6,
                // fetchGrid,
              }}
            >
              <GridContainer height={position.height - 220 + "px"}>
                <GridTitleContainer>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick6}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                    ></Button>
                    <Button
                      onClick={onDeleteClick6}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: `calc(100% - 35px)` }}
                  data={process(
                    mainDataResult6.data.map((row) => ({
                      ...row,
                      reqdt: row.reqdt
                        ? new Date(dateformat(row.reqdt))
                        : new Date(dateformat("99991231")),
                      [SELECTED_FIELD]: selectedState6[idGetter6(row)], //선택된 데이터
                    })),
                    mainDataState6
                  )}
                  onDataStateChange={onMainDataStateChange6}
                  {...mainDataState6}
                  //선택 subDataState
                  dataItemKey={DATA_ITEM_KEY6}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange6}
                  //스크롤 조회기능
                  fixedScroll={true}
                  total={mainDataResult6.total}
                  skip={page6.skip}
                  take={page6.take}
                  pageable={true}
                  onPageChange={pageChange6}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange6}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange6}
                  cellRender={customCellRender6}
                  rowRender={customRowRender6}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  <GridColumn
                    field="rnpdiv"
                    title="상벌구분"
                    width="120px"
                    cell={CustomComboBoxCell}
                    footerCell={mainTotalFooterCell6}
                  />
                  <GridColumn
                    field="reqdt"
                    title="일자"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn field="reloffice" title="기관" width="120px" />
                  <GridColumn field="contents" title="상벌내용" width="150px" />
                  <GridColumn field="remark" title="비고" width="200px" />
                  <GridColumn
                    field="files"
                    title="첨부파일"
                    width="150px"
                    cell={ColumnCommandCell6}
                  />
                </Grid>
              </GridContainer>
            </FormContext6.Provider>
          </TabStripTab>
          <TabStripTab
            title="교육사항"
            disabled={workType == "N" ? true : false}
          >
            <FormContext7.Provider
              value={{
                attdatnum7,
                files7,
                setAttdatnum7,
                setFiles7,
                mainDataState7,
                setMainDataState7,
                // fetchGrid,
              }}
            >
              <GridContainer height={position.height - 220 + "px"}>
                <GridTitleContainer>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick7}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                    ></Button>
                    <Button
                      onClick={onDeleteClick7}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: `calc(100% - 35px)` }}
                  data={process(
                    mainDataResult7.data.map((row) => ({
                      ...row,
                      startdt: row.startdt
                        ? new Date(dateformat(row.startdt))
                        : new Date(dateformat("99991231")),
                      enddt: row.enddt
                        ? new Date(dateformat(row.enddt))
                        : new Date(dateformat("99991231")),
                      [SELECTED_FIELD]: selectedState7[idGetter7(row)], //선택된 데이터
                    })),
                    mainDataState7
                  )}
                  onDataStateChange={onMainDataStateChange7}
                  {...mainDataState7}
                  //선택 subDataState
                  dataItemKey={DATA_ITEM_KEY7}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange7}
                  //스크롤 조회기능
                  fixedScroll={true}
                  total={mainDataResult7.total}
                  skip={page7.skip}
                  take={page7.take}
                  pageable={true}
                  onPageChange={pageChange7}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange7}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange7}
                  cellRender={customCellRender7}
                  rowRender={customRowRender7}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  <GridColumn
                    field="startdt"
                    title="근무기간(시작)"
                    width="120px"
                    cell={DateCell}
                    footerCell={mainTotalFooterCell7}
                  />
                  <GridColumn
                    field="enddt"
                    title="근무기간(종료)"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn
                    field="eduterm"
                    title="일수"
                    width="100px"
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="edutime"
                    title="시간"
                    width="100px"
                    cell={NumberCell}
                  />
                  <GridColumn field="edunm" title="교육명" width="200px" />
                  <GridColumn field="contents" title="교육내용" width="200px" />
                  <GridColumn field="edueval" title="평가" width="120px" />
                  <GridColumn
                    field="eduoffice"
                    title="교육수료기관"
                    width="150px"
                  />
                  <GridColumn
                    field="files"
                    title="첨부파일"
                    width="150px"
                    cell={ColumnCommandCell7}
                  />
                </Grid>
              </GridContainer>
            </FormContext7.Provider>
          </TabStripTab>
          <TabStripTab
            title="어학사항"
            disabled={workType == "N" ? true : false}
          >
            <FormContext8.Provider
              value={{
                attdatnum8,
                files8,
                setAttdatnum8,
                setFiles8,
                mainDataState8,
                setMainDataState8,
                // fetchGrid,
              }}
            >
              <GridContainer height={position.height - 220 + "px"}>
                <GridTitleContainer>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick8}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                    ></Button>
                    <Button
                      onClick={onDeleteClick8}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: `calc(100% - 35px)` }}
                  data={process(
                    mainDataResult8.data.map((row) => ({
                      ...row,
                      startdt: row.startdt
                        ? new Date(dateformat(row.startdt))
                        : new Date(dateformat("99991231")),
                      enddt: row.enddt
                        ? new Date(dateformat(row.enddt))
                        : new Date(dateformat("99991231")),
                      testdt: row.testdt
                        ? new Date(dateformat(row.testdt))
                        : new Date(dateformat("99991231")),
                      [SELECTED_FIELD]: selectedState8[idGetter8(row)], //선택된 데이터
                    })),
                    mainDataState8
                  )}
                  onDataStateChange={onMainDataStateChange8}
                  {...mainDataState8}
                  //선택 subDataState
                  dataItemKey={DATA_ITEM_KEY8}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange8}
                  //스크롤 조회기능
                  fixedScroll={true}
                  total={mainDataResult8.total}
                  skip={page8.skip}
                  take={page8.take}
                  pageable={true}
                  onPageChange={pageChange8}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange8}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange8}
                  cellRender={customCellRender8}
                  rowRender={customRowRender8}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  <GridColumn
                    field="educd"
                    title="외국어"
                    width="120px"
                    cell={CustomComboBoxCell}
                    footerCell={mainTotalFooterCell8}
                    headerCell={RequiredHeader}
                  />
                  <GridColumn field="testnm" title="시험명" width="150px" />
                  <GridColumn
                    field="score"
                    title="점수"
                    width="100px"
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="testdt"
                    title="일자"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn field="speaking" title="회화" width="150px" />
                  <GridColumn field="country" title="체류국가" width="120px" />
                  <GridColumn
                    field="startdt"
                    title="체류시작"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn
                    field="enddt"
                    title="체류종료"
                    width="120px"
                    cell={DateCell}
                  />
                  <GridColumn
                    field="files"
                    title="첨부파일"
                    width="150px"
                    cell={ColumnCommandCell8}
                  />
                </Grid>
              </GridContainer>
            </FormContext8.Provider>
          </TabStripTab>
        </TabStrip>
        <BottomContainer>
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={selectData}>
              확인
            </Button>
            <Button
              themeColor={"primary"}
              fillMode={"outline"}
              onClick={onClose}
            >
              닫기
            </Button>
          </ButtonContainer>
          <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
            ※ 저장 시 현재 탭만 저장되며, 저장 후 전체 탭이
            새로고침됩니다.&nbsp;(첨부파일은 탭 변경 시 이전으로 복구됩니다.)
          </div>
        </BottomContainer>
      </Window>
      {zipCodeWindowVisible && (
        <ZipCodeWindow
          setVisible={setZipCodeWindowVisibile}
          setData={getZipCodeData}
          para={information.hmzipcode}
        />
      )}
      {zipCodeWindowVisible2 && (
        <ZipCodeWindow
          setVisible={setZipCodeWindowVisibile2}
          setData={getZipCodeData2}
          para={information.zipcode}
        />
      )}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={information.attdatnum}
        />
      )}
      {attachmentsWindowVisible2 && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible2}
          setData={getAttachmentsData2}
          para={information.bankdatnum}
        />
      )}
      {overtimeWindowVisible && (
        <DetailWindow
          setVisible={setOvertimeWindowVisible}
          setData={getOvertime}
          prsnnm={information.prsnnm}
          prsnnum={information.prsnnum}
          pathname={pathname}
        />
      )}
      {bankcdWindowVisible && (
        <BankCDWindow
          setVisible={setBankcdWindowVisible}
          setData={getbankcdData}
        />
      )}
    </>
  );
};

export default CopyWindow;
