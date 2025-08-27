import React, { useEffect, useState } from "react";
import { TextInput, CardLabel, Dropdown, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

const Breed_Type = [{ i18nKey: `PTR_GENDER`, code: `123`, name: `test` }];

const PTRCitizenPet = ({ onGoBack, goNext, currentStepData, t }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  const { control, handleSubmit, setValue } = useForm();

  const onSubmit = (data) => {
    console.log("data in first step", data);
    goNext(data);
  };

  useEffect(() => {
    console.log("currentStepData", currentStepData);
    const formattedData = currentStepData?.petDetails;
    if (formattedData) {
      console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <CardLabel>{`${t("PTR_PET_NAME")}`}</CardLabel>
          <Controller
            control={control}
            name="petName"
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

          <CardLabel>{`${t("PTR_SEARCH_PET_TYPE")}`}</CardLabel>
          <Controller
            control={control}
            name={"petType"}
            render={(props) => (
              <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Breed_Type} optionKey="i18nKey" />
            )}
          />

          <CardLabel>{`${t("PTR_SEARCH_BREED_TYPE")}`}</CardLabel>
          <Controller
            control={control}
            name={"breedType"}
            render={(props) => (
              <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Breed_Type} optionKey="i18nKey" />
            )}
          />

          <CardLabel>{`${t("PTR_PET_GENDER")}`}</CardLabel>
          <Controller
            control={control}
            name={"petGender"}
            render={(props) => (
              <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Breed_Type} optionKey="i18nKey" />
            )}
          />

          <CardLabel>{`${t("PTR_COLOR")}`}</CardLabel>
          <Controller
            control={control}
            name="color"
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

          <CardLabel>{`${t("PTR_VACCINATED_DATE")}`}</CardLabel>
          <Controller
            control={control}
            name="lastVaccineDate"
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
              />
            )}
          />

          <CardLabel>{`${t("PTR_VACCINATION_NUMBER")}`}</CardLabel>
          <Controller
            control={control}
            name="vaccinationNumber"
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
        </div>

        <ActionBar>
          <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>
    </React.Fragment>
  );
};

export default PTRCitizenPet;
