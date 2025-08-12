import React, { useEffect } from "react";
import { TextInput, CardLabel, Dropdown, TextArea, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

const Breed_Type = [{ i18nKey: `PTR_GENDER`, code: `123`, name: `test` }];

const GCCitizenThird = ({ onGoBack, goNext, currentStepData, t }) => {
  const { control, handleSubmit, setValue } = useForm();

  const onSubmit = (data) => {
    goNext(data);
  };

  useEffect(() => {
    console.log("currentStepData", currentStepData);
    const formattedData = currentStepData?.venueDetails;
    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <CardLabel>{t("Ammount_Due")}</CardLabel>
          <Controller
            control={control}
            name="ammountDue"
            render={(props) => (
              <TextInput
                value={props.value}
                onChange={(e) => {
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
                }}
              />
            )}
          />

          <CardLabel>{t("Payment_Status")}</CardLabel>
          <Controller
            control={control}
            name={"paymentStatus"}
            render={(props) => (
              <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Breed_Type} optionKey="i18nKey" />
            )}
          />

          <CardLabel>{t("Biling_Cycle")}</CardLabel>
          <Controller
            control={control}
            name={"bilingCycle"}
            render={(props) => (
              <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Breed_Type} optionKey="i18nKey" />
            )}
          />

          <CardLabel>{t("Payment_Method")}</CardLabel>
          <Controller
            control={control}
            name={"paymentMethod"}
            render={(props) => (
              <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Breed_Type} optionKey="i18nKey" />
            )}
          />

        </div>
        <ActionBar>
          <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
        {/* <button type="submit">submit</button> */}
      </form>
    </React.Fragment>
  );
};

export default GCCitizenThird;
