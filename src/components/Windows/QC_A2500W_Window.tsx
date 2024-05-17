import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import * as React from "react";
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import {
  deletedNameState,
  isLoading,
  unsavedNameState,
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  convertDateToStr,
  findMessage,
  toDate,
} from "../CommonFunction";
import { PAGE_SIZE } from "../CommonString";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
type IWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  reloadData(workType: string): void;
  basicdata?: Idata2;
  modal?: boolean;
  pathname: string;
};

type Idata = {
  attdatnum: string;
  baddt: string;
  badnum: string;
  badseq: number;
  causedcd: string;
  contents: string;
  crsdiv1: string;
  custcd: string;
  custnm: string;
  datnum: string;
  errtext: string;
  files: string;
  itemcd: string;
  itemnm: string;
  lotnum: string;
  orgdiv: string;
  person: string;
  proccd: string;
  protext: string;
  qcdt: string;
  qty: number;
  recdt: string;
  renum: string;
  reseq: number;
  title: string;
};

type Idata2 = {
  itemcd: string;
  itemnm: string;
  proccd: string;
  qty: number;
  badnum: string;
  badseq: number;
  renum: string;
  reseq: number;
  baddt: string;
};

const CopyWindow = ({
  workType,
  data,
  setVisible,
  reloadData,
  basicdata,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 700,
  });
  const [pc, setPc] = useState("");
  const setLoading = useSetRecoilState(isLoading);
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
  const processApi = useApi();
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && workType != "U") {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        causedcd: defaultOption.find((item: any) => item.id == "causedcd")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

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
    if (unsavedName.length > 0) setDeletedName(unsavedName);

    setVisible(false);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  interface IItemData {
    itemcd: string;
    itemno: string;
    itemnm: string;
    insiz: string;
    model: string;
    itemacnt: string;
    itemacntnm: string;
    bnatur: string;
    spec: string;
    invunit: string;
    invunitnm: string;
    unitwgt: string;
    wgtunit: string;
    wgtunitnm: string;
    maker: string;
    dwgno: string;
    remark: string;
    itemlvl1: string;
    itemlvl2: string;
    itemlvl3: string;
    extra_field1: string;
    extra_field2: string;
    extra_field7: string;
    extra_field6: string;
    extra_field8: string;
    packingsiz: string;
    unitqty: string;
    color: string;
    gubun: string;
    qcyn: string;
    outside: string;
    itemthick: string;
    itemlvl4: string;
    itemlvl5: string;
    custitemnm: string;
  }
  interface ICustData {
    address: string;
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    datnum: "",
    attdatnum: "",
    baddt: null,
    badnum: "",
    badseq: 0,
    causedcd: "",
    contents: "",
    crsdiv1: "",
    custcd: "",
    custnm: "",
    errtext: "",
    files: "",
    itemcd: "",
    itemnm: "",
    lotnum: "",
    person: "admin",
    proccd: "",
    protext: "",
    qcdt: new Date(),
    qty: 0,
    recdt: new Date(),
    renum: "",
    reseq: 0,
    title: "",
  });

  useEffect(() => {
    if (workType == "U" && data != undefined) {
      setFilters((prev) => ({
        ...prev,
        workType: workType,
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        datnum: data.datnum,
        attdatnum: data.attdatnum,
        baddt: data.baddt == "" ? null : toDate(data.baddt),
        badnum: data.badnum,
        badseq: data.badseq,
        causedcd: data.causedcd,
        contents: data.contents,
        crsdiv1: data.crsdiv1,
        custcd: data.custcd,
        custnm: data.custnm,
        errtext: data.errtext,
        files: data.files,
        itemcd: data.itemcd,
        itemnm: data.itemnm,
        lotnum: data.lotnum,
        person: data.person,
        proccd: data.proccd,
        protext: data.protext,
        qcdt: toDate(data.qcdt),
        qty: data.qty,
        recdt: toDate(data.recdt),
        renum: data.renum,
        reseq: data.reseq,
        title: data.title,
      }));
    } else if (workType == "N" && basicdata != undefined) {
      setFilters((prev) => ({
        ...prev,
        workType: workType,
        itemcd: basicdata.itemcd,
        itemnm: basicdata.itemnm,
        proccd: basicdata.proccd,
        qty: basicdata.qty,
        badnum: basicdata.badnum,
        badseq: basicdata.badseq,
        renum: basicdata.renum,
        reseq: basicdata.reseq,
      }));
    }
  }, []);

  const getAttachmentsData = (data: IAttachmentData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    try {
      if (
        convertDateToStr(filters.qcdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.qcdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.qcdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.qcdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A2500W_001");
      } else if (
        filters.causedcd == null ||
        filters.causedcd == "" ||
        filters.causedcd == undefined
      ) {
        throw findMessage(messagesData, "QC_A2500W_002");
      } else {
        setParaData((prev) => ({
          ...prev,
          workType: workType,
          orgdiv: sessionOrgdiv,
          location: sessionLocation,
          datnum: filters.datnum,
          attdatnum: filters.attdatnum,
          baddt: filters.baddt == null ? "" : convertDateToStr(filters.baddt),
          badnum: filters.badnum,
          badseq: filters.badseq,
          causedcd: filters.causedcd,
          contents: filters.contents,
          crsdiv1: filters.crsdiv1,
          custcd: filters.custcd,
          custnm: filters.custnm,
          errtext: filters.errtext,
          files: filters.files,
          itemcd: filters.itemcd,
          itemnm: filters.itemnm,
          lotnum: filters.lotnum,
          person: filters.person,
          proccd: filters.proccd,
          protext: filters.protext,
          qcdt: convertDateToStr(filters.qcdt),
          qty: filters.qty,
          recdt: convertDateToStr(filters.recdt),
          renum: filters.renum,
          reseq: filters.reseq,
          title: filters.title,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    datnum: "",
    attdatnum: "",
    baddt: "",
    badnum: "",
    badseq: 0,
    causedcd: "",
    contents: "",
    crsdiv1: "",
    custcd: "",
    custnm: "",
    errtext: "",
    files: "",
    itemcd: "",
    itemnm: "",
    lotnum: "",
    person: "",
    proccd: "",
    protext: "",
    qcdt: "",
    qty: 0,
    recdt: "",
    renum: "",
    reseq: 0,
    title: "",
  });

  const para: Iparameters = {
    procedureName: "P_QC_A2500W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_datnum": ParaData.datnum,
      "@p_recdt": ParaData.recdt,
      "@p_baddt": ParaData.baddt,
      "@p_custcd": ParaData.custcd,
      "@p_itemcd": ParaData.itemcd,
      "@p_proccd": ParaData.proccd,
      "@p_lotnum": ParaData.lotnum,
      "@p_qty": ParaData.qty,
      "@p_person": ParaData.person,
      "@p_title": ParaData.title,
      "@p_contents": ParaData.contents,
      "@p_errtext": ParaData.errtext,
      "@p_qcdt": ParaData.qcdt,
      "@p_protext": ParaData.protext,
      "@p_renum": ParaData.renum,
      "@p_reseq": ParaData.reseq,
      "@p_badnum": ParaData.badnum,
      "@p_badseq": ParaData.badseq,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_causedcd": ParaData.causedcd,
      "@p_crsdiv1": ParaData.crsdiv1,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "QC_A2500W",
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (workType == "U") {
        reloadData(data.returnString);
      } else {
        reloadData(data.returnString);
        setVisible(false);
      }
      setUnsavedName([]);
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        datnum: "",
        attdatnum: "",
        baddt: "",
        badnum: "",
        badseq: 0,
        causedcd: "",
        contents: "",
        crsdiv1: "",
        custcd: "",
        custnm: "",
        errtext: "",
        files: "",
        itemcd: "",
        itemnm: "",
        lotnum: "",
        person: "",
        proccd: "",
        protext: "",
        qcdt: "",
        qty: 0,
        recdt: "",
        renum: "",
        reseq: 0,
        title: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  return (
    <>
      <Window
        title={workType == "N" ? "NCR생성" : "NCR정보"}
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
                <th>NCR NO</th>
                <td>
                  <Input
                    name="datnum"
                    type="text"
                    value={filters.datnum}
                    className="readonly"
                  />
                </td>
                <th>작성일</th>
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="recdt"
                      value={filters.recdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      placeholder=""
                      className="required"
                    />
                  </div>
                </td>
                <th>조치일자</th>
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="qcdt"
                      value={filters.qcdt}
                      format="yyyy-MM-dd"
                      className="required"
                      onChange={filterInputChange}
                      placeholder=""
                    />
                  </div>
                </td>
                <th>불량원인</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="causedcd"
                      value={filters.causedcd}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      className="required"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>업체코드</th>
                <td>
                  <Input
                    name="custcd"
                    type="text"
                    value={filters.custcd}
                    onChange={filterInputChange}
                  />
                  <ButtonInInput>
                    <Button
                      onClick={onCustWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
                <th>업체명</th>
                <td>
                  <Input
                    name="custnm"
                    type="text"
                    value={filters.custnm}
                    onChange={filterInputChange}
                  />
                </td>
                <th>불량일자</th>
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="baddt"
                      value={filters.baddt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      placeholder=""
                    />
                  </div>
                </td>
                <th>공정</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="proccd"
                      value={filters.proccd}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>품목코드</th>
                <td>
                  <Input
                    name="itemcd"
                    type="text"
                    value={filters.itemcd}
                    onChange={filterInputChange}
                  />
                  <ButtonInInput>
                    <Button
                      onClick={onItemWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
                <th>품목명</th>
                <td>
                  <Input
                    name="itemnm"
                    type="text"
                    value={filters.itemnm}
                    onChange={filterInputChange}
                  />
                </td>
                <th>수량</th>
                <td>
                  <Input
                    name="qty"
                    type="number"
                    value={filters.qty}
                    onChange={filterInputChange}
                  />
                </td>
                <th>LOT NO</th>
                <td>
                  <Input
                    name="lotnum"
                    type="text"
                    value={filters.lotnum}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>제목</th>
                <td colSpan={7}>
                  <Input
                    name="title"
                    type="text"
                    value={filters.title}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>부적합내용</th>
                <td colSpan={7}>
                  <TextArea
                    value={filters.contents}
                    name="contents"
                    rows={3}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>부적합원인</th>
                <td colSpan={7}>
                  <TextArea
                    value={filters.errtext}
                    name="errtext"
                    rows={3}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>즉시조치</th>
                <td colSpan={7}>
                  <TextArea
                    value={filters.protext}
                    name="protext"
                    rows={3}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>유효성확인</th>
                <td colSpan={7}>
                  <TextArea
                    value={filters.crsdiv1}
                    name="crsdiv1"
                    rows={3}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>첨부번호</th>
                <td colSpan={7}>
                  <Input
                    name="files"
                    type="text"
                    value={filters.files}
                    className="readonly"
                  />
                  <ButtonInInput>
                    <Button
                      type={"button"}
                      onClick={onAttachmentsWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <BottomContainer>
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={selectData}>
              저장
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
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          workType={"ROW_ADD"}
          setVisible={setItemWindowVisible}
          setData={setItemData}
        />
      )}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={filters.attdatnum}
        />
      )}
    </>
  );
};

export default CopyWindow;
