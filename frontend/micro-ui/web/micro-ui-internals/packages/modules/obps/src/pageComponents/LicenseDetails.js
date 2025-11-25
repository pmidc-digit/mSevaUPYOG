import { BackButton, CardLabel, FormStep, Loader, MobileNumber, RadioButtons, TextInput, DatePicker, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Timeline from "../components/Timeline";

const LicenseDetails = ({ t, config, onSelect, userType, formData, ownerIndex }) => {
  const { pathname: url } = useLocation();
  // const userInfo = Digit.UserService.getUser();
  const userInfo = Digit.UserService.getUser();
  let validation = {};
  const tenantId = Digit.ULBService.getCurrentTenantId();
  let isOpenLinkFlow = window.location.href.includes("openlink");
  const uuid = userInfo?.info?.uuid;
  const [disable, setDisable] = useState({

    gender: false,
    dateOfBirth: false,
  });
  const [getUserDetails, setGetUserDetails] = useState(null);
  const { data: userDetails, isLoading: isUserLoading } = Digit.Hooks.useUserSearch(tenantId, { uuid: [uuid] }, {}, { enabled: uuid ? true : false });
  const [name, setName] = useState(() => {
    // (!isOpenLinkFlow ? userInfo?.info?.name : "") || formData?.LicneseDetails?.name || formData?.formData?.LicneseDetails?.name || "";
    const fullName = formData?.LicneseDetails?.name || (!isOpenLinkFlow ? userInfo?.info?.name : "") || "";
    const nameParts = fullName
    //console.log("firstName here", nameParts[0]);
    return nameParts.length ? nameParts : "";
  });

  console.log("disable state", disable);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [dateOfBirth, setDateOfBirth] = useState(formData?.LicneseDetails?.dateOfBirth || formData?.formData?.LicneseDetails?.dateOfBirth || ""); // State for the date field
  const [age, setAge] = useState(0);
  const [email, setEmail] = useState(
    (!isOpenLinkFlow ? userInfo?.info?.emailId : "") || formData?.LicneseDetails?.email || formData?.formData?.LicneseDetails?.email || ""
  );
  const [gender, setGender] = useState(
    formData?.LicneseDetails?.gender ||
      (!isOpenLinkFlow && userDetails?.user?.[0]?.gender
        ? { i18nKey: `COMMON_GENDER_${userDetails?.user?.[0]?.gender}`, code: userDetails?.user?.[0]?.gender, value: userDetails?.user?.[0]?.gender }
        : "") ||
      formData?.formData?.LicneseDetails?.gender
  );
  const [mobileNumber, setMobileNumber] = useState(
    (!isOpenLinkFlow ? userInfo?.info?.mobileNumber : "") ||
      formData?.LicneseDetails?.mobileNumber ||
      formData?.formData?.LicneseDetails?.mobileNumber ||
      ""
  );
  const [PanNumber, setPanNumber] = useState(formData?.LicneseDetails?.PanNumber || formData?.formData?.LicneseDetails?.PanNumber || "");
  const [errorMessage, setErrorMessage] = useState({
    gender: "",
    email: "",
    dateOfBirth: "",
  });


const status = formData?.result?.Licenses?.[0]?.status;
console.log(formData, "EDIT FORMDATA");
const isCitizenEditable = status === "CITIZEN_ACTION_REQUIRED";
console.log(isCitizenEditable, "EDIT");


  // get user info from api
  const getUserInfo = async () => {
    const uuid = userInfo?.info?.uuid;
    if (uuid) {
      const usersResponse = await Digit.UserService.userSearch(tenantId, { uuid: [uuid] }, {});
      if (usersResponse?.user?.length) {
        const user = usersResponse.user[0];
        setGetUserDetails(user);
        if (user?.dob) {
          setDisable((prev) => ({ ...prev, dateOfBirth: true }));
          setDateOfBirth(user.dob);
        }
      }
    }
  };

  const isMobile = window.Digit.Utils.browser.isMobile();

  useEffect(() => {
    getUserInfo();
  }, []);
  useEffect(() => {
    if (!gender?.code && userDetails?.user?.[0]?.gender && !isOpenLinkFlow) {
      setDisable((prev) => ({ ...prev, gender: true }));
      setGender({
        i18nKey: `COMMON_GENDER_${userDetails?.user?.[0]?.gender}`,
        code: userDetails?.user?.[0]?.gender,
        value: userDetails?.user?.[0]?.gender,
      });
    }
  }, [userDetails]);

  useEffect(() => {
    if (dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();

      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      setAge(age);
    }
  }, [dateOfBirth]);
  const stateId = Digit.ULBService.getStateId();

  const isCitizenUrl = Digit.Utils.browser.isMobile() ? true : false;

  if (isOpenLinkFlow)
    window.onunload = function () {
      sessionStorage.removeItem("Digit.BUILDING_PERMIT");
    };

  const { isLoading, data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"]);

  let menu = [];
  genderTypeData &&
    genderTypeData["common-masters"].GenderType.filter((data) => data.active).map((genderDetails) => {
      menu.push({ i18nKey: `COMMON_GENDER_${genderDetails.code}`, code: `${genderDetails.code}`, value: `${genderDetails.code}` });
    });

  if (isUserLoading) return <Loader />;

  function SelectName(e) {
    setName(e.target.value);
  }

  function SelectUserName(e) {
    setUserName(e.target.value);
  }
  function SelectPassword(e) {
    setPassword(e.target.value);
  }
  function selectEmail(e) {
    setEmail(e.target.value);
  }
  function setGenderName(value) {
    setGender(value);
  }

  function setMobileNo(e) {
    setMobileNumber(e.target.value);
  }
  function selectPanNumber(e) {
    setPanNumber(e.target.value);
  }

  function handleDateOfBirthChange(date) {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // if (age < 18) {
    //   alert(t("BPA_DOB_VALIDATION_MESSAGE"));
    //   return;
    // }

    setDateOfBirth(date);
  }

  const goNext = () => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    // let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    //   age--;
    // }

    if (gender?.code === null) {
      setErrorMessage((prev) => ({...prev, gender: t("BPA_APPLICANT_GENDER_PLACEHOLDER")}));
      return;
    }
    if (age < 18) {
      setErrorMessage((prev) => ({...prev, dateOfBirth: t("BPA_DOB_VALIDATION_MESSAGE")}));
      // alert(t("BPA_DOB_VALIDATION_MESSAGE"));
      return;
    }
    if(!email.match(Digit.Utils.getPattern("Email"))){
      setErrorMessage((prev) => ({ ...prev, email: t("BPA_APPLICANT_EMAIL_VALIDATION_MESSAGE") }));
      return;
    }

    if (!(formData?.result && formData?.result?.Licenses[0]?.id)) {
      // let fullName = `${name} ${middleName} ${lastName}`;
      // console.log("firstName before saving",name);
      // console.log("middleName before saving", middleName);
      // console.log("lastName before saving", lastName);
      // console.log("fullName here", fullName);
      let fullName = "";
      if(name?.length>0){
        fullName = name;
      }
      let licenseDet = { name: fullName, mobileNumber: mobileNumber, gender: gender, email: email, PanNumber: PanNumber, dateOfBirth: dateOfBirth };
      onSelect(config.key, licenseDet);
    } else {
      let data = formData?.formData;
      data.LicneseDetails.name = name;
      data.LicneseDetails.mobileNumber = mobileNumber;
      data.LicneseDetails.gender = gender;
      data.LicneseDetails.email = email;
      data.LicneseDetails.PanNumber = PanNumber;
      data.LicneseDetails.dateOfBirth = dateOfBirth;
      onSelect("", formData);
    }
  };

  const onSkip = () => onSelect();

  const errorStyle = { color: "#E74C3C", fontSize: "12px", marginTop: "4px", marginBottom: "12px", fontStyle: "italic" };

  return (
    <div>
      <div className={isOpenLinkFlow ? "OpenlinkContainer" : ""}>
        {isOpenLinkFlow && <BackButton>{t("CS_COMMON_BACK")}</BackButton>}
        {isMobile && <Timeline currentStep={1} flow="STAKEHOLDER" />}
        {!isLoading || !isUserLoading ? (
          <FormStep
            config={config}
            // onSelect={goNext}
            // onSkip={onSkip}
            t={t}
            // isDisabled={!name || !mobileNumber || !gender || !dateOfBirth || !lastName || !email}
          >
            <div>
              <CardLabel>{t("BPA_FULL_NAME")}*</CardLabel>
              <TextInput
                t={t}
                type={"text"}
                isMandatory={false}
                optionKey="i18nKey"
                name="name"
                value={name}
                onChange={SelectName}
                // disable={name && !isOpenLinkFlow ? true : false}
                 disable={!isCitizenEditable && (name && !isOpenLinkFlow ? true : false)}
               
                {...(validation = {
                  isRequired: true,
                  pattern: "^[a-zA-Z ]*$",
                  type: "text",
                  title: t("PT_NAME_ERROR_MESSAGE"),
                })}
              />
              {/* <CardLabel>{t("BPA_MIDDLE_NAME")}</CardLabel>
              <TextInput
                t={t}
                type={"text"}
                isMandatory={false}
                // optionKey="i18nKey"
                name="Mname"
                value={middleName}
                onChange={SelectMiddleName}
                disable={disable?.middleName}
                {...(validation = {
                  isRequired: false,
                  pattern: "^[a-zA-Z ]*$",
                  type: "text",
                  title: t("PT_NAME_ERROR_MESSAGE"),
                })}
              />
              <CardLabel>{t("BPA_LAST_NAME")}*</CardLabel>
              <TextInput
                t={t}
                type={"text"}
                isMandatory={false}
                optionKey="i18nKey"
                name="Lname"
                value={lastName}
                onChange={SelectLastName}
                disable={disable?.lastName}
                {...(validation = {
                  isRequired: true,
                  pattern: "^[a-zA-Z ]*$",
                  type: "text",
                  title: t("PT_NAME_ERROR_MESSAGE"),
                })}
              /> */}
              <div>
              <CardLabel>{t("BPA_APPLICANT_DOB_LABEL")}*</CardLabel>
              <DatePicker
                date={dateOfBirth}
                onChange={handleDateOfBirthChange}
                min="1900-01-01"
                max={new Date().toISOString().split("T")[0]}
                isRequired={true}
                // disabled={disable?.dateOfBirth}
                disabled={!isCitizenEditable && disable?.dateOfBirth}
              />
              {errorMessage?.dateOfBirth?.length>0 && (
                  <div
                   
                  >
                    {errorMessage?.dateOfBirth}
                  </div>
                )}
              </div>
              {/* <CardLabel>{`${t("BPA_APPLICANT_NAME_LABEL")}*`}</CardLabel>
            <TextInput
              t={t}
              type={"text"}
              isMandatory={false}
              optionKey="i18nKey"
              name="name"
              value={name}
              onChange={SelectName}
              disable={name && !isOpenLinkFlow ? true : false}
              {...(validation = {
                isRequired: true,
                pattern: "^[a-zA-Z ]*$",
                type: "text",
                title: t("PT_NAME_ERROR_MESSAGE"),
              })}
            /> */}
              <div>
                <CardLabel>{`${t("BPA_APPLICANT_GENDER_LABEL")}*`}</CardLabel>
                <RadioButtons
                  t={t}
                  options={menu}
                  optionsKey="code"
                  name="gender"
                  value={gender}
                  selectedOption={gender}
                  onSelect={setGenderName}
                  isDependent={true}
                  labelKey="COMMON_GENDER"
                  // disable={gender && !isOpenLinkFlow ? true : false}
                  // disabled={disable?.gender}
                  disabled={!isCitizenEditable && disable?.gender}
                />

                {errorMessage?.gender?.length>0 && (
                  <div
                  
                  >
                    {errorMessage?.gender}
                  </div>
                )}
              </div>

              <CardLabel>{`${t("BPA_APPLICANT_MOBILE_NO_LABEL")}*`}</CardLabel>
              <MobileNumber
                value={mobileNumber}
                name="mobileNumber"
                onChange={(value) => setMobileNo({ target: { value } })}
                disable={mobileNumber && !isOpenLinkFlow ? true : false}
                {...{ required: true, pattern: "[6-9]{1}[0-9]{9}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
              />
              <div>
              <CardLabel>{`${t("BPA_APPLICANT_EMAIL_LABEL")}*`}</CardLabel>
              <TextInput
                t={t}
                type={"email"}
                isMandatory={false}
                optionKey="i18nKey"
                name="email"
                value={email}
                onChange={selectEmail}
                // disable={userInfo?.info?.emailId && !isOpenLinkFlow ? true : false}
                 disable={!isCitizenEditable && (userInfo?.info?.emailId && !isOpenLinkFlow ? true : false)}
                
                // disable={editScreen}
                {...{
                  required: true,
                  pattern: "[A-Za-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$",
                  type: "email",
                  title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID"),
                }}
              />
              {errorMessage?.email?.length>0 && (
                  <div
                   
                  >
                    {errorMessage?.email}
                  </div>
                )}
              </div>
              {/* <CardLabel>{`${t("BPA_APPLICANT_PAN_NO")}`}</CardLabel>
            <TextInput
              t={t}
              type={"text"}
              isMandatory={false}
              optionKey="i18nKey"
              name="PanNumber"
              value={PanNumber}
              onChange={selectPanNumber}
              {...{ required: true, pattern: "[A-Z]{5}[0-9]{4}[A-Z]{1}", title: t("BPA_INVALID_PAN_NO") }}
            /> */}
              {/* <CardLabel>{"Username"}</CardLabel>
            <TextInput
              t={t}
              type={"text"}
              isMandatory={false}
              optionKey="i18nKey"
              name="Uname"
              value={userName}
              onChange={SelectUserName}
              // disable={userName && !isOpenLinkFlow ? true : false}
              {...(validation = {
                isRequired: true,
                pattern: "^[a-zA-Z ]*$",
                type: "text",
                title: t("PT_NAME_ERROR_MESSAGE"),
              })}
            />
            <CardLabel>{"Password"}</CardLabel>
            <TextInput
              t={t}
              type={"password"}
              isMandatory={false}
              optionKey="i18nKey"
              name="Pword"
              value={password}
              minLength="10"
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value); // Update the password state
              }}

              onBlur={() => {
                if (!regex.test(password)) {
                  alert(t("Password must be at least 10 characters long, include an uppercase letter, a special character, and alphanumeric characters."));
                }
              }}
              {...(validation = {
                isRequired: true,
                pattern: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[a-zA-Z0-9])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{1,}$/,
                type: "Password",
                title: "titlerror Password must be 8 to 10 characters long, include an uppercase letter, a special character, and alphanumeric characters.",
              })}
            /> */}
              {/* <CardLabel>{"Confirm Password"}</CardLabel>
            <TextInput
              t={t}
              type={"text"}
              isMandatory={false}
              optionKey="i18nKey"
              name="name"
              value={name}
              onChange={SelectName}
              disable={name && !isOpenLinkFlow ? true : false}
              {...(validation = {
                isRequired: true,
                pattern: "^[a-zA-Z ]*$",
                type: "text",
                title: t("PT_NAME_ERROR_MESSAGE"),
              })}
            /> */}
            </div>
          </FormStep>
        ) : (
          <Loader />
        )}
      </div>
      <ActionBar>
        <SubmitBar
          label={t("CS_COMMON_NEXT")}
          onSubmit={goNext}
          disabled={!name || !mobileNumber || !gender || !dateOfBirth  || !email }
        />
      </ActionBar>
    </div>
  );
};

export default LicenseDetails;
