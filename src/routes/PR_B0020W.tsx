import React, { useEffect, useRef, useState } from "react";
import {
    Grid,
    GridColumn,
    GridEvent,
    GridFooterCellProps,
    getSelectedState,
    GridHeaderCellProps,
    GridDataStateChangeEvent,
    GridSelectionChangeEvent,
    GridItemChangeEvent,
    GridExpandChangeEvent,
    GridCellProps,
  } from "@progress/kendo-react-grid";
  import { Checkbox, Input } from "@progress/kendo-react-inputs";
  import { ExcelExport } from "@progress/kendo-react-excel-export";
  import { getter } from "@progress/kendo-react-common";
  import { DataResult, process, State } from "@progress/kendo-data-query";
  import FilterContainer from "../components/Containers/FilterContainer";
  import {
    Title,
    FilterBox,
    GridContainer,
    GridTitle,
    TitleContainer,
    ButtonContainer,
    GridTitleContainer,
    GridContainerWrap,
    PrimaryP,
  } from "../CommonStyled";
  import { useApi } from "../hooks/api";
  import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
  import {
    chkScrollHandler,
    getGridItemChangedData,
    rowsOfDataResult,
    UseBizComponent,
    UseCustomOption,
    UseMessages,
    UsePermissions,
  } from "../components/CommonFunction";
  import {
    EDIT_FIELD,
    PAGE_SIZE,
    SELECTED_FIELD,
    GAP,
  } from "../components/CommonString";
  import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
  import TopButtons from "../components/Buttons/TopButtons";
  import CenterCell from "../components/Cells/CenterCell";
  import { gridList } from "../store/columns/PR_B0020W_C";
  import { useRecoilState, useSetRecoilState } from "recoil";
  import { isLoading, sessionItemState } from "../store/atoms";
import {
    Card,
    CardHeader,
    CardTitle,
    CardBody,
  } from "@progress/kendo-react-layout";
import { Barcode } from "@progress/kendo-react-barcodes";
import { Button } from "@progress/kendo-react-buttons";
import { CellRender, RowRender } from "../components/Renderers/GroupRenderers";
import ReactToPrint, { useReactToPrint } from "react-to-print";

  const DATA_ITEM_KEY = "num";
  const centerField = ["code"];
  const cardField : any[] = [];

