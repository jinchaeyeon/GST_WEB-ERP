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
import { Input, TextArea } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
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
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  convertDateToStrWithTime2,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
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
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/QC_A3000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY2 = "num";

const dateField = ["proddt", "qcdt"];
const numberField = ["qty", "qcqty", "badqty", "qc_sort", "qcvalue1"];

type TdataArr = {
  rowstatus_s: string[];
  qcseq_s: string[];
  stdnum_s: string[];
  stdrev_s: string[];
  stdseq_s: string[];
  qc_sort_s: string[];
  inspeccd_s: string[];
  qc_spec_s: string[];
  qcvalue1_s: string[];
  qcresult1_s: string[];
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_MA034 ", setBizComponentData);
  //합부판정
  const field = props.field ?? "";
  const bizComponentIdVal = field == "qcresult1" ? "L_MA034" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

var index = 0;

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;

const QC_A3000: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DETAIL_DATA_ITEM_KEY);
  const idGetter3 = getter(DETAIL_DATA_ITEM_KEY2);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");

  const [swiper, setSwiper] = useState<SwiperCore>();
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("QC_A3000W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".ButtonContainer2");
      height4 = getHeight(".ButtonContainer3");
      height5 = getHeight(".ButtonContainer4");
      height6 = getHeight(".FormBoxWrap");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height3);
        setMobileHeight3(getDeviceHeight(true) - height - height4);
        setMobileHeight4(getDeviceHeight(true) - height - height5);
        setWebHeight((getDeviceHeight(true) - height) / 2 - height2);
        setWebHeight2((getDeviceHeight(true) - height) / 2 - height3);
        setWebHeight3(getDeviceHeight(true) - height - height6);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, webheight3]);

  //customOptionData 조회 후 디폴트 값 세팅
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
        proccd: defaultOption.find((item: any) => item.id == "proccd")
          ?.valueCode,
        prodemp: defaultOption.find((item: any) => item.id == "prodemp")
          ?.valueCode,
        prodmac: defaultOption.find((item: any) => item.id == "prodmac")
          ?.valueCode,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        qcyn: defaultOption.find((item: any) => item.id == "qcyn")?.valueCode,
        qcno: defaultOption.find((item: any) => item.id == "qcno")?.valueCode,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001, L_fxcode, L_PR010,L_QC006,L_QC100",
    //사용자, 검사자, 공정, 검사차수, 검사항목코드
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [usersListData, setUsersListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [prodmacListData, setProdmacListData] = useState([
    { fxcode: "", fxfull: "" },
  ]);

  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qcnoListData, setQcnoListData] = useState([{ code: "", name: "" }]);
  const [inspeccdListData, setInspeccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  useEffect(() => {
    if (bizComponentData !== null) {
      setUsersListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setProdmacListData(getBizCom(bizComponentData, "L_fxcode"));
      setProccdListData(getBizCom(bizComponentData, "L_PR010"));
      setQcnoListData(getBizCom(bizComponentData, "L_QC006"));
      setInspeccdListData(getBizCom(bizComponentData, "L_QC100"));
    }
  }, [bizComponentData]);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState2, setDetailDataState2] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailDataState2)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailSelectedState2, setDetailSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InforInputChange = (e: any) => {
    const { value, name } = e.target;
    if (value !== null)
      setInformation((prev) => ({
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

  const InforComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    frdt: new Date(),
    todt: new Date(),
    proccd: "",
    itemcd: "",
    itemnm: "",
    prodemp: "",
    prodmac: "",
    qcyn: "N",
    lotnum: "",
    plankey: "",
    rekey: "",
    renum: "",
    reseq: 0,
    qcnum: "",
    company_code: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    itemcd: "",
    renum: "",
    reseq: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [detailFilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    itemcd: "",
    renum: "",
    reseq: 0,
    qcnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [information, setInformation] = useState({
    workType: "U",
    attdatnum: "",
    badqty: 0,
    endtime: "",
    files: "",
    itemcd: "",
    itemnm: "",
    person: "",
    qcdecision: "",
    qcdt: new Date(),
    qcno: "",
    qcnum: "",
    qcqty: 0,
    remark: "",
    strtime: "",
  });

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    qcno: "",
    attdatnum: "",
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_QC_A3000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": filters.orgdiv,
      "@p_location": sessionLocation,
      "@p_renum": detailFilters.renum,
      "@p_reseq": detailFilters.reseq,
      "@p_qcnum": detailFilters2.qcnum,
      "@p_qcdt": "",
      "@p_person": "",
      "@p_qcno": paraDataDeleted.qcno,
      "@p_qcqty": 0,
      "@p_badqty": 0,
      "@p_strtime": "",
      "@p_endtime": "",
      "@p_qcdecision": "",
      "@p_remark": "",
      "@p_attdatnum": "",
      "@p_itemcd": "",
      "@p_rowstatus_s": "",
      "@p_qcseq_s": "",
      "@p_stdnum_s": "",
      "@p_stdrev_s": "",
      "@p_stdseq_s": "",
      "@p_qc_sort_s": "",
      "@p_inspeccd_s": "",
      "@p_qc_spec_s": "",
      "@p_qcvalue1_s": "",
      "@p_qcresult1_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_QC_A3000W",
      "@p_company_code": companyCode,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_A3000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "PRLIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_proccd": filters.proccd,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_prodemp": filters.prodemp,
        "@p_prodmac": filters.prodmac,
        "@p_qcyn": filters.qcyn,
        "@p_lotnum": filters.lotnum,
        "@p_plankey": filters.plankey,
        "@p_rekey": filters.rekey,
        "@p_renum": filters.renum,
        "@p_reseq": filters.reseq,
        "@p_qcnum": filters.qcnum,
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
            (row: any) => row.renum + "-" + row.reseq == filters.find_row_value
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
                  row.renum + "-" + row.reseq == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setDetailFilters((prev) => ({
            ...prev,
            itemcd: selectedRow.itemcd,
            renum: selectedRow.renum,
            reseq: selectedRow.reseq,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setDetailFilters((prev) => ({
            ...prev,
            itemcd: rows[0].itemcd,
            renum: rows[0].renum,
            reseq: rows[0].reseq,
            isSearch: true,
            pgNum: 1,
          }));
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

  const fetchDetailGrid = async (detailFilters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    const detailParameters: Iparameters = {
      procedureName: "P_QC_A3000W_Q",
      pageNumber: detailFilters.pgNum,
      pageSize: detailFilters.pgSize,
      parameters: {
        "@p_work_type": "QCLIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_proccd": filters.proccd,
        "@p_itemcd": detailFilters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_prodemp": filters.prodemp,
        "@p_prodmac": filters.prodmac,
        "@p_qcyn": filters.qcyn,
        "@p_lotnum": filters.lotnum,
        "@p_plankey": filters.plankey,
        "@p_rekey": filters.rekey,
        "@p_renum": detailFilters.renum,
        "@p_reseq": detailFilters.reseq,
        "@p_qcnum": filters.qcnum,
        "@p_company_code": filters.company_code,
        "@p_find_row_value": detailFilters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (detailFilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.renum + "-" + row.reseq + "|" + row.qcnum ==
              detailFilters.find_row_value
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
      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          detailFilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.renum + "-" + row.reseq + "|" + row.qcnum ==
                  detailFilters.find_row_value
              );

        if (selectedRow != undefined) {
          setDetailSelectedState({ [selectedRow[DETAIL_DATA_ITEM_KEY]]: true });
          setInformation((prev) => ({
            ...prev,
            itemcd: selectedRow.itemcd,
            itemnm: selectedRow.itemnm,
            attdatnum: selectedRow.attdatnum,
            badqty: selectedRow.badqty,
            endtime: selectedRow.endtime,
            files: selectedRow.files,
            person: selectedRow.person,
            qcdecision: selectedRow.qcdecision,
            qcdt:
              selectedRow.qcdt == "" || selectedRow.qcdt == undefined
                ? new Date()
                : toDate(selectedRow.qcdt),
            qcno: selectedRow.qcno,
            qcnum: selectedRow.qcnum,
            qcqty: selectedRow.qcqty,
            remark: selectedRow.remark,
            strtime: selectedRow.strtime,
          }));
          setDetailFilters2((prev) => ({
            ...prev,
            itemcd: selectedRow.itemcd,
            renum: selectedRow.renum == undefined ? "" : selectedRow.renum,
            reseq: selectedRow.reseq == undefined ? 0 : selectedRow.reseq,
            qcnum: selectedRow.qcnum == undefined ? "" : selectedRow.qcnum,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setDetailSelectedState({ [rows[0][DETAIL_DATA_ITEM_KEY]]: true });
          setInformation((prev) => ({
            ...prev,
            itemcd: rows[0].itemcd,
            itemnm: rows[0].itemnm,
            attdatnum: rows[0].attdatnum,
            badqty: rows[0].badqty,
            endtime: rows[0].endtime,
            files: rows[0].files,
            person: rows[0].person,
            qcdecision: rows[0].qcdecision,
            qcdt:
              rows[0].qcdt == "" || rows[0].qcdt == undefined
                ? new Date()
                : toDate(rows[0].qcdt),
            qcno: rows[0].qcno,
            qcnum: rows[0].qcnum,
            qcqty: rows[0].qcqty,
            remark: rows[0].remark,
            strtime: rows[0].strtime,
          }));
          setDetailFilters2((prev) => ({
            ...prev,
            itemcd: rows[0].itemcd,
            renum: rows[0].renum == undefined ? "" : rows[0].renum,
            reseq: rows[0].reseq == undefined ? 0 : rows[0].reseq,
            qcnum: rows[0].qcnum == undefined ? "" : rows[0].qcnum,
            isSearch: true,
            pgNum: 1,
          }));
        }
      } else {
        setInformation({
          workType: "U",
          attdatnum: "",
          badqty: 0,
          endtime: "",
          files: "",
          itemcd: "",
          itemnm: "",
          person: "",
          qcdecision: "",
          qcdt: new Date(),
          qcno: "",
          qcnum: "",
          qcqty: 0,
          remark: "",
          strtime: "",
        });
        setDetailDataResult2(process([], detailDataState2));
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

  const fetchDetailGrid2 = async (detailFilters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    const detailParameters2: Iparameters = {
      procedureName: "P_QC_A3000W_Q",
      pageNumber: 1,
      pageSize: detailFilters2.pgSize,
      parameters: {
        "@p_work_type": "QCDETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_proccd": filters.proccd,
        "@p_itemcd": detailFilters2.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_prodemp": filters.prodemp,
        "@p_prodmac": filters.prodmac,
        "@p_qcyn": filters.qcyn,
        "@p_lotnum": filters.lotnum,
        "@p_plankey": filters.plankey,
        "@p_rekey": filters.rekey,
        "@p_renum": detailFilters2.renum,
        "@p_reseq": detailFilters2.reseq,
        "@p_qcnum": detailFilters2.qcnum,
        "@p_company_code": filters.company_code,
      },
    };

    const detailParameters3: Iparameters = {
      procedureName: "P_QC_A3000W_Q",
      pageNumber: detailFilters2.pgNum,
      pageSize: detailFilters2.pgSize,
      parameters: {
        "@p_work_type": "QCDETAIL_NEW",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_proccd": filters.proccd,
        "@p_itemcd": detailFilters2.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_prodemp": filters.prodemp,
        "@p_prodmac": filters.prodmac,
        "@p_qcyn": filters.qcyn,
        "@p_lotnum": filters.lotnum,
        "@p_plankey": filters.plankey,
        "@p_rekey": filters.rekey,
        "@p_renum": detailFilters2.renum,
        "@p_reseq": detailFilters2.reseq,
        "@p_qcnum": detailFilters2.qcnum,
        "@p_company_code": filters.company_code,
      },
    };

    try {
      data = await processApi<any>("procedure", detailParameters2);
    } catch (error) {
      data = null;
    }

    const datas = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    if (
      data.isSuccess == true &&
      data.resultMessage != "조회된 자료가 없습니다."
    ) {
      if (datas.qcyn == "등록" && information.workType == "N") {
        try {
          data = await processApi<any>("procedure", detailParameters3);
        } catch (error) {
          data = null;
        }

        const totalRowCnt = data.tables[0].TotalRowCount;
        const rows = data.tables[0].Rows;

        setDetailDataResult2((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });

        if (totalRowCnt > 0) {
          const selectedRow =
            detailFilters2.find_row_value == ""
              ? rows[0]
              : rows.find(
                  (row: any) =>
                    row.renum + "-" + row.reseq == detailFilters.find_row_value
                );
          if (selectedRow != undefined) {
            setDetailSelectedState2({
              [selectedRow[DETAIL_DATA_ITEM_KEY]]: true,
            });
          } else {
            setDetailSelectedState2({ [rows[0][DETAIL_DATA_ITEM_KEY]]: true });
          }
        }
      } else if (datas.qcyn == "등록" && information.workType == "U") {
        const totalRowCnt = data.tables[0].TotalRowCount;
        const rows = data.tables[0].Rows;

        setDetailDataResult2((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (totalRowCnt > 0) {
          const selectedRow =
            detailFilters2.find_row_value == ""
              ? rows[0]
              : rows.find(
                  (row: any) =>
                    row.renum + "-" + row.reseq == detailFilters.find_row_value
                );
          if (selectedRow != undefined) {
            setDetailSelectedState2({
              [selectedRow[DETAIL_DATA_ITEM_KEY]]: true,
            });
          } else {
            setDetailSelectedState2({ [rows[0][DETAIL_DATA_ITEM_KEY]]: true });
          }
        }
      } else if (datas.qcyn == "미등록" && information.workType == "N") {
        const totalRowCnt = data.tables[1].TotalRowCount;
        const rows = data.tables[1].Rows;

        setDetailDataResult2((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (totalRowCnt > 0) {
          const selectedRow =
            detailFilters2.find_row_value == ""
              ? rows[0]
              : rows.find(
                  (row: any) =>
                    row.renum + "-" + row.reseq == detailFilters.find_row_value
                );
          if (selectedRow != undefined) {
            setDetailSelectedState2({
              [selectedRow[DETAIL_DATA_ITEM_KEY]]: true,
            });
          } else {
            setDetailSelectedState2({ [rows[0][DETAIL_DATA_ITEM_KEY]]: true });
          }
        }
      } else {
        const totalRowCnt = data.tables[0].TotalRowCount;
        const rows = data.tables[0].Rows;

        setDetailDataResult2((prev) => {
          return {
            data: [],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      setDetailDataResult2((prev) => {
        return {
          data: [],
          total: 0,
        };
      });
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
  }, [filters, permissions, customOptionData, bizComponentData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      detailFilters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailFilters, permissions, customOptionData, bizComponentData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      detailFilters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters2);
      setDetailFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid2(deepCopiedFilters);
    }
  }, [detailFilters2, permissions, customOptionData, bizComponentData]);

  useEffect(() => {
    if (paraDataDeleted.work_type == "D" && permissions.delete) fetchToDelete();
  }, [paraDataDeleted, permissions]);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

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
  }, [detailDataResult]);

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
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setDetailFilters((prev) => ({
      ...prev,
      itemcd: selectedRowData.itemcd,
      renum: selectedRowData.renum,
      reseq: selectedRowData.reseq,
      isSearch: true,
      pgNum: 1,
    }));

    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const ondetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    const user = usersListData.find(
      (item: any) => item.user_name == selectedRowData.person
    )?.user_id;

    const qcno = qcnoListData.find(
      (item: any) => item.name == selectedRowData.qcno
    )?.code;

    setInformation((prev) => ({
      ...prev,
      workType: "U",
      itemcd: selectedRowData.itemcd,
      itemnm: selectedRowData.itemnm,
      attdatnum: selectedRowData.attdatnum,
      badqty: selectedRowData.badqty,
      endtime: selectedRowData.endtime,
      files: selectedRowData.files,
      person: user == undefined ? "" : user,
      qcdecision: selectedRowData.qcdecision,
      qcdt:
        selectedRowData.qcdt == "" || selectedRowData.qcdt == undefined
          ? new Date()
          : toDate(selectedRowData.qcdt),
      qcno: qcno == undefined ? "" : qcno,
      qcnum: selectedRowData.qcnum,
      qcqty: selectedRowData.qcqty,
      remark: selectedRowData.remark,
      strtime: selectedRowData.strtime,
    }));

    setDetailFilters2((prev) => ({
      ...prev,
      itemcd: selectedRowData.itemcd,
      renum: selectedRowData.renum == undefined ? "" : selectedRowData.renum,
      reseq: selectedRowData.reseq == undefined ? 0 : selectedRowData.reseq,
      qcnum: selectedRowData.qcnum == undefined ? "" : selectedRowData.qcnum,
      isSearch: true,
      pgNum: 1,
    }));
  };

  const ondetailSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY2,
    });
    setDetailSelectedState2(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      const optionsGridThree = _export3.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[2] = optionsGridThree.sheets[0];
      optionsGridOne.sheets[0].title = "생산실적리스트";
      optionsGridOne.sheets[1].title = "검사상세정보";
      optionsGridOne.sheets[2].title = "결과";
      _export.save(optionsGridOne);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  const onDetailDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setDetailDataState2(event.dataState);
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

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = detailDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onAddClick = () => {
    const data = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    if (data != undefined) {
      if (unsavedName.length > 0) {
        setDeletedName(unsavedName);
      }
      if (unsavedAttadatnums.length > 0) {
        setDeletedAttadatnums(unsavedAttadatnums);
      }
      setInformation((prev) => ({
        ...prev,
        workType: "N",
        itemcd: data.itemcd,
        itemnm: data.itemnm,
        attdatnum: "",
        badqty: 0,
        files: "",
        person: data.prodemp,
        qcdecision: "",
        qcdt: new Date(),
        qcno: "",
        qcnum: "",
        qcqty: 0,
        remark: "",
        strtime: convertDateToStrWithTime2(new Date()),
        endtime: convertDateToStrWithTime2(new Date()),
      }));

      setDetailFilters2((prev) => ({
        ...prev,
        itemcd: data.itemcd,
        renum: data.renum,
        reseq: data.reseq,
        qcnum: "",
        isSearch: true,
        pgNum: 1,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
    if (swiper && isMobile) {
      swiper.slideTo(2);
    }
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    const data = detailDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(detailSelectedState)[0]
    )[0];
    try {
      if (mainDataResult.total == 0) {
        throw findMessage(messagesData, "QC_A3000W_001");
      } else if (detailDataResult.total == 0) {
        throw findMessage(messagesData, "QC_A3000W_002");
      } else {
        setParaDataDeleted((prev) => ({
          ...prev,
          work_type: "D",
          qcno: data.qcno,
          attdatnum: data.attdatnum,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const fetchToDelete = async () => {
    if (!permissions.delete) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted2 =
        detailDataResult.data.length == 1 && detailFilters.pgNum == 1;
      const findRow2 = mainDataResult.data.filter(
        (row: any) => row.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      // 첨부파일 삭제
      if (paraDataDeleted.attdatnum)
        setDeletedAttadatnums([paraDataDeleted.attdatnum]);
      if (isLastDataDeleted2) {
        if (mainDataResult.data.length == 1) {
          setPage({
            skip:
              filters.pgNum == 1 || filters.pgNum == 0
                ? 0
                : PAGE_SIZE * (filters.pgNum - 2),
            take: PAGE_SIZE,
          });
          setFilters((prev) => ({
            ...prev,
            find_row_value: findRow2.renum + "-" + findRow2.reseq,
            pgNum:
              mainDataResult.data.length == 1
                ? prev.pgNum != 1
                  ? prev.pgNum - 1
                  : prev.pgNum
                : prev.pgNum,
            isSearch: true,
          }));
        } else {
          setFilters((prev) => ({
            ...prev,
            find_row_value: findRow2.renum + "-" + findRow2.reseq,
            isSearch: true,
          }));
        }
      } else {
        const isLastDataDeleted =
          detailDataResult.data.length == 1 && detailFilters.pgNum > 0;
        const findRowIndex = detailDataResult.data.findIndex(
          (row: any) =>
            row.num == Object.getOwnPropertyNames(detailSelectedState)[0]
        );

        if (isLastDataDeleted) {
          setPage2({
            skip:
              detailFilters.pgNum == 1 || detailFilters.pgNum == 0
                ? 0
                : PAGE_SIZE * (detailFilters.pgNum - 2),
            take: PAGE_SIZE,
          });

          setDetailFilters((prev) => ({
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
          setDetailFilters((prev) => ({
            ...prev,
            find_row_value:
              data.returnString +
              "|" +
              detailDataResult.data[findRowIndex == 0 ? 0 : findRowIndex - 1]
                .qcnum,
            isSearch: true,
          }));
        }
      }
      setUnsavedName([]);
      setUnsavedAttadatnums([]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    //초기화
    setParaDataDeleted((prev) => ({
      work_type: "",
      qcno: "",
      attdatnum: "",
    }));
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

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A3000W_006");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A3000W_006");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState);
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        if (unsavedAttadatnums.length > 0) {
          setDeletedAttadatnums(unsavedAttadatnums);
        }
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    renum: "",
    reseq: 0,
    qcnum: "",
    qcdt: new Date(),
    person: "",
    qcno: "",
    qcqty: 0,
    badqty: 0,
    strtime: "",
    endtime: "",
    qcdecision: "",
    attdatnum: "",
    remark: "",
    itemcd: "",
    rowstatus_s: "",
    qcseq_s: "",
    stdnum_s: "",
    stdrev_s: "",
    stdseq_s: "",
    qc_sort_s: "",
    inspeccd_s: "",
    qc_spec_s: "",
    qcvalue1_s: "",
    qcresult1_s: "",
    userid: userId,
    pc: pc,
  });

  const para: Iparameters = {
    procedureName: "P_QC_A3000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_renum": ParaData.renum,
      "@p_reseq": ParaData.reseq,
      "@p_qcnum": ParaData.qcnum,
      "@p_qcdt": convertDateToStr(ParaData.qcdt),
      "@p_person": ParaData.person,
      "@p_qcno": ParaData.qcno,
      "@p_qcqty": ParaData.qcqty,
      "@p_badqty": ParaData.badqty,
      "@p_strtime": ParaData.strtime,
      "@p_endtime": ParaData.endtime,
      "@p_qcdecision": ParaData.qcdecision,
      "@p_remark": ParaData.remark,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_itemcd": ParaData.itemcd,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_qcseq_s": ParaData.qcseq_s,
      "@p_stdnum_s": ParaData.stdnum_s,
      "@p_stdrev_s": ParaData.stdrev_s,
      "@p_stdseq_s": ParaData.stdseq_s,
      "@p_qc_sort_s": ParaData.qc_sort_s,
      "@p_inspeccd_s": ParaData.inspeccd_s,
      "@p_qc_spec_s": ParaData.qcseq_s,
      "@p_qcvalue1_s": ParaData.qcvalue1_s,
      "@p_qcresult1_s": ParaData.qcresult1_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_QC_A3000W",
      "@p_company_code": companyCode,
    },
  };

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
      setUnsavedName([]);
      setUnsavedAttadatnums([]);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "N",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        renum: "",
        reseq: 0,
        qcnum: "",
        qcdt: new Date(),
        person: "",
        qcno: "",
        qcqty: 0,
        badqty: 0,
        strtime: "",
        endtime: "",
        qcdecision: "",
        attdatnum: "",
        remark: "",
        itemcd: "",
        rowstatus_s: "",
        qcseq_s: "",
        stdnum_s: "",
        stdrev_s: "",
        stdseq_s: "",
        qc_sort_s: "",
        inspeccd_s: "",
        qc_spec_s: "",
        qcvalue1_s: "",
        qcresult1_s: "",
        userid: userId,
        pc: pc,
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.qcno != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setDetailDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      detailDataResult2,
      setDetailDataResult2,
      DETAIL_DATA_ITEM_KEY2
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
    if (
      field != "qc_sort" &&
      field != "inspeccd" &&
      field != "qc_spec" &&
      field != "rowstatus"
    ) {
      const newData = detailDataResult2.data.map((item) =>
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
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setDetailDataResult2((prev) => {
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
    if (tempResult.data != detailDataResult2.data) {
      const newData = detailDataResult2.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DETAIL_DATA_ITEM_KEY2] ==
          Object.getOwnPropertyNames(detailSelectedState2)[0]
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
      setDetailDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = detailDataResult2.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setDetailDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const createColumn = () => {
    const array = [];
    array.push(<GridColumn field={"rowstatus"} title={""} width="50px" />);
    array.push(
      <GridColumn
        field={"qc_sort"}
        title={"검사순번"}
        width="100px"
        cell={NumberCell}
        footerCell={detailTotalFooterCell2}
      />
    );
    array.push(
      <GridColumn field={"inspeccd"} title={"검사항목"} width="150px" />
    );
    array.push(
      <GridColumn field={"qc_spec"} title={"측정기준명"} width="150px" />
    );
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"qcvalue1"}
        title={"측정값"}
        width="100px"
        cell={NumberCell}
      />
    );
    array.push(
      <GridColumn
        field={"qcresult1"}
        title={"측정결과"}
        width="120px"
        cell={CustomComboBoxCell}
      />
    );
    return array;
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
    setDetailDataResult2(process([], detailDataState2));
    setInformation({
      workType: "U",
      attdatnum: "",
      badqty: 0,
      endtime: "",
      files: "",
      itemcd: "",
      itemnm: "",
      person: "",
      qcdecision: "",
      qcdt: new Date(),
      qcno: "",
      qcnum: "",
      qcqty: 0,
      remark: "",
      strtime: "",
    });
  };

  const onSaveClick = () => {
    if (!permissions.save) return;
    const data = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    let valid = true;

    detailDataResult.data.map((item) => {
      if (information.qcno == item.qcno) {
        valid = false;
      }
    });
    try {
      if (valid != true && information.workType == "N") {
        throw findMessage(messagesData, "QC_A3000W_003");
      } else if (detailDataResult2.total == 0) {
        throw findMessage(messagesData, "QC_A3000W_007");
      } else if (
        convertDateToStr(information.qcdt).substring(0, 4) < "1997" ||
        convertDateToStr(information.qcdt).substring(6, 8) > "31" ||
        convertDateToStr(information.qcdt).substring(6, 8) < "01" ||
        convertDateToStr(information.qcdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A3000W_006");
      } else if (
        information.person == null ||
        information.person == "" ||
        information.person == undefined
      ) {
        throw findMessage(messagesData, "QC_A3000W_004");
      } else if (
        information.qcno == null ||
        information.qcno == "" ||
        information.qcno == undefined
      ) {
        throw findMessage(messagesData, "QC_A3000W_005");
      } else {
        const dataItem = detailDataResult2.data.filter((item: any) => {
          return (
            (item.rowstatus == "N" || item.rowstatus == "U") &&
            item.rowstatus !== undefined
          );
        });

        let dataArr: TdataArr = {
          rowstatus_s: [],
          qcseq_s: [],
          stdnum_s: [],
          stdrev_s: [],
          stdseq_s: [],
          qc_sort_s: [],
          inspeccd_s: [],
          qc_spec_s: [],
          qcvalue1_s: [],
          qcresult1_s: [],
        };

        if (dataItem.length !== 0) {
          dataItem.forEach((item: any, idx: number) => {
            const {
              rowstatus = "",
              qcseq = "",
              stdnum = "",
              stdrev = "",
              stdseq = "",
              qc_sort = "",
              inspeccd = "",
              qc_spec = "",
              qcvalue1 = "",
              qcresult1 = "",
            } = item;

            dataArr.rowstatus_s.push(rowstatus);
            dataArr.qcseq_s.push(qcseq);
            dataArr.stdnum_s.push(stdnum);
            dataArr.stdrev_s.push(stdrev);
            dataArr.stdseq_s.push(stdseq);
            dataArr.qc_sort_s.push(qc_sort);
            dataArr.inspeccd_s.push(inspeccd);
            dataArr.qc_spec_s.push(qc_spec);
            dataArr.qcvalue1_s.push(qcvalue1);
            dataArr.qcresult1_s.push(qcresult1);
          });
        }

        setParaData((prev) => ({
          ...prev,
          workType: information.workType,
          renum: data.renum,
          reseq: data.reseq,
          qcnum: information.qcnum == undefined ? "" : information.qcnum,
          qcdt: information.qcdt,
          person: information.person,
          qcno: information.qcno,
          qcqty: information.qcqty == undefined ? 0 : information.qcqty,
          badqty: information.badqty == undefined ? 0 : information.badqty,
          strtime: information.strtime,
          endtime: information.endtime,
          qcdecision:
            information.qcdecision == undefined ? "" : information.qcdecision,
          attdatnum:
            information.attdatnum == undefined ? "" : information.attdatnum,
          remark: information.remark == undefined ? "" : information.remark,
          itemcd: data.itemcd,
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          qcseq_s: dataArr.qcseq_s.join("|"),
          stdnum_s: dataArr.stdnum_s.join("|"),
          stdrev_s: dataArr.stdrev_s.join("|"),
          stdseq_s: dataArr.stdseq_s.join("|"),
          qc_sort_s: dataArr.qc_sort_s.join("|"),
          inspeccd_s: dataArr.inspeccd_s.join("|"),
          qc_spec_s: dataArr.qc_spec_s.join("|"),
          qcvalue1_s: dataArr.qcvalue1_s.join("|"),
          qcresult1_s: dataArr.qcresult1_s.join("|"),
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const onNowTime = (e: any) => {
    setInformation((prev) => ({
      ...prev,
      strtime: convertDateToStrWithTime2(new Date()),
    }));
  };

  const onNowTime2 = (e: any) => {
    setInformation((prev) => ({
      ...prev,
      endtime: convertDateToStrWithTime2(new Date()),
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
              <th>일자구분</th>
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
              <th>공정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="proccd"
                    value={filters.proccd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>작업자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="prodemp"
                    value={filters.prodemp}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
                  />
                )}
              </td>
              <th>생산계획번호</th>
              <td>
                <Input
                  name="plankey"
                  type="text"
                  value={filters.plankey}
                  onChange={filterInputChange}
                />
              </td>
              <th>LOT NO</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
              </td>
            </tr>

            <tr>
              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onItemWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>품목명</th>
              <td>
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>설비</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="prodmac"
                    value={filters.prodmac}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="fxcode"
                    valueField="fxcode"
                  />
                )}
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>실적번호</th>
              <td>
                <Input
                  name="rekey"
                  type="text"
                  value={filters.rekey}
                  onChange={filterInputChange}
                />
              </td>
              <th>검사유무</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="qcyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
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
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>생산실적리스트</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="공정검사"
                >
                  <Grid
                    style={{ height: mobileheight }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        prodemp: usersListData.find(
                          (item: any) => item.user_id == row.prodemp
                        )?.user_name,
                        proccd: proccdListData.find(
                          (item: any) => item.sub_code == row.proccd
                        )?.code_name,
                        prodmac: prodmacListData.find(
                          (item: any) => item.fxcode == row.prodmac
                        )?.fxfull,
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
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                cell={
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell
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
              <GridContainer style={{ width: "100%", overflow: "auto" }}>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>검사상세정보</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(0);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                    <div>
                      <Button
                        onClick={onAddClick}
                        themeColor={"primary"}
                        icon="file-add"
                        disabled={permissions.save ? false : true}
                      >
                        생성
                      </Button>
                      <Button
                        onClick={onDeleteClick}
                        icon="delete"
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.delete ? false : true}
                      >
                        삭제
                      </Button>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(2);
                          }
                        }}
                        icon="arrow-right"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        다음
                      </Button>
                    </div>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={detailDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="공정검사"
                >
                  <Grid
                    style={{ height: mobileheight2 }}
                    data={process(
                      detailDataResult.data.map((row) => ({
                        ...row,
                        person: usersListData.find(
                          (item: any) => item.user_id == row.person
                        )?.user_name,
                        qcno: qcnoListData.find(
                          (item: any) => item.code == row.qcno
                        )?.name,
                        [SELECTED_FIELD]: detailSelectedState[idGetter2(row)],
                      })),
                      detailDataState
                    )}
                    {...detailDataState}
                    onDataStateChange={onDetailDataStateChange}
                    dataItemKey={DETAIL_DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={ondetailSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={detailDataResult.total}
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef2}
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
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? detailTotalFooterCell
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer style={{ width: "100%", overflow: "auto" }}>
                <GridTitleContainer className="ButtonContainer3">
                  <ButtonContainer
                    style={{
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                    <div>
                      <Button
                        onClick={onSaveClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="save"
                        disabled={permissions.save ? false : true}
                      >
                        저장
                      </Button>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(3);
                          }
                        }}
                        icon="arrow-right"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        다음
                      </Button>
                    </div>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormBoxWrap border={true} style={{ height: mobileheight3 }}>
                  <FormBox>
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr>
                          <th>품목코드</th>
                          <td>
                            <Input
                              name="itemcd"
                              type="text"
                              value={information.itemcd}
                              className="readonly"
                            />
                          </td>
                          <th>품목명</th>
                          <td>
                            <Input
                              name="itemnm"
                              type="text"
                              value={information.itemnm}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>검사일자</th>
                          <td colSpan={3}>
                            <div className="filter-item-wrap">
                              <DatePicker
                                name="qcdt"
                                value={information.qcdt}
                                format="yyyy-MM-dd"
                                onChange={InforInputChange}
                                className="required"
                                placeholder=""
                              />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th>검사자</th>
                          <td>
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="person"
                                value={information.person}
                                customOptionData={customOptionData}
                                changeData={InforComboBoxChange}
                                className="required"
                                textField="user_name"
                                valueField="user_id"
                              />
                            )}
                          </td>
                          <th>검사차수</th>
                          <td>
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="qcno"
                                value={information.qcno}
                                customOptionData={customOptionData}
                                changeData={InforComboBoxChange}
                                className="required"
                                textField="name"
                                valueField="code"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>시작시간</th>
                          <td>
                            <Input
                              name="strtime"
                              type="text"
                              value={information.strtime}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onNowTime}
                                icon="search"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>종료시간</th>
                          <td>
                            <Input
                              name="endtime"
                              type="text"
                              value={information.endtime}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onNowTime2}
                                icon="search"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                        </tr>
                        <tr>
                          <th>검사수량</th>
                          <td>
                            <Input
                              name="qcqty"
                              type="number"
                              value={information.qcqty}
                              onChange={InforInputChange}
                            />
                          </td>
                          <th>불량수량</th>
                          <td>
                            <Input
                              name="badqty"
                              type="number"
                              value={information.badqty}
                              onChange={InforInputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>첨부파일</th>
                          <td colSpan={3}>
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
                          <td colSpan={3}>
                            <TextArea
                              value={information.remark}
                              name="remark"
                              rows={3}
                              onChange={InforInputChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={3}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer4">
                  <ButtonContainer
                    style={{
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(2);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={detailDataResult2.data}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName="공정검사"
                >
                  <Grid
                    style={{ height: mobileheight4 }}
                    data={process(
                      detailDataResult2.data.map((row) => ({
                        ...row,
                        inspeccd: inspeccdListData.find(
                          (item: any) => item.sub_code == row.inspeccd
                        )?.code_name,
                        [SELECTED_FIELD]: detailSelectedState2[idGetter3(row)],
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
                    onSelectionChange={ondetailSelectionChange2}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={detailDataResult2.total}
                    //정렬기능
                    sortable={true}
                    onSortChange={onDetailSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    onItemChange={onMainItemChange}
                    cellRender={customCellRender}
                    rowRender={customRowRender}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn title="검사항목">{createColumn()}</GridColumn>
                    <GridColumn title="측정">{createColumn2()}</GridColumn>
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer style={{ width: "50%" }}>
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>생산실적리스트</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="공정검사"
              >
                <Grid
                  style={{ height: webheight }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      prodemp: usersListData.find(
                        (item: any) => item.user_id == row.prodemp
                      )?.user_name,
                      proccd: proccdListData.find(
                        (item: any) => item.sub_code == row.proccd
                      )?.code_name,
                      prodmac: prodmacListData.find(
                        (item: any) => item.fxcode == row.prodmac
                      )?.fxfull,
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
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : dateField.includes(item.fieldName)
                                  ? DateCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>검사상세정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="file-add"
                    disabled={permissions.save ? false : true}
                  >
                    생성
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    icon="delete"
                    fillMode="outline"
                    themeColor={"primary"}
                    disabled={permissions.delete ? false : true}
                  >
                    삭제
                  </Button>
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
              <ExcelExport
                data={detailDataResult.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="공정검사"
              >
                <Grid
                  style={{ height: webheight2 }}
                  data={process(
                    detailDataResult.data.map((row) => ({
                      ...row,
                      person: usersListData.find(
                        (item: any) => item.user_id == row.person
                      )?.user_name,
                      qcno: qcnoListData.find(
                        (item: any) => item.code == row.qcno
                      )?.name,
                      [SELECTED_FIELD]: detailSelectedState[idGetter2(row)],
                    })),
                    detailDataState
                  )}
                  {...detailDataState}
                  onDataStateChange={onDetailDataStateChange}
                  dataItemKey={DETAIL_DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={ondetailSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef2}
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
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? detailTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <FormBoxWrap border={true} className="FormBoxWrap">
                <FormBox>
                  <tbody>
                    <tr>
                      <th>품목코드</th>
                      <td>
                        <Input
                          name="itemcd"
                          type="text"
                          value={information.itemcd}
                          className="readonly"
                        />
                      </td>
                      <th>품목명</th>
                      <td>
                        <Input
                          name="itemnm"
                          type="text"
                          value={information.itemnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>검사일자</th>
                      <td colSpan={3}>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="qcdt"
                            value={information.qcdt}
                            format="yyyy-MM-dd"
                            onChange={InforInputChange}
                            className="required"
                            placeholder=""
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>검사자</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="person"
                            value={information.person}
                            customOptionData={customOptionData}
                            changeData={InforComboBoxChange}
                            className="required"
                            textField="user_name"
                            valueField="user_id"
                          />
                        )}
                      </td>
                      <th>검사차수</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="qcno"
                            value={information.qcno}
                            customOptionData={customOptionData}
                            changeData={InforComboBoxChange}
                            className="required"
                            textField="name"
                            valueField="code"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>시작시간</th>
                      <td>
                        <Input
                          name="strtime"
                          type="text"
                          value={information.strtime}
                        />
                        <ButtonInInput>
                          <Button
                            onClick={onNowTime}
                            icon="search"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                      <th>종료시간</th>
                      <td>
                        <Input
                          name="endtime"
                          type="text"
                          value={information.endtime}
                        />
                        <ButtonInInput>
                          <Button
                            onClick={onNowTime2}
                            icon="search"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                    </tr>
                    <tr>
                      <th>검사수량</th>
                      <td>
                        <Input
                          name="qcqty"
                          type="number"
                          value={information.qcqty}
                          onChange={InforInputChange}
                        />
                      </td>
                      <th>불량수량</th>
                      <td>
                        <Input
                          name="badqty"
                          type="number"
                          value={information.badqty}
                          onChange={InforInputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>첨부파일</th>
                      <td colSpan={3}>
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
                      <td colSpan={3}>
                        <TextArea
                          value={information.remark}
                          name="remark"
                          rows={3}
                          onChange={InforInputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer>
                <ExcelExport
                  data={detailDataResult2.data}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName="공정검사"
                >
                  <Grid
                    style={{ height: webheight3 }}
                    data={process(
                      detailDataResult2.data.map((row) => ({
                        ...row,
                        inspeccd: inspeccdListData.find(
                          (item: any) => item.sub_code == row.inspeccd
                        )?.code_name,
                        [SELECTED_FIELD]: detailSelectedState2[idGetter3(row)],
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
                    onSelectionChange={ondetailSelectionChange2}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={detailDataResult2.total}
                    //정렬기능
                    sortable={true}
                    onSortChange={onDetailSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    onItemChange={onMainItemChange}
                    cellRender={customCellRender}
                    rowRender={customRowRender}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn title="검사항목">{createColumn()}</GridColumn>
                    <GridColumn title="측정">{createColumn2()}</GridColumn>
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
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

export default QC_A3000;
