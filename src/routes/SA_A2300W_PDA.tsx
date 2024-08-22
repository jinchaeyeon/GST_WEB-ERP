import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import {
  MonthView,
  Scheduler,
  SchedulerItem,
  SchedulerItemProps,
} from "@progress/kendo-react-scheduler";
import { SchedulerItemMouseEvent } from "@progress/kendo-react-scheduler/dist/npm/models";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  GridContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import NumberCell from "../components/Cells/NumberCell";
import {
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  getDeviceHeight,
  getHeight,
  getMenuName,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import { useApi } from "../hooks/api";
import { OSState, isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

const CUSTOMER_ITEM_KEY = "custcd";
const ORDER_ITEM_KEY = "ordkey";
const LOT_ITEM_KEY = "num";

let targetRowIndex: null | number = null;
//let targetRowIndex2: null | number = null;

let lastInputTime: number;
let elapsed: number[];
let barcodeString: string;

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const SA_A2300_PDA: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    view: false,
    delete: false,
    print: false,
  });
  UsePermissions(setPermissions);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);
  const [tabPage, setTabPage] = useState<number>(1);

  useLayoutEffect(() => {
    height = getHeight(".TitleContainer");
    height2 = getHeight(".ButtonContainer");
    height3 = getHeight(".ButtonContainer2");
    height4 = getHeight(".ButtonContainer3");
    const handleWindowResize = () => {
      let deviceWidth = document.documentElement.clientWidth;
      setIsMobile(deviceWidth <= 1200);
      setMobileHeight(getDeviceHeight(false) - height);
      setMobileHeight2(getDeviceHeight(false) - height - height2);
      setMobileHeight3(getDeviceHeight(false) - height - height3);
      setMobileHeight4(getDeviceHeight(false) - height - height4);
      setWebHeight(getDeviceHeight(false) - height);
      setWebHeight2(getDeviceHeight(false) - height - height2);
      setWebHeight3(getDeviceHeight(false) - height - height3);
      setWebHeight4(getDeviceHeight(false) - height - height4);
    };
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [webheight, webheight2, webheight3, webheight4, tabPage]);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  const initialPageState = { skip: 0, take: PAGE_SIZE };

  const tabPageRef = useRef(0);
  tabPageRef.current = tabPage;

  //조회조건 파라미터
  const defaultMainViewParameters: Iparameters = {
    procedureName: "P_SA_A2300W_PDA_Q",
    pageNumber: 1,
    pageSize: 1,
    parameters: {
      "@p_work_type": "",
      "@p_orgdiv": orgdiv,
      "@p_location": location,
      "@p_yyyymmdd": "",
      "@p_custcd": "",
      "@p_lotnum": "",
      "@p_find_row_value": "",
    },
  };

  //조회조건 파라미터
  const defaultMainSaveParameters: Iparameters = {
    procedureName: "P_SA_A2300W_PDA_S",
    pageNumber: 1,
    pageSize: 1,
    parameters: {
      "@p_work_type": "",
      "@p_orgdiv": orgdiv,
      "@p_location": location,
      "@p_ordkey_s": "",
      "@p_lotnum_s": "",
      "@p_qty_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SA_A2300W_PDA",
    },
  };

  const [schedulerDataResult, setSchedulerDataResult] = useState<
    { [id: string]: object }[]
  >([]);

  const fetchScheduler = async () => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    const parameters = {
      ...defaultMainViewParameters,
      parameters: {
        ...defaultMainViewParameters.parameters,
        "@p_work_type": "SCHEDULER",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (data.tables[0]) {
        let rows = data.tables[0].Rows.map((row: any) => ({
          ...row,
          id: row.id,
          title: row.title,
          start: new Date(row.starttime),
          end: new Date(row.endtime),
        }));

        setSchedulerDataResult(rows);
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert(data.resultMessage);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (tabPage == 1 && permissions.view) {
      fetchScheduler();
    }
  }, [tabPage, permissions]);

  const onClickSchedulerItem = (e: SchedulerItemMouseEvent) => {
    const item = e.target.props.dataItem;
    setCustomerFilters((prev) => ({
      ...prev,
      yyyymmdd: item.dlvdt,
      find_row_value: item.custcd,
      isSearch: true,
    }));
    setTabPage(2);
  };

  const CustomItem = (props: SchedulerItemProps) => (
    <SchedulerItem {...props} onClick={onClickSchedulerItem} />
  );
  const [osstate, setOSState] = useRecoilState(OSState);

  const tabPage1 = (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>
      </TitleContainer>
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
          data={
            schedulerDataResult.length > 0 ? schedulerDataResult : undefined
          }
          defaultDate={new Date()}
          item={CustomItem}
        >
          <MonthView />
        </Scheduler>
      )}
    </>
  );

  let customerGridRef: any = useRef(null);
  const customerIdGetter = getter(CUSTOMER_ITEM_KEY);

  const onClickNext = () => {
    // 선택된 업체 전달
    setLotDataResult(process([], lotDataState)); // LOT 목록 초기화
    setOrderFilters((prev) => ({
      ...prev,
      yyyymmdd: customerFilters.yyyymmdd,
      custcd: Object.getOwnPropertyNames(customerSelectedState)[0],
      isSearch: true,
    }));
    setTabPage(3);
  };

  const onClickBefore = () => {
    setTabPage(tabPage - 1);
  };

  const [customerDataState, setCustomerDataState] = useState<State>({
    sort: [],
  });

  const [customerDataResult, setCustomerDataResult] = useState<DataResult>(
    process([], customerDataState)
  );

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && customerGridRef.current) {
      customerGridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [customerDataResult]);

  const [customerSelectedState, setCustomerSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onCustomerDataStateChange = (event: GridDataStateChangeEvent) => {
    setCustomerDataState(event.dataState);
  };

  //메인 그리드 선택 이벤트
  const onCustomerSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: customerSelectedState,
      dataItemKey: CUSTOMER_ITEM_KEY,
    });
    setCustomerSelectedState(newSelectedState);
  };

  const [customerFilters, setCustomerFilters] = useState({
    yyyymmdd: "",
    find_row_value: "",
    pgNum: 1,
    pageSize: PAGE_SIZE,
    isSearch: false,
  });

  useEffect(() => {
    if (customerFilters.isSearch && permissions.view) {
      fetchCustomerGrid();
    }
  }, [customerFilters, permissions]);

  const fetchCustomerGrid = async () => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    const parameters = {
      ...defaultMainViewParameters,
      pageNumber: customerFilters.pgNum,
      pageSize: customerFilters.pageSize,
      parameters: {
        ...defaultMainViewParameters.parameters,
        "@p_work_type": "CUSTOMER",
        "@p_yyyymmdd": customerFilters.yyyymmdd,
        "@p_find_row_value": customerFilters.find_row_value,
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

      if (customerFilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (customerGridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              customerIdGetter(row) == customerFilters.find_row_value
          );
          targetRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setCustomerPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (customerGridRef.current) {
          targetRowIndex = 0;
        }
      }

      setCustomerDataResult(() => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          customerFilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  customerIdGetter(row) == customerFilters.find_row_value
              );

        if (selectedRow != undefined) {
          setCustomerSelectedState({ [selectedRow[CUSTOMER_ITEM_KEY]]: true });
        } else {
          setCustomerSelectedState({ [rows[0][CUSTOMER_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert(data.resultMessage);
    }
    setCustomerFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const [customerPage, setCustomerPage] = useState(initialPageState);

  const customerPageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setCustomerFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setCustomerPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 푸터
  const customerTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = customerDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {customerDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const customerSumFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    customerDataResult.data.forEach((item) =>
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

  const scan = (scannedBarcode: string) => {
    const gubun = scannedBarcode.substring(0, 1);

    if (gubun == "L") {
      const valueString = scannedBarcode.substring(1);

      setLotFilters((prev) => ({
        ...prev,
        lotnum: valueString,
        isSearch: true,
      }));
    }
  };

  // 입력 시간으로 바코드 스캔인지 구분
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) {
      return;
    }

    let a = e.timeStamp - lastInputTime;
    elapsed.push(a);

    if (a > 25) {
      // 25: 스캐너 문자 사이 이벤트 발생 간격
      // 초기화
      barcodeString = e.key.length == 1 ? e.key : "";

      elapsed = [];
    } else {
      if (e.key == "Enter" && !!barcodeString) {
        scan(barcodeString);
        barcodeString = "";

        if (elapsed.length > 1) {
          elapsed[0] = 0;
        }
        lastInputTime = 0;
        return;
      } else if (e.key.length == 1) {
        barcodeString += e.key;
      }
    }

    lastInputTime = e.timeStamp;
  };

  useEffect(() => {
    // 초기화
    barcodeString = "";
    elapsed = [];
    lastInputTime = 0;
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const tabPage2 = (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>
      </TitleContainer>
      <GridContainer>
        <ButtonContainer
          className="ButtonContainer"
          style={{ justifyContent: "space-between" }}
        >
          <Button
            onClick={onClickBefore}
            themeColor={"primary"}
            icon="arrow-left"
            fillMode="outline"
            disabled={permissions.view ? false : true}
          >
            이전
          </Button>
          <Button
            onClick={onClickNext}
            themeColor={"primary"}
            icon="arrow-right"
            disabled={permissions.view ? false : true}
          >
            다음
          </Button>
        </ButtonContainer>
        <Grid
          style={{ height: isMobile ? mobileheight2 : webheight2 }}
          data={process(
            customerDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: customerSelectedState[customerIdGetter(row)],
            })),
            customerDataState
          )}
          {...customerDataState}
          onDataStateChange={onCustomerDataStateChange}
          //선택 기능
          dataItemKey={CUSTOMER_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onCustomerSelectionChange}
          //스크롤 조회 기능
          fixedScroll={true}
          total={customerDataResult.total}
          skip={customerPage.skip}
          take={customerPage.take}
          pageable={true}
          onPageChange={customerPageChange}
          //원하는 행 위치로 스크롤 기능
          ref={customerGridRef}
          rowHeight={30}
          //정렬기능
          //sortable={true}
          //onSortChange={onMainSortChange}
          //컬럼순서조정
          //reorderable={true}
          //컬럼너비조정
          resizable={true}
        >
          <GridColumn
            field="custnm"
            title="업체명"
            width={200}
            footerCell={customerTotalFooterCell}
          />
          <GridColumn
            field="cnt"
            title="건수"
            width={70}
            cell={NumberCell}
            footerCell={customerSumFooterCell}
          />
          {/* <GridColumn field="custnm" title="업체명" width={"50%"} footerCell={customerTotalFooterCell} />
        <GridColumn field="cnt" title="건수" width={"50%"} cell={NumberCell} footerCell={customerSumFooterCell} /> */}
        </Grid>
      </GridContainer>
    </>
  );

  let orderGridRef: any = useRef(null);
  const orderIdGetter = getter(ORDER_ITEM_KEY);

  const [orderDataState, setOrderDataState] = useState<State>({
    sort: [],
  });

  const [orderDataResult, setOrderDataResult] = useState<DataResult>(
    process([], orderDataState)
  );

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && orderGridRef.current) {
      orderGridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [orderDataResult]);

  const [orderSelectedState, setOrderSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onOrderDataStateChange = (event: GridDataStateChangeEvent) => {
    setOrderDataState(event.dataState);
  };

  //메인 그리드 선택 이벤트
  const onOrderSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: orderSelectedState,
      dataItemKey: ORDER_ITEM_KEY,
    });
    setOrderSelectedState(newSelectedState);
  };

  const [orderFilters, setOrderFilters] = useState({
    yyyymmdd: "",
    custcd: "",
    find_row_value: "",
    pgNum: 1,
    pageSize: PAGE_SIZE,
    isSearch: false,
  });

  useEffect(() => {
    if (orderFilters.isSearch && permissions.view) {
      fetchOrderGrid();
    }
  }, [orderFilters, permissions]);

  const fetchOrderGrid = async () => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    const parameters = {
      ...defaultMainViewParameters,
      pageNumber: orderFilters.pgNum,
      pageSize: orderFilters.pageSize,
      parameters: {
        ...defaultMainViewParameters.parameters,
        "@p_work_type": "ORDER",
        "@p_yyyymmdd": orderFilters.yyyymmdd,
        "@p_custcd": orderFilters.custcd,
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

      if (orderFilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (orderGridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => orderIdGetter(row) == orderFilters.find_row_value
          );
          targetRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setOrderPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (orderGridRef.current) {
          targetRowIndex = 0;
        }
      }

      setOrderDataResult(() => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          orderFilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => orderIdGetter(row) == orderFilters.find_row_value
              );

        if (selectedRow != undefined) {
          setOrderSelectedState({ [selectedRow[ORDER_ITEM_KEY]]: true });
        } else {
          setOrderSelectedState({ [rows[0][ORDER_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert(data.resultMessage);
    }
    setOrderFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const [orderPage, setOrderPage] = useState(initialPageState);

  const orderPageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setOrderFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setOrderPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 푸터
  const orderTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = orderDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {orderDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const orderSumFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    orderDataResult.data.forEach((item) =>
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

  const onClickLot = () => {
    setTabPage(4);
  };

  const tabPage3 = (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>
      </TitleContainer>
      <GridContainer>
        <ButtonContainer
          className="ButtonContainer2"
          style={{ justifyContent: "space-between" }}
        >
          <Button
            onClick={onClickBefore}
            themeColor={"primary"}
            icon="arrow-left"
            fillMode="outline"
            disabled={permissions.view ? false : true}
          >
            이전
          </Button>
          <Button
            onClick={onClickLot}
            themeColor={"primary"}
            icon="detail-section"
            disabled={permissions.view ? false : true}
          >
            리딩 목록
          </Button>
        </ButtonContainer>
        <Grid
          style={{ height: isMobile ? mobileheight3 : webheight3 }}
          data={process(
            orderDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: orderSelectedState[orderIdGetter(row)],
            })),
            orderDataState
          )}
          {...orderDataState}
          onDataStateChange={onOrderDataStateChange}
          //선택 기능
          dataItemKey={ORDER_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onOrderSelectionChange}
          //스크롤 조회 기능
          fixedScroll={true}
          total={orderDataResult.total}
          skip={orderPage.skip}
          take={orderPage.take}
          pageable={true}
          onPageChange={orderPageChange}
          //원하는 행 위치로 스크롤 기능
          //ref={gridRef}
          rowHeight={30}
          //정렬기능
          //sortable={true}
          //onSortChange={onMainSortChange}
          //컬럼순서조정
          //reorderable={true}
          //컬럼너비조정
          resizable={true}
        >
          <GridColumn
            field="itemnm"
            title="품목"
            width={200}
            footerCell={orderTotalFooterCell}
          />
          <GridColumn
            field="janqty"
            title="수량"
            width={70}
            cell={NumberCell}
            footerCell={orderSumFooterCell}
          />
        </Grid>
      </GridContainer>
    </>
  );

  let lotGridRef: any = useRef(null);
  const lotIdGetter = getter(LOT_ITEM_KEY);

  const saveLotGrid = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);

    let ordkey_s: string[] = [];
    let lotnum_s: string[] = [];
    let qty_s: string[] = [];

    lotDataResult.data.forEach((row) => {
      const { ordkey = "", lotnum = "", qty = "" } = row;

      ordkey_s.push(ordkey);
      lotnum_s.push(lotnum);
      qty_s.push(qty);
    });

    const parameters = {
      ...defaultMainSaveParameters,
      parameters: {
        ...defaultMainSaveParameters.parameters,
        "@p_work_type": "N",
        "@p_ordkey_s": ordkey_s.join("|"),
        "@p_lotnum_s": lotnum_s.join("|"),
        "@p_qty_s": qty_s.join("|"),
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setLotPage({
        skip:
          lotFilters.pgNum == 1 || lotFilters.pgNum == 0
            ? 0
            : PAGE_SIZE * (lotFilters.pgNum - 2),
        take: PAGE_SIZE,
      });

      setLotFilters((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: prev.pgNum != 1 ? prev.pgNum - 1 : prev.pgNum,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const onClickConfirm = () => {
    saveLotGrid();
  };

  const onClickDelete = () => {
    if (lotDataResult.data.length <= 0) {
      return;
    }

    let keepingRows: any[] = []; // 삭제 안 할 데이터
    let deletedIndices: any[] = []; // 삭제할 데이터의 인덱스 값
    let keepingIndices: any[] = []; // 삭제 안 할 데이터의 인덱스 값
    let selectRow; // 포커스 이동할 행

    lotDataResult.data.forEach((item: any, index: number) => {
      if (!lotSelectedState[item[LOT_ITEM_KEY]]) {
        keepingRows.push(item);
        keepingIndices.push(index);
      } else {
        deletedIndices.push(index);
      }
    });

    if (Math.min(...deletedIndices) < Math.min(...keepingIndices)) {
      selectRow = lotDataResult.data[Math.min(...keepingIndices)];
    } else {
      selectRow = lotDataResult.data[Math.min(...deletedIndices) - 1];
    }

    // DataResult 업데이트
    setLotDataResult((prev) => ({
      data: keepingRows,
      total: prev.total - deletedIndices.length,
    }));

    setLotSelectedState({
      [selectRow != undefined
        ? selectRow[LOT_ITEM_KEY]
        : keepingRows[0][LOT_ITEM_KEY]]: true,
    });
  };

  const [lotDataState, setLotDataState] = useState<State>({
    sort: [],
  });

  const [lotDataResult, setLotDataResult] = useState<DataResult>(
    process([], lotDataState)
  );

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && lotGridRef.current) {
      lotGridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [lotDataResult]);

  const [lotSelectedState, setLotSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onLotDataStateChange = (event: GridDataStateChangeEvent) => {
    setLotDataState(event.dataState);
  };

  //메인 그리드 선택 이벤트
  const onLotSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: lotSelectedState,
      dataItemKey: LOT_ITEM_KEY,
    });
    setLotSelectedState(newSelectedState);
  };

  const [lotFilters, setLotFilters] = useState({
    lotnum: "",
    pgNum: 1,
    pageSize: PAGE_SIZE,
    isSearch: false,
  });

  useEffect(() => {
    if (lotFilters.isSearch && permissions.view) {
      fetchLotGrid();
    }
  }, [lotFilters, permissions]);

  const chkQty = (row: any) => {
    const ordkey = row.ordkey;

    const orders = orderDataResult.data.filter((item) => item.ordkey == ordkey);
    let janqty: number = 0;

    const lots = lotDataResult.data.filter((item) => item.ordkey == ordkey);
    let outqty: number = row.qty;

    if (orders && orders.length > 0) {
      janqty += orders
        .map((order) => order.janqty)
        .reduce((a: any, b: any) => a + b, 0);
    }

    if (lots && lots.length > 0) {
      outqty += lots.map((lot) => lot.qty).reduce((a: any, b: any) => a + b, 0);
    }

    return janqty >= outqty;
  };

  const fetchLotGrid = async () => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    const parameters = {
      ...defaultMainViewParameters,
      pageNumber: 1,
      pageSize: 1,
      parameters: {
        ...defaultMainViewParameters.parameters,
        "@p_work_type": "LOT",
        "@p_yyyymmdd": orderFilters.yyyymmdd,
        "@p_custcd": orderFilters.custcd,
        "@p_lotnum": lotFilters.lotnum,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const num = lotDataResult.total ? lotDataResult.total : 0;

      let valid = true;
      const rows = data.tables[0].Rows.map((row: any, index: number) => {
        if (!chkQty(row) && valid == true) {
          alert("수주량을 초과하여 출하할 수 없습니다.");
          valid = false;
        }

        return {
          ...row,
          num: num + index,
        };
      });

      if (valid) {
        const totalRows: Array<any> = [...lotDataResult.data, ...rows];

        const totalRowCnt = totalRows.length; //data.tables[0].TotalRowCount;

        if (num !== 0) {
          // find_row_value 행으로 스크롤 이동
          if (lotGridRef.current) {
            const findRowIndex = totalRows.findIndex(
              (row: any) => lotIdGetter(row) == num
            );
            targetRowIndex = findRowIndex;
          }
        }

        setLotDataResult(() => {
          return {
            data: totalRows, //{...prev.data, rows},
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });

        if (totalRowCnt > 0) {
          const selectedRow =
            num == 0
              ? totalRows[0]
              : totalRows.find((row: any) => lotIdGetter(row) == num);

          if (selectedRow != undefined) {
            setLotSelectedState({ [selectedRow[LOT_ITEM_KEY]]: true });
          } else {
            setLotSelectedState({ [totalRows[0][LOT_ITEM_KEY]]: true });
          }
        }
      }
      setLotFilters((prev) => ({
        ...prev,
        pgNum:
          data && data.hasOwnProperty("pageNumber")
            ? data.pageNumber
            : prev.pgNum,
        isSearch: false,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const [lotPage, setLotPage] = useState(initialPageState);

  const lotPageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setLotFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setLotPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 푸터
  const lotTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = lotDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {lotDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const lotSumFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    lotDataResult.data.forEach((item) =>
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

  const tabPage4 = (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>
      </TitleContainer>
      <GridContainer>
        <ButtonContainer
          className="ButtonContainer3"
          style={{ justifyContent: "space-between" }}
        >
          <Button
            onClick={onClickBefore}
            themeColor={"primary"}
            icon="arrow-left"
            fillMode="outline"
            disabled={permissions.view ? false : true}
          >
            이전
          </Button>
          <ButtonContainer>
            <Button
              onClick={onClickDelete}
              themeColor={"primary"}
              icon="delete"
              fillMode="outline"
              disabled={permissions.save ? false : true}
            >
              삭제
            </Button>
            <Button
              onClick={onClickConfirm}
              themeColor={"primary"}
              icon="check-circle"
              disabled={permissions.save ? false : true}
            >
              확인
            </Button>
          </ButtonContainer>
        </ButtonContainer>
        <Grid
          style={{ height: isMobile ? mobileheight4 : webheight4 }}
          data={process(
            lotDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: lotSelectedState[lotIdGetter(row)],
            })),
            lotDataState
          )}
          {...lotDataState}
          onDataStateChange={onLotDataStateChange}
          //선택 기능
          dataItemKey={LOT_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onLotSelectionChange}
          //스크롤 조회 기능
          fixedScroll={true}
          total={lotDataResult.total}
          skip={lotPage.skip}
          take={lotPage.take}
          pageable={true}
          onPageChange={lotPageChange}
          //원하는 행 위치로 스크롤 기능
          //ref={gridRef}
          rowHeight={30}
          //정렬기능
          //sortable={true}
          //onSortChange={onMainSortChange}
          //컬럼순서조정
          //relotable={true}
          //컬럼너비조정
          resizable={true}
        >
          <GridColumn
            field="itemnm"
            title="품목"
            width={120}
            footerCell={lotTotalFooterCell}
          />
          <GridColumn field="lotnum" title="LOTNO" width={120} />
          <GridColumn
            field="qty"
            title="수량"
            width={70}
            cell={NumberCell}
            footerCell={lotSumFooterCell}
          />
        </Grid>
      </GridContainer>
    </>
  );

  return (
    <>
      {tabPage == 1 && tabPage1}
      {tabPage == 2 && tabPage2}
      {tabPage == 3 && tabPage3}
      {tabPage == 4 && tabPage4}
    </>
  );
};

export default SA_A2300_PDA;
