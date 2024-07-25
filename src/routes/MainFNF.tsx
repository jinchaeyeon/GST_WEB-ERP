import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridRowProps,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
} from "../CommonStyled";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  convertDateToStr,
  getDeviceHeight,
  getHeight,
  UseGetValueFromSessionItem,
  UsePermissions,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import NoticeWindow_FNF from "../components/Windows/NoticeWindow_FNF";
import { useApi } from "../hooks/api";
import { isLoading, sessionItemState } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let height = 0;
let height2 = 0;
let index = 0;
const Main: React.FC = () => {
  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionCustcd = UseGetValueFromSessionItem("custcd");
  const sessionUserId = UseGetValueFromSessionItem("user_id");

  useLayoutEffect(() => {
    height = getHeight(".ButtonContainer");
    height2 = getHeight(".ButtonContainer2");

    const handleWindowResize = () => {
      let deviceWidth = document.documentElement.clientWidth;
      setIsMobile(deviceWidth <= 1200);
      setMobileHeight(getDeviceHeight(false) - height);
      setMobileHeight2(getDeviceHeight(false) - height2);
      setWebHeight(getDeviceHeight(false) - height);
      setWebHeight2(getDeviceHeight(false) - height2);
    };
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [webheight, webheight2]);
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);

  const [noticeDataState, setNoticeDataState] = useState<State>({
    sort: [],
  });
  const [orderDataState, setOrderDataState] = useState<State>({
    sort: [],
  });
  const [noticeDataResult, setNoticeDataResult] = useState<DataResult>(
    process([], noticeDataState)
  );
  const [orderDataResult, setOrderDataResult] = useState<DataResult>(
    process([], orderDataState)
  );
  const [noticeSelectedState, setNoticeSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [orderSelectedState, setOrderSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const onNoticeDataStateChange = (event: GridDataStateChangeEvent) => {
    setNoticeDataState(event.dataState);
  };
  const onOrderDataStateChange = (event: GridDataStateChangeEvent) => {
    setOrderDataState(event.dataState);
  };
  const noticeTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {noticeDataResult.total}건
      </td>
    );
  };
  const orderTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {orderDataResult.total}건
      </td>
    );
  };
  const onNoticeSortChange = (e: any) => {
    setNoticeDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onOrderSortChange = (e: any) => {
    setOrderDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onNoticeSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: noticeSelectedState,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setNoticeSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setParaData((prev) => ({
      ...prev,
      workType: "U1",
      orgdiv: selectedRowData.ORGDIV,
      datnum: selectedRowData.DATNUM,
      prsnnum: sessionUserId,
    }));
  };
  const onOrderSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: orderSelectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setOrderSelectedState(newSelectedState);
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

  let defaultfrdtdate = new Date();
  let defaulttodtdate = new Date();
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    custcd: sessionCustcd,
    frdt: new Date(defaultfrdtdate.setMonth(defaultfrdtdate.getMonth() - 1)),
    todt: new Date(defaulttodtdate.setMonth(defaulttodtdate.getMonth() + 1)),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q2",
    custcd: sessionCustcd,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const fetchOrder = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    const orderParameters: Iparameters = {
      procedureName: "P_HM_A1000W_628_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_custcd": filters.custcd,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
      },
    };

    setLoading(true);
    try {
      data = await processApi<any>("procedure", orderParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      setOrderDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setOrderSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
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

  const fetchNotice = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    const orderParameters: Iparameters = {
      procedureName: "P_HM_A1000W_628_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_custcd": filters2.custcd,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
      },
    };

    setLoading(true);
    try {
      data = await processApi<any>("procedure", orderParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      setNoticeDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setNoticeSelectedState({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (sessionItem && filters.isSearch && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchOrder(deepCopiedFilters);
    }
  }, [filters, permissions, sessionItem]);

  useEffect(() => {
    if (sessionItem && filters2.isSearch && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchNotice(deepCopiedFilters);
    }
  }, [filters2, permissions, sessionItem]);

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: "",
    datnum: "",
    prsnnum: "",
  });

  const para: Iparameters = {
    procedureName: "P_HM_A1000W_628_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_datnum": paraData.datnum,
      "@p_prsnnum": paraData.prsnnum,
    },
  };

  useEffect(() => {
    if (permissions.save && paraData.workType != "") {
      fetchGridSaved();
    }
  }, [paraData, permissions]);

  const fetchGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      if (paraData.workType == "U1") {
        setDetailWindowVisible(true);
      }
      setParaData({
        workType: "",
        orgdiv: "",
        datnum: "",
        prsnnum: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const onRowDoubleClick = (props: any) => {
    const selectedData = props.dataItem;
    const origin = window.location.origin;
    window.open(origin + `/MA_B2020W_628?go=` + selectedData.dlvdt);
  };

  const rowRender = (
    trElement: React.ReactElement<HTMLTableRowElement>,
    props: GridRowProps
  ) => {
    const available = props.dataItem.LOADOK == 0;
    const blue = { color: "blue" };
    const trProps: any = { style: available ? blue : undefined };
    return React.cloneElement(
      trElement,
      { ...trProps },
      trElement.props.children as any
    );
  };

  return (
    <>
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
                  <GridTitle>수주정보</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{
                    height: mobileheight,
                  }}
                  data={process(
                    orderDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: orderSelectedState[idGetter(row)],
                    })),
                    orderDataState
                  )}
                  {...orderDataState}
                  onDataStateChange={onOrderDataStateChange}
                  //선택기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onOrderSelectionChange}
                  //정렬기능
                  sortable={true}
                  onSortChange={onOrderSortChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={orderDataResult.total}
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={pageChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onRowDoubleClick={onRowDoubleClick}
                >
                  <GridColumn
                    field="dlvdt"
                    title="본사출고일"
                    cell={DateCell}
                    footerCell={orderTotalFooterCell}
                    width="120px"
                  />
                  <GridColumn
                    field="rqty"
                    title="등록"
                    cell={NumberCell}
                    width="100px"
                  />
                  <GridColumn
                    field="iqty"
                    title="접수"
                    cell={NumberCell}
                    width="100px"
                  />
                  <GridColumn
                    field="cqty"
                    title="취소"
                    cell={NumberCell}
                    width="100px"
                  />
                  <GridColumn
                    field="fqty"
                    title="완료"
                    cell={NumberCell}
                    width="100px"
                  />
                  <GridColumn
                    field="aqty"
                    title="총건수"
                    cell={NumberCell}
                    width="100px"
                  />
                </Grid>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>공지사항</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{
                    height: mobileheight2,
                  }}
                  data={process(
                    noticeDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: noticeSelectedState[idGetter2(row)],
                    })),
                    noticeDataState
                  )}
                  {...noticeDataState}
                  onDataStateChange={onNoticeDataStateChange}
                  //선택기능
                  dataItemKey={DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onNoticeSelectionChange}
                  //정렬기능
                  sortable={true}
                  onSortChange={onNoticeSortChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={noticeDataResult.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  rowRender={rowRender}
                >
                  <GridColumn
                    field="TITLE"
                    title="제목"
                    footerCell={noticeTotalFooterCell}
                    width="200px"
                  />
                  <GridColumn
                    field="NOTDATE"
                    title="공지일자"
                    cell={DateCell}
                    width="120px"
                  />
                </Grid>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width="50%">
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>수주정보</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{
                  height: webheight,
                }}
                data={process(
                  orderDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: orderSelectedState[idGetter(row)],
                  })),
                  orderDataState
                )}
                {...orderDataState}
                onDataStateChange={onOrderDataStateChange}
                //선택기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onOrderSelectionChange}
                //정렬기능
                sortable={true}
                onSortChange={onOrderSortChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={orderDataResult.total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                onRowDoubleClick={onRowDoubleClick}
              >
                <GridColumn
                  field="dlvdt"
                  title="본사출고일"
                  cell={DateCell}
                  footerCell={orderTotalFooterCell}
                  width="120px"
                />
                <GridColumn
                  field="rqty"
                  title="등록"
                  cell={NumberCell}
                  width="100px"
                />
                <GridColumn
                  field="iqty"
                  title="접수"
                  cell={NumberCell}
                  width="100px"
                />
                <GridColumn
                  field="cqty"
                  title="취소"
                  cell={NumberCell}
                  width="100px"
                />
                <GridColumn
                  field="fqty"
                  title="완료"
                  cell={NumberCell}
                  width="100px"
                />
                <GridColumn
                  field="aqty"
                  title="총건수"
                  cell={NumberCell}
                  width="100px"
                />
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>공지사항</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{
                  height: webheight2,
                }}
                data={process(
                  noticeDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: noticeSelectedState[idGetter2(row)],
                  })),
                  noticeDataState
                )}
                {...noticeDataState}
                onDataStateChange={onNoticeDataStateChange}
                //선택기능
                dataItemKey={DATA_ITEM_KEY2}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onNoticeSelectionChange}
                //정렬기능
                sortable={true}
                onSortChange={onNoticeSortChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={noticeDataResult.total}
                skip={page2.skip}
                take={page2.take}
                pageable={true}
                onPageChange={pageChange2}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                rowRender={rowRender}
              >
                <GridColumn
                  field="TITLE"
                  title="제목"
                  footerCell={noticeTotalFooterCell}
                  width="200px"
                />
                <GridColumn
                  field="NOTDATE"
                  title="공지일자"
                  cell={DateCell}
                  width="120px"
                />
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
      {detailWindowVisible && (
        <NoticeWindow_FNF
          setVisible={(boolean) => {
            setDetailWindowVisible(boolean);
            setFilters2((prev) => ({
              ...prev,
              isSearch: true
            }))
          }}
          data={
            noticeDataResult.total > 0
              ? noticeDataResult.data.filter(
                  (item: any) =>
                    item[DATA_ITEM_KEY2] ==
                    Object.getOwnPropertyNames(noticeSelectedState)[0]
                )[0]
              : []
          }
          modal={true}
        />
      )}
    </>
  );
};

export default Main;
