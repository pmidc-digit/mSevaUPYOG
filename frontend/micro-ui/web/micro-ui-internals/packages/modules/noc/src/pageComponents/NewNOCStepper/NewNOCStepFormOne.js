import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast, ActionBar, SubmitBar, Dropdown, CardLabelError, LabelFieldPair, CardLabel } from "@mseva/digit-ui-react-components";
import { UPDATE_NOCNewApplication_FORM } from "../../redux/action/NOCNewApplicationActions";
import { useState, useEffect } from "react";
import NOCApplicantDetails from "../NOCApplicantDetails";
import NOCProfessionalDetails from "../NOCProfessionalDetails";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Controller, useForm } from "react-hook-form";

const NewNOCStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.noc.NOCNewApplicationFormReducer.formData;
  });

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

  const [registeredStakeHolder, setRegisteredStakeHolder] = useState(currentStepData?.applicationDetails?.registeredStakeHolder || null);

  const options = [
    {
      code: "YES",
      i18nKey: "YES",
    },
    {
      code: "NO",
      i18nKey: "NO",
    },
  ];

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
  } = useForm();

  const commonProps = { Controller, control, setValue, errors, trigger, errorStyle };

  const onSubmit = (data) => {
    //console.log("data in first step", data);
    trigger();

    if (errors.length > 0) {
      console.log("Plz fill mandatory fields in Step1");
      return;
    }
    goNext(data);
  };

  function goNext(data) {
    dispatch(UPDATE_NOCNewApplication_FORM(config.key, data));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  //  console.log("registeredStakeHolder here", registeredStakeHolder);
  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="employeeCard">
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("NOC_REGISTERED_STAKEHOLDER_TYPE_LABEL")}`} *</CardLabel>
            <Controller
              control={control}
              name={"registeredStakeHolder"}
              // defaultValue={registeredStakeHolder || null}
              rules={{
                required: t("REQUIRED_FIELD"),
              }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  select={(e) => {
                    setRegisteredStakeHolder(e);
                    props.onChange(e);
                  }}
                  selected={props.value}
                  option={options}
                  optionKey="i18nKey"
                />
              )}
            />
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.registeredStakeHolder?.message || ""}</CardLabelError>

          {registeredStakeHolder?.code === "YES" && (
            <NOCProfessionalDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
          )}

          {registeredStakeHolder?.code === "NO" && (
            <NOCApplicantDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
          )}
        </div>
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>

      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewNOCStepFormOne;
