import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import {
  Checkbox,
  Input,
  InputChangeEvent,
  NumericTextBox,
  TextArea,
} from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import {
  createContext,
  useCallback,
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
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import ComboBoxCell from "../Cells/ComboBoxCell";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  UsePermissions,
  dateformat,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  getItemQuery,
  getWindowDeviceHeight,
  numberWithCommas,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import RequiredHeader from "../HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../Renderers/Renderers";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import Window from "./WindowComponent/Window";

type IWindow = {
  setVisible(t: boolean): void;
  filters: any;
  item: any;
  save?: boolean;
  modal?: boolean;
};

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
let temp = 0;
let temp2 = 0;
let temp3 = 0;
let deletedRows: object[] = [];
let deletedRows2: object[] = [];
let deletedRows3: object[] = [];
const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_MA035, L_SA002_603", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "pgmdiv" ? "L_MA035" : field == "optioncd" ? "L_SA002_603" : "";

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      {...props}
      disabled={
        field == "pgmdiv" && props.dataItem.rowstatus_item != "N" ? true : false
      }
    />
  ) : (
    <td />
  );
};

type TdataArr = {
  rowstatus_s: string[];
  seq_s: string[];
  itemcd_s: string[];
  injectcnt_s: string[];
  injectcycle_s: string[];
  maleqty_s: string[];
  femaleqty_s: string[];
  totqty_s: string[];
  sampleqty_s: string[];
  urineqty_s: string[];
  tkqty_s: string[];
  experimentqty_s: string[];
  autopsyqty_s: string[];
  spareqty_s: string[];
  recoverqty_s: string[];
  cageqty_s: string[];
  rackqty_s: string[];
  infusionqty_s: string[];
  infusiontime_s: string[];
  point_s: string[];
  capacity_s: string[];
  geomcheqty_s: string[];
  geomcheprodqty_s: string[];
  infusioncount_s: string[];
  testcnt_s: string[];
  strainqty_s: string[];
  matterqty_s: string[];
  affiliationqty_s: string[];
  plateqty_s: string[];
  cellqty_s: string[];
  virusqty_s: string[];
  runtime_s: string[];
  gunqty_s: string[];
  concentrationcnt_s: string[];
  one_week_s: string[];
  two_week_s: string[];
  one_twoweek_s: string[];
  guaranteeperiod_s: string[];
  testperiod_s: string[];
  refineperiod_s: string[];
  autopsyperiod_s: string[];
  recoverweek_s: string[];
  recoverday_s: string[];
  genderyn_s: string[];
  breedmeth_s: string[];
  cagetype_s: string[];
  prodmac_s: string[];
  assaytype_s: string[];
  assaytype1_s: string[];
  assaytype2_s: string[];
  slideqty_s: string[];
  histopathologyqty_s: string[];

  chlditemcd_s: string[];
  column_itemcd_s: string[];
  column_itemnm_s: string[];
  gubun_s: string[];
  remark_s: string[];
  qty_s: string[];
  optioncd_s: string[];
  bonyn_s: string[];
  pointqty_s: string[];
  chasu_s: string[];
  chasuspace_s: string[];
  amt_s: string[];
  ref_key_s: string[];

  rowstatus_gun: string[];
  group_seq_gun: string[];
  remark3_gun: string[];
  animalqty_gun: string[];
  femaleqty_gun: string[];
  maleqty_gun: string[];
  remark_gun: string[];
  injectwgt_gun: string[];

  rowstatus_item: string[];
  reqnum_item: string[];
  reqrev_item: string[];
  reqseq_item: string[];
  qty_item: string[];
  experimentqty_item: string[];
  spareqty_item: string[];
  pgmdiv_item: string[];
  remark_item: string[];
  inreqdt_item: string[];
};

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;

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
      <>
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
      </>
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
          yn={false}
        />
      )}
    </>
  );
};

