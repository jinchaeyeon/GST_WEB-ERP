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
  TextArea,
} from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInGridInput,
  ButtonInInput,
  FilterBox,
  FilterBoxWrap,
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
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import ComboBoxColorCell from "../components/Cells/ComboBoxColorCell";
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
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  dateformat,
  dateformat2,
  findMessage,
  getGridItemChangedData,
  getItemQuery,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  isValidDate,
  numberWithCommas3,
  setDefaultDate,
  toDate,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ProjectsWindow from "../components/Windows/CM_A7000W_Project_Window";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import SA_A1000_603W_Design2_Window from "../components/Windows/SA_A1000_603W_Design2_Window";
import SA_A1000_603W_Design3_Window from "../components/Windows/SA_A1000_603W_Design3_Window";
import SA_A1000_603W_Design4_Window from "../components/Windows/SA_A1000_603W_Design4_Window";
import SA_A1000_603W_Design_Window from "../components/Windows/SA_A1000_603W_Design_Window";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
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
  "concatdt",
  "agencydt",
];
const RadioField = ["glpyn"];
const numberField = ["quoseq", "wonamt"];
const itemField = ["itemcd"];
const colorField = ["status"];

let temp2 = 0;
let deletedMainRows2: any[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_SA011_603", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field === "status" ? "L_SA011_603" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  const style =
    props.dataItem.status == "1"
      ? { backgroundColor: "#ff0000", color: "white" }
      : props.dataItem.status == "2"
      ? {
          backgroundColor: "#ffc000",
          color: "white",
        }
      : props.dataItem.status == "3"
      ? {
          backgroundColor: "#70ad47",
          color: "white",
        }
      : props.dataItem.status == "4"
      ? {
          backgroundColor: "#0070c0",
          color: "white",
        }
      : {};

  if (bizComponentIdVal == "L_SA011_603") {
    return bizComponent ? (
      <ComboBoxColorCell
        bizComponent={bizComponent}
        styles={style}
        {...props}
      />
    ) : (
      <td />
    );
  } else {
    return bizComponent ? (
      <ComboBoxCell bizComponent={bizComponent} {...props} />
    ) : (
      <td />
    );
  }
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
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {itemWindowVisible2 && (
        <ItemsWindow
          setVisible={setItemWindowVisible2}
          workType={"ROW_ADD"}
          setData={setItemData2}
          modal={true}
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
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const SA_A1000_603W: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const idGetter6 = getter(DATA_ITEM_KEY6);
  const idGetter7 = getter(DATA_ITEM_KEY7);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;

  const [pc, setPc] = useState("");
  UseParaPc(setPc);

  let gridRef: any = useRef(null);
  let gridRef3: any = useRef(null);
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
              rowstatus: item.rowstatus === "N" ? "N" : "U",
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
            (item: any) => item.id === "materialtype"
          ).valueCode,
          quotype: defaultOption.find((item: any) => item.id === "quotype")
            .valueCode,
          targetdt: setDefaultDate(customOptionData, "targetdt"),
          find_row_value: queryParams.get("go") as string,
          isSearch: true,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          materialtype: defaultOption.find(
            (item: any) => item.id === "materialtype"
          ).valueCode,
          quotype: defaultOption.find((item: any) => item.id === "quotype")
            .valueCode,
          targetdt: setDefaultDate(customOptionData, "targetdt"),
        }));
      }
    }
  }, [customOptionData]);

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent(
    "L_SA018_603,L_SA017_603,L_SA016_603L_SA015_603, L_SA014_603, L_SA013_603, L_SA012_603, L_BA016_603, L_SA002, L_BA171, L_BA057, L_Requestgb, L_SA019_603, L_SA001_603, L_SA004, L_SA016, L_CM501_603, L_SA011_603, L_CM500_603, L_sysUserMaster_001",
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
  useEffect(() => {
    if (bizComponentData.length > 0) {
      const materialgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA012_603"
        )
      );
      const assaygbeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA013_603"
        )
      );
      const startschgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA014_603"
        )
      );
      const financegbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA015_603"
        )
      );
      const amtgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA016_603"
        )
      );
      const addordgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA017_603"
        )
      );
      const relationgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA018_603"
        )
      );
      const statusQueryStr3 = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_BA016_603"
        )
      );
      const ordstsQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_SA002")
      );
      const itemlvl1QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA171")
      );
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const statusQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_CM500_603"
        )
      );
      const statusQueryStr2 = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_SA011_603"
        )
      );
      const meditypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_CM501_603"
        )
      );

      const quotypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_SA016")
      );

      const quostsQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_SA004")
      );

      const materialtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA001_603"
        )
      );
      fetchQueryData(materialgbQueryStr, setMaterialgbListData);
      fetchQueryData(assaygbeQueryStr, setAssaygbeListData);
      fetchQueryData(startschgbQueryStr, setStartschgbListData);
      fetchQueryData(financegbQueryStr, setFinancegbListData);
      fetchQueryData(amtgbQueryStr, setAmtgbListData);
      fetchQueryData(addordgbQueryStr, setAddordgbListData);
      fetchQueryData(relationgbQueryStr, setRelationgbListData);
      fetchQueryData(statusQueryStr3, setStatusListData3);
      fetchQueryData(ordstsQueryStr, setOrdstsListData);
      fetchQueryData(itemlvl1QueryStr, setItemlvl1ListData);
      fetchQueryData(userQueryStr, setUserListData);
      fetchQueryData(quotypeQueryStr, setQuotypeListData);
      fetchQueryData(quostsQueryStr, setQuostsListData);
      fetchQueryData(materialtypeQueryStr, setMaterialtypeListData);
      fetchQueryData(meditypeQueryStr, setMeditypeListData);
      fetchQueryData(statusQueryStr, setStatusListData);
      fetchQueryData(statusQueryStr2, setStatusListData2);
    }
  }, [bizComponentData]);

  const fetchQueryData = useCallback(
    async (queryStr: string, setListData: any) => {
      let data: any;

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

      if (data.isSuccess === true) {
        const rows = data.tables[0].Rows;
        setListData(rows);
      }
    },
    []
  );

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
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

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
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
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
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
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedState2, setSelectedState2] = useState<{
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

  const onDesignWndClick = () => {
    const data = mainDataResult2.data.filter(
      (item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
    )[0];

    if (data != undefined) {
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
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onProejctWndClick = () => {
    setProjectWindowVisible(true);
  };

  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

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

      if (data.isSuccess === true) {
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
    setPage4(initialPageState);
    setPage5(initialPageState);
    setPage6(initialPageState);
    setPage7(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult4(process([], mainDataState4));
    setMainDataResult5(process([], mainDataState5));
    setMainDataResult6(process([], mainDataState6));
    setMainDataResult7(process([], mainDataState7));
    setMainDataResult8(process([], mainDataState8));
    deletedMainRows2 = [];
  };

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
      setWorktype("U");
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

    if (name == "cpmpersonnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        cpmperson: value == "" ? "" : prev.cpmperson,
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

    if (name == "glp1" || name == "guid1") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "A" : "",
      }));
    } else if (name == "glp2" || name == "guid2") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "B" : "",
      }));
    } else if (name == "glp3" || name == "guid3") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "C" : "",
      }));
    } else if (name == "glp4" || name == "guid4") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "D" : "",
      }));
    } else if (name == "guid5") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "K" : "",
        etcguid: value == false ? "" : prev.etcguid,
      }));
    } else if (name == "glp5") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "K" : "",
        etcglp: value == false ? "" : prev.etcglp,
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
    } else if (name == "translate4" || name == "report4") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "P" : "",
      }));
    } else if (name == "report5" || name == "translate5") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "B" : "",
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

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [custWindowVisible3, setCustWindowVisible3] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
  };
  const onCustWndClick3 = () => {
    setCustWindowVisible3(true);
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

  const setCustData3 = (data: ICustData) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        rcvcustnm: data.custnm,
      };
    });
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: "01",
    location: "01",
    custcd: "",
    custnm: "",
    finyn: "",
    quotype: "",
    materialtype: "",
    quonum: "",
    quorev: 0,
    quoseq: 0,
    status: [],
    targetdt: new Date(),
    cpmperson: "",
    cpmpersonnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
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
    files: "",
    glp1: "",
    glp2: "",
    glp3: "",
    glp4: "",
    glp5: "",
    etcglp: "",
    guid1: "",
    guid2: "",
    guid3: "",
    guid4: "",
    guid5: "",
    etcguid: "",
    materialindt: new Date(),
    materialnm: "",
    materialtype: "",
    numbering_id: "",
    ordsts: "",
    person: "",
    person1: "",
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
    report5: "",
    requestgb: "A",
    testenddt: null,
    teststdt: null,
    testtype: "",
    translate1: "",
    translate2: "",
    translate3: "",
    translate4: "",
    translate5: "",
    validt: null,
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
    orgdiv: "01",
    relationgb: "",
    startschgb: "",
    totgrade1: 0,
    totgrade2: 0,
    level1: "",
    level2: "",
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
        "@p_targetdt": convertDateToStr(filters.targetdt),
        "@p_cpmperson": filters.cpmpersonnm == "" ? "" : filters.cpmperson,
        "@p_cpmpersonnm": filters.cpmpersonnm,
        "@p_status": status,
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
      //status 임시
      // const rows = data.tables[0].Rows;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
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
        "@p_targetdt": convertDateToStr(filters.targetdt),
        "@p_cpmperson": filters.cpmpersonnm == "" ? "" : filters.cpmperson,
        "@p_cpmpersonnm": filters.cpmpersonnm,
        "@p_status": "",
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
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
          custprsnnm: row[0].custprsnnm,
          files: row[0].files,
          glp1: row[0].glp1,
          glp2: row[0].glp2,
          glp3: row[0].glp3,
          glp4: row[0].glp4,
          glp5: row[0].glp5,
          etcglp: row[0].etcglp,
          guid1: row[0].guid1,
          guid2: row[0].guid2,
          guid3: row[0].guid3,
          guid4: row[0].guid4,
          guid5: row[0].guid5,
          etcguid: row[0].etcguid,
          materialindt: toDate(row[0].materialindt),
          materialnm: row[0].materialnm,
          materialtype: row[0].materialtype,
          numbering_id: row[0].numbering_id,
          ordsts: row[0].ordsts,
          person: row[0].person,
          person1: row[0].person1,
          quodt: toDate(row[0].quodt),
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
          report5: row[0].report5,
          requestgb: row[0].requestgb,
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
          translate5: row[0].translate5,
          validt: isValidDate(row[0].validt)
            ? new Date(dateformat(row[0].validt))
            : null,
        });
      } else {
        setWorktype("U");
        setInformation({
          chkperson: "",
          custcd: "",
          custnm: "",
          custprsnnm: "",
          files: "",
          glp1: "",
          glp2: "",
          glp3: "",
          glp4: "",
          glp5: "",
          etcglp: "",
          guid1: "",
          guid2: "",
          guid3: "",
          guid4: "",
          guid5: "",
          etcguid: "",
          materialindt: new Date(),
          materialnm: "",
          materialtype: "",
          numbering_id: "",
          ordsts: "",
          person: "",
          person1: "",
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
          report5: "",
          requestgb: "A",
          testenddt: null,
          teststdt: null,
          testtype: "",
          translate1: "",
          translate2: "",
          translate3: "",
          translate4: "",
          translate5: "",
          validt: null,
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
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_finyn": "",
        "@p_quotype": "",
        "@p_materialtype": "",
        "@p_quonum": filters3.quonum,
        "@p_quorev": filters3.quorev,
        "@p_quoseq": 0,
        "@p_targetdt": "",
        "@p_cpmperson": "",
        "@p_cpmpersonnm": "",
        "@p_status": "",
        "@p_find_row_value": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
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
        });
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
          orgdiv: "01",
          relationgb: "",
          startschgb: "",
          totgrade1: 0,
          totgrade2: 0,
          level1: "",
          level2: "",
        });
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
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_finyn": "",
        "@p_quotype": "",
        "@p_materialtype": "",
        "@p_quonum": filters4.quonum,
        "@p_quorev": filters4.quorev,
        "@p_quoseq": 0,
        "@p_targetdt": "",
        "@p_cpmperson": "",
        "@p_cpmpersonnm": "",
        "@p_status": "",
        "@p_find_row_value": "",
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
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_finyn": "",
        "@p_quotype": "",
        "@p_materialtype": "",
        "@p_quonum": filters5.quonum,
        "@p_quorev": filters5.quorev,
        "@p_quoseq": 0,
        "@p_targetdt": "",
        "@p_cpmperson": "",
        "@p_cpmpersonnm": "",
        "@p_status": "",
        "@p_find_row_value": "",
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
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_finyn": "",
        "@p_quotype": "",
        "@p_materialtype": "",
        "@p_quonum": filters6.quonum,
        "@p_quorev": filters6.quorev,
        "@p_quoseq": 0,
        "@p_targetdt": "",
        "@p_cpmperson": "",
        "@p_cpmpersonnm": "",
        "@p_status": "",
        "@p_find_row_value": "",
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
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_finyn": "",
        "@p_quotype": "",
        "@p_materialtype": "",
        "@p_quonum": filters7.quonum,
        "@p_quorev": filters7.quorev,
        "@p_quoseq": 0,
        "@p_targetdt": "",
        "@p_cpmperson": "",
        "@p_cpmpersonnm": "",
        "@p_status": "",
        "@p_find_row_value": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

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
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_finyn": "",
        "@p_quotype": "",
        "@p_materialtype": "",
        "@p_quonum": filters8.quonum,
        "@p_quorev": filters8.quorev,
        "@p_quoseq": filters8.quoseq,
        "@p_targetdt": "",
        "@p_cpmperson": "",
        "@p_cpmpersonnm": "",
        "@p_status": "",
        "@p_find_row_value": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    let index = -1;

    if (data.isSuccess === true) {
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
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

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
        총{" "}
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
        총{" "}
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
        총{" "}
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
        총{" "}
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
        총{" "}
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
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const gridSumQtyFooterCell6 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult6.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
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

  const onItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
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

  const enterEdit = (dataItem: any, field: string) => {
    if (field == "status") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
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
    if (
      field != "rowstatus" &&
      field != "quosts" &&
      field != "quoseq" &&
      field != "ordsts" &&
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
      enddt: "",
      glpyn: "G",
      itemcd: "",
      itemlvl1: "",
      itemnm: "",
      ordsts: "",
      quonum: Information.quonum,
      quorev: Information.quorev,
      quoseq: 0,
      quotestnum: "",
      remark: "",
      startdt: "",
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

    setSelectedState2({
      [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };

  const onAddClick2 = () => {
    setWorktype("N");
    setInformation({
      chkperson: "",
      custcd: "",
      custnm: "",
      custprsnnm: "",
      files: "",
      glp1: "",
      glp2: "",
      glp3: "",
      glp4: "",
      glp5: "",
      etcglp: "",
      guid1: "",
      guid2: "",
      guid3: "",
      guid4: "",
      guid5: "",
      etcguid: "",
      materialindt: new Date(),
      materialnm: "",
      materialtype: "",
      numbering_id: "",
      ordsts: "",
      person: "",
      person1: "",
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
      report5: "",
      requestgb: "A",
      testenddt: null,
      teststdt: null,
      testtype: "",
      translate1: "",
      translate2: "",
      translate3: "",
      translate4: "",
      translate5: "",
      validt: null,
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
    quosts: "",
    quodt: "",
    person: "",
    chkperson: "",
    custcd: "",
    custnm: "",
    remark2: "",
    report: "",
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
    validt: "",
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
      "@p_quosts": ParaData.quosts,
      "@p_quodt": ParaData.quodt,
      "@p_person": ParaData.person,
      "@p_chkperson": ParaData.chkperson,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_remark2": ParaData.remark2,
      "@p_report": ParaData.report,
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
      "@p_validt": ParaData.validt,
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

  const onSaveClick = () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0) return false;

    try {
      let valid = true;
      dataItem.map((item) => {
        if (item.status == "") {
          valid = false;
        }
      });

      if (valid != true) {
        throw findMessage(messagesData, "SA_A1000_603W_002");
      } else {
        let dataArr: TdataArr2 = {
          quonum_s: [],
          quorev_s: [],
          progress_status_s: [],
        };

        dataItem.forEach((item: any, idx: number) => {
          const { quonum = "", quorev = "", status = "" } = item;

          dataArr.quonum_s.push(quonum);
          dataArr.quorev_s.push(quorev);
          dataArr.progress_status_s.push(status);
        });

        setParaData((prev) => ({
          ...prev,
          workType: "STATE",
          orgdiv: "01",
          quonum_s: dataArr.quonum_s.join("|"),
          quorev_s: dataArr.quorev_s.join("|"),
          progress_status_s: dataArr.progress_status_s.join("|"),
          userid: userId,
          pc: pc,
          form_id: "SA_A1000_603W",
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const onSaveClick2 = () => {
    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

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
          (Information.translate5 == "" ? "N" : Information.translate5);

        const report =
          (Information.report1 == "" ? "N" : Information.report1) +
          "|" +
          (Information.report2 == "" ? "N" : Information.report2) +
          "|" +
          (Information.report3 == "" ? "N" : Information.report3) +
          "|" +
          (Information.report4 == "" ? "N" : Information.report4) +
          "|" +
          (Information.report5 == "" ? "N" : Information.report5);

        if (dataItem.length === 0 && deletedMainRows2.length === 0) {
          setParaData({
            workType: worktype,
            orgdiv: "01",
            location: "01",
            quonum: Information.quonum,
            quorev: Information.quorev,
            quoseq: Information.quorev,
            quotype: Information.quotype,
            quosts: Information.quosts,
            quodt: convertDateToStr(Information.quodt),
            person: Information.person,
            chkperson: Information.chkperson,
            custcd: Information.custcd,
            custnm: Information.custnm,
            remark2: Information.remark2,
            report: report,
            rcvcustnm: Information.rcvcustnm,
            rcvcustprsnnm: Information.rcvcustprsnnm,
            remark3: Information.remark3,
            materialtype: Information.materialtype,
            materialindt: convertDateToStr(Information.materialindt),
            materialnm: Information.materialnm,
            guideline: guid,
            translatereport: translatereport,
            testenddt: isValidDate(Information.testenddt)
              ? convertDateToStr(Information.testenddt)
              : "",
            teststdt: isValidDate(Information.teststdt)
              ? convertDateToStr(Information.teststdt)
              : "",
            remark: Information.remark,
            custprsnnm: Information.custprsnnm,
            requestgb: Information.requestgb,
            glpgb: glp,
            validt: isValidDate(Information.validt)
              ? convertDateToStr(Information.validt)
              : "",
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
            dataArr.startdt_s.push(
              typeof startdt == "string" ? startdt : convertDateToStr(startdt)
            );
            dataArr.enddt_s.push(
              typeof enddt == "string" ? enddt : convertDateToStr(enddt)
            );
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
            dataArr.startdt_s.push(
              typeof startdt == "string" ? startdt : convertDateToStr(startdt)
            );
            dataArr.enddt_s.push(
              typeof enddt == "string" ? enddt : convertDateToStr(enddt)
            );
            dataArr.remark_s.push(remark);
          });
          setParaData({
            workType: worktype,
            orgdiv: "01",
            location: "01",
            quonum: Information.quonum,
            quorev: Information.quorev,
            quoseq: Information.quorev,
            quotype: Information.quotype,
            quosts: Information.quosts,
            quodt: convertDateToStr(Information.quodt),
            person: Information.person,
            chkperson: Information.chkperson,
            custcd: Information.custcd,
            custnm: Information.custnm,
            remark2: Information.remark2,
            report: report,
            rcvcustnm: Information.rcvcustnm,
            rcvcustprsnnm: Information.rcvcustprsnnm,
            remark3: Information.remark3,
            materialtype: Information.materialtype,
            materialindt: convertDateToStr(Information.materialindt),
            materialnm: Information.materialnm,
            guideline: guid,
            translatereport: translatereport,
            testenddt: isValidDate(Information.testenddt)
              ? convertDateToStr(Information.testenddt)
              : "",
            teststdt: isValidDate(Information.teststdt)
              ? convertDateToStr(Information.teststdt)
              : "",
            remark: Information.remark,
            custprsnnm: Information.custprsnnm,
            requestgb: Information.requestgb,
            glpgb: glp,
            validt: isValidDate(Information.validt)
              ? convertDateToStr(Information.validt)
              : "",
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
      if (worktype == "N") {
        setTabSelected(0);
      }
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
        quosts: "",
        quodt: "",
        person: "",
        chkperson: "",
        custcd: "",
        custnm: "",
        remark2: "",
        report: "",
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
        validt: "",
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
      "@p_orgdiv": "01",
      "@p_location": "01",
      "@p_quonum": paraDataDeleted.quonum,
      "@p_quorev": paraDataDeleted.quorev,
      "@p_quotype": "",
      "@p_quosts": "",
      "@p_quodt": "",
      "@p_person": "",
      "@p_chkperson": "",
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_remark2": "",
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
      "@p_validt": "",
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

    if (data.isSuccess === true) {
      const isLastDataDeleted =
        mainDataResult.data.length === 1 && filters.pgNum > 0;
      setTabSelected(0);
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
    if (paraDataDeleted.work_type === "D") fetchToDelete();
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
          backgroundImage: `url(/proccd.jpg)`,
          backgroundPosition: "center right",
          backgroundSize: "auto 250%",
          backgroundRepeat: "no-repeat",
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
        cpmpersonnm: data.user_name,
        cpmperson: data.user_id,
      };
    });
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
      >
        <TabStripTab title="요약정보">
          <FilterBoxWrap>
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
                  <th>계약여부</th>
                  <td></td>
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
                </tr>
                <tr>
                  <th>계약목표일</th>
                  <td>
                    <DatePicker
                      name="targetdt"
                      value={filters.targetdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      placeholder=""
                    />
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
                  <th>CS담당자</th>
                  <td>
                    <Input
                      name="cpmpersonnm"
                      type="text"
                      value={filters.cpmpersonnm}
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
                </tr>
              </tbody>
            </FilterBox>
          </FilterBoxWrap>
          <GridContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <GridTitleContainer>
                <GridTitle>
                  <ButtonContainer style={{ justifyContent: "flex-start" }}>
                    요약정보
                    <div
                      style={{
                        width: "80px",
                        borderRadius: "2px",
                        backgroundColor: "#ff0000",
                        color: "white",
                        padding: "5px 10px",
                        textAlign: "center",
                        marginLeft: "5px",
                        marginRight: "5px",
                        fontWeight: 700,
                        fontSize: "15px",
                      }}
                    >
                      문의
                    </div>
                    <div
                      style={{
                        width: "80px",
                        borderRadius: "2px",
                        backgroundColor: "#ffc000",
                        color: "white",
                        padding: "5px 10px",
                        textAlign: "center",
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
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="calendar"
                  >
                    표준일정조회
                  </Button>
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
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "68vh" }}
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
                onItemChange={onItemChange}
                cellRender={customCellRender}
                rowRender={customRowRender}
                editField={EDIT_FIELD}
              >
                <GridColumn field="rowstatus" title=" " width="50px" />
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"].map(
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
                              : colorField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
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
          <GridTitleContainer>
            <GridTitle></GridTitle>
            <ButtonContainer>
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
                    <div
                      className="filter-item-wrap"
                      style={{ width: "100%", display: "flex" }}
                    >
                      <Input
                        name="quonum"
                        type="text"
                        value={Information.quonum}
                        className="readonly"
                        style={{ width: "70%" }}
                      />
                      <Input
                        name="quorev"
                        type="number"
                        value={Information.quorev}
                        className="readonly"
                        style={{ width: "30%" }}
                      />
                    </div>
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
                  <th>작성자</th>
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
                    {bizComponentData !== null && (
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
                    {bizComponentData !== null && (
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
                    {bizComponentData !== null && (
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
                  <th>견적발행일</th>
                  <td></td>
                  <th>견적유효일</th>
                  <td>
                    <DatePicker
                      name="validt"
                      value={Information.validt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
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
                  <th>회사명</th>
                  <td>
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
                  <th>성명</th>
                  <Input
                    name="custprsnnm"
                    type="text"
                    value={Information.custprsnnm}
                    onChange={InputChange}
                  />
                  <th>부서/직위</th>
                  <td>
                    <Input
                      name="remark2"
                      type="text"
                      value={Information.remark2}
                      onChange={InputChange}
                    />
                  </td>
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
                  <th>회사명</th>
                  <td>
                    <Input
                      name="rcvcustnm"
                      type="text"
                      value={Information.rcvcustnm}
                      onChange={InputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type={"button"}
                        onClick={onCustWndClick3}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>성명</th>
                  <Input
                    name="rcvcustprsnnm"
                    type="text"
                    value={Information.rcvcustprsnnm}
                    onChange={InputChange}
                  />
                  <th>부서/직위</th>
                  <td>
                    <Input
                      name="remark3"
                      type="text"
                      value={Information.remark3}
                      onChange={InputChange}
                    />
                  </td>
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
                  <th>시험분야</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="testtype"
                        value={Information.testtype}
                        bizComponentId="L_SA019_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>물질분야</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="materialtype"
                        value={Information.materialtype}
                        bizComponentId="L_SA001_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>시험물질명</th>
                  <td>
                    <Input
                      name="materialnm"
                      type="text"
                      value={Information.materialnm}
                      onChange={InputChange}
                    />
                  </td>
                  <th>의뢰목적</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="requestgb"
                        value={Information.requestgb}
                        bizComponentId="L_Requestgb"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>허가기관</th>
                  <td></td>
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
                </tr>
                <tr>
                  <th>가이드라인</th>
                  <td colSpan={5}>
                    <Checkbox
                      title="식약처"
                      name="guid1"
                      label={"식약처"}
                      value={Information.guid1 == "A" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="국립환경과학원"
                      name="guid2"
                      label={"국립환경과학원"}
                      value={Information.guid2 == "B" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="OECD"
                      name="guid3"
                      label={"OECD"}
                      value={Information.guid3 == "C" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="농진청"
                      name="guid4"
                      label={"농진청"}
                      value={Information.guid4 == "D" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="기타"
                      name="guid5"
                      label={"기타"}
                      value={Information.guid5 == "K" ? true : false}
                      onChange={InputChange}
                    />
                  </td>
                  <th>기타 입력</th>
                  <td>
                    {Information.guid5 == "K" ? (
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
                  <th>GLP</th>
                  <td colSpan={5}>
                    <Checkbox
                      title="식약처"
                      name="glp1"
                      label={"식약처"}
                      value={Information.glp1 == "A" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="국립환경과학원"
                      name="glp2"
                      label={"국립환경과학원"}
                      value={Information.glp2 == "B" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="OECD"
                      name="glp3"
                      label={"OECD"}
                      value={Information.glp3 == "C" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="농진청"
                      name="glp4"
                      label={"농진청"}
                      value={Information.glp4 == "D" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="기타"
                      name="glp5"
                      label={"기타"}
                      value={Information.glp5 == "K" ? true : false}
                      onChange={InputChange}
                    />
                  </td>
                  <th>기타 입력</th>
                  <td>
                    {Information.glp5 == "K" ? (
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
                  <th>원문보고서</th>
                  <td colSpan={5}>
                    <Checkbox
                      title="국문"
                      name="translate1"
                      label={"국문"}
                      value={Information.translate1 == "K" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="영문"
                      name="translate2"
                      label={"영문"}
                      value={Information.translate2 == "E" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="일문"
                      name="translate3"
                      label={"일문"}
                      value={Information.translate3 == "J" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="PDF"
                      name="translate4"
                      label={"PDF"}
                      value={Information.translate4 == "P" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="제본"
                      name="translate5"
                      label={"제본"}
                      value={Information.translate5 == "B" ? true : false}
                      onChange={InputChange}
                    />
                  </td>
                  <th></th>
                  <td></td>
                </tr>
                <tr>
                  <th>기본보고서</th>
                  <td colSpan={5}>
                    <Checkbox
                      title="국문"
                      name="report1"
                      label={"국문"}
                      value={Information.report1 == "K" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="영문"
                      name="report2"
                      label={"영문"}
                      value={Information.report2 == "E" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="한문"
                      name="report3"
                      label={"한문"}
                      value={Information.report3 == "J" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="PDF"
                      name="report4"
                      label={"PDF"}
                      value={Information.report4 == "P" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="제본"
                      name="report5"
                      label={"제본"}
                      value={Information.report5 == "B" ? true : false}
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
                <Grid
                  style={{ height: `calc(80vh - 500px)` }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      startdt:
                        row.startdt == "" ? new Date() : toDate(row.startdt),
                      enddt: row.enddt == "" ? new Date() : toDate(row.enddt),
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
                    customOptionData.menuCustomColumnOptions["grdList2"].map(
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
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell2
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
            </FormContext.Provider>
          </FormBoxWrap>
        </TabStripTab>
        <TabStripTab
          title="계약가능성 관리"
          disabled={mainDataResult.total == 0 ? true : false}
        >
          <GridContainerWrap>
            <GridContainer width="60%">
              <GridTitleContainer>
                <GridTitle>계약가능성 관리</GridTitle>
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
                                    items.sub_code == Information2.materialgb
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
                                    items.sub_code == Information2.startschgb
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
                                    items.sub_code == Information2.relationgb
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
            <GridContainer width={`calc(40% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>상담</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <GridContainer width={"100%"}>
                  <Grid
                    style={{ height: "20vh" }}
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
                      customOptionData.menuCustomColumnOptions["grdList4"].map(
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
                                item.sortOrder === 0
                                  ? mainTotalFooterCell4
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </GridContainer>
              </FormBoxWrap>
              <GridTitleContainer>
                <GridTitle>컨설팅</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <GridContainer width={"100%"}>
                  <Grid
                    style={{ height: "20vh" }}
                    data={process(
                      mainDataResult5.data.map((row) => ({
                        ...row,
                        user_id: userListData.find(
                          (items: any) => items.user_id == row.user_id
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
                      customOptionData.menuCustomColumnOptions["grdList5"].map(
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
                                item.sortOrder === 0
                                  ? mainTotalFooterCell5
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </GridContainer>
              </FormBoxWrap>
              <GridTitleContainer>
                <GridTitle>견적</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <GridContainer width={"100%"}>
                  <Grid
                    style={{ height: "20vh" }}
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
                      customOptionData.menuCustomColumnOptions["grdList6"].map(
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
                                item.sortOrder === 0
                                  ? mainTotalFooterCell6
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell6
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </GridContainer>
              </FormBoxWrap>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab
          title="시험진행관리"
          disabled={mainDataResult.total == 0 ? true : false}
        >
          <GridContainerWrap>
            <GridContainer width="70%">
              <GridTitleContainer>
                <GridTitle>시험리스트</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "80vh" }}
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
                  customOptionData.menuCustomColumnOptions["grdList7"].map(
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
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell7
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
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
      {custWindowVisible3 && (
        <CustomersWindow
          setVisible={setCustWindowVisible3}
          workType={"N"}
          setData={setCustData3}
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
