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
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
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
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInGridInput,
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
import MonthCalendar from "../components/Calendars/MonthCalendar";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
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
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import FileViewers from "../components/Viewer/FileViewers";
import LaborerWindow from "../components/Windows/CommonWindows/LaborerWindow";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/HU_A6020W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

interface IPrsnnum {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY3 = "num";
let temp = 0;
let deletedMainRows: object[] = [];
let targetRowIndex: null | number = null;

const CommandField = ["prsnnum"];
const numberField = [
  "shh",
  "smm",
  "ehh",
  "emm",
  "wrkday",
  "wrktime",
  "dutytime1",
  "worklate",
  "workend",
  "workout",
  "monpay",
  "overtimepay",
  "notaxpay1",
  "taxstd",
  "inctax",
  "locatax",
  "hirinsu",
  "pnsamt",
  "medamt",
  "agamt",
];
const dateField = ["dutydt", "startdate", "enddate"];
const comboField = ["daydutydiv"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 사용자
  UseBizComponent("L_HU033", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field === "daydutydiv" ? "L_HU033" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td></td>
  );
};

export const FormContext = createContext<{
  PrsnInfo: TPrsnInfo;
  setPrsnInfo: (d: React.SetStateAction<TPrsnInfo>) => void;
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
  const { setPrsnInfo } = useContext(FormContext);
  let isInEdit = field === dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const [laborerWindowVisible, setlaborerWindowVisible] =
    useState<boolean>(false);

  const onlaborerWndClick = () => {
    if (dataItem["rowstatus"] == "N") {
      setlaborerWindowVisible(true);
    } else {
      alert("사번은 수정이 불가합니다.");
    }
  };

  const setlaborerData = (data: TPrsnInfo) => {
    const {
      abilcd,
      abilnm,
      anlslry,
      dayhirinsurat,
      dayinctax,
      daylocatax,
      daytaxstd,
      dptcd,
      dptnm,
      hirinsuyn,
      medamt,
      meddiv,
      medrat2,
      overtimepay,
      paycd,
      payprovyn,
      pnsamt,
      pnsdiv,
      postcd,
      postnm,
      prsnnm,
      prsnnum,
      regorgdt,
      regorgdtFormat,
      rtrdt,
      rtrdtFormat,
      rtryn,
    } = data;
    setPrsnInfo({
      abilcd,
      abilnm,
      anlslry,
      dayhirinsurat,
      dayinctax,
      daylocatax,
      daytaxstd,
      dptcd,
      dptnm,
      hirinsuyn,
      medamt,
      meddiv,
      medrat2,
      overtimepay,
      paycd,
      payprovyn,
      pnsamt,
      pnsdiv,
      postcd,
      postnm,
      prsnnm,
      prsnnum,
      regorgdt,
      regorgdtFormat,
      rtrdt,
      rtrdtFormat,
      rtryn,
    });
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
          onClick={onlaborerWndClick}
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
      {laborerWindowVisible && (
        <LaborerWindow
          setVisible={setlaborerWindowVisible}
          setData={setlaborerData}
          modal={true}
        />
      )}
    </>
  );
};

type TPrsnInfo = {
  abilcd: string;
  abilnm: string;
  anlslry: number;
  dayhirinsurat: number;
  dayinctax: number;
  daylocatax: number;
  daytaxstd: number;
  dptcd: string;
  dptnm: string;
  hirinsuyn: string;
  medamt: number;
  meddiv: string;
  medrat2: number;
  overtimepay: number;
  paycd: string;
  payprovyn: string;
  pnsamt: number;
  pnsdiv: string;
  postcd: string;
  postnm: string;
  prsnnm: string;
  prsnnum: string;
  regorgdt: string;
  regorgdtFormat: string;
  rtrdt: string;
  rtrdtFormat: string;
  rtryn: string;
};

const defaultPrsnInfo = {
  abilcd: "",
  abilnm: "",
  anlslry: 0,
  dayhirinsurat: 0,
  dayinctax: 0,
  daylocatax: 0,
  daytaxstd: 0,
  dptcd: "",
  dptnm: "",
  hirinsuyn: "",
  medamt: 0,
  meddiv: "",
  medrat2: 0,
  overtimepay: 0,
  paycd: "",
  payprovyn: "",
  pnsamt: 0,
  pnsdiv: "",
  postcd: "",
  postnm: "",
  prsnnm: "",
  prsnnum: "",
  regorgdt: "",
  regorgdtFormat: "",
  rtrdt: "",
  rtrdtFormat: "",
  rtryn: "재직",
};

const HU_A6020W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [tabSelected, setTabSelected] = useState(0);
  const handleSelectTab = (e: any) => {
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
    } else if (e.selected == 1) {
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
      }));
    } else if (e.selected == 2) {
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }
    //바뀔때 마다 filter셋팅
    setTabSelected(e.selected);
  };
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_A6020W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_A6020W", setCustomOptionData);

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
      }));
      setFilters2((prev) => ({
        ...prev,
        gubun: defaultOption.find((item: any) => item.id === "gubun").valueCode,
        paydt: setDefaultDate(customOptionData, "paydt"),
        yyyymm: setDefaultDate(customOptionData, "yyyymm"),
      }));
      setFilters3((prev) => ({
        ...prev,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        frdt: setDefaultDate(customOptionData, "frdt"),
      }));
    }
  }, [customOptionData]);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001,L_HU005",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU005")
      );

      fetchQuery(postcdQueryStr, setpostcdListData);
      fetchQuery(dptcdQueryStr, setdptcdListData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr: string, setListData: any) => {
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
  }, []);

  const [PrsnInfo, setPrsnInfo] = useState<TPrsnInfo>(defaultPrsnInfo);

  //FormContext로 받아온 데이터 set
  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            prsnnm: PrsnInfo.prsnnm,
            prsnnum: PrsnInfo.prsnnum,
            dptcd: PrsnInfo.dptcd,
            postcd: PrsnInfo.postcd,
            anlslry: PrsnInfo.anlslry,
            paycd: PrsnInfo.paycd,
            monpay:
              PrsnInfo.paycd == "2"
                ? PrsnInfo.anlslry * 8
                : PrsnInfo.paycd == "3"
                ? PrsnInfo.anlslry
                : 0,
            daytaxstd: PrsnInfo.daytaxstd,
            dayinctax: PrsnInfo.dayinctax,
            dayhirinsurat: PrsnInfo.dayhirinsurat,
            daylocatax: PrsnInfo.daylocatax,
            taxstd:
              (PrsnInfo.paycd == "2"
                ? PrsnInfo.anlslry * 8
                : PrsnInfo.paycd == "3"
                ? PrsnInfo.anlslry
                : 0) - PrsnInfo.daytaxstd,
            inctax:
              ((PrsnInfo.paycd == "2"
                ? PrsnInfo.anlslry * 8
                : PrsnInfo.paycd == "3"
                ? PrsnInfo.anlslry
                : 0) -
                PrsnInfo.daytaxstd) *
              (PrsnInfo.dayinctax / 100),
            locatax:
              (((PrsnInfo.paycd == "2"
                ? PrsnInfo.anlslry * 8
                : PrsnInfo.paycd == "3"
                ? PrsnInfo.anlslry
                : 0) -
                PrsnInfo.daytaxstd) *
                (PrsnInfo.dayinctax / 100)) /
              100,
            overtimepay_1: PrsnInfo.overtimepay,
            payprovyn: PrsnInfo.payprovyn,
            hirinsuyn: PrsnInfo.hirinsuyn,
            hirinsu:
              PrsnInfo.hirinsuyn == "Y"
                ? (PrsnInfo.paycd == "2"
                    ? PrsnInfo.anlslry * 8
                    : PrsnInfo.paycd == "3"
                    ? PrsnInfo.anlslry
                    : 0) *
                  (PrsnInfo.dayhirinsurat / 100)
                : 0,
            pnsamt: PrsnInfo.pnsdiv == "Y" ? PrsnInfo.pnsamt : 0,
            medamt: PrsnInfo.meddiv == "Y" ? PrsnInfo.medamt : 0,
            agamt: PrsnInfo.meddiv == "Y" ? PrsnInfo.medrat2 : 0,
            dutydt: convertDateToStr(new Date()),
            startdate: convertDateToStr(new Date()),
            enddate: convertDateToStr(new Date()),
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
  }, [PrsnInfo]);

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "일용직일근태";
      _export.save(optionsGridOne);
    }
  };

  const search = () => {
    if (tabSelected == 0) {
      try {
        if (
          convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
          convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
          convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
          convertDateToStr(filters.frdt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "HU_A6020W_001");
        } else if (
          convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
          convertDateToStr(filters.todt).substring(6, 8) > "31" ||
          convertDateToStr(filters.todt).substring(6, 8) < "01" ||
          convertDateToStr(filters.todt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "HU_A6020W_001");
        } else {
          setFilters((prev) => ({
            ...prev,
            isSearch: true,
          }));
        }
      } catch (e) {
        alert(e);
      }
    } else if (tabSelected == 1) {
      try {
        if (convertDateToStr(filters2.yyyymm).substring(0, 4) < "1997") {
          throw findMessage(messagesData, "HU_A6020W_001");
        } else if (
          convertDateToStr(filters2.paydt).substring(0, 4) < "1997" ||
          convertDateToStr(filters2.paydt).substring(6, 8) > "31" ||
          convertDateToStr(filters2.paydt).substring(6, 8) < "01" ||
          convertDateToStr(filters2.paydt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "HU_A6020W_001");
        } else if (
          filters2.gubun == null ||
          filters2.gubun == "" ||
          filters2.gubun == undefined
        ) {
          throw findMessage(messagesData, "HU_A6020W_001");
        } else {
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
          }));
        }
      } catch (e) {
        alert(e);
      }
    } else if (tabSelected == 2) {
      try {
        if (convertDateToStr(filters3.frdt).substring(0, 4) < "1997") {
          throw findMessage(messagesData, "HU_A6020W_001");
        } else {
          setFilters3((prev) => ({
            ...prev,
            isSearch: true,
          }));
        }
      } catch (e) {
        alert(e);
      }
    }
  };

  const [url, setUrl] = useState<string>("");
  const [url2, setUrl2] = useState<string>("");
  const [laborerWindowVisible, setlaborerWindowVisible] =
    useState<boolean>(false);
  const [laborerWindowVisible2, setlaborerWindowVisible2] =
    useState<boolean>(false);

  const onlaborerWndClick = () => {
    setlaborerWindowVisible(true);
  };
  const onlaborerWndClick2 = () => {
    setlaborerWindowVisible2(true);
  };
  const setlaborerData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };
  const setlaborerData2 = (data: IPrsnnum) => {
    setFilters3((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "01",
    frdt: new Date(),
    todt: new Date(),
    prsnnum: "",
    prsnnm: "",
    inyrmm: new Date(),
    payyrmm: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    reyrmm: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    yyyymm: new Date(),
    paydt: new Date(),
    gubun: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    frdt: new Date(),
    location: "01",
    prsnnum: "",
    prsnnm: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters3_1, setFilters3_1] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    prsnnum: "",
    pgNum: 1,
    isSearch: false,
  });
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const filterInputChange2 = (e: any) => {
    const { value, name } = e.target;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const filterInputChange3 = (e: any) => {
    const { value, name } = e.target;

    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const filterComboBoxChange2 = (e: any) => {
    const { name, value } = e;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const filterComboBoxChange3 = (e: any) => {
    const { name, value } = e;

    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});

  let gridRef: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A6020W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_prsnnm": filters.prsnnm,
        "@p_prsnnum": filters.prsnnum,
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
      }));

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.prsnnum == filters.find_row_value
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

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        // find_row_value 행 선택, find_row_value 없는 경우 첫번째 행 선택
        const selectedRow =
          filters.find_row_value === ""
            ? rows[0]
            : rows.find((row: any) => row.prsnnum == filters.find_row_value);

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

  const fetchMainGrid2 = async (filters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    let data2: any;

    setLoading(true);
    const parameters = {
      para: "list?emmId=HU_A6020_1",
    };
    const parameters2 = {
      para: "list?emmId=HU_A6020_2",
    };
    try {
      data = await processApi<any>(
        "excel-view-mail",
        filters2.gubun == "1"
          ? parameters
          : filters2.gubun == "2"
          ? parameters2
          : ""
      );
    } catch (error) {
      data = null;
    }

    if (data == null) {
      setUrl("");
    } else {
      if (data.RowCount > 0) {
        const rows = data.Rows;

        const parameters2 = {
          para: "document-json?id=" + rows[0].document_id,
          "@p_orgdiv": filters2.orgdiv,
          "@p_yyyymm": convertDateToStr(filters2.yyyymm).substring(0, 6),
          "@p_paydt": convertDateToStr(filters2.paydt),
        };
        try {
          data2 = await processApi<any>("excel-view", parameters2);
        } catch (error) {
          data2 = null;
        }
        if (data2 !== null) {
          const byteCharacters = atob(data2.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: "application/pdf",
          });
          setUrl(URL.createObjectURL(blob));
        } else {
          setUrl("");
        }
      } else {
        console.log("[에러발생]");
        console.log(data);
      }
    }

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
      procedureName: "P_HU_A6020W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": "USER",
        "@p_orgdiv": filters3.orgdiv,
        "@p_location": filters3.location,
        "@p_frdt": convertDateToStr(filters3.frdt).substring(0, 6),
        "@p_todt": "",
        "@p_prsnnm": filters3.prsnnm,
        "@p_prsnnum": filters3.prsnnum,
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
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      setMainDataResult3({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
        setFilters3_1((prev) => ({
          ...prev,
          prsnnum: rows[0].prsnnum,
          isSearch: true,
        }));
      } else {
        setUrl2("");
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

  const fetchMainGrid3_1 = async (filters3_1: any) => {
    //if (!permissions?.view) return;
    let data: any;
    let data2: any;

    setLoading(true);
    const parameters = {
      para: "list?emmId=HU_A6020_3",
    };

    try {
      data = await processApi<any>("excel-view-mail", parameters);
    } catch (error) {
      data = null;
    }

    if (data == null) {
      setUrl2("");
    } else {
      if (data.RowCount > 0) {
        const rows = data.Rows;

        const parameters2 = {
          para: "document-json?id=" + rows[0].document_id,
          "@p_orgdiv": filters3_1.orgdiv,
          "@p_prsnnum": filters3_1.prsnnum,
          "@p_dutydt": convertDateToStr(filters3.frdt).substring(0, 6),
        };
        try {
          data2 = await processApi<any>("excel-view", parameters2);
        } catch (error) {
          data2 = null;
        }
        if (data2 !== null) {
          const byteCharacters = atob(data2.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: "application/pdf",
          });
          setUrl2(URL.createObjectURL(blob));
        } else {
          setUrl2("");
        }
      } else {
        console.log("[에러발생]");
        console.log(data);
      }
    }

    setFilters3_1((prev) => ({
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
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters3.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({
        ...prev,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3]);

  useEffect(() => {
    if (filters3_1.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3_1);
      setFilters3_1((prev) => ({
        ...prev,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3_1(deepCopiedFilters);
    }
  }, [filters3_1]);
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };
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

  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState3(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters3_1((prev) => ({
      ...prev,
      prsnnum: selectedRowData.prsnnum,
      isSearch: true,
    }));
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));
    setPage({
      ...event.page,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));
    setPage3({
      ...event.page,
    });
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

  const enterEdit = (dataItem: any, field: string) => {
    let valid = true;

    if (dataItem.rowstatus != "N" && field == "dutydt") {
      valid = false;
    }

    if (
      field != "rowstatus" &&
      field != "prsnnm" &&
      field != "prsnnum" &&
      field != "postcd" &&
      field != "dptcd" &&
      valid == true &&
      field != "data1" &&
      field != "data2" &&
      field != "data3"
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

  const onAddClick = async () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    setLoading(true);
    let data: any;

    let queryStr = `SELECT LEFT(work_strtime,2) as shh,
    RIGHT(work_strtime,2) as smm,
    LEFT(work_endtime,2) as ehh,
    RIGHT(work_endtime,2) as emm
FROM HU072T WHERE paycd = '4'`;
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

      if (data.tables[0].RowCount > 0) {
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          agamt: 0,
          anlslry: 0,
          data1: ":",
          data2: "~",
          data3: ":",
          daydutydiv: "",
          dayhirinsurat: 0,
          dayinctax: 0,
          daylocatax: 0,
          daytaxstd: 0,
          dedtime: 0,
          dptcd: "",
          dutycd: "",
          dutydt: convertDateToStr(new Date()),
          dutytime1: 0,
          dutytime2: 0,
          dutytime3: 0,
          dutytime4: 0,
          dutytime5: 0,
          ehh: rows[0].ehh,
          emm: rows[0].emm,
          enddate: convertDateToStr(new Date()),
          hirinsu: 0,
          hirinsuyn: "Y",
          inctax: 0,
          inyrmm: convertDateToStr(filters.inyrmm).substring(0, 6),
          locatax: 0,
          medamt: 0,
          medamt_1: 0,
          meddiv: "Y",
          medrat2_1: 0,
          monpay: 0,
          notaxpay1: 0,
          notaxpay2: 0,
          orgdiv: "01",
          overtimepay: 0,
          overtimepay_1: 0,
          paycd: "",
          payprovyn: "",
          payyrmm: convertDateToStr(filters.payyrmm).substring(0, 6),
          pnsamt: 0,
          pnsamt_1: 0,
          pnsdiv: "Y",
          postcd: "",
          prsnnm: "",
          prsnnum: "",
          reyrmm: convertDateToStr(filters.reyrmm).substring(0, 6),
          rlpayamt: 0,
          shh: rows[0].shh,
          smm: rows[0].smm,
          startdate: convertDateToStr(new Date()),
          taxstd: 0,
          totded: 0,
          totpayamt: 0,
          workend: 0,
          worklate: 0,
          workout: 0,
          wrkday: 1,
          wrktime: 8,
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
      } else {
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          agamt: 0,
          anlslry: 0,
          data1: ":",
          data2: "~",
          data3: ":",
          daydutydiv: "",
          dayhirinsurat: 0,
          dayinctax: 0,
          daylocatax: 0,
          daytaxstd: 0,
          dedtime: 0,
          dptcd: "",
          dutycd: "",
          dutydt: convertDateToStr(new Date()),
          dutytime1: 0,
          dutytime2: 0,
          dutytime3: 0,
          dutytime4: 0,
          dutytime5: 0,
          ehh: "17",
          emm: "30",
          enddate: convertDateToStr(new Date()),
          hirinsu: 0,
          hirinsuyn: "Y",
          inctax: 0,
          inyrmm: convertDateToStr(filters.inyrmm).substring(0, 6),
          locatax: 0,
          medamt: 0,
          medamt_1: 0,
          meddiv: "Y",
          medrat2_1: 0,
          monpay: 0,
          notaxpay1: 0,
          notaxpay2: 0,
          orgdiv: "01",
          overtimepay: 0,
          overtimepay_1: 0,
          paycd: "",
          payprovyn: "",
          payyrmm: convertDateToStr(filters.payyrmm).substring(0, 6),
          pnsamt: 0,
          pnsamt_1: 0,
          pnsdiv: "Y",
          postcd: "",
          prsnnm: "",
          prsnnum: "",
          reyrmm: convertDateToStr(filters.reyrmm).substring(0, 6),
          rlpayamt: 0,
          shh: "08",
          smm: "30",
          startdate: convertDateToStr(new Date()),
          taxstd: 0,
          totded: 0,
          totpayamt: 0,
          workend: 0,
          worklate: 0,
          workout: 0,
          wrkday: 1,
          wrktime: 8,
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
      }
    }
    setLoading(false);
  };

  return (
    <>
      <TitleContainer>
        <Title>일용직 일근태</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={tabSelected == 0 ? exportExcel : undefined}
              permissions={permissions}
              disable={tabSelected == 0 ? false : true}
              pathname="HU_A6020W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="일용직일근태">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>근태일자</th>
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
                      className="required"
                    />
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
                        onClick={onlaborerWndClick}
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
                </tr>
                <tr>
                  <th>귀속년월</th>
                  <td>
                    <DatePicker
                      name="inyrmm"
                      value={filters.inyrmm}
                      format="yyyy-MM-dd"
                      className="readonly"
                      placeholder=""
                    />
                  </td>
                  <th>지급년월</th>
                  <td>
                    <DatePicker
                      name="payyrmm"
                      value={filters.payyrmm}
                      format="yyyy-MM-dd"
                      className="readonly"
                      placeholder=""
                    />
                  </td>
                  <th>신고년월</th>
                  <td>
                    <DatePicker
                      name="reyrmm"
                      value={filters.reyrmm}
                      format="yyyy-MM-dd"
                      className="readonly"
                      placeholder=""
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>일용직 일근태</GridTitle>
              <ButtonContainer>
                <Button
                  themeColor={"primary"}
                  //onClick={onUserMultiWndClick}
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
                  // onClick={onSaveClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  title="저장"
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <FormContext.Provider
              value={{
                PrsnInfo,
                setPrsnInfo,
              }}
            >
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="일용직 일근태"
              >
                <Grid
                  style={{ height: "68vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      dptcd: dptcdListData.find(
                        (item: any) => item.dptcd === row.dptcd
                      )?.dptnm,
                      postcd: postcdListData.find(
                        (item: any) => item.sub_code === row.postcd
                      )?.code_name,
                      dutydt: row.dutydt
                        ? new Date(dateformat(row.dutydt))
                        : new Date(dateformat("19000101")),
                      startdate: row.startdate
                        ? new Date(dateformat(row.startdate))
                        : new Date(dateformat("19000101")),
                      enddate: row.enddate
                        ? new Date(dateformat(row.enddate))
                        : new Date(dateformat("19000101")),
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
                  onSelectionChange={onMainSelectionChange}
                  //스크롤 조회 기능
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
                                : dateField.includes(item.fieldName)
                                ? DateCell
                                : CommandField.includes(item.fieldName)
                                ? ColumnCommandCell
                                : comboField.includes(item.fieldName)
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
            </FormContext.Provider>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="일용직집계표">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>년월</th>
                  <td>
                    <DatePicker
                      name="yyyymm"
                      value={filters2.yyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange2}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </td>
                  <th>지급일</th>
                  <td>
                    <DatePicker
                      name="paydt"
                      value={filters2.paydt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange2}
                      className="required"
                      placeholder=""
                    />
                  </td>
                  <th>일용직대장 양식</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="gubun"
                        value={filters2.gubun}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange2}
                        className="required"
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <div
            style={{
              height: "75vh",
              marginBottom: "10px",
            }}
          >
            {url != "" ? <FileViewers file={url} type="pdf" /> : ""}
          </div>
        </TabStripTab>
        <TabStripTab title="일용직 개인명세서">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>년월</th>
                  <td>
                    <DatePicker
                      name="frdt"
                      value={filters3.frdt}
                      format="yyyy-MM"
                      onChange={filterInputChange3}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </td>
                  <th>사업장</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="location"
                        value={filters3.location}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange3}
                      />
                    )}
                  </td>
                  <th>사번</th>
                  <td>
                    <Input
                      name="prsnnum"
                      type="text"
                      value={filters3.prsnnum}
                      onChange={filterInputChange3}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onlaborerWndClick2}
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
                      value={filters3.prsnnm}
                      onChange={filterInputChange3}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainerWrap>
            <GridContainer width="20%">
              <Grid
                style={{ height: "75vh" }}
                data={process(
                  mainDataResult3.data.map((row) => ({
                    ...row,
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
                onSelectionChange={onMainSelectionChange3}
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
                  customOptionData.menuCustomColumnOptions["grdList3"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell3
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(80% - ${GAP}px)`}>
              <div
                style={{
                  height: "75vh",
                  marginBottom: "10px",
                }}
              >
                {url2 != "" ? <FileViewers file={url2} type="pdf" /> : ""}
              </div>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>
      {laborerWindowVisible && (
        <LaborerWindow
          setVisible={setlaborerWindowVisible}
          setData={setlaborerData}
          modal={true}
        />
      )}
      {laborerWindowVisible2 && (
        <LaborerWindow
          setVisible={setlaborerWindowVisible2}
          setData={setlaborerData2}
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

export default HU_A6020W;
