import { Card, CardContent, CardHeader, Typography } from "@mui/material";

const CardBox = (props) => {
  return (
    <>
      <Card
        style={{
          height: props.height == undefined ? "150px" : props.height,
          width: "100%",
          marginRight: "15px",
          backgroundColor: props.backgroundColor,
          color: props.color == undefined ? "white" : props.color,
          cursor: props.form == "QC_B0100W" ? "pointer" : "",
          fontFamily: "TheJamsil5Bold",
        }}
        onClick={(e) => (props.Click == undefined ? "" : props.Click(e))}
      >
        <CardHeader
          style={{ paddingBottom: 0 }}
          title={
            <>
              <Typography
                style={{
                  fontSize:
                    props.titlefontsize == undefined
                      ? "1rem"
                      : props.titlefontsize,
                  color: props.color == undefined ? "white" : props.color,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "TheJamsil5Bold",
                }}
              >
                {props.title}
              </Typography>
            </>
          }
        />
        <CardContent style={{ display: "flex", justifyContent: "center" }}>
          <Typography
            style={{
              fontSize: props.fontsize,
              fontWeight: 900,
              color: props.color == undefined ? "white" : props.color,
              fontFamily: "TheJamsil5Bold",
              display: "flex",
              alignItems: "center",
            }}
          >
            {props.data}
          </Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default CardBox;
