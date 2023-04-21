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
} from "@progress/kendo-react-grid";
import { gridList } from "../store/columns/AC_A0000W_C";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Icon, getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import FilterContainer from "../components/Containers/FilterContainer";
import {
  Title,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  dateformat,
  UseParaPc,
  UseGetValueFromSessionItem,
  useSysMessage,
} from "../components/CommonFunction";
import {
  PAGE_SIZE,
  SELECTED_FIELD,
  COM_CODE_DEFAULT_VALUE,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";

const DATA_ITEM_KEY = "num";

const AC_A0000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
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
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA002, L_BA025, L_AC061, L_BA049,L_dptcd_001, L_BA001",
    //사업장, 업태, 회기, 신고세무소, 회계부서, 회사구분
    setBizComponentData
  );
  const [orgdivListData, setOrgdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const orgdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA001")
      );
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
      );
      fetchQuery(orgdivQueryStr, setOrgdivListData);
      fetchQuery(locationQueryStr, setLocationListData);
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [isInitSearch, setIsInitSearch] = useState(false);

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [mainPgNum, setMainPgNum] = useState(1);
  const [workType, setWorkType] = useState<string>("U");
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [infomation, setInfomation] = useState({
    pgSize: PAGE_SIZE,
    workType: "U",
    acntfrdt: new Date(),
    acntses: "",
    acnttodt: new Date(),
    address: "",
    address_eng: "",
    bizregnum: "",
    bnkinfo: "",
    certid: "",
    closechk: "",
    compclass: "",
    compnm: "",
    compnm_eng: "",
    compregno: "",
    comptype: "",
    dptcd: "",
    efaxnum: "",
    email: "",
    estbdt: new Date(),
    etelnum: "",
    faxnum: "",
    nickname: "",
    orgdiv: "",
    phonenum: "",
    reprenm: "",
    reprenm_eng: "",
    repreregno: "",
    sendid: "",
    settlecd: "",
    taxloca: "",
    taxlocanm: "",
    taxorg: "",
    taxortnm: "",
    zipcode: "",
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: "01",
    location: "01",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_AC_A0000W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
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

      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
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
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchMainGrid();
    }
  }, [mainPgNum]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];
        setSelectedState({ [firstRowData.num]: true });

        setInfomation({
          pgSize: PAGE_SIZE,
          workType: "U",
          acntfrdt: new Date(dateformat(firstRowData.acntfrdt)),
          acntses: firstRowData.acntses,
          acnttodt: new Date(dateformat(firstRowData.acnttodt)),
          address: firstRowData.address,
          address_eng: firstRowData.address_eng,
          bizregnum: firstRowData.bizregnum,
          bnkinfo: firstRowData.bnkinfo,
          certid: firstRowData.certid,
          closechk: firstRowData.closechk,
          compclass: firstRowData.compclass,
          compnm: firstRowData.compnm,
          compnm_eng: firstRowData.compnm_eng,
          compregno: firstRowData.compregno,
          comptype: firstRowData.comptype,
          dptcd: firstRowData.dptcd,
          efaxnum: firstRowData.efaxnum,
          email: firstRowData.email,
          estbdt: new Date(dateformat(firstRowData.estbdt)),
          etelnum: firstRowData.etelnum,
          faxnum: firstRowData.faxnum,
          nickname: firstRowData.nickname,
          orgdiv: firstRowData.orgdiv,
          phonenum: firstRowData.phonenum,
          reprenm: firstRowData.reprenm,
          reprenm_eng: firstRowData.reprenm_eng,
          repreregno: firstRowData.repreregno,
          sendid: firstRowData.sendid,
          settlecd: firstRowData.settlecd,
          taxloca: firstRowData.taxloca,
          taxlocanm: firstRowData.taxlocanm,
          taxorg: firstRowData.taxorg,
          taxortnm: firstRowData.taxortnm,
          zipcode: firstRowData.zipcode,
        });

        setIfSelectFirstRow(true);
      }
    }
  }, [mainDataResult]);

  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    const tax = locationListData.find(
      (item: any) => item.code_name === selectedRowData.taxloca
    )?.sub_code;

    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "U",
      acntfrdt: new Date(dateformat(selectedRowData.acntfrdt)),
      acntses: selectedRowData.acntses,
      acnttodt: new Date(dateformat(selectedRowData.acnttodt)),
      address: selectedRowData.address,
      address_eng: selectedRowData.address_eng,
      bizregnum: selectedRowData.bizregnum,
      bnkinfo: selectedRowData.bnkinfo,
      certid: selectedRowData.certid,
      closechk: selectedRowData.closechk,
      compclass: selectedRowData.compclass,
      compnm: selectedRowData.compnm,
      compnm_eng: selectedRowData.compnm_eng,
      compregno: selectedRowData.compregno,
      comptype: selectedRowData.comptype,
      dptcd: selectedRowData.dptcd,
      efaxnum: selectedRowData.efaxnum,
      email: selectedRowData.email,
      estbdt: new Date(dateformat(selectedRowData.estbdt)),
      etelnum: selectedRowData.etelnum,
      faxnum: selectedRowData.faxnum,
      nickname: selectedRowData.nickname,
      orgdiv: selectedRowData.orgdiv,
      phonenum: selectedRowData.phonenum,
      reprenm: selectedRowData.reprenm,
      reprenm_eng: selectedRowData.reprenm_eng,
      repreregno: selectedRowData.repreregno,
      sendid: selectedRowData.sendid,
      settlecd: selectedRowData.settlecd,
      taxloca: tax == undefined ? "" : tax,
      taxlocanm: selectedRowData.taxlocanm,
      taxorg: selectedRowData.taxorg,
      taxortnm: selectedRowData.taxortnm,
      zipcode: selectedRowData.zipcode,
    });
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

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const onAddClick2 = () => {
    setWorkType("N");
    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "N",
      acntfrdt: new Date(),
      acntses: "",
      acnttodt: new Date(),
      address: "",
      address_eng: "",
      bizregnum: "",
      bnkinfo: "",
      certid: "",
      closechk: "",
      compclass: "",
      compnm: "",
      compnm_eng: "",
      compregno: "",
      comptype: "",
      dptcd: "",
      efaxnum: "",
      email: "",
      estbdt: new Date(),
      etelnum: "",
      faxnum: "",
      nickname: "",
      orgdiv: "",
      phonenum: "",
      reprenm: "",
      reprenm_eng: "",
      repreregno: "",
      sendid: "",
      settlecd: "",
      taxloca: "",
      taxlocanm: "",
      taxorg: "",
      taxortnm: "",
      zipcode: "",
    });
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
    fetchMainGrid();
  };

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    orgdiv: "",
    taxloca: "",
  });

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    const selectRows = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      orgdiv: selectRows.orgdiv,
      taxloca: selectRows.taxloca,
    }));
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_AC_A0000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": paraDataDeleted.orgdiv,
      "@p_taxloca": infomation.taxloca,
      "@p_compnm": "",
      "@p_taxlocanm": "",
      "@p_bizregnum": "",
      "@p_reprenm": "",
      "@p_repreregno": "",
      "@p_comptype": "",
      "@p_compclass": "",
      "@p_zipcode": "",
      "@p_address": "",
      "@p_phonenum": "",
      "@p_faxnum": "",
      "@p_taxorg": "",
      "@p_taxortnm": "",
      "@p_compregno": "",
      "@p_estbdt": "",
      "@p_acntses": "",
      "@p_acntfrdt": "",
      "@p_acnttodt": "",
      "@p_dptcd": "",
      "@p_settlecd": "",
      "@p_closechk": "",
      "@p_bnkinfo": "",
      "@p_compnm_eng": "",
      "@p_address_eng": "",
      "@p_etelnum": "",
      "@p_efaxnum": "",
      "@p_reprenm_eng": "",
      "@p_nickname": "",
      "@p_sendid": "",
      "@p_certid": "",
      "@p_email": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A0000W",
    },
  };

  const infopara: Iparameters = {
    procedureName: "P_AC_A0000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": infomation.workType,
      "@p_orgdiv": infomation.orgdiv,
      "@p_taxloca": infomation.taxloca,
      "@p_compnm": infomation.compnm,
      "@p_taxlocanm": infomation.taxlocanm,
      "@p_bizregnum": infomation.bizregnum,
      "@p_reprenm": infomation.reprenm,
      "@p_repreregno": infomation.repreregno,
      "@p_comptype": infomation.comptype,
      "@p_compclass": infomation.compclass,
      "@p_zipcode": infomation.zipcode,
      "@p_address": infomation.address,
      "@p_phonenum": infomation.phonenum,
      "@p_faxnum": infomation.faxnum,
      "@p_taxorg": infomation.taxorg,
      "@p_taxortnm": infomation.taxortnm,
      "@p_compregno": infomation.compregno,
      "@p_estbdt": convertDateToStr(infomation.estbdt),
      "@p_acntses": infomation.acntses,
      "@p_acntfrdt": convertDateToStr(infomation.acntfrdt),
      "@p_acnttodt": convertDateToStr(infomation.acnttodt),
      "@p_dptcd": infomation.dptcd,
      "@p_settlecd": infomation.settlecd,
      "@p_closechk": infomation.closechk,
      "@p_bnkinfo": infomation.bnkinfo,
      "@p_compnm_eng": infomation.compnm_eng,
      "@p_address_eng": infomation.address_eng,
      "@p_etelnum": infomation.etelnum,
      "@p_efaxnum": infomation.efaxnum,
      "@p_reprenm_eng": infomation.reprenm_eng,
      "@p_nickname": infomation.nickname,
      "@p_sendid": infomation.sendid,
      "@p_certid": infomation.certid,
      "@p_email": infomation.email,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A0000W",
    },
  };

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete();
  }, [paraDataDeleted]);

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      fetchMainGrid();

      setInfomation({
        pgSize: PAGE_SIZE,
        workType: "U",
        acntfrdt: new Date(),
        acntses: "",
        acnttodt: new Date(),
        address: "",
        address_eng: "",
        bizregnum: "",
        bnkinfo: "",
        certid: "",
        closechk: "",
        compclass: "",
        compnm: "",
        compnm_eng: "",
        compregno: "",
        comptype: "",
        dptcd: "",
        efaxnum: "",
        email: "",
        estbdt: new Date(),
        etelnum: "",
        faxnum: "",
        nickname: "",
        orgdiv: "",
        phonenum: "",
        reprenm: "",
        reprenm_eng: "",
        repreregno: "",
        sendid: "",
        settlecd: "",
        taxloca: "",
        taxlocanm: "",
        taxorg: "",
        taxortnm: "",
        zipcode: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.orgdiv = "";
    paraDataDeleted.taxloca = "";
  };

  const onSaveClick2 = async () => {
    fetchSaved();
  };

  const fetchSaved = async () => {
    let data: any;

    let valid = true;

    try {
      if (infomation.orgdiv == "") {
        throw findMessage(messagesData, "AC_A0000W_001");
      } else if (infomation.taxloca == "") {
        throw findMessage(messagesData, "AC_A0000W_001");
      } else if (infomation.compnm == "") {
        throw findMessage(messagesData, "AC_A0000W_001");
      } 
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    setLoading(true);

    try {
      data = await processApi<any>("procedure", infopara);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setMainPgNum(1);
      setMainDataResult(process([], mainDataState));

      fetchMainGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if(data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <TitleContainer>
        <Title>법인기본</Title>

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
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
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
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <GridTitleContainer>
            <GridTitle>요약정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="file-add"
              >
                생성
              </Button>
              <Button
                onClick={onSaveClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              >
                저장
              </Button>
              <Button
                onClick={onDeleteClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="delete"
              >
                삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "45vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                taxloca: locationListData.find(
                  (item: any) => item.sub_code === row.taxloca
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
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      id={item.id}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      footerCell={
                        item.sortOrder === 0 ? mainTotalFooterCell : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      <FormBoxWrap style={{ height: "40vh" }}>
        <FormBox>
          <tbody>
            <tr>
              <th>회사구분</th>
              {infomation.workType == "N" ? (
                <td>
                  {bizComponentData !== null && (
                    <BizComponentComboBox
                      name="orgdiv"
                      value={infomation.orgdiv}
                      bizComponentId="L_BA001"
                      bizComponentData={bizComponentData}
                      changeData={ComboBoxChange}
                      className="required"
                    />
                  )}
                </td>
              ) : (
                <td>
                  <Input
                    name="orgdiv"
                    type="text"
                    value={
                      orgdivListData.find(
                        (item: any) => item.sub_code === infomation.orgdiv
                      )?.code_name
                    }
                    className="readonly"
                  />
                </td>
              )}
            </tr>
            <tr>
              <th>사업장코드</th>
              {infomation.workType == "N" ? (
                <td>
                  {bizComponentData !== null && (
                    <BizComponentComboBox
                      name="taxloca"
                      value={infomation.taxloca}
                      bizComponentId="L_BA002"
                      bizComponentData={bizComponentData}
                      changeData={ComboBoxChange}
                      className="required"
                    />
                  )}
                </td>
              ) : (
                <td>
                  <Input
                    name="taxloca"
                    type="text"
                    value={
                      locationListData.find(
                        (item: any) => item.sub_code === infomation.taxloca
                      )?.code_name
                    }
                    className="readonly"
                  />
                </td>
              )}
              <th>회사명</th>
              <td colSpan={3}>
                <Input
                  name="compnm"
                  type="text"
                  value={infomation.compnm}
                  onChange={InputChange}
                  className="required"
                />
              </td>
              <th>사업자등록번호</th>
              <td>
                <Input
                  name="bizregnum"
                  type="text"
                  value={infomation.bizregnum}
                  onChange={InputChange}
                />
              </td>
              <th>대표자명</th>
              <td>
                <Input
                  name="reprenm"
                  type="text"
                  value={infomation.reprenm}
                  onChange={InputChange}
                />
              </td>
              <th>주민등록번호</th>
              <td>
                <Input
                  name="repreregno"
                  type="text"
                  value={infomation.repreregno}
                  onChange={InputChange}
                />
              </td>
            </tr>
            <tr>
              <th>업종</th>
              <td colSpan={3}>
                <Input
                  name="comptype"
                  type="text"
                  value={infomation.comptype}
                  onChange={InputChange}
                />
              </td>
              <th>업태</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="compclass"
                    value={infomation.compclass}
                    bizComponentId="L_BA025"
                    bizComponentData={bizComponentData}
                    changeData={ComboBoxChange}
                  />
                )}
              </td>
              <th>우편번호</th>
              <td>
                <Input
                  name="zipcode"
                  type="text"
                  value={infomation.zipcode}
                  onChange={InputChange}
                />
              </td>
              <th>전화번호</th>
              <td>
                <Input
                  name="phonenum"
                  type="text"
                  value={infomation.phonenum}
                  onChange={InputChange}
                />
              </td>
              <th>팩스번호</th>
              <td>
                <Input
                  name="faxnum"
                  type="text"
                  value={infomation.faxnum}
                  onChange={InputChange}
                />
              </td>
            </tr>
            <tr>
              <th>주소</th>
              <td colSpan={5}>
                <Input
                  name="address"
                  type="text"
                  value={infomation.address}
                  onChange={InputChange}
                />
              </td>
              <th>법인등록번호</th>
              <td>
                <Input
                  name="compregno"
                  type="text"
                  value={infomation.compregno}
                  onChange={InputChange}
                />
              </td>
              <th>개업년원일</th>
              <td>
                <DatePicker
                  name="estbdt"
                  value={infomation.estbdt}
                  format="yyyy-MM-dd"
                  onChange={InputChange}
                  placeholder=""
                  className="required"
                />
              </td>
              <th>신고세무소</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="taxorg"
                    value={infomation.taxorg}
                    bizComponentId="L_BA049"
                    bizComponentData={bizComponentData}
                    changeData={ComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>시작회계년도</th>
              <td>
                <DatePicker
                  name="acntfrdt"
                  value={infomation.acntfrdt}
                  format="yyyy-MM-dd"
                  onChange={InputChange}
                  placeholder=""
                  className="required"
                />
              </td>
              <th>종료회계년도</th>
              <td>
                <DatePicker
                  name="acnttodt"
                  value={infomation.acnttodt}
                  format="yyyy-MM-dd"
                  onChange={InputChange}
                  placeholder=""
                  className="required"
                />
              </td>
              <th>회기</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="acntses"
                    value={infomation.acntses}
                    bizComponentId="L_AC061"
                    bizComponentData={bizComponentData}
                    changeData={ComboBoxChange}
                  />
                )}
              </td>
              <th>회계부서</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="dptcd"
                    value={infomation.dptcd}
                    bizComponentId="L_dptcd_001"
                    bizComponentData={bizComponentData}
                    changeData={ComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
              </td>
              <th>전자전화번호</th>
              <td>
                <Input
                  name="etelnum"
                  type="text"
                  value={infomation.etelnum}
                  onChange={InputChange}
                />
              </td>
              <th>전자팩스번호</th>
              <td>
                <Input
                  name="efaxnum"
                  type="text"
                  value={infomation.efaxnum}
                  onChange={InputChange}
                />
              </td>
            </tr>
            <tr>
              <th>닉네임</th>
              <td>
                <Input
                  name="nickname"
                  type="text"
                  value={infomation.nickname}
                  onChange={InputChange}
                />
              </td>
              <th>이메일</th>
              <td>
                <Input
                  name="email"
                  type="text"
                  value={infomation.email}
                  onChange={InputChange}
                />
              </td>
              <th>결재란수</th>
              <td>
                <Input
                  name="settlecd"
                  type="number"
                  value={infomation.settlecd}
                  onChange={InputChange}
                />
              </td>
              <th>샌드빌ID</th>
              <td colSpan={3}>
                <Input
                  name="sendid"
                  type="text"
                  value={infomation.sendid}
                  onChange={InputChange}
                />
              </td>
              <th>CERTID</th>
              <td>
                <Input
                  name="certid"
                  type="text"
                  value={infomation.certid}
                  onChange={InputChange}
                />
              </td>
            </tr>
            <tr>
              <th>영문회사명</th>
              <td colSpan={3}>
                <Input
                  name="compnm_eng"
                  type="text"
                  value={infomation.compnm_eng}
                  onChange={InputChange}
                />
              </td>
              <th>영문대표자명</th>
              <td>
                <Input
                  name="reprenm_eng"
                  type="text"
                  value={infomation.reprenm_eng}
                  onChange={InputChange}
                />
              </td>
              <th>영문주소</th>
              <td colSpan={5}>
                <Input
                  name="address_eng"
                  type="text"
                  value={infomation.address_eng}
                  onChange={InputChange}
                />
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      {gridList.map((grid: any) =>
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
      )}
    </>
  );
};

export default AC_A0000W;
