import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { useEffect, useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
  GridContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getBizCom,
  getHeight,
  getWindowDeviceHeight,
} from "../CommonFunction";
import { COM_CODE_DEFAULT_VALUE, SELECTED_FIELD } from "../CommonString";
import Window from "./WindowComponent/Window";
type IWindow = {
  para: any;
  reload(): void; //data : 선택한 품목 데이터를 전달하는 함수
  setVisible(t: boolean): void;
  modal?: boolean;
};

const DATA_ITEM_KEY = "num";
var height = 0;
var height2 = 0;
var height3 = 0;

const ItemsWindow = ({ para, reload, setVisible, modal = false }: IWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const pc = UseGetValueFromSessionItem("pc");
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_CR070",
    //사용자, 교육구분
    setBizComponentData
  );
  const [bookacntListData, setBookacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setBookacntListData(getBizCom(bizComponentData, "L_CR070"));
    }
  }, [bizComponentData]);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 700) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 500) / 2,
    width: isMobile == true ? deviceWidth : 700,
    height: isMobile == true ? deviceHeight : 500,
  });
  useLayoutEffect(() => {
    if (customOptionData != null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".BottomContainer"); //하단 버튼부분
      height3 = getHeight(".WindowFormBoxWrap");

      setMobileHeight(
        getWindowDeviceHeight(false, deviceHeight) - height - height2 - height3
      );
      setWebHeight(
        getWindowDeviceHeight(false, position.height) -
          height -
          height2 -
          height3
      );
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2 - height3
    );
  };

  const idGetter = getter(DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const setLoading = useSetRecoilState(isLoading);

  const onClose = () => {
    setVisible(false);
  };

  const processApi = useApi();

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onConfirmBtnClick = (props: any) => {
    if (information.inoutdiv == "") {
      alert("필수값을 채워주세요.");
      return false;
    }

    const dataItem = mainDataResult.data;
    let dataArr: any = {
      rowstatus_s: [],
      datnum_s: [],
      date_s: [],
      person_s: [],
      inoutdiv_s: [],
      bookcd_s: [],
      remark_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const { datnum = "", person = "", bookcd = "", remark = "" } = item;
      dataArr.rowstatus_s.push("N");
      dataArr.datnum_s.push(datnum);
      dataArr.date_s.push(convertDateToStr(information.date));
      dataArr.person_s.push(person);
      dataArr.inoutdiv_s.push(information.inoutdiv);
      dataArr.bookcd_s.push(bookcd);
      dataArr.remark_s.push(remark);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "INOUT",
      orgdiv: sessionOrgdiv,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      person_s: dataArr.person_s.join("|"),
      inoutdiv_s: dataArr.inoutdiv_s.join("|"),
      bookcd_s: dataArr.bookcd_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      datnum_s: dataArr.datnum_s.join("|"),
      date_s: dataArr.date_s.join("|"),
    }));
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    bookcd: "",
    booknm: "",
    bookacnt: "",
    location: "",
    person: "",
    dptcd: "",
    amt: 0,
    maker: "",
    attdatnum_img: "",
    remark: "",
    rowstatus_s: "",
    person_s: "",
    inoutdiv_s: "",
    bookcd_s: "",
    remark_s: "",
    datnum_s: "",
    date_s: "",
  });

  const paras: Iparameters = {
    procedureName: "P_CM_A4500W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_bookcd": paraData.bookcd,
      "@p_booknm": paraData.booknm,
      "@p_bookacnt": paraData.bookacnt,
      "@p_location": paraData.location,
      "@p_person": paraData.person,
      "@p_dptcd": paraData.dptcd,
      "@p_amt": paraData.amt,
      "@p_maker": paraData.maker,
      "@p_attdatnum_img": paraData.attdatnum_img,
      "@p_remark": paraData.remark,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_person_s": paraData.person_s,
      "@p_inoutdiv_s": paraData.inoutdiv_s,
      "@p_bookcd_s": paraData.bookcd_s,
      "@p_remark_s": paraData.remark_s,
      "@p_datnum_s": paraData.datnum_s,
      "@p_date_s": paraData.date_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "CM_A4500W",
    },
  };

  useEffect(() => {
    if (
      paraData.workType != "" &&
      permissions.save &&
      paraData.workType != "D"
    ) {
      fetchTodoGridSaved();
    }
  }, [paraData, permissions]);

  const fetchTodoGridSaved = async () => {
    if (!permissions.save && paraData.workType != "D") return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", paras);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
        bookcd: "",
        booknm: "",
        bookacnt: "",
        location: "",
        person: "",
        dptcd: "",
        amt: 0,
        maker: "",
        attdatnum_img: "",
        remark: "",
        rowstatus_s: "",
        person_s: "",
        inoutdiv_s: "",
        bookcd_s: "",
        remark_s: "",
        datnum_s: "",
        date_s: "",
      });
      reload();
      onClose();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  //메인 그리드 선택 이벤트
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  useEffect(() => {
    if (para != undefined) {
      setMainDataResult({
        data: para,
        total: para.length,
      });
      setSelectedState({ [para[0][DATA_ITEM_KEY]]: true });
    }
  }, [para]);

  const [information, setInformation] = useState({
    date: new Date(),
    inoutdiv: "",
  });

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;
    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <Window
      titles={"입출고처리"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <GridContainer>
        <Grid
          style={{ height: isMobile ? mobileheight : webheight }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              bookacnt: bookacntListData.find(
                (item: any) => item.sub_code == row.bookacnt
              )?.code_name,
              [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
            })),
            mainDataState
          )}
          onDataStateChange={onMainDataStateChange}
          {...mainDataState}
          //선택 기능
          dataItemKey={DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onMainSelectionChange}
          //스크롤 조회기능
          fixedScroll={true}
          total={mainDataResult.total}
          //정렬기능
          sortable={true}
          onSortChange={onMainSortChange}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
        >
          <GridColumn
            field="bookcd"
            title="도서코드"
            width="150px"
            footerCell={mainTotalFooterCell}
          />

          <GridColumn field="booknm" title="도서명" width="150px" />
          <GridColumn field="bookacnt" title="도서계정" width="120px" />
        </Grid>
      </GridContainer>
      <FormBoxWrap border={true} className="WindowFormBoxWrap">
        <FormBox>
          <tbody>
            <tr>
              <th>일시</th>
              <td>
                <DatePicker
                  name="date"
                  value={information.date}
                  format="yyyy-MM-dd"
                  className="required"
                  onChange={InputChange}
                  placeholder=""
                />
              </td>
              <th>입출고구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="inoutdiv"
                    value={information.inoutdiv}
                    customOptionData={customOptionData}
                    changeData={ComboBoxChange}
                    className="required"
                    textField="name"
                    valueField="code"
                    type="new"
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <BottomContainer className="BottomContainer">
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={onConfirmBtnClick}>
            확인
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default ItemsWindow;
