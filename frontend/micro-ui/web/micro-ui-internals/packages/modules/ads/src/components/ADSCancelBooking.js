import React, { useEffect, useState } from "react";
import { Modal, Card, CheckBox, TextArea, LabelFieldPair, CardLabel, SubmitBar } from "@mseva/digit-ui-react-components";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ADSDocuments from "./ADSDocuments";

const Heading = (props) => {
  return <h1 className="heading-m">{props.t("ADS_CANCEL_BOOKING")}</h1>;
};

const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const CloseBtn = (props) => {
  return (
    <div className="icon-bg-secondary" onClick={props.onClick}>
      <Close />
    </div>
  );
};

/**ADSCancelBooking is used for cancellation of an ADS booking.This component displays a modal with a customizable title, close button, and actions
 * for canceling or saving the cancellation confirmation. . */

const ADSCancelBooking = ({ t, closeModal, actionCancelLabel, actionCancelOnSubmit, actionSaveLabel, actionSaveOnSubmit, onSubmit }) => {
  const [agree, setAgree] = useState(false);
  const [documentsData, setDocumentsData] = useState([]);
  const [error, setError] = useState(null);
  const tenantId = window.localStorage.getItem("Employee.tenant-id");

  // const { t } = useTranslation();

  const filters = {
    tenantId,
    searchType: "1",
  };

  const { data, isLoading, isError } = Digit.Hooks.rentandlease.useRentAndLeaseProperties(filters);

  const setdeclarationhandler = () => {
    setAgree(!agree);
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const handleDocumentsSelect = (data) => {
    setDocumentsData(data);
    if (data?.length > 0) {
      setError(null);
    }
  };

  const docUploadData = {
    Challan: {
      Documents: [
        {
          code: "ADSCancelDocument",
          documentType: "ID_PROOF",
          required: true,
          active: true,
          description: "ID proof of offender",
          maxSizeMB: 2,
          hasDropdown: true,
        },
      ],
    },
  };

  const handleFormSubmit = (data) => {
    if (!documentsData?.length) {
      setError("Document is Required");
      return;
    }

    setError(null);

    const payload = {
      ...data,
      documents: documentsData,
    };

    actionSaveOnSubmit(payload);
  };

  useEffect(() => {
    console.log("documentsData", documentsData);
  }, [documentsData]);

  return (
    <Modal
      headerBarMain={<Heading t={t} />}
      headerBarEnd={<CloseBtn onClick={closeModal} />}
      actionCancelLabel={t(actionCancelLabel)}
      actionCancelOnSubmit={actionCancelOnSubmit}
      actionSaveLabel={t(actionSaveLabel)}
      actionSaveOnSubmit={handleSubmit(handleFormSubmit)}
      // isDisabled={!agree}
      formId="modal-action"
    >
      {/* <Card style={{ boxShadow: "none" }}> */}
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div style={{ width: "80%", justifySelf: "center" }}>
          {/* reason */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("Reason")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name="reason"
                rules={{
                  required: "Reason is required",
                  minLength: { value: 5, message: "Reason must be at least 5 characters" },
                }}
                render={(props) => (
                  <TextArea
                    name="reason"
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
              {errors?.reason && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.reason.message}</p>}
            </div>
          </LabelFieldPair>

          {/* remarks */}
          {/* <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("Remarks")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name="remarks"
                rules={{
                  required: "Remarks is required",
                  minLength: { value: 5, message: "Remarks must be at least 5 characters" },
                }}
                render={(props) => (
                  <TextArea
                    name="reason"
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
              {errors?.remarks && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.remarks.message}</p>}
            </div>
          </LabelFieldPair> */}
          <div>
            <ADSDocuments
              t={t}
              config={{ key: "documents" }}
              onSelect={handleDocumentsSelect}
              userType="CITIZEN"
              formData={{ documents: { documents: documentsData } }}
              setError={setError}
              error={error}
              clearErrors={() => {}}
              formState={{}}
              data={docUploadData}
              isLoading={isLoading}
            />
            {/* {error === "DOCUMENT_REQUIRED" && <p style={{ color: "red", marginTop: "4px" }}>{t("ADS_DOCUMENT_UPLOAD_REQUIRED")}</p>} */}
          </div>
          {/* <SubmitBar label={t("Submit")} submit="submit" /> */}
          {/* <CheckBox label={t("ADS_CANCEL_BOOKING")} onChange={setdeclarationhandler} style={{ height: "auto" }} /> */}
          {/* </Card> */}
        </div>
      </form>
      {/* </Card> */}
    </Modal>
  );
};
export default ADSCancelBooking;
