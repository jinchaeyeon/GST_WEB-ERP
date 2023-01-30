import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
  GridItemChangeEvent,
} from "@progress/kendo-react-grid";
import { CellRender, RowRender } from "../components/Renderers";
import { Button } from "@progress/kendo-react-buttons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBoxWrap,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  GridContainerWrap,
} from "../CommonStyled";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  getGridItemChangedData,
  handleKeyPressSearch,
  UseGetValueFromSessionItem,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import CheckBoxCell from "../components/Cells/CheckBoxCell";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "user_id";
let count = 0;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 사용자구분, 사업장, 사업부, 부서코드, 직위, 공개범위
  UseBizComponent("L_EA004", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field === "appline" ? "L_EA004" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );
  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      {...props}
    />
  ) : (
    <td></td>
  );
};

const EA_A1000: React.FC = () => {
  const user_id = UseGetValueFromSessionItem("user_id");
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const processApi = useApi();
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        pgmgb: defaultOption.find((item: any) => item.id === "pgmgb").valueCode,
        resno: defaultOption.find((item: any) => item.id === "resno").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001,L_HU005, L_sysUserMaster_004, L_EA001, L_EA004",
    setBizComponentData
  );

  //공통코드 리스트 조회 ()

  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [resnoListData, setResnoListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [appgbListData, setappgbListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [applineListData, setapplineListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU005")
      );
      const resnoQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_004"
        )
      );
      const appgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_EA001")
      );
      const applineQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_EA004")
      );
      fetchQuery(postcdQueryStr, setpostcdListData);
      fetchQuery(dptcdQueryStr, setdptcdListData);
      fetchQuery(resnoQueryStr, setResnoListData);
      fetchQuery(appgbQueryStr, setappgbListData);
      fetchQuery(applineQueryStr, setapplineListData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr: string, setListData: any) => {
    let data: any;

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

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const [mainData3State, setMainData3State] = useState<State>({
    sort: [],
  });

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [isInitSearch, setIsInitSearch] = useState(false);

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainData3Result, setMainData3Result] = useState<DataResult>(
    process([], mainData3State)
  );
  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selected3State, setSelected3State] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [subselectedState, setSubSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [mainPgNum, setMainPgNum] = useState(1);
  const [main3PgNum, setMain3PgNum] = useState(1);
  const [subPgNum, setSubPgNum] = useState(1);
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);

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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    worktype: "LINE",
    orgdiv: "01",
    pgmgb: "A",
    resno: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_EA_A1000W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LINE",
      "@p_orgdiv": filters.orgdiv,
      "@p_person": filters.resno,
      "@p_pgmgb": filters.pgmgb,
    },
  };

  const subparameters: Iparameters = {
    procedureName: "P_EA_A1000W_Q",
    pageNumber: subPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LOAD",
      "@p_orgdiv": filters.orgdiv,
      "@p_person": filters.resno,
      "@p_pgmgb": filters.pgmgb,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });

      const totalRowCnt3 = data.tables[2].RowCount;
      const rows3 = data.tables[2].Rows;

      if (totalRowCnt3 > 0)
        setMainData3Result((prev) => {
          return {
            data: [...prev.data, ...rows3],
            total: totalRowCnt3,
          };
        });
    }
    setLoading(false);
  };

  const fetchSubGrid = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setSubDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData !== null &&
      isInitSearch === false &&
      permissions !== null
    ) {
      fetchMainGrid();
      fetchSubGrid();
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchMainGrid();
    }
  }, [mainPgNum]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchSubGrid();
    }
  }, [subPgNum]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMain3PgNum(1);
    setSubPgNum(1);
    setMainDataResult(process([], mainDataState));
    setMainData3Result(process([], mainData3State));
    setSubDataResult(process([], subDataState));
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

  const onSelection3Change = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelected3State(newSelectedState);
  };

  const onSubSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSubSelectedState(newSelectedState);
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
      setMainPgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMain3ScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, main3PgNum, PAGE_SIZE))
      setMain3PgNum((prev) => prev + 1);
  };

  const onMainData3StateChange = (event: GridDataStateChangeEvent) => {
    setMainData3State(event.dataState);
  };

  const onSubScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum, PAGE_SIZE))
      setSubPgNum((prev) => prev + 1);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMain3SortChange = (e: any) => {
    setMainData3State((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    fetchMainGrid();
    fetchSubGrid();
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const onSubItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      subDataResult,
      setSubDataResult,
      DATA_ITEM_KEY2
    );
  };

  const onMain3ItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainData3Result,
      setMainData3Result,
      DATA_ITEM_KEY
    );
  };
  const enterEdit = (dataItem: any, field: string) => {

    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
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

  const onAddClick = () => {
    const rows = subDataResult.data.filter((item) => item.chooses == true);
    let isValid = true;
    rows.map((item) => {
      mainDataResult.data.map((items)=> {
        if(item.user_id == items.resno) {
          isValid = false;
          return false;
        }
      })
    })

    if (!isValid) {
      alert("중복되는 유저가 있습니다.");
      return false;
    }

    var idx = mainDataResult.data.length;

    rows.map((item) => {
      const newDataItem = {
        aftergb: "",
        appgb: "S",
        appline: "",
        appseq: 0,
        arbitragb: "N",
        dptcd: item.dptcd,
        insert_pc: "",
        insert_time: "",
        insert_userid: item.user_id,
        userid: user_id,
        num: idx + 1,
        orgdiv: "01",
        person: user_id,
        pgmgb: "A",
        postcd: item.postcd,
        resno: item.user_id,
        vicargb: "",
        vicarid: "",
        rowstatus: "N",
        form_id: "EA_A1000W",
        inEdit: undefined
      };
      idx++;
      count++;
      setMainDataResult((prev) => {
        return {
          data: [...prev.data, newDataItem],
          total: prev.total + 1,
        };
      });
    });
  };

  const onSaveClick = async () => {
    let isValid = true;

    for(var i = count; i > 0; i--){
        if(mainDataResult.data[mainDataResult.data.length - i].appseq == 0 || mainDataResult.data[mainDataResult.data.length - i].appline ==""){
          isValid = false;
        }
    }

    if (!isValid) {
      alert("빈칸을 채워주세요");
      return false;
    }

    try {
      for (var i = count; i > 0; i--) {
        const datas = mainDataResult.data[mainDataResult.data.length - i];

        const para: Iparameters = {
          procedureName: "P_EA_A1000W_S",
          pageNumber: 0,
          pageSize: 0,
          parameters: {
            "@p_work_type": "N",
            "@p_orgdiv": datas.orgdiv,
            "@p_person": datas.person,
            "@p_pgmgb": datas.pgmgb,
            "@p_postcd": datas.postcd,
            "@p_resno": datas.resno,
            "@p_appgb": datas.appgb,
            "@p_appseq": datas.appseq,
            "@p_arbitragb": datas.arbitragb,
            "@p_aftergb": datas.aftergb,
            "@p_vicargb": datas.vicargb,
            "@p_vicarid": datas.vicarid,
            "@p_appline": datas.appline,
            "@p_rowstatus_s": datas.rowstatus,
            "@p_dptcd": datas.dptcd,
            "@p_userid": datas.userid,
            "@p_pc": datas.insert_pc,
            "@p_form_id": datas.form_id
          },
        };

        let data: any;

        try {
          data = await processApi<any>("procedure", para);
        } catch (error) {
          data = null;
        }

        if (data.isSuccess !== true) {
          console.log("[오류 발생]");
          console.log(data);
          throw data.resultMessage;
        } 
      }

      resetAllGrid();
      fetchMainGrid();
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>결제라인지정</Title>

        <ButtonContainer>
          {permissions && (
            <>
              <Button
                onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              >
                저장
              </Button>
              <TopButtons
                search={search}
                exportExcel={exportExcel}
                permissions={permissions}
              />
            </>
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterBoxWrap>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>프로그램구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="pgmgb"
                    value={filters.pgmgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>작성자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="resno"
                    value={filters.resno}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>
      <GridContainerWrap
        style={{
          display: "inline-block",
          float: "left",
          width: "760px",
          height: "80vh",
          marginRight: "3%",
        }}
      >
        <GridContainer style={{ height: "100%" }}>
          <GridTitleContainer>
            <GridTitle>참조</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick}
                fillMode="outline"
                themeColor={"primary"}
              >
                결제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            data={process(
              subDataResult.data.map((row) => ({
                ...row,
                dptcd: dptcdListData.find(
                  (item: any) => item.dptcd === row.dptcd
                )?.dptnm,
                postcd: postcdListData.find(
                  (item: any) => item.sub_code === row.postcd
                )?.code_name,
                [SELECTED_FIELD]: subselectedState[idGetter2(row)],
              })),
              subDataState
            )}
            {...subDataState}
            onDataStateChange={onSubDataStateChange}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY2}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSubSelectionChange}
            //스크롤 조회 기능
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
            onItemChange={onSubItemChange}
          >
            <GridColumn
              field="user_name"
              title="성명"
              width="200px"
              className="required"
              editable={false}
            />
            <GridColumn
              field="dptcd"
              title="부서"
              width="250px"
              editable={false}
            />
            <GridColumn
              field="postcd"
              title="직위"
              width="200px"
              editable={false}
            />
            <GridColumn
              field="chooses"
              title="참조"
              width="80px"
              cell={CheckBoxCell}
            />
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      <GridContainerWrap style={{ display: "inline-block", height: "100vh" }}>
        <GridContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <GridTitleContainer>
            <GridTitle>결재라인</GridTitle>
            <ButtonContainer>
              <Button
                // onClick={onDeleteClick}
                icon="delete"
                fillMode="outline"
                themeColor={"primary"}
              >
                행 삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                dptcd: dptcdListData.find(
                  (item: any) => item.dptcd === row.dptcd
                )?.dptnm,
                postcd: postcdListData.find(
                  (item: any) => item.sub_code === row.postcd
                )?.code_name,
                resno: resnoListData.find(
                  (item: any) => item.user_id === row.resno
                )?.user_name,
                appgb: appgbListData.find(
                  (item: any) => item.sub_code === row.appgb
                )?.code_name,
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
            onScroll={onMainScrollHandler}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            //incell 수정 기능
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn
              field="dptcd"
              title="부서"
              width="180px"
              editable={false}
            />
            <GridColumn
              field="resno"
              title="성명"
              width="180px"
              editable={false}
            />
            <GridColumn
              field="postcd"
              title="직위"
              width="160px"
              editable={false}
            />
            <GridColumn
              field="appgb"
              title="결재구분"
              width="140px"
              editable={false}
            />
            <GridColumn
              field="appseq"
              title="결재순서"
              width="100px"
              className="required"
            />
            <GridColumn
              field="appline"
              title="결재라인"
              width="150px"
              cell={CustomComboBoxCell}
              className="required"
            />
            <GridColumn
              field="arbitragb"
              title="전결유무"
              width="120px"
              cell={CheckBoxCell}
            />
          </Grid>
          </ExcelExport>
        </GridContainer>
        <GridContainer>
          <GridTitleContainer>
            <GridTitle>참조자</GridTitle>
            <ButtonContainer>
              <Button
                // onClick={onDeleteClick}
                icon="delete"
                fillMode="outline"
                themeColor={"primary"}
              >
                행 삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            data={process(
              mainData3Result.data.map((row) => ({
                ...row,
                postcd: postcdListData.find(
                  (item: any) => item.sub_code === row.postcd
                )?.code_name,
                resno: resnoListData.find(
                  (item: any) => item.user_id === row.resno
                )?.user_name,
                appgb: appgbListData.find(
                  (item: any) => item.sub_code === row.appgb
                )?.code_name,
                [SELECTED_FIELD]: selected3State[idGetter(row)],
              })),
              mainData3State
            )}
            {...mainData3State}
            onDataStateChange={onMainData3StateChange}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSelection3Change}
            //스크롤 조회 기능
            fixedScroll={true}
            total={mainData3Result.total}
            onScroll={onMain3ScrollHandler}
            //정렬기능
            sortable={true}
            onSortChange={onMain3SortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            //incell 수정 기능
            onItemChange={onMain3ItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn
              field="dptcd"
              title="부서"
              width="180px"
              editable={false}
            />
            <GridColumn
              field="resno"
              title="성명"
              width="180px"
              editable={false}
            />
            <GridColumn
              field="postcd"
              title="직위"
              width="160px"
              editable={false}
            />
            <GridColumn
              field="appgb"
              title="결재구분"
              width="140px"
              editable={false}
            />
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      {/* {gridList.map((grid: any) =>
        grid.columns.map((column: any) => (
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
      )} */}
    </>
  );
};

export default EA_A1000;
