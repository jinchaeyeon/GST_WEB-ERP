import React, { useState, useEffect, useCallback } from "react";
import { Card } from "primereact/card";
import { CardContent, CardHeader, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import PaletteIcon from "@mui/icons-material/Palette";
import Grid from "@mui/material/Grid";
import DDGDColorWindow from "../Windows/CommonWindows/DDGDColorWindow";
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
            fontSize: "14px",
            fontWeight: 500,
            fontFamily: "TheJamsil5Bold",
          }}
          title={
            <>
              <Typography
                style={{
                  color: "black",
                  fontSize: "28px",
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
                    fontSize: "15px",
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
                fontSize: "12px",
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
                  fontSize: "19px",
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
                    fontSize: "23px",
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
                  fontSize: "20px",
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
                    fontSize: "23px",
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
          para={colors}
        />
      )}
    </>
  );
};

export default CardBox;
