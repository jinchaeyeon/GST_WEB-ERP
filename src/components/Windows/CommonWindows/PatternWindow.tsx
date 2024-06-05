import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { isFilterHideState2, isLoading } from "../../../store/atoms";
import { Iparameters } from "../../../store/types";
import NumberCell from "../../Cells/NumberCell";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  getBizCom,
  getHeight,
  getWindowDeviceHeight,
} from "../../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../../CommonString";
import Window from "../WindowComponent/Window";

const DATA_ITEM_KEY = "pattern_id";
const DATA_ITEM_KEY2 = "num";

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

type TPara = {
  user_id: string;
  user_name: string;
};
type TKendoWindow = {
  getVisible(isVisible: boolean): void;
  setData(data: object): void;
  para: TPara;
  modal?: boolean;
};
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
const KendoWindow = ({
  getVisible,
  setData,
  para = { user_id: "", user_name: "" },
  modal = false,
}: TKendoWindow) => {
  // 비즈니스 컴포넌트 조회
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA011,L_PR010", setBizComponentData);

  const [outprocynListData, setOutprocynListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [proccdListData, setProccdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  React.useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".BottomContainer"); //하단 버튼부분
    height3 = getHeight(".WindowButtonContainer");
    height4 = getHeight(".WindowButtonContainer2");
    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height - height2 - height3
    );
    setMobileHeight2(
      getWindowDeviceHeight(false, deviceHeight) - height - height2 - height4
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2 - height3
    );
    setWebHeight2(
      getWindowDeviceHeight(false, position.height) - height - height2 - height4
    );
  }, []);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2 - height3
    );
    setWebHeight2(
      getWindowDeviceHeight(false, position.height) - height - height2 - height4
    );
  };
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 670) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 670,
  });
  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);

  const onClose = () => {
    setisFilterHideStates2(true);
    getVisible(false);
  };

  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
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
    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));

    setPage2(initialPageState);
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

  const [detailState, setDetailDataState] = useState<State>({
    sort: [],
  });

  const [detailState2, setDetailDataState2] = useState<State>({
    sort: [],
  });

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailState)
  );

  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailState2)
  );

  const [selecteddetailState, setSelectedDetailState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selecteddetailState2, setSelectedDetailState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    pattern_id: "",
    pattern_name: "",
    proccd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    pattern_id: "",
    pattern_name: "",
    proccd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  //상세그리드 조회
  const fetchGrid = async (filters: any) => {
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0050W_Sub2_Q ",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_pattern_id": filters.pattern_id,
        "@p_pattern_name": filters.pattern_name,
        "@p_proccd": filters.proccd,
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
      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedDetailState({ [selectedRow[DATA_ITEM_KEY]]: true });

          setFilters2((prev) => ({
            ...prev,
            pattern_id: selectedRow.pattern_id,
            isSearch: true,
          }));
        } else {
          setSelectedDetailState({ [rows[0][DATA_ITEM_KEY]]: true });

          setFilters2((prev) => ({
            ...prev,
            pattern_id: rows[0].pattern_id,
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
  //상세그리드 조회
  const fetchGrid2 = async (filters2: any) => {
    let data: any;

    //조회조건 파라미터
    const parameters2: Iparameters = {
      procedureName: "P_BA_A0050W_Sub2_Q ",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters2.orgdiv,
        "@p_location": filters2.location,
        "@p_pattern_id": filters2.pattern_id,
        "@p_pattern_name": filters2.pattern_name,
        "@p_proccd": filters2.proccd,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters2);
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
      if (filters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[DATA_ITEM_KEY2] == filters2.find_row_value
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

      setDetailDataResult2(() => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters2.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY2] == filters2.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedDetailState2({ [selectedRow[DATA_ITEM_KEY2]]: true });
        } else {
          setSelectedDetailState2({ [rows[0][DATA_ITEM_KEY2]]: true });
        }
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

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [detailDataResult]);

  useEffect(() => {
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [detailDataResult2]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setOutprocynListData(getBizCom(bizComponentData, "L_BA011"));
      setProccdListData(getBizCom(bizComponentData, "L_PR010"));
    }
  }, [bizComponentData]);

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (filters2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };
  const onDetailDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setDetailDataState2(event.dataState);
  };

  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = detailDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onDetailDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selecteddetailState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedDetailState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters2((prev) => ({
      ...prev,
      pattern_id: selectedRowData.pattern_id,
      isSearch: true,
      pgNum: 1,
    }));
    setPage2(initialPageState);
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onDetailDataSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selecteddetailState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedDetailState2(newSelectedState);
  };

  const onRowDoubleClick = async (props: any) => {
    let data: any;
    const parameters2: Iparameters = {
      procedureName: "P_BA_A0050W_Sub2_Q ",
      pageNumber: 1,
      pageSize: detailDataResult2.total + 1,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters2.orgdiv,
        "@p_location": filters2.location,
        "@p_pattern_id": filters2.pattern_id,
        "@p_pattern_name": filters2.pattern_name,
        "@p_proccd": filters2.proccd,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      setData(rows);
      onClose();
    }
  };

  return (
    <Window
      titles={"패턴공정도 참조"}
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
            <GridContainer style={{ width: "100%" }}>
              <GridTitleContainer className="WindowButtonContainer">
                <GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    요약정보
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
                </GridTitle>
              </GridTitleContainer>
              <Grid
                data={process(
                  detailDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selecteddetailState[idGetter(row)], //선택된 데이터
                  })),
                  detailState
                )}
                {...detailState}
                onDataStateChange={onDetailDataStateChange}
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onDetailDataSelectionChange}
                //스크롤 조회기능
                fixedScroll={true}
                total={detailDataResult.total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onDetailSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                style={{ height: mobileheight }}
              >
                <GridColumn
                  field="pattern_id"
                  title="패턴ID"
                  width="120px"
                  footerCell={detailTotalFooterCell}
                />
                <GridColumn field="pattern_name" title="패턴명" width="185px" />
                <GridColumn field="remark" title="비고" width="200px" />
              </Grid>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={1}>
            <GridContainer style={{ width: "100%" }}>
              <GridTitleContainer className="WindowButtonContainer2">
                <GridTitle>
                  <ButtonContainer style={{ justifyContent: "left" }}>
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
                    상세정보
                  </ButtonContainer>
                </GridTitle>
              </GridTitleContainer>
              <Grid
                data={process(
                  detailDataResult2.data.map((row) => ({
                    ...row,
                    outprocyn: outprocynListData.find(
                      (items: any) => items.sub_code == row.outprocyn
                    )?.code_name,
                    proccd: proccdListData.find(
                      (items: any) => items.sub_code == row.proccd
                    )?.code_name,
                    [SELECTED_FIELD]: selecteddetailState2[idGetter2(row)], //선택된 데이터
                  })),
                  detailState2
                )}
                {...detailState2}
                onDataStateChange={onDetailDataStateChange2}
                dataItemKey={DATA_ITEM_KEY2}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                //스크롤 조회기능
                fixedScroll={true}
                total={detailDataResult2.total}
                skip={page2.skip}
                take={page2.take}
                pageable={true}
                onPageChange={pageChange2}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef2}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onDetailSortChange2}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                onSelectionChange={onDetailDataSelectionChange2}
                onRowDoubleClick={onRowDoubleClick}
                style={{ height: mobileheight2 }}
              >
                <GridColumn
                  field="proccd"
                  title="공정"
                  width="165px"
                  footerCell={detailTotalFooterCell2}
                />
                <GridColumn
                  field="procseq"
                  title="공정순서"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn field="outprocyn" title="외주구분" width="120px" />
                <GridColumn field="remark" title="비고" width="200px" />
              </Grid>
            </GridContainer>
          </SwiperSlide>
        </Swiper>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width={`45%`}>
              <GridTitleContainer className="WindowButtonContainer">
                <GridTitle>요약정보</GridTitle>
              </GridTitleContainer>
              <Grid
                data={process(
                  detailDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selecteddetailState[idGetter(row)], //선택된 데이터
                  })),
                  detailState
                )}
                {...detailState}
                onDataStateChange={onDetailDataStateChange}
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onDetailDataSelectionChange}
                //스크롤 조회기능
                fixedScroll={true}
                total={detailDataResult.total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onDetailSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                style={{ height: webheight }}
              >
                <GridColumn
                  field="pattern_id"
                  title="패턴ID"
                  width="120px"
                  footerCell={detailTotalFooterCell}
                />
                <GridColumn field="pattern_name" title="패턴명" width="185px" />
                <GridColumn field="remark" title="비고" width="200px" />
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(55% - ${GAP}px)`}>
              <GridTitleContainer className="WindowButtonContainer2">
                <GridTitle>상세정보</GridTitle>
              </GridTitleContainer>
              <Grid
                data={process(
                  detailDataResult2.data.map((row) => ({
                    ...row,
                    outprocyn: outprocynListData.find(
                      (items: any) => items.sub_code == row.outprocyn
                    )?.code_name,
                    proccd: proccdListData.find(
                      (items: any) => items.sub_code == row.proccd
                    )?.code_name,
                    [SELECTED_FIELD]: selecteddetailState2[idGetter2(row)], //선택된 데이터
                  })),
                  detailState2
                )}
                {...detailState2}
                onDataStateChange={onDetailDataStateChange2}
                dataItemKey={DATA_ITEM_KEY2}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                //스크롤 조회기능
                fixedScroll={true}
                total={detailDataResult2.total}
                skip={page2.skip}
                take={page2.take}
                pageable={true}
                onPageChange={pageChange2}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef2}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onDetailSortChange2}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                onSelectionChange={onDetailDataSelectionChange2}
                onRowDoubleClick={onRowDoubleClick}
                style={{ height: webheight2 }}
              >
                <GridColumn
                  field="proccd"
                  title="공정"
                  width="165px"
                  footerCell={detailTotalFooterCell2}
                />
                <GridColumn
                  field="procseq"
                  title="공정순서"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn field="outprocyn" title="외주구분" width="120px" />
                <GridColumn field="remark" title="비고" width="200px" />
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
      <BottomContainer className="BottomContainer">
        <ButtonContainer>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default KendoWindow;
