import { Button } from "@progress/kendo-react-buttons";
import { Form, Field, FormElement } from "@progress/kendo-react-form";
import { Input } from "@progress/kendo-react-inputs";
import { KeyboardEvent, useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { menusState, tokenState } from "../store/atoms";
import { useApi } from "../hooks/api";
import { useRecoilState, useSetRecoilState } from "recoil";
import { FormInput, FormComboBox } from "../components/Editors";
import { LoginBox } from "../CommonStyled";
import { sha256 } from "js-sha256";
import { UseGetIp } from "../components/CommonFunction";
import { isLoading } from "../store/atoms";
import Loading from "../components/Loading";

interface FormData {
  companyCode: string;
  userId: string;
  password: string;
}
const Login: React.FC = () => {
  const [token, setToken] = useRecoilState(tokenState);
  const [menus, setMenus] = useRecoilState(menusState);
  //const [api, setApi] = useRecoilState(apiState);
  const history = useHistory();
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);

  const handleSubmit = (data: { [name: string]: FormData }) => {
    processLogin(data);
  };

  const processLogin = useCallback(
    async (formData: { [name: string]: any }) => {
      try {
        setLoading(true);
        let para = Object.assign({}, formData);

        if (isAllowedIpAddress) {
          para.companyCode = para.companyCode.company_code;
        }
        //const md5 = require("md5");
        //para.password = sha256(md5(para.password));

        const response = await processApi<any>(
          para.companyCode === "2207C612" ? "login-old" : "login",
          para
        );

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

        //setShowLoading(false);
        setLoading(false);
      } catch (e: any) {
        console.log("login error", e);
        //setShowLoading(false);
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
  const [isAllowedIpAddress, setIsAllowedIpAddress] = useState(false);
  const [ip, setIp] = useState("");
  UseGetIp(setIp);

  const allowedIpAddress = {
    "gst-busan": "222.96.157.66",
    "gst-seoul": "125.141.105.80",
    "gst-vpn": "10.212.134.206",
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "'" && Object.values(allowedIpAddress).includes(ip)) {
      setIsAllowedIpAddress((prev) => !prev);
      console.log(1);
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
                  onKeyPress={handleKeyPress}
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
                  onKeyPress={handleKeyPress}
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
