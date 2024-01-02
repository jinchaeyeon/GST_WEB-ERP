import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
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
  MultiSelect,
  MultiSelectChangeEvent,
} from "@progress/kendo-react-dropdowns";
import {
  Checkbox,
  Input,
  InputChangeEvent,
  TextArea,
} from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import { Card } from "primereact/card";
import { Timeline } from "primereact/timeline";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
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
  findMessage,
  getGridItemChangedData,
  getItemQuery,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  isValidDate,
  setDefaultDate2,
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
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ProjectsWindow from "../components/Windows/CM_A7000W_Project_Window";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import SA_A1000_603W_Design2_Window from "../components/Windows/SA_A1000_603W_Design2_Window";
import SA_A1000_603W_Design3_Window from "../components/Windows/SA_A1000_603W_Design3_Window";
import SA_A1000_603W_Design4_Window from "../components/Windows/SA_A1000_603W_Design4_Window";
import SA_A1000_603W_Design_Window from "../components/Windows/SA_A1000_603W_Design_Window";
import { useApi } from "../hooks/api";
import { IAttachmentData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/SA_A1000_603W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import UserWindow from "../components/Windows/CommonWindows/PrsnnumWindow";

type TdataArr = {
  rowstatus_s: string[];
  quoseq_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  testnum_s: string[];
  glpyn_s: string[];
  startdt_s: string[];
  enddt_s: string[];
  remark_s: string[];
};

type TdataArr2 = {
  rowstatus_s: string[];
  quonum_s: string[];
  quorev_s: string[];
  progress_status_s: string[];
};

interface IUser {
  user_id: string;
  user_name: string;
}

const DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY2 = "num";
const DETAIL_DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY2 = "num";
const DETAIL_DATA_ITEM_KEY3 = "num";
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
const dateField = [
  "quodt",
  "materialindt",
  "startdt",
  "enddt",
  "recdt",
  "request_date",
  "completion_date",
];
const RadioField = ["glpyn"];
const numberField = ["quoseq"];
const comboField = ["packagetype"];
const itemField = ["itemcd"];
const colorField = ["status"];

let temp = 0;
let deletedMainRows: any[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_SA003_603, L_SA011_603", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "packagetype"
      ? "L_SA003_603"
      : field === "status"
      ? "L_SA011_603"
      : "";

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
      : props.dataItem.status == "5"
      ? {
          backgroundColor: "#7030a0",
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
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const idGetter3 = getter(SUB_DATA_ITEM_KEY2);
  const idGetter4 = getter(DETAIL_DATA_ITEM_KEY);
  const idGetter5 = getter(DETAIL_DATA_ITEM_KEY2);
  const idGetter6 = getter(DETAIL_DATA_ITEM_KEY3);
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  const [pc, setPc] = useState("");
  UseParaPc(setPc);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);
  let gridRef5: any = useRef(null);
  let gridRef6: any = useRef(null);
  const userId = UseGetValueFromSessionItem("user_id");
  const [step, setStep] = React.useState(0);
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
      const newData = subDataResult.data.map((item) =>
        item[SUB_DATA_ITEM_KEY] ==
        parseInt(Object.getOwnPropertyNames(selectedsubDataState)[0])
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

      setSubDataResult((prev) => {
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
          find_row_value: queryParams.get("go") as string,
          isSearch: true,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
        }));
      }
    }
  }, [customOptionData]);

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent(
    "L_SA011_603, L_CM500_603, L_CM501_603, L_dptcd_001, L_sysUserMaster_001, L_SA016, L_SA004, L_SA001_603, R_Requestgb",
    setBizComponentData
  );
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
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
  useEffect(() => {
    if (bizComponentData.length > 0) {
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

      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
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
      fetchQueryData(dptcdQueryStr, setdptcdListData);
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
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);
  const [page6, setPage6] = useState(initialPageState);

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

    setSubFilters((prev) => ({
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

    setSubFilters2((prev) => ({
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

    setDetailFilters((prev) => ({
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

    setDetailFilters2((prev) => ({
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

    setDetailFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage6({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [subDataState2, setSubDataState2] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState2, setDetailDataState2] = useState<State>({
    sort: [],
  });
  const [detailDataState3, setDetailDataState3] = useState<State>({
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

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );
  const [subDataResult2, setSubDataResult2] = useState<DataResult>(
    process([], subDataState2)
  );

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailDataState2)
  );
  const [detailDataResult3, setDetailDataResult3] = useState<DataResult>(
    process([], detailDataState3)
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

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedsubDataState2, setSelectedsubDataState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailselectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailselectedState2, setDetailSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailselectedState3, setDetailSelectedState3] = useState<{
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
    const data = subDataResult.data.filter(
      (item) =>
        item[SUB_DATA_ITEM_KEY] ==
        Object.getOwnPropertyNames(selectedsubDataState)[0]
    )[0];

    if (data != undefined) {
      if (data.type == "Basics") {
        setDesignWindowVisible(true);
      } else if (data.type == "Cheomdan") {
        setDesignWindowVisible2(true);
      } else if (data.type == "Vitro") {
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
  let _export: ExcelExport | null | undefined;
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
          const newData = subDataResult.data.map((item: any) =>
            item[SUB_DATA_ITEM_KEY] ==
            Object.getOwnPropertyNames(selectedsubDataState)[0]
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
          setSubDataResult((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [subDataResult]
  );

  const search = () => {
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setTabSelected(0);
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
      if (unsavedName.length > 0) {
        setDeletedName(unsavedName);
      }
      if (unsavedAttadatnums.length > 0) {
        setDeletedAttadatnums(unsavedAttadatnums);
      }
    }
    if (e.selected == 1) {
      const selectedRowData = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      setSubFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
        quonum: selectedRowData.quonum,
        quorev: selectedRowData.quorev,
      }));
    }
    if (e.selected == 2) {
      const selectedRowData = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      if (unsavedName.length > 0) {
        setDeletedName(unsavedName);
      }
      if (unsavedAttadatnums.length > 0) {
        setDeletedAttadatnums(unsavedAttadatnums);
      }
      setSubFilters2((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
        quonum: selectedRowData.quonum,
        quorev: selectedRowData.quorev,
      }));
      setDetailFilters((prev) => ({
        ...prev,
        pgNum: 1,
        quonum: selectedRowData.quonum,
        quorev: selectedRowData.quorev,
        isSearch: true,
      }));
      setDetailFilters2((prev) => ({
        ...prev,
        pgNum: 1,
        quonum: selectedRowData.quonum,
        quorev: selectedRowData.quorev,
        isSearch: true,
      }));
      setDetailFilters3((prev) => ({
        ...prev,
        pgNum: 1,
        quonum: selectedRowData.quonum,
        quorev: selectedRowData.quorev,
        isSearch: true,
      }));
    }
    setTabSelected(e.selected);
  };

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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

    if (
      name == "guid1" ||
      name == "guid2" ||
      name == "guid3" ||
      name == "guid4" ||
      name == "guid5" ||
      name == "glp1" ||
      name == "glp2" ||
      name == "glp3" ||
      name == "glp4" ||
      name == "glp5" ||
      name == "translate1"
    ) {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "K" : "N",
      }));
    } else if (name == "translate2") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "E" : "N",
      }));
    } else if (name == "translate3") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "J" : "N",
      }));
    } else if (name == "translate4") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "P" : "N",
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
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
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

  const getAttachmentsData = (data: IAttachmentData) => {
    if (!Information.attdatnum) {
      setUnsavedAttadatnums((prev) => [...prev, data.attdatnum]);
    }

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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: "01",
    location: "01",
    quonum: "",
    quorev: 0,
    quoseq: 0,
    custcd: "",
    custnm: "",
    testnum: "",
    finyn: "",
    status: [],
    person: "",
    personnm: "",
    cpmperson: "",
    cpmpersonnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [subfilters, setSubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL1",
    quonum: "",
    quorev: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [subfilters2, setSubFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL2",
    quonum: "",
    quorev: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailfilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    quonum: "",
    quorev: 0,
    pgNum: 1,
    isSearch: true,
  });
  const [detailfilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    quonum: "",
    quorev: 0,
    pgNum: 1,
    isSearch: true,
  });
  const [detailfilters3, setDetailFilters3] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    quonum: "",
    quorev: 0,
    pgNum: 1,
    isSearch: true,
  });
  const [Information, setInformation] = useState<{ [name: string]: any }>({
    attdatnum: "",
    chkperson: "",
    custcd: "",
    custnm: "",
    custprsnnm: "",
    dptcd: "",
    files: "",
    materialindt: new Date(),
    materialnm: "",
    materialtype: "",
    person: "",
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
    requestgb: "A",
    glp1: "",
    glp2: "",
    glp3: "",
    glp4: "",
    glp5: "",
    guid1: "",
    guid2: "",
    guid3: "",
    guid4: "",
    guid5: "",
    translate1: "",
    translate2: "",
    translate3: "",
    translate4: "",
    rev_reason: "",
    testenddt: null,
    teststdt: null,
    validt: null,
    workType: "N",
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
        ? "1|2|3|4|5"
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
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_testnum": filters.testnum,
        "@p_finyn": filters.finyn,
        "@p_quonum": filters.quonum,
        "@p_quorev": filters.quorev,
        "@p_quoseq": filters.quoseq,
        "@p_person": filters.person,
        "@p_personnm": filters.personnm,
        "@p_cpmperson": filters.cpmperson,
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
            (row: any) =>
              row.quonum + "-" + row.quorev == filters.find_row_value
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
            : rows.find(
                (row: any) =>
                  row.quonum + "-" + row.quorev == filters.find_row_value
              );
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
  const fetchSubGrid = async (subfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1000_603W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": subfilters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_testnum": filters.testnum,
        "@p_finyn": filters.finyn,
        "@p_quonum": subfilters.quonum,
        "@p_quorev": subfilters.quorev,
        "@p_quoseq": filters.quoseq,
        "@p_person": filters.person,
        "@p_personnm": filters.personnm,
        "@p_cpmperson": filters.cpmperson,
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
      if (subfilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.quonum + "-" + row.quorev == subfilters.find_row_value
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

      if (RowCnt > 0) {
        setWorktype("U");
        setInformation({
          attdatnum: row[0].attdatnum,
          chkperson: row[0].chkperson,
          custcd: row[0].custcd,
          custnm: row[0].custnm,
          custprsnnm: row[0].custprsnnm,
          dptcd: row[0].dptcd,
          files: row[0].files,
          materialindt: toDate(row[0].materialindt),
          materialnm: row[0].materialnm,
          materialtype: row[0].materialtype,
          person: row[0].person,
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
          requestgb: row[0].requestgb,
          rev_reason: row[0].rev_reason,
          testenddt: isValidDate(row[0].testenddt)
            ? new Date(dateformat(row[0].testenddt))
            : null,
          teststdt: isValidDate(row[0].teststdt)
            ? new Date(dateformat(row[0].teststdt))
            : null,
          validt: isValidDate(row[0].validt)
            ? new Date(dateformat(row[0].validt))
            : null,
          glp1: row[0].glp1,
          glp2: row[0].glp2,
          glp3: row[0].glp3,
          glp4: row[0].glp4,
          glp5: row[0].glp5,
          guid1: row[0].guid1,
          guid2: row[0].guid2,
          guid3: row[0].guid3,
          guid4: row[0].guid4,
          guid5: row[0].guid5,
          translate1: row[0].translate1,
          translate2: row[0].translate2,
          translate3: row[0].translate3,
          translate4: row[0].translate4,
          workType: "U",
        });
      } else {
        setWorktype("U");
        setInformation({
          attdatnum: "",
          chkperson: "",
          custcd: "",
          custnm: "",
          custprsnnm: "",
          dptcd: "",
          files: "",
          materialindt: new Date(),
          materialnm: "",
          materialtype: "",
          person: "",
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
          requestgb: "A",
          glp1: "",
          glp2: "",
          glp3: "",
          glp4: "",
          glp5: "",
          guid1: "",
          guid2: "",
          guid3: "",
          guid4: "",
          guid5: "",
          translate1: "",
          translate2: "",
          translate3: "",
          translate4: "",
          rev_reason: "",
          testenddt: "",
          teststdt: "",
          validt: "",
          workType: "N",
        });
      }
      setSubDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          subfilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.quonum + "-" + row.quorev == subfilters.find_row_value
              );
        if (selectedRow != undefined) {
          setSelectedsubDataState({ [selectedRow[SUB_DATA_ITEM_KEY]]: true });
        } else {
          setSelectedsubDataState({ [rows[0][SUB_DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters((prev) => ({
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
  const fetchSubGrid2 = async (subfilters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1000_603W_Q",
      pageNumber: subfilters2.pgNum,
      pageSize: subfilters2.pgSize,
      parameters: {
        "@p_work_type": subfilters2.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_testnum": filters.testnum,
        "@p_finyn": filters.finyn,
        "@p_quonum": subfilters2.quonum,
        "@p_quorev": subfilters2.quorev,
        "@p_quoseq": filters.quoseq,
        "@p_person": filters.person,
        "@p_personnm": filters.personnm,
        "@p_cpmperson": filters.cpmperson,
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
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;
      if (subfilters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.quonum + "-" + row.quorev == subfilters2.find_row_value
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

      setSubDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          subfilters2.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.quonum + "-" + row.quorev == subfilters2.find_row_value
              );
        if (selectedRow != undefined) {
          setSelectedsubDataState2({ [selectedRow[SUB_DATA_ITEM_KEY2]]: true });
        } else {
          setSelectedsubDataState2({ [rows[0][SUB_DATA_ITEM_KEY2]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters2((prev) => ({
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
  const fetchDetailGrid = async (detailFilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1000_603W_Q",
      pageNumber: detailFilters.pgNum,
      pageSize: detailFilters.pgSize,
      parameters: {
        "@p_work_type": "COUNSEL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_testnum": "",
        "@p_finyn": "",
        "@p_quonum": detailFilters.quonum,
        "@p_quorev": detailFilters.quorev,
        "@p_quoseq": 0,
        "@p_status": "",
        "@p_person": "",
        "@p_personnm":"",
        "@p_cpmperson": "",
        "@p_cpmpersonnm": "",
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

      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setDetailSelectedState({ [rows[0][DETAIL_DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setDetailFilters((prev) => ({
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
  const fetchDetailGrid2 = async (detailFilters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1000_603W_Q",
      pageNumber: detailFilters2.pgNum,
      pageSize: detailFilters2.pgSize,
      parameters: {
        "@p_work_type": "CONSULT",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_testnum": "",
        "@p_finyn": "",
        "@p_quonum": detailFilters2.quonum,
        "@p_quorev": detailFilters2.quorev,
        "@p_quoseq": 0,
        "@p_status": "",
        "@p_person": "",
        "@p_personnm":"",
        "@p_cpmperson": "",
        "@p_cpmpersonnm": "",
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

      setDetailDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setDetailSelectedState2({ [rows[0][DETAIL_DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setDetailFilters2((prev) => ({
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
  const fetchDetailGrid3 = async (detailFilters3: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1000_603W_Q",
      pageNumber: detailFilters3.pgNum,
      pageSize: detailFilters3.pgSize,
      parameters: {
        "@p_work_type": "QUOTATION",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_testnum": "",
        "@p_finyn": "",
        "@p_quonum": detailFilters3.quonum,
        "@p_quorev": detailFilters3.quorev,
        "@p_quoseq": 0,
        "@p_status": "",
        "@p_person": "",
        "@p_personnm":"",
        "@p_cpmperson": "",
        "@p_cpmpersonnm": "",
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

      setDetailDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setDetailSelectedState3({ [rows[0][DETAIL_DATA_ITEM_KEY3]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setDetailFilters3((prev) => ({
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
    if (subfilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);

      setSubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));

      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters]);

  useEffect(() => {
    if (subfilters2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters2);

      setSubFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));

      fetchSubGrid2(deepCopiedFilters);
    }
  }, [subfilters2]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailfilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters);
      setDetailFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailfilters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailfilters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters2);
      setDetailFilters2((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid2(deepCopiedFilters);
    }
  }, [detailfilters2]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailfilters3.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters3);
      setDetailFilters3((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid3(deepCopiedFilters);
    }
  }, [detailfilters3]);

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
  }, [subDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [subDataResult2]);

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  const onSubDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setSubDataState2(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  const onDetailDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setDetailDataState2(event.dataState);
  };

  const onDetailDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setDetailDataState3(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onSubDataSortChange2 = (e: any) => {
    setSubDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange3 = (e: any) => {
    setDetailDataState3((prev) => ({ ...prev, sort: e.sort }));
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

  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const subTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = subDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = detailDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = detailDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
  };

  const onSubDataSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState2,
      dataItemKey: SUB_DATA_ITEM_KEY2,
    });
    setSelectedsubDataState2(newSelectedState);
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);
  };

  const onDetailSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState2,
      dataItemKey: DETAIL_DATA_ITEM_KEY2,
    });
    setDetailSelectedState2(newSelectedState);
  };

  const onDetailSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState3,
      dataItemKey: DETAIL_DATA_ITEM_KEY3,
    });
    setDetailSelectedState3(newSelectedState);
  };

  const onRowDoubleClick = (props: any) => {
    const selectedRowData = props.dataItem;
    setSubFilters((prev) => ({
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

  const onSubItemChange = (event: GridItemChangeEvent) => {
    setSubDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult,
      setSubDataResult,
      SUB_DATA_ITEM_KEY
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
    if (field != "rowstatus" && field != "testnum" && field != "quoseq") {
      const newData = subDataResult.data.map((item) =>
        item[SUB_DATA_ITEM_KEY] == dataItem[SUB_DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );
      setEditIndex(dataItem[SUB_DATA_ITEM_KEY]);
      if (field) {
        setEditedField(field);
      }
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev) => {
        return {
          data: subDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field == "status") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setTempResult2((prev) => {
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
      setTempResult2((prev) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != subDataResult.data) {
      if (editedField !== "itemcd") {
        const newData = subDataResult.data.map((item) =>
          item[SUB_DATA_ITEM_KEY] ==
          Object.getOwnPropertyNames(selectedsubDataState)[0]
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
        setSubDataResult((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else {
        subDataResult.data.map((item: { [x: string]: any; itemcd: any }) => {
          if (editIndex == item[SUB_DATA_ITEM_KEY]) {
            fetchItemData(item.itemcd);
          }
        });
      }
    } else {
      const newData = subDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult.data) {
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

      setTempResult2((prev) => {
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
      setTempResult2((prev) => {
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

  const onAddClick = () => {
    subDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [SUB_DATA_ITEM_KEY]: ++temp,
      enddt: "",
      glpyn: "G",
      itemcd: "",
      itemnm: "",
      quonum: Information.quonum,
      quorev: Information.quorev,
      quoseq: 0,
      remark: "",
      startdt: "",
      testnum: "",
      rowstatus: "N",
    };
    setSelectedsubDataState({ [newDataItem[SUB_DATA_ITEM_KEY]]: true });
    setSubDataResult((prev) => {
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

    subDataResult.data.forEach((item: any, index: number) => {
      if (!selectedsubDataState[item[SUB_DATA_ITEM_KEY]]) {
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
      data = subDataResult.data[Math.min(...Object2)];
    } else {
      data = subDataResult.data[Math.min(...Object) - 1];
    }
    setSubDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));

    setSelectedsubDataState({
      [data != undefined ? data[SUB_DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onAddClick2 = () => {
    setWorktype("N");
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );
    setInformation({
      attdatnum: "",
      chkperson: "",
      custcd: "",
      custnm: "",
      custprsnnm: "",
      dptcd: "",
      files: "",
      materialindt: setDefaultDate2(customOptionData, "materialindt"),
      materialnm: "",
      materialtype: "",
      person: userId,
      quodt: setDefaultDate2(customOptionData, "quodt"),
      quonum: "",
      quorev: 0,
      quosts: "0",
      quotype: "1",
      rcvcustnm: "",
      rcvcustprsnnm: "",
      remark: "",
      remark2: "",
      remark3: "",
      requestgb: defaultOption.find((item: any) => item.id === "requestgb")
        .valueCode,
      glp1: "",
      glp2: "",
      glp3: "",
      glp4: "",
      glp5: "",
      guid1: "",
      guid2: "",
      guid3: "",
      guid4: "",
      guid5: "",
      translate1: "",
      translate2: "",
      translate3: "",
      translate4: "",
      rev_reason: "",
      testenddt: "",
      teststdt: "",
      validt: "",
      workType: "N",
    });
    setSubDataResult(process([], subDataState));
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
    dptcd: "",
    chkperson: "",
    custcd: "",
    custnm: "",
    remark2: "",
    rcvcustnm: "",
    rcvcustprsnnm: "",
    remark3: "",
    materialtype: "",
    materialinfo: "",
    materialindt: "",
    materialnm: "",
    guideline: "",
    translatereport: "",
    teststdt: "",
    testenddt: "",
    attdatnum: "",
    remark: "",
    custprsnnm: "",
    requestgb: "",
    glpgb: "",
    rev_reason: "",
    validt: "",
    rowstatus_s: "",
    quoseq_s: "",
    itemcd_s: "",
    itemnm_s: "",
    testnum_s: "",
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
      "@p_dptcd": ParaData.dptcd,
      "@p_chkperson": ParaData.chkperson,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_remark2": ParaData.remark2,
      "@p_rcvcustnm": ParaData.rcvcustnm,
      "@p_rcvcustprsnnm": ParaData.rcvcustprsnnm,
      "@p_remark3": ParaData.remark3,
      "@p_materialtype": ParaData.materialtype,
      "@p_materialinfo": ParaData.materialinfo,
      "@p_materialindt": ParaData.materialindt,
      "@p_materialnm": ParaData.materialnm,
      "@p_guideline": ParaData.guideline,
      "@p_translatereport": ParaData.translatereport,
      "@p_teststdt": ParaData.teststdt,
      "@p_testenddt": ParaData.testenddt,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_remark": ParaData.remark,
      "@p_custprsnnm": ParaData.custprsnnm,
      "@p_requestgb": ParaData.requestgb,
      "@p_glpgb": ParaData.glpgb,
      "@p_rev_reason": ParaData.rev_reason,
      "@p_validt": ParaData.validt,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_quoseq_s": ParaData.quoseq_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_testnum_s": ParaData.testnum_s,
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
    if (tabSelected == 0) {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length === 0 && deletedMainRows.length === 0) return false;

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
            rowstatus_s: [],
            quonum_s: [],
            quorev_s: [],
            progress_status_s: [],
          };

          dataItem.forEach((item: any, idx: number) => {
            const {
              rowstatus = "",
              quonum = "",
              quorev = "",
              status = "",
            } = item;

            dataArr.rowstatus_s.push(rowstatus);
            dataArr.quonum_s.push(quonum);
            dataArr.quorev_s.push(quorev);
            dataArr.progress_status_s.push(status);
          });

          setParaData((prev) => ({
            ...prev,
            workType: "STATE",
            orgdiv: "01",
            rowstatus_s: dataArr.rowstatus_s.join("|"),
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
    } else if (tabSelected == 1) {
      const dataItem = subDataResult.data.filter((item: any) => {
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
          convertDateToStr(Information.materialindt).substring(0, 4) < "1997" ||
          convertDateToStr(Information.materialindt).substring(6, 8) > "31" ||
          convertDateToStr(Information.materialindt).substring(6, 8) < "01" ||
          convertDateToStr(Information.materialindt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "SA_A1000_603W_001");
        } else {
          const guid =
            Information.guid1 +
            "|" +
            Information.guid2 +
            "|" +
            Information.guid3 +
            "|" +
            Information.guid4 +
            "|" +
            Information.guid5;

          const glp =
            Information.glp1 +
            "|" +
            Information.glp2 +
            "|" +
            Information.glp3 +
            "|" +
            Information.glp4 +
            "|" +
            Information.glp5;

          const translatereport =
            Information.translate1 +
            "|" +
            Information.translate2 +
            "|" +
            Information.translate3 +
            "|" +
            Information.translate4;

          if (dataItem.length === 0 && deletedMainRows.length === 0) {
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
              dptcd: Information.dptcd,
              chkperson: Information.chkperson,
              custcd: Information.custcd,
              custnm: Information.custnm,
              remark2: Information.remark2,
              rcvcustnm: Information.rcvcustnm,
              rcvcustprsnnm: Information.rcvcustprsnnm,
              remark3: Information.remark3,
              materialtype: Information.materialtype,
              materialinfo: "",
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
              attdatnum: Information.attdatnum,
              remark: Information.remark,
              custprsnnm: Information.custprsnnm,
              requestgb: Information.requestgb,
              glpgb: glp,
              rev_reason: Information.rev_reason,
              validt: isValidDate(Information.validt)
                ? convertDateToStr(Information.validt)
                : "",
              rowstatus_s: "",
              quoseq_s: "",
              itemcd_s: "",
              itemnm_s: "",
              testnum_s: "",
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
              testnum_s: [],
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
                testnum = "",
                glpyn = "",
                startdt = "",
                enddt = "",
                remark = "",
              } = item;

              dataArr.rowstatus_s.push(rowstatus);
              dataArr.quoseq_s.push(quoseq);
              dataArr.itemcd_s.push(itemcd);
              dataArr.itemnm_s.push(itemnm);
              dataArr.testnum_s.push(testnum);
              dataArr.glpyn_s.push(glpyn);
              dataArr.startdt_s.push(
                isValidDate(startdt) ? convertDateToStr(startdt) : startdt
              );
              dataArr.enddt_s.push(
                isValidDate(enddt) ? convertDateToStr(enddt) : enddt
              );
              dataArr.remark_s.push(remark);
            });
            deletedMainRows.forEach((item: any, idx: number) => {
              const {
                rowstatus = "",
                quoseq = "",
                itemcd = "",
                itemnm = "",
                testnum = "",
                glpyn = "",
                startdt = "",
                enddt = "",
                remark = "",
              } = item;

              dataArr.rowstatus_s.push("D");
              dataArr.quoseq_s.push(quoseq);
              dataArr.itemcd_s.push(itemcd);
              dataArr.itemnm_s.push(itemnm);
              dataArr.testnum_s.push(testnum);
              dataArr.glpyn_s.push(glpyn);
              dataArr.startdt_s.push(
                isValidDate(startdt) ? convertDateToStr(startdt) : startdt
              );
              dataArr.enddt_s.push(
                isValidDate(enddt) ? convertDateToStr(enddt) : enddt
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
              dptcd: Information.dptcd,
              chkperson: Information.chkperson,
              custcd: Information.custcd,
              custnm: Information.custnm,
              remark2: Information.remark2,
              rcvcustnm: Information.rcvcustnm,
              rcvcustprsnnm: Information.rcvcustprsnnm,
              remark3: Information.remark3,
              materialtype: Information.materialtype,
              materialinfo: "",
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
              attdatnum: Information.attdatnum,
              remark: Information.remark,
              custprsnnm: Information.custprsnnm,
              requestgb: Information.requestgb,
              glpgb: glp,
              rev_reason: Information.rev_reason,
              validt: isValidDate(Information.validt)
                ? convertDateToStr(Information.validt)
                : "",
              rowstatus_s: dataArr.rowstatus_s.join("|"),
              quoseq_s: dataArr.quoseq_s.join("|"),
              itemcd_s: dataArr.itemcd_s.join("|"),
              itemnm_s: dataArr.itemnm_s.join("|"),
              testnum_s: dataArr.testnum_s.join("|"),
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

    if (data.isSuccess === true) {
      setUnsavedAttadatnums([]);
      setUnsavedName([]);
      setTabSelected(0);
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      setSubFilters((prev) => ({
        ...prev,
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
        dptcd: "",
        chkperson: "",
        custcd: "",
        custnm: "",
        remark2: "",
        rcvcustnm: "",
        rcvcustprsnnm: "",
        remark3: "",
        materialtype: "",
        materialinfo: "",
        materialindt: "",
        materialnm: "",
        guideline: "",
        translatereport: "",
        teststdt: "",
        testenddt: "",
        attdatnum: "",
        remark: "",
        custprsnnm: "",
        requestgb: "",
        glpgb: "",
        rev_reason: "",
        validt: "",
        rowstatus_s: "",
        quoseq_s: "",
        itemcd_s: "",
        itemnm_s: "",
        testnum_s: "",
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
      deletedMainRows = [];
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
      "@p_dptcd": "",
      "@p_chkperson": "",
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_remark2": "",
      "@p_rcvcustnm": "",
      "@p_rcvcustprsnnm": "",
      "@p_remark3": "",
      "@p_materialtype": "",
      "@p_materialinfo": "",
      "@p_materialindt": "",
      "@p_materialnm": "",
      "@p_guideline": "",
      "@p_translatereport": "",
      "@p_teststdt": "",
      "@p_testenddt": "",
      "@p_attdatnum": "",
      "@p_remark": "",
      "@p_custprsnnm": "",
      "@p_requestgb": "",
      "@p_glpgb": "",
      "@p_rev_reason": "",
      "@p_validt": "",
      "@p_rowstatus_s": "",
      "@p_quoseq_s": "",
      "@p_itemcd_s": "",
      "@p_itemnm_s": "",
      "@p_testnum_s": "",
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
      const findRowIndex = mainDataResult.data.findIndex(
        (row: any) => row.num == Object.getOwnPropertyNames(selectedState)[0]
      );
      setDeletedAttadatnums([Information.attdatnum]);
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
      alert("[" + data.statusCode + "] " + data.resultMessage);
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
        `/SA_A1100_603W?go=` +
        selectedRowData.quokey.split("-")[0] +
        "-" +
        selectedRowData.quokey.split("-")[1]
    );
  };

  const customizedMarker = (item: any) => {
    return (
      <span
        className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1"
        style={{ backgroundColor: "#2289c340" }}
      >
        <i className="pi pi-cog"></i>
      </span>
    );
  };

  const customizedContent = (item: any) => {
    return (
      <Card
        title={`${item.title}`}
        style={{
          fontSize: "15px",
          fontFamily: "TheJamsil5Bold",
          fontWeight: "lighter",
          marginBottom: "10px",
          backgroundImage: `url(/proccd.jpg)`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          opacity: 0.9,
          height: "15vh",
        }}
      ></Card>
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

  const [userWindowVisible, setUserWindowVisible] = useState<boolean>(false);
  const [userWindowVisible2, setUserWindowVisible2] = useState<boolean>(false);

  const onUserWndClick = () => {
    setUserWindowVisible(true);
  };
  const onUserWndClick2 = () => {
    setUserWindowVisible2(true);
  };
  const setUserData = (data: IUser) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        cpmpersonnm: data.user_name,
        cpmperson: data.user_id,
      };
    });
  };

  const setUserData2 = (data: IUser) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        personnm: data.user_name,
        person: data.user_id,
      };
    });
  };

  return (
    <>
      <TitleContainer>
        <Title>프로젝트관리</Title>

        <ButtonContainer>
          <Button onClick={onAddClick2} themeColor={"primary"} icon="file-add">
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
                  <th>프로젝트번호</th>
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
                  <th>고객사</th>
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
                  <th>예약시험번호</th>
                  <td>
                    <Input
                      name="testnum"
                      type="text"
                      value={filters.testnum}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
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
                  <th>담당자</th>
                  <td>
                    <Input
                      name="personnm"
                      type="text"
                      value={filters.personnm}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type="button"
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onUserWndClick2}
                      />
                    </ButtonInInput>
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
                        onClick={onUserWndClick}
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
                <GridTitle>요약정보</GridTitle>
                <ButtonContainer>
                  <div
                    style={{
                      width: "80px",
                      borderRadius: "2px",
                      backgroundColor: "#ff0000",
                      color: "white",
                      padding: "5px 10px",
                      textAlign: "center",
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
                    컨설팅
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
                  <div
                    style={{
                      width: "80px",
                      borderRadius: "2px",
                      backgroundColor: "#7030a0",
                      color: "white",
                      padding: "5px 10px",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "15px",
                    }}
                  >
                    시험관리
                  </div>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "72vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    quotype: quotypeListData.find(
                      (items: any) => items.sub_code == row.quotype
                    )?.code_name,
                    quosts: quostsListData.find(
                      (items: any) => items.sub_code == row.quosts
                    )?.code_name,
                    person: userListData.find(
                      (items: any) => items.user_id == row.person
                    )?.user_name,
                    dptcd: dptcdListData.find(
                      (item: any) => item.dptcd === row.dptcd
                    )?.dptnm,
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
                cellRender={customCellRender2}
                rowRender={customRowRender2}
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
          title="시험정보"
          disabled={mainDataResult.total == 0 && worktype == "U" ? true : false}
        >
          <FormBoxWrap border={true}>
            <GridTitleContainer>
              <GridTitle>1. 기준정보</GridTitle>
            </GridTitleContainer>
            <FormBox>
              <tbody>
                <tr>
                  <th>프로젝트번호</th>
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
                  <th>담당자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="person"
                        value={Information.person}
                        type="new"
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        textField="user_name"
                        valueField="user_id"
                        className="required"
                      />
                    )}
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
                  <th>부서코드</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="dptcd"
                        value={Information.dptcd}
                        type="new"
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        textField="dptnm"
                        valueField="dptcd"
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>CS담당자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="chkperson"
                        value={Information.chkperson}
                        type="new"
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        textField="user_name"
                        valueField="user_id"
                      />
                    )}
                  </td>
                  <th>견적상태</th>
                  <td>
                    <Input
                      name="quosts"
                      type="text"
                      value={
                        quostsListData.find(
                          (items: any) => items.sub_code == Information.quosts
                        )?.code_name
                      }
                      className="readonly"
                    />
                  </td>
                  <th>의뢰자명</th>
                  <td>
                    <Input
                      name="custprsnnm"
                      type="text"
                      value={Information.custprsnnm}
                      onChange={InputChange}
                    />
                  </td>
                  <th>의뢰자소속/직위</th>
                  <td>
                    <Input
                      name="remark2"
                      type="text"
                      value={Information.remark2}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>업체코드/업체명</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={Information.custcd}
                      onChange={InputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick2}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>모니터회사명</th>
                  <td>
                    <Input
                      name="rcvcustnm"
                      type="text"
                      value={Information.rcvcustnm}
                      onChange={InputChange}
                    />
                  </td>
                  <th>모니터성명</th>
                  <td>
                    <Input
                      name="rcvcustprsnnm"
                      type="text"
                      value={Information.rcvcustprsnnm}
                      onChange={InputChange}
                    />
                  </td>
                  <th>모니터소속/직위</th>
                  <td>
                    <Input
                      name="remark3"
                      type="text"
                      value={Information.remark3}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>물질분류</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="materialtype"
                        value={Information.materialtype}
                        type="new"
                        customOptionData={customOptionData}
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
                  <th>물질입고예상일</th>
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
                  <th>첨부파일</th>
                  <td>
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
                  <th>견적형태</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="quotype"
                        value={Information.quotype}
                        type="new"
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        className="required"
                      />
                    )}
                  </td>
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
                  <th>시험시작일</th>
                  <td>
                    <DatePicker
                      name="teststdt"
                      value={Information.teststdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                    />
                  </td>
                  <th>시험종료일</th>
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
                  <th>리비전사유</th>
                  <td colSpan={7}>
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
              <GridTitle>2. 시험의뢰 항목 및 정보</GridTitle>
            </GridTitleContainer>
            <FormBox>
              <tbody>
                <tr>
                  <th style={{ width: "10%" }}>의뢰목적</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentRadioGroup
                        name="requestgb"
                        value={Information.requestgb}
                        bizComponentId="R_Requestgb"
                        bizComponentData={bizComponentData}
                        changeData={RadioChange}
                      />
                    )}
                  </td>
                  <th style={{ width: "10%" }}>GLP구분</th>
                  <td>
                    <Checkbox
                      title="식약처"
                      name="glp1"
                      label={"식약처"}
                      value={Information.glp1 == "K" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="국립환경과학"
                      name="glp2"
                      label={"국립환경과학"}
                      value={Information.glp2 == "K" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="OLED"
                      name="glp3"
                      label={"OLED"}
                      value={Information.glp3 == "K" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="농진청"
                      name="glp4"
                      label={"농진청"}
                      value={Information.glp4 == "K" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="기타()"
                      name="glp5"
                      label={"기타()"}
                      value={Information.glp5 == "K" ? true : false}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>가이드라인(기준)</th>
                  <td>
                    <Checkbox
                      title="식약처"
                      name="guid1"
                      label={"식약처"}
                      value={Information.guid1 == "K" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="국립환경과학"
                      name="guid2"
                      label={"국립환경과학"}
                      value={Information.guid2 == "K" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="OLED"
                      name="guid3"
                      label={"OLED"}
                      value={Information.guid3 == "K" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="농진청"
                      name="guid4"
                      label={"농진청"}
                      value={Information.guid4 == "K" ? true : false}
                      onChange={InputChange}
                    />
                    <Checkbox
                      title="기타()"
                      name="guid5"
                      label={"기타()"}
                      value={Information.guid5 == "K" ? true : false}
                      onChange={InputChange}
                    />
                  </td>
                  <th>번역보고서</th>
                  <td>
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
                  <GridTitle>3. 시험의뢰품목</GridTitle>
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
                    subDataResult.data.map((row) => ({
                      ...row,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      [SELECTED_FIELD]: selectedsubDataState[idGetter2(row)],
                    })),
                    subDataState
                  )}
                  {...subDataState}
                  onDataStateChange={onSubDataStateChange}
                  //선택 기능
                  dataItemKey={SUB_DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSubDataSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={subDataResult.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef2}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onSubDataSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onSubItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
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
                                : comboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? subTotalFooterCell
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
          title="상세정보"
          disabled={mainDataResult.total == 0 ? true : false}
        >
          <GridContainerWrap>
            <GridContainer width="25%">
              <GridTitleContainer>
                <GridTitle>상세정보</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "80vh" }}
                data={process(
                  subDataResult2.data.map((row) => ({
                    ...row,
                    rowstatus:
                      row.rowstatus == null ||
                      row.rowstatus == "" ||
                      row.rowstatus == undefined
                        ? ""
                        : row.rowstatus,
                    [SELECTED_FIELD]: selectedsubDataState2[idGetter2(row)],
                  })),
                  subDataState2
                )}
                {...subDataState2}
                onDataStateChange={onSubDataStateChange2}
                //선택 기능
                dataItemKey={SUB_DATA_ITEM_KEY2}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSubDataSelectionChange2}
                //스크롤 조회 기능
                fixedScroll={true}
                total={subDataResult2.total}
                skip={page3.skip}
                take={page3.take}
                pageable={true}
                onPageChange={pageChange3}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef3}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onSubDataSortChange2}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList3"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          id={item.id}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          footerCell={
                            item.sortOrder === 0
                              ? subTotalFooterCell2
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(25% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>진행상황</GridTitle>
              </GridTitleContainer>
              <Timeline
                value={[
                  {
                    title: "시험계획서",
                  },
                  {
                    title: "시험개시",
                  },
                  {
                    title: "투여개시",
                  },
                  {
                    title: "실험종료",
                  },
                  {
                    title: "보고서",
                  },
                ]}
                className="customized-timeline"
                marker={customizedMarker}
                content={customizedContent}
              />
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <FormBoxWrap border={true}>
                <GridContainer width={"100%"}>
                  <GridTitleContainer>
                    <GridTitle>상담</GridTitle>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: "20vh" }}
                    data={process(
                      detailDataResult.data.map((row) => ({
                        ...row,
                        person: userListData.find(
                          (items: any) => items.user_id == row.person
                        )?.user_name,
                        [SELECTED_FIELD]: detailselectedState[idGetter4(row)],
                      })),
                      detailDataState
                    )}
                    {...detailDataState}
                    onDataStateChange={onDetailDataStateChange}
                    //선택 기능
                    dataItemKey={DETAIL_DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onDetailSelectionChange}
                    onRowDoubleClick={onLinkChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={detailDataResult.total}
                    skip={page4.skip}
                    take={page4.take}
                    pageable={true}
                    onPageChange={pageChange4}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef4}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onDetailSortChange}
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
                                  ? detailTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </GridContainer>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <GridContainer width={"100%"}>
                  <GridTitleContainer>
                    <GridTitle>컨설팅</GridTitle>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: "20vh" }}
                    data={process(
                      detailDataResult2.data.map((row) => ({
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
                        [SELECTED_FIELD]: detailselectedState2[idGetter5(row)],
                      })),
                      detailDataState2
                    )}
                    {...detailDataState2}
                    onDataStateChange={onDetailDataStateChange2}
                    //선택 기능
                    dataItemKey={DETAIL_DATA_ITEM_KEY2}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onDetailSelectionChange2}
                    onRowDoubleClick={onLinkChange2}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={detailDataResult2.total}
                    skip={page5.skip}
                    take={page5.take}
                    pageable={true}
                    onPageChange={pageChange5}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef5}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onDetailSortChange2}
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
                                  ? detailTotalFooterCell2
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </GridContainer>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <GridContainer width={"100%"}>
                  <GridTitleContainer>
                    <GridTitle>견적</GridTitle>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: "20vh" }}
                    data={process(
                      detailDataResult3.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: detailselectedState3[idGetter6(row)],
                      })),
                      detailDataState3
                    )}
                    {...detailDataState3}
                    onDataStateChange={onDetailDataStateChange3}
                    //선택 기능
                    dataItemKey={DETAIL_DATA_ITEM_KEY3}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onDetailSelectionChange3}
                    onRowDoubleClick={onLinkChange3}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={detailDataResult3.total}
                    skip={page6.skip}
                    take={page6.take}
                    pageable={true}
                    onPageChange={pageChange6}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef6}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onDetailSortChange3}
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
                              footerCell={
                                item.sortOrder === 0
                                  ? detailTotalFooterCell3
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
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={Information.attdatnum}
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
            subDataResult.data.filter(
              (item) =>
                item[SUB_DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedsubDataState)[0]
            )[0] != undefined
              ? subDataResult.data.filter(
                  (item) =>
                    item[SUB_DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedsubDataState)[0]
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
            subDataResult.data.filter(
              (item) =>
                item[SUB_DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedsubDataState)[0]
            )[0] != undefined
              ? subDataResult.data.filter(
                  (item) =>
                    item[SUB_DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedsubDataState)[0]
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
            subDataResult.data.filter(
              (item) =>
                item[SUB_DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedsubDataState)[0]
            )[0] != undefined
              ? subDataResult.data.filter(
                  (item) =>
                    item[SUB_DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedsubDataState)[0]
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
            subDataResult.data.filter(
              (item) =>
                item[SUB_DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedsubDataState)[0]
            )[0] != undefined
              ? subDataResult.data.filter(
                  (item) =>
                    item[SUB_DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedsubDataState)[0]
                )[0]
              : ""
          }
          modal={true}
        />
      )}
      {userWindowVisible && (
        <UserWindow
          setVisible={setUserWindowVisible}
          workType={"N"}
          setData={setUserData}
          modal={true}
        />
      )}
      {userWindowVisible2 && (
        <UserWindow
          setVisible={setUserWindowVisible2}
          workType={"N"}
          setData={setUserData2}
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
