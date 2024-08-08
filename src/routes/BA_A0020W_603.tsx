import { Button } from "@progress/kendo-react-buttons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Checkbox, Input, MaskedTextBox } from "@progress/kendo-react-inputs";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInGridInput,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  isValidDate,
  numberWithCommas,
  setDefaultDate2,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";

import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { DatePicker } from "@progress/kendo-react-dateinputs";
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
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import CenterCell from "../components/Cells/CenterCell";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import YearDateCell from "../components/Cells/YearDateCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import { IAttachmentData } from "../hooks/interfaces";
import { gridList } from "../store/columns/BA_A0020W_603_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
let targetRowIndex: null | number = null;
let temp2 = 0;
let temp3 = 0;
let temp4 = 0;
let deletedMainRows2: object[] = [];
let deletedMainRows3: object[] = [];
let deletedMainRows4: object[] = [];

const requiredField = ["prsnnm", "yyyy"];
const numberField = [
  "dedt_ratio",
  "totasset",
  "salesmoney",
  "operating_profits",
  "current_income",
  "paid_up_capital",
];
const CenterCells = ["num"];
const CheckBoxReadOnlyCells = ["listringyn"];
const commandField = ["files"];
const dateField = ["yyyy"];
const comboField = ["postcd"];

type TdataArr = {
  rowstatus_s: string[];
  seq_s: string[];
  yyyy_s: string[];
  dedt_rati_s: string[];
  totasset_s: string[];
  salesmoney_s: string[];
  operating_profits_s: string[];
  current_income_s: string[];
  attdatnum_s: string[];

  paid_up_capital_s: string[];

  custprsncd_s: string[];
  prsnnm_s: string[];
  dptnm_s: string[];
  postcd_s: string[];
  telno_s: string[];
  phoneno_s: string[];
  email_s: string[];
  address_s: string[];
  remark_s: string[];
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_HU005", setBizComponentData);
  //보고서구분, 그룹구분, 그룹특성, 품목계정, 내수구분

  const field = props.field ?? "";
  const bizComponentIdVal = field == "postcd" ? "L_HU005" : "";

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

export const FormContext = createContext<{
  attdatnum: string;
  files: string;
  setAttdatnum: (d: any) => void;
  setFiles: (d: any) => void;
  mainDataState2: State;
  setMainDataState2: (d: any) => void;
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
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
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
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
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

const BA_A0020W_603: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [mobileheight5, setMobileHeight5] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [tabSelected, setTabSelected] = React.useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".k-tabstrip-items-wrapper");
      if (height4 == 0 && !isMobile) {
        setTabSelected(0);
        height4 = getHeight(".FormBoxWrap");
      }
      height5 = getHeight(".TitleContainer");
      height6 = getHeight(".ButtonContainer3");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height5);
        setMobileHeight2(getDeviceHeight(true) - height6 - height5 - height3);
        setMobileHeight3(getDeviceHeight(true) - height2 - height5 - height3);
        setMobileHeight4(getDeviceHeight(true) - height2 - height5 - height3);
        setMobileHeight5(getDeviceHeight(true) - height2 - height5 - height3);
        setWebHeight(
          getDeviceHeight(true) * 1.2 - height - height4 - height5 - height3
        );
        setWebHeight2(height4 - height2);
        setWebHeight3(height4 - height2);
        setWebHeight4(height4 - height2);
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
  ]);
  function bizNoFormatter(num: any) {
    var formatNum = "";
    try {
      if (num.length == 10) {
        formatNum = num.replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3");
      }
    } catch (e) {
      formatNum = num;
      console.log(e);
    }
    return formatNum;
  }

  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [workType, setWorkType] = useState("N");
  const [attdatnum, setAttdatnum] = useState<string>("");
  const [files, setFiles] = useState<string>("");

  useEffect(() => {
    const datas = mainDataResult2.data.filter(
      (item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
    )[0];
    if (datas != undefined) {
      if (datas.attdatnum == "") {
        setUnsavedAttadatnums((prev) => [...prev, attdatnum]);
      }
    }

    const newData = mainDataResult2.data.map((item) =>
      item[DATA_ITEM_KEY2] ==
      parseInt(Object.getOwnPropertyNames(selectedState2)[0])
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

    setMainDataResult2((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [attdatnum, files]);

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  const [tempattach, setTempAttach] = useState({
    attdatnum: "",
    files: "",
    attdatnumList: [],
    filesList: [],
  });
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
    }));
    setFilters3((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
    }));
    setFilters4((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
    }));
    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      ...event.page,
    });
  };
  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }

    setFilters2((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2({
      ...event.page,
    });
  };
  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }

    setFilters3((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage3({
      ...event.page,
    });
  };
  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }

    setFilters4((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage4({
      ...event.page,
    });
  };

  const handleSelectTab = (e: any) => {
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
      setUnsavedName([]);

      if (tabSelected == 0) {
        setInformation((prev: any) => ({
          ...prev,
          attdatnum: tempattach.attdatnum,
          files: tempattach.files,
        }));
      } else if (tabSelected == 2) {
        if (tempattach.attdatnumList.length > 0) {
          const newData = mainDataResult2.data.map((item: any) => {
            return {
              ...item,
              attdatnum: tempattach.attdatnumList[item.num - 1],
              files: tempattach.filesList[item.num - 1],
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
      }
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setTabSelected(e.selected);
  };

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA057, L_CR007, L_BA026, L_LISTRING, L_BA075, L_BA076, L_BA077, L_BA008, L_BA027, L_BA025",
    setBizComponentData
  );
  const [custdivListData, setCustdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setCustdivListData(getBizCom(bizComponentData, "L_BA026"));
      setItemlvl2ListData(getBizCom(bizComponentData, "L_BA076"));
      setItemlvl3ListData(getBizCom(bizComponentData, "L_BA077"));
    }
  }, [bizComponentData]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        custdiv: "B",
        itemlvl3: defaultOption.find((item: any) => item.id == "itemlvl3")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

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
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [tempState3, setTempState3] = useState<State>({
    sort: [],
  });
  const [tempState4, setTempState4] = useState<State>({
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
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [tempResult3, setTempResult3] = useState<DataResult>(
    process([], tempState3)
  );
  const [tempResult4, setTempResult4] = useState<DataResult>(
    process([], tempState4)
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
  let gridRef: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setWorkType("N");
    deletedMainRows2 = [];
    deletedMainRows3 = [];
    deletedMainRows4 = [];
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
    setInformation({
      area: "",
      custabbr: "",
      custdiv: "",
      listringyn: true,
      listringdiv: "",
      inunpitem: "",
      unpitem: "",
      custcd: "자동생성",
      custnm: "",
      bizdiv: "",
      bizregnum: "--",
      repreregno: "",
      compclass: "",
      comptype: "",
      countrycd: "",
      groupnm: "",
      itemlvl1: "",
      ceonm: "",
      itemlvl3: "",
      address: "",
      address_sub: "",
      itemlvl2: "",
      files: "",
      attdatnum: "",
      remark: "",
      num: 0,
      phonenum: "",
      faxnum: "",
      email: "",
      auto: true,
      compnm_eng: "",
      zipcode: "",
      bnkinfo: "",
      bankacntuser: "",
      bankacnt: "",
      estbdt: null,
      etelnum: "",
    });
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
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
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "auto") {
      setInformation((prev: any) => ({
        ...prev,
        [name]: value,
        custcd: value == true ? "자동생성" : "",
      }));
    } else {
      setInformation((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev: any) => ({
      ...prev,
      [name]: value,
      custdiv: "B",
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  // const filterComboBoxChange = (e: any) => {
  //   const { name, value } = e;

  //   setFilters((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    custcd: "",
    custnm: "",
    custdiv: "B",
    ceonm: "",
    itemlvl3: "",
    bizregnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "Money",
    custcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    workType: "Invest",
    custcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    workType: "CustPerson",
    custcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [information, setInformation] = useState<{ [name: string]: any }>({
    area: "",
    custabbr: "",
    custdiv: "B",
    listringyn: true,
    listringdiv: "",
    inunpitem: "",
    unpitem: "",
    custcd: "자동생성",
    custnm: "",
    bizdiv: "",
    bizregnum: "--",
    repreregno: "",
    compclass: "",
    comptype: "",
    countrycd: "",
    groupnm: "",
    itemlvl1: "",
    ceonm: "",
    itemlvl3: "",
    address: "",
    address_sub: "",
    itemlvl2: "",
    files: "",
    attdatnum: "",
    remark: "",
    num: 0,
    phonenum: "",
    faxnum: "",
    email: "",
    auto: true,
    compnm_eng: "",
    zipcode: "",
    bnkinfo: "",
    bankacntuser: "",
    bankacnt: "",
    estbdt: null,
    etelnum: "",
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0020W_603_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custdiv": filters.custdiv,
        "@p_ceonm": filters.ceonm,
        "@p_itemlvl3": filters.itemlvl3,
        "@p_bizregnum": filters.bizregnum,
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
        listringyn: item.listringyn == "Y" ? true : false,
      }));
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.custcd == filters.find_row_value
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
        setWorkType("U");
        // find_row_value 행 선택, find_row_value 없는 경우 첫번째 행 선택
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.custcd == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setTempAttach((prev) => ({
            ...prev,
            attdatnum: selectedRow.attdatnum,
            files: selectedRow.files,
          }));
          setFilters2((prev) => ({
            ...prev,
            custcd: selectedRow.custcd,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters3((prev) => ({
            ...prev,
            custcd: selectedRow.custcd,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters4((prev) => ({
            ...prev,
            custcd: selectedRow.custcd,
            isSearch: true,
            pgNum: 1,
          }));
          setInformation({
            area: selectedRow.area,
            custabbr: selectedRow.custabbr,
            custdiv: selectedRow.custdiv,
            listringyn: selectedRow.listringyn,
            listringdiv: selectedRow.listringdiv,
            inunpitem: selectedRow.inunpitem,
            unpitem: selectedRow.unpitem,
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            bizdiv: selectedRow.bizdiv,
            bizregnum: bizNoFormatter(selectedRow.bizregnum),
            repreregno: selectedRow.repreregno,
            compclass: selectedRow.compclass,
            comptype: selectedRow.comptype,
            countrycd: selectedRow.countrycd,
            groupnm: selectedRow.groupnm,
            itemlvl1: selectedRow.itemlvl1,
            ceonm: selectedRow.ceonm,
            itemlvl3: selectedRow.itemlvl3,
            address: selectedRow.address,
            address_sub: selectedRow.address_sub,
            itemlvl2: selectedRow.itemlvl2,
            files: selectedRow.files,
            attdatnum: selectedRow.attdatnum,
            remark: selectedRow.remark,
            num: selectedRow.num,
            phonenum: selectedRow.phonenum,
            faxnum: selectedRow.faxnum,
            email: selectedRow.email,
            auto: true,
            compnm_eng: selectedRow.compnm_eng,
            zipcode: selectedRow.zipcode,
            bnkinfo: selectedRow.bnkinfo,
            bankacntuser: selectedRow.bankacntuser,
            bankacnt: selectedRow.bankacnt,
            estbdt: isValidDate(selectedRow.estbdt)
              ? new Date(dateformat(selectedRow.estbdt))
              : null,
            etelnum: selectedRow.etelnum,
          });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setTempAttach((prev) => ({
            ...prev,
            attdatnum: rows[0].attdatnum,
            files: rows[0].files,
          }));
          setFilters2((prev) => ({
            ...prev,
            custcd: rows[0].custcd,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters3((prev) => ({
            ...prev,
            custcd: rows[0].custcd,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters4((prev) => ({
            ...prev,
            custcd: rows[0].custcd,
            isSearch: true,
            pgNum: 1,
          }));
          setInformation({
            area: rows[0].area,
            custabbr: rows[0].custabbr,
            custdiv: rows[0].custdiv,
            listringyn: rows[0].listringyn,
            listringdiv: rows[0].listringdiv,
            inunpitem: rows[0].inunpitem,
            unpitem: rows[0].unpitem,
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            bizdiv: rows[0].bizdiv,
            bizregnum: bizNoFormatter(rows[0].bizregnum),
            repreregno: rows[0].repreregno,
            compclass: rows[0].compclass,
            comptype: rows[0].comptype,
            countrycd: rows[0].countrycd,
            groupnm: rows[0].groupnm,
            itemlvl1: rows[0].itemlvl1,
            ceonm: rows[0].ceonm,
            itemlvl3: rows[0].itemlvl3,
            address: rows[0].address,
            address_sub: rows[0].address_sub,
            itemlvl2: rows[0].itemlvl2,
            files: rows[0].files,
            attdatnum: rows[0].attdatnum,
            remark: rows[0].remark,
            num: rows[0].num,
            phonenum: rows[0].phonenum,
            faxnum: rows[0].faxnum,
            email: rows[0].email,
            auto: true,
            compnm_eng: rows[0].compnm_eng,
            zipcode: rows[0].zipcode,
            bnkinfo: rows[0].bnkinfo,
            bankacntuser: rows[0].bankacntuser,
            bankacnt: rows[0].bankacnt,
            estbdt: isValidDate(rows[0].estbdt)
              ? new Date(dateformat(rows[0].estbdt))
              : null,
            etelnum: rows[0].etelnum,
          });
        }
      } else {
        resetAllGrid();
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
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0020W_603_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_custcd": filters2.custcd,
        "@p_custnm": filters.custnm,
        "@p_custdiv": filters.custdiv,
        "@p_ceonm": filters.ceonm,
        "@p_itemlvl3": filters.itemlvl3,
        "@p_bizregnum": filters.bizregnum,
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

      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        let attdatnumArray: any = [];
        let filesArray: any = [];

        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
        rows.map((item: any) => {
          attdatnumArray.push(item.attdatnum);
          filesArray.push(item.files);
        });
        setTempAttach((prev) => ({
          ...prev,
          attdatnumList: attdatnumArray,
          filesList: filesArray,
        }));
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

  const fetchMainGrid3 = async (filters3: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0020W_603_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.workType,
        "@p_custcd": filters3.custcd,
        "@p_custnm": filters.custnm,
        "@p_custdiv": filters.custdiv,
        "@p_ceonm": filters.ceonm,
        "@p_itemlvl3": filters.itemlvl3,
        "@p_bizregnum": filters.bizregnum,
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

      setMainDataResult3({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
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

  const fetchMainGrid4 = async (filters4: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0020W_603_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": filters4.workType,
        "@p_custcd": filters4.custcd,
        "@p_custnm": filters.custnm,
        "@p_custdiv": filters.custdiv,
        "@p_ceonm": filters.ceonm,
        "@p_itemlvl3": filters.itemlvl3,
        "@p_bizregnum": filters.bizregnum,
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

      setMainDataResult4({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
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

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);

      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, bizComponentData, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters3.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);

      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions, bizComponentData, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters4.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);

      setFilters4((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters4, permissions, bizComponentData, customOptionData]);

  //엑셀 내보내기
  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export.save(optionsGridOne);
      } else if (tabSelected == 2) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "재무현황";
        _export.save(optionsGridOne);
      } else if (tabSelected == 3) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridThree.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "투자";
        _export.save(optionsGridOne);
      } else if (tabSelected == 1) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridFour = _export4.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridFour.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "업체담당자";
        _export.save(optionsGridOne);
      }
    }
  };

  const search = () => {
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setTabSelected(0);
    resetAllGrid();
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
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

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setTabSelected(0);
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }

    setFilters2((prev) => ({
      ...prev,
      custcd: selectedRowData.custcd,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters3((prev) => ({
      ...prev,
      custcd: selectedRowData.custcd,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters4((prev) => ({
      ...prev,
      custcd: selectedRowData.custcd,
      isSearch: true,
      pgNum: 1,
    }));
    setWorkType("U");
    setInformation({
      area: selectedRowData.area,
      custabbr: selectedRowData.custabbr,
      custdiv:
        custdivListData.find(
          (item: any) => item.code_name == selectedRowData.custdiv
        ) == undefined
          ? ""
          : custdivListData.find(
              (item: any) => item.code_name == selectedRowData.custdiv
            )?.sub_code,
      listringyn: selectedRowData.listringyn,
      listringdiv: selectedRowData.listringdiv,
      inunpitem: selectedRowData.inunpitem,
      unpitem: selectedRowData.unpitem,
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      bizdiv: selectedRowData.bizdiv,
      bizregnum: bizNoFormatter(selectedRowData.bizregnum),
      repreregno: selectedRowData.repreregno,
      compclass: selectedRowData.compclass,
      comptype: selectedRowData.comptype,
      countrycd: selectedRowData.countrycd,
      groupnm: selectedRowData.groupnm,
      itemlvl1: selectedRowData.itemlvl1,
      ceonm: selectedRowData.ceonm,
      itemlvl3:
        itemlvl3ListData.find(
          (item: any) => item.code_name == selectedRowData.itemlvl3
        ) == undefined
          ? ""
          : itemlvl3ListData.find(
              (item: any) => item.code_name == selectedRowData.itemlvl3
            )?.sub_code,
      address: selectedRowData.address,
      address_sub: selectedRowData.address_sub,
      itemlvl2:
        itemlvl2ListData.find(
          (item: any) => item.code_name == selectedRowData.itemlvl2
        ) == undefined
          ? ""
          : itemlvl2ListData.find(
              (item: any) => item.code_name == selectedRowData.itemlvl2
            )?.sub_code,
      files: selectedRowData.files,
      attdatnum: selectedRowData.attdatnum,
      remark: selectedRowData.remark,
      num: selectedRowData.num,
      phonenum: selectedRowData.phonenum,
      faxnum: selectedRowData.faxnum,
      email: selectedRowData.email,
      auto: true,
      compnm_eng: selectedRowData.compnm_eng,
      zipcode: selectedRowData.zipcode,
      bnkinfo: selectedRowData.bnkinfo,
      bankacntuser: selectedRowData.bankacntuser,
      bankacnt: selectedRowData.bankacnt,
      estbdt: isValidDate(selectedRowData.estbdt)
        ? new Date(dateformat(selectedRowData.estbdt))
        : null,
      etelnum: selectedRowData.etelnum,
    });
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
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

  const enterEdit2 = (dataItem: any, field: string) => {
    let valid = true;

    if (dataItem.rowstatus != "N" && field == "yyyy") {
      valid = false;
    }

    if (field != "rowstatus" && valid == true) {
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

    if (dataItem.rowstatus != "N" && field == "yyyy") {
      valid = false;
    }

    if (field != "rowstatus" && valid == true) {
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

    if (dataItem.rowstatus != "N" && field == "prsnnm") {
      valid = false;
    }

    if (field != "rowstatus" && valid == true) {
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

  const onAddClick = () => {
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setWorkType("N");
    deletedMainRows2 = [];
    deletedMainRows3 = [];
    deletedMainRows4 = [];
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
    setTabSelected(0);
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );
    setInformation({
      area: defaultOption.find((item: any) => item.id == "area")?.valueCode,
      custabbr: "",
      custdiv: defaultOption.find((item: any) => item.id == "custdiv")
        ?.valueCode,
      listringyn: true,
      listringdiv: defaultOption.find((item: any) => item.id == "listringdiv")
        ?.valueCode,
      inunpitem: defaultOption.find((item: any) => item.id == "inunpitem")
        ?.valueCode,
      unpitem: defaultOption.find((item: any) => item.id == "unpitem")
        ?.valueCode,
      custcd: "자동생성",
      custnm: "",
      bizdiv: defaultOption.find((item: any) => item.id == "bizdiv")?.valueCode,
      bizregnum: "--",
      repreregno: "",
      compclass: defaultOption.find((item: any) => item.id == "compclass")
        ?.valueCode,
      comptype: "",
      countrycd: defaultOption.find((item: any) => item.id == "countrycd")
        ?.valueCode,
      groupnm: "",
      itemlvl1: defaultOption.find((item: any) => item.id == "itemlvl1")
        ?.valueCode,
      ceonm: "",
      itemlvl3: defaultOption.find((item: any) => item.id == "itemlvl3")
        ?.valueCode,
      address: "",
      address_sub: "",
      itemlvl2: defaultOption.find((item: any) => item.id == "itemlvl2")
        ?.valueCode,
      files: "",
      attdatnum: "",
      remark: "",
      num: 0,
      phonenum: "",
      faxnum: "",
      email: "",
      auto: true,
      compnm_eng: "",
      zipcode: "",
      bnkinfo: "",
      bankacntuser: "",
      bankacnt: "",
      estbdt: setDefaultDate2(customOptionData, "estbdt"),
      etelnum: "",
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
      attdatnum: "",
      current_income: 0,
      custcd: information.custcd,
      dedt_ratio: 0,
      files: "",
      operating_profits: 0,
      salesmoney: 0,
      seq: 0,
      totasset: 0,
      yyyy: convertDateToStr(new Date()),
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
      custcd: information.custcd,
      paid_up_capital: 0,
      remark: "",
      seq: 0,
      yyyy: convertDateToStr(new Date()),
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
      address: "",
      custcd: information.custcd,
      custprsncd: "",
      dptnm: "",
      email: "",
      phoneno: "",
      postcd: "",
      prsnnm: "",
      remark: "",
      telno: "",
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

  const onDeleteClick2 = (e: any) => {
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
    if (Object.length > 0) {
      setSelectedState4({
        [data != undefined ? data[DATA_ITEM_KEY4] : newData[0]]: true,
      });
    }
  };

  const onSaveClick = () => {
    if (!permissions.save) return;
    if (
      information.custdiv == "" ||
      information.inunpitem == "" ||
      information.unpitem == "" ||
      information.custcd == "" ||
      information.custnm == "" ||
      information.bizdiv == ""
    ) {
      alert("필수값을 입력해주세요.");
    } else {

      setParaData((prev) => ({
        ...prev,
        workType: workType,
        area: information.area == undefined ? "" : information.area,
        custcd: information.custcd,
        custnm: information.custnm,
        custabbr: information.custabbr,
        ceonm: information.ceonm,
        bizregnum:
          information.bizregnum == "___-__-_____"
            ? ""
            : information.bizregnum.replace(/-/g, ""),
        repreregno: information.repreregno,
        address: information.address,
        address_sub: information.address_sub,
        bizdiv: information.bizdiv,
        custdiv: information.custdiv,
        listringyn: information.listringyn == true ? "Y" : "N",
        listringdiv:
          information.listringdiv == undefined ? "" : information.listringdiv,
        inunpitem: information.inunpitem,
        unpitem: information.unpitem,
        compclass:
          information.compclass == undefined ? "" : information.compclass,
        comptype: information.comptype,
        countrycd:
          information.countrycd == undefined ? "" : information.countrycd,
        groupnm: information.groupnm,
        itemlvl1: information.itemlvl1 == undefined ? "" : information.itemlvl1,
        itemlvl2: information.itemlvl2 == undefined ? "" : information.itemlvl2,
        itemlvl3: information.itemlvl3 == undefined ? "" : information.itemlvl3,
        attdatnum: information.attdatnum,
        remark: information.remark,
        auto: information.auto == true ? "Y" : "N",
        phonenum: information.phonenum,
        faxnum: information.faxnum,
        email: information.email,
        useyn: "Y",
        compnm_eng: information.compnm_eng,
        zipcode: information.zipcode,
        bnkinfo: information.bnkinfo,
        bankacntuser: information.bankacntuser,
        bankacnt: information.bankacnt,
        estbdt:
          information.estbdt == null
            ? ""
            : convertDateToStr(information.estbdt),
        etelnum: information.etelnum,
      }));
    }
  };

  const [paraData, setParaData] = useState({
    workType: "",
    area: "",
    custcd: "",
    custnm: "",
    custabbr: "",
    ceonm: "",
    bizregnum: "",
    repreregno: "",
    address: "",
    address_sub: "",
    bizdiv: "",
    custdiv: "",
    listringyn: "",
    listringdiv: "",
    inunpitem: "",
    unpitem: "",
    compclass: "",
    comptype: "",
    countrycd: "",
    groupnm: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    attdatnum: "",
    remark: "",
    auto: "",
    useyn: "",
    phonenum: "",
    faxnum: "",
    email: "",
    compnm_eng: "",
    zipcode: "",
    bnkinfo: "",
    bankacntuser: "",
    bankacnt: "",
    estbdt: "",
    etelnum: "",

    rowstatus_s: "",

    seq_s: "",
    yyyy_s: "",
    dedt_rati_s: "",
    totasset_s: "",
    salesmoney_s: "",
    operating_profits_s: "",
    current_income_s: "",
    attdatnum_s: "",

    paid_up_capital_s: "",

    custprsncd_s: "",
    prsnnm_s: "",
    dptnm_s: "",
    postcd_s: "",
    telno_s: "",
    phoneno_s: "",
    email_s: "",
    address_s: "",
    remark_s: "",
    user_id: userId,
    pc: pc,
    form_id: "BA_A0020W_603",
  });

  const para: Iparameters = {
    procedureName: "P_BA_A0020W_603_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,

      "@p_area": paraData.area,
      "@p_custcd": paraData.custcd,
      "@p_custnm": paraData.custnm,
      "@p_custabbr": paraData.custabbr,
      "@p_ceonm": paraData.ceonm,
      "@p_bizregnum": paraData.bizregnum,
      "@p_repreregno": paraData.repreregno,
      "@p_address": paraData.address,
      "@p_address_sub": paraData.address_sub,
      "@p_bizdiv": paraData.bizdiv,
      "@p_custdiv": paraData.custdiv,
      "@p_listringyn": paraData.listringyn,
      "@p_listringdiv": paraData.listringdiv,
      "@p_inunpitem": paraData.inunpitem,
      "@p_unpitem": paraData.unpitem,
      "@p_compclass": paraData.compclass,
      "@p_comptype": paraData.comptype,
      "@p_countrycd": paraData.countrycd,
      "@p_groupnm": paraData.groupnm,
      "@p_itemlvl1": paraData.itemlvl1,
      "@p_itemlvl2": paraData.itemlvl2,
      "@p_itemlvl3": paraData.itemlvl3,
      "@p_attdatnum": paraData.attdatnum,
      "@p_remark": paraData.remark,
      "@p_auto": paraData.auto,
      "@p_useyn": paraData.useyn,
      "@p_phonenum": paraData.phonenum,
      "@p_faxnum": paraData.faxnum,
      "@p_email": paraData.email,
      "@p_compnm_eng": paraData.compnm_eng,
      "@p_zipcode": paraData.zipcode,
      "@p_bnkinfo": paraData.bnkinfo,
      "@p_bankacntuser": paraData.bankacntuser,
      "@p_bankacnt": paraData.bankacnt,
      "@p_estbdt": paraData.estbdt,
      "@p_etelnum": paraData.etelnum,

      /* 재무현황 */
      "@p_seq_s": paraData.seq_s,
      "@p_yyyy_s": paraData.yyyy_s,
      "@p_dedt_ratio_s": paraData.dedt_rati_s,
      "@p_totasset_s": paraData.totasset_s,
      "@p_salesmoney_s": paraData.salesmoney_s,
      "@p_operating_profits_s": paraData.operating_profits_s,
      "@p_current_income_s": paraData.current_income_s,
      "@p_attdatnum_s": paraData.attdatnum_s,

      /* 투자 */
      "@p_paid_up_capital_s": paraData.paid_up_capital_s,

      /* 업체담당자 */
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_custprsncd_s": paraData.custprsncd_s,
      "@p_prsnnm_s": paraData.prsnnm_s,
      "@p_dptnm_s": paraData.dptnm_s,
      "@p_postcd_s": paraData.postcd_s,
      "@p_telno_s": paraData.telno_s,
      "@p_phoneno_s": paraData.phoneno_s,
      "@p_email_s": paraData.email_s,
      "@p_address_s": paraData.address_s,
      "@p_remark_s": paraData.remark_s,

      "@p_userid": paraData.user_id,
      "@p_pc": paraData.pc,
      "@p_form_id": paraData.form_id,
    },
  };

  useEffect(() => {
    if (
      paraData.workType != "" &&
      permissions.save &&
      paraData.workType != "D"
    ) {
      fetchTodoGridSaved();
    }
    if (paraData.workType == "D" && permissions.delete) {
      fetchTodoGridSaved();
    }
  }, [paraData, permissions]);

  const fetchTodoGridSaved = async () => {
    if (!permissions.save && paraData.workType != "D") return;
    if (!permissions.delete && paraData.workType == "D") return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (paraData.workType == "D") {
        let array: any[] = [];
        array.push(information.attdatnum);
        mainDataResult2.data.map((item) => {
          array.push(item.attdatnum);
        });
        deletedMainRows2.map((item: any) => {
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
              : mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                  .custcd,
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      } else {
        let array: any[] = [];
        deletedMainRows2.map((item: any) => {
          array.push(item.attdatnum);
        });
        setDeletedAttadatnums(array);
        setUnsavedAttadatnums([]);
        setUnsavedName([]);
        resetAllGrid();
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: data.returnString,
          isSearch: true,
        }));
      }
      setTempAttach({
        attdatnum: "",
        files: "",
        attdatnumList: [],
        filesList: [],
      });
      setParaData({
        workType: "",
        area: "",
        custcd: "",
        custnm: "",
        custabbr: "",
        ceonm: "",
        bizregnum: "",
        repreregno: "",
        address: "",
        address_sub: "",
        bizdiv: "",
        custdiv: "",
        listringyn: "",
        listringdiv: "",
        inunpitem: "",
        unpitem: "",
        compclass: "",
        comptype: "",
        countrycd: "",
        groupnm: "",
        itemlvl1: "",
        itemlvl2: "",
        itemlvl3: "",
        attdatnum: "",
        remark: "",
        auto: "",
        useyn: "",
        phonenum: "",
        faxnum: "",
        email: "",
        compnm_eng: "",
        zipcode: "",
        bnkinfo: "",
        bankacntuser: "",
        bankacnt: "",
        estbdt: "",
        etelnum: "",

        rowstatus_s: "",

        seq_s: "",
        yyyy_s: "",
        dedt_rati_s: "",
        totasset_s: "",
        salesmoney_s: "",
        operating_profits_s: "",
        current_income_s: "",
        attdatnum_s: "",

        paid_up_capital_s: "",

        custprsncd_s: "",
        prsnnm_s: "",
        dptnm_s: "",
        postcd_s: "",
        telno_s: "",
        phoneno_s: "",
        email_s: "",
        address_s: "",
        remark_s: "",
        user_id: userId,
        pc: pc,
        form_id: "BA_A0020W_603",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = () => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult.total > 0) {
      const data = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setParaData((prev) => ({
        ...prev,
        workType: "D",
        custcd: data.custcd,
      }));
    }
  };

  const onSaveClick2 = () => {
    if (!permissions.save) return;
    let valid = true;
    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    try {
      dataItem.map((item: any) => {
        if (item.yyyy == "") {
          throw findMessage(messagesData, "BA_A0020W_603_001");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }
    if (!valid) return false;
    if (dataItem.length == 0 && deletedMainRows2.length == 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      seq_s: [],
      yyyy_s: [],
      dedt_rati_s: [],
      totasset_s: [],
      salesmoney_s: [],
      operating_profits_s: [],
      current_income_s: [],
      attdatnum_s: [],

      paid_up_capital_s: [],

      custprsncd_s: [],
      prsnnm_s: [],
      dptnm_s: [],
      postcd_s: [],
      telno_s: [],
      phoneno_s: [],
      email_s: [],
      address_s: [],
      remark_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = 0,
        yyyy = "",
        dedt_ratio = 0,
        totasset = 0,
        salesmoney = 0,
        operating_profits = 0,
        current_income = 0,
        attdatnum = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.yyyy_s.push(yyyy == "99991231" ? "" : yyyy.substring(0, 4));
      dataArr.dedt_rati_s.push(dedt_ratio);
      dataArr.totasset_s.push(totasset);
      dataArr.salesmoney_s.push(salesmoney);
      dataArr.operating_profits_s.push(operating_profits);
      dataArr.current_income_s.push(current_income);
      dataArr.attdatnum_s.push(attdatnum);
    });
    deletedMainRows2.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = 0,
        yyyy = "",
        dedt_ratio = 0,
        totasset = 0,
        salesmoney = 0,
        operating_profits = 0,
        current_income = 0,
        attdatnum = "",
      } = item;

      dataArr.rowstatus_s.push("D");
      dataArr.seq_s.push(seq);
      dataArr.yyyy_s.push(yyyy == "99991231" ? "" : yyyy.substring(0, 4));
      dataArr.dedt_rati_s.push(dedt_ratio);
      dataArr.totasset_s.push(totasset);
      dataArr.salesmoney_s.push(salesmoney);
      dataArr.operating_profits_s.push(operating_profits);
      dataArr.current_income_s.push(current_income);
      dataArr.attdatnum_s.push(attdatnum);
    });

    const item = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    setParaData((prev) => ({
      ...prev,
      workType: "Money",
      custcd: item.custcd,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      seq_s: dataArr.seq_s.join("|"),
      yyyy_s: dataArr.yyyy_s.join("|"),
      dedt_rati_s: dataArr.dedt_rati_s.join("|"),
      totasset_s: dataArr.totasset_s.join("|"),
      salesmoney_s: dataArr.salesmoney_s.join("|"),
      operating_profits_s: dataArr.operating_profits_s.join("|"),
      current_income_s: dataArr.current_income_s.join("|"),
      attdatnum_s: dataArr.attdatnum_s.join("|"),
    }));
  };

  const onSaveClick3 = () => {
    if (!permissions.save) return;
    let valid = true;
    const dataItem = mainDataResult3.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    try {
      dataItem.map((item: any) => {
        if (item.yyyy == "") {
          throw findMessage(messagesData, "BA_A0020W_603_001");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }
    if (!valid) return false;
    if (dataItem.length == 0 && deletedMainRows3.length == 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      seq_s: [],
      yyyy_s: [],
      dedt_rati_s: [],
      totasset_s: [],
      salesmoney_s: [],
      operating_profits_s: [],
      current_income_s: [],
      attdatnum_s: [],

      paid_up_capital_s: [],

      custprsncd_s: [],
      prsnnm_s: [],
      dptnm_s: [],
      postcd_s: [],
      telno_s: [],
      phoneno_s: [],
      email_s: [],
      address_s: [],
      remark_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = 0,
        yyyy = "",
        paid_up_capital = 0,
        remark = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.paid_up_capital_s.push(paid_up_capital);
      dataArr.yyyy_s.push(yyyy == "99991231" ? "" : yyyy.substring(0, 4));
      dataArr.seq_s.push(seq);
      dataArr.remark_s.push(remark);
    });
    deletedMainRows3.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = 0,
        yyyy = "",
        paid_up_capital = 0,
        remark = "",
      } = item;

      dataArr.rowstatus_s.push("D");
      dataArr.paid_up_capital_s.push(paid_up_capital);
      dataArr.yyyy_s.push(yyyy == "99991231" ? "" : yyyy.substring(0, 4));
      dataArr.seq_s.push(seq);
      dataArr.remark_s.push(remark);
    });

    const item = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    setParaData((prev) => ({
      ...prev,
      workType: "Invest",
      custcd: item.custcd,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      seq_s: dataArr.seq_s.join("|"),
      yyyy_s: dataArr.yyyy_s.join("|"),
      paid_up_capital_s: dataArr.paid_up_capital_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
    }));
  };

  const onSaveClick4 = () => {
    if (!permissions.save) return;
    const dataItem = mainDataResult4.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    let valid = true;
    try {
      dataItem.map((item: any) => {
        if (item.prsnnm == "") {
          throw findMessage(messagesData, "BA_A0020W_603_001");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }
    if (!valid) return false;
    if (dataItem.length == 0 && deletedMainRows4.length == 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      seq_s: [],
      yyyy_s: [],
      dedt_rati_s: [],
      totasset_s: [],
      salesmoney_s: [],
      operating_profits_s: [],
      current_income_s: [],
      attdatnum_s: [],

      paid_up_capital_s: [],

      custprsncd_s: [],
      prsnnm_s: [],
      dptnm_s: [],
      postcd_s: [],
      telno_s: [],
      phoneno_s: [],
      email_s: [],
      address_s: [],
      remark_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        address = "",
        custprsncd = "",
        dptnm = "",
        email = "",
        phoneno = "",
        postcd = "",
        prsnnm = "",
        remark = "",
        telno = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.address_s.push(address);
      dataArr.custprsncd_s.push(custprsncd);
      dataArr.dptnm_s.push(dptnm);
      dataArr.email_s.push(email);
      dataArr.phoneno_s.push(phoneno);
      dataArr.postcd_s.push(postcd);
      dataArr.prsnnm_s.push(prsnnm);
      dataArr.remark_s.push(remark);
      dataArr.telno_s.push(telno);
    });
    deletedMainRows4.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        address = "",
        custprsncd = "",
        dptnm = "",
        email = "",
        phoneno = "",
        postcd = "",
        prsnnm = "",
        remark = "",
        telno = "",
      } = item;

      dataArr.rowstatus_s.push("D");
      dataArr.address_s.push(address);
      dataArr.custprsncd_s.push(custprsncd);
      dataArr.dptnm_s.push(dptnm);
      dataArr.email_s.push(email);
      dataArr.phoneno_s.push(phoneno);
      dataArr.postcd_s.push(postcd);
      dataArr.prsnnm_s.push(prsnnm);
      dataArr.remark_s.push(remark);
      dataArr.telno_s.push(telno);
    });

    const item = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    setParaData((prev) => ({
      ...prev,
      workType: "CustPerson",
      custcd: item.custcd,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      address_s: dataArr.address_s.join("|"),
      custprsncd_s: dataArr.custprsncd_s.join("|"),
      dptnm_s: dataArr.dptnm_s.join("|"),
      email_s: dataArr.email_s.join("|"),
      phoneno_s: dataArr.phoneno_s.join("|"),
      postcd_s: dataArr.postcd_s.join("|"),
      prsnnm_s: dataArr.prsnnm_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      telno_s: dataArr.telno_s.join("|"),
    }));
  };
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
              <th>대표자명</th>
              <td>
                <Input
                  name="ceonm"
                  type="text"
                  value={filters.ceonm}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>개발분야</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemlvl3"
                    value={filters.itemlvl3}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
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
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    요약정보
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="chevron-right"
                      themeColor={"primary"}
                      fillMode={"flat"}
                    ></Button>
                  </ButtonContainer>
                </GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="file-add"
                    disabled={permissions.save ? false : true}
                  >
                    신규
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                    disabled={permissions.delete ? false : true}
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
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: mobileheight }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      custdiv: custdivListData.find(
                        (item: any) => item.sub_code == row.custdiv
                      )?.code_name,
                      itemlvl2: itemlvl2ListData.find(
                        (item: any) => item.sub_code == row.itemlvl2
                      )?.code_name,
                      itemlvl3: itemlvl3ListData.find(
                        (item: any) => item.sub_code == row.itemlvl3
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
                                CenterCells.includes(item.fieldName)
                                  ? CenterCell
                                  : CheckBoxReadOnlyCells.includes(
                                      item.fieldName
                                    )
                                  ? CheckBoxReadOnlyCell
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
          </SwiperSlide>
          <SwiperSlide key={1}>
            <TabStrip
              selected={tabSelected}
              onSelect={handleSelectTab}
              style={{ width: "100%" }}
              scrollable={isMobile}
            >
              <TabStripTab
                title="기본"
                disabled={permissions.view ? false : true}
              >
                <ButtonContainer className="ButtonContainer3">
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    disabled={permissions.save ? false : true}
                  >
                    저장
                  </Button>
                </ButtonContainer>
                <FormBoxWrap
                  border={true}
                  style={{
                    height: mobileheight2,
                    overflow: "auto",
                  }}
                >
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>업체코드</th>
                        <td>
                          {information.custcd != "자동생성" &&
                          information.auto == true ? (
                            <>
                              <Input
                                name="custcd"
                                type="text"
                                value={information.custcd}
                                className="readonly"
                              />
                            </>
                          ) : (
                            <>
                              {information.auto == true ? (
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
                                      value={information.auto}
                                      onChange={InputChange}
                                      name="auto"
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
                                    value={information.custcd}
                                    onChange={InputChange}
                                    className="required"
                                  />
                                  <ButtonInInput>
                                    <Checkbox
                                      defaultChecked={true}
                                      value={information.auto}
                                      onChange={InputChange}
                                      name="auto"
                                      style={{
                                        marginTop: "7px",
                                        marginRight: "5px",
                                      }}
                                    />
                                  </ButtonInInput>
                                </div>
                              )}
                            </>
                          )}
                        </td>
                        <th>업체명</th>
                        <td colSpan={3}>
                          <Input
                            name="custnm"
                            type="text"
                            value={information.custnm}
                            onChange={InputChange}
                            className="required"
                          />
                        </td>
                        <th>업체구분</th>
                        <td>
                          {workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="custdiv"
                                  disabled
                                  value={information.custdiv}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                  className="required"
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="custdiv"
                                  disabled
                                  value={information.custdiv}
                                  bizComponentId="L_BA026"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                  className="required"
                                />
                              )}
                        </td>
                      </tr>
                      <tr>
                        <th>사업자 등록번호</th>
                        <td>
                          <MaskedTextBox
                            name="bizregnum"
                            mask="000-00-00000"
                            value={information.bizregnum}
                            onChange={InputChange}
                          />
                        </td>

                        <th>영문회사명</th>
                        <td colSpan={3}>
                          <Input
                            name="compnm_eng"
                            type="text"
                            value={information.compnm_eng}
                            onChange={InputChange}
                          />
                        </td>
                        <th>매입단가항목</th>
                        <td>
                          {workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="inunpitem"
                                  value={information.inunpitem}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                  className="required"
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="inunpitem"
                                  value={information.inunpitem}
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
                            value={information.ceonm}
                            onChange={InputChange}
                          />
                        </td>
                        <th>우편번호</th>
                        <td>
                          <Input
                            name="zipcode"
                            type="text"
                            value={information.zipcode}
                            onChange={InputChange}
                          />
                        </td>
                        <th>지역</th>
                        <td>
                          {workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="area"
                                  value={information.area}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="area"
                                  value={information.area}
                                  bizComponentId="L_CR007"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                />
                              )}
                        </td>
                        <th>매출단가항목</th>
                        <td>
                          {workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="unpitem"
                                  value={information.unpitem}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                  className="required"
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="unpitem"
                                  value={information.unpitem}
                                  bizComponentId="L_BA008"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                  className="required"
                                />
                              )}
                        </td>
                      </tr>
                      <tr>
                        <th>주민등록번호</th>
                        <td>
                          <Input
                            name="repreregno"
                            type="text"
                            value={information.repreregno}
                            onChange={InputChange}
                          />
                        </td>
                        <th>주소(본사)</th>
                        <td colSpan={3}>
                          <Input
                            name="address"
                            type="text"
                            value={information.address}
                            onChange={InputChange}
                          />
                        </td>
                        <th>사업자구분</th>
                        <td>
                          {workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="bizdiv"
                                  value={information.bizdiv}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                  className="required"
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="bizdiv"
                                  value={information.bizdiv}
                                  bizComponentId="L_BA027"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                  className="required"
                                />
                              )}
                        </td>
                      </tr>
                      <tr>
                        <th>전화번호</th>
                        <td>
                          <Input
                            name="phonenum"
                            type="text"
                            value={information.phonenum}
                            onChange={InputChange}
                          />
                        </td>
                        <th>주소(연구소)</th>
                        <td colSpan={3}>
                          <Input
                            name="address_sub"
                            type="text"
                            value={information.address_sub}
                            onChange={InputChange}
                          />
                        </td>
                        <th>개업년월일</th>
                        <td>
                          <DatePicker
                            name="estbdt"
                            format="yyyy-MM-dd"
                            value={information.estbdt}
                            onChange={InputChange}
                            placeholder=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>전자전화번호</th>
                        <td>
                          <Input
                            name="etelnum"
                            type="text"
                            value={information.etelnum}
                            onChange={InputChange}
                          />
                        </td>
                        <th>은행정보</th>
                        <td>
                          <Input
                            name="bnkinfo"
                            type="text"
                            value={information.bnkinfo}
                            onChange={InputChange}
                          />
                        </td>
                        <th>예금주</th>
                        <td>
                          <Input
                            name="bankacntuser"
                            type="text"
                            value={information.bankacntuser}
                            onChange={InputChange}
                          />
                        </td>
                        <th>업태</th>
                        <td>
                          {workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="compclass"
                                  value={information.compclass}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="compclass"
                                  value={information.compclass}
                                  bizComponentId="L_BA025"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                />
                              )}
                        </td>
                      </tr>
                      <tr>
                        <th>팩스번호</th>
                        <td>
                          <Input
                            name="faxnum"
                            type="text"
                            value={information.faxnum}
                            onChange={InputChange}
                          />
                        </td>
                        <th>계좌번호</th>
                        <td colSpan={3}>
                          <Input
                            name="bankacnt"
                            type="text"
                            value={information.bankacnt}
                            onChange={InputChange}
                          />
                        </td>
                        <th>업종</th>
                        <td>
                          <Input
                            name="comptype"
                            type="text"
                            value={information.comptype}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>신용평가등급</th>
                        <td>
                          {workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="itemlvl1"
                                  value={information.itemlvl1}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="itemlvl1"
                                  value={information.itemlvl1}
                                  bizComponentId="L_BA075"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                />
                              )}
                        </td>
                        <th>기업구분</th>
                        <td>
                          {workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="itemlvl2"
                                  value={information.itemlvl2}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="itemlvl2"
                                  value={information.itemlvl2}
                                  bizComponentId="L_BA076"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                />
                              )}
                        </td>
                        <th>개발분야</th>
                        <td>
                          {workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="itemlvl3"
                                  value={information.itemlvl3}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="itemlvl3"
                                  value={information.itemlvl3}
                                  bizComponentId="L_BA077"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                />
                              )}
                        </td>
                        <th>상장구분</th>
                        <td>
                          {workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="listringdiv"
                                  value={information.listringdiv}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="listringdiv"
                                  value={information.listringdiv}
                                  bizComponentId="L_LISTRING"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                />
                              )}
                        </td>
                      </tr>
                      <tr>
                        <th>국가</th>
                        <td>
                          {workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="countrycd"
                                  value={information.countrycd}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="countrycd"
                                  value={information.countrycd}
                                  bizComponentId="L_BA057"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                />
                              )}
                        </td>
                        <th>이메일</th>
                        <td colSpan={3}>
                          <Input
                            name="email"
                            type="text"
                            value={information.email}
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
                        <td colSpan={7}>
                          <Input
                            name="remark"
                            type="text"
                            value={information.remark}
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
                disabled={
                  permissions.view ? (workType == "N" ? true : false) : true
                }
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
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
                    data={mainDataResult4.data}
                    ref={(exporter) => {
                      _export4 = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: mobileheight5 }}
                      data={process(
                        mainDataResult4.data.map((row) => ({
                          ...row,
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
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList4"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={idx}
                                  field={item.fieldName}
                                  title={item.caption}
                                  width={item.width}
                                  cell={
                                    comboField.includes(item.fieldName)
                                      ? CustomComboBoxCell
                                      : undefined
                                  }
                                  headerCell={
                                    requiredField.includes(item.fieldName)
                                      ? RequiredHeader
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
                </GridContainer>
              </TabStripTab>
              <TabStripTab
                title="재무현황"
                disabled={
                  permissions.view ? (workType == "N" ? true : false) : true
                }
              >
                <FormContext.Provider
                  value={{
                    attdatnum,
                    files,
                    setAttdatnum,
                    setFiles,
                    mainDataState2,
                    setMainDataState2,
                    // fetchGrid,
                  }}
                >
                  <GridContainer style={{ width: "100%", overflow: "auto" }}>
                    <GridTitleContainer className="ButtonContainer2">
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
                      data={mainDataResult2.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: mobileheight3 }}
                        data={process(
                          mainDataResult2.data.map((row) => ({
                            ...row,
                            yyyy: row.yyyy
                              ? new Date(dateformat(row.yyyy))
                              : new Date(dateformat("99991231")),
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
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    cell={
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : dateField.includes(item.fieldName)
                                        ? YearDateCell
                                        : commandField.includes(item.fieldName)
                                        ? ColumnCommandCell
                                        : undefined
                                    }
                                    headerCell={
                                      requiredField.includes(item.fieldName)
                                        ? RequiredHeader
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
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
                </FormContext.Provider>
              </TabStripTab>
              <TabStripTab
                title="투자"
                disabled={
                  permissions.view ? (workType == "N" ? true : false) : true
                }
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
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
                    data={mainDataResult3.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: mobileheight4 }}
                      data={process(
                        mainDataResult3.data.map((row) => ({
                          ...row,
                          yyyy: row.yyyy
                            ? new Date(dateformat(row.yyyy))
                            : new Date(dateformat("99991231")),
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
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList3"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
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
                                      ? YearDateCell
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
              </TabStripTab>
            </TabStrip>
          </SwiperSlide>
        </Swiper>
      ) : (
        <>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>요약정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick}
                  themeColor={"primary"}
                  icon="file-add"
                  disabled={permissions.save ? false : true}
                >
                  신규
                </Button>
                <Button
                  onClick={onDeleteClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="delete"
                  disabled={permissions.delete ? false : true}
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
              fileName={getMenuName()}
            >
              <Grid
                style={{ height: webheight }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    custdiv: custdivListData.find(
                      (item: any) => item.sub_code == row.custdiv
                    )?.code_name,
                    itemlvl2: itemlvl2ListData.find(
                      (item: any) => item.sub_code == row.itemlvl2
                    )?.code_name,
                    itemlvl3: itemlvl3ListData.find(
                      (item: any) => item.sub_code == row.itemlvl3
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
                              CenterCells.includes(item.fieldName)
                                ? CenterCell
                                : CheckBoxReadOnlyCells.includes(item.fieldName)
                                ? CheckBoxReadOnlyCell
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
          <TabStrip
            selected={tabSelected}
            onSelect={handleSelectTab}
            style={{ width: "100%" }}
            scrollable={isMobile}
          >
            <TabStripTab
              title="기본"
              disabled={permissions.view ? false : true}
            >
              <FormBoxWrap border={true} className="FormBoxWrap">
                <GridTitleContainer>
                  <GridTitle></GridTitle>
                  <ButtonContainer className="ButtonContainer2">
                    <Button
                      onClick={onSaveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      disabled={permissions.save ? false : true}
                    >
                      저장
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>업체코드</th>
                      <td>
                        {information.custcd != "자동생성" &&
                        information.auto == true ? (
                          <>
                            <Input
                              name="custcd"
                              type="text"
                              value={information.custcd}
                              className="readonly"
                            />
                          </>
                        ) : (
                          <>
                            {information.auto == true ? (
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
                                    value={information.auto}
                                    onChange={InputChange}
                                    name="auto"
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
                                  value={information.custcd}
                                  onChange={InputChange}
                                  className="required"
                                />
                                <ButtonInInput>
                                  <Checkbox
                                    defaultChecked={true}
                                    value={information.auto}
                                    onChange={InputChange}
                                    name="auto"
                                    style={{
                                      marginTop: "7px",
                                      marginRight: "5px",
                                    }}
                                  />
                                </ButtonInInput>
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      <th>업체명</th>
                      <td colSpan={3}>
                        <Input
                          name="custnm"
                          type="text"
                          value={information.custnm}
                          onChange={InputChange}
                          className="required"
                        />
                      </td>
                      <th>업체구분</th>
                      <td>
                        {workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="custdiv"
                                disabled
                                value={information.custdiv}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="custdiv"
                                disabled
                                value={information.custdiv}
                                bizComponentId="L_BA026"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )}
                      </td>
                    </tr>
                    <tr>
                      <th>사업자 등록번호</th>
                      <td>
                        <MaskedTextBox
                          name="bizregnum"
                          mask="000-00-00000"
                          value={information.bizregnum}
                          onChange={InputChange}
                        />
                      </td>

                      <th>영문회사명</th>
                      <td colSpan={3}>
                        <Input
                          name="compnm_eng"
                          type="text"
                          value={information.compnm_eng}
                          onChange={InputChange}
                        />
                      </td>
                      <th>매입단가항목</th>
                      <td>
                        {workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="inunpitem"
                                value={information.inunpitem}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="inunpitem"
                                value={information.inunpitem}
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
                          value={information.ceonm}
                          onChange={InputChange}
                        />
                      </td>
                      <th>우편번호</th>
                      <td>
                        <Input
                          name="zipcode"
                          type="text"
                          value={information.zipcode}
                          onChange={InputChange}
                        />
                      </td>
                      <th>지역</th>
                      <td>
                        {workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="area"
                                value={information.area}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="area"
                                value={information.area}
                                bizComponentId="L_CR007"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                      <th>매출단가항목</th>
                      <td>
                        {workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="unpitem"
                                value={information.unpitem}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="unpitem"
                                value={information.unpitem}
                                bizComponentId="L_BA008"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )}
                      </td>
                    </tr>
                    <tr>
                      <th>주민등록번호</th>
                      <td>
                        <Input
                          name="repreregno"
                          type="text"
                          value={information.repreregno}
                          onChange={InputChange}
                        />
                      </td>
                      <th>주소(본사)</th>
                      <td colSpan={3}>
                        <Input
                          name="address"
                          type="text"
                          value={information.address}
                          onChange={InputChange}
                        />
                      </td>
                      <th>사업자구분</th>
                      <td>
                        {workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="bizdiv"
                                value={information.bizdiv}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="bizdiv"
                                value={information.bizdiv}
                                bizComponentId="L_BA027"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                              />
                            )}
                      </td>
                    </tr>
                    <tr>
                      <th>전화번호</th>
                      <td>
                        <Input
                          name="phonenum"
                          type="text"
                          value={information.phonenum}
                          onChange={InputChange}
                        />
                      </td>
                      <th>주소(연구소)</th>
                      <td colSpan={3}>
                        <Input
                          name="address_sub"
                          type="text"
                          value={information.address_sub}
                          onChange={InputChange}
                        />
                      </td>
                      <th>개업년월일</th>
                      <td>
                        <DatePicker
                          name="estbdt"
                          format="yyyy-MM-dd"
                          value={information.estbdt}
                          onChange={InputChange}
                          placeholder=""
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>전자전화번호</th>
                      <td>
                        <Input
                          name="etelnum"
                          type="text"
                          value={information.etelnum}
                          onChange={InputChange}
                        />
                      </td>
                      <th>은행정보</th>
                      <td>
                        <Input
                          name="bnkinfo"
                          type="text"
                          value={information.bnkinfo}
                          onChange={InputChange}
                        />
                      </td>
                      <th>예금주</th>
                      <td>
                        <Input
                          name="bankacntuser"
                          type="text"
                          value={information.bankacntuser}
                          onChange={InputChange}
                        />
                      </td>
                      <th>업태</th>
                      <td>
                        {workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="compclass"
                                value={information.compclass}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="compclass"
                                value={information.compclass}
                                bizComponentId="L_BA025"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                    </tr>
                    <tr>
                      <th>팩스번호</th>
                      <td>
                        <Input
                          name="faxnum"
                          type="text"
                          value={information.faxnum}
                          onChange={InputChange}
                        />
                      </td>
                      <th>계좌번호</th>
                      <td colSpan={3}>
                        <Input
                          name="bankacnt"
                          type="text"
                          value={information.bankacnt}
                          onChange={InputChange}
                        />
                      </td>
                      <th>업종</th>
                      <td>
                        <Input
                          name="comptype"
                          type="text"
                          value={information.comptype}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>신용평가등급</th>
                      <td>
                        {workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="itemlvl1"
                                value={information.itemlvl1}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="itemlvl1"
                                value={information.itemlvl1}
                                bizComponentId="L_BA075"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                      <th>기업구분</th>
                      <td>
                        {workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="itemlvl2"
                                value={information.itemlvl2}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="itemlvl2"
                                value={information.itemlvl2}
                                bizComponentId="L_BA076"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                      <th>개발분야</th>
                      <td>
                        {workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="itemlvl3"
                                value={information.itemlvl3}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="itemlvl3"
                                value={information.itemlvl3}
                                bizComponentId="L_BA077"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                      <th>상장구분</th>
                      <td>
                        {workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="listringdiv"
                                value={information.listringdiv}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="listringdiv"
                                value={information.listringdiv}
                                bizComponentId="L_LISTRING"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                    </tr>
                    <tr>
                      <th>국가</th>
                      <td>
                        {workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="countrycd"
                                value={information.countrycd}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="countrycd"
                                value={information.countrycd}
                                bizComponentId="L_BA057"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                      <th>이메일</th>
                      <td colSpan={3}>
                        <Input
                          name="email"
                          type="text"
                          value={information.email}
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
                      <td colSpan={7}>
                        <Input
                          name="remark"
                          type="text"
                          value={information.remark}
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
              disabled={
                permissions.view ? (workType == "N" ? true : false) : true
              }
            >
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
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
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList4"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
                          (item: any, idx: number) =>
                            item.sortOrder !== -1 && (
                              <GridColumn
                                key={idx}
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                cell={
                                  comboField.includes(item.fieldName)
                                    ? CustomComboBoxCell
                                    : undefined
                                }
                                headerCell={
                                  requiredField.includes(item.fieldName)
                                    ? RequiredHeader
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
              </GridContainer>
            </TabStripTab>
            <TabStripTab
              title="재무현황"
              disabled={
                permissions.view ? (workType == "N" ? true : false) : true
              }
            >
              <FormContext.Provider
                value={{
                  attdatnum,
                  files,
                  setAttdatnum,
                  setFiles,
                  mainDataState2,
                  setMainDataState2,
                  // fetchGrid,
                }}
              >
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer2">
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
                          yyyy: row.yyyy
                            ? new Date(dateformat(row.yyyy))
                            : new Date(dateformat("99991231")),
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
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList2"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
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
                                      ? YearDateCell
                                      : commandField.includes(item.fieldName)
                                      ? ColumnCommandCell
                                      : undefined
                                  }
                                  headerCell={
                                    requiredField.includes(item.fieldName)
                                      ? RequiredHeader
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
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
              </FormContext.Provider>
            </TabStripTab>
            <TabStripTab
              title="투자"
              disabled={
                permissions.view ? (workType == "N" ? true : false) : true
              }
            >
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
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
                        yyyy: row.yyyy
                          ? new Date(dateformat(row.yyyy))
                          : new Date(dateformat("99991231")),
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
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList3"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
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
                                    ? YearDateCell
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
            </TabStripTab>
          </TabStrip>
        </>
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={information.attdatnum}
          modal={true}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
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

export default BA_A0020W_603;
