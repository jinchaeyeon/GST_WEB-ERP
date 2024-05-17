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
import { bytesToBase64 } from "byte-base64";
import CryptoJS from "crypto-js";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
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
import DateCell from "../components/Cells/DateCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  getHeight,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import DetailWindow from "../components/Windows/HU_A1000W_Window";
import { useApi } from "../hooks/api";
import {
  deletedAttadatnumsState,
  heightstate,
  isLoading,
  loginResultState,
} from "../store/atoms";
import { gridList } from "../store/columns/HU_A1000W_C";
import sidoData from "../store/map/sido.json";
import sigData from "../store/map/sig.json";
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

interface OrgProps {
  user_name: string;
  postcd: string | undefined;
  profile_img?: string;
  backgroundColor: string;
}

interface OrgData {
  orgdiv: string;
  dptcd: string;
  dptnm: string;
  location: string;
  mfcsaldv: string;
  prntdptcd: string;
  prntdptnm: string;
  refdptcd: string;
  remark: string;
  useyn: string;
  postcd: string;
}

// 직급별 정렬
const getPositionOrder = (postcd: string): number => {
  switch (postcd) {
    case "PM":
      return 1;
    case "팀장":
      return 2;
    case "주임":
      return 3;
    case "사원":
      return 4;
    default:
      return 5;
  }
};

