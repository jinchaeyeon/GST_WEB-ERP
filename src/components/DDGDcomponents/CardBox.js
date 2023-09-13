import React, { useState, useEffect, useCallback } from "react";
import { Card } from "primereact/card";
import { CardContent, CardHeader, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import PaletteIcon from "@mui/icons-material/Palette";
import Grid from "@mui/material/Grid";
import DDGDColorWindow from "../Windows/DDGD/DDGDColorWindow";
import { getQueryFromBizComponent, UseBizComponent } from "../CommonFunction";
import { bytesToBase64 } from "byte-base64";
import { COM_CODE_DEFAULT_VALUE } from "../CommonString";
import { useApi } from "../../hooks/api";

const CardBox = (props) => {
  const [colors, setColors] = useState(props.backgroundColor);
  const [colorWindowVisible, setColorWindowVisible] = useState(false);
  const [bizComponentData, setBizComponentData] = useState(null);
  UseBizComponent(
    "L_BA310",
    //사용여부,
    setBizComponentData
  );
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [classListData, setClassListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const processApi = useApi();
  useEffect(() => {
    if (bizComponentData !== null) {
      const classQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item) => item.bizComponentId === "L_BA310")
      );
      fetchQuery(classQueryStr, setClassListData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr, setListData) => {
    let data;

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
    };

    try {
      data = await processApi("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const handleColors = () => {
    setColorWindowVisible(true);
  };

  return (
    <>
      <Card
        style={{
          width: "100%",
          marginRight: "15px",
          borderRadius: "10px",
          backgroundColor: colors,
          cursor: "pointer"
        }}
        onClick={(e) => props.Click(e)}
      >
        <CardHeader
          action={
            <IconButton aria-label="setting">
              <PaletteIcon onClick={handleColors} />
            </IconButton>
          }
          subheaderTypographyProps={{
            color: "#8f918d",
            fontSize: isMobile? "14px" : "0.2vw",
            fontWeight: 500,
            fontFamily: "TheJamsil5Bold",
          }}
          title={
            <>
              <Typography
                style={{
                  color: "black",
                  fontSize: isMobile? "28px" : "1.5vw",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "TheJamsil5Bold",
                }}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/Born.png`}
                  alt=""
                  width={"20px"}
                  height={"20px"}
                  style={{ marginRight: "2px", marginBottom: "2px" }}
                />
                {props.name}
                <Typography
                  style={{
                    color: "#8f918d",
                    fontSize: isMobile? "15px" :"0.8vw",
                    fontWeight: 500,
                    marginLeft: "5px",
                    fontFamily: "TheJamsil5Bold",
                  }}
                >
                  {
                    classListData.find((items) => items.sub_code == props.class)
                      ?.code_name
                  }
                </Typography>
              </Typography>
            </>
          }
          subheader={
            <Typography
              style={{
                color: "#8f918d",
                fontSize: isMobile? "12px" :"0.6vw",
                fontWeight: 500,
                fontFamily: "TheJamsil5Bold",
                float: "left"
              }}
            >
              이용기간: {props.date} {props.day}
            </Typography>
          }
        />
        <CardContent style={{ display: "flex" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <Typography
                style={{
                  color: "#8f918d",
                  fontSize: isMobile? "19px" :"1vw",
                  fontWeight: 500,
                  fontFamily: "TheJamsil5Bold",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                등원잔여 :
                <Typography
                  style={{
                    color: "#525252",
                    fontSize: isMobile? "23px" :"1vw",
                    fontWeight: 500,
                    marginLeft: "5px",
                    fontFamily: "TheJamsil5Bold",
                  }}
                >
                  {props.attendance}
                </Typography>
                회
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <Typography
                style={{
                  color: "#8f918d",
                  fontSize: isMobile? "19px" :"1vw",
                  fontWeight: 500,
                  fontFamily: "TheJamsil5Bold",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                변경가능 :
                <Typography
                  style={{
                    color: "#525252",
                    fontSize: isMobile? "23px" :"1vw",
                    fontWeight: 500,
                    marginLeft: "5px",
                    fontFamily: "TheJamsil5Bold",
                  }}
                >
                  {props.change}
                </Typography>
                회
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {colorWindowVisible && (
        <DDGDColorWindow
          setVisible={setColorWindowVisible}
          setData={(code) => {
            setColors(code);
            props.propFunction(code);
          }}
          custcd={props.code}
          para={colors}
        />
      )}
    </>
  );
};

export default CardBox;
