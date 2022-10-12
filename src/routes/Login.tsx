import { Button } from "@progress/kendo-react-buttons";
import {
  Form,
  Field,
  FormElement,
  FieldArray,
  FieldArrayRenderProps,
} from "@progress/kendo-react-form";
import { Input } from "@progress/kendo-react-inputs";
import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { menusState, tokenState } from "../store/atoms";
import { useApi } from "../hooks/api";
import { useRecoilState } from "recoil";
import { FormDropDownList, FormInput } from "../components/Editors";
import { LoginBox } from "../CommonStyled";
import { sha256 } from "js-sha256";

interface FormData {
  companyCode: string;
  userId: string;
  password: string;
}
const Login: React.FC = () => {
  const [token, setToken] = useRecoilState(tokenState);
  //const [api, setApi] = useRecoilState(apiState);
  const history = useHistory();
  const processApi = useApi();

  const handleSubmit = (data: { [name: string]: FormData }) => {
    processLogin(data);
  };

  const processLogin = useCallback(
    async (formData: { [name: string]: any }) => {
      try {
        let para = Object.assign({}, formData);

        //const md5 = require("md5");
        //para.password = sha256(md5(para.password));

        //setShowLoading(true);
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
          serviceUrl,
          internalIp,
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
          serviceUrl,
          internalIp,
        });

        history.replace("/Home");

        //setApi({ api: response.serviceUrl });
        //setShowLoading(false);
      } catch (e: any) {
        console.log("login error", e);
        //setShowLoading(false);
        alert(e.message);
      }
    },
    []
  );
  const emailValidator = (value: string) =>
    value !== "" ? "" : "Please enter a valid email.";

  return (
    <LoginBox>
      <Form
        onSubmit={handleSubmit}
        render={() => (
          <FormElement horizontal={true}>
            <Field name={"langCode"} label={"언어설정"} component={FormInput} />
            <Field
              name={"companyCode"}
              label={"업체코드"}
              component={FormInput}
              value="2207A046"
            />
            <Field
              name={"userId"}
              label={"ID"}
              component={FormInput}
              validator={emailValidator}
              value="admin"
            />
            <Field
              name={"password"}
              label={"PASSWORD"}
              type={"password"}
              component={FormInput}
              value="dwq@"
            />
            <Button themeColor={"primary"}>LOGIN</Button>
          </FormElement>
        )}
      ></Form>
    </LoginBox>
  );
};
export default Login;
