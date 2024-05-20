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
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useContext,
  useEffect,
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
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseParaPc,
  UsePermissions,
  getCodeFromValue,
  getGridItemChangedData,
  getItemQuery,
  getSelectedFirstData,
  handleKeyPressSearch,
  numberWithCommas,
  getHeight
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
import CopyWindow from "../components/Windows/BA_A0050W_Copy_Window";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import CopyWindow2 from "../components/Windows/CommonWindows/PatternWindow";
import { useApi } from "../hooks/api";
import { heightstate, isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/BA_A0050W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var index = 0;

const DATA_ITEM_KEY = "itemcd";
const SUB_DATA_ITEM_KEY = "sub_code";
const SUB_DATA_ITEM_KEY2 = "num";
let maxprocseq = 0;
let deletedMainRows: object[] = [];
let temp = 0;
let temp2 = 0;
const CustomComboField = [
  "proccd",
  "outprocyn",
  "prodemp",
  "qtyunit",
  "procunit",
  "prodmac",
  "outgb",
];

const NumberField = ["procseq", "unitqty", "procqty"];
const itemField = ["chlditemcd"];

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;

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
    "L_PR010,L_BA011,L_sysUserMaster_001,L_BA015,L_fxcode,L_BA041",
    // 공정, 외주여부, 사용자, 수량단위, 공정단위
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "proccd"
      ? "L_PR010"
      : field == "outprocyn"
      ? "L_BA011"
      : field == "prodemp"
      ? "L_sysUserMaster_001"
      : field == "qtyunit"
      ? "L_BA015"
      : field == "procunit"
      ? "L_BA015"
      : field == "prodmac"
      ? "L_fxcode"
      : field == "outgb"
      ? "L_BA041"
      : "";

  const fieldName =
    field == "prodemp"
      ? "user_name"
      : field == "prodmac"
      ? "fxfull"
      : undefined;
  const filedValue =
    field == "prodemp" ? "user_id" : field == "prodmac" ? "fxcode" : undefined;
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={fieldName}
      valueField={filedValue}
      {...props}
    />
  ) : (
    <td />
  );
};

const BA_A0050: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();
  let deviceWidth = document.documentElement.clientWidth;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
  let isMobile = deviceWidth <= 1200;

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const idGetter3 = getter(SUB_DATA_ITEM_KEY2);
  const processApi = useApi();