// 지도 직원 거주지 클러스터링 위해 페이지 사이즈 임의로 늘림
const PAGE_SIZE = 10000;

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
const HU_A1000W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  let isMobile = deviceWidth <= 1200;
  var height = getHeight(".ButtonContainer");

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_A1000W", setCustomOptionData);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  UseParaPc(setPc);

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

  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_dptcd_001"
        )
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_HU005")
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

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

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
    isSearch: true,
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
    if (filters.isSearch && customOptionData !== null) {
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
    if (paraDataDeleted.work_type != "") fetchToDelete();
  }, [paraDataDeleted]);

  // 지도

  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [newMainDataResult, setNewMainDataResult] = useState<any>(null);

  const convertAddressToLatLng = async () => {
    setLoading(true);
    const apiKey = "2ff229205b565c4bb29089b6569c6ee8"; // 여기에 실제 API 키를 입력하세요.
    const newResults = await mainDataResult.data.reduce(
      async (accPromise, item) => {
        const acc = await accPromise;
        if (!item.koraddr || item.koraddr.trim() == "") {
          // 주소가 비어있는 경우, 변환 없이 현재 아이템을 결과에 추가하지 않음
          return acc;
        }

        const address = item.koraddr.trim();
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
          content: `<div style=" width:150px; text-align:center; padding:6px 10px; font-size:14px; font-weight:700;">${item.prsnnm}</div>`,
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
          // 선택된 행의 키 저장
          setSelectedState({ [item[DATA_ITEM_KEY]]: true });
        });
        markers.push(marker);
      });
    }
    return markers;
  };

  // 조직도
  const [showOrg, setShowOrg] = useState(false);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [information, setInformation] = useState<OrgData[]>([]);
  const [information2, setInformation2] = useState<OrgProps[]>([]);
  const [combinedResult, setCombinedResult] = useState<any[]>([]);
  const [profileImg, setProfileImg] = useState<any[]>([]);
  const [dptcdArray, setDptcdArray] = useState<string[]>([]);
  UseBizComponent(
    "L_dptcd_001, L_HU005",
    // 부서코드부서명, 직위
    setBizComponentData
  );
  const [dptcdListData2, setDptcdListData2] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const dtpcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_dptcd_001"
        )
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_HU005")
      );
      fetchQuery(dtpcdQueryStr, (data: any) => {
        setDptcdListData2(data);
        setDptcdArray(data.map((item: any) => item.dptcd));
      });
      fetchQuery(postcdQueryStr, setpostcdListData);
    }
  }, [bizComponentData]);

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    location: "",
    dptcd: "",
    dptnm: "",
    user_name: "",
    serviceid: companyCode,
    find_row_value: "",
    isSearch: true,
  });
  const [subFilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "USERINFO",
    orgdiv: sessionOrgdiv,
    dptcd: "",
    dptnm: "",
    user_name: "",
    serviceid: companyCode,
    location: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

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
    isSearch: true,
  });

  const fetchData = async (filters2: any) => {
    const parameters: Iparameters = {
      procedureName: "P_SY_A0125W_Q",
      pageNumber: 1,
      pageSize: 500,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters2.orgdiv,
        "@p_location": filters2.location,
        "@p_dptcd": filters2.dptcd,
        "@p_dptnm": filters2.dptnm,
        "@p_user_name": filters2.user_name,
        "@p_serviceid": filters2.serviceid,
      },
    };

    try {
      const data = await processApi<any>("procedure", parameters);
      if (data.isSuccess == true) {
        setInformation(data.tables[0].Rows);
      } else {
        console.log("[에러발생]");
      }
    } catch (error) {
      console.error("API 호출 중 오류:", error);
    }
  };
  useEffect(() => {
    fetchData(filters2);
  }, [filters2]);

  const fetchData2 = async (subFilters: any, dptcdArray: string[]) => {
    let tempCombinedResult: any[] = [];

    for (const dptcd of dptcdArray) {
      const subparameters: Iparameters = {
        procedureName: "P_SY_A0125W_Q",
        pageNumber: subFilters.pgNum,
        pageSize: subFilters.pgSize,
        parameters: {
          "@p_work_type": subFilters.workType,
          "@p_orgdiv": subFilters.orgdiv,
          "@p_location": subFilters.location,
          "@p_dptcd": dptcd, // 각 부서 코드를 전달
          "@p_dptnm": subFilters.dptnm,
          "@p_user_name": subFilters.user_name,
          "@p_serviceid": subFilters.serviceid,
        },
      };

      try {
        const data = await processApi<any>("procedure", subparameters);
        if (data.isSuccess == true) {
          tempCombinedResult = [...tempCombinedResult, ...data.tables[0].Rows];
        } else {
          console.log("[에러발생]");
        }
      } catch (error) {
        console.error("API 호출 중 오류:", error);
      }
    }
    setCombinedResult(tempCombinedResult);
  };

  useEffect(() => {
    fetchData2(subFilters, dptcdArray);
  }, [dptcdArray]);

  const fetchData3 = async (picFilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0012W_Q ",
      pageNumber: picFilters.pgNum,
      pageSize: picFilters.pgSize,
      parameters: {
        "@p_work_type": picFilters.work_type,
        "@p_orgdiv": picFilters.cboOrgdiv,
        "@p_location": picFilters.cboLocation,
        "@p_dptcd": picFilters.dptcd,
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
      const profileImageData = rows.map((row: any) => {
        return {
          user_id: row.user_id,
          profile_img: row.profile_image,
        };
      });
      setProfileImg(profileImageData);
    }
  };

  useEffect(() => {
    fetchData3(picFilters);
  }, [picFilters]);

  interface ProfileProps {
    user_name: string;
    postcd: string | undefined;
    profile_img?: string;
    color?: string;
  }

  const Profile = ({ user_name, postcd, profile_img, color }: ProfileProps) => {
    const isProfileNeeded = (postcd: string | undefined) => {
      return postcd == "이사" || postcd == "PM";
    };

    return (
      <>
        {isProfileNeeded(postcd) ? (
          <div
            style={{
              background: "#f3f3f3",
              borderRadius: "15px",
              height: "200px",
              width: "165px",
              boxShadow: "12px 12px rgba(0,0,0,0.1)",
              transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column" as FlexDirection,
              border: "1px solid #e4e2e2",
              marginBottom: "30px",
            }}
          >
            <img
              src={
                profile_img
                  ? `data:image/jpeg;base64,${profile_img}`
                  : "./logo192.png"
              }
              alt="Profile"
              style={{
                borderRadius: "65555px",
                borderStyle: "solid",
                borderColor: "#e2e2e2",
                borderWidth: "2px",
                width: "80px",
                height: "80px",
                objectFit: "cover",
                margin: "auto",
                marginTop: "50px",
                padding: "3px",
              }}
            />
            <div
              style={{
                color: "#ffffff",
                height: "40px",
                width: "100%",
                position: "relative",
                fontFamily: "sans-serif",
                fontWeight: "900",
                fontSize: "18px",
                textAlign: "center",
                lineHeight: "40px",
                marginTop: "10px",
                backgroundColor: color,
              }}
            >
              {user_name}
            </div>
            <p
              style={{
                color: "#000000",
                textAlign: "center",
                fontFamily: "sans-serif",
                position: "relative",
                fontWeight: "700",
                fontSize: "15px",
                marginTop: "10px",
                paddingBottom: "40px",
              }}
            >
              {postcd}
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "#f3f3f3",
              borderRadius: "10px",
              height: "85px",
              width: "250px",
              boxShadow: "12px 12px rgba(0,0,0,0.1)",
              display: "flex",
              marginBottom: "20px",
              position: "relative",
            }}
          >
            <img
              src={
                profile_img
                  ? `data:image/jpeg;base64,${profile_img}`
                  : "./logo192.png"
              }
              alt="Profile"
              style={{
                borderRadius: "65555px",
                borderStyle: "solid",
                borderColor: "#e2e2e2",
                borderWidth: "2px",
                width: "60px",
                height: "60px",
                objectFit: "cover",
                margin: "15px 0 0 20px",
              }}
            />
            <p
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                paddingLeft: "15px",
              }}
            >
              <span
                style={{
                  fontWeight: "600",
                  color: "#3f3f3f",
                  fontSize: "17px",
                  paddingBottom: "10px",
                }}
              >
                {user_name}
              </span>
              <span
                style={{ fontWeight: "600", fontSize: "15px", color: color }}
              >
                {postcd}
              </span>
            </p>
          </div>
        )}
      </>
    );
  };

  const OrgData = () => {
    const departmentColors = [
      "#FCB9AA",
      "#FFDBCC",
      "#ECEAE4",
      "#A2E1DB",
      "#55CBCD",
      "#CCE2CB",
      "#B6CFB6",
      "#97C1A9",
    ];

    const getDepartmentColor = (index: number): string => {
      // 색상 인덱스가 배열의 범위를 초과하는 경우를 대비하여 나머지 연산을 사용합니다.
      const colorIndex = index % departmentColors.length;
      return departmentColors[colorIndex];
    };

    return (
      <>
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              flexWrap: "wrap",
              width: "100%",
              paddingTop: "20px",
            }}
          >
            {information.map((info, index) => (
              <div
                key={index}
                className="department"
                style={{
                  marginBottom: "80px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  flexWrap: "wrap",
                  marginRight: "20px",
                }}
              >
                {info.prntdptcd == "" && (
                  <div
                    style={{
                      marginBottom: "80px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <p
                      style={{
                        borderRadius: "8px",
                        height: "50px",
                        width: "170px",
                        position: "relative",
                        fontSize: "24px",
                        fontWeight: "bolder",
                        color: "white",
                        textAlign: "center",
                        lineHeight: "45px",
                        backgroundColor: getDepartmentColor(index),
                      }}
                    >
                      {info.dptnm}
                    </p>
                    {combinedResult
                      .filter((person) => person.dptcd == info.dptcd)
                      .map((person, personIndex) => {
                        const profileData = profileImg.find(
                          (item) => item.user_id == person.user_id
                        );

                        return (
                          <div key={personIndex}>
                            {personIndex == 0 && (
                              <div
                                style={{
                                  width: "2px",
                                  height: "30px",
                                  backgroundColor: "grey",
                                  marginLeft: "50%",
                                }}
                              />
                            )}
                            <Profile
                              user_name={person.user_name}
                              postcd={
                                postcdListData.find(
                                  (item: any) => item.sub_code == person.postcd
                                )?.code_name
                              }
                              profile_img={
                                profileData ? profileData.profile_img : null
                              }
                              color={getDepartmentColor(index)}
                            />
                          </div>
                        );
                      })}
                  </div>
                )}
                <div
                  className="subdepartmentContainer"
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  {index !== information.length - 1 && (
                    <div style={{ paddingTop: "10px" }} />
                  )}
                  <div>
                    {information
                      .filter((subInfo) => subInfo.prntdptcd == info.dptcd)
                      .map((subInfo, subIndex, array) => (
                        <div
                          key={subIndex}
                          style={{
                            borderRadius: "8px",
                            height: "50px",
                            width: "170px",
                            position: "relative",
                            fontSize: "24px",
                            fontWeight: "bolder",
                            color: "white",
                            textAlign: "center",
                            lineHeight: "45px",
                            backgroundColor: getDepartmentColor(index),
                          }}
                        >
                          {subIndex !== 0 || (array.length > 1 && <div />)}
                          <p className="departmentText">{subInfo.dptnm}</p>
                          {combinedResult
                            .filter((person) => person.dptcd == subInfo.dptcd)
                            .map((person, personIndex) => {
                              const profileData = profileImg.find(
                                (item) => item.user_id == person.user_id
                              );
                              return (
                                <div key={personIndex}>
                                  {personIndex == 0 && (
                                    <div
                                      style={{
                                        width: "2px",
                                        height: "30px",
                                        backgroundColor: "grey",
                                        marginLeft: "50%",
                                      }}
                                    />
                                  )}
                                  <div className="subProfile">
                                    <Profile
                                      user_name={person.user_name}
                                      postcd={
                                        postcdListData.find(
                                          (item: any) =>
                                            item.sub_code == person.postcd
                                        )?.code_name
                                      }
                                      profile_img={
                                        profileData
                                          ? profileData.profile_img
                                          : null
                                      }
                                      color={getDepartmentColor(index)}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  useEffect(() => {
    if (showOrg) {
      OrgData();
    }
  }, [showOrg]);

  return (
    <>
      <TitleContainer>
        <Title>인사관리</Title>
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
        <GridContainer
          style={{ width: `${deviceWidth - 30}px`, overflow: "auto" }}
        >
          <GridTitleContainer className="ButtonContainer">
            <ButtonContainer>
              <Button
                onClick={() => setShowMap(!showMap)}
                themeColor={"primary"}
              >
                {showMap ? "리스트 보기" : "거주지 지도"}
              </Button>
              <Button
                onClick={() => setShowOrg(!showOrg)}
                themeColor={"primary"}
              >
                {showOrg ? "리스트 보기" : "조직도 보기"}
              </Button>
            </ButtonContainer>
            <ButtonContainer style={{ paddingTop: "5px" }}>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="file-add"
              >
                사용자생성
              </Button>
              <Button
                onClick={onDeleteClick}
                icon="delete"
                fillMode="outline"
                themeColor={"primary"}
              >
                사용자삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>

          {showMap ? (
            <div
              style={{
                height: isMobile ? deviceHeight - height : "72vh",
                marginTop: "5px",
              }}
              id="map"
            ></div>
          ) : showOrg ? (
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
                  height: isMobile ? deviceHeight - height : "72vh",
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
                  customOptionData.menuCustomColumnOptions["grdList"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
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
            <GridTitleContainer>
              <GridTitle>기본정보</GridTitle>

              <ButtonContainer>
                <Button
                  onClick={() => setShowMap(!showMap)}
                  themeColor={"primary"}
                >
                  {showMap ? "리스트 보기" : "거주지 지도"}
                </Button>
                <Button
                  onClick={() => setShowOrg(!showOrg)}
                  themeColor={"primary"}
                >
                  {showOrg ? "리스트 보기" : "조직도 보기"}
                </Button>
                <Button
                  onClick={onAddClick}
                  themeColor={"primary"}
                  icon="file-add"
                >
                  사용자생성
                </Button>
                <Button
                  onClick={onDeleteClick}
                  icon="delete"
                  fillMode="outline"
                  themeColor={"primary"}
                >
                  사용자삭제
                </Button>
              </ButtonContainer>
            </GridTitleContainer>

            {showMap ? (
              <div style={{ height: "82vh", marginTop: "5px" }} id="map"></div>
            ) : showOrg ? (
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
                  style={{ height: "82vh" }}
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
                    customOptionData.menuCustomColumnOptions["grdList"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
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

type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";

export default HU_A1000W;
