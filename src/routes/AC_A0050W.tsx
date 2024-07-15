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
import { Input, NumericTextBox, TextArea } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { MonthView, Scheduler } from "@progress/kendo-react-scheduler";
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
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  dateformat2,
  getBizCom,
  getDeviceHeight,
  getHeight,
  GetPropertyValueByName,
  handleKeyPressSearch,
  toDate,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { FormWithCustomEditor2 } from "../components/Scheduler/custom-form";
import AccountWindow from "../components/Windows/CommonWindows/AccountWindow";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData, ICustData } from "../hooks/interfaces";
import { isLoading, OSState } from "../store/atoms";
import { gridList } from "../store/columns/AC_A0050W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

let height = 0;
let height2 = 0;
let height3 = 0;
const DATA_ITEM_KEY2 = "num";
let targetRowIndex2: null | number = null;
const dateField = ["cotracdt"];
const numberField = ["monsaveamt"];

const AC_A0050W: React.FC = () => {
  let gridRef2: any = useRef(null);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [osstate, setOSState] = useRecoilState(OSState);
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_A0050W", setCustomOptionData);

  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [messagesData, setMessagesData] = useState<any>(null);
  UseMessages("AC_A0050W", setMessagesData);
  const [tabSelected, setTabSelected] = useState(0);
  const [tabSelected2, setTabSelected2] = useState(0);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001, L_BA020, L_AC046, R_USEYN_only",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setdptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
    }
  }, [bizComponentData]);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-tabstrip-items-wrapper");
      height2 = getHeight(".TitleContainer");
      height3 = getHeight(".ButtonContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(false) - height - height2);
        setWebHeight(getDeviceHeight(false) - height - height2);
        setWebHeight2((getDeviceHeight(true) - height - height2) / 2 - height3);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, tabSelected, tabSelected2]);

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        bankacntdiv: defaultOption.find((item: any) => item.id == "bankacntdiv")
          ?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        useyn2: defaultOption.find((item: any) => item.id == "useyn2")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const defaultData: any[] = [
    {
      id: 0,
      title: "Default Data",
      start: new Date("2021-01-01T08:30:00.000Z"),
      end: new Date("2021-01-01T09:00:00.000Z"),
      colorID: { sub_code: 0, code_name: "없음", color: "" },
      dptcd: { text: "", value: "" },
      person: { text: "", value: "" },
    },
  ];

  const [mainDataResult, setMainDataResult] = useState(defaultData);
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });

  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );

  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "SCHEDULER",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    acntsrtnum: "",
    acntsrtnm: "",
    bankacntdiv: "",
    bankacntnum: "",
    dptcd: "",
    acntcd: "",
    remark: "",
    useyn2: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [infomation, setInfomation] = useState<{ [name: string]: any }>({
    workType: "N",
    acntcd: "",
    acntnm: "",
    acntsrtnm: "",
    acntsrtnum: "",
    amtunit: "",
    attdatnum: "",
    bankacntdiv: "",
    bankacntnum: "",
    bankcd: "",
    bankdiv: "",
    banknm: "",
    closedt: null,
    contracamt: 0,
    cotracdt: null,
    dptcd: "",
    enddt: null,
    files: "",
    findrow_key: "",
    intrat: 0,
    limitamt: 0,
    monsaveamt: 0,
    motgdesc: "",
    orgdiv: sessionOrgdiv,
    plandiv: "",
    remark: "",
    savecnt: 0,
    useyn: "N",
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const RadioChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);
  const [accountWindowVisible2, setAccountWindowVisible2] =
    useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
  };
  const onAccountWndClick2 = () => {
    setAccountWindowVisible2(true);
  };
  const setAcntData = (data: any) => {
    setFilters2((prev) => ({
      ...prev,
      acntcd: data.acntcd,
    }));
  };
  const setAcntData2 = (data: any) => {
    setInfomation((prev) => ({
      ...prev,
      acntcd: data.acntcd,
      acntnm: data.acntnm,
    }));
  };
  const setCustData = (data: ICustData) => {
    setInfomation((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };
  const getAttachmentsData = (data: IAttachmentData) => {
    setInfomation((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page2, setPage2] = useState(initialPageState);
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

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0050W_tab1_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_userid": userId,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => ({
        ...row,
        start: new Date(dateformat2(row.Strdt) + " 00:00"),
        end: new Date(
          dateformat2(row.Enddt) + (row.AllDay == 1 ? " 24:00" : " 23:00")
        ),
        description: row.contents,
        title: row.title,
        id: row.num,
        isAllday: row.AllDay == 1 ? true : false,
      }));

      setMainDataResult(rows);
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
      procedureName: "P_AC_A0050W_tab2_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_acntsrtnum": filters2.acntsrtnum,
        "@p_acntsrtnm": filters2.acntsrtnm,
        "@p_bankacntnum": filters2.bankacntnum,
        "@p_dptcd": filters2.dptcd,
        "@p_remark": filters2.remark,
        "@p_acntcd": filters2.acntcd,
        "@p_bankacntdiv": filters2.bankacntdiv,
        "@p_useyn": filters2.useyn2,

        "@p_find_row_value": filters2.find_row_value,
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
      if (filters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.acntsrtnum == filters2.find_row_value
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

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters2.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.acntsrtnum == filters2.find_row_value
              );
        if (selectedRow != undefined) {
          setSelectedState2({ [selectedRow[DATA_ITEM_KEY2]]: true });
          setInfomation({
            workType: "U",
            acntcd: selectedRow.acntcd,
            acntnm: selectedRow.acntnm,
            acntsrtnm: selectedRow.acntsrtnm,
            acntsrtnum: selectedRow.acntsrtnum,
            amtunit: selectedRow.amtunit,
            attdatnum: selectedRow.attdatnum,
            bankacntdiv: selectedRow.bankacntdiv,
            bankacntnum: selectedRow.bankacntnum,
            bankcd: selectedRow.bankcd,
            bankdiv: selectedRow.bankdiv,
            banknm: selectedRow.banknm,
            closedt:
              selectedRow.closedt == "" ? null : toDate(selectedRow.closedt),
            contracamt: selectedRow.contracamt,
            cotracdt:
              selectedRow.cotracdt == "" ? null : toDate(selectedRow.cotracdt),
            dptcd: selectedRow.dptcd,
            enddt: selectedRow.enddt == "" ? null : toDate(selectedRow.enddt),
            files: selectedRow.files,
            findrow_key: selectedRow.findrow_key,
            intrat: selectedRow.intrat,
            limitamt: selectedRow.limitamt,
            monsaveamt: selectedRow.monsaveamt,
            motgdesc: selectedRow.motgdesc,
            orgdiv: selectedRow.orgdiv,
            plandiv: selectedRow.plandiv,
            remark: selectedRow.remark,
            savecnt: selectedRow.savecnt,
            useyn: selectedRow.useyn,
          });
        } else {
          setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
          setInfomation({
            workType: "U",
            acntcd: rows[0].acntcd,
            acntnm: rows[0].acntnm,
            acntsrtnm: rows[0].acntsrtnm,
            acntsrtnum: rows[0].acntsrtnum,
            amtunit: rows[0].amtunit,
            attdatnum: rows[0].attdatnum,
            bankacntdiv: rows[0].bankacntdiv,
            bankacntnum: rows[0].bankacntnum,
            bankcd: rows[0].bankcd,
            bankdiv: rows[0].bankdiv,
            banknm: rows[0].banknm,
            closedt: rows[0].closedt == "" ? null : toDate(rows[0].closedt),
            contracamt: rows[0].contracamt,
            cotracdt: rows[0].cotracdt == "" ? null : toDate(rows[0].cotracdt),
            dptcd: rows[0].dptcd,
            enddt: rows[0].enddt == "" ? null : toDate(rows[0].enddt),
            files: rows[0].files,
            findrow_key: rows[0].findrow_key,
            intrat: rows[0].intrat,
            limitamt: rows[0].limitamt,
            monsaveamt: rows[0].monsaveamt,
            motgdesc: rows[0].motgdesc,
            orgdiv: rows[0].orgdiv,
            plandiv: rows[0].plandiv,
            remark: rows[0].remark,
            savecnt: rows[0].savecnt,
            useyn: rows[0].useyn,
          });
        }
      } else {
        setInfomation({
          workType: "N",
          acntcd: "",
          acntnm: "",
          acntsrtnm: "",
          acntsrtnum: "",
          amtunit: "",
          attdatnum: "",
          bankacntdiv: "",
          bankacntnum: "",
          bankcd: "",
          bankdiv: "",
          banknm: "",
          closedt: null,
          contracamt: 0,
          cotracdt: null,
          dptcd: "",
          enddt: null,
          files: "",
          findrow_key: "",
          intrat: 0,
          limitamt: 0,
          monsaveamt: 0,
          motgdesc: "",
          orgdiv: sessionOrgdiv,
          plandiv: "",
          remark: "",
          savecnt: 0,
          useyn: "N",
        });
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

  const resetAllGrid = () => {
    if (tabSelected == 0) {
      setMainDataResult(defaultData);
    } else if (tabSelected == 1) {
      setPage2(initialPageState);
      setMainDataResult2(process([], mainDataState2));
      setInfomation({
        workType: "N",
        acntcd: "",
        acntnm: "",
        acntsrtnm: "",
        acntsrtnum: "",
        amtunit: "",
        attdatnum: "",
        bankacntdiv: "",
        bankacntnum: "",
        bankcd: "",
        bankdiv: "",
        banknm: "",
        closedt: null,
        contracamt: 0,
        cotracdt: null,
        dptcd: "",
        enddt: null,
        files: "",
        findrow_key: "",
        intrat: 0,
        limitamt: 0,
        monsaveamt: 0,
        motgdesc: "",
        orgdiv: sessionOrgdiv,
        plandiv: "",
        remark: "",
        savecnt: 0,
        useyn: "N",
      });
    }
  };

  const search = () => {
    try {
      resetAllGrid();
      if (tabSelected == 0) {
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      } else if (tabSelected == 1) {
        setFilters2((prev) => ({
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

  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  useEffect(() => {
    if (
      filters2.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData, bizComponentData]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [mainDataResult2]);

  let _export2: any;
  const exportExcel = () => {
    if (tabSelected == 1) {
      if (_export2 !== null && _export2 !== undefined) {
        const optionsGridOne = _export2.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export2.save(optionsGridOne);
      }
    }
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };
  const handleSelectTab2 = (e: any) => {
    setTabSelected2(e.selected);
  };
  const displayDate: Date = new Date();

  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };

  //그리드 푸터
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

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    const dptcd = dptcdListData.find(
      (item: any) => item.dptnm == selectedRowData.dptcd
    )?.dptcd;

    setInfomation({
      workType: "U",
      acntcd: selectedRowData.acntcd,
      acntnm: selectedRowData.acntnm,
      acntsrtnm: selectedRowData.acntsrtnm,
      acntsrtnum: selectedRowData.acntsrtnum,
      amtunit: selectedRowData.amtunit,
      attdatnum: selectedRowData.attdatnum,
      bankacntdiv: selectedRowData.bankacntdiv,
      bankacntnum: selectedRowData.bankacntnum,
      bankcd: selectedRowData.bankcd,
      bankdiv: selectedRowData.bankdiv,
      banknm: selectedRowData.banknm,
      closedt:
        selectedRowData.closedt == "" ? null : toDate(selectedRowData.closedt),
      contracamt: selectedRowData.contracamt,
      cotracdt:
        selectedRowData.cotracdt == ""
          ? null
          : toDate(selectedRowData.cotracdt),
      dptcd: dptcd,
      enddt: selectedRowData.enddt == "" ? null : toDate(selectedRowData.enddt),
      files: selectedRowData.files,
      findrow_key: selectedRowData.findrow_key,
      intrat: selectedRowData.intrat,
      limitamt: selectedRowData.limitamt,
      monsaveamt: selectedRowData.monsaveamt,
      motgdesc: selectedRowData.motgdesc,
      orgdiv: selectedRowData.orgdiv,
      plandiv: selectedRowData.plandiv,
      remark: selectedRowData.remark,
      savecnt: selectedRowData.savecnt,
      useyn: selectedRowData.useyn,
    });
  };

  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onAddClick2 = () => {
    setTabSelected2(0);
    setInfomation({
      workType: "N",
      acntcd: "",
      acntnm: "",
      acntsrtnm: "",
      acntsrtnum: "",
      amtunit: "",
      attdatnum: "",
      bankacntdiv: "",
      bankacntnum: "",
      bankcd: "",
      bankdiv: "",
      banknm: "",
      closedt: null,
      contracamt: 0,
      cotracdt: null,
      dptcd: "",
      enddt: null,
      files: "",
      findrow_key: "",
      intrat: 0,
      limitamt: 0,
      monsaveamt: 0,
      motgdesc: "",
      orgdiv: sessionOrgdiv,
      plandiv: "",
      remark: "",
      savecnt: 0,
      useyn: "N",
    });
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>자금관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_A0050W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab
          title="스케줄러"
          disabled={permissions.view ? false : true}
        >
          {osstate == true ? (
            <div
              style={{
                backgroundColor: "#ccc",
                height: isMobile ? mobileheight : webheight,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              현재 OS에서는 지원이 불가능합니다.
            </div>
          ) : (
            <Scheduler
              height={isMobile ? mobileheight : webheight}
              data={mainDataResult}
              defaultDate={displayDate}
              editable={{
                add: false,
                remove: false,
                select: true,
                resize: false,
                drag: false,
                edit: true,
              }}
              form={FormWithCustomEditor2}
            >
              <MonthView />
            </Scheduler>
          )}
        </TabStripTab>
        <TabStripTab
          title="예적금관리"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>예금코드</th>
                  <td>
                    <Input
                      name="acntsrtnum"
                      type="text"
                      value={filters2.acntsrtnum}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>예적금명</th>
                  <td>
                    <Input
                      name="acntsrtnm"
                      type="text"
                      value={filters2.acntsrtnm}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>예적금구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="bankacntdiv"
                        value={filters2.bankacntdiv}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>계좌번호</th>
                  <td>
                    <Input
                      name="bankacntnum"
                      type="text"
                      value={filters2.bankacntnum}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>관리부서</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="dptcd"
                        value={filters2.dptcd}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="dptnm"
                        valueField="dptcd"
                      />
                    )}
                  </td>
                  <th>계정과목코드</th>
                  <td>
                    <Input
                      name="acntcd"
                      type="text"
                      value={filters2.acntcd}
                      onChange={filterInputChange}
                      className="required"
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onAccountWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>사용유무</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="useyn2"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>비고</th>
                  <td>
                    <Input
                      name="remark"
                      type="text"
                      value={filters2.remark}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          {isMobile ? (
            <></>
          ) : (
            <>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>요약정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick2}
                      themeColor={"primary"}
                      icon="file-add"
                      disabled={permissions.save ? false : true}
                    >
                      생성
                    </Button>
                    <Button
                      //onClick={onDeleteClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="delete"
                      disabled={permissions.delete ? false : true}
                    >
                      삭제
                    </Button>
                    <Button
                      //onClick={onSaveClick2}
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
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="자금관리"
                >
                  <Grid
                    style={{ height: webheight2 }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        dptcd: dptcdListData.find(
                          (item: any) => item.dptcd == row.dptcd
                        )?.dptnm,
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
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef2}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange2}
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
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell2
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <TabStrip
                style={{ width: "100%" }}
                selected={tabSelected2}
                onSelect={handleSelectTab2}
                scrollable={isMobile}
              >
                <TabStripTab
                  title="기본정보"
                  disabled={permissions.view ? false : true}
                >
                  <FormBoxWrap border={true} className="FormBoxWrap">
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>예적금구분</th>
                          <td>
                            {infomation.workType == "N" ? (
                              customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="bankacntdiv"
                                  value={infomation.bankacntdiv}
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                  type="new"
                                  className="required"
                                />
                              )
                            ) : (
                              <Input
                                name="bankacntdiv"
                                type="text"
                                value={infomation.bankacntdiv}
                                className="readonly"
                              />
                            )}
                          </td>
                          <th>예금코드</th>
                          <td>
                            {infomation.workType == "N" ? (
                              <Input
                                name="acntsrtnum"
                                type="text"
                                value={infomation.acntsrtnum}
                                onChange={InputChange}
                                className="required"
                              />
                            ) : (
                              <Input
                                name="acntsrtnum"
                                type="text"
                                value={infomation.acntsrtnum}
                                className="readonly"
                              />
                            )}
                          </td>
                          <th>관리부서</th>
                          <td>
                            {infomation.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="dptcd"
                                    value={infomation.dptcd}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                    type="new"
                                    textField="dptnm"
                                    valueField="dptcd"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="dptcd"
                                    value={infomation.dptcd}
                                    bizComponentId="L_dptcd_001"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                    textField="dptnm"
                                    valueField="dptcd"
                                  />
                                )}
                          </td>
                          <th>차월한도액</th>
                          <td>
                            <NumericTextBox
                              name="limitamt"
                              value={infomation.limitamt}
                              onChange={InputChange}
                              format="n2"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>예적금명</th>
                          <td colSpan={3}>
                            <Input
                              name="acntsrtnm"
                              type="text"
                              value={infomation.acntsrtnm}
                              onChange={InputChange}
                              className="required"
                            />
                          </td>
                          <th>계약일자</th>
                          <td>
                            <DatePicker
                              name="cotracdt"
                              value={infomation.cotracdt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                            />
                          </td>
                          <th>불입횟수</th>
                          <td>
                            <NumericTextBox
                              name="savecnt"
                              value={infomation.savecnt}
                              onChange={InputChange}
                              format="n0"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>결제계좌번호</th>
                          <td colSpan={3}>
                            <Input
                              name="bankacntnum"
                              type="text"
                              value={infomation.bankacntnum}
                              onChange={InputChange}
                              className="required"
                            />
                          </td>
                          <th>계약금액</th>
                          <td>
                            <NumericTextBox
                              name="contracamt"
                              value={infomation.contracamt}
                              onChange={InputChange}
                              format="n2"
                            />
                          </td>
                          <th>월불입액</th>
                          <td>
                            <NumericTextBox
                              name="monsaveamt"
                              value={infomation.monsaveamt}
                              onChange={InputChange}
                              format="n2"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>계정과목</th>
                          <td>
                            <Input
                              name="acntcd"
                              type="text"
                              value={infomation.acntcd}
                              onChange={InputChange}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onAccountWndClick2}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>계정과목명</th>
                          <td>
                            <Input
                              name="acntnm"
                              type="text"
                              value={infomation.acntnm}
                              onChange={InputChange}
                            />
                          </td>
                          <th>이율</th>
                          <td>
                            <NumericTextBox
                              name="intrat"
                              value={infomation.intrat}
                              onChange={InputChange}
                              format="n4"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>은행코드</th>
                          <td>
                            <Input
                              name="backcd"
                              type="text"
                              value={infomation.backcd}
                              onChange={InputChange}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onCustWndClick}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>은행코드명</th>
                          <td>
                            <Input
                              name="backnm"
                              type="text"
                              value={infomation.backnm}
                              onChange={InputChange}
                            />
                          </td>
                          <th>화폐단위</th>
                          <td>
                            {infomation.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="amtunit"
                                    value={infomation.amtunit}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="amtunit"
                                    value={infomation.amtunit}
                                    bizComponentId="L_BA020"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                  />
                                )}
                          </td>
                        </tr>
                        <tr>
                          <th>적금구분</th>
                          <td>
                            {infomation.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="plandiv"
                                    value={infomation.plandiv}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="plandiv"
                                    value={infomation.plandiv}
                                    bizComponentId="L_AC046"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                  />
                                )}
                          </td>
                          <th>만기일자</th>
                          <td>
                            <DatePicker
                              name="enddt"
                              value={infomation.enddt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                            />
                          </td>
                          <th>해약일자</th>
                          <td>
                            <DatePicker
                              name="closedt"
                              value={infomation.closedt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>담보사항</th>
                          <td colSpan={3}>
                            <Input
                              name="motgdesc"
                              type="text"
                              value={infomation.motgdesc}
                              onChange={InputChange}
                            />
                          </td>
                          <th>사용유무</th>
                          <td>
                            {infomation.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionRadioGroup
                                    name="useyn"
                                    customOptionData={customOptionData}
                                    changeData={RadioChange}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentRadioGroup
                                    name="useyn"
                                    value={infomation.useyn}
                                    bizComponentId="R_USEYN_only"
                                    bizComponentData={bizComponentData}
                                    changeData={RadioChange}
                                  />
                                )}
                          </td>
                        </tr>
                        <tr>
                          <th>첨부파일</th>
                          <td colSpan={7}>
                            <Input
                              name="files"
                              type="text"
                              value={infomation.files}
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
                            <TextArea
                              value={infomation.remark}
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
                  title="상세정보"
                  disabled={
                    permissions.view
                      ? infomation.workType == "N"
                        ? true
                        : false
                      : true
                  }
                ></TabStripTab>
                <TabStripTab
                  title="전표상세정보"
                  disabled={
                    permissions.view
                      ? infomation.workType == "N"
                        ? true
                        : false
                      : true
                  }
                ></TabStripTab>
              </TabStrip>
            </>
          )}
        </TabStripTab>
      </TabStrip>
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAcntData}
          modal={true}
        />
      )}
      {accountWindowVisible2 && (
        <AccountWindow
          setVisible={setAccountWindowVisible2}
          setData={setAcntData2}
          modal={true}
        />
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
          para={infomation.attdatnum}
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

export default AC_A0050W;
