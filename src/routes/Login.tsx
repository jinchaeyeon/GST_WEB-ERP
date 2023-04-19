import { Button } from "@progress/kendo-react-buttons";
import { Form, Field, FormElement } from "@progress/kendo-react-form";
import { KeyboardEvent, useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { passwordExpirationInfoState, loginResultState } from "../store/atoms";
import { useApi } from "../hooks/api";
import { IComboBoxColumns } from "../hooks/interfaces";
import { useSetRecoilState } from "recoil";
import { FormInput, FormComboBox } from "../components/Editors";
import { AppName, LoginAppName, LoginBox, Logo } from "../CommonStyled";
import { UseGetIp } from "../components/CommonFunction";
import { isLoading } from "../store/atoms";
import Loading from "../components/Loading";
import { DEFAULT_LANG_CODE } from "../components/CommonString";

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
  const history = useHistory();
  const setLoginResult = useSetRecoilState(loginResultState);
  const setPwExpInfo = useSetRecoilState(passwordExpirationInfoState);
  const setLoading = useSetRecoilState(isLoading);
  const [ifShowCompanyList, setIfShowCompanyList] = useState(false);

  useEffect(() => {
    fetchCultureCodes();
    fetchCompanyCodes();
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
        //   para.companyCode === "2207C612" ? "login-old" : "login",
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
        } = response;

        localStorage.setItem("accessToken", token);
        localStorage.setItem("refreshToken", refreshToken);

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
    if (e.ctrlKey && e.key === "'") {
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

  return (
    <LoginBox>
      <Form
        onSubmit={handleSubmit}
        render={() => (
          <FormElement horizontal={true}>
            <LoginAppName>
              <Logo size="36px" />
              GST ERP
            </LoginAppName>
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
                label={"PASSWORD"}
                type={"password"}
                component={FormInput}
              />
            </fieldset>
            <Button className="login-btn" themeColor={"primary"} size="large">
              LOGIN
            </Button>
          </FormElement>
        )}
      ></Form>

      <Loading />
    </LoginBox>
  );
};
export default Login;
