import {
  CameraIcon,
  CardLabel,
  Dropdown,
  LabelFieldPair,
  MobileNumber,
  TextInput,
  Toast,
  CardLabelError,
  BreadCrumb,
  BackButton,
  Loader,
  DatePicker,
  TextArea,
  CheckBox
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import UploadDrawer from "./ImageUpload/UploadDrawer";
import { subYears, format, differenceInYears } from "date-fns";

const defaultImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAO4AAADUCAMAAACs0e/bAAAAM1BMVEXK0eL" +
  "/" +
  "/" +
  "/" +
  "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";

const UserProfile = ({ stateCode, userType, cityDetails }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const url = window.location.href;
  const stateId = Digit.ULBService.getStateId();
  const tenant = Digit.ULBService.getCurrentTenantId();
  const userInfo = Digit.UserService.getUser()?.info || {};
  const [userDetails, setUserDetails] = useState(null);
  const [name, setName] = useState(userInfo?.name ? userInfo?.name : "");
  const dateOfBirth= userDetails?.dob
  console.log("ddd", dateOfBirth)
  const formattedDob=(dateOfBirth!==undefined) ?format(new Date(dateOfBirth), 'MM/dd/yyyy') : ""
  //const dateOfBirth1= (dateOfBirth!==undefined) ?dateOfBirth.split("-").reverse().join("-") : ""
  const [dob, setDob] = useState(dateOfBirth);
  const [email, setEmail] = useState(userInfo?.emailId ? userInfo?.emailId : "");
  const [gender, setGender] = useState(userDetails?.gender);
  const [city, setCity] = useState(userInfo?.permanentCity ? userInfo?.permanentCity : cityDetails?.name);
  const [mobileNumber, setMobileNo] = useState(userInfo?.mobileNumber ? userInfo?.mobileNumber : "");
  const [profilePic, setProfilePic] = useState(userDetails?.photo ? userDetails?.photo : "");
  const [profileImg, setProfileImg] = useState("");
  const [openUploadSlide, setOpenUploadSide] = useState(false);
  const [changepassword, setChangepassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const [errors, setErrors] = React.useState({});
  const isMobile = window.Digit.Utils.browser.isMobile();
  const [PermanentAddress, setPermanentAddress] = useState()
  const [selectedState, setSelectedState] = useState();
  const [selectedDistrict, setSelectedDistrict] = useState();
  const [pinCode, setPinCode] = useState();
  const [isAddressSame, setIsAddressSame] = useState();
  const [correspondenceAddress, setCorrespondenceAddress] = useState()
  const [selectedCorrespondentState, setSelectedCorrespondentState] = useState()
  const [selectedCorrespondentDistrict, setSelectedCorrespondentDistrict] = useState()
  const [pinCodeCorrespondent, setPinCodeCorrespondent] = useState()
  const isUserArchitect = window.location.href.includes("citizen") && userInfo?.roles?.some((role) => role.code.includes("BPA_ARCHITECT"));

  const getUserInfo = async () => {
    const uuid = userInfo?.uuid;
    if (uuid) {
      const selectedTenantId = window.location.href.includes("citizen") ? stateId : tenant
      setLoading(true);
      const usersResponse = await Digit.UserService.userSearch(selectedTenantId, { uuid: [uuid] }, {});
      usersResponse && usersResponse.user && usersResponse.user.length && setUserDetails(usersResponse.user[0]);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("userDetails",userDetails)
  }, [userDetails])

  React.useEffect(() => {
    window.addEventListener("resize", () => setWindowWidth(window.innerWidth));
    return () => {
      window.removeEventListener("resize", () => setWindowWidth(window.innerWidth));
    };
  });

  const { data: districtList, isLoading } = Digit.Hooks.useCustomMDMS(stateId, "common-masters", [{ name: "DistrictMaster"}]);
  const uniqueDistricts = useMemo(() => {
      if (isLoading || !districtList?.["common-masters"]?.DistrictMaster?.length) return [];
  
      return districtList?.["common-masters"]?.DistrictMaster?.filter((district) => district.state_code === selectedState?.state_code);
        
    }, [isLoading, districtList, selectedState]);

    // const { data: districtListCorrespondent, isLoading: isLoadingCorrespondent} = Digit.Hooks.useCustomMDMS(stateId, "common-masters", [{ name: "DistrictMaster"}], );
    const uniqueDistrictsCorrespondent = useMemo(() => {
      if (isLoading || !districtList?.["common-masters"]?.DistrictMaster?.length) return [];
  
      return districtList?.["common-masters"]?.DistrictMaster?.filter((district) => district.state_code === selectedCorrespondentState?.state_code);
    }, [isLoading, districtList, selectedCorrespondentState]);

    const { data: StateData, isLoading: isStateLoading } = Digit.Hooks.useCustomMDMS(stateId, "common-masters", [{name:"StateMaster"}]);
    const stateOptions = useMemo(() => {
      if(StateData?.["common-masters"]?.StateMaster?.length > 0){
        return StateData?.["common-masters"].StateMaster;
      }else{
        return [];
      }
    }, [StateData, isStateLoading]);

    console.log("uniqueDistricts", uniqueDistrictsCorrespondent, selectedCorrespondentState)

    useEffect(() => {
      if(typeof selectedState === "string" && stateOptions?.length>0){
        const state = stateOptions.find((state) => state.state_name === selectedState);
        console.log("stateData", stateOptions, state, selectedState)
        setSelectedState(state)
      }
      // refetchDistricts();
    },[selectedState, stateOptions])
    useEffect(() => {
      if(typeof selectedCorrespondentState === "string" && stateOptions?.length>0){
        const state = stateOptions.find((state) => state.state_name === selectedCorrespondentState);
        setSelectedCorrespondentState(state)
      }
      // refetchDistrictsCor()
    },[selectedCorrespondentState, stateOptions])
    useEffect(() => {
      if(typeof selectedCorrespondentDistrict === "string" && uniqueDistrictsCorrespondent?.length>0){
        const state = uniqueDistrictsCorrespondent.find((state) => state.district_name_english === selectedCorrespondentDistrict);
        setSelectedCorrespondentDistrict(state)
      }      
    },[selectedCorrespondentDistrict, uniqueDistrictsCorrespondent])
    useEffect(() => {
      if(typeof selectedDistrict === "string" && uniqueDistricts?.length>0){
        const state = uniqueDistricts.find((state) => state.district_name_english === selectedDistrict);
        setSelectedDistrict(state)
      }
    },[selectedDistrict, uniqueDistricts])
  

  useEffect(() => {
    setLoading(true);

    getUserInfo();

    setGender({
      i18nKey: undefined,
      code: userDetails?.gender,
      value: userDetails?.gender,
    });
    setDob(userDetails?.dob)
    setPermanentAddress(userDetails?.permanentAddress)
    setSelectedDistrict(userDetails?.permanentDistrict)
    setPinCode(userDetails?.permanentPinCode)
    setPinCodeCorrespondent(userDetails?.correspondencePinCode)
    setSelectedCorrespondentDistrict(userDetails?.correspondenceDistrict)
    setCorrespondenceAddress(userDetails?.correspondenceAddress)
    setSelectedCorrespondentState(userDetails?.correspondenceState)    
    setSelectedState(userDetails?.permanentState)
    
    if(userDetails?.isAddressSame){
      setIsAddressSame(userDetails?.isAddressSame)
    }

    const thumbs = userDetails?.photo?.split(",");
    setProfileImg(thumbs?.at(0));

    setLoading(false);
  }, [userDetails !== null]);

  let validation = {};
  const editScreen = false; // To-do: Deubug and make me dynamic or remove if not needed
  const onClickAddPic = () => setOpenUploadSide(!openUploadSlide);
  const TogleforPassword = () => setChangepassword(!changepassword);
  const setGenderName = (value) => setGender(value);

  const setUserDOB =(value)=> {
      setDob(value);
  }
  const closeFileUploadDrawer = () => setOpenUploadSide(false);

  const setUserName = (value) => {
    setName(value);

    if(!new RegExp(/^[a-zA-Z ]+$/i).test(value) || value.length === 0 || value.length > 50){
      setErrors({...errors, userName : {type: "pattern", message: t("CORE_COMMON_PROFILE_NAME_INVALID")}});
    }else{
      setErrors({...errors, userName : null})
    }
  }

  const setUserEmailAddress = (value) => {
    setEmail(value);
    if(value.length && /*!(value.includes("@") && value.includes("."))*/ !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))){
      setErrors({...errors, emailAddress: {type: "pattern", message: t("CORE_COMMON_PROFILE_EMAIL_INVALID")}})
    }else{
      setErrors({...errors, emailAddress : null})
    }
  }

  const setUserMobileNumber = (value) => {
    setMobileNo(value);

    if (userType === "employee" && !new RegExp(/^[6-9]{1}[0-9]{9}$/).test(value)) {
      setErrors({...errors, mobileNumber: {type: 'pattern', message: t("CORE_COMMON_PROFILE_MOBILE_NUMBER_INVALID")}})
    }else{
      setErrors({...errors, mobileNumber: null});
    }
  }

  const setUserCurrentPassword = (value) => {
    setCurrentPassword(value);

    if (!new RegExp(/^([a-zA-Z0-9@#$%]{8,15})$/i).test(value)) {
      setErrors({...errors, currentPassword: {type: "pattern", message: t("CORE_COMMON_PROFILE_PASSWORD_INVALID")}})
    }else{
      setErrors({...errors, currentPassword: null});
    }
  }

  const setUserNewPassword = (value) => {
    setNewPassword(value);

    if (!new RegExp(/^([a-zA-Z0-9@#$%]{8,15})$/i).test(value)) {
      setErrors({...errors, newPassword: {type: "pattern", message: t("CORE_COMMON_PROFILE_PASSWORD_INVALID")}})
    }else{
      setErrors({...errors, newPassword: null});
    }
  }

  const setUserConfirmPassword = (value) => {
    setConfirmPassword(value);

    if (!new RegExp(/^([a-zA-Z0-9@#$%]{8,15})$/i).test(value)) {
      setErrors({...errors, confirmPassword: {type: "pattern", message: t("CORE_COMMON_PROFILE_PASSWORD_INVALID")}})
    }else{
      setErrors({...errors, confirmPassword: null});
    }
  }

  const removeProfilePic = () => {
    setProfilePic(null);
    setProfileImg(null);
  };

  const showToast = (type, message, duration = 5000) => {
    setToast({ key: type, action: message });
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const requestData = {
        ...userDetails,
        name,
        dob: dob!== undefined ? dob.split("-").reverse().join("/") : "",
        gender: gender?.value,
        emailId: email,
        photo: profilePic,
        permanentAddress: PermanentAddress,
        permanentDistrict: selectedDistrict?.district_name_english,
        permanentPinCode: pinCode,
        correspondencePinCode: isAddressSame ? pinCode : pinCodeCorrespondent,
        correspondenceDistrict: isAddressSame ? selectedDistrict?.district_name_english : selectedCorrespondentDistrict?.district_name_english,
        correspondenceAddress: isAddressSame ? PermanentAddress : correspondenceAddress,
        correspondenceState: isAddressSame ? selectedState?.state_name : selectedCorrespondentState?.state_name,
        permanentState: selectedState?.state_name,
        isAddressSame: isAddressSame
      };

      if (!new RegExp(/^([a-zA-Z ])*$/).test(name) || name === "" || name.length > 50 || name.length < 1) {
        throw JSON.stringify({ type: "error", message: t("CORE_COMMON_PROFILE_NAME_INVALID") });
      }

      if (userType === "employee" && !new RegExp(/^[6-9]{1}[0-9]{9}$/).test(mobileNumber)) {
        throw JSON.stringify({ type: "error", message: t("CORE_COMMON_PROFILE_MOBILE_NUMBER_INVALID") });
      }

      if (userType === "citizen") {

        if (!requestData.name || typeof requestData.name !== "string" || !/^[A-Za-z ]{2,50}$/.test(requestData.name)) {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_NAME_INVALID") });
        }

        if (!requestData.dob) {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_DOB_REQUIRED") });
        } else {
          console.log("requestData.dob",requestData.dob)
          const [dd, mm, yyyy] = requestData.dob.split("/");
          const dobDate = new Date(`${yyyy}-${mm}-${dd}`);
          const today = new Date();

          let age = today.getFullYear() - dobDate.getFullYear();
          const m = today.getMonth() - dobDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;

          if (age < 18) {
            throw JSON.stringify({ type: "error", message: t("CORE_COMMON_DOB_MIN_AGE") });
          } else if (age > 150) {
            throw JSON.stringify({ type: "error", message: t("CORE_COMMON_DOB_MAX_AGE") });
          }
        }

        if (!requestData.gender) {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_GENDER_REQUIRED") });
        }

        if (!requestData.emailId || !Digit.Utils.getPattern("Email").test(requestData.emailId)) {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_EMAIL_INVALID") });
        }

        if (!requestData.permanentAddress || typeof requestData.permanentAddress !== "string") {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_PERMANENT_ADDRESS_REQUIRED") });
        }

        if (!requestData.permanentDistrict || typeof requestData.permanentDistrict !== "string") {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_PERMANENT_CITY_REQUIRED") });
        }

        if (!requestData.permanentPinCode) {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_PERMANENT_PINCODE_REQUIRED") });
        }

        if (!Digit.Utils.getPattern("Pincode").test(requestData.permanentPinCode)) {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_PERMANENT_PINCODE_INVALID") });
        }

        if (!requestData.permanentState) {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_PERMANENT_STATE_REQUIRED") });
        }

        if (!requestData.isAddressSame && !Digit.Utils.getPattern("Pincode").test(requestData.correspondencePinCode)) {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_CORRESPONDENCE_PINCODE_INVALID") });
        }

        if (!requestData.isAddressSame && (!requestData.correspondenceDistrict || typeof requestData.correspondenceDistrict !== "string")) {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_CORRESPONDENCE_CITY_REQUIRED") });
        }

        if (!requestData.isAddressSame && (!requestData.correspondenceAddress || typeof requestData.correspondenceAddress !== "string")) {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_CORRESPONDENCE_ADDRESS_REQUIRED") });
        }

        if (!requestData.isAddressSame && (!requestData.correspondenceState || typeof requestData.correspondenceState !== "string")) {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_CORRESPONDENCE_STATE_REQUIRED") });
        }

      }

      if (email?.length && !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
        throw JSON.stringify({ type: "error", message: t("CORE_COMMON_PROFILE_EMAIL_INVALID") });
      }     

      if (currentPassword.length || newPassword.length || confirmPassword.length) {
        if (newPassword !== confirmPassword) {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_PROFILE_PASSWORD_MISMATCH") });
        }

        if (!(currentPassword.length && newPassword.length && confirmPassword.length)) {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_PROFILE_PASSWORD_INVALID") });
        }

        if (!new RegExp(/^([a-zA-Z0-9@#$%]{8,15})$/i).test(newPassword) && !new RegExp(/^([a-zA-Z0-9@#$%]{8,15})$/i).test(confirmPassword)) {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_PROFILE_PASSWORD_INVALID") });
        }
      }
      requestData["locale"]=Digit.StoreData.getCurrentLanguage();
      const { responseInfo, user } = await Digit.UserService.updateUser(requestData, stateCode);

      if (responseInfo && responseInfo.status === "200") {
        const user = Digit.UserService.getUser();

        if (user) {
          Digit.UserService.setUser({
            ...user,
            info: {
              ...user.info,
              name,
              //DOB,
              mobileNumber,
              emailId: email,
              permanentCity: city,
              photo: profileImg
            },
          });
        }
      }

      if (currentPassword.length && newPassword.length && confirmPassword.length) {
        const requestData = {
          existingPassword: currentPassword,
          newPassword: newPassword,
          tenantId: tenant,
          type: "EMPLOYEE",
          username: userInfo?.userName,
          confirmPassword: confirmPassword,
        };

        if (newPassword === confirmPassword) {
          try {
            const res = await Digit.UserService.changePassword(requestData, tenant);

            const { responseInfo: changePasswordResponseInfo } = res;
            if (changePasswordResponseInfo?.status && changePasswordResponseInfo.status === "200") {
              showToast("success", t("CORE_COMMON_PROFILE_UPDATE_SUCCESS_WITH_PASSWORD"), 5000);
            } else {
              throw "";
            }
          } catch (error) {
            throw JSON.stringify({
              type: "error",
              message: error.Errors?.at(0)?.description ? error.Errors.at(0).description : t("CORE_COMMON_PROFILE_UPDATE_ERROR_WITH_PASSWORD"),
            });
          }
        } else {
          throw JSON.stringify({ type: "error", message: t("CORE_COMMON_PROFILE_ERROR_PASSWORD_NOT_MATCH") });
        }
      } else if (responseInfo?.status && responseInfo.status === "200") {
        showToast("success", t("CORE_COMMON_PROFILE_UPDATE_SUCCESS"), 5000);
      }
    } catch (error) {
      const errorObj = JSON.parse(error);
      showToast(errorObj.type, t(errorObj.message), 5000);
    }

    setLoading(false);
  };

  let menu = [];
  const { data: Menu } = Digit.Hooks.pt.useGenderMDMS(stateId, "common-masters", "GenderType");
  Menu &&
    Menu.map((genderDetails) => {
      menu.push({ i18nKey: `PT_COMMON_GENDER_${genderDetails.code}`, code: `${genderDetails.code}`, value: `${genderDetails.code}` });
    });

  const setFileStoreId = async (fileStoreId) => {
    setProfilePic(fileStoreId);

    const thumbnails = fileStoreId ? await getThumbnails([fileStoreId], stateId) : null;

    setProfileImg(thumbnails?.thumbs[0]);

    closeFileUploadDrawer();
  };

  function selectPermanentAddress(e) {
    setPermanentAddress(e.target.value);
  }

  function SelectState(e) {
    setSelectedState(e);
  }

  function SelectDistrict(e) {
    setSelectedDistrict(e);
  }

  function SelectPincode(e) {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 6) {
      setPinCode(value);
    }
  }

  function handleAddressSame(e) {
    const checked = e.target.checked;
    setIsAddressSame(checked);
  }

  function SelectCorrespondentState(e) {
    setSelectedCorrespondentState(e);
  }

  function SelectCorrespondentDistrict(e) {
    setSelectedCorrespondentDistrict(e);
  }

  function SelectPincodeCorrespondent(e) {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 6) {
      setPinCodeCorrespondent(value);
    }
  }




  const getThumbnails = async (ids, tenantId) => {
    const res = await Digit.UploadServices.Filefetch(ids, tenantId);
    if (res.data.fileStoreIds && res.data.fileStoreIds.length !== 0) {
      return {
        thumbs: res.data.fileStoreIds.map((o) => o.url.split(",")[3]),
        images: res.data.fileStoreIds.map((o) => Digit.Utils.getFileUrl(o.url)),
      };
    } else {
      return null;
    }
  };

  if (loading) return <Loader></Loader>;

  const containerStyles = {
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#F8FAFB",
    minHeight: "100vh",
    paddingTop: userType === "citizen" ? "16px" : "0",
  };

  const headerStyles = {
    padding: userType === "citizen" ? "16px" : "32px",
    marginBottom: userType === "citizen" ? "16px" : "32px",
  };

  const profileCardStyles = {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    overflow: "hidden",
    display: "flex",
    flexDirection: windowWidth < 768 || userType === "citizen" ? "column" : "row",
    margin: userType === "citizen" ? "16px" : "32px",
    marginTop: userType === "citizen" ? "16px" : "0",
  };

  const profilePhotoSectionStyles = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 32px",
    background: "linear-gradient(135deg, #4f65d8, #00157a)",
    flex: userType === "citizen" ? "1" : "0 0 280px",
    position: "relative",
  };

  const profileImageStyles = {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    border: "4px solid white",
    objectFit: "cover",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    backgroundColor: "#E5E7EB",
  };

  const cameraButtonStyles = {
    position: "absolute",
    bottom: "16px",
    right: "16px",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundColor: "white",
    border: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "all 0.3s ease",
    ":hover": {
      transform: "scale(1.1)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    },
  };

  const formSectionStyles = {
    flex: userType === "citizen" ? "1" : "1",
    padding: "40px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "0px",
  };

  const formGroupStyles = {
    display: "grid",
    gridTemplateColumns: windowWidth < 768 ? "1fr" : "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "20px",
  };
  
  const formGroupRow = {
    display: "grid",
    gridTemplateColumns: windowWidth < 768 ? "1fr" : "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "20px",
  };

  const labelStyles = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  };

  const mandatoryLabelStyles = {
    ...labelStyles,
    fontSize: "13px",
  };

  const mandatoryMarkerStyles = {
    color: "#EF4444",
    marginLeft: "4px",
  };

  const inputWrapperStyles = {
    position: "relative",
  };

  const sectionTitleStyles = {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1F2937",
    marginTop: "32px",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "2px solid #E5E7EB",
  };

  const buttonContainerStyles = {
    display: "flex",
    gap: "12px",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #E5E7EB",
    justifyContent: userType === "citizen" ? "flex-end" : "flex-end",
  };

  const saveButtonStyles = {
    padding: "12px 32px",
    backgroundColor: "#2563EB",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
    ":hover": {
      backgroundColor: "#1D4ED8",
      boxShadow: "0 4px 8px rgba(37, 99, 235, 0.3)",
    },
  };

  return (
    <div style={containerStyles}>
      <section style={headerStyles}>
        {userType === "citizen" ? (
          <BackButton></BackButton>
        ) : (
          <BreadCrumb
            crumbs={[
              {
                path: "/digit-ui/employee",
                content: t("ES_COMMON_HOME"),
                show: true,
              },
              {
                path: "/digit-ui/employee/user/profile",
                content: t("ES_COMMON_PAGE_1"),
                show: url.includes("/user/profile"),
              },
            ]}
          ></BreadCrumb>
        )}
      </section>

      <div style={profileCardStyles}>
        <section style={profilePhotoSectionStyles}>
          <div style={{ position: "relative", width: "140px", height: "140px" }}>
            <img
              style={profileImageStyles}
              src={!profileImg || profileImg === "" ? defaultImage : profileImg}
              alt="Profile"
            />
            <button 
              style={cameraButtonStyles}
              onClick={onClickAddPic}
              title="Change profile picture"
            >
              <CameraIcon />
            </button>
          </div>
          {userType === "citizen" && (
            <div style={{ color: "white", marginTop: "20px", textAlign: "center" }}>
              <p style={{ fontSize: "18px", fontWeight: "600", margin: "0" }}>{name || "User"}</p>
              <p style={{ fontSize: "13px", opacity: 0.9, margin: "4px 0 0 0" }}>{mobileNumber}</p>
            </div>
          )}
        </section>

        <section style={formSectionStyles}>
          {userType === "citizen" ? (
            <React.Fragment>
              <div style={formGroupRow}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <CardLabel style={editScreen ? { color: "#B1B4B6" } : {}}>{`${t("CORE_COMMON_PROFILE_NAME")}`}*</CardLabel>
                  <div style={{ width: "100%" }}>
                    <TextInput
                      t={t}
                      style={{ width: "100%" }}
                      type={"text"}
                      isMandatory={false}
                      name="name"
                      value={name}
                      onChange={(e)=>setUserName(e.target.value)}
                      {...(validation = {
                        isRequired: true,
                        pattern: "^[a-zA-Z ]*$",
                        type: "tel",
                        title: t("CORE_COMMON_PROFILE_NAME_ERROR_MESSAGE"),
                      })}
                      disable={editScreen || isUserArchitect}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <CardLabel style={editScreen ? { color: "#B1B4B6" } : {}}>{`${t("CORE_COMMON_PROFILE_GENDER")}`}</CardLabel>
                  <Dropdown
                    style={{ width: "100%" }}
                    className="form-field"
                    selected={gender?.length === 1 ? gender[0] : gender}
                    disable={gender?.length === 1 || editScreen}
                    option={menu}
                    select={setGenderName}
                    value={gender}
                    optionKey="code"
                    t={t}
                    name="gender"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <CardLabel style={editScreen ? { color: "#B1B4B6" } : {}}>{`${t("CORE_COMMON_PROFILE_DOB")}`}*</CardLabel>
                  <div style={{ width: "100%" }}>
                    <DatePicker date={dob || dateOfBirth} min="1900-01-01" onChange={setUserDOB} disable={true} max={new Date().toISOString().split("T")[0]} />                  
                  </div>
                </div>
              </div>

              <div style={formGroupRow}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <CardLabel style={editScreen ? { color: "#B1B4B6" } : {}}>{`${t("CORE_COMMON_PROFILE_EMAIL")}`}</CardLabel>
                  <div style={{ width: "100%" }}>
                    <TextInput
                      t={t}
                      style={{ width: "100%" }}
                      type={"email"}
                      isMandatory={false}
                      optionKey="i18nKey"
                      name="email"
                      value={email}
                      onChange={(e)=>setUserEmailAddress(e.target.value)}
                      disable={editScreen}
                    />
                  </div>
                </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                <CardLabel>{t("BPA_PERMANANT_ADDRESS_LABEL")}*</CardLabel>
                <TextArea
                  t={t}
                  isMandatory={false}
                  type={"text"}
                  optionKey="i18nKey"
                  name="PermanentAddress"
                  onChange={selectPermanentAddress}
                  value={PermanentAddress}
                  disable={editScreen}
                  style={{ minHeight: "80px" }}
                />
              </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <CardLabel>{t("BPA_STATE_TYPE")}*</CardLabel>
                  <div>
                    <Dropdown
                      t={t}
                      optionKey="state_name"
                      option={stateOptions}
                      selected={selectedState}
                      select={SelectState}
                      disable={editScreen}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <CardLabel>{t("BPA_DISTRICT_TYPE")}*</CardLabel>
                  <Dropdown
                    t={t}
                    optionKey="state_name"
                    // isMandatory={config.isMandatory}
                    option={stateOptions?.sort((a, b) => a.state_name.localeCompare(b.state_name)) || []}
                    selected={selectedState}
                    select={SelectState}
                    disable={editScreen}
                  />
                </div>
              </div>

              <div>
                {" "}
                <CardLabel>{t("BPA_DISTRICT_TYPE")}*</CardLabel>
                <Dropdown
                  t={t}
                  optionKey="district_name_english"
                  // isMandatory={config.isMandatory}
                  // option={districtList?.BPA?.Districts?.sort((a, b) => a.name.localeCompare(b.name)) || []}
                  option={uniqueDistricts?.sort((a, b) => a.district_name_english.localeCompare(b.district_name_english)) || []}
                  selected={selectedDistrict}
                  select={SelectDistrict}
                  disable={editScreen}
                />
              </div>

          

              <CardLabel>{t("BPA_APPLICANT_CORRESPONDENCE_ADDRESS_LABEL")}</CardLabel>
              <TextArea
                t={t}
                isMandatory={false}
                type={"text"}
                name="correspondenceAddress"
                value={isAddressSame ? PermanentAddress : correspondenceAddress}
                onChange={(e) => setCorrespondenceAddress(e.target.value)}
                disable={editScreen || isAddressSame}
              />

              <CardLabel>{t("BPA_STATE_TYPE")}*</CardLabel>
              <div>
                <Dropdown
                  t={t}
                  optionKey="state_name"
                  // isMandatory={config.isMandatory}
                  option={stateOptions?.sort((a, b) => a.state_name.localeCompare(b.state_name)) || []}
                  selected={isAddressSame ? selectedState : selectedCorrespondentState}
                  select={SelectCorrespondentState}
                  disable={editScreen || isAddressSame}
                // disable={!isCitizenEditable}
                />
              </div>

              <div>
                {" "}
                <CardLabel>{t("BPA_DISTRICT_TYPE")}*</CardLabel>
                <Dropdown
                  t={t}
                  optionKey="district_name_english"
                  // isMandatory={config.isMandatory}
                  // option={districtList?.BPA?.Districts?.sort((a, b) => a.name.localeCompare(b.name)) || []}
                  option={uniqueDistrictsCorrespondent?.sort((a, b) => a.district_name_english.localeCompare(b.district_name_english)) || []}
                  selected={isAddressSame ? selectedDistrict : selectedCorrespondentDistrict}
                  select={SelectCorrespondentDistrict}
                  disable={editScreen || isAddressSame}
                // disable={!isCitizenEditable}
                />
              </div>

              <button
                onClick={updateProfile}
                style={{
                  marginTop: "24px",
                  backgroundColor: "#2563EB",
                  width: isMobile ? "100%" : "auto",
                  padding: "12px 32px",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {t("CORE_COMMON_SAVE")}
              </button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div style={formGroupRow}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <CardLabel className="profile-label-margin" style={editScreen ? { color: "#B1B4B6" } : {}}>{`${t("CORE_COMMON_PROFILE_NAME")}`}*</CardLabel>
                  <div style={{width: "100%"}}>
                    <TextInput
                      t={t}
                      type={"text"}
                      isMandatory={false}
                      name="name"
                      value={name}
                      onChange={(e)=>setUserName(e.target.value)}
                      placeholder="Enter Your Name"
                      {...(validation = {
                        isRequired: true,
                        pattern: "^[a-zA-Z ]*$",
                        type: "text",
                        title: t("CORE_COMMON_PROFILE_NAME_ERROR_MESSAGE"),
                      })}
                      disable={editScreen}
                    />
                    {errors?.userName && <CardLabelError style={{margin: 0, padding: 0}}> {errors?.userName?.message} </CardLabelError>}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <CardLabel className="profile-label-margin" style={editScreen ? { color: "#B1B4B6" } : {}}>{`${t("CORE_COMMON_PROFILE_GENDER")}`}</CardLabel>
                  <Dropdown
                    style={{ width: "100%" }}
                    selected={gender?.length === 1 ? gender[0] : gender}
                    disable={gender?.length === 1 || editScreen}
                    option={menu}
                    select={setGenderName}
                    value={gender}
                    optionKey="code"
                    t={t}
                    name="gender"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <CardLabel className="profile-label-margin" style={editScreen ? { color: "#B1B4B6" } : {}}>{`${t("CORE_COMMON_PROFILE_CITY")}`}</CardLabel>
                  <div style={{width: "100%"}}>
                    <TextInput
                      t={t}
                      type={"text"}
                      isMandatory={false}
                      name="city"
                      value={t(city)}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      {...(validation = {
                        isRequired: true,
                        type: "text",
                        title: t("CORE_COMMON_PROFILE_CITY_ERROR_MESSAGE"),
                      })}
                      disable={true}
                    />
                  </div>
                </div>
              </div>

              <div style={formGroupRow}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <CardLabel className="profile-label-margin" style={{ }}>{`${t("CORE_COMMON_PROFILE_MOBILE_NUMBER")}`}*</CardLabel>
                  <div style={{ width: "100%" }}>
                    <MobileNumber
                      value={mobileNumber}
                      style={{ width: "100%" }}
                      name="mobileNumber"
                      placeholder="Enter Mobile No."
                      onChange={(value) => setUserMobileNumber(value)}
                      disable={true}
                      {...{ required: true, pattern: "[6-9]{1}[0-9]{9}", type: "tel", title: t("CORE_COMMON_PROFILE_MOBILE_NUMBER_INVALID") }}
                    />
                    {errors?.mobileNumber && <CardLabelError style={{margin: 0, padding: 0}}> {errors?.mobileNumber?.message} </CardLabelError>}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <CardLabel className="profile-label-margin" style={editScreen ? { color: "#B1B4B6" } : {}}>{`${t("CORE_COMMON_PROFILE_EMAIL")}`}</CardLabel>
                  <div style={{width: "100%"}}>
                    <TextInput
                      t={t}
                      type={"email"}
                      isMandatory={false}
                      placeholder="Enter Email"
                      optionKey="i18nKey"
                      name="email"
                      value={email}
                      onChange={(e)=>setUserEmailAddress(e.target.value)}
                      disable={editScreen}
                    />
                    {errors?.emailAddress && <CardLabelError style={{margin: 0, padding: 0}}> {errors?.emailAddress?.message} </CardLabelError>}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <CardLabel className="profile-label-margin" style={editScreen ? { color: "#B1B4B6" } : {}}>{`${t("CORE_COMMON_PROFILE_DOB")}`}</CardLabel>
                  <div style={{width: "100%"}}>
                    <DatePicker date={dob || dateOfBirth} onChange={setUserDOB} disable={true}  />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <button
                  onClick={TogleforPassword}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563EB",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    padding: "0",
                    textDecoration: "underline",
                    transition: "color 0.3s ease",
                  }}
                >
                  {t("CORE_COMMON_CHANGE_PASSWORD")}
                </button>

                {changepassword ? (
                  <div style={{ marginTop: "16px", padding: "16px", backgroundColor: "#F9FAFB", borderRadius: "8px" }}>
                    <div style={formGroupRow}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <CardLabel className="profile-label-margin" style={editScreen ? { color: "#B1B4B6" } : {}}>{`${t("CORE_COMMON_PROFILE_CURRENT_PASSWORD")}`}</CardLabel>
                        <div style={{width: "100%"}}>
                          <TextInput
                            t={t}
                            type={"password"}
                            isMandatory={false}
                            name="currentPassword"
                            pattern="^([a-zA-Z0-9@#$%])+$"
                            onChange={(e) => setUserCurrentPassword(e.target.value)}
                            disable={editScreen}
                          />
                          {errors?.currentPassword && <CardLabelError style={{margin: 0, padding: 0}}>{errors?.currentPassword?.message}</CardLabelError>}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <CardLabel className="profile-label-margin" style={editScreen ? { color: "#B1B4B6" } : {}}>{`${t("CORE_COMMON_PROFILE_NEW_PASSWORD")}`}</CardLabel>
                        <div style={{width: "100%"}}>
                          <TextInput
                            t={t}
                            type={"password"}
                            isMandatory={false}
                            name="newPassword"
                            pattern="^([a-zA-Z0-9@#$%])+$"
                            onChange={(e) => setUserNewPassword(e.target.value)}
                            disable={editScreen}
                          />
                          {errors?.newPassword && <CardLabelError style={{margin: 0, padding: 0}}>{errors?.newPassword?.message}</CardLabelError>}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <CardLabel className="profile-label-margin" style={editScreen ? { color: "#B1B4B6" } : {}}>{`${t("CORE_COMMON_PROFILE_CONFIRM_PASSWORD")}`}</CardLabel>
                        <div style={{width: "100%"}}>
                          <TextInput
                            t={t}
                            type={"password"}
                            isMandatory={false}
                            name="confirmPassword"
                            pattern="^([a-zA-Z0-9@#$%])+$"
                            onChange={(e) => setUserConfirmPassword(e.target.value)}
                            disable={editScreen}
                          />
                          {errors?.confirmPassword && <CardLabelError style={{margin: 0, padding: 0}}>{errors?.confirmPassword?.message}</CardLabelError>}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </React.Fragment>
          )}
        </section>
      </div>

      {userType === "employee" ? (
        <div
          style={{
            padding: "24px 32px",
            backgroundColor: "white",
            display: "flex",
            justifyContent: "flex-end",
            margin: "32px",
            marginTop: "32px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <button
            onClick={updateProfile}
            style={{
              padding: "12px 32px",
              backgroundColor: "#2563EB",
              width: windowWidth < 768 ? "100%" : "auto",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {t("CORE_COMMON_SAVE")}
          </button>
        </div>
      ) : (
        ""
      )}
      {toast && (
        <Toast
          error={toast.key === "error"}
          label={t(toast.key === "success" ? `CORE_COMMON_PROFILE_UPDATE_SUCCESS` : toast.action)}
          onClose={() => setToast(null)}
          style={{ maxWidth: "670px" }}
        />
      )}

      {openUploadSlide === true ? (
        <UploadDrawer
          setProfilePic={setFileStoreId}
          closeDrawer={closeFileUploadDrawer}
          userType={userType}
          removeProfilePic={removeProfilePic}
          showToast={showToast}
        />
      ) : null}
    </div>
  );
};

export default UserProfile;