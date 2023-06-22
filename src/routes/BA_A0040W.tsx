import React, { useCallback, useEffect, useState, useRef } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridCellProps,
} from "@progress/kendo-react-grid";
import { Checkbox, CheckboxChangeEvent } from "@progress/kendo-react-inputs";
import { IAttachmentData, IWindowPosition } from "../hooks/interfaces";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { gridList } from "../store/columns/BA_A0040W_C";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Icon, getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
  FormBoxWrap,
  FormBox,
  GridContainerWrap,
} from "../CommonStyled";
import FilterContainer from "../components/Containers/FilterContainer";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  getGridItemChangedData,
  dateformat,
  UseParaPc,
  UseGetValueFromSessionItem,
  useSysMessage,
} from "../components/CommonFunction";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
} from "../components/CommonString";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  isLoading,
  deletedAttadatnumsState,
  unsavedAttadatnumsState,
  loginResultState,
} from "../store/atoms";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import { TextArea } from "@progress/kendo-react-inputs";
const DATA_ITEM_KEY = "itemcd";
const SUB_DATA_ITEM_KEY2 = "num";
let deletedMainRows: object[] = [];

const NumberField = ["safeqty", "purleadtime", "unp"];
const CheckField = ["useyn"];
const DateField = ["recdt"];
const CustomComboField = ["unpitem", "amtunit", "itemacnt"];
const editableField = ["recdt"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 단가항목, 화폐단위, 품목계정
  UseBizComponent("L_BA008,L_BA020,L_BA061", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "unpitem"
      ? "L_BA008"
      : field === "amtunit"
      ? "L_BA020"
      : field === "itemacnt"
      ? "L_BA061"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      {...props}
      className="editable-new-only"
    />
  ) : (
    <td></td>
  );
};

