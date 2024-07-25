import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { KeyboardEvent, useCallback, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { LoginAppName, LoginBox, LoginImg } from "../CommonStyled";
import { FormCheckBox2, FormComboBox, FormInput } from "../components/Editors";
import { useApi } from "../hooks/api";
import { IComboBoxColumns } from "../hooks/interfaces";
import {
  accessTokenState,
  loginResultState,
  passwordExpirationInfoState,
} from "../store/atoms";

import { resetLocalStorage } from "../components/CommonFunction";
import { DEFAULT_LANG_CODE } from "../components/CommonString";
import Loader from "../components/Loader";
import Loading from "../components/Loading";
import { isLoading } from "../store/atoms";

interface IFormData {
  langCode: string;
  companyCode: string | { company_code: string };
  userId: string;
  password: string;
}

const langCodesColumns: IComboBoxColumns[] = [
  {
    sortOrder: 0,
    fieldName: "code",
    caption: "코드",
    columnWidth: 100,
    dataAlignment: "center",
  },
  {
    sortOrder: 0,
    fieldName: "name",
    caption: "이름",
    columnWidth: 100,
    dataAlignment: "center",
  },
];
const companyCodesColumns: IComboBoxColumns[] = [
  {
    sortOrder: 0,
    fieldName: "company_code",
    caption: "회사코드",
    columnWidth: 100,
    dataAlignment: "center",
  },
  {
    sortOrder: 0,
    fieldName: "name",
    caption: "업체명",
    columnWidth: 100,
    dataAlignment: "center",
  },
  {
    sortOrder: 0,
    fieldName: "service_name",
    caption: "서비스명",
    columnWidth: 100,
    dataAlignment: "center",
  },
];

const Login: React.FC = () => {
  const processApi = useApi();
  const location = useLocation();
  const history = useHistory();
  const setLoginResult = useSetRecoilState(loginResultState);
  const setPwExpInfo = useSetRecoilState(passwordExpirationInfoState);
  const setLoading = useSetRecoilState(isLoading);
  const setAccessToken = useSetRecoilState(accessTokenState);
  const accessToken = localStorage.getItem("accessToken");
  const [ifShowCompanyList, setIfShowCompanyList] = useState(false);
  const [isLoaded, setIsLoaded] = useState(
    new URLSearchParams(location.search).has("cust")
      ? true
      : accessToken
      ? false
      : true
  );
  const [information, setInformation] = useState({
    companyCode: new URLSearchParams(location.search).has("cust")
      ? (new URLSearchParams(location.search).get("cust") as string)
      : "",
    langCode: "ko-KR",
    userId: localStorage.getItem("userId")
      ? localStorage.getItem("userId")
      : "",
    password: "",
    chk: "Y",
  });

  useEffect(() => {
    fetchCultureCodes();
    fetchCompanyCodes();
    if (new URLSearchParams(location.search).has("cust")) {
      resetLocalStorage();
      history.replace({}, "/");
    } else if (accessToken) {
      window.location.href = "/Home";
    }
  }, []);

  const handleSubmit = (data: { [name: string]: any }) => {
    processLogin(data);
  };

  const processLogin = useCallback(
    async (formData: { [name: string]: any }) => {
      try {
        setLoading(true);

        let para: IFormData = Object.assign(
          {},
          {
            langCode: formData.langCode,
            companyCode: formData.companyCode,
            userId: formData.userId,
            password: formData.password,
          }
        );

        if (typeof para.companyCode !== "string") {
          para.companyCode = para.companyCode.company_code;
        }

        // const md5 = require("md5");
        // para.password = sha256(md5(para.password));
        // const response = await processApi<any>(
        //   para.companyCode == "2207C612" ? "login-old" : "login",
        //   para
        // );

        const response = await processApi<any>("login", para);

        const {
          token,
          refreshToken,
          userId,
          userName,
          role,
          companyCode,
          serviceName,
          customerName,
          loginKey,
          passwordExpirationInfo,
          webTitle,
          homeMenuWeb,
          profileImage,
          userConfig,
          serviceCategory,
          defaultCulture,
          custcd,
          custnm,
        } = response;
        if (formData.chk == "Y") {
          localStorage.setItem("userId", userId);
        } else {
          if (localStorage.getItem("userId")) {
            localStorage.removeItem("userId");
          }
        }
        localStorage.setItem("accessToken", token);
        localStorage.setItem("refreshToken", refreshToken);
        // AccessToken : Recoil 저장 / RefreshToken(만료기한 짧음) : Cash 저장
        // setAccessToken(token);
        // const expires = new Date();
        // expires.setMinutes(expires.getMinutes() + 60);
        // cookie.save("refreshToken", refreshToken, {
        //   path: "/",
        //   expires,
        //   // secure: true,
        //   // httpOnly: true,
        // });

        setLoginResult({
          langCode: formData.langCode
            ? formData.langCode.code
            : DEFAULT_LANG_CODE.code,
          userId,
          userName,
          role,
          companyCode,
          serviceName,
          customerName,
          loginKey,
          webTitle,
          homeMenuWeb,
          profileImage,
          dptnm: userConfig.Rows[6].value,
          serviceCategory,
          defaultCulture,
          dptcd: userConfig == undefined ? "" : userConfig.Rows[5].value,
          position: userConfig == undefined ? "" : userConfig.Rows[4].value,
          custcd: "",
          custnm: "",
        });

        setPwExpInfo(passwordExpirationInfo);

        history.replace("/Home");

        setLoading(false);
      } catch (e: any) {
        console.log("login error", e);
        setLoading(false);
        alert(e.message);
      }
    },
    []
  );

  const companyCodesKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey && e.key == "'") {
      setIfShowCompanyList((prev) => !prev);
    }
  };

  const [culterCodesData, setCulterCodesData] = useState([]);
  const [companyCodesData, setCompanyCodesData] = useState([]);

  const fetchCultureCodes = useCallback(async () => {
    let data: any;

    try {
      data = await processApi<any>("culture-codes");
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const rows = data.Rows;
      setCulterCodesData(rows);
    }
  }, []);

  const fetchCompanyCodes = useCallback(async () => {
    let data: any;

    try {
      data = await processApi<any>("company-codes");
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const rows = data.Rows;
      setCompanyCodesData(rows);
    }
  }, []);

  if (!isLoaded) {
    return <Loader />;
  }

  return (
    <div style={{ backgroundColor: "#2289c3" }}>
      <LoginBox theme={"2289c3"}>
        <Form
          initialValues={information}
          onSubmit={handleSubmit}
          render={() => (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <Field
                  name={"langCode"}
                  label={"언어설정"}
                  component={FormComboBox}
                  data={culterCodesData}
                  valueField="code"
                  textField="name"
                  columns={langCodesColumns}
                  defaultValue={DEFAULT_LANG_CODE}
                  id="langCodes"
                />
                {ifShowCompanyList ? (
                  <Field
                    name={"companyCode"}
                    label={"회사코드"}
                    component={FormComboBox}
                    data={companyCodesData}
                    valueField="company_code"
                    textField="name"
                    columns={companyCodesColumns}
                    onKeyDown={companyCodesKeyDown}
                    id="companyCodes"
                  />
                ) : (
                  <Field
                    name={"companyCode"}
                    label={"회사코드"}
                    component={FormInput}
                    onKeyDown={companyCodesKeyDown}
                  />
                )}
                <Field name={"userId"} label={"ID"} component={FormInput} />
                <Field
                  name={"password"}
                  label={"Password"}
                  type={"password"}
                  component={FormInput}
                />
                <Field
                  name={"chk"}
                  label={"아이디 저장"}
                  component={FormCheckBox2}
                />
              </fieldset>
              <Button className="login-btn" themeColor={"primary"} size="large">
                Login
              </Button>
            </FormElement>
          )}
        ></Form>
        <Loading />
      </LoginBox>
      <LoginImg>
        <LoginAppName></LoginAppName>
      </LoginImg>
    </div>
  );
};
export default Login;
