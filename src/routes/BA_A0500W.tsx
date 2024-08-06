import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  getSelectedState,
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import {
  Checkbox,
  Input,
  InputChangeEvent,
  TextArea,
} from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInGridInput,
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
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getItemQuery,
  getMenuName,
  GetPropertyValueByName,
  handleKeyPressSearch,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  useSysMessage,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { IItemData } from "../hooks/interfaces";
import { isFilterHideState, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/BA_A0500W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
let targetRowIndex: null | number = null;
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;
var height8 = 0;
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];
let temp = 0;
let temp2 = 0;
let index = 0;

const checkField = ["barcodeinformation_yn", "use_yn"];
const numberField = [
  "codeinformation_cnt",
  "extra_field1",
  "code_length",
  "sort_seq",
];
const comboField = [
  "code_name",
  "extra_field2",
  "extra_field3",
  "extra_field4",
  "extra_field5",
];
const commandField = ["process_item"];

export const FormContext = createContext<{
  itemInfo: TItemInfo;
  setItemInfo: (d: React.SetStateAction<TItemInfo>) => void;
}>({} as any);

type TItemInfo = {
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
};

const defaultItemInfo = {
  itemcd: "",
  itemno: "",
  itemnm: "",
  insiz: "",
  model: "",
  itemacnt: "",
  itemacntnm: "",
  bnatur: "",
  spec: "",
  invunit: "",
  invunitnm: "",
  unitwgt: "",
  wgtunit: "",
  wgtunitnm: "",
  maker: "",
  dwgno: "",
  remark: "",
  itemlvl1: "",
  itemlvl2: "",
  itemlvl3: "",
  extra_field1: "",
  extra_field2: "",
  extra_field7: "",
  extra_field6: "",
  extra_field8: "",
  packingsiz: "",
  unitqty: "",
  color: "",
  gubun: "",
  qcyn: "",
  outside: "",
  itemthick: "",
  itemlvl4: "",
  itemlvl5: "",
  custitemnm: "",
};

const ColumnCommandCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const { setItemInfo } = useContext(FormContext);
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };

  const [itemWindowVisible2, setItemWindowVisible2] = useState<boolean>(false);

  const onItemWndClick2 = () => {
    setItemWindowVisible2(true);
  };

  const setItemData2 = (data: IItemData) => {
    const {
      itemcd,
      itemno,
      itemnm,
      insiz,
      model,
      itemacnt,
      itemacntnm,
      bnatur,
      spec,
      invunit,
      invunitnm,
      unitwgt,
      wgtunit,
      wgtunitnm,
      maker,
      dwgno,
      remark,
      itemlvl1,
      itemlvl2,
      itemlvl3,
      extra_field1,
      extra_field2,
      extra_field7,
      extra_field6,
      extra_field8,
      packingsiz,
      unitqty,
      color,
      gubun,
      qcyn,
      outside,
      itemthick,
      itemlvl4,
      itemlvl5,
      custitemnm,
    } = data;
    setItemInfo({
      itemcd,
      itemno,
      itemnm,
      insiz,
      model,
      itemacnt,
      itemacntnm,
      bnatur,
      spec,
      invunit,
      invunitnm,
      unitwgt,
      wgtunit,
      wgtunitnm,
      maker,
      dwgno,
      remark,
      itemlvl1,
      itemlvl2,
      itemlvl3,
      extra_field1,
      extra_field2,
      extra_field7,
      extra_field6,
      extra_field8,
      packingsiz,
      unitqty,
      color,
      gubun,
      qcyn,
      outside,
      itemthick,
      itemlvl4,
      itemlvl5,
      custitemnm,
    });
  };
  //BA_A0080W에만 사용
  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onItemWndClick2}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {itemWindowVisible2 && (
        <ItemsWindow
          setVisible={setItemWindowVisible2}
          workType={"ROW_ADD"}
          setData={setItemData2}
          modal={true}
        />
      )}
    </>
  );
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_BA500, L_BA502, L_BA503, L_BA504, L_BA505",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "code_name"
      ? "L_BA500"
      : field == "extra_field2"
      ? "L_BA502"
      : field == "extra_field3"
      ? "L_BA503"
      : field == "extra_field4"
      ? "L_BA504"
      : field == "extra_field5"
      ? "L_BA505"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const BA_A0500W: React.FC = () => {
  const [tabSelected, setTabSelected] = React.useState(0);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".ButtonContainer3");
      height4 = getHeight(".ButtonContainer4");
      if (height5 == 0 && !isMobile) {
        height5 = getHeight(".FormBoxWrap");
      }
      height6 = getHeight(".TitleContainer");
      height7 = getHeight(".k-tabstrip-items-wrapper");
      height8 = getHeight(".ButtonContainer5");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height6);
        setMobileHeight2(getDeviceHeight(true) - height2 - height6);
        setMobileHeight3(
          getDeviceHeight(true) - height3 - height6 - height7 - height8
        );
        setMobileHeight4(
          getDeviceHeight(true) - height4 - height6 - height7 - height8
        );
        setWebHeight(getDeviceHeight(true) - height - height6);
        setWebHeight2(
          getDeviceHeight(true) -
            height2 -
            height5 -
            height6 -
            height7 -
            height3
        );
        setWebHeight3(
          getDeviceHeight(true) -
            height2 -
            height5 -
            height6 -
            height7 -
            height4
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, tabSelected, webheight, webheight2, webheight3]);

  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA500", setBizComponentData);
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);

  const [numberef1Data, setNumberef1Data] = useState([
    {
      sub_code: "",
      code_name: "",
      extra_field1: "",
      numref1: "",
    },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setNumberef1Data(getBizCom(bizComponentData, "L_BA500"));
    }
  }, [bizComponentData]);

  const getNumberref1 = (code: string) => {
    const data = numberef1Data.filter((item) => item.sub_code == code)[0];
    return data.extra_field1;
  };

  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);

  const handleSelectTab = (e: any) => {
    if (isMobile) {
      setIsFilterHideStates(true);
    }
    setTabSelected(e.selected);
  };

  const resetAllGrid = () => {
    deletedMainRows = [];
    deletedMainRows2 = [];
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
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
        code_name1: defaultOption.find((item: any) => item.id == "code_name1")
          ?.valueCode,
        use_yn: defaultOption.find((item: any) => item.id == "use_yn")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

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
        optionsGridOne.sheets[1].title = "상세정보";
        _export.save(optionsGridOne);
      } else {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridTwo = _export3.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "상세정보";
        _export.save(optionsGridOne);
      }
    }
  };
  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    group_code: "",
    group_name: "",
    memo: "",
    code_name1: "",
    use_yn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "detail",
    group_code: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    workType: "CODE",
    group_code: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
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

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "use_yn") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "Y" : "N",
      }));
    } else {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const [swiper, setSwiper] = useState<SwiperCore>();
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
  const [information, setInformation] = useState<{ [name: string]: any }>({
    workType: "N",
    Column1: "",
    attdatnum: "",
    barcodeinformation_yn: "",
    code_length: 0,
    codeinformation_cnt: 0,
    group_code: "",
    group_name: "",
    memo: "",
    use_yn: "",
  });
  useEffect(() => {
    const newData = mainDataResult3.data.map((item) =>
      item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
        ? {
            ...item,
            process_item: itemInfo.itemcd,
            process_itemnm: itemInfo.itemnm,
            itemcd: itemInfo.itemcd,
            itemno: itemInfo.itemno,
            itemnm: itemInfo.itemnm,
            insiz: itemInfo.insiz,
            model: itemInfo.model,
            bnatur: itemInfo.bnatur,
            itemacnt: itemInfo.itemacnt,
            spec: itemInfo.spec,
            //invunit
            qtyunit: itemInfo.invunit,
            invunitnm: itemInfo.invunitnm,
            unitwgt: itemInfo.unitwgt,
            wgtunit: itemInfo.wgtunit,
            wgtunitnm: itemInfo.wgtunitnm,
            maker: itemInfo.maker,
            dwgno: itemInfo.dwgno,
            remark: itemInfo.remark,
            itemlvl1: itemInfo.itemlvl1,
            itemlvl2: itemInfo.itemlvl2,
            itemlvl3: itemInfo.itemlvl3,
            extra_field1: itemInfo.extra_field1,
            extra_field2: itemInfo.extra_field2,
            extra_field7: itemInfo.extra_field7,
            extra_field6: itemInfo.extra_field6,
            extra_field8: itemInfo.extra_field8,
            packingsiz: itemInfo.packingsiz,
            unitqty: itemInfo.unitqty,
            color: itemInfo.color,
            gubun: itemInfo.gubun,
            qcyn: itemInfo.qcyn,
            outside: itemInfo.outside,
            itemthick: itemInfo.itemthick,
            itemlvl4: itemInfo.itemlvl4,
            itemlvl5: itemInfo.itemlvl5,
            custitemnm: itemInfo.custitemnm,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [EDIT_FIELD]: undefined,
          }
        : {
            ...item,
            [EDIT_FIELD]: undefined,
          }
    );

    setMainDataResult3((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [itemInfo]);

  const fetchItemData = React.useCallback(
    async (itemcd: string) => {
      if (!permissions.view) return;
      let data: any;
      const queryStr = getItemQuery({ itemcd: itemcd, itemnm: "" });
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
        const rowCount = data.tables[0].RowCount;

        if (rowCount > 0) {
          const {
            itemcd,
            itemno,
            itemnm,
            insiz,
            model,
            itemacnt,
            itemacntnm,
            bnatur,
            spec,
            invunit,
            invunitnm,
            unitwgt,
            wgtunit,
            wgtunitnm,
            maker,
            dwgno,
            remark,
            itemlvl1,
            itemlvl2,
            itemlvl3,
            extra_field1,
            extra_field2,
            extra_field7,
            extra_field6,
            extra_field8,
            packingsiz,
            unitqty,
            color,
            gubun,
            qcyn,
            outside,
            itemthick,
            itemlvl4,
            itemlvl5,
            custitemnm,
          } = rows[0];
          setItemInfo({
            itemcd,
            itemno,
            itemnm,
            insiz,
            model,
            itemacnt,
            itemacntnm,
            bnatur,
            spec,
            invunit,
            invunitnm,
            unitwgt,
            wgtunit,
            wgtunitnm,
            maker,
            dwgno,
            remark,
            itemlvl1,
            itemlvl2,
            itemlvl3,
            extra_field1,
            extra_field2,
            extra_field7,
            extra_field6,
            extra_field8,
            packingsiz,
            unitqty,
            color,
            gubun,
            qcyn,
            outside,
            itemthick,
            itemlvl4,
            itemlvl5,
            custitemnm,
          });
        } else {
          const newData = mainDataResult3.data.map((item: any) =>
            item[DATA_ITEM_KEY3] ==
            Object.getOwnPropertyNames(selectedState3)[0]
              ? {
                  ...item,
                  process_item: item.process_item,
                  process_itemnm: "",
                  itemcd: "",
                  itemno: "",
                  itemnm: "",
                  insiz: "",
                  model: "",
                  itemacnt: "",
                  itemacntnm: "",
                  bnatur: "",
                  spec: "",
                  invunit: "",
                  invunitnm: "",
                  unitwgt: "",
                  wgtunit: "",
                  wgtunitnm: "",
                  maker: "",
                  dwgno: "",
                  remark: "",
                  itemlvl1: "",
                  itemlvl2: "",
                  itemlvl3: "",
                  extra_field1: "",
                  extra_field2: "",
                  extra_field7: "",
                  extra_field6: "",
                  extra_field8: "",
                  packingsiz: "",
                  unitqty: "",
                  color: "",
                  gubun: "",
                  qcyn: "",
                  outside: "",
                  itemthick: "",
                  itemlvl4: "",
                  itemlvl5: "",
                  custitemnm: "",
                  [EDIT_FIELD]: undefined,
                }
              : {
                  ...item,
                  [EDIT_FIELD]: undefined,
                }
          );
          setMainDataResult3((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [mainDataResult3]
  );
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0500W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_group_code": filters.group_code,
        "@p_group_name": filters.group_name,
        "@p_memo": filters.memo,
        "@p_use_yn": filters.use_yn,
        "@p_code_name1": filters.code_name1,
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
            (row: any) => row.group_code == filters.find_row_value
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
            : rows.find((row: any) => row.group_code == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setInformation({
            workType: "U",
            Column1: selectedRow.Column1,
            attdatnum: selectedRow.attdatnum,
            barcodeinformation_yn: selectedRow.barcodeinformation_yn,
            code_length: selectedRow.code_length,
            codeinformation_cnt: selectedRow.codeinformation_cnt,
            group_code: selectedRow.group_code,
            group_name: selectedRow.group_name,
            memo: selectedRow.memo,
            use_yn: selectedRow.use_yn,
          });
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            group_code: selectedRow.group_code,
          }));
          setFilters3((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            group_code: selectedRow.group_code,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setInformation({
            workType: "U",
            Column1: rows[0].Column1,
            attdatnum: rows[0].attdatnum,
            barcodeinformation_yn: rows[0].barcodeinformation_yn,
            code_length: rows[0].code_length,
            codeinformation_cnt: rows[0].codeinformation_cnt,
            group_code: rows[0].group_code,
            group_name: rows[0].group_name,
            memo: rows[0].memo,
            use_yn: rows[0].use_yn,
          });
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            group_code: rows[0].group_code,
          }));
          setFilters3((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            group_code: rows[0].group_code,
          }));
        }
      } else {
        deletedMainRows = [];
        deletedMainRows2 = [];
        setInformation({
          workType: "N",
          Column1: "",
          attdatnum: "",
          barcodeinformation_yn: "",
          code_length: 0,
          codeinformation_cnt: 0,
          group_code: "",
          group_name: "",
          memo: "",
          use_yn: "",
        });
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0500W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_group_code": filters2.group_code,
        "@p_group_name": filters.group_name,
        "@p_memo": filters.memo,
        "@p_use_yn": filters.use_yn,
        "@p_code_name1": filters.code_name1,
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

  //그리드 데이터 조회
  const fetchMainGrid3 = async (filters3: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0500W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.workType,
        "@p_group_code": filters3.group_code,
        "@p_group_name": filters.group_name,
        "@p_memo": filters.memo,
        "@p_use_yn": filters.use_yn,
        "@p_code_name1": filters.code_name1,
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
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters3.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions, customOptionData]);
  let gridRef: any = useRef(null);
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

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

    setInformation({
      workType: "U",
      Column1: selectedRowData.Column1,
      attdatnum: selectedRowData.attdatnum,
      barcodeinformation_yn: selectedRowData.barcodeinformation_yn,
      code_length: selectedRowData.code_length,
      codeinformation_cnt: selectedRowData.codeinformation_cnt,
      group_code: selectedRowData.group_code,
      group_name: selectedRowData.group_name,
      memo: selectedRowData.memo,
      use_yn: selectedRowData.use_yn,
    });
    setFilters2((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
      group_code: selectedRowData.group_code,
    }));
    setFilters3((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
      group_code: selectedRowData.group_code,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
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

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };

  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
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

  //그리드 푸터
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

  //그리드 푸터
  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
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
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters3((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setPage2(initialPageState);
    setPage3(initialPageState);
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

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage3({
      ...event.page,
    });
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

  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
    );
  };
  const onMainItemChange3 = (event: GridItemChangeEvent) => {
    setMainDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
    );
  };
  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
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
  const customRowRender3 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );
  const enterEdit2 = (dataItem: any, field: string) => {
    let valid1 = true;
    let valid5 = true;
    if (
      (field == "extra_field1" ||
        field == "extra_field2" ||
        field == "extra_field3" ||
        field == "extra_field4") &&
      dataItem.code_name != "4"
    ) {
      valid1 = false;
    }
    if (
      field == "extra_field5" &&
      dataItem.code_name != "6" &&
      dataItem.code_name != "7"
    ) {
      valid5 = false;
    }
    if (
      field != "rowstatus" &&
      valid1 == true &&
      valid5 == true &&
      field != "sample"
    ) {
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
      setEditIndex(dataItem[DATA_ITEM_KEY2]);
      if (field) {
        setEditedField(field);
      }
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

  const enterEdit3 = (dataItem: any, field: string) => {
    let valid1 = true;
    if (field == "code" && dataItem.rowstatus != "N") {
      valid1 = false;
    }

    if (field != "rowstatus" && field != "process_itemnm" && valid1 == true) {
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
      setEditIndex(dataItem[DATA_ITEM_KEY3]);
      if (field) {
        setEditedField(field);
      }
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

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      if (editedField == "code_name") {
        const newData = mainDataResult2.data.map(
          (item: { [x: string]: string; rowstatus: string }) =>
            item[DATA_ITEM_KEY2] ==
            Object.getOwnPropertyNames(selectedState2)[0]
              ? {
                  ...item,
                  extra_field1:
                    item.code_name != "1" ? getNumberref1(item.code_name) : "",
                  extra_field2: item.code_name != "4" ? "" : item.extra_field2,
                  extra_field3: item.code_name != "4" ? "" : item.extra_field3,
                  extra_field4: item.code_name != "4" ? "" : item.extra_field4,
                  extra_field5:
                    item.code_name != "6" && item.code_name != "7"
                      ? ""
                      : item.extra_field5,
                  rowstatus: item.rowstatus == "N" ? "N" : "U",
                  [EDIT_FIELD]: undefined,
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
        setMainDataResult2((prev: { total: any }) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else {
        const newData = mainDataResult2.data.map(
          (item: { [x: string]: string; rowstatus: string }) =>
            item[DATA_ITEM_KEY2] ==
            Object.getOwnPropertyNames(selectedState2)[0]
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

  const exitEdit3 = () => {
    if (tempResult3.data != mainDataResult3.data) {
      if (editedField !== "process_item") {
        const newData = mainDataResult3.data.map((item: any) =>
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
      } else {
        mainDataResult3.data.map(
          (item: { [x: string]: any; process_item: any }) => {
            if (editIndex == item[DATA_ITEM_KEY3]) {
              fetchItemData(item.process_item);
            }
          }
        );
      }
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

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object3: any[] = [];
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
        Object3.push(index);
      }
    });

    if (Math.min(...Object3) < Math.min(...Object2)) {
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object3) - 1];
    }

    setMainDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object3.length,
    }));
    setSelectedState2({
      [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };

  const onDeleteClick3 = (e: any) => {
    let newData: any[] = [];
    let Object3: any[] = [];
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
        Object3.push(index);
      }
    });

    if (Math.min(...Object3) < Math.min(...Object2)) {
      data = mainDataResult3.data[Math.min(...Object2)];
    } else {
      data = mainDataResult3.data[Math.min(...Object3) - 1];
    }

    setMainDataResult3((prev) => ({
      data: newData,
      total: prev.total - Object3.length,
    }));
    setSelectedState3({
      [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
    });
  };

  const onAddClick2 = () => {
    mainDataResult2.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY2]: ++temp,
      code_length: 0,
      code_name: "",
      code_value: "",
      extra_field1: "",
      extra_field2: "",
      extra_field3: "",
      extra_field4: "",
      extra_field5: "",
      group_code: "",
      memo: "",
      sample: "",
      sort_seq: 0,
      sub_code: "",
      rowstatus: "N",
    };

    setMainDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
  };

  const onAddClick3 = () => {
    mainDataResult3.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY3]: ++temp2,
      code: "",
      code_name: "",
      extra_field1: "",
      extra_field2: "",
      extra_field3: "",
      extra_field4: "",
      group_code: "",
      gubun: "ITEM",
      memo: "",
      proccd: "",
      process_custnm: "",
      process_customer: "",
      process_item: "",
      process_itemnm: "",
      processcode: "",
      rowstatus: "N",
    };

    setMainDataResult3((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setSelectedState3({ [newDataItem[DATA_ITEM_KEY3]]: true });
  };

  const onCopyClick2 = () => {
    if (mainDataResult2.total > 0) {
      const data = mainDataResult2.data.filter(
        (item) =>
          item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
      )[0];

      mainDataResult2.data.map((item) => {
        if (item.num > temp) {
          temp = item.num;
        }
      });
      const newDataItem = {
        [DATA_ITEM_KEY2]: ++temp,
        code_length: data.code_length,
        code_name: data.code_name,
        code_value: data.code_value,
        extra_field1: data.extra_field1,
        extra_field2: data.extra_field2,
        extra_field3: data.extra_field3,
        extra_field4: data.extra_field4,
        extra_field5: data.extra_field5,
        group_code: data.group_code,
        memo: data.memo,
        sample: data.sample,
        sort_seq: data.sort_seq,
        sub_code: data.sub_code,
        rowstatus: "N",
      };

      setMainDataResult2((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onAddClick = () => {
    deletedMainRows = [];
    deletedMainRows2 = [];
    setInformation({
      workType: "N",
      Column1: "",
      attdatnum: "",
      barcodeinformation_yn: "",
      code_length: 0,
      codeinformation_cnt: 0,
      group_code: "",
      group_name: "",
      memo: "",
      use_yn: "",
    });
    setPage2(initialPageState);
    setPage3(initialPageState);
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setTabSelected(0);
  };

  const onSaveClick = () => {
    if (!permissions.save) return;

    if (
      information.group_name == "" ||
      information.group_name == null ||
      information.group_name == undefined
    ) {
      alert("필수값을 채워주세요.");
      return false;
    }

    if (tabSelected == 0) {
      const dataItem = mainDataResult2.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      let dataArr: any = {
        rowstatus: [],
        sub_code: [],
        code_name: [],
        sort_seq: [],
        extra_field1: [],
        extra_field2: [],
        extra_field3: [],
        extra_field4: [],
        extra_field5: [],
        code_value: [],
        code_length: [],
        memo: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          sub_code = "",
          code_name = "",
          sort_seq = "",
          extra_field1 = "",
          extra_field2 = "",
          extra_field3 = "",
          extra_field4 = "",
          extra_field5 = "",
          code_value = "",
          code_length = "",
          memo = "",
        } = item;

        dataArr.rowstatus.push(rowstatus);
        dataArr.sub_code.push(sub_code);
        dataArr.code_name.push(code_name);
        dataArr.sort_seq.push(sort_seq);
        dataArr.extra_field1.push(extra_field1);
        dataArr.extra_field2.push(extra_field2);
        dataArr.extra_field3.push(extra_field3);
        dataArr.extra_field4.push(extra_field4);
        dataArr.extra_field5.push(extra_field5);
        dataArr.code_value.push(code_value);
        dataArr.code_length.push(code_length);
        dataArr.memo.push(memo);
      });
      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          sub_code = "",
          code_name = "",
          sort_seq = "",
          extra_field1 = "",
          extra_field2 = "",
          extra_field3 = "",
          extra_field4 = "",
          extra_field5 = "",
          code_value = "",
          code_length = "",
          memo = "",
        } = item;

        dataArr.rowstatus.push("D");
        dataArr.sub_code.push(sub_code);
        dataArr.code_name.push(code_name);
        dataArr.sort_seq.push(sort_seq);
        dataArr.extra_field1.push(extra_field1);
        dataArr.extra_field2.push(extra_field2);
        dataArr.extra_field3.push(extra_field3);
        dataArr.extra_field4.push(extra_field4);
        dataArr.extra_field5.push(extra_field5);
        dataArr.code_value.push(code_value);
        dataArr.code_length.push(code_length);
        dataArr.memo.push(memo);
      });

      setParaData((prev) => ({
        ...prev,
        workType: information.workType,
        group_code: information.group_code,
        group_name: information.group_name,
        use_yn:
          information.use_yn == true
            ? "Y"
            : information.use_yn == false
            ? "N"
            : information.use_yn,
        memo: information.memo,
        rowstatus_s: dataArr.rowstatus.join("|"),
        sub_code_s: dataArr.sub_code.join("|"),
        code_name_s: dataArr.code_name.join("|"),
        sort_seq_s: dataArr.sort_seq.join("|"),
        extra_field1_s: dataArr.extra_field1.join("|"),
        extra_field2_s: dataArr.extra_field2.join("|"),
        extra_field3_s: dataArr.extra_field3.join("|"),
        extra_field4_s: dataArr.extra_field4.join("|"),
        extra_field5_s: dataArr.extra_field5.join("|"),
        code_value_s: dataArr.code_value.join("|"),
        code_length_s: dataArr.code_length.join("|"),
        memo_s: dataArr.memo.join("|"),
      }));
    } else {
      const dataItem = mainDataResult3.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });
      if (dataItem.length == 0 && deletedMainRows2.length == 0) return false;
      let dataArr: any = {
        rowstatus: [],
        code: [],
        code_name: [],
        extra_field1: [],
        extra_field2: [],
        extra_field3: [],
        extra_field4: [],

        processcode: [],
        proccd: [],
        memo: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          code = "",
          code_name = "",
          extra_field1 = "",
          extra_field2 = "",
          extra_field3 = "",
          extra_field4 = "",

          process_item = "",
          proccd = "",
          memo = "",
        } = item;

        dataArr.rowstatus.push(rowstatus);
        dataArr.code.push(code);
        dataArr.code_name.push(code_name);
        dataArr.extra_field1.push(extra_field1);
        dataArr.extra_field2.push(extra_field2);
        dataArr.extra_field3.push(extra_field3);
        dataArr.extra_field4.push(extra_field4);
        dataArr.processcode.push(process_item);
        dataArr.proccd.push(proccd);
        dataArr.memo.push(memo);
      });
      deletedMainRows2.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          code = "",
          code_name = "",
          extra_field1 = "",
          extra_field2 = "",
          extra_field3 = "",
          extra_field4 = "",

          process_item = "",
          proccd = "",
          memo = "",
        } = item;

        dataArr.rowstatus.push("D");
        dataArr.code.push(code);
        dataArr.code_name.push(code_name);
        dataArr.extra_field1.push(extra_field1);
        dataArr.extra_field2.push(extra_field2);
        dataArr.extra_field3.push(extra_field3);
        dataArr.extra_field4.push(extra_field4);
        dataArr.processcode.push(process_item);
        dataArr.proccd.push(proccd);
        dataArr.memo.push(memo);
      });

      setParaData((prev) => ({
        ...prev,
        workType: "CODE",
        group_code: information.group_code,
        group_name: information.group_name,
        use_yn:
          information.use_yn == true
            ? "Y"
            : information.use_yn == false
            ? "N"
            : information.use_yn,
        memo: information.memo,
        rowstatus_s: dataArr.rowstatus.join("|"),
        code_s: dataArr.code.join("|"),
        code_name_s: dataArr.code_name.join("|"),
        extra_field1_s: dataArr.extra_field1.join("|"),
        extra_field2_s: dataArr.extra_field2.join("|"),
        extra_field3_s: dataArr.extra_field3.join("|"),
        extra_field4_s: dataArr.extra_field4.join("|"),
        processcode_s: dataArr.processcode.join("|"),
        proccd_s: dataArr.proccd.join("|"),
        memo_s: dataArr.memo.join("|"),
      }));
    }
  };

  const [paraData, setParaData] = useState({
    workType: "",
    group_code: "",
    group_name: "",
    use_yn: "",
    memo: "",
    rowstatus_s: "",
    sub_code_s: "",
    code_name_s: "",
    sort_seq_s: "",
    extra_field1_s: "",
    extra_field2_s: "",
    extra_field3_s: "",
    extra_field4_s: "",
    extra_field5_s: "",
    code_value_s: "",
    code_length_s: "",
    memo_s: "",
    code_s: "",
    processcode_s: "",
    proccd_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_BA_A0500W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_group_code": paraData.group_code,
      "@p_group_name": paraData.group_name,
      "@p_use_yn": paraData.use_yn,
      "@p_memo": paraData.memo,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_sub_code_s": paraData.sub_code_s,
      "@p_code_name_s": paraData.code_name_s,
      "@p_sort_seq_s": paraData.sort_seq_s,
      "@p_extra_field1_s": paraData.extra_field1_s,
      "@p_extra_field2_s": paraData.extra_field2_s,
      "@p_extra_field3_s": paraData.extra_field3_s,
      "@p_extra_field4_s": paraData.extra_field4_s,
      "@p_extra_field5_s": paraData.extra_field5_s,
      "@p_code_value_s": paraData.code_value_s,
      "@p_code_length_s": paraData.code_length_s,
      "@p_memo_s": paraData.memo_s,
      "@p_gubun": "ITEM",
      "@p_code_s": paraData.code_s,
      "@p_processcode_s": paraData.processcode_s,
      "@p_proccd_s": paraData.proccd_s,
      "@p_form_id": "BA_A0500W",
      "@p_pc": pc,
      "@p_userid": userId,
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
      if (paraData.workType == "D") {
        const isLastDataDeleted =
          mainDataResult.data.length == 0 && filters.pgNum > 0;
        const findRowIndex = mainDataResult.data.findIndex(
          (row: any) =>
            row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        );
        if (isLastDataDeleted) {
          setPage({
            skip:
              filters.pgNum == 1 || filters.pgNum == 0
                ? 0
                : PAGE_SIZE * (filters.pgNum - 2),
            take: PAGE_SIZE,
          });
          setFilters((prev: any) => ({
            ...prev,
            find_row_value:
              mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
              undefined
                ? ""
                : mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                    .group_code,
            pgNum: isLastDataDeleted
              ? prev.pgNum != 1
                ? prev.pgNum - 1
                : prev.pgNum
              : prev.pgNum,
            isSearch: true,
          }));
        } else {
          setFilters((prev: any) => ({
            ...prev,
            find_row_value: data.returnString,
            isSearch: true,
          }));
        }
      } else {
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          isSearch: true,
        }));
      }
      setParaData({
        workType: "",
        group_code: "",
        group_name: "",
        use_yn: "",
        memo: "",
        rowstatus_s: "",
        sub_code_s: "",
        code_name_s: "",
        sort_seq_s: "",
        extra_field1_s: "",
        extra_field2_s: "",
        extra_field3_s: "",
        extra_field4_s: "",
        extra_field5_s: "",
        code_value_s: "",
        code_length_s: "",
        memo_s: "",
        code_s: "",
        processcode_s: "",
        proccd_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };
  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = () => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult.data.length != 0) {
      setParaData((prev) => ({
        ...prev,
        workType: "D",
        group_code: information.group_code,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
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
              <th>바코드 번호</th>
              <td>
                <Input
                  name="group_code"
                  type="text"
                  value={filters.group_code}
                  onChange={filterInputChange}
                />
              </td>
              <th>바코드 명</th>
              <td>
                <Input
                  name="group_name"
                  type="text"
                  value={filters.group_name}
                  onChange={filterInputChange}
                />
              </td>
              <th>메모</th>
              <td>
                <Input
                  name="memo"
                  type="text"
                  value={filters.memo}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>상세코드명</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="code_name1"
                    value={filters.code_name1}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>사용유무</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="use_yn"
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
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>요약정보</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: mobileheight }}
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
                                    : numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell
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
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>기본정보</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(0);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                    <div>
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
                        icon="delete"
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.delete ? false : true}
                      >
                        삭제
                      </Button>
                      <Button
                        onClick={onSaveClick}
                        icon="save"
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.save ? false : true}
                      >
                        저장
                      </Button>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(2);
                          }
                        }}
                        icon="arrow-right"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        다음
                      </Button>
                    </div>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormBoxWrap border={true} style={{ height: mobileheight2 }}>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th style={{ width: "10%" }}>바코드 번호</th>
                        <td>
                          <Input
                            name="group_code"
                            type="text"
                            value={information.group_code}
                            className="readonly"
                          />
                        </td>
                        <td colSpan={2}>
                          <Checkbox
                            name="use_yn"
                            value={information.use_yn == "Y" ? true : false}
                            onChange={InputChange}
                            label={"사용여부"}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>바코드명</th>
                        <td colSpan={3}>
                          <Input
                            name="group_name"
                            type="text"
                            value={information.group_name}
                            onChange={InputChange}
                            className="required"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>메모</th>
                        <td colSpan={3}>
                          <TextArea
                            value={information.memo}
                            name="memo"
                            rows={5}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer>
                <GridTitleContainer>
                  <ButtonContainer
                    className="ButtonContainer5"
                    style={{ justifyContent: "space-between" }}
                  >
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <TabStrip
                  style={{ width: "100%" }}
                  selected={tabSelected}
                  onSelect={handleSelectTab}
                  scrollable={isMobile}
                >
                  <TabStripTab
                    title="바코드정보"
                    disabled={permissions.view ? false : true}
                  >
                    <GridTitleContainer className="ButtonContainer3">
                      <GridTitle>상세정보</GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick2}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onCopyClick2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="copy"
                          title="행 복사"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onDeleteClick2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={permissions.save ? false : true}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult2.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: mobileheight3 }}
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
                        onItemChange={onMainItemChange2}
                        cellRender={customCellRender2}
                        rowRender={customRowRender2}
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
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : comboField.includes(item.fieldName)
                                        ? CustomComboBoxCell
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
                  </TabStripTab>
                  <TabStripTab
                    title="코드정보"
                    disabled={
                      permissions.view
                        ? information.workType != "N"
                          ? false
                          : true
                        : true
                    }
                  >
                    <GridTitleContainer className="ButtonContainer4">
                      <GridTitle>상세정보</GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick3}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onDeleteClick3}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={permissions.save ? false : true}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <FormContext.Provider
                      value={{
                        itemInfo,
                        setItemInfo,
                      }}
                    >
                      <ExcelExport
                        data={mainDataResult3.data}
                        ref={(exporter) => {
                          _export3 = exporter;
                        }}
                        fileName={getMenuName()}
                      >
                        <Grid
                          style={{ height: mobileheight4 }}
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
                          onItemChange={onMainItemChange3}
                          cellRender={customCellRender3}
                          rowRender={customRowRender3}
                          editField={EDIT_FIELD}
                        >
                          <GridColumn
                            field="rowstatus"
                            title=" "
                            width="50px"
                          />
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions["grdList3"]
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
                                        commandField.includes(item.fieldName)
                                          ? ColumnCommandCell
                                          : undefined
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? mainTotalFooterCell3
                                          : undefined
                                      }
                                    />
                                  )
                              )}
                        </Grid>
                      </ExcelExport>
                    </FormContext.Provider>
                  </TabStripTab>
                </TabStrip>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <GridContainerWrap>
          <GridContainer width="30%">
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>요약정보</GridTitle>
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
                                : numberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
                                ? mainTotalFooterCell
                                : numberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
          <GridContainer width={`calc(70% - ${GAP}px)`}>
            <GridTitleContainer className="ButtonContainer2">
              <GridTitle>기본정보</GridTitle>
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
                  icon="delete"
                  fillMode="outline"
                  themeColor={"primary"}
                  disabled={permissions.delete ? false : true}
                >
                  삭제
                </Button>
                <Button
                  onClick={onSaveClick}
                  icon="save"
                  fillMode="outline"
                  themeColor={"primary"}
                  disabled={permissions.save ? false : true}
                >
                  저장
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <FormBoxWrap border={true} className="FormBoxWrap">
              <FormBox>
                <tbody>
                  <tr>
                    <th style={{ width: "10%" }}>바코드 번호</th>
                    <td>
                      <Input
                        name="group_code"
                        type="text"
                        value={information.group_code}
                        className="readonly"
                      />
                    </td>
                    <td colSpan={2}>
                      <Checkbox
                        name="use_yn"
                        value={information.use_yn == "Y" ? true : false}
                        onChange={InputChange}
                        label={"사용여부"}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>바코드명</th>
                    <td colSpan={3}>
                      <Input
                        name="group_name"
                        type="text"
                        value={information.group_name}
                        onChange={InputChange}
                        className="required"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>메모</th>
                    <td colSpan={3}>
                      <TextArea
                        value={information.memo}
                        name="memo"
                        rows={5}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
            <TabStrip
              style={{ width: "100%" }}
              selected={tabSelected}
              onSelect={handleSelectTab}
              scrollable={isMobile}
            >
              <TabStripTab
                title="바코드정보"
                disabled={permissions.view ? false : true}
              >
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>상세정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick2}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                      disabled={permissions.save ? false : true}
                    ></Button>
                    <Button
                      onClick={onCopyClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="copy"
                      title="행 복사"
                      disabled={permissions.save ? false : true}
                    ></Button>
                    <Button
                      onClick={onDeleteClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                      disabled={permissions.save ? false : true}
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: webheight2 }}
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
                    onItemChange={onMainItemChange2}
                    cellRender={customCellRender2}
                    rowRender={customRowRender2}
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
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : comboField.includes(item.fieldName)
                                    ? CustomComboBoxCell
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
              </TabStripTab>
              <TabStripTab
                title="코드정보"
                disabled={
                  permissions.view
                    ? information.workType != "N"
                      ? false
                      : true
                    : true
                }
              >
                <GridTitleContainer className="ButtonContainer4">
                  <GridTitle>상세정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick3}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                      disabled={permissions.save ? false : true}
                    ></Button>
                    <Button
                      onClick={onDeleteClick3}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                      disabled={permissions.save ? false : true}
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormContext.Provider
                  value={{
                    itemInfo,
                    setItemInfo,
                  }}
                >
                  <ExcelExport
                    data={mainDataResult3.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: webheight3 }}
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
                      onItemChange={onMainItemChange3}
                      cellRender={customCellRender3}
                      rowRender={customRowRender3}
                      editField={EDIT_FIELD}
                    >
                      <GridColumn field="rowstatus" title=" " width="50px" />
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList3"]
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
                                    commandField.includes(item.fieldName)
                                      ? ColumnCommandCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell3
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </FormContext.Provider>
              </TabStripTab>
            </TabStrip>
          </GridContainer>
        </GridContainerWrap>
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

export default BA_A0500W;