const BA_A0040: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY2);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        raduseyn: defaultOption.find((item: any) => item.id === "raduseyn")
          .valueCode,
        itemacnt: defaultOption.find((item: any) => item.id === "itemacnt")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061,L_BA015",
    //품목계정, 수량단위
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );

      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
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

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subData2State, setSubData2State] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subData2Result, setSubData2Result] = useState<DataResult>(
    process([], subData2State)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubData2State, setSelectedsubData2State] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const [subPgNum, setSub2PgNum] = useState(1);
  const [tabSelected, setTabSelected] = React.useState(0);
  const [workType, setWorkType] = useState<string>("U");

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

  //Form 정보 Change함수
  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      if (name == "useyn" || name == "qcyn") {
        if (value == false || value == "N") {
          setInfomation((prev) => ({
            ...prev,
            [name]: "N",
          }));
        } else {
          setInfomation((prev) => ({
            ...prev,
            [name]: "Y",
          }));
        }
      } else {
        setInfomation((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [infomation, setInfomation] = useState({
    pgSize: PAGE_SIZE,
    workType: "U",
    itemcd: "자동생성",
    itemnm: "",
    insiz: "",
    itemacnt: "제품",
    useyn: "Y",
    custcd: "",
    custnm: "",
    itemcd_s: "",
    spec: "",
    location: "01",
    remark: "",
    bnatur: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    itemlvl4: "",
    bomyn: "",
    attdatnum: "",
    row_values: null,
    safeqty: 0,
    unitwgt: 0,
    invunit: "",
    dwgno: "",
    maker: "",
    qcyn: "N",
    attdatnum_img: null,
    attdatnum_img2: null,
    snp: 0,
    person: "",
    extra_field2: "",
    purleadtime: 0,
    len: 0,
    purqty: 0,
    boxqty: 0,
    pac: "",
    bnatur_insiz: 0,
    itemno: "",
    itemgroup: "",
    lenunit: "",
    hscode: "",
    wgtunit: "",
    custitemnm: "",
    unitqty: 0,
    procday: "",
    files: "",
    auto: "Y",
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    itemcd: "",
    itemnm: "",
    insiz: "",
    itemacnt: "",
    raduseyn: "Y",
    custcd: "",
    custnm: "",
    itemcd_s: "",
    spec: "",
    location: "01",
    remark: "",
    bnatur: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_BA_A0040W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_itemacnt": filters.itemacnt,
      "@p_useyn": filters.raduseyn,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_itemcd_s": filters.itemcd_s,
      "@p_spec": filters.spec,
      "@p_remark": filters.remark,
      "@p_find_row_value": filters.find_row_value,
    },
  };

  const [subfilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "UNP",
    itemcd: "",
    itemnm: "",
    insiz: "",
    itemacnt: "",
    useyn: "",
    custcd: "",
    custnm: "",
    itemcd_s: "",
    spec: "",
    location: "",
    remark: "",
    bnatur: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
  });

  //조회조건 파라미터
  const subparameters: Iparameters = {
    procedureName: "P_BA_A0040W_Q",
    pageNumber: subPgNum,
    pageSize: subfilters.pgSize,
    parameters: {
      "@p_work_type": subfilters.workType,
      "@p_itemcd": subfilters.itemcd,
      "@p_itemnm": subfilters.itemnm,
      "@p_insiz": subfilters.insiz,
      "@p_itemacnt": subfilters.itemacnt,
      "@p_useyn": subfilters.useyn,
      "@p_custcd": subfilters.custcd,
      "@p_custnm": subfilters.custnm,
      "@p_itemcd_s": subfilters.itemcd_s,
      "@p_spec": subfilters.spec,
      "@p_remark": subfilters.remark,
      "@p_find_row_value": null,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      rows.map((item: any) => {
        if (item.itemnm == infomation.itemnm) {
          setSelectedState({ [item.itemcd]: true });
        }
      });
      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
          setsubFilters((prev) => ({
            ...prev,
            workType: "UNP",
            itemcd: firstRowData.itemcd,
            itemnm: firstRowData.itemnm,
            insiz: firstRowData.insiz,
            itemacnt: firstRowData.itemacnt,
            useyn: firstRowData.useyn,
            custcd: firstRowData.custcd,
            custnm: firstRowData.custnm,
            itemcd_s: "",
            spec: firstRowData.spec,
            location: firstRowData.location,
            remark: firstRowData.remark,
            bnatur: firstRowData.bnatur,
            itemlvl1: firstRowData.itemlvl1,
            itemlvl2: firstRowData.itemlvl2,
            itemlvl3: firstRowData.itemlvl3,
          }));
          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            itemcd: firstRowData.itemcd,
            itemnm: firstRowData.itemnm,
            insiz: firstRowData.insiz,
            itemacnt:
              itemacntListData.find(
                (item: any) => item.sub_code === firstRowData.itemacnt
              )?.code_name == undefined
                ? firstRowData.itemacnt
                : itemacntListData.find(
                    (item: any) => item.sub_code === firstRowData.itemacnt
                  )?.code_name,
            useyn: firstRowData.useyn == "Y" ? "Y" : "N",
            custcd: firstRowData.custcd,
            custnm: firstRowData.custnm,
            itemcd_s: firstRowData.itemcd_s,
            spec: firstRowData.spec,
            location: "01",
            remark: firstRowData.remark,
            bnatur: firstRowData.bnatur,
            itemlvl1: firstRowData.itemlvl1,
            itemlvl2: firstRowData.itemlvl2,
            itemlvl3: firstRowData.itemlvl3,
            itemlvl4: firstRowData.itemlvl4,
            bomyn: firstRowData.bomyn,
            attdatnum: firstRowData.attdatnum,
            row_values: firstRowData.row_values,
            safeqty: firstRowData.safeqty,
            unitwgt: firstRowData.unitwgt,
            invunit:
              qtyunitListData.find(
                (item: any) => item.sub_code === firstRowData.invunit
              )?.code_name == undefined
                ? firstRowData.invunit
                : qtyunitListData.find(
                    (item: any) => item.sub_code === firstRowData.invunit
                  )?.code_name,
            dwgno: firstRowData.dwgno,
            maker: firstRowData.maker,
            qcyn: firstRowData.qcyn == "Y" ? "Y" : "N",
            attdatnum_img: firstRowData.attdatnum_img,
            attdatnum_img2: firstRowData.attdatnum_img2,
            snp: firstRowData.snp,
            person: firstRowData.person,
            extra_field2: firstRowData.extra_field2,
            purleadtime: firstRowData.purleadtime,
            len: firstRowData.len,
            purqty: firstRowData.purqty,
            boxqty: firstRowData.boxqty,
            pac: firstRowData.pac,
            bnatur_insiz: firstRowData.bnatur_insiz,
            itemno: firstRowData.itemno,
            itemgroup: firstRowData.itemgroup,
            lenunit: firstRowData.lenunit,
            hscode: firstRowData.hscode,
            wgtunit: firstRowData.wgtunit,
            custitemnm: firstRowData.custitemnm,
            unitqty: firstRowData.unitqty,
            procday: firstRowData.procday,
            files: firstRowData.files,
            auto: firstRowData.auto,
          });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchSubGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      const row = rows.map((item: any) => ({
        ...item,
        inEdit: "recdt",
      }));
      if (totalRowCnt > 0) {
        setSubData2Result((prev) => {
          return {
            data: [...prev.data, ...row],
            total: totalRowCnt,
          };
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  useEffect(() => {
    fetchSubGrid();
  }, [subPgNum]);

  let gridRef: any = useRef(null);
  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          tab: 0,
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  useEffect(() => {
    setSub2PgNum(1);
    setSubData2Result(process([], subData2State));
    if (customOptionData !== null) {
      fetchSubGrid();
    }
  }, [subfilters]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchSubGrid();
    }
  }, [subPgNum]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    setSub2PgNum(1);
    setSubData2Result(process([], subData2State));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
    setyn(true);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "U",
      itemcd: selectedRowData.itemcd,
      itemnm: selectedRowData.itemnm,
      insiz: selectedRowData.insiz,
      itemacnt: selectedRowData.itemacnt,
      useyn: selectedRowData.useyn == "Y" ? "Y" : "N",
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      itemcd_s: selectedRowData.itemcd_s,
      spec: selectedRowData.spec,
      location: "01",
      remark: selectedRowData.remark,
      bnatur: selectedRowData.bnatur,
      itemlvl1: selectedRowData.itemlvl1,
      itemlvl2: selectedRowData.itemlvl2,
      itemlvl3: selectedRowData.itemlvl3,
      itemlvl4: selectedRowData.itemlvl4,
      bomyn: selectedRowData.bomyn,
      attdatnum: selectedRowData.attdatnum,
      row_values: selectedRowData.row_values,
      safeqty: selectedRowData.safeqty,
      unitwgt: selectedRowData.unitwgt,
      invunit: selectedRowData.invunit,
      dwgno: selectedRowData.dwgno,
      maker: selectedRowData.maker,
      qcyn: selectedRowData.qcyn == "Y" ? "Y" : "N",
      attdatnum_img: selectedRowData.attdatnum_img,
      attdatnum_img2: selectedRowData.attdatnum_img2,
      snp: selectedRowData.snp,
      person: selectedRowData.person,
      extra_field2: selectedRowData.extra_field2,
      purleadtime: selectedRowData.purleadtime,
      len: selectedRowData.len,
      purqty: selectedRowData.purqty,
      boxqty: selectedRowData.boxqty,
      pac: selectedRowData.pac,
      bnatur_insiz: selectedRowData.bnatur_insiz,
      itemno: selectedRowData.itemno,
      itemgroup: selectedRowData.itemgroup,
      lenunit: selectedRowData.lenunit,
      hscode: selectedRowData.hscode,
      wgtunit: selectedRowData.wgtunit,
      custitemnm: selectedRowData.custitemnm,
      unitqty: selectedRowData.unitqty,
      procday: selectedRowData.procday,
      files: selectedRowData.files,
      auto: selectedRowData.auto,
    });
    setsubFilters((prev) => ({
      ...prev,
      itemcd: selectedRowData.itemcd,
      itemnm: selectedRowData.itemnm,
      insiz: selectedRowData.insiz,
      itemacnt: selectedRowData.itemacnt,
      useyn: selectedRowData.useyn,
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      itemcd_s: "",
      spec: selectedRowData.spec,
      location: selectedRowData.location,
      remark: selectedRowData.remark,
      bnatur: selectedRowData.bnatur,
      itemlvl1: selectedRowData.itemlvl1,
      itemlvl2: selectedRowData.itemlvl2,
      itemlvl3: selectedRowData.itemlvl3,
    }));
  };

  const onSubData2SelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: SUB_DATA_ITEM_KEY2,
    });
    setSelectedsubData2State(newSelectedState);
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  const onSub2ScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum, PAGE_SIZE))
      setSub2PgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubData2StateChange = (event: GridDataStateChangeEvent) => {
    setSubData2State(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const sub2TotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subData2Result.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onAddClick2 = () => {
    setWorkType("N");
    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "N",
      itemcd: "자동생성",
      itemnm: "",
      insiz: "",
      itemacnt: "제품",
      useyn: "Y",
      custcd: "",
      custnm: "",
      itemcd_s: "",
      spec: "",
      location: "01",
      remark: "",
      bnatur: "",
      itemlvl1: "",
      itemlvl2: "",
      itemlvl3: "",
      itemlvl4: "",
      bomyn: "",
      attdatnum: "",
      row_values: null,
      safeqty: 0,
      unitwgt: 0,
      invunit: "EA",
      dwgno: "",
      maker: "",
      qcyn: "N",
      attdatnum_img: null,
      attdatnum_img2: null,
      snp: 0,
      person: "",
      extra_field2: "",
      purleadtime: 0,
      len: 0,
      purqty: 0,
      boxqty: 0,
      pac: "",
      bnatur_insiz: 0,
      itemno: "",
      itemgroup: "",
      lenunit: "",
      hscode: "",
      wgtunit: "",
      custitemnm: "",
      unitqty: 0,
      procday: "",
      files: "",
      auto: "Y",
    });
  };

  const onAddClick = () => {
    let seq = subData2Result.total + deletedMainRows.length + 1;
    
    const newDataItem = {
      [SUB_DATA_ITEM_KEY2]: seq,
      recdt: convertDateToStr(new Date()),
      unpitem: "SYS01",
      amtunit: "KRW",
      itemacnt: "2",
      unp: 0,
      remark: "",
      inEdit: "recdt",
      rowstatus: "N",
    };
    setSelectedsubData2State({ [newDataItem.num]: true });
    setSubData2Result((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const handleSelectTab = (e: any) => {
    if (unsavedAttadatnums.length > 0)
      setDeletedAttadatnums(unsavedAttadatnums);
    setTabSelected(e.selected);
  };

  interface ICustData {
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

  type TdataArr = {
    unpitem: string[];
    rowstatus: string[];
    itemcd: string[];
    unp: string[];
    itemacnt: string[];
    remark: string[];
    recdt: string[];
    amtunit: string[];
  };

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const setCustData2 = (data: ICustData) => {
    setInfomation((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    if (!infomation.attdatnum) {
      setUnsavedAttadatnums([data.attdatnum]);
    }

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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubData2SortChange = (e: any) => {
    setSubData2State((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    deletedMainRows = [];
  };

  const onSubItemChange = (event: GridItemChangeEvent) => {
    setSubData2State((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subData2Result,
      setSubData2Result,
      SUB_DATA_ITEM_KEY2
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = subData2Result.data.map((item) =>
        item[SUB_DATA_ITEM_KEY2] === dataItem[SUB_DATA_ITEM_KEY2]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setSubData2Result((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = subData2Result.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setSubData2Result((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
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

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    itemcd: "",
    attdatnum: "",
  });

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];

    subData2Result.data.forEach((item: any, index: number) => {
      if (!selectedsubData2State[item[SUB_DATA_ITEM_KEY2]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows.push(newData2);
      }
    });
    setSubData2Result((prev) => ({
      data: newData,
      total: newData.length,
    }));

    setSubData2State({});
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    const items = Object.getOwnPropertyNames(selectedState)[0];
    const data = mainDataResult.data.filter((item) => item.itemcd === items)[0];
    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      itemcd: items,
      attdatnum: data.attdatnum,
    }));
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    user_id: userId,
    form_id: "BA_A0040W",
    pc: pc,
    unpitem: "",
    rowstatus: "",
    itemcd: "",
    unp: "",
    itemacnt: "",
    remark: "",
    recdt: "",
    amtunit: "",
  });

  const para: Iparameters = {
    procedureName: "P_BA_A0080W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "",
      "@p_orgdiv": paraData.orgdiv,
      "@p_unpitem_s": paraData.unpitem,
      "@p_rowstatus_s": paraData.rowstatus,
      "@p_itemcd_s": paraData.itemcd,
      "@p_itemacnt_s": paraData.itemacnt,
      "@p_unp_s": paraData.unp,
      "@p_remark_s": paraData.remark,
      "@p_userid": paraData.user_id,
      "@p_recdt_s": paraData.recdt,
      "@p_amtunit_s": paraData.amtunit,
      "@p_form_id": paraData.form_id,
      "@p_pc": paraData.pc,
    },
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_BA_A0040W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "D",
      "@p_itemcd": paraDataDeleted.itemcd,
      "@p_itemnm": infomation.itemnm,
      "@p_itemacnt": itemacntListData.find(
        (item: any) => item.code_name === infomation.itemacnt
      )?.sub_code,
      "@p_bnatur": infomation.bnatur,
      "@p_insiz": infomation.insiz,
      "@p_spec": infomation.spec,
      "@p_maker": infomation.maker,
      "@p_dwgno": infomation.dwgno,
      "@p_itemlvl1": infomation.itemlvl1,
      "@p_itemlvl2": infomation.itemlvl2,
      "@p_itemlvl3": infomation.itemlvl3,
      "@p_itemlvl4": infomation.itemlvl4,
      "@p_invunit": qtyunitListData.find(
        (item: any) => item.code_name === infomation.invunit
      )?.sub_code,
      "@p_bomyn": infomation.bomyn,
      "@p_qcyn": infomation.qcyn,
      "@p_unitwgt": infomation.unitwgt,
      "@p_useyn": infomation.useyn,
      "@p_attdatnum": infomation.attdatnum,
      "@p_attdatnum_img": infomation.attdatnum_img,
      "@p_attdatnum_img2": infomation.attdatnum_img2,
      "@p_remark": infomation.remark,
      "@p_safeqty": infomation.safeqty,
      "@p_location": "01",
      "@p_custcd": infomation.custcd,
      "@p_custnm": infomation.custnm,
      "@p_snp": infomation.snp,
      "@p_autocode": infomation.auto == null ? "N" : infomation.auto,
      "@p_person": infomation.person,
      "@p_extra_field2": infomation.extra_field2,
      "@p_serviceid": companyCode,
      "@p_purleadtime": infomation.purleadtime,
      "@p_len": infomation.len,
      "@p_purqty": infomation.purqty,
      "@p_boxqty": infomation.boxqty,
      "@p_part": "",
      "@p_pac": infomation.pac,
      "@p_bnatur_insiz": infomation.bnatur_insiz,
      "@p_itemno": infomation.itemno,
      "@p_itemgroup": infomation.itemgroup,
      "@p_lenunit": infomation.lenunit,
      "@p_hscode": infomation.hscode,
      "@p_wgtunit": infomation.wgtunit,
      "@p_custitemnm": infomation.custitemnm,
      "@p_unitqty": infomation.unitqty,
      "@p_procday": infomation.procday,
      "@p_itemcd_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "BA_A0040W",
    },
  };

  const infopara: Iparameters = {
    procedureName: "P_BA_A0040W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": infomation.workType,
      "@p_itemcd": infomation.itemcd,
      "@p_itemnm": infomation.itemnm,
      "@p_itemacnt":
        itemacntListData.find(
          (item: any) => item.code_name == infomation.itemacnt
        )?.sub_code == undefined
          ? infomation.itemacnt
          : itemacntListData.find(
              (item: any) => item.code_name == infomation.itemacnt
            )?.sub_code,
      "@p_bnatur": infomation.bnatur,
      "@p_insiz": infomation.insiz,
      "@p_spec": infomation.spec,
      "@p_maker": infomation.maker,
      "@p_dwgno": infomation.dwgno,
      "@p_itemlvl1": infomation.itemlvl1,
      "@p_itemlvl2": infomation.itemlvl2,
      "@p_itemlvl3": infomation.itemlvl3,
      "@p_itemlvl4": infomation.itemlvl4,
      "@p_invunit":
        qtyunitListData.find(
          (item: any) => item.code_name === infomation.invunit
        )?.sub_code == undefined
          ? infomation.invunit
          : qtyunitListData.find(
              (item: any) => item.code_name === infomation.invunit
            )?.sub_code,
      "@p_bomyn": infomation.bomyn,
      "@p_qcyn": infomation.qcyn,
      "@p_unitwgt": infomation.unitwgt,
      "@p_useyn": infomation.useyn,
      "@p_attdatnum": infomation.attdatnum,
      "@p_attdatnum_img": infomation.attdatnum_img,
      "@p_attdatnum_img2": infomation.attdatnum_img2,
      "@p_remark": infomation.remark,
      "@p_safeqty": infomation.safeqty,
      "@p_location": "01",
      "@p_custcd": infomation.custcd,
      "@p_custnm": infomation.custnm,
      "@p_snp": infomation.snp,
      "@p_autocode": infomation.auto == null ? "N" : infomation.auto,
      "@p_person": infomation.person,
      "@p_extra_field2": infomation.extra_field2,
      "@p_serviceid": companyCode,
      "@p_purleadtime": infomation.purleadtime,
      "@p_len": infomation.len,
      "@p_purqty": infomation.purqty,
      "@p_boxqty": infomation.boxqty,
      "@p_part": "",
      "@p_pac": infomation.pac,
      "@p_bnatur_insiz": infomation.bnatur_insiz,
      "@p_itemno": infomation.itemno,
      "@p_itemgroup": infomation.itemgroup,
      "@p_lenunit": infomation.lenunit,
      "@p_hscode": infomation.hscode,
      "@p_wgtunit": infomation.wgtunit,
      "@p_custitemnm": infomation.custitemnm,
      "@p_unitqty": infomation.unitqty,
      "@p_procday": infomation.procday,
      "@p_itemcd_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "BA_A0040W",
    },
  };

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete();
  }, [paraDataDeleted]);

  const onSaveClick = async () => {
    let valid = true;
    try {
      subData2Result.data.map((item: any) => {
        if (
          item.recdt.substring(0, 4) < "1997" ||
          item.recdt.substring(6, 8) > "31" ||
          item.recdt.substring(6, 8) < "01" ||
          item.recdt.substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "BA_A0040W_003");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const dataItem = subData2Result.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;
    let dataArr: TdataArr = {
      unpitem: [],
      rowstatus: [],
      itemcd: [],
      unp: [],
      itemacnt: [],
      remark: [],
      recdt: [],
      amtunit: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        unpitem = "",
        rowstatus = "",
        unp = "",
        itemacnt = "",
        remark = "",
        recdt = "",
        amtunit = "",
      } = item;

      dataArr.rowstatus.push(rowstatus);
      dataArr.unpitem.push(unpitem);
      dataArr.itemcd.push(Object.getOwnPropertyNames(selectedState)[0]);
      dataArr.unp.push(unp);
      dataArr.itemacnt.push(itemacnt);
      dataArr.remark.push(remark);
      dataArr.recdt.push(recdt);
      dataArr.amtunit.push(amtunit);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        unpitem = "",
        unp = "",
        itemacnt = "",
        remark = "",
        recdt = "",
        amtunit = "",
      } = item;
      dataArr.rowstatus.push("D");
      dataArr.unpitem.push(unpitem);
      dataArr.itemcd.push(Object.getOwnPropertyNames(selectedState)[0]);
      dataArr.unp.push(unp);
      dataArr.itemacnt.push(itemacnt);
      dataArr.remark.push(remark);
      dataArr.recdt.push(recdt);
      dataArr.amtunit.push(amtunit);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "",
      orgdiv: "01",
      user_id: userId,
      form_id: "BA_A0040W",
      pc: pc,
      unpitem: dataArr.unpitem.join("|"),
      rowstatus: dataArr.rowstatus.join("|"),
      itemcd: dataArr.itemcd.join("|"),
      unp: dataArr.unp.join("|"),
      itemacnt: dataArr.itemacnt.join("|"),
      remark: dataArr.remark.join("|"),
      recdt: dataArr.recdt.join("|"),
      amtunit: dataArr.amtunit.join("|"),
    }));
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      // 첨부파일 삭제
      if (paraDataDeleted.attdatnum)
        setDeletedAttadatnums([paraDataDeleted.attdatnum]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    //초기화
    setParaDataDeleted((prev) => ({
      work_type: "",
      itemcd: "",
      attdatnum: "",
    }));
  };

  const onSaveClick2 = async () => {
    fetchSaved();
  };

  const fetchSaved = async () => {
    let data: any;

    let valid = true;
    try {
      if (!infomation.invunit) {
        throw findMessage(messagesData, "BA_A0040W_001");
      }

      if (!infomation.itemnm) {
        throw findMessage(messagesData, "BA_A0040W_002");
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    setLoading(true);

    try {
      data = await processApi<any>("procedure", infopara);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      setSelectedState({ [infomation.itemcd]: true });
      // 초기화
      setUnsavedAttadatnums([]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.statusCode == "P_BA_A0040_S_001") {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
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
      setSub2PgNum(1);
      setSubData2Result(process([], subData2State));

      fetchSubGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.itemcd != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  //checkbox 유무
  const [yn, setyn] = useState(true);

  const CheckChange = (event: CheckboxChangeEvent) => {
    setyn(event.value);
    let value = event.value == true ? "Y" : "N";
    if (value == "Y") {
      setInfomation((prev) => ({
        ...prev,
        auto: value,
        itemcd: "자동생성",
      }));
    } else {
      setInfomation((prev) => ({
        ...prev,
        auto: value,
        itemcd: "",
      }));
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>품목관리</Title>

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
              <th>품목계정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemacnt"
                    value={filters.itemacnt}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>사용여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="raduseyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>
              <th>사양</th>
              <td>
                <Input
                  name="spec"
                  type="text"
                  value={filters.spec}
                  onChange={filterInputChange}
                />
              </td>
              <th>비고</th>
              <td>
                <Input
                  name="remark"
                  type="text"
                  value={filters.remark}
                  onChange={filterInputChange}
                />
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
        </FilterBox>
      </FilterContainer>
      <GridContainerWrap>
        <GridContainer width="89.7vw">
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>요약정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick2}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="file-add"
                >
                  신규
                </Button>
                <Button
                  onClick={onSaveClick2}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                >
                  저장
                </Button>
                <Button
                  onClick={onDeleteClick2}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="delete"
                >
                  삭제
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "40vh" }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  itemacnt: itemacntListData.find(
                    (item: any) => item.sub_code === row.itemacnt
                  )?.code_name,
                  invunit: qtyunitListData.find(
                    (item: any) => item.sub_code === row.invunit
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
              //스크롤 조회 기능
              fixedScroll={true}
              total={mainDataResult.total}
              onScroll={onMainScrollHandler}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange}
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
                          CheckField.includes(item.fieldName)
                            ? CheckBoxCell
                            : NumberField.includes(item.fieldName)
                            ? NumberCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0 ? mainTotalFooterCell : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </ExcelExport>
        </GridContainer>
      </GridContainerWrap>
      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
        <TabStripTab title="상세정보">
          <FormBoxWrap style={{ height: "30vh" }}>
            <FormBox>
              <tbody>
                <tr>
                  <th>품목코드</th>
                  {infomation.itemcd != "자동생성" && yn == true ? (
                    <>
                      <td colSpan={2}>
                        <Input
                          name="itemcd"
                          type="text"
                          value={infomation.itemcd}
                          className="readonly"
                        />
                      </td>
                      <td></td>
                    </>
                  ) : (
                    <>
                      <td colSpan={2}>
                        {yn == true ? (
                          <Input
                            name="itemcd"
                            type="text"
                            value={"자동생성"}
                            className="readonly"
                          />
                        ) : (
                          <Input
                            name="itemcd"
                            type="text"
                            value={infomation.itemcd}
                            onChange={InputChange}
                          />
                        )}
                      </td>
                      <td>
                        <Checkbox
                          defaultChecked={true}
                          value={yn}
                          onChange={CheckChange}
                          label={"자동생성"}
                          style={{ marginLeft: "30px" }}
                        />
                      </td>
                    </>
                  )}
                  <th>품목명</th>
                  <td>
                    <Input
                      name="itemnm"
                      type="text"
                      value={infomation.itemnm}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                  <th>품목계정</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="itemacnt"
                        value={infomation.itemacnt}
                        bizComponentId="L_BA061"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        textField={"code_name"}
                        valueField={"code_name"}
                        className="required"
                      />
                    )}
                  </td>
                  <th>수량단위</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="invunit"
                        value={infomation.invunit}
                        bizComponentId="L_BA015"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        textField={"code_name"}
                        valueField={"code_name"}
                        className="required"
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>단위중량</th>
                  <td>
                    <Input
                      name="unitwgt"
                      type="number"
                      value={infomation.unitwgt}
                      onChange={InputChange}
                      style={{ textAlign: "right" }}
                    />
                  </td>
                  <th>안전재고량</th>
                  <td>
                    <Input
                      name="safeqty"
                      type="number"
                      value={infomation.safeqty}
                      onChange={InputChange}
                      style={{ textAlign: "right" }}
                    />
                  </td>
                  <th>대분류</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="itemlvl1"
                        value={infomation.itemlvl1}
                        bizComponentId="L_BA171"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>중분류</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="itemlvl2"
                        value={infomation.itemlvl2}
                        bizComponentId="L_BA172"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>소분류</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="itemlvl3"
                        value={infomation.itemlvl3}
                        bizComponentId="L_BA173"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>사용여부</th>
                  <td>
                    <Checkbox
                      name="useyn"
                      value={infomation.useyn == "Y" ? true : false}
                      onChange={InputChange}
                    />
                  </td>
                  <th>사양</th>
                  <td>
                    <Input
                      name="spec"
                      type="text"
                      value={infomation.spec}
                      onChange={InputChange}
                    />
                  </td>
                  <th>재질</th>
                  <td>
                    <Input
                      name="bnatur"
                      type="text"
                      value={infomation.bnatur}
                      onChange={InputChange}
                    />
                  </td>
                  <th>업체코드</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={infomation.custcd}
                      onChange={InputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick2}
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
                      value={infomation.custnm}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>규격</th>
                  <td>
                    <Input
                      name="insiz"
                      type="text"
                      value={infomation.insiz}
                      onChange={InputChange}
                    />
                  </td>
                  <th>도면번호</th>
                  <td>
                    <Input
                      name="dwgno"
                      type="text"
                      value={infomation.dwgno}
                      onChange={InputChange}
                    />
                  </td>
                  <th>Marker</th>
                  <td>
                    <Input
                      name="maker"
                      type="text"
                      value={infomation.maker}
                      onChange={InputChange}
                    />
                  </td>
                  <th>검사유무</th>
                  <td>
                    <Checkbox
                      name="qcyn"
                      value={infomation.qcyn == "Y" ? true : false}
                      onChange={InputChange}
                    />
                  </td>
                  <th>첨부파일</th>
                  <td>
                    <Input name="files" type="text" value={infomation.files} />
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
                  <td colSpan={10}>
                    <TextArea
                      value={infomation.remark}
                      name="remark"
                      rows={4}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </TabStripTab>
        <TabStripTab title="단가">
          <GridContainerWrap>
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>단가정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "26vh" }}
                data={process(
                  subData2Result.data.map((row) => ({
                    ...row,
                    recdt: new Date(dateformat(row.recdt)),
                    rowstatus:
                      row.rowstatus == null ||
                      row.rowstatus == "" ||
                      row.rowstatus == undefined
                        ? ""
                        : row.rowstatus,
                    [SELECTED_FIELD]: selectedsubData2State[idGetter2(row)],
                  })),
                  subData2State
                )}
                {...subData2State}
                onDataStateChange={onSubData2StateChange}
                //선택 기능
                dataItemKey={SUB_DATA_ITEM_KEY2}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "multiple",
                }}
                onSelectionChange={onSubData2SelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={subData2Result.total}
                onScroll={onSub2ScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onSubData2SortChange}
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
                            DateField.includes(item.fieldName)
                              ? DateCell
                              : CustomComboField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : NumberField.includes(item.fieldName)
                              ? NumberCell
                              : undefined
                          }
                          className={
                            editableField.includes(item.fieldName)
                              ? "editable-new-only"
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? sub2TotalFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={workType}
          setData={setCustData2}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"ROW_ADD"}
          setData={setItemData}
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={infomation.attdatnum}
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

export default BA_A0040;