const CopyWindow = ({
  setVisible,
  filters,
  item,
  save = false,
  modal = false,
}: IWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 800,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [mobileheight5, setMobileHeight5] = useState(0);
  const [mobileheight6, setMobileHeight6] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);
  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".BottomContainer"); //하단 버튼부분
    height3 = getHeight(".WindowButtonContainer");
    height4 = getHeight(".WindowButtonContainer2");
    height5 = getHeight(".WindowButtonContainer3");
    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height - height2
    );
    setMobileHeight2(
      getWindowDeviceHeight(false, deviceHeight) - height - height2
    );
    setMobileHeight3(
      getWindowDeviceHeight(false, deviceHeight) - height - height2
    );
    setMobileHeight4(
      getWindowDeviceHeight(false, deviceHeight) - height - height2 - height3
    );
    setMobileHeight5(
      getWindowDeviceHeight(false, deviceHeight) - height - height2 - height4
    );
    setMobileHeight6(
      getWindowDeviceHeight(false, deviceHeight) - height - height2 - height5
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
    setWebHeight2(
      (getWindowDeviceHeight(false, position.height) - height - height2) / 2 -
        height3
    );
    setWebHeight3(
      (getWindowDeviceHeight(false, position.height) - height - height2) / 2 -
        height4
    );
    setWebHeight4(
      (getWindowDeviceHeight(false, position.height) - height - height2) / 2 -
        height5
    );
  }, []);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
  };
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");

  const onClose = () => {
    temp = 0;
    temp2 = 0;
    temp3 = 0;
    setVisible(false);
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });

  const [tempState, setTempState] = useState<State>({
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
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
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
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);

  useEffect(() => {
    (async () => {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] ==
        parseInt(Object.getOwnPropertyNames(selectedState)[0])
          ? {
              ...item,
              itemcd: itemInfo.itemcd,
              itemno: itemInfo.itemno,
              itemnm: itemInfo.itemnm,
              insiz: itemInfo.insiz,
              model: itemInfo.model,
              bnatur: itemInfo.bnatur,
              spec: itemInfo.spec,
              itemacnt: itemInfo.itemacnt,
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

      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    })();
  }, [itemInfo]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA171", setBizComponentData);

  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setItemlvl1ListData(getBizCom(bizComponentData, "L_BA171"));
    }
  }, [bizComponentData]);

  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1000W_603_Q",
      pageNumber: 1,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": "POPUP",
        "@p_orgdiv": filters.orgdiv,
        "@p_location":
          filters.location == undefined ? sessionOrgdiv : filters.location,
        "@p_custcd":
          filters.custnm == "" || filters.custnm == undefined
            ? ""
            : filters.custcd,
        "@p_custnm": filters.custnm == undefined ? "" : filters.custnm,
        "@p_finyn": filters.finyn == undefined ? "" : filters.finyn,
        "@p_quotype": filters.quotype == undefined ? "" : filters.quotype,
        "@p_materialtype":
          filters.materialtype == undefined ? "" : filters.materialtype,
        "@p_quonum": item.quonum,
        "@p_quorev": item.quorev,
        "@p_quoseq": item.quoseq,
        "@p_status": "",
        "@p_extra_field2": "",
        "@p_smperson": "",
        "@p_smpersonnm": "",
        "@p_frdt": "",
        "@p_todt": "",
        "@p_in_frdt": "",
        "@p_in_todt": "",
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const totalRowCnt2 = data.tables[1].RowCount;
      const totalRowCnt3 = data.tables[4].RowCount;
      const totalRowCnt4 = data.tables[6].RowCount;
      const totalRowCnt5 = data.tables[7].RowCount;
      const totalRowCnt6 = data.tables[8].RowCount;
      const rows = data.tables[0].Rows;
      const rows2 = data.tables[1].Rows;
      const rows3 = data.tables[4].Rows;
      const rows4 = data.tables[6].Rows;
      const rows5 = data.tables[7].Rows;
      const rows6 = data.tables[8].Rows;

      setMainDataResult(() => {
        return {
          data: rows4,
          total: totalRowCnt4 == -1 ? 0 : totalRowCnt4,
        };
      });
      setMainDataResult2(() => {
        return {
          data: rows5,
          total: totalRowCnt5 == -1 ? 0 : totalRowCnt5,
        };
      });
      setMainDataResult3(() => {
        return {
          data: rows6,
          total: totalRowCnt6 == -1 ? 0 : totalRowCnt6,
        };
      });

      if (totalRowCnt4 > 0) {
        setSelectedState({ [rows4[0][DATA_ITEM_KEY]]: true });
      }
      if (totalRowCnt5 > 0) {
        setSelectedState2({ [rows5[0][DATA_ITEM_KEY2]]: true });
      }
      if (totalRowCnt6 > 0) {
        setSelectedState3({ [rows6[0][DATA_ITEM_KEY3]]: true });
      }

      if (totalRowCnt > 0) {
        setInformation((prev) => ({
          ...prev,
          orgdiv: rows[0].orgdiv,
          quonum: rows[0].quonum,
          quorev: rows[0].quorev,
          quoseq: rows[0].quoseq,
          quotestnum: rows[0].quotestnum,
          itemlvl1: rows[0].itemlvl1,
          itemcd: rows[0].itemcd,
          itemnm: rows[0].itemnm,
        }));
        setInformation_ori((prev) => ({
          ...prev,
          orgdiv: rows[0].orgdiv,
          quonum: rows[0].quonum,
          quorev: rows[0].quorev,
          quoseq: rows[0].quoseq,
          quotestnum: rows[0].quotestnum,
          itemlvl1: rows[0].itemlvl1,
          itemcd: rows[0].itemcd,
          itemnm: rows[0].itemnm,
        }));
      }
      if (totalRowCnt2 > 0) {
        setInformation((prev) => ({
          ...prev,
          rowstatus_base: "U",
          seq_base: rows2[0].seq,
          injectroute_base: rows2[0].injectroute,
          teststs_base: rows2[0].teststs,
          chlditemcd_base: rows2[0].chlditemcd,
          injectcnt_base: rows2[0].injectcnt,
          injectcycle_base: rows2[0].injectcycle,
          chasu_base: rows2[0].chasu,
          testperiod_base: rows2[0].testperiod,
          experiment_week_base: rows2[0].experiment_week,
          totqty_base: rows2[0].totqty,
          experimentqty_base: rows2[0].experimentqty,
          spareqty_base: rows2[0].spareqty,
          maleqty_base: rows2[0].maleqty,
          femaleqty_base: rows2[0].femaleqty,
          chasuspace_base: rows2[0].chasuspace,
          geomcheqty_base: rows2[0].geomcheqty,
          geomcheprodqty_base: rows2[0].geomcheprodqty,
          totgeomche_base: rows2[0].totgeomche,
          remark_base: rows2[0].remark,
          point_base: rows2[0].point,
          strainqty_base: rows2[0].strainqty,
          affiliationqty_base: rows2[0].affiliationqty,
          capacity_base: rows2[0].capacity,
          plateqty_base: rows2[0].plateqty,
          cellqty_base: rows2[0].cellqty,
          virusqty_base: rows2[0].virusqty,
          prodmac_base: rows2[0].prodmac,
          matterqty_base: rows2[0].matterqty,
          runtime_base: rows2[0].runtime,
          assaytype_base: rows2[0].assaytype,
          column_itemcd_base: rows2[0].column_itemcd,
          column_itemnm_base: rows2[0].column_itemnm,
          refineperiod_base: rows2[0].refineperiod,
          tkqty_base: rows2[0].tkqty,
          gunqty_base: rows2[0].gunqty,
          genderyn_base: rows2[0].genderyn,
          breedmeth_base: rows2[0].breedmeth,
          cagetype_base: rows2[0].cagetype,
          ref_key_base: rows2[0].ref_key,
          concentrationcnt_base: rows2[0].concentrationcnt,
          assaytype1_base: rows2[0].assaytype1,
          assaytype2_base: rows2[0].assaytype2,
          sampleqty_base: rows2[0].sampleqty,
          slideqty_base: rows2[0].slideqty,
          histopathologyqty_base: rows2[0].histopathologyqty,
        }));
        setInformation_ori((prev) => ({
          ...prev,
          rowstatus_base: "U",
          seq_base: rows2[0].seq,
          injectroute_base: rows2[0].injectroute,
          teststs_base: rows2[0].teststs,
          chlditemcd_base: rows2[0].chlditemcd,
          injectcnt_base: rows2[0].injectcnt,
          injectcycle_base: rows2[0].injectcycle,
          chasu_base: rows2[0].chasu,
          testperiod_base: rows2[0].testperiod,
          experiment_week_base: rows2[0].experiment_week,
          totqty_base: rows2[0].totqty,
          experimentqty_base: rows2[0].experimentqty,
          spareqty_base: rows2[0].spareqty,
          maleqty_base: rows2[0].maleqty,
          femaleqty_base: rows2[0].femaleqty,
          chasuspace_base: rows2[0].chasuspace,
          geomcheqty_base: rows2[0].geomcheqty,
          geomcheprodqty_base: rows2[0].geomcheprodqty,
          totgeomche_base: rows2[0].totgeomche,
          remark_base: rows2[0].remark,
          point_base: rows2[0].point,
          strainqty_base: rows2[0].strainqty,
          affiliationqty_base: rows2[0].affiliationqty,
          capacity_base: rows2[0].capacity,
          plateqty_base: rows2[0].plateqty,
          cellqty_base: rows2[0].cellqty,
          virusqty_base: rows2[0].virusqty,
          prodmac_base: rows2[0].prodmac,
          matterqty_base: rows2[0].matterqty,
          runtime_base: rows2[0].runtime,
          assaytype_base: rows2[0].assaytype,
          column_itemcd_base: rows2[0].column_itemcd,
          column_itemnm_base: rows2[0].column_itemnm,
          refineperiod_base: rows2[0].refineperiod,
          tkqty_base: rows2[0].tkqty,
          gunqty_base: rows2[0].gunqty,
          genderyn_base: rows2[0].genderyn,
          breedmeth_base: rows2[0].breedmeth,
          cagetype_base: rows2[0].cagetype,
          ref_key_base: rows2[0].ref_key,
          concentrationcnt_base: rows2[0].concentrationcnt,
          assaytype1_base: rows2[0].assaytype1,
          assaytype2_base: rows2[0].assaytype2,
          sampleqty_base: rows2[0].sampleqty,
          slideqty_base: rows2[0].slideqty,
          histopathologyqty_base: rows2[0].histopathologyqty,
        }));
      }
      if (totalRowCnt3 > 0) {
        setInformation((prev) => ({
          ...prev,
          rowstatus_ex: rows3[0].yn == "Y" ? "U" : "N",
          seq_ex: rows3[0].seq,
          yn_ex: rows3[0].yn == "Y" ? true : false,
          injectroute_ex: rows3[0].injectroute,
          teststs_ex: rows3[0].teststs,
          injectcnt_ex: rows3[0].injectcnt,
          injectcycle_ex: rows3[0].injectcycle,
          genderyn_ex: rows3[0].genderyn,
          experiment_week_ex: rows3[0].experiment_week,
          totqty_ex: rows3[0].totqty,
          experimentqty_ex: rows3[0].experimentqty,
          spareqty_ex: rows3[0].spareqty,
          maleqty_ex: rows3[0].maleqty,
          femaleqty_ex: rows3[0].femaleqty,
          point_ex: rows3[0].point,
          strainqty_ex: rows3[0].strainqty,
          matterqty_ex: rows3[0].matterqty,
          affiliationqty_ex: rows3[0].affiliationqty,
          capacity_ex: rows3[0].capacity,
          plateqty_ex: rows3[0].plateqty,
          cellqty_ex: rows3[0].cellqty,
          virusqty_ex: rows3[0].virusqty,
          remark_ex: rows3[0].remark,
          refineperiod_ex: rows3[0].refineperiod,
          testperiod_ex: rows3[0].testperiod,
          chasu_ex: rows3[0].chasu,
          gunqty_ex: rows3[0].gunqty,
        }));
        setInformation_ori((prev) => ({
          ...prev,
          rowstatus_ex: rows3[0].yn == "Y" ? "U" : "N",
          seq_ex: rows3[0].seq,
          yn_ex: rows3[0].yn == "Y" ? true : false,
          injectroute_ex: rows3[0].injectroute,
          teststs_ex: rows3[0].teststs,
          injectcnt_ex: rows3[0].injectcnt,
          injectcycle_ex: rows3[0].injectcycle,
          genderyn_ex: rows3[0].genderyn,
          experiment_week_ex: rows3[0].experiment_week,
          totqty_ex: rows3[0].totqty,
          experimentqty_ex: rows3[0].experimentqty,
          spareqty_ex: rows3[0].spareqty,
          maleqty_ex: rows3[0].maleqty,
          femaleqty_ex: rows3[0].femaleqty,
          point_ex: rows3[0].point,
          strainqty_ex: rows3[0].strainqty,
          matterqty_ex: rows3[0].matterqty,
          affiliationqty_ex: rows3[0].affiliationqty,
          capacity_ex: rows3[0].capacity,
          plateqty_ex: rows3[0].plateqty,
          cellqty_ex: rows3[0].cellqty,
          virusqty_ex: rows3[0].virusqty,
          remark_ex: rows3[0].remark,
          refineperiod_ex: rows3[0].refineperiod,
          testperiod_ex: rows3[0].testperiod,
          chasu_ex: rows3[0].chasu,
          gunqty_ex: rows3[0].gunqty,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (bizComponentData !== null && permissions.view) {
      fetchMainGrid();
    }
  }, [bizComponentData, permissions]);

  const [Information, setInformation] = useState({
    orgdiv: "",
    quonum: "",
    quorev: "01",
    quoseq: "01",
    quotestnum: "",
    itemlvl1: "",
    itemcd: "",
    itemnm: "",
    //기본
    rowstatus_base: "N",
    seq_base: 0,
    injectroute_base: "",
    teststs_base: "",
    chlditemcd_base: "",
    injectcnt_base: 0,
    injectcycle_base: 0,
    chasu_base: 0,
    testperiod_base: 0,
    experiment_week_base: 0,
    totqty_base: 0,
    experimentqty_base: 0,
    spareqty_base: 0,
    maleqty_base: 0,
    femaleqty_base: 0,
    chasuspace_base: 0,
    geomcheqty_base: 0,
    geomcheprodqty_base: 0,
    totgeomche_base: 0,
    remark_base: "",
    point_base: 0,
    strainqty_base: 0,
    matterqty_base: 0,
    affiliationqty_base: 0,
    capacity_base: 0,
    plateqty_base: 0,
    cellqty_base: 0,
    virusqty_base: 0,
    prodmac_base: "",
    runtime_base: 0,
    assaytype_base: "",
    column_itemcd_base: "",
    column_itemnm_base: "",
    refineperiod_base: 0,
    tkqty_base: 0,
    gunqty_base: 0,
    genderyn_base: "",
    breedmeth_base: "",
    cagetype_base: "",
    ref_key_base: "",
    concentrationcnt_base: 0,
    assaytype1_base: 0,
    assaytype2_base: 0,
    sampleqty_base: 0,
    slideqty_base: 0,
    histopathologyqty_base: 0,

    //용량설정시험
    rowstatus_ex: "N",
    seq_ex: 0,
    yn_ex: false,
    injectroute_ex: "",
    teststs_ex: "",
    injectcnt_ex: 0,
    injectcycle_ex: 0,
    genderyn_ex: "",
    experiment_week_ex: 0,
    totqty_ex: 0,
    experimentqty_ex: 0,
    spareqty_ex: 0,
    maleqty_ex: 0,
    femaleqty_ex: 0,
    point_ex: 0,
    strainqty_ex: 0,
    matterqty_ex: 0,
    affiliationqty_ex: 0,
    capacity_ex: 0,
    plateqty_ex: 0,
    cellqty_ex: 0,
    virusqty_ex: 0,
    remark_ex: "",
    refineperiod_ex: 0,
    testperiod_ex: 0,
    chasu_ex: 0,
    gunqty_ex: 0,
  });

  const [Information_ori, setInformation_ori] = useState({
    orgdiv: "",
    quonum: "",
    quorev: "01",
    quoseq: "01",
    quotestnum: "",
    itemlvl1: "",
    itemcd: "",
    itemnm: "",
    //기본
    rowstatus_base: "N",
    seq_base: 0,
    injectroute_base: "",
    teststs_base: "",
    chlditemcd_base: "",
    injectcnt_base: 0,
    injectcycle_base: 0,
    chasu_base: 0,
    testperiod_base: 0,
    experiment_week_base: 0,
    totqty_base: 0,
    experimentqty_base: 0,
    spareqty_base: 0,
    maleqty_base: 0,
    femaleqty_base: 0,
    chasuspace_base: 0,
    geomcheqty_base: 0,
    geomcheprodqty_base: 0,
    totgeomche_base: 0,
    remark_base: "",
    point_base: 0,
    strainqty_base: 0,
    matterqty_base: 0,
    affiliationqty_base: 0,
    capacity_base: 0,
    plateqty_base: 0,
    cellqty_base: 0,
    virusqty_base: 0,
    prodmac_base: "",
    runtime_base: 0,
    assaytype_base: "",
    column_itemcd_base: "",
    column_itemnm_base: "",
    refineperiod_base: 0,
    tkqty_base: 0,
    gunqty_base: 0,
    genderyn_base: "",
    breedmeth_base: "",
    cagetype_base: "",
    ref_key_base: "",
    concentrationcnt_base: 0,
    assaytype1_base: 0,
    assaytype2_base: 0,
    sampleqty_base: 0,
    slideqty_base: 0,
    histopathologyqty_base: 0,

    //용량설정시험
    rowstatus_ex: "N",
    seq_ex: 0,
    yn_ex: false,
    injectroute_ex: "",
    teststs_ex: "",
    injectcnt_ex: 0,
    injectcycle_ex: 0,
    genderyn_ex: "",
    experiment_week_ex: 0,
    totqty_ex: 0,
    experimentqty_ex: 0,
    spareqty_ex: 0,
    maleqty_ex: 0,
    femaleqty_ex: 0,
    point_ex: 0,
    strainqty_ex: 0,
    matterqty_ex: 0,
    affiliationqty_ex: 0,
    capacity_ex: 0,
    plateqty_ex: 0,
    cellqty_ex: 0,
    virusqty_ex: 0,
    remark_ex: "",
    refineperiod_ex: 0,
    testperiod_ex: 0,
    chasu_ex: 0,
    gunqty_ex: 0,
  });

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "testperiod_base") {
      setInformation((prev) => ({
        ...prev,
        [name]: Number(value),
        experiment_week_base: Math.ceil(Number(value) / 7),
      }));
    } else if (name == "testperiod_ex") {
      setInformation((prev) => ({
        ...prev,
        [name]: Number(value),
        experiment_week_ex: Math.ceil(Number(value) / 7),
      }));
    } else if (name == "yn_ex") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
        rowstatus_ex:
          value == false
            ? Information_ori.rowstatus_ex == "U"
              ? "D"
              : Information_ori.rowstatus_ex
            : Information_ori.rowstatus_ex == "U"
            ? "U"
            : "N",
        seq_ex: Information_ori.seq_ex,
        point_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.point_ex,
        strainqty_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.strainqty_ex,
        matterqty_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.matterqty_ex,
        affiliationqty_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.affiliationqty_ex,
        capacity_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.capacity_ex,
        plateqty_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.plateqty_ex,
        cellqty_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.cellqty_ex,
        gunqty_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.gunqty_ex,
        testperiod_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.testperiod_ex,
        experiment_week_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.experiment_week_ex,
        remark_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? ""
            : Information_ori.remark_ex,
      }));
    } else {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const onSave = async () => {
    if (!permissions.save) return;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      seq_s: [],
      itemcd_s: [],
      injectcnt_s: [],
      injectcycle_s: [],
      maleqty_s: [],
      femaleqty_s: [],
      totqty_s: [],
      sampleqty_s: [],
      urineqty_s: [],
      tkqty_s: [],
      experimentqty_s: [],
      autopsyqty_s: [],
      spareqty_s: [],
      recoverqty_s: [],
      cageqty_s: [],
      rackqty_s: [],
      infusionqty_s: [],
      infusiontime_s: [],
      point_s: [],
      capacity_s: [],
      geomcheqty_s: [],
      geomcheprodqty_s: [],
      infusioncount_s: [],
      testcnt_s: [],
      strainqty_s: [],
      matterqty_s: [],
      affiliationqty_s: [],
      plateqty_s: [],
      cellqty_s: [],
      virusqty_s: [],
      runtime_s: [],
      gunqty_s: [],
      concentrationcnt_s: [],
      one_week_s: [],
      two_week_s: [],
      one_twoweek_s: [],
      guaranteeperiod_s: [],
      testperiod_s: [],
      refineperiod_s: [],
      autopsyperiod_s: [],
      recoverweek_s: [],
      recoverday_s: [],
      genderyn_s: [],
      breedmeth_s: [],
      cagetype_s: [],
      prodmac_s: [],
      assaytype_s: [],
      assaytype1_s: [],
      assaytype2_s: [],
      slideqty_s: [],
      histopathologyqty_s: [],

      chlditemcd_s: [],
      column_itemcd_s: [],
      column_itemnm_s: [],
      gubun_s: [],
      remark_s: [],
      qty_s: [],
      optioncd_s: [],
      bonyn_s: [],
      pointqty_s: [],
      chasu_s: [],
      chasuspace_s: [],
      amt_s: [],
      ref_key_s: [],

      rowstatus_gun: [],
      group_seq_gun: [],
      remark3_gun: [],
      animalqty_gun: [],
      femaleqty_gun: [],
      maleqty_gun: [],
      remark_gun: [],
      injectwgt_gun: [],

      rowstatus_item: [],
      reqnum_item: [],
      reqrev_item: [],
      reqseq_item: [],
      qty_item: [],
      experimentqty_item: [],
      spareqty_item: [],
      pgmdiv_item: [],
      remark_item: [],
      inreqdt_item: [],
    };

    //기본
    dataArr.rowstatus_s.push(Information.rowstatus_base);
    dataArr.seq_s.push(Information.seq_base.toString());
    dataArr.itemcd_s.push(Information.itemcd);
    dataArr.injectcnt_s.push(Information.injectcnt_base.toString());
    dataArr.injectcycle_s.push(Information.injectcycle_base.toString());
    dataArr.maleqty_s.push(Information.maleqty_base.toString());
    dataArr.femaleqty_s.push(Information.femaleqty_base.toString());
    dataArr.totqty_s.push(Information.totqty_base.toString());
    dataArr.sampleqty_s.push(Information.sampleqty_base.toString());
    dataArr.urineqty_s.push("0");
    dataArr.tkqty_s.push(Information.tkqty_base.toString());
    dataArr.experimentqty_s.push(Information.experimentqty_base.toString());
    dataArr.autopsyqty_s.push("0");
    dataArr.spareqty_s.push(Information.spareqty_base.toString());
    dataArr.recoverqty_s.push("0");
    dataArr.cageqty_s.push("0");
    dataArr.rackqty_s.push("0");
    dataArr.infusionqty_s.push("0");
    dataArr.infusiontime_s.push("0");
    dataArr.point_s.push(Information.point_base.toString());
    dataArr.capacity_s.push(Information.capacity_base.toString());
    dataArr.geomcheqty_s.push(Information.geomcheqty_base.toString());
    dataArr.geomcheprodqty_s.push(Information.geomcheprodqty_base.toString());
    dataArr.infusioncount_s.push("0");
    dataArr.testcnt_s.push("0");
    dataArr.strainqty_s.push(Information.strainqty_base.toString());
    dataArr.matterqty_s.push(Information.matterqty_base.toString());
    dataArr.affiliationqty_s.push(Information.affiliationqty_base.toString());
    dataArr.plateqty_s.push(Information.plateqty_base.toString());
    dataArr.cellqty_s.push(Information.cellqty_base.toString());
    dataArr.virusqty_s.push(Information.virusqty_base.toString());
    dataArr.runtime_s.push(Information.runtime_base.toString());
    dataArr.gunqty_s.push(Information.gunqty_base.toString());
    dataArr.concentrationcnt_s.push(
      Information.concentrationcnt_base.toString()
    );
    dataArr.one_week_s.push("0");
    dataArr.two_week_s.push("0");
    dataArr.one_twoweek_s.push("0");
    dataArr.guaranteeperiod_s.push("0");
    dataArr.testperiod_s.push(Information.testperiod_base.toString());
    dataArr.refineperiod_s.push(Information.refineperiod_base.toString());
    dataArr.autopsyperiod_s.push("0");
    dataArr.recoverweek_s.push("0");
    dataArr.recoverday_s.push("0");
    dataArr.genderyn_s.push(Information.genderyn_base);
    dataArr.breedmeth_s.push(Information.breedmeth_base);
    dataArr.cagetype_s.push(Information.cagetype_base);
    dataArr.prodmac_s.push(Information.prodmac_base);
    dataArr.assaytype_s.push(Information.assaytype_base);
    dataArr.assaytype1_s.push(Information.assaytype1_base.toString());
    dataArr.assaytype2_s.push(Information.assaytype2_base.toString());
    dataArr.slideqty_s.push(Information.slideqty_base.toString());
    dataArr.histopathologyqty_s.push(
      Information.histopathologyqty_base.toString()
    );

    dataArr.chlditemcd_s.push(Information.chlditemcd_base);
    dataArr.column_itemcd_s.push(Information.column_itemcd_base);
    dataArr.column_itemnm_s.push(Information.column_itemnm_base);
    dataArr.gubun_s.push("B");
    dataArr.remark_s.push(Information.remark_base);
    dataArr.qty_s.push("0");
    dataArr.optioncd_s.push("");
    dataArr.bonyn_s.push("");
    dataArr.pointqty_s.push("0");
    dataArr.chasu_s.push(Information.chasu_base.toString());
    dataArr.chasuspace_s.push(Information.chasuspace_base.toString());
    dataArr.amt_s.push("0");
    dataArr.ref_key_s.push(Information.ref_key_base);

    dataArr.rowstatus_item.push("");
    dataArr.reqnum_item.push("");
    dataArr.reqrev_item.push("0");
    dataArr.reqseq_item.push("0");
    dataArr.qty_item.push("0");
    dataArr.experimentqty_item.push("0");
    dataArr.spareqty_item.push("0");
    dataArr.pgmdiv_item.push("");
    dataArr.remark_item.push("");
    dataArr.inreqdt_item.push("");

    dataArr.rowstatus_gun.push("");
    dataArr.group_seq_gun.push("0");
    dataArr.remark3_gun.push("");
    dataArr.animalqty_gun.push("0");
    dataArr.femaleqty_gun.push("0");
    dataArr.maleqty_gun.push("0");
    dataArr.remark_gun.push("");
    dataArr.injectwgt_gun.push("");

    //용량시험설정
    dataArr.rowstatus_s.push(
      Information.yn_ex == false && Information.rowstatus_ex == "N"
        ? ""
        : Information.rowstatus_ex
    );
    dataArr.seq_s.push(
      Information.rowstatus_ex == "D" ? "" : Information.seq_ex.toString()
    );
    dataArr.itemcd_s.push(Information.itemcd);
    dataArr.injectcnt_s.push(Information.injectcnt_ex.toString());
    dataArr.injectcycle_s.push(Information.injectcycle_ex.toString());
    dataArr.maleqty_s.push(Information.maleqty_ex.toString());
    dataArr.femaleqty_s.push(Information.femaleqty_ex.toString());
    dataArr.totqty_s.push(Information.totqty_ex.toString());
    dataArr.sampleqty_s.push("0");
    dataArr.urineqty_s.push("0");
    dataArr.tkqty_s.push("0");
    dataArr.experimentqty_s.push(Information.experimentqty_ex.toString());
    dataArr.autopsyqty_s.push("0");
    dataArr.spareqty_s.push(Information.spareqty_ex.toString());
    dataArr.recoverqty_s.push("0");
    dataArr.cageqty_s.push("0");
    dataArr.rackqty_s.push("0");
    dataArr.infusionqty_s.push("0");
    dataArr.infusiontime_s.push("0");
    dataArr.point_s.push(Information.point_ex.toString());
    dataArr.capacity_s.push(Information.capacity_ex.toString());
    dataArr.geomcheqty_s.push("0");
    dataArr.geomcheprodqty_s.push("0");
    dataArr.infusioncount_s.push("0");
    dataArr.testcnt_s.push("0");
    dataArr.strainqty_s.push(Information.strainqty_ex.toString());
    dataArr.matterqty_s.push(Information.matterqty_ex.toString());
    dataArr.affiliationqty_s.push(Information.affiliationqty_ex.toString());
    dataArr.plateqty_s.push(Information.plateqty_ex.toString());
    dataArr.cellqty_s.push(Information.cellqty_ex.toString());
    dataArr.virusqty_s.push(Information.virusqty_ex.toString());
    dataArr.runtime_s.push("0");
    dataArr.gunqty_s.push(Information.gunqty_ex.toString());
    dataArr.concentrationcnt_s.push("0");
    dataArr.one_week_s.push("0");
    dataArr.two_week_s.push("0");
    dataArr.one_twoweek_s.push("0");
    dataArr.guaranteeperiod_s.push("0");
    dataArr.testperiod_s.push(Information.testperiod_ex.toString());
    dataArr.refineperiod_s.push(Information.refineperiod_ex.toString());
    dataArr.autopsyperiod_s.push("0");
    dataArr.recoverweek_s.push("0");
    dataArr.recoverday_s.push("0");
    dataArr.genderyn_s.push(Information.genderyn_ex.toString());
    dataArr.breedmeth_s.push("");
    dataArr.cagetype_s.push("");
    dataArr.prodmac_s.push("");
    dataArr.assaytype_s.push("");
    dataArr.assaytype1_s.push("0");
    dataArr.assaytype2_s.push("0");
    dataArr.slideqty_s.push("0");
    dataArr.histopathologyqty_s.push("0");

    dataArr.chlditemcd_s.push("");
    dataArr.column_itemcd_s.push("");
    dataArr.column_itemnm_s.push("");
    dataArr.gubun_s.push("W");
    dataArr.remark_s.push(Information.remark_ex.toString());
    dataArr.qty_s.push("0");
    dataArr.optioncd_s.push("");
    dataArr.bonyn_s.push("");
    dataArr.pointqty_s.push("0");
    dataArr.chasu_s.push(Information.chasu_ex.toString());
    dataArr.chasuspace_s.push("0");
    dataArr.amt_s.push("0");
    dataArr.ref_key_s.push("");

    dataArr.rowstatus_item.push("");
    dataArr.reqnum_item.push("");
    dataArr.reqrev_item.push("0");
    dataArr.reqseq_item.push("0");
    dataArr.qty_item.push("0");
    dataArr.experimentqty_item.push("0");
    dataArr.spareqty_item.push("0");
    dataArr.pgmdiv_item.push("");
    dataArr.remark_item.push("");
    dataArr.inreqdt_item.push("");

    dataArr.rowstatus_gun.push("");
    dataArr.group_seq_gun.push("0");
    dataArr.remark3_gun.push("");
    dataArr.animalqty_gun.push("0");
    dataArr.femaleqty_gun.push("0");
    dataArr.maleqty_gun.push("0");
    dataArr.remark_gun.push("");
    dataArr.injectwgt_gun.push("");

    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    let valid = true;
    dataItem.map((item) => {
      if (item.itemcd == "") {
        valid = false;
      }
    });

    if (valid != true) {
      alert("필수값을 채워주세요");
      return false;
    }

    dataItem.forEach((item: any) => {
      const {
        rowstatus,
        reqnum,
        reqrev,
        reqseq,
        qty,
        experimentqty,
        spareqty,
        pgmdiv,
        remark,
        inreqdt,
        itemcd,
      } = item;

      dataArr.rowstatus_s.push("");
      dataArr.seq_s.push("0");
      dataArr.itemcd_s.push("");
      dataArr.injectcnt_s.push("0");
      dataArr.injectcycle_s.push("0");
      dataArr.maleqty_s.push("0");
      dataArr.femaleqty_s.push("0");
      dataArr.totqty_s.push("0");
      dataArr.sampleqty_s.push("0");
      dataArr.urineqty_s.push("0");
      dataArr.tkqty_s.push("0");
      dataArr.experimentqty_s.push("0");
      dataArr.autopsyqty_s.push("0");
      dataArr.spareqty_s.push("0");
      dataArr.recoverqty_s.push("0");
      dataArr.cageqty_s.push("0");
      dataArr.rackqty_s.push("0");
      dataArr.infusionqty_s.push("0");
      dataArr.infusiontime_s.push("0");
      dataArr.point_s.push("0");
      dataArr.capacity_s.push("0");
      dataArr.geomcheqty_s.push("0");
      dataArr.geomcheprodqty_s.push("0");
      dataArr.infusioncount_s.push("0");
      dataArr.testcnt_s.push("0");
      dataArr.strainqty_s.push("0");
      dataArr.matterqty_s.push("0");
      dataArr.affiliationqty_s.push("0");
      dataArr.plateqty_s.push("0");
      dataArr.cellqty_s.push("0");
      dataArr.virusqty_s.push("0");
      dataArr.runtime_s.push("0");
      dataArr.gunqty_s.push("0");
      dataArr.concentrationcnt_s.push("0");
      dataArr.one_week_s.push("0");
      dataArr.two_week_s.push("0");
      dataArr.one_twoweek_s.push("0");
      dataArr.guaranteeperiod_s.push("0");
      dataArr.testperiod_s.push("0");
      dataArr.refineperiod_s.push("0");
      dataArr.autopsyperiod_s.push("0");
      dataArr.recoverweek_s.push("0");
      dataArr.recoverday_s.push("0");
      dataArr.genderyn_s.push("");
      dataArr.breedmeth_s.push("");
      dataArr.cagetype_s.push("");
      dataArr.prodmac_s.push("");
      dataArr.assaytype_s.push("");
      dataArr.assaytype1_s.push("0");
      dataArr.assaytype2_s.push("0");
      dataArr.slideqty_s.push("0");
      dataArr.histopathologyqty_s.push("0");

      dataArr.chlditemcd_s.push(itemcd);
      dataArr.column_itemcd_s.push("");
      dataArr.column_itemnm_s.push("");
      dataArr.gubun_s.push("T");
      dataArr.remark_s.push("");
      dataArr.qty_s.push("0");
      dataArr.optioncd_s.push("");
      dataArr.bonyn_s.push("");
      dataArr.pointqty_s.push("0");
      dataArr.chasu_s.push("0");
      dataArr.chasuspace_s.push("0");
      dataArr.amt_s.push("0");
      dataArr.ref_key_s.push("");

      dataArr.rowstatus_item.push(rowstatus);
      dataArr.reqnum_item.push(reqnum);
      dataArr.reqrev_item.push(reqrev);
      dataArr.reqseq_item.push(reqseq);
      dataArr.qty_item.push(qty);
      dataArr.experimentqty_item.push(experimentqty);
      dataArr.spareqty_item.push(spareqty);
      dataArr.pgmdiv_item.push(pgmdiv);
      dataArr.remark_item.push(remark);
      dataArr.inreqdt_item.push(
        inreqdt == "99991231" || inreqdt == undefined ? "" : inreqdt
      );

      dataArr.rowstatus_gun.push("");
      dataArr.group_seq_gun.push("0");
      dataArr.remark3_gun.push("");
      dataArr.animalqty_gun.push("0");
      dataArr.femaleqty_gun.push("0");
      dataArr.maleqty_gun.push("0");
      dataArr.remark_gun.push("");
      dataArr.injectwgt_gun.push("");
    });

    deletedRows.forEach((item: any) => {
      const {
        rowstatus,
        reqnum,
        reqrev,
        reqseq,
        qty,
        experimentqty,
        spareqty,
        pgmdiv,
        remark,
        inreqdt,
        itemcd,
      } = item;

      dataArr.rowstatus_s.push("");
      dataArr.seq_s.push("0");
      dataArr.itemcd_s.push("");
      dataArr.injectcnt_s.push("0");
      dataArr.injectcycle_s.push("0");
      dataArr.maleqty_s.push("0");
      dataArr.femaleqty_s.push("0");
      dataArr.totqty_s.push("0");
      dataArr.sampleqty_s.push("0");
      dataArr.urineqty_s.push("0");
      dataArr.tkqty_s.push("0");
      dataArr.experimentqty_s.push("0");
      dataArr.autopsyqty_s.push("0");
      dataArr.spareqty_s.push("0");
      dataArr.recoverqty_s.push("0");
      dataArr.cageqty_s.push("0");
      dataArr.rackqty_s.push("0");
      dataArr.infusionqty_s.push("0");
      dataArr.infusiontime_s.push("0");
      dataArr.point_s.push("0");
      dataArr.capacity_s.push("0");
      dataArr.geomcheqty_s.push("0");
      dataArr.geomcheprodqty_s.push("0");
      dataArr.infusioncount_s.push("0");
      dataArr.testcnt_s.push("0");
      dataArr.strainqty_s.push("0");
      dataArr.matterqty_s.push("0");
      dataArr.affiliationqty_s.push("0");
      dataArr.plateqty_s.push("0");
      dataArr.cellqty_s.push("0");
      dataArr.virusqty_s.push("0");
      dataArr.runtime_s.push("0");
      dataArr.gunqty_s.push("0");
      dataArr.concentrationcnt_s.push("0");
      dataArr.one_week_s.push("0");
      dataArr.two_week_s.push("0");
      dataArr.one_twoweek_s.push("0");
      dataArr.guaranteeperiod_s.push("0");
      dataArr.testperiod_s.push("0");
      dataArr.refineperiod_s.push("0");
      dataArr.autopsyperiod_s.push("0");
      dataArr.recoverweek_s.push("0");
      dataArr.recoverday_s.push("0");
      dataArr.genderyn_s.push("");
      dataArr.breedmeth_s.push("");
      dataArr.cagetype_s.push("");
      dataArr.prodmac_s.push("");
      dataArr.assaytype_s.push("");
      dataArr.assaytype1_s.push("0");
      dataArr.assaytype2_s.push("0");
      dataArr.slideqty_s.push("0");
      dataArr.histopathologyqty_s.push("0");

      dataArr.chlditemcd_s.push(itemcd);
      dataArr.column_itemcd_s.push("");
      dataArr.column_itemnm_s.push("");
      dataArr.gubun_s.push("T");
      dataArr.remark_s.push("");
      dataArr.qty_s.push("0");
      dataArr.optioncd_s.push("");
      dataArr.bonyn_s.push("");
      dataArr.pointqty_s.push("0");
      dataArr.chasu_s.push("0");
      dataArr.chasuspace_s.push("0");
      dataArr.amt_s.push("0");
      dataArr.ref_key_s.push("");

      dataArr.rowstatus_item.push(rowstatus);
      dataArr.reqnum_item.push(reqnum);
      dataArr.reqrev_item.push(reqrev);
      dataArr.reqseq_item.push(reqseq);
      dataArr.qty_item.push(qty);
      dataArr.experimentqty_item.push(experimentqty);
      dataArr.spareqty_item.push(spareqty);
      dataArr.pgmdiv_item.push(pgmdiv);
      dataArr.remark_item.push(remark);
      dataArr.inreqdt_item.push(
        inreqdt == "99991231" || inreqdt == undefined ? "" : inreqdt
      );

      dataArr.rowstatus_gun.push("");
      dataArr.group_seq_gun.push("0");
      dataArr.remark3_gun.push("");
      dataArr.animalqty_gun.push("0");
      dataArr.femaleqty_gun.push("0");
      dataArr.maleqty_gun.push("0");
      dataArr.remark_gun.push("");
      dataArr.injectwgt_gun.push("");
    });

    const dataItem2 = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    dataItem2.forEach((item: any) => {
      const {
        rowstatus,
        group_seq,
        remark3,
        animalqty,
        femaleqty,
        maleqty,
        remark,
        injectwgt,
      } = item;

      dataArr.rowstatus_s.push("");
      dataArr.seq_s.push("0");
      dataArr.itemcd_s.push("");
      dataArr.injectcnt_s.push("0");
      dataArr.injectcycle_s.push("0");
      dataArr.maleqty_s.push("0");
      dataArr.femaleqty_s.push("0");
      dataArr.totqty_s.push("0");
      dataArr.sampleqty_s.push("0");
      dataArr.urineqty_s.push("0");
      dataArr.tkqty_s.push("0");
      dataArr.experimentqty_s.push("0");
      dataArr.autopsyqty_s.push("0");
      dataArr.spareqty_s.push("0");
      dataArr.recoverqty_s.push("0");
      dataArr.cageqty_s.push("0");
      dataArr.rackqty_s.push("0");
      dataArr.infusionqty_s.push("0");
      dataArr.infusiontime_s.push("0");
      dataArr.point_s.push("0");
      dataArr.capacity_s.push("0");
      dataArr.geomcheqty_s.push("0");
      dataArr.geomcheprodqty_s.push("0");
      dataArr.infusioncount_s.push("0");
      dataArr.testcnt_s.push("0");
      dataArr.strainqty_s.push("0");
      dataArr.matterqty_s.push("0");
      dataArr.affiliationqty_s.push("0");
      dataArr.plateqty_s.push("0");
      dataArr.cellqty_s.push("0");
      dataArr.virusqty_s.push("0");
      dataArr.runtime_s.push("0");
      dataArr.gunqty_s.push("0");
      dataArr.concentrationcnt_s.push("0");
      dataArr.one_week_s.push("0");
      dataArr.two_week_s.push("0");
      dataArr.one_twoweek_s.push("0");
      dataArr.guaranteeperiod_s.push("0");
      dataArr.testperiod_s.push("0");
      dataArr.refineperiod_s.push("0");
      dataArr.autopsyperiod_s.push("0");
      dataArr.recoverweek_s.push("0");
      dataArr.recoverday_s.push("0");
      dataArr.genderyn_s.push("");
      dataArr.breedmeth_s.push("");
      dataArr.cagetype_s.push("");
      dataArr.prodmac_s.push("");
      dataArr.assaytype_s.push("");
      dataArr.assaytype1_s.push("0");
      dataArr.assaytype2_s.push("0");
      dataArr.slideqty_s.push("0");
      dataArr.histopathologyqty_s.push("0");

      dataArr.chlditemcd_s.push("");
      dataArr.column_itemcd_s.push("");
      dataArr.column_itemnm_s.push("");
      dataArr.gubun_s.push("T");
      dataArr.remark_s.push("");
      dataArr.qty_s.push("0");
      dataArr.optioncd_s.push("");
      dataArr.bonyn_s.push("");
      dataArr.pointqty_s.push("0");
      dataArr.chasu_s.push("0");
      dataArr.chasuspace_s.push("0");
      dataArr.amt_s.push("0");
      dataArr.ref_key_s.push("");

      dataArr.rowstatus_item.push("");
      dataArr.reqnum_item.push("");
      dataArr.reqrev_item.push("0");
      dataArr.reqseq_item.push("0");
      dataArr.qty_item.push("0");
      dataArr.experimentqty_item.push("0");
      dataArr.spareqty_item.push("0");
      dataArr.pgmdiv_item.push("");
      dataArr.remark_item.push("");
      dataArr.inreqdt_item.push("");

      dataArr.rowstatus_gun.push(rowstatus);
      dataArr.group_seq_gun.push(group_seq);
      dataArr.remark3_gun.push(remark3);
      dataArr.animalqty_gun.push(animalqty);
      dataArr.femaleqty_gun.push(femaleqty);
      dataArr.maleqty_gun.push(maleqty);
      dataArr.remark_gun.push(remark);
      dataArr.injectwgt_gun.push(injectwgt);
    });

    deletedRows2.forEach((item: any) => {
      const {
        rowstatus,
        group_seq,
        remark3,
        animalqty,
        femaleqty,
        maleqty,
        remark,
        injectwgt,
      } = item;

      dataArr.rowstatus_s.push("");
      dataArr.seq_s.push("0");
      dataArr.itemcd_s.push("");
      dataArr.injectcnt_s.push("0");
      dataArr.injectcycle_s.push("0");
      dataArr.maleqty_s.push("0");
      dataArr.femaleqty_s.push("0");
      dataArr.totqty_s.push("0");
      dataArr.sampleqty_s.push("0");
      dataArr.urineqty_s.push("0");
      dataArr.tkqty_s.push("0");
      dataArr.experimentqty_s.push("0");
      dataArr.autopsyqty_s.push("0");
      dataArr.spareqty_s.push("0");
      dataArr.recoverqty_s.push("0");
      dataArr.cageqty_s.push("0");
      dataArr.rackqty_s.push("0");
      dataArr.infusionqty_s.push("0");
      dataArr.infusiontime_s.push("0");
      dataArr.point_s.push("0");
      dataArr.capacity_s.push("0");
      dataArr.geomcheqty_s.push("0");
      dataArr.geomcheprodqty_s.push("0");
      dataArr.infusioncount_s.push("0");
      dataArr.testcnt_s.push("0");
      dataArr.strainqty_s.push("0");
      dataArr.matterqty_s.push("0");
      dataArr.affiliationqty_s.push("0");
      dataArr.plateqty_s.push("0");
      dataArr.cellqty_s.push("0");
      dataArr.virusqty_s.push("0");
      dataArr.runtime_s.push("0");
      dataArr.gunqty_s.push("0");
      dataArr.concentrationcnt_s.push("0");
      dataArr.one_week_s.push("0");
      dataArr.two_week_s.push("0");
      dataArr.one_twoweek_s.push("0");
      dataArr.guaranteeperiod_s.push("0");
      dataArr.testperiod_s.push("0");
      dataArr.refineperiod_s.push("0");
      dataArr.autopsyperiod_s.push("0");
      dataArr.recoverweek_s.push("0");
      dataArr.recoverday_s.push("0");
      dataArr.genderyn_s.push("");
      dataArr.breedmeth_s.push("");
      dataArr.cagetype_s.push("");
      dataArr.prodmac_s.push("");
      dataArr.assaytype_s.push("");
      dataArr.assaytype1_s.push("0");
      dataArr.assaytype2_s.push("0");
      dataArr.slideqty_s.push("0");
      dataArr.histopathologyqty_s.push("0");

      dataArr.chlditemcd_s.push("");
      dataArr.column_itemcd_s.push("");
      dataArr.column_itemnm_s.push("");
      dataArr.gubun_s.push("T");
      dataArr.remark_s.push("");
      dataArr.qty_s.push("0");
      dataArr.optioncd_s.push("");
      dataArr.bonyn_s.push("");
      dataArr.pointqty_s.push("0");
      dataArr.chasu_s.push("0");
      dataArr.chasuspace_s.push("0");
      dataArr.amt_s.push("0");
      dataArr.ref_key_s.push("");

      dataArr.rowstatus_item.push("");
      dataArr.reqnum_item.push("");
      dataArr.reqrev_item.push("0");
      dataArr.reqseq_item.push("0");
      dataArr.qty_item.push("0");
      dataArr.experimentqty_item.push("0");
      dataArr.spareqty_item.push("0");
      dataArr.pgmdiv_item.push("");
      dataArr.remark_item.push("");
      dataArr.inreqdt_item.push("");

      dataArr.rowstatus_gun.push(rowstatus);
      dataArr.group_seq_gun.push(group_seq);
      dataArr.remark3_gun.push(remark3);
      dataArr.animalqty_gun.push(animalqty);
      dataArr.femaleqty_gun.push(femaleqty);
      dataArr.maleqty_gun.push(maleqty);
      dataArr.remark_gun.push(remark);
      dataArr.injectwgt_gun.push(injectwgt);
    });

    const dataItem3 = mainDataResult3.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    dataItem3.forEach((item: any) => {
      const {
        affiliationqty,
        amt,
        animalkind,
        assaytype,
        assaytype1,
        assaytype2,
        slideqty,
        histopathologyqty,
        autopsyperiod,
        autopsyqty,
        bonqty,
        bonyn,
        breedmeth,
        cageqty,
        cagetype,
        capacity,
        cellqty,
        chasu,
        chasuspace,
        chlditemcd,
        column_itemcd,
        column_itemnm,
        concentrationcnt,
        experimentqty,
        femaleqty,
        genderyn,
        geomcheprodqty,
        geomcheqty,
        guaranteeperiod,
        gubun,
        gunqty,
        infusioncount,
        infusionqty,
        infusiontime,
        injectcnt,
        injectcycle,
        itemcd,
        maleqty,
        matterqty,
        one_twoweek,
        one_week,
        optioncd,
        orgdiv: sessionOrgdiv,
        plateqty,
        point,
        pointqty,
        prodmac,
        qty,
        rackqty,
        recoverday,
        recoverqty,
        recoverweek,
        ref_key,
        refineperiod,
        remark,
        runtime,
        sampleqty,
        seq,
        spareqty,
        strainqty,
        table_id,
        table_key,
        testcnt,
        testperiod,
        teststs,
        tkqty,
        totqty,
        two_week,
        urineqty,
        virusqty,
        rowstatus,
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.itemcd_s.push(itemcd);
      dataArr.injectcnt_s.push(injectcnt);
      dataArr.injectcycle_s.push(injectcycle);
      dataArr.maleqty_s.push(maleqty);
      dataArr.femaleqty_s.push(femaleqty);
      dataArr.totqty_s.push(totqty);
      dataArr.sampleqty_s.push(sampleqty);
      dataArr.urineqty_s.push(urineqty);
      dataArr.tkqty_s.push(tkqty);
      dataArr.experimentqty_s.push(experimentqty);
      dataArr.autopsyqty_s.push(autopsyqty);
      dataArr.spareqty_s.push(spareqty);
      dataArr.recoverqty_s.push(recoverqty);
      dataArr.cageqty_s.push(cageqty);
      dataArr.rackqty_s.push(rackqty);
      dataArr.infusionqty_s.push(infusionqty);
      dataArr.infusiontime_s.push(infusiontime);
      dataArr.point_s.push(point);
      dataArr.capacity_s.push(capacity);
      dataArr.geomcheqty_s.push(geomcheqty);
      dataArr.geomcheprodqty_s.push(geomcheprodqty);
      dataArr.infusioncount_s.push(infusioncount);
      dataArr.testcnt_s.push(testcnt);
      dataArr.strainqty_s.push(strainqty);
      dataArr.matterqty_s.push(matterqty);
      dataArr.affiliationqty_s.push(affiliationqty);
      dataArr.plateqty_s.push(plateqty);
      dataArr.cellqty_s.push(cellqty);
      dataArr.virusqty_s.push(virusqty);
      dataArr.runtime_s.push(runtime);
      dataArr.gunqty_s.push(gunqty);
      dataArr.concentrationcnt_s.push(concentrationcnt);
      dataArr.one_week_s.push(one_week);
      dataArr.two_week_s.push(two_week);
      dataArr.one_twoweek_s.push(one_twoweek);
      dataArr.guaranteeperiod_s.push(guaranteeperiod);
      dataArr.testperiod_s.push(testperiod);
      dataArr.refineperiod_s.push(refineperiod);
      dataArr.autopsyperiod_s.push(autopsyperiod);
      dataArr.recoverweek_s.push(recoverweek);
      dataArr.recoverday_s.push(recoverday);
      dataArr.genderyn_s.push(genderyn);
      dataArr.breedmeth_s.push(breedmeth);
      dataArr.cagetype_s.push(cagetype);
      dataArr.prodmac_s.push(prodmac);
      dataArr.assaytype_s.push(assaytype);
      dataArr.assaytype1_s.push(assaytype1);
      dataArr.assaytype2_s.push(assaytype2);
      dataArr.slideqty_s.push(slideqty);
      dataArr.histopathologyqty_s.push(histopathologyqty);

      dataArr.chlditemcd_s.push(chlditemcd);
      dataArr.column_itemcd_s.push(column_itemcd);
      dataArr.column_itemnm_s.push(column_itemnm);
      dataArr.gubun_s.push(gubun);
      dataArr.remark_s.push(remark);
      dataArr.qty_s.push(qty);
      dataArr.optioncd_s.push(optioncd);
      dataArr.bonyn_s.push(bonyn);
      dataArr.pointqty_s.push(pointqty);
      dataArr.chasu_s.push(chasu);
      dataArr.chasuspace_s.push(chasuspace);
      dataArr.amt_s.push(amt);
      dataArr.ref_key_s.push(ref_key);

      dataArr.rowstatus_item.push("");
      dataArr.reqnum_item.push("");
      dataArr.reqrev_item.push("0");
      dataArr.reqseq_item.push("0");
      dataArr.qty_item.push("0");
      dataArr.experimentqty_item.push("0");
      dataArr.spareqty_item.push("0");
      dataArr.pgmdiv_item.push("");
      dataArr.remark_item.push("");
      dataArr.inreqdt_item.push("");

      dataArr.rowstatus_gun.push("");
      dataArr.group_seq_gun.push("0");
      dataArr.remark3_gun.push("");
      dataArr.animalqty_gun.push("0");
      dataArr.femaleqty_gun.push("0");
      dataArr.maleqty_gun.push("0");
      dataArr.remark_gun.push("");
      dataArr.injectwgt_gun.push("");
    });

    deletedRows3.forEach((item: any) => {
      const {
        affiliationqty,
        amt,
        animalkind,
        assaytype,
        assaytype1,
        assaytype2,
        slideqty,
        histopathologyqty,
        autopsyperiod,
        autopsyqty,
        bonqty,
        bonyn,
        breedmeth,
        cageqty,
        cagetype,
        capacity,
        cellqty,
        chasu,
        chasuspace,
        chlditemcd,
        column_itemcd,
        column_itemnm,
        concentrationcnt,
        experimentqty,
        femaleqty,
        genderyn,
        geomcheprodqty,
        geomcheqty,
        guaranteeperiod,
        gubun,
        gunqty,
        infusioncount,
        infusionqty,
        infusiontime,
        injectcnt,
        injectcycle,
        itemcd,
        maleqty,
        matterqty,
        one_twoweek,
        one_week,
        optioncd,
        orgdiv: sessionOrgdiv,
        plateqty,
        point,
        pointqty,
        prodmac,
        qty,
        rackqty,
        recoverday,
        recoverqty,
        recoverweek,
        ref_key,
        refineperiod,
        remark,
        runtime,
        sampleqty,
        seq,
        spareqty,
        strainqty,
        table_id,
        table_key,
        testcnt,
        testperiod,
        teststs,
        tkqty,
        totqty,
        two_week,
        urineqty,
        virusqty,
        rowstatus,
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.itemcd_s.push(itemcd);
      dataArr.injectcnt_s.push(injectcnt);
      dataArr.injectcycle_s.push(injectcycle);
      dataArr.maleqty_s.push(maleqty);
      dataArr.femaleqty_s.push(femaleqty);
      dataArr.totqty_s.push(totqty);
      dataArr.sampleqty_s.push(sampleqty);
      dataArr.urineqty_s.push(urineqty);
      dataArr.tkqty_s.push(tkqty);
      dataArr.experimentqty_s.push(experimentqty);
      dataArr.autopsyqty_s.push(autopsyqty);
      dataArr.spareqty_s.push(spareqty);
      dataArr.recoverqty_s.push(recoverqty);
      dataArr.cageqty_s.push(cageqty);
      dataArr.rackqty_s.push(rackqty);
      dataArr.infusionqty_s.push(infusionqty);
      dataArr.infusiontime_s.push(infusiontime);
      dataArr.point_s.push(point);
      dataArr.capacity_s.push(capacity);
      dataArr.geomcheqty_s.push(geomcheqty);
      dataArr.geomcheprodqty_s.push(geomcheprodqty);
      dataArr.infusioncount_s.push(infusioncount);
      dataArr.testcnt_s.push(testcnt);
      dataArr.strainqty_s.push(strainqty);
      dataArr.matterqty_s.push(matterqty);
      dataArr.affiliationqty_s.push(affiliationqty);
      dataArr.plateqty_s.push(plateqty);
      dataArr.cellqty_s.push(cellqty);
      dataArr.virusqty_s.push(virusqty);
      dataArr.runtime_s.push(runtime);
      dataArr.gunqty_s.push(gunqty);
      dataArr.concentrationcnt_s.push(concentrationcnt);
      dataArr.one_week_s.push(one_week);
      dataArr.two_week_s.push(two_week);
      dataArr.one_twoweek_s.push(one_twoweek);
      dataArr.guaranteeperiod_s.push(guaranteeperiod);
      dataArr.testperiod_s.push(testperiod);
      dataArr.refineperiod_s.push(refineperiod);
      dataArr.autopsyperiod_s.push(autopsyperiod);
      dataArr.recoverweek_s.push(recoverweek);
      dataArr.recoverday_s.push(recoverday);
      dataArr.genderyn_s.push(genderyn);
      dataArr.breedmeth_s.push(breedmeth);
      dataArr.cagetype_s.push(cagetype);
      dataArr.prodmac_s.push(prodmac);
      dataArr.assaytype_s.push(assaytype);
      dataArr.assaytype1_s.push(assaytype1);
      dataArr.assaytype2_s.push(assaytype2);
      dataArr.slideqty_s.push(slideqty);
      dataArr.histopathologyqty_s.push(histopathologyqty);

      dataArr.chlditemcd_s.push(chlditemcd);
      dataArr.column_itemcd_s.push(column_itemcd);
      dataArr.column_itemnm_s.push(column_itemnm);
      dataArr.gubun_s.push(gubun);
      dataArr.remark_s.push(remark);
      dataArr.qty_s.push(qty);
      dataArr.optioncd_s.push(optioncd);
      dataArr.bonyn_s.push(bonyn);
      dataArr.pointqty_s.push(pointqty);
      dataArr.chasu_s.push(chasu);
      dataArr.chasuspace_s.push(chasuspace);
      dataArr.amt_s.push(amt);
      dataArr.ref_key_s.push(ref_key);

      dataArr.rowstatus_item.push("");
      dataArr.reqnum_item.push("");
      dataArr.reqrev_item.push("0");
      dataArr.reqseq_item.push("0");
      dataArr.qty_item.push("0");
      dataArr.experimentqty_item.push("0");
      dataArr.spareqty_item.push("0");
      dataArr.pgmdiv_item.push("");
      dataArr.remark_item.push("");
      dataArr.inreqdt_item.push("");

      dataArr.rowstatus_gun.push("");
      dataArr.group_seq_gun.push("0");
      dataArr.remark3_gun.push("");
      dataArr.animalqty_gun.push("0");
      dataArr.femaleqty_gun.push("0");
      dataArr.maleqty_gun.push("0");
      dataArr.remark_gun.push("");
      dataArr.injectwgt_gun.push("");
    });

    const para: Iparameters = {
      procedureName: "P_SA_A1000W_603_Sub1_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "N",
        "@p_orgdiv": Information.orgdiv,
        "@p_table_id": "SA051T",
        "@p_table_key":
          Information.quonum +
          "-" +
          Information.quorev +
          "-" +
          Information.quoseq,
        "@p_rowstatus_s": dataArr.rowstatus_s.join("|"),
        "@p_seq_s": dataArr.seq_s.join("|"),
        "@p_itemcd_s": dataArr.itemcd_s.join("|"),
        "@p_injectcnt_s": dataArr.injectcnt_s.join("|"),
        "@p_injectcycle_s": dataArr.injectcycle_s.join("|"),
        "@p_maleqty_s": dataArr.maleqty_s.join("|"),
        "@p_femaleqty_s": dataArr.femaleqty_s.join("|"),
        "@p_totqty_s": dataArr.totqty_s.join("|"),
        "@p_sampleqty_s": dataArr.sampleqty_s.join("|"),
        "@p_urineqty_s": dataArr.urineqty_s.join("|"),
        "@p_tkqty_s": dataArr.tkqty_s.join("|"),
        "@p_experimentqty_s": dataArr.experimentqty_s.join("|"),
        "@p_autopsyqty_s": dataArr.autopsyqty_s.join("|"),
        "@p_spareqty_s": dataArr.spareqty_s.join("|"),
        "@p_recoverqty_s": dataArr.recoverqty_s.join("|"),
        "@p_cageqty_s": dataArr.cageqty_s.join("|"),
        "@p_rackqty_s": dataArr.rackqty_s.join("|"),
        "@p_infusionqty_s": dataArr.infusionqty_s.join("|"),
        "@p_infusiontime_s": dataArr.infusiontime_s.join("|"),
        "@p_point_s": dataArr.point_s.join("|"),
        "@p_capacity_s": dataArr.capacity_s.join("|"),
        "@p_geomcheqty_s": dataArr.geomcheqty_s.join("|"),
        "@p_geomcheprodqty_s": dataArr.geomcheprodqty_s.join("|"),
        "@p_infusioncount_s": dataArr.infusioncount_s.join("|"),
        "@p_testcnt_s": dataArr.testcnt_s.join("|"),
        "@p_strainqty_s": dataArr.strainqty_s.join("|"),
        "@p_matterqty_s": dataArr.matterqty_s.join("|"),
        "@p_affiliationqty_s": dataArr.affiliationqty_s.join("|"),
        "@p_plateqty_s": dataArr.plateqty_s.join("|"),
        "@p_cellqty_s": dataArr.cellqty_s.join("|"),
        "@p_virusqty_s": dataArr.virusqty_s.join("|"),
        "@p_runtime_s": dataArr.runtime_s.join("|"),
        "@p_gunqty_s": dataArr.gunqty_s.join("|"),
        "@p_concentrationcnt_s": dataArr.concentrationcnt_s.join("|"),
        "@p_one_week_s": dataArr.one_week_s.join("|"),
        "@p_two_week_s": dataArr.two_week_s.join("|"),
        "@p_one_twoweek_s": dataArr.one_twoweek_s.join("|"),
        "@p_guaranteeperiod_s": dataArr.guaranteeperiod_s.join("|"),
        "@p_testperiod_s": dataArr.testperiod_s.join("|"),
        "@p_refineperiod_s": dataArr.refineperiod_s.join("|"),
        "@p_autopsyperiod_s": dataArr.autopsyperiod_s.join("|"),
        "@p_recoverweek_s": dataArr.recoverweek_s.join("|"),
        "@p_recoverday_s": dataArr.recoverday_s.join("|"),
        "@p_genderyn_s": dataArr.genderyn_s.join("|"),
        "@p_breedmeth_s": dataArr.breedmeth_s.join("|"),
        "@p_cagetype_s": dataArr.cagetype_s.join("|"),
        "@p_prodmac_s": dataArr.prodmac_s.join("|"),
        "@p_assaytype_s": dataArr.assaytype_s.join("|"),
        "@p_assaytype1_s": dataArr.assaytype1_s.join("|"),
        "@p_assaytype2_s": dataArr.assaytype2_s.join("|"),
        "@p_slideqty_s": dataArr.slideqty_s.join("|"),
        "@p_histopathologyqty_s": dataArr.histopathologyqty_s.join("|"),

        "@p_chlditemcd_s": dataArr.chlditemcd_s.join("|"),
        "@p_column_itemcd_s": dataArr.column_itemcd_s.join("|"),
        "@p_column_itemnm_s": dataArr.column_itemnm_s.join("|"),
        "@p_gubun_s": dataArr.gubun_s.join("|"),
        "@p_remark_s": dataArr.remark_s.join("|"),
        "@p_qty_s": dataArr.qty_s.join("|"),
        "@p_optioncd_s": dataArr.optioncd_s.join("|"),
        "@p_bonyn_s": dataArr.bonyn_s.join("|"),
        "@p_pointqty_s": dataArr.pointqty_s.join("|"),
        "@p_chasu_s": dataArr.chasu_s.join("|"),
        "@p_chasuspace_s": dataArr.chasuspace_s.join("|"),
        "@p_amt_s": dataArr.amt_s.join("|"),
        "@p_ref_key_s": dataArr.ref_key_s.join("|"),

        "@p_rowstatus_gun": dataArr.rowstatus_gun.join("|"),
        "@p_group_seq_gun": dataArr.group_seq_gun.join("|"),
        "@p_remark3_gun": dataArr.remark3_gun.join("|"),
        "@p_animalqty_gun": dataArr.animalqty_gun.join("|"),
        "@p_femaleqty_gun": dataArr.femaleqty_gun.join("|"),
        "@p_maleqty_gun": dataArr.maleqty_gun.join("|"),
        "@p_remark_gun": dataArr.remark_gun.join("|"),
        "@p_injectwgt_gun": dataArr.injectwgt_gun.join("|"),

        "@p_rowstatus_item": dataArr.rowstatus_item.join("|"),
        "@p_reqnum_item": dataArr.reqnum_item.join("|"),
        "@p_reqrev_item": dataArr.reqrev_item.join("|"),
        "@p_reqseq_item": dataArr.reqseq_item.join("|"),
        "@p_qty_item": dataArr.qty_item.join("|"),
        "@p_experimentqty_item": dataArr.experimentqty_item.join("|"),
        "@p_spareqty_item": dataArr.spareqty_item.join("|"),
        "@p_pgmdiv_item": dataArr.pgmdiv_item.join("|"),
        "@p_remark_item": dataArr.remark_item.join("|"),
        "@p_inreqdt_item": dataArr.inreqdt_item.join("|"),

        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "SA_A1000W_603",
      },
    };

    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      fetchMainGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
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
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedState3(newSelectedState);
  };
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
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
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
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
  const editNumberFooterCell2 = (props: GridFooterCellProps) => {
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
  const editNumberFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult3.data.forEach((item) =>
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
  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item[DATA_ITEM_KEY] > temp) {
        temp = item[DATA_ITEM_KEY];
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      experimentqty: 0,
      inreqdt: "99991231",
      insiz: "",
      itemcd: "",
      itemnm: "",
      pgmdiv: "B",
      qty: 0,
      rate: 0,
      remark: "",
      reqnum: "",
      reqrev: 0,
      reqseq: 0,
      spareqty: 0,
      rowstatus: "N",
    };
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick2 = () => {
    mainDataResult2.data.map((item) => {
      if (item[DATA_ITEM_KEY2] > temp2) {
        temp2 = item[DATA_ITEM_KEY2];
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY2]: ++temp2,
      animalqty: 0,
      femaleqty: 0,
      group_seq: 0,
      injectwgt: "",
      maleqty: 0,
      orgdiv: sessionOrgdiv,
      ref_key: item.quonum + "-" + item.quorev + "-" + item.quoseq,
      remark: "",
      remark3: "",
      table_id: "SA051T",
      rowstatus: "N",
    };
    setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });

    setMainDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };
  const onAddClick3 = () => {
    mainDataResult3.data.map((item) => {
      if (item[DATA_ITEM_KEY3] > temp3) {
        temp3 = item[DATA_ITEM_KEY3];
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY3]: ++temp3,
      affiliationqty: 0,
      amt: 0,
      animalkind: "",
      assaytype: "",
      assaytype1: 0,
      assaytype2: 0,
      slideqty: 0,
      histopathologyqty: 0,
      autopsyperiod: 0,
      autopsyqty: 0,
      bonqty: 0,
      bonyn: "N",
      breedmeth: "",
      cageqty: 0,
      cagetype: "",
      capacity: 0,
      cellqty: 0,
      chasu: 0,
      chasuspace: 0,
      chlditemcd: "",
      column_itemcd: "",
      column_itemnm: "",
      concentrationcnt: 0,
      experimentqty: 0,
      femaleqty: 0,
      genderyn: "",
      geomcheprodqty: 0,
      geomcheqty: 0,
      guaranteeperiod: 0,
      gubun: "O",
      gunqty: 0,
      infusioncount: 0,
      infusionqty: 0,
      infusiontime: 0,
      injectcnt: 0,
      injectcycle: 0,
      itemcd: "",
      maleqty: 0,
      matterqty: 0,
      one_twoweek: 0,
      one_week: 0,
      optioncd: "",
      orgdiv: sessionOrgdiv,
      plateqty: 0,
      point: 0,
      pointqty: 0,
      prodmac: "",
      qty: 0,
      rackqty: 0,
      recoverday: 0,
      recoverqty: 0,
      recoverweek: 0,
      ref_key: "",
      refineperiod: 0,
      remark: "",
      runtime: 0,
      sampleqty: 0,
      seq: 0,
      spareqty: 0,
      strainqty: 0,
      table_id: "SA051T",
      table_key: item.quonum + "-" + item.quorev + "-" + item.quoseq,
      testcnt: 0,
      testperiod: 0,
      teststs: "",
      tkqty: 0,
      totqty: 0,
      two_week: 0,
      update_form_id: null,
      update_pc: null,
      update_time: null,
      update_userid: null,
      urineqty: 0,
      virusqty: 0,
      rowstatus: "N",
    };
    setSelectedState3({ [newDataItem[DATA_ITEM_KEY3]]: true });

    setMainDataResult3((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
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
          deletedRows.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
      });
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
          deletedRows2.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object) - 1];
    }

    setMainDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState2({
        [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick3 = (e: any) => {
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
          deletedRows3.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult3.data[Math.min(...Object2)];
    } else {
      data = mainDataResult3.data[Math.min(...Object) - 1];
    }

    setMainDataResult3((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState3({
        [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
      });
    }
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
  const onMainItemChange3 = (event: GridItemChangeEvent) => {
    setMainDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
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
  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
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
  const customRowRender3 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );
  const enterEdit = (dataItem: any, field: string) => {
    if (
      save == true &&
      field != "rowstatus" &&
      field != "itemnm" &&
      field != "insiz" &&
      field != "rate"
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );
      setEditIndex(dataItem[DATA_ITEM_KEY]);
      if (field) {
        setEditedField(field);
      }
      setTempResult((prev) => {
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
      setTempResult((prev) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (save == true && field != "rowstatus") {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
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
      setTempResult2((prev) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit3 = (dataItem: any, field: string) => {
    if (save == true && field != "rowstatus") {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == dataItem[DATA_ITEM_KEY3]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
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
      setTempResult3((prev) => {
        return {
          data: mainDataResult3.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      if (editedField == "itemcd") {
        mainDataResult.data.map((item: { [x: string]: any; itemcd: any }) => {
          if (editIndex == item[DATA_ITEM_KEY]) {
            fetchItemData(item.itemcd);
          }
        });
      } else {
        const newData = mainDataResult.data.map((item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                rate:
                  editedField == "experimentqty" || editedField == "spareqty"
                    ? Math.round((item.spareqty / item.experimentqty) * 100)
                    : item.rate,
                qty:
                  editedField == "experimentqty" || editedField == "spareqty"
                    ? item.spareqty + item.experimentqty
                    : item.qty,
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
        setMainDataResult((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      }
    } else {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
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
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map((item) =>
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
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
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
    }
  };
  const exitEdit3 = () => {
    if (tempResult3.data != mainDataResult3.data) {
      const newData = mainDataResult3.data.map((item) =>
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
      const newData = mainDataResult3.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
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
    }
  };

  const fetchItemData = useCallback(
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
          const newData = mainDataResult.data.map((item: any) =>
            item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
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
          setMainDataResult((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [mainDataResult]
  );

  return (
    <>
      <Window
        titles={"시험디자인설계상세"}
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
              <FormBoxWrap
                border={true}
                style={{ height: mobileheight, overflow: "auto" }}
              >
                <GridTitleContainer>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <GridTitle>기본정보</GridTitle>
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
                <FormBox>
                  <tbody>
                    <tr>
                      <th>시험번호</th>
                      <td>
                        <Input
                          name="quotestnum"
                          type="text"
                          value={Information.quotestnum}
                          className="readonly"
                        />
                      </td>
                      <th>시험파트</th>
                      <td>
                        <Input
                          name="itemlvl1"
                          type="text"
                          value={
                            itemlvl1ListData.find(
                              (item: any) =>
                                item.sub_code == Information.itemlvl1
                            )?.code_name
                          }
                          className="readonly"
                        />
                      </td>
                      <th>품번</th>
                      <td>
                        <Input
                          name="itemcd"
                          type="text"
                          value={Information.itemcd}
                          className="readonly"
                        />
                      </td>
                      <th>품명</th>
                      <td>
                        <Input
                          name="itemnm"
                          type="text"
                          value={Information.itemnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <FormBoxWrap
                border={true}
                style={{ height: mobileheight2, overflow: "auto" }}
              >
                <GridTitleContainer>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <GridTitle>
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
                      본시험
                    </GridTitle>
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
                  </ButtonContainer>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>시험번호</th>
                      <td>
                        <Input
                          name="quotestnum"
                          type="text"
                          value={Information.quotestnum}
                          className="readonly"
                        />
                      </td>
                      <th>시험파트</th>
                      <td>
                        <Input
                          name="itemlvl1"
                          type="text"
                          value={
                            itemlvl1ListData.find(
                              (item: any) =>
                                item.sub_code == Information.itemlvl1
                            )?.code_name
                          }
                          className="readonly"
                        />
                      </td>
                      <th>품번</th>
                      <td>
                        <Input
                          name="itemcd"
                          type="text"
                          value={Information.itemcd}
                          className="readonly"
                        />
                      </td>
                      <th>품명</th>
                      <td>
                        <Input
                          name="itemnm"
                          type="text"
                          value={Information.itemnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <GridTitleContainer>
                  <GridTitle>본시험</GridTitle>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>시험횟수</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="point_base"
                            value={Information.point_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="point_base"
                            value={Information.point_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>균주 수</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="strainqty_base"
                            value={Information.strainqty_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="strainqty_base"
                            value={Information.strainqty_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>시험물질수량</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="matterqty_base"
                            value={Information.matterqty_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="matterqty_base"
                            value={Information.matterqty_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>계열 수</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="affiliationqty_base"
                            value={Information.affiliationqty_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="affiliationqty_base"
                            value={Information.affiliationqty_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>용량</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="capacity_base"
                            value={Information.capacity_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="capacity_base"
                            value={Information.capacity_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>플레이트</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="plateqty_base"
                            value={Information.plateqty_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="plateqty_base"
                            value={Information.plateqty_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>세포수</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="cellqty_base"
                            value={Information.cellqty_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="cellqty_base"
                            value={Information.cellqty_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>군구성</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="gunqty_base"
                            value={Information.gunqty_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="gunqty_base"
                            value={Information.gunqty_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>실험기간(D)</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="testperiod_base"
                            value={Information.testperiod_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="testperiod_base"
                            value={Information.testperiod_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>실험기간(W)</th>
                      <td>
                        <NumericTextBox
                          spinners={false}
                          min={0}
                          name="experiment_week_base"
                          value={Information.experiment_week_base}
                          format="n0"
                          className="readonly"
                          disabled={true}
                        />
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>비고</th>
                      <td colSpan={3}>
                        {save == true ? (
                          <TextArea
                            value={Information.remark_base}
                            name="remark_base"
                            rows={2}
                            onChange={InputChange}
                          />
                        ) : (
                          <TextArea
                            value={Information.remark_base}
                            name="remark_base"
                            rows={2}
                            className="readonly"
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <FormBoxWrap
                border={true}
                style={{ height: mobileheight3, overflow: "auto" }}
              >
                <GridTitleContainer>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <GridTitle>
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
                      용량설정시험
                    </GridTitle>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(3);
                        }
                      }}
                      icon="chevron-right"
                      themeColor={"primary"}
                      fillMode={"flat"}
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>용량설정시험여부</th>
                      <td>
                        {save == true ? (
                          <Checkbox
                            checked={Information.yn_ex}
                            name="yn_ex"
                            onChange={InputChange}
                          ></Checkbox>
                        ) : (
                          <Checkbox
                            checked={Information.yn_ex}
                            readOnly
                          ></Checkbox>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>시험횟수</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="point_ex"
                            value={Information.point_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="point_ex"
                            value={Information.point_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>균주 수</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="strainqty_ex"
                            value={Information.strainqty_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="strainqty_ex"
                            value={Information.strainqty_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>시험물질수량</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="matterqty_ex"
                            value={Information.matterqty_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="matterqty_ex"
                            value={Information.matterqty_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>계열 수</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="affiliationqty_ex"
                            value={Information.affiliationqty_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="affiliationqty_ex"
                            value={Information.affiliationqty_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>용량</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="capacity_ex"
                            value={Information.capacity_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="capacity_ex"
                            value={Information.capacity_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>플레이트</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="plateqty_ex"
                            value={Information.plateqty_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="plateqty_ex"
                            value={Information.plateqty_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>세포수</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="cellqty_ex"
                            value={Information.cellqty_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="cellqty_ex"
                            value={Information.cellqty_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>군구성</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="gunqty_ex"
                            value={Information.gunqty_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="gunqty_ex"
                            value={Information.gunqty_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>실험기간(D)</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="testperiod_ex"
                            value={Information.testperiod_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="testperiod_ex"
                            value={Information.testperiod_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>실험기간(W)</th>
                      <td>
                        <NumericTextBox
                          spinners={false}
                          min={0}
                          name="experiment_week_ex"
                          value={Information.experiment_week_ex}
                          format="n0"
                          className="readonly"
                          disabled={true}
                        />
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>비고</th>
                      <td colSpan={3}>
                        {save == true && Information.yn_ex == true ? (
                          <TextArea
                            value={Information.remark_ex}
                            name="remark_ex"
                            rows={2}
                            onChange={InputChange}
                          />
                        ) : (
                          <TextArea
                            value={Information.remark_ex}
                            name="remark_ex"
                            rows={2}
                            className="readonly"
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </SwiperSlide>
            <SwiperSlide key={3}>
              <GridContainer>
                <GridTitleContainer className="WindowButtonContainer">
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(2);
                          }
                        }}
                        icon="chevron-left"
                        themeColor={"primary"}
                        fillMode={"flat"}
                      ></Button>
                      시험자재예약
                    </GridTitle>
                    <div>
                      <Button
                        themeColor={"primary"}
                        onClick={onAddClick}
                        icon="plus"
                        title="행 추가"
                        disabled={
                          permissions.save
                            ? save == true
                              ? false
                              : true
                            : true
                        }
                      />
                      <Button
                        themeColor={"primary"}
                        fillMode="outline"
                        onClick={onDeleteClick}
                        icon="minus"
                        title="행 삭제"
                        disabled={
                          permissions.save
                            ? save == true
                              ? false
                              : true
                            : true
                        }
                      />
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(4);
                          }
                        }}
                        icon="chevron-right"
                        themeColor={"primary"}
                        fillMode={"flat"}
                      ></Button>
                    </div>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormContext.Provider
                  value={{
                    itemInfo,
                    setItemInfo,
                  }}
                >
                  <Grid
                    style={{ height: mobileheight4 }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        inreqdt: row.inreqdt
                          ? new Date(dateformat(row.inreqdt))
                          : new Date(dateformat("99991231")),
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
                    <GridColumn field="rowstatus" title=" " width="40px" />
                    <GridColumn
                      field="pgmdiv"
                      title="구분"
                      cell={CustomComboBoxCell}
                      width="120px"
                    />
                    <GridColumn
                      field="itemcd"
                      title="품목코드"
                      width="150px"
                      cell={ColumnCommandCell}
                      footerCell={mainTotalFooterCell}
                      headerCell={RequiredHeader}
                    />
                    <GridColumn field="itemnm" title="품목명" width="150px" />
                    <GridColumn field="insiz" title="규격" width="200px" />
                    <GridColumn
                      field="experimentqty"
                      title="실험동물수"
                      width="100px"
                      cell={NumberCell}
                      footerCell={editNumberFooterCell}
                    />
                    <GridColumn
                      field="spareqty"
                      title="여유동물수"
                      width="120px"
                      cell={NumberCell}
                      footerCell={editNumberFooterCell}
                    />
                    <GridColumn
                      field="rate"
                      title="여유비율(%)"
                      width="120px"
                      cell={NumberCell}
                    />
                    <GridColumn
                      field="qty"
                      title="총수량"
                      width="120px"
                      cell={NumberCell}
                      footerCell={editNumberFooterCell}
                    />
                    <GridColumn
                      field="inreqdt"
                      title="입고요청일"
                      width="120px"
                      cell={DateCell}
                    />
                    <GridColumn field="remark" title="비고" width="120px" />
                  </Grid>
                </FormContext.Provider>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={4}>
              <GridContainer>
                <GridTitleContainer className="WindowButtonContainer2">
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(3);
                          }
                        }}
                        icon="chevron-left"
                        themeColor={"primary"}
                        fillMode={"flat"}
                      ></Button>
                      군구성테이블
                    </GridTitle>
                    <div>
                      <Button
                        themeColor={"primary"}
                        onClick={onAddClick2}
                        icon="plus"
                        title="행 추가"
                        disabled={
                          permissions.save
                            ? save == true
                              ? false
                              : true
                            : true
                        }
                      />
                      <Button
                        themeColor={"primary"}
                        fillMode="outline"
                        onClick={onDeleteClick2}
                        icon="minus"
                        title="행 삭제"
                        disabled={
                          permissions.save
                            ? save == true
                              ? false
                              : true
                            : true
                        }
                      />
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(5);
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
                  style={{ height: mobileheight5 }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
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
                  <GridColumn field="rowstatus" title=" " width="40px" />
                  <GridColumn
                    field="remark3"
                    title="구분"
                    width="200px"
                    footerCell={mainTotalFooterCell2}
                  />
                  <GridColumn
                    field="animalqty"
                    title="동물수량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell2}
                  />
                  <GridColumn
                    field="femaleqty"
                    title="암컷수량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell2}
                  />
                  <GridColumn
                    field="maleqty"
                    title="수컷수량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell2}
                  />
                  <GridColumn
                    field="injectwgt"
                    title="투여용량"
                    width="120px"
                  />
                  <GridColumn field="remark" title="비고" width="200px" />
                </Grid>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={5}>
              <GridContainer>
                <GridTitleContainer className="WindowButtonContainer3">
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(4);
                          }
                        }}
                        icon="chevron-left"
                        themeColor={"primary"}
                        fillMode={"flat"}
                      ></Button>
                      옵션
                    </GridTitle>
                    <div>
                      <Button
                        themeColor={"primary"}
                        onClick={onAddClick3}
                        icon="plus"
                        title="행 추가"
                        disabled={
                          permissions.save
                            ? save == true
                              ? false
                              : true
                            : true
                        }
                      />
                      <Button
                        themeColor={"primary"}
                        fillMode="outline"
                        onClick={onDeleteClick3}
                        icon="minus"
                        title="행 삭제"
                        disabled={
                          permissions.save
                            ? save == true
                              ? false
                              : true
                            : true
                        }
                      />
                    </div>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: mobileheight6 }}
                  data={process(
                    mainDataResult3.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState3[idGetter3(row)], //선택된 데이터
                    })),
                    mainDataState3
                  )}
                  onDataStateChange={onMainDataStateChange3}
                  {...mainDataState3}
                  //선택 subDataState
                  dataItemKey={DATA_ITEM_KEY3}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange3}
                  //스크롤 조회기능
                  fixedScroll={true}
                  total={mainDataResult3.total}
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
                  <GridColumn field="rowstatus" title=" " width="40px" />
                  <GridColumn
                    field="optioncd"
                    title="옵션"
                    width="120px"
                    cell={CustomComboBoxCell}
                    footerCell={mainTotalFooterCell3}
                  />
                  <GridColumn
                    field="qty"
                    title="수량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell3}
                  />
                  <GridColumn field="remark" title="비고" width="200px" />
                </Grid>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        ) : (
          <>
            <FormBoxWrap style={{ height: webheight }}>
              <FormBoxWrap border={true}>
                <GridTitleContainer>
                  <GridTitle>기본정보</GridTitle>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>시험번호</th>
                      <td>
                        <Input
                          name="quotestnum"
                          type="text"
                          value={Information.quotestnum}
                          className="readonly"
                        />
                      </td>
                      <th>시험파트</th>
                      <td>
                        <Input
                          name="itemlvl1"
                          type="text"
                          value={
                            itemlvl1ListData.find(
                              (item: any) =>
                                item.sub_code == Information.itemlvl1
                            )?.code_name
                          }
                          className="readonly"
                        />
                      </td>
                      <th>품번</th>
                      <td>
                        <Input
                          name="itemcd"
                          type="text"
                          value={Information.itemcd}
                          className="readonly"
                        />
                      </td>
                      <th>품명</th>
                      <td>
                        <Input
                          name="itemnm"
                          type="text"
                          value={Information.itemnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <GridTitleContainer>
                  <GridTitle>본시험</GridTitle>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>시험횟수</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="point_base"
                            value={Information.point_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="point_base"
                            value={Information.point_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>균주 수</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="strainqty_base"
                            value={Information.strainqty_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="strainqty_base"
                            value={Information.strainqty_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>시험물질수량</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="matterqty_base"
                            value={Information.matterqty_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="matterqty_base"
                            value={Information.matterqty_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>계열 수</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="affiliationqty_base"
                            value={Information.affiliationqty_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="affiliationqty_base"
                            value={Information.affiliationqty_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>용량</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="capacity_base"
                            value={Information.capacity_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="capacity_base"
                            value={Information.capacity_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>플레이트</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="plateqty_base"
                            value={Information.plateqty_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="plateqty_base"
                            value={Information.plateqty_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>세포수</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="cellqty_base"
                            value={Information.cellqty_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="cellqty_base"
                            value={Information.cellqty_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>군구성</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="gunqty_base"
                            value={Information.gunqty_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="gunqty_base"
                            value={Information.gunqty_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>실험기간(D)</th>
                      <td>
                        {save == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="testperiod_base"
                            value={Information.testperiod_base}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="testperiod_base"
                            value={Information.testperiod_base}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>실험기간(W)</th>
                      <td>
                        <NumericTextBox
                          spinners={false}
                          min={0}
                          name="experiment_week_base"
                          value={Information.experiment_week_base}
                          format="n0"
                          className="readonly"
                          disabled={true}
                        />
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>비고</th>
                      <td colSpan={3}>
                        {save == true ? (
                          <TextArea
                            value={Information.remark_base}
                            name="remark_base"
                            rows={2}
                            onChange={InputChange}
                          />
                        ) : (
                          <TextArea
                            value={Information.remark_base}
                            name="remark_base"
                            rows={2}
                            className="readonly"
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <GridTitleContainer>
                  <GridTitle>용량설정시험</GridTitle>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>용량설정시험여부</th>
                      <td>
                        {save == true ? (
                          <Checkbox
                            checked={Information.yn_ex}
                            name="yn_ex"
                            onChange={InputChange}
                          ></Checkbox>
                        ) : (
                          <Checkbox
                            checked={Information.yn_ex}
                            readOnly
                          ></Checkbox>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>시험횟수</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="point_ex"
                            value={Information.point_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="point_ex"
                            value={Information.point_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>균주 수</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="strainqty_ex"
                            value={Information.strainqty_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="strainqty_ex"
                            value={Information.strainqty_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>시험물질수량</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="matterqty_ex"
                            value={Information.matterqty_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="matterqty_ex"
                            value={Information.matterqty_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>계열 수</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="affiliationqty_ex"
                            value={Information.affiliationqty_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="affiliationqty_ex"
                            value={Information.affiliationqty_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>용량</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="capacity_ex"
                            value={Information.capacity_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="capacity_ex"
                            value={Information.capacity_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>플레이트</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="plateqty_ex"
                            value={Information.plateqty_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="plateqty_ex"
                            value={Information.plateqty_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>세포수</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="cellqty_ex"
                            value={Information.cellqty_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="cellqty_ex"
                            value={Information.cellqty_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>군구성</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="gunqty_ex"
                            value={Information.gunqty_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="gunqty_ex"
                            value={Information.gunqty_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>실험기간(D)</th>
                      <td>
                        {save == true && Information.yn_ex == true ? (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="testperiod_ex"
                            value={Information.testperiod_ex}
                            format="n0"
                            onChange={InputChange}
                          />
                        ) : (
                          <NumericTextBox
                            spinners={false}
                            min={0}
                            name="testperiod_ex"
                            value={Information.testperiod_ex}
                            format="n0"
                            className="readonly"
                            disabled={true}
                          />
                        )}
                      </td>
                      <th>실험기간(W)</th>
                      <td>
                        <NumericTextBox
                          spinners={false}
                          min={0}
                          name="experiment_week_ex"
                          value={Information.experiment_week_ex}
                          format="n0"
                          className="readonly"
                          disabled={true}
                        />
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>비고</th>
                      <td colSpan={3}>
                        {save == true && Information.yn_ex == true ? (
                          <TextArea
                            value={Information.remark_ex}
                            name="remark_ex"
                            rows={2}
                            onChange={InputChange}
                          />
                        ) : (
                          <TextArea
                            value={Information.remark_ex}
                            name="remark_ex"
                            rows={2}
                            className="readonly"
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormContext.Provider
                value={{
                  itemInfo,
                  setItemInfo,
                }}
              >
                <GridContainer>
                  <GridTitleContainer className="WindowButtonContainer">
                    <GridTitle>시험자재예약</GridTitle>
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <Button
                        themeColor={"primary"}
                        onClick={onAddClick}
                        icon="plus"
                        title="행 추가"
                        disabled={
                          permissions.save
                            ? save == true
                              ? false
                              : true
                            : true
                        }
                      />
                      <Button
                        themeColor={"primary"}
                        fillMode="outline"
                        onClick={onDeleteClick}
                        icon="minus"
                        title="행 삭제"
                        disabled={
                          permissions.save
                            ? save == true
                              ? false
                              : true
                            : true
                        }
                      />
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: webheight2 }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        inreqdt: row.inreqdt
                          ? new Date(dateformat(row.inreqdt))
                          : new Date(dateformat("99991231")),
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
                    <GridColumn field="rowstatus" title=" " width="40px" />
                    <GridColumn
                      field="pgmdiv"
                      title="구분"
                      cell={CustomComboBoxCell}
                      width="120px"
                    />
                    <GridColumn
                      field="itemcd"
                      title="품목코드"
                      width="150px"
                      cell={ColumnCommandCell}
                      footerCell={mainTotalFooterCell}
                      headerCell={RequiredHeader}
                    />
                    <GridColumn field="itemnm" title="품목명" width="150px" />
                    <GridColumn field="insiz" title="규격" width="200px" />
                    <GridColumn
                      field="experimentqty"
                      title="실험동물수"
                      width="100px"
                      cell={NumberCell}
                      footerCell={editNumberFooterCell}
                    />
                    <GridColumn
                      field="spareqty"
                      title="여유동물수"
                      width="120px"
                      cell={NumberCell}
                      footerCell={editNumberFooterCell}
                    />
                    <GridColumn
                      field="rate"
                      title="여유비율(%)"
                      width="120px"
                      cell={NumberCell}
                    />
                    <GridColumn
                      field="qty"
                      title="총수량"
                      width="120px"
                      cell={NumberCell}
                      footerCell={editNumberFooterCell}
                    />
                    <GridColumn
                      field="inreqdt"
                      title="입고요청일"
                      width="120px"
                      cell={DateCell}
                    />
                    <GridColumn field="remark" title="비고" width="120px" />
                  </Grid>
                </GridContainer>
              </FormContext.Provider>
              <GridContainer>
                <GridTitleContainer className="WindowButtonContainer2">
                  <GridTitle>군구성테이블</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      themeColor={"primary"}
                      onClick={onAddClick2}
                      icon="plus"
                      title="행 추가"
                      disabled={
                        permissions.save ? (save == true ? false : true) : true
                      }
                    />
                    <Button
                      themeColor={"primary"}
                      fillMode="outline"
                      onClick={onDeleteClick2}
                      icon="minus"
                      title="행 삭제"
                      disabled={
                        permissions.save ? (save == true ? false : true) : true
                      }
                    />
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: webheight3 }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
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
                  <GridColumn field="rowstatus" title=" " width="40px" />
                  <GridColumn
                    field="remark3"
                    title="구분"
                    width="200px"
                    footerCell={mainTotalFooterCell2}
                  />
                  <GridColumn
                    field="animalqty"
                    title="동물수량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell2}
                  />
                  <GridColumn
                    field="femaleqty"
                    title="암컷수량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell2}
                  />
                  <GridColumn
                    field="maleqty"
                    title="수컷수량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell2}
                  />
                  <GridColumn
                    field="injectwgt"
                    title="투여용량"
                    width="120px"
                  />
                  <GridColumn field="remark" title="비고" width="200px" />
                </Grid>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer className="WindowButtonContainer3">
                  <GridTitle>옵션</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      themeColor={"primary"}
                      onClick={onAddClick3}
                      icon="plus"
                      title="행 추가"
                      disabled={
                        permissions.save ? (save == true ? false : true) : true
                      }
                    />
                    <Button
                      themeColor={"primary"}
                      fillMode="outline"
                      onClick={onDeleteClick3}
                      icon="minus"
                      title="행 삭제"
                      disabled={
                        permissions.save ? (save == true ? false : true) : true
                      }
                    />
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: webheight4 }}
                  data={process(
                    mainDataResult3.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState3[idGetter3(row)], //선택된 데이터
                    })),
                    mainDataState3
                  )}
                  onDataStateChange={onMainDataStateChange3}
                  {...mainDataState3}
                  //선택 subDataState
                  dataItemKey={DATA_ITEM_KEY3}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange3}
                  //스크롤 조회기능
                  fixedScroll={true}
                  total={mainDataResult3.total}
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
                  <GridColumn field="rowstatus" title=" " width="40px" />
                  <GridColumn
                    field="optioncd"
                    title="옵션"
                    width="120px"
                    cell={CustomComboBoxCell}
                    footerCell={mainTotalFooterCell3}
                  />
                  <GridColumn
                    field="qty"
                    title="수량"
                    width="100px"
                    cell={NumberCell}
                    footerCell={editNumberFooterCell3}
                  />
                  <GridColumn field="remark" title="비고" width="200px" />
                </Grid>
              </GridContainer>
            </FormBoxWrap>
          </>
        )}
        <BottomContainer className="BottomContainer">
          <ButtonContainer>
            {save == true && permissions.save ? (
              <Button themeColor={"primary"} onClick={onSave}>
                저장
              </Button>
            ) : (
              ""
            )}
            <Button
              themeColor={"primary"}
              fillMode={"outline"}
              onClick={onClose}
            >
              닫기
            </Button>
          </ButtonContainer>
        </BottomContainer>
      </Window>
    </>
  );
};

export default CopyWindow;
