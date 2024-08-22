import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { ICustData, IWindowPosition } from "../../hooks/interfaces";
import { isFilterHideState2, isLoading } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  convertDateToStr,
  getBizCom,
  getHeight,
  GetPropertyValueByName,
  getWindowDeviceHeight,
  handleKeyPressSearch,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import WindowFilterContainer from "../Containers/WindowFilterContainer";
import CommonDateRangePicker from "../DateRangePicker/CommonDateRangePicker";
import ProjectsWindow from "./CM_A7000W_Project_Window";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import PrsnnumWindow from "./CommonWindows/PrsnnumWindow";
import Window from "./WindowComponent/Window";
type IWindow = {
  setVisible(t: boolean): void;
  reloadData(arr: any): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
};
interface IPrsnnum {
  user_id: string;
  user_name: string;
}

var height = 0;
var height2 = 0;
var height3 = 0;

const SA_A1000W_603_Before_Window = ({
  setVisible,
  reloadData,
  modal = false,
}: IWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const sessionLocation = UseGetValueFromSessionItem("location");
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        dtgb: defaultOption.find((item: any) => item.id == "dtgb")?.valueCode,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        quosts: defaultOption.find((item: any) => item.id == "quosts")
          ?.valueCode,
        materialtype: defaultOption.find(
          (item: any) => item.id == "materialtype"
        )?.valueCode,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_SA016, L_SA004, L_sysUserMaster_001, L_HU005, L_SA001_603",
    //사용여부,
    setBizComponentData
  );
  // 물질분야
  const [materialtypeListData, setMaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [quotypeListData, setQuotypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [quostsListData, setQuostsListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setpostcdListData(getBizCom(bizComponentData, "L_HU005"));
      setMaterialtypeListData(getBizCom(bizComponentData, "L_SA001_603"));
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setQuostsListData(getBizCom(bizComponentData, "L_SA004"));
      setQuotypeListData(getBizCom(bizComponentData, "L_SA016"));
    }
  }, [bizComponentData]);
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1500) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 1500,
    height: isMobile == true ? deviceHeight : 800,
  });

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".WindowTitleContainer"); //조회버튼있는 title부분
      height3 = getHeight(".BottomContainer"); //하단 버튼부분

      setMobileHeight(
        getWindowDeviceHeight(true, deviceHeight) - height - height2 - height3
      );
      setWebHeight(
        getWindowDeviceHeight(true, position.height) -
          height -
          height2 -
          height3
      );
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(true, position.height) - height - height2 - height3
    );
  };

  const DATA_ITEM_KEY = "num";
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onClose = () => {
    setisFilterHideStates2(true);
    setVisible(false);
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);
  const [PrsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);

  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };
  const onProejctWndClick = () => {
    setProjectWindowVisible(true);
  };
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const setProjectData = (data: any) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        quonum: data.quokey,
      };
    });
  };
  const setCustData = (data: ICustData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };
  const setPrsnnumData = (data: IPrsnnum) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        chkpersonnm: data.user_name,
        chkperson: data.user_id,
      };
    });
  };
  const processApi = useApi();
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: sessionOrgdiv,
    quonum: "",

    dtgb: "",
    frdt: new Date(),
    todt: new Date(),
    custcd: "",
    custnm: "",
    person: "",
    chkperson: "",
    chkpersonnm: "",
    quosts: "",
    quotestnum: "",
    materialtype: "",
    materialinfo: "",
    pgNum: 1,
    isSearch: false,
  });

  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1000W_603_Sub2_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_quonum": filters.quonum,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_person": filters.person,
        "@p_chkperson": filters.chkperson,
        "@p_chkpersonnm": filters.chkpersonnm,
        "@p_quosts": filters.quosts,
        "@p_quotestnum": filters.quotestnum,
        "@p_materialtype": filters.materialtype,
        "@p_materialinfo": filters.materialinfo,
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

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow = rows[0];
        setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
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

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

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

  //메인 그리드 선택 이벤트
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        alert("필수값을 채워주세요.");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        alert("필수값을 채워주세요.");
      } else if (
        filters.dtgb == "" ||
        filters.dtgb == undefined ||
        filters.dtgb == null
      ) {
        alert("필수값을 채워주세요.");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const onConfirmBtnClick = () => {
    if (!permissions.save) return;
    if (mainDataResult.total > 0) {
      const Information = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

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

      setParaData({
        workType: "REF",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        quonum: Information.quonum,
        quorev: Information.quorev,
        quoseq: Information.quorev,
        quotype: Information.quotype,
        quodt: Information.quodt,
        pubdt: Information.pubdt,
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
        assaydt: Information.assaydt,
        report: report,
        rcvcustnm: Information.rcvcustnm,
        rcvcustprsnnm: Information.rcvcustprsnnm,
        remark3: Information.remark3,
        materialtype: Information.materialtype,
        materialindt: Information.materialindt,
        materialnm: Information.materialnm,
        guideline: guid,
        translatereport: translatereport,
        testenddt: Information.testenddt,
        teststdt: Information.teststdt,
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
        form_id: "SA_A1000W_603",
      });
    } else {
      alert("데이터가 없습니다.");
    }
  };

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
    procedureName: "P_SA_A1000W_603_S",
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
      "@p_form_id": "SA_A1000W_603",
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
      reloadData(data.returnString);
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
      onClose();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  return (
    <>
      <Window
        titles={"이전의뢰참조 팝업"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <TitleContainer className="WindowTitleContainer">
          <Title></Title>
          <ButtonContainer>
            <Button
              onClick={() => search()}
              icon="search"
              themeColor={"primary"}
              disabled={permissions.view ? false : true}
            >
              조회
            </Button>
          </ButtonContainer>
        </TitleContainer>
        <WindowFilterContainer>
          <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
            <tbody>
              <tr>
                <th colSpan={2}>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="dtgb"
                      value={filters.dtgb}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      textField="name"
                      valueField="code"
                      className="required"
                    />
                  )}
                </th>
                <td colSpan={2}>
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
                <th>등록자</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="person"
                      value={filters.person}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      textField="user_name"
                      valueField="user_id"
                    />
                  )}
                </td>

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
                <th>진행단계</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="quosts"
                      value={filters.quosts}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
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
                      type={"button"}
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
              </tr>
              <tr>
                <th>영업담당자</th>
                <td>
                  <Input
                    name="chkpersonnm"
                    type="text"
                    value={filters.chkpersonnm}
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
                <th>예약번호</th>
                <td>
                  <Input
                    name="quotestnum"
                    type="text"
                    value={filters.quotestnum}
                    onChange={filterInputChange}
                  />
                </td>
                <th>물질정보</th>
                <td>
                  <Input
                    name="materialinfo"
                    type="text"
                    value={filters.materialinfo}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
            </tbody>
          </FilterBox>
        </WindowFilterContainer>
        <GridContainer>
          <Grid
            style={{ height: isMobile ? mobileheight : webheight }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                quotype: quotypeListData.find(
                  (items: any) => items.sub_code == row.quotype
                )?.code_name,
                quosts: quostsListData.find(
                  (items: any) => items.sub_code == row.quosts
                )?.code_name,
                materialtype: materialtypeListData.find(
                  (items: any) => items.sub_code == row.materialtype
                )?.code_name,
                postcd: postcdListData.find(
                  (item: any) => item.sub_code == row.postcd
                )?.code_name,
                rcvpostcd: postcdListData.find(
                  (item: any) => item.sub_code == row.rcvpostcd
                )?.code_name,
                person: userListData.find(
                  (items: any) => items.user_id == row.person
                )?.user_name,
                chkperson: userListData.find(
                  (items: any) => items.user_id == row.chkperson
                )?.user_name,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
              mainDataState
            )}
            onDataStateChange={onMainDataStateChange}
            {...mainDataState}
            //선택 기능
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
          >
            <GridColumn
              field="quonum"
              title="PJT NO."
              width="150px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn
              field="quorev"
              title="REV"
              cell={NumberCell}
              width="80px"
            />
            <GridColumn field="quotype" title="의뢰유형" width="120px" />
            <GridColumn field="quosts" title="진행단계" width="120px" />
            <GridColumn
              field="quodt"
              title="작성일자"
              cell={DateCell}
              width="120px"
            />
            <GridColumn field="person" title="등록자" width="120px" />
            <GridColumn field="custcd" title="업체코드" width="120px" />
            <GridColumn field="custnm" title="업체명" width="150px" />
            <GridColumn field="custprsnnm" title="의뢰자" width="120px" />
            <GridColumn field="remark2" title="의뢰자소속" width="120px" />
            <GridColumn field="postcd" title="의뢰자직위" width="120px" />
            <GridColumn field="rcvcustnm" title="모니터사" width="150px" />
            <GridColumn field="rcvcustprsnnm" title="모니터" width="120px" />
            <GridColumn field="remark3" title="모니터소속" width="120px" />
            <GridColumn field="rcvpostcd" title="모니터직위" width="120px" />
            <GridColumn field="materialtype" title="물질분야" width="120px" />
            <GridColumn field="materialinfo" title="물질정보" width="150px" />
            <GridColumn
              field="materialindt"
              title="물질입고예정일"
              width="120px"
              cell={DateCell}
            />
            <GridColumn field="materialnm" title="시험물질명" width="120px" />
            <GridColumn
              field="teststdt"
              title="시험시작일"
              width="120px"
              cell={DateCell}
            />
            <GridColumn
              field="testenddt"
              title="시험종료일"
              width="120px"
              cell={DateCell}
            />
            <GridColumn field="remark" title="비고" width="200px" />
          </Grid>
        </GridContainer>
        <BottomContainer className="BottomContainer">
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={onConfirmBtnClick}>
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
        </BottomContainer>
      </Window>
      {projectWindowVisible && (
        <ProjectsWindow
          setVisible={setProjectWindowVisible}
          setData={setProjectData}
        />
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
        />
      )}
      {PrsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType="N"
          setData={setPrsnnumData}
        />
      )}
    </>
  );
};

export default SA_A1000W_603_Before_Window;
