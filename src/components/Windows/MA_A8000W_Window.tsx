import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
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
import { Input } from "@progress/kendo-react-inputs";
import * as React from "react";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import RadioGroupCell from "../Cells/RadioGroupCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  getGridItemChangedData,
  numberWithCommas,
  toDate,
} from "../CommonFunction";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import MA_A8000W_Acnt_Window from "./MA_A8000W_Acnt_Window";

let temp = 0;
let deletedMainRows: object[] = [];

type IWindow = {
  setVisible(t: boolean): void;
  workType: "N" | "U";
  data: any;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  list: any;
  modal?: boolean;
  pathname: string;
};

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("R_DRCR", setBizComponentData);
  //합부판정
  const field = props.field ?? "";
  const bizComponentIdVal = field == "drcrdiv" ? "R_DRCR" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const CopyWindow = ({
  workType,
  data,
  setVisible,
  reload,
  list,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 900,
  });

  const DATA_ITEM_KEY = "num";

  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
      }));
    }
  }, [customOptionData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
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

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };
  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    setVisible(false);
  };

  const processApi = useApi();

  const [DetailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const onDetailClick = () => {
    setDetailWindowVisible(true);
  };

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    indt: new Date(),
    location: "",
    position: "",
    paymentnum: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;

    let data2: any;
    const parameters: Iparameters = {
      procedureName: "P_MA_A8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_paymentnum": data.paymentnum,
        "@p_location": filters.location,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_position": filters.position,
        "@p_find_row_value": "",
      },
    };

    setLoading(true);
    try {
      data2 = await processApi<any>("procedure", parameters);
    } catch (error) {
      data2 = null;
    }

    if (data2.isSuccess === true) {
      const totalRowCnt = data2.tables[0].RowCount;
      const rows = data2.tables[0].Rows.map((row: any) => {
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
      setFilters((prev) => ({
        ...prev,
        isSearch: false,
        paymentnum: data.paymentnum,
        indt: toDate(data.indt),
        location: data.location,
        position: data.position,
      }));
      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data2);
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

  useEffect(() => {
    if (filters.isSearch && workType == "U") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    } else if (filters.isSearch && workType == "N") {
      const arr: any[] = [];
      //차변
      list.map((item: any) => {
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          acntcd: "2110101",
          acntnm: "외상매입금",
          acntnum: "",
          acntsrtnm: "",
          advanceinfo: "0",
          amt: item.janamt,
          amt_1: item.janamt,
          amt_2: 0,
          amtunit: "",
          bankcd: "",
          closeyn: "",
          custcd: item.custcd,
          custnm: item.custnm,
          datnum: "",
          doexdiv: "",
          dptcd: "",
          drcrdiv: "1",
          enddt: "",
          indt: item.reqdt == "" ? new Date() : toDate(item.reqdt),
          location: item.location,
          notediv: "",
          notenum: "",
          orgdiv: item.orgdiv,
          paymentnum: "",
          paymentseq: 0,
          position: "",
          pubbank: "",
          pubdt: "",
          pubperson: "",
          ratedt: "",
          rcvcustcd: "",
          rcvcustnm: "",
          remark1: item.custnm + " 지급",
          stdrmkcd: "",
          stdrmknm: "",
          taxnum: item.taxnum,
          wonchgrat: 0,
          rowstatus: "N",
        };

        arr.push(newDataItem);
      });
      //대변 셋팅
      var dr: any[] = [];
      list.map((item: { custcd: any }) => {
        if (!dr.includes(item.custcd)) {
          dr.push(item.custcd);
        }
      });

      for (var i = 0; i < dr.length; i++) {
        const datas = list.filter(
          (item: { custcd: any }) => item.custcd == dr[i]
        );

        var sum = 0;
        datas.map((item: { janamt: number }) => {
          sum += item.janamt;
        });

        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          acntcd: "1110130",
          acntnm: "보통예금",
          acntnum: "",
          acntsrtnm: "",
          advanceinfo: "0",
          amt: sum,
          amt_1: 0,
          amt_2: sum,
          amtunit: "",
          bankcd: "",
          closeyn: "",
          custcd: datas[0].custcd,
          custnm: datas[0].custnm,
          datnum: "",
          doexdiv: "",
          dptcd: "",
          drcrdiv: "2",
          enddt: "",
          indt: datas[0].reqdt == "" ? new Date() : toDate(datas[0].reqdt),
          location: datas[0].location,
          notediv: "",
          notenum: "",
          orgdiv: datas[0].orgdiv,
          paymentnum: "",
          paymentseq: 0,
          position: "",
          pubbank: "",
          pubdt: "",
          pubperson: "",
          ratedt: "",
          rcvcustcd: "",
          rcvcustnm: "",
          remark1: datas[0].custnm + " 지급",
          stdrmkcd: "",
          stdrmknm: "",
          taxnum: "",
          wonchgrat: 0,
          rowstatus: "N",
        };

        arr.push(newDataItem);
      }

      setMainDataResult((prev) => {
        return {
          data: arr,
          total: arr.length == -1 ? 0 : arr.length,
        };
      });
      setSelectedState({ [arr[0][DATA_ITEM_KEY]]: true });
      setFilters((prev) => ({
        ...prev,
        location: arr[0].location,
        position: arr[0].position,
        find_row_value: "",
        isSearch: false,
      }));
    }
  }, [filters]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = () => {
    const newData = mainDataResult.data.filter((item: any) => item.chk == true);
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
    if (
      field != "rowstatus" &&
      field != "stdmknm" &&
      field != "acntnm" &&
      field != "custnm" &&
      field != "acntsrtnum" &&
      field != "taxnum"
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
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
                rowstatus: item.rowstatus === "N" ? "N" : "U",
                chk:
                  typeof item.chk == "boolean"
                    ? item.chk
                    : item.chk == "Y"
                    ? true
                    : false,
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

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      acntcd: "",
      acntnm: "",
      acntnum: "",
      acntsrtnm: "",
      advanceinfo: "0",
      amt: 0,
      amt_1: 0,
      amt_2: 0,
      amtunit: "",
      bankcd: "",
      closeyn: "",
      custcd: "",
      custnm: "",
      datnum: "",
      doexdiv: "",
      dptcd: "",
      drcrdiv: "1",
      enddt: "",
      indt: new Date(),
      location: filters.location,
      notediv: "",
      notenum: "",
      orgdiv: "01",
      paymentnum: "",
      paymentseq: 0,
      position: "",
      pubbank: "",
      pubdt: "",
      pubperson: "",
      ratedt: "",
      rcvcustcd: "",
      rcvcustnm: "",
      remark1: "",
      stdrmkcd: "",
      stdrmknm: "",
      taxnum: "",
      wonchgrat: 0,
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object3: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows.push(newData2);
        }
        Object3.push(index);
      }
    });

    if (Math.min(...Object3) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object3) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object3.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const setDatas = (data: any) => {
    console.log(data)
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      acntcd: "",
      acntnm: "",
      acntnum: data.item1,
      acntsrtnm: data.item2,
      advanceinfo: "0",
      amt: 0,
      amt_1: 0,
      amt_2: 0,
      amtunit: "",
      bankcd: "",
      closeyn: "",
      custcd: "",
      custnm: "",
      datnum: "",
      doexdiv: "",
      dptcd: "",
      drcrdiv: "1",
      enddt: "",
      indt: new Date(),
      location: filters.location,
      notediv: "",
      notenum: "",
      orgdiv: "01",
      paymentnum: "",
      paymentseq: 0,
      position: "",
      pubbank: "",
      pubdt: "",
      pubperson: "",
      ratedt: "",
      rcvcustcd: "",
      rcvcustnm: "",
      remark1: "",
      stdrmkcd: "",
      stdrmknm: "",
      taxnum: "",
      wonchgrat: 0,
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
  };

  return (
    <>
      <Window
        title={workType == "N" ? "지급처리생성" : "지급처리수정"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <FormBoxWrap style={{ paddingRight: "50px" }}>
          <FormBox>
            <tbody>
              <tr>
                <th>지급번호</th>
                <td>
                  <Input
                    name="paymentnum"
                    type="text"
                    value={filters.paymentnum}
                    className="readonly"
                  />
                </td>
                <th>일자</th>
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="indt"
                      value={filters.indt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                    />
                  </div>
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
                <th>사업부</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="position"
                      value={filters.position}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <GridContainer height="calc(100% - 150px) ">
          <GridTitleContainer>
            <GridTitle>기본정보</GridTitle>
            <ButtonContainer>
              <Button
                themeColor={"primary"}
                onClick={onDetailClick}
                icon="folder-open"
              >
                기초잔액
              </Button>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="plus"
                title="행 추가"
              ></Button>
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
            style={{ height: "calc(100% - 50px)" }}
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
              field="drcrdiv"
              title="차대구분"
              width="150px"
              cell={CustomRadioCell}
              footerCell={mainTotalFooterCell}
            />
            <GridColumn
              field="amt_1"
              title="차변금액"
              width="100px"
              cell={NumberCell}
              footerCell={editNumberFooterCell}
            />
            <GridColumn
              field="amt_2"
              title="대변금액"
              width="100px"
              cell={NumberCell}
              footerCell={editNumberFooterCell}
            />
            <GridColumn field="stdmkcd" title="단축코드" width="120px" />
            <GridColumn field="acntcd" title="계정과목코드" width="120px" />
            <GridColumn field="stdmknm" title="단축명" width="120px" />
            <GridColumn field="acntnm" title="계정과목명" width="120px" />
            <GridColumn field="custcd" title="업체코드" width="120px" />
            <GridColumn field="custnm" title="업체명" width="120px" />
            <GridColumn field="acntnum" title="예적금코드" width="120px" />
            <GridColumn field="acntsrtnm" title="예적금명" width="120px" />
            <GridColumn field="remark1" title="적요" width="200px" />
            <GridColumn field="taxnum" title="계산서번호" width="150px" />
            <GridColumn field="notenum" title="어음번호" width="150px" />
            <GridColumn
              field="enddt"
              title="만기일자"
              width="120px"
              cell={DateCell}
            />
            <GridColumn field="pubbank" title="발행은행명" width="120px" />
            <GridColumn
              field="pubdt"
              title="발행일자"
              width="120px"
              cell={DateCell}
            />
            <GridColumn field="pubperson" title="발행인" width="120px" />
          </Grid>
        </GridContainer>
        <BottomContainer>
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
      </Window>
      {DetailWindowVisible && (
        <MA_A8000W_Acnt_Window
          setVisible={setDetailWindowVisible}
          setData={setDatas}
          pathname={pathname}
        />
      )}
    </>
  );
};

export default CopyWindow;
