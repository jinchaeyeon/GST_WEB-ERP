import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import CryptoJS from "crypto-js";
import { OrganizationChart } from "primereact/organizationchart";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import "swiper/css";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import DateCell from "../components/Cells/DateCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  getBizCom,
  getDeviceHeight,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import DetailWindow from "../components/Windows/HU_A1000W_Window";
import { useApi } from "../hooks/api";
import {
  deletedAttadatnumsState,
  isLoading,
  loginResultState,
} from "../store/atoms";
import { gridList } from "../store/columns/HU_A1000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var index = 0;

const dateField = ["regorgdt", "rtrdt"];
interface IPrsnnum {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}

interface NodeData {
  name: string;
  image: string;
  title: string;
}

interface Node {
  type: string;
  label: string;
  data: NodeData;
}

interface Department {
  dptcd: string;
  dptnm: string;
  prntdptcd: string;
  children?: Department[];
}
interface BaseDataItem {
  expanded: boolean;
  label: string;
}

interface DataItem extends BaseDataItem {
  expanded: boolean;
  label: string;
  children: (DataItem | DataItem3)[];
}

interface DataItem3 {
  expanded: boolean;
  type: string;
  data: {
    image: string;
    name: string;
    title: string | undefined;
  };
  children: DataItem3[];
}

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;

var height = 0;
var height2 = 0;

