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
  CheckBox,
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import UploadDrawer from "./ImageUpload/UploadDrawer";
import { subYears, format, differenceInYears } from "date-fns";

const defaultImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const UserProfile = ({ stateCode, userType, cityDetails }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const url = window.location.href;
  const location = useLocation();
  const stateId = Digit.ULBService.getStateId();
  const tenant = Digit.ULBService.getCurrentTenantId();
  const userInfo = Digit.UserService.getUser()?.info || {};
  const [userDetails, setUserDetails] = useState(null);
  const [name, setName] = useState(userInfo?.name ? userInfo?.name : "");
  const dateOfBirth = userDetails?.dob;
  console.log("ddd", dateOfBirth);
  const formattedDob = dateOfBirth !== undefined ? format(new Date(dateOfBirth), "MM/dd/yyyy") : "";
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
  const [PermanentAddress, setPermanentAddress] = useState();
  const [selectedState, setSelectedState] = useState();
  const [selectedDistrict, setSelectedDistrict] = useState();
  const [pinCode, setPinCode] = useState();
  const [isAddressSame, setIsAddressSame] = useState();
  const [correspondenceAddress, setCorrespondenceAddress] = useState();
  const [selectedCorrespondentState, setSelectedCorrespondentState] = useState();
  const [selectedCorrespondentDistrict, setSelectedCorrespondentDistrict] = useState();
  const [pinCodeCorrespondent, setPinCodeCorrespondent] = useState();
  const isUserArchitect = window.location.href.includes("citizen") && userInfo?.roles?.some((role) => role.code.includes("BPA_ARCHITECT"));

  const getUserInfo = async () => {
    const uuid = userInfo?.uuid;
    if (uuid) {
      const selectedTenantId = window.location.href.includes("citizen") ? stateId : tenant;
      setLoading(true);
      const usersResponse = await Digit.UserService.userSearch(selectedTenantId, { uuid: [uuid] }, {});
      usersResponse && usersResponse.user && usersResponse.user.length && setUserDetails(usersResponse.user[0]);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener("resize", () => setWindowWidth(window.innerWidth));
    return () => {
      window.removeEventListener("resize", () => setWindowWidth(window.innerWidth));
    };
  });

  const { data: districtList, isLoading } = Digit.Hooks.useCustomMDMS(stateId, "common-masters", [{ name: "DistrictMaster" }]);
  const uniqueDistricts = useMemo(() => {
    if (isLoading || !districtList?.["common-masters"]?.DistrictMaster?.length) return [];

    return districtList?.["common-masters"]?.DistrictMaster?.filter((district) => district.state_code === selectedState?.state_code);
  }, [isLoading, districtList, selectedState]);

  // const { data: districtListCorrespondent, isLoading: isLoadingCorrespondent} = Digit.Hooks.useCustomMDMS(stateId, "common-masters", [{ name: "DistrictMaster"}], );
  const uniqueDistrictsCorrespondent = useMemo(() => {
    if (isLoading || !districtList?.["common-masters"]?.DistrictMaster?.length) return [];

    return districtList?.["common-masters"]?.DistrictMaster?.filter((district) => district.state_code === selectedCorrespondentState?.state_code);
  }, [isLoading, districtList, selectedCorrespondentState]);

  const { data: StateData, isLoading: isStateLoading } = Digit.Hooks.useCustomMDMS(stateId, "common-masters", [{ name: "StateMaster" }]);
  const stateOptions = useMemo(() => {
    if (StateData?.["common-masters"]?.StateMaster?.length > 0) {
      return StateData?.["common-masters"].StateMaster;
    } else {
      return [];
    }
  }, [StateData, isStateLoading]);

  console.log("uniqueDistricts", uniqueDistrictsCorrespondent, selectedCorrespondentState);

  useEffect(() => {
    if (typeof selectedState === "string" && stateOptions?.length > 0) {
      const state = stateOptions.find((state) => state.state_name === selectedState);
      console.log("stateData", stateOptions, state, selectedState);
      setSelectedState(state);
    }
    // refetchDistricts();
  }, [selectedState, stateOptions]);
  useEffect(() => {
    if (typeof selectedCorrespondentState === "string" && stateOptions?.length > 0) {
      const state = stateOptions.find((state) => state.state_name === selectedCorrespondentState);
      setSelectedCorrespondentState(state);
    }
    // refetchDistrictsCor()
  }, [selectedCorrespondentState, stateOptions]);
  useEffect(() => {
    if (typeof selectedCorrespondentDistrict === "string" && uniqueDistrictsCorrespondent?.length > 0) {
      const state = uniqueDistrictsCorrespondent.find((state) => state.district_name_english === selectedCorrespondentDistrict);
      setSelectedCorrespondentDistrict(state);
    }
  }, [selectedCorrespondentDistrict, uniqueDistrictsCorrespondent]);
  useEffect(() => {
    if (typeof selectedDistrict === "string" && uniqueDistricts?.length > 0) {
      const state = uniqueDistricts.find((state) => state.district_name_english === selectedDistrict);
      setSelectedDistrict(state);
    }
  }, [selectedDistrict, uniqueDistricts]);

  useEffect(() => {
    setLoading(true);

    getUserInfo();

    setGender({
      i18nKey: undefined,
      code: userDetails?.gender,
      value: userDetails?.gender,
    });
    setDob(userDetails?.dob);
    setPermanentAddress(userDetails?.permanentAddress);
    setSelectedDistrict(userDetails?.permanentDistrict);
    setPinCode(userDetails?.permanentPinCode);
    setPinCodeCorrespondent(userDetails?.correspondencePinCode);
    setSelectedCorrespondentDistrict(userDetails?.correspondenceDistrict);
    setCorrespondenceAddress(userDetails?.correspondenceAddress);
    setSelectedCorrespondentState(userDetails?.correspondenceState);
    setSelectedState(userDetails?.permanentState || "Punjab");

    if (userDetails?.isAddressSame) {
      setIsAddressSame(userDetails?.isAddressSame);
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

  const setUserDOB = (value) => {
    setDob(value);
  };
  const closeFileUploadDrawer = () => setOpenUploadSide(false);

  const setUserName = (value) => {
    setName(value);

    if (!new RegExp(/^[a-zA-Z ]+$/i).test(value) || value.length === 0 || value.length > 50) {
      setErrors({ ...errors, userName: { type: "pattern", message: t("CORE_COMMON_PROFILE_NAME_INVALID") } });
    } else {
      setErrors({ ...errors, userName: null });
    }
  };

  const setUserEmailAddress = (value) => {
    setEmail(value);
    if (value.length && /*!(value.includes("@") && value.includes("."))*/ !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
      setErrors({ ...errors, emailAddress: { type: "pattern", message: t("CORE_COMMON_PROFILE_EMAIL_INVALID") } });
    } else {
      setErrors({ ...errors, emailAddress: null });
    }
  };

  const setUserMobileNumber = (value) => {
    setMobileNo(value);

    if (userType === "employee" && !new RegExp(/^[6-9]{1}[0-9]{9}$/).test(value)) {
      setErrors({ ...errors, mobileNumber: { type: "pattern", message: t("CORE_COMMON_PROFILE_MOBILE_NUMBER_INVALID") } });
    } else {
      setErrors({ ...errors, mobileNumber: null });
    }
  };

  const setUserCurrentPassword = (value) => {
    setCurrentPassword(value);

    if (!new RegExp(/^([a-zA-Z0-9@#$%]{8,15})$/i).test(value)) {
      setErrors({ ...errors, currentPassword: { type: "pattern", message: t("CORE_COMMON_PROFILE_PASSWORD_INVALID") } });
    } else {
      setErrors({ ...errors, currentPassword: null });
    }
  };

  const setUserNewPassword = (value) => {
    setNewPassword(value);

    if (!new RegExp(/^([a-zA-Z0-9@#$%]{8,15})$/i).test(value)) {
      setErrors({ ...errors, newPassword: { type: "pattern", message: t("CORE_COMMON_PROFILE_PASSWORD_INVALID") } });
    } else {
      setErrors({ ...errors, newPassword: null });
    }
  };

  const setUserConfirmPassword = (value) => {
    setConfirmPassword(value);

    if (!new RegExp(/^([a-zA-Z0-9@#$%]{8,15})$/i).test(value)) {
      setErrors({ ...errors, confirmPassword: { type: "pattern", message: t("CORE_COMMON_PROFILE_PASSWORD_INVALID") } });
    } else {
      setErrors({ ...errors, confirmPassword: null });
    }
  };

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
        dob: dob !== undefined ? dob.split("-").reverse().join("/") : "",
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
        isAddressSame: isAddressSame,
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
          console.log("requestData.dob", requestData.dob);
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

      if (email?.length && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
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
      requestData["locale"] = Digit.StoreData.getCurrentLanguage();
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
              photo: profileImg,
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
        if (location?.state?.from.includes("/engagement/surveys")) {
          history.push({
            pathname: location.state.from,
            state: {
              surveyDetails: location.state.surveyDetails,
              userInfo: location.state.userInfo,
              userType: location.state.userType,
            },
          });
        }
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

  console.log("stateOptions", stateOptions);

  return (
    <div className="user-profile">
      <section className={`user-profile-section-wrapper ${userType === "employee" ? "employee" : ""}`}>
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
      <div className={`user-profile-main-container ${userType === "employee" ? "employee" : ""}`}>
        <section className={`user-profile-image-section ${userType === "employee" ? "employee" : ""}`}>
          <div className="user-profile-image-wrapper">
            <img className="user-profile-image" src={!profileImg || profileImg === "" ? defaultImage : profileImg} />
            <button
              className="selector-button-secondary"
              style={{ width: isMobile ? "100%" : "56px", height: "56px", marginTop: "-20px" }}
              onClick={onClickAddPic}
            >
              <CameraIcon />
            </button>
          </div>
        </section>
        <section className="user-profile-form-section">
          {userType === "citizen" ? (
            <React.Fragment>
              <div className="user-profile-form-grid">
                <div className="user-profile-field-wrapper">
                  <CardLabel className="user-profile-label">{`${t("CORE_COMMON_PROFILE_NAME")}`}*</CardLabel>
                  <TextInput
                    t={t}
                    type={"text"}
                    isMandatory={false}
                    name="name"
                    value={name}
                    onChange={(e) => setUserName(e.target.value)}
                    {...(validation = {
                      isRequired: true,
                      pattern: "^[a-zA-Z ]*$",
                      type: "tel",
                      title: t("CORE_COMMON_PROFILE_NAME_ERROR_MESSAGE"),
                    })}
                    disable={editScreen || isUserArchitect}
                  />
                </div>

                <div className="user-profile-field-wrapper">
                  <CardLabel className="user-profile-label">{`${t("CORE_COMMON_PROFILE_GENDER")}`}</CardLabel>
                  <Dropdown
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

                <div className="user-profile-field-wrapper">
                  <CardLabel className="user-profile-label">{`${t("CORE_COMMON_PROFILE_DOB")}`}*</CardLabel>
                  <DatePicker
                    date={dob || dateOfBirth}
                    min="1900-01-01"
                    onChange={setUserDOB}
                    disable={true}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="user-profile-field-wrapper">
                  <CardLabel className="user-profile-label">{`${t("CORE_COMMON_PROFILE_EMAIL")}`}*</CardLabel>
                  <TextInput
                    t={t}
                    type={"email"}
                    isMandatory={false}
                    optionKey="i18nKey"
                    name="email"
                    value={email}
                    onChange={(e) => setUserEmailAddress(e.target.value)}
                    disable={editScreen}
                  />
                </div>
              </div>

              <div className="user-profile-form-grid">
                <div className="user-profile-field-wrapper">
                  <CardLabel className="user-profile-label">{`${t("BPA_PERMANANT_ADDRESS_LABEL")}*`}</CardLabel>
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
                </div>

                <div className="user-profile-field-wrapper">
                  <CardLabel className="user-profile-label">{t("BPA_DETAILS_PIN_LABEL")}*</CardLabel>
                  <TextInput
                    t={t}
                    className="user-profile-input"
                    type={"text"}
                    isMandatory={false}
                    optionKey="i18nKey"
                    name="Pcode"
                    minLength="6"
                    value={pinCode}
                    onChange={SelectPincode}
                    disable={editScreen}
                    {...(validation = {
                      isRequired: true,
                      pattern: "^[0-9]{6}$",
                      type: "number",
                      title: t("BPA_PINCODE_ERROR_MESSAGE"),
                    })}
                  />
                </div>
              </div>

              <div className="user-profile-form-grid">
                <div className="user-profile-field-wrapper">
                  <CardLabel className="user-profile-label">{t("BPA_STATE_TYPE")}*</CardLabel>
                  <Dropdown
                    t={t}
                    optionKey="state_name"
                    option={stateOptions?.sort((a, b) => a.state_name.localeCompare(b.state_name)) || []}
                    selected={selectedState}
                    select={SelectState}
                    disable={true}
                  />
                </div>

                <div className="user-profile-field-wrapper">
                  <CardLabel className="user-profile-label">{t("BPA_DISTRICT_TYPE")}*</CardLabel>
                  <Dropdown
                    t={t}
                    optionKey="district_name_english"
                    option={uniqueDistricts?.sort((a, b) => a.district_name_english.localeCompare(b.district_name_english)) || []}
                    selected={selectedDistrict}
                    select={SelectDistrict}
                    disable={editScreen}
                  />
                </div>
              </div>

              <div className="user-profile-field-wrapper">
                <CheckBox label={t("BPA_SAME_AS_PERMANENT_ADDRESS")} onChange={handleAddressSame} checked={isAddressSame} disable={editScreen} />
              </div>

              <div className="user-profile-form-grid">
                <div className="user-profile-field-wrapper">
                  <CardLabel className="user-profile-label">{t("BPA_APPLICANT_CORRESPONDENCE_ADDRESS_LABEL")}</CardLabel>
                  <TextArea
                    t={t}
                    isMandatory={false}
                    type={"text"}
                    name="correspondenceAddress"
                    value={isAddressSame ? PermanentAddress : correspondenceAddress}
                    onChange={(e) => setCorrespondenceAddress(e.target.value)}
                    disable={editScreen || isAddressSame}
                  />
                </div>

                <div className="user-profile-field-wrapper">
                  <CardLabel className="user-profile-label">{t("BPA_DETAILS_PIN_LABEL")}*</CardLabel>
                  <TextInput
                    t={t}
                    type={"text"}
                    isMandatory={false}
                    optionKey="i18nKey"
                    name="PincodeCorrespondent"
                    minLength="6"
                    value={isAddressSame ? pinCode : pinCodeCorrespondent}
                    onChange={SelectPincodeCorrespondent}
                    disable={editScreen || isAddressSame}
                    {...(validation = {
                      isRequired: true,
                      pattern: "^[0-9]{6}$",
                      type: "number",
                      title: t("BPA_PINCODE_ERROR_MESSAGE"),
                    })}
                  />
                </div>
              </div>

              <div className="user-profile-form-grid">
                <div className="user-profile-field-wrapper">
                  <CardLabel className="user-profile-label">{t("BPA_STATE_TYPE")}*</CardLabel>
                  <Dropdown
                    t={t}
                    optionKey="state_name"
                    option={stateOptions?.sort((a, b) => a.state_name.localeCompare(b.state_name)) || []}
                    selected={isAddressSame ? selectedState : selectedCorrespondentState}
                    select={SelectCorrespondentState}
                    disable={editScreen || isAddressSame}
                  />
                </div>

                <div className="user-profile-field-wrapper">
                  <CardLabel className="user-profile-label">{t("BPA_DISTRICT_TYPE")}*</CardLabel>
                  <Dropdown
                    t={t}
                    optionKey="district_name_english"
                    option={uniqueDistrictsCorrespondent?.sort((a, b) => a.district_name_english.localeCompare(b.district_name_english)) || []}
                    selected={isAddressSame ? selectedDistrict : selectedCorrespondentDistrict}
                    select={SelectCorrespondentDistrict}
                    disable={editScreen || isAddressSame}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <button onClick={updateProfile} className="selector-button-primary" style={{ width: "100%", height: "46px", marginTop: "24px" }}>
                  {t("CORE_COMMON_SAVE")}
                </button>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <LabelFieldPair className="user-profile-label-field-pair-flex">
                <CardLabel className="profile-label-margin user-profile-label-style-employee">{`${t("CORE_COMMON_PROFILE_NAME")}`}*</CardLabel>
                <div className="user-profile-full-width">
                  <TextInput
                    t={t}
                    type={"text"}
                    isMandatory={false}
                    name="name"
                    value={name}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter Your Name"
                    {...(validation = {
                      isRequired: true,
                      pattern: "^[a-zA-Z ]*$",
                      type: "text",
                      title: t("CORE_COMMON_PROFILE_NAME_ERROR_MESSAGE"),
                    })}
                    disable={editScreen}
                  />
                  {errors?.userName && <CardLabelError className="user-profile-error-text"> {errors?.userName?.message} </CardLabelError>}
                </div>
              </LabelFieldPair>

              <LabelFieldPair className="user-profile-label-field-pair-flex">
                <CardLabel className="profile-label-margin user-profile-label-style-employee">{`${t("CORE_COMMON_PROFILE_GENDER")}`}</CardLabel>
                <Dropdown
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

              <LabelFieldPair className="user-profile-label-field-pair-flex">
                <CardLabel className="profile-label-margin user-profile-label-style-employee">{`${t("CORE_COMMON_PROFILE_CITY")}`}</CardLabel>
                <div className="user-profile-full-width">
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

              <LabelFieldPair className="user-profile-label-field-pair-flex">
                <CardLabel className="profile-label-margin user-profile-label-style-employee">{`${t(
                  "CORE_COMMON_PROFILE_MOBILE_NUMBER"
                )}*`}</CardLabel>
                <div className="user-profile-full-width">
                  <MobileNumber
                    value={mobileNumber}
                    name="mobileNumber"
                    placeholder="Enter a valid Mobile No."
                    onChange={(value) => setUserMobileNumber(value)}
                    disable={true}
                    {...{ required: true, pattern: "[6-9]{1}[0-9]{9}", type: "tel", title: t("CORE_COMMON_PROFILE_MOBILE_NUMBER_INVALID") }}
                  />
                  {errors?.mobileNumber && <CardLabelError className="user-profile-error-text"> {errors?.mobileNumber?.message} </CardLabelError>}
                </div>
              </LabelFieldPair>

              <LabelFieldPair className="user-profile-label-field-pair-flex">
                <CardLabel className="profile-label-margin user-profile-label-style-employee">{`${t("CORE_COMMON_PROFILE_EMAIL")}`}</CardLabel>
                <div className="user-profile-full-width">
                  <TextInput
                    t={t}
                    type={"email"}
                    isMandatory={false}
                    placeholder="Enter a valid Email"
                    optionKey="i18nKey"
                    name="email"
                    value={email}
                    onChange={(e) => setUserEmailAddress(e.target.value)}
                    disable={editScreen}
                  />
                  {errors?.emailAddress && <CardLabelError> {errors?.emailAddress?.message} </CardLabelError>}
                </div>
              </LabelFieldPair>
              <LabelFieldPair className="user-profile-label-field-pair-flex">
                <CardLabel className="profile-label-margin user-profile-label-style-employee">{`${t("CORE_COMMON_PROFILE_DOB")}`}</CardLabel>
                <div>
                  <DatePicker date={dob || dateOfBirth} onChange={setUserDOB} disable={true} />
                  {/* {errors?.emailAddress && <CardLabelError> {errors?.emailAddress?.message} </CardLabelError>} */}
                </div>
              </LabelFieldPair>

              <LabelFieldPair>
                <div>
                  <a className="user-profile-change-password-link" onClick={TogleforPassword}>
                    {t("CORE_COMMON_CHANGE_PASSWORD")}
                  </a>
                  {changepassword ? (
                    <div className="user-profile-div-margin">
                      <LabelFieldPair className="user-profile-label-field-pair-flex">
                        <CardLabel className="profile-label-margin user-profile-label-style-employee">{`${t(
                          "CORE_COMMON_PROFILE_CURRENT_PASSWORD"
                        )}`}</CardLabel>
                        <div className="user-profile-full-width">
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

                      <LabelFieldPair className="user-profile-label-field-pair-flex">
                        <CardLabel className="profile-label-margin user-profile-label-style-employee">{`${t(
                          "CORE_COMMON_PROFILE_NEW_PASSWORD"
                        )}`}</CardLabel>
                        <div className="user-profile-full-width">
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

                      <LabelFieldPair className="user-profile-label-field-pair-flex">
                        <CardLabel className="profile-label-margin user-profile-label-style-employee">{`${t(
                          "CORE_COMMON_PROFILE_CONFIRM_PASSWORD"
                        )}`}</CardLabel>
                        <div className="user-profile-full-width">
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
        <div>
          <button className="selector-button-primary" onClick={updateProfile}>
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
          className="user-profile-toast-style"
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