const PR_B0020W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  const pathname: string = window.location.pathname.replace("/", "");
  const [cards, setCards] = React.useState<any>(null);
  const [show, setShow] = useState(true);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  // 바코드구분
  UseBizComponent("L_BA090", setBizComponentData);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    group: [
      {
        field: "group_category_name",
      },
    ],
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState),
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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST",
    code: "",
    name: "",
    cboDiv: "",
    company_code: "2207A046",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
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
  }
  const [mainDataTotal, setMainDataTotal] = useState<number>(0);
  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    // if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
          groupId: row.gubun + "gubun",
          group_category_name: "구분" + ":" + row.gubun,
          chk: false
        };
      });
      
      if (totalRowCnt > 0) {
        setMainDataTotal(totalRowCnt);
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });

        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const onExpandChange = (event: GridExpandChangeEvent) => {
    const isExpanded =
      event.dataItem.expanded === undefined
        ? event.dataItem.aggregates
        : event.dataItem.expanded;
    event.dataItem.expanded = !isExpanded;

    setMainDataResult({ ...mainDataResult });
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters.isSearch &&
      permissions !== null
    ) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
    filters.pgNum +
      (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 0,
      }));
      return false;
    }

    pgNumWithGap =
    filters.pgNum -
      (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 0,
      }));
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
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
    setMainDataResult(process([], mainDataState));
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
         총 {mainDataTotal}건
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const CustomCheckBoxCell = (props: GridCellProps) => {
    const { ariaColumnIndex, columnIndex, dataItem, field } = props;
    if (props.rowType === "groupHeader") {
      return null;
    }

    const handleChange = () => {
      const newData = mainDataResult.data.map((item) =>
        item.num == dataItem.num
          ? {
                ...item,
                rowstatus: item.rowstatus === "N" ? "N" : "U",
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
    };

    return (
      <td style={{ textAlign: "center" }}>
        <Checkbox value={dataItem["chk"]} onClick={handleChange}></Checkbox>
      </td>
    );
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult((prev) => {
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

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
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
  const onAddCard = (e: any) => {
    const selectRows = mainDataResult.data.filter((item: any) => {
      return item.chk == true;
    });

    if (cardField.length == 0) 
    {
        selectRows.forEach((item: any) => {
            cardField.push(item);
        });
    }
    else    
    {
        // 추가된 바코드는 체크되어 있어도 추가되지 않게 불일치 요소 
        const cardtest = selectRows.filter(item => {
            return !cardField.some(x => x.code === item.code && x.name === item.name)
        });

        for (var i = 0; i < cardtest.length; i++) 
        {
            cardField.push(cardtest[i]);
        }
    }

    setCards(cardField);
    setMainDataResult({ ...mainDataResult }); // 카드 삭제, 초기화 이후에도 카드가 바로 반영되게끔 선언.
  };

  // 바코드 초기화
  const onResetCard = (e: any) => {

    cardField.length = 0;
    setCards(cardField);

    // Grid 체크 초기화
    const resetCheck = mainDataResult.data.map((row: any) => {
      return {
        ...row,
        chk : "N"
      }
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
    for (var i =0; i < cardField.length; i++) 
    {
        if (index != i)
        {
            newData.push(cardField[i]);
        }
    }

    // cardField 초기화 후 재할당
    cardField.length = 0;
    newData.map((row: any) => {
      cardField.push(row);
    })
    
    // 해당 코드 행 체크 초기화
    let resetCheck = mainDataResult.data.map((item: any) => {
        if (item.code == items) {
            item.chk = "N"
        }
        return item;
      });

    resetCheck = resetCheck.map((row: any) => {
        return {
          ...row,
        }
      });
  
      setMainDataResult((prev) => {
        return {
          data: resetCheck,
          total: prev.total,
        };
      });
  };

  // 삭제버튼 숨김처리
  const onButtonHide = (e: any) => {  
    setShow(show == true ? false : true);
  };

  const componentRef = useRef(null);

  return (
    <>
    <TitleContainer>
        <Title>바코드 출력</Title>
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

    <GridContainerWrap>
    <GridContainer width = {'20%'}>
        <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
                _export = exporter;
            }}
        >
            <GridTitleContainer>
                <GridTitle>코드내역</GridTitle>
                <ButtonContainer>
                <Button
                  onClick={onAddCard}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="image-export"
                  title="추가"
                >
                바코드 추가
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
                style={{ height: "80vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
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
                total={mainDataTotal}
                onScroll={onMainScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                //그룹기능
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
              headerCell={CustomCheckBoxCell2}
              cell={CustomCheckBoxCell}
            />
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"].map(
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
                            item.sortOrder === 0 ? mainTotalFooterCell : undefined
                          }
                        />
                      )
                  )}
            </Grid>
        </ExcelExport>
    </GridContainer> 
    <GridContainer width={`calc(80% - ${GAP}px)`}>
        <GridTitleContainer>
            <GridTitle>바코드 추가목록</GridTitle>
            <ButtonContainer>
              <Button
                  onClick={onResetCard}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="reset"
                  title="초기화"
                >
                    초기화
                </Button>
                <Button
                   onClick={onButtonHide}
                   fillMode="outline"
                   themeColor={"primary"}
                   icon="close-circle"
                   title="초기화"
                > {show == true ? "버튼 숨김" : "버튼 표시"}
                </Button>
                <ReactToPrint
                    trigger={() => (
                    <Button
                        fillMode="outline" 
                        themeColor={"primary"} 
                        icon="print"
                        title="출력">
                    출력
                    </Button>
                )}
                content={() => componentRef.current}
                />
            </ButtonContainer>
          </GridTitleContainer>
          <PrimaryP>※ 바코드 카드 우측 상단의 x 버튼 클릭하여 삭제 / 한 코드당 한 개만 추가 가능</PrimaryP>
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
            }}
            ref={componentRef}
        >
          {cards !== null && cards.map((item: any, index: number) => {
                return (
                    <div key={index}>
                        <Card
                            style={{
                                width: "300px",
                                height : "180px",
                                boxShadow: "0 0 4px 0 rgba(0, 0, 0, .2)",
                                marginLeft : "20px",
                                marginRight: "20px",
                                marginTop: "30px",
                                marginBottom : "10px",
                            }}
                            >
                            <CardHeader
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    }}
                            >
                                <div>
                                    <CardTitle>
                                        {item.name}
                                    </CardTitle>
                                </div>
                                <div>
                                     {(show == true) ? <Button
                                      onClick={() => {
                                        onDeleteCard(index, item.code);
                                      }}
                                      fillMode="flat" 
                                      icon="close-circle"
                                      title="삭제"
                                      id = "test"
                                    >
                                    </Button> : null}
                                </div>
                            </CardHeader>
                            <CardBody
                                style = {{
                                    margin: "15px",
                                    fontSize: "20px",
                                    textAlign: "center",
                                }}>
                                <tr>
                                    <td>
                                        <Barcode type="Code128" height = {80} value={item.barcode} />
                                    </td>
                                </tr>
                            </CardBody>
                        </Card>
                    </div>
                )
            })}
        </div>
    </GridContainer>
    </GridContainerWrap>
    
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
}
export default PR_B0020W;