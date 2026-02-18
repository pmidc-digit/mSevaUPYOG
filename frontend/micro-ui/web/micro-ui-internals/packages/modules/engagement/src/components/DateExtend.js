import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { TextInput, CardLabel, ActionBar, SubmitBar, Toast } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";

const DateExtend = ({ showTermsPopupOwner, setShowTermsPopupOwner, getData }) => {
  const { t } = useTranslation();
  const user = Digit.UserService.getUser();
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const [loader, setLoader] = useState(false);
  const [showToast, setShowToast] = useState(null);

  const closeModal = () => {
    setShowTermsPopupOwner(false);
  };

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
      maxHeight: "80vh",
      overflowY: "auto",
      lineHeight: "2",
    },
  };

  const onSubmit = async (data) => {
    console.log("data", data);
    const row = getData?.original;
    const payload = {
      uuid: row?.uuid,
      startDate: data?.startDate,
      endDate: data?.endDate,
      active: true,
    };
    console.log("payload", payload);
    console.log("row====", row);

    Digit.Surveys.updateSurvey(payload)
      .then((response) => {
        setShowToast({ label: "Date has been updated successfully", isDleteBtn: "true" });
        closeModal();
      })
      .catch((error) => {
        setShowToast({ label: error?.response?.data?.Errors?.[0]?.message || ERR_MESSAGE, isDleteBtn: "true", error: true });
      });
  };

  const onGoBack = () => closeModal();
  const startDate = watch("startDate");
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
        <form className="employeeCard" onSubmit={handleSubmit(onSubmit)}>
          <div className="card">
            <div className="label-field-pair chb-margin-top-20">
              <CardLabel>
                {t("SELECT_DATE")} <span className="mandatory-asterisk">*</span>
              </CardLabel>
              <div className="form-field w-fullwidth">
                <Controller
                  control={control}
                  name={"startDate"}
                  rules={{ required: t("START_DATE_REQ") }}
                  render={(props) => (
                    <TextInput
                      type={"date"}
                      className="form-field chb-form-field-margin"
                      value={props.value}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                      }}
                      onBlur={(e) => {
                        props.onBlur(e);
                      }}
                    />
                  )}
                />
                {errors.startDate && <p className="chb-error-text">{errors.startDate.message}</p>}
              </div>
            </div>

            {/* SELECT End DATE */}
            <div className="label-field-pair chb-margin-top-20">
              <CardLabel>
                {t("SELECT_END_DATE")} <span className="mandatory-asterisk">*</span>
              </CardLabel>
              <div className="form-field w-fullwidth">
                <Controller
                  control={control}
                  name={"endDate"}
                  // rules={{ required: t("END_DATE_REQ") }}
                  rules={{
                    required: t("END_DATE_REQ"),
                  }}
                  render={(props) => (
                    <TextInput
                      type={"date"}
                      className="form-field chb-form-field-margin"
                      value={props.value}
                      min={startDate || new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                      }}
                      onBlur={(e) => {
                        props.onBlur(e);
                      }}
                      disabled={!startDate}
                    />
                  )}
                />
                {errors.endDate && <p className="chb-error-text">{errors.endDate.message}</p>}
              </div>
            </div>
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
      </Modal>
    </div>
  );
};

export default DateExtend;
