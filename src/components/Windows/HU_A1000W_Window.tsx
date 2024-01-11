import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { Input, MaskedTextBox, TextArea } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import CryptoJS from "crypto-js";
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
import BizComponentRadioGroup from "../RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import ZipCodeWindow from "./CommonWindows/ZipCodeWindow";

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
    laboryn: "",
    dfmyn: "",
    milyn: "",
    paycd: "",
    taxcd: "",
    hirinsuyn: "",
    payyn: "",
    rtrgivdiv: "",
    yrgivdiv: "",
    mongivdiv: "",
    caltaxyn: "",
    yrdclyn: "",
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
    sps: "",
    wmn: "",
    sptnum: 0,
    dfmnum: 0,
    agenum: 0,
    agenum70: 0,
    brngchlnum: 0,
    fam1: 0,
    fam2: 0,
    notaxe: "",
    otkind: "",
    bnskind: "",
    payprovyn: "",
    mailid: "",
    workmail: "",
    childnum: 0,
    dfmyn2: "",
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
    workchk: "",
    yrchk: "",

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

    below2kyn: "",
    occudate: "",
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

  function isResidentRegNoValid(residentRegNo: any) {
    var re = /^[0-9]{6}-[0-9]{7}$/;
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
    var decrypted = CryptoJS.AES.decrypt(encrypted, secretKey);
    var text = decrypted.toString(CryptoJS.enc.Utf8);
    return text;
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
      const perregnum = decrypt(rows[0].perregnum, rows[0].salt);
      const telephon = decrypt(rows[0].telephon, rows[0].salt);
      const phonenum = decrypt(rows[0].phonenum, rows[0].salt);

      if (totalRowCnt > 0) {
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
          laboryn: "",
          dfmyn: "",
          milyn: "",
          paycd: rows[0].paycd,

          taxcd: "",
          hirinsuyn: "",
          payyn: "",
          rtrgivdiv: "",
          yrgivdiv: "",
          mongivdiv: "",
          caltaxyn: "",
          yrdclyn: "",
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
          sps: "",
          wmn: "",
          sptnum: 0,
          dfmnum: 0,
          agenum: 0,
          agenum70: 0,
          brngchlnum: 0,
          fam1: 0,
          fam2: 0,
          notaxe: "",
          otkind: "",
          bnskind: "",
          payprovyn: "",
          mailid: rows[0].mailid,
          workmail: rows[0].workmail,
          childnum: 0,
          dfmyn2: "",
          houseyn: "",
          remark: rows[0].remark,
          costdiv1: "",
          costdiv2: "",
          path: rows[0].path,
          files: rows[0].files,
          attdatnum: rows[0].attdatnum,
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
          workchk: "",
          yrchk: "",

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

          below2kyn: "",
          occudate: rows[0].occudate == "" ? null : toDate(rows[0].occudate),
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
          laboryn: "",
          dfmyn: "",
          milyn: "",
          paycd: "",
          taxcd: "",
          hirinsuyn: "",
          payyn: "",
          rtrgivdiv: "",
          yrgivdiv: "",
          mongivdiv: "",
          caltaxyn: "",
          yrdclyn: "",
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
          sps: "",
          wmn: "",
          sptnum: 0,
          dfmnum: 0,
          agenum: 0,
          agenum70: 0,
          brngchlnum: 0,
          fam1: 0,
          fam2: 0,
          notaxe: "",
          otkind: "",
          bnskind: "",
          payprovyn: "",
          mailid: "",
          workmail: "",
          childnum: 0,
          dfmyn2: "",
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
          workchk: "",
          yrchk: "",

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

          below2kyn: "",
          occudate: "",
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
    laboryn: "",
    dfmyn: "",
    milyn: "",
    paycd: "",
    taxcd: "",
    hirinsuyn: "",
    payyn: "",
    rtrgivdiv: "",
    yrgivdiv: "",
    mongivdiv: "",
    caltaxyn: "",
    yrdclyn: "",
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
    sps: "",
    wmn: "",
    sptnum: 0,
    dfmnum: 0,
    agenum: 0,
    agenum70: 0,
    brngchlnum: 0,
    fam1: 0,
    fam2: 0,
    notaxe: "",
    otkind: "",
    bnskind: "",
    payprovyn: "",
    mailid: "",
    workmail: "",
    childnum: 0,
    dfmyn2: "",
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
    workchk: "",
    yrchk: "",

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

    below2kyn: "",
    occudate: "",
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
        laboryn: "",
        dfmyn: "",
        milyn: "",
        paycd: "",
        taxcd: "",
        hirinsuyn: "",
        payyn: "",
        rtrgivdiv: "",
        yrgivdiv: "",
        mongivdiv: "",
        caltaxyn: "",
        yrdclyn: "",
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
        sps: "",
        wmn: "",
        sptnum: 0,
        dfmnum: 0,
        agenum: 0,
        agenum70: 0,
        brngchlnum: 0,
        fam1: 0,
        fam2: 0,
        notaxe: "",
        otkind: "",
        bnskind: "",
        payprovyn: "",
        mailid: "",
        workmail: "",
        childnum: 0,
        dfmyn2: "",
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
        workchk: "",
        yrchk: "",

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

        below2kyn: "",
        occudate: "",
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
                      <MaskedTextBox
                        mask="000000-0000000"
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
                    
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </TabStripTab>
          <TabStripTab
            title="개인정보"
            disabled={workType == "N" ? true : false}
          ></TabStripTab>
          <TabStripTab
            title="병역사항"
            disabled={workType == "N" ? true : false}
          ></TabStripTab>
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
