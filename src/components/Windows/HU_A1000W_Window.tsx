import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import {
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedNameState,
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseParaPc,
  convertDateToStr,
  toDate,
} from "../CommonFunction";
import { PAGE_SIZE } from "../CommonString";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import ZipCodeWindow from "./CommonWindows/ZipCodeWindow";
import BizComponentRadioGroup from "../RadioGroups/BizComponentRadioGroup";

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
  const [tabSelected, setTabSelected] = useState(0);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption("HU_A1000W", setCustomOptionData);

  const setLoading = useSetRecoilState(isLoading);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  const processApi = useApi();

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
    setTabSelected(e.selected);
  };
  const [zipCodeWindowVisible, setZipCodeWindowVisibile] =
    useState<boolean>(false);
  const [zipCodeWindowVisible2, setZipCodeWindowVisibile2] =
    useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
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
  UseBizComponent("R_BIRCD,R_SEXCD", setBizComponentData);

  const [information, setInformation] = useState<{ [name: string]: any }>({
    //탭1
    prsnnum: "",
    prsnnum2: "",
    dptcd: "",
    nationcd: "",
    path: "",
    prsnnm: "",
    abilcd: "",
    postcd: "",
    rtrdt: null,
    rtrrsn: "",
    prsnnmh: "",
    prsnnme: "",
    schcd: "",
    emptype: "",
    regcd: "",
    perregnum: "",
    sexcd: "M",
    telephon: "",
    phonenum: "",
    extnum: "",
    occudate: null,
    birdt: null,
    bircd: "Y",
    jobcd: "",
    cardcd: "",
    regorgdt: null,
    mailid: "",
    workmail: "",
    firredt: null,
    hmzipcode: "",
    koraddr: "",
    zipcode: "",
    hmaddr: "",
    location: "",
    paycd: "",
    workgb: "",
    workcls: "",
    enaddr: "",
    files: "",
    attdatnum: "",
    remark: "",

    //다른탭
    taxcd: "",
    hirinsuyn: "",
    payyn: "",
    caltaxyn: "",
    yrdclyn: "",
    bankcd: "",
    bankacnt: "",
    bankacntuser: "",
    medgrad: "",
    medinsunum: "",
    pnsgrad: "",
    meddate: "",
    anudate: "",
    hirdate: "",
    sptnum: 0,
    dfmnum: 0,
    agenum: 0,
    agenum70: 0,
    brngchlnum: 0,
    fam1: 0,
    fam2: 0,
    bnskind: "",
    childnum: 0,
    houseyn: "",
    incgb: "",
    exmtaxgb: "",
    exstartdt: "",
    exenddt: "",
    workchk: "",
    yrchk: "",
    bankdatnum: "",
    below2kyn: "",
    dayoffdiv: "",
    rtrtype: "",
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
        setInformation({
          location: rows[0].location,
          prsnnum: rows[0].prsnnum,
          prsnnum2: rows[0].prsnnum2,
          dptcd: rows[0].dptcd,
          nationcd: rows[0].nationcd,
          path: rows[0].path,
          prsnnm: rows[0].prsnnm,
          abilcd: rows[0].abilcd,
          postcd: rows[0].postcd,
          rtrdt: rows[0].rtrdt == "" ? null : toDate(rows[0].rtrdt),
          rtrrsn: rows[0].rtrrsn,
          prsnnmh: rows[0].prsnnmh,
          prsnnme: rows[0].prsnnme,
          schcd: rows[0].schcd,
          emptype: rows[0].emptype,
          regcd: rows[0].regcd,
          perregnum: rows[0].perregnum,
          sexcd: rows[0].sexcd,
          telephon: rows[0].telephon,
          phonenum: rows[0].phonenum,
          extnum: rows[0].extnum,
          occudate: rows[0].occudate == "" ? null : toDate(rows[0].occudate),
          birdt: rows[0].birdt == "" ? null : toDate(rows[0].birdt),
          bircd: rows[0].bircd,
          jobcd: rows[0].jobcd,
          cardcd: rows[0].cardcd,
          regorgdt: rows[0].regorgdt == "" ? null : toDate(rows[0].regorgdt),
          mailid: rows[0].mailid,
          workmail: rows[0].workmail,
          firredt: rows[0].firredt == "" ? null : toDate(rows[0].firredt),
          hmzipcode: rows[0].hmzipcode,
          koraddr: rows[0].koraddr,
          zipcode: rows[0].zipcode,
          hmaddr: rows[0].hmaddr,
          paycd: rows[0].paycd,
          workgb: rows[0].workgb,
          workcls: rows[0].workcls,
          enaddr: rows[0].enaddr,
          files: rows[0].files,
          attdatnum: rows[0].attdatnum,
          remark: rows[0].remark,

          //다른 탭
          taxcd: "",
          hirinsuyn: "",
          payyn: "",
          caltaxyn: "",
          yrdclyn: "",
          bankcd: "",
          bankacnt: "",
          bankacntuser: "",
          medgrad: "",
          medinsunum: "",
          pnsgrad: "",
          meddate: "",
          anudate: "",
          hirdate: "",
          sptnum: 0,
          dfmnum: 0,
          agenum: 0,
          agenum70: 0,
          brngchlnum: 0,
          fam1: 0,
          fam2: 0,
          bnskind: "",
          childnum: 0,
          houseyn: "",
          incgb: "",
          exmtaxgb: "",
          exstartdt: "",
          exenddt: "",
          workchk: "",
          yrchk: "",
          bankdatnum: "",
          below2kyn: "",
          dayoffdiv: "",
          rtrtype: "",
        });
      } else {
        setInformation({
          //탭1
          prsnnum: "",
          prsnnum2: "",
          dptcd: "",
          nationcd: "",
          path: "",
          prsnnm: "",
          abilcd: "",
          postcd: "",
          rtrdt: null,
          rtrrsn: "",
          prsnnmh: "",
          prsnnme: "",
          schcd: "",
          emptype: "",
          regcd: "",
          perregnum: "",
          sexcd: "M",
          telephon: "",
          phonenum: "",
          extnum: "",
          occudate: null,
          birdt: null,
          bircd: "Y",
          jobcd: "",
          cardcd: "",
          regorgdt: null,
          mailid: "",
          workmail: "",
          firredt: null,
          hmzipcode: "",
          koraddr: "",
          zipcode: "",
          hmaddr: "",
          location: "",
          paycd: "",
          workgb: "",
          workcls: "",
          enaddr: "",
          files: "",
          attdatnum: "",
          remark: "",

          //다른탭
          taxcd: "",
          hirinsuyn: "",
          payyn: "",
          caltaxyn: "",
          yrdclyn: "",
          bankcd: "",
          bankacnt: "",
          bankacntuser: "",
          medgrad: "",
          medinsunum: "",
          pnsgrad: "",
          meddate: "",
          anudate: "",
          hirdate: "",
          sptnum: 0,
          dfmnum: 0,
          agenum: 0,
          agenum70: 0,
          brngchlnum: 0,
          fam1: 0,
          fam2: 0,
          bnskind: "",
          childnum: 0,
          houseyn: "",
          incgb: "",
          exmtaxgb: "",
          exstartdt: "",
          exenddt: "",
          workchk: "",
          yrchk: "",
          bankdatnum: "",
          below2kyn: "",
          dayoffdiv: "",
          rtrtype: "",
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
    }
  }, []);

  const selectData = (selectedData: any) => {
    if (tabSelected == 0) {
      setParaData({
        work_type: workType,
        orgdiv: "01",
        location: information.location,
        prsnnum: information.prsnnum,
        prsnnm: information.prsnnm,
        perregnum: information.perregnum,
        birdt:
          information.birdt == null ? "" : convertDateToStr(information.birdt),
        bircd: information.bircd,
        sexcd: information.sexcd,
        firredt:
          information.firredt == null
            ? ""
            : convertDateToStr(information.firredt),
        regorgdt:
          information.regorgdt == null
            ? ""
            : convertDateToStr(information.regorgdt),
        rtrdt:
          information.rtrdt == null ? "" : convertDateToStr(information.rtrdt),
        zipcode: information.zipcode,
        koraddr: information.koraddr,
        hmaddr: information.hmaddr,
        phonenum: information.phonenum,
        extnum: information.extnum,
        paycd: information.paycd,
        taxcd: information.taxcd,
        hirinsuyn: information.hirinsuyn,
        payyn: information.payyn,
        caltaxyn: information.caltaxyn,
        yrdclyn: information.yrdclyn,
        bankcd: information.bankcd,
        bankacnt: information.bankacnt,
        bankacntuser: information.bankacntuser,
        medgrad: information.medgrad,
        medinsunum: information.medgrad,
        pnsgrad: information.pnsgrad,
        meddate: information.meddate,
        anudate: information.anudate,
        hirdate: information.hirdate,
        sptnum: information.sptnum,
        dfmnum: information.dfmnum,
        agenum: information.agenum,
        agenum70: information.agenum70,
        brngchlnum: information.brngchlnum,
        fam1: information.fam1,
        fam2: information.fam2,
        bnskind: information.bnskind,
        childnum: information.childnum,
        houseyn: information.houseyn,
        remark: information.remark,
        attdatnum: information.attdatnum,
        incgb: information.incgb,
        exmtaxgb: information.exmtaxgb,
        exstartdt: information.exstartdt,
        exenddt: information.exenddt,
        workchk: information.workchk,
        yrchk: information.yrchk,
        bankdatnum: information.bankdatnum,
        below2kyn: information.below2kyn,
        occudate:
          information.occudate == null
            ? ""
            : convertDateToStr(information.occudate),
        dayoffdiv: information.dayoffdiv,
        rtrtype: information.rtrtype,
      });
    }
  };

  const [ParaData, setParaData] = useState({
    work_type: "",
    orgdiv: "01",
    location: "01",
    prsnnum: "",
    prsnnm: "",
    perregnum: "",
    birdt: "",
    bircd: "",
    sexcd: "",
    firredt: "",
    regorgdt: "",
    rtrdt: "",
    zipcode: "",
    koraddr: "",
    hmaddr: "",
    phonenum: "",
    extnum: "",
    paycd: "",
    taxcd: "",
    hirinsuyn: "",
    payyn: "",
    caltaxyn: "",
    yrdclyn: "",
    bankcd: "",
    bankacnt: "",
    bankacntuser: "",
    medgrad: "",
    medinsunum: "",
    pnsgrad: "",
    meddate: "",
    anudate: "",
    hirdate: "",
    sptnum: 0,
    dfmnum: 0,
    agenum: 0,
    agenum70: 0,
    brngchlnum: 0,
    fam1: 0,
    fam2: 0,
    bnskind: "",
    childnum: 0,
    houseyn: "",
    remark: "",
    attdatnum: "",
    incgb: "",
    exmtaxgb: "",
    exstartdt: "",
    exenddt: "",
    workchk: "",
    yrchk: "",
    bankdatnum: "",
    below2kyn: "",
    occudate: "",
    dayoffdiv: "",
    rtrtype: "",
  });

  //삭제 프로시저 파라미터
  const para: Iparameters = {
    procedureName: "P_HU_A1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.work_type,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_prsnnum": ParaData.prsnnum,
      "@p_prsnnm": ParaData.prsnnm,
      "@p_perregnum": ParaData.perregnum,
      "@p_birdt": ParaData.birdt,
      "@p_bircd": ParaData.bircd,
      "@p_sexcd": ParaData.sexcd,
      "@p_firredt": ParaData.firredt,
      "@p_regorgdt": ParaData.regorgdt,
      "@p_rtrdt": ParaData.rtrdt,
      "@p_zipcode": ParaData.zipcode,
      "@p_koraddr": ParaData.koraddr,
      "@p_hmaddr": ParaData.hmaddr,
      "@p_phonenum": ParaData.phonenum,
      "@p_extnum": ParaData.extnum,
      "@p_paycd": ParaData.paycd,
      "@p_taxcd": ParaData.taxcd,
      "@p_hirinsuyn": ParaData.hirinsuyn,
      "@p_payyn": ParaData.payyn,
      "@p_caltaxyn": ParaData.caltaxyn,
      "@p_yrdclyn": ParaData.yrdclyn,
      "@p_bankcd": ParaData.bankcd,
      "@p_bankacnt": ParaData.bankacnt,
      "@p_bankacntuser": ParaData.bankacntuser,
      "@p_medgrad": ParaData.medgrad,
      "@p_medinsunum": ParaData.medinsunum,
      "@p_pnsgrad": ParaData.pnsgrad,
      "@p_meddate": ParaData.meddate,
      "@p_anudate": ParaData.anudate,
      "@p_hirdate": ParaData.hirdate,
      "@p_sptnum": ParaData.sptnum,
      "@p_dfmnum": ParaData.dfmnum,
      "@p_agenum": ParaData.agenum,
      "@p_agenum70": ParaData.agenum70,
      "@p_brngchlnum": ParaData.brngchlnum,
      "@p_fam1": ParaData.fam1,
      "@p_fam2": ParaData.fam2,
      "@p_bnskind": ParaData.bnskind,
      "@p_childnum": ParaData.childnum,
      "@p_houseyn": ParaData.houseyn,
      "@p_remark": ParaData.remark,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_incgb": ParaData.incgb,
      "@p_exmtaxgb": ParaData.exmtaxgb,
      "@p_exstartdt": ParaData.exstartdt,
      "@p_exenddt": ParaData.exenddt,
      "@p_workchk": ParaData.workchk,
      "@p_yrchk": ParaData.yrchk,
      "@p_bankdatnum": ParaData.bankdatnum,
      "@p_below2kyn": ParaData.below2kyn,
      "@p_occudate": ParaData.occudate,
      "@p_dayoffdiv": ParaData.dayoffdiv,
      "@p_rtrtype": ParaData.rtrtype,
      "@p_form_id": "HU_A1000W",
      "@p_userid": userId,
      "@p_pc": pc,
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
      if (tabSelected == 0) {
        setUnsavedName([]);
      }

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
      }
      setParaData({
        work_type: "",
        orgdiv: "",
        location: "",
        prsnnum: "",
        prsnnm: "",
        perregnum: "",
        birdt: "",
        bircd: "",
        sexcd: "",
        firredt: "",
        regorgdt: "",
        rtrdt: "",
        zipcode: "",
        koraddr: "",
        hmaddr: "",
        phonenum: "",
        extnum: "",
        paycd: "",
        taxcd: "",
        hirinsuyn: "",
        payyn: "",
        caltaxyn: "",
        yrdclyn: "",
        bankcd: "",
        bankacnt: "",
        bankacntuser: "",
        medgrad: "",
        medinsunum: "",
        pnsgrad: "",
        meddate: "",
        anudate: "",
        hirdate: "",
        sptnum: 0,
        dfmnum: 0,
        agenum: 0,
        agenum70: 0,
        brngchlnum: 0,
        fam1: 0,
        fam2: 0,
        bnskind: "",
        childnum: 0,
        houseyn: "",
        remark: "",
        attdatnum: "",
        incgb: "",
        exmtaxgb: "",
        exstartdt: "",
        exenddt: "",
        workchk: "",
        yrchk: "",
        bankdatnum: "",
        below2kyn: "",
        occudate: "",
        dayoffdiv: "",
        rtrtype: "",
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
          style={{ width: "100%" }}
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
                      <Input
                        name="perregnum"
                        type="text"
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
          <TabStripTab title="인사상세"></TabStripTab>
          <TabStripTab title="개인정보"></TabStripTab>
          <TabStripTab title="병역사항"></TabStripTab>
          <TabStripTab
            title="가족관계"
            disabled={workType == "N" ? true : false}
          ></TabStripTab>
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
          <div>※ 저장 후 현재 탭만 저장되며, 저장 후 새로고침됩니다.</div>
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
    </>
  );
};

export default CopyWindow;
