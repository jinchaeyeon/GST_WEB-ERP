import {
  Card,
  CardContent,
  Grid,
  Paper,
  Typography
} from "@mui/material";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Input, Switch, TextArea } from "@progress/kendo-react-inputs";
import React, {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Carousel from "react-material-ui-carousel";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  AdminQuestionBox,
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getBizCom,
  getDeviceHeight,
  getHeight,
  handleKeyPressSearch,
  toDate,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE } from "../components/CommonString";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { ICustData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

var index = 0;
let deletedMainRows: any[] = [];

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;
var height8 = 0;
var height9 = 0;

const PR_A2200W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [step, setStep] = useState(0);
  const [pictureindex, SetPicureindex] = useState(0);
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);
  const [isCaptured, setIsCaptured] = useState(false);

  useLayoutEffect(() => {
    height = getHeight(".TitleContainer");
    height2 = getHeight(".FormBoxWrap");
    height3 = getHeight(".FormBoxWrap2");
    if (isCaptured == false) {
      height4 = getHeight(".FormBoxWrap3");
    }
    height5 = getHeight(".FormBoxWrap4");
    height6 = getHeight(".ButtonContainer");
    height7 = getHeight(".ButtonContainer2");
    height8 = getHeight(".FormBoxWrap5");
    if (mainDataResult3.total > 0) {
      height9 = getHeight(".ButtonContainer3");
    }

    const handleWindowResize = () => {
      let deviceWidth = document.documentElement.clientWidth;
      setIsMobile(deviceWidth <= 1200);
      setMobileHeight(getDeviceHeight(false) - height - height2 - height6);
      setMobileHeight2(getDeviceHeight(false) - height - height3 - height7);
      setMobileHeight3(getDeviceHeight(false) - height - height4);
      setMobileHeight4(getDeviceHeight(false) - height - height5);
      setWebHeight(getDeviceHeight(false) - height - height2 - height8);
      setWebHeight2(getDeviceHeight(false) - height - height3);
      setWebHeight3(getDeviceHeight(false) - height - height4 - height9);
      setWebHeight4(getDeviceHeight(false) - height);
    };
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [step, webheight, webheight2, webheight3, webheight4, isCaptured]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_sysUserMaster_001", setBizComponentData);

  //공통코드 리스트 조회 ()
  const [userListData, setUserListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
    }
  }, [bizComponentData]);
  const search = () => {
    resetInformation();
    setFilters((prev) => ({
      ...prev,
      isSearch: true,
    }));
    deletedMainRows = [];
  };

  const search2 = () => {
    setInformation((prev) => ({
      ...prev,
      attdatnum: "",
      finyn: false,
      person: "",
      setup_hw_num: "",
      setup_hw_name: "",
      setup_location: "",
      comment: "",
    }));
    deletedMainRows = [];
    setFilters2((prev) => ({
      ...prev,
      isSearch: true,
    }));
  };

  const videoRef = useRef<HTMLVideoElement>(
    null
  ) as MutableRefObject<HTMLVideoElement>;
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: sessionOrgdiv,
    custnm: "",
    pgNum: 1,
    isSearch: true,
  });
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    orgdiv: sessionOrgdiv,
    devmngnum: "",
    setup_hw_name: "",
    setup_location: "",
    pgNum: 1,
    isSearch: true,
  });
  const [filters3, setFilters3] = useState({
    attdatnum: "",
    pgNum: 1,
    isSearch: true,
  });
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A2200W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,

        "@p_custnm": filters.custnm,
        "@p_setup_hw_name": "",
        "@p_setup_location": "",

        "@p_devmngnum": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A2200W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters2.orgdiv,

        "@p_custnm": "",
        "@p_setup_hw_name": filters2.setup_hw_name,
        "@p_setup_location": filters2.setup_location,

        "@p_devmngnum": filters2.devmngnum,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid3 = async (filters3: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    if (filters3.attdatnum == "") {
      setMainDataResult3({
        data: [
          {
            image: [],
          },
        ],
        total: 0,
      });
      setLoading(false);
      return false;
    }

    const parameters = {
      attached: "list?attachmentNumber=" + filters3.attdatnum,
    };

    try {
      data = await processApi<any>("file-list", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowCnt = data.tables[0].RowCount;
      if (totalRowCnt > 0) {
        const rows = data.tables[0].Rows.map((item: any) => ({
          ...item,
        }));
        let response: any;

        let array: any[] = [];
        const promises: any[] = [];
        for (const parameter of rows) {
          try {
            response = await processApi<any>("file-download", {
              attached: parameter.saved_name,
            });
            const promise = response;
            promises.push(promise);
          } catch (error) {
            response = null;
          }
        }
        const results = await Promise.all(promises);

        results.map((response, index) => {
          const blob = new Blob([response.data]);
          const fileObjectUrl = window.URL.createObjectURL(blob);
          array.push({
            url: fileObjectUrl,
            file: rows[index],
            rowstatus: "",
          });
        });

        const datas3 = [
          {
            image: array,
          },
        ];

        setMainDataResult3((prev) => {
          return {
            data: datas3,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
      } else {
        setMainDataResult3({
          data: [
            {
              image: [],
            },
          ],
          total: 0,
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters3((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, isSearch: false }));

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);

      setFilters2((prev) => ({ ...prev, isSearch: false }));

      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters3.isSearch && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);

      setFilters3((prev) => ({ ...prev, isSearch: false }));

      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions]);

  const [information, setInformation] = useState({
    devmngnum: "",
    attdatnum: "",
    finyn: false,
    person: "",
    setup_hw_num: "",
    setup_hw_name: "",
    setup_location: "",
    comment: "",
  });

  const [information2, setInformation2] = useState({
    devmngnum: "",
    project: "",
    findt: "",
    recdt: "",
    custnm: "",
    custcd: "",
    finexpdt: "",
    number: 0,
    pjtmanager: "",
    pjtperson: "",
    finchkdt: "",
    revperson: "",
    cotracdt: "",
    midchkdt: "",
    remark1: "",
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterInputChange2 = (e: any) => {
    const { value, name } = e.target;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetInformation = () => {
    setInformation({
      devmngnum: "",
      attdatnum: "",
      finyn: false,
      person: "",
      setup_hw_num: "",
      setup_hw_name: "",
      setup_location: "",
      comment: "",
    });
  };

  const onCheckClick = (datas: any) => {
    resetInformation();

    setInformation((prev) => ({
      ...prev,
      devmngnum: datas.devmngnum,
    }));

    setFilters2((prev) => ({
      ...prev,
      setup_hw_name: "",
      setup_location: "",
      devmngnum: datas.devmngnum,
      isSearch: true,
    }));
    deletedMainRows = [];
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
    setInformation2({
      cotracdt: datas.cotracdt,
      custcd: datas.custcd,
      custnm: datas.custnm,
      devmngnum: datas.devmngnum,
      finchkdt: datas.finchkdt,
      findt: datas.findt,
      finexpdt: datas.finexpdt,
      midchkdt: datas.midchkdt,
      number: datas.number,
      pjtmanager: datas.pjtmanager,
      pjtperson: datas.pjtperson,
      project: datas.project,
      recdt: datas.recdt,
      revperson: datas.revperson,
      remark1: datas.remark1,
    });
  };

  const onCheckClick2 = (datas: any) => {
    setInformation((prev) => ({
      ...prev,
      setup_hw_name: datas.setup_hw_name,
      setup_hw_num: datas.setup_hw_num,
      attdatnum: datas.attdatnum,
      finyn: datas.finyn == "Y" ? true : false,
      person: datas.person,
      setup_location: datas.setup_location,
      comment: datas.comment,
    }));
    deletedMainRows = [];
    setFilters3((prev) => ({
      ...prev,
      attdatnum: datas.attdatnum,
      isSearch: true,
    }));
    if (!isMobile) {
      setStep(2);
    }
  };

  useEffect(() => {
    if (information.setup_hw_num != "" && index == 1 && isMobile) {
      if (swiper && isMobile) {
        swiper.slideTo(2);
      }
    }
  }, [information.setup_hw_num]);

  const excelInput: any = React.useRef();
  const upload = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput!.click();
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (files != null) {
      for (const file of files) {
        let image = window.URL.createObjectURL(file);
        setMainDataResult3((prev) => ({
          data: [
            {
              image: [
                {
                  url: image != null ? image : "",
                  file: file,
                  rowstatus: "N",
                },
                ...prev.data[0].image,
              ],
            },
          ],
          total: prev.total + 1,
        }));
      }
      SetPicureindex(0);
    } else {
      alert("새로고침 후 다시 업로드해주세요.");
    }
  };

  // 카메라 장치 가져오기
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef && videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("error 발생", error);
      });
  }, []);

  const dataURLtoFile = (dataurl: any, fileName: any) => {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
  };

  const onCapture = () => {
    videoRef.current.pause();
    const canvas = document.createElement("canvas");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // 2. canvas에 video 이미지 그리기
    const context = canvas.getContext("2d");

    if (context != null) {
      context.drawImage(videoRef.current, 0, 0);
    }

    // 3. canvas 를 Data URL로 변경
    const url = canvas.toDataURL("image/png");

    const ae = document.createElement("a");

    // 3. 다운로드 url 넣기
    ae.href = url;
    const file = dataURLtoFile(
      url,
      convertDateToStr(new Date()) +
        "_" +
        (mainDataResult3.data[0].image.length + 1)
    );

    setMainDataResult3((prev) => ({
      data: [
        {
          image: [
            {
              url: url != null ? url : "",
              file: file,
              rowstatus: "N",
            },
            ...prev.data[0].image,
          ],
        },
      ],
      total: prev.total + 1,
    }));
    SetPicureindex(0);
    setIsCaptured(false);
  };

  const getPromise = () => {
    videoRef.current.pause();
    setIsCaptured(false);
  };

  const getPromise2 = async () => {
    setIsCaptured(true);
  };

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          //video: { facingMode: { exact: isMobile ? "environment" : "user"} },
          video: { facingMode: isMobile ? "environment" : "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = isCaptured ? stream : null;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };
    initCamera();

    return () => {
      // 컴포넌트가 언마운트되면 미디어 스트림 해제
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isCaptured]);

  const onDeletePicture = () => {
    let newData: any[] = [];
    mainDataResult3.data[0].image.forEach((item: any, index: number) => {
      if (index != pictureindex) {
        newData.push(item);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
      }
    });
    setMainDataResult3((prev) => ({
      data: [
        {
          image: newData,
        },
      ],
      total: prev.total - 1,
    }));
    SetPicureindex(pictureindex - 1 == -1 ? 0 : pictureindex - 1);
  };

  const handleChange = (selectedIndex: any) => {
    SetPicureindex(selectedIndex);
  };

  const uploadFile = async (files: File, newAttachmentNumber?: string) => {
    let data: any;

    const filePara = {
      attached: information.attdatnum
        ? "attached?attachmentNumber=" + information.attdatnum
        : newAttachmentNumber
        ? "attached?attachmentNumber=" + newAttachmentNumber
        : "attached",
      files: files, //.FileList,
    };

    try {
      data = await processApi<any>("file-upload", filePara);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      return data.attachmentNumber;
    } else {
      return data;
    }
  };

  const onSaveClick = async () => {
    if (!permissions.save) return;

    const dataItem: any = mainDataResult3.data[0].image.filter((item: any) => {
      return item.rowstatus == "N" && item.rowstatus !== undefined;
    });
    let newAttachmentNumber = "";
    const promises = [];

    for (const file of dataItem) {
      // 최초 등록 시, 업로드 후 첨부번호를 가져옴 (다중 업로드 대응)
      if (!information.attdatnum && !newAttachmentNumber) {
        newAttachmentNumber = await uploadFile(file.file);
        const promise = newAttachmentNumber;
        promises.push(promise);
        continue;
      }

      const promise = newAttachmentNumber
        ? await uploadFile(file.file, newAttachmentNumber)
        : await uploadFile(file.file);
      promises.push(promise);
    }

    const results = await Promise.all(promises);

    if (results.includes(null)) {
      alert("파일 업로드에 실패했습니다.");
    } else {
      let data: any;

      deletedMainRows.forEach(async (parameter) => {
        try {
          data = await processApi<any>("file-delete", {
            attached: parameter.file.saved_name,
          });
        } catch (error) {
          data = null;
        }
      });
      setParaData({
        workType: "SAVE",
        orgdiv: sessionOrgdiv,
        rowstatus_s: "U",
        setup_hw_num_s: information.setup_hw_num,
        setup_hw_name_s: information.setup_hw_name,
        setup_location_s: information.setup_location,
        person_s: information.person,
        comment_s: information.comment,
        finyn_s:
          information.finyn == true
            ? "Y"
            : information.finyn == false
            ? "N"
            : information.finyn,
        devmngnum_s: information.devmngnum,
        attdatnum_s:
          information.attdatnum == ""
            ? newAttachmentNumber
            : information.attdatnum,
      });
    }
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: "",
    rowstatus_s: "",
    setup_hw_num_s: "",
    setup_hw_name_s: "",
    setup_location_s: "",
    person_s: "",
    comment_s: "",
    finyn_s: "",
    devmngnum_s: "",
    attdatnum_s: "",
  });

  const infopara: Iparameters = {
    procedureName: "P_PR_A2200W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_setup_hw_num_s": paraData.setup_hw_num_s,
      "@p_setup_hw_name_s": paraData.setup_hw_name_s,
      "@p_setup_location_s": paraData.setup_location_s,
      "@p_person_s": paraData.person_s,
      "@p_comment_s": paraData.comment_s,
      "@p_finyn_s": paraData.finyn_s,
      "@p_devmngnum_s": paraData.devmngnum_s,
      "@p_attdatnum_s": paraData.attdatnum_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "PR_A2200W",
    },
  };

  const fetchTodoGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;

    setLoading(true);

    try {
      data = await processApi<any>("procedure", infopara);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        attdatnum: paraData.attdatnum_s,
        isSearch: true,
      }));
      setParaData({
        workType: "",
        orgdiv: "",
        rowstatus_s: "",
        setup_hw_num_s: "",
        setup_hw_name_s: "",
        setup_location_s: "",
        person_s: "",
        comment_s: "",
        finyn_s: "",
        devmngnum_s: "",
        attdatnum_s: "",
      });
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.workType !== "" && permissions.save) fetchTodoGridSaved();
  }, [paraData, permissions]);

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const setCustData = (data: ICustData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };

  const groupByLocation = (items: any) => {
    return items.reduce(
      (groups: { [x: string]: any[] }, item: { setup_location: string }) => {
        const location = item.setup_location || "Unknown";
        if (!groups[location]) {
          groups[location] = [];
        }
        groups[location].push(item);
        return groups;
      },
      {}
    );
  };

  const groupedItems = groupByLocation(mainDataResult2.data);

  return (
    <>
      {isMobile ? (
        <Swiper
          onSwiper={(swiper) => {
            setSwiper(swiper);
          }}
          onActiveIndexChange={(swiper) => {
            index = swiper.activeIndex;
          }}
        >
          <SwiperSlide key={0}>
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <TitleContainer className="TitleContainer">
                <Title>프로젝트 선택</Title>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    fillMode={"solid"}
                    onClick={() => search()}
                    icon="search"
                    disabled={permissions.view ? false : true}
                  >
                    조회
                  </Button>
                </ButtonContainer>
              </TitleContainer>
              <FormBoxWrap
                border={true}
                className="FormBoxWrap"
                onKeyPress={(e) => handleKeyPressSearch(e, search)}
              >
                <FormBox>
                  <tbody>
                    <tr>
                      <th>업체명</th>
                      <td>
                        <Input
                          name="custnm"
                          type="text"
                          value={filters.custnm}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer
                style={{
                  height: mobileheight,
                  overflowY: "auto",
                }}
              >
                {mainDataResult.data.map((item, idx) => (
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <AdminQuestionBox key={idx}>
                      <Card
                        style={{
                          width: "100%",
                          cursor: "pointer",
                          backgroundColor:
                            item.devmngnum == information.devmngnum
                              ? "#d6d8f9"
                              : "#f0f4ff",
                          height: "80px",
                        }}
                      >
                        <CardContent
                          onClick={() => onCheckClick(item)}
                          style={{ textAlign: "left", padding: "8px" }}
                        >
                          <div style={{ height: "40px" }}>
                            <Typography variant="h6">{item.custnm}</Typography>
                          </div>

                          <Typography variant="body2" color="text.secondary">
                            {item.project}
                          </Typography>
                        </CardContent>
                      </Card>
                    </AdminQuestionBox>
                  </Grid>
                ))}
              </GridContainer>
              <BottomContainer className="ButtonContainer">
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    fillMode={"solid"}
                    onClick={() => {
                      resetInformation();
                      deletedMainRows = [];
                      setFilters2((prev) => ({
                        ...prev,
                        devmngnum: "",
                        setup_hw_name: "",
                        setup_location: "",
                        isSearch: true,
                      }));
                      if (swiper && isMobile) {
                        swiper.slideTo(1);
                      }
                    }}
                    disabled={permissions.view ? false : true}
                    style={{ width: "100%" }}
                  >
                    프로젝트 미선택
                  </Button>
                </ButtonContainer>
              </BottomContainer>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={1}>
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <TitleContainer className="TitleContainer">
                <Title>장비 선택</Title>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    fillMode={"solid"}
                    onClick={() => search2()}
                    icon="search"
                    disabled={permissions.view ? false : true}
                  >
                    조회
                  </Button>
                </ButtonContainer>
              </TitleContainer>
              <FormBoxWrap
                border={true}
                className="FormBoxWrap2"
                onKeyPress={(e) => handleKeyPressSearch(e, search2)}
              >
                <FormBox>
                  <tbody>
                    <tr>
                      <th>장비명</th>
                      <td>
                        <Input
                          name="setup_hw_name"
                          type="text"
                          value={filters2.setup_hw_name}
                          onChange={filterInputChange2}
                        />
                      </td>
                      <th>설치위치</th>
                      <td>
                        <Input
                          name="setup_location"
                          type="text"
                          value={filters2.setup_location}
                          onChange={filterInputChange2}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer
                style={{
                  height: mobileheight2,
                  overflowY: "auto",
                }}
              >
                <Grid container spacing={2}>
                  {Object.keys(groupedItems).map((location, idx) => (
                    <Grid item xs={12} key={idx}>
                      {/* {idx > 0 && (
                        <Grid item xs={12}>
                          <Divider style={{ margin: "4px 0" }} />
                        </Grid>
                      )} */}
                      <Paper
                        style={{
                          backgroundColor: "white",
                          padding: "10px",
                          borderRadius: "0",
                        }}
                        elevation={0}
                      >
                        <Typography
                          variant="subtitle1"
                          style={{
                            marginBottom: "16px",
                            backgroundColor: "#f0f2f5",
                            borderRadius: "5px",
                            padding: "5px",
                            fontWeight: 600,
                          }}
                        >
                          {location}
                        </Typography>
                        <Grid container spacing={2}>
                          {groupedItems[location].map(
                            (item: any, itemIdx: any) => (
                              <Grid
                                item
                                xs={12}
                                sm={12}
                                md={12}
                                lg={12}
                                xl={12}
                                key={itemIdx}
                              >
                                <Card
                                  style={{
                                    width: "100%",
                                    cursor: "pointer",
                                    backgroundColor:
                                      item.setup_hw_num ===
                                      information.setup_hw_num
                                        ? "#d6d8f9"
                                        : "#f0f4ff",
                                    height: "80px",
                                  }}
                                  onClick={() => onCheckClick2(item)}
                                >
                                  <CardContent
                                    style={{
                                      textAlign: "left",
                                      padding: "8px",
                                      height: "100%",
                                    }}
                                  >
                                    <div style={{ height: "40px" }}>
                                      <Typography variant="h6">
                                        {item.setup_hw_name}
                                      </Typography>
                                    </div>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {item.setup_location}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            )
                          )}
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </GridContainer>
            </GridContainer>
          </SwiperSlide>
          {information.setup_hw_num == "" ? (
            ""
          ) : (
            <SwiperSlide key={2}>
              <GridContainer style={{ width: "100%", overflow: "auto" }}>
                <TitleContainer className="TitleContainer">
                  <Title>사진 및 코멘트</Title>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <GridTitle>
                      <span style={{ fontWeight: 600, fontSize: "18px" }}>
                        {information.setup_hw_name}
                      </span>
                      {"  "}
                      <span style={{ color: "#b0b0b0" }}>
                        {information.setup_location}
                      </span>
                    </GridTitle>
                    <Switch
                      onChange={(event: any) => {
                        setInformation((prev) => ({
                          ...prev,
                          finyn: event.target.value,
                        }));
                      }}
                      onLabel={"작업완료"}
                      offLabel={"작업중"}
                      checked={information.finyn}
                      className="PDA_Switch"
                    />
                  </ButtonContainer>
                </TitleContainer>
                <GridContainer>
                  {isCaptured ? (
                    <>
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        autoPlay
                        style={{
                          height: mobileheight4,
                          width: "100%",
                        }}
                      ></video>
                      <FormBoxWrap className="FormBoxWrap4">
                        <FormBox>
                          <tbody>
                            <tr
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <td>
                                <Button
                                  id={"button2"}
                                  themeColor={"primary"}
                                  fillMode={"outline"}
                                  onClick={() => onCapture()}
                                  style={{ width: "100%" }}
                                >
                                  촬영
                                </Button>
                                <input
                                  id="uploadAttachment"
                                  style={{ display: "none" }}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  ref={excelInput}
                                  onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    handleFileUpload(event.target.files);
                                  }}
                                />
                              </td>
                              <td>
                                <Button
                                  id={"button"}
                                  themeColor={"primary"}
                                  fillMode={"outline"}
                                  onClick={() => getPromise()}
                                  style={{ width: "100%" }}
                                >
                                  사진모드
                                </Button>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={2}>
                                <TextArea
                                  value={information.comment}
                                  name="comment"
                                  rows={50}
                                  style={{
                                    maxHeight: "20vh",
                                    overflowY: "auto",
                                    background: "#d6d8f9",
                                  }}
                                  onChange={InputChange}
                                />
                              </td>
                            </tr>
                            <tr
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <td>
                                <Button
                                  themeColor={"primary"}
                                  fillMode={"solid"}
                                  onClick={() => onDeletePicture()}
                                  style={{ width: "100%" }}
                                  disabled={true}
                                >
                                  사진 삭제
                                </Button>
                              </td>
                              <td>
                                <Button
                                  id={"button5"}
                                  themeColor={"primary"}
                                  fillMode={"solid"}
                                  onClick={() => onSaveClick()}
                                  style={{ width: "100%" }}
                                  disabled={true}
                                >
                                  저장
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </FormBox>
                      </FormBoxWrap>
                    </>
                  ) : mainDataResult3.total > 0 ? (
                    <>
                      <Carousel
                        cycleNavigation={true}
                        navButtonsAlwaysVisible={true}
                        autoPlay={false}
                        onChange={handleChange}
                        index={pictureindex}
                        height={mobileheight3}
                      >
                        {mainDataResult3.data[0].image.map((content: any) => (
                          <>
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                              }}
                            >
                              <img
                                src={content.url}
                                style={{
                                  objectFit: "contain",
                                  height: "100%",
                                  width: "100%",
                                }}
                              />
                            </div>
                          </>
                        ))}
                      </Carousel>
                      <FormBoxWrap className="FormBoxWrap3">
                        <FormBox>
                          <tbody>
                            <tr
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <td>
                                <Button
                                  id={"button1"}
                                  themeColor={"primary"}
                                  fillMode={"outline"}
                                  onClick={upload}
                                  style={{ width: "100%" }}
                                >
                                  첨부파일
                                </Button>
                                <input
                                  id="uploadAttachment"
                                  style={{ display: "none" }}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  ref={excelInput}
                                  onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    handleFileUpload(event.target.files);
                                  }}
                                />
                              </td>
                              <td>
                                <Button
                                  id={"button3"}
                                  themeColor={"primary"}
                                  fillMode={"outline"}
                                  onClick={() => getPromise2()}
                                  style={{ width: "100%" }}
                                >
                                  촬영모드
                                </Button>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={2}>
                                <TextArea
                                  value={information.comment}
                                  name="comment"
                                  rows={50}
                                  style={{
                                    maxHeight: "20vh",
                                    overflowY: "auto",
                                    background: "#d6d8f9",
                                  }}
                                  onChange={InputChange}
                                />
                              </td>
                            </tr>
                            <tr
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <td>
                                <Button
                                  themeColor={"primary"}
                                  fillMode={"solid"}
                                  onClick={() => onDeletePicture()}
                                  style={{ width: "100%" }}
                                >
                                  사진 삭제
                                </Button>
                              </td>
                              <td>
                                <Button
                                  id={"button5"}
                                  themeColor={"primary"}
                                  fillMode={"solid"}
                                  onClick={() => onSaveClick()}
                                  style={{ width: "100%" }}
                                  disabled={permissions.save ? false : true}
                                >
                                  저장
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </FormBox>
                      </FormBoxWrap>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          width: "100%",
                          height: mobileheight3,
                        }}
                      ></div>
                      <FormBoxWrap className="FormBoxWrap3">
                        <FormBox>
                          <tbody>
                            <tr
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <td>
                                <Button
                                  id={"button1"}
                                  themeColor={"primary"}
                                  fillMode={"outline"}
                                  onClick={upload}
                                  style={{ width: "100%" }}
                                >
                                  첨부파일
                                </Button>
                                <input
                                  id="uploadAttachment"
                                  style={{ display: "none" }}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  ref={excelInput}
                                  onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    handleFileUpload(event.target.files);
                                  }}
                                />
                              </td>
                              <td>
                                <Button
                                  id={"button3"}
                                  themeColor={"primary"}
                                  fillMode={"outline"}
                                  onClick={() => getPromise2()}
                                  style={{ width: "100%" }}
                                >
                                  촬영모드
                                </Button>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={2}>
                                <TextArea
                                  value={information.comment}
                                  name="comment"
                                  rows={50}
                                  style={{
                                    maxHeight: "20vh",
                                    overflowY: "auto",
                                    background: "#d6d8f9",
                                  }}
                                  onChange={InputChange}
                                />
                              </td>
                            </tr>
                            <tr
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <td>
                                <Button
                                  themeColor={"primary"}
                                  fillMode={"solid"}
                                  onClick={() => onDeletePicture()}
                                  style={{ width: "100%" }}
                                >
                                  사진 삭제
                                </Button>
                              </td>
                              <td>
                                <Button
                                  id={"button5"}
                                  themeColor={"primary"}
                                  fillMode={"solid"}
                                  onClick={() => onSaveClick()}
                                  style={{ width: "100%" }}
                                  disabled={permissions.save ? false : true}
                                >
                                  저장
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </FormBox>
                      </FormBoxWrap>
                    </>
                  )}
                </GridContainer>
              </GridContainer>
            </SwiperSlide>
          )}
        </Swiper>
      ) : (
        <>
          {step == 0 ? (
            <GridContainer>
              <TitleContainer className="TitleContainer">
                <Title>프로젝트 선택</Title>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    fillMode={"solid"}
                    onClick={() => {
                      resetInformation();
                      deletedMainRows = [];
                      setFilters2((prev) => ({
                        ...prev,
                        setup_hw_name: "",
                        setup_location: "",
                        devmngnum: "",
                        isSearch: true,
                      }));
                      setStep(1);
                    }}
                    disabled={permissions.view ? false : true}
                  >
                    프로젝트 미선택
                  </Button>
                  <Button
                    themeColor={"primary"}
                    fillMode={"solid"}
                    onClick={() => search()}
                    icon="search"
                    disabled={permissions.view ? false : true}
                  >
                    조회
                  </Button>
                  <Button
                    onClick={() => {
                      setFilters2((prev) => ({
                        ...prev,
                        setup_hw_name: "",
                        setup_location: "",
                        isSearch: true,
                      }));
                      setStep(1);
                    }}
                    icon="arrow-right"
                  >
                    다음
                  </Button>
                </ButtonContainer>
              </TitleContainer>
              <FormBoxWrap
                style={{ width: "20%", float: "right", marginBottom: GAP }}
                border={true}
                className="FormBoxWrap"
              >
                <FormBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                  <tbody>
                    <tr>
                      <th>업체명</th>
                      <td>
                        <Input
                          name="custnm"
                          type="text"
                          value={filters.custnm}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap
                style={{ width: "100%" }}
                border={true}
                className="FormBoxWrap5"
              >
                <FormBox>
                  <tbody>
                    <tr>
                      <th>개발관리번호</th>
                      <td>
                        <Input
                          name="devmngnum"
                          type="text"
                          value={information2.devmngnum}
                          className="readonly"
                        />
                      </td>
                      <th>프로젝트</th>
                      <td colSpan={4}>
                        <Input
                          name="project"
                          type="text"
                          value={information2.project}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>완료일</th>
                      <td>
                        <DatePicker
                          value={
                            information2.findt == ""
                              ? null
                              : toDate(information2.findt)
                          }
                          name="findt"
                          format={"yyyy-MM-dd"}
                          placeholder=""
                        />
                      </td>
                      <th>작성일</th>
                      <td>
                        <DatePicker
                          value={
                            information2.recdt == ""
                              ? null
                              : toDate(information2.recdt)
                          }
                          name="recdt"
                          format={"yyyy-MM-dd"}
                          placeholder=""
                          className="required"
                        />
                      </td>
                      <th>업체명</th>
                      <td>
                        <Input
                          name="custcd"
                          type="text"
                          value={information2.custcd}
                          className="required"
                        />
                        <ButtonInInput>
                          <Button
                            onClick={onCustWndClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                      <td>
                        <Input
                          name="custnm"
                          type="text"
                          value={information2.custnm}
                          className="required"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>사업종료일</th>
                      <td>
                        <DatePicker
                          value={
                            information2.finexpdt == ""
                              ? null
                              : toDate(information2.finexpdt)
                          }
                          name="finexpdt"
                          format={"yyyy-MM-dd"}
                          placeholder=""
                          className="required"
                        />
                      </td>
                      <th>차수</th>
                      <td>
                        <Input
                          name="number"
                          type="string"
                          value={information2.number}
                          className="required"
                        />
                      </td>
                      <th>담당PM</th>
                      <td>
                        <Input
                          name="pjtmanager"
                          type="string"
                          value={
                            userListData.find(
                              (item: any) =>
                                item.user_id == information2.pjtmanager
                            )?.user_name
                          }
                          className="required"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>담당팀장</th>
                      <td>
                        <Input
                          name="pjtperson"
                          type="string"
                          value={
                            userListData.find(
                              (item: any) =>
                                item.user_id == information2.pjtperson
                            )?.user_name
                          }
                          className="required"
                        />
                      </td>
                      <th>최종점검일</th>
                      <td>
                        <DatePicker
                          value={
                            information2.finchkdt == ""
                              ? null
                              : toDate(information2.finchkdt)
                          }
                          name="finchkdt"
                          format={"yyyy-MM-dd"}
                          placeholder=""
                        />
                      </td>
                      <th>감리위원</th>
                      <td>
                        <Input
                          name="revperson"
                          type="string"
                          value={information2.revperson}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>사업시작일</th>
                      <td>
                        <DatePicker
                          value={
                            information2.cotracdt == ""
                              ? null
                              : toDate(information2.cotracdt)
                          }
                          name="cotracdt"
                          format={"yyyy-MM-dd"}
                          placeholder=""
                          className="required"
                        />
                      </td>
                      <th>중간점검일</th>
                      <td>
                        <DatePicker
                          value={
                            information2.midchkdt == ""
                              ? null
                              : toDate(information2.midchkdt)
                          }
                          name="midchkdt"
                          format={"yyyy-MM-dd"}
                          placeholder=""
                        />
                      </td>
                      <th>비고</th>
                      <td colSpan={2}>
                        <Input
                          name="remark1"
                          type="string"
                          value={information2.remark1}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer
                style={{
                  width: "100%",
                  height: webheight,
                  overflow: "auto",
                }}
              >
                <Grid container spacing={2}>
                  {mainDataResult.data.map((item, idx) => (
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={4}>
                      <AdminQuestionBox key={idx}>
                        <Card
                          style={{
                            width: "100%",
                            cursor: "pointer",
                            backgroundColor:
                              item.devmngnum == information.devmngnum
                                ? "#d6d8f9"
                                : "#f0f4ff",
                            height: "80px",
                          }}
                        >
                          <CardContent
                            onClick={() => onCheckClick(item)}
                            style={{ textAlign: "left", padding: "8px" }}
                          >
                            <div style={{ height: "40px" }}>
                              <Typography variant="h6">
                                {item.custnm}
                              </Typography>
                            </div>
                            <Typography variant="body2" color="text.secondary">
                              {item.project}
                            </Typography>
                          </CardContent>
                        </Card>
                      </AdminQuestionBox>
                    </Grid>
                  ))}
                </Grid>
              </GridContainer>
            </GridContainer>
          ) : step == 1 ? (
            <GridContainer>
              <TitleContainer className="TitleContainer">
                <Title>장비 선택</Title>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    fillMode={"solid"}
                    onClick={() => search2()}
                    icon="search"
                    disabled={permissions.view ? false : true}
                  >
                    조회
                  </Button>
                  <Button
                    onClick={() => {
                      setStep(0);
                      setFilters2((prev) => ({
                        ...prev,
                        setup_hw_name: "",
                        setup_location: "",
                      }));
                      setFilters((prev) => ({
                        ...prev,
                        custnm: "",
                        isSearch: true,
                      }));
                      deletedMainRows = [];
                    }}
                    icon="arrow-left"
                  >
                    이전
                  </Button>
                  <Button
                    onClick={() => {
                      if (information.setup_hw_num != "") {
                        setStep(2);
                      } else {
                        alert("장비를 선택해주세요");
                      }
                    }}
                    icon="arrow-right"
                  >
                    다음
                  </Button>
                </ButtonContainer>
              </TitleContainer>
              <FormBoxWrap
                style={{ width: "40%", float: "right" }}
                border={true}
                className="FormBoxWrap2"
              >
                <FormBox onKeyPress={(e) => handleKeyPressSearch(e, search2)}>
                  <tbody>
                    <tr>
                      <th>장비명</th>
                      <td>
                        <Input
                          name="setup_hw_name"
                          type="text"
                          value={filters2.setup_hw_name}
                          onChange={filterInputChange2}
                        />
                      </td>
                      <th>설치위치</th>
                      <td>
                        <Input
                          name="setup_location"
                          type="text"
                          value={filters2.setup_location}
                          onChange={filterInputChange2}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <div
                style={{
                  height: webheight2,
                  width: "100%",
                  overflow: "auto",
                }}
              >
                <Grid container spacing={2}>
                  {Object.keys(groupedItems).map((location, idx) => (
                    <Grid item xs={12} key={idx}>
                      <Paper
                        style={{
                          backgroundColor: "white",
                          padding: "10px",
                          borderRadius: "0",
                        }}
                        elevation={0}
                      >
                        <Typography
                          variant="h5"
                          style={{
                            marginBottom: "16px",
                            backgroundColor: "#f0f2f5",
                            borderRadius: "5px",
                            padding: "8px",
                          }}
                        >
                          {location}
                        </Typography>
                        <Grid container spacing={2}>
                          {groupedItems[location].map(
                            (item: any, itemIdx: any) => (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                xl={2}
                                key={itemIdx}
                              >
                                <Card
                                  style={{
                                    width: "100%",
                                    cursor: "pointer",
                                    backgroundColor:
                                      item.setup_hw_num ===
                                      information.setup_hw_num
                                        ? "#d6d8f9"
                                        : "#f0f4ff",
                                    height: "80px",
                                  }}
                                  onClick={() => onCheckClick2(item)}
                                >
                                  <CardContent
                                    style={{
                                      textAlign: "left",
                                      padding: "8px",
                                      height: "100%",
                                    }}
                                  >
                                    <div style={{ height: "40px" }}>
                                      <Typography variant="h6">
                                        {item.setup_hw_name}
                                      </Typography>
                                    </div>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {item.setup_location}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            )
                          )}
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </div>
            </GridContainer>
          ) : (
            <GridContainer>
              <TitleContainer className="TitleContainer">
                <Title>사진 및 코멘트</Title>
                <ButtonContainer>
                  {isCaptured ? (
                    <>
                      <Button
                        id={"button"}
                        themeColor={"primary"}
                        fillMode={"solid"}
                        onClick={() => getPromise()}
                      >
                        사진모드
                      </Button>
                      <Button
                        id={"button2"}
                        themeColor={"primary"}
                        fillMode={"solid"}
                        onClick={() => onCapture()}
                      >
                        촬영
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setStep(1);
                          setFilters2((prev) => ({
                            ...prev,
                            setup_hw_name: "",
                            setup_location: "",
                          }));
                          setFilters((prev) => ({
                            ...prev,
                            custnm: "",
                          }));
                        }}
                        icon="arrow-left"
                      >
                        이전
                      </Button>
                      <Button
                        id={"button1"}
                        themeColor={"primary"}
                        fillMode={"solid"}
                        onClick={upload}
                      >
                        첨부파일
                      </Button>
                      <input
                        id="uploadAttachment"
                        style={{ display: "none" }}
                        type="file"
                        accept="image/*"
                        multiple
                        ref={excelInput}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          handleFileUpload(event.target.files);
                        }}
                      />
                      <Button
                        id={"button3"}
                        themeColor={"primary"}
                        fillMode={"solid"}
                        onClick={() => getPromise2()}
                      >
                        촬영모드
                      </Button>
                      <Button
                        themeColor={"primary"}
                        fillMode={"solid"}
                        onClick={() => onDeletePicture()}
                      >
                        사진 삭제
                      </Button>
                      <Button
                        themeColor={"primary"}
                        fillMode={"solid"}
                        onClick={() => onSaveClick()}
                        disabled={permissions.save ? false : true}
                      >
                        저장
                      </Button>
                    </>
                  )}
                </ButtonContainer>
              </TitleContainer>

              {isCaptured ? (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  style={{ height: webheight4, width: "100%" }}
                ></video>
              ) : mainDataResult3.total > 0 ? (
                <>
                  <Carousel
                    cycleNavigation={true}
                    navButtonsAlwaysVisible={true}
                    autoPlay={false}
                    onChange={handleChange}
                    index={pictureindex}
                    height={webheight3}
                  >
                    {mainDataResult3.data[0].image.map((content: any) => (
                      <>
                        <div style={{ width: "100%", height: "100%" }}>
                          <img
                            src={content.url}
                            style={{
                              objectFit: "contain",
                              height: "100%",
                              width: "100%",
                            }}
                          />
                        </div>
                      </>
                    ))}
                  </Carousel>
                  <GridTitleContainer
                    style={{
                      flexDirection: "column",
                    }}
                    className="ButtonContainer3"
                  >
                    <GridTitle style={{ fontWeight: 600, fontSize: "18px" }}>
                      {information.setup_hw_name}
                    </GridTitle>
                    <GridTitle style={{ color: "#b0b0b0" }}>
                      {information.setup_location}
                    </GridTitle>
                  </GridTitleContainer>
                  <FormBoxWrap className="FormBoxWrap3">
                    <GridTitleContainer>
                      <GridTitle>
                        <ButtonContainer>
                          코멘트
                          <div>
                            <Switch
                              onChange={(event: any) => {
                                setInformation((prev) => ({
                                  ...prev,
                                  finyn: event.target.value,
                                }));
                              }}
                              onLabel={"작업완료"}
                              offLabel={"작업중"}
                              checked={information.finyn}
                              className="PDA_Switch"
                            />
                          </div>
                        </ButtonContainer>
                      </GridTitle>
                    </GridTitleContainer>
                    <FormBox>
                      <tbody>
                        <tr>
                          <td>
                            <TextArea
                              value={information.comment}
                              name="comment"
                              rows={50}
                              style={{
                                maxHeight: "20vh",
                                overflowY: "auto",
                                background: "#d6d8f9",
                              }}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: "100%",
                      height: webheight3,
                      display: "flex",
                      justifyContent: "flex-end",
                      flexDirection: "column",
                    }}
                    className="ButtonContainer3"
                  >
                    <GridTitleContainer style={{ flexDirection: "column" }}>
                      <GridTitle style={{ fontWeight: 600, fontSize: "18px" }}>
                        {information.setup_hw_name}
                      </GridTitle>
                      <GridTitle style={{ color: "#b0b0b0" }}>
                        {information.setup_location}
                      </GridTitle>
                    </GridTitleContainer>
                  </div>
                  <FormBoxWrap className="FormBoxWrap3">
                    <GridTitleContainer>
                      <GridTitle>
                        <ButtonContainer>
                          코멘트
                          <div style={{ marginLeft: "10px" }}>
                            <Switch
                              onChange={(event: any) => {
                                setInformation((prev) => ({
                                  ...prev,
                                  finyn: event.target.value,
                                }));
                              }}
                              onLabel={"작업완료"}
                              offLabel={"작업중"}
                              checked={information.finyn}
                              className="PDA_Switch"
                            />
                          </div>
                        </ButtonContainer>
                      </GridTitle>
                    </GridTitleContainer>
                    <FormBox>
                      <tbody>
                        <tr>
                          <td>
                            <TextArea
                              value={information.comment}
                              name="comment"
                              rows={50}
                              style={{
                                maxHeight: "20vh",
                                overflowY: "auto",
                                background: "#d6d8f9",
                              }}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </>
              )}
            </GridContainer>
          )}
        </>
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
    </>
  );
};

export default PR_A2200W;
