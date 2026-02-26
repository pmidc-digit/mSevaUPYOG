import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { TextInput, CardLabel, ActionBar, SubmitBar, Toast, Dropdown } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { Loader } from "./Loader";

const genders = [
  { name: "Male", code: "MALE" },
  { name: "Female", code: "FEMALE" },
  { name: "Transgender", code: "TRANSGENDER" },
];

const UpdateProfile = ({ showTermsPopupOwner, setShowTermsPopupOwner, getData }) => {
  const { t } = useTranslation();
  const user = Digit.UserService.getUser();
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const [loader, setLoader] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [getGender, setGender] = useState();
  const [getUserDetails, setUserDetails] = useState();

  const closeModal = () => {
    setShowTermsPopupOwner(false);
  };

  const isMobile = window.innerWidth <= 640;

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    getValues,
    watch,
    trigger,
    clearErrors,
  } = useForm();

  const modalStyles = {
    modal: {
      width: "100%",
      height: "100%",
      top: "0",
      position: "relative",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    modalOverlay: {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      zIndex: 9999,
    },
    modalContent: {
      backgroundColor: "#FFFFFF",
      padding: "2rem",
      borderRadius: "0.5rem",
      maxWidth: "800px",
      margin: "auto",
      fontFamily: "Roboto, serif",
      overflowX: "hidden",
      textAlign: "justify",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      maxHeight: isMobile ? "47vh" : "80vh",
      overflowY: "auto",
      lineHeight: "2",
    },
  };

  const convertDobToEpoch = (dob) => {
    if (!dob) return null;

    // If already epoch (number), return as is
    if (typeof dob === "number") return dob;

    // If string like "2000-01-01"
    if (typeof dob === "string") {
      return new Date(dob + "T00:00:00").getTime();
    }

    return null;
  };

  const isMinimum18Years = (dob) => {
    if (!dob) return false;

    const today = new Date();
    const birthDate = new Date(dob);

    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  };

  const onSubmit = async (data) => {
    setLoader(true);
    console.log("data==", data);
    const updatedFields = {};

    if (data?.gender?.code) {
      updatedFields.gender = data.gender.code;
    }

    // if (data?.emailId) {
    //   updatedFields.emailId = data.emailId;
    // }

    const finalDob = data?.dob ? convertDobToEpoch(data.dob) : convertDobToEpoch(getUserDetails?.dob);

    if (finalDob) {
      updatedFields.dob = finalDob;
    }

    const { pwdExpiryDate, createdDate, lastModifiedDate, ...cleanUserDetails } = getUserDetails || {};

    const userData = {
      ...cleanUserDetails,
      ...updatedFields,
    };
    // 🔥 Ensure DOB is always epoch
    // userData.dob = new Date(`${userData.dob}T00:00:00`).getTime();

    console.log("userData", userData);
    // return;
    try {
      const response = await Digit.UserService.updateUser(userData, user?.info?.tenantId);
      setShowToast({ label: "Profile has been updated successfully", isDleteBtn: "true" });
      setLoader(false);
      setTimeout(() => {
        closeModal();
        window.location.reload();
      }, 2000);
    } catch (error) {
      setLoader(false);
      console.log("erroe", error);
    }
  };

  const onGoBack = () => closeModal();
  const startDate = watch("startDate");

  console.log("user", user?.info);

  const getUserInfo = async () => {
    const uuid = user?.info?.uuid;
    if (uuid) {
      // const selectedTenantId = window.location.href.includes("citizen") ? stateId : tenant;
      setLoader(true);
      const usersResponse = await Digit.UserService.userSearch(user?.info?.tenantId, { uuid: [uuid] }, {});
      setLoader(false);
      setUserDetails(usersResponse?.user?.[0]);
    }
  };

  console.log("getUserDetails", getUserDetails);

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <div>
      <Modal
        isOpen={showTermsPopupOwner}
        onRequestClose={closeModal}
        contentLabel="Self-Declaration"
        style={{
          modal: modalStyles.modal,
          overlay: modalStyles.modalOverlay,
          content: modalStyles.modalContent,
        }}
      >
        {getUserDetails && (
          <form className="employeeCard" onSubmit={handleSubmit(onSubmit)}>
            <div className="card">
              {/* Gender */}
              {!getUserDetails?.gender && (
                <div className="label-field-pair chb-margin-top-20">
                  <CardLabel>
                    {t("CORE_COMMON_GENDER")} <span className="mandatory-asterisk">*</span>
                  </CardLabel>
                  <div className="form-field w-fullwidth">
                    <Controller
                      control={control}
                      name={"gender"}
                      rules={{ required: t("gender is required") }}
                      render={(props) => (
                        <Dropdown
                          option={genders}
                          optionKey="name"
                          id="name"
                          select={props.onChange}
                          selected={props.value}
                          placeholder={t("CORE_COMMON_GENDER")}
                        />
                      )}
                    />
                    {errors.gender && <p className="chb-error-text">{errors.gender.message}</p>}
                  </div>
                </div>
              )}

              {/* DOB */}
              {!getUserDetails?.dob && (
                <div className="label-field-pair chb-margin-top-20">
                  <CardLabel>
                    {t("CORE_COMMON_DOB")} <span className="mandatory-asterisk">*</span>
                  </CardLabel>
                  <div className="form-field w-fullwidth">
                    <Controller
                      control={control}
                      name="dob"
                      rules={{
                        required: "DOB is required",
                        validate: (value) => isMinimum18Years(value) || "Minimum age should be 18 years",
                      }}
                      render={(props) => (
                        <TextInput
                          type="date"
                          value={props.value}
                          onChange={(e) => {
                            props.onChange(e.target.value);
                          }}
                          onBlur={(e) => {
                            props.onBlur(e);
                          }}
                          t={t}
                          max={new Date().toISOString().split("T")[0]} // prevents future date
                        />
                      )}
                    />
                    {errors.dob && <p className="chb-error-text">{errors.dob.message}</p>}
                  </div>
                </div>
              )}

              {/* email */}
              {/* {!getUserDetails?.emailId && (
                <div className="label-field-pair" style={{ marginBottom: "20px" }}>
                  <CardLabel>
                    {`${t("NOC_APPLICANT_EMAIL_LABEL")}`} <span style={{ color: "red" }}>*</span>
                  </CardLabel>
                  <div className="form-field" style={{ width: "100%" }}>
                    <Controller
                      control={control}
                      name="emailId"
                      rules={{
                        required: "Email is required",
                        pattern: {
                          value: /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/,
                          message: "Invalid email format",
                        },
                      }}
                      render={(props) => (
                        <TextInput
                          value={props.value}
                          onChange={(e) => {
                            props.onChange(e.target.value);
                          }}
                          onBlur={(e) => {
                            props.onBlur(e);
                          }}
                          t={t}
                        />
                      )}
                    />
                    {errors?.emailId && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.emailId.message}</p>}
                  </div>
                </div>
              )} */}
            </div>
            {showToast && (
              <Toast
                label={t(showToast.label)}
                isDleteBtn={showToast.isDleteBtn}
                error={showToast.error}
                onClose={() => {
                  setShowToast(null);
                }}
                // onNo={onNoToToast}
                // onYes={onYesToToast}
                warning={showToast.warning}
                isWarningButtons={showToast.isWarningButtons}
                style={{ padding: "16px" }}
              />
            )}
            <ActionBar>
              <SubmitBar className="submit-bar-back" label="Cancel" onSubmit={onGoBack} />
              <SubmitBar label="Submit" submit="submit" />
            </ActionBar>
          </form>
        )}
      </Modal>
      {loader && <Loader page={true} />}
    </div>
  );
};

export default UpdateProfile;
