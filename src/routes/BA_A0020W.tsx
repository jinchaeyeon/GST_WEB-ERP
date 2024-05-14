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
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import {
  Checkbox,
  CheckboxChangeEvent,
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
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import YearDateCell from "../components/Cells/YearDateCell";
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
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  isValidDate,
  numberWithCommas,
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
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ZipCodeWindow from "../components/Windows/CommonWindows/ZipCodeWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  heightstate,
  isLoading,
  loginResultState,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/BA_A0020W_C";
import sidoData from "../store/map/sido.json";
import sigData from "../store/map/sig.json";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var index = 0;

declare global {
  interface Window {
    kakao: {
      maps: any;
    };
  }
}

// 타입스크립트 인터페이스 정의
interface FeatureCollection {
  type: string;
  features: Feature[];
}

interface Feature {
  type: string;
  geometry: Geometry;
  properties: any;
}

interface Geometry {
  type: string;
  coordinates: number[][][];
}

interface LatLng {
  getLat: () => number;
  getLng: () => number;
}

interface Map {
  getLevel: () => number;
  setCenter: (latLng: LatLng) => void;
  getCenter: () => LatLng;
}

interface Polygon {
  setMap: (map: Map | null) => void;
}

// GeoJSON의 Feature 타입 정의
interface Feature {
  type: string;
  geometry: Geometry;
  properties: any;
}

// GeoJSON의 Geometry 타입 정의. 이 예제에서는 Polygon만을 다룹니다.
interface Geometry {
  type: string;
  coordinates: number[][][];
}
// GeoJSON의 FeatureCollection 타입 정의
interface FeatureCollection {
  type: string;
  features: Feature[];
}

interface Map {
  getLevel: () => number;
  setCenter: (latLng: LatLng) => void;
  getCenter: () => LatLng;
}

interface Geometry {
  type: string;
  coordinates: number[][][];
}

// 지도 기업수 클러스터링 위해 페이지 사이즈 임의로 늘림
// const PAGE_SIZE = 100;

const DATA_ITEM_KEY = "custcd";
const SUB_DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY2 = "num";
let deletedMainRows: any[] = [];
let deletedMainRows2: any[] = [];
let temp = 0;
let temp2 = 0;

const checkboxField = ["useyn", "rtrchk"];

const NumberField = [
  "sort_seq",
  "totasset",
  "paid_up_capital",
  "totcapital",
  "salesmoney",
  "operating_profits",
  "current_income",
  "dedt_ratio",
];

const requiredField = ["prsnnm", "yyyy"];
const commandField = ["files"];
const YearDateField = ["yyyy"];

type TdataArr = {
  rowstatus: string[];
  remark_s: string[];
  custprsncd_s: string[];
  prsnnm_s: string[];
  dptnm: string[];
  postcd_s: string[];
  telno: string[];
  phoneno_s: string[];
  email_s: string[];
  rtrchk_s: string[];
  attdatnum_s: string[];
  sort_seq_s: string[];
};

type TdataArr2 = {
  rowstatus: string[];
  remark_s: string[];
  seq_s: string[];
  yyyy_s: string[];
  totasset_s: string[];
  paid_up_capital_s: string[];
  totcaptial_s: string[];
  salesmoney_s: string[];
  operating_profits_s: string[];
  current_income_s: string[];
  dedt_rati_s: string[];
  totemp_s: string[];
  attdatnum_s: string[];
};
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;

export const FormContext = createContext<{
  attdatnum: string;
  files: string;
  setAttdatnum: (d: any) => void;
  setFiles: (d: any) => void;
  subDataState: State;
  setSubDataState: (d: any) => void;
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
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
          permission={{ upload: true, download: true, delete: true }}
          modal={true}
        />
      )}
    </>
  );
};

