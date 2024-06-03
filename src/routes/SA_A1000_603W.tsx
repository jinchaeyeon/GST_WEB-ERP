import {
  Card,
  CardContent,
  Step,
  StepIconProps,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";

import {
  MultiSelect,
  MultiSelectChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridRowDoubleClickEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import {
  Checkbox,
  Input,
  InputChangeEvent,
  NumericTextBox,
  TextArea,
} from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInGridInput,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat,
  dateformat2,
  findMessage,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  getItemQuery,
  handleKeyPressSearch,
  isValidDate,
  numberWithCommas3,
  setDefaultDate,
  setDefaultDate2,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ProjectsWindow from "../components/Windows/CM_A7000W_Project_Window";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import RevWindow from "../components/Windows/SA_A1000W_REV_Window";
import SA_A1000_603W_Design2_Window from "../components/Windows/SA_A1000_603W_Design2_Window";
import SA_A1000_603W_Design3_Window from "../components/Windows/SA_A1000_603W_Design3_Window";
import SA_A1000_603W_Design4_Window from "../components/Windows/SA_A1000_603W_Design4_Window";
import SA_A1000_603W_Design_Window from "../components/Windows/SA_A1000_603W_Design_Window";
import SA_A1000_603W_Window from "../components/Windows/SA_A1000_603W_Window";
import { useApi } from "../hooks/api";
import { IAttachmentData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  heightstate,
  isFilterHideState,
  isLoading,
  isMobileState,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/SA_A1000_603W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

type TdataArr = {
  rowstatus_s: string[];
  quoseq_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  glpyn_s: string[];
  startdt_s: string[];
  enddt_s: string[];
  remark_s: string[];
};

type TdataArr2 = {
  quonum_s: string[];
  quorev_s: string[];
  progress_status_s: string[];
};

interface IPrsnnum {
  user_id: string;
  user_name: string;
}

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
const DATA_ITEM_KEY5 = "num";
const DATA_ITEM_KEY6 = "num";
const DATA_ITEM_KEY7 = "num";
let targetRowIndex: null | number = null;
const dateField = [
  "quodt",
  "startdt",
  "enddt",
  "recdt",
  "request_date",
  "cotracdt",
  "recdt",
  "pubdt",
];
const RadioField = ["glpyn"];
const numberField = [
  "quoseq",
  "quounp",
  "margin",
  "marginamt",
  "discount",
  "discountamt",
  "finalquowonamt",
  "week_b",
  "week_r",
  "qty_t",
  "totqty",
];
const itemField = ["itemcd"];
const colorField = ["status"];
const centerField = ["passdt", "quorev", "itemcnt"];
const centerField2 = ["status"];
const headerField = ["itemcd", "itemnm"];
const percentField = ["rate"];

let temp2 = 0;
let deletedMainRows2: any[] = [];

const CustomColorCell = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field = "" } = props;

  const styles =
    props.dataItem.status == "의뢰"
      ? {
          backgroundColor: "#ffc000",
          color: "white",
        }
      : props.dataItem.status == "견적"
      ? {
          backgroundColor: "#70ad47",
          color: "white",
        }
      : props.dataItem.status == "계약"
      ? {
          backgroundColor: "#0070c0",
          color: "white",
        }
      : {};

  return (
    <td
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={styles}
    >
      {dataItem[field]}
    </td>
  );
};

export const FormContext = createContext<{
  itemInfo: TItemInfo;
  setItemInfo: (d: React.SetStateAction<TItemInfo>) => void;
}>({} as any);

type TItemInfo = {
  itemcd: string;
  itemno: string;
  itemnm: string;
  insiz: string;
  model: string;
  itemacnt: string;
  itemacntnm: string;
  bnatur: string;
  spec: string;
  invunit: string;
  invunitnm: string;
  unitwgt: string;
  wgtunit: string;
  wgtunitnm: string;
  maker: string;
  dwgno: string;
  remark: string;
  itemlvl1: string;
  itemlvl2: string;
  itemlvl3: string;
  extra_field1: string;
  extra_field2: string;
  extra_field7: string;
  extra_field6: string;
  extra_field8: string;
  packingsiz: string;
  unitqty: string;
  color: string;
  gubun: string;
  qcyn: string;
  outside: string;
  itemthick: string;
  itemlvl4: string;
  itemlvl5: string;
  custitemnm: string;
};

const defaultItemInfo = {
  itemcd: "",
  itemno: "",
  itemnm: "",
  insiz: "",
  model: "",
  itemacnt: "",
  itemacntnm: "",
  bnatur: "",
  spec: "",
  invunit: "",
  invunitnm: "",
  unitwgt: "",
  wgtunit: "",
  wgtunitnm: "",
  maker: "",
  dwgno: "",
  remark: "",
  itemlvl1: "",
  itemlvl2: "",
  itemlvl3: "",
  extra_field1: "",
  extra_field2: "",
  extra_field7: "",
  extra_field6: "",
  extra_field8: "",
  packingsiz: "",
  unitqty: "",
  color: "",
  gubun: "",
  qcyn: "",
  outside: "",
  itemthick: "",
  itemlvl4: "",
  itemlvl5: "",
  custitemnm: "",
};

interface IItemData {
  itemcd: string;
  itemno: string;
  itemnm: string;
  insiz: string;
  model: string;
  itemacnt: string;
  itemacntnm: string;
  bnatur: string;
  spec: string;
  invunit: string;
  invunitnm: string;
  unitwgt: string;
  wgtunit: string;
  wgtunitnm: string;
  maker: string;
  dwgno: string;
  remark: string;
  itemlvl1: string;
  itemlvl2: string;
  itemlvl3: string;
  extra_field1: string;
  extra_field2: string;
  extra_field7: string;
  extra_field6: string;
  extra_field8: string;
  packingsiz: string;
  unitqty: string;
  color: string;
  gubun: string;
  qcyn: string;
  outside: string;
  itemthick: string;
  itemlvl4: string;
  itemlvl5: string;
  custitemnm: string;
}

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
  const { setItemInfo } = useContext(FormContext);
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

  const [itemWindowVisible2, setItemWindowVisible2] = useState<boolean>(false);

  const onItemWndClick2 = () => {
    setItemWindowVisible2(true);
  };

  const setItemData2 = (data: IItemData) => {
    const {
      itemcd,
      itemno,
      itemnm,
      insiz,
      model,
      itemacnt,
      itemacntnm,
      bnatur,
      spec,
      invunit,
      invunitnm,
      unitwgt,
      wgtunit,
      wgtunitnm,
      maker,
      dwgno,
      remark,
      itemlvl1,
      itemlvl2,
      itemlvl3,
      extra_field1,
      extra_field2,
      extra_field7,
      extra_field6,
      extra_field8,
      packingsiz,
      unitqty,
      color,
      gubun,
      qcyn,
      outside,
      itemthick,
      itemlvl4,
      itemlvl5,
      custitemnm,
    } = data;
    setItemInfo({
      itemcd,
      itemno,
      itemnm,
      insiz,
      model,
      itemacnt,
      itemacntnm,
      bnatur,
      spec,
      invunit,
      invunitnm,
      unitwgt,
      wgtunit,
      wgtunitnm,
      maker,
      dwgno,
      remark,
      itemlvl1,
      itemlvl2,
      itemlvl3,
      extra_field1,
      extra_field2,
      extra_field7,
      extra_field6,
      extra_field8,
      packingsiz,
      unitqty,
      color,
      gubun,
      qcyn,
      outside,
      itemthick,
      itemlvl4,
      itemlvl5,
      custitemnm,
    });
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      <>
        {isInEdit ? (
          <Input value={value} onChange={handleChange} type="text" />
        ) : (
          value
        )}
        <ButtonInGridInput>
          <Button
            name="itemcd"
            onClick={onItemWndClick2}
            icon="more-horizontal"
            fillMode="flat"
          />
        </ButtonInGridInput>
      </>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {itemWindowVisible2 && (
        <ItemsWindow
          setVisible={setItemWindowVisible2}
          workType={"ROW_ADD"}
          setData={setItemData2}
          modal={true}
          yn={false}
        />
      )}
    </>
  );
};

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("R_GLP", setBizComponentData);
  //합부판정
  const field = props.field ?? "";
  const bizComponentIdVal = field == "glpyn" ? "R_GLP" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const CustomPercentCell = (props: GridCellProps) => {
  const field = props.field ?? "";
  const value = props.dataItem[field];
  return (
    <td
      style={{ textAlign: "right" }}
      aria-colindex={props.ariaColumnIndex}
      data-grid-col-index={props.columnIndex}
    >
      {value}%
    </td>
  );
};

