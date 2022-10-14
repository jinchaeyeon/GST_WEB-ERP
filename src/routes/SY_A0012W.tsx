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
  GridItemChangeEvent,
  GridCellProps,
} from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
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
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  dateformat,
  findMessage,
  getGridItemChangedData,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  pageSize,
  SELECTED_FIELD,
} from "../components/CommonString";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import CommonRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import EncryptedCell from "../components/Cells/EncryptedCell";
import { sha256 } from "js-sha256";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "idx";
let deletedMainRows: object[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 사용자구분, 사업장, 사업부, 부서코드, 직위, 공개범위
  UseBizComponent(
    "L_SYS005,L_BA002,L_BA028,L_dptcd_001,L_HU005,L_BA410",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "user_category"
      ? "L_SYS005"
      : field === "location"
      ? "L_BA002"
      : field === "position"
      ? "L_BA028"
      : field === "dptcd"
      ? "L_dptcd_001"
      : field === "postcd"
      ? "L_HU005"
      : field === "opengb"
      ? "L_BA410"
      : "";

  const fieldName = field === "dptcd" ? "dptnm" : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={fieldName}
      {...props}
    />
  ) : (
    <td></td>
  );
};

const SY_A0120: React.FC = () => {
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const pathname: string = window.location.pathname.replace("/", "");

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_dptcd_001,L_SYS005", setBizComponentData);

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

  //그리드 별 페이지 넘버
  const [mainPgNum, setMainPgNum] = useState(1);

  const [isInitSearch, setIsInitSearch] = useState(false);

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
    pgSize: pageSize,
    work_type: "LIST",
    cboOrgdiv: "01",
    cboLocation: "",
    dptcd: "",
    lang_id: "",
    user_category: "",
    user_id: "",
    user_name: "",
    rtrchk: "%",
    usediv: "%",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_SY_A0012W_Q ",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.work_type,
      "@p_orgdiv": filters.cboOrgdiv,
      "@p_location": filters.cboLocation,
      "@p_dptcd": filters.dptcd,
      "@p_lang_id": filters.lang_id,
      "@p_user_category": filters.user_category,
      "@p_user_id": filters.user_id,
      "@p_user_name": filters.user_name,
      "@p_rtrchk": filters.rtrchk,
      "@p_usediv": filters.usediv,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        idx: idx,
      }));

      if (totalRowCnt > 0)
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
  };

  useEffect(() => {
    if (bizComponentData !== null && customOptionData !== null) {
      fetchMainGrid();
    }
  }, [mainPgNum]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
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
    if (chkScrollHandler(event, mainPgNum, pageSize))
      setMainPgNum((prev) => prev + 1);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  // 최초 한번만 실행
  useEffect(() => {
    if (isInitSearch === false) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters]);

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
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
    let seq = 1;

    if (mainDataResult.total > 0) {
      mainDataResult.data.forEach((item) => {
        if (item[DATA_ITEM_KEY] > seq) {
          seq = item[DATA_ITEM_KEY];
        }
      });
      seq++;
    }

    const idx: number =
      Number(Object.getOwnPropertyNames(selectedState)[0]) ??
      //Number(planDataResult.data[0].idx) ??
      null;
    if (idx === null) return false;
    const selectedRowData = mainDataResult.data.find(
      (item) => item.idx === idx
    );

    const newDataItem = {
      [DATA_ITEM_KEY]: seq,
      // planno: selectedRowData.planno,
      // planseq: selectedRowData.planseq,
      // proccd: selectedRowData.proccd,
      apply_start_date: convertDateToStr(new Date()),
      apply_end_date: "19991231",
      birdt: "19991231",
      rowstatus: "N",
    };
    setMainDataResult((prev) => {
      return {
        data: [...prev.data, newDataItem],
        total: prev.total + 1,
      };
    });
  };

  const onRemoveClick = () => {
    //삭제 안 할 데이터 newData에 push, 삭제 데이터 deletedRows에 push
    let newData: any[] = [];

    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        deletedMainRows.push(item);
      }
    });

    //newData 생성
    setMainDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));

    //선택 상태 초기화
    setSelectedState({});
  };

  const onSaveClick = () => {
    const dataItem: { [name: string]: any } = mainDataResult.data.filter(
      (item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      }
    );
    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;

    //검증
    let valid = true;
    try {
      dataItem.forEach((item: any) => {
        // mainDataResult.data.forEach((chkItem: any) => {
        //   if (
        //     (item.proccd === chkItem.proccd ||
        //       item.procseq === chkItem.procseq) &&
        //     item[PLAN_DATA_ITEM_KEY] !== chkItem[PLAN_DATA_ITEM_KEY] &&
        //     item.planno === chkItem.planno
        //   ) {
        //     throw공정과 공정순서를 확인하세요."; //   }
        // });

        if (!item.user_id) {
          throw findMessage(messagesData, "SY_A0012W_002");
        }

        if (!item.user_name) {
          throw findMessage(messagesData, "SY_A0012W_003");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    type TPlanData = {
      rowstatus_s: string[];
      ordnum_s: string[];
      ordseq_s: string[];
      remark_s: string[];
      itemcd_s: string[];
      qty_s: string[];
      planno_s: string[];
      planseq_s: string[];
      qtyunit_s: string[];
      procqty_s: string[];
      plandt_s: string[];
      finexpdt_s: string[];
      prodmac_s: string[];
      prodemp_s: string[];
      proccd_s: string[];
      procseq_s: string[];
      outprocyn_s: string[];
      //lotnum_s: string[];
    };

    try {
      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus,
          user_id,
          user_name,
          password = "",
          password_confirm = "",
          user_category = "",
          password2 = "",
          emp_code = "",
          emp_email = "",
          tel_no = "",
          mobile_no = "",
          apply_start_date,
          apply_end_date,
          hold_check_yn = "",
          memo = "",
          location = "",
          position = "",
          dptcd = "",
          postcd = "",
          home_menu_id = "",
          ip_check_yn = "",
          rtrchk = "",
          usediv = "",
          userid = "",
          pc = "",
          opengb = "",
          attdatnum_img = "",
          birdt,
          bircd = "",
          user_ip = "",
          mbouseyn = "",
        } = item;

        if (password !== password_confirm) {
          throw new Error("비밀번호 확인이 틀립니다.");
        }
        const md5 = require("md5");

        const para: Iparameters = {
          procedureName: "P_SY_A0012W_S",
          pageNumber: 1,
          pageSize: 10,
          parameters: {
            "@p_work_type": "",
            "@p_rowstatus": rowstatus,
            "@p_user_id": user_id,
            "@p_user_name": user_name,
            "@p_password": sha256(md5(password)),
            "@p_user_category": user_category,
            "@p_password2": password2,
            "@p_emp_code": emp_code,
            "@p_emp_email": emp_email,
            "@p_tel_no": tel_no,
            "@p_mobile_no": mobile_no,
            "@p_apply_start_date": apply_start_date,
            "@p_apply_end_date": apply_end_date,
            "@p_hold_check_yn":
              hold_check_yn === "Y" || hold_check_yn === true ? "Y" : "N",
            "@p_memo": memo,
            "@p_orgdiv": "01",
            "@p_location": location,
            "@p_position": position,
            "@p_dptcd": dptcd,
            "@p_postcd": postcd,
            "@p_home_menu_id": home_menu_id,
            "@p_ip_check_yn":
              ip_check_yn === "Y" || ip_check_yn === true ? "Y" : "N",
            "@p_rtrchk": rtrchk === "Y" || rtrchk === true ? "Y" : "N",
            "@p_usediv": usediv === "Y" || usediv === true ? "Y" : "N",
            "@p_userid": userid,
            "@p_pc": pc,
            "@p_opengb": opengb,
            "@p_attdatnum_img": attdatnum_img,
            "@p_birdt": birdt,
            "@p_bircd": bircd,
            "@p_user_ip": user_ip,
            "@p_mbouseyn": mbouseyn === "Y" || mbouseyn === true ? "Y" : "N",
          },
        };

        const result = fetchGridSaved(para);

        if (result instanceof Error) throw result;
      });

      deletedMainRows.forEach((item: any) => {
        const {
          user_id,
          user_name,
          password = "",
          user_category = "",
          password2 = "",
          emp_code = "",
          emp_email = "",
          tel_no = "",
          mobile_no = "",
          apply_start_date = "",
          apply_end_date = "",
          hold_check_yn = "",
          memo = "",
          orgdiv = "",
          location = "",
          position = "",
          dptcd = "",
          postcd = "",
          home_menu_id = "",
          ip_check_yn = "",
          rtrchk = "",
          usediv = "",
          userid = "",
          pc = "",
          opengb = "",
          attdatnum_img = "",
          birdt = "",
          bircd = "",
          user_ip = "",
          mbouseyn = "",
        } = item;

        const para: Iparameters = {
          procedureName: "P_SY_A0012W_S",
          pageNumber: 1,
          pageSize: 10,
          parameters: {
            "@p_work_type": "",
            "@p_rowstatus": "D",
            "@p_user_id": user_id,
            "@p_user_name": user_name,
            "@p_password": password,
            "@p_user_category": user_category,
            "@p_password2": password2,
            "@p_emp_code": emp_code,
            "@p_emp_email": emp_email,
            "@p_tel_no": tel_no,
            "@p_mobile_no": mobile_no,
            "@p_apply_start_date": apply_start_date,
            "@p_apply_end_date": apply_end_date,
            "@p_hold_check_yn": hold_check_yn,
            "@p_memo": memo,
            "@p_orgdiv": "01",
            "@p_location": location,
            "@p_position": position,
            "@p_dptcd": dptcd,
            "@p_postcd": postcd,
            "@p_home_menu_id": home_menu_id,
            "@p_ip_check_yn": ip_check_yn,
            "@p_rtrchk": rtrchk,
            "@p_usediv": usediv,
            "@p_userid": userid,
            "@p_pc": pc,
            "@p_opengb": opengb,
            "@p_attdatnum_img": attdatnum_img,
            "@p_birdt": birdt,
            "@p_bircd": bircd,
            "@p_user_ip": user_ip,
            "@p_mbouseyn": mbouseyn,
          },
        };

        // fetchGridSaved(para);

        const result = fetchGridSaved(para);
        if (result instanceof Error) throw result;
      });

      alert(findMessage(messagesData, "SY_A0012W_001"));

      resetAllGrid();
      fetchMainGrid();
      deletedMainRows = [];
    } catch (e) {
      alert(e);
    }
  };

  // *** promise 확인 하여 에러 예외 처리 차후 진행 필요함 (현재는 중복 검증 에러 메시지 기능 안됨)
  const fetchGridSaved = async (paraSaved: any) => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(data);
      return new Error("[" + data.statusCode + "] " + data.resultMessage);
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>사용자 정보</Title>

        <ButtonContainer>
          <Button
            onClick={() => {
              resetAllGrid();
              fetchMainGrid();
            }}
            icon="search"
            //fillMode="outline"
            themeColor={"primary"}
          >
            조회
          </Button>
          <Button
            title="Export Excel"
            onClick={exportExcel}
            icon="download"
            fillMode="outline"
            themeColor={"primary"}
          >
            Excel
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterBoxWrap>
        <FilterBox>
          <tbody>
            <tr>
              <th>회사구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboOrgdiv"
                    value={filters.cboOrgdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboLocation"
                    value={filters.cboLocation}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>부서코드</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    bizComponentId="L_dptcd_001"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
              </td>
              <th>퇴사여부</th>
              <td>
                <div className="radio_form_box">
                  <div className="radio_inner">
                    {customOptionData !== null && (
                      <CommonRadioGroup
                        name="radRtrchk"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th>사용자명ID</th>
              <td>
                <Input
                  name="user_id"
                  type="text"
                  value={filters.user_id}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용자명</th>
              <td>
                <Input
                  name="user_name"
                  type="text"
                  value={filters.user_name}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용자구분</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="user_category"
                    value={filters.user_category}
                    bizComponentId="L_SYS005"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>실사용자</th>
              <td>
                <div className="radio_form_box">
                  <div className="radio_inner">
                    {customOptionData !== null && (
                      <CommonRadioGroup
                        name="radUsediv"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>

      <GridContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <GridTitleContainer>
            <GridTitle>사용자 리스트</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="plus"
              ></Button>
              <Button
                onClick={onRemoveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="minus"
              ></Button>
              <Button
                onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "650px" }}
            data={process(
              mainDataResult.data.map((row, idx) => ({
                ...row,
                birdt: row.birdt
                  ? new Date(dateformat(row.birdt))
                  : new Date(dateformat("19991231")),
                apply_start_date: row.apply_start_date
                  ? new Date(dateformat(row.apply_start_date))
                  : new Date(dateformat("19991231")),
                apply_end_date: row.apply_end_date
                  ? new Date(dateformat(row.apply_end_date))
                  : new Date(dateformat("19991231")),
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
            onSelectionChange={onMainSelectionChange}
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
              field="rowstatus"
              title=" "
              width="40px"
              editable={false}
            />

            <GridColumn
              field={"user_id"}
              title={"사용자ID"}
              width={"150px"}
              //cell={numberField.includes(item.id) ? NumberCell : ""}
              footerCell={mainTotalFooterCell}
            />
            <GridColumn
              field={"user_name"}
              title={"사용자명"}
              width={"150px"}
            />
            <GridColumn
              field={"password"}
              title={"비밀번호"}
              width={"120px"}
              cell={EncryptedCell}
            />
            <GridColumn
              field={"password_confirm"}
              title={"비밀번호 확인"}
              width={"120px"}
              cell={EncryptedCell}
            />
            <GridColumn
              field={"location"}
              title={"사업장"}
              width={"120px"}
              cell={CustomComboBoxCell}
            />
            <GridColumn
              field={"position"}
              title={"사업부"}
              width={"120px"}
              cell={CustomComboBoxCell}
            />
            <GridColumn
              field={"user_category"}
              title={"사용자구분"}
              width={"150px"}
              cell={CustomComboBoxCell}
            />
            <GridColumn
              field={"postcd"}
              title={"직위"}
              width={"150px"}
              cell={CustomComboBoxCell}
            />
            <GridColumn
              field={"usediv"}
              title={"실사용자"}
              width={"150px"}
              cell={CheckBoxCell}
            />
            <GridColumn field={"tel_no"} title={"전화번호"} width={"150px"} />
            <GridColumn
              field={"mobile_no"}
              title={"휴대폰번호"}
              width={"150px"}
            />
            <GridColumn
              field={"dptcd"}
              title={"부서코드"}
              width={"150px"}
              cell={CustomComboBoxCell}
            />
            <GridColumn
              field={"birdt"}
              title={"생년월일"}
              width={"150px"}
              cell={DateCell}
            />
            <GridColumn field={"bircd"} title={"음양"} width={"150px"} />
            <GridColumn
              field={"ip_check_yn"}
              title={"IP체크여부"}
              width={"150px"}
              cell={CheckBoxCell}
            />
            <GridColumn field={"user_ip"} title={"IP"} width={"150px"} />
            <GridColumn
              field={"apply_start_date"}
              title={"시작일"}
              width={"150px"}
              cell={DateCell}
            />
            <GridColumn
              field={"apply_end_date"}
              title={"종료일"}
              width={"150px"}
              cell={DateCell}
            />
            <GridColumn
              field={"rtrchk"}
              title={"퇴사여부"}
              width={"150px"}
              cell={CheckBoxCell}
            />
            <GridColumn
              field={"hold_chk"}
              title={"임시정지"}
              width={"150px"}
              cell={CheckBoxCell}
            />
            <GridColumn
              field={"mbouseyn"}
              title={"목표관리 사용여부"}
              width={"150px"}
              cell={CheckBoxCell}
            />
            <GridColumn field={"memo"} title={"메모"} width={"150px"} />
            <GridColumn
              field={"opengb"}
              title={"공개범위"}
              width={"150px"}
              cell={CustomComboBoxCell}
            />
            <GridColumn
              field={"home_menu_ip"}
              title={"홈메뉴"}
              width={"150px"}
            />
          </Grid>
        </ExcelExport>
      </GridContainer>
    </>
  );
};

export default SY_A0120;
