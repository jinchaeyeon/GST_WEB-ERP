import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
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
import { Label } from "@progress/kendo-react-labels";
import { bytesToBase64 } from "byte-base64";
import * as React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInGridInput,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  InfoItem,
  InfoLabel,
  InfoList,
  InfoTitle,
  InfoValue,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import ComboBoxCell from "../Cells/ComboBoxCell";
import NumberCell from "../Cells/NumberCell";
import {
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  checkIsDDLValid,
  convertDateToStr,
  getGridItemChangedData,
  getHeight,
  getItemQuery,
  getSelectedFirstData,
  getWindowDeviceHeight,
  numberWithCommas
} from "../CommonFunction";
import { EDIT_FIELD, GAP, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import CopyWindow2 from "./CommonWindows/PatternWindow";
import Window from "./WindowComponent/Window";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let temp = 0;
let temp2 = 0;
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];
let maxprocseq = 0;

type TProcessData = {
  proccd: string[];
  planno: string[];
  qtyunit: string[];
  planseq: string[];
  procseq: string[];
  procqty: string[];
  outprocyn: string[];
  prodemp: string[];
  prodmac: string[];
  plandt: string[];
  finexpdt: string[];
};

type TMaterialData = {
  seq: string[];
  unitqty: string[];
  outgb: string[];
  chlditemcd: string[];
  qtyunit: string[];
  proccd: string[];
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  //공정코드,외주구분,사용자,설비,자재불출(자재사용)구분_BOM,수량단위
  UseBizComponent(
    "L_PR010,L_BA011,L_sysUserMaster_001,L_fxcode,L_BA041,L_BA015",
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
      : field == "prodmac"
      ? "L_fxcode"
      : field == "outgb"
      ? "L_BA041"
      : field == "qtyunit"
      ? "L_BA015"
      : "";

  const fieldName =
    field == "prodemp"
      ? "user_name"
      : field == "prodmac"
      ? "fxfull"
      : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={fieldName}
      {...props}
    />
  ) : (
    <td />
  );
};

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
        />
      )}
    </>
  );
};

type TKendoWindow = {
  getVisible(t: boolean): void;
  workType: string;
  reloadData(workType: string): void;
  ordkey?: string;
  itemcd?: string;
  modal?: boolean;
};

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;

