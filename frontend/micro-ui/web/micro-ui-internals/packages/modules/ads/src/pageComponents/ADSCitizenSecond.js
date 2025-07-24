import React, { useEffect } from "react";
import { TextInput, CardLabel, Dropdown, TextArea, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

const Breed_Type = [{ i18nKey: `PTR_GENDER`, code: `123`, name: `test` }];

const ADSCitizenSecond = ({ onGoBack, goNext, currentStepData, t }) => {
  const { control, handleSubmit, setValue } = useForm();

  const onSubmit = (data) => {
    goNext(data);
  };

  useEffect(() => {
    console.log("currentStepData", currentStepData);
    const formattedData = currentStepData?.pets;
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
          <CardLabel>Search By site id</CardLabel>

          <Controller
            control={control}
            name="siteId"
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

          <CardLabel>Site Name</CardLabel>
          <Controller
            control={control}
            name={"siteName"}
            render={(props) => (
              <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Breed_Type} optionKey="i18nKey" />
            )}
          />

          <CardLabel>Geo Location</CardLabel>
          <Controller
            control={control}
            name={"geoLocation"}
            render={(props) => (
              <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Breed_Type} optionKey="i18nKey" />
            )}
          />

          {/* <CardLabel>{`${t("PT_COMMON_COL_ADDRESS")}`}</CardLabel> */}
          <CardLabel>Address</CardLabel>

          <Controller
            control={control}
            name="address"
            render={(props) => (
              <TextArea
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

          <CardLabel>Size</CardLabel>

          <Controller
            control={control}
            name="size"
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

          <CardLabel>Advertisement Type</CardLabel>
          <Controller
            control={control}
            name={"advertisementType"}
            render={(props) => (
              <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Breed_Type} optionKey="i18nKey" />
            )}
          />

          <CardLabel>Start Date</CardLabel>

          <Controller
            control={control}
            name="startDate"
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

          <CardLabel>End Date</CardLabel>

          <Controller
            control={control}
            name="endDate"
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

export default ADSCitizenSecond;
