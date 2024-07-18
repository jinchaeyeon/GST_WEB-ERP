import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import * as React from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import {
  isFilterHideState2,
  isLoading,
  loginResultState,
} from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  chkScrollHandler,
  convertDateToStr,
  dateformat,
  findMessage,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  getWindowDeviceHeight,
  handleKeyPressSearch,
  isValidDate,
  setDefaultDate,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import WindowFilterContainer from "../Containers/WindowFilterContainer";
import CommonDateRangePicker from "../DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../Renderers/Renderers";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import Window from "./WindowComponent/Window";

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
let temp = 0;

type IWindow = {
  setVisible(t: boolean): void;
  setData(data: object): void; //data : 선택한 품목 데이터를 전달하는 함수
  custcd: string;
  custnm: string;
  pathname: string;
  modal?: boolean;
};

const CopyWindow = ({
  setVisible,
  setData,
  custcd,
  custnm,
  pathname,
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
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 900,
  });
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".WindowTitleContainer"); //조회버튼있는 title부분
      height3 = getHeight(".BottomContainer"); //하단 버튼부분
      height4 = getHeight(".WindowButtonContainer");
      height5 = getHeight(".WindowButtonContainer2");

      setMobileHeight(
        getWindowDeviceHeight(true, deviceHeight) -
          height -
          height2 -
          height3 -
          height4
      );
      setMobileHeight2(
        getWindowDeviceHeight(true, deviceHeight) -
          height -
          height2 -
          height3 -
          height5
      );
      setWebHeight(
        (getWindowDeviceHeight(true, position.height) -
          height -
          height2 -
          height3) /
          2 -
          height4
      );
      setWebHeight2(
        (getWindowDeviceHeight(true, position.height) -
          height -
          height2 -
          height3) /
          2 -
          height5
      );
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      (getWindowDeviceHeight(true, position.height) -
        height -
        height2 -
        height3) /
        2 -
        height4
    );
    setWebHeight2(
      (getWindowDeviceHeight(true, position.height) -
        height -
        height2 -
        height3) /
        2 -
        height5
    );
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
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
  const DATA_ITEM_KEY = "num";
  const DATA_ITEM_KEY2 = "num";
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

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
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        finyn: defaultOption.find((item: any) => item.id == "finyn")?.valueCode,
        dtgb: defaultOption.find((item: any) => item.id == "dtgb")?.valueCode,
        ordsts: defaultOption.find((item: any) => item.id == "ordsts")
          ?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        doexdiv: defaultOption.find((item: any) => item.id == "doexdiv")
          ?.valueCode,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA005,L_BA029, L_BA061,L_BA015, R_USEYN,L_BA171,L_BA172,L_BA173,R_YESNOALL,L_sysUserMaster_001",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [doexdivListData, setDoexdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxdivListData, setTaxdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
      setPersonListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setDoexdivListData(getBizCom(bizComponentData, "L_BA005"));
      setTaxdivListData(getBizCom(bizComponentData, "L_BA029"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [subselectedState, setSubSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [subPgNum, setSubPgNum] = useState(1);

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

  const onClose = () => {
    setisFilterHideStates2(true);
    setVisible(false);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      custcd: custcd,
      custnm: custnm,
    }));
  }, []);

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

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const processApi = useApi();
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    position: "",
    dptcd: "",
    dtgb: "",
    frdt: new Date(),
    todt: new Date(),
    itemcd: "",
    itemnm: "",
    custcd: "",
    custnm: "",
    poregnum: "",
    person: "",
    finyn: "",
    remark: "",
    ordsts: "",
    doexdiv: "",
    ordnum: "",
    isSearch: false,
    pgNum: 1,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_P5000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_ordnum": filters.ordnum,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_poregnum": filters.poregnum,
        "@p_ordsts": filters.ordsts,
        "@p_doexdiv": filters.doexdiv,
        "@p_person": filters.person,
        "@p_finyn": filters.finyn,
        "@p_remark": filters.remark,
        "@p_company_code": companyCode,
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
        setSelectedState({ [rows[0].num]: true });
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
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onSubSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: subselectedState,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSubSelectedState(newSelectedState);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
  };

  const onSubScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum, PAGE_SIZE))
      setSubPgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A3000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A3000W_001");
      } else if (
        filters.dtgb == "" ||
        filters.dtgb == undefined ||
        filters.dtgb == null
      ) {
        throw findMessage(messagesData, "SA_A3000W_003");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    setData(subDataResult.data);
    onClose();
  };

  const onRowDoubleClick = (props: any) => {
    let valid = true;

    const selectRows = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );

    selectRows.map((item: any) => {
      selectRows.map((items: any) => {
        if (item.custcd != items.custcd) {
          valid = false;
        }
      });
    });

    if (valid == true) {
      selectRows.map((selectRow: any) => {
        subDataResult.data.map((item) => {
          if (item.num > temp) {
            temp = item.num;
          }
        });
        const newDataItem = {
          [DATA_ITEM_KEY2]: ++temp,
          amt: selectRow.amt,
          amtunit: selectRow.amtunit,
          bnatur: selectRow.bnatur,
          chk: selectRow.chk,
          cqty: selectRow.cqty,
          custcd: selectRow.custcd,
          custnm: selectRow.custnm,
          discount: selectRow.discount,
          discount_div: selectRow.discount_div,
          discountamt: selectRow.discountamt,
          dlramt: selectRow.dlramt,
          dlvdt: selectRow.dlvdt,
          doexdiv: selectRow.doexdiv,
          doqty: selectRow.qty,
          finaldes: selectRow.finaldes,
          finyn: selectRow.finyn,
          insiz: selectRow.insiz,
          itemacnt: selectRow.itemacnt,
          itemcd: selectRow.itemcd,
          itemlvl1: selectRow.itemlvl1,
          itemlvl2: selectRow.itemlvl2,
          itemlvl3: selectRow.itemlvl3,
          itemnm: selectRow.itemnm,
          itemno: selectRow.itemno,
          janqty: selectRow.janqty,
          len: selectRow.len == undefined ? 0 : selectRow.len,
          length: selectRow.length,
          location: selectRow.location,
          lotnum: selectRow.lotnum,
          margin: selectRow.margin,
          margin_div: selectRow.margin_div,
          marginamt: selectRow.marginamt,
          marginunp: selectRow.marginunp,
          orddt: selectRow.orddt,
          ordkey: selectRow.ordkey,
          ordnum: selectRow.ordnum,
          ordseq: selectRow.ordseq,
          ordsts: selectRow.ordsts,
          ordsts1: selectRow.ordsts1,
          ordtype: selectRow.ordtype,
          orgdiv: selectRow.orgdiv,
          orgdiv1: selectRow.orgdiv1,
          orgunp: selectRow.orgunp,
          person: selectRow.person,
          poregnum: selectRow.poregnum,
          portnm: selectRow.portnm,
          project: selectRow.project,
          qty: selectRow.qty,
          qtyunit: selectRow.qtyunit,
          qtyunp: selectRow.qtyunp,
          rowstatus: "N",
          rcvcustcd: selectRow.rcvcustcd,
          rcvcustnm: selectRow.rcvcustnm,
          remark: selectRow.remark,
          saleqty: selectRow.saleqty,
          sort_seq: selectRow.sort_seq,
          specialamt: selectRow.specialamt,
          specialunp: selectRow.specialunp,
          taxamt: selectRow.taxamt,
          taxdiv: selectRow.taxdiv,
          thickness: selectRow.thickness,
          totwgt: selectRow.totwgt,
          unitwgt: selectRow.unitwgt,
          unp: selectRow.unp,
          unpcalmeth: selectRow.unpcalmeth,
          unprate: selectRow.unprate,
          uschgrat: selectRow.uschgrat,
          user_name: selectRow.user_name,
          wgtunit: selectRow.wgtunit,
          wgtunp: selectRow.wgtunp,
          width: selectRow.width,
          wonamt: selectRow.wonamt,
          wonchgrat: selectRow.wonchgrat,
        };
        setSubDataResult((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
        setSubSelectedState({
          [newDataItem[DATA_ITEM_KEY2]]: true,
        });
      });
    } else {
      alert("동일 업체만 추가 가능합니다.");
    }
  };

  const onDeleteClick = (e: any) => {
    if (subDataResult.total > 0) {
      //삭제 안 할 데이터 newData에 push, 삭제 데이터 deletedRows에 push
      let newData: any[] = [];
      let Object3: any[] = [];
      let Object2: any[] = [];
      let data2;
      subDataResult.data.forEach((item: any, index: number) => {
        if (item.chk != true) {
          newData.push(item);
          Object2.push(index);
        } else {
          Object3.push(index);
        }
      });

      if (Math.min(...Object3) < Math.min(...Object2)) {
        data2 = subDataResult.data[Math.min(...Object2)];
      } else {
        data2 = subDataResult.data[Math.min(...Object3) - 1];
      }

      //newData 생성
      setSubDataResult((prev) => ({
        data: newData,
        total: prev.total - Object3.length,
      }));
      if (Object3.length > 0) {
        setSubSelectedState({
          [data2 != undefined ? data2[DATA_ITEM_KEY2] : newData[0]]: true,
        });
      }
    }
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setSubDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult,
      setSubDataResult,
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

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    if (field == "chk") {
      const newData = subDataResult.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              chk:
                typeof item.chk == "boolean"
                  ? item.chk
                  : item.chk == "Y"
                  ? true
                  : false,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = subDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setSubDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values,
        [EDIT_FIELD]: props.field,
      }));
      setValues(!values);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const onItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
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

  const enterEdit3 = (dataItem: any, field: string) => {
    if (field == "chk") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              chk:
                typeof item.chk == "boolean"
                  ? item.chk
                  : item.chk == "Y"
                  ? true
                  : false,
              [EDIT_FIELD]: field,
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
  };

  const exitEdit3 = () => {
    const newData = mainDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = subDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
  };
  return (
    <>
      <Window
        titles={"수주참조"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <TitleContainer className="WindowTitleContainer">
          <Title />
          <ButtonContainer>
            <Button
              onClick={() => search()}
              icon="search"
              themeColor={"primary"}
              disabled={permissions.view ? false : true}
            >
              조회
            </Button>
          </ButtonContainer>
        </TitleContainer>
        <WindowFilterContainer>
          <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
            <tbody>
              <tr>
                <th>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="dtgb"
                      value={filters.dtgb}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      className="required"
                    />
                  )}
                </th>
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
                <th>사업장</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="location"
                      value={filters.location}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
                <th>부서</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="dptcd"
                      value={filters.dptcd}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      textField="dptcd"
                      valueField="dptnm"
                    />
                  )}
                </td>
                <th>PO번호</th>
                <td>
                  <Input
                    name="poregnum"
                    type="text"
                    value={filters.poregnum}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
                {filters.custcd == "" ? (
                  <>
                    <th>업체코드</th>
                    <td>
                      <Input
                        name="custcd"
                        type="text"
                        value={filters.custcd}
                        onChange={filterInputChange}
                      />
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
                  </>
                ) : (
                  <>
                    <th>업체코드</th>
                    <td>
                      <Input
                        name="custcd"
                        type="text"
                        value={filters.custcd}
                        className="readonly"
                      />
                    </td>
                    <th>업체명</th>
                    <td>
                      <Input
                        name="custnm"
                        type="text"
                        value={filters.custnm}
                        className="readonly"
                      />
                    </td>
                  </>
                )}
                <th>수주상태</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="ordsts"
                      value={filters.ordsts}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
                <th>내수구분</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="doexdiv"
                      value={filters.doexdiv}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
                <th>수주번호</th>
                <td>
                  <Input
                    name="ordnum"
                    type="text"
                    value={filters.ordnum}
                    onChange={filterInputChange}
                  />
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

                <th>담당자</th>
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
                <th>완료여부</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionRadioGroup
                      name="finyn"
                      customOptionData={customOptionData}
                      changeData={filterRadioChange}
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </FilterBox>
        </WindowFilterContainer>
        <GridContainer>
          <GridTitleContainer className="WindowButtonContainer">
            <ButtonContainer>
              <Button
                onClick={onRowDoubleClick}
                themeColor={"primary"}
                icon="plus"
                title="행 추가"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: isMobile ? mobileheight : webheight }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                person: personListData.find(
                  (item: any) => item.user_id == row.person
                )?.user_name,
                qtyunit: qtyunitListData.find(
                  (item: any) => item.sub_code == row.qtyunit
                )?.code_name,
                [SELECTED_FIELD]: selectedState[idGetter(row)],
              })),
              mainDataState
            )}
            onDataStateChange={onMainDataStateChange}
            {...mainDataState}
            //선택 기능
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
            onItemChange={onItemChange}
            cellRender={customCellRender3}
            rowRender={customRowRender3}
            editField={EDIT_FIELD}
          >
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell}
              cell={CheckBoxCell}
            />
            <GridColumn
              field="orddt"
              title="수주일자"
              cell={DateCell}
              width="100px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn
              field="dlvdt"
              title="납기일자"
              cell={DateCell}
              width="100px"
            />
            <GridColumn field="ordnum" title="수주번호" width="150px" />
            <GridColumn field="custnm" title="업체명" width="200px" />
            <GridColumn field="itemcd" title="품목코드" width="150px" />
            <GridColumn field="itemnm" title="품목명" width="150px" />
            <GridColumn field="insiz" title="규격" width="150px" />
            <GridColumn
              field="qty"
              title="수주수량"
              width="100px"
              cell={NumberCell}
              footerCell={gridSumQtyFooterCell}
            />
            <GridColumn
              field="cqty"
              title="출고수량"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="saleqty"
              title="판매수량"
              width="100px"
              cell={NumberCell}
              footerCell={gridSumQtyFooterCell}
            />
            <GridColumn
              field="doqty"
              title="잔량"
              width="100px"
              cell={NumberCell}
              footerCell={gridSumQtyFooterCell}
            />
            <GridColumn field="qtyunit" title="단위" width="120px" />
            <GridColumn
              field="wgtunp"
              title="중량단가"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="qtyunp"
              title="수량단가"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="unp"
              title="단가"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="amt"
              title="공급가액"
              width="120px"
              cell={NumberCell}
              footerCell={gridSumQtyFooterCell}
            />
            <GridColumn
              field="taxamt"
              title="세액"
              width="120px"
              cell={NumberCell}
              footerCell={gridSumQtyFooterCell}
            />
            <GridColumn field="lotnum" title="LOT NO" width="120px" />
            <GridColumn field="rcvcustnm" title="인수처명" width="120px" />
            <GridColumn field="poregnum" title="PO번호" width="120px" />
            <GridColumn field="remark" title="비고" width="250px" />
            <GridColumn field="person" title="수주담당자" width="120px" />
          </Grid>
        </GridContainer>
        <GridContainer>
          <GridTitleContainer className="WindowButtonContainer2">
            <ButtonContainer>
              <Button
                onClick={onDeleteClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="minus"
                title="행 삭제"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: isMobile ? mobileheight2 : webheight2 }}
            data={process(
              subDataResult.data.map((row) => ({
                ...row,
                qtyunit: qtyunitListData.find(
                  (item: any) => item.sub_code == row.qtyunit
                )?.code_name,
                itemacnt: itemacntListData.find(
                  (item: any) => item.sub_code == row.itemacnt
                )?.code_name,
                doexdiv: doexdivListData.find(
                  (item: any) => item.sub_code == row.doexdiv
                )?.code_name,
                taxdiv: taxdivListData.find(
                  (item: any) => item.sub_code == row.taxdiv
                )?.code_name,
                reqdt: isValidDate(row.reqdt)
                  ? new Date(dateformat(row.reqdt))
                  : new Date(),
                [SELECTED_FIELD]: subselectedState[idGetter2(row)], //선택된 데이터
              })),
              subDataState
            )}
            onDataStateChange={onSubDataStateChange}
            {...subDataState}
            //선택 subDataState
            dataItemKey={DATA_ITEM_KEY2}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSubSelectionChange}
            //스크롤 조회기능
            fixedScroll={true}
            total={subDataResult.total}
            onScroll={onSubScrollHandler}
            //정렬기능
            sortable={true}
            onSortChange={onSubSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell2}
              cell={CheckBoxCell}
            />
            <GridColumn
              field="orddt"
              title="수주일자"
              cell={DateCell}
              width="100px"
              footerCell={subTotalFooterCell}
            />
            <GridColumn
              field="dlvdt"
              title="납기일자"
              cell={DateCell}
              width="100px"
            />
            <GridColumn field="ordnum" title="수주번호" width="150px" />
            <GridColumn field="custnm" title="업체명" width="200px" />
            <GridColumn field="itemcd" title="품목코드" width="250px" />
            <GridColumn field="itemnm" title="품목명" width="350px" />
            <GridColumn
              field="doqty"
              title="처리량"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn field="qtyunit" title="수량단위" width="100px" />
            <GridColumn
              field="wgtunp"
              title="중량단가"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="qtyunp"
              title="수량단가"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="specialunp"
              title="발주단가"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="specialamt"
              title="발주금액"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="unp"
              title="단가"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="amt"
              title="공급가액"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="taxamt"
              title="세액"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn field="lotnum" title="LOT NO" width="120px" />
            <GridColumn field="remark" title="비고" width="350px" />
          </Grid>
          <BottomContainer className="BottomContainer">
            <ButtonContainer>
              <Button themeColor={"primary"} onClick={selectData}>
                확인
              </Button>
              <Button
                themeColor={"primary"}
                fillMode={"outline"}
                onClick={onClose}
              >
                닫기
              </Button>
            </ButtonContainer>
          </BottomContainer>
        </GridContainer>
      </Window>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"ROW_ADD"}
          setData={setCustData}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"ROW_ADD"}
          setData={setItemData}
        />
      )}
    </>
  );
};

export default CopyWindow;
