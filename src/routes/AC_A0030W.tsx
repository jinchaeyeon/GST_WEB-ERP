import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
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
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
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
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  handleKeyPressSearch,
  useSysMessage,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  //PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_A0030W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
let targetRowIndex: null | number = null;
const DATA_ITEM_KEY = "acntcd";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
let deletedMainRows: any[] = [];
let deletedMainRows2: any[] = [];

const requiredField = ["mngitemcd", "reportgb", "acntgrpcd"];

const checkBoxField = ["mngdrctlyn", "mngcrctlyn"];

const comboBoxField = ["mngitemcd", "reportgb"];

const readOnlyField = ["acntgrpnm"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_AC023T, L_AC062", setBizComponentData);

  const field = props.field ?? "";

  let bizComponentIdVal: string;
  let vField: string;
  let tField: string;

  if (field == "mngitemcd") {
    bizComponentIdVal = "L_AC023T";
    vField = "mngitemcd";
    tField = "mngitemnm";
  } else if (field == "reportgb") {
    bizComponentIdVal = "L_AC062";
    vField = "sub_code";
    tField = "code_name";
  } else {
    bizComponentIdVal = "";
    vField = "sub_code";
    tField = "code_name";
  }

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      valueField={vField}
      textField={tField}
      {...props}
    />
  ) : (
    <td />
  );
};
var index = 0;
var index2 = 0;

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;
var height8 = 0;

let temp = 0;
let temp2 = 0;

