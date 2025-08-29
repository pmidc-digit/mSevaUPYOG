import React, { useEffect } from "react";
import {
  LabelFieldPair,
  TextInput,
  CardLabel,
  BreakLine,
  Dropdown,
  MobileNumber,
  CardLabelError,
  TextArea,
  ActionBar,
  SubmitBar,
  CardSectionHeader,
  RadioButtons,
} from "@mseva/digit-ui-react-components";
import { getPattern } from "../utils";

const LayoutApplicantDetails = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props;

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  const { isLoading, data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"]);

  let menu = [];
  genderTypeData &&
    genderTypeData["common-masters"].GenderType.filter((data) => data.active).map((genderDetails) => {
      menu.push({ i18nKey: `COMMON_GENDER_${genderDetails.code}`, code: `${genderDetails.code}`, value: `${genderDetails.code}` });
    });

  useEffect(() => {
    console.log("currentStepData1", currentStepData);
    const formattedData = currentStepData?.applicationDetails;
    if (formattedData) {
      //console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);

  return (
    <React.Fragment>
      <CardSectionHeader className="card-section-header">{t("BPA_APPLICANT_DETAILS")}</CardSectionHeader>
      <div>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_FIRM_OWNER_NAME_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantOwnerOrFirmName"
              rules={{
                required: t("REQUIRED_FIELD"),
                minLength: {
                  value: 4,
                  message: t("MIN_4_CHARACTERS_REQUIRED"),
                },
                maxLength: {
                  value: 100,
                  message: t("MAX_100_CHARACTERS_ALLOWED"),
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
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantOwnerOrFirmName ? errors.applicantOwnerOrFirmName.message : ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_EMAIL_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantEmailId"
              rules={{
                required: t("REQUIRED_FIELD"),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t("INVALID_EMAIL_FORMAT"),
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
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantEmailId?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL")}`}</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantFatherHusbandName"
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
          </div>
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_MOBILE_NO_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantMobileNumber"
              rules={{
                required: t("REQUIRED_FIELD"),
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: t("INVALID_MOBILE_NUMBER"),
                },
              }}
              render={(props) => <MobileNumber value={props.value} onChange={props.onChange} onBlur={props.onBlur} t={t} />}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantMobileNumber?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_ADDRESS_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantAddress"
              rules={{
                required: t("REQUIRED_FIELD"),
                minLength: {
                  value: 4,
                  message: t("MIN_4_CHARACTERS_REQUIRED"),
                },
                maxLength: {
                  value: 100,
                  message: t("MAX_100_CHARACTERS_ALLOWED"),
                },
              }}
              render={(props) => (
                <TextArea
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
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantAddress?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_DOB_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantDateOfBirth"
              rules={{ 
                required: t("REQUIRED_FIELD") ,
                validate: (value) => {
                    const today = new Date();
                    const dob = new Date(value);
                    const age = today.getFullYear() - dob.getFullYear();
                    const m = today.getMonth() - dob.getMonth();
                    const d = today.getDate() - dob.getDate();

                    const is18OrOlder = age >= 18 ||
                    (age === 18 && (m > 0 || (m === 0 && d >= 0)));
                    return is18OrOlder || t("DOB_MUST_BE_18_YEARS_OLD");
                  },
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
                  min="1900-01-01"
                  max={new Date().toISOString().split("T")[0]}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantDateOfBirth?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_GENDER_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantGender"
              rules={{ required: t("REQUIRED_FIELD") }}
              render={(props) => (
                <RadioButtons
                  t={t}
                  options={menu}
                  optionsKey="code"
                  value={props.value}
                  selectedOption={props.value}
                  onSelect={(e) => {
                    props.onChange(e);
                  }}
                  isDependent={true}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantGender?.message || ""}</CardLabelError>
      </div>
    </React.Fragment>
  );
};

export default LayoutApplicantDetails;
