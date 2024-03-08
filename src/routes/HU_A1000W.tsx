import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import CryptoJS from "crypto-js";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import DateCell from "../components/Cells/DateCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import DetailWindow from "../components/Windows/HU_A1000W_Window";
import { useApi } from "../hooks/api";
import { deletedAttadatnumsState, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/HU_A1000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const dateField = ["regorgdt", "rtrdt"];
interface IPrsnnum {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}
const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
const HU_A1000W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_A1000W", setCustomOptionData);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        rtrchk: defaultOption.find((item: any) => item.id === "rtrchk")
          .valueCode,
        dptcd: defaultOption.find((item: any) => item.id === "dptcd").valueCode,
      }));
    }
  }, [customOptionData]);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_A1000W", setMessagesData);

  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_dptcd_001,L_HU005", setBizComponentData);
  //공통코드 리스트 조회 ()
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
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

      fetchQuery(postcdQueryStr, setpostcdListData);
      fetchQuery(dptcdQueryStr, setdptcdListData);
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

  const search = () => {
    resetAllGrid();
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };
  const [workType, setWorkType] = useState<"N" | "U">("N");
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);

  const onAddClick = () => {
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.num]: true });

      setWorkType("U");
      setDetailWindowVisible(true);
    };

    return (
      <td className="k-command-cell">
        <Button
          className="k-grid-edit-command"
          themeColor={"primary"}
          fillMode="outline"
          onClick={onEditClick}
          icon="edit"
        ></Button>
      </td>
    );
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage({
      ...event.page,
    });
  };

  //엑셀 내보내기
  let _export: any;;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

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

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    setuserWindowVisible(true);
  };
  const setUserData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "UserList",
    orgdiv: "01",
    location: "01",
    dptcd: "",
    prsnnum: "",
    prsnnm: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A1000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dptcd": filters.dptcd,
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_rtrchk": filters.rtrchk,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.prsnnum == filters.find_row_value
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

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.prsnnum == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  let gridRef: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const decrypt = (encrypted: any, secretKey: any) => {
    try {
      var decrypted = CryptoJS.AES.decrypt(encrypted, secretKey).toString(
        CryptoJS.enc.Utf8
      );
      return decrypted;
    } catch (e) {
      console.log(e);
    }
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult.total > 0) {
      const datas = mainDataResult.data.filter(
        (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        prsnnum: datas.prsnnum,
        attdatnum: datas.attdatnum,
        bankdatnum: datas.bankdatnum,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    prsnnum: "",
    attdatnum: "",
    bankdatnum: "",
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_HU_A1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": "01",
      "@p_prsnnum": paraDataDeleted.prsnnum,
      "@p_prsnnum2": "",
      "@p_location": "",
      "@p_position": "",
      "@p_workplace": "",
      "@p_prsnnm": "",
      "@p_prsnnmh": "",
      "@p_prsnnme": "",
      "@p_nationcd": "",
      "@p_cardcd": "",
      "@p_dptcd": "",
      "@p_dptnm": "",
      "@p_postcd": "",
      "@p_ocptcd": "",
      "@p_workgb": "",
      "@p_workcls": "",
      "@p_jobcd": "",
      "@p_abilcd": "",
      "@p_paygrad": "",
      "@p_salaryclass": "",
      "@p_regcd": "",
      "@p_perregnum": "",
      "@p_salt": "",
      "@p_birdt": "",
      "@p_bircd": "",
      "@p_sexcd": "",
      "@p_imdate": "",
      "@p_firredt": "",
      "@p_regorgdt": "",
      "@p_rtrdt": "",
      "@p_rtrrsn": "",
      "@p_emptype": "",
      "@p_zipcode": "",
      "@p_koraddr": "",
      "@p_hmzipcode": "",
      "@p_hmaddr": "",
      "@p_enaddr": "",
      "@p_telephon": "",
      "@p_phonenum": "",
      "@p_extnum": "",
      "@p_outnum": "",
      "@p_schcd": "",
      "@p_gradutype": "",
      "@p_directyn": "",
      "@p_laboryn": "",
      "@p_dfmyn": "",
      "@p_milyn": "",
      "@p_paycd": "",
      "@p_taxcd": "",
      "@p_hirinsuyn": "",
      "@p_payyn": "",
      "@p_rtrgivdiv": "",
      "@p_yrgivdiv": "",
      "@p_mongivdiv": "",
      "@p_caltaxyn": "",
      "@p_yrdclyn": "",
      "@p_bankcd": "",
      "@p_bankacnt": "",
      "@p_bankacntuser": "",
      "@p_bankdatnum": "",
      "@p_insuzon": "",
      "@p_medgrad": "",
      "@p_medinsunum": "",
      "@p_pnsgrad": "",
      "@p_meddate": "",
      "@p_anudate": "",
      "@p_hirdate": "",
      "@p_sps": "",
      "@p_wmn": "",
      "@p_sptnum": 0,
      "@p_dfmnum": 0,
      "@p_agenum": 0,
      "@p_agenum70": 0,
      "@p_brngchlnum": 0,
      "@p_fam1": 0,
      "@p_fam2": 0,
      "@p_notaxe": "",
      "@p_otkind": "",
      "@p_bnskind": "",
      "@p_payprovyn": "",
      "@p_mailid": "",
      "@p_workmail": "",
      "@p_childnum": 0,
      "@p_dfmyn2": "",
      "@p_houseyn": "",
      "@p_remark": "",
      "@p_costdiv1": "",
      "@p_costdiv2": "",
      "@p_path": "",
      "@p_attdatnum": "",
      "@p_incgb": "",
      "@p_exmtaxgb": "",
      "@p_exstartdt": "",
      "@p_exenddt": "",
      "@p_dayoffdiv": "",
      "@p_rtrtype": "",

      "@p_userid": userId,
      "@p_pc": pc,

      "@p_mngitemcd1": "",
      "@p_mngitemcd2": "",
      "@p_mngitemcd3": "",
      "@p_mngitemcd4": "",
      "@p_mngitemcd5": "",
      "@p_mngitemcd6": "",
      "@p_mngdata1": "",
      "@p_mngdata2": "",
      "@p_mngdata3": "",
      "@p_mngdata4": "",
      "@p_mngdata5": "",
      "@p_mngdata6": "",
      "@p_workchk": "",
      "@p_yrchk": "",

      //개인정보
      "@p_height": 0,
      "@p_weight": 0,
      "@p_blood": "",
      "@p_color": "",
      "@p_leye": 0,
      "@p_reye": 0,
      "@p_hobby": "",
      "@p_hobby2": "",
      "@p_religion": "",
      "@p_marriage": "",
      "@p_marrydt": "",
      "@p_orgaddr": "",
      "@p_birthplace": "",
      "@p_size1": "",
      "@p_size2": "",
      "@p_size3": "",
      "@p_photodatnum": "",

      "@p_armygb": "",
      "@p_armystartdt": "",
      "@p_armyenddt": "",
      "@p_armyclass": "",
      "@p_armyexrsn": "",
      "@p_armydistinctiom": "",
      "@p_armyrank": "",
      "@p_militarynum": "",
      "@p_armykind": "",
      "@p_armyspeciality": "",

      "@p_below2kyn": "",
      "@p_occudate": "",

      "@p_form_id": "HU_A1000W",
    },
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const isLastDataDeleted =
        mainDataResult.data.length === 1 && filters.pgNum > 0;
      const findRowIndex = mainDataResult.data.findIndex(
        (row: any) =>
          row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      );

      let array: any[] = [];

      if (paraDataDeleted.attdatnum) {
        array.push(paraDataDeleted.attdatnum);
      }

      if (paraDataDeleted.bankdatnum) {
        array.push(paraDataDeleted.bankdatnum);
      }

      setDeletedAttadatnums(array);

      if (isLastDataDeleted) {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });

        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: isLastDataDeleted
            ? prev.pgNum != 1
              ? prev.pgNum - 1
              : prev.pgNum
            : prev.pgNum,
          isSearch: true,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          find_row_value:
            mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
              .prsnnum,
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    //초기화
    setParaDataDeleted((prev) => ({
      work_type: "",
      prsnnum: "",
      attdatnum: "",
      bankdatnum: "",
    }));
  };

  useEffect(() => {
    if (paraDataDeleted.work_type != "") fetchToDelete();
  }, [paraDataDeleted]);

  return (
    <>
      <TitleContainer>
        <Title>인사관리</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A1000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>부서코드</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
              </td>
              <th>사번</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onUserWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>성명</th>
              <td>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>재직여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="rtrchk"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
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
            <GridTitle>기본정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="file-add"
              >
                사용자생성
              </Button>
              <Button
                onClick={onDeleteClick}
                icon="delete"
                fillMode="outline"
                themeColor={"primary"}
              >
                사용자삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "78vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                dptcd: dptcdListData.find(
                  (item: any) => item.dptcd == row.dptcd
                )?.dptnm,
                postcd: postcdListData.find(
                  (item: any) => item.sub_code === row.postcd
                )?.code_name,
                perregnum:
                  row.perregnum == "" ||
                  row.perregnum == null ||
                  row.perregnum == undefined
                    ? ""
                    : decrypt(row.perregnum, row.salt),
                telephon:
                  row.telephon == "" ||
                  row.telephon == null ||
                  row.telephon == undefined
                    ? ""
                    : decrypt(row.telephon, row.salt),
                phonenum:
                  row.phonenum == "" ||
                  row.phonenum == null ||
                  row.phonenum == undefined
                    ? ""
                    : decrypt(row.phonenum, row.salt),
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
          >
            <GridColumn cell={CommandCell} width="50px" />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]
                .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                .map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        cell={
                          dateField.includes(item.fieldName)
                            ? DateCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0 ? mainTotalFooterCell : undefined
                        }
                      ></GridColumn>
                    )
                )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          reload={(str) => {
            setFilters((prev) => ({
              ...prev,
              find_row_value: str,
              isSearch: true,
            }));
          }}
          data={
            mainDataResult.data.filter(
              (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
            )[0] == undefined
              ? ""
              : mainDataResult.data.filter(
                  (item) =>
                    item.num == Object.getOwnPropertyNames(selectedState)[0]
                )[0]
          }
          modal={true}
          pathname="HU_A1000W"
        />
      )}
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

export default HU_A1000W;