const AC_A0030W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_A0030W", setCustomOptionData);

  const [tabSelected, setTabSelected] = React.useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".ButtonContainer3");
      height4 = getHeight(".ButtonContainer4");
      height5 = getHeight(".ButtonContainer5");
      height6 = getHeight(".k-tabstrip-items-wrapper");
      height7 = getHeight(".TitleContainer");
      height8 = getHeight(".ButtonContainer6");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height7);
        setMobileHeight2(getDeviceHeight(true) - height2 - height6 - height7);
        setMobileHeight3(getDeviceHeight(true) - height3 - height6 - height7);
        setMobileHeight4(
          getDeviceHeight(true) - height4 - height5 - height6 - height7
        );
        setWebHeight(getDeviceHeight(true) - height - height7);
        setWebHeight2(
          getDeviceHeight(true) -
            height2 -
            height3 -
            height6 -
            height7 -
            height8
        );
        setWebHeight3(
          getDeviceHeight(true) - height4 - height5 - height6 - height7
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, tabSelected, webheight, webheight2, webheight3]);

  const [swiper, setSwiper] = useState<SwiperCore>();
  const [swiper2, setSwiper2] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const orgdiv = UseGetValueFromSessionItem("orgdiv");

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  let gridRef: any = useRef(null); // 요약정보 그리드
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setPage2(initialPageState);
    setPage3(initialPageState);

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / page.take) + 1,
      isSearch: true,
      pgGap: 0,
    }));

    setPage({
      skip: page.skip,
      take: page.take,
    });
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / page.take) + 1,
      isSearch: true,
      pgGap: 0,
    }));

    setPage2({
      skip: page.skip,
      take: page.take,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / page.take) + 1,
      isSearch: true,
      pgGap: 0,
    }));

    setPage3({
      skip: page.skip,
      take: page.take,
    });
  };
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        useyn:
          defaultOption?.find((item: any) => item.id == "useyn")?.valueCode ??
          "Y",
        acntses:
          defaultOption?.find((item: any) => item.id == "acntsts")?.valueCode ??
          "",
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_AC023T, R_USEYN, L_AC012, L_AC008, L_AC033, L_BA073, L_AC009, L_AC010, L_AC090, L_AC007, R_DRCR, L_AC061",
    setBizComponentData
  );

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [tempState3, setTempState3] = useState<State>({
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
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [tempResult3, setTempResult3] = useState<DataResult>(
    process([], tempState3)
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

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      setParaData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const RadioChange = (e: any) => {
    const { value, name } = e;
    if (value != null) {
      setParaData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const CheckChange = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      if (value == false || value == "N") {
        setParaData((prev) => ({
          ...prev,
          [name]: "N",
        }));
      } else {
        setParaData((prev) => ({
          ...prev,
          [name]: "Y",
        }));
      }
    }
  };

  //Form정보 Change함수
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setParaData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
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

  //조회조건
  const [filters, setFilters] = useState({
    isSearch: false, // true면 조회조건(filters) 변경 되었을때 조회
    pgNum: 1,
    acntcd: "",
    acntnm: "",
    acntses: "",
    mngitemcd: "",
    useyn: "%",
    find_row_value: "",
  });

  //조회조건
  const [filters2, setFilters2] = useState({
    isSearch: false, // true면 조회조건(filters) 변경 되었을때 조회
    pgNum: 1,
    acntcd: "",
    find_row_value: "",
  });

  //조회조건
  const [filters3, setFilters3] = useState({
    isSearch: false, // true면 조회조건(filters) 변경 되었을때 조회
    pgNum: 1,
    acntcd: "",
    find_row_value: "",
  });

  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    setLoading(true);

    const procedure: Iparameters = {
      procedureName: "P_AC_A0030W_Q",
      pageNumber: filters.pgNum,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": orgdiv,
        "@p_acntcd": filters.acntcd,
        "@p_acntnm": filters.acntnm,
        "@p_acntses": filters.acntses,
        "@p_mngitemcd": filters.mngitemcd,
        "@p_useyn": filters.useyn,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    let data: any;
    try {
      data = await processApi<any>("procedure", procedure);
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
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.ackey == filters.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            acntcd: selectedRow.acntcd,
          }));
          setFilters3((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            acntcd: selectedRow.acntcd,
          }));
          setParaData({
            workType: "U",
            acntcd: selectedRow.acntcd,
            acntnm: selectedRow.acntnm,
            mngdrcustyn: selectedRow.mngdrcustyn,
            mngcrcustyn: selectedRow.mngcrcustyn,
            mngsumcustyn: selectedRow.mngsumcustyn,
            mngdramtyn: selectedRow.mngdramtyn,
            mngcramtyn: selectedRow.mngcramtyn,
            mngdrrateyn: selectedRow.mngdrrateyn,
            mngcrrateyn: selectedRow.mngcrrateyn,
            acntgrp: selectedRow.acntgrp,
            acntchr: selectedRow.acntchr,
            alcchr: selectedRow.alcchr,
            profitchr: selectedRow.profitchr,
            acntbaldiv: selectedRow.acntbaldiv,
            budgyn: selectedRow.budgyn,
            system_yn: selectedRow.system_yn,
            useyn: selectedRow.useyn,
            profitsha: selectedRow.profitsha,
            makesha: selectedRow.makesha,
            acntdiv: selectedRow.acntdiv,
            show_payment_yn: selectedRow.show_payment_yn,
            show_collect_yn: selectedRow.show_collect_yn,
            show_pur_sal_yn: selectedRow.show_pur_sal_yn,
            douzonecd: selectedRow.douzonecd,
            mngitemcd1: selectedRow.mngitemcd1,
            mngitemcd2: selectedRow.mngitemcd2,
            mngitemcd3: selectedRow.mngitemcd3,
            mngitemcd4: selectedRow.mngitemcd4,
            mngitemcd5: selectedRow.mngitemcd5,
            mngitemcd6: selectedRow.mngitemcd6,
            mngdrctlyn1: selectedRow.mngdrctlyn1,
            mngdrctlyn2: selectedRow.mngdrctlyn2,
            mngdrctlyn3: selectedRow.mngdrctlyn3,
            mngdrctlyn4: selectedRow.mngdrctlyn4,
            mngdrctlyn5: selectedRow.mngdrctlyn5,
            mngdrctlyn6: selectedRow.mngdrctlyn6,
            mngcrctlyn1: selectedRow.mngcrctlyn1,
            mngcrctlyn2: selectedRow.mngcrctlyn2,
            mngcrctlyn3: selectedRow.mngcrctlyn3,
            mngcrctlyn4: selectedRow.mngcrctlyn4,
            mngcrctlyn5: selectedRow.mngcrctlyn5,
            mngcrctlyn6: selectedRow.mngcrctlyn6,
          });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            acntcd: rows[0].acntcd,
          }));
          setFilters3((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            acntcd: rows[0].acntcd,
          }));
          setParaData({
            workType: "U",
            acntcd: rows[0].acntcd,
            acntnm: rows[0].acntnm,
            mngdrcustyn: rows[0].mngdrcustyn,
            mngcrcustyn: rows[0].mngcrcustyn,
            mngsumcustyn: rows[0].mngsumcustyn,
            mngdramtyn: rows[0].mngdramtyn,
            mngcramtyn: rows[0].mngcramtyn,
            mngdrrateyn: rows[0].mngdrrateyn,
            mngcrrateyn: rows[0].mngcrrateyn,
            acntgrp: rows[0].acntgrp,
            acntchr: rows[0].acntchr,
            alcchr: rows[0].alcchr,
            profitchr: rows[0].profitchr,
            acntbaldiv: rows[0].acntbaldiv,
            budgyn: rows[0].budgyn,
            system_yn: rows[0].system_yn,
            useyn: rows[0].useyn,
            profitsha: rows[0].profitsha,
            makesha: rows[0].makesha,
            acntdiv: rows[0].acntdiv,
            show_payment_yn: rows[0].show_payment_yn,
            show_collect_yn: rows[0].show_collect_yn,
            show_pur_sal_yn: rows[0].show_pur_sal_yn,
            douzonecd: rows[0].douzonecd,
            mngitemcd1: rows[0].mngitemcd1,
            mngitemcd2: rows[0].mngitemcd2,
            mngitemcd3: rows[0].mngitemcd3,
            mngitemcd4: rows[0].mngitemcd4,
            mngitemcd5: rows[0].mngitemcd5,
            mngitemcd6: rows[0].mngitemcd6,
            mngdrctlyn1: rows[0].mngdrctlyn1,
            mngdrctlyn2: rows[0].mngdrctlyn2,
            mngdrctlyn3: rows[0].mngdrctlyn3,
            mngdrctlyn4: rows[0].mngdrctlyn4,
            mngdrctlyn5: rows[0].mngdrctlyn5,
            mngdrctlyn6: rows[0].mngdrctlyn6,
            mngcrctlyn1: rows[0].mngcrctlyn1,
            mngcrctlyn2: rows[0].mngcrctlyn2,
            mngcrctlyn3: rows[0].mngcrctlyn3,
            mngcrctlyn4: rows[0].mngcrctlyn4,
            mngcrctlyn5: rows[0].mngcrctlyn5,
            mngcrctlyn6: rows[0].mngcrctlyn6,
          });
        }
      } else {
        setParaData({
          workType: "N",
          acntcd: "",
          acntnm: "",
          mngdrcustyn: "",
          mngcrcustyn: "",
          mngsumcustyn: "",
          mngdramtyn: "",
          mngcramtyn: "",
          mngdrrateyn: "",
          mngcrrateyn: "",
          acntgrp: "",
          acntchr: "",
          alcchr: "",
          profitchr: "",
          acntbaldiv: "",
          budgyn: "",
          system_yn: "",
          useyn: "",
          profitsha: "",
          makesha: "",
          acntdiv: "",
          show_payment_yn: "",
          show_collect_yn: "",
          show_pur_sal_yn: "",
          douzonecd: "",
          mngitemcd1: "",
          mngitemcd2: "",
          mngitemcd3: "",
          mngitemcd4: "",
          mngitemcd5: "",
          mngitemcd6: "",
          mngdrctlyn1: "",
          mngdrctlyn2: "",
          mngdrctlyn3: "",
          mngdrctlyn4: "",
          mngdrctlyn5: "",
          mngdrctlyn6: "",
          mngcrctlyn1: "",
          mngcrctlyn2: "",
          mngcrctlyn3: "",
          mngcrctlyn4: "",
          mngcrctlyn5: "",
          mngcrctlyn6: "",
        });
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

  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    setLoading(true);

    const procedure: Iparameters = {
      procedureName: "P_AC_A0030W_Q",
      pageNumber: filters2.pgNum,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": "MNGITEM",
        "@p_orgdiv": orgdiv,
        "@p_acntcd": filters2.acntcd,
        "@p_acntnm": filters.acntnm,
        "@p_acntses": filters.acntses,
        "@p_mngitemcd": filters.mngitemcd,
        "@p_useyn": filters.useyn,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    let data: any;
    try {
      data = await processApi<any>("procedure", procedure);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
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

  const fetchMainGrid3 = async (filters3: any) => {
    if (!permissions.view) return;
    setLoading(true);

    const procedure: Iparameters = {
      procedureName: "P_AC_A0030W_Q",
      pageNumber: filters3.pgNum,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": "FINDETAIL",
        "@p_orgdiv": orgdiv,
        "@p_acntcd": filters3.acntcd,
        "@p_acntnm": filters.acntnm,
        "@p_acntses": filters.acntses,
        "@p_mngitemcd": filters.mngitemcd,
        "@p_useyn": filters.useyn,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    let data: any;
    try {
      data = await processApi<any>("procedure", procedure);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

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

    setFilters2((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
      acntcd: selectedRowData.acntcd,
    }));
    setFilters3((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
      acntcd: selectedRowData.acntcd,
    }));
    setParaData({
      workType: "U",
      acntcd: selectedRowData.acntcd,
      acntnm: selectedRowData.acntnm,
      mngdrcustyn: selectedRowData.mngdrcustyn,
      mngcrcustyn: selectedRowData.mngcrcustyn,
      mngsumcustyn: selectedRowData.mngsumcustyn,
      mngdramtyn: selectedRowData.mngdramtyn,
      mngcramtyn: selectedRowData.mngcramtyn,
      mngdrrateyn: selectedRowData.mngdrrateyn,
      mngcrrateyn: selectedRowData.mngcrrateyn,
      acntgrp: selectedRowData.acntgrp,
      acntchr: selectedRowData.acntchr,
      alcchr: selectedRowData.alcchr,
      profitchr: selectedRowData.profitchr,
      acntbaldiv: selectedRowData.acntbaldiv,
      budgyn: selectedRowData.budgyn,
      system_yn: selectedRowData.system_yn,
      useyn: selectedRowData.useyn,
      profitsha: selectedRowData.profitsha,
      makesha: selectedRowData.makesha,
      acntdiv: selectedRowData.acntdiv,
      show_payment_yn: selectedRowData.show_payment_yn,
      show_collect_yn: selectedRowData.show_collect_yn,
      show_pur_sal_yn: selectedRowData.show_pur_sal_yn,
      douzonecd: selectedRowData.douzonecd,
      mngitemcd1: selectedRowData.mngitemcd1,
      mngitemcd2: selectedRowData.mngitemcd2,
      mngitemcd3: selectedRowData.mngitemcd3,
      mngitemcd4: selectedRowData.mngitemcd4,
      mngitemcd5: selectedRowData.mngitemcd5,
      mngitemcd6: selectedRowData.mngitemcd6,
      mngdrctlyn1: selectedRowData.mngdrctlyn1,
      mngdrctlyn2: selectedRowData.mngdrctlyn2,
      mngdrctlyn3: selectedRowData.mngdrctlyn3,
      mngdrctlyn4: selectedRowData.mngdrctlyn4,
      mngdrctlyn5: selectedRowData.mngdrctlyn5,
      mngdrctlyn6: selectedRowData.mngdrctlyn6,
      mngcrctlyn1: selectedRowData.mngcrctlyn1,
      mngcrctlyn2: selectedRowData.mngcrctlyn2,
      mngcrctlyn3: selectedRowData.mngcrctlyn3,
      mngcrctlyn4: selectedRowData.mngcrctlyn4,
      mngcrctlyn5: selectedRowData.mngcrctlyn5,
      mngcrctlyn6: selectedRowData.mngcrctlyn6,
    });
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

  const onSubDataSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedState3(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "관리항목";
        _export.save(optionsGridOne);
      } else if (tabSelected == 1) {
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
    setMainDataState2(event.dataState);
  };

  const onSubDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //상세 그리드 푸터
  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //재무제표 그리드 푸터
  const finTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onNewClick = () => {
    setParaData({
      workType: "N",
      acntcd: "",
      acntnm: "",
      mngdrcustyn: "",
      mngcrcustyn: "",
      mngsumcustyn: "",
      mngdramtyn: "",
      mngcramtyn: "",
      mngdrrateyn: "",
      mngcrrateyn: "",
      acntgrp: "",
      acntchr: "",
      alcchr: "",
      profitchr: "",
      acntbaldiv: "1",
      budgyn: "",
      system_yn: "",
      useyn: "",
      profitsha: "",
      makesha: "",
      acntdiv: "",
      show_payment_yn: "",
      show_collect_yn: "",
      show_pur_sal_yn: "",
      douzonecd: "",
      mngitemcd1: "",
      mngitemcd2: "",
      mngitemcd3: "",
      mngitemcd4: "",
      mngitemcd5: "",
      mngitemcd6: "",
      mngdrctlyn1: "",
      mngdrctlyn2: "",
      mngdrctlyn3: "",
      mngdrctlyn4: "",
      mngdrctlyn5: "",
      mngdrctlyn6: "",
      mngcrctlyn1: "",
      mngcrctlyn2: "",
      mngcrctlyn3: "",
      mngcrctlyn4: "",
      mngcrctlyn5: "",
      mngcrctlyn6: "",
    });
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
  };

  const addRowDetail = () => {
    if (mainDataResult2.total >= 6) {
      alert("관리항목은 최대 6개까지 입력 가능합니다.");
      return;
    }

    mainDataResult2.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      rowstatus: "N",
      mngitemcd: "",
      mngdrctlyn: "",
      mngcrctlyn: "",
      [DATA_ITEM_KEY2]: ++temp,
    };

    setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    setMainDataResult2((prev) => {
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

  const addRowDetail2 = () => {
    mainDataResult3.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    const newDataItem = {
      rowstatus: "N",
      reportgb: "",
      acntgrpcd: "",
      acntgrpnm: "",
      [DATA_ITEM_KEY3]: ++temp2,
    };

    setSelectedState3({ [newDataItem[DATA_ITEM_KEY3]]: true });
    setMainDataResult3((prev) => {
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

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubDataSortChange = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubDataSortChange2 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
  };

  const search2 = () => {
    setFilters3((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  const onSubItemChange = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
    );
  };

  const onSubItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "files") {
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

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
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

  const exitEdit = () => {
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
      setTempResult2((prev) => {
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

  const exitEdit2 = () => {
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
      setTempResult3((prev) => {
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

  const removeRowDetail = () => {
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
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setMainDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState2({
      [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };

  const removeRowDetail2 = () => {
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
          deletedMainRows2.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult3.data[Math.min(...Object2)];
    } else {
      data = mainDataResult3.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setMainDataResult3((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState3({
      [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
    });
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const deleteList = () => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    ExecuteSave("D");
  };

  const [paraData, setParaData] = useState({
    workType: "N",
    acntcd: "",
    acntnm: "",
    mngdrcustyn: "",
    mngcrcustyn: "",
    mngsumcustyn: "",
    mngdramtyn: "",
    mngcramtyn: "",
    mngdrrateyn: "",
    mngcrrateyn: "",
    acntgrp: "",
    acntchr: "",
    alcchr: "",
    profitchr: "",
    acntbaldiv: "",
    budgyn: "",
    system_yn: "",
    useyn: "",
    profitsha: "",
    makesha: "",
    acntdiv: "",
    show_payment_yn: "",
    show_collect_yn: "",
    show_pur_sal_yn: "",
    douzonecd: "",
    mngitemcd1: "",
    mngitemcd2: "",
    mngitemcd3: "",
    mngitemcd4: "",
    mngitemcd5: "",
    mngitemcd6: "",
    mngdrctlyn1: "",
    mngdrctlyn2: "",
    mngdrctlyn3: "",
    mngdrctlyn4: "",
    mngdrctlyn5: "",
    mngdrctlyn6: "",
    mngcrctlyn1: "",
    mngcrctlyn2: "",
    mngcrctlyn3: "",
    mngcrctlyn4: "",
    mngcrctlyn5: "",
    mngcrctlyn6: "",
  });

  const saveList = async () => {
    if (!permissions.save) return;
    ExecuteSave(paraData.workType);
  };

  const saveDetail2 = async () => {
    if (!permissions.save) return;
    ExecuteSaveDetail2();
  };

  const ExecuteSave = async (workType: string) => {
    if (workType == "D" && !permissions.delete) return;
    if (workType != "D" && !permissions.save) return;

    let valid = true;
    try {
      if (paraData.acntcd == "") {
        throw "계정코드는 필수입력입니다.";
      }

      if (paraData.acntnm == "") {
        throw "계정명은 필수입력입니다.";
      }

      if (paraData.acntbaldiv == "") {
        throw "잔액구분은 필수입력입니다.";
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    let mngitemcds: any[] = [];
    let mngdrctlyns: any[] = [];
    let mngcrctlyns: any[] = [];

    if (workType !== "D") {
      const dataDetail = mainDataResult2.data;

      dataDetail.forEach((item) => {
        const { mngitemcd, mngdrctlyn, mngcrctlyn } = item;

        mngitemcds.push(mngitemcd);
        mngdrctlyns.push(
          mngdrctlyn == true ? "Y" : mngdrctlyn == false ? "N" : mngdrctlyn
        );
        mngcrctlyns.push(
          mngcrctlyn == true ? "Y" : mngcrctlyn == false ? "N" : mngcrctlyn
        );
      });
    }

    setLoading(true);

    const procedure: Iparameters = {
      procedureName: "P_AC_A0030W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": workType,

        "@p_orgdiv": orgdiv,

        "@p_acntcd": paraData.acntcd,
        "@p_acntnm": paraData.acntnm,
        "@p_mngdrcustyn": paraData.mngdrcustyn,
        "@p_mngcrcustyn": paraData.mngcrcustyn,
        "@p_mngsumcustyn": paraData.mngsumcustyn,
        "@p_mngdramtyn": paraData.mngdramtyn,
        "@p_mngcramtyn": paraData.mngcramtyn,
        "@p_mngdrrateyn": paraData.mngdrrateyn,
        "@p_mngcrrateyn": paraData.mngcrrateyn,
        "@p_acntgrp": paraData.acntgrp,
        "@p_acntchr": paraData.acntchr,
        "@p_alcchr": paraData.alcchr,
        "@p_profitchr": paraData.profitchr,
        "@p_acntbaldiv": paraData.acntbaldiv,
        "@p_budgyn": paraData.budgyn,
        "@p_system_yn": paraData.system_yn,
        "@p_useyn": paraData.useyn,
        "@p_profitsha": paraData.profitsha,
        "@p_makesha": paraData.makesha,
        "@p_acntdiv": paraData.acntdiv,
        "@p_show_payment_yn": paraData.show_payment_yn,
        "@p_show_collect_yn": paraData.show_collect_yn,
        "@p_show_pur_sal_yn": paraData.show_pur_sal_yn,
        "@p_douzonecd": paraData.douzonecd,

        "@p_mngitemcd1": mngitemcds[0] ?? "",
        "@p_mngitemcd2": mngitemcds[1] ?? "",
        "@p_mngitemcd3": mngitemcds[2] ?? "",
        "@p_mngitemcd4": mngitemcds[3] ?? "",
        "@p_mngitemcd5": mngitemcds[4] ?? "",
        "@p_mngitemcd6": mngitemcds[5] ?? "",
        "@p_mngdrctlyn1": mngdrctlyns[0] ?? "",
        "@p_mngdrctlyn2": mngdrctlyns[1] ?? "",
        "@p_mngdrctlyn3": mngdrctlyns[2] ?? "",
        "@p_mngdrctlyn4": mngdrctlyns[3] ?? "",
        "@p_mngdrctlyn5": mngdrctlyns[4] ?? "",
        "@p_mngdrctlyn6": mngdrctlyns[5] ?? "",
        "@p_mngcrctlyn1": mngcrctlyns[0] ?? "",
        "@p_mngcrctlyn2": mngcrctlyns[1] ?? "",
        "@p_mngcrctlyn3": mngcrctlyns[2] ?? "",
        "@p_mngcrctlyn4": mngcrctlyns[3] ?? "",
        "@p_mngcrctlyn5": mngcrctlyns[4] ?? "",
        "@p_mngcrctlyn6": mngcrctlyns[5] ?? "",

        "@p_insert_userid": userId,
        "@p_insert_pc": pc,
        "@p_form_id": "AC_A0030W",
      },
    };

    let data: any;

    try {
      data = await processApi<any>("procedure", procedure);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
        find_row_value: data.returnString,
      }));
      setMainDataResult2(process([], mainDataState2));
      setMainDataResult3(process([], mainDataState3));
      setParaData({
        workType: "N",
        acntcd: "",
        acntnm: "",
        mngdrcustyn: "",
        mngcrcustyn: "",
        mngsumcustyn: "",
        mngdramtyn: "",
        mngcramtyn: "",
        mngdrrateyn: "",
        mngcrrateyn: "",
        acntgrp: "",
        acntchr: "",
        alcchr: "",
        profitchr: "",
        acntbaldiv: "",
        budgyn: "",
        system_yn: "",
        useyn: "",
        profitsha: "",
        makesha: "",
        acntdiv: "",
        show_payment_yn: "",
        show_collect_yn: "",
        show_pur_sal_yn: "",
        douzonecd: "",
        mngitemcd1: "",
        mngitemcd2: "",
        mngitemcd3: "",
        mngitemcd4: "",
        mngitemcd5: "",
        mngitemcd6: "",
        mngdrctlyn1: "",
        mngdrctlyn2: "",
        mngdrctlyn3: "",
        mngdrctlyn4: "",
        mngdrctlyn5: "",
        mngdrctlyn6: "",
        mngcrctlyn1: "",
        mngcrctlyn2: "",
        mngcrctlyn3: "",
        mngcrctlyn4: "",
        mngcrctlyn5: "",
        mngcrctlyn6: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);
  const ExecuteSaveDetail2 = async () => {
    if (!permissions.save) return;
    let rowstatuss: any[] = [];
    let acntsess: any[] = [];
    let reportgbs: any[] = [];
    let acntgrpcds: any[] = [];
    let acntcds: any[] = [];
    let acntgrpnms: any[] = [];

    const dataSource = mainDataResult3.data;

    dataSource.forEach((item) => {
      if (item.rowstatus == "N" || item.rowstatus == "U") {
        const { rowstatus, reportgb, acntgrpcd, acntgrpnm } = item;

        rowstatuss.push(rowstatus);
        acntsess.push(filters.acntses);
        reportgbs.push(reportgb);
        acntgrpcds.push(acntgrpcd);
        acntcds.push(paraData.acntcd);
        acntgrpnms.push(acntgrpnm);
      }
    });

    const dataDeleted = deletedMainRows2;

    dataDeleted.forEach((item) => {
      const { reportgb, acntgrpcd, acntgrpnm } = item;

      rowstatuss.push("D");
      acntsess.push(filters.acntses);
      reportgbs.push(reportgb);
      acntgrpcds.push(acntgrpcd);
      acntcds.push(paraData.acntcd);
      acntgrpnms.push(acntgrpnm);
    });

    if (rowstatuss.length == 0) {
      return;
    }

    setLoading(true);

    const procedure: Iparameters = {
      procedureName: "P_AC020TW_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "A",

        "@p_orgdiv": orgdiv,

        "@p_rowstatus_s": rowstatuss.join("|"),
        "@p_acntses_s": acntsess.join("|"),
        "@p_reportgb_s": reportgbs.join("|"),
        "@p_acntgrpcd_s": acntgrpcds.join("|"),
        "@p_acntcd_s": acntcds.join("|"),
        "@p_acntgrpnm_s": acntgrpnms.join("|"),

        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "AC_A0030W",
      },
    };

    let data: any;

    try {
      data = await processApi<any>("procedure", procedure);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setMainDataResult3(process([], mainDataState3));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>계정관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_A0030W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>계정코드</th>
              <td>
                <Input
                  name="acntcd"
                  type="text"
                  value={filters.acntcd}
                  onChange={filterInputChange}
                />
              </td>

              <th>계정명</th>
              <td>
                <Input
                  name="acntnm"
                  type="text"
                  value={filters.acntnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="useyn"
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
                  <GridTitle>요약정보</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="계정관리"
                >
                  <Grid
                    style={{ height: mobileheight }} //76vh
                    data={process(
                      mainDataResult.data.map((item) => ({
                        ...item,
                        [SELECTED_FIELD]: selectedState[idGetter(item)],
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
                      customOptionData.menuCustomColumnOptions["grdHeaderList"]
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
                                  checkBoxField.includes(item.fieldName)
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
                  title="상세정보"
                  disabled={permissions.view ? false : true}
                >
                  <Swiper
                    onSwiper={(swiper) => {
                      setSwiper2(swiper);
                    }}
                    onActiveIndexChange={(swiper) => {
                      index2 = swiper.activeIndex;
                    }}
                  >
                    <SwiperSlide key={0}>
                      <GridContainer
                        style={{
                          width: "100%",
                          overflow: "auto",
                        }}
                      >
                        <ButtonContainer
                          className="ButtonContainer2"
                          style={{ justifyContent: "space-between" }}
                        >
                          <div>
                            <Button
                              onClick={onNewClick}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="file-add"
                              disabled={permissions.save ? false : true}
                            >
                              신규
                            </Button>
                            <Button
                              onClick={saveList}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="save"
                              disabled={permissions.save ? false : true}
                            >
                              저장
                            </Button>
                            <Button
                              onClick={deleteList}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="delete"
                              disabled={permissions.delete ? false : true}
                            >
                              삭제
                            </Button>
                          </div>
                          <Button
                            onClick={() => {
                              if (swiper2 && isMobile) {
                                swiper2.slideTo(1);
                              }
                            }}
                            icon="chevron-right"
                            themeColor={"primary"}
                            fillMode={"flat"}
                          ></Button>
                        </ButtonContainer>
                        <FormBoxWrap
                          style={{
                            height: mobileheight2,
                            overflow: "auto",
                          }} /*67.5*/
                        >
                          <FormBox>
                            <tbody>
                              <tr>
                                <th>계정코드</th>
                                <td>
                                  {paraData.workType == "N" ? (
                                    <Input
                                      name="acntcd"
                                      type="text"
                                      value={paraData.acntcd}
                                      className="required"
                                      onChange={InputChange}
                                    />
                                  ) : (
                                    <Input
                                      name="acntcd"
                                      type="text"
                                      value={paraData.acntcd}
                                      className="readonly"
                                    />
                                  )}
                                </td>
                                <th>계정명</th>
                                <td>
                                  <Input
                                    name="acntnm"
                                    type="text"
                                    value={paraData.acntnm}
                                    onChange={InputChange}
                                    className="required"
                                  />
                                </td>
                              </tr>
                              <tr>
                                <th>잔액구분</th>
                                <td>
                                  {bizComponentData !== null && (
                                    <BizComponentRadioGroup
                                      name="acntbaldiv"
                                      value={paraData.acntbaldiv}
                                      bizComponentId="R_DRCR"
                                      bizComponentData={bizComponentData}
                                      changeData={RadioChange}
                                    />
                                  )}
                                </td>
                                <th>사용여부</th>
                                <td>
                                  <Checkbox
                                    name="useyn"
                                    value={paraData.useyn == "Y" ? true : false}
                                    onChange={CheckChange}
                                  />
                                </td>
                                <th>시스템코드여부</th>
                                <td>
                                  <Checkbox
                                    name="system_yn"
                                    value={
                                      paraData.system_yn == "Y" ? true : false
                                    }
                                    onChange={CheckChange}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <th>계정그룹</th>
                                <td>
                                  {bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="acntgrp"
                                      value={paraData.acntgrp}
                                      bizComponentId="L_AC012"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                                </td>
                                <th>거래처관리여부</th>
                                <td>
                                  <Checkbox
                                    name="mngdrcustyn"
                                    label={"차변"}
                                    value={
                                      paraData.mngdrcustyn == "Y" ? true : false
                                    }
                                    onChange={CheckChange}
                                  />
                                </td>
                                <td>
                                  <Checkbox
                                    name="mngcrcustyn"
                                    label={"대변"}
                                    value={
                                      paraData.mngcrcustyn == "Y" ? true : false
                                    }
                                    onChange={CheckChange}
                                  />
                                </td>
                                <td>
                                  <Checkbox
                                    name="mngsumcustyn"
                                    label={"누계"}
                                    value={
                                      paraData.mngsumcustyn == "Y"
                                        ? true
                                        : false
                                    }
                                    onChange={CheckChange}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <th>계정특성</th>
                                <td>
                                  {bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="acntchr"
                                      value={paraData.acntchr}
                                      bizComponentId="L_AC008"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                                </td>
                                <th>RATE관리</th>
                                <td>
                                  <Checkbox
                                    name="mngdrrateyn"
                                    label={"차변"}
                                    value={
                                      paraData.mngdrrateyn == "Y" ? true : false
                                    }
                                    onChange={CheckChange}
                                  />
                                </td>
                                <td>
                                  <Checkbox
                                    name="mngcrrateyn"
                                    label={"대변"}
                                    value={
                                      paraData.mngcrrateyn == "Y" ? true : false
                                    }
                                    onChange={CheckChange}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <th>자금/예산</th>
                                <td>
                                  {bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="budgyn"
                                      value={paraData.budgyn}
                                      bizComponentId="L_AC033"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                                </td>
                                <th>관리금액관리</th>
                                <td>
                                  <Checkbox
                                    name="mngdramtyn"
                                    label={"차변"}
                                    value={
                                      paraData.mngdramtyn == "Y" ? true : false
                                    }
                                    onChange={CheckChange}
                                  />
                                </td>
                                <td>
                                  <Checkbox
                                    name="mngcramtyn"
                                    label={"대변"}
                                    value={
                                      paraData.mngcramtyn == "Y" ? true : false
                                    }
                                    onChange={CheckChange}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <th>손익분배</th>
                                <td>
                                  {bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="profitsha"
                                      value={paraData.profitsha}
                                      bizComponentId="L_BA073"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                                </td>
                                <th rowSpan={3}>자동전표기준</th>
                                <th>지급</th>
                                <td>
                                  {bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="show_payment_yn"
                                      value={paraData.show_payment_yn}
                                      bizComponentId="L_AC090"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <th>자산부채특성</th>
                                <td>
                                  {bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="alcchr"
                                      value={paraData.alcchr}
                                      bizComponentId="L_AC009"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                                </td>
                                <th>수금</th>
                                <td>
                                  {bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="show_collect_yn"
                                      value={paraData.show_collect_yn}
                                      bizComponentId="L_AC090"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <th>손익특성</th>
                                <td>
                                  {bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="profitchr"
                                      value={paraData.profitchr}
                                      bizComponentId="L_AC010"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                                </td>
                                <th>매입매출</th>
                                <td>
                                  {bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="show_pur_sal_yn"
                                      value={paraData.show_pur_sal_yn}
                                      bizComponentId="L_AC090"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <th>제조분배</th>
                                <td>
                                  {bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="makesha"
                                      value={paraData.makesha}
                                      bizComponentId="L_BA073"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                                </td>
                                <th>세목구분</th>
                                <td>
                                  {bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="acntdiv"
                                      value={paraData.acntdiv}
                                      bizComponentId="L_AC007"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </FormBox>
                        </FormBoxWrap>
                      </GridContainer>
                    </SwiperSlide>
                    <SwiperSlide key={1}>
                      <GridContainer
                        style={{
                          width: "100%",
                          overflow: "auto",
                        }}
                      >
                        <GridTitleContainer className="ButtonContainer3">
                          <GridTitle>
                            <Button
                              onClick={() => {
                                if (swiper2 && isMobile) {
                                  swiper2.slideTo(0);
                                }
                              }}
                              icon="chevron-left"
                              themeColor={"primary"}
                              fillMode={"flat"}
                            ></Button>
                            관리항목
                          </GridTitle>
                          <ButtonContainer>
                            <Button
                              onClick={addRowDetail}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="plus"
                              disabled={permissions.save ? false : true}
                            ></Button>
                            <Button
                              onClick={removeRowDetail}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="minus"
                              disabled={permissions.save ? false : true}
                            ></Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <ExcelExport
                          data={mainDataResult2.data}
                          ref={(exporter) => {
                            _export2 = exporter;
                          }}
                          fileName="계정관리"
                        >
                          <Grid
                            style={{
                              height: mobileheight3,
                            }} // 65
                            data={process(
                              mainDataResult2.data.map((row) => ({
                                ...row,
                                rowstatus:
                                  row.rowstatus == null ||
                                  row.rowstatus == "" ||
                                  row.rowstatus == undefined
                                    ? ""
                                    : row.rowstatus,
                                [SELECTED_FIELD]:
                                  selectedState2[idGetter2(row)],
                              })),
                              mainDataState2
                            )}
                            {...mainDataState2}
                            onDataStateChange={onSubDataStateChange}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY2}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSubDataSelectionChange}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={mainDataResult2.total}
                            skip={page2.skip}
                            take={page2.take}
                            pageable={true}
                            onPageChange={pageChange2}
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
                                "grdDetailList"
                              ]
                                ?.sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
                                ?.map(
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
                                          checkBoxField.includes(item.fieldName)
                                            ? CheckBoxCell
                                            : comboBoxField.includes(
                                                item.fieldName
                                              )
                                            ? CustomComboBoxCell
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
                  </Swiper>
                </TabStripTab>
                <TabStripTab
                  title="재무제표상세"
                  disabled={
                    permissions.view
                      ? paraData.workType == "N"
                        ? true
                        : false
                      : true
                  }
                >
                  <GridContainer>
                    <FormBoxWrap className="ButtonContainer4">
                      <FormBox>
                        <tbody>
                          <tr>
                            <th>회기</th>
                            <td>
                              {customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="acntses"
                                  value={filters.acntses}
                                  customOptionData={customOptionData}
                                  changeData={filterComboBoxChange}
                                />
                              )}
                            </td>
                            <td>
                              <Button
                                onClick={search2}
                                icon="search"
                                themeColor={"primary"}
                                disabled={permissions.view ? false : true}
                              >
                                조회
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </FormBoxWrap>
                    <GridContainer>
                      <GridTitleContainer className="ButtonContainer5">
                        <ButtonContainer
                          style={{ justifyContent: "space-between" }}
                        >
                          <GridTitle>재무현황</GridTitle>
                          <div>
                            <Button
                              onClick={addRowDetail2}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="plus"
                            ></Button>
                            <Button
                              onClick={removeRowDetail2}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="minus"
                            ></Button>
                            <Button
                              onClick={saveDetail2}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="save"
                            ></Button>
                          </div>
                        </ButtonContainer>
                      </GridTitleContainer>
                      <ExcelExport
                        data={mainDataResult3.data}
                        ref={(exporter) => {
                          _export3 = exporter;
                        }}
                        fileName="계정관리"
                      >
                        <Grid
                          style={{
                            height: mobileheight4,
                          }}
                          data={process(
                            mainDataResult3.data.map((row) => ({
                              ...row,
                              rowstatus:
                                row.rowstatus == null ||
                                row.rowstatus == "" ||
                                row.rowstatus == undefined
                                  ? ""
                                  : row.rowstatus,
                              [SELECTED_FIELD]: selectedState3[idGetter3(row)],
                            })),
                            mainDataState3
                          )}
                          {...mainDataState3}
                          onDataStateChange={onSubDataStateChange2}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY2}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onSubDataSelectionChange2}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={mainDataResult3.total}
                          skip={page3.skip}
                          take={page3.take}
                          pageable={true}
                          onPageChange={pageChange3}
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
                          <GridColumn
                            field="rowstatus"
                            title=" "
                            width="50px"
                          />
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions[
                              "grdFinDetail"
                            ]
                              ?.sort(
                                (a: any, b: any) => a.sortOrder - b.sortOrder
                              )
                              ?.map(
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
                                          : readOnlyField.includes(
                                              item.fieldName
                                            )
                                          ? "read-only"
                                          : undefined
                                      }
                                      headerCell={
                                        requiredField.includes(item.fieldName)
                                          ? RequiredHeader
                                          : undefined
                                      }
                                      cell={
                                        checkBoxField.includes(item.fieldName)
                                          ? CheckBoxCell
                                          : comboBoxField.includes(
                                              item.fieldName
                                            )
                                          ? CustomComboBoxCell
                                          : undefined
                                      }
                                      editable={
                                        readOnlyField.includes(item.fieldName)
                                          ? false
                                          : true
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? finTotalFooterCell
                                          : undefined
                                      }
                                    />
                                  )
                              )}
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                  </GridContainer>
                </TabStripTab>
              </TabStrip>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width={`25%`}>
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>요약정보</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="계정관리"
              >
                <Grid
                  style={{ height: webheight }}
                  data={process(
                    mainDataResult.data.map((item) => ({
                      ...item,
                      [SELECTED_FIELD]: selectedState[idGetter(item)],
                    })),
                    mainDataState
                  )}
                  {...mainDataState}
                  ref={gridRef} //{(g) => {gridRef = g;}}
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
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdHeaderList"]
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
                                checkBoxField.includes(item.fieldName)
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
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(75% - ${GAP}px)`}>
              <TabStrip
                selected={tabSelected}
                onSelect={handleSelectTab}
                style={{ width: "100%" }}
                scrollable={isMobile}
              >
                <TabStripTab
                  title="상세정보"
                  disabled={permissions.view ? false : true}
                >
                  <ButtonContainer
                    className="ButtonContainer2"
                    style={{ float: "right" }}
                  >
                    <Button
                      onClick={onNewClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="file-add"
                      disabled={permissions.save ? false : true}
                    >
                      신규
                    </Button>
                    <Button
                      onClick={saveList}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      disabled={permissions.save ? false : true}
                    >
                      저장
                    </Button>
                    <Button
                      onClick={deleteList}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="delete"
                      disabled={permissions.delete ? false : true}
                    >
                      삭제
                    </Button>
                  </ButtonContainer>
                  <FormBoxWrap className="ButtonContainer6">
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>계정코드</th>
                          <td>
                            {paraData.workType == "N" ? (
                              <Input
                                name="acntcd"
                                type="text"
                                value={paraData.acntcd}
                                className="required"
                                onChange={InputChange}
                              />
                            ) : (
                              <Input
                                name="acntcd"
                                type="text"
                                value={paraData.acntcd}
                                className="readonly"
                              />
                            )}
                          </td>
                          <th>계정명</th>
                          <td>
                            <Input
                              name="acntnm"
                              type="text"
                              value={paraData.acntnm}
                              onChange={InputChange}
                              className="required"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>잔액구분</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentRadioGroup
                                name="acntbaldiv"
                                value={paraData.acntbaldiv}
                                bizComponentId="R_DRCR"
                                bizComponentData={bizComponentData}
                                changeData={RadioChange}
                              />
                            )}
                          </td>
                          <th>사용여부</th>
                          <td>
                            <Checkbox
                              name="useyn"
                              value={paraData.useyn == "Y" ? true : false}
                              onChange={CheckChange}
                            />
                          </td>
                          <th>시스템코드여부</th>
                          <td>
                            <Checkbox
                              name="system_yn"
                              value={paraData.system_yn == "Y" ? true : false}
                              onChange={CheckChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>계정그룹</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="acntgrp"
                                value={paraData.acntgrp}
                                bizComponentId="L_AC012"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th>거래처관리여부</th>
                          <td>
                            <Checkbox
                              name="mngdrcustyn"
                              label={"차변"}
                              value={paraData.mngdrcustyn == "Y" ? true : false}
                              onChange={CheckChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              name="mngcrcustyn"
                              label={"대변"}
                              value={paraData.mngcrcustyn == "Y" ? true : false}
                              onChange={CheckChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              name="mngsumcustyn"
                              label={"누계"}
                              value={
                                paraData.mngsumcustyn == "Y" ? true : false
                              }
                              onChange={CheckChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>계정특성</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="acntchr"
                                value={paraData.acntchr}
                                bizComponentId="L_AC008"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th>RATE관리</th>
                          <td>
                            <Checkbox
                              name="mngdrrateyn"
                              label={"차변"}
                              value={paraData.mngdrrateyn == "Y" ? true : false}
                              onChange={CheckChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              name="mngcrrateyn"
                              label={"대변"}
                              value={paraData.mngcrrateyn == "Y" ? true : false}
                              onChange={CheckChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>자금/예산</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="budgyn"
                                value={paraData.budgyn}
                                bizComponentId="L_AC033"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th>관리금액관리</th>
                          <td>
                            <Checkbox
                              name="mngdramtyn"
                              label={"차변"}
                              value={paraData.mngdramtyn == "Y" ? true : false}
                              onChange={CheckChange}
                            />
                          </td>
                          <td>
                            <Checkbox
                              name="mngcramtyn"
                              label={"대변"}
                              value={paraData.mngcramtyn == "Y" ? true : false}
                              onChange={CheckChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>손익분배</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="profitsha"
                                value={paraData.profitsha}
                                bizComponentId="L_BA073"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th rowSpan={3}>자동전표기준</th>
                          <th>지급</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="show_payment_yn"
                                value={paraData.show_payment_yn}
                                bizComponentId="L_AC090"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>자산부채특성</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="alcchr"
                                value={paraData.alcchr}
                                bizComponentId="L_AC009"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th>수금</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="show_collect_yn"
                                value={paraData.show_collect_yn}
                                bizComponentId="L_AC090"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>손익특성</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="profitchr"
                                value={paraData.profitchr}
                                bizComponentId="L_AC010"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th>매입매출</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="show_pur_sal_yn"
                                value={paraData.show_pur_sal_yn}
                                bizComponentId="L_AC090"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>제조분배</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="makesha"
                                value={paraData.makesha}
                                bizComponentId="L_BA073"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                          <th>세목구분</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="acntdiv"
                                value={paraData.acntdiv}
                                bizComponentId="L_AC007"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer3">
                      <GridTitle>관리항목</GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={addRowDetail}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="plus"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={removeRowDetail}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          disabled={permissions.save ? false : true}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult2.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName="계정관리"
                    >
                      <Grid
                        style={{ height: webheight2 }} // 65
                        data={process(
                          mainDataResult2.data.map((row) => ({
                            ...row,
                            rowstatus:
                              row.rowstatus == null ||
                              row.rowstatus == "" ||
                              row.rowstatus == undefined
                                ? ""
                                : row.rowstatus,
                            [SELECTED_FIELD]: selectedState2[idGetter2(row)],
                          })),
                          mainDataState2
                        )}
                        {...mainDataState2}
                        onDataStateChange={onSubDataStateChange}
                        //선택 기능
                        dataItemKey={DATA_ITEM_KEY2}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onSubDataSelectionChange}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={mainDataResult2.total}
                        skip={page2.skip}
                        take={page2.take}
                        pageable={true}
                        onPageChange={pageChange2}
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
                          customOptionData.menuCustomColumnOptions[
                            "grdDetailList"
                          ]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
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
                                      checkBoxField.includes(item.fieldName)
                                        ? CheckBoxCell
                                        : comboBoxField.includes(item.fieldName)
                                        ? CustomComboBoxCell
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
                </TabStripTab>
                <TabStripTab
                  title="재무제표상세"
                  disabled={
                    permissions.view
                      ? paraData.workType == "N"
                        ? true
                        : false
                      : true
                  }
                >
                  <FormBoxWrap className="ButtonContainer4">
                    <FormBox>
                      <tbody>
                        <tr>
                          <th style={{ width: "30vh" }}>회기</th>
                          <td>
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="acntses"
                                value={filters.acntses}
                                customOptionData={customOptionData}
                                changeData={filterComboBoxChange}
                              />
                            )}
                          </td>
                          <td style={{ textAlign: "left" }}>
                            <Button
                              onClick={search2}
                              icon="search"
                              themeColor={"primary"}
                            >
                              조회
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer5">
                      <GridTitle>재무현황</GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={addRowDetail2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="plus"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={removeRowDetail2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={saveDetail2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          disabled={permissions.save ? false : true}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult3.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="계정관리"
                    >
                      <Grid
                        style={{ height: webheight3 }}
                        data={process(
                          mainDataResult3.data.map((row) => ({
                            ...row,
                            rowstatus:
                              row.rowstatus == null ||
                              row.rowstatus == "" ||
                              row.rowstatus == undefined
                                ? ""
                                : row.rowstatus,
                            [SELECTED_FIELD]: selectedState3[idGetter3(row)],
                          })),
                          mainDataState3
                        )}
                        {...mainDataState3}
                        onDataStateChange={onSubDataStateChange2}
                        //선택 기능
                        dataItemKey={DATA_ITEM_KEY2}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onSubDataSelectionChange2}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={mainDataResult3.total}
                        skip={page3.skip}
                        take={page3.take}
                        pageable={true}
                        onPageChange={pageChange3}
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
                            "grdFinDetail"
                          ]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
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
                                        : readOnlyField.includes(item.fieldName)
                                        ? "read-only"
                                        : undefined
                                    }
                                    headerCell={
                                      requiredField.includes(item.fieldName)
                                        ? RequiredHeader
                                        : undefined
                                    }
                                    cell={
                                      checkBoxField.includes(item.fieldName)
                                        ? CheckBoxCell
                                        : comboBoxField.includes(item.fieldName)
                                        ? CustomComboBoxCell
                                        : undefined
                                    }
                                    editable={
                                      readOnlyField.includes(item.fieldName)
                                        ? false
                                        : true
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? finTotalFooterCell
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

export default AC_A0030W;
