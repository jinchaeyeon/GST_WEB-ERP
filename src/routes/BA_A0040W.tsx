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
import {
  Checkbox,
  CheckboxChangeEvent,
  Input,
  TextArea,
} from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInInput,
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
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat,
  findMessage,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  handleKeyPressSearch,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  heightstate,
  isLoading,
  isMobileState,
  loginResultState,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/BA_A0040W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var index = 0;

const DATA_ITEM_KEY = "itemcd";
const SUB_DATA_ITEM_KEY2 = "num";
let deletedMainRows: object[] = [];

const NumberField = ["safeqty", "purleadtime", "unp"];
const CheckField = ["useyn"];
const DateField = ["recdt"];
const CustomComboField = ["unpitem", "amtunit", "itemacnt"];
const requiredField = ["recdt", "unpitem", "amtunit", "itemacnt"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 단가항목, 화폐단위, 품목계정
  UseBizComponent("L_BA008,L_BA020,L_BA061", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "unpitem"
      ? "L_BA008"
      : field == "amtunit"
      ? "L_BA020"
      : field == "itemacnt"
      ? "L_BA061"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
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
let temp = 0;
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

const BA_A0040: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY2);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");

    const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("BA_A0040W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("BA_A0040W", setCustomOptionData);
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);
  var height = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
  var height3 = getHeight(".k-tabstrip-items-wrapper");

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        raduseyn: defaultOption.find((item: any) => item.id == "raduseyn")
          ?.valueCode,
        itemacnt: defaultOption.find((item: any) => item.id == "itemacnt")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061,L_BA015, L_BA171, L_BA172, L_BA173",
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
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subData2State, setSubData2State] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subData2Result, setSubData2Result] = useState<DataResult>(
    process([], subData2State)
  );
  const [subData2Result2, setSubData2Result2] = useState<DataResult>(
    process([], subData2State)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
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

  const [tabSelected, setTabSelected] = React.useState(0);
  const [workType, setWorkType] = useState<string>("U");

  const [imgBase64, setImgBase64] = useState<string[]>([]);

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
    location: sessionLocation,
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

  const [infomation2, setInfomation2] = useState({
    pgSize: PAGE_SIZE,
    workType: "IMAGE",
    itemcd: "",
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
    location: sessionLocation,
    remark: "",
    bnatur: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

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
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [subfilters2, setsubFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "IMAGE",
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
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;

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

    setLoading(true);

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      rows.map((item: any) => {
        if (item.itemnm == infomation.itemnm) {
          setSelectedState({ [item.itemcd]: true });
        }
      });

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
        // find_row_value 행 선택, find_row_value 없는 경우 첫번째 행 선택
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setsubFilters((prev) => ({
            ...prev,
            workType: "UNP",
            itemcd: selectedRow.itemcd,
            itemnm: selectedRow.itemnm,
            insiz: selectedRow.insiz,
            itemacnt: selectedRow.itemacnt,
            useyn: selectedRow.useyn,
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            itemcd_s: "",
            spec: selectedRow.spec,
            location: selectedRow.location,
            remark: selectedRow.remark,
            bnatur: selectedRow.bnatur,
            itemlvl1: selectedRow.itemlvl1,
            itemlvl2: selectedRow.itemlvl2,
            itemlvl3: selectedRow.itemlvl3,
            find_row_value: "",
            pgNum: 1,
            isSearch: true,
          }));
          setsubFilters2((prev) => ({
            ...prev,
            workType: "IMAGE",
            itemcd: selectedRow.itemcd,
            itemnm: selectedRow.itemnm,
            insiz: selectedRow.insiz,
            itemacnt: selectedRow.itemacnt,
            useyn: selectedRow.useyn,
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            itemcd_s: "",
            spec: selectedRow.spec,
            location: selectedRow.location,
            remark: selectedRow.remark,
            find_row_value: "",
            pgNum: 1,
            isSearch: true,
          }));
          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            itemcd: selectedRow.itemcd,
            itemnm: selectedRow.itemnm,
            insiz: selectedRow.insiz,
            itemacnt:
              itemacntListData.find(
                (item: any) => item.sub_code == selectedRow.itemacnt
              )?.code_name == undefined
                ? selectedRow.itemacnt
                : itemacntListData.find(
                    (item: any) => item.sub_code == selectedRow.itemacnt
                  )?.code_name,
            useyn: selectedRow.useyn == "Y" ? "Y" : "N",
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            itemcd_s: selectedRow.itemcd_s,
            spec: selectedRow.spec,
            location: sessionLocation,
            remark: selectedRow.remark,
            bnatur: selectedRow.bnatur,
            itemlvl1: selectedRow.itemlvl1,
            itemlvl2: selectedRow.itemlvl2,
            itemlvl3: selectedRow.itemlvl3,
            itemlvl4: selectedRow.itemlvl4,
            bomyn: selectedRow.bomyn,
            attdatnum: selectedRow.attdatnum,
            row_values: selectedRow.row_values,
            safeqty: selectedRow.safeqty,
            unitwgt: selectedRow.unitwgt,
            invunit:
              qtyunitListData.find(
                (item: any) => item.sub_code == selectedRow.invunit
              )?.code_name == undefined
                ? selectedRow.invunit == undefined
                  ? ""
                  : selectedRow.invunit
                : qtyunitListData.find(
                    (item: any) => item.sub_code == selectedRow.invunit
                  )?.code_name,
            dwgno: selectedRow.dwgno,
            maker: selectedRow.maker,
            qcyn: selectedRow.qcyn == "Y" ? "Y" : "N",
            attdatnum_img: selectedRow.attdatnum_img,
            attdatnum_img2: selectedRow.attdatnum_img2,
            snp: selectedRow.snp,
            person: selectedRow.person,
            extra_field2: selectedRow.extra_field2,
            purleadtime: selectedRow.purleadtime,
            len: selectedRow.len,
            purqty: selectedRow.purqty,
            boxqty: selectedRow.boxqty,
            pac: selectedRow.pac,
            bnatur_insiz: selectedRow.bnatur_insiz,
            itemno: selectedRow.itemno,
            itemgroup: selectedRow.itemgroup,
            lenunit: selectedRow.lenunit,
            hscode: selectedRow.hscode,
            wgtunit: selectedRow.wgtunit,
            custitemnm: selectedRow.custitemnm,
            unitqty: selectedRow.unitqty,
            procday: selectedRow.procday,
            files: selectedRow.files,
            auto: selectedRow.auto,
          });
          setInfomation2({
            pgSize: PAGE_SIZE,
            workType: "IMAGE",
            itemcd: selectedRow.itemcd,
          });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setsubFilters((prev) => ({
            ...prev,
            workType: "UNP",
            itemcd: rows[0].itemcd,
            itemnm: rows[0].itemnm,
            insiz: rows[0].insiz,
            itemacnt: rows[0].itemacnt,
            useyn: rows[0].useyn,
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            itemcd_s: "",
            spec: rows[0].spec,
            location: rows[0].location,
            remark: rows[0].remark,
            bnatur: rows[0].bnatur,
            itemlvl1: rows[0].itemlvl1,
            itemlvl2: rows[0].itemlvl2,
            itemlvl3: rows[0].itemlvl3,
            find_row_value: "",
            pgNum: 1,
            isSearch: true,
          }));
          setsubFilters((prev) => ({
            ...prev,
            workType: "IMAGE",
            itemcd: rows[0].itemcd,
            itemnm: rows[0].itemnm,
            insiz: rows[0].insiz,
            itemacnt: rows[0].itemacnt,
            useyn: rows[0].useyn,
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            itemcd_s: "",
            spec: rows[0].spec,
            location: rows[0].location,
            remark: rows[0].remark,
            find_row_value: "",
            pgNum: 1,
            isSearch: true,
          }));
          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            itemcd: rows[0].itemcd,
            itemnm: rows[0].itemnm,
            insiz: rows[0].insiz,
            itemacnt:
              itemacntListData.find(
                (item: any) => item.sub_code == rows[0].itemacnt
              )?.code_name == undefined
                ? rows[0].itemacnt
                : itemacntListData.find(
                    (item: any) => item.sub_code == rows[0].itemacnt
                  )?.code_name,
            useyn: rows[0].useyn == "Y" ? "Y" : "N",
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            itemcd_s: rows[0].itemcd_s,
            spec: rows[0].spec,
            location: sessionLocation,
            remark: rows[0].remark,
            bnatur: rows[0].bnatur,
            itemlvl1: rows[0].itemlvl1,
            itemlvl2: rows[0].itemlvl2,
            itemlvl3: rows[0].itemlvl3,
            itemlvl4: rows[0].itemlvl4,
            bomyn: rows[0].bomyn,
            attdatnum: rows[0].attdatnum,
            row_values: rows[0].row_values,
            safeqty: rows[0].safeqty,
            unitwgt: rows[0].unitwgt,
            invunit:
              qtyunitListData.find(
                (item: any) => item.sub_code == rows[0].invunit
              )?.code_name == undefined
                ? rows[0].invunit
                : qtyunitListData.find(
                    (item: any) => item.sub_code == rows[0].invunit
                  )?.code_name,
            dwgno: rows[0].dwgno,
            maker: rows[0].maker,
            qcyn: rows[0].qcyn == "Y" ? "Y" : "N",
            attdatnum_img: rows[0].attdatnum_img,
            attdatnum_img2: rows[0].attdatnum_img2,
            snp: rows[0].snp,
            person: rows[0].person,
            extra_field2: rows[0].extra_field2,
            purleadtime: rows[0].purleadtime,
            len: rows[0].len,
            purqty: rows[0].purqty,
            boxqty: rows[0].boxqty,
            pac: rows[0].pac,
            bnatur_insiz: rows[0].bnatur_insiz,
            itemno: rows[0].itemno,
            itemgroup: rows[0].itemgroup,
            lenunit: rows[0].lenunit,
            hscode: rows[0].hscode,
            wgtunit: rows[0].wgtunit,
            custitemnm: rows[0].custitemnm,
            unitqty: rows[0].unitqty,
            procday: rows[0].procday,
            files: rows[0].files,
            auto: rows[0].auto,
          });
          setInfomation2({
            pgSize: PAGE_SIZE,
            workType: "U",
            itemcd: rows[0].itemcd,
          });
        }
      } else {
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
          location: sessionLocation,
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
        setSubData2Result({
          data: [],
          total: 0,
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

  const fetchSubGrid = async (subfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    //조회조건 파라미터
    const subparameters: Iparameters = {
      procedureName: "P_BA_A0040W_Q",
      pageNumber: subfilters.pgNum,
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
        "@p_find_row_value": subfilters.find_row_value,
      },
    };

    setLoading(true);
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      const row = rows.map((item: any) => ({
        ...item,
      }));
      const mainData = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      if (totalRowCnt > 0) {
        if (subfilters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef2.current) {
            const findRowIndex = rows.findIndex(
              (row: any) =>
                mainData.itemcd +
                  "-" +
                  row.itemacnt +
                  "-" +
                  row.recdt +
                  "-" +
                  row.amtunit ==
                subfilters.find_row_value
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
      }
      setSubData2Result((prev) => {
        return {
          data: row,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          subfilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  mainData.itemcd +
                    "-" +
                    row.itemacnt +
                    "-" +
                    row.recdt +
                    "-" +
                    row.amtunit ==
                  subfilters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedsubData2State({ [selectedRow[SUB_DATA_ITEM_KEY2]]: true });
        } else {
          setSelectedsubData2State({ [rows[0][SUB_DATA_ITEM_KEY2]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setsubFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchSubGrid2 = async (subfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    //조회조건 파라미터
    const subparameters: Iparameters = {
      procedureName: "P_BA_A0040W_Q",
      pageNumber: subfilters2.pgNum,
      pageSize: subfilters2.pgSize,
      parameters: {
        "@p_work_type": subfilters2.workType,
        "@p_itemcd": subfilters2.itemcd,
        "@p_itemnm": subfilters2.itemnm,
        "@p_insiz": subfilters2.insiz,
        "@p_itemacnt": subfilters2.itemacnt,
        "@p_useyn": subfilters2.useyn,
        "@p_custcd": subfilters2.custcd,
        "@p_custnm": subfilters2.custnm,
        "@p_itemcd_s": subfilters2.itemcd_s,
        "@p_spec": subfilters2.spec,
        "@p_remark": subfilters2.remark,
        "@p_find_row_value": subfilters2.find_row_value,
      },
    };

    setLoading(true);
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;

      let images: string[] = [];
      let image1 = rows[0].attdatnum_img;
      let image2 = rows[0].attdatnum_img2;
      if (image1 != null) {
        if (
          image1.slice(0, 1) == "0" &&
          image1.slice(1, 2) == "x" &&
          image1 != undefined
        ) {
          images.push(image1.toString());
        } else {
          images.push("data:image/png;base64," + image1);
        }
      }
      if (image2 != null) {
        if (
          image2.slice(0, 1) == "0" &&
          image2.slice(1, 2) == "x" &&
          image2 != undefined
        ) {
          images.push(image2.toString());
        } else {
          images.push("data:image/png;base64," + image2);
        }
      }
      setImgBase64(images);
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setsubFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const onAttWndClick2 = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput!.click();
  };

  const gridData = [{ id: 1, image: imgBase64[0] }];
  const gridData2 = [{ id: 1, image: imgBase64[1] }];

  const imgCell = ({
    tdProps,
    dataItem,
  }: {
    tdProps?: any;
    dataItem?: any;
  }) => {
    const downloadImage = (imageDataUrl: string, filename: string) => {
      const link = document.createElement("a");
      link.href = imageDataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    const imageDataUrl = imgBase64[0];

    const hasImage = imgBase64[0] != null;

    return (
      <>
        <img
          src={imageDataUrl}
          width="100%"
          height="400%"
          className="contact-img"
        />
        {hasImage && (
          <div style={{ textAlign: "center", margin: "5px 0 5px 0" }}>
            <Button
              onClick={() => downloadImage(imageDataUrl, "image_1.png")}
              themeColor={"primary"}
              fillMode={"outline"}
              icon={"download"}
            >
              다운로드
            </Button>
          </div>
        )}
      </>
    );
  };

  const imgCell2 = ({
    tdProps,
    dataItem,
  }: {
    tdProps?: any;
    dataItem?: any;
  }) => {
    const downloadImage = (imageDataUrl: string, filename: string) => {
      const link = document.createElement("a");
      link.href = imageDataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const imageDataUrl = imgBase64[1];
    const hasImage = imgBase64[1] != null;

    return (
      <>
        <img
          src={imageDataUrl}
          width="100%"
          height="400%"
          className="contact-img"
        />
        {hasImage && (
          <div style={{ textAlign: "center", margin: "5px 0 5px 0" }}>
            <Button
              onClick={() => downloadImage(imageDataUrl, "image_2.png")}
              themeColor={"primary"}
              fillMode={"outline"}
              icon={"download"}
            >
              다운로드
            </Button>
          </div>
        )}
      </>
    );
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (subfilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);

      setsubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));

      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters]);

  useEffect(() => {
    if (subfilters2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);

      setsubFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));

      fetchSubGrid2(deepCopiedFilters);
    }
  }, [subfilters2]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [subData2Result]);

  //그리드 리셋
  const resetAllGrid = () => {
    deletedMainRows = [];
    setMainDataResult(process([], mainDataState));
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
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }

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
      location: sessionLocation,
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
      invunit:
        selectedRowData.invunit == undefined ? "" : selectedRowData.invunit,
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
      isSearch: true,
      pgNum: 1,
      find_row_value: "",
    }));
    setInfomation2({
      pgSize: PAGE_SIZE,
      workType: "IMAGE",
      itemcd: selectedRowData.itemcd,
    });
    setsubFilters2((prev) => ({
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
      find_row_value: "",
      pgNum: 1,
      isSearch: true,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSubData2SelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubData2State,
      dataItemKey: SUB_DATA_ITEM_KEY2,
    });
    setSelectedsubData2State(newSelectedState);
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
        optionsGridOne.sheets[1].title = "단가";
        _export.save(optionsGridOne);
      }
    }
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
        총
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
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onAddClick2 = () => {
    setWorkType("N");
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
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
      location: sessionLocation,
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
    setSubData2Result({
      data: [],
      total: 0,
    });
    setTabSelected(0);
    if (swiper) {
      swiper.slideTo(1);
    }
  };

  const onAddClick = () => {
    subData2Result.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [SUB_DATA_ITEM_KEY2]: ++temp,
      recdt: convertDateToStr(new Date()),
      unpitem: "SYS01",
      amtunit: "USD",
      itemacnt: "2",
      unp: 0,
      remark: "",
      rowstatus: "N",
    };

    setSelectedsubData2State({ [newDataItem[SUB_DATA_ITEM_KEY2]]: true });
    setSubData2Result((prev) => {
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
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }

    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
    } else if (e.selected == 1) {
      setsubFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
    } else if (e.selected == 2) {
      setsubFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
    }
    setTabSelected(e.selected);
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
      setUnsavedAttadatnums((prev) => [...prev, data.attdatnum]);
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
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    resetAllGrid(); // 데이터 초기화
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    if (swiper) {
      swiper.slideTo(0);
    }
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
    let valid = true;
    if (dataItem.rowstatus != "N" && field == "recdt") {
      valid = false;
    }

    if (field != "rowstatus" && valid == true) {
      const newData = subData2Result.data.map((item) =>
        item[SUB_DATA_ITEM_KEY2] == dataItem[SUB_DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubData2Result((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev: { total: any }) => {
        return {
          data: subData2Result.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != subData2Result.data) {
      const newData = subData2Result.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[SUB_DATA_ITEM_KEY2] ==
          Object.getOwnPropertyNames(selectedsubData2State)[0]
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
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubData2Result((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = subData2Result.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubData2Result((prev: { total: any }) => {
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
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;

    subData2Result.data.forEach((item: any, index: number) => {
      if (!selectedsubData2State[item[SUB_DATA_ITEM_KEY2]]) {
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
      data = subData2Result.data[Math.min(...Object2)];
    } else {
      data = subData2Result.data[Math.min(...Object) - 1];
    }
    setSubData2Result((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));

    setSelectedsubData2State({
      [data != undefined ? data[SUB_DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick2 = () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult.data.length != 0) {
      const items = Object.getOwnPropertyNames(selectedState)[0];
      const data = mainDataResult.data.filter(
        (item) => item.itemcd == items
      )[0];
      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        itemcd: items,
        attdatnum: data.attdatnum,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
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
      "@p_work_type": paraData.workType,
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
      "@p_invunit": infomation.invunit == undefined ? "" : infomation.invunit,
      "@p_bomyn": infomation.bomyn,
      "@p_qcyn": infomation.qcyn,
      "@p_unitwgt": infomation.unitwgt,
      "@p_useyn": infomation.useyn,
      "@p_attdatnum": infomation.attdatnum,
      "@p_attdatnum_img": infomation.attdatnum_img,
      "@p_attdatnum_img2": infomation.attdatnum_img2,
      "@p_remark": infomation.remark,
      "@p_safeqty": infomation.safeqty,
      "@p_location": sessionLocation,
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
        infomation.invunit != ""
          ? qtyunitListData.find(
              (item: any) => item.code_name == infomation.invunit
            )?.sub_code == undefined
            ? infomation.invunit
            : qtyunitListData.find(
                (item: any) => item.code_name == infomation.invunit
              )?.sub_code
          : "",
      "@p_bomyn": infomation.bomyn,
      "@p_qcyn": infomation.qcyn,
      "@p_unitwgt": infomation.unitwgt,
      "@p_useyn": infomation.useyn,
      "@p_attdatnum": infomation.attdatnum,
      "@p_attdatnum_img": infomation.attdatnum_img,
      "@p_attdatnum_img2": infomation.attdatnum_img2,
      "@p_remark": infomation.remark,
      "@p_safeqty": infomation.safeqty,
      "@p_location": sessionLocation,
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
    if (paraDataDeleted.work_type == "D") fetchToDelete();
  }, [paraDataDeleted]);

  const onSaveClick = async () => {
    const dataItem = subData2Result.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    let valid = true;

    try {
      dataItem.map((item: any) => {
        if (item.recdt == "") {
          throw findMessage(messagesData, "BA_A0040W_003");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;
    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
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
      dataArr.recdt.push(recdt == "99991231" ? "" : recdt);
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
      dataArr.recdt.push(recdt == "99991231" ? "" : recdt);
      dataArr.amtunit.push(amtunit);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "N",
      orgdiv: sessionOrgdiv,
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

    if (data.isSuccess == true) {
      // 마지막 페이지의 1개 남은 데이터 삭제 시, 앞 페이지 조회하고, 그 외는 페이지 유지
      const isLastDataDeleted =
        mainDataResult.data.length == 1 && filters.pgNum > 1;
      const findRowIndex = mainDataResult.data.findIndex(
        (row: any) =>
          row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      );
      setDeletedAttadatnums([infomation.attdatnum]);
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
            : mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1][
                DATA_ITEM_KEY
              ],
        pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
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
      if (!infomation.itemacnt) {
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

    if (data && data.isSuccess == true) {
      const { returnString } = data;
      setFilters((prev) => ({
        ...prev,
        find_row_value: returnString,
        pgNum: 1,
        isSearch: true,
      }));

      // 초기화
      setUnsavedAttadatnums([]);
      setUnsavedName([]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.statusCode == "P_BA_A0040_S_001") {
        alert(data.resultMessage);
      } else if (data.statusCode == "P_BA_A0040_S_002") {
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

    if (data.isSuccess == true) {
      setsubFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
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
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
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

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    setPage({
      ...event.page,
    });

    setPage2(initialPageState);
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setsubFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage2({
      ...event.page,
    });
  };

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  return (
    <>
      {isMobile ? (
        <>
          <TitleContainer>
            <Title>품목관리</Title>

            <ButtonContainer>
              {permissions && (
                <TopButtons
                  search={search}
                  exportExcel={exportExcel}
                  permissions={permissions}
                  pathname="BA_A0040W"
                />
              )}
            </ButtonContainer>
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
                    <td colSpan={3}>
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
          </TitleContainer>
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
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick2}
                      themeColor={"primary"}
                      icon="file-add"
                    >
                      신규
                    </Button>
                    <Button
                      onClick={onDeleteClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="delete"
                    >
                      삭제
                    </Button>
                    <Button
                      onClick={onSaveClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
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
                  fileName="품목관리"
                >
                  <Grid
                    style={{ height: deviceHeight - height }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        itemacnt: itemacntListData.find(
                          (item: any) => item.sub_code == row.itemacnt
                        )?.code_name,
                        invunit: qtyunitListData.find(
                          (item: any) => item.sub_code == row.invunit
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
                                  CheckField.includes(item.fieldName)
                                    ? CheckBoxCell
                                    : NumberField.includes(item.fieldName)
                                    ? NumberCell
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
            <SwiperSlide
              key={1}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <TabStrip
                selected={tabSelected}
                onSelect={handleSelectTab}
                style={{ width: "100%" }}
                scrollable={isMobile}
              >
                <TabStripTab title="상세정보">
                  <GridContainer>
                    <FormBoxWrap
                      style={{
                        height: deviceHeight - height3,
                        width: "100%",
                        overflow: "scroll",
                      }}
                    >
                      <FormBox>
                        <tbody>
                          <tr>
                            <th>품목코드</th>
                            {infomation.itemcd != "자동생성" && yn == true ? (
                              <>
                                <td>
                                  <Input
                                    name="itemcd"
                                    type="text"
                                    value={infomation.itemcd}
                                    className="readonly"
                                  />
                                </td>
                              </>
                            ) : (
                              <>
                                <td>
                                  {yn == true ? (
                                    <div className="filter-item-wrap">
                                      <Input
                                        name="itemcd"
                                        type="text"
                                        value={"자동생성"}
                                        className="readonly"
                                        style={{ width: "100%" }}
                                      />
                                      <ButtonInInput>
                                        <Checkbox
                                          defaultChecked={true}
                                          value={yn}
                                          onChange={CheckChange}
                                          style={{
                                            marginTop: "7px",
                                            marginRight: "5px",
                                          }}
                                        />
                                      </ButtonInInput>
                                    </div>
                                  ) : (
                                    <div className="filter-item-wrap">
                                      <Input
                                        name="itemcd"
                                        type="text"
                                        value={infomation.itemcd}
                                        onChange={InputChange}
                                      />
                                      <ButtonInInput>
                                        <Checkbox
                                          defaultChecked={true}
                                          value={yn}
                                          onChange={CheckChange}
                                          style={{
                                            marginTop: "7px",
                                            marginRight: "5px",
                                          }}
                                        />
                                      </ButtonInInput>
                                    </div>
                                  )}
                                </td>
                              </>
                            )}
                            <th>품목명</th>
                            <td colSpan={3}>
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
                                className="readonly"
                              />
                            </td>
                            <th>사용여부</th>
                            <td>
                              <Checkbox
                                name="useyn"
                                value={infomation.useyn == "Y" ? true : false}
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
                            <th>첨부파일</th>
                            <td>
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
                            <th>검사유무</th>
                            <td>
                              <Checkbox
                                name="qcyn"
                                value={infomation.qcyn == "Y" ? true : false}
                                onChange={InputChange}
                              />
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
                  </GridContainer>
                </TabStripTab>
                <TabStripTab title="단가">
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer2">
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick}
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
                    <ExcelExport
                      data={subData2Result.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName="품목관리"
                    >
                      <Grid
                        style={{
                          width: "100%",
                          height: deviceHeight - height2 - height3,
                        }}
                        data={process(
                          subData2Result.data.map((row) => ({
                            ...row,
                            rowstatus:
                              row.rowstatus == null ||
                              row.rowstatus == "" ||
                              row.rowstatus == undefined
                                ? ""
                                : row.rowstatus,
                            recdt: row.recdt
                              ? new Date(dateformat(row.recdt))
                              : new Date(dateformat("99991231")),
                            [SELECTED_FIELD]:
                              selectedsubData2State[idGetter2(row)],
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
                          mode: "single",
                        }}
                        onSelectionChange={onSubData2SelectionChange}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={subData2Result.total}
                        skip={page2.skip}
                        take={page2.take}
                        pageable={true}
                        onPageChange={pageChange2}
                        //원하는 행 위치로 스크롤 기능
                        ref={gridRef2}
                        rowHeight={30}
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
                          customOptionData.menuCustomColumnOptions["grdList2"]
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
                                    cell={
                                      DateField.includes(item.fieldName)
                                        ? DateCell
                                        : CustomComboField.includes(
                                            item.fieldName
                                          )
                                        ? CustomComboBoxCell
                                        : NumberField.includes(item.fieldName)
                                        ? NumberCell
                                        : undefined
                                    }
                                    headerCell={
                                      requiredField.includes(item.fieldName)
                                        ? RequiredHeader
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? sub2TotalFooterCell
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </TabStripTab>
                <TabStripTab title="이미지">
                  <GridContainer>
                    <FormBoxWrap
                      style={{
                        height: deviceHeight - height3,
                        width: "100%",
                        overflow: "scroll",
                      }}
                    >
                      <GridContainer width={`calc(20% - ${GAP}px)`}>
                        <GridContainer>
                          <Grid
                            style={{
                              height: "fit-content",
                            }}
                            data={gridData}
                          >
                            <GridColumn
                              field="image"
                              title="이미지 1"
                              cell={imgCell}
                            />
                          </Grid>
                        </GridContainer>

                        <GridContainer>
                          <Grid
                            style={{
                              height: "fit-content",
                            }}
                            data={gridData2}
                          >
                            <GridColumn
                              field="image"
                              title="이미지 2"
                              cell={imgCell2}
                            />
                          </Grid>
                        </GridContainer>
                      </GridContainer>
                    </FormBoxWrap>
                  </GridContainer>
                </TabStripTab>
              </TabStrip>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <TitleContainer>
            <Title>품목관리</Title>

            <ButtonContainer>
              {permissions && (
                <TopButtons
                  search={search}
                  exportExcel={exportExcel}
                  permissions={permissions}
                  pathname="BA_A0040W"
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
                  <td colSpan={3}>
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
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>요약정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick2}
                  themeColor={"primary"}
                  icon="file-add"
                >
                  신규
                </Button>
                <Button
                  onClick={onDeleteClick2}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="delete"
                >
                  삭제
                </Button>
                <Button
                  onClick={onSaveClick2}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                >
                  저장
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <GridContainerWrap>
              <GridContainer width="80%">
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="품목관리"
                >
                  <Grid
                    style={{ height: "42vh" }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        itemacnt: itemacntListData.find(
                          (item: any) => item.sub_code == row.itemacnt
                        )?.code_name,
                        invunit: qtyunitListData.find(
                          (item: any) => item.sub_code == row.invunit
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
                                  CheckField.includes(item.fieldName)
                                    ? CheckBoxCell
                                    : NumberField.includes(item.fieldName)
                                    ? NumberCell
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
              <GridContainer width={`calc(20% - ${GAP}px)`}>
                <GridContainer>
                  <Grid
                    style={{
                      height: "20.7vh",
                    }}
                    data={gridData}
                  >
                    <GridColumn field="image" title="이미지 1" cell={imgCell} />
                  </Grid>
                </GridContainer>

                <GridContainer>
                  <Grid
                    style={{
                      height: "20.7vh",
                    }}
                    data={gridData2}
                  >
                    <GridColumn
                      field="image"
                      title="이미지 2"
                      cell={imgCell2}
                    />
                  </Grid>
                </GridContainer>
              </GridContainer>
            </GridContainerWrap>
          </GridContainer>

          <GridContainer>
            <TabStrip
              selected={tabSelected}
              onSelect={handleSelectTab}
              style={{ width: "100%" }}
              scrollable={isMobile}
            >
              <TabStripTab title="상세정보">
                <GridContainer style={{ height: "28vh" }}>
                  <FormBoxWrap>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>품목코드</th>
                          {infomation.itemcd != "자동생성" && yn == true ? (
                            <>
                              <td>
                                <Input
                                  name="itemcd"
                                  type="text"
                                  value={infomation.itemcd}
                                  className="readonly"
                                />
                              </td>
                            </>
                          ) : (
                            <>
                              <td>
                                {yn == true ? (
                                  <div className="filter-item-wrap">
                                    <Input
                                      name="itemcd"
                                      type="text"
                                      value={"자동생성"}
                                      className="readonly"
                                      style={{ width: "100%" }}
                                    />
                                    <ButtonInInput>
                                      <Checkbox
                                        defaultChecked={true}
                                        value={yn}
                                        onChange={CheckChange}
                                        style={{
                                          marginTop: "7px",
                                          marginRight: "5px",
                                        }}
                                      />
                                    </ButtonInInput>
                                  </div>
                                ) : (
                                  <div className="filter-item-wrap">
                                    <Input
                                      name="itemcd"
                                      type="text"
                                      value={infomation.itemcd}
                                      onChange={InputChange}
                                    />
                                    <ButtonInInput>
                                      <Checkbox
                                        defaultChecked={true}
                                        value={yn}
                                        onChange={CheckChange}
                                        style={{
                                          marginTop: "7px",
                                          marginRight: "5px",
                                        }}
                                      />
                                    </ButtonInInput>
                                  </div>
                                )}
                              </td>
                            </>
                          )}
                          <th>품목명</th>
                          <td colSpan={3}>
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
                              className="readonly"
                            />
                          </td>
                          <th>사용여부</th>
                          <td>
                            <Checkbox
                              name="useyn"
                              value={infomation.useyn == "Y" ? true : false}
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
                          <th>첨부파일</th>
                          <td>
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
                          <th>검사유무</th>
                          <td>
                            <Checkbox
                              name="qcyn"
                              value={infomation.qcyn == "Y" ? true : false}
                              onChange={InputChange}
                            />
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
                </GridContainer>
              </TabStripTab>
              <TabStripTab title="단가">
                <GridContainer style={{ height: "28vh" }}>
                  <GridTitleContainer>
                    <GridTitle>단가정보</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick}
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
                  <ExcelExport
                    data={subData2Result.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName="품목관리"
                  >
                    <Grid
                      style={{ height: "24vh" }}
                      data={process(
                        subData2Result.data.map((row) => ({
                          ...row,
                          rowstatus:
                            row.rowstatus == null ||
                            row.rowstatus == "" ||
                            row.rowstatus == undefined
                              ? ""
                              : row.rowstatus,
                          recdt: row.recdt
                            ? new Date(dateformat(row.recdt))
                            : new Date(dateformat("99991231")),
                          [SELECTED_FIELD]:
                            selectedsubData2State[idGetter2(row)],
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
                        mode: "single",
                      }}
                      onSelectionChange={onSubData2SelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={subData2Result.total}
                      skip={page2.skip}
                      take={page2.take}
                      pageable={true}
                      onPageChange={pageChange2}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef2}
                      rowHeight={30}
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
                                    DateField.includes(item.fieldName)
                                      ? DateCell
                                      : CustomComboField.includes(
                                          item.fieldName
                                        )
                                      ? CustomComboBoxCell
                                      : NumberField.includes(item.fieldName)
                                      ? NumberCell
                                      : undefined
                                  }
                                  headerCell={
                                    requiredField.includes(item.fieldName)
                                      ? RequiredHeader
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? sub2TotalFooterCell
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
        </>
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
          modal={true}
        />
      )}
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={workType}
          setData={setCustData2}
          modal={true}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"ROW_ADD"}
          setData={setItemData}
          modal={true}
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={infomation.attdatnum}
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

export default BA_A0040;
