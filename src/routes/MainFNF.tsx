import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import React, { useLayoutEffect, useState } from "react";
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
import { getDeviceHeight, getHeight } from "../components/CommonFunction";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let height = 0;
let height2 = 0;
let index = 0;
const Main: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

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

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

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
                >
                  <GridColumn
                    field="dlvdt"
                    title="본사출고일"
                    cell={DateCell}
                    footerCell={noticeTotalFooterCell}
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
                >
                  <GridColumn
                    field="TITLE"
                    title="제목"
                    footerCell={noticeTotalFooterCell}
                    width="200px"
                  />
                  <GridColumn
                    field="D_NOTDATE"
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
              >
                <GridColumn
                  field="dlvdt"
                  title="본사출고일"
                  cell={DateCell}
                  footerCell={noticeTotalFooterCell}
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
              >
                <GridColumn
                  field="TITLE"
                  title="제목"
                  footerCell={noticeTotalFooterCell}
                  width="200px"
                />
                <GridColumn
                  field="D_NOTDATE"
                  title="공지일자"
                  cell={DateCell}
                  width="120px"
                />
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
    </>
  );
};

export default Main;
