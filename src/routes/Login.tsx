import { Button } from "@progress/kendo-react-buttons";
import { Form, Field, FormElement } from "@progress/kendo-react-form";
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { menusState, tokenState } from "../store/atoms";
import { useApi } from "../hooks/api";
import { useSetRecoilState } from "recoil";
import { FormInput, FormComboBox } from "../components/Editors";
import { LoginBox } from "../CommonStyled";
import { UseGetIp } from "../components/CommonFunction";
import { isLoading } from "../store/atoms";
import Loading from "../components/Loading";

const allowedIpAddress = {
  "gst-busan": "222.96.157.66",
  "gst-seoul": "125.141.105.80",
  "gst-vpn": "10.212.134.206",
};

interface IFormData {
  langCode: string;
  companyCode: string | { company_code: string };
  userId: string;
  password: string;
}

const Login: React.FC = () => {
  const processApi = useApi();
  const history = useHistory();
  const setToken = useSetRecoilState(tokenState);
  const setMenus = useSetRecoilState(menusState);
  const setLoading = useSetRecoilState(isLoading);
  const [isAllowedIpAddress, setIsAllowedIpAddress] = useState(false);
  const [ip, setIp] = useState("");
  UseGetIp(setIp);

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
          userId,
          userName,
          role,
          companyCode,
          serviceName,
          customerName,
          loginKey,
        } = response;

        setToken({
          token,
          langCode: formData.langCode,
          userId,
          userName,
          role,
          companyCode,
          serviceName,
          customerName,
          loginKey,
        });

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
  const emailValidator = (value: string) =>
    value !== "" ? "" : "Please enter a valid email.";

  useEffect(() => {
    setToken(null as any);
    setMenus(null as any);
  }, []);

  const companyCodeKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    console.log(e);
    if (
      e.ctrlKey &&
      e.key === "'" &&
      Object.values(allowedIpAddress).includes(ip)
    ) {
      setIsAllowedIpAddress((prev) => !prev);
    }
  };

  return (
    <LoginBox>
      <Form
        onSubmit={handleSubmit}
        render={() => (
          <FormElement horizontal={true}>
            <fieldset className={"k-form-fieldset"}>
              <Field
                name={"langCode"}
                label={"언어설정"}
                component={FormInput}
              />
              {isAllowedIpAddress ? (
                <Field
                  name={"companyCode"}
                  label={"업체코드"}
                  component={FormComboBox}
                  ifGetCompanyCode={true}
                  valueField="company_code"
                  textField="name"
                  onKeyDown={companyCodeKeyDown}
                  columns={[
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
                  ]}
                />
              ) : (
                <Field
                  name={"companyCode"}
                  label={"업체코드"}
                  component={FormInput}
                  onKeyDown={companyCodeKeyDown}
                />
              )}

              <Field
                name={"userId"}
                label={"ID"}
                component={FormInput}
                validator={emailValidator}
              />
              <Field
                name={"password"}
                label={"PASSWORD"}
                type={"password"}
                component={FormInput}
              />
            </fieldset>
            <Button className="login-btn" themeColor={"primary"}>
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