const BA_A0020: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const idGetter3 = getter(SUB_DATA_ITEM_KEY2);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");

  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  let deviceWidth = window.innerWidth;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = 0;
  var height2 = 0;
  var height3 = 0;
  var height4 = 0;
  var height5 = 0;
  var height6 = 0;
  var container = document.querySelector(".ButtonContainer");
  var container2 = document.querySelector(".ButtonContainer2");
  var container3 = document.querySelector(".ButtonContainer3");
  var container4 = document.querySelector(".ButtonContainer4");
  var container5 = document.querySelector(".ButtonContainer5");
  var container6 = document.querySelector(".k-tabstrip-items-wrapper");
  if (container?.clientHeight != undefined) {
    height = container == undefined ? 0 : container.clientHeight;
  }
  if (container2?.clientHeight != undefined) {
    height2 = container2 == undefined ? 0 : container2.clientHeight;
  }
  if (container3?.clientHeight != undefined) {
    height3 = container3 == undefined ? 0 : container3.clientHeight;
  }
  if (container4?.clientHeight != undefined) {
    height4 = container4 == undefined ? 0 : container4.clientHeight;
  }
  if (container5?.clientHeight != undefined) {
    height5 = container5 == undefined ? 0 : container5.clientHeight;
  }
  if (container6?.clientHeight != undefined) {
    height6 = container6 == undefined ? 0 : container6.clientHeight;
  }
  let isMobile = deviceWidth <= 1200;

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("BA_A0020W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("BA_A0020W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        raduseyn: defaultOption.find((item: any) => item.id == "raduseyn")
          .valueCode,
        custdiv: defaultOption.find((item: any) => item.id == "custdiv")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_AC401,L_BA025,L_AC901, L_sysUserMaster_001,L_BA171, L_BA172,L_BA173,L_BA049, L_BA026,L_BA027,L_BA008",
    //업체구분, 사업자구분, 매출단가항목(매입단가항목)
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [custdivListData, setCustdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [bizdivListData, setBizdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const custdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA026")
      );
      const BizdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA027")
      );

      fetchQuery(custdivQueryStr, setCustdivListData);
      fetchQuery(BizdivQueryStr, setBizdivListData);
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

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  //체크박스 유무
  const [yn, setyn] = useState(true);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [subDataState2, setSubDataState2] = useState<State>({
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

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const [zipCodeWindowVisible, setZipCodeWindowVisibile] =
    useState<boolean>(false);
  const [tabSelected, setTabSelected] = React.useState(0);
  const [workType, setWorkType] = useState<string>("U");

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      if (name == "useyn" || name == "scmyn" || name == "rtxisuyn") {
        if (value == false || value == "N") {
          setInfomation((prev) => ({
            ...prev,
            [name]: "N",
          }));
        } else {
          setInfomation((prev) => ({
            ...prev,
            [name]: "Y",
          }));
        }
      } else {
        setInfomation((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  //Form정보 Change함수
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [infomation, setInfomation] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    workType: "U",
    custcd: "자동생성",
    custnm: "",
    custdiv: "",
    custabbr: "",
    compnm_eng: "",
    inunpitem: "",
    bizregnum: "",
    zipcode: 0,
    area: "",
    unpitem: "",
    ceonm: "",
    address: "",
    bizdiv: "",
    repreregno: "",
    address_eng: "",
    estbdt: null, //new Date(),
    phonenum: "",
    bnkinfo: "",
    bankacntuser: "",
    compclass: "",
    etelnum: "",
    bankacnt: "",
    comptype: "",
    faxnum: "",
    bnkinfo2: "",
    bankacnt2: "",
    taxorg: "",
    efaxnum: "",
    email: "",
    taxortnm: "",
    useyn: "Y",
    scmyn: "Y",
    pariodyn: "",
    attdatnum: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    etax: "",
    remark: "",
    etxprs: "",
    phonenum_og: "",
    emailaddr_og: "",
    bill_type: "",
    recvid: "",
    rtxisuyn: "",
    files: "",
    auto: "Y",
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: sessionOrgdiv,
    custcd: "",
    custnm: "",
    custdiv: "",
    bizregnum: "",
    ceonm: "",
    raduseyn: "Y",
    company_code: companyCode,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [subfilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "CustPerson",
    custcd: infomation.custcd,
    custnm: "",
    custdiv: "",
    bizregnum: "",
    ceonm: "",
    useyn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [subfilters2, setsubFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "MONEY",
    custcd: infomation.custcd,
    custnm: "",
    custdiv: "",
    bizregnum: "",
    ceonm: "",
    useyn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0020W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custdiv": filters.custdiv,
        "@p_bizregnum": filters.bizregnum,
        "@p_ceonm": filters.ceonm,
        "@p_useyn": filters.raduseyn,
        "@p_company_code": filters.company_code,
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

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
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
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });

          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            custdiv: selectedRow.custdiv,
            custabbr: selectedRow.custabbr,
            compnm_eng: selectedRow.compnm_eng,
            inunpitem: selectedRow.inunpitem,
            bizregnum: selectedRow.bizregnum,
            zipcode: selectedRow.zipcode,
            area: selectedRow.area,
            unpitem: selectedRow.unpitem,
            ceonm: selectedRow.ceonm,
            address: selectedRow.address,
            bizdiv: selectedRow.bizdiv,
            repreregno: selectedRow.repreregno,
            address_eng: selectedRow.address_eng,
            estbdt: isValidDate(selectedRow.estbdt)
              ? new Date(dateformat(selectedRow.estbdt))
              : null,
            phonenum: selectedRow.phonenum,
            bnkinfo: selectedRow.bnkinfo,
            bankacntuser: selectedRow.bankacntuser,
            compclass: selectedRow.compclass,
            etelnum: selectedRow.etelnum,
            bankacnt: selectedRow.bankacnt,
            comptype: selectedRow.comptype,
            faxnum: selectedRow.faxnum,
            bnkinfo2: selectedRow.bnkinfo2,
            bankacnt2: selectedRow.bankacnt2,
            taxorg: selectedRow.taxorg,
            efaxnum: selectedRow.efaxnum,
            email: selectedRow.email,
            taxortnm: selectedRow.taxortnm,
            useyn: selectedRow.useyn == "Y" ? "Y" : "N",
            scmyn: selectedRow.scmyn == "Y" ? "Y" : "N",
            pariodyn: selectedRow.pariodyn == "Y" ? "Y" : "N",
            attdatnum: selectedRow.attdatnum,
            itemlvl1: selectedRow.itemlvl1,
            itemlvl2: selectedRow.itemlvl2,
            itemlvl3: selectedRow.itemlvl3,
            etax: selectedRow.etax,
            remark: selectedRow.remark,
            etxprs: selectedRow.etxprs,
            phonenum_og: selectedRow.phonenum_og,
            emailaddr_og: selectedRow.emailaddr_og,
            bill_type: selectedRow.bill_type,
            recvid: selectedRow.recvid,
            rtxisuyn: selectedRow.rtxisuyn,
            files: selectedRow.files,
            auto: selectedRow.auto,
          });

          setsubFilters((prev) => ({
            ...prev,
            workType: "CustPerson",
            useyn: selectedRow.useyn,
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            custdiv: selectedRow.custdiv,
            bizregnum: selectedRow.bizregnum,
            ceonm: selectedRow.ceonm,
            isSearch: true,
          }));

          setsubFilters2((prev) => ({
            ...prev,
            workType: "MONEY",
            useyn: selectedRow.useyn,
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            custdiv: selectedRow.custdiv,
            bizregnum: selectedRow.bizregnum,
            ceonm: selectedRow.ceonm,
            isSearch: true,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });

          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            custdiv: rows[0].custdiv,
            custabbr: rows[0].custabbr,
            compnm_eng: rows[0].compnm_eng,
            inunpitem: rows[0].inunpitem,
            bizregnum: rows[0].bizregnum,
            zipcode: rows[0].zipcode,
            area: rows[0].area,
            unpitem: rows[0].unpitem,
            ceonm: rows[0].ceonm,
            address: rows[0].address,
            bizdiv: rows[0].bizdiv,
            repreregno: rows[0].repreregno,
            address_eng: rows[0].address_eng,
            estbdt: isValidDate(rows[0].estbdt)
              ? new Date(dateformat(rows[0].estbdt))
              : null,
            phonenum: rows[0].phonenum,
            bnkinfo: rows[0].bnkinfo,
            bankacntuser: rows[0].bankacntuser,
            compclass: rows[0].compclass,
            etelnum: rows[0].etelnum,
            bankacnt: rows[0].bankacnt,
            comptype: rows[0].comptype,
            faxnum: rows[0].faxnum,
            bnkinfo2: rows[0].bnkinfo2,
            bankacnt2: rows[0].bankacnt2,
            taxorg: rows[0].taxorg,
            efaxnum: rows[0].efaxnum,
            email: rows[0].email,
            taxortnm: rows[0].taxortnm,
            useyn: rows[0].useyn == "Y" ? "Y" : "N",
            scmyn: rows[0].scmyn == "Y" ? "Y" : "N",
            pariodyn: rows[0].pariodyn == "Y" ? "Y" : "N",
            attdatnum: rows[0].attdatnum,
            itemlvl1: rows[0].itemlvl1,
            itemlvl2: rows[0].itemlvl2,
            itemlvl3: rows[0].itemlvl3,
            etax: rows[0].etax,
            remark: rows[0].remark,
            etxprs: rows[0].etxprs,
            phonenum_og: rows[0].phonenum_og,
            emailaddr_og: rows[0].emailaddr_og,
            bill_type: rows[0].bill_type,
            recvid: rows[0].recvid,
            rtxisuyn: rows[0].rtxisuyn,
            files: rows[0].files,
            auto: rows[0].auto,
          });

          setsubFilters((prev) => ({
            ...prev,
            workType: "CustPerson",
            useyn: rows[0].useyn,
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            custdiv: rows[0].custdiv,
            bizregnum: rows[0].bizregnum,
            ceonm: rows[0].ceonm,
            isSearch: true,
          }));

          setsubFilters2((prev) => ({
            ...prev,
            workType: "MONEY",
            useyn: rows[0].useyn,
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            custdiv: rows[0].custdiv,
            bizregnum: rows[0].bizregnum,
            ceonm: rows[0].ceonm,
            isSearch: true,
          }));
        }
      } else {
        setInfomation({
          pgSize: PAGE_SIZE,
          workType: "N",
          custcd: "자동생성",
          custnm: "",
          custdiv: "A",
          custabbr: "",
          compnm_eng: "",
          inunpitem: "SYS01",
          bizregnum: "",
          zipcode: 0,
          area: "",
          unpitem: "SYS02",
          ceonm: "",
          address: "",
          bizdiv: "1",
          repreregno: "",
          address_eng: "",
          estbdt: null,
          phonenum: "",
          bnkinfo: "",
          bankacntuser: "",
          compclass: "",
          etelnum: "",
          bankacnt: "",
          comptype: "",
          faxnum: "",
          bnkinfo2: "",
          bankacnt2: "",
          taxorg: "",
          efaxnum: "",
          email: "",
          taxortnm: "",
          useyn: "N",
          scmyn: "N",
          pariodyn: "",
          attdatnum: "",
          itemlvl1: "",
          itemlvl2: "",
          itemlvl3: "",
          etax: "",
          remark: "",
          etxprs: "",
          phonenum_og: "",
          emailaddr_og: "",
          bill_type: "",
          recvid: "",
          rtxisuyn: "N",
          files: "",
          auto: "Y",
        });
        setSubDataResult({
          data: [],
          total: 0,
        });
        setSubDataResult2({
          data: [],
          total: 0,
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

  const fetchSubGrid = async (subfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);

    //조회조건 파라미터
    const subparameters: Iparameters = {
      procedureName: "P_BA_A0020W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": subfilters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_useyn": subfilters.useyn,
        "@p_custcd": subfilters.custcd,
        "@p_custnm": subfilters.custnm,
        "@p_custdiv":
          custdivListData.find(
            (item: any) => item.code_name == subfilters.custdiv
          )?.sub_code == undefined
            ? ""
            : custdivListData.find(
                (item: any) => item.code_name == subfilters.custdiv
              )?.sub_code,
        "@p_bizregnum": subfilters.bizregnum,
        "@p_ceonm": subfilters.ceonm,
        "@p_company_code": companyCode,
        "@p_find_row_value": null,
      },
    };

    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      const row = rows.map((item: any) => ({
        ...item,
      }));

      if (subfilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[SUB_DATA_ITEM_KEY] == subfilters.find_row_value
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

      setSubDataResult((prev) => {
        return {
          data: row,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        // find_row_value 행 선택, find_row_value 없는 경우 첫번째 행 선택
        const selectedRow =
          subfilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row[SUB_DATA_ITEM_KEY] == subfilters.find_row_value
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
    setsubFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchSubGrid2 = async (subfilters2: any) => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);

    const subparameters2: Iparameters = {
      procedureName: "P_BA_A0020W_Q",
      pageNumber: subfilters2.pgNum,
      pageSize: subfilters2.pgSize,
      parameters: {
        "@p_work_type": subfilters2.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_useyn": subfilters2.useyn,
        "@p_custcd": subfilters2.custcd,
        "@p_custnm": subfilters2.custnm,
        "@p_custdiv":
          custdivListData.find(
            (item: any) => item.code_name == subfilters2.custdiv
          )?.sub_code == undefined
            ? ""
            : custdivListData.find(
                (item: any) => item.code_name == subfilters2.custdiv
              )?.sub_code,
        "@p_bizregnum": subfilters2.bizregnum,
        "@p_ceonm": subfilters2.ceonm,
        "@p_company_code": companyCode,
        "@p_find_row_value": null,
      },
    };
    try {
      data = await processApi<any>("procedure", subparameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      const row = rows.map((item: any) => ({
        ...item,
        yyyy: item.yyyy + "0101",
      }));

      if (subfilters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[SUB_DATA_ITEM_KEY2] == subfilters2.find_row_value
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
          data: row,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        // find_row_value 행 선택, find_row_value 없는 경우 첫번째 행 선택
        const selectedRow =
          subfilters2.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row[SUB_DATA_ITEM_KEY2] == subfilters2.find_row_value
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
    setsubFilters2((prev) => ({
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
      customOptionData != null &&
      filters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (subfilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);

      setsubFilters((prev) => ({
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

      setsubFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));

      fetchSubGrid2(deepCopiedFilters);
    }
  }, [subfilters2]);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);

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

  //그리드 리셋
  const resetAllGrid = () => {
    deletedMainRows = [];
    deletedMainRows2 = [];
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
    setSubDataResult2(process([], subDataState2));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
    setyn(true);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "U",
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      custdiv:
        custdivListData.find(
          (item: any) => item.code_name == selectedRowData.custdiv
        )?.sub_code == undefined
          ? selectedRowData.custdiv
          : custdivListData.find(
              (item: any) => item.code_name == selectedRowData.custdiv
            )?.sub_code,
      custabbr: selectedRowData.custabbr,
      compnm_eng: selectedRowData.compnm_eng,
      inunpitem: selectedRowData.inunpitem,
      bizregnum: selectedRowData.bizregnum,
      zipcode: selectedRowData.zipcode,
      area: selectedRowData.area,
      unpitem: selectedRowData.unpitem,
      ceonm: selectedRowData.ceonm,
      address: selectedRowData.address,
      bizdiv:
        bizdivListData.find(
          (item: any) => item.code_name == selectedRowData.bizdiv
        )?.sub_code == undefined
          ? selectedRowData.bizdiv
          : bizdivListData.find(
              (item: any) => item.code_name == selectedRowData.bizdiv
            )?.sub_code,
      repreregno: selectedRowData.repreregno,
      address_eng: selectedRowData.address_eng,
      estbdt: isValidDate(selectedRowData.estbdt)
        ? new Date(dateformat(selectedRowData.estbdt))
        : null,
      phonenum: selectedRowData.phonenum,
      bnkinfo: selectedRowData.bnkinfo,
      bankacntuser: selectedRowData.bankacntuser,
      compclass: selectedRowData.compclass,
      etelnum: selectedRowData.etelnum,
      bankacnt: selectedRowData.bankacnt,
      comptype: selectedRowData.comptype,
      faxnum: selectedRowData.faxnum,
      bnkinfo2: selectedRowData.bnkinfo2,
      bankacnt2: selectedRowData.bankacnt2,
      taxorg: selectedRowData.taxorg,
      efaxnum: selectedRowData.efaxnum,
      email: selectedRowData.email,
      taxortnm: selectedRowData.taxortnm,
      useyn: selectedRowData.useyn == "Y" ? "Y" : "N",
      scmyn: selectedRowData.scmyn == "Y" ? "Y" : "N",
      pariodyn: selectedRowData.pariodyn == "Y" ? "Y" : "N",
      attdatnum: selectedRowData.attdatnum,
      itemlvl1: selectedRowData.itemlvl1,
      itemlvl2: selectedRowData.itemlvl2,
      itemlvl3: selectedRowData.itemlvl3,
      etax: selectedRowData.etax,
      remark: selectedRowData.remark,
      etxprs: selectedRowData.etxprs,
      phonenum_og: selectedRowData.phonenum_og,
      emailaddr_og: selectedRowData.emailaddr_og,
      bill_type: selectedRowData.bill_type,
      recvid: selectedRowData.recvid,
      rtxisuyn: selectedRowData.rtxisuyn,
      files: selectedRowData.files,
      auto: selectedRowData.auto,
    });

    setsubFilters((prev) => ({
      ...prev,
      workType: "CustPerson",
      useyn: selectedRowData.useyn,
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      custdiv: selectedRowData.custdiv,
      bizregnum: selectedRowData.bizregnum,
      ceonm: selectedRowData.ceonm,
      isSearch: true,
      pgNum: 1,
      find_row_value: "",
    }));

    setsubFilters2((prev) => ({
      ...prev,
      workType: "MONEY",
      useyn: selectedRowData.useyn,
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      custdiv: selectedRowData.custdiv,
      bizregnum: selectedRowData.bizregnum,
      ceonm: selectedRowData.ceonm,
      isSearch: true,
      pgNum: 1,
      find_row_value: "",
    }));
    setTabSelected(0);
    if (swiper) {
      swiper.slideTo(1);
    }
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

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export.save(optionsGridOne);
      } else if (tabSelected == 1) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "업체담당자";
        _export.save(optionsGridOne);
      } else if (tabSelected == 2) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridThree.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "재무현황";
        _export.save(optionsGridOne);
      }
    }
  };
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  const onSubDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setSubDataState2(event.dataState);
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

  //그리드 푸터
  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {subDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
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

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    subDataResult2.data.forEach((item) =>
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

  const onAddClick2 = () => {
    setWorkType("N");
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "N",
      custcd: "자동생성",
      custnm: "",
      custdiv: "A",
      custabbr: "",
      compnm_eng: "",
      inunpitem: "SYS01",
      bizregnum: "",
      zipcode: 0,
      area: "",
      unpitem: "SYS02",
      ceonm: "",
      address: "",
      bizdiv: "1",
      repreregno: "",
      address_eng: "",
      estbdt: null,
      phonenum: "",
      bnkinfo: "",
      bankacntuser: "",
      compclass: "",
      etelnum: "",
      bankacnt: "",
      comptype: "",
      faxnum: "",
      bnkinfo2: "",
      bankacnt2: "",
      taxorg: "",
      efaxnum: "",
      email: "",
      taxortnm: "",
      useyn: "N",
      scmyn: "N",
      pariodyn: "",
      attdatnum: "",
      itemlvl1: "",
      itemlvl2: "",
      itemlvl3: "",
      etax: "",
      remark: "",
      etxprs: "",
      phonenum_og: "",
      emailaddr_og: "",
      bill_type: "",
      recvid: "",
      rtxisuyn: "N",
      files: "",
      auto: "Y",
    });
    setSubDataResult({
      data: [],
      total: 0,
    });
    setSubDataResult2({
      data: [],
      total: 0,
    });
    setTabSelected(0);
  };

  const onAddClick = () => {
    subDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [SUB_DATA_ITEM_KEY]: ++temp,
      recdt: convertDateToStr(new Date()),
      attdatnum: "",
      custcd: infomation.custcd,
      custprsncd: "",
      dptnm: "",
      email: "",
      files: "",
      insert_form_id: "",
      insert_pc: "",
      insert_time: "",
      insert_userid: "",
      phoneno: "",
      prsnnm: "",
      remark: "",
      rtrchk: "N",
      sort_seq: 0,
      telno: "",
      update_form_id: "BA_A0020",
      update_pc: "",
      update_time: "",
      update_userid: "",
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

  const onAddClick3 = () => {
    subDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    const newDataItem = {
      [SUB_DATA_ITEM_KEY2]: ++temp2,
      custcd: infomation.custcd,
      current_income: 0,
      dedt_ratio: 0,
      operating_profits: 0,
      paid_up_capital: 0,
      ramark: "",
      salesmoney: 0,
      seq: 0,
      totasset: 0,
      totcapital: 0,
      yyyy: convertDateToStr(new Date()),
      rowstatus: "N",
    };
    setSelectedsubDataState2({ [newDataItem[SUB_DATA_ITEM_KEY2]]: true });
    setSubDataResult2((prev) => {
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
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const onZipCodeWndClick = () => {
    setZipCodeWindowVisibile(true);
  };
  const handleSelectTab = (e: any) => {
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }

    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        find_row_value: Object.getOwnPropertyNames(selectedState)[0],
        isSearch: true,
      }));
    } else {
      setsubFilters((prev) => ({
        ...prev,
        workType: "CustPerson",
        isSearch: true,
      }));

      setsubFilters2((prev) => ({
        ...prev,
        workType: "MONEY",
        isSearch: true,
      }));
    }
    setTabSelected(e.selected);
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

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    if (!infomation.attdatnum) {
      setUnsavedAttadatnums((prev) => [...prev, data.attdatnum]);
    }

    setInfomation((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  const getZipCodeData = (zipcode: string, address: string) => {
    setInfomation((prev) => {
      return {
        ...prev,
        zipcode: zipcode,
        address: address,
      };
    });
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

  const search = () => {
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    setPage3(initialPageState); // 페이지 초기화
    resetAllGrid(); // 데이터 초기화
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    setTabSelected(0);
    setyn(true);
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

  const onSubItemChange2 = (event: GridItemChangeEvent) => {
    setSubDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult2,
      setSubDataResult2,
      SUB_DATA_ITEM_KEY2
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "files" && field != "custprsncd") {
      const newData = subDataResult.data.map((item) =>
        item[SUB_DATA_ITEM_KEY] == dataItem[SUB_DATA_ITEM_KEY]
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
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev: { total: any }) => {
        return {
          data: subDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = subDataResult2.data.map((item) =>
        item[SUB_DATA_ITEM_KEY2] == dataItem[SUB_DATA_ITEM_KEY2]
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
      setSubDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev: { total: any }) => {
        return {
          data: subDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != subDataResult.data) {
      const newData = subDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
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
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = subDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != subDataResult2.data) {
      const newData = subDataResult2.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[SUB_DATA_ITEM_KEY2] ==
          Object.getOwnPropertyNames(selectedsubDataState2)[0]
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
      setSubDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = subDataResult2.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
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

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    custcd: "",
    attdatnum: "",
  });

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
          const newData2 = item;
          newData2.rowstatus = "D";
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

  const onDeleteClick3 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    subDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedsubDataState2[item[SUB_DATA_ITEM_KEY2]]) {
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
      data = subDataResult2.data[Math.min(...Object2)];
    } else {
      data = subDataResult2.data[Math.min(...Object) - 1];
    }
    setSubDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));

    setSelectedsubDataState2({
      [data != undefined ? data[SUB_DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };
  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult.total > 0) {
      const items = Object.getOwnPropertyNames(selectedState)[0];
      const data = mainDataResult.data.filter(
        (item) => item.custcd == items
      )[0];

      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        custcd: items,
        attdatnum: data.attdatnum,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const [paraData, setParaData] = useState({
    workType: "CustPerson",
    orgdiv: sessionOrgdiv,
    custcd: "",
    custnm: "",
    custdiv: "",
    custabbr: "",
    bizdiv: "",
    bizregnum: "",
    ceonm: "",
    repreregno: "",
    comptype: "",
    compclass: "",
    zipcode: 0,
    address: "",
    phonenum: "",
    faxnum: "",
    estbdt: "",
    compnm_eng: "",
    address_eng: "",
    bnkinfo: "",
    etelnum: "",
    efaxnum: "",
    unpitem: "",
    useyn: "",
    remark: "",
    attdatnum: "",
    bill_type: "",
    recvid: "",
    rtxisuyn: "",
    etxprs: "",
    emailaddr_og: "",
    phonenum_og: "",
    etax: "",
    inunpitem: "",
    email: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    bankacnt: "",
    bankacntuser: "",
    scmyn: "",
    pariodyn: "",
    bnkinfo2: "",
    bankacnt2: "",
    area: "",
    rowstatus: "",
    remark_s: "",
    custprsncd_s: "",
    prsnnm_s: "",
    dptnm: "",
    postcd_s: "",
    telno: "",
    phoneno_s: "",
    email_s: "",
    rtrchk_s: "",
    attdatnum_s: "",
    sort_seq_s: "",
    seq_s: "",
    yyyy_s: "",
    totasset_s: "",
    paid_up_capital_s: "",
    totcapital_s: "",
    salesmoney_s: "",
    operating_profits_s: "",
    current_income_s: "",
    dedt_rati_s: "",
    totemp_s: "",
    user_id: userId,
    pc: pc,
    form_id: "BA_A0020W",
    company_code: companyCode,
    auto: "Y",
  });

  const para: Iparameters = {
    procedureName: "P_BA_A0020W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_auto": paraData.auto,
      "@p_custcd": paraData.custcd,
      "@p_custnm": paraData.custnm,
      "@p_custdiv":
        custdivListData.find(
          (item: any) => item.code_name == infomation.custdiv
        )?.sub_code == undefined
          ? ""
          : custdivListData.find(
              (item: any) => item.code_name == infomation.custdiv
            )?.sub_code,
      "@p_custabbr": paraData.custabbr,
      "@p_bizdiv":
        bizdivListData.find((item: any) => item.code_name == infomation.bizdiv)
          ?.sub_code == undefined
          ? ""
          : bizdivListData.find(
              (item: any) => item.code_name == infomation.bizdiv
            )?.sub_code,
      "@p_bizregnum": paraData.bizregnum,
      "@p_ceonm": paraData.ceonm,
      "@p_repreregno": paraData.repreregno,
      "@p_comptype": paraData.comptype,
      "@p_compclass": paraData.compclass,
      "@p_zipcode": paraData.zipcode,
      "@p_address": paraData.address,
      "@p_phonenum": paraData.phonenum,
      "@p_faxnum": paraData.faxnum,
      "@p_estbdt": paraData.estbdt,
      "@p_compnm_eng": paraData.compnm_eng,
      "@p_address_eng": paraData.address_eng,
      "@p_bnkinfo": paraData.bnkinfo,
      "@p_etelnum": paraData.etelnum,
      "@p_efaxnum": paraData.efaxnum,
      "@p_unpitem": paraData.unpitem,
      "@p_useyn": paraData.useyn,
      "@p_remark": paraData.remark,
      "@p_attdatnum": paraData.attdatnum,
      "@p_bill_type": paraData.bill_type,
      "@p_recvid": paraData.recvid,
      "@p_rtxisuyn": paraData.rtxisuyn,
      "@p_etxprs": paraData.etxprs,
      "@p_emailaddr_og": paraData.emailaddr_og,
      "@p_phonenum_og": paraData.phonenum_og,
      "@p_etax": paraData.etax,
      "@p_inunpitem": paraData.inunpitem,
      "@p_email": paraData.email,
      "@p_itemlvl1": paraData.itemlvl1,
      "@p_itemlvl2": paraData.itemlvl2,
      "@p_itemlvl3": paraData.itemlvl3,
      "@p_bankacnt": paraData.bankacnt,
      "@p_bankacntuser": paraData.bankacntuser,
      "@p_scmyn": paraData.scmyn,
      "@p_periodyn": paraData.pariodyn == undefined ? "" : paraData.pariodyn,
      "@p_bnkinfo2": paraData.bnkinfo2,
      "@p_bankacnt2": paraData.bankacnt2,
      "@p_area": paraData.area,
      "@p_rowstatus_s": paraData.rowstatus,
      "@p_remark_s": paraData.remark_s,
      "@p_custprsncd_s": paraData.custprsncd_s,
      "@p_prsnnm_s": paraData.prsnnm_s,
      "@p_dptnm_s": paraData.dptnm,
      "@p_postcd_s": paraData.postcd_s,
      "@p_telno_s": paraData.telno,
      "@p_phoneno_s": paraData.phoneno_s,
      "@p_email_s": paraData.email_s,
      "@p_rtrchk_s": paraData.rtrchk_s,
      "@p_attdatnum_s": paraData.attdatnum_s,
      "@p_sort_seq_s": paraData.sort_seq_s,
      "@p_seq_s": paraData.seq_s,
      "@p_yyyy_s": paraData.yyyy_s,
      "@p_totasset_s": paraData.totasset_s,
      "@p_paid_up_capital_s": paraData.paid_up_capital_s,
      "@p_totcapital_s": paraData.totcapital_s,
      "@p_salesmoney_s": paraData.salesmoney_s,
      "@p_operating_profits_s": paraData.operating_profits_s,
      "@p_current_income_s": paraData.current_income_s,
      "@p_dedt_rati_s": paraData.dedt_rati_s,
      "@p_totemp_s": paraData.totemp_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "BA_A0020W",
      "@p_company_code": companyCode,
    },
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_BA_A0020W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_auto": infomation.auto,
      "@p_custcd": paraDataDeleted.custcd,
      "@p_custnm": infomation.custnm,
      "@p_custdiv": infomation.custdiv,
      "@p_custabbr": infomation.custabbr,
      "@p_bizdiv": infomation.bizdiv,
      "@p_bizregnum": infomation.bizregnum,
      "@p_ceonm": infomation.ceonm,
      "@p_repreregno": infomation.repreregno,
      "@p_comptype": infomation.comptype,
      "@p_compclass": infomation.compclass,
      "@p_zipcode": infomation.zipcode,
      "@p_address": infomation.address,
      "@p_phonenum": infomation.phonenum,
      "@p_faxnum": infomation.faxnum,
      "@p_estbdt":
        infomation.estbdt == null ? "" : convertDateToStr(infomation.estbdt),
      "@p_compnm_eng": infomation.compnm_eng,
      "@p_address_eng": infomation.address_eng,
      "@p_bnkinfo": infomation.bnkinfo,
      "@p_etelnum": infomation.etelnum,
      "@p_efaxnum": infomation.efaxnum,
      "@p_unpitem": infomation.unpitem,
      "@p_useyn": infomation.useyn,
      "@p_remark": infomation.remark,
      "@p_attdatnum": infomation.attdatnum,
      "@p_bill_type": infomation.bill_type,
      "@p_recvid": infomation.recvid,
      "@p_rtxisuyn": infomation.rtxisuyn,
      "@p_etxprs": infomation.etxprs,
      "@p_emailaddr_og": infomation.emailaddr_og,
      "@p_phonenum_og": infomation.phonenum_og,
      "@p_etax": infomation.etax,
      "@p_inunpitem": infomation.inunpitem,
      "@p_email": infomation.email,
      "@p_itemlvl1": infomation.itemlvl1,
      "@p_itemlvl2": infomation.itemlvl2,
      "@p_itemlvl3": infomation.itemlvl3,
      "@p_bankacnt": infomation.bankacnt,
      "@p_bankacntuser": infomation.bankacntuser,
      "@p_scmyn": infomation.scmyn,
      "@p_periodyn": "",
      "@p_bnkinfo2": infomation.bnkinfo2,
      "@p_bankacnt2": infomation.bankacnt2,
      "@p_area": infomation.area,
      "@p_rowstatus_s": "",
      "@p_remark_s": "",
      "@p_custprsncd_s": "",
      "@p_prsnnm_s": "",
      "@p_dptnm_s": "",
      "@p_postcd_s": "",
      "@p_telno_s": "",
      "@p_phoneno_s": "",
      "@p_email_s": "",
      "@p_rtrchk_s": "",
      "@p_attdatnum_s": "",
      "@p_sort_seq_s": "",
      "@p_seq_s": "",
      "@p_yyyy_s": "",
      "@p_totasset_s": "",
      "@p_paid_up_capital_s": "",
      "@p_totcapital_s": "",
      "@p_salesmoney_s": "",
      "@p_operating_profits_s": "",
      "@p_current_income_s": "",
      "@p_dedt_rati_s": "",
      "@p_totemp_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "BA_A0020W",
      "@p_company_code": companyCode,
    },
  };

  const infopara: Iparameters = {
    procedureName: "P_BA_A0020W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": infomation.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_auto": infomation.auto,
      "@p_custcd": infomation.custcd,
      "@p_custnm": infomation.custnm,
      "@p_custdiv":
        custdivListData.find(
          (item: any) => item.code_name == infomation.custdiv
        )?.sub_code == undefined
          ? infomation.custdiv
          : custdivListData.find(
              (item: any) => item.code_name == infomation.custdiv
            )?.sub_code,
      "@p_custabbr": infomation.custabbr,
      "@p_bizdiv":
        bizdivListData.find((item: any) => item.code_name == infomation.bizdiv)
          ?.sub_code == undefined
          ? infomation.bizdiv
          : bizdivListData.find(
              (item: any) => item.code_name == infomation.bizdiv
            )?.sub_code,
      "@p_bizregnum": infomation.bizregnum,
      "@p_ceonm": infomation.ceonm,
      "@p_repreregno": infomation.repreregno,
      "@p_comptype": infomation.comptype,
      "@p_compclass": infomation.compclass,
      "@p_zipcode": infomation.zipcode,
      "@p_address": infomation.address,
      "@p_phonenum": infomation.phonenum,
      "@p_faxnum": infomation.faxnum,
      "@p_estbdt":
        infomation.estbdt == null ? "" : convertDateToStr(infomation.estbdt),
      "@p_compnm_eng": infomation.compnm_eng,
      "@p_address_eng": infomation.address_eng,
      "@p_bnkinfo": infomation.bnkinfo,
      "@p_etelnum": infomation.etelnum,
      "@p_efaxnum": infomation.efaxnum,
      "@p_unpitem": infomation.unpitem,
      "@p_useyn": infomation.useyn,
      "@p_remark": infomation.remark,
      "@p_attdatnum": infomation.attdatnum,
      "@p_bill_type": infomation.bill_type,
      "@p_recvid": infomation.recvid,
      "@p_rtxisuyn": infomation.rtxisuyn,
      "@p_etxprs": infomation.etxprs,
      "@p_emailaddr_og": infomation.emailaddr_og,
      "@p_phonenum_og": infomation.phonenum_og,
      "@p_etax": infomation.etax,
      "@p_inunpitem": infomation.inunpitem,
      "@p_email": infomation.email,
      "@p_itemlvl1": infomation.itemlvl1,
      "@p_itemlvl2": infomation.itemlvl2,
      "@p_itemlvl3": infomation.itemlvl3,
      "@p_bankacnt": infomation.bankacnt,
      "@p_bankacntuser": infomation.bankacntuser,
      "@p_scmyn": infomation.scmyn,
      "@p_periodyn": "",
      "@p_bnkinfo2": infomation.bnkinfo2,
      "@p_bankacnt2": infomation.bankacnt2,
      "@p_area": infomation.area,
      "@p_rowstatus_s": "",
      "@p_remark_s": "",
      "@p_custprsncd_s": "",
      "@p_prsnnm_s": "",
      "@p_dptnm_s": "",
      "@p_postcd_s": "",
      "@p_telno_s": "",
      "@p_phoneno_s": "",
      "@p_email_s": "",
      "@p_rtrchk_s": "",
      "@p_attdatnum_s": "",
      "@p_sort_seq_s": "",
      "@p_seq_s": "",
      "@p_yyyy_s": "",
      "@p_totasset_s": "",
      "@p_paid_up_capital_s": "",
      "@p_totcapital_s": "",
      "@p_salesmoney_s": "",
      "@p_operating_profits_s": "",
      "@p_current_income_s": "",
      "@p_dedt_rati_s": "",
      "@p_totemp_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "BA_A0020W",
      "@p_company_code": companyCode,
    },
  };

  useEffect(() => {
    if (paraDataDeleted.work_type == "D") fetchToDelete();
  }, [paraDataDeleted]);

  const onSaveClick = async () => {
    let valid = true;
    const dataItem = subDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    try {
      dataItem.map((item: any) => {
        if (item.prsnnm == "") {
          throw findMessage(messagesData, "BA_A0020W_008");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }
    if (!valid) return false;
    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
    let dataArr: TdataArr = {
      rowstatus: [],
      remark_s: [],
      custprsncd_s: [],
      prsnnm_s: [],
      dptnm: [],
      postcd_s: [],
      telno: [],
      phoneno_s: [],
      email_s: [],
      rtrchk_s: [],
      attdatnum_s: [],
      sort_seq_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        remark = "",
        custprsncd = "",
        custprsncd_s = "",
        prsnnm = "",
        prsnnm_s = "",
        dptnm = "",
        postcd_s = "",
        telno = "",
        phoneno = "",
        email = "",
        rtrchk = "",
        attdatnum = "",
        sort_seq = "",
      } = item;

      dataArr.rowstatus.push(rowstatus);
      dataArr.remark_s.push(remark);
      dataArr.custprsncd_s.push(custprsncd);
      dataArr.prsnnm_s.push(prsnnm);
      dataArr.dptnm.push(dptnm);
      dataArr.postcd_s.push(postcd_s);
      dataArr.telno.push(telno);
      dataArr.phoneno_s.push(phoneno);
      dataArr.email_s.push(email);
      dataArr.rtrchk_s.push(rtrchk == true || rtrchk == "Y" ? "Y" : "N");
      dataArr.attdatnum_s.push(attdatnum);
      dataArr.sort_seq_s.push(sort_seq);
    });

    deletedMainRows.forEach(async (item: any, idx: number) => {
      const {
        rowstatus = "",
        remark = "",
        custprsncd = "",
        custprsncd_s = "",
        prsnnm = "",
        prsnnm_s = "",
        dptnm = "",
        postcd_s = "",
        telno = "",
        phoneno = "",
        email = "",
        rtrchk = "",
        attdatnum = "",
        sort_seq = "",
      } = item;

      dataArr.rowstatus.push(rowstatus);
      dataArr.remark_s.push(remark);
      dataArr.custprsncd_s.push(custprsncd);
      dataArr.prsnnm_s.push(prsnnm);
      dataArr.dptnm.push(dptnm);
      dataArr.postcd_s.push(postcd_s);
      dataArr.telno.push(telno);
      dataArr.phoneno_s.push(phoneno);
      dataArr.email_s.push(email);
      dataArr.rtrchk_s.push(rtrchk == true || rtrchk == "Y" ? "Y" : "N");
      dataArr.attdatnum_s.push(attdatnum);
      dataArr.sort_seq_s.push(sort_seq);
    });

    const item = Object.getOwnPropertyNames(selectedState)[0];

    setParaData((prev) => ({
      ...prev,
      workType: "CustPerson",
      custcd: item.toString(),
      custnm: infomation.custnm,
      custdiv: infomation.custdiv,
      custabbr: infomation.custabbr,
      bizdiv: infomation.bizdiv,
      bizregnum: infomation.bizregnum,
      ceonm: infomation.ceonm,
      repreregno: infomation.repreregno,
      comptype: infomation.comptype,
      compclass: infomation.compclass,
      zipcode: infomation.zipcode,
      address: infomation.address,
      phonenum: infomation.phonenum,
      faxnum: infomation.faxnum,
      estbdt: infomation.estbdt == null ? "" : infomation.estbdt,
      compnm_eng: infomation.compnm_eng,
      address_eng: infomation.address_eng,
      bnkinfo: infomation.bnkinfo,
      etelnum: infomation.etelnum,
      efaxnum: infomation.efaxnum,
      unpitem: infomation.unpitem,
      useyn: infomation.useyn,
      remark: infomation.remark,
      attdatnum: infomation.attdatnum,
      bill_type: infomation.bill_type,
      recvid: infomation.recvid,
      rtxisuyn: infomation.rtxisuyn,
      etxprs: infomation.etxprs,
      emailaddr_og: infomation.emailaddr_og,
      phonenum_og: infomation.phonenum_og,
      etax: infomation.etax,
      inunpitem: infomation.inunpitem,
      email: infomation.email,
      itemlvl1: infomation.itemlvl1,
      itemlvl2: infomation.itemlvl2,
      itemlvl3: infomation.itemlvl3,
      bankacnt: infomation.bankacnt,
      bankacntuser: infomation.bankacntuser,
      scmyn: infomation.scmyn,
      pariodyn: infomation.pariodyn,
      bnkinfo2: infomation.bnkinfo2,
      bankacnt2: infomation.bankacnt2,
      area: infomation.area,
      remark_s: dataArr.remark_s.join("|"),
      rowstatus: dataArr.rowstatus.join("|"),
      prsnnm_s: dataArr.prsnnm_s.join("|"),
      custprsncd_s: dataArr.custprsncd_s.join("|"),
      dptnm: dataArr.dptnm.join("|"),
      postcd_s: dataArr.postcd_s.join("|"),
      telno: dataArr.telno.join("|"),
      phoneno_s: dataArr.phoneno_s.join("|"),
      email_s: dataArr.email_s.join("|"),
      rtrchk_s: dataArr.rtrchk_s.join("|"),
      attdatnum_s: dataArr.attdatnum_s.join("|"),
      sort_seq_s: dataArr.sort_seq_s.join("|"),
      seq_s: "",
      yyyy_s: "",
      totasset_s: "",
      paid_up_capital_s: "",
      totcapital_s: "",
      salesmoney_s: "",
      operating_profits_s: "",
      current_income_s: "",
      dedt_rati_s: "",
    }));
  };

  const onSaveClick3 = async () => {
    let valid = true;
    const dataItem = subDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    try {
      dataItem.map((item: any) => {
        if (
          item.yyyy.substring(0, 4) < "1997" ||
          item.yyyy.substring(0, 4).length != 4
        ) {
          throw findMessage(messagesData, "BA_A0020W_007");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    if (dataItem.length == 0 && deletedMainRows2.length == 0) return false;
    let dataArr: TdataArr2 = {
      rowstatus: [],
      remark_s: [],
      seq_s: [],
      yyyy_s: [],
      totasset_s: [],
      paid_up_capital_s: [],
      totcaptial_s: [],
      salesmoney_s: [],
      operating_profits_s: [],
      current_income_s: [],
      dedt_rati_s: [],
      totemp_s: [],
      attdatnum_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        remark = "",
        current_income = 0,
        dedt_ratio = 0,
        operating_profits = 0,
        paid_up_capital = 0,
        salesmoney = 0,
        seq = 0,
        totasset = 0,
        totcapital = 0,
        yyyy = "",
      } = item;

      dataArr.rowstatus.push(rowstatus);
      dataArr.remark_s.push(remark);
      dataArr.seq_s.push(seq);
      dataArr.yyyy_s.push(yyyy.substring(0, 4));
      dataArr.totasset_s.push(totasset);
      dataArr.paid_up_capital_s.push(paid_up_capital);
      dataArr.totcaptial_s.push(totcapital);
      dataArr.salesmoney_s.push(salesmoney);
      dataArr.operating_profits_s.push(operating_profits);
      dataArr.current_income_s.push(current_income);
      dataArr.dedt_rati_s.push(dedt_ratio);
      dataArr.totemp_s.push("0");
      dataArr.attdatnum_s.push("");
    });
    deletedMainRows2.forEach(async (item: any, idx: number) => {
      const {
        rowstatus = "",
        remark = "",
        current_income = 0,
        dedt_ratio = 0,
        operating_profits = 0,
        paid_up_capital = 0,
        salesmoney = 0,
        seq = 0,
        totasset = 0,
        totcapital = 0,
        yyyy = "",
      } = item;

      dataArr.rowstatus.push(rowstatus);
      dataArr.remark_s.push(remark);
      dataArr.seq_s.push(seq);
      dataArr.yyyy_s.push(yyyy.substring(0, 4));
      dataArr.totasset_s.push(totasset);
      dataArr.paid_up_capital_s.push(paid_up_capital);
      dataArr.totcaptial_s.push(totcapital);
      dataArr.salesmoney_s.push(salesmoney);
      dataArr.operating_profits_s.push(operating_profits);
      dataArr.current_income_s.push(current_income);
      dataArr.dedt_rati_s.push(dedt_ratio);
      dataArr.totemp_s.push("0");
      dataArr.attdatnum_s.push("");
    });
    const item = Object.getOwnPropertyNames(selectedState)[0];

    setParaData((prev) => ({
      ...prev,
      workType: "MONEY",
      custcd: item.toString(),
      custnm: infomation.custnm,
      custdiv: infomation.custdiv,
      custabbr: infomation.custabbr,
      bizdiv: infomation.bizdiv,
      bizregnum: infomation.bizregnum,
      ceonm: infomation.ceonm,
      repreregno: infomation.repreregno,
      comptype: infomation.comptype,
      compclass: infomation.compclass,
      zipcode: infomation.zipcode,
      address: infomation.address,
      phonenum: infomation.phonenum,
      faxnum: infomation.faxnum,
      estbdt: infomation.estbdt == null ? "" : infomation.estbdt,
      compnm_eng: infomation.compnm_eng,
      address_eng: infomation.address_eng,
      bnkinfo: infomation.bnkinfo,
      etelnum: infomation.etelnum,
      efaxnum: infomation.efaxnum,
      unpitem: infomation.unpitem,
      useyn: infomation.useyn,
      remark: infomation.remark,
      attdatnum: infomation.attdatnum,
      bill_type: infomation.bill_type,
      recvid: infomation.recvid,
      rtxisuyn: infomation.rtxisuyn,
      etxprs: infomation.etxprs,
      emailaddr_og: infomation.emailaddr_og,
      phonenum_og: infomation.phonenum_og,
      etax: infomation.etax,
      inunpitem: infomation.inunpitem,
      email: infomation.email,
      itemlvl1: infomation.itemlvl1,
      itemlvl2: infomation.itemlvl2,
      itemlvl3: infomation.itemlvl3,
      bankacnt: infomation.bankacnt,
      bankacntuser: infomation.bankacntuser,
      scmyn: infomation.scmyn,
      pariodyn: infomation.pariodyn,
      bnkinfo2: infomation.bnkinfo2,
      bankacnt2: infomation.bankacnt2,
      area: infomation.area,
      remark_s: dataArr.remark_s.join("|"),
      rowstatus: dataArr.rowstatus.join("|"),
      prsnnm_s: "",
      custprsncd_s: "",
      dptnm: "",
      postcd_s: "",
      telno: "",
      phoneno_s: "",
      email_s: "",
      rtrchk_s: "",
      attdatnum_s: dataArr.attdatnum_s.join("|"),
      sort_seq_s: "",
      seq_s: dataArr.seq_s.join("|"),
      yyyy_s: dataArr.yyyy_s.join("|"),
      totasset_s: dataArr.totasset_s.join("|"),
      paid_up_capital_s: dataArr.paid_up_capital_s.join("|"),
      totcapital_s: dataArr.totcaptial_s.join("|"),
      salesmoney_s: dataArr.salesmoney_s.join("|"),
      operating_profits_s: dataArr.operating_profits_s.join("|"),
      current_income_s: dataArr.current_income_s.join("|"),
      dedt_rati_s: dataArr.dedt_rati_s.join("|"),
      totemp_s: dataArr.totemp_s.join("|"),
    }));
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      let array: any[] = [];
      array.push(infomation.attdatnum);
      subDataResult.data.map((item) => {
        array.push(item.attdatnum);
      });

      setDeletedAttadatnums(array);
      resetAllGrid();
      const isLastDataDeleted =
        mainDataResult.data.length == 1 && filters.pgNum > 0;

      const findRowIndex = mainDataResult.data.findIndex(
        (row: any) =>
          row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      );

      if (isLastDataDeleted) {
        setPage({
          skip: PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });
      }

      setFilters((prev) => ({
        ...prev,
        find_row_value:
          mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
          undefined
            ? ""
            : mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1][
                DATA_ITEM_KEY
              ],
        pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setParaDataDeleted((prev) => ({
      work_type: "",
      custcd: "",
      attdatnum: "",
    }));
  };

  const onSaveClick2 = async () => {
    fetchSaved();
  };

  const fetchSaved = async () => {
    let data: any;

    let valid = true;
    try {
      if (infomation.custnm == "") {
        throw findMessage(messagesData, "BA_A0020W_001");
      }

      if (infomation.custdiv == "") {
        throw findMessage(messagesData, "BA_A0020W_002");
      }

      if (infomation.bizdiv == "") {
        throw findMessage(messagesData, "BA_A0020W_003");
      }

      if (infomation.inunpitem == "") {
        throw findMessage(messagesData, "BA_A0020W_004");
      }

      if (infomation.unpitem == "") {
        throw findMessage(messagesData, "BA_A0020W_005");
      }

      if (
        infomation.estbdt != null &&
        (convertDateToStr(infomation.estbdt).length != 8 ||
          convertDateToStr(infomation.estbdt).substring(0, 4) >
            convertDateToStr(new Date()).substring(0, 4) ||
          convertDateToStr(infomation.estbdt).substring(0, 4) < "1400")
      ) {
        throw findMessage(messagesData, "BA_A0020W_007");
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    setLoading(true);

    try {
      data = await processApi<any>("procedure", infopara);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      const { returnString } = data;
      setFilters((prev) => ({
        ...prev,
        find_row_value: returnString,
        isSearch: true,
      }));
      setUnsavedAttadatnums([]);
      setUnsavedName([]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.statusCode == "P_BA_A0020_S_001") {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
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
      if (paraData.workType == "CustPerson") {
        const isLastDataDeleted =
          subDataResult.data.length == 0 && subfilters.pgNum > 0;

        let array: any[] = [];
        deletedMainRows.map((item) => {
          array.push(item.attdatnum);
        });
        setDeletedAttadatnums(array);

        if (isLastDataDeleted) {
          setPage2({
            skip:
              subfilters.pgNum == 1 || subfilters.pgNum == 0
                ? 0
                : PAGE_SIZE * (subfilters.pgNum - 2),
            take: PAGE_SIZE,
          });
          setsubFilters((prev: any) => ({
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
          setsubFilters((prev: any) => ({
            ...prev,
            find_row_value: data.returnString,
            pgNum: prev.pgNum,
            isSearch: true,
          }));
        }
        setUnsavedAttadatnums([]);
        setUnsavedName([]);
      } else {
        const isLastDataDeleted =
          subDataResult2.data.length == 0 && subfilters2.pgNum > 1;

        setUnsavedAttadatnums([]);
        setUnsavedName([]);

        if (isLastDataDeleted) {
          setPage3({
            skip:
              subfilters2.pgNum == 1 || subfilters2.pgNum == 0
                ? 0
                : PAGE_SIZE * (subfilters2.pgNum - 2),
            take: PAGE_SIZE,
          });
          setsubFilters((prev: any) => ({
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
          setsubFilters2((prev: any) => ({
            ...prev,
            find_row_value: data.returnString,
            pgNum: prev.pgNum,
            isSearch: true,
          }));
        }
      }
      setParaData({
        workType: "CustPerson",
        orgdiv: sessionOrgdiv,
        custcd: "",
        custnm: "",
        custdiv: "",
        custabbr: "",
        bizdiv: "",
        bizregnum: "",
        ceonm: "",
        repreregno: "",
        comptype: "",
        compclass: "",
        zipcode: 0,
        address: "",
        phonenum: "",
        faxnum: "",
        estbdt: "",
        compnm_eng: "",
        address_eng: "",
        bnkinfo: "",
        etelnum: "",
        efaxnum: "",
        unpitem: "",
        useyn: "",
        remark: "",
        attdatnum: "",
        bill_type: "",
        recvid: "",
        rtxisuyn: "",
        etxprs: "",
        emailaddr_og: "",
        phonenum_og: "",
        etax: "",
        inunpitem: "",
        email: "",
        itemlvl1: "",
        itemlvl2: "",
        itemlvl3: "",
        bankacnt: "",
        bankacntuser: "",
        scmyn: "",
        pariodyn: "",
        bnkinfo2: "",
        bankacnt2: "",
        area: "",
        rowstatus: "",
        remark_s: "",
        custprsncd_s: "",
        prsnnm_s: "",
        dptnm: "",
        postcd_s: "",
        telno: "",
        phoneno_s: "",
        email_s: "",
        rtrchk_s: "",
        attdatnum_s: "",
        sort_seq_s: "",
        seq_s: "",
        yyyy_s: "",
        totasset_s: "",
        paid_up_capital_s: "",
        totcapital_s: "",
        salesmoney_s: "",
        operating_profits_s: "",
        current_income_s: "",
        dedt_rati_s: "",
        totemp_s: "",
        user_id: userId,
        pc: pc,
        form_id: "BA_A0020W",
        company_code: companyCode,
        auto: "Y",
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

  useEffect(() => {
    if (paraData.custcd != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const CheckChange = (event: CheckboxChangeEvent) => {
    setyn(event.value);
    let value = event.value == true ? "Y" : "N";
    if (value == "Y") {
      setInfomation((prev) => ({
        ...prev,
        auto: value,
        custcd: "자동생성",
      }));
    } else {
      setInfomation((prev) => ({
        ...prev,
        auto: value,
        custcd: "",
      }));
    }
  };

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
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setyn(true);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setsubFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
    setsubFilters2((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setsubFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage2({
      ...event.page,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setsubFilters2((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage3({
      ...event.page,
    });
  };

  const [attdatnum, setAttdatnum] = useState<string>("");
  const [files, setFiles] = useState<string>("");

  useEffect(() => {
    const datas = subDataResult.data.filter(
      (item) =>
        item[SUB_DATA_ITEM_KEY] ==
        Object.getOwnPropertyNames(selectedsubDataState)[0]
    )[0];
    if (datas != undefined) {
      if (datas.attdatnum == "") {
        setUnsavedAttadatnums((prev) => [...prev, attdatnum]);
      }
    }

    const newData = subDataResult.data.map((item) =>
      item[SUB_DATA_ITEM_KEY] ==
      parseInt(Object.getOwnPropertyNames(selectedsubDataState)[0])
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

    setSubDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [attdatnum, files]);

  // 지도
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [newMainDataResult, setNewMainDataResult] = useState<any>(null);

  // 주소값을 위도, 경도값으로 바꾸는 api

  const convertAddressToLatLng = async () => {
    setLoading(true);
    const apiKey = "2ff229205b565c4bb29089b6569c6ee8"; // 여기에 실제 API 키를 입력하세요.
    const newResults = await mainDataResult.data.reduce(
      async (accPromise, item) => {
        const acc = await accPromise;

        if (!item.address || item.address.trim() == "") {
          // 주소가 비어있는 경우, 변환 없이 현재 아이템을 결과에 추가하지 않음
          return acc;
        }

        const address = item.address.trim();
        const response = await fetch(
          `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
            address
          )}`,
          {
            headers: {
              Authorization: `KakaoAK ${apiKey}`,
            },
          }
        );
        const json = await response.json();

        if (json.documents && json.documents.length > 0) {
          const { x, y } = json.documents[0];
          acc.push({ ...item, lat: y, lng: x }); // 변환 성공한 경우만 결과 배열에 추가
        }
        // 변환 실패한 경우는 결과 배열에 추가하지 않음
        return acc;
      },
      Promise.resolve([])
    );

    setNewMainDataResult({ data: newResults });
    setLoading(false);
  };
  // 카카오 지도 스크립트 로드 함수
  const loadKakaoMapScript = () => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=aea9b34baa4e0c15204135788fc582b1&autoload=false&libraries=clusterer`;
    document.head.appendChild(script);

    script.onload = () => {
      setMapLoaded(true); // 스크립트 로드 완료 상태 설정
    };
  };

  // 폴리곤의 중심점을 계산하는 함수
  function calculatePolygonCenter(coordinates: any) {
    let lat = 0;
    let lng = 0;
    //@ts-ignore
    coordinates.forEach((coordinate) => {
      lat += coordinate.getLat();
      lng += coordinate.getLng();
    });
    lat /= coordinates.length;
    lng /= coordinates.length;
    return new window.kakao.maps.LatLng(lat, lng);
  }

  const initializeMap = (): void => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        const container = document.getElementById("map");
        if (!container) return;

        const options = {
          center: new window.kakao.maps.LatLng(36.4683, 127.9358),
          level: 12,
        };

        const map = new window.kakao.maps.Map(container, options);
        let detailMode: boolean = false;

        const markers = addMarkers(map);

        // 클러스터러 생성 및 마커 추가
        const clusterer = new window.kakao.maps.MarkerClusterer({
          map: map,
          averageCenter: true,
          minLevel: 10,
        });
        clusterer.addMarkers(markers);
        // 폴리곤을 저장할 배열을 선언합니다.
        let allPolygons: any[] = [];
        let allOverlays: any[] = [];

        const addPolygons = (map: any, data: FeatureCollection): void => {
          // 기존에 표시된 모든 폴리곤을 제거
          allPolygons.forEach((polygon) => polygon.setMap(null));
          allPolygons = [];

          // 기존에 표시된 모든 오버레이를 제거
          allOverlays.forEach((overlay) => overlay.setMap(null));
          allOverlays = [];

          const polygons = data.features.map((feature) => {
            const coordinates = feature.geometry.coordinates[0].map(
              (coordinate: number[]) =>
                new window.kakao.maps.LatLng(coordinate[1], coordinate[0])
            );
            const polygon = new window.kakao.maps.Polygon({
              map: map,
              path: coordinates,
              strokeWeight: 2,
              strokeColor: "#004c80",
              strokeOpacity: 0.8,
              fillColor: "#fff",
              fillOpacity: 0.7,
            });

            // 이벤트 리스너들을  추가합니다.
            addEventListeners(polygon, feature, map);

            // 폴리곤의 중심점을 계산합니다.
            const center = calculatePolygonCenter(coordinates);

            // 폴리곤 생성 시 CustomOverlay도 함께 생성하고 지도에 표시합니다.
            const customOverlay = new window.kakao.maps.CustomOverlay({
              content: `<div style="padding:5px; font-weight:700">${feature.properties.SIG_KOR_NM}</div>`,
              position: center,
              zIndex: 3,
            });
            customOverlay.setMap(map);

            allOverlays.push(customOverlay);

            return polygon;
          });
          allPolygons = allPolygons.concat(polygons);
        };

        // 이벤트 리스너를 추가하는 함수
        const addEventListeners = (
          polygon: any,
          feature: Feature,
          map: any
        ) => {
          const customOverlay = new window.kakao.maps.CustomOverlay({
            position: polygon.getPath()[0],
            zIndex: 3,
          });

          window.kakao.maps.event.addListener(polygon, "mouseover", () => {
            polygon.setOptions({ fillColor: "#09f" });
            customOverlay.setMap(map);
          });

          window.kakao.maps.event.addListener(polygon, "mouseout", () => {
            polygon.setOptions({ fillColor: "#fff" });
            customOverlay.setMap(null);
          });

          window.kakao.maps.event.addListener(
            polygon,
            "click",
            (mouseEvent: any) => {
              map.setLevel(10, { animate: { duration: 300 } });
              map.panTo(mouseEvent.latLng);
            }
          );
        };

        // 지도 레벨 변경 시 폴리곤 로드
        window.kakao.maps.event.addListener(map, "zoom_changed", () => {
          const level = map.getLevel();

          // 기존 폴리곤 제거
          allPolygons.forEach((polygon) => polygon.setMap(null));
          allPolygons = [];
          allOverlays.forEach((overlay) => overlay.setMap(null));
          allOverlays = [];

          if (level < 10) {
            allPolygons.forEach((polygon) => polygon.setMap(null));
            allPolygons = [];
            detailMode = false;
          } else if (level == 10) {
            addPolygons(map, sigData as unknown as FeatureCollection);
            detailMode = true;
          } else {
            addPolygons(map, sidoData as unknown as FeatureCollection);
            detailMode = false;
          }
        });

        addPolygons(map, sidoData as unknown as FeatureCollection); // 초기 폴리곤 로드
      });
    }
  };

  useEffect(() => {
    convertAddressToLatLng();
  }, [mainDataResult]);

  // showMap 상태가 변경될 때마다 처리
  useEffect(() => {
    if (showMap && !mapLoaded) {
      loadKakaoMapScript(); // 지도 스크립트 로드
    }
    if (showMap && mapLoaded) {
      initializeMap();
    }
  }, [showMap, mapLoaded, newMainDataResult]);

  const addMarkers = (map: any) => {
    const markers: any = [];
    if (newMainDataResult) {
      newMainDataResult.data.forEach((item: any) => {
        const imageSrc =
            "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png", // 마커이미지의 주소입니다
          imageSize = new window.kakao.maps.Size(34, 37); // 마커이미지의 크기입니다
        // imageOption = {offset: new window.kakao.maps.Point(27, 69)};

        const markerImage = new window.kakao.maps.MarkerImage(
          imageSrc,
          imageSize
        );
        const marker = new window.kakao.maps.Marker({
          map: map,
          position: new window.kakao.maps.LatLng(item.lat, item.lng),
          image: markerImage,
        });

        // 마커 위에 회사이름 나타내기
        var infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style=" width:150px; text-align:center; padding:6px 10px; font-size:14px; font-weight:700;">${item.custnm}</div>`,
        });
        // 지도의 레벨이 변했을 때의 이벤트 리스너를 등록합니다.
        window.kakao.maps.event.addListener(map, "zoom_changed", function () {
          // 현재 지도의 레벨을 얻어옵니다
          var level = map.getLevel();
          var currentCenter = map.getCenter();

          if (level <= 9) {
            infowindow.open(map, marker);
            map.setCenter(currentCenter);
          } else {
            infowindow.close();
          }
        });
        window.kakao.maps.event.trigger(map, "zoom_changed");
        // 마커 클릭 이벤트 리스너
        window.kakao.maps.event.addListener(marker, "click", () => {
          if (swiper && isMobile) {
            swiper.slideTo(1);
          }

          // 선택된 행의 키 저장
          setSelectedState({ [item[DATA_ITEM_KEY]]: true });

          // 마커에 해당하는 그리드 행의 상세 정보를 설정
          setInfomation({
            workType: "U",
            custcd: item.custcd,
            custnm: item.custnm,
            custdiv:
              custdivListData.find(
                (items: any) => items.code_name == item.custdiv
              )?.sub_code == undefined
                ? item.custdiv
                : custdivListData.find(
                    (items: any) => items.code_name == item.custdiv
                  )?.sub_code,
            custabbr: item.custabbr,
            compnm_eng: item.compnm_eng,
            inunpitem: item.inunpitem,
            bizregnum: item.bizregnum,
            zipcode: item.zipcode,
            area: item.area,
            unpitem: item.unpitem,
            ceonm: item.ceonm,
            address: item.address,
            bizdiv:
              bizdivListData.find(
                (items: any) => items.code_name == item.bizdiv
              )?.sub_code == undefined
                ? item.bizdiv
                : bizdivListData.find(
                    (items: any) => items.code_name == item.bizdiv
                  )?.sub_code,
            repreregno: item.repreregno,
            address_eng: item.address_eng,
            estbdt: isValidDate(item.estbdt)
              ? new Date(dateformat(item.estbdt))
              : null,
            phonenum: item.phonenum,
            bnkinfo: item.bnkinfo,
            bankacntuser: item.bankacntuser,
            compclass: item.compclass,
            etelnum: item.etelnum,
            bankacnt: item.bankacnt,
            comptype: item.comptype,
            faxnum: item.faxnum,
            bnkinfo2: item.bnkinfo2,
            bankacnt2: item.bankacnt2,
            taxorg: item.taxorg,
            efaxnum: item.efaxnum,
            email: item.email,
            taxortnm: item.taxortnm,
            useyn: item.useyn == "Y" ? "Y" : "N",
            scmyn: item.scmyn == "Y" ? "Y" : "N",
            pariodyn: item.pariodyn == "Y" ? "Y" : "N",
            attdatnum: item.attdatnum,
            itemlvl1: item.itemlvl1,
            itemlvl2: item.itemlvl2,
            itemlvl3: item.itemlvl3,
            etax: item.etax,
            remark: item.remark,
            etxprs: item.etxprs,
            phonenum_og: item.phonenum_og,
            emailaddr_og: item.emailaddr_og,
            bill_type: item.bill_type,
            recvid: item.recvid,
            rtxisuyn: item.rtxisuyn,
            files: item.files,
            auto: item.auto,
          });
          setsubFilters((prev) => ({
            ...prev,
            workType: "CustPerson",
            useyn: item.useyn,
            custcd: item.custcd,
            custnm: item.custnm,
            custdiv: item.custdiv,
            bizregnum: item.bizregnum,
            ceonm: item.ceonm,
            isSearch: true,
            pgNum: 1,
            find_row_value: "",
          }));

          setsubFilters2((prev) => ({
            ...prev,
            workType: "MONEY",
            useyn: item.useyn,
            custcd: item.custcd,
            custnm: item.custnm,
            custdiv: item.custdiv,
            bizregnum: item.bizregnum,
            ceonm: item.ceonm,
            isSearch: true,
            pgNum: 1,
            find_row_value: "",
          }));
          setTabSelected(0);
        });
        markers.push(marker);
      });
    }
    return markers;
  };

  return (
    <>
      <TitleContainer>
        <Title>업체관리</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="BA_A0020W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>업체코드</th>
              <td>
                <Input
                  name="custcd"
                  type="text"
                  value={filters.custcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onCustWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>업체명</th>
              <td>
                <Input
                  name="custnm"
                  type="text"
                  value={filters.custnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>업체구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="custdiv"
                    value={filters.custdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>사용여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="raduseyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>대표자명</th>
              <td>
                <Input
                  name="ceonm"
                  type="text"
                  value={filters.ceonm}
                  onChange={filterInputChange}
                />
              </td>
              <th>사업자등록번호</th>
              <td>
                <Input
                  name="bizregnum"
                  type="text"
                  value={filters.bizregnum}
                  onChange={filterInputChange}
                />
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
              <GridContainer
                style={{ width: `${deviceWidth - 30}px`, overflow: "auto" }}
              >
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>요약정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={() => setShowMap(!showMap)}
                      style={{ marginBottom: "5px" }}
                    >
                      {showMap ? "테이블 보기" : "지도로 보기"}
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="업체관리"
                >
                  {showMap ? (
                    <div
                      style={{
                        height: deviceHeight - height,
                        marginTop: "5px",
                        width: `${deviceWidth - 30}px`,
                      }}
                      id="map"
                    ></div>
                  ) : (
                    <Grid
                      style={{
                        height: deviceHeight - height,
                        width: `${deviceWidth - 30}px`,
                      }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          custdiv: custdivListData.find(
                            (item: any) => item.sub_code == row.custdiv
                          )?.code_name,
                          bizdiv: bizdivListData.find(
                            (item: any) => item.sub_code == row.bizdiv
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
                                  checkboxField.includes(item.fieldName)
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
                  )}
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide
              key={1}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle></GridTitle>
                <ButtonContainer style={{ justifyContent: "space-between" }}>
                  <Button
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(0);
                      }
                    }}
                    icon="arrow-left"
                  >
                    이전
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <TabStrip
                selected={tabSelected}
                onSelect={handleSelectTab}
                style={{ width: "100%" }}
              >
                <TabStripTab title="상세정보">
                  <GridTitleContainer className="ButtonContainer3">
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
                  <FormBoxWrap
                    style={{
                      height: deviceHeight - height2 - height3 - height6,
                      width: "100%",
                      overflow: "scroll",
                    }}
                  >
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>업체코드</th>
                          {infomation.custcd != "자동생성" && yn == true ? (
                            <>
                              <td>
                                <Input
                                  name="custcd"
                                  type="text"
                                  value={infomation.custcd}
                                  className="readonly"
                                />
                              </td>
                            </>
                          ) : (
                            <>
                              <td>
                                {yn == true ? (
                                  <div className="filter-item-wrap">
                                    <Input
                                      name="custcd"
                                      type="text"
                                      value={"자동생성"}
                                      className="readonly"
                                      style={{ width: "100%" }}
                                    />
                                    <ButtonInInput>
                                      <Checkbox
                                        defaultChecked={true}
                                        value={yn}
                                        onChange={CheckChange}
                                        style={{
                                          marginTop: "7px",
                                          marginRight: "5px",
                                        }}
                                      />
                                    </ButtonInInput>
                                  </div>
                                ) : (
                                  <div className="filter-item-wrap">
                                    <Input
                                      name="custcd"
                                      type="text"
                                      value={infomation.custcd}
                                      onChange={InputChange}
                                    />
                                    <ButtonInInput>
                                      <Checkbox
                                        defaultChecked={true}
                                        value={yn}
                                        onChange={CheckChange}
                                        style={{
                                          marginTop: "7px",
                                          marginRight: "5px",
                                        }}
                                      />
                                    </ButtonInInput>
                                  </div>
                                )}
                              </td>
                            </>
                          )}
                          <th>업체명</th>
                          <td colSpan={3}>
                            <Input
                              name="custnm"
                              type="text"
                              value={infomation.custnm}
                              onChange={InputChange}
                              className="required"
                            />
                          </td>
                          <th>업체구분</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="custdiv"
                                value={infomation.custdiv}
                                bizComponentId="L_BA026"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                                textField="code_name"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>업체약어</th>
                          <td>
                            <Input
                              name="custabbr"
                              type="text"
                              value={infomation.custabbr}
                              onChange={InputChange}
                            />
                          </td>
                          <th>영문회사명</th>
                          <td colSpan={3}>
                            <Input
                              name="compnm_eng"
                              type="text"
                              value={infomation.compnm_eng}
                              onChange={InputChange}
                            />
                          </td>
                          <th>매입단가항목</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="inunpitem"
                                value={infomation.inunpitem}
                                bizComponentId="L_BA008"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>사업자등록번호</th>
                          <td>
                            <Input
                              name="bizregnum"
                              value={infomation.bizregnum}
                              onChange={InputChange}
                            />
                          </td>
                          <th>우편번호</th>
                          <td>
                            <Input
                              name="zipcode"
                              type="number"
                              value={infomation.zipcode}
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
                          <th>지역</th>
                          <td>
                            <Input
                              name="area"
                              value={infomation.area}
                              onChange={InputChange}
                            />
                          </td>
                          <th>매출단가항목</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="unpitem"
                                value={infomation.unpitem}
                                bizComponentId="L_BA008"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>대표자명</th>
                          <td>
                            <Input
                              name="ceonm"
                              type="text"
                              value={infomation.ceonm}
                              onChange={InputChange}
                            />
                          </td>
                          <th>주소</th>
                          <td colSpan={3}>
                            <Input
                              name="address"
                              type="text"
                              value={infomation.address}
                              onChange={InputChange}
                            />
                          </td>
                          <th>사업자구분</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="bizdiv"
                                value={infomation.bizdiv}
                                bizComponentId="L_BA027"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                                textField="code_name"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>주민등록번호</th>
                          <td>
                            <Input
                              name="repreregno"
                              value={infomation.repreregno}
                              onChange={InputChange}
                            />
                          </td>
                          <th>영문주소</th>
                          <td colSpan={3}>
                            <Input
                              name="address_eng"
                              type="text"
                              value={infomation.address_eng}
                              onChange={InputChange}
                            />
                          </td>
                          <th>개업년월일</th>
                          <td>
                            <DatePicker
                              name="estbdt"
                              value={infomation.estbdt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>전화번호</th>
                          <td>
                            <Input
                              name="phonenum"
                              type="text"
                              value={infomation.phonenum}
                              onChange={InputChange}
                            />
                          </td>
                          <th>은행정보</th>
                          <td>
                            <Input
                              name="bnkinfo"
                              type="text"
                              value={infomation.bnkinfo}
                              onChange={InputChange}
                            />
                          </td>
                          <th>예금주</th>
                          <td>
                            <Input
                              name="bankacntuser"
                              type="text"
                              value={infomation.bankacntuser}
                              onChange={InputChange}
                            />
                          </td>
                          <th>업태</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="compclass"
                                value={infomation.compclass}
                                bizComponentId="L_BA025"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>전자전화번호</th>
                          <td>
                            <Input
                              name="etelnum"
                              type="text"
                              value={infomation.etelnum}
                              onChange={InputChange}
                            />
                          </td>
                          <th>계좌번호</th>
                          <td colSpan={3}>
                            <Input
                              name="bankacnt"
                              type="text"
                              value={infomation.bankacnt}
                              onChange={InputChange}
                            />
                          </td>
                          <th>업종</th>
                          <td>
                            <Input
                              name="comptype"
                              type="text"
                              value={infomation.comptype}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>팩스번호</th>
                          <td>
                            <Input
                              name="faxnum"
                              type="text"
                              value={infomation.faxnum}
                              onChange={InputChange}
                            />
                          </td>
                          <th>은행정보2</th>
                          <td>
                            <Input
                              name="bnkinfo2"
                              type="text"
                              value={infomation.bnkinfo2}
                              onChange={InputChange}
                            />
                          </td>
                          <th>계좌번호2</th>
                          <td>
                            <Input
                              name="bankacnt2"
                              type="text"
                              value={infomation.bankacnt2}
                              onChange={InputChange}
                            />
                          </td>
                          <th>신고세무소</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="taxorg"
                                value={infomation.taxorg}
                                bizComponentId="L_BA049"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>전자팩스번호</th>
                          <td>
                            <Input
                              name="efaxnum"
                              type="text"
                              value={infomation.efaxnum}
                              onChange={InputChange}
                            />
                          </td>
                          <th>이메일</th>
                          <td colSpan={3}>
                            <Input
                              name="email"
                              type="text"
                              value={infomation.email}
                              onChange={InputChange}
                            />
                          </td>
                          <th>신고세무소명</th>
                          <td>
                            <Input
                              name="taxortnm"
                              type="text"
                              value={infomation.taxortnm}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>사용여부</th>
                          <td>
                            <Checkbox
                              name="useyn"
                              value={infomation.useyn == "Y" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <th>SCM사용여부</th>
                          <td>
                            <Checkbox
                              name="scmyn"
                              value={infomation.scmyn == "Y" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <th>역발행여부</th>
                          <td>
                            <Checkbox
                              name="rtxisuyn"
                              value={infomation.rtxisuyn == "Y" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <th>정기/비정기여부</th>
                          <td>
                            <Checkbox
                              name="pariodyn"
                              value={infomation.pariodyn == "Y" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>TAX구분</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="etax"
                                value={infomation.etax}
                                bizComponentId="L_AC401"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th>대분류</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="itemlvl1"
                                value={infomation.itemlvl1}
                                bizComponentId="L_BA171"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th>중분류</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="itemlvl2"
                                value={infomation.itemlvl2}
                                bizComponentId="L_BA172"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th>소분류</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="itemlvl3"
                                value={infomation.itemlvl3}
                                bizComponentId="L_BA173"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>etax담당자</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="etxprs"
                                value={infomation.etxprs}
                                bizComponentId="L_sysUserMaster_001"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                textField="user_name"
                                valueField="user_id"
                              />
                            )}
                          </td>
                          <th>etax이메일</th>
                          <td colSpan={3}>
                            <Input
                              name="emailaddr_og"
                              type="text"
                              value={infomation.emailaddr_og}
                              onChange={InputChange}
                            />
                          </td>
                          <th>etax전화번호</th>
                          <td>
                            <Input
                              name="phonenum_og"
                              type="text"
                              value={infomation.phonenum_og}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>센드빌회원여부</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="bill_type"
                                value={infomation.bill_type}
                                bizComponentId="L_AC901"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th>첨부파일</th>
                          <td colSpan={5}>
                            <Input
                              name="files"
                              type="text"
                              value={infomation.files}
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
                          <td colSpan={7}>
                            <TextArea
                              value={infomation.remark}
                              name="remark"
                              rows={3}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </TabStripTab>
                <TabStripTab
                  title="업체담당자"
                  disabled={infomation.work_type == "N" ? true : false}
                >
                  <FormContext.Provider
                    value={{
                      attdatnum,
                      files,
                      setAttdatnum,
                      setFiles,
                      subDataState,
                      setSubDataState,
                      // fetchGrid,
                    }}
                  >
                    <GridContainer>
                      <GridTitleContainer className="ButtonContainer4">
                        <GridTitle>업체담당자</GridTitle>
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
                        data={subDataResult.data}
                        ref={(exporter) => {
                          _export2 = exporter;
                        }}
                        fileName="업체관리"
                      >
                        <Grid
                          style={{
                            height: deviceHeight - height2 - height4 - height6,
                          }}
                          data={process(
                            subDataResult.data.map((row) => ({
                              ...row,
                              rowstatus:
                                row.rowstatus == null ||
                                row.rowstatus == "" ||
                                row.rowstatus == undefined
                                  ? ""
                                  : row.rowstatus,
                              [SELECTED_FIELD]:
                                selectedsubDataState[idGetter2(row)],
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
                          <GridColumn
                            field="rowstatus"
                            title=" "
                            width="50px"
                          />
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions[
                              "grdList2"
                            ].map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <GridColumn
                                    key={idx}
                                    id={item.id}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    className={
                                      requiredField.includes(item.fieldName)
                                        ? "required"
                                        : undefined
                                    }
                                    headerCell={
                                      requiredField.includes(item.fieldName)
                                        ? RequiredHeader
                                        : undefined
                                    }
                                    cell={
                                      NumberField.includes(item.fieldName)
                                        ? NumberCell
                                        : checkboxField.includes(item.fieldName)
                                        ? CheckBoxCell
                                        : commandField.includes(item.fieldName)
                                        ? ColumnCommandCell //추후 작업
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? subTotalFooterCell
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
                <TabStripTab
                  title="재무현황"
                  disabled={infomation.work_type == "N" ? true : false}
                >
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer5">
                      <GridTitle>재무현황</GridTitle>
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
                      data={subDataResult2.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="업체관리"
                    >
                      <Grid
                        style={{
                          height: deviceHeight - height2 - height5 - height6,
                        }}
                        data={process(
                          subDataResult2.data.map((row) => ({
                            ...row,
                            rowstatus:
                              row.rowstatus == null ||
                              row.rowstatus == "" ||
                              row.rowstatus == undefined
                                ? ""
                                : row.rowstatus,
                            yyyy: row.yyyy
                              ? new Date(dateformat(row.yyyy))
                              : new Date(dateformat("19000101")),
                            [SELECTED_FIELD]:
                              selectedsubDataState2[idGetter3(row)],
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
                        onItemChange={onSubItemChange2}
                        cellRender={customCellRender2}
                        rowRender={customRowRender2}
                        editField={EDIT_FIELD}
                      >
                        <GridColumn field="rowstatus" title=" " width="50px" />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions[
                            "grdList3"
                          ].map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={idx}
                                  id={item.id}
                                  field={item.fieldName}
                                  title={item.caption}
                                  width={item.width}
                                  className={
                                    requiredField.includes(item.fieldName)
                                      ? "required"
                                      : undefined
                                  }
                                  headerCell={
                                    requiredField.includes(item.fieldName)
                                      ? RequiredHeader
                                      : undefined
                                  }
                                  cell={
                                    YearDateField.includes(item.fieldName)
                                      ? YearDateCell
                                      : NumberField.includes(item.fieldName)
                                      ? NumberCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? subTotalFooterCell2
                                      : NumberField.includes(item.fieldName)
                                      ? editNumberFooterCell
                                      : undefined
                                  }
                                />
                              )
                          )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </TabStripTab>
              </TabStrip>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width={`30%`}>
              <GridTitleContainer>
                <GridTitle>요약정보</GridTitle>
                <Button
                  onClick={() => setShowMap(!showMap)}
                  style={{ marginBottom: "5px" }}
                >
                  {showMap ? "테이블 보기" : "지도로 보기"}
                </Button>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="업체관리"
              >
                {showMap ? (
                  <div
                    style={{ height: "76vh", marginTop: "5px" }}
                    id="map"
                  ></div>
                ) : (
                  <Grid
                    style={{ height: "76vh" }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        custdiv: custdivListData.find(
                          (item: any) => item.sub_code == row.custdiv
                        )?.code_name,
                        bizdiv: bizdivListData.find(
                          (item: any) => item.sub_code == row.bizdiv
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
                                checkboxField.includes(item.fieldName)
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
                )}
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(70% - ${GAP}px)`}>
              <TabStrip
                selected={tabSelected}
                onSelect={handleSelectTab}
                style={{ width: "100%" }}
              >
                <TabStripTab title="상세정보">
                  <GridTitleContainer>
                    <GridTitle>상세정보</GridTitle>
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
                  <FormBoxWrap style={{ height: "67.5vh" }}>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>업체코드</th>
                          {infomation.custcd != "자동생성" && yn == true ? (
                            <>
                              <td>
                                <Input
                                  name="custcd"
                                  type="text"
                                  value={infomation.custcd}
                                  className="readonly"
                                />
                              </td>
                            </>
                          ) : (
                            <>
                              <td>
                                {yn == true ? (
                                  <div className="filter-item-wrap">
                                    <Input
                                      name="custcd"
                                      type="text"
                                      value={"자동생성"}
                                      className="readonly"
                                      style={{ width: "100%" }}
                                    />
                                    <ButtonInInput>
                                      <Checkbox
                                        defaultChecked={true}
                                        value={yn}
                                        onChange={CheckChange}
                                        style={{
                                          marginTop: "7px",
                                          marginRight: "5px",
                                        }}
                                      />
                                    </ButtonInInput>
                                  </div>
                                ) : (
                                  <div className="filter-item-wrap">
                                    <Input
                                      name="custcd"
                                      type="text"
                                      value={infomation.custcd}
                                      onChange={InputChange}
                                    />
                                    <ButtonInInput>
                                      <Checkbox
                                        defaultChecked={true}
                                        value={yn}
                                        onChange={CheckChange}
                                        style={{
                                          marginTop: "7px",
                                          marginRight: "5px",
                                        }}
                                      />
                                    </ButtonInInput>
                                  </div>
                                )}
                              </td>
                            </>
                          )}
                          <th>업체명</th>
                          <td colSpan={3}>
                            <Input
                              name="custnm"
                              type="text"
                              value={infomation.custnm}
                              onChange={InputChange}
                              className="required"
                            />
                          </td>
                          <th>업체구분</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="custdiv"
                                value={infomation.custdiv}
                                bizComponentId="L_BA026"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                                textField="code_name"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>업체약어</th>
                          <td>
                            <Input
                              name="custabbr"
                              type="text"
                              value={infomation.custabbr}
                              onChange={InputChange}
                            />
                          </td>
                          <th>영문회사명</th>
                          <td colSpan={3}>
                            <Input
                              name="compnm_eng"
                              type="text"
                              value={infomation.compnm_eng}
                              onChange={InputChange}
                            />
                          </td>
                          <th>매입단가항목</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="inunpitem"
                                value={infomation.inunpitem}
                                bizComponentId="L_BA008"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>사업자등록번호</th>
                          <td>
                            <Input
                              name="bizregnum"
                              value={infomation.bizregnum}
                              onChange={InputChange}
                            />
                          </td>
                          <th>우편번호</th>
                          <td>
                            <Input
                              name="zipcode"
                              type="number"
                              value={infomation.zipcode}
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
                          <th>지역</th>
                          <td>
                            <Input
                              name="area"
                              value={infomation.area}
                              onChange={InputChange}
                            />
                          </td>
                          <th>매출단가항목</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="unpitem"
                                value={infomation.unpitem}
                                bizComponentId="L_BA008"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>대표자명</th>
                          <td>
                            <Input
                              name="ceonm"
                              type="text"
                              value={infomation.ceonm}
                              onChange={InputChange}
                            />
                          </td>
                          <th>주소</th>
                          <td colSpan={3}>
                            <Input
                              name="address"
                              type="text"
                              value={infomation.address}
                              onChange={InputChange}
                            />
                          </td>
                          <th>사업자구분</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="bizdiv"
                                value={infomation.bizdiv}
                                bizComponentId="L_BA027"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                                textField="code_name"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>주민등록번호</th>
                          <td>
                            <Input
                              name="repreregno"
                              value={infomation.repreregno}
                              onChange={InputChange}
                            />
                          </td>
                          <th>영문주소</th>
                          <td colSpan={3}>
                            <Input
                              name="address_eng"
                              type="text"
                              value={infomation.address_eng}
                              onChange={InputChange}
                            />
                          </td>
                          <th>개업년월일</th>
                          <td>
                            <DatePicker
                              name="estbdt"
                              value={infomation.estbdt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>전화번호</th>
                          <td>
                            <Input
                              name="phonenum"
                              type="text"
                              value={infomation.phonenum}
                              onChange={InputChange}
                            />
                          </td>
                          <th>은행정보</th>
                          <td>
                            <Input
                              name="bnkinfo"
                              type="text"
                              value={infomation.bnkinfo}
                              onChange={InputChange}
                            />
                          </td>
                          <th>예금주</th>
                          <td>
                            <Input
                              name="bankacntuser"
                              type="text"
                              value={infomation.bankacntuser}
                              onChange={InputChange}
                            />
                          </td>
                          <th>업태</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="compclass"
                                value={infomation.compclass}
                                bizComponentId="L_BA025"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>전자전화번호</th>
                          <td>
                            <Input
                              name="etelnum"
                              type="text"
                              value={infomation.etelnum}
                              onChange={InputChange}
                            />
                          </td>
                          <th>계좌번호</th>
                          <td colSpan={3}>
                            <Input
                              name="bankacnt"
                              type="text"
                              value={infomation.bankacnt}
                              onChange={InputChange}
                            />
                          </td>
                          <th>업종</th>
                          <td>
                            <Input
                              name="comptype"
                              type="text"
                              value={infomation.comptype}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>팩스번호</th>
                          <td>
                            <Input
                              name="faxnum"
                              type="text"
                              value={infomation.faxnum}
                              onChange={InputChange}
                            />
                          </td>
                          <th>은행정보2</th>
                          <td>
                            <Input
                              name="bnkinfo2"
                              type="text"
                              value={infomation.bnkinfo2}
                              onChange={InputChange}
                            />
                          </td>
                          <th>계좌번호2</th>
                          <td>
                            <Input
                              name="bankacnt2"
                              type="text"
                              value={infomation.bankacnt2}
                              onChange={InputChange}
                            />
                          </td>
                          <th>신고세무소</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="taxorg"
                                value={infomation.taxorg}
                                bizComponentId="L_BA049"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>전자팩스번호</th>
                          <td>
                            <Input
                              name="efaxnum"
                              type="text"
                              value={infomation.efaxnum}
                              onChange={InputChange}
                            />
                          </td>
                          <th>이메일</th>
                          <td colSpan={3}>
                            <Input
                              name="email"
                              type="text"
                              value={infomation.email}
                              onChange={InputChange}
                            />
                          </td>
                          <th>신고세무소명</th>
                          <td>
                            <Input
                              name="taxortnm"
                              type="text"
                              value={infomation.taxortnm}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>사용여부</th>
                          <td>
                            <Checkbox
                              name="useyn"
                              value={infomation.useyn == "Y" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <th>SCM사용여부</th>
                          <td>
                            <Checkbox
                              name="scmyn"
                              value={infomation.scmyn == "Y" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <th>역발행여부</th>
                          <td>
                            <Checkbox
                              name="rtxisuyn"
                              value={infomation.rtxisuyn == "Y" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                          <th>정기/비정기여부</th>
                          <td>
                            <Checkbox
                              name="pariodyn"
                              value={infomation.pariodyn == "Y" ? true : false}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>TAX구분</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="etax"
                                value={infomation.etax}
                                bizComponentId="L_AC401"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th>대분류</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="itemlvl1"
                                value={infomation.itemlvl1}
                                bizComponentId="L_BA171"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th>중분류</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="itemlvl2"
                                value={infomation.itemlvl2}
                                bizComponentId="L_BA172"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th>소분류</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="itemlvl3"
                                value={infomation.itemlvl3}
                                bizComponentId="L_BA173"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>etax담당자</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="etxprs"
                                value={infomation.etxprs}
                                bizComponentId="L_sysUserMaster_001"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                textField="user_name"
                                valueField="user_id"
                              />
                            )}
                          </td>
                          <th>etax이메일</th>
                          <td colSpan={3}>
                            <Input
                              name="emailaddr_og"
                              type="text"
                              value={infomation.emailaddr_og}
                              onChange={InputChange}
                            />
                          </td>
                          <th>etax전화번호</th>
                          <td>
                            <Input
                              name="phonenum_og"
                              type="text"
                              value={infomation.phonenum_og}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>센드빌회원여부</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="bill_type"
                                value={infomation.bill_type}
                                bizComponentId="L_AC901"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th>첨부파일</th>
                          <td colSpan={5}>
                            <Input
                              name="files"
                              type="text"
                              value={infomation.files}
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
                          <td colSpan={7}>
                            <TextArea
                              value={infomation.remark}
                              name="remark"
                              rows={3}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </TabStripTab>
                <TabStripTab
                  title="업체담당자"
                  disabled={infomation.work_type == "N" ? true : false}
                >
                  <FormContext.Provider
                    value={{
                      attdatnum,
                      files,
                      setAttdatnum,
                      setFiles,
                      subDataState,
                      setSubDataState,
                      // fetchGrid,
                    }}
                  >
                    <GridContainer>
                      <GridTitleContainer>
                        <GridTitle>업체담당자</GridTitle>
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
                        data={subDataResult.data}
                        ref={(exporter) => {
                          _export2 = exporter;
                        }}
                        fileName="업체관리"
                      >
                        <Grid
                          style={{ height: "71.5vh" }}
                          data={process(
                            subDataResult.data.map((row) => ({
                              ...row,
                              rowstatus:
                                row.rowstatus == null ||
                                row.rowstatus == "" ||
                                row.rowstatus == undefined
                                  ? ""
                                  : row.rowstatus,
                              [SELECTED_FIELD]:
                                selectedsubDataState[idGetter2(row)],
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
                          <GridColumn
                            field="rowstatus"
                            title=" "
                            width="50px"
                          />
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions[
                              "grdList2"
                            ].map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <GridColumn
                                    key={idx}
                                    id={item.id}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    className={
                                      requiredField.includes(item.fieldName)
                                        ? "required"
                                        : undefined
                                    }
                                    headerCell={
                                      requiredField.includes(item.fieldName)
                                        ? RequiredHeader
                                        : undefined
                                    }
                                    cell={
                                      NumberField.includes(item.fieldName)
                                        ? NumberCell
                                        : checkboxField.includes(item.fieldName)
                                        ? CheckBoxCell
                                        : commandField.includes(item.fieldName)
                                        ? ColumnCommandCell //추후 작업
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? subTotalFooterCell
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
                <TabStripTab
                  title="재무현황"
                  disabled={infomation.work_type == "N" ? true : false}
                >
                  <GridContainer>
                    <GridTitleContainer>
                      <GridTitle>재무현황</GridTitle>
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
                      data={subDataResult2.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="업체관리"
                    >
                      <Grid
                        style={{ height: "71.5vh" }}
                        data={process(
                          subDataResult2.data.map((row) => ({
                            ...row,
                            rowstatus:
                              row.rowstatus == null ||
                              row.rowstatus == "" ||
                              row.rowstatus == undefined
                                ? ""
                                : row.rowstatus,
                            yyyy: row.yyyy
                              ? new Date(dateformat(row.yyyy))
                              : new Date(dateformat("19000101")),
                            [SELECTED_FIELD]:
                              selectedsubDataState2[idGetter3(row)],
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
                        onItemChange={onSubItemChange2}
                        cellRender={customCellRender2}
                        rowRender={customRowRender2}
                        editField={EDIT_FIELD}
                      >
                        <GridColumn field="rowstatus" title=" " width="50px" />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions[
                            "grdList3"
                          ].map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={idx}
                                  id={item.id}
                                  field={item.fieldName}
                                  title={item.caption}
                                  width={item.width}
                                  className={
                                    requiredField.includes(item.fieldName)
                                      ? "required"
                                      : undefined
                                  }
                                  headerCell={
                                    requiredField.includes(item.fieldName)
                                      ? RequiredHeader
                                      : undefined
                                  }
                                  cell={
                                    YearDateField.includes(item.fieldName)
                                      ? YearDateCell
                                      : NumberField.includes(item.fieldName)
                                      ? NumberCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? subTotalFooterCell2
                                      : NumberField.includes(item.fieldName)
                                      ? editNumberFooterCell
                                      : undefined
                                  }
                                />
                              )
                          )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </TabStripTab>
              </TabStrip>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
          modal={true}
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={infomation.attdatnum}
          modal={true}
        />
      )}
      {zipCodeWindowVisible && (
        <ZipCodeWindow
          setVisible={setZipCodeWindowVisibile}
          setData={getZipCodeData}
          para={infomation.zipcode}
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

export default BA_A0020;
