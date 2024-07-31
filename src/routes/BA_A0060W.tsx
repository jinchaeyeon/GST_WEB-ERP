import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import "swiper/css";
import {
  ButtonContainer,
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
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  convertDateToStr,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getHeight,
  getMenuName,
  GetPropertyValueByName,
  handleKeyPressSearch,
  setDefaultDate,
  toDate,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { IItemData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/BA_A0060W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let targetRowIndex: null | number = null;
const dateField = ["recdt"];
const NumberField = ["dwgrev"];
const checkField = ["useyn"];
const BA_A0060W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const processApi = useApi();
  let gridRef: any = useRef(null);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [tabSelected, setTabSelected] = React.useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      if (height3 == 0 && !isMobile) {
        setTabSelected(0);
        height3 = getHeight(".FormBoxWrap");
      }
      height4 = getHeight(".k-tabstrip-items-wrapper");
      height5 = getHeight(".TitleContainer");
      if (!isMobile && tabSelected == 2) {
        setTabSelected(0);
      }
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height5 - height);
        setMobileHeight2(getDeviceHeight(true) - height4 - height5);
        setMobileHeight3(getDeviceHeight(true) - height4 - height5 - height2);
        setWebHeight(
          (getDeviceHeight(true) - height5 - height3 - height4 - height) / 2
        );
        setWebHeight2(
          (getDeviceHeight(true) - height5 - height3 - height4 - height) / 2
        );
        setWebHeight3(
          (getDeviceHeight(true) - height5 - height3 - height4 - height) / 2
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, tabSelected, webheight, webheight2, webheight3]);

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
        dwgrev: defaultOption.find((item: any) => item.id == "dwgrev")
          ?.valueCode,
        proccd: defaultOption.find((item: any) => item.id == "proccd")
          ?.valueCode,
        useyn: defaultOption.find((item: any) => item.id == "useyn")?.valueCode,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "BA_A0060W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "BA_A0060W_001");
      } else {
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        if (unsavedAttadatnums.length > 0) {
          setDeletedAttadatnums(unsavedAttadatnums);
        }
        resetAllGrid(); // 데이터 초기화
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
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
        optionsGridOne.sheets[1].title = "파일리스트";
        _export.save(optionsGridOne);
      }
    }
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;
    setPage2(initialPageState);
    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
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
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
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

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible2, setItemWindowVisible2] = useState<boolean>(false);

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    frdt: new Date(),
    todt: new Date(),
    dwgno: "",
    project: "",
    dwgrev: "",
    itemcd: "",
    itemnm: "",
    proccd: "",
    useyn: "%",
    dwgspec: "",
    poregnum: "",
    person: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "ATTACH",
    attdatnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [information, setInformation] = useState({
    workType: "N",
    apperson: "",
    aprecdt: "",
    attdatnum: "",
    custcd: "",
    custnm: "",
    dwgcd: "",
    dwggubun: "",
    dwgkey: "",
    dwgno: "",
    dwgrev: 0,
    dwgspec: "",
    insiz: "",
    itemcd: "",
    itemnm: "",
    orgdiv: sessionOrgdiv,
    person: sessionUserId,
    poregnum: "",
    position: "",
    proccd: "",
    project: "",
    recdt: new Date(),
    remark: "",
    rev_reason: "",
    useyn2: "Y",
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0060W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_dwgno": filters.dwgno,
        "@p_dwgspec": filters.dwgspec,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_person": filters.person,
        "@p_proccd": filters.proccd,
        "@p_useyn": filters.useyn,
        "@p_dwgrev": filters.dwgrev,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_attdatnum": "",
        "@p_poregnum": filters.poregnum,
        "@p_project": filters.project,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    setLoading(true);

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
            (row: any) => row.dwgkey == filters.find_row_value
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
            : rows.find((row: any) => row.dwgkey == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setInformation({
            workType: "U",
            apperson: selectedRow.apperson,
            aprecdt: selectedRow.aprecdt,
            attdatnum: selectedRow.attdatnum,
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            dwgcd: selectedRow.dwgcd,
            dwggubun: selectedRow.dwggubun,
            dwgkey: selectedRow.dwgkey,
            dwgno: selectedRow.dwgno,
            dwgrev: selectedRow.dwgrev,
            dwgspec: selectedRow.dwgspec,
            insiz: selectedRow.insiz,
            itemcd: selectedRow.itemcd,
            itemnm: selectedRow.itemnm,
            orgdiv: selectedRow.orgdiv,
            person: selectedRow.person,
            poregnum: selectedRow.poregnum,
            position: selectedRow.position,
            proccd: selectedRow.proccd,
            project: selectedRow.project,
            recdt: toDate(selectedRow.recdt),
            remark: selectedRow.remark,
            rev_reason: selectedRow.rev_reason,
            useyn2: selectedRow.useyn,
          });
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            attdatnum: selectedRow.attdatnum,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setInformation({
            workType: "U",
            apperson: rows[0].apperson,
            aprecdt: rows[0].aprecdt,
            attdatnum: rows[0].attdatnum,
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            dwgcd: rows[0].dwgcd,
            dwggubun: rows[0].dwggubun,
            dwgkey: rows[0].dwgkey,
            dwgno: rows[0].dwgno,
            dwgrev: rows[0].dwgrev,
            dwgspec: rows[0].dwgspec,
            insiz: rows[0].insiz,
            itemcd: rows[0].itemcd,
            itemnm: rows[0].itemnm,
            orgdiv: rows[0].orgdiv,
            person: rows[0].person,
            poregnum: rows[0].poregnum,
            position: rows[0].position,
            proccd: rows[0].proccd,
            project: rows[0].project,
            recdt: toDate(rows[0].recdt),
            remark: rows[0].remark,
            rev_reason: rows[0].rev_reason,
            useyn2: rows[0].useyn,
          });
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            attdatnum: selectedRow.attdatnum,
          }));
        }
      } else {
        setInformation({
          workType: "N",
          apperson: "",
          aprecdt: "",
          attdatnum: "",
          custcd: "",
          custnm: "",
          dwgcd: "",
          dwggubun: "",
          dwgkey: "",
          dwgno: "",
          dwgrev: 0,
          dwgspec: "",
          insiz: "",
          itemcd: "",
          itemnm: "",
          orgdiv: sessionOrgdiv,
          person: sessionUserId,
          poregnum: "",
          position: "",
          proccd: "",
          project: "",
          recdt: new Date(),
          remark: "",
          rev_reason: "",
          useyn2: "Y",
        });
        setPage2(initialPageState);
        setMainDataResult2(process([], mainDataState2));
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0060W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_dwgno": filters.dwgno,
        "@p_dwgspec": filters.dwgspec,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_person": filters.person,
        "@p_proccd": filters.proccd,
        "@p_useyn": filters.useyn,
        "@p_dwgrev": filters.dwgrev,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_attdatnum": filters2.attdatnum,
        "@p_poregnum": filters.poregnum,
        "@p_project": filters.project,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    setLoading(true);

    try {
      data = await processApi<any>("procedure", parameters);
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
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_PR010, L_sysUserMaster_001, R_YESNO",
    //품목계정, 수량단위
    setBizComponentData
  );

  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setProccdListData(getBizCom(bizComponentData, "L_PR010"));
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
    }
  }, [bizComponentData]);

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

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };
  const onItemWndClick2 = () => {
    setItemWindowVisible2(true);
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

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const setItemData2 = (data: IItemData) => {
    setInformation((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
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

    const person = userListData.find(
      (items: any) => items.user_name == selectedRowData.person
    )?.user_id;
    const proccd = proccdListData.find(
      (items: any) => items.code_name == selectedRowData.proccd
    )?.sub_code;

    setInformation({
      workType: "U",
      apperson: selectedRowData.apperson,
      aprecdt: selectedRowData.aprecdt,
      attdatnum: selectedRowData.attdatnum,
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      dwgcd: selectedRowData.dwgcd,
      dwggubun: selectedRowData.dwggubun,
      dwgkey: selectedRowData.dwgkey,
      dwgno: selectedRowData.dwgno,
      dwgrev: selectedRowData.dwgrev,
      dwgspec: selectedRowData.dwgspec,
      insiz: selectedRowData.insiz,
      itemcd: selectedRowData.itemcd,
      itemnm: selectedRowData.itemnm,
      orgdiv: selectedRowData.orgdiv,
      person: person == undefined ? "" : person,
      poregnum: selectedRowData.poregnum,
      position: selectedRowData.position,
      proccd: proccd == undefined ? "" : proccd,
      project: selectedRowData.project,
      recdt: toDate(selectedRowData.recdt),
      remark: selectedRowData.remark,
      rev_reason: selectedRowData.rev_reason,
      useyn2: selectedRowData.useyn,
    });
    setFilters2((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
      attdatnum: selectedRowData.attdatnum,
    }));
  };

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState(newSelectedState);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
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
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
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
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

  const onAddClick = () => {
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setInformation({
      workType: "N",
      apperson: "",
      aprecdt: "",
      attdatnum: "",
      custcd: "",
      custnm: "",
      dwgcd: "",
      dwggubun: "",
      dwgkey: "",
      dwgno: "",
      dwgrev: 0,
      dwgspec: "",
      insiz: "",
      itemcd: "",
      itemnm: "",
      orgdiv: sessionOrgdiv,
      person: defaultOption.find((item: any) => item.id == "person")?.valueCode,
      poregnum: "",
      position: "",
      proccd: defaultOption.find((item: any) => item.id == "proccd")?.valueCode,
      project: "",
      recdt: new Date(),
      remark: "",
      rev_reason: "",
      useyn2: defaultOption.find((item: any) => item.id == "useyn2")?.valueCode,
    });
    setTabSelected(0);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = () => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult.data.length != 0) {
      const data = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      setParaData((prev) => ({
        ...prev,
        workType: "D",
        orgdiv: data.orgdiv,
        dwgcd: data.dwgcd,
        dwgrev: data.dwgrev,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onSaveClick = () => {
    if (!permissions.save) return;
    let valid = true;
    if (
      information.dwgno == "" ||
      information.dwgno == undefined ||
      information.dwgno == null ||
      convertDateToStr(information.recdt).substring(0, 4) < "1997" ||
      convertDateToStr(information.recdt).substring(6, 8) > "31" ||
      convertDateToStr(information.recdt).substring(6, 8) < "01" ||
      convertDateToStr(information.recdt).substring(6, 8).length != 2
    ) {
      valid = false;
    }

    if (valid != true) {
      alert("필수값을 채워주세요.");
      return;
    }

    setParaData((prev) => ({
      ...prev,
      workType: information.workType,
      orgdiv: information.orgdiv,
      location: sessionLocation,
      dwgcd: information.dwgcd,
      dwgrev: information.dwgrev,
      dwgno: information.dwgno,
      dwgspec: information.dwgspec,
      recdt: convertDateToStr(information.recdt),
      person: information.person,
      project: information.project,
      itemcd: information.itemcd,
      proccd: information.proccd,
      useyn: information.useyn2,
      attdatnum: information.attdatnum,
      remark: information.remark,
      rev_reason: information.rev_reason,
      aprecdt: information.aprecdt,
      apperson: information.apperson,
      custcd: information.custcd,
      custnm: information.custnm,
      poregnum: information.poregnum,
      dwggubun: information.dwggubun,
    }));
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: "",
    location: "",
    dwgcd: "",
    dwgrev: 0,
    dwgno: "",
    dwgspec: "",
    recdt: "",
    person: "",
    project: "",
    itemcd: "",
    proccd: "",
    useyn: "",
    attdatnum: "",
    remark: "",
    rev_reason: "",
    aprecdt: "",
    apperson: "",
    custcd: "",
    custnm: "",
    poregnum: "",
    dwggubun: "",
  });

  const para: Iparameters = {
    procedureName: "P_BA_A0060W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_dwgcd": paraData.dwgcd,
      "@p_dwgrev": paraData.dwgrev,
      "@p_dwgno": paraData.dwgno,
      "@p_dwgspec": paraData.dwgspec,
      "@p_recdt": paraData.recdt,
      "@p_person": paraData.person,
      "@p_project": paraData.project,
      "@p_itemcd": paraData.itemcd,
      "@p_proccd": paraData.proccd,
      "@p_useyn": paraData.useyn,
      "@p_attdatnum": paraData.attdatnum,
      "@p_remark": paraData.remark,
      "@p_rev_reason": paraData.rev_reason,
      "@p_aprecdt": paraData.aprecdt,
      "@p_apperson": paraData.apperson,
      "@p_custcd": paraData.custcd,
      "@p_custnm": paraData.custnm,
      "@p_poregnum": paraData.poregnum,
      "@p_dwggubun": paraData.dwggubun,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "BA_A0060W",
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
      if (paraData.workType != "D") {
        setFilters((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          isSearch: true,
        }));
        setUnsavedAttadatnums([]);
        setUnsavedName([]);
      } else {
        const isLastDataDeleted =
          mainDataResult.data.length == 1 && filters.pgNum > 1;
        const findRowIndex = mainDataResult.data.findIndex(
          (row: any) =>
            row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        );
        setDeletedAttadatnums([information.attdatnum]);
        resetAllGrid();

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
                  .dwgkey,
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      }

      setParaData({
        workType: "",
        orgdiv: "",
        location: "",
        dwgcd: "",
        dwgrev: 0,
        dwgno: "",
        dwgspec: "",
        recdt: "",
        person: "",
        project: "",
        itemcd: "",
        proccd: "",
        useyn: "",
        attdatnum: "",
        remark: "",
        rev_reason: "",
        aprecdt: "",
        apperson: "",
        custcd: "",
        custnm: "",
        poregnum: "",
        dwggubun: "",
      });
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
              <th>작성일</th>
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
              <th>도면번호</th>
              <td>
                <Input
                  name="dwgno"
                  type="text"
                  value={filters.dwgno}
                  onChange={filterInputChange}
                />
              </td>
              <th>프로젝트</th>
              <td>
                <Input
                  name="project"
                  type="text"
                  value={filters.project}
                  onChange={filterInputChange}
                />
              </td>
              <th>리비전</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="dwgrev"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
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
            <tr>
              <th>도면사양</th>
              <td>
                <Input
                  name="dwgspec"
                  type="text"
                  value={filters.dwgspec}
                  onChange={filterInputChange}
                />
              </td>
              <th>공사번호</th>
              <td>
                <Input
                  name="poregnum"
                  type="text"
                  value={filters.poregnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용자</th>
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
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
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
              disabled={permissions.save ? false : true}
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
                person: userListData.find(
                  (items: any) => items.user_id == row.person
                )?.user_name,
                proccd: proccdListData.find(
                  (items: any) => items.sub_code == row.proccd
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
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            //페이지 처리
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
                          checkField.includes(item.fieldName)
                            ? CheckBoxReadOnlyCell
                            : NumberField.includes(item.fieldName)
                            ? NumberCell
                            : dateField.includes(item.fieldName)
                            ? DateCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder == 0 ? mainTotalFooterCell : undefined
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
          title="상세정보"
          disabled={permissions.view ? false : true}
        >
          <FormBoxWrap
            style={{
              height: webheight2,
              width: "100%",
              overflow: "auto",
            }}
            className="FormBoxWrap"
          >
            <FormBox>
              <tbody>
                <tr>
                  <th>일자</th>
                  <td>
                    <DatePicker
                      name="recdt"
                      value={information.recdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                      className="required"
                    />
                  </td>
                  <th>도면번호</th>
                  <td>
                    {information.workType == "N" ? (
                      <Input
                        name="dwgno"
                        type="text"
                        value={information.dwgno}
                        onChange={InputChange}
                        className="required"
                      />
                    ) : (
                      <Input
                        name="dwgno"
                        type="text"
                        value={information.dwgno}
                        className="readonly"
                      />
                    )}
                  </td>
                  <th>REV</th>
                  <td>
                    <Input
                      name="dwgrev"
                      type="text"
                      value={information.dwgrev}
                      className="readonly"
                    />
                  </td>
                  <th>도면사양</th>
                  <td>
                    <Input
                      name="dwgspec"
                      type="text"
                      value={information.dwgspec}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>품목코드</th>
                  <td>
                    <Input
                      name="itemcd"
                      type="text"
                      value={information.itemcd}
                      onChange={InputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onItemWndClick2}
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
                      value={information.itemnm}
                      className="readonly"
                    />
                  </td>
                  <th>공정</th>
                  <td>
                    {information.workType == "N"
                      ? customOptionData !== null && (
                          <CustomOptionComboBox
                            name="proccd"
                            value={information.proccd}
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            type="new"
                          />
                        )
                      : bizComponentData !== null && (
                          <BizComponentComboBox
                            name="proccd"
                            value={information.proccd}
                            bizComponentId="L_PR010"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            textField="code_name"
                            valueField="sub_code"
                          />
                        )}
                  </td>
                  <th>사용여부</th>
                  <td>
                    {information.workType == "N"
                      ? customOptionData !== null && (
                          <CustomOptionRadioGroup
                            name="useyn2"
                            customOptionData={customOptionData}
                            changeData={RadioChange}
                            type="new"
                          />
                        )
                      : bizComponentData !== null && (
                          <BizComponentRadioGroup
                            name="useyn2"
                            value={information.useyn2}
                            bizComponentId="R_YESNO"
                            bizComponentData={bizComponentData}
                            changeData={RadioChange}
                          />
                        )}
                  </td>
                </tr>
                <tr>
                  <th>프로젝트</th>
                  <td colSpan={3}>
                    <Input
                      name="project"
                      type="text"
                      value={information.project}
                      onChange={InputChange}
                    />
                  </td>
                  <th>공사번호</th>
                  <td colSpan={3}>
                    <Input
                      name="poregnum"
                      type="text"
                      value={information.poregnum}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>리비전사유</th>
                  <td colSpan={5}>
                    <Input
                      name="rev_reason"
                      type="text"
                      value={information.rev_reason}
                      className="readonly"
                    />
                  </td>
                  <th>담당자</th>
                  <td>
                    {information.workType == "N"
                      ? customOptionData !== null && (
                          <CustomOptionComboBox
                            name="person"
                            value={information.person}
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            type="new"
                            textField="user_name"
                            valueField="user_id"
                          />
                        )
                      : bizComponentData !== null && (
                          <BizComponentComboBox
                            name="person"
                            value={information.person}
                            bizComponentId="L_sysUserMaster_001"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            textField="user_name"
                            valueField="user_id"
                          />
                        )}
                  </td>
                </tr>
                <tr>
                  <th>비고</th>
                  <td colSpan={7}>
                    <TextArea
                      value={information.remark}
                      name="remark"
                      rows={2}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </TabStripTab>
        <TabStripTab
          title="첨부파일"
          disabled={
            permissions.view
              ? information.workType != "N"
                ? false
                : true
              : true
          }
        ></TabStripTab>
      </TabStrip>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"ROW_ADD"}
          setData={setItemData}
          modal={true}
        />
      )}
      {itemWindowVisible2 && (
        <ItemsWindow
          setVisible={setItemWindowVisible2}
          workType={"ROW_ADD"}
          setData={setItemData2}
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

export default BA_A0060W;
