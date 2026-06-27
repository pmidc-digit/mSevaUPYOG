import React, { useEffect, useState } from "react";
import { FormStep, TextInput, CardLabel, DatePicker, CardLabelError, LabelFieldPair } from "@mseva/digit-ui-react-components";
import Timeline from "../../components/TLTimeline";

const RegistrationDocument = (props) => {
  const { t, config, onSelect, userType, formData, setError, clearErrors, errors, formState } = props;

  const [documentNumber, setDocNo] = useState(formData?.[config.key]?.documentNumber);
  const [documentValue, setDocValue] = useState(formData?.[config.key]?.documentValue);
  const [documentDate, setDocDate] = useState(formData?.[config.key]?.documentDate);
  const [error, setLocalError] = useState(null);

  const selectDocDate = (date) => {
    setLocalError(null);
    let _date = new Date(date);
    let to_date = `${new Date().getFullYear()}-${(new Date().getMonth()+1).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    })}-${new Date().getDate().toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    })}`


    if (new Date(date).getTime() <= new Date(to_date).getTime()) setDocDate(date);
    else setLocalError("PT_DOCUMENT_DATE_ERROR_MESSAGE");
  };

  const goNext = () => {
    onSelect(config.key, { ...formData?.[config.key], documentNumber, documentValue, documentDate });
  };

  useEffect(() => {
    if (userType === "employee") {
      if (!documentNumber) {
        setError("additionalDetails.documentNumber", { type: "Required" });
      } else if (errors?.additionalDetails?.documentNumber) {
        clearErrors("additionalDetails.documentNumber");
      }

      if (!documentValue) {
        setError("additionalDetails.documentValue", { type: "Required" });
      } else if (errors?.additionalDetails?.documentValue) {
        clearErrors("additionalDetails.documentValue");
      }

      if (!documentDate) {
        setError("additionalDetails.documentDate", { type: "Required" });
      } else if (error) {
        setError("additionalDetails.documentDate", { type: "invalid" });
      } else if (errors?.additionalDetails?.documentDate) {
        clearErrors("additionalDetails.documentDate");
      }
      goNext();
    }
  }, [documentNumber, documentValue, documentDate, error]);

  const onSkip = () => {};

  if (userType === "employee") {
    return (
      <React.Fragment>
        <LabelFieldPair>
          <CardLabel style={{ fontWeight: "bold" }} className="card-label-smaller">
            {t("PT_MUTATION_DOCUMENT_NO") + " *"}
          </CardLabel>
          <div className="field">
            <TextInput type={"number"} min={1} value={documentNumber} onChange={(e) => setDocNo(e.target.value)} />
          </div>
        </LabelFieldPair>
        {formState?.submitCount > 0 && !documentNumber && (
          <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
            {t("CORE_COMMON_REQUIRED_ERRMSG")}
          </CardLabelError>
        )}
        <LabelFieldPair>
          <CardLabel style={{ fontWeight: "bold" }} className="card-label-smaller">
            {t("PT_MUTATION_DOCUMENT_VALUE") + " *"}
          </CardLabel>
          <div className="field">
            <TextInput type={"number"} min={1} value={documentValue} onChange={(e) => setDocValue(e.target.value)} />
          </div>
        </LabelFieldPair>
        {formState?.submitCount > 0 && !documentValue && (
          <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
            {t("CORE_COMMON_REQUIRED_ERRMSG")}
          </CardLabelError>
        )}
        <LabelFieldPair>
          <CardLabel style={{ fontWeight: "bold" }} className="card-label-smaller">
            {t("PT_MUTATION_DOCUMENT_ISSUE_DATE") + " *"}
          </CardLabel>
          <div className="field">
            <DatePicker max={new Date().toLocaleDateString()} date={documentDate} onChange={selectDocDate} />
          </div>
        </LabelFieldPair>
        {formState?.submitCount > 0 && !documentDate && !error && (
          <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
            {t("CORE_COMMON_REQUIRED_ERRMSG")}
          </CardLabelError>
        )}
        {error && (
          <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
            {t(error)}
          </CardLabelError>
        )}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Timeline currentStep={2} flow="PT_MUTATE" />
      <FormStep t={t} config={config} onSelect={goNext} onSkip={onSkip} isDisabled={!(documentNumber && documentValue && documentDate)}>
        <CardLabel>{t("PT_MUTATION_DOCUMENT_NO")}</CardLabel>
        <TextInput type={"number"} min={1} value={documentNumber} onChange={(e) => setDocNo(e.target.value)} />
        <CardLabel>{t("PT_MUTATION_DOCUMENT_VALUE")}</CardLabel>
        <TextInput type={"number"} min={1} value={documentValue} onChange={(e) => setDocValue(e.target.value)} />
        <CardLabel>{t("PT_MUTATION_DOCUMENT_ISSUE_DATE")}</CardLabel>
        <DatePicker max={new Date().toLocaleDateString()} date={documentDate} onChange={selectDocDate} style={{maxWidth: 540}} />
        {error ? <CardLabelError>{t(error)}</CardLabelError> : null}
      </FormStep>
    </React.Fragment>
  );
};

export default RegistrationDocument;
