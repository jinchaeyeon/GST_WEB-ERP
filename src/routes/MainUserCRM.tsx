import React, { useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";
import { UseGetValueFromSessionItem } from "../components/CommonFunction";
import { useApi } from "../hooks/api";
import { loginResultState, sessionItemState } from "../store/atoms";
import { Iparameters } from "../store/types";
import { Title, TitleContainer } from "../CommonStyled";

const Main: React.FC = () => {
  const processApi = useApi();
  const [loginResult, setLoginResult] = useRecoilState(loginResultState);

  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);
  const userId = loginResult ? loginResult.userId : "";
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 850;

  useEffect(() => {
    if (sessionUserId === "") fetchSessionItem();
    // if (token && sessionUserId === "") fetchSessionItem();
  }, [sessionUserId]);

  const fetchSessionItem = useCallback(async () => {
    let data;
    try {
      const para: Iparameters = {
        procedureName: "sys_biz_configuration",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_user_id": userId,
        },
      };

      data = await processApi<any>("procedure", para);

      if (data.isSuccess === true) {
        const rows = data.tables[0].Rows;
        setSessionItem(
          rows
            .filter((item: any) => item.class === "Session")
            .map((item: any) => ({
              code: item.code,
              value: item.value,
            }))
        );
      }
    } catch (e: any) {
      console.log("menus error", e);
    }
  }, []);

  return (
    <>
      <TitleContainer>
        <Title>
          우리집 강아지
          <img
            src={`${process.env.PUBLIC_URL}/PuppyFoot.png`}
            alt=""
            width={"30px"}
            height={"30px"}
            style={{marginLeft: "5px"}}
          />
        </Title>
      </TitleContainer>
    </>
  );
};

export default Main;
