import React, { useEffect } from "react";
import { TextInput, CardLabel, Dropdown, TextArea, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

const Breed_Type = [{ i18nKey: `PTR_GENDER`, code: `123`, name: `test` }];

const CHBCitizenSecond = ({ onGoBack, goNext, currentStepData, t }) => {
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
          <CardLabel>Community Hall ID</CardLabel>
          <Controller
            control={control}
            name="hallId"
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

          <CardLabel>Community Hall Name</CardLabel>
          <Controller
            control={control}
            name={"hallName"}
            render={(props) => (
              <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Breed_Type} optionKey="i18nKey" />
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

          <CardLabel>{`${t("PT_COMMON_COL_ADDRESS")}`}</CardLabel>
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

          <CardLabel>Geo Location</CardLabel>
          <Controller
            control={control}
            name={"geoLocation"}
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

          <div style={{ marginTop: "20px" }}>
            <Controller
              control={control}
              name="gstApp"
              render={(field) => (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <input
                    value={field.value}
                    type="checkbox"
                    id="gstApp"
                    checked={field.value || false} // checkbox uses `checked`
                    onChange={(e) => field.onChange(e.target.checked)} // get boolean
                    onBlur={field.onBlur}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label htmlFor="gstApp" style={{ fontSize: "14px", lineHeight: "1.5", cursor: "pointer" }}>
                    GST Applicable
                  </label>
                </div>
              )}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <Controller
              control={control}
              name="cowCess"
              render={(field) => (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <input
                    value={field.value}
                    type="checkbox"
                    id="cowCess"
                    checked={field.value || false} // checkbox uses `checked`
                    onChange={(e) => field.onChange(e.target.checked)} // get boolean
                    onBlur={field.onBlur}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label htmlFor="cowCess" style={{ fontSize: "14px", lineHeight: "1.5", cursor: "pointer" }}>
                    Cow Cess Applicable
                  </label>
                </div>
              )}
            />
          </div>
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

export default CHBCitizenSecond;
