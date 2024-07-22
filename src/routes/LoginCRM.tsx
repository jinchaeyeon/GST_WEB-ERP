import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { LoginAppName, LoginBox, LoginImg } from "../CommonStyled";
import { FormCheckBox2, FormInput } from "../components/Editors";
import { useApi } from "../hooks/api";
import { loginResultState, passwordExpirationInfoState } from "../store/atoms";

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

const Login: React.FC = () => {
  const processApi = useApi();
  const history = useHistory();

  const setLoginResult = useSetRecoilState(loginResultState);
  const setPwExpInfo = useSetRecoilState(passwordExpirationInfoState);
  const setLoading = useSetRecoilState(isLoading);
  const accessToken = localStorage.getItem("accessToken");
  const [isLoaded, setIsLoaded] = useState(accessToken ? false : true);
  const [information, setInformation] = useState({
    userId: localStorage.getItem("userId")
      ? localStorage.getItem("userId")
      : "",
    password: "",
    chk: "Y",
  });
  useEffect(() => {
    if (accessToken) {
      window.location.href = "/Home";
    }
  }, []);

  const path = window.location.href;
  const processLogin = useCallback(
    async (formData: { [name: string]: any }) => {
      try {
        if (!formData.userId) {
          alert("ID를 입력하세요.");
          return false;
        }
        if (!formData.password) {
          alert("비밀번호를 입력하세요.");
          return false;
        }
        var company = "";

        //개발용
        if (path.includes("localhost")) {
          company = "2309C598";
        } else {
          if (path.split("/")[2].split(".")[0] == "check-in-dog") {
            company = "2309C598";
          } else {
            company = "2309C598";
          }
        }

        setLoading(true);

        let para: IFormData = Object.assign(
          {},
          {
            langCode: "ko",
            companyCode: company,
            userId: formData.userId,
            password: formData.password,
          }
        );

        // if (typeof para.companyCode !== "string") {
        //   para.companyCode = para.companyCode.company_code;
        // }

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
          custcd,
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

  const handleSubmit = (data: { [name: string]: any }) => {
    processLogin(data);
  };

  if (!isLoaded) {
    return <Loader />;
  }

  return (
    <div style={{ backgroundColor: "#f5b901" }}>
      <LoginBox theme={"#f5b901"}>
        <Form
          initialValues={information}
          onSubmit={handleSubmit}
          render={() => (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
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
