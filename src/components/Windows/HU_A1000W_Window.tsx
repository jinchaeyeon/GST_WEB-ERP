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
  TextArea,
} from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { Buffer } from "buffer";
import CryptoJS from "crypto-js";
import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  unsavedAttadatnumsState,
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedNameState,
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import ComboBoxCell from "../Cells/ComboBoxCell";
import DateCell from "../Cells/DateCell";
import RadioGroupCell from "../Cells/RadioGroupCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseParaPc,
  convertDateToStr,
  getGridItemChangedData,
  numberWithCommas3,
  toDate,
} from "../CommonFunction";
import { EDIT_FIELD, GAP, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import CommonDateRangePicker from "../DateRangePicker/CommonDateRangePicker";
import BizComponentRadioGroup from "../RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../Renderers/Renderers";
import BankCDWindow from "./CommonWindows/BankCDWindow";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import ZipCodeWindow from "./CommonWindows/ZipCodeWindow";
import DetailWindow from "./HU_A1000W_Sub_Window";
import RequiredHeader from "../HeaderCells/RequiredHeader";

const DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];
let temp = 0;

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

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_HU020, L_HU009, L_HU700", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "relt"
      ? "L_HU020"
      : field === "schcd"
      ? "L_HU009"
      : field === "dfmyn"
      ? "L_HU700"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
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
    (item: any) => item.bizComponentId === bizComponentIdVal
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
  let isInEdit = field === dataItem.inEdit;
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
      {render === undefined
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
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [tabSelected, setTabSelected] = useState(0);
  const idGetter = getter(DATA_ITEM_KEY);
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 750,
  });
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [attdatnum, setAttdatnum] = useState<string>("");
  const [files, setFiles] = useState<string>("");

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            attdatnum: attdatnum,
            files: files,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
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

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption("HU_A1000W", setCustomOptionData);

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
        }
      }
    }

    if (e.selected == 0) {
      setPosition((prev) => ({
        ...prev,
        height: 750,
      }));
    } else if (e.selected == 1) {
      setPosition((prev) => ({
        ...prev,
        height: 630,
      }));
    } else if (e.selected == 2) {
      setPosition((prev) => ({
        ...prev,
        height: 450,
      }));
    } else if (e.selected == 3) {
      setPosition((prev) => ({
        ...prev,
        height: 350,
      }));
    } else if (e.selected == 4) {
      setPosition((prev) => ({
        ...prev,
        height: 750,
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

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
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
      orgdiv: "01",
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
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "files" && field != "rowstatus") {
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
          abilcd: defaultOption.find((item: any) => item.id === "abilcd")
            .valueCode,
          dptcd: defaultOption.find((item: any) => item.id === "dptcd")
            .valueCode,
          emptype: defaultOption.find((item: any) => item.id === "emptype")
            .valueCode,
          nationcd: defaultOption.find((item: any) => item.id === "nationcd")
            .valueCode,
          path: defaultOption.find((item: any) => item.id === "path").valueCode,
          postcd: defaultOption.find((item: any) => item.id === "postcd")
            .valueCode,
          regcd: defaultOption.find((item: any) => item.id === "regcd")
            .valueCode,
          rtrrsn: defaultOption.find((item: any) => item.id === "rtrrsn")
            .valueCode,
          schcd: defaultOption.find((item: any) => item.id === "schcd")
            .valueCode,
          sexcd: defaultOption.find((item: any) => item.id === "sexcd")
            .valueCode,
          bircd: defaultOption.find((item: any) => item.id === "bircd")
            .valueCode,
          jobcd: defaultOption.find((item: any) => item.id === "jobcd")
            .valueCode,
          location: defaultOption.find((item: any) => item.id === "location")
            .valueCode,
          paycd: defaultOption.find((item: any) => item.id === "paycd")
            .valueCode,
          workgb: defaultOption.find((item: any) => item.id === "workgb")
            .valueCode,
          workcls: defaultOption.find((item: any) => item.id === "workcls")
            .valueCode,
        }));
      }
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "R_BIRCD,R_SEXCD,R_dayoffdiv,R_Rtrtype, R_HOUSEYN, R_MARRIAGE",
    setBizComponentData
  );

  const [information, setInformation] = useState<{ [name: string]: any }>({
    orgdiv: "01",
    prsnnum: "",
    prsnnum2: "",
    location: "01",
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
    imdate: "",
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
    gradutype: "",
    directyn: "",
    laboryn: "N",
    dfmyn: "N",
    milyn: "N",
    paycd: "",
    taxcd: "",
    hirinsuyn: "N",
    payyn: "N",
    rtrgivdiv: "",
    yrgivdiv: "",
    mongivdiv: "",
    caltaxyn: "N",
    yrdclyn: "N",
    bankcd: "",
    banknm: "",
    bankacnt: "",
    bankacntuser: "",
    bankfiles: "",
    bankdatnum: "",
    insuzon: "",
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
    otkind: "",
    bnskind: "N",
    payprovyn: "",
    mailid: "",
    workmail: "",
    childnum: 0,
    dfmyn2: "N",
    houseyn: "",
    remark: "",
    costdiv1: "",
    costdiv2: "",
    path: "",
    attdatnum: "",
    incgb: "",
    exmtaxgb: "",
    exstartdt: "",
    exenddt: "",
    dayoffdiv: "",
    rtrtype: "",

    mngitemcd1: "",
    mngitemcd2: "",
    mngitemcd3: "",
    mngitemcd4: "",
    mngitemcd5: "",
    mngitemcd6: "",
    mngdata1: "",
    mngdata2: "",
    mngdata3: "",
    mngdata4: "",
    mngdata5: "",
    mngdata6: "",
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
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "HU250T",
    orgdiv: "01",
    location: "01",
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
    orgdiv: "01",
    location: "01",
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
    var decrypted = CryptoJS.AES.decrypt(encrypted, secretKey).toString(
      CryptoJS.enc.Utf8
    );
    return decrypted;
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

    if (data.isSuccess === true) {
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
          orgdiv: "01",
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
          imdate: "",
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
          gradutype: "",
          directyn: "",
          laboryn: rows[0].laboryn == "" ? "N" : rows[0].laboryn,
          dfmyn: rows[0].dfmyn == "" ? "N" : rows[0].dfmyn,
          milyn: rows[0].milyn == "" ? "N" : rows[0].milyn,
          paycd: rows[0].paycd,
          taxcd: rows[0].taxcd,
          hirinsuyn: rows[0].hirinsuyn == "" ? "N" : rows[0].hirinsuyn,
          payyn: rows[0].payyn == "" ? "N" : rows[0].payyn,
          rtrgivdiv: "",
          yrgivdiv: "",
          mongivdiv: "",
          caltaxyn: rows[0].caltaxyn == "" ? "N" : rows[0].caltaxyn,
          yrdclyn: rows[0].yrdclyn == "" ? "N" : rows[0].yrdclyn,
          bankcd: rows[0].bankcd,
          banknm: rows[0].banknm,
          bankacnt: rows[0].bankacnt,
          bankacntuser: rows[0].bankacntuser,
          bankfiles: rows[0].bankfiles,
          bankdatnum: rows[0].bankdatnum,
          insuzon: "",
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
          otkind: "",
          bnskind: rows[0].bnskind == "" ? "N" : rows[0].bnskind,
          payprovyn: "",
          mailid: rows[0].mailid,
          workmail: rows[0].workmail,
          childnum: rows[0].childnum,
          dfmyn2: rows[0].dfmyn2 == "" ? "N" : rows[0].dfmyn2,
          houseyn: rows[0].houseyn,
          remark: rows[0].remark,
          costdiv1: "",
          costdiv2: "",
          path: rows[0].path,
          files: rows[0].files,
          attdatnum: rows[0].attdatnum,
          incgb: rows[0].incgb,
          exmtaxgb: rows[0].exmtaxgb,
          exstartdt: rows[0].exstartdt == "" ? null : toDate(rows[0].exstartdt),
          exenddt: rows[0].exenddt == "" ? null : toDate(rows[0].exenddt),
          dayoffdiv: rows[0].dayoffdiv,
          rtrtype: rows[0].rtrtype,

          mngitemcd1: "",
          mngitemcd2: "",
          mngitemcd3: "",
          mngitemcd4: "",
          mngitemcd5: "",
          mngitemcd6: "",
          mngdata1: "",
          mngdata2: "",
          mngdata3: "",
          mngdata4: "",
          mngdata5: "",
          mngdata6: "",
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
          orgdiv: "01",
          prsnnum: "",
          prsnnum2: "",
          location: "01",
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
          imdate: "",
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
          gradutype: "",
          directyn: "",
          laboryn: "N",
          dfmyn: "N",
          milyn: "N",
          paycd: "",
          taxcd: "",
          hirinsuyn: "N",
          payyn: "N",
          rtrgivdiv: "",
          yrgivdiv: "",
          mongivdiv: "",
          caltaxyn: "N",
          yrdclyn: "N",
          bankcd: "",
          banknm: "",
          bankacnt: "",
          bankacntuser: "",
          bankfiles: "",
          bankdatnum: "",
          insuzon: "",
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
          otkind: "",
          bnskind: "N",
          payprovyn: "",
          mailid: "",
          workmail: "",
          childnum: 0,
          dfmyn2: "N",
          houseyn: "",
          remark: "",
          costdiv1: "",
          costdiv2: "",
          path: "",
          attdatnum: "",
          incgb: "",
          exmtaxgb: "",
          exstartdt: "",
          exenddt: "",
          dayoffdiv: "",
          rtrtype: "",

          mngitemcd1: "",
          mngitemcd2: "",
          mngitemcd3: "",
          mngitemcd4: "",
          mngitemcd5: "",
          mngitemcd6: "",
          mngdata1: "",
          mngdata2: "",
          mngdata3: "",
          mngdata4: "",
          mngdata5: "",
          mngdata6: "",
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

    if (data.isSuccess === true) {
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

  useEffect(() => {
    if (workType === "U" && data != undefined) {
      setFilters((prev) => ({
        ...prev,
        orgdiv: "01",
        location: "01",
        dptcd: "",
        prsnnum: data.prsnnum,
        prsnnm: "",
        rtrchk: "%",
        isSearch: true,
        pgNum: 1,
      }));
      setFilters2((prev) => ({
        ...prev,
        orgdiv: "01",
        location: "01",
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
            orgdiv: "01",
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
        orgdiv: "01",
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
        orgdiv: "01",
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
        orgdiv: "01",
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
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length === 0 && deletedMainRows.length == 0) return false;

      let valid = true;
      let valid2 = true;

      dataItem.map((item) => {
        if (
          item.fmlynm == "" ||
          item.relt == "" ||
          item.perregnum == "" ||
          item.schcd == "" ||
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
        dataArr.hu251t_birdt_s.push(birdt == undefined ? "" : birdt);
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
        dataArr.hu251t_birdt_s.push(birdt == undefined ? "" : birdt);
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
        orgdiv: "01",
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
    }
  };

  const [ParaData, setParaData] = useState({
    work_type: "",
    orgdiv: "01",
    prsnnum: "",
    prsnnum2: "",
    location: "01",
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
    imdate: "",
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
    gradutype: "",
    directyn: "",
    laboryn: "N",
    dfmyn: "N",
    milyn: "N",
    paycd: "",
    taxcd: "",
    hirinsuyn: "N",
    payyn: "N",
    rtrgivdiv: "",
    yrgivdiv: "",
    mongivdiv: "",
    caltaxyn: "N",
    yrdclyn: "N",
    bankcd: "",
    bankacnt: "",
    bankacntuser: "",
    bankdatnum: "",
    insuzon: "",
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
    otkind: "",
    bnskind: "N",
    payprovyn: "",
    mailid: "",
    workmail: "",
    childnum: 0,
    dfmyn2: "N",
    houseyn: "",
    remark: "",
    costdiv1: "",
    costdiv2: "",
    path: "",
    attdatnum: "",
    incgb: "",
    exmtaxgb: "",
    exstartdt: "",
    exenddt: "",
    dayoffdiv: "",
    rtrtype: "",

    mngitemcd1: "",
    mngitemcd2: "",
    mngitemcd3: "",
    mngitemcd4: "",
    mngitemcd5: "",
    mngitemcd6: "",
    mngdata1: "",
    mngdata2: "",
    mngdata3: "",
    mngdata4: "",
    mngdata5: "",
    mngdata6: "",
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
    orgdiv: "01",
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
      "@p_imdate": ParaData.imdate,
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
      "@p_gradutype": ParaData.gradutype,
      "@p_directyn": ParaData.directyn,
      "@p_laboryn": ParaData.laboryn,
      "@p_dfmyn": ParaData.dfmyn,
      "@p_milyn": ParaData.milyn,
      "@p_paycd": ParaData.paycd,
      "@p_taxcd": ParaData.taxcd,
      "@p_hirinsuyn": ParaData.hirinsuyn,
      "@p_payyn": ParaData.payyn,
      "@p_rtrgivdiv": ParaData.rtrgivdiv,
      "@p_yrgivdiv": ParaData.yrgivdiv,
      "@p_mongivdiv": ParaData.mongivdiv,
      "@p_caltaxyn": ParaData.caltaxyn,
      "@p_yrdclyn": ParaData.yrdclyn,
      "@p_bankcd": ParaData.bankcd,
      "@p_bankacnt": ParaData.bankacnt,
      "@p_bankacntuser": ParaData.bankacntuser,
      "@p_bankdatnum": ParaData.bankdatnum,
      "@p_insuzon": ParaData.insuzon,
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
      "@p_otkind": ParaData.otkind,
      "@p_bnskind": ParaData.bnskind,
      "@p_payprovyn": ParaData.payprovyn,
      "@p_mailid": ParaData.mailid,
      "@p_workmail": ParaData.workmail,
      "@p_childnum": ParaData.childnum,
      "@p_dfmyn2": ParaData.dfmyn2,
      "@p_houseyn": ParaData.houseyn,
      "@p_remark": ParaData.remark,
      "@p_costdiv1": ParaData.costdiv1,
      "@p_costdiv2": ParaData.costdiv2,
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

      "@p_mngitemcd1": ParaData.mngitemcd1,
      "@p_mngitemcd2": ParaData.mngitemcd2,
      "@p_mngitemcd3": ParaData.mngitemcd3,
      "@p_mngitemcd4": ParaData.mngitemcd4,
      "@p_mngitemcd5": ParaData.mngitemcd5,
      "@p_mngitemcd6": ParaData.mngitemcd6,
      "@p_mngdata1": ParaData.mngdata1,
      "@p_mngdata2": ParaData.mngdata2,
      "@p_mngdata3": ParaData.mngdata3,
      "@p_mngdata4": ParaData.mngdata4,
      "@p_mngdata5": ParaData.mngdata5,
      "@p_mngdata6": ParaData.mngdata6,
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

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setUnsavedName([]);

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
      }
      setTempAttach({
        attdatnum: "",
        files: "",
        bankdatnum: "",
        bankfiles: "",
        attdatnumList: [],
        filesList: [],
      });
      setParaData({
        work_type: "",
        orgdiv: "01",
        prsnnum: "",
        prsnnum2: "",
        location: "01",
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
        imdate: "",
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
        gradutype: "",
        directyn: "",
        laboryn: "N",
        dfmyn: "N",
        milyn: "N",
        paycd: "",
        taxcd: "",
        hirinsuyn: "N",
        payyn: "N",
        rtrgivdiv: "",
        yrgivdiv: "",
        mongivdiv: "",
        caltaxyn: "N",
        yrdclyn: "N",
        bankcd: "",
        bankacnt: "",
        bankacntuser: "",
        bankdatnum: "",
        insuzon: "",
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
        otkind: "",
        bnskind: "N",
        payprovyn: "",
        mailid: "",
        workmail: "",
        childnum: 0,
        dfmyn2: "N",
        houseyn: "",
        remark: "",
        costdiv1: "",
        costdiv2: "",
        path: "",
        attdatnum: "",
        incgb: "",
        exmtaxgb: "",
        exstartdt: "",
        exenddt: "",
        dayoffdiv: "",
        rtrtype: "",

        mngitemcd1: "",
        mngitemcd2: "",
        mngitemcd3: "",
        mngitemcd4: "",
        mngitemcd5: "",
        mngitemcd6: "",
        mngdata1: "",
        mngdata2: "",
        mngdata3: "",
        mngdata4: "",
        mngdata5: "",
        mngdata6: "",
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

    if (data.isSuccess === true) {
      let array: any[] = [];

      deletedMainRows.map((item: any) => {
        array.push(item.attdatnum);
      });

      setDeletedAttadatnums(array);

      setUnsavedName([]);
      setUnsavedAttadatnums([]);
      deletedMainRows = [];
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

      setTempAttach({
        attdatnum: "",
        files: "",
        bankdatnum: "",
        bankfiles: "",
        attdatnumList: [],
        filesList: [],
      });
      setParaData2({
        work_type: "",
        orgdiv: "01",
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

  return (
    <>
      <Window
        title={workType === "N" ? "사용자생성" : "사용자수정"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <TabStrip
          style={{ width: "100%", height: `calc(100% - 55px)` }}
          selected={tabSelected}
          onSelect={handleSelectTab}
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
                      <Input
                        name="agenum"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(information.agenum)}
                        onChange={InputChange}
                      />
                    </td>
                    <th>경로자70</th>
                    <td>
                      <Input
                        name="agenum70"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(information.agenum70)}
                        onChange={InputChange}
                      />
                    </td>
                    <th>부양자(본인미포함)</th>
                    <td>
                      <Input
                        name="sptnum"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(information.sptnum)}
                        onChange={InputChange}
                      />
                    </td>
                    <th>자녀양육</th>
                    <td>
                      <Input
                        name="brngchlnum"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(information.brngchlnum)}
                        onChange={InputChange}
                      />
                    </td>
                    <th>장애자</th>
                    <td>
                      <Input
                        name="dfmnum"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(information.dfmnum)}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>다자녀</th>
                    <td>
                      <Input
                        name="childnum"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(information.childnum)}
                        onChange={InputChange}
                      />
                    </td>
                    <th>가족수당배우</th>
                    <td>
                      <Input
                        name="fam1"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(information.fam1)}
                        onChange={InputChange}
                      />
                    </td>
                    <th>가족수당자녀</th>
                    <td>
                      <Input
                        name="fam2"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(information.fam2)}
                        onChange={InputChange}
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
                          <Input
                            name="height"
                            type="number"
                            style={{
                              textAlign: "right",
                            }}
                            value={numberWithCommas3(information.height)}
                            onChange={InputChange}
                          />
                        </td>
                        <th>체중</th>
                        <td>
                          <Input
                            name="weight"
                            type="number"
                            style={{
                              textAlign: "right",
                            }}
                            value={numberWithCommas3(information.weight)}
                            onChange={InputChange}
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
                          <Input
                            name="leye"
                            type="number"
                            style={{
                              textAlign: "right",
                            }}
                            value={numberWithCommas3(information.leye)}
                            onChange={InputChange}
                          />
                        </td>
                        <th>시력(우)</th>
                        <td>
                          <Input
                            name="reye"
                            type="number"
                            style={{
                              textAlign: "right",
                            }}
                            value={numberWithCommas3(information.reye)}
                            onChange={InputChange}
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
                      birdt: row.birdt != "" ? toDate(row.birdt) : new Date(),
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
                    headerCell={RequiredHeader}
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
          ></TabStripTab>
          <TabStripTab
            title="면허/자격사항"
            disabled={workType == "N" ? true : false}
          ></TabStripTab>
          <TabStripTab
            title="경력사항"
            disabled={workType == "N" ? true : false}
          ></TabStripTab>
          <TabStripTab
            title="인사발령사항"
            disabled={workType == "N" ? true : false}
          ></TabStripTab>
          <TabStripTab
            title="상벌사항"
            disabled={workType == "N" ? true : false}
          ></TabStripTab>
          <TabStripTab
            title="교육사항"
            disabled={workType == "N" ? true : false}
          ></TabStripTab>
          <TabStripTab
            title="어학사항"
            disabled={workType == "N" ? true : false}
          ></TabStripTab>
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
          <div>
            ※ 현재 탭만 저장되며, 저장 후 새로고침됩니다.(첨부파일은 탭 변경 시
            이전으로 복구됩니다.)
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
