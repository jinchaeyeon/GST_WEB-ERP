import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import CenterCell from "../components/Cells/CenterCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_B2000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const numberField = ["carriedamt", "dramt", "cramt", "balamt"];
const dateField = ["acntdt1"];
const centerField = ["acntdate"];

const AC_B2000W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("AC_B2000W", setMessagesData);
  const [tabSelected, setTabSelected] = React.useState(0);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "R_acntcdDiv, R_acntgrpC, R_achtgrpB, R_achtgrpD, R_BA005",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_B2000W", setCustomOptionData);

  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
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
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  //엑셀 내보내기

  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  let _export5: any;
  let _export6: any;
  let _export7: any;
  let _export8: any;
  let _export9: any;
  let _export10: any;
  let _export11: any;
  let _export12: any;
  let _export13: any;
  let _export14: any;
  let _export15: any;
  let _export16: any;
  let _export17: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridTwo = _export2.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[2] = optionsGridThree.sheets[0];
        optionsGridOne.sheets[0].title = "계정과목별 리스트";
        optionsGridOne.sheets[1].title = "계정과목별 전표내역";
        optionsGridOne.sheets[2].title = "계정과목별 전표상세";
        _export.save(optionsGridOne);
      }
    }
    if (_export4 !== null && _export4 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridFour = _export4.workbookOptions();
        const optionsGridFive = _export5.workbookOptions();
        const optionsGridSix = _export6.workbookOptions();
        optionsGridFour.sheets[1] = optionsGridFive.sheets[0];
        optionsGridFour.sheets[2] = optionsGridSix.sheets[0];
        optionsGridFour.sheets[0].title = "매출채권채무 리스트";
        optionsGridFour.sheets[1].title = "매출채권채무 전표내역";
        optionsGridFour.sheets[2].title = "매출채권채무 전표상세";
        _export4.save(optionsGridFour);
      }
    }
    if (_export7 !== null && _export7 !== undefined) {
      if (tabSelected == 2) {
        const optionsGridSeven = _export7.workbookOptions();
        const optionsGridEight = _export8.workbookOptions();
        const optionsGridNine = _export9.workbookOptions();
        optionsGridSeven.sheets[1] = optionsGridEight.sheets[0];
        optionsGridSeven.sheets[2] = optionsGridNine.sheets[0];
        optionsGridSeven.sheets[0].title = "예적금/차입금 리스트";
        optionsGridSeven.sheets[1].title = "예적금/차입금 전표내역";
        optionsGridSeven.sheets[2].title = "예적금/차입금 전표상세";
        _export7.save(optionsGridSeven);
      }
    }
    if (_export10 !== null && _export10 !== undefined) {
      if (tabSelected == 3) {
        const optionsGridTen = _export10.workbookOptions();
        const optionsGridEleven = _export11.workbookOptions();
        const optionsGridTwelve = _export12.workbookOptions();
        optionsGridTen.sheets[1] = optionsGridEleven.sheets[0];
        optionsGridTen.sheets[2] = optionsGridTwelve.sheets[0];
        optionsGridTen.sheets[0].title = "손익 리스트";
        optionsGridTen.sheets[1].title = "손익 전표내역";
        optionsGridTen.sheets[2].title = "손익 전표상세";
        _export10.save(optionsGridTen);
      }
    }
    if (_export13 !== null && _export13 !== undefined) {
      if (tabSelected == 4) {
        const optionsGridThirteen = _export13.workbookOptions();
        const optionsGridFourteen = _export14.workbookOptions();
        const optionsGridFirteen = _export15.workbookOptions();
        optionsGridThirteen.sheets[1] = optionsGridFourteen.sheets[0];
        optionsGridThirteen.sheets[2] = optionsGridFirteen.sheets[0];
        optionsGridThirteen.sheets[0].title = "제조 리스트";
        optionsGridThirteen.sheets[1].title = "제조 전표내역";
        optionsGridThirteen.sheets[2].title = "제조 전표상세";
        _export13.save(optionsGridThirteen);
      }
    }
    if (_export16 !== null && _export16 !== undefined) {
      if (tabSelected == 5) {
        const optionsGridSixteen = _export16.workbookOptions();
        const optionsGridSeventeen = _export17.workbookOptions();
        optionsGridSixteen.sheets[1] = optionsGridSeventeen.sheets[0];
        optionsGridSixteen.sheets[0].title = "거래처별 리스트";
        optionsGridSixteen.sheets[1].title = "거래처별 상세정보";
        _export16.save(optionsGridSixteen);
      }
    }
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    worktype: "TAB1_1",
    orgdiv: "01",
    frdt: new Date(),
    todt: new Date(),
    custcd: "",
    custnm: "",
    zerochk: "N",
    acntcd: "",
    acntdt: "",
    div: "%",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    worktype: "TAB1_2",
    custcd: "",
    acntcd: "",
    pgNum: 1,
    isSearch: true,
  });
  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    worktype: "TAB1_3",
    acntcd: "",
    custcd: "",
    acntdt: "",
    pgNum: 1,
    isSearch: true,
  });
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    if (name == "zerochk") {
      setFilters((prev) => ({
        ...prev,
        [name]: value == true ? "Y" : "N",
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B2000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B2000W_001");
      } else {
        setPage(initialPageState); // 페이지 초기화
        resetAllGrid(); // 데이터 초기화
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
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

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
    setFilters3((prev) => ({
      ...prev,
      custcd: data.custcd,
    }));
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    setFilters2((prev) => ({
      ...prev,
      custcd: "",
      acntcd: "",
      pgNum: 1,
    }));
    setFilters3((prev) => ({
      ...prev,
      acntcd: "",
      custcd: "",
      acntdt: "",
      pgNum: 1,
    }));
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        worktype: "TAB1_1",
        custcd: "",
        custnm: "",
        acntcd: "",
        acntdt: "",
        div: "%",
        isSearch: true,
        pgNum: 1,
      }));
    } else if (e.selected == 1) {
      setFilters((prev) => ({
        ...prev,
        worktype: "TAB2_1",
        custcd: "",
        custnm: "",
        acntcd: "",
        acntdt: "",
        div: "%",
        isSearch: true,
        pgNum: 1,
      }));
    } else if (e.selected == 2) {
      setFilters((prev) => ({
        ...prev,
        worktype: "TAB3_1",
        custcd: "",
        custnm: "",
        acntcd: "",
        acntdt: "",
        div: "%",
        isSearch: true,
        pgNum: 1,
      }));
    } else if (e.selected == 3) {
      setFilters((prev) => ({
        ...prev,
        worktype: "TAB4_1",
        custcd: "",
        custnm: "",
        acntcd: "",
        acntdt: "",
        div: "%",
        isSearch: true,
        pgNum: 1,
      }));
    } else if (e.selected == 4) {
      setFilters((prev) => ({
        ...prev,
        worktype: "TAB5_1",
        custcd: "",
        custnm: "",
        acntcd: "",
        acntdt: "",
        div: "%",
        isSearch: true,
        pgNum: 1,
      }));
    } else if (e.selected == 5) {
      setFilters((prev) => ({
        ...prev,
        worktype: "TAB6_1",
        custcd: "",
        custnm: "",
        acntcd: "",
        acntdt: "",
        div: "%",
        isSearch: true,
        pgNum: 1,
      }));
    }
  };

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B2000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters.todt).substring(0, 6),
        "@p_div": filters.div,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_zerochk": filters.zerochk,
        "@p_acntcd": filters.acntcd,
        "@p_acntdt": filters.acntdt,
        "@p_find_row_value": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        if (tabSelected == 0) {
          setFilters2((prev) => ({
            ...prev,
            worktype: "TAB1_2",
            acntcd: rows[0].acntcd,
            isSearch: true,
            pgNum: 1,
          }));
        } else if (tabSelected == 1) {
          setFilters2((prev) => ({
            ...prev,
            worktype: "TAB2_2",
            acntcd: rows[0].acntcd,
            isSearch: true,
            pgNum: 1,
          }));
        } else if (tabSelected == 2) {
          setFilters2((prev) => ({
            ...prev,
            worktype: "TAB3_2",
            acntcd: rows[0].acntcd,
            isSearch: true,
            pgNum: 1,
          }));
        } else if (tabSelected == 3) {
          setFilters2((prev) => ({
            ...prev,
            worktype: "TAB4_2",
            acntcd: rows[0].acntcd,
            isSearch: true,
            pgNum: 1,
          }));
        } else if (tabSelected == 4) {
          setFilters2((prev) => ({
            ...prev,
            worktype: "TAB5_2",
            acntcd: rows[0].acntcd,
            isSearch: true,
            pgNum: 1,
          }));
        } else if (tabSelected == 5) {
          setFilters2((prev) => ({
            ...prev,
            worktype: "TAB6_2",
            custcd: rows[0].custcd,
            isSearch: true,
            pgNum: 1,
          }));
        }
      } else {
        setPage2(initialPageState);
        setPage3(initialPageState);
        setMainDataResult2(process([], mainDataState2));
        setMainDataResult3(process([], mainDataState3));
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
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B2000W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters.todt).substring(0, 6),
        "@p_div": filters.div,
        "@p_custcd": filters2.custcd,
        "@p_custnm": filters.custnm,
        "@p_zerochk": filters.zerochk,
        "@p_acntcd": filters2.acntcd,
        "@p_acntdt": filters.acntdt,
        "@p_find_row_value": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
        if (tabSelected == 0) {
          setFilters3((prev) => ({
            ...prev,
            worktype: "TAB1_3",
            acntcd: filters2.acntcd,
            acntdt: rows[0].acntdt,
            isSearch: true,
            pgNum: 1,
          }));
        } else if (tabSelected == 1) {
          setFilters3((prev) => ({
            ...prev,
            worktype: "TAB2_3",
            acntcd: filters2.acntcd,
            custcd: rows[0].custcd,
            isSearch: true,
            pgNum: 1,
          }));
        } else if (tabSelected == 2) {
          setFilters3((prev) => ({
            ...prev,
            worktype: "TAB3_3",
            acntcd: filters2.acntcd,
            custcd: rows[0].cd,
            isSearch: true,
            pgNum: 1,
          }));
        } else if (tabSelected == 3) {
          setFilters3((prev) => ({
            ...prev,
            worktype: "TAB4_3",
            acntcd: rows[0].acntcd,
            isSearch: true,
            pgNum: 1,
          }));
        } else if (tabSelected == 4) {
          setFilters3((prev) => ({
            ...prev,
            worktype: "TAB5_3",
            acntcd: rows[0].acntcd,
            isSearch: true,
            pgNum: 1,
          }));
        }
      } else {
        setPage3(initialPageState);
        setMainDataResult3(process([], mainDataState3));
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
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B2000W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters.todt).substring(0, 6),
        "@p_div": filters.div,
        "@p_custcd": filters3.custcd,
        "@p_custnm": filters.custnm,
        "@p_zerochk": filters.zerochk,
        "@p_acntcd": filters3.acntcd,
        "@p_acntdt": filters3.acntdt,
        "@p_find_row_value": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters3.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
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
    if (tabSelected == 0) {
      setFilters2((prev) => ({
        ...prev,
        worktype: "TAB1_2",
        acntcd: selectedRowData.acntcd,
        isSearch: true,
        pgNum: 1,
      }));
    } else if (tabSelected == 1) {
      setFilters2((prev) => ({
        ...prev,
        worktype: "TAB2_2",
        acntcd: selectedRowData.acntcd,
        isSearch: true,
        pgNum: 1,
      }));
    } else if (tabSelected == 2) {
      setFilters2((prev) => ({
        ...prev,
        worktype: "TAB3_2",
        acntcd: selectedRowData.acntcd,
        isSearch: true,
        pgNum: 1,
      }));
    } else if (tabSelected == 3) {
      setFilters2((prev) => ({
        ...prev,
        worktype: "TAB4_2",
        acntcd: selectedRowData.acntcd,
        isSearch: true,
        pgNum: 1,
      }));
    } else if (tabSelected == 4) {
      setFilters2((prev) => ({
        ...prev,
        worktype: "TAB5_2",
        acntcd: selectedRowData.acntcd,
        isSearch: true,
        pgNum: 1,
      }));
    } else if (tabSelected == 5) {
      setFilters2((prev) => ({
        ...prev,
        worktype: "TAB6_2",
        custcd: selectedRowData.custcd,
        isSearch: true,
        pgNum: 1,
      }));
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
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    if (tabSelected == 0) {
      setFilters3((prev) => ({
        ...prev,
        worktype: "TAB1_3",
        acntcd: filters2.acntcd,
        acntdt: selectedRowData.acntdt,
        isSearch: true,
        pgNum: 1,
      }));
    } else if (tabSelected == 1) {
      setFilters3((prev) => ({
        ...prev,
        worktype: "TAB2_3",
        acntcd: filters2.acntcd,
        custcd: selectedRowData.custcd,
        isSearch: true,
        pgNum: 1,
      }));
    } else if (tabSelected == 2) {
      setFilters3((prev) => ({
        ...prev,
        worktype: "TAB3_3",
        acntcd: filters2.acntcd,
        custcd: selectedRowData.cd,
        isSearch: true,
        pgNum: 1,
      }));
    } else if (tabSelected == 3) {
      setFilters3((prev) => ({
        ...prev,
        worktype: "TAB4_3",
        acntcd: selectedRowData.acntcd,
        isSearch: true,
        pgNum: 1,
      }));
    } else if (tabSelected == 4) {
      setFilters3((prev) => ({
        ...prev,
        worktype: "TAB5_3",
        acntcd: selectedRowData.acntcd,
        isSearch: true,
        pgNum: 1,
      }));
    }
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedState3(newSelectedState);
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

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult3.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const createColumn = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"amt1"}
        title={"상품매출"}
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"amt3"}
        title={"상품국내"}
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
        width="100px"
      />
    );
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"amt2"}
        title={"상품매출"}
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"amt4"}
        title={"제품매출"}
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
        width="100px"
      />
    );
    return array;
  };

  return (
    <>
      <TitleContainer>
        <Title>경영정보조회</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_B2000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>

      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>기준년월</th>
              <td>
                <div className="filter-item-wrap">
                  <DatePicker
                    name="frdt"
                    value={filters.frdt}
                    format="yyyy-MM"
                    onChange={filterInputChange}
                    className="required"
                    placeholder=""
                    calendar={MonthCalendar}
                  />
                  <DatePicker
                    name="todt"
                    value={filters.todt}
                    format="yyyy-MM"
                    onChange={filterInputChange}
                    className="required"
                    placeholder=""
                    calendar={MonthCalendar}
                  />
                </div>
              </td>
              <td>
                <Checkbox
                  name="zerochk"
                  value={
                    filters.zerochk == "Y"
                      ? true
                      : filters.zerochk == "N"
                      ? false
                      : filters.zerochk
                  }
                  onChange={filterInputChange}
                  label={"0원포함"}
                ></Checkbox>
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="계정과목별">
          <GridContainerWrap>
            <GridContainer width="15%">
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentRadioGroup
                            name="div"
                            value={filters.div}
                            bizComponentId="R_acntcdDiv"
                            bizComponentData={bizComponentData}
                            changeData={filterRadioChange}
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="경영정보조회"
              >
                <Grid
                  style={{ height: "65vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
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
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="acntnm"
                    title="계정명"
                    width="120px"
                    footerCell={mainTotalFooterCell}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(85% - ${GAP}px)`}>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="경영정보조회"
                >
                  <Grid
                    style={{ height: "35vh" }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState2[idGetter2(row)],
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
                                centerField.includes(item.fieldName)
                                  ? CenterCell
                                  : numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 0
                                  ? mainTotalFooterCell2
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell2
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult3.data}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName="경영정보조회"
                >
                  <Grid
                    style={{ height: "42vh" }}
                    data={process(
                      mainDataResult3.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState3[idGetter3(row)],
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList2"].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
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
                                item.sortOrder === 0
                                  ? mainTotalFooterCell3
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell3
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="매출채권채무">
          <GridContainerWrap>
            <GridContainer width="15%">
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentRadioGroup
                            name="div"
                            value={filters.div}
                            bizComponentId="R_acntgrpC"
                            bizComponentData={bizComponentData}
                            changeData={filterRadioChange}
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export4 = exporter;
                }}
                fileName="경영정보조회"
              >
                <Grid
                  style={{ height: "70vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
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
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="acntnm"
                    title="계정명"
                    width="120px"
                    footerCell={mainTotalFooterCell}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(85% - ${GAP}px)`}>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export5 = exporter;
                  }}
                  fileName="경영정보조회"
                >
                  <Grid
                    style={{ height: "35vh" }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState2[idGetter2(row)],
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList3"].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 0
                                  ? mainTotalFooterCell2
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell2
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult3.data}
                  ref={(exporter) => {
                    _export6 = exporter;
                  }}
                  fileName="경영정보조회"
                >
                  <Grid
                    style={{ height: "42vh" }}
                    data={process(
                      mainDataResult3.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState3[idGetter3(row)],
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList4"].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
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
                                item.sortOrder === 0
                                  ? mainTotalFooterCell3
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell3
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="예적금/차입금">
          <GridContainerWrap>
            <GridContainer width="15%">
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentRadioGroup
                            name="div"
                            value={filters.div}
                            bizComponentId="R_achtgrpB"
                            bizComponentData={bizComponentData}
                            changeData={filterRadioChange}
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export7 = exporter;
                }}
                fileName="경영정보조회"
              >
                <Grid
                  style={{ height: "70vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
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
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="acntnm"
                    title="계정명"
                    width="120px"
                    footerCell={mainTotalFooterCell}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(85% - ${GAP}px)`}>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export8 = exporter;
                  }}
                  fileName="경영정보조회"
                >
                  <Grid
                    style={{ height: "35vh" }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState2[idGetter2(row)],
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList5"].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 0
                                  ? mainTotalFooterCell2
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell2
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult3.data}
                  ref={(exporter) => {
                    _export9 = exporter;
                  }}
                  fileName="경영정보조회"
                >
                  <Grid
                    style={{ height: "42vh" }}
                    data={process(
                      mainDataResult3.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState3[idGetter3(row)],
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList6"].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
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
                                item.sortOrder === 0
                                  ? mainTotalFooterCell3
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell3
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="손익">
          <GridContainerWrap>
            <GridContainer width="15%">
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentRadioGroup
                            name="div"
                            value={filters.div}
                            bizComponentId="R_achtgrpD"
                            bizComponentData={bizComponentData}
                            changeData={filterRadioChange}
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export10 = exporter;
                }}
                fileName="경영정보조회"
              >
                <Grid
                  style={{ height: "70vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
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
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="acntnm"
                    title="계정명"
                    width="120px"
                    footerCell={mainTotalFooterCell}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(85% - ${GAP}px)`}>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export11 = exporter;
                  }}
                  fileName="경영정보조회"
                >
                  <Grid
                    style={{ height: "35vh" }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState2[idGetter2(row)],
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList7"].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 0
                                  ? mainTotalFooterCell2
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell2
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult3.data}
                  ref={(exporter) => {
                    _export12 = exporter;
                  }}
                  fileName="경영정보조회"
                >
                  <Grid
                    style={{ height: "42vh" }}
                    data={process(
                      mainDataResult3.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState3[idGetter3(row)],
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList8"].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
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
                                item.sortOrder === 0
                                  ? mainTotalFooterCell3
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell3
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="제조">
          <GridContainerWrap>
            <GridContainer width="15%">
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export13 = exporter;
                }}
                fileName="경영정보조회"
              >
                <Grid
                  style={{ height: "80vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
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
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="acntnm"
                    title="계정명"
                    width="120px"
                    footerCell={mainTotalFooterCell}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(85% - ${GAP}px)`}>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export14 = exporter;
                  }}
                  fileName="경영정보조회"
                >
                  <Grid
                    style={{ height: "35vh" }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState2[idGetter2(row)],
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList9"].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 0
                                  ? mainTotalFooterCell2
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell2
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult3.data}
                  ref={(exporter) => {
                    _export15 = exporter;
                  }}
                  fileName="경영정보조회"
                >
                  <Grid
                    style={{ height: "42vh" }}
                    data={process(
                      mainDataResult3.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState3[idGetter3(row)],
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList10"].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
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
                                item.sortOrder === 0
                                  ? mainTotalFooterCell3
                                  : numberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell3
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="거래처별 매출">
          <FormBoxWrap border={true}>
            <FormBox>
              <tbody>
                <tr>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentRadioGroup
                        name="div"
                        value={filters.div}
                        bizComponentId="R_BA005"
                        bizComponentData={bizComponentData}
                        changeData={filterRadioChange}
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
              </tbody>
            </FormBox>
          </FormBoxWrap>
          <GridContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export16 = exporter;
              }}
              fileName="경영정보조회"
            >
              <Grid
                style={{ height: "30vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
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
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn
                  field="custnm"
                  title="업체"
                  width="120px"
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn title="내수">{createColumn()}</GridColumn>
                <GridColumn title="수출">{createColumn2()}</GridColumn>
                <GridColumn
                  field="amt5"
                  title="기타매출"
                  width="100px"
                  cell={NumberCell}
                  footerCell={gridSumQtyFooterCell}
                />
                <GridColumn
                  field="amt0"
                  title="합계"
                  width="100px"
                  cell={NumberCell}
                  footerCell={gridSumQtyFooterCell}
                />
              </Grid>
            </ExcelExport>
          </GridContainer>
          <GridContainer>
            <ExcelExport
              data={mainDataResult2.data}
              ref={(exporter) => {
                _export17 = exporter;
              }}
              fileName="경영정보조회"
            >
              <Grid
                style={{ height: "40vh" }}
                data={process(
                  mainDataResult2.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState2[idGetter2(row)],
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
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList11"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          id={item.id}
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
                            item.sortOrder === 0
                              ? mainTotalFooterCell2
                              : numberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell2
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
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
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

export default AC_B2000W;