const KendoWindow = ({
  getVisible,
  reloadData,
  workType,
  ordkey,
  itemcd,
  modal = false,
}: TKendoWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);

  const pc = UseGetValueFromSessionItem("pc");
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");

  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();

  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 750) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 750,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0); // 앞에 폼 높이
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".BottomContainer"); //하단 버튼부분
      height3 = getHeight(".WindowButtonContainer");
      height4 = getHeight(".WindowButtonContainer2");
      height5 = getHeight(".WindowButtonContainer3");

      setMobileHeight(
        getWindowDeviceHeight(false, deviceHeight) - height - height3
      );
      setMobileHeight2(
        getWindowDeviceHeight(false, deviceHeight) - height - height2 - height4
      );
      setMobileHeight3(
        getWindowDeviceHeight(false, deviceHeight) - height - height5
      );
      setWebHeight(
        (getWindowDeviceHeight(false, position.height) - height - height2) / 2 -
          height3
      );
      setWebHeight2(
        (getWindowDeviceHeight(false, position.height) - height - height2) / 2 -
          height4
      );
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      (getWindowDeviceHeight(false, position.height) - height - height2) / 2 -
        height3
    );
    setWebHeight2(
      (getWindowDeviceHeight(false, position.height) - height - height2) / 2 -
        height4
    );
  };
  const onClose = () => {
    getVisible(false);
  };

  const [Information2, setInformation2] = useState({
    planqty: 1,
  });

  const [Information, setInformation] = useState({
    itemcd: "",
    itemnm: "",
    itemacnt: "",
    insiz: "",
    bnatur: "",
    qty: 0,
    planqty: 0,
    ordnum: "",
    ordseq: 0,
  });

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  useEffect(() => {
    const newData = mainDataResult2.data.map((item) =>
      item[DATA_ITEM_KEY2] ==
      parseInt(Object.getOwnPropertyNames(selectedState2)[0])
        ? {
            ...item,
            chlditemcd: itemInfo.itemcd,
            chlditemnm: itemInfo.itemnm,
            itemcd: itemInfo.itemcd,
            itemno: itemInfo.itemno,
            itemnm: itemInfo.itemnm,
            itemacnt: itemInfo.itemacnt,
            insiz: itemInfo.insiz,
            model: itemInfo.model,
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

    setMainDataResult2((prev) => {
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
          const newData = mainDataResult2.data.map((item: any) =>
            item[DATA_ITEM_KEY2] ==
            Object.getOwnPropertyNames(selectedState2)[0]
              ? {
                  ...item,
                  chlditemcd: item.itemcd,
                  chlditemnm: "",
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
          setMainDataResult2((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [mainDataResult2]
  );

  const [filters, setFilters] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    isSearch: true,
    pgNum: 1,
  });

  const [filters2, setFilters2] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    isSearch: true,
    pgNum: 1,
  });

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

  useEffect(() => {
    if (permissions.view && customOptionData !== null) fetchInfor();
  }, [permissions, customOptionData]);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  //그리드 데이터 조회
  const fetchInfor = async () => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //수주정보 조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A1100W_Q",
      pageNumber: 1,
      pageSize: 1,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": sessionLocation,
        "@p_dtgb": "",
        "@p_frdt": "19990101",
        "@p_todt": "20991231",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_itemcd": itemcd,
        "@p_itemnm": "",
        "@p_insiz": "",
        "@p_poregnum": "",
        "@p_ordnum": "",
        "@p_ordseq": "",
        "@p_ordkey": ordkey,
        "@p_plankey": "",
        "@p_ordyn ": "%",
        "@p_planyn": "%",
        "@p_ordsts": "",
        "@p_remark": "",
        "@p_lotno": "",
        "@p_service_id": "",
        "@p_dptcd": "",
        "@p_person": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows[0];
      setInformation({
        itemcd: rows.itemcd,
        itemnm: rows.itemnm,
        itemacnt: rows.itemacnt,
        insiz: rows.insiz,
        bnatur: rows.bnatur,
        qty: rows.qty,
        planqty: rows.planqty,
        ordnum: rows.ordnum,
        ordseq: rows.ordseq,
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //수주정보 조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A1100W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "PRC",
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": sessionLocation,
        "@p_dtgb": "",
        "@p_frdt": "19990101",
        "@p_todt": "20991231",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_itemcd": itemcd,
        "@p_itemnm": "",
        "@p_insiz": "",
        "@p_poregnum": "",
        "@p_ordnum": ordkey!.split("-", 2)[0],
        "@p_ordseq": ordkey!.split("-", 2)[1],
        "@p_ordkey": ordkey,
        "@p_plankey": "",
        "@p_ordyn ": "%",
        "@p_planyn": "%",
        "@p_ordsts": "",
        "@p_remark": "",
        "@p_lotno": "",
        "@p_service_id": "",
        "@p_dptcd": "",
        "@p_person": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //수주정보 조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A1100W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "MTR",
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": sessionLocation,
        "@p_dtgb": "",
        "@p_frdt": "19990101",
        "@p_todt": "20991231",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_itemcd": itemcd,
        "@p_itemnm": "",
        "@p_insiz": "",
        "@p_poregnum": "",
        "@p_ordnum": ordkey!.split("-", 2)[0],
        "@p_ordseq": ordkey!.split("-", 2)[1],
        "@p_ordkey": ordkey,
        "@p_plankey": "",
        "@p_ordyn ": "%",
        "@p_planyn": "%",
        "@p_ordsts": "",
        "@p_remark": "",
        "@p_lotno": "",
        "@p_service_id": "",
        "@p_dptcd": "",
        "@p_person": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
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

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
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
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
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

  const enterEdit = async (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
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

      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev: { total: any }) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
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
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = async (dataItem: any, field: string) => {
    if (field != "rowstatus") {
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

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      if (editedField !== "chlditemcd") {
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
      } else {
        mainDataResult2.data.map(
          (item: { [x: string]: any; chlditemcd: any }) => {
            if (editIndex == item[DATA_ITEM_KEY2]) {
              fetchItemData(item.chlditemcd);
            }
          }
        );
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
  const [CopyWindowVisible2, setCopyWindowVisible2] = useState<boolean>(false);

  const onCopyEditClick2 = () => {
    //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
    setCopyWindowVisible2(true);
  };

  const reloadData2 = (data: any) => {
    for (var i = 0; i < data.length; i++) {
      mainDataResult.data.map((item) => {
        if (item.num > temp) {
          temp = item.num;
        }
      });
      if (data[i].procseq > maxprocseq) {
        maxprocseq = data[i].procseq + 1;
      }
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        finexpdt: convertDateToStr(new Date()),
        itemcd: Information.itemcd,
        ordnum: Information.ordnum,
        ordseq: Information.ordseq,
        outprocyn: "",
        plandt: convertDateToStr(new Date()),
        planno: "",
        planseq: 0,
        prntitemcd: Information.itemcd,
        proccd: data[i].proccd,
        procqty: 1,
        procseq: maxprocseq,
        prodemp: "",
        prodmac: "",
        qty: 0,
        qtyunit: "",
        transfertYN: "",
        rowstatus: "N",
      };

      setMainDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      setPage((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 1,
      }));
      setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    }
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      finexpdt: convertDateToStr(new Date()),
      itemcd: Information.itemcd,
      ordnum: Information.ordnum,
      ordseq: Information.ordseq,
      outprocyn: "",
      plandt: convertDateToStr(new Date()),
      planno: "",
      planseq: 0,
      prntitemcd: Information.itemcd,
      proccd: "",
      procqty: 1,
      procseq: maxprocseq + 1,
      prodemp: "",
      prodmac: "",
      qty: 0,
      qtyunit: "",
      transfertYN: "",
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
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
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    //newData 생성
    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onAddClick2 = () => {
    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    const data = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    if (data != undefined) {
      const newDataItem = {
        [DATA_ITEM_KEY2]: ++temp2,
        chlditemcd: "",
        chlditemnm: "",
        deqty: 0,
        now_qty: 0,
        outgb: "",
        planno: "",
        planseq: 0,
        proccd: data.proccd,
        procqty: data.procqty,
        qtyunit: "",
        seq: 1,
        unitqty: 1,
        rowstatus: "N",
      };

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
      setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    } else {
      alert("공정 선택이 안되었습니다.");
    }
  };

  const onDeleteClick2 = (e: any) => {
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
          deletedMainRows2.push(newData2);
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

  const onSave = () => {
    if (!permissions.save) return;

    if (Information2.planqty < 1) {
      alert("계획수량을 입력하세요.");
      return false;
    }
    let valid2 = true;
    let valid3 = true;
    mainDataResult.data.forEach((item: any, idx: number) => {
      mainDataResult.data.forEach((chkItem: any, chkIdx: number) => {
        if (
          (item.proccd == chkItem.proccd || item.procseq == chkItem.procseq) &&
          idx !== chkIdx
        ) {
          valid2 = false;
        }
      });

      if (!checkIsDDLValid(item.proccd)) {
        valid3 = false;
      }

      if (item.procseq < 0) {
        valid3 = false;
      }
    });

    if (!valid2) {
      alert("공정과 공정순서를 확인하세요.");
      return false;
    }
    if (!valid3) {
      alert("필수값을 입력해주세요.");
      return false;
    }
    let processArr: TProcessData = {
      proccd: [],
      planno: [],
      qtyunit: [],
      planseq: [],
      procseq: [],
      procqty: [],
      outprocyn: [],
      prodemp: [],
      prodmac: [],
      plandt: [],
      finexpdt: [],
    };

    let materialArr: TMaterialData = {
      seq: [],
      unitqty: [],
      outgb: [],
      chlditemcd: [],
      qtyunit: [],
      proccd: [],
    };

    mainDataResult.data.forEach((item: any, idx: number) => {
      const {
        proccd,
        planseq,
        planno,
        procseq,
        qtyunit,
        outprocyn,
        prodemp,
        prodmac,
      } = item;
      processArr.proccd.push(proccd);
      processArr.planno.push(planno);
      processArr.qtyunit.push(qtyunit);
      processArr.planseq.push("0");
      processArr.procqty.push("1");
      processArr.procseq.push(String(idx + 1));
      processArr.plandt.push(convertDateToStr(new Date()));
      processArr.finexpdt.push(convertDateToStr(new Date()));
      processArr.outprocyn.push(
        outprocyn == true ? "Y" : outprocyn == false ? "N" : outprocyn
      );
      processArr.prodemp.push(prodemp);
      processArr.prodmac.push(prodmac);
    });

    mainDataResult2.data.forEach((item: any, idx: number) => {
      const { unitqty, outgb, chlditemcd, qtyunit, proccd } = item;
      materialArr.seq.push("0");
      materialArr.unitqty.push(unitqty);
      materialArr.outgb.push(outgb);
      materialArr.chlditemcd.push(chlditemcd);
      materialArr.qtyunit.push(qtyunit);
      materialArr.proccd.push(proccd);
    });

    setParaData((prev) => ({
      ...prev,
      work_type: workType,
      orgdiv: sessionOrgdiv,
      location: sessionLocation,
      planqty: Information.planqty,
      rowstatus_s: "",
      ordnum_s: Information.ordnum,
      ordseq_s: Information.ordseq,
      orddt_s: "",
      dlvdt_s: "",
      ordsts_s: "",
      project_s: "",
      poregnum_s: "",
      amtunit_s: "",
      baseamt_s: "",
      wonchgrat_s: "",
      uschgrat_s: "",
      attdatnum_s: "",
      remark_s: "",
      custcd_s: "",
      custnm_s: "",
      dptcd_s: "",
      person_s: "",
      itemcd_s: Information.itemcd,
      itemnm_s: "",
      itemacnt_s: "",
      insiz_s: "",
      qty_s: "",
      bf_qty_s: "",
      unp_s: "",
      wonamt_s: "",
      taxamt_s: "",
      amt_s: "",
      dlramt_s: "",
      bnatur_s: "",
      planno_s: processArr.planno.join("|"),
      planseq_s: processArr.planseq.join("|"),
      seq_s: materialArr.seq.join("|"),
      unitqty_s: materialArr.unitqty.join("|"),
      qtyunit_s: processArr.qtyunit.join("|"),
      outgb_s: materialArr.outgb.join("|"),
      procqty_s: processArr.procqty.join("|"),
      chlditemcd_s: materialArr.chlditemcd.join("|"),
      qtyunit_s2: materialArr.qtyunit.join("|"),
      proccd_s2: materialArr.proccd.join("|"),
      plandt_s: processArr.plandt.join("|"),
      finexpdt_s: processArr.finexpdt.join("|"),
      prodmac_s: processArr.prodmac.join("|"),
      prodemp_s: processArr.prodemp.join("|"),
      proccd_s: processArr.proccd.join("|"),
      procseq_s: processArr.procseq.join("|"),
      outprocyn_s: processArr.outprocyn.join("|"),
      lotnum_s: "",
      ordyn_s: "",
      userid: userId,
      pc: "WEB TEST",
      purtype: "",
      urgencyyn: "",
      service_id: "20190218001",
      form_id: "PR_A11.00W",
    }));
  };

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    orgdiv: "",
    location: "",
    planqty: 0,
    rowstatus_s: "",
    ordnum_s: "",
    ordseq_s: 0,
    orddt_s: "",
    dlvdt_s: "",
    ordsts_s: "",
    project_s: "",
    poregnum_s: "",
    amtunit_s: "",
    baseamt_s: "",
    wonchgrat_s: "",
    uschgrat_s: "",
    attdatnum_s: "",
    remark_s: "",
    custcd_s: "",
    custnm_s: "",
    dptcd_s: "",
    person_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    insiz_s: "",
    qty_s: "",
    bf_qty_s: "",
    unp_s: "",
    wonamt_s: "",
    taxamt_s: "",
    amt_s: "",
    dlramt_s: "",
    bnatur_s: "",
    planno_s: "",
    planseq_s: "",
    seq_s: "",
    unitqty_s: "",
    qtyunit_s: "",
    outgb_s: "",
    procqty_s: "",
    chlditemcd_s: "",
    qtyunit_s2: "",
    proccd_s2: "",
    plandt_s: "",
    finexpdt_s: "",
    prodmac_s: "",
    prodemp_s: "",
    proccd_s: "",
    procseq_s: "",
    outprocyn_s: "",
    lotnum_s: "",
    ordyn_s: "",
    userid: userId,
    pc: pc,
    purtype: "",
    urgencyyn: "",
    service_id: "",
    form_id: "",
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_PR_A1100W_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_planqty": paraData.planqty,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_ordnum_s": paraData.ordnum_s,
      "@p_ordseq_s": paraData.ordseq_s,
      "@p_orddt_s": paraData.orddt_s,
      "@p_dlvdt_s": paraData.dlvdt_s,
      "@p_ordsts_s": paraData.ordsts_s,
      "@p_project_s": paraData.project_s,
      "@p_poregnum_s": paraData.poregnum_s,
      "@p_amtunit_s": paraData.amtunit_s,
      "@p_baseamt_s": paraData.baseamt_s,
      "@p_wonchgrat_s": paraData.wonchgrat_s,
      "@p_uschgrat_s": paraData.uschgrat_s,
      "@p_attdatnum_s": paraData.attdatnum_s,
      "@p_remark_s": paraData.remark_s,
      "@p_custcd_s": paraData.custcd_s,
      "@p_custnm_s": paraData.custnm_s,
      "@p_dptcd_s": paraData.dptcd_s,
      "@p_person_s": paraData.person_s,
      "@p_itemcd_s": paraData.itemcd_s,
      "@p_itemnm_s": paraData.itemnm_s,
      "@p_itemacnt_s": paraData.itemacnt_s,
      "@p_insiz_s": paraData.insiz_s,
      "@p_qty_s": paraData.qty_s,
      "@p_bf_qty_s": paraData.bf_qty_s,
      "@p_unp_s": paraData.unp_s,
      "@p_wonamt_s": paraData.wonamt_s,
      "@p_taxamt_s": paraData.taxamt_s,
      "@p_amt_s": paraData.amt_s,
      "@p_dlramt_s": paraData.dlramt_s,
      "@p_bnatur_s": paraData.bnatur_s,
      "@p_planno_s": paraData.planno_s,
      "@p_planseq_s": paraData.planseq_s,
      "@p_seq_s": paraData.seq_s,
      "@p_unitqty_s": paraData.unitqty_s,
      "@p_qtyunit_s": paraData.qtyunit_s,
      "@p_outgb_s": paraData.outgb_s,
      "@p_procqty_s": paraData.procqty_s,
      "@p_chlditemcd_s": paraData.chlditemcd_s,
      "@p_qtyunit_s2": paraData.qtyunit_s2,
      "@p_proccd_s2": paraData.proccd_s2,
      "@p_plandt_s": paraData.plandt_s,
      "@p_finexpdt_s": paraData.finexpdt_s,
      "@p_prodmac_s": paraData.prodmac_s,
      "@p_prodemp_s": paraData.prodemp_s,
      "@p_proccd_s": paraData.proccd_s,
      "@p_procseq_s": paraData.procseq_s,
      "@p_outprocyn_s": paraData.outprocyn_s,
      "@p_lotnum_s": paraData.lotnum_s,
      "@p_ordyn_s": paraData.ordyn_s,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_purtype": paraData.purtype,
      "@p_urgencyyn": paraData.urgencyyn,
      "@p_service_id": paraData.service_id,
      "@p_form_id": paraData.form_id,
    },
  };

  useEffect(() => {
    if (paraData.work_type !== "" && permissions.save) fetchGridSaved();
  }, [paraData, permissions]);

  const fetchGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (workType == "U") {
        reloadData(data.returnString);
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: false,
        }));
        setFilters2((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: false,
        }));
      } else {
        reloadData(data.returnString);
        getVisible(false);
      }
    } else {
      alert(data.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
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

  return (
    <>
      <Window
        titles={workType == "N" ? "계획처리" : "계획처리"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        {isMobile ? (
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
                style={{ height: mobileheight3, overflow: "auto" }}
              >
                <GridTitleContainer className="WindowButtonContainer3">
                  <ButtonContainer style={{ justifyContent: "end" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="chevron-right"
                      themeColor={"primary"}
                      fillMode={"flat"}
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <InfoList>
                  <InfoTitle>수주정보</InfoTitle>
                  <InfoItem>
                    <InfoLabel>품목코드</InfoLabel>
                    <InfoValue>{Information.itemcd}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>품목명</InfoLabel>
                    <InfoValue>{Information.itemnm}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>품목계정</InfoLabel>
                    <InfoValue>{Information.itemacnt}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>규격</InfoLabel>
                    <InfoValue>{Information.insiz}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>재질</InfoLabel>
                    <InfoValue>{Information.bnatur}</InfoValue>
                  </InfoItem>
                </InfoList>
                <InfoList>
                  <InfoTitle>계획정보</InfoTitle>
                  <InfoItem>
                    <InfoLabel>수주량</InfoLabel>
                    <InfoValue>{Information.qty}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>잔량</InfoLabel>
                    <InfoValue>{Information.planqty}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <Label style={{ width: "50%", fontWeight: 600 }}>
                      계획수량
                    </Label>
                    <InfoValue>
                      <Input
                        name="planqty"
                        type="number"
                        value={Information2.planqty}
                        onChange={filterInputChange}
                        className="required big-input"
                      />
                    </InfoValue>
                  </InfoItem>
                </InfoList>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer>
                <GridTitleContainer className="WindowButtonContainer">
                  <GridTitle>공정</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <div>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                        icon="chevron-left"
                        themeColor={"primary"}
                        fillMode={"flat"}
                      ></Button>
                    </div>
                    <div>
                      <Button
                        type={"button"}
                        themeColor={"primary"}
                        onClick={onCopyEditClick2}
                        disabled={permissions.save ? false : true}
                      >
                        패턴공정도
                      </Button>
                      <Button
                        type={"button"}
                        themeColor={"primary"}
                        onClick={onAddClick}
                        title="행 추가"
                        icon="add"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        type={"button"}
                        themeColor={"primary"}
                        fillMode="outline"
                        onClick={onDeleteClick}
                        title="행 삭제"
                        icon="minus"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(2);
                          }
                        }}
                        icon="chevron-right"
                        themeColor={"primary"}
                        fillMode={"flat"}
                      ></Button>
                    </div>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: mobileheight }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                    mainDataState
                  )}
                  onDataStateChange={onMainDataStateChange}
                  {...mainDataState}
                  //선택 subDataState
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange}
                  //스크롤 조회기능
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
                  onItemChange={onMainItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  <GridColumn
                    field="proccd"
                    title="공정"
                    width="150px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="procseq"
                    title="공정순서"
                    width="100px"
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="outprocyn"
                    title="외주구분"
                    width="110px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="prodemp"
                    title="작업자"
                    width="120px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="prodmac"
                    title="설비"
                    width="200px"
                    cell={CustomComboBoxCell}
                  />
                </Grid>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer>
                <GridTitleContainer className="WindowButtonContainer2">
                  <GridTitle>자재</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="chevron-left"
                      themeColor={"primary"}
                      fillMode={"flat"}
                    ></Button>
                    <div>
                      <Button
                        type={"button"}
                        themeColor={"primary"}
                        onClick={onAddClick2}
                        title="행 추가"
                        icon="add"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        type={"button"}
                        themeColor={"primary"}
                        fillMode="outline"
                        onClick={onDeleteClick2}
                        title="행 삭제"
                        icon="minus"
                        disabled={permissions.save ? false : true}
                      ></Button>
                    </div>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: mobileheight2 }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
                    })),
                    mainDataState2
                  )}
                  onDataStateChange={onMainDataStateChange2}
                  {...mainDataState2}
                  //선택 subDataState
                  dataItemKey={DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange2}
                  //스크롤 조회기능
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
                  <GridColumn
                    field="proccd"
                    title="공정"
                    width="130px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="chlditemcd"
                    title="소요자재코드"
                    width="160px"
                    cell={ColumnCommandCell}
                  />
                  <GridColumn
                    field="chlditemnm"
                    title="소요자재명"
                    width="180px"
                  />
                  <GridColumn
                    field="outgb"
                    title="자재사용구분"
                    width="120px"
                    cell={CustomComboBoxCell}
                  />
                  <GridColumn
                    field="unitqty"
                    title="소요량"
                    width="120px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="procqty"
                    title="재공생산량"
                    width="120px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell}
                  />
                  <GridColumn
                    field="qtyunit"
                    title="수량단위"
                    width="100px"
                    cell={CustomComboBoxCell}
                  />
                </Grid>
                <BottomContainer className="BottomContainer">
                  <ButtonContainer>
                    {permissions.save && (
                      <Button
                        onClick={onSave}
                        themeColor={"primary"}
                        icon="save"
                      >
                        저장
                      </Button>
                    )}
                  </ButtonContainer>
                </BottomContainer>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        ) : (
          <>
            {" "}
            <GridContainerWrap>
              <GridContainer width="30%">
                <InfoList>
                  <InfoTitle>수주정보</InfoTitle>
                  <InfoItem>
                    <InfoLabel>품목코드</InfoLabel>
                    <InfoValue>{Information.itemcd}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>품목명</InfoLabel>
                    <InfoValue>{Information.itemnm}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>품목계정</InfoLabel>
                    <InfoValue>{Information.itemacnt}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>규격</InfoLabel>
                    <InfoValue>{Information.insiz}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>재질</InfoLabel>
                    <InfoValue>{Information.bnatur}</InfoValue>
                  </InfoItem>
                </InfoList>
                <InfoList>
                  <InfoTitle>계획정보</InfoTitle>
                  <InfoItem>
                    <InfoLabel>수주량</InfoLabel>
                    <InfoValue>{Information.qty}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>잔량</InfoLabel>
                    <InfoValue>{Information.planqty}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <Label style={{ width: "50%", fontWeight: 600 }}>
                      계획수량
                    </Label>
                    <InfoValue>
                      <Input
                        name="planqty"
                        type="number"
                        value={Information2.planqty}
                        onChange={filterInputChange}
                        className="required big-input"
                      />
                    </InfoValue>
                  </InfoItem>
                </InfoList>
              </GridContainer>
              <GridContainer width={`calc(70% - ${GAP}px)`}>
                <GridContainer>
                  <GridTitleContainer className="WindowButtonContainer">
                    <GridTitle>공정</GridTitle>
                    <ButtonContainer>
                      <Button
                        type={"button"}
                        themeColor={"primary"}
                        onClick={onCopyEditClick2}
                        disabled={permissions.save ? false : true}
                      >
                        패턴공정도
                      </Button>
                      <Button
                        type={"button"}
                        themeColor={"primary"}
                        onClick={onAddClick}
                        title="행 추가"
                        icon="add"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        type={"button"}
                        themeColor={"primary"}
                        fillMode="outline"
                        onClick={onDeleteClick}
                        disabled={permissions.save ? false : true}
                        title="행 삭제"
                        icon="minus"
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: webheight }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        rowstatus:
                          row.rowstatus == null ||
                          row.rowstatus == "" ||
                          row.rowstatus == undefined
                            ? ""
                            : row.rowstatus,
                        [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                      })),
                      mainDataState
                    )}
                    onDataStateChange={onMainDataStateChange}
                    {...mainDataState}
                    //선택 subDataState
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange}
                    //스크롤 조회기능
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
                    onItemChange={onMainItemChange}
                    cellRender={customCellRender}
                    rowRender={customRowRender}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn field="rowstatus" title=" " width="50px" />
                    <GridColumn
                      field="proccd"
                      title="공정"
                      width="150px"
                      cell={CustomComboBoxCell}
                    />
                    <GridColumn
                      field="procseq"
                      title="공정순서"
                      width="100px"
                      cell={NumberCell}
                    />
                    <GridColumn
                      field="outprocyn"
                      title="외주구분"
                      width="110px"
                      cell={CustomComboBoxCell}
                    />
                    <GridColumn
                      field="prodemp"
                      title="작업자"
                      width="120px"
                      cell={CustomComboBoxCell}
                    />
                    <GridColumn
                      field="prodmac"
                      title="설비"
                      width="200px"
                      cell={CustomComboBoxCell}
                    />
                  </Grid>
                </GridContainer>
                <FormContext.Provider
                  value={{
                    itemInfo,
                    setItemInfo,
                  }}
                >
                  <GridContainer>
                    <GridTitleContainer className="WindowButtonContainer2">
                      <GridTitle>자재</GridTitle>
                      <ButtonContainer>
                        <Button
                          type={"button"}
                          themeColor={"primary"}
                          onClick={onAddClick2}
                          title="행 추가"
                          icon="add"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          type={"button"}
                          themeColor={"primary"}
                          fillMode="outline"
                          onClick={onDeleteClick2}
                          title="행 삭제"
                          icon="minus"
                          disabled={permissions.save ? false : true}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <Grid
                      style={{ height: webheight2 }}
                      data={process(
                        mainDataResult2.data.map((row) => ({
                          ...row,
                          rowstatus:
                            row.rowstatus == null ||
                            row.rowstatus == "" ||
                            row.rowstatus == undefined
                              ? ""
                              : row.rowstatus,
                          [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
                        })),
                        mainDataState2
                      )}
                      onDataStateChange={onMainDataStateChange2}
                      {...mainDataState2}
                      //선택 subDataState
                      dataItemKey={DATA_ITEM_KEY2}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange2}
                      //스크롤 조회기능
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
                      <GridColumn
                        field="proccd"
                        title="공정"
                        width="130px"
                        cell={CustomComboBoxCell}
                      />
                      <GridColumn
                        field="chlditemcd"
                        title="소요자재코드"
                        width="160px"
                        cell={ColumnCommandCell}
                      />
                      <GridColumn
                        field="chlditemnm"
                        title="소요자재명"
                        width="180px"
                      />
                      <GridColumn
                        field="outgb"
                        title="자재사용구분"
                        width="120px"
                        cell={CustomComboBoxCell}
                      />
                      <GridColumn
                        field="unitqty"
                        title="소요량"
                        width="120px"
                        cell={NumberCell}
                        footerCell={editNumberFooterCell}
                      />
                      <GridColumn
                        field="procqty"
                        title="재공생산량"
                        width="120px"
                        cell={NumberCell}
                        footerCell={editNumberFooterCell}
                      />
                      <GridColumn
                        field="qtyunit"
                        title="수량단위"
                        width="100px"
                        cell={CustomComboBoxCell}
                      />
                    </Grid>
                  </GridContainer>
                </FormContext.Provider>
              </GridContainer>
            </GridContainerWrap>
            <BottomContainer className="BottomContainer">
              <ButtonContainer>
                {permissions.save && (
                  <Button onClick={onSave} themeColor={"primary"} icon="save">
                    저장
                  </Button>
                )}
              </ButtonContainer>
            </BottomContainer>
          </>
        )}
      </Window>
      {CopyWindowVisible2 && (
        <CopyWindow2
          getVisible={setCopyWindowVisible2}
          para={getSelectedFirstData(
            selectedState,
            mainDataResult.data,
            DATA_ITEM_KEY
          )}
          setData={reloadData2}
        />
      )}
    </>
  );
};

export default KendoWindow;