const SA_A1000_603W: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const idGetter6 = getter(DATA_ITEM_KEY6);
  const idGetter7 = getter(DATA_ITEM_KEY7);
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = getHeight(".k-tabstrip-items-wrapper");
  var height1 = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
  var height3 = getHeight(".ButtonContainer3");
  var height4 = getHeight(".ButtonContainer4");
  var height5 = getHeight(".ButtonContainer5");
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();

  const pc = UseGetValueFromSessionItem("pc");

  let gridRef: any = useRef(null);
  const userId = UseGetValueFromSessionItem("user_id");
  const [step, setStep] = React.useState(-1);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SA_A1000_603W", setCustomOptionData);
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const [worktype, setWorktype] = useState<"N" | "U">("U");
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("SA_A1000_603W", setMessagesData);
  useEffect(() => {
    (async () => {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] ==
        parseInt(Object.getOwnPropertyNames(selectedState2)[0])
          ? {
              ...item,
              itemcd: itemInfo.itemcd,
              itemno: itemInfo.itemno,
              itemnm: itemInfo.itemnm,
              insiz: itemInfo.insiz,
              model: itemInfo.model,
              bnatur: itemInfo.bnatur,
              spec: itemInfo.spec,
              //invunit
              qtyunit: itemInfo.invunit,
              invunitnm: itemInfo.invunitnm,
              unitwgt: itemInfo.unitwgt,
              wgtunit: itemInfo.wgtunit,
              wgtunitnm: itemInfo.wgtunitnm,
              maker: itemInfo.maker,
              dwgno: itemInfo.dwgno,
              remark: itemInfo.remark,
              itemlvl1: itemInfo.itemlvl1,
              itemlvl2: itemInfo.itemlvl2,
              itemlvl3: itemInfo.itemlvl3,
              extra_field1: itemInfo.extra_field1,
              extra_field2: itemInfo.extra_field2,
              extra_field7: itemInfo.extra_field7,
              extra_field6: itemInfo.extra_field6,
              extra_field8: itemInfo.extra_field8,
              packingsiz: itemInfo.packingsiz,
              unitqty: itemInfo.unitqty,
              color: itemInfo.color,
              gubun: itemInfo.gubun,
              qcyn: itemInfo.qcyn,
              outside: itemInfo.outside,
              itemthick: itemInfo.itemthick,
              itemlvl4: itemInfo.itemlvl4,
              itemlvl5: itemInfo.itemlvl5,
              custitemnm: itemInfo.custitemnm,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              [EDIT_FIELD]: undefined,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    })();
  }, [itemInfo]);

  const history = useHistory();
  const location = useLocation();

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const queryParams = new URLSearchParams(location.search);
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      if (queryParams.has("go")) {
        history.replace({}, "");
        setFilters((prev) => ({
          ...prev,
          materialtype: defaultOption.find(
            (item: any) => item.id == "materialtype"
          )?.valueCode,
          quotype: defaultOption.find((item: any) => item.id == "quotype")
            ?.valueCode,
          infrdt: setDefaultDate(customOptionData, "infrdt"),
          intodt: setDefaultDate(customOptionData, "intodt"),
          extra_field2: defaultOption.find(
            (item: any) => item.id == "extra_field2"
          )?.valueCode,
          find_row_value: queryParams.get("go") as string,
          isSearch: true,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          materialtype: defaultOption.find(
            (item: any) => item.id == "materialtype"
          )?.valueCode,
          quotype: defaultOption.find((item: any) => item.id == "quotype")
            ?.valueCode,
          infrdt: setDefaultDate(customOptionData, "infrdt"),
          intodt: setDefaultDate(customOptionData, "intodt"),
          extra_field2: defaultOption.find(
            (item: any) => item.id == "extra_field2"
          )?.valueCode,
          isSearch: true,
        }));
      }
    }
  }, [customOptionData]);

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_CM501_603, R_YN4, L_HU005, L_SA018_603,L_SA017_603,L_SA016_603,L_SA015_603, L_SA014_603, L_SA013_603, L_SA012_603, L_BA016_603, L_SA002, L_BA171, L_BA057, L_Requestgb, L_SA019_603, L_SA001_603, L_SA004, L_SA016, L_CM501_603, L_SA011_603, L_CM500_603, L_sysUserMaster_001",
    setBizComponentData
  );
  const [materialgbListData, setMaterialgbListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [assaygbeListData, setAssaygbeListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [startschgbListData, setStartschgbListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [financegbListData, setFinancegbListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [amtgbListData, setAmtgbListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [addordgbListData, setAddordgbListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [relationgbListData, setRelationgbListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [statusListData3, setStatusListData3] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [meditypeListData, setMeditypeListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [quotypeListData, setQuotypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [quostsListData, setQuostsListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [materialtypeListData, setMaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [statusListData, setStatusListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [statusListData2, setStatusListData2] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [ordstsListData, setOrdstsListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [extra_field2ListData, setExtra_field2ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setMaterialgbListData(getBizCom(bizComponentData, "L_SA012_603"));
      setAssaygbeListData(getBizCom(bizComponentData, "L_SA013_603"));
      setStartschgbListData(getBizCom(bizComponentData, "L_SA014_603"));
      setFinancegbListData(getBizCom(bizComponentData, "L_SA015_603"));
      setAmtgbListData(getBizCom(bizComponentData, "L_SA016_603"));
      setAddordgbListData(getBizCom(bizComponentData, "L_SA017_603"));
      setRelationgbListData(getBizCom(bizComponentData, "L_SA018_603"));
      setStatusListData3(getBizCom(bizComponentData, "L_BA016_603"));
      setOrdstsListData(getBizCom(bizComponentData, "L_SA002"));
      setItemlvl1ListData(getBizCom(bizComponentData, "L_BA171"));
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setQuotypeListData(getBizCom(bizComponentData, "L_SA016"));
      setQuostsListData(getBizCom(bizComponentData, "L_SA004"));
      setMaterialtypeListData(getBizCom(bizComponentData, "L_SA001_603"));
      setMeditypeListData(getBizCom(bizComponentData, "L_CM501_603"));
      setStatusListData(getBizCom(bizComponentData, "L_CM500_603"));
      setStatusListData2(getBizCom(bizComponentData, "L_SA011_603"));
      setExtra_field2ListData(getBizCom(bizComponentData, "L_CM501_603"));
    }
  }, [bizComponentData]);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);
  const [page6, setPage6] = useState(initialPageState);
  const [page7, setPage7] = useState(initialPageState);

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

  const pageChange6 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters6((prev) => ({
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

    setFilters7((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage7({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

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
  const [tempState2, setTempState2] = useState<State>({
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
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
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
  const [selectedState9, setSelectedState9] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);
  const [designWindowVisible, setDesignWindowVisible] =
    useState<boolean>(false);
  const [designWindowVisible2, setDesignWindowVisible2] =
    useState<boolean>(false);
  const [designWindowVisible3, setDesignWindowVisible3] =
    useState<boolean>(false);
  const [designWindowVisible4, setDesignWindowVisible4] =
    useState<boolean>(false);
  const [revWindowVisible, setRevWindowVisible] = useState<boolean>(false);
  const onDesignWndClick = () => {
    const data = mainDataResult2.data.filter(
      (item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
    )[0];

    if (data != undefined) {
      if (data.rowstatus == "N" || data.rowstatus == "U") {
        alert("저장 후 조회해주세요.");
      } else {
        if (data.type == "Basic") {
          setDesignWindowVisible(true);
        } else if (data.type == "Cheomdan") {
          setDesignWindowVisible2(true);
        } else if (data.type == "Invitro") {
          setDesignWindowVisible3(true);
        } else if (data.type == "Analyze") {
          setDesignWindowVisible4(true);
        } else {
          alert("미정");
        }
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onProejctWndClick = () => {
    setProjectWindowVisible(true);
  };

  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  let _export5: any;
  let _export6: any;
  let _export7: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridTwo.sheets[0].title = "의뢰품목";
        _export2.save(optionsGridTwo);
      }
    }
    //추후 계약가능성관리 하단 그리드 생기면 변경필요
    if (_export3 !== null && _export3 !== undefined) {
      if (tabSelected == 2) {
        const optionsGridThree = _export3.workbookOptions();
        const optionsGridFour = _export4.workbookOptions();
        const optionsGridFive = _export5.workbookOptions();
        const optionsGridSix = _export6.workbookOptions();
        optionsGridThree.sheets[1] = optionsGridFour.sheets[0];
        optionsGridThree.sheets[2] = optionsGridFive.sheets[0];
        optionsGridThree.sheets[3] = optionsGridSix.sheets[0];
        optionsGridThree.sheets[0].title = "코멘트";
        optionsGridThree.sheets[1].title = "상담";
        optionsGridThree.sheets[2].title = "컨설팅";
        optionsGridThree.sheets[3].title = "견적";
        _export3.save(optionsGridThree);
      }
    }
    if (_export7 !== null && _export7 !== undefined) {
      if (tabSelected == 3) {
        const optionsGridSeven = _export7.workbookOptions();
        optionsGridSeven.sheets[0].title = "시험리스트";
        _export7.save(optionsGridSeven);
      }
    }
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const fetchItemData = React.useCallback(
    async (itemcd: string) => {
      let data: any;
      const queryStr = getItemQuery({ itemcd: itemcd, itemnm: "" });
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
          const {
            itemcd,
            itemno,
            itemnm,
            insiz,
            model,
            itemacnt,
            itemacntnm,
            bnatur,
            spec,
            invunit,
            invunitnm,
            unitwgt,
            wgtunit,
            wgtunitnm,
            maker,
            dwgno,
            remark,
            itemlvl1,
            itemlvl2,
            itemlvl3,
            extra_field1,
            extra_field2,
            extra_field7,
            extra_field6,
            extra_field8,
            packingsiz,
            unitqty,
            color,
            gubun,
            qcyn,
            outside,
            itemthick,
            itemlvl4,
            itemlvl5,
            custitemnm,
          } = rows[0];
          setItemInfo({
            itemcd,
            itemno,
            itemnm,
            insiz,
            model,
            itemacnt,
            itemacntnm,
            bnatur,
            spec,
            invunit,
            invunitnm,
            unitwgt,
            wgtunit,
            wgtunitnm,
            maker,
            dwgno,
            remark,
            itemlvl1,
            itemlvl2,
            itemlvl3,
            extra_field1,
            extra_field2,
            extra_field7,
            extra_field6,
            extra_field8,
            packingsiz,
            unitqty,
            color,
            gubun,
            qcyn,
            outside,
            itemthick,
            itemlvl4,
            itemlvl5,
            custitemnm,
          });
        } else {
          const newData = mainDataResult2.data.map((item: any) =>
            item[DATA_ITEM_KEY2] ==
            Object.getOwnPropertyNames(selectedState2)[0]
              ? {
                  ...item,
                  itemcd: item.itemcd,
                  itemno: "",
                  itemnm: "",
                  insiz: "",
                  model: "",
                  itemacnt: "",
                  itemacntnm: "",
                  bnatur: "",
                  spec: "",
                  invunit: "",
                  invunitnm: "",
                  unitwgt: "",
                  wgtunit: "",
                  wgtunitnm: "",
                  maker: "",
                  dwgno: "",
                  remark: "",
                  itemlvl1: "",
                  itemlvl2: "",
                  itemlvl3: "",
                  extra_field1: "",
                  extra_field2: "",
                  extra_field7: "",
                  extra_field6: "",
                  extra_field8: "",
                  packingsiz: "",
                  unitqty: "",
                  color: "",
                  gubun: "",
                  qcyn: "",
                  outside: "",
                  itemthick: "",
                  itemlvl4: "",
                  itemlvl5: "",
                  custitemnm: "",
                  [EDIT_FIELD]: undefined,
                }
              : {
                  ...item,
                  [EDIT_FIELD]: undefined,
                }
          );
          setMainDataResult2((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [mainDataResult2]
  );

  const search = () => {
    resetAllGrid();
    setTabSelected(0);
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    setFilters((prev: any) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
      find_row_value: "",
    }));
  };

  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setPage5(initialPageState);
    setPage6(initialPageState);
    setPage7(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState));
    setMainDataResult4(process([], mainDataState4));
    setMainDataResult5(process([], mainDataState5));
    setMainDataResult6(process([], mainDataState6));
    setMainDataResult7(process([], mainDataState7));
    setMainDataResult8(process([], mainDataState8));
    deletedMainRows2 = [];
  };

  const [tabSelected, setTabSelected] = React.useState(0);
  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
  const handleSelectTab = (e: any) => {
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
      setUnsavedAttadatnums([]);
    }
    if (isMobile) {
      setIsFilterHideStates(true);
    }
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
      }));
    } else if (e.selected == 1) {
      const selectedRowData = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      setFilters2((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
        quonum: selectedRowData.quonum,
        quorev: selectedRowData.quorev,
      }));
    } else if (e.selected == 2) {
      const selectedRowData = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      setFilters3((prev) => ({
        ...prev,
        pgNum: 1,
        quonum: selectedRowData.quonum,
        quorev: selectedRowData.quorev,
        isSearch: true,
      }));
      setFilters4((prev) => ({
        ...prev,
        pgNum: 1,
        quonum: selectedRowData.quonum,
        quorev: selectedRowData.quorev,
        isSearch: true,
      }));
      setFilters5((prev) => ({
        ...prev,
        pgNum: 1,
        quonum: selectedRowData.quonum,
        quorev: selectedRowData.quorev,
        isSearch: true,
      }));
      setFilters6((prev) => ({
        ...prev,
        pgNum: 1,
        quonum: selectedRowData.quonum,
        quorev: selectedRowData.quorev,
        isSearch: true,
      }));
    } else if (e.selected == 3) {
      const selectedRowData = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      setFilters7((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
        quonum: selectedRowData.quonum,
        quorev: selectedRowData.quorev,
      }));
    }
    setTabSelected(e.selected);
  };

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "smpersonnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        smperson: value == "" ? "" : prev.smperson,
      }));
    } else if (name == "custnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        custcd: value == "" ? "" : prev.custcd,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const setProjectData = (data: any) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        quonum: data.quokey,
      };
    });
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "glp1" || name == "guid1" || name == "agency1") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "A" : "",
      }));
    } else if (name == "glp2" || name == "guid2" || name == "agency2") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "B" : "",
      }));
    } else if (name == "glp3" || name == "guid3" || name == "agency3") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "C" : "",
      }));
    } else if (name == "glp4" || name == "guid4" || name == "agency4") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "D" : "",
      }));
    } else if (name == "glp5" || name == "guid5" || name == "agency5") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "E" : "",
      }));
    } else if (name == "agency6") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "K" : "",
        etcagency: "",
      }));
    } else if (name == "guid6") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "K" : "",
        etcguid: "",
      }));
    } else if (name == "glp6") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "K" : "",
        etcglp: "",
      }));
    } else if (name == "translate1" || name == "report1") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "K" : "",
      }));
    } else if (name == "translate2" || name == "report2") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "E" : "",
      }));
    } else if (name == "translate3" || name == "report3") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "J" : "",
      }));
    } else if (name == "report4") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "T" : "",
        etcreport: "",
      }));
    } else if (name == "translate4") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "T" : "",
        etctranslatereport: "",
      }));
    } else {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

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

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [printWindowVisible, setPrintWindowVisible] = useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
  };
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  const onPrint = () => {
    setPrintWindowVisible(true);
  };
  const getAttachmentsData = (data: IAttachmentData) => {
    setInformation((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };
  interface ICustData {
    address: string;
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }

  const setCustData = (data: ICustData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };

  const setCustData2 = (data: ICustData) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };

  //조회조건 초기값
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    custcd: "",
    custnm: "",
    finyn: "",
    quotype: "",
    materialtype: "",
    quonum: "",
    quorev: 0,
    quoseq: 0,
    status: [],
    extra_field2: "",
    smperson: "",
    smpersonnm: "",
    frdt: null,
    todt: null,
    infrdt: new Date(),
    intodt: new Date(),
    yn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL1",
    quonum: "",
    quorev: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    quonum: "",
    quorev: 0,
    pgNum: 1,
    isSearch: true,
  });
  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    quonum: "",
    quorev: 0,
    pgNum: 1,
    isSearch: true,
  });
  const [filters5, setFilters5] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    quonum: "",
    quorev: 0,
    pgNum: 1,
    isSearch: true,
  });
  const [filters6, setFilters6] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    quonum: "",
    quorev: 0,
    pgNum: 1,
    isSearch: true,
  });
  const [filters7, setFilters7] = useState({
    pgSize: PAGE_SIZE,
    quonum: "",
    quorev: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  const [filters8, setFilters8] = useState({
    pgSize: PAGE_SIZE,
    quonum: "",
    quorev: 0,
    quoseq: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  const [Information, setInformation] = useState<{ [name: string]: any }>({
    custcd: "",
    custnm: "",
    custprsnnm: "",
    chkperson: "",
    postcd: "",
    tel: "",
    extra_field4: "",
    email: "",
    rcvpostcd: "",
    rcvtel: "",
    extra_field5: "",
    rcvemail: "",
    extra_field3: "",
    extra_field2: "",
    materialinfo: "",
    agency1: "",
    agency2: "",
    agency3: "",
    agency4: "",
    agency5: "",
    agency6: "",
    etcagency: "",
    reportcnt: 0,
    transreportcnt: 0,
    attdatnum: "",
    files: "",
    assayyn: "",
    assaydt: null,
    glp1: "",
    glp2: "",
    glp3: "",
    glp4: "",
    glp5: "",
    glp6: "",
    etcglp: "",
    guid1: "",
    guid2: "",
    guid3: "",
    guid4: "",
    guid5: "",
    guid6: "",
    etcguid: "",
    materialindt: new Date(),
    materialnm: "",
    materialtype: "",
    numbering_id: "",
    ordsts: "",
    person: "",
    person1: "",
    pubdt: new Date(),
    quodt: new Date(),
    quonum: "",
    quorev: 0,
    quosts: "",
    quotype: "",
    rcvcustnm: "",
    rcvcustprsnnm: "",
    remark: "",
    remark2: "",
    remark3: "",
    report1: "",
    report2: "",
    report3: "",
    report4: "",
    etcreport: "",
    requestgb: "A",
    rev_reason: "",
    testenddt: null,
    teststdt: null,
    testtype: "",
    translate1: "",
    translate2: "",
    translate3: "",
    translate4: "",
    etctranslatereport: "",
  });

  const [Information2, setInformation2] = useState<{ [name: string]: any }>({
    addordgb: "",
    amtgb: "",
    assaygbe: "",
    financegb: "",
    grade1: 0,
    grade2: 0,
    grade3: 0,
    grade4: 0,
    grade5: 0,
    grade6: 0,
    grade7: 0,
    materialgb: "",
    orgdiv: sessionOrgdiv,
    relationgb: "",
    startschgb: "",
    totgrade1: 0,
    totgrade2: 0,
    level1: "",
    level2: "",
    quorev: "",
    conplandt: "",
    submitdt: "",
    seq: 0,
    passdt: 0,
  });

  function getName(data: { sub_code: string }[]) {
    let str = "";
    data.map((item: { sub_code: string }) => (str += item.sub_code + "|"));
    return data.length > 0 ? str.slice(0, -1) : str;
  }

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const status =
      filters.status.length == 0
        ? "1|2|3|4"
        : filters.status.length == 1
        ? filters.status[0].sub_code
        : getName(filters.status);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1000_603W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_finyn": filters.finyn,
        "@p_quotype": filters.quotype,
        "@p_materialtype": filters.materialtype,
        "@p_quonum": filters.quonum,
        "@p_quorev": filters.quorev,
        "@p_quoseq": filters.quoseq,
        "@p_status": status,
        "@p_extra_field2": filters.extra_field2,
        "@p_smperson": filters.smpersonnm == "" ? "" : filters.smperson,
        "@p_smpersonnm": filters.smpersonnm,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_in_frdt": convertDateToStr(filters.infrdt),
        "@p_in_todt": convertDateToStr(filters.intodt),
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
      //status 임시
      // const rows = data.tables[0].Rows;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        feasibility:
          item.totgrade1 >= 12
            ? "상"
            : item.totgrade1 >= 7
            ? "중"
            : item.totgrade1 >= 1
            ? "하"
            : "",
        weight:
          item.totgrade2 >= 7
            ? "상"
            : item.totgrade2 >= 4
            ? "중"
            : item.totgrade2 >= 1
            ? "하"
            : "",
      }));
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.quokey == filters.find_row_value
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
            : rows.find((row: any) => row.quokey == filters.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            quonum: selectedRow.quonum,
            quorev: selectedRow.quorev,
          }));
          setFilters3((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            quonum: selectedRow.quonum,
            quorev: selectedRow.quorev,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            quonum: rows[0].quonum,
            quorev: rows[0].quorev,
          }));
          setFilters3((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            quonum: rows[0].quonum,
            quorev: rows[0].quorev,
          }));
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
      procedureName: "P_SA_A1000_603W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_finyn": filters.finyn,
        "@p_quotype": filters.quotype,
        "@p_materialtype": filters.materialtype,
        "@p_quonum": filters2.quonum,
        "@p_quorev": filters2.quorev,
        "@p_quoseq": filters.quoseq,
        "@p_status": "",
        "@p_extra_field2": filters.extra_field2,
        "@p_smperson": filters.smpersonnm == "" ? "" : filters.smperson,
        "@p_smpersonnm": filters.smpersonnm,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_in_frdt": convertDateToStr(filters.infrdt),
        "@p_in_todt": convertDateToStr(filters.intodt),
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const RowCnt = data.tables[0].RowCount;
      const row = data.tables[0].Rows;
      const totalRowCnt = data.tables[1].TotalRowCount;
      const rows = data.tables[1].Rows;

      if (RowCnt > 0) {
        setWorktype("U");
        setInformation({
          chkperson: row[0].chkperson,
          custcd: row[0].custcd,
          custnm: row[0].custnm,
          postcd: row[0].postcd,
          tel: row[0].tel,
          extra_field4: row[0].extra_field4,
          email: row[0].email,
          rcvpostcd: row[0].rcvpostcd,
          rcvtel: row[0].rcvtel,
          extra_field5: row[0].extra_field5,
          rcvemail: row[0].rcvemail,
          custprsnnm: row[0].custprsnnm,

          extra_field3: row[0].extra_field3,
          extra_field2: row[0].extra_field2,
          materialinfo: row[0].materialinfo,
          agency1: row[0].agency1,
          agency2: row[0].agency2,
          agency3: row[0].agency3,
          agency4: row[0].agency4,
          agency5: row[0].agency5,
          agency6: row[0].agency6,
          etcagency: row[0].etcagency,
          reportcnt: row[0].reportcnt,
          transreportcnt: row[0].transreportcnt,
          attdatnum: row[0].attdatnum,
          files: row[0].files,
          assayyn: row[0].assayyn,
          assaydt: isValidDate(row[0].assaydt)
            ? new Date(dateformat(row[0].assaydt))
            : null,
          glp1: row[0].glp1,
          glp2: row[0].glp2,
          glp3: row[0].glp3,
          glp4: row[0].glp4,
          glp5: row[0].glp5,
          glp6: row[0].glp6,
          etcglp: row[0].etcglp,
          guid1: row[0].guid1,
          guid2: row[0].guid2,
          guid3: row[0].guid3,
          guid4: row[0].guid4,
          guid5: row[0].guid5,
          guid6: row[0].guid6,
          etcguid: row[0].etcguid,
          materialindt: isValidDate(row[0].materialindt)
            ? new Date(dateformat(row[0].materialindt))
            : null,
          materialnm: row[0].materialnm,
          materialtype: row[0].materialtype,
          numbering_id: row[0].numbering_id,
          ordsts: row[0].ordsts,
          person: row[0].person,
          person1: row[0].person1,
          pubdt: isValidDate(row[0].pubdt)
            ? new Date(dateformat(row[0].pubdt))
            : null,
          quodt: isValidDate(row[0].quodt)
            ? new Date(dateformat(row[0].quodt))
            : null,
          quonum: row[0].quonum,
          quorev: row[0].quorev,
          quosts: row[0].quosts,
          quotype: row[0].quotype,
          rcvcustnm: row[0].rcvcustnm,
          rcvcustprsnnm: row[0].rcvcustprsnnm,
          remark: row[0].remark,
          remark2: row[0].remark2,
          remark3: row[0].remark3,
          report1: row[0].report1,
          report2: row[0].report2,
          report3: row[0].report3,
          report4: row[0].report4,
          etcreport: row[0].etcreport,
          requestgb: row[0].requestgb,
          rev_reason: row[0].rev_reason,
          testenddt: isValidDate(row[0].testenddt)
            ? new Date(dateformat(row[0].testenddt))
            : null,
          teststdt: isValidDate(row[0].teststdt)
            ? new Date(dateformat(row[0].teststdt))
            : null,
          testtype: row[0].testtype,
          translate1: row[0].translate1,
          translate2: row[0].translate2,
          translate3: row[0].translate3,
          translate4: row[0].translate4,
          etctranslatereport: row[0].etctranslatereport,
        });
      } else {
        setWorktype("U");
        setInformation({
          chkperson: "",
          custcd: "",
          custnm: "",
          custprsnnm: "",
          postcd: "",
          tel: "",
          extra_field4: "",
          email: "",
          rcvpostcd: "",
          rcvtel: "",
          extra_field5: "",
          rcvemail: "",
          extra_field3: "",
          extra_field2: "",
          materialinfo: "",
          agency1: "",
          agency2: "",
          agency3: "",
          agency4: "",
          agency5: "",
          agency6: "",
          etcagency: "",
          reportcnt: 0,
          transreportcnt: 0,
          attdatnum: "",
          files: "",
          assayyn: "",
          assaydt: null,
          glp1: "",
          glp2: "",
          glp3: "",
          glp4: "",
          glp5: "",
          glp6: "",
          etcglp: "",
          guid1: "",
          guid2: "",
          guid3: "",
          guid4: "",
          guid5: "",
          guid6: "",
          etcguid: "",
          materialindt: new Date(),
          materialnm: "",
          materialtype: "",
          numbering_id: "",
          ordsts: "",
          person: "",
          person1: "",
          pubdt: new Date(),
          quodt: new Date(),
          quonum: "",
          quorev: 0,
          quosts: "",
          quotype: "",
          rcvcustnm: "",
          rcvcustprsnnm: "",
          remark: "",
          remark2: "",
          remark3: "",
          report1: "",
          report2: "",
          report3: "",
          report4: "",
          etcreport: "",
          requestgb: "A",
          rev_reason: "",
          testenddt: null,
          teststdt: null,
          testtype: "",
          translate1: "",
          translate2: "",
          translate3: "",
          translate4: "",
          etctranslatereport: "",
        });
      }

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
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
      procedureName: "P_SA_A1000_603W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": "CONTRACT",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_finyn": filters.finyn,
        "@p_quotype": filters.quotype,
        "@p_materialtype": filters.materialtype,
        "@p_quonum": filters3.quonum,
        "@p_quorev": filters3.quorev,
        "@p_quoseq": filters.quoseq,
        "@p_status": "",
        "@p_extra_field2": filters.extra_field2,
        "@p_smperson": filters.smpersonnm == "" ? "" : filters.smperson,
        "@p_smpersonnm": filters.smpersonnm,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_in_frdt": convertDateToStr(filters.infrdt),
        "@p_in_todt": convertDateToStr(filters.intodt),
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        level1:
          item.totgrade1 >= 12
            ? "상"
            : item.totgrade1 >= 7
            ? "중"
            : item.totgrade1 >= 1
            ? "하"
            : "",
        level2:
          item.totgrade2 >= 7
            ? "상"
            : item.totgrade2 >= 4
            ? "중"
            : item.totgrade2 >= 1
            ? "하"
            : "",
      }));
      const totalRowCnt2 = data.tables[1].RowCount;
      const rows2 = data.tables[1].Rows;
      const totalRowCnt3 = data.tables[2].RowCount;
      const rows3 = data.tables[2].Rows;
      setMainDataResult3({
        data: rows3,
        total: totalRowCnt3 == -1 ? 0 : totalRowCnt3,
      });
      if (totalRowCnt > 0) {
        setInformation2({
          addordgb: rows[0].addordgb,
          amtgb: rows[0].amtgb,
          assaygbe: rows[0].assaygbe,
          financegb: rows[0].financegb,
          grade1: rows[0].grade1,
          grade2: rows[0].grade2,
          grade3: rows[0].grade3,
          grade4: rows[0].grade4,
          grade5: rows[0].grade5,
          grade6: rows[0].grade6,
          grade7: rows[0].grade7,
          materialgb: rows[0].materialgb,
          orgdiv: rows[0].orgdiv,
          relationgb: rows[0].relationgb,
          startschgb: rows[0].startschgb,
          totgrade1: rows[0].totgrade1,
          totgrade2: rows[0].totgrade2,
          level1: rows[0].level1,
          level2: rows[0].level2,
          quorev: rows2[0].quorev,
          conplandt: rows2[0].conplandt,
          submitdt: rows2[0].submitdt,
          seq: rows2[0].seq,
          passdt: rows2[0].passdt,
        });
        if (totalRowCnt3 > 0) {
          setSelectedState3({ [rows3[0][DATA_ITEM_KEY3]]: true });
        }
      } else {
        setInformation2({
          addordgb: "",
          amtgb: "",
          assaygbe: "",
          financegb: "",
          grade1: 0,
          grade2: 0,
          grade3: 0,
          grade4: 0,
          grade5: 0,
          grade6: 0,
          grade7: 0,
          materialgb: "",
          orgdiv: sessionOrgdiv,
          relationgb: "",
          startschgb: "",
          totgrade1: 0,
          totgrade2: 0,
          level1: "",
          level2: "",
          quorev: "",
          conplandt: "",
          submitdt: "",
          seq: 0,
          passdt: 0,
        });
        if (totalRowCnt3 > 0) {
          setSelectedState3({ [rows3[0][DATA_ITEM_KEY3]]: true });
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
      procedureName: "P_SA_A1000_603W_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": "COUNSEL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_finyn": filters.finyn,
        "@p_quotype": filters.quotype,
        "@p_materialtype": filters.materialtype,
        "@p_quonum": filters4.quonum,
        "@p_quorev": filters4.quorev,
        "@p_quoseq": filters.quoseq,
        "@p_status": "",
        "@p_extra_field2": filters.extra_field2,
        "@p_smperson": filters.smpersonnm == "" ? "" : filters.smperson,
        "@p_smpersonnm": filters.smpersonnm,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_in_frdt": convertDateToStr(filters.infrdt),
        "@p_in_todt": convertDateToStr(filters.intodt),
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

      setMainDataResult4((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState4({ [rows[0][DATA_ITEM_KEY4]]: true });
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
      procedureName: "P_SA_A1000_603W_Q",
      pageNumber: filters5.pgNum,
      pageSize: filters5.pgSize,
      parameters: {
        "@p_work_type": "CONSULT",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_finyn": filters.finyn,
        "@p_quotype": filters.quotype,
        "@p_materialtype": filters.materialtype,
        "@p_quonum": filters5.quonum,
        "@p_quorev": filters5.quorev,
        "@p_quoseq": filters.quoseq,
        "@p_status": "",
        "@p_extra_field2": filters.extra_field2,
        "@p_smperson": filters.smpersonnm == "" ? "" : filters.smperson,
        "@p_smpersonnm": filters.smpersonnm,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_in_frdt": convertDateToStr(filters.infrdt),
        "@p_in_todt": convertDateToStr(filters.intodt),
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

      setMainDataResult5((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState5({ [rows[0][DATA_ITEM_KEY5]]: true });
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
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1000_603W_Q",
      pageNumber: filters6.pgNum,
      pageSize: filters6.pgSize,
      parameters: {
        "@p_work_type": "QUOTATION",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_finyn": filters.finyn,
        "@p_quotype": filters.quotype,
        "@p_materialtype": filters.materialtype,
        "@p_quonum": filters6.quonum,
        "@p_quorev": filters6.quorev,
        "@p_quoseq": filters.quoseq,
        "@p_status": "",
        "@p_extra_field2": filters.extra_field2,
        "@p_smperson": filters.smpersonnm == "" ? "" : filters.smperson,
        "@p_smpersonnm": filters.smpersonnm,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_in_frdt": convertDateToStr(filters.infrdt),
        "@p_in_todt": convertDateToStr(filters.intodt),
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
        discount: Math.ceil(item.discount),
        discountamt: Math.ceil(item.discountamt),
        finalquowonamt: Math.ceil(item.finalquowonamt),
        margin: Math.ceil(item.margin),
        marginamt: Math.ceil(item.marginamt),
        quounp: Math.ceil(item.quounp),
      }));

      setMainDataResult6((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState6({ [rows[0][DATA_ITEM_KEY6]]: true });
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
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1000_603W_Q",
      pageNumber: filters7.pgNum,
      pageSize: filters7.pgSize,
      parameters: {
        "@p_work_type": "DETAIL2",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_finyn": filters.finyn,
        "@p_quotype": filters.quotype,
        "@p_materialtype": filters.materialtype,
        "@p_quonum": filters7.quonum,
        "@p_quorev": filters7.quorev,
        "@p_quoseq": filters.quoseq,
        "@p_status": status,
        "@p_extra_field2": filters.extra_field2,
        "@p_smperson": filters.smpersonnm == "" ? "" : filters.smperson,
        "@p_smpersonnm": filters.smpersonnm,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_in_frdt": convertDateToStr(filters.infrdt),
        "@p_in_todt": convertDateToStr(filters.intodt),
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        rate: Math.ceil(item.rate),
      }));

      setMainDataResult7((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState7({ [rows[0][DATA_ITEM_KEY7]]: true });
        setFilters8((prev) => ({
          ...prev,
          quonum: rows[0].quonum,
          quorev: rows[0].quorev,
          quoseq: rows[0].quoseq,
          isSearch: true,
        }));
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

  const fetchMainGrid8 = async (filters8: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1000_603W_Q",
      pageNumber: filters8.pgNum,
      pageSize: filters8.pgSize,
      parameters: {
        "@p_work_type": "DETAIL3",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_finyn": filters.finyn,
        "@p_quotype": filters.quotype,
        "@p_materialtype": filters.materialtype,
        "@p_quonum": filters8.quonum,
        "@p_quorev": filters8.quorev,
        "@p_quoseq": filters8.quoseq,
        "@p_status": "",
        "@p_extra_field2": filters.extra_field2,
        "@p_smperson": filters.smpersonnm == "" ? "" : filters.smperson,
        "@p_smpersonnm": filters.smpersonnm,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_in_frdt": convertDateToStr(filters.infrdt),
        "@p_in_todt": convertDateToStr(filters.intodt),
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    let index = -1;

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].status == 2) {
            index = i;
          }
        }
        if (index == -1 && (rows[0].status == "3" || rows[0].status == "")) {
          index = 0;

          const rows2 = rows.map((item: any, index: any) => {
            if (index == 0) {
              return {
                ...item,
                status: "2",
              };
            } else {
              return {
                ...item,
                status: item.status == "" ? "3" : item.status,
              };
            }
          });

          setMainDataResult8((prev) => {
            return {
              data: rows2,
              total: totalRowCnt == -1 ? 0 : totalRowCnt,
            };
          });
        } else {
          setMainDataResult8((prev) => {
            return {
              data: rows,
              total: totalRowCnt == -1 ? 0 : totalRowCnt,
            };
          });
        }
      } else {
        setMainDataResult8((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
      }
      setStep(index);
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  useEffect(() => {
    if (filters2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);

      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));

      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  useEffect(() => {
    if (filters3.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);

      setFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));

      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters4.isSearch && permissions !== null) {
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters5.isSearch && permissions !== null) {
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters6.isSearch && permissions !== null) {
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
    if (filters7.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters7);

      setFilters7((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));

      fetchMainGrid7(deepCopiedFilters);
    }
  }, [filters7]);

  useEffect(() => {
    if (filters8.isSearch && permissions !== null) {
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
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

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

  const gridSumQtyFooterCell6 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult6.data.forEach((item) =>
      props.field !== undefined
        ? (sum = Math.ceil(item["total_" + props.field]))
        : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell7 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult7.data.forEach((item) =>
      props.field !== undefined
        ? (sum = Math.ceil(item["total_" + props.field]))
        : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

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
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
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

  const onSelectionChange6 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState6,
      dataItemKey: DATA_ITEM_KEY6,
    });
    setSelectedState6(newSelectedState);
  };

  const onSelectionChange7 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState7,
      dataItemKey: DATA_ITEM_KEY7,
    });
    setSelectedState7(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters8((prev) => ({
      ...prev,
      quonum: selectedRowData.quonum,
      quorev: selectedRowData.quorev,
      quoseq: selectedRowData.quoseq,
      isSearch: true,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onRowDoubleClick = (props: any) => {
    const selectedRowData = props.dataItem;
    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
      quonum: selectedRowData.quonum,
      quorev: selectedRowData.quorev,
    }));
    setTabSelected(1);
  };

  const onItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
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
    if (
      field != "rowstatus" &&
      field != "quosts" &&
      field != "quoseq" &&
      field != "quotestnum" &&
      field != "itemlvl1"
    ) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );
      setEditIndex(dataItem[DATA_ITEM_KEY2]);
      if (field) {
        setEditedField(field);
      }
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

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      if (editedField !== "itemcd") {
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
        mainDataResult2.data.map((item: { [x: string]: any; itemcd: any }) => {
          if (editIndex == item[DATA_ITEM_KEY2]) {
            fetchItemData(item.itemcd);
          }
        });
      }
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

  const onAddClick = () => {
    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY2]: ++temp2,
      enddt: "99991231",
      glpyn: "G",
      itemcd: "",
      itemlvl1: "",
      itemnm: "",
      quonum: Information.quonum,
      quorev: Information.quorev,
      quoseq: 0,
      quosts: "1",
      quotestnum: "",
      remark: "",
      startdt: "99991231",
      type: "",
      rowstatus: "N",
    };
    setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    setMainDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage2((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;

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

  const onAddClick2 = () => {
    setWorktype("N");
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );

    setInformation({
      chkperson: userId,
      custcd: "",
      custnm: "",
      custprsnnm: "",
      postcd: defaultOption.find((item: any) => item.id == "postcd")?.valueCode,
      tel: "",
      extra_field4: "",
      email: "",
      rcvpostcd: defaultOption.find((item: any) => item.id == "rcvpostcd")
        ?.valueCode,
      rcvtel: "",
      extra_field5: "",
      rcvemail: "",
      extra_field3: "",
      extra_field2: defaultOption.find((item: any) => item.id == "extra_field2")
        ?.valueCode,
      materialinfo: "",
      agency1: "",
      agency2: "",
      agency3: "",
      agency4: "",
      agency5: "",
      agency6: "",
      etcagency: "",
      reportcnt: 0,
      transreportcnt: 0,
      attdatnum: "",
      files: "",
      assayyn: defaultOption.find((item: any) => item.id == "assayyn")
        ?.valueCode,
      assaydt: setDefaultDate2(customOptionData, "assaydt"),
      glp1: "",
      glp2: "",
      glp3: "",
      glp4: "",
      glp5: "",
      glp6: "",
      etcglp: "",
      guid1: "",
      guid2: "",
      guid3: "",
      guid4: "",
      guid5: "",
      guid6: "",
      etcguid: "",
      materialindt: setDefaultDate2(customOptionData, "materialindt"),
      materialnm: "",
      materialtype: defaultOption.find((item: any) => item.id == "materialtype")
        ?.valueCode,
      numbering_id: defaultOption.find((item: any) => item.id == "numbering_id")
        ?.valueCode,
      ordsts: "",
      person: userId,
      person1: "",
      pubdt: setDefaultDate2(customOptionData, "pubdt"),
      quodt: setDefaultDate2(customOptionData, "quodt"),
      quonum: "",
      quorev: 0,
      quosts: "",
      quotype: defaultOption.find((item: any) => item.id == "quotype")
        ?.valueCode,
      rcvcustnm: "",
      rcvcustprsnnm: "",
      remark: "",
      remark2: "",
      remark3: "",
      report1: "",
      report2: "",
      report3: "",
      report4: "",
      etcreport: "",
      requestgb: defaultOption.find((item: any) => item.id == "requestgb")
        ?.valueCode,
      rev_reason: "",
      testenddt: setDefaultDate2(customOptionData, "testenddt"),
      teststdt: setDefaultDate2(customOptionData, "teststdt"),
      testtype: defaultOption.find((item: any) => item.id == "testtype")
        ?.valueCode,
      translate1: "",
      translate2: "",
      translate3: "",
      translate4: "",
      etctranslatereport: "",
    });
    resetAllGrid();
    setTabSelected(1);
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: "",
    location: "",
    quonum: "",
    quorev: 0,
    quoseq: 0,
    quotype: "",
    quodt: "",
    person: "",
    pubdt: "",
    rev_reason: "",
    chkperson: "",
    custcd: "",
    custnm: "",
    remark2: "",
    postcd: "",
    tel: "",
    extra_field4: "",
    email: "",
    rcvpostcd: "",
    rcvtel: "",
    extra_field5: "",
    rcvemail: "",
    extra_field3: "",
    extra_field2: "",
    materialinfo: "",
    report: "",
    agency: "",
    reportcnt: 0,
    transreportcnt: 0,
    attdatnum: "",
    assayyn: "",
    assaydt: "",
    rcvcustnm: "",
    rcvcustprsnnm: "",
    remark3: "",
    materialtype: "",
    materialindt: "",
    materialnm: "",
    guideline: "",
    translatereport: "",
    teststdt: "",
    testenddt: "",
    remark: "",
    custprsnnm: "",
    requestgb: "",
    glpgb: "",
    numbering_id: "",
    rowstatus_s: "",
    quoseq_s: "",
    itemcd_s: "",
    itemnm_s: "",
    glpyn_s: "",
    startdt_s: "",
    enddt_s: "",
    remark_s: "",
    quonum_s: "",
    quorev_s: "",
    progress_status_s: "",
    userid: "",
    pc: "",
    form_id: "",
    testtype: "",
  });

  const para: Iparameters = {
    procedureName: "P_SA_A1000_603W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_quonum": ParaData.quonum,
      "@p_quorev": ParaData.quorev,
      "@p_quotype": ParaData.quotype,
      "@p_quodt": ParaData.quodt,
      "@p_pubdt": ParaData.pubdt,
      "@p_rev_reason": ParaData.rev_reason,
      "@p_person": ParaData.person,
      "@p_chkperson": ParaData.chkperson,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_remark2": ParaData.remark2,
      "@p_postcd": ParaData.postcd,
      "@p_tel": ParaData.tel,
      "@p_extra_field4": ParaData.extra_field4,
      "@p_email": ParaData.email,
      "@p_rcvpostcd": ParaData.rcvpostcd,
      "@p_rcvtel": ParaData.rcvtel,
      "@p_extra_field5": ParaData.extra_field5,
      "@p_rcvemail": ParaData.rcvemail,
      "@p_extra_field3": ParaData.extra_field3,
      "@p_extra_field2": ParaData.extra_field2,
      "@p_materialinfo": ParaData.materialinfo,
      "@p_report": ParaData.report,
      "@p_agency": ParaData.agency,
      "@p_reportcnt": ParaData.reportcnt,
      "@p_transreportcnt": ParaData.transreportcnt,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_assayyn": ParaData.assayyn,
      "@p_assaydt": ParaData.assaydt,
      "@p_rcvcustnm": ParaData.rcvcustnm,
      "@p_rcvcustprsnnm": ParaData.rcvcustprsnnm,
      "@p_remark3": ParaData.remark3,
      "@p_materialtype": ParaData.materialtype,
      "@p_materialindt": ParaData.materialindt,
      "@p_materialnm": ParaData.materialnm,
      "@p_guideline": ParaData.guideline,
      "@p_translatereport": ParaData.translatereport,
      "@p_teststdt": ParaData.teststdt,
      "@p_testenddt": ParaData.testenddt,
      "@p_remark": ParaData.remark,
      "@p_custprsnnm": ParaData.custprsnnm,
      "@p_requestgb": ParaData.requestgb,
      "@p_glpgb": ParaData.glpgb,
      "@p_testtype": ParaData.testtype,
      "@p_numbering_id": ParaData.numbering_id,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_quoseq_s": ParaData.quoseq_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_glpyn_s": ParaData.glpyn_s,
      "@p_startdt_s": ParaData.startdt_s,
      "@p_enddt_s": ParaData.enddt_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_quonum_s": ParaData.quonum_s,
      "@p_quorev_s": ParaData.quorev_s,
      "@p_progress_status_s": ParaData.progress_status_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SA_A1000_603W",
    },
  };

  const onSaveClick2 = () => {
    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    let valid = true;
    dataItem.map((item: any) => {
      if (item.itemcd == "" || item.itemnm == "") {
        valid = false;
      }
    });

    if (valid != true) {
      alert("필수값을 채워주세요");
    } else {
      try {
        if (
          convertDateToStr(Information.quodt).substring(0, 4) < "1997" ||
          convertDateToStr(Information.quodt).substring(6, 8) > "31" ||
          convertDateToStr(Information.quodt).substring(6, 8) < "01" ||
          convertDateToStr(Information.quodt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "SA_A1000_603W_001");
        } else if (
          Information.person == null ||
          Information.person == "" ||
          Information.person == undefined
        ) {
          throw findMessage(messagesData, "SA_A1000_603W_001");
        } else if (
          Information.quotype == null ||
          Information.quotype == "" ||
          Information.quotype == undefined
        ) {
          throw findMessage(messagesData, "SA_A1000_603W_001");
        } else if (
          Information.requestgb == null ||
          Information.requestgb == "" ||
          Information.requestgb == undefined
        ) {
          throw findMessage(messagesData, "SA_A1000_603W_001");
        } else if (
          Information.numbering_id == null ||
          Information.numbering_id == "" ||
          Information.numbering_id == undefined
        ) {
          throw findMessage(messagesData, "SA_A1000_603W_001");
        } else if (
          convertDateToStr(Information.materialindt).substring(0, 4) < "1997" ||
          convertDateToStr(Information.materialindt).substring(6, 8) > "31" ||
          convertDateToStr(Information.materialindt).substring(6, 8) < "01" ||
          convertDateToStr(Information.materialindt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "SA_A1000_603W_001");
        } else {
          const agency =
            (Information.agency1 == "" ? "N" : Information.agency1) +
            "|" +
            (Information.agency2 == "" ? "N" : Information.agency2) +
            "|" +
            (Information.agency3 == "" ? "N" : Information.agency3) +
            "|" +
            (Information.agency4 == "" ? "N" : Information.agency4) +
            "|" +
            (Information.agency5 == "" ? "N" : Information.agency5) +
            "|" +
            (Information.agency6 == "" ? "N" : Information.agency6) +
            "|" +
            Information.etcagency;

          const guid =
            (Information.guid1 == "" ? "N" : Information.guid1) +
            "|" +
            (Information.guid2 == "" ? "N" : Information.guid2) +
            "|" +
            (Information.guid3 == "" ? "N" : Information.guid3) +
            "|" +
            (Information.guid4 == "" ? "N" : Information.guid4) +
            "|" +
            (Information.guid5 == "" ? "N" : Information.guid5) +
            "|" +
            (Information.guid6 == "" ? "N" : Information.guid6) +
            "|" +
            Information.etcguid;

          const glp =
            (Information.glp1 == "" ? "N" : Information.glp1) +
            "|" +
            (Information.glp2 == "" ? "N" : Information.glp2) +
            "|" +
            (Information.glp3 == "" ? "N" : Information.glp3) +
            "|" +
            (Information.glp4 == "" ? "N" : Information.glp4) +
            "|" +
            (Information.glp5 == "" ? "N" : Information.glp5) +
            "|" +
            (Information.glp6 == "" ? "N" : Information.glp6) +
            "|" +
            Information.etcglp;

          const translatereport =
            (Information.translate1 == "" ? "N" : Information.translate1) +
            "|" +
            (Information.translate2 == "" ? "N" : Information.translate2) +
            "|" +
            (Information.translate3 == "" ? "N" : Information.translate3) +
            "|" +
            (Information.translate4 == "" ? "N" : Information.translate4) +
            "|" +
            Information.etctranslatereport;

          const report =
            (Information.report1 == "" ? "N" : Information.report1) +
            "|" +
            (Information.report2 == "" ? "N" : Information.report2) +
            "|" +
            (Information.report3 == "" ? "N" : Information.report3) +
            "|" +
            (Information.report4 == "" ? "N" : Information.report4) +
            "|" +
            Information.etcreport;

          if (dataItem.length == 0 && deletedMainRows2.length == 0) {
            setParaData({
              workType: worktype,
              orgdiv: sessionOrgdiv,
              location: sessionLocation,
              quonum: Information.quonum,
              quorev: Information.quorev,
              quoseq: Information.quorev,
              quotype: Information.quotype,
              quodt: isValidDate(Information.quodt)
                ? convertDateToStr(Information.quodt)
                : "",
              pubdt: isValidDate(Information.pubdt)
                ? convertDateToStr(Information.pubdt)
                : "",
              rev_reason: Information.rev_reason,
              person: Information.person,
              chkperson: Information.chkperson,
              custcd: Information.custcd,
              custnm: Information.custnm,
              remark2: Information.remark2,
              postcd: Information.postcd,
              tel: Information.tel,
              extra_field4: Information.extra_field4,
              email: Information.email,
              rcvpostcd: Information.rcvpostcd,
              rcvtel: Information.rcvtel,
              extra_field5: Information.extra_field5,
              rcvemail: Information.rcvemail,
              extra_field3: Information.extra_field3,
              extra_field2: Information.extra_field2,
              materialinfo: Information.materialinfo,
              agency: agency,
              reportcnt: Information.reportcnt,
              transreportcnt: Information.transreportcnt,
              attdatnum: Information.attdatnum,
              assayyn: Information.assayyn,
              assaydt: isValidDate(Information.assaydt)
                ? convertDateToStr(Information.assaydt)
                : "",
              report: report,
              rcvcustnm: Information.rcvcustnm,
              rcvcustprsnnm: Information.rcvcustprsnnm,
              remark3: Information.remark3,
              materialtype: Information.materialtype,
              materialindt: isValidDate(Information.materialindt)
                ? convertDateToStr(Information.materialindt)
                : "",
              materialnm: Information.materialnm,
              guideline: guid,
              translatereport: translatereport,
              testenddt: isValidDate(Information.testenddt)
                ? convertDateToStr(Information.testenddt)
                : "",
              teststdt: isValidDate(Information.teststdt)
                ? convertDateToStr(Information.teststdt)
                : "",
              testtype: Information.testtype,
              remark: Information.remark,
              custprsnnm: Information.custprsnnm,
              requestgb: Information.requestgb,
              glpgb: glp,
              numbering_id: Information.numbering_id,
              rowstatus_s: "",
              quoseq_s: "",
              itemcd_s: "",
              itemnm_s: "",
              glpyn_s: "",
              startdt_s: "",
              enddt_s: "",
              remark_s: "",
              quonum_s: "",
              quorev_s: "",
              progress_status_s: "",
              userid: userId,
              pc: pc,
              form_id: "SA_A1000_603W",
            });
          } else {
            let dataArr: TdataArr = {
              rowstatus_s: [],
              quoseq_s: [],
              itemcd_s: [],
              itemnm_s: [],
              glpyn_s: [],
              startdt_s: [],
              enddt_s: [],
              remark_s: [],
            };
            dataItem.forEach((item: any, idx: number) => {
              const {
                rowstatus = "",
                quoseq = "",
                itemcd = "",
                itemnm = "",
                glpyn = "",
                startdt = "",
                enddt = "",
                remark = "",
              } = item;

              dataArr.rowstatus_s.push(rowstatus);
              dataArr.quoseq_s.push(quoseq);
              dataArr.itemcd_s.push(itemcd);
              dataArr.itemnm_s.push(itemnm);
              dataArr.glpyn_s.push(glpyn);
              dataArr.startdt_s.push(startdt == "99991231" ? "" : startdt);
              dataArr.enddt_s.push(enddt == "99991231" ? "" : enddt);
              dataArr.remark_s.push(remark);
            });
            deletedMainRows2.forEach((item: any, idx: number) => {
              const {
                rowstatus = "",
                quoseq = "",
                itemcd = "",
                itemnm = "",
                glpyn = "",
                startdt = "",
                enddt = "",
                remark = "",
              } = item;

              dataArr.rowstatus_s.push("D");
              dataArr.quoseq_s.push(quoseq);
              dataArr.itemcd_s.push(itemcd);
              dataArr.itemnm_s.push(itemnm);
              dataArr.glpyn_s.push(glpyn);
              dataArr.startdt_s.push(startdt == "99991231" ? "" : startdt);
              dataArr.enddt_s.push(enddt == "99991231" ? "" : enddt);
              dataArr.remark_s.push(remark);
            });
            setParaData({
              workType: worktype,
              orgdiv: sessionOrgdiv,
              location: sessionLocation,
              quonum: Information.quonum,
              quorev: Information.quorev,
              quoseq: Information.quorev,
              quotype: Information.quotype,
              quodt: isValidDate(Information.quodt)
                ? convertDateToStr(Information.quodt)
                : "",
              person: Information.person,
              pubdt: isValidDate(Information.pubdt)
                ? convertDateToStr(Information.pubdt)
                : "",
              rev_reason: Information.rev_reason,
              chkperson: Information.chkperson,
              custcd: Information.custcd,
              custnm: Information.custnm,
              remark2: Information.remark2,
              postcd: Information.postcd,
              tel: Information.tel,
              extra_field4: Information.extra_field4,
              email: Information.email,
              rcvpostcd: Information.rcvpostcd,
              rcvtel: Information.rcvtel,
              extra_field5: Information.extra_field5,
              rcvemail: Information.rcvemail,
              extra_field3: Information.extra_field3,
              extra_field2: Information.extra_field2,
              materialinfo: Information.materialinfo,
              agency: agency,
              reportcnt: Information.reportcnt,
              transreportcnt: Information.transreportcnt,
              attdatnum: Information.attdatnum,
              assayyn: Information.assayyn,
              assaydt: isValidDate(Information.assaydt)
                ? convertDateToStr(Information.assaydt)
                : "",
              report: report,
              rcvcustnm: Information.rcvcustnm,
              rcvcustprsnnm: Information.rcvcustprsnnm,
              remark3: Information.remark3,
              materialtype: Information.materialtype,
              materialindt: isValidDate(Information.materialindt)
                ? convertDateToStr(Information.materialindt)
                : "",
              materialnm: Information.materialnm,
              guideline: guid,
              translatereport: translatereport,
              testenddt: isValidDate(Information.testenddt)
                ? convertDateToStr(Information.testenddt)
                : "",
              teststdt: isValidDate(Information.teststdt)
                ? convertDateToStr(Information.teststdt)
                : "",
              testtype: Information.testtype,
              remark: Information.remark,
              custprsnnm: Information.custprsnnm,
              requestgb: Information.requestgb,
              glpgb: glp,
              numbering_id: Information.numbering_id,
              rowstatus_s: dataArr.rowstatus_s.join("|"),
              quoseq_s: dataArr.quoseq_s.join("|"),
              itemcd_s: dataArr.itemcd_s.join("|"),
              itemnm_s: dataArr.itemnm_s.join("|"),
              glpyn_s: dataArr.glpyn_s.join("|"),
              startdt_s: dataArr.startdt_s.join("|"),
              enddt_s: dataArr.enddt_s.join("|"),
              remark_s: dataArr.remark_s.join("|"),
              quonum_s: "",
              quorev_s: "",
              progress_status_s: "",
              userid: userId,
              pc: pc,
              form_id: "SA_A1000_603W",
            });
          }
        }
      } catch (e) {
        alert(e);
      }
    }
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
      if (
        ParaData.workType == "REV" ||
        ParaData.workType == "DesTran" ||
        ParaData.workType == "DesTran_d"
      ) {
        alert("처리되었습니다.");
      }
      setUnsavedName([]);
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      setParaData({
        workType: "",
        orgdiv: "",
        location: "",
        quonum: "",
        quorev: 0,
        quoseq: 0,
        quotype: "",
        quodt: "",
        person: "",
        pubdt: "",
        chkperson: "",
        custcd: "",
        custnm: "",
        remark2: "",
        postcd: "",
        tel: "",
        extra_field4: "",
        email: "",
        rcvpostcd: "",
        rcvtel: "",
        extra_field5: "",
        rcvemail: "",
        extra_field3: "",
        extra_field2: "",
        materialinfo: "",
        agency: "",
        reportcnt: 0,
        transreportcnt: 0,
        attdatnum: "",
        assayyn: "",
        assaydt: "",
        report: "",
        rev_reason: "",
        rcvcustnm: "",
        rcvcustprsnnm: "",
        remark3: "",
        materialtype: "",
        materialindt: "",
        materialnm: "",
        guideline: "",
        translatereport: "",
        teststdt: "",
        testenddt: "",
        remark: "",
        custprsnnm: "",
        requestgb: "",
        glpgb: "",
        testtype: "",
        numbering_id: "",
        rowstatus_s: "",
        quoseq_s: "",
        itemcd_s: "",
        itemnm_s: "",
        glpyn_s: "",
        startdt_s: "",
        enddt_s: "",
        remark_s: "",
        quonum_s: "",
        quorev_s: "",
        progress_status_s: "",
        userid: "",
        pc: "",
        form_id: "",
      });
      deletedMainRows2 = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    quonum: "",
    quorev: "",
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_SA_A1000_603W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_quonum": paraDataDeleted.quonum,
      "@p_quorev": paraDataDeleted.quorev,
      "@p_quotype": "",
      "@p_quodt": "",
      "@p_pubdt": "",
      "@p_rev_reason": "",
      "@p_person": "",
      "@p_chkperson": "",
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_remark2": "",
      "@p_postcd": "",
      "@p_tel": "",
      "@p_extra_field4": "",
      "@p_email": "",
      "@p_rcvpostcd": "",
      "@p_rcvtel": "",
      "@p_extra_field5": "",
      "@p_rcvemail": "",
      "@p_extra_field3": "",
      "@p_extra_field2": "",
      "@p_materialinfo": "",
      "@p_agency": "",
      "@p_reportcnt": 0,
      "@p_transreportcnt": 0,
      "@p_attdatnum": "",
      "@p_assayyn": "",
      "@p_assaydt": "",
      "@p_report": "",
      "@p_rcvcustnm": "",
      "@p_rcvcustprsnnm": "",
      "@p_remark3": "",
      "@p_materialtype": "",
      "@p_materialindt": "",
      "@p_materialnm": "",
      "@p_guideline": "",
      "@p_translatereport": "",
      "@p_teststdt": "",
      "@p_testenddt": "",
      "@p_remark": "",
      "@p_custprsnnm": "",
      "@p_requestgb": "",
      "@p_glpgb": "",
      "@p_testtype": "",
      "@p_numbering_id": "",
      "@p_rowstatus_s": "",
      "@p_quoseq_s": "",
      "@p_itemcd_s": "",
      "@p_itemnm_s": "",
      "@p_glpyn_s": "",
      "@p_startdt_s": "",
      "@p_enddt_s": "",
      "@p_remark_s": "",
      "@p_quonum_s": "",
      "@p_quorev_s": "",
      "@p_progress_status_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SA_A1000_603W",
    },
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted =
        mainDataResult.data.length == 1 && filters.pgNum > 0;
      setTabSelected(0);
      setDeletedAttadatnums([Information.attdatnum]);
      if (isLastDataDeleted) {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });

        setFilters((prev) => ({
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
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    //초기화
    setParaDataDeleted((prev) => ({
      work_type: "",
      quonum: "",
      quorev: "",
    }));
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick2 = () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    const datas = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    if (mainDataResult.data.length == 0) {
      alert("데이터가 없습니다.");
    } else {
      if (datas != undefined) {
        setParaDataDeleted((prev) => ({
          work_type: "D",
          quonum: datas.quonum,
          quorev: datas.quorev,
        }));
      }
    }
  };

  useEffect(() => {
    if (paraDataDeleted.work_type == "D") fetchToDelete();
  }, [paraDataDeleted]);

  const onLinkChange = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = event.dataItem;
    const origin = window.location.origin;
    window.open(
      origin +
        `/CM_A7000W?go=` +
        selectedRowData.orgdiv +
        "_" +
        selectedRowData.meetingnum
    );
  };

  const onLinkChange2 = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = event.dataItem;
    const origin = window.location.origin;
    window.open(origin + `/CM_A5000W?go=` + selectedRowData.document_id);
  };

  const onLinkChange3 = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = event.dataItem;
    const origin = window.location.origin;
    window.open(
      origin +
        `/SA_A1001_603W?go=` +
        selectedRowData.quokey.split("-")[0] +
        "-" +
        selectedRowData.quokey.split("-")[1]
    );
  };

  const onLinkChange4 = () => {
    const origin = window.location.origin;
    window.open(
      origin +
        `/SA_A1200_603W?go=` +
        Information.quonum +
        "-" +
        Information.quorev
    );
  };

  const customizedMarker = (props: StepIconProps) => {
    const { active, completed } = props;

    return (
      <span
        className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1"
        style={{
          backgroundColor: active ? "#cce2f1" : "#ccc",
        }}
      >
        <i className="pi pi-cog"></i>
      </span>
    );
  };

  const customizedContent = (item: any) => {
    return (
      <Card
        style={{
          opacity: 0.9,
          height: "9.5vh",
          backgroundColor:
            item.status == 2 ? "#cce2f1" : item.status == 1 ? "#ccc" : "white",
        }}
      >
        <CardContent
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingBottom: "16px",
          }}
        >
          <Typography
            style={{
              color: "black",
              fontSize: "1.1rem",
              fontFamily: "TheJamsil5Bold",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
            }}
          >
            {item.code_name}
          </Typography>
          <Typography
            style={{
              color: "black",
              fontSize: "0.8rem",
              fontFamily: "TheJamsil5Bold",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
            }}
          >
            {dateformat2(item.dlvdt)}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const filterMultiSelectChange = (event: MultiSelectChangeEvent) => {
    const values = event.value;
    const name = event.target.props.name ?? "";

    setFilters((prev) => ({
      ...prev,
      [name]: values,
    }));
  };

  const [PrsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);

  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };

  const setPrsnnumData = (data: IPrsnnum) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        smpersonnm: data.user_name,
        smperson: data.user_id,
      };
    });
  };

  const onRevClick = () => {
    setRevWindowVisible(true);
  };

  const onPlanClick = () => {
    setParaData((prev) => ({
      ...prev,
      workType: "DesTran",
      orgdiv: sessionOrgdiv,
      quonum: Information.quonum,
      quorev: Information.quorev,
    }));
  };

  const onPlanDeleteClick = () => {
    setParaData((prev) => ({
      ...prev,
      workType: "DesTran_d",
      orgdiv: sessionOrgdiv,
      quonum: Information.quonum,
      quorev: Information.quorev,
    }));
  };

  return (
    <>
      <TitleContainer>
        <Title>프로젝트관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="SA_A1000_603W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
        scrollable={isMobile}
      >
        <TabStripTab title="요약정보">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>PJT NO.</th>
                  <td>
                    <Input
                      name="quonum"
                      type="text"
                      value={filters.quonum}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onProejctWndClick}
                      />
                    </ButtonInInput>
                  </td>
                  <th>상태</th>
                  <td>
                    <MultiSelect
                      name="status"
                      data={statusListData2}
                      onChange={filterMultiSelectChange}
                      value={filters.status}
                      textField="code_name"
                      dataItemKey="sub_code"
                    />
                  </td>
                  <th>의뢰유형</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="quotype"
                        value={filters.quotype}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>업체명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type={"button"}
                        onClick={onCustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                </tr>
                <tr>
                  <th>물질분야</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="materialtype"
                        value={filters.materialtype}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>물질상세분야</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="extra_field2"
                        value={filters.extra_field2}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>영업담당자</th>
                  <td>
                    <Input
                      name="smpersonnm"
                      type="text"
                      value={filters.smpersonnm}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type="button"
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onPrsnnumWndClick}
                      />
                    </ButtonInInput>
                  </td>
                  <th>계약목표일</th>
                  <td>
                    <CommonDateRangePicker
                      value={{
                        start: filters.frdt,
                        end: filters.todt,
                      }}
                      onChange={(e: { value: { start: any; end: any } }) =>
                        setFilters((prev) => ({
                          ...prev,
                          frdt: e.value.start,
                          todt: e.value.end,
                        }))
                      }
                    />
                  </td>
                  <th>의뢰일자</th>
                  <td>
                    <CommonDateRangePicker
                      value={{
                        start: filters.infrdt,
                        end: filters.intodt,
                      }}
                      onChange={(e: { value: { start: any; end: any } }) =>
                        setFilters((prev) => ({
                          ...prev,
                          infrdt: e.value.start,
                          intodt: e.value.end,
                        }))
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>
                <ButtonContainer style={{ justifyContent: "flex-start" }}>
                  {!isMobile && <div>요약정보</div>}
                  <div
                    style={{
                      width: "80px",
                      borderRadius: "2px",
                      backgroundColor: "#ffc000",
                      color: "white",
                      padding: "5px 10px",
                      textAlign: "center",
                      marginLeft: "5px",
                      marginRight: "5px",
                      fontWeight: 700,
                      fontSize: "15px",
                    }}
                  >
                    의뢰
                  </div>
                  <div
                    style={{
                      width: "80px",
                      borderRadius: "2px",
                      backgroundColor: "#70ad47",
                      color: "white",
                      padding: "5px 10px",
                      textAlign: "center",
                      marginRight: "5px",
                      fontWeight: 700,
                      fontSize: "15px",
                    }}
                  >
                    견적
                  </div>
                  <div
                    style={{
                      width: "80px",
                      borderRadius: "2px",
                      backgroundColor: "#0070c0",
                      color: "white",
                      padding: "5px 10px",
                      textAlign: "center",
                      marginRight: "5px",
                      fontWeight: 700,
                      fontSize: "15px",
                    }}
                  >
                    계약
                  </div>
                </ButtonContainer>
              </GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick2}
                  themeColor={"primary"}
                  icon="file-add"
                >
                  신규
                </Button>
                <Button
                  onClick={onDeleteClick2}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="delete"
                >
                  삭제
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="프로젝트관리"
            >
              <Grid
                style={{
                  height: isMobile ? deviceHeight - height - height1 : "68vh",
                }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    quotype: quotypeListData.find(
                      (items: any) => items.sub_code == row.quotype
                    )?.code_name,
                    quosts: quostsListData.find(
                      (items: any) => items.sub_code == row.quosts
                    )?.code_name,
                    chkperson: userListData.find(
                      (items: any) => items.user_id == row.chkperson
                    )?.user_name,
                    materialtype: materialtypeListData.find(
                      (items: any) => items.sub_code == row.materialtype
                    )?.code_name,
                    status: statusListData2.find(
                      (items: any) => items.sub_code == row.status
                    )?.code_name,
                    extra_field2: extra_field2ListData.find(
                      (items: any) => items.sub_code == row.extra_field2
                    )?.code_name,
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
                onRowDoubleClick={onRowDoubleClick}
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
              >
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
                              dateField.includes(item.fieldName)
                                ? DateCell
                                : centerField.includes(item.fieldName)
                                ? CenterCell
                                : colorField.includes(item.fieldName)
                                ? CustomColorCell
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
          title="시험의뢰서"
          disabled={mainDataResult.total == 0 && worktype == "U" ? true : false}
        >
          {isMobile ? (
            <>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle></GridTitle>
                <ButtonContainer style={{ gap: "3px" }}>
                  <Button
                    themeColor={"primary"}
                    onClick={onPrint}
                    icon="print"
                    disabled={worktype == "N" ? true : false}
                  >
                    시험의뢰서 출력
                  </Button>
                  <Button
                    onClick={onRevClick}
                    themeColor={"primary"}
                    icon="track-changes"
                    disabled={worktype == "N" ? true : false}
                  >
                    리비전
                  </Button>
                  <Button
                    onClick={onPlanClick}
                    themeColor={"primary"}
                    icon="track-changes-accept"
                    disabled={worktype == "N" ? true : false}
                  >
                    계획요청
                  </Button>
                  <Button
                    onClick={onPlanDeleteClick}
                    themeColor={"primary"}
                    icon="track-changes-reject"
                    disabled={worktype == "N" ? true : false}
                  >
                    계획요청취소
                  </Button>
                  <Button
                    onClick={onSaveClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <SwiperSlide key={0}>
                  <FormBoxWrap
                    border={true}
                    style={{
                      height: deviceHeight - height - height2,
                      overflow: "auto",
                    }}
                  >
                    <GridTitleContainer>
                      <GridTitle>
                        <ButtonContainer
                          style={{ justifyContent: "space-between" }}
                        >
                          기준정보
                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(1);
                              }
                            }}
                            icon="chevron-right"
                            themeColor={"primary"}
                            fillMode={"flat"}
                          ></Button>
                        </ButtonContainer>
                      </GridTitle>
                    </GridTitleContainer>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>PJT NO.</th>
                          <td>
                            <Input
                              name="quonum"
                              type="text"
                              value={Information.quonum}
                              className="readonly"
                            />
                          </td>
                          <th>REV</th>
                          <td>
                            <Input
                              name="quorev"
                              type="number"
                              value={Information.quorev}
                              className="readonly"
                            />
                          </td>
                          <th>작성일자</th>
                          <td>
                            <DatePicker
                              name="quodt"
                              value={Information.quodt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                              className="required"
                            />
                          </td>
                          <th>등록자</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="person"
                                value={Information.person}
                                bizComponentId="L_sysUserMaster_001"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                textField="user_name"
                                valueField="user_id"
                                className="required"
                              />
                            )}
                          </td>
                          <th>영업담당자</th>
                          <td>
                            {worktype == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="chkperson"
                                    value={Information.chkperson}
                                    type="new"
                                    customOptionData={customOptionData}
                                    textField="user_name"
                                    valueField="user_id"
                                    changeData={ComboBoxChange}
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="chkperson"
                                    value={Information.chkperson}
                                    bizComponentId="L_sysUserMaster_001"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                    textField="user_name"
                                    valueField="user_id"
                                  />
                                )}
                          </td>
                        </tr>
                        <tr>
                          <th>의뢰유형</th>
                          <td>
                            {worktype == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="quotype"
                                    value={Information.quotype}
                                    type="new"
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                    className="required"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="quotype"
                                    value={Information.quotype}
                                    bizComponentId="L_SA016"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                    className="required"
                                  />
                                )}
                          </td>
                          <th>국가</th>
                          <td>
                            {worktype == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="numbering_id"
                                    value={Information.numbering_id}
                                    type="new"
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                    className="required"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="numbering_id"
                                    value={Information.numbering_id}
                                    bizComponentId="L_BA057"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                    className="required"
                                  />
                                )}
                          </td>
                        </tr>
                        <tr>
                          <th>진행단계</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="quosts"
                                value={Information.quosts}
                                bizComponentId="L_SA004"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                disabled={true}
                              />
                            )}
                          </td>
                          <th>수주상태</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="ordsts"
                                value={Information.ordsts}
                                bizComponentId="L_SA002"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                disabled={true}
                              />
                            )}
                          </td>
                          <th>견적발행일</th>
                          <td>
                            <DatePicker
                              name="pubdt"
                              value={Information.pubdt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>개정사유</th>
                          <td colSpan={9}>
                            <Input
                              name="rev_reason"
                              type="text"
                              value={Information.rev_reason}
                              className="readonly"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </SwiperSlide>
                <SwiperSlide key={1}>
                  <FormBoxWrap
                    border={true}
                    style={{
                      height: deviceHeight - height - height2,
                      overflow: "auto",
                    }}
                  >
                    <GridTitleContainer>
                      <GridTitle>
                        <ButtonContainer
                          style={{ justifyContent: "space-between" }}
                        >
                          <ButtonContainer>
                            <Button
                              onClick={() => {
                                if (swiper) {
                                  swiper.slideTo(0);
                                }
                              }}
                              icon="chevron-left"
                              themeColor={"primary"}
                              fillMode={"flat"}
                            ></Button>
                            의뢰자정보
                          </ButtonContainer>
                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(2);
                              }
                            }}
                            icon="chevron-right"
                            themeColor={"primary"}
                            fillMode={"flat"}
                          ></Button>
                        </ButtonContainer>
                      </GridTitle>
                    </GridTitleContainer>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>업체명</th>
                          <td colSpan={5}>
                            <Input
                              name="custnm"
                              type="text"
                              value={Information.custnm}
                              onChange={InputChange}
                            />
                            <ButtonInInput>
                              <Button
                                type={"button"}
                                onClick={onCustWndClick2}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                        </tr>
                        <tr>
                          <th>의뢰자</th>
                          <td>
                            <Input
                              name="custprsnnm"
                              type="text"
                              value={Information.custprsnnm}
                              onChange={InputChange}
                            />
                          </td>
                          <th>소속</th>
                          <td>
                            <Input
                              name="remark2"
                              type="text"
                              value={Information.remark2}
                              onChange={InputChange}
                            />
                          </td>
                          <th>직위</th>
                          <td>
                            {worktype == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="postcd"
                                    value={Information.postcd}
                                    type="new"
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="postcd"
                                    value={Information.postcd}
                                    bizComponentId="L_HU005"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                  />
                                )}
                          </td>
                        </tr>
                        <tr>
                          <th>TEL</th>
                          <td>
                            <Input
                              name="tel"
                              type="text"
                              value={Information.tel}
                              onChange={InputChange}
                            />
                          </td>
                          <th>C.P</th>
                          <td>
                            <Input
                              name="extra_field4"
                              type="text"
                              value={Information.extra_field4}
                              onChange={InputChange}
                            />
                          </td>
                          <th>이메일</th>
                          <td>
                            <Input
                              name="email"
                              type="text"
                              value={Information.email}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </SwiperSlide>
                <SwiperSlide key={2}>
                  <FormBoxWrap
                    border={true}
                    style={{
                      height: deviceHeight - height - height2,
                      overflow: "auto",
                    }}
                  >
                    <GridTitleContainer>
                      <GridTitle>
                        {" "}
                        <ButtonContainer
                          style={{ justifyContent: "space-between" }}
                        >
                          <ButtonContainer>
                            <Button
                              onClick={() => {
                                if (swiper) {
                                  swiper.slideTo(1);
                                }
                              }}
                              icon="chevron-left"
                              themeColor={"primary"}
                              fillMode={"flat"}
                            ></Button>
                            모니터정보{" "}
                          </ButtonContainer>
                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(3);
                              }
                            }}
                            icon="chevron-right"
                            themeColor={"primary"}
                            fillMode={"flat"}
                          ></Button>
                        </ButtonContainer>
                      </GridTitle>
                    </GridTitleContainer>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>모니터사</th>
                          <td colSpan={5}>
                            <Input
                              name="rcvcustnm"
                              type="text"
                              value={Information.rcvcustnm}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>모니터</th>
                          <td>
                            <Input
                              name="rcvcustprsnnm"
                              type="text"
                              value={Information.rcvcustprsnnm}
                              onChange={InputChange}
                            />
                          </td>
                          <th>소속</th>
                          <td>
                            <Input
                              name="remark3"
                              type="text"
                              value={Information.remark3}
                              onChange={InputChange}
                            />
                          </td>
                          <th>직위</th>
                          <td>
                            {worktype == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="rcvpostcd"
                                    value={Information.rcvpostcd}
                                    type="new"
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="rcvpostcd"
                                    value={Information.rcvpostcd}
                                    bizComponentId="L_HU005"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                  />
                                )}
                          </td>
                        </tr>
                        <tr>
                          <th>TEL</th>
                          <td>
                            <Input
                              name="rcvtel"
                              type="text"
                              value={Information.rcvtel}
                              onChange={InputChange}
                            />
                          </td>
                          <th>C.P</th>
                          <td>
                            <Input
                              name="extra_field5"
                              type="text"
                              value={Information.extra_field5}
                              onChange={InputChange}
                            />
                          </td>
                          <th>이메일</th>
                          <td>
                            <Input
                              name="rcvemail"
                              type="text"
                              value={Information.rcvemail}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </SwiperSlide>
                <SwiperSlide key={3}>
                  <FormBoxWrap
                    border={true}
                    style={{
                      height: deviceHeight - height - height2,
                      overflow: "auto",
                    }}
                  >
                    <GridTitleContainer>
                      <GridTitle>
                        <ButtonContainer
                          style={{ justifyContent: "space-between" }}
                        >
                          <ButtonContainer>
                            <Button
                              onClick={() => {
                                if (swiper) {
                                  swiper.slideTo(2);
                                }
                              }}
                              icon="chevron-left"
                              themeColor={"primary"}
                              fillMode={"flat"}
                            ></Button>
                            의뢰정보
                          </ButtonContainer>
                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(4);
                              }
                            }}
                            icon="chevron-right"
                            themeColor={"primary"}
                            fillMode={"flat"}
                          ></Button>
                        </ButtonContainer>
                      </GridTitle>
                    </GridTitleContainer>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>의뢰분야</th>
                          <td>
                            {worktype == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="testtype"
                                    value={Information.testtype}
                                    type="new"
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="testtype"
                                    value={Information.testtype}
                                    bizComponentId="L_SA019_603"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                  />
                                )}
                          </td>
                          <th>의뢰목적</th>
                          <td>
                            {worktype == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="requestgb"
                                    value={Information.requestgb}
                                    type="new"
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                    className="required"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="requestgb"
                                    value={Information.requestgb}
                                    bizComponentId="L_Requestgb"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                    className="required"
                                  />
                                )}
                          </td>
                          <th>적응증</th>
                          <td colSpan={3}>
                            <Input
                              name="extra_field3"
                              type="text"
                              value={Information.extra_field3}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>물질분야</th>
                          <td>
                            {worktype == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="materialtype"
                                    value={Information.materialtype}
                                    type="new"
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="materialtype"
                                    value={Information.materialtype}
                                    bizComponentId="L_SA001_603"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                  />
                                )}
                          </td>
                          <th>물질상세분야</th>
                          <td>
                            {worktype == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="extra_field2"
                                    value={Information.extra_field2}
                                    type="new"
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="extra_field2"
                                    value={Information.extra_field2}
                                    bizComponentId="L_CM501_603"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                  />
                                )}
                          </td>
                          <th>물질정보</th>
                          <td colSpan={3}>
                            <Input
                              name="materialinfo"
                              type="text"
                              value={Information.materialinfo}
                              onChange={InputChange}
                            />
                          </td>
                          <th>물질입고예정일</th>
                          <td>
                            <DatePicker
                              name="materialindt"
                              value={Information.materialindt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                              className="required"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>시험물질명</th>
                          <td colSpan={5}>
                            <Input
                              name="materialnm"
                              type="text"
                              value={Information.materialnm}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>허가기관</th>
                          <td>
                            <Checkbox
                              title="MFDS"
                              name="agency1"
                              label={"MFDS"}
                              value={Information.agency1 == "A" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="NIER"
                              name="agency2"
                              label={"NIER"}
                              value={Information.agency2 == "B" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="APQA"
                              name="agency3"
                              label={"APQA"}
                              value={Information.agency3 == "C" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="RDA"
                              name="agency4"
                              label={"RDA"}
                              value={Information.agency4 == "D" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="FDA"
                              name="agency5"
                              label={"FDA"}
                              value={Information.agency5 == "E" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="기타"
                              name="agency6"
                              label={"기타"}
                              value={Information.agency6 == "K" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            {Information.agency6 == "K" ? (
                              <Input
                                name="etcagency"
                                type="text"
                                value={Information.etcagency}
                                onChange={InputChange}
                              />
                            ) : (
                              <Input
                                name="etcagency"
                                type="text"
                                value={Information.etcagency}
                                className="readonly"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>가이드라인</th>
                          <td>
                            <Checkbox
                              title="MFDS"
                              name="guid1"
                              label={"MFDS"}
                              value={Information.guid1 == "A" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="ICH"
                              name="guid2"
                              label={"ICH"}
                              value={Information.guid2 == "B" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="OECD"
                              name="guid3"
                              label={"OECD"}
                              value={Information.guid3 == "C" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="FDA"
                              name="guid4"
                              label={"FDA"}
                              value={Information.guid4 == "D" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="APQA"
                              name="guid5"
                              label={"APQA"}
                              value={Information.guid5 == "E" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="기타"
                              name="guid6"
                              label={"기타"}
                              value={Information.guid6 == "K" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            {Information.guid6 == "K" ? (
                              <Input
                                name="etcguid"
                                type="text"
                                value={Information.etcguid}
                                onChange={InputChange}
                              />
                            ) : (
                              <Input
                                name="etcguid"
                                type="text"
                                value={Information.etcguid}
                                className="readonly"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>GLP기준</th>
                          <td>
                            <Checkbox
                              title="MFDS"
                              name="glp1"
                              label={"MFDS"}
                              value={Information.glp1 == "A" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="OECD"
                              name="glp2"
                              label={"OECD"}
                              value={Information.glp2 == "B" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="FDA"
                              name="glp3"
                              label={"FDA"}
                              value={Information.glp3 == "C" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="NIER"
                              name="glp4"
                              label={"NIER"}
                              value={Information.glp4 == "D" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="RDA"
                              name="glp5"
                              label={"RDA"}
                              value={Information.glp5 == "E" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="기타"
                              name="glp6"
                              label={"기타"}
                              value={Information.glp6 == "K" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            {Information.glp6 == "K" ? (
                              <Input
                                name="etcglp"
                                type="text"
                                value={Information.etcglp}
                                onChange={InputChange}
                              />
                            ) : (
                              <Input
                                name="etcglp"
                                type="text"
                                value={Information.etcglp}
                                className="readonly"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>최종보고서</th>
                          <td>
                            <Checkbox
                              title="한국어"
                              name="report1"
                              label={"한국어"}
                              value={Information.report1 == "K" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="영어"
                              name="report2"
                              label={"영어"}
                              value={Information.report2 == "E" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="일본어"
                              name="report3"
                              label={"일본어"}
                              value={Information.report3 == "J" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="기타"
                              name="report4"
                              label={"기타"}
                              value={Information.report4 == "T" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            {Information.report4 == "T" ? (
                              <Input
                                name="etcreport"
                                type="text"
                                value={Information.etcreport}
                                onChange={InputChange}
                              />
                            ) : (
                              <Input
                                name="etcreport"
                                type="text"
                                value={Information.etcreport}
                                className="readonly"
                              />
                            )}
                          </td>
                          <td>제본수</td>
                          <td>
                            <NumericTextBox
                              name="reportcnt"
                              value={Information.reportcnt}
                              format={"0"}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>번역보고서</th>
                          <td>
                            <Checkbox
                              title="한국어"
                              name="translate1"
                              label={"한국어"}
                              value={
                                Information.translate1 == "K" ? true : false
                              }
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="영어"
                              name="translate2"
                              label={"영어"}
                              value={
                                Information.translate2 == "E" ? true : false
                              }
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="일본어"
                              name="translate3"
                              label={"일본어"}
                              value={
                                Information.translate3 == "J" ? true : false
                              }
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              title="기타"
                              name="translate4"
                              label={"기타"}
                              value={
                                Information.translate4 == "T" ? true : false
                              }
                              onChange={InputChange}
                            />
                          </td>
                          <td>
                            {Information.translate4 == "T" ? (
                              <Input
                                name="etctranslatereport"
                                type="text"
                                value={Information.etctranslatereport}
                                onChange={InputChange}
                              />
                            ) : (
                              <Input
                                name="etctranslatereport"
                                type="text"
                                value={Information.etctranslatereport}
                                className="readonly"
                              />
                            )}
                          </td>
                          <td>제본수</td>
                          <td>
                            <NumericTextBox
                              name="transreportcnt"
                              value={Information.transreportcnt}
                              format={"0"}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>비고</th>
                          <td colSpan={7}>
                            <TextArea
                              value={Information.remark}
                              name="remark"
                              rows={2}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>첨부파일</th>
                          <td colSpan={7}>
                            <Input
                              name="files"
                              type="text"
                              value={Information.files}
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
                          <th>시험시작요청일</th>
                          <td>
                            <DatePicker
                              name="teststdt"
                              value={Information.teststdt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                            />
                          </td>
                          <th>시험종료요청일</th>
                          <td>
                            <DatePicker
                              name="testenddt"
                              value={Information.testenddt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                            />
                          </td>
                          <th>분석법 필요여부</th>
                          <td>
                            {worktype == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionRadioGroup
                                    name="assayyn"
                                    type="new"
                                    customOptionData={customOptionData}
                                    changeData={RadioChange}
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentRadioGroup
                                    name="assayyn"
                                    value={Information.assayyn}
                                    bizComponentId="R_YN4"
                                    bizComponentData={bizComponentData}
                                    changeData={RadioChange}
                                  />
                                )}
                          </td>
                          <th>분석법 제공예정일</th>
                          <td>
                            <DatePicker
                              name="assaydt"
                              value={Information.assaydt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </SwiperSlide>
                <SwiperSlide key={4}>
                  <FormBoxWrap
                    border={true}
                    style={{
                      height: deviceHeight - height - height2,
                      overflow: "auto",
                    }}
                  >
                    <FormContext.Provider
                      value={{
                        itemInfo,
                        setItemInfo,
                      }}
                    >
                      <GridContainer>
                        <GridTitleContainer className="ButtonContainer3">
                          <GridTitle>
                            {" "}
                            <Button
                              onClick={() => {
                                if (swiper) {
                                  swiper.slideTo(3);
                                }
                              }}
                              icon="chevron-left"
                              themeColor={"primary"}
                              fillMode={"flat"}
                            ></Button>
                            의뢰품목
                          </GridTitle>
                          <ButtonContainer>
                            <Button
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="palette"
                              onClick={onDesignWndClick}
                            >
                              디자인상세
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
                          </ButtonContainer>
                        </GridTitleContainer>
                        <ExcelExport
                          data={mainDataResult2.data}
                          ref={(exporter) => {
                            _export2 = exporter;
                          }}
                          fileName="프로젝트관리"
                        >
                          <Grid
                            style={{
                              height: deviceHeight - height - height2 - height3,
                            }}
                            data={process(
                              mainDataResult2.data.map((row) => ({
                                ...row,
                                rowstatus:
                                  row.rowstatus == null ||
                                  row.rowstatus == "" ||
                                  row.rowstatus == undefined
                                    ? ""
                                    : row.rowstatus,
                                startdt: row.startdt
                                  ? new Date(dateformat(row.startdt))
                                  : new Date(dateformat("99991231")),
                                enddt: row.enddt
                                  ? new Date(dateformat(row.enddt))
                                  : new Date(dateformat("99991231")),
                                quosts: quostsListData.find(
                                  (items: any) => items.sub_code == row.quosts
                                )?.code_name,
                                itemlvl1: itemlvl1ListData.find(
                                  (items: any) => items.sub_code == row.itemlvl1
                                )?.code_name,
                                ordsts: ordstsListData.find(
                                  (items: any) => items.sub_code == row.ordsts
                                )?.code_name,
                                [SELECTED_FIELD]:
                                  selectedState2[idGetter2(row)],
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
                            //정렬기능
                            sortable={true}
                            onSortChange={onMainSortChange2}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                            onItemChange={onItemChange2}
                            cellRender={customCellRender2}
                            rowRender={customRowRender2}
                            editField={EDIT_FIELD}
                          >
                            <GridColumn
                              field="rowstatus"
                              title=" "
                              width="50px"
                            />
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList2"
                              ]
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
                                          RadioField.includes(item.fieldName)
                                            ? CustomRadioCell
                                            : numberField.includes(
                                                item.fieldName
                                              )
                                            ? NumberCell
                                            : dateField.includes(item.fieldName)
                                            ? DateCell
                                            : itemField.includes(item.fieldName)
                                            ? ColumnCommandCell
                                            : undefined
                                        }
                                        headerCell={
                                          headerField.includes(item.fieldName)
                                            ? RequiredHeader
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? mainTotalFooterCell2
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </FormContext.Provider>
                  </FormBoxWrap>
                </SwiperSlide>
              </Swiper>
            </>
          ) : (
            <>
              <GridTitleContainer>
                <GridTitle></GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    onClick={onPrint}
                    icon="print"
                    disabled={worktype == "N" ? true : false}
                  >
                    시험의뢰서 출력
                  </Button>
                  <Button
                    onClick={onRevClick}
                    themeColor={"primary"}
                    icon="track-changes"
                    disabled={worktype == "N" ? true : false}
                  >
                    리비전
                  </Button>
                  <Button
                    onClick={onPlanClick}
                    themeColor={"primary"}
                    icon="track-changes-accept"
                    disabled={worktype == "N" ? true : false}
                  >
                    계획요청
                  </Button>
                  <Button
                    onClick={onPlanDeleteClick}
                    themeColor={"primary"}
                    icon="track-changes-reject"
                    disabled={worktype == "N" ? true : false}
                  >
                    계획요청취소
                  </Button>
                  <Button
                    onClick={onSaveClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <GridTitleContainer>
                  <GridTitle>기준정보</GridTitle>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>PJT NO.</th>
                      <td>
                        <Input
                          name="quonum"
                          type="text"
                          value={Information.quonum}
                          className="readonly"
                        />
                      </td>
                      <th>REV</th>
                      <td>
                        <Input
                          name="quorev"
                          type="number"
                          value={Information.quorev}
                          className="readonly"
                        />
                      </td>
                      <th>작성일자</th>
                      <td>
                        <DatePicker
                          name="quodt"
                          value={Information.quodt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                          className="required"
                        />
                      </td>
                      <th>등록자</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="person"
                            value={Information.person}
                            bizComponentId="L_sysUserMaster_001"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            textField="user_name"
                            valueField="user_id"
                            className="required"
                          />
                        )}
                      </td>
                      <th>영업담당자</th>
                      <td>
                        {worktype == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="chkperson"
                                value={Information.chkperson}
                                type="new"
                                customOptionData={customOptionData}
                                textField="user_name"
                                valueField="user_id"
                                changeData={ComboBoxChange}
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="chkperson"
                                value={Information.chkperson}
                                bizComponentId="L_sysUserMaster_001"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                textField="user_name"
                                valueField="user_id"
                              />
                            )}
                      </td>
                    </tr>
                    <tr>
                      <th>의뢰유형</th>
                      <td>
                        {worktype == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="quotype"
                                value={Information.quotype}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="quotype"
                                value={Information.quotype}
                                bizComponentId="L_SA016"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )}
                      </td>
                      <th>국가</th>
                      <td>
                        {worktype == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="numbering_id"
                                value={Information.numbering_id}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="numbering_id"
                                value={Information.numbering_id}
                                bizComponentId="L_BA057"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )}
                      </td>
                    </tr>
                    <tr>
                      <th>진행단계</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="quosts"
                            value={Information.quosts}
                            bizComponentId="L_SA004"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>수주상태</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="ordsts"
                            value={Information.ordsts}
                            bizComponentId="L_SA002"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>견적발행일</th>
                      <td>
                        <DatePicker
                          name="pubdt"
                          value={Information.pubdt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>개정사유</th>
                      <td colSpan={9}>
                        <Input
                          name="rev_reason"
                          type="text"
                          value={Information.rev_reason}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <GridTitleContainer>
                  <GridTitle>의뢰자정보</GridTitle>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>업체명</th>
                      <td colSpan={5}>
                        <Input
                          name="custnm"
                          type="text"
                          value={Information.custnm}
                          onChange={InputChange}
                        />
                        <ButtonInInput>
                          <Button
                            type={"button"}
                            onClick={onCustWndClick2}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                      <th></th>
                      <td></td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>의뢰자</th>
                      <td>
                        <Input
                          name="custprsnnm"
                          type="text"
                          value={Information.custprsnnm}
                          onChange={InputChange}
                        />
                      </td>
                      <th>소속</th>
                      <td>
                        <Input
                          name="remark2"
                          type="text"
                          value={Information.remark2}
                          onChange={InputChange}
                        />
                      </td>
                      <th>직위</th>
                      <td>
                        {worktype == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="postcd"
                                value={Information.postcd}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="postcd"
                                value={Information.postcd}
                                bizComponentId="L_HU005"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                      <th></th>
                      <td></td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>TEL</th>
                      <td>
                        <Input
                          name="tel"
                          type="text"
                          value={Information.tel}
                          onChange={InputChange}
                        />
                      </td>
                      <th>C.P</th>
                      <td>
                        <Input
                          name="extra_field4"
                          type="text"
                          value={Information.extra_field4}
                          onChange={InputChange}
                        />
                      </td>
                      <th>이메일</th>
                      <td>
                        <Input
                          name="email"
                          type="text"
                          value={Information.email}
                          onChange={InputChange}
                        />
                      </td>
                      <th></th>
                      <td></td>
                      <th></th>
                      <td></td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <GridTitleContainer>
                  <GridTitle>모니터정보</GridTitle>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>모니터사</th>
                      <td colSpan={5}>
                        <Input
                          name="rcvcustnm"
                          type="text"
                          value={Information.rcvcustnm}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>모니터</th>
                      <td>
                        <Input
                          name="rcvcustprsnnm"
                          type="text"
                          value={Information.rcvcustprsnnm}
                          onChange={InputChange}
                        />
                      </td>
                      <th>소속</th>
                      <td>
                        <Input
                          name="remark3"
                          type="text"
                          value={Information.remark3}
                          onChange={InputChange}
                        />
                      </td>
                      <th>직위</th>
                      <td>
                        {worktype == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="rcvpostcd"
                                value={Information.rcvpostcd}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="rcvpostcd"
                                value={Information.rcvpostcd}
                                bizComponentId="L_HU005"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                      <th></th>
                      <td></td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>TEL</th>
                      <td>
                        <Input
                          name="rcvtel"
                          type="text"
                          value={Information.rcvtel}
                          onChange={InputChange}
                        />
                      </td>
                      <th>C.P</th>
                      <td>
                        <Input
                          name="extra_field5"
                          type="text"
                          value={Information.extra_field5}
                          onChange={InputChange}
                        />
                      </td>
                      <th>이메일</th>
                      <td>
                        <Input
                          name="rcvemail"
                          type="text"
                          value={Information.rcvemail}
                          onChange={InputChange}
                        />
                      </td>
                      <th></th>
                      <td></td>
                      <th></th>
                      <td></td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <GridTitleContainer>
                  <GridTitle>의뢰정보</GridTitle>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>의뢰분야</th>
                      <td>
                        {worktype == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="testtype"
                                value={Information.testtype}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="testtype"
                                value={Information.testtype}
                                bizComponentId="L_SA019_603"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                      <th>의뢰목적</th>
                      <td>
                        {worktype == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="requestgb"
                                value={Information.requestgb}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="requestgb"
                                value={Information.requestgb}
                                bizComponentId="L_Requestgb"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )}
                      </td>
                      <th>적응증</th>
                      <td colSpan={3}>
                        <Input
                          name="extra_field3"
                          type="text"
                          value={Information.extra_field3}
                          onChange={InputChange}
                        />
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>물질분야</th>
                      <td>
                        {worktype == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="materialtype"
                                value={Information.materialtype}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="materialtype"
                                value={Information.materialtype}
                                bizComponentId="L_SA001_603"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                      <th>물질상세분야</th>
                      <td>
                        {worktype == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="extra_field2"
                                value={Information.extra_field2}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="extra_field2"
                                value={Information.extra_field2}
                                bizComponentId="L_CM501_603"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                      <th>물질정보</th>
                      <td colSpan={3}>
                        <Input
                          name="materialinfo"
                          type="text"
                          value={Information.materialinfo}
                          onChange={InputChange}
                        />
                      </td>
                      <th>물질입고예정일</th>
                      <td>
                        <DatePicker
                          name="materialindt"
                          value={Information.materialindt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                          className="required"
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>시험물질명</th>
                      <td colSpan={5}>
                        <Input
                          name="materialnm"
                          type="text"
                          value={Information.materialnm}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>허가기관</th>
                      <td>
                        <Checkbox
                          title="MFDS"
                          name="agency1"
                          label={"MFDS"}
                          value={Information.agency1 == "A" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="NIER"
                          name="agency2"
                          label={"NIER"}
                          value={Information.agency2 == "B" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="APQA"
                          name="agency3"
                          label={"APQA"}
                          value={Information.agency3 == "C" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="RDA"
                          name="agency4"
                          label={"RDA"}
                          value={Information.agency4 == "D" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="FDA"
                          name="agency5"
                          label={"FDA"}
                          value={Information.agency5 == "E" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="기타"
                          name="agency6"
                          label={"기타"}
                          value={Information.agency6 == "K" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        {Information.agency6 == "K" ? (
                          <Input
                            name="etcagency"
                            type="text"
                            value={Information.etcagency}
                            onChange={InputChange}
                          />
                        ) : (
                          <Input
                            name="etcagency"
                            type="text"
                            value={Information.etcagency}
                            className="readonly"
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>가이드라인</th>
                      <td>
                        <Checkbox
                          title="MFDS"
                          name="guid1"
                          label={"MFDS"}
                          value={Information.guid1 == "A" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="ICH"
                          name="guid2"
                          label={"ICH"}
                          value={Information.guid2 == "B" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="OECD"
                          name="guid3"
                          label={"OECD"}
                          value={Information.guid3 == "C" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="FDA"
                          name="guid4"
                          label={"FDA"}
                          value={Information.guid4 == "D" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="APQA"
                          name="guid5"
                          label={"APQA"}
                          value={Information.guid5 == "E" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="기타"
                          name="guid6"
                          label={"기타"}
                          value={Information.guid6 == "K" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        {Information.guid6 == "K" ? (
                          <Input
                            name="etcguid"
                            type="text"
                            value={Information.etcguid}
                            onChange={InputChange}
                          />
                        ) : (
                          <Input
                            name="etcguid"
                            type="text"
                            value={Information.etcguid}
                            className="readonly"
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>GLP기준</th>
                      <td>
                        <Checkbox
                          title="MFDS"
                          name="glp1"
                          label={"MFDS"}
                          value={Information.glp1 == "A" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="OECD"
                          name="glp2"
                          label={"OECD"}
                          value={Information.glp2 == "B" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="FDA"
                          name="glp3"
                          label={"FDA"}
                          value={Information.glp3 == "C" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="NIER"
                          name="glp4"
                          label={"NIER"}
                          value={Information.glp4 == "D" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="RDA"
                          name="glp5"
                          label={"RDA"}
                          value={Information.glp5 == "E" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="기타"
                          name="glp6"
                          label={"기타"}
                          value={Information.glp6 == "K" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        {Information.glp6 == "K" ? (
                          <Input
                            name="etcglp"
                            type="text"
                            value={Information.etcglp}
                            onChange={InputChange}
                          />
                        ) : (
                          <Input
                            name="etcglp"
                            type="text"
                            value={Information.etcglp}
                            className="readonly"
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>최종보고서</th>
                      <td>
                        <Checkbox
                          title="한국어"
                          name="report1"
                          label={"한국어"}
                          value={Information.report1 == "K" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="영어"
                          name="report2"
                          label={"영어"}
                          value={Information.report2 == "E" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="일본어"
                          name="report3"
                          label={"일본어"}
                          value={Information.report3 == "J" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="기타"
                          name="report4"
                          label={"기타"}
                          value={Information.report4 == "T" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        {Information.report4 == "T" ? (
                          <Input
                            name="etcreport"
                            type="text"
                            value={Information.etcreport}
                            onChange={InputChange}
                          />
                        ) : (
                          <Input
                            name="etcreport"
                            type="text"
                            value={Information.etcreport}
                            className="readonly"
                          />
                        )}
                      </td>
                      <td>제본수</td>
                      <td>
                        <NumericTextBox
                          name="reportcnt"
                          value={Information.reportcnt}
                          format={"0"}
                          onChange={InputChange}
                        />
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>번역보고서</th>
                      <td>
                        <Checkbox
                          title="한국어"
                          name="translate1"
                          label={"한국어"}
                          value={Information.translate1 == "K" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="영어"
                          name="translate2"
                          label={"영어"}
                          value={Information.translate2 == "E" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="일본어"
                          name="translate3"
                          label={"일본어"}
                          value={Information.translate3 == "J" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          title="기타"
                          name="translate4"
                          label={"기타"}
                          value={Information.translate4 == "T" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        {Information.translate4 == "T" ? (
                          <Input
                            name="etctranslatereport"
                            type="text"
                            value={Information.etctranslatereport}
                            onChange={InputChange}
                          />
                        ) : (
                          <Input
                            name="etctranslatereport"
                            type="text"
                            value={Information.etctranslatereport}
                            className="readonly"
                          />
                        )}
                      </td>
                      <td>제본수</td>
                      <td>
                        <NumericTextBox
                          name="transreportcnt"
                          value={Information.transreportcnt}
                          format={"0"}
                          onChange={InputChange}
                        />
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>비고</th>
                      <td colSpan={7}>
                        <TextArea
                          value={Information.remark}
                          name="remark"
                          rows={2}
                          onChange={InputChange}
                        />
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>첨부파일</th>
                      <td colSpan={7}>
                        <Input
                          name="files"
                          type="text"
                          value={Information.files}
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
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>시험시작요청일</th>
                      <td>
                        <DatePicker
                          name="teststdt"
                          value={Information.teststdt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                        />
                      </td>
                      <th>시험종료요청일</th>
                      <td>
                        <DatePicker
                          name="testenddt"
                          value={Information.testenddt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                        />
                      </td>
                      <th>분석법 필요여부</th>
                      <td>
                        {worktype == "N"
                          ? customOptionData !== null && (
                              <CustomOptionRadioGroup
                                name="assayyn"
                                type="new"
                                customOptionData={customOptionData}
                                changeData={RadioChange}
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentRadioGroup
                                name="assayyn"
                                value={Information.assayyn}
                                bizComponentId="R_YN4"
                                bizComponentData={bizComponentData}
                                changeData={RadioChange}
                              />
                            )}
                      </td>
                      <th>분석법 제공예정일</th>
                      <td>
                        <DatePicker
                          name="assaydt"
                          value={Information.assaydt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                        />
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <FormContext.Provider
                  value={{
                    itemInfo,
                    setItemInfo,
                  }}
                >
                  <GridContainer>
                    <GridTitleContainer>
                      <GridTitle>의뢰품목</GridTitle>
                      <ButtonContainer>
                        <Button
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="palette"
                          onClick={onDesignWndClick}
                        >
                          디자인상세
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
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult2.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName="프로젝트관리"
                    >
                      <Grid
                        style={{
                          height: isMobile ? "50vh" : `calc(80vh - 500px)`,
                        }}
                        data={process(
                          mainDataResult2.data.map((row) => ({
                            ...row,
                            rowstatus:
                              row.rowstatus == null ||
                              row.rowstatus == "" ||
                              row.rowstatus == undefined
                                ? ""
                                : row.rowstatus,
                            startdt: row.startdt
                              ? new Date(dateformat(row.startdt))
                              : new Date(dateformat("99991231")),
                            enddt: row.enddt
                              ? new Date(dateformat(row.enddt))
                              : new Date(dateformat("99991231")),
                            quosts: quostsListData.find(
                              (items: any) => items.sub_code == row.quosts
                            )?.code_name,
                            itemlvl1: itemlvl1ListData.find(
                              (items: any) => items.sub_code == row.itemlvl1
                            )?.code_name,
                            ordsts: ordstsListData.find(
                              (items: any) => items.sub_code == row.ordsts
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
                        onSelectionChange={onSelectionChange2}
                        //스크롤 조회 기능
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
                        onItemChange={onItemChange2}
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
                                      RadioField.includes(item.fieldName)
                                        ? CustomRadioCell
                                        : numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : dateField.includes(item.fieldName)
                                        ? DateCell
                                        : itemField.includes(item.fieldName)
                                        ? ColumnCommandCell
                                        : undefined
                                    }
                                    headerCell={
                                      headerField.includes(item.fieldName)
                                        ? RequiredHeader
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell2
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </FormContext.Provider>
              </FormBoxWrap>
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="상세이력"
          disabled={mainDataResult.total == 0 ? true : false}
        >
          {isMobile ? (
            <Swiper
              onSwiper={(swiper) => {
                setSwiper(swiper);
              }}
              onActiveIndexChange={(swiper) => {
                index = swiper.activeIndex;
              }}
            >
              <SwiperSlide key={0}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer4">
                    <GridTitle>
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
                        상세이력{" "}
                        <Button
                          onClick={() => {
                            if (swiper) {
                              swiper.slideTo(1);
                            }
                          }}
                          icon="chevron-right"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </ButtonContainer>
                    </GridTitle>
                  </GridTitleContainer>
                  <FormBoxWrap
                    border={true}
                    style={{
                      display: isMobile ? "block" : "flex",
                      height: deviceHeight - height - height4,
                      overflow: "auto",
                    }}
                  >
                    <FormBox>
                      <GridTitleContainer>
                        <GridTitle>Feasibility</GridTitle>
                      </GridTitleContainer>
                      <tbody>
                        <tr>
                          <th>물질확보여부</th>
                          <td>
                            <Input
                              name="materialgb"
                              type="text"
                              value={
                                materialgbListData.find(
                                  (items: any) =>
                                    items.sub_code == Information2.materialgb
                                )?.code_name != undefined
                                  ? materialgbListData.find(
                                      (items: any) =>
                                        items.sub_code ==
                                        Information2.materialgb
                                    )?.code_name
                                  : ""
                              }
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="grade1"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.grade1)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>분석법 보유 여부</th>
                          <td>
                            <Input
                              name="assaygbe"
                              type="text"
                              value={
                                assaygbeListData.find(
                                  (items: any) =>
                                    items.sub_code == Information2.assaygbe
                                )?.code_name != undefined
                                  ? assaygbeListData.find(
                                      (items: any) =>
                                        items.sub_code == Information2.assaygbe
                                    )?.code_name
                                  : ""
                              }
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="grade2"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.grade2)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>시작예정</th>
                          <td>
                            <Input
                              name="startschgb"
                              type="text"
                              value={
                                startschgbListData.find(
                                  (items: any) =>
                                    items.sub_code == Information2.startschgb
                                )?.code_name != undefined
                                  ? startschgbListData.find(
                                      (items: any) =>
                                        items.sub_code ==
                                        Information2.startschgb
                                    )?.code_name
                                  : ""
                              }
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="grade3"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.grade3)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>재무/투자현황</th>
                          <td>
                            <Input
                              name="financegb"
                              type="text"
                              value={
                                financegbListData.find(
                                  (items: any) =>
                                    items.sub_code == Information2.financegb
                                )?.code_name != undefined
                                  ? financegbListData.find(
                                      (items: any) =>
                                        items.sub_code == Information2.financegb
                                    )?.code_name
                                  : ""
                              }
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="grade4"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.grade4)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>합계</th>
                          <td colSpan={2}>
                            <Input
                              name="totgrade1"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.totgrade1)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>결과</th>
                          <td colSpan={2}>
                            <Input
                              name="level1"
                              type="text"
                              style={{
                                textAlign: "center",
                              }}
                              value={Information2.level1}
                              className="readonly"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                    <FormBox width={"50%"}>
                      <GridTitleContainer>
                        <GridTitle>Weight</GridTitle>
                      </GridTitleContainer>
                      <tbody>
                        <tr>
                          <th>금액</th>
                          <td>
                            <Input
                              name="amtgb"
                              type="text"
                              value={
                                amtgbListData.find(
                                  (items: any) =>
                                    items.sub_code == Information2.amtgb
                                )?.code_name != undefined
                                  ? amtgbListData.find(
                                      (items: any) =>
                                        items.sub_code == Information2.amtgb
                                    )?.code_name
                                  : ""
                              }
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="grade5"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.grade5)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>추가수주</th>
                          <td>
                            <Input
                              name="addordgb"
                              type="text"
                              value={
                                addordgbListData.find(
                                  (items: any) =>
                                    items.sub_code == Information2.addordgb
                                )?.code_name != undefined
                                  ? addordgbListData.find(
                                      (items: any) =>
                                        items.sub_code == Information2.addordgb
                                    )?.code_name
                                  : ""
                              }
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="grade6"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.grade6)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>BTT관계사 확장</th>
                          <td>
                            <Input
                              name="relationgb"
                              type="text"
                              value={
                                relationgbListData.find(
                                  (items: any) =>
                                    items.sub_code == Information2.relationgb
                                )?.code_name != undefined
                                  ? relationgbListData.find(
                                      (items: any) =>
                                        items.sub_code ==
                                        Information2.relationgb
                                    )?.code_name
                                  : ""
                              }
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="grade7"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.grade7)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>합계</th>
                          <td colSpan={2}>
                            <Input
                              name="totgrade2"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.totgrade2)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>결과</th>
                          <td colSpan={2}>
                            <Input
                              name="level2"
                              type="text"
                              style={{
                                textAlign: "center",
                              }}
                              value={Information2.level2}
                              className="readonly"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer4">
                    <GridTitle>
                      {" "}
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
                        <ButtonContainer>
                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(0);
                              }
                            }}
                            icon="chevron-left"
                            themeColor={"primary"}
                            fillMode={"flat"}
                          ></Button>
                          계약성사관리{" "}
                        </ButtonContainer>
                        <Button
                          onClick={() => {
                            if (swiper) {
                              swiper.slideTo(2);
                            }
                          }}
                          icon="chevron-right"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </ButtonContainer>
                    </GridTitle>
                  </GridTitleContainer>
                  <FormBoxWrap
                    border={true}
                    style={{
                      display: isMobile ? "block" : "flex",
                      height: deviceHeight - height - height4,
                      overflow: "auto",
                    }}
                  >
                    <GridContainer style={{ flexDirection: "column" }}>
                      <FormBox>
                        <tbody>
                          <tr>
                            <th style={{ textAlign: "right" }}>견적차수</th>
                            <td>
                              <Input
                                name="quorev"
                                type="text"
                                style={{
                                  textAlign: "center",
                                }}
                                value={Information2.quorev}
                                className="readonly"
                              />
                            </td>
                            <th style={{ textAlign: "right" }}>견적제출일</th>
                            <td>
                              <Input
                                name="submitdt"
                                type="text"
                                style={{
                                  textAlign: "center",
                                }}
                                value={dateformat2(Information2.submitdt)}
                                className="readonly"
                              />
                            </td>
                            <th style={{ textAlign: "right" }}>활동차수</th>
                            <td>
                              <Input
                                name="seq"
                                type="text"
                                style={{
                                  textAlign: "center",
                                }}
                                value={Information2.seq}
                                className="readonly"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th style={{ textAlign: "right" }}>계약목표일</th>
                            <td>
                              <Input
                                name="conplandt"
                                type="text"
                                style={{
                                  textAlign: "center",
                                }}
                                value={dateformat2(Information2.conplandt)}
                                className="readonly"
                              />
                            </td>
                            <th style={{ textAlign: "right" }}>경과기간</th>
                            <td>
                              <Input
                                name="passdt"
                                type="text"
                                style={{
                                  textAlign: "center",
                                }}
                                value={Information2.passdt}
                                className="readonly"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </GridContainer>
                  </FormBoxWrap>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={2}>
                <GridContainer style={{ width: "100%" }}>
                  <ExcelExport
                    data={mainDataResult3.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName="프로젝트관리"
                  >
                    <GridTitleContainer className="ButtonContainer4">
                      <GridTitle>
                        <ButtonContainer
                          style={{ justifyContent: "space-between" }}
                        >
                          <ButtonContainer>
                            <Button
                              onClick={() => {
                                if (swiper) {
                                  swiper.slideTo(1);
                                }
                              }}
                              icon="chevron-left"
                              themeColor={"primary"}
                              fillMode={"flat"}
                            ></Button>
                            코멘트
                          </ButtonContainer>
                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(3);
                              }
                            }}
                            icon="chevron-right"
                            themeColor={"primary"}
                            fillMode={"flat"}
                          ></Button>
                        </ButtonContainer>
                      </GridTitle>
                    </GridTitleContainer>
                    <Grid
                      style={{ height: deviceHeight - height - height4 }}
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
                      onSelectionChange={onSelectionChange3}
                      //스크롤 조회 기능
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
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList3"]
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
                                    dateField.includes(item.fieldName)
                                      ? DateCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder === 0
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
              <SwiperSlide key={3}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer4">
                    <GridTitle>
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
                        <ButtonContainer>
                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(2);
                              }
                            }}
                            icon="chevron-left"
                            themeColor={"primary"}
                            fillMode={"flat"}
                          ></Button>
                          상담
                        </ButtonContainer>
                        <Button
                          onClick={() => {
                            if (swiper) {
                              swiper.slideTo(4);
                            }
                          }}
                          icon="chevron-right"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </ButtonContainer>
                    </GridTitle>
                  </GridTitleContainer>
                  <GridContainer width={"100%"}>
                    <ExcelExport
                      data={mainDataResult4.data}
                      ref={(exporter) => {
                        _export4 = exporter;
                      }}
                      fileName="프로젝트관리"
                    >
                      <Grid
                        style={{ height: deviceHeight - height - height4 }}
                        data={process(
                          mainDataResult4.data.map((row) => ({
                            ...row,
                            person: userListData.find(
                              (items: any) => items.user_id == row.person
                            )?.user_name,
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
                        onSelectionChange={onSelectionChange4}
                        onRowDoubleClick={onLinkChange}
                        //스크롤 조회 기능
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
                      >
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList4"]
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
                                    cell={
                                      dateField.includes(item.fieldName)
                                        ? DateCell
                                        : undefined
                                    }
                                    width={item.width}
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
                  </GridContainer>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={4}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer4">
                    <GridTitle>
                      {" "}
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
                        <ButtonContainer>
                          <Button
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(3);
                              }
                            }}
                            icon="chevron-left"
                            themeColor={"primary"}
                            fillMode={"flat"}
                          ></Button>
                          컨설팅{" "}
                        </ButtonContainer>
                        <Button
                          onClick={() => {
                            if (swiper) {
                              swiper.slideTo(5);
                            }
                          }}
                          icon="chevron-right"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </ButtonContainer>
                    </GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult5.data}
                    ref={(exporter) => {
                      _export5 = exporter;
                    }}
                    fileName="프로젝트관리"
                  >
                    <Grid
                      style={{ height: deviceHeight - height - height4 }}
                      data={process(
                        mainDataResult5.data.map((row) => ({
                          ...row,
                          user_id: userListData.find(
                            (items: any) => items.user_id == row.user_id
                          )?.user_name,
                          ans_person: userListData.find(
                            (items: any) => items.user_id == row.ans_person
                          )?.user_name,
                          medicine_type: meditypeListData.find(
                            (items: any) => items.sub_code == row.medicine_type
                          )?.code_name,
                          require_type: statusListData.find(
                            (items: any) => items.sub_code == row.require_type
                          )?.code_name,
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
                      onSelectionChange={onSelectionChange5}
                      onRowDoubleClick={onLinkChange2}
                      //스크롤 조회 기능
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
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList5"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={idx}
                                  id={item.id}
                                  field={item.fieldName}
                                  title={item.caption}
                                  cell={
                                    dateField.includes(item.fieldName)
                                      ? DateCell
                                      : undefined
                                  }
                                  width={item.width}
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
              </SwiperSlide>
              <SwiperSlide key={5}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer4">
                    <GridTitle>
                      {" "}
                      <ButtonContainer style={{ justifyContent: "left" }}>
                        <Button
                          onClick={() => {
                            if (swiper) {
                              swiper.slideTo(4);
                            }
                          }}
                          icon="chevron-left"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                        견적
                      </ButtonContainer>
                    </GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult6.data}
                    ref={(exporter) => {
                      _export6 = exporter;
                    }}
                    fileName="프로젝트관리"
                  >
                    <Grid
                      style={{ height: deviceHeight - height - height4 }}
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
                      onSelectionChange={onSelectionChange6}
                      onRowDoubleClick={onLinkChange3}
                      //스크롤 조회 기능
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
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList6"]
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
                                    dateField.includes(item.fieldName)
                                      ? DateCell
                                      : numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell6
                                      : numberField.includes(item.fieldName)
                                      ? gridSumQtyFooterCell6
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainerWrap>
                <GridContainer width="50%">
                  <GridTitleContainer>
                    <GridTitle>상세이력</GridTitle>
                    <ButtonContainer>
                      <Button
                        themeColor={"primary"}
                        fillMode={"solid"}
                        onClick={() => onLinkChange4()}
                      >
                        이동
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <FormBoxWrap
                    border={true}
                    style={{ display: isMobile ? "block" : "flex" }}
                  >
                    <FormBox width={"50%"}>
                      <GridTitleContainer>
                        <GridTitle>Feasibility</GridTitle>
                      </GridTitleContainer>
                      <tbody>
                        <tr>
                          <th>물질확보여부</th>
                          <td>
                            <Input
                              name="materialgb"
                              type="text"
                              value={
                                materialgbListData.find(
                                  (items: any) =>
                                    items.sub_code == Information2.materialgb
                                )?.code_name != undefined
                                  ? materialgbListData.find(
                                      (items: any) =>
                                        items.sub_code ==
                                        Information2.materialgb
                                    )?.code_name
                                  : ""
                              }
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="grade1"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.grade1)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>분석법 보유 여부</th>
                          <td>
                            <Input
                              name="assaygbe"
                              type="text"
                              value={
                                assaygbeListData.find(
                                  (items: any) =>
                                    items.sub_code == Information2.assaygbe
                                )?.code_name != undefined
                                  ? assaygbeListData.find(
                                      (items: any) =>
                                        items.sub_code == Information2.assaygbe
                                    )?.code_name
                                  : ""
                              }
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="grade2"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.grade2)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>시작예정</th>
                          <td>
                            <Input
                              name="startschgb"
                              type="text"
                              value={
                                startschgbListData.find(
                                  (items: any) =>
                                    items.sub_code == Information2.startschgb
                                )?.code_name != undefined
                                  ? startschgbListData.find(
                                      (items: any) =>
                                        items.sub_code ==
                                        Information2.startschgb
                                    )?.code_name
                                  : ""
                              }
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="grade3"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.grade3)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>재무/투자현황</th>
                          <td>
                            <Input
                              name="financegb"
                              type="text"
                              value={
                                financegbListData.find(
                                  (items: any) =>
                                    items.sub_code == Information2.financegb
                                )?.code_name != undefined
                                  ? financegbListData.find(
                                      (items: any) =>
                                        items.sub_code == Information2.financegb
                                    )?.code_name
                                  : ""
                              }
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="grade4"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.grade4)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>합계</th>
                          <td colSpan={2}>
                            <Input
                              name="totgrade1"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.totgrade1)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>결과</th>
                          <td colSpan={2}>
                            <Input
                              name="level1"
                              type="text"
                              style={{
                                textAlign: "center",
                              }}
                              value={Information2.level1}
                              className="readonly"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                    <FormBox width={"50%"}>
                      <GridTitleContainer>
                        <GridTitle>Weight</GridTitle>
                      </GridTitleContainer>
                      <tbody>
                        <tr>
                          <th>금액</th>
                          <td>
                            <Input
                              name="amtgb"
                              type="text"
                              value={
                                amtgbListData.find(
                                  (items: any) =>
                                    items.sub_code == Information2.amtgb
                                )?.code_name != undefined
                                  ? amtgbListData.find(
                                      (items: any) =>
                                        items.sub_code == Information2.amtgb
                                    )?.code_name
                                  : ""
                              }
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="grade5"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.grade5)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>추가수주</th>
                          <td>
                            <Input
                              name="addordgb"
                              type="text"
                              value={
                                addordgbListData.find(
                                  (items: any) =>
                                    items.sub_code == Information2.addordgb
                                )?.code_name != undefined
                                  ? addordgbListData.find(
                                      (items: any) =>
                                        items.sub_code == Information2.addordgb
                                    )?.code_name
                                  : ""
                              }
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="grade6"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.grade6)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>BTT관계사 확장</th>
                          <td>
                            <Input
                              name="relationgb"
                              type="text"
                              value={
                                relationgbListData.find(
                                  (items: any) =>
                                    items.sub_code == Information2.relationgb
                                )?.code_name != undefined
                                  ? relationgbListData.find(
                                      (items: any) =>
                                        items.sub_code ==
                                        Information2.relationgb
                                    )?.code_name
                                  : ""
                              }
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="grade7"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.grade7)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>합계</th>
                          <td colSpan={2}>
                            <Input
                              name="totgrade2"
                              type="number"
                              style={{
                                textAlign: "right",
                              }}
                              value={numberWithCommas3(Information2.totgrade2)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>결과</th>
                          <td colSpan={2}>
                            <Input
                              name="level2"
                              type="text"
                              style={{
                                textAlign: "center",
                              }}
                              value={Information2.level2}
                              className="readonly"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>

                  <GridTitleContainer>
                    <GridTitle>계약성사관리</GridTitle>
                  </GridTitleContainer>
                  <FormBoxWrap
                    border={true}
                    style={{ display: isMobile ? "block" : "flex" }}
                  >
                    <GridContainer style={{ flexDirection: "column" }}>
                      <FormBox>
                        <tbody>
                          <tr>
                            <th style={{ textAlign: "right" }}>견적차수</th>
                            <td>
                              <Input
                                name="quorev"
                                type="text"
                                style={{
                                  textAlign: "center",
                                }}
                                value={Information2.quorev}
                                className="readonly"
                              />
                            </td>
                            <th style={{ textAlign: "right" }}>견적제출일</th>
                            <td>
                              <Input
                                name="submitdt"
                                type="text"
                                style={{
                                  textAlign: "center",
                                }}
                                value={dateformat2(Information2.submitdt)}
                                className="readonly"
                              />
                            </td>
                            <th style={{ textAlign: "right" }}>활동차수</th>
                            <td>
                              <Input
                                name="seq"
                                type="text"
                                style={{
                                  textAlign: "center",
                                }}
                                value={Information2.seq}
                                className="readonly"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th style={{ textAlign: "right" }}>계약목표일</th>
                            <td>
                              <Input
                                name="conplandt"
                                type="text"
                                style={{
                                  textAlign: "center",
                                }}
                                value={dateformat2(Information2.conplandt)}
                                className="readonly"
                              />
                            </td>
                            <th style={{ textAlign: "right" }}>경과기간</th>
                            <td>
                              <Input
                                name="passdt"
                                type="text"
                                style={{
                                  textAlign: "center",
                                }}
                                value={Information2.passdt}
                                className="readonly"
                              />
                            </td>
                            <th></th>
                            <td></td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </GridContainer>
                  </FormBoxWrap>
                  <GridContainer>
                    <ExcelExport
                      data={mainDataResult3.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="프로젝트관리"
                    >
                      <GridTitleContainer>
                        <GridTitle>코멘트</GridTitle>
                      </GridTitleContainer>
                      <Grid
                        style={{ height: "58.5vh" }}
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
                        onSelectionChange={onSelectionChange3}
                        //스크롤 조회 기능
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
                      >
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
                                      dateField.includes(item.fieldName)
                                        ? DateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder === 0
                                        ? mainTotalFooterCell3
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </GridContainer>
                <GridContainer width={`calc(50% - ${GAP}px)`}>
                  <GridTitleContainer>
                    <GridTitle>상담</GridTitle>
                  </GridTitleContainer>
                  <FormBoxWrap border={true}>
                    <GridContainer width={"100%"}>
                      <ExcelExport
                        data={mainDataResult4.data}
                        ref={(exporter) => {
                          _export4 = exporter;
                        }}
                        fileName="프로젝트관리"
                      >
                        <Grid
                          style={{ height: "29vh" }}
                          data={process(
                            mainDataResult4.data.map((row) => ({
                              ...row,
                              person: userListData.find(
                                (items: any) => items.user_id == row.person
                              )?.user_name,
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
                          onSelectionChange={onSelectionChange4}
                          onRowDoubleClick={onLinkChange}
                          //스크롤 조회 기능
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
                        >
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions["grdList4"]
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
                                      cell={
                                        dateField.includes(item.fieldName)
                                          ? DateCell
                                          : undefined
                                      }
                                      width={item.width}
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
                    </GridContainer>
                  </FormBoxWrap>
                  <GridTitleContainer>
                    <GridTitle>컨설팅</GridTitle>
                  </GridTitleContainer>
                  <FormBoxWrap border={true}>
                    <GridContainer width={"100%"}>
                      <ExcelExport
                        data={mainDataResult5.data}
                        ref={(exporter) => {
                          _export5 = exporter;
                        }}
                        fileName="프로젝트관리"
                      >
                        <Grid
                          style={{ height: "30vh" }}
                          data={process(
                            mainDataResult5.data.map((row) => ({
                              ...row,
                              user_id: userListData.find(
                                (items: any) => items.user_id == row.user_id
                              )?.user_name,
                              ans_person: userListData.find(
                                (items: any) => items.user_id == row.ans_person
                              )?.user_name,
                              medicine_type: meditypeListData.find(
                                (items: any) =>
                                  items.sub_code == row.medicine_type
                              )?.code_name,
                              require_type: statusListData.find(
                                (items: any) =>
                                  items.sub_code == row.require_type
                              )?.code_name,
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
                          onSelectionChange={onSelectionChange5}
                          onRowDoubleClick={onLinkChange2}
                          //스크롤 조회 기능
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
                        >
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions["grdList5"]
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
                                      cell={
                                        dateField.includes(item.fieldName)
                                          ? DateCell
                                          : undefined
                                      }
                                      width={item.width}
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
                  </FormBoxWrap>
                  <GridTitleContainer>
                    <GridTitle>견적</GridTitle>
                  </GridTitleContainer>
                  <FormBoxWrap border={true}>
                    <GridContainer width={"100%"}>
                      <ExcelExport
                        data={mainDataResult6.data}
                        ref={(exporter) => {
                          _export6 = exporter;
                        }}
                        fileName="프로젝트관리"
                      >
                        <Grid
                          style={{ height: "30vh" }}
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
                          onSelectionChange={onSelectionChange6}
                          onRowDoubleClick={onLinkChange3}
                          //스크롤 조회 기능
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
                        >
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions["grdList6"]
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
                                        dateField.includes(item.fieldName)
                                          ? DateCell
                                          : numberField.includes(item.fieldName)
                                          ? NumberCell
                                          : undefined
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? mainTotalFooterCell6
                                          : numberField.includes(item.fieldName)
                                          ? gridSumQtyFooterCell6
                                          : undefined
                                      }
                                    />
                                  )
                              )}
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                  </FormBoxWrap>
                </GridContainer>
              </GridContainerWrap>
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="시험진행관리"
          disabled={mainDataResult.total == 0 ? true : false}
        >
          {isMobile ? (
            <Swiper
              onSwiper={(swiper) => {
                setSwiper(swiper);
              }}
              onActiveIndexChange={(swiper) => {
                index = swiper.activeIndex;
              }}
            >
              <SwiperSlide key={0}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer5">
                    <GridTitle>
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
                        시험리스트
                        <Button
                          onClick={() => {
                            if (swiper) {
                              swiper.slideTo(1);
                            }
                          }}
                          icon="chevron-right"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </ButtonContainer>
                    </GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult7.data}
                    ref={(exporter) => {
                      _export7 = exporter;
                    }}
                    fileName="프로젝트관리"
                  >
                    <Grid
                      style={{ height: deviceHeight - height - height5 }}
                      data={process(
                        mainDataResult7.data.map((row) => ({
                          ...row,
                          rowstatus:
                            row.rowstatus == null ||
                            row.rowstatus == "" ||
                            row.rowstatus == undefined
                              ? ""
                              : row.rowstatus,
                          status: statusListData3.find(
                            (items: any) => items.sub_code == row.status
                          )?.code_name,
                          [SELECTED_FIELD]: selectedState7[idGetter7(row)],
                        })),
                        mainDataState7
                      )}
                      {...mainDataState7}
                      onDataStateChange={onMainDataStateChange7}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY7}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange7}
                      //스크롤 조회 기능
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
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList7"]
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
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : percentField.includes(item.fieldName)
                                      ? CustomPercentCell
                                      : centerField2.includes(item.fieldName)
                                      ? CenterCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell7
                                      : numberField.includes(item.fieldName)
                                      ? gridSumQtyFooterCell7
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ marginBottom: "10px", width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer5">
                    <GridTitle>
                      {" "}
                      <Button
                        onClick={() => {
                          if (swiper) {
                            swiper.slideTo(0);
                          }
                        }}
                        icon="chevron-left"
                        themeColor={"primary"}
                        fillMode={"flat"}
                      ></Button>
                      진행상황
                    </GridTitle>
                  </GridTitleContainer>
                  <Stepper
                    activeStep={step}
                    orientation="vertical"
                    style={{
                      height: deviceHeight - height - height5,
                      overflow: "auto",
                    }}
                  >
                    {mainDataResult8.data.map((item, index) => (
                      <Step key={index}>
                        <StepLabel StepIconComponent={customizedMarker}>
                          {customizedContent(item)}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </GridContainer>
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainerWrap>
                <GridContainer width="70%">
                  <GridTitleContainer>
                    <GridTitle>시험리스트</GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult7.data}
                    ref={(exporter) => {
                      _export7 = exporter;
                    }}
                    fileName="프로젝트관리"
                  >
                    <Grid
                      style={{ height: "78.9vh" }}
                      data={process(
                        mainDataResult7.data.map((row) => ({
                          ...row,
                          rowstatus:
                            row.rowstatus == null ||
                            row.rowstatus == "" ||
                            row.rowstatus == undefined
                              ? ""
                              : row.rowstatus,
                          status: statusListData3.find(
                            (items: any) => items.sub_code == row.status
                          )?.code_name,
                          [SELECTED_FIELD]: selectedState7[idGetter7(row)],
                        })),
                        mainDataState7
                      )}
                      {...mainDataState7}
                      onDataStateChange={onMainDataStateChange7}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY7}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange7}
                      //스크롤 조회 기능
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
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList7"]
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
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : percentField.includes(item.fieldName)
                                      ? CustomPercentCell
                                      : centerField2.includes(item.fieldName)
                                      ? CenterCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell7
                                      : numberField.includes(item.fieldName)
                                      ? gridSumQtyFooterCell7
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
                <GridContainer
                  width={`calc(30% - ${GAP}px)`}
                  style={{ marginBottom: "10px" }}
                >
                  <GridTitleContainer>
                    <GridTitle>진행상황</GridTitle>
                  </GridTitleContainer>
                  <Stepper activeStep={step} orientation="vertical">
                    {mainDataResult8.data.map((item, index) => (
                      <Step key={index}>
                        <StepLabel StepIconComponent={customizedMarker}>
                          {customizedContent(item)}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </GridContainer>
              </GridContainerWrap>
            </>
          )}
        </TabStripTab>
      </TabStrip>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={"N"}
          setData={setCustData2}
          modal={true}
        />
      )}
      {projectWindowVisible && (
        <ProjectsWindow
          setVisible={setProjectWindowVisible}
          setData={setProjectData}
          modal={true}
          pathname="SA_A1000_603W"
        />
      )}
      {designWindowVisible && (
        <SA_A1000_603W_Design_Window
          setVisible={setDesignWindowVisible}
          filters={filters}
          item={
            mainDataResult2.data.filter(
              (item) =>
                item[DATA_ITEM_KEY2] ==
                Object.getOwnPropertyNames(selectedState2)[0]
            )[0] != undefined
              ? mainDataResult2.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY2] ==
                    Object.getOwnPropertyNames(selectedState2)[0]
                )[0]
              : ""
          }
          save={
            mainDataResult2.data.filter(
              (item) =>
                item[DATA_ITEM_KEY2] ==
                Object.getOwnPropertyNames(selectedState2)[0]
            )[0] != undefined
              ? mainDataResult2.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY2] ==
                    Object.getOwnPropertyNames(selectedState2)[0]
                )[0].quosts == "1"
                ? true
                : false
              : false
          }
          modal={true}
        />
      )}
      {designWindowVisible2 && (
        <SA_A1000_603W_Design2_Window
          setVisible={setDesignWindowVisible2}
          filters={filters}
          item={
            mainDataResult2.data.filter(
              (item) =>
                item[DATA_ITEM_KEY2] ==
                Object.getOwnPropertyNames(selectedState2)[0]
            )[0] != undefined
              ? mainDataResult2.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY2] ==
                    Object.getOwnPropertyNames(selectedState2)[0]
                )[0]
              : ""
          }
          save={
            mainDataResult2.data.filter(
              (item) =>
                item[DATA_ITEM_KEY2] ==
                Object.getOwnPropertyNames(selectedState2)[0]
            )[0] != undefined
              ? mainDataResult2.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY2] ==
                    Object.getOwnPropertyNames(selectedState2)[0]
                )[0].quosts == "1"
                ? true
                : false
              : false
          }
          modal={true}
        />
      )}
      {designWindowVisible3 && (
        <SA_A1000_603W_Design3_Window
          setVisible={setDesignWindowVisible3}
          filters={filters}
          item={
            mainDataResult2.data.filter(
              (item) =>
                item[DATA_ITEM_KEY2] ==
                Object.getOwnPropertyNames(selectedState2)[0]
            )[0] != undefined
              ? mainDataResult2.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY2] ==
                    Object.getOwnPropertyNames(selectedState2)[0]
                )[0]
              : ""
          }
          save={
            mainDataResult2.data.filter(
              (item) =>
                item[DATA_ITEM_KEY2] ==
                Object.getOwnPropertyNames(selectedState2)[0]
            )[0] != undefined
              ? mainDataResult2.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY2] ==
                    Object.getOwnPropertyNames(selectedState2)[0]
                )[0].quosts == "1"
                ? true
                : false
              : false
          }
          modal={true}
        />
      )}
      {printWindowVisible && (
        <SA_A1000_603W_Window
          setVisible={setPrintWindowVisible}
          quonum={
            mainDataResult.data.filter(
              (item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
            )[0] != undefined
              ? mainDataResult.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedState)[0]
                )[0].quonum
              : ""
          }
          quorev={
            mainDataResult.data.filter(
              (item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
            )[0] != undefined
              ? mainDataResult.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedState)[0]
                )[0].quorev
              : 0
          }
          modal={true}
        />
      )}
      {designWindowVisible4 && (
        <SA_A1000_603W_Design4_Window
          setVisible={setDesignWindowVisible4}
          filters={filters}
          item={
            mainDataResult2.data.filter(
              (item) =>
                item[DATA_ITEM_KEY2] ==
                Object.getOwnPropertyNames(selectedState2)[0]
            )[0] != undefined
              ? mainDataResult2.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY2] ==
                    Object.getOwnPropertyNames(selectedState2)[0]
                )[0]
              : ""
          }
          save={
            mainDataResult2.data.filter(
              (item) =>
                item[DATA_ITEM_KEY2] ==
                Object.getOwnPropertyNames(selectedState2)[0]
            )[0] != undefined
              ? mainDataResult2.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY2] ==
                    Object.getOwnPropertyNames(selectedState2)[0]
                )[0].quosts == "1"
                ? true
                : false
              : false
          }
          modal={true}
        />
      )}
      {PrsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType="N"
          setData={setPrsnnumData}
          modal={true}
        />
      )}
      {revWindowVisible && (
        <RevWindow
          setVisible={setRevWindowVisible}
          setLoadings={() => {
            setFilters((prev) => ({
              ...prev,
              isSearch: true,
              pgNum: 1,
            }));
            setTabSelected(0);
          }}
          information={Information}
          modal={true}
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={Information.attdatnum}
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

export default SA_A1000_603W;
