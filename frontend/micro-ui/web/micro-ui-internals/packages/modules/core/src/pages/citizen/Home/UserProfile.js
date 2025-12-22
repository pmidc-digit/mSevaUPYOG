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

const defaultImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

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

  return (
    <div className="user-profile">
      <section style={{ margin: userType === "citizen" ? "8px" : "24px",position:"relative" }}>
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
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: windowWidth < 768 || userType === "citizen" ? "column" : "row",
          margin: userType === "citizen" ? "8px" : "16px",
          gap: userType === "citizen" ? "" : "0 24px",
          boxShadow: userType === "citizen" ? "1px 1px 4px 0px rgba(0,0,0,0.2)" : "",
          background: userType === "citizen" ? "white" : "",
          borderRadius: userType === "citizen" ? "4px" : "",
          maxWidth: userType === "citizen" ? "960px" : "",
        }}
      >
        <section
          style={{
            position: "relative",
            display: "flex",
            flex: userType === "citizen" ? 1 : 2.5,
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "100%",
            height: "320px",
            borderRadius: "4px",
            boxShadow: userType === "citizen" ? "" : "1px 1px 4px 0px rgba(0,0,0,0.2)",
            border: `${userType === "citizen" ? "8px" : "24px"} solid #fff`,
            background: "#EEEEEE",
            padding: userType === "citizen" ? "8px" : "16px",
          }}
        >
          <div
            style={{
              position: "relative",
              height: userType === "citizen" ? "114px" : "150px",
              width: userType === "citizen" ? "114px" : "150px",
              margin: "16px",
            }}
          >
            <img
              style={{
                margin: "auto",
                borderRadius: "300px",
                justifyContent: "center",
                height: "100%",
                width: "100%",
              }}
              src={!profileImg || profileImg === "" ? defaultImage : profileImg}
            />
            <button style={{ position: "absolute", left: "50%", bottom: "-24px", transform: "translateX(-50%)" }} onClick={onClickAddPic}>
              <CameraIcon />
            </button>
          </div>
        </section>
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            flex: userType === "citizen" ? 1 : 7.5,
            width: "100%",
            borderRadius: "4px",
            height: "fit-content",
            boxShadow: userType === "citizen" ? "" : "1px 1px 4px 0px rgba(0,0,0,0.2)",
            background: "white",
            padding: userType === "citizen" ? "8px" : "24px",
            paddingBottom : "20px",
          }}
        >
          {userType === "citizen" ? (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel style={editScreen ? { color: "#B1B4B6" } : {}}>{`${t("CORE_COMMON_PROFILE_NAME")}`}*</CardLabel>
                <div style={{ width: "100%", maxWidth:"960px" }}>
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
              </LabelFieldPair>

              <LabelFieldPair>
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
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel style={editScreen ? { color: "#B1B4B6" } : {}}>{`${t("CORE_COMMON_PROFILE_DOB")}`}*</CardLabel>
                <div style={{ width: "100%", maxWidth:"960px" }}>
                <DatePicker date={dob || dateOfBirth} min="1900-01-01" onChange={setUserDOB} disable={true} max={new Date().toISOString().split("T")[0]} />                  
                </div>
              </LabelFieldPair>
               <LabelFieldPair>
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
              </LabelFieldPair> 

              <LabelFieldPair>
                <CardLabel>{`${t("BPA_PERMANANT_ADDRESS_LABEL")}*`}</CardLabel>
                <TextArea
                  t={t}
                  isMandatory={false}
                  type={"text"}
                  optionKey="i18nKey"
                  name="PermanentAddress"
                  onChange={selectPermanentAddress}
                  value={PermanentAddress}
                  disable={editScreen}
                />
              </LabelFieldPair> 

              <LabelFieldPair>
                <CardLabel>{t("BPA_STATE_TYPE")}*</CardLabel>
                <div>
                  <Dropdown
                    t={t}
                    optionKey="state_name"
                    // isMandatory={config.isMandatory}
                    option={stateOptions?.sort((a, b) => a.state_name.localeCompare(b.state_name)) || []}
                    selected={selectedState}
                    select={SelectState}
                    disable={editScreen}
                  // disable={!isCitizenEditable}
                  />
                </div>
              </LabelFieldPair>

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
                // disable={!isCitizenEditable}
                />
              </div>
              
              <div>
                <CardLabel>{t("BPA_DETAILS_PIN_LABEL")}*</CardLabel>
                <TextInput
                  t={t}
                  type={"text"}
                  isMandatory={false}
                  optionKey="i18nKey"
                  name="Pcode"
                  minLength="6"
                  value={pinCode}
                  onChange={SelectPincode}
                  // disable={name && !isOpenLinkFlow ? true : false}
                  disable={editScreen}
                  {...(validation = {
                    isRequired: true,
                    pattern: "^[0-9]{6}$",
                    type: "number",
                    title: t("BPA_PINCODE_ERROR_MESSAGE"),
                  })}
                />
              </div>

              <CheckBox
                label={t("BPA_SAME_AS_PERMANENT_ADDRESS")}
                onChange={handleAddressSame}
                checked={isAddressSame}
                style={{ paddingBottom: "10px", paddingTop: "10px" }}
                disable={editScreen}
              />

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

              <CardLabel>{t("BPA_DETAILS_PIN_LABEL")}*</CardLabel>
              <TextInput
                t={t}
                type={"text"}
                isMandatory={false}
                optionKey="i18nKey"
                name="Pcode"
                minLength="6"
                value={isAddressSame ? pinCode : pinCodeCorrespondent}
                onChange={SelectPincodeCorrespondent}
                // disable={name && !isOpenLinkFlow ? true : false}
                disable={editScreen || isAddressSame}
                {...(validation = {
                  isRequired: true,
                  pattern: "^[0-9]{6}$",
                  type: "number",
                  title: t("BPA_PINCODE_ERROR_MESSAGE"),
                })}
              />


              <button
                onClick={updateProfile}
                style={{
                  marginTop: "24px",
                  backgroundColor: "#1359C8",
                  width: "100%",
                  height: "40px",
                  color: "white",
                  
                  maxWidth : isMobile? "100%":"240px",
                  borderBottom: "1px solid black",
                }}
              >
                {t("CORE_COMMON_SAVE")}
              </button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <LabelFieldPair style={{ display: "flex" }}>
                <CardLabel className="profile-label-margin" style={editScreen ? { color: "#B1B4B6", width: "300px" } : { width: "300px" }}>
                  {`${t("CORE_COMMON_PROFILE_NAME")}`}*
                </CardLabel>
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
              </LabelFieldPair>

              <LabelFieldPair style={{ display: "flex" }}>
                <CardLabel className="profile-label-margin" style={editScreen ? { color: "#B1B4B6", width: "300px" } : { width: "300px" }}>{`${t(
                  "CORE_COMMON_PROFILE_GENDER"
                )}`}</CardLabel>
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
              </LabelFieldPair>

              <LabelFieldPair style={{ display: "flex" }}>
                <CardLabel className="profile-label-margin" style={editScreen ? { color: "#B1B4B6", width: "300px" } : { width: "300px" }}>{`${t(
                  "CORE_COMMON_PROFILE_CITY"
                )}`}</CardLabel>
                <div style={{width: "100%"}}>
                  <TextInput
                    t={t}
                    type={"text"}
                    isMandatory={false}
                    name="city"
                    value={t(city)}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter Your City Name"
                    {...(validation = {
                      isRequired: true,
                      // pattern: "^[a-zA-Z ]*$",
                      type: "text",
                      title: t("CORE_COMMON_PROFILE_CITY_ERROR_MESSAGE"),
                    })}
                    disable={true}
                  />
                  <CardLabelError></CardLabelError>
                </div>
              </LabelFieldPair>
              
              <LabelFieldPair style={{ display: "flex" }}>
                <CardLabel className="profile-label-margin" style={{ width: "300px" }}>{`${t("CORE_COMMON_PROFILE_MOBILE_NUMBER")}*`}</CardLabel>
                <div style={{ width: "100%" }}>
                  <MobileNumber
                    value={mobileNumber}
                    style={{ width: "100%" }}
                    name="mobileNumber"
                    placeholder="Enter a valid Mobile No."
                    onChange={(value) => setUserMobileNumber(value)}
                    disable={true}
                    {...{ required: true, pattern: "[6-9]{1}[0-9]{9}", type: "tel", title: t("CORE_COMMON_PROFILE_MOBILE_NUMBER_INVALID") }}
                  />
                  {errors?.mobileNumber && <CardLabelError style={{margin: 0, padding: 0}}> {errors?.mobileNumber?.message} </CardLabelError>}
                </div>
              </LabelFieldPair>
              
               <LabelFieldPair style={{ display: "flex" }}>
                <CardLabel className="profile-label-margin" style={editScreen ? { color: "#B1B4B6", width: "300px" } : { width: "300px" }}>{`${t(
                  "CORE_COMMON_PROFILE_EMAIL"
                )}`}</CardLabel>
                <div style={{width: "100%"}}>
                  <TextInput
                    t={t}
                    type={"email"}
                    isMandatory={false}
                    placeholder="Enter a valid Email"
                    optionKey="i18nKey"
                    name="email"
                    value={email}
                    onChange={(e)=>setUserEmailAddress(e.target.value)}
                    disable={editScreen}
                  />
                  {errors?.emailAddress && <CardLabelError> {errors?.emailAddress?.message} </CardLabelError>}
                </div>
              </LabelFieldPair>
              <LabelFieldPair style={{ display: "flex" }}>
                <CardLabel className="profile-label-margin" style={editScreen ? { color: "#B1B4B6", width: "300px" } : { width: "300px" }}>{`${t(
                  "CORE_COMMON_PROFILE_DOB"
                )}`}</CardLabel>
                <div style={{width: "100%"}}>
                <DatePicker date={dob || dateOfBirth} onChange={setUserDOB} disable={true}  />
                 {/* {errors?.emailAddress && <CardLabelError> {errors?.emailAddress?.message} </CardLabelError>} */}
                </div>
              </LabelFieldPair>             

              <LabelFieldPair>
                <div>
                  <a style={{ color: "#a82227", cursor: "default", marginBottom: "5", cursor: "pointer",position:"relative" }} onClick={TogleforPassword}>
                    {t("CORE_COMMON_CHANGE_PASSWORD")}
                  </a>
                  {changepassword ? (
                    <div style={{ marginTop: "10px" }}>
                      <LabelFieldPair style={{ display: "flex" }}>
                        <CardLabel  className="profile-label-margin" style={editScreen ? { color: "#B1B4B6", width: "300px" } : { width: "300px" }}>{`${t(
                          "CORE_COMMON_PROFILE_CURRENT_PASSWORD"
                        )}`}</CardLabel>
                        <div style={{width: "100%"}}>
                          <TextInput
                            t={t}
                            type={"password"}
                            isMandatory={false}
                            name="name"
                            pattern="^([a-zA-Z0-9@#$%])+$"
                            onChange={(e) => setUserCurrentPassword(e.target.value)}
                            disable={editScreen}
                          />
                          {errors?.currentPassword && <CardLabelError>{errors?.currentPassword?.message}</CardLabelError>}
                        </div>
                      </LabelFieldPair>

                      <LabelFieldPair style={{ display: "flex" }}>
                        <CardLabel  className="profile-label-margin" style={editScreen ? { color: "#B1B4B6", width: "300px" } : { width: "300px" }}>{`${t(
                          "CORE_COMMON_PROFILE_NEW_PASSWORD"
                        )}`}</CardLabel>
                        <div style={{width: "100%"}}>
                          <TextInput
                            t={t}
                            type={"password"}
                            isMandatory={false}
                            name="name"
                            pattern="^([a-zA-Z0-9@#$%])+$"
                            onChange={(e) => setUserNewPassword(e.target.value)}
                            disable={editScreen}
                          />
                          {errors?.newPassword && <CardLabelError>{errors?.newPassword?.message}</CardLabelError>}
                      </div>
                      </LabelFieldPair>

                      <LabelFieldPair style={{ display: "flex" }}>
                        <CardLabel  className="profile-label-margin" style={editScreen ? { color: "#B1B4B6", width: "300px" } : { width: "300px" }}>{`${t(
                          "CORE_COMMON_PROFILE_CONFIRM_PASSWORD"
                        )}`}</CardLabel>
                        <div style={{width: "100%"}}>
                          <TextInput
                            t={t}
                            type={"password"}
                            isMandatory={false}
                            name="name"
                            pattern="^([a-zA-Z0-9@#$%])+$"
                            onChange={(e) => setUserConfirmPassword(e.target.value)}
                            disable={editScreen}
                          />
                          {errors?.confirmPassword && <CardLabelError>{errors?.confirmPassword?.message}</CardLabelError>}
                        </div>
                      </LabelFieldPair>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </LabelFieldPair>
            </React.Fragment>
          )}
        </section>
      </div>

      {userType === "employee" ? (
        <div
          style={{ height: "88px", backgroundColor: "#FFFFFF", display: "flex", justifyContent: "flex-end", marginTop: "64px", alignItems: "center" }}
        >
          <button
            onClick={updateProfile}
            style={{
              marginTop: "24px",
              backgroundColor: "#a82227",
              width: windowWidth < 768 ? "100%" : "248px",
              height: "40px",
              float: "right",
              margin: windowWidth < 768 ? "0 16px" : "",
              marginRight: windowWidth < 768 ? "16px" : "31px",
              color: "white",
              borderBottom: "1px solid black",
              cursor:"pointer",
              "zIndex":"999"

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

      {openUploadSlide == true ? (
        <UploadDrawer
          setProfilePic={setFileStoreId}
          closeDrawer={closeFileUploadDrawer}
          userType={userType}
          removeProfilePic={removeProfilePic}
          showToast={showToast}
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default UserProfile;