const HU_A1000W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_A1000W", setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setWebHeight(getDeviceHeight(true) - height - height2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");

  //조직도
  const [showOrg, setShowOrg] = useState(false);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [information, setInformation] = useState<
    Array<{
      expanded: boolean;
      type: string;
      data: {
        name: string;
        image: string;
        title: string;
      };
      children: DataItem3[];
    }>
  >([]);

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        rtrchk: defaultOption.find((item: any) => item.id == "rtrchk")
          ?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_A1000W", setMessagesData);

  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_dptcd_001,L_HU005", setBizComponentData);
  //공통코드 리스트 조회 ()
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [dptcdListData2, setDptcdListData2] = useState([
    { dptcd: "", dptnm: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdData = getBizCom(bizComponentData, "L_dptcd_001");
      setDptcdListData2(dptcdData);
      setpostcdListData(getBizCom(bizComponentData, "L_HU005"));
      setdptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
    }
  }, [bizComponentData]);

  const search = () => {
    resetAllGrid();
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };
  const [workType, setWorkType] = useState<"N" | "U">("N");
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);

  const onAddClick = () => {
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.num]: true });

      setWorkType("U");
      setDetailWindowVisible(true);
    };

    return (
      <td className="k-command-cell">
        <Button
          className="k-grid-edit-command"
          themeColor={"primary"}
          fillMode="outline"
          onClick={onEditClick}
          icon="edit"
        ></Button>
      </td>
    );
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

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

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "기본정보";
      _export.save(optionsGridOne);
    }
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    setuserWindowVisible(true);
  };
  const setUserData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "UserList",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    dptcd: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
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

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

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
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

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
    setMainDataResult(process([], mainDataState));
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const decrypt = (encrypted: any, secretKey: any) => {
    try {
      var decrypted = CryptoJS.AES.decrypt(encrypted, secretKey).toString(
        CryptoJS.enc.Utf8
      );
      return decrypted;
    } catch (e) {
      console.log(e);
    }
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

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult.total > 0) {
      const datas = mainDataResult.data.filter(
        (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        prsnnum: datas.prsnnum,
        attdatnum: datas.attdatnum,
        bankdatnum: datas.bankdatnum,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    prsnnum: "",
    attdatnum: "",
    bankdatnum: "",
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_HU_A1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": sessionOrgdiv,
      "@p_prsnnum": paraDataDeleted.prsnnum,
      "@p_prsnnum2": "",
      "@p_location": "",
      "@p_position": "",
      "@p_workplace": "",
      "@p_prsnnm": "",
      "@p_prsnnmh": "",
      "@p_prsnnme": "",
      "@p_nationcd": "",
      "@p_cardcd": "",
      "@p_dptcd": "",
      "@p_dptnm": "",
      "@p_postcd": "",
      "@p_ocptcd": "",
      "@p_workgb": "",
      "@p_workcls": "",
      "@p_jobcd": "",
      "@p_abilcd": "",
      "@p_paygrad": "",
      "@p_salaryclass": "",
      "@p_regcd": "",
      "@p_perregnum": "",
      "@p_salt": "",
      "@p_birdt": "",
      "@p_bircd": "",
      "@p_sexcd": "",
      "@p_firredt": "",
      "@p_regorgdt": "",
      "@p_rtrdt": "",
      "@p_rtrrsn": "",
      "@p_emptype": "",
      "@p_zipcode": "",
      "@p_koraddr": "",
      "@p_hmzipcode": "",
      "@p_hmaddr": "",
      "@p_enaddr": "",
      "@p_telephon": "",
      "@p_phonenum": "",
      "@p_extnum": "",
      "@p_outnum": "",
      "@p_schcd": "",
      "@p_laboryn": "",
      "@p_dfmyn": "",
      "@p_milyn": "",
      "@p_paycd": "",
      "@p_taxcd": "",
      "@p_hirinsuyn": "",
      "@p_payyn": "",
      "@p_caltaxyn": "",
      "@p_yrdclyn": "",
      "@p_bankcd": "",
      "@p_bankacnt": "",
      "@p_bankacntuser": "",
      "@p_bankdatnum": "",
      "@p_medgrad": "",
      "@p_medinsunum": "",
      "@p_pnsgrad": "",
      "@p_meddate": "",
      "@p_anudate": "",
      "@p_hirdate": "",
      "@p_sps": "",
      "@p_wmn": "",
      "@p_sptnum": 0,
      "@p_dfmnum": 0,
      "@p_agenum": 0,
      "@p_agenum70": 0,
      "@p_brngchlnum": 0,
      "@p_fam1": 0,
      "@p_fam2": 0,
      "@p_notaxe": "",
      "@p_bnskind": "",
      "@p_mailid": "",
      "@p_workmail": "",
      "@p_childnum": 0,
      "@p_dfmyn2": "",
      "@p_houseyn": "",
      "@p_remark": "",
      "@p_path": "",
      "@p_attdatnum": "",
      "@p_incgb": "",
      "@p_exmtaxgb": "",
      "@p_exstartdt": "",
      "@p_exenddt": "",
      "@p_dayoffdiv": "",
      "@p_rtrtype": "",

      "@p_userid": userId,
      "@p_pc": pc,

      "@p_workchk": "",
      "@p_yrchk": "",

      //개인정보
      "@p_height": 0,
      "@p_weight": 0,
      "@p_blood": "",
      "@p_color": "",
      "@p_leye": 0,
      "@p_reye": 0,
      "@p_hobby": "",
      "@p_hobby2": "",
      "@p_religion": "",
      "@p_marriage": "",
      "@p_marrydt": "",
      "@p_orgaddr": "",
      "@p_birthplace": "",
      "@p_size1": "",
      "@p_size2": "",
      "@p_size3": "",
      "@p_photodatnum": "",

      "@p_armygb": "",
      "@p_armystartdt": "",
      "@p_armyenddt": "",
      "@p_armyclass": "",
      "@p_armyexrsn": "",
      "@p_armydistinctiom": "",
      "@p_armyrank": "",
      "@p_militarynum": "",
      "@p_armykind": "",
      "@p_armyspeciality": "",

      "@p_below2kyn": "",
      "@p_occudate": "",

      "@p_form_id": "HU_A1000W",
    },
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
      const isLastDataDeleted =
        mainDataResult.data.length == 1 && filters.pgNum > 0;
      const findRowIndex = mainDataResult.data.findIndex(
        (row: any) =>
          row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      );

      let array: any[] = [];

      if (paraDataDeleted.attdatnum) {
        array.push(paraDataDeleted.attdatnum);
      }

      if (paraDataDeleted.bankdatnum) {
        array.push(paraDataDeleted.bankdatnum);
      }

      setDeletedAttadatnums(array);

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
          find_row_value:
            mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
              .prsnnum,
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
      prsnnum: "",
      attdatnum: "",
      bankdatnum: "",
    }));
  };

  useEffect(() => {
    if (paraDataDeleted.work_type != "" && permissions.delete) fetchToDelete();
  }, [paraDataDeleted, permissions]);

  // 조직도
  const [tree, setTree] = useState<Department[]>([]);
  const idToNodeMap: { [key: string]: Department } = {};
  // 부서조회
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    dptcd: "",
    dptnm: "",
    user_name: "",
    serviceid: companyCode,
    find_row_value: "",
    pgNum: 1,
  });

  // 프로필 사진조회
  const [picFilters, setpicFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST",
    cboOrgdiv: sessionOrgdiv,
    cboLocation: "",
    dptcd: "",
    lang_id: "",
    user_category: "",
    user_id: "",
    user_name: "",
    radRtrchk: "%",
    radUsediv: "%",
    find_row_value: "",
    pgNum: 1,
  });

  // 부서 조회 후 트리형식으로 변환
  const fetchData2 = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    const subparameters: Iparameters = {
      procedureName: "P_SY_A0125W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": sessionLocation,
        "@p_dptcd": filters2.dptcd,
        "@p_dptnm": filters2.dptnm,
        "@p_user_name": filters2.user_name,
        "@p_serviceid": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      // 트리 구조로 변환하는 함수
      rows.forEach((row: Department) => {
        const nodeId: string = row.dptcd; // 노드의 고유 식별자
        const parentId: string = row.prntdptcd; // 부모 노드의 고유 식별자

        // 노드 생성
        const node: Department = { ...row, children: [] };

        // idToNodeMap에 노드 추가
        idToNodeMap[nodeId] = node;

        // 부모 노드가 없는 경우 최상위 노드로 처리
        if (parentId === "") {
          tree.push(node);
        } else {
          // 부모 노드가 있는 경우 부모 노드에 자식 노드로 추가
          const parentNode = idToNodeMap[parentId];
          if (parentNode) {
            if (row.prntdptcd === parentNode.dptcd) {
              parentNode.children = parentNode.children ?? [];
              parentNode.children.push(node);
            }
          }
        }
      });
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
  };

  // id, 프로필 이미지
  const fetchData3 = async (picFilters: any) => {
    if (!permissions.view) return;
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0012W_Q",
      pageNumber: picFilters.pgNum,
      pageSize: picFilters.pgSize,
      parameters: {
        "@p_work_type": picFilters.work_type,
        "@p_orgdiv": picFilters.cboOrgdiv,
        "@p_location": picFilters.cboLocation,
        "@p_dptcd": "",
        "@p_lang_id": picFilters.lang_id,
        "@p_user_category": picFilters.user_category,
        "@p_user_id": picFilters.user_id,
        "@p_user_name": picFilters.user_name,
        "@p_rtrchk": picFilters.radRtrchk == "T" ? "%" : picFilters.radRtrchk,
        "@p_usediv": picFilters.radUsediv,
        "@p_find_row_value": picFilters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      const informationData = rows.map((row: any) => ({
        dptcd: row.dptcd,
        expanded: false,
        type: "person",
        data: {
          image: row.profile_image
            ? `data:image/jpeg;base64,${row.profile_image}`
            : "/logo192.png",
          name: row.user_name,
          title: row.postcd,
        },
        children: [],
      }));
      setInformation(informationData);
    }
  };

  const orgData = (data: any[], information: any[]): DataItem[] => {
    const departmentNodes: DataItem[] = [];

    // 각 부서에 대한 노드 생성
    data.forEach((item) => {
      const matchingUsers = information.filter(
        (user) => user.dptcd === item.dptcd
      );

      // 사용자 데이터를 필터링하고 직위 코드 순으로 정렬
      const usersData = matchingUsers
        .filter((user) => user.data.title !== "01") // title이 "01"이 아닌 사용자만 필터링
        .map((user) => ({
          ...user,
          children: [] as DataItem3[],
        }))
        .sort((a, b) => a.data.title.localeCompare(b.data.title));

      // 각 사용자에 대해 자식 노드를 추가
      const userMap: { [key: string]: DataItem3 } = {};
      usersData.forEach((user) => {
        userMap[user.data.name] = user;
      });

      usersData.forEach((user) => {
        const parent = usersData.find(
          (u) => u.dptcd === user.dptcd && u.data.title < user.data.title // 직위 코드가 낮을수록 상위 직위
        );
        if (parent) {
          parent.children.push(user);
        }
      });

      // 숫자로 정렬된 후 각 title을 한글로 변환
      usersData.forEach((user) => {
        const matchedPostcdItem = postcdListData.find(
          (postcdItem) => postcdItem.sub_code === user.data.title
        );
        if (matchedPostcdItem) {
          user.data.title = matchedPostcdItem.code_name;
        }
      });

      // 최상위 사용자들만 필터링
      const topUsers = usersData.filter(
        (user) => !usersData.some((u) => u.children.includes(user))
      );

      const userNodes: DataItem3[] = topUsers.map((user) => ({
        expanded: false,
        type: "person",
        data: {
          image: user.data.image,
          name: user.data.name,
          title: user.data.title,
        },
        children: user.children,
      }));

      const childrenNodes = item.children
        ? orgData(item.children, information)
        : [];

      // departmentNode를 생성하고 children에 사용자 데이터를 추가
      const departmentNode: DataItem = {
        label: item.dptnm,
        expanded: childrenNodes.length > 0 || userNodes.length > 0,
        children: [...childrenNodes, ...userNodes],
      };

      // departmentNodes 배열에 해당 부서 노드 추가
      departmentNodes.push(departmentNode);
    });

    return departmentNodes;
  };

  // 최상위 노드 생성
  const transformedData = [
    {
      expanded: true,
      type: "person",
      data: {
        image: "",
        name: "",
        title: "",
      },
      children: orgData(tree, information), // 하위 부서 및 사용자 정보 추가
    },
  ];

  // 대표이사 정보 찾기
  const ceo = information.find((user) => user.data.title === "01");

  // 대표이사 정보가 있을 경우 데이터 설정
  if (ceo) {
    transformedData[0].data.name = ceo.data.name;
    transformedData[0].data.title = "대표이사";
    transformedData[0].data.image = ceo.data.image;
  }

  useEffect(() => {
    if (
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      fetchData2(filters2);
      fetchData3(picFilters);
    }
  }, [permissions, bizComponentData, customOptionData]);

  const [selection, setSelection] = useState([]);

  const nodeTemplate = (node: Node) => {
    if (node.type === "person") {
      return (
        <div className="flex flex-column">
          <div className="flex flex-column align-items-center">
            <img
              alt={node.data.name}
              src={node.data.image}
              className="mb-3 w-3rem h-3rem"
            />
            <span className="font-bold mb-2">{node.data.name}</span>
            <span>{node.data.title}</span>
          </div>
        </div>
      );
    }

    return node.label;
  };
  const OrgData = () => {
    return (
      <div
        style={{
          overflow: "auto",
          height: isMobile ? mobileheight : webheight,
        }}
      >
        <OrganizationChart
          value={transformedData}
          selectionMode="multiple"
          selection={selection}
          nodeTemplate={nodeTemplate}
        />
      </div>
    );
  };

  useEffect(() => {
    if (showOrg) {
      OrgData();
    }
  }, [showOrg]);

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
              pathname="HU_A1000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>부서코드</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
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
                    onClick={onUserWndClick}
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
              <th>재직여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="rtrchk"
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
        <GridContainer style={{ width: "100%", overflow: "auto" }}>
          <GridTitleContainer className="ButtonContainer">
            <ButtonContainer>
              <Button
                onClick={() => setShowOrg(!showOrg)}
                themeColor={"primary"}
                disabled={permissions.view ? false : true}
              >
                {showOrg ? "리스트 보기" : "조직도 보기"}
              </Button>
            </ButtonContainer>
            <ButtonContainer style={{ paddingTop: "5px" }}>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="file-add"
                disabled={permissions.save ? false : true}
              >
                사용자생성
              </Button>
              <Button
                onClick={onDeleteClick}
                icon="delete"
                fillMode="outline"
                themeColor={"primary"}
                disabled={permissions.delete ? false : true}
              >
                사용자삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>

          {showOrg ? (
            OrgData()
          ) : (
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="인사관리"
            >
              <Grid
                style={{
                  height: mobileheight,
                }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    dptcd: dptcdListData.find(
                      (item: any) => item.dptcd == row.dptcd
                    )?.dptnm,
                    postcd: postcdListData.find(
                      (item: any) => item.sub_code == row.postcd
                    )?.code_name,
                    perregnum:
                      row.perregnum == "" ||
                      row.perregnum == null ||
                      row.perregnum == undefined
                        ? ""
                        : decrypt(row.perregnum, row.salt),
                    telephon:
                      row.telephon == "" ||
                      row.telephon == null ||
                      row.telephon == undefined
                        ? ""
                        : decrypt(row.telephon, row.salt),
                    phonenum:
                      row.phonenum == "" ||
                      row.phonenum == null ||
                      row.phonenum == undefined
                        ? ""
                        : decrypt(row.phonenum, row.salt),
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
                <GridColumn cell={CommandCell} width="50px" />
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
                              dateField.includes(item.fieldName)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
                                ? mainTotalFooterCell
                                : undefined
                            }
                          ></GridColumn>
                        )
                    )}
              </Grid>
            </ExcelExport>
          )}
        </GridContainer>
      ) : (
        <>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>{!showOrg ? "기본정보" : "조직도"}</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={() => setShowOrg(!showOrg)}
                  themeColor={"primary"}
                  disabled={permissions.view ? false : true}
                >
                  {showOrg ? "리스트 보기" : "조직도 보기"}
                </Button>
                <Button
                  onClick={onAddClick}
                  themeColor={"primary"}
                  icon="file-add"
                  disabled={permissions.save ? false : true}
                >
                  사용자생성
                </Button>
                <Button
                  onClick={onDeleteClick}
                  icon="delete"
                  fillMode="outline"
                  themeColor={"primary"}
                  disabled={permissions.delete ? false : true}
                >
                  사용자삭제
                </Button>
              </ButtonContainer>
            </GridTitleContainer>

            {showOrg ? (
              OrgData()
            ) : (
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="인사관리"
              >
                <Grid
                  style={{ height: webheight }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      dptcd: dptcdListData.find(
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
                      postcd: postcdListData.find(
                        (item: any) => item.sub_code == row.postcd
                      )?.code_name,
                      perregnum:
                        row.perregnum == "" ||
                        row.perregnum == null ||
                        row.perregnum == undefined
                          ? ""
                          : decrypt(row.perregnum, row.salt),
                      telephon:
                        row.telephon == "" ||
                        row.telephon == null ||
                        row.telephon == undefined
                          ? ""
                          : decrypt(row.telephon, row.salt),
                      phonenum:
                        row.phonenum == "" ||
                        row.phonenum == null ||
                        row.phonenum == undefined
                          ? ""
                          : decrypt(row.phonenum, row.salt),
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
                  <GridColumn cell={CommandCell} width="50px" />
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
                                dateField.includes(item.fieldName)
                                  ? DateCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell
                                  : undefined
                              }
                            ></GridColumn>
                          )
                      )}
                </Grid>
              </ExcelExport>
            )}
          </GridContainer>
        </>
      )}
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          reload={(str) => {
            setFilters((prev) => ({
              ...prev,
              find_row_value: str,
              isSearch: true,
            }));
          }}
          data={
            mainDataResult.data.filter(
              (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
            )[0] == undefined
              ? ""
              : mainDataResult.data.filter(
                  (item) =>
                    item.num == Object.getOwnPropertyNames(selectedState)[0]
                )[0]
          }
          modal={true}
          pathname="HU_A1000W"
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

export default HU_A1000W;
