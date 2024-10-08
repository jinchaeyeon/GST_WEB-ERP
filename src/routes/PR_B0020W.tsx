import {
  DataResult,
  GroupDescriptor,
  GroupResult,
  State,
  groupBy,
  process,
} from "@progress/kendo-data-query";
import { Barcode } from "@progress/kendo-react-barcodes";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import {
  setExpandedState,
  setGroupIds,
} from "@progress/kendo-react-data-tools";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridExpandChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "@progress/kendo-react-layout";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  PrimaryP,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { CellRender, RowRender } from "../components/Renderers/GroupRenderers";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/PR_B0020W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
const centerField = ["code"];
const cardField: any[] = [];

const initialGroup: GroupDescriptor[] = [{ field: "group_category_name" }];

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};

var height = 0;
var height2 = 0;
var height3 = 0;

const PR_B0020W: React.FC = () => {
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [bizComponentData, setBizComponentData] = useState<any>(null);

  const [cards, setCards] = React.useState<any>(null);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".ButtonContainer2");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height3);
        setWebHeight(getDeviceHeight(true) - height - height2);
        setWebHeight2(getDeviceHeight(true) - height - height3);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      onResetCard();
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  // 바코드구분
  UseBizComponent("L_BA090", setBizComponentData);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const [loginResult] = useRecoilState(loginResultState);
  const [group, setGroup] = React.useState(initialGroup);
  const [resultState, setResultState] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );
  const [collapsedState, setCollapsedState] = React.useState<string[]>([]);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST",
    code: "",
    name: "",
    cboDiv: "",
    company_code: loginResult.companyCode,
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: false,
    pgGap: 0,
  });

  let gridRef: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    const parameters: Iparameters = {
      procedureName: "P_PR_B0020W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_code": filters.code,
        "@p_name": filters.name,
        "@p_div": filters.cboDiv,
        "@p_company_code": filters.company_code,
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
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
          groupId: row.gubun + "gubun",
          group_category_name: "구분" + ":" + row.gubun,
          chk: row.chk == "Y" ? true : row.chk == "N" ? false : row.chk,
        };
      });

      const newDataState = processWithGroups(rows, group);
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setResultState(newDataState);

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.num == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[에러발생]");
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

  const onExpandChange = React.useCallback(
    (event: GridExpandChangeEvent) => {
      const item = event.dataItem;

      if (item.groupId) {
        const collapsedIds = !event.value
          ? [...collapsedState, item.groupId]
          : collapsedState.filter((groupId) => groupId != item.groupId);
        setCollapsedState(collapsedIds);
      }
    },
    [collapsedState]
  );

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
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  const newData = setExpandedState({
    data: resultState,
    collapsedIds: collapsedState,
  });

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "코드내역";
      _export.save(optionsGridOne);
    }
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

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
  };

  //그리드 푸터
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

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
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

  const CustomCheckBoxCell1 = (props: GridCellProps) => {
    const { dataItem, field } = props;
    if (props.rowType == "groupHeader") {
      return null;
    }

    const handleChange = () => {
      const newData = mainDataResult.data.map((item) =>
        item.num == dataItem.num
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              chk:
                typeof item.chk == "boolean"
                  ? !item.chk
                  : item.chk == "Y"
                  ? false
                  : true,
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
      const newDataState = processWithGroups(newData, group);
      setResultState(newDataState);
    };

    return (
      <td style={{ textAlign: "center" }}>
        <Checkbox value={dataItem["chk"]} onClick={handleChange}></Checkbox>
      </td>
    );
  };

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field == "chk") {
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
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
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
    const newDataState = processWithGroups(newData, group);
    setResultState(newDataState);
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

  // 바코드 추가
  const onAddCard = () => {
    const selectRows = mainDataResult.data.filter((item: any) => {
      return item.chk == true;
    });

    if (cardField.length == 0) {
      selectRows.forEach((item: any) => {
        cardField.push(item);
      });
    } else {
      // 추가된 바코드는 체크되어 있어도 추가되지 않게 불일치 요소
      const cardtest = selectRows.filter((item) => {
        return !cardField.some(
          (x) => x.code == item.code && x.name == item.name
        );
      });

      for (var i = 0; i < cardtest.length; i++) {
        cardField.push(cardtest[i]);
      }
    }

    setCards(cardField);
    setMainDataResult({ ...mainDataResult });
    // 카드 삭제, 초기화 이후에도 카드가 바로 반영되게끔 선언.

    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  // 바코드 초기화
  const onResetCard = () => {
    cardField.length = 0;
    setCards(cardField);

    // Grid 체크 초기화
    const resetCheck = mainDataResult.data.map((row: any) => {
      return {
        ...row,
        chk: "N",
      };
    });

    setMainDataResult((prev) => {
      return {
        data: resetCheck,
        total: prev.total,
      };
    });
  };

  // 선택 바코드 삭제
  const onDeleteCard = (index: any, items: any) => {
    // 삭제 안할 바코드 newData push
    let newData: any[] = [];
    for (var i = 0; i < cardField.length; i++) {
      if (index != i) {
        newData.push(cardField[i]);
      }
    }

    // cardField 초기화 후 재할당
    cardField.length = 0;
    newData.map((row: any) => {
      cardField.push(row);
    });

    // 해당 코드 행 체크 초기화
    let resetCheck = mainDataResult.data.map((item: any) => {
      if (item.code == items) {
        item.chk = "N";
      }
      return item;
    });

    resetCheck = resetCheck.map((row: any) => {
      return {
        ...row,
      };
    });

    setMainDataResult((prev) => {
      return {
        data: resetCheck,
        total: prev.total,
      };
    });
  };

  const componentRef = useRef(null);

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
        <FilterBox>
          <tbody>
            <tr>
              <th>바코드구분</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="cboDiv"
                    value={filters.cboDiv}
                    bizComponentId="L_BA090"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>코드</th>
              <td>
                <Input
                  name="code"
                  type="text"
                  value={filters.code}
                  onChange={filterInputChange}
                />
              </td>
              <th>코드명</th>
              <td>
                <Input
                  name="name"
                  type="text"
                  value={filters.name}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

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
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>코드내역</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddCard}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="image-export"
                    disabled={permissions.view ? false : true}
                  >
                    바코드 추가
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={newData}
                ref={(exporter) => {
                  _export = exporter;
                }}
                group={group}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: mobileheight }}
                  data={newData.map((item: { items: any[] }) => ({
                    ...item,
                    items: item.items.map((row: any) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                  }))}
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
                  //그룹기능
                  group={group}
                  groupable={true}
                  onExpandChange={onExpandChange}
                  expandField="expanded"
                  //incell 수정 기능
                  onItemChange={onMainItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  <GridColumn
                    field="chk"
                    title=" "
                    width="45px"
                    headerCell={CustomCheckBoxCell}
                    cell={CustomCheckBoxCell1}
                  />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                centerField.includes(item.fieldName)
                                  ? CenterCell
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
          <SwiperSlide key={1}>
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>바코드 추가목록</GridTitle>
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
                  <ButtonContainer>
                    <Button
                      onClick={onResetCard}
                      fillMode="outline"
                      themeColor={"primary"}
                      disabled={permissions.view ? false : true}
                    >
                      초기화
                    </Button>
                    <ReactToPrint
                      trigger={() => (
                        <Button
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="print"
                          disabled={permissions.print ? false : true}
                        >
                          출력
                        </Button>
                      )}
                      content={() => componentRef.current}
                    />
                  </ButtonContainer>
                </ButtonContainer>
              </GridTitleContainer>
              <PrimaryP className="ButtonContainer2">
                ※ 바코드 카드 우측 상단의 x 버튼 클릭하여 삭제 / 한 코드당 한
                개만 추가 가능
              </PrimaryP>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  height: mobileheight2,
                  overflow: "auto",
                }}
                ref={componentRef}
              >
                {cards !== null &&
                  cards.map((item: any, index: number) => {
                    return (
                      <div key={index}>
                        <Card
                          style={{
                            width: "300px",
                            height: "180px",
                            boxShadow: "0 0 4px 0 rgba(0, 0, 0, .2)",
                            marginLeft: "20px",
                            marginRight: "20px",
                            marginTop: "30px",
                            marginBottom: "10px",
                          }}
                        >
                          <CardHeader
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              height: "50px",
                            }}
                          >
                            <div>
                              <CardTitle>{item.name}</CardTitle>
                            </div>
                            <div className="nonprintable">
                              <Button
                                onClick={() => {
                                  onDeleteCard(index, item.code);
                                }}
                                fillMode="flat"
                                icon="close-circle"
                              ></Button>
                            </div>
                          </CardHeader>
                          <CardBody
                            style={{
                              margin: "15px",
                              fontSize: "20px",
                              textAlign: "center",
                            }}
                          >
                            <tr>
                              <td>
                                <Barcode
                                  type="Code128"
                                  height={80}
                                  value={item.barcode}
                                />
                              </td>
                            </tr>
                          </CardBody>
                        </Card>
                      </div>
                    );
                  })}
              </div>
            </GridContainer>
          </SwiperSlide>
        </Swiper>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width="30%">
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>코드내역</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddCard}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="image-export"
                    disabled={permissions.view ? false : true}
                  >
                    바코드 추가
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={newData}
                ref={(exporter) => {
                  _export = exporter;
                }}
                group={group}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: webheight }}
                  data={newData.map((item: { items: any[] }) => ({
                    ...item,
                    items: item.items.map((row: any) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                  }))}
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
                  //그룹기능
                  group={group}
                  groupable={true}
                  onExpandChange={onExpandChange}
                  expandField="expanded"
                  //incell 수정 기능
                  onItemChange={onMainItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  <GridColumn
                    field="chk"
                    title=" "
                    width="45px"
                    headerCell={CustomCheckBoxCell}
                    cell={CustomCheckBoxCell1}
                  />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                centerField.includes(item.fieldName)
                                  ? CenterCell
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
            <GridContainer width={`calc(70% - ${GAP}px)`}>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>바코드 추가목록</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onResetCard}
                    fillMode="outline"
                    themeColor={"primary"}
                    disabled={permissions.view ? false : true}
                  >
                    초기화
                  </Button>
                  <ReactToPrint
                    trigger={() => (
                      <Button
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="print"
                        disabled={permissions.print ? false : true}
                      >
                        출력
                      </Button>
                    )}
                    content={() => componentRef.current}
                  />
                </ButtonContainer>
              </GridTitleContainer>
              <PrimaryP>
                ※ 바코드 카드 우측 상단의 x 버튼 클릭하여 삭제 / 한 코드당 한
                개만 추가 가능
              </PrimaryP>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  height: webheight2,
                  overflow: "auto",
                }}
                ref={componentRef}
              >
                {cards !== null &&
                  cards.map((item: any, index: number) => {
                    return (
                      <div key={index}>
                        <Card
                          style={{
                            width: "300px",
                            height: "180px",
                            boxShadow: "0 0 4px 0 rgba(0, 0, 0, .2)",
                            marginLeft: "20px",
                            marginRight: "20px",
                            marginTop: "30px",
                            marginBottom: "10px",
                          }}
                        >
                          <CardHeader
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              height: "50px",
                            }}
                          >
                            <div>
                              <CardTitle>{item.name}</CardTitle>
                            </div>
                            <div className="nonprintable">
                              <Button
                                onClick={() => {
                                  onDeleteCard(index, item.code);
                                }}
                                fillMode="flat"
                                icon="close-circle"
                              ></Button>
                            </div>
                          </CardHeader>
                          <CardBody
                            style={{
                              margin: "15px",
                              fontSize: "20px",
                              textAlign: "center",
                            }}
                          >
                            <tr>
                              <td>
                                <Barcode
                                  type="Code128"
                                  height={80}
                                  value={item.barcode}
                                />
                              </td>
                            </tr>
                          </CardBody>
                        </Card>
                      </div>
                    );
                  })}
              </div>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
      {/* 컨트롤 네임 불러오기 용 */}
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
export default PR_B0020W;
