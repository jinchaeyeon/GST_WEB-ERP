import React, { useEffect, useLayoutEffect, useState } from "react";
// ES2015 module syntax
import { Button } from "@progress/kendo-react-buttons";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStrWithTime,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getHeight,
  getMenuName,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import Calendar from "../components/CustomCalendar/Calendar";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

var height = 0;
var height2 = 0;
let deletedMainRows: any[] = [];
const CM_A1610W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  const setLoading = useSetRecoilState(isLoading);
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UsePermissions(setPermissions);
  UseCustomOption("CM_A1610W", setCustomOptionData);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".FormBoxWrap");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(false) - height);
        setWebHeight(getDeviceHeight(false) - height - height2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [filters, setFilters] = useState({
    work_type: "MY",
    person: "",
    pgNum: 1,
    isSearch: false,
  });

  const search = () => {
    try {
      if (
        filters.person == "" ||
        filters.person == undefined ||
        filters.person == null
      ) {
        throw findMessage(messagesData, "CM_A1610W_002");
      } else {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [colorData, setColorData] = useState<any[]>([]);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_APPOINTMENT_COLOR", setBizComponentData);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("CM_A1610W", setMessagesData);

  useEffect(() => {
    if (bizComponentData !== null) {
      setColorData(getBizCom(bizComponentData, "L_APPOINTMENT_COLOR"));
    }
  }, [bizComponentData]);
  const [schedulerDataResult, setSchedulerDataResult] = useState([]);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const user_id = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  const processApi = useApi();

  const fetchScheduler = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;

    setLoading(true);
    const schedulerParameters: Iparameters = {
      procedureName: "P_CM_A1610W_Q",
      pageNumber: 1,
      pageSize: 100000,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": sessionOrgdiv,
        "@p_userid": user_id,
        "@p_person": filters.person,
      },
    };

    try {
      data = await processApi<any>("procedure", schedulerParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      let rows = data.tables[0].Rows.map((row: any) => {
        const start = new Date(row.strtime);
        const end = new Date(row.endtime);
        const timeDiff = end.getTime() - start.getTime();

        return {
          ...row,
          id: row.datnum,
          title: row.title,
          description: row.contents,
          start: start,
          end: end,
          isAllDay: timeDiff == 8.64e7 ? true : false, // 24시간 차이 시 all day
        };
      });

      setSchedulerDataResult(rows);
    }
    setLoading(false);
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  useEffect(() => {
    if (
      filters.isSearch == true &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchScheduler(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  const onSaveClick = () => {
    if (!permissions.save) return;
    if (filters.person !== user_id) {
      alert(findMessage(messagesData, "CM_A1610W_001"));
      return false;
    }

    const dataItem: { [name: string]: any } = schedulerDataResult.filter(
      (item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      }
    );

    type TdataArr = {
      rowstatus_s: string[];
      datnum_s: string[];
      strtime_s: string[];
      endtime_s: string[];
      contents_s: string[];
      person_s: string[];
      finyn_s: string[];
      kind1_s: string[];
      custcd_s: string[];
      title_s: string[];
      colorid_s: string[];
    };

    let dataArr: TdataArr = {
      rowstatus_s: [],
      datnum_s: [],
      strtime_s: [],
      endtime_s: [],
      contents_s: [],
      person_s: [],
      finyn_s: [],
      kind1_s: [],
      custcd_s: [],
      title_s: [],
      colorid_s: [],
    };

    dataItem.forEach((item: any) => {
      const {
        datnum = "",
        start,
        end,
        rowstatus = "",
        contents = "",
        title = "",
        custcd,
        isAllDay,
        id,
        colorID,
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.datnum_s.push(rowstatus == "N" ? "" : datnum);
      dataArr.strtime_s.push(convertDateToStrWithTime(start));
      dataArr.endtime_s.push(convertDateToStrWithTime(end));
      dataArr.contents_s.push(contents);
      dataArr.person_s.push("");
      dataArr.finyn_s.push("");
      dataArr.kind1_s.push("");
      dataArr.custcd_s.push(custcd);
      dataArr.title_s.push(title);
      dataArr.colorid_s.push(colorID);
    });
    deletedMainRows.forEach((item) => {
      const {
        datnum = "",
        start,
        end,
        rowstatus = "",
        contents = "",
        title = "",
        isAllDay,
        colorID,
        custcd,
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.datnum_s.push(datnum);
      dataArr.strtime_s.push(convertDateToStrWithTime(start));
      dataArr.endtime_s.push(convertDateToStrWithTime(end));
      dataArr.contents_s.push(contents);
      dataArr.person_s.push("");
      dataArr.finyn_s.push("");
      dataArr.kind1_s.push("");
      dataArr.custcd_s.push(custcd);
      dataArr.title_s.push(title);
      dataArr.colorid_s.push(colorID);
    });

    setParaData((prev) => ({
      ...prev,
      work_type: "N",
      planyn_s: "Y",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      datnum_s: dataArr.datnum_s.join("|"),
      contents_s: dataArr.contents_s.join("|"),
      strtime_s: dataArr.strtime_s.join("|"),
      endtime_s: dataArr.endtime_s.join("|"),
      person_s: filters.person,
      finyn_s: dataArr.finyn_s.join("|"),
      kind1_s: dataArr.kind1_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      title_s: dataArr.title_s.join("|"),
      colorid_s: dataArr.colorid_s.join("|"),
    }));
  };

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    rowstatus_s: "",
    datnum_s: "",
    docunum_s: "",
    contents_s: "",
    strtime_s: "",
    endtime_s: "",
    person_s: user_id,
    planyn_s: "",
    userid: user_id,
    pc: pc,
    finyn_s: "",
    kind1_s: "",
    custcd_s: "",
    title_s: "",
    colorid_s: "",
    datnum: "",
    strdt: "",
    enddt: "",
    strhh: "",
    strmm: "",
    endhh: "",
    endmm: "",
    title: "",
    contents: "",
    kind1: "",
    kind2: "",
    custcd: "",
    custperson: "",
    opengb: "",
    attdatnum: "",
    finyn: "",
    usehh: 0,
    usemm: 0,
    planyn: "",
    amt: 0,
    ref_key: "",
    pgmid: "",
    form_id: "CM_A1610W",
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_CM_A1610W_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_datnum_s": paraData.datnum_s,
      "@p_docunum_s": paraData.docunum_s,
      "@p_contents_s": paraData.contents_s,
      "@p_strtime_s": paraData.strtime_s,
      "@p_endtime_s": paraData.endtime_s,
      "@p_person_s": paraData.person_s,
      "@p_planyn_s": paraData.planyn_s,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_finyn_s": paraData.finyn_s,
      "@p_kind1_s": paraData.kind1_s,
      "@p_custcd_s": paraData.custcd_s,
      "@p_title_s": paraData.title_s,
      "@p_colorid_s": paraData.colorid_s,
      "@p_datnum": paraData.datnum,
      "@p_strdt": paraData.strdt,
      "@p_enddt": paraData.enddt,
      "@p_strhh": paraData.strhh,
      "@p_strmm": paraData.strmm,
      "@p_endhh": paraData.endhh,
      "@p_endmm": paraData.endmm,
      "@p_title": paraData.title,
      "@p_contents": paraData.contents,
      "@p_kind1": paraData.kind1,
      "@p_kind2": paraData.kind2,
      "@p_custcd": paraData.custcd,
      "@p_custperson": paraData.custperson,
      "@p_opengb": paraData.opengb,
      "@p_attdatnum": paraData.attdatnum,
      "@p_finyn": paraData.finyn,
      "@p_usehh": paraData.usehh,
      "@p_usemm": paraData.usemm,
      "@p_planyn": paraData.planyn,
      "@p_amt": paraData.amt,
      "@p_ref_key": paraData.ref_key,
      "@p_pgmid": paraData.pgmid,
      "@p_form_id": paraData.form_id,
      "@p_company_code": companyCode,
    },
  };

  const fetchSchedulerSaved = async () => {
    if (!permissions.save) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      deletedMainRows = [];
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  useEffect(() => {
    if (paraData.work_type !== "" && permissions.save) fetchSchedulerSaved();
  }, [paraData, permissions]);

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>
        <ButtonContainer>
          {permissions && (
            <>
              <TopButtons
                search={search}
                permissions={permissions}
                disable={true}
              />
              <Button
                onClick={onSaveClick}
                themeColor={"primary"}
                fillMode="outline"
                icon="save"
                disabled={permissions.save ? false : true}
              >
                저장
              </Button>
            </>
          )}
        </ButtonContainer>
      </TitleContainer>
      {isMobile ? (
        <>
          <FilterContainer>
            <FilterBox>
              <tbody>
                <tr>
                  <th>작성자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="person"
                        value={filters.person}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        className="required"
                        valueField="user_id"
                        textField="user_name"
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
        </>
      ) : (
        <>
          <FormBoxWrap className="FormBoxWrap">
            <FormBox>
              <tbody>
                <tr>
                  <th>작성자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="person"
                        value={filters.person}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        className="required"
                        valueField="user_id"
                        textField="user_name"
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </>
      )}
      <GridContainer style={{ height: isMobile ? mobileheight : webheight }}>
        <Calendar
          colorData={colorData}
          schedulerDataResult={
            schedulerDataResult.length == 0 ? [] : schedulerDataResult
          }
          permissions={permissions}
          person={filters.person}
          reload={(deletedRow: any, newList: any) => {
            deletedMainRows = deletedRow;
            setSchedulerDataResult(newList);
          }}
        />
      </GridContainer>
    </>
  );
};

export default CM_A1610W;