const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

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

    setsubFilters2((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));

    setPage3(initialPageState);
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setsubFilters((prev) => ({
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

    setsubFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("BA_A0050W", setCustomOptionData);

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
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [subDataState, setSubDataState] = useState<State>({
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

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [subData2Result, setSubData2Result] = useState<DataResult>(
    process([], subData2State)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubData2State, setSelectedsubData2State] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [CopyWindowVisible, setCopyWindowVisible] = useState<boolean>(false);
  const [CopyWindowVisible2, setCopyWindowVisible2] = useState<boolean>(false);

  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);

  useEffect(() => {
    const newData = subData2Result.data.map((item) =>
      item[SUB_DATA_ITEM_KEY2] ==
      parseInt(Object.getOwnPropertyNames(selectedsubData2State)[0])
        ? {
            ...item,
            chlditemcd: itemInfo.itemcd,
            chlditemnm: itemInfo.itemnm,
            itemcd: itemInfo.itemcd,
            itemno: itemInfo.itemno,
            itemnm: itemInfo.itemnm,
            insiz: itemInfo.insiz,
            model: itemInfo.model,
            itemacnt: itemInfo.itemacnt,
            itemacntnm: itemInfo.itemacntnm,
            bnatur: itemInfo.bnatur,
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

    setSubData2Result((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [itemInfo]);

  const fetchItemData = React.useCallback(
    async (itemcd: string) => {
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
          const newData = subData2Result.data.map((item: any) =>
            item[SUB_DATA_ITEM_KEY2] ==
            Object.getOwnPropertyNames(selectedsubData2State)[0]
              ? {
                  ...item,
                  //BA_A0050W에만 사용
                  chlditemcd: item.itemcd,
                  chlditemnm: "",
                  itemcd: item.itemcd,
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
          setSubData2Result((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [subData2Result]
  );

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

  //Form정보 Change
  const InputChange = (e: any) => {
    const { value, name } = e.target;
    setsubFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "ITEM",
    orgdiv: sessionOrgdiv,
    itemcd: "",
    itemnm: "",
    insiz: "",
    itemacnt: "",
    raduseyn: "Y",
    proccd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [subfilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "PROCCD",
    orgdiv: sessionOrgdiv,
    itemcd: "",
    itemnm: "",
    insiz: "",
    itemacnt: "",
    raduseyn: "Y",
    proccd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [subfilters2, setsubFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "BOM",
    orgdiv: sessionOrgdiv,
    itemcd: "###1234",
    itemnm: "",
    insiz: "",
    itemacnt: "",
    raduseyn: filters.raduseyn,
    proccd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0050W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_itemacnt": filters.itemacnt,
        "@p_useyn": filters.raduseyn,
        "@p_proccd": filters.proccd,
        "@p_company_code": companyCode,
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
            (row: any) => row.itemcd == filters.find_row_value
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
            : rows.find((row: any) => row.itemcd == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });

          setsubFilters2((prev) => ({
            ...prev,
            itemcd: selectedRow.itemcd,
            pgNum: 1,
            isSearch: true,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });

          setsubFilters2((prev) => ({
            ...prev,
            itemcd: rows[0].itemcd,
            pgNum: 1,
            isSearch: true,
          }));
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

  const fetchSubGrid = async (subfilters: any) => {
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const subparameters: Iparameters = {
      procedureName: "P_BA_A0050W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": subfilters.workType,
        "@p_orgdiv": subfilters.orgdiv,
        "@p_itemcd": subfilters.itemcd,
        "@p_itemnm": subfilters.itemnm,
        "@p_insiz": subfilters.insiz,
        "@p_itemacnt": subfilters.itemacnt,
        "@p_useyn": subfilters.raduseyn,
        "@p_proccd": subfilters.proccd,
        "@p_company_code": companyCode,
        "@p_find_row_value": subfilters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (subfilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.sub_code == subfilters.find_row_value
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
      setSubDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          subfilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.sub_code == subfilters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedsubDataState({ [selectedRow[SUB_DATA_ITEM_KEY]]: true });
        } else {
          setSelectedsubDataState({ [rows[0][SUB_DATA_ITEM_KEY]]: true });
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

  const fetchSubGrid2 = async (subfilters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const subparameters2: Iparameters = {
      procedureName: "P_BA_A0050W_Q",
      pageNumber: subfilters2.pgNum,
      pageSize: subfilters2.pgSize,
      parameters: {
        "@p_work_type": subfilters2.workType,
        "@p_orgdiv": subfilters2.orgdiv,
        "@p_itemcd": subfilters2.itemcd,
        "@p_itemnm": subfilters2.itemnm,
        "@p_insiz": subfilters2.insiz,
        "@p_itemacnt": subfilters2.itemacnt,
        "@p_useyn": subfilters2.raduseyn,
        "@p_proccd": subfilters2.proccd,
        "@p_company_code": companyCode,
        "@p_find_row_value": subfilters2.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", subparameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (subfilters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.seq == subfilters2.find_row_value
          );
          targetRowIndex3 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage3({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef3.current) {
          targetRowIndex3 = 0;
        }
      }

      setSubData2Result((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          subfilters2.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.seq == subfilters2.find_row_value);

        maxprocseq = rows[0].maxprocseq;
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
    if (subfilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);
      setsubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (subfilters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters2);
      setsubFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchSubGrid2(deepCopiedFilters);
    }
  }, [subfilters2, permissions]);

  const search2 = () => {
    setPage2(initialPageState); // 페이지 초기화
    setsubFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    if(swiper) {
      swiper.slideTo(0);
    }
  };

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
    setSubData2Result(process([], subData2State));
  };

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
  }, [subDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [subData2Result]);

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
    setPage3(initialPageState);
    setsubFilters2((prev) => ({
      ...prev,
      itemcd: selectedRowData.itemcd,
      pgNum: 1,
      isSearch: true,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
  };

  // 모바일 더블클릭
  const [lastTap, setLastTap] = useState({ time: 0, target: null });

  const handleTouchEnd = (event: any) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap.time;
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
    if (tapLength < 300 && event.target === lastTap.target) {
      // 더블 탭 로직 수행
      onRowDoubleCliCK(event); // 이벤트 처리 함수를 호출
    }

    setLastTap({ time: currentTime, target: event.target });
  };

  const onSubDataSelection2Change = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubData2State,
      dataItemKey: SUB_DATA_ITEM_KEY2,
    });

    setSelectedsubData2State(newSelectedState);
  };

  const onRowDoubleCliCK = async (props: any) => {
    let procseq = 1;
    let valid = true;
    let data: any;

    if (subData2Result.total > 0) {
      const subparameters2: Iparameters = {
        procedureName: "P_BA_A0050W_Q",
        pageNumber: 1,
        pageSize: 100000,
        parameters: {
          "@p_work_type": subfilters2.workType,
          "@p_orgdiv": subfilters2.orgdiv,
          "@p_itemcd": subfilters2.itemcd,
          "@p_itemnm": subfilters2.itemnm,
          "@p_insiz": subfilters2.insiz,
          "@p_itemacnt": subfilters2.itemacnt,
          "@p_useyn": subfilters2.raduseyn,
          "@p_proccd": subfilters2.proccd,
          "@p_company_code": companyCode,
          "@p_find_row_value": subfilters2.find_row_value,
        },
      };
      try {
        data = await processApi<any>("procedure", subparameters2);
      } catch (error) {
        data = null;
      }
      const rows = data.tables[0].Rows;

      rows.map((item: { proccd: string; procseq: number }) => {
        if (
          item.proccd == Object.getOwnPropertyNames(selectedsubDataState)[0] &&
          valid == true
        ) {
          procseq = item.procseq;
          valid = false;
        }
      });

      subData2Result.data.map((item: { proccd: string; procseq: number }) => {
        if (
          item.proccd == Object.getOwnPropertyNames(selectedsubDataState)[0] &&
          valid == true
        ) {
          procseq = item.procseq;
          valid = false;
        }
      });

      if (valid == true) {
        procseq = ++maxprocseq;
      }
    }

    subData2Result.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [SUB_DATA_ITEM_KEY2]: ++temp,
      chlditemcd: "",
      chlditemnm: "",
      custcd: "",
      custnm: "",
      orgdiv: sessionOrgdiv,
      outgb: "A",
      outprocyn: "",
      prntitemcd: Object.getOwnPropertyNames(selectedState)[0],
      proccd: Object.getOwnPropertyNames(selectedsubDataState)[0],
      procitemcd: Object.getOwnPropertyNames(selectedState)[0],
      procqty: 1,
      procseq: procseq,
      procunit: "",
      prodemp: "",
      prodmac: "",
      qtyunit: "",
      recdt: "",
      remark: "",
      seq: 0,
      unitqty: 0,
      rowstatus: "N",
    };
    setSelectedsubData2State({ [newDataItem[SUB_DATA_ITEM_KEY2]]: true });

    setSubData2Result((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    if (swiper && isMobile) {
      swiper.slideTo(2);
    }
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      const optionsGridThree = _export3.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[2] = optionsGridThree.sheets[0];
      optionsGridOne.sheets[0].title = "BOM구성정보";
      optionsGridOne.sheets[1].title = "공정리스트";
      optionsGridOne.sheets[2].title = "BOM 상세";
      _export.save(optionsGridOne);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
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
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {subDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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
        {subData2Result.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    subData2Result.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const onCopyEditClick = () => {
    //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
    setCopyWindowVisible(true);
  };

  const onCopyEditClick2 = () => {
    //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
    setCopyWindowVisible2(true);
  };

  type TdataArr = {
    rowstatus_s: String[];
    seq_s: String[];
    chlditemcd_s: String[];
    procitemcd_s: String[];
    recdt_s: String[];
    proccd_s: String[];
    prodemp_s: String[];
    prodmac_s: String[];
    outprocyn_s: String[];
    unitqty_s: String[];
    qtyunit_s: String[];
    outgb_s: String[];
    remark_s: String[];
    procqty_s: String[];
    procunit_s: String[];
    custcd_s: String[];
    custnm_s: String[];
    procseq_s: String[];
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubData2SortChange = (e: any) => {
    setSubData2State((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid(); // 데이터 초기화
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    setPage3(initialPageState); // 페이지 초기화
    maxprocseq = 0;
    setsubFilters((prev) => ({
      ...prev,
      proccd: "",
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
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
      setEditIndex(dataItem[SUB_DATA_ITEM_KEY2]);
      if (field) {
        setEditedField(field);
      }
      setTempResult((prev) => {
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
      setTempResult((prev) => {
        return {
          data: subData2Result.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != subData2Result.data) {
      if (editedField !== "chlditemcd") {
        const newData = subData2Result.data.map((item) =>
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
        setTempResult((prev) => {
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
        subData2Result.data.map((item) => {
          if (editIndex == item[SUB_DATA_ITEM_KEY2]) {
            fetchItemData(item.chlditemcd);
          }
        });
      }
    } else {
      const newData = subData2Result.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
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
  const onDeleteClick2 = (e: any) => {
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

    const isLastDataDeleted =
      subData2Result.data.length == 0 && subfilters2.pgNum > 1;

    if (isLastDataDeleted) {
      setPage3({
        skip:
          subfilters2.pgNum == 1 || subfilters2.pgNum == 0
            ? 0
            : PAGE_SIZE * (subfilters2.pgNum - 2),
        take: PAGE_SIZE,
      });
    }

    setSubData2Result((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));

    setSelectedsubData2State({
      [data != undefined ? data[SUB_DATA_ITEM_KEY2] : newData[0]]: true,
    });

    setSubDataState({});
  };

  const [paraData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    prntitemcd: "",
    rowstatus_s: "",
    seq_s: "",
    chlditemcd_s: "",
    procitemcd_s: "",
    recdt_s: "",
    proccd_s: "",
    prodemp_s: "",
    prodmac_s: "",
    outprocyn_s: "",
    unitqty_s: "",
    qtyunit_s: "",
    outgb_s: "",
    remark_s: "",
    procqty_s: "",
    procunit_s: "",
    custcd_s: "",
    custnm_s: "",
    procseq_s: "",
    userid: userId,
    pc: pc,
    form_id: "BA_A0050W",
    company_code: companyCode,
  });

  const [paraData2, setParaData2] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    prntitemcd: "",
    itemcd_s: "",
    userid: userId,
    pc: pc,
    form_id: "BA_A0050W_Sub1",
    company_code: companyCode,
  });

  const para2: Iparameters = {
    procedureName: "P_BA_A0050W_Sub1_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData2.workType,
      "@p_orgdiv": paraData2.orgdiv,
      "@p_prntitemcd": paraData2.prntitemcd,
      "@p_itemcd_s": paraData2.itemcd_s,
      "@p_userid": paraData2.userid,
      "@p_pc": paraData2.pc,
      "@p_form_id": paraData2.form_id,
      "@p_company_code": paraData2.company_code,
    },
  };

  const para: Iparameters = {
    procedureName: "P_BA_A0050W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_prntitemcd": paraData.prntitemcd,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_seq_s": paraData.seq_s,
      "@p_chlditemcd_s": paraData.chlditemcd_s,
      "@p_procitemcd_s": paraData.procitemcd_s,
      "@p_recdt_s": paraData.recdt_s,
      "@p_proccd_s": paraData.proccd_s,
      "@p_prodemp_s": paraData.prodemp_s,
      "@p_prodmac_s": paraData.prodmac_s,
      "@p_outprocyn_s": paraData.outprocyn_s,
      "@p_unitqty_s": paraData.unitqty_s,
      "@p_qtyunit_s": paraData.qtyunit_s,
      "@p_outgb_s": paraData.outgb_s,
      "@p_remark_s": paraData.remark_s,
      "@p_procqty_s": paraData.procqty_s,
      "@p_procunit_s": paraData.procunit_s,
      "@p_custcd_s": paraData.custcd_s,
      "@p_custnm_s": paraData.custnm_s,
      "@p_procseq_s": paraData.procseq_s,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_form_id": paraData.form_id,
      "@p_company_code": paraData.company_code,
    },
  };

  const onSaveClick = async () => {
    const dataItem = subData2Result.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      seq_s: [],
      chlditemcd_s: [],
      procitemcd_s: [],
      recdt_s: [],
      proccd_s: [],
      prodemp_s: [],
      prodmac_s: [],
      outprocyn_s: [],
      unitqty_s: [],
      qtyunit_s: [],
      outgb_s: [],
      remark_s: [],
      procqty_s: [],
      procunit_s: [],
      custcd_s: [],
      custnm_s: [],
      procseq_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = "",
        chlditemcd = "",
        procitemcd = "",
        recdt = "",
        proccd = "",
        prodemp = "",
        prodmac = "",
        outprocyn = "",
        unitqty = "",
        qtyunit = "",
        outgb = "",
        remark = "",
        procqty = "",
        procunit = "",
        custcd = "",
        custnm = "",
        procseq = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.chlditemcd_s.push(chlditemcd);
      dataArr.procitemcd_s.push(procitemcd);
      dataArr.recdt_s.push(recdt);
      dataArr.proccd_s.push(proccd);
      dataArr.prodemp_s.push(getCodeFromValue(prodemp));
      dataArr.prodmac_s.push(prodmac);
      dataArr.outprocyn_s.push(outprocyn);
      dataArr.unitqty_s.push(unitqty);
      dataArr.qtyunit_s.push(qtyunit);
      dataArr.outgb_s.push(outgb);
      dataArr.remark_s.push(remark);
      dataArr.procqty_s.push(procqty);
      dataArr.procunit_s.push(procunit);
      dataArr.custcd_s.push(custcd);
      dataArr.custnm_s.push(custnm);
      dataArr.procseq_s.push(procseq);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = "",
        chlditemcd = "",
        procitemcd = "",
        recdt = "",
        proccd = "",
        prodemp = "",
        prodmac = "",
        outprocyn = "",
        unitqty = "",
        qtyunit = "",
        outgb = "",
        remark = "",
        procqty = "",
        procunit = "",
        custcd = "",
        custnm = "",
        procseq = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.chlditemcd_s.push(chlditemcd);
      dataArr.procitemcd_s.push(procitemcd);
      dataArr.recdt_s.push(recdt);
      dataArr.proccd_s.push(proccd);
      dataArr.prodemp_s.push(getCodeFromValue(prodemp));
      dataArr.prodmac_s.push(prodmac);
      dataArr.outprocyn_s.push(outprocyn);
      dataArr.unitqty_s.push(unitqty);
      dataArr.qtyunit_s.push(qtyunit);
      dataArr.outgb_s.push(outgb);
      dataArr.remark_s.push(remark);
      dataArr.procqty_s.push(procqty);
      dataArr.procunit_s.push(procunit);
      dataArr.custcd_s.push(custcd);
      dataArr.custnm_s.push(custnm);
      dataArr.procseq_s.push(procseq);
    });

    setParaData((prev) => ({
      ...prev,
      prntitemcd: Object.getOwnPropertyNames(selectedState)[0],
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      seq_s: dataArr.seq_s.join("|"),
      chlditemcd_s: dataArr.chlditemcd_s.join("|"),
      procitemcd_s: dataArr.procitemcd_s.join("|"),
      recdt_s: dataArr.recdt_s.join("|"),
      proccd_s: dataArr.proccd_s.join("|"),
      prodemp_s: dataArr.prodemp_s.join("|"),
      prodmac_s: dataArr.prodmac_s.join("|"),
      outprocyn_s: dataArr.outprocyn_s.join("|"),
      unitqty_s: dataArr.unitqty_s.join("|"),
      qtyunit_s: dataArr.qtyunit_s.join("|"),
      outgb_s: dataArr.outgb_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      procqty_s: dataArr.procqty_s.join("|"),
      procunit_s: dataArr.procunit_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      custnm_s: dataArr.custnm_s.join("|"),
      procseq_s: dataArr.procseq_s.join("|"),
    }));
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
      const result = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      const result2 = subData2Result.data.filter(
        (item) =>
          item[SUB_DATA_ITEM_KEY2] ==
          Object.getOwnPropertyNames(selectedsubData2State)[0]
      )[0];
      if (result2 == undefined) {
        const isLastDataDeleted =
          subData2Result.data.length == 0 && subfilters2.pgNum > 1;
        setsubFilters2((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      } else if (result2.rowstatus == "" || result2.rowstatus == "U") {
        setsubFilters2((prev) => ({
          ...prev,
          find_row_value: result2.seq,
          isSearch: true,
        }));
      } else {
        setsubFilters2((prev) => ({
          ...prev,
          find_row_value: data.returnString.toString(),
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.returnMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved2 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setParaData2((prev) => ({
        ...prev,
        itemcd_s: "",
      }));
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.prntitemcd != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  useEffect(() => {
    if (paraData2.itemcd_s != "") {
      fetchTodoGridSaved2();
    }
  }, [paraData2]);

  const reloadData = (data: any, itemcd: any) => {
    if (data.length == 0) return false;
    let dataArr: any = {
      itemcd_s: [],
    };

    data.forEach((item: any, idx: number) => {
      const { itemcd = "" } = item;
      dataArr.itemcd_s.push(itemcd);
    });

    setParaData2((prev) => ({
      ...prev,
      prntitemcd: itemcd,
      itemcd_s: dataArr.itemcd_s.join("|"),
    }));
  };

  const reloadData2 = (data: any) => {
    for (var i = 0; i < data.length; i++) {
      subData2Result.data.map((item) => {
        if (item.num > temp2) {
          temp2 = item.num;
        }
      });
      const newDataItem = {
        [SUB_DATA_ITEM_KEY2]: ++temp2,
        chlditemcd: "",
        chlditemnm: "",
        custcd: "",
        custnm: "",
        orgdiv: sessionOrgdiv,
        outgb: "A",
        outprocyn: data[i].outprocyn,
        prntitemcd: Object.getOwnPropertyNames(selectedState)[0],
        proccd: data[i].proccd,
        procitemcd: Object.getOwnPropertyNames(selectedState)[0],
        procqty: 1,
        procseq: data[i].procseq,
        procunit: "",
        prodemp: "",
        prodmac: "",
        qtyunit: "",
        recdt: "",
        remark: "",
        seq: 0,
        unitqty: 0,
        rowstatus: "N",
      };

      setSubData2Result((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      setSelectedsubData2State({ [newDataItem[SUB_DATA_ITEM_KEY2]]: true });
      if (data[i].procseq > maxprocseq) {
        maxprocseq = data[i].procseq;
      }
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>BOM관리</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="BA_A0050W"
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
              <th>BOM 유무</th>
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
              <GridContainer
                style={{ width: `${deviceWidth - 30}px`, overflow: "auto" }}
              >
                <ExcelExport
                  ref={(exporter) => (_export = exporter)}
                  data={mainDataResult.data}
                  fileName="BOM관리"
                >
                  <Grid
                    style={{ height: deviceHeight }}
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
                      customOptionData.menuCustomColumnOptions["grdList"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
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
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <GridContainer
                style={{
                  width: `${deviceWidth - 30}px`,
                  overflow: "auto",
                }}
              >
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>공정리스트</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper) {
                          swiper.slideTo(0);
                        }
                      }}
                      icon="arrow-left"
                    >
                      이전
                    </Button>
                    <Button
                      onClick={() => {
                        if (swiper) {
                          swiper.slideTo(2);
                        }
                      }}
                      icon="arrow-right"
                    >
                      상세
                    </Button>
                  </ButtonContainer>
                  <FormBoxWrap border={true}>
                    <FormBox style={{ width: `${deviceWidth - 30}px` }}>
                      <tbody style={{ display: "flex", flexDirection: "row" }}>
                        <td>
                          <Input
                            name="proccd"
                            type="text"
                            value={subfilters.proccd}
                            onChange={InputChange}
                            style={{ width: `${deviceWidth * 0.6}px` }}
                          />
                        </td>
                        <th>
                          <Button
                            onClick={search2}
                            themeColor={"primary"}
                            style={{ marginLeft: "10px" }}
                          >
                            조회
                          </Button>
                        </th>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </GridTitleContainer>
                <ExcelExport
                  ref={(exporter) => (_export2 = exporter)}
                  data={subDataResult.data}
                  fileName="BOM관리"
                >
                  <Grid
                    style={{ height: deviceHeight - height }}
                    data={process(
                      subDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedsubDataState[idGetter2(row)],
                      })),
                      subDataState
                    )}
                    {...subDataState}
                    onDataStateChange={onSubDataStateChange}
                    //선택 기능
                    dataItemKey={SUB_DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={handleTouchEnd}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={subDataResult.total}
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef2}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onSubDataSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList2"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              footerCell={
                                item.sortOrder == 0
                                  ? subTotalFooterCell
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
              key={2}
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <FormContext.Provider
                value={{
                  itemInfo,
                  setItemInfo,
                }}
              >
                <GridContainer
                  style={{
                    width: `${deviceWidth - 30}px`,
                    overflow: "auto",
                  }}
                >
                  <GridTitleContainer className="ButtonContainer2">
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <Button
                        onClick={() => {
                          if (swiper) {
                            swiper.slideTo(1);
                          }
                        }}
                        icon="arrow-left"
                      >
                        이전
                      </Button>
                      <div>
                        <Button
                          onClick={onCopyEditClick2}
                          themeColor={"primary"}
                          icon="save"
                        >
                          패턴공정도 참조
                        </Button>
                        <Button
                          onClick={onCopyEditClick}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                        >
                          BOM복사
                        </Button>
                        <Button
                          onClick={onDeleteClick2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                        />
                        <Button
                          onClick={onSaveClick}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          title="행 저장"
                        />
                      </div>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    ref={(exporter) => (_export3 = exporter)}
                    data={subData2Result.data}
                    fileName="BOM관리"
                  >
                    <Grid
                      style={{ height: deviceHeight - height2 }}
                      data={process(
                        subData2Result.data.map((row) => ({
                          ...row,
                          rowstatus:
                            row.rowstatus == null ||
                            row.rowstatus == "" ||
                            row.rowstatus == undefined
                              ? ""
                              : row.rowstatus,
                          [SELECTED_FIELD]:
                            selectedsubData2State[idGetter3(row)],
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
                      onSelectionChange={onSubDataSelection2Change}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={subData2Result.total}
                      skip={page3.skip}
                      take={page3.take}
                      pageable={true}
                      onPageChange={pageChange3}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef3}
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
                        customOptionData.menuCustomColumnOptions[
                          "grdList3"
                        ]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                          (item: any, idx: number) =>
                            item.sortOrder !== -1 && (
                              <GridColumn
                                key={idx}
                                id={item.id}
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                cell={
                                  CustomComboField.includes(item.fieldName)
                                    ? CustomComboBoxCell
                                    : NumberField.includes(item.fieldName)
                                    ? NumberCell
                                    : itemField.includes(item.fieldName)
                                    ? ColumnCommandCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? sub2TotalFooterCell
                                    : NumberField.includes(item.fieldName)
                                    ? editNumberFooterCell
                                    : undefined
                                }
                              />
                            )
                        )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </FormContext.Provider>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width={`43%`}>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>BOM구성정보</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  ref={(exporter) => (_export = exporter)}
                  data={mainDataResult.data}
                  fileName="BOM관리"
                >
                  <Grid
                    style={{ height: "31vh" }}
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
                      customOptionData.menuCustomColumnOptions["grdList"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
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
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>공정리스트</GridTitle>
                </GridTitleContainer>
                <FormBoxWrap border={true}>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>공정</th>
                        <td>
                          <Input
                            name="proccd"
                            type="text"
                            value={subfilters.proccd}
                            onChange={InputChange}
                          />
                        </td>
                        <th>
                          <Button onClick={search2} themeColor={"primary"}>
                            조회
                          </Button>
                        </th>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
                <ExcelExport
                  ref={(exporter) => (_export2 = exporter)}
                  data={subDataResult.data}
                  fileName="BOM관리"
                >
                  <Grid
                    style={{ height: "36vh" }}
                    data={process(
                      subDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedsubDataState[idGetter2(row)],
                      })),
                      subDataState
                    )}
                    {...subDataState}
                    onDataStateChange={onSubDataStateChange}
                    //선택 기능
                    dataItemKey={SUB_DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSubDataSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={subDataResult.total}
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef2}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onSubDataSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    onRowDoubleClick={onRowDoubleCliCK}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList2"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              footerCell={
                                item.sortOrder == 0
                                  ? subTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
            <FormContext.Provider
              value={{
                itemInfo,
                setItemInfo,
              }}
            >
              <GridContainer width={`calc(57% - ${GAP}px)`}>
                <GridTitleContainer>
                  <GridTitle>BOM 상세</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onCopyEditClick2}
                      themeColor={"primary"}
                      icon="save"
                    >
                      패턴공정도 참조
                    </Button>
                    <Button
                      onClick={onCopyEditClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                    >
                      BOM복사
                    </Button>
                    <Button
                      onClick={onDeleteClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                    />
                    <Button
                      onClick={onSaveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="행 저장"
                    />
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  ref={(exporter) => (_export3 = exporter)}
                  data={subData2Result.data}
                  fileName="BOM관리"
                >
                  <Grid
                    style={{ height: "77.8vh" }}
                    data={process(
                      subData2Result.data.map((row) => ({
                        ...row,
                        rowstatus:
                          row.rowstatus == null ||
                          row.rowstatus == "" ||
                          row.rowstatus == undefined
                            ? ""
                            : row.rowstatus,
                        [SELECTED_FIELD]: selectedsubData2State[idGetter3(row)],
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
                    onSelectionChange={onSubDataSelection2Change}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={subData2Result.total}
                    skip={page3.skip}
                    take={page3.take}
                    pageable={true}
                    onPageChange={pageChange3}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef3}
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
                      customOptionData.menuCustomColumnOptions["grdList3"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                CustomComboField.includes(item.fieldName)
                                  ? CustomComboBoxCell
                                  : NumberField.includes(item.fieldName)
                                  ? NumberCell
                                  : itemField.includes(item.fieldName)
                                  ? ColumnCommandCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? sub2TotalFooterCell
                                  : NumberField.includes(item.fieldName)
                                  ? editNumberFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </FormContext.Provider>
          </GridContainerWrap>
        </>
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
          modal={true}
        />
      )}
      {CopyWindowVisible && (
        <CopyWindow
          getVisible={setCopyWindowVisible}
          para={
            mainDataResult.data.filter(
              (item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
            )[0].itemcd
          }
          setData={reloadData}
          modal={true}
          pathname="BA_A0050W"
        />
      )}

      {CopyWindowVisible2 && (
        <CopyWindow2
          getVisible={setCopyWindowVisible2}
          para={getSelectedFirstData(
            selectedsubDataState,
            subDataResult.data,
            SUB_DATA_ITEM_KEY
          )}
          setData={reloadData2}
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

export default BA_A0050;
