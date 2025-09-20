import React, { useEffect } from "react";
import {
  CardLabel,
  TextInput,
  ActionBar,
  SubmitBar,
} from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

const ADSPenalty = ({ t, goNext, currentStepData, onGoBack }) => {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      penalty: "No",
      penaltyAmount: "",
      referenceId: "",
    },
  });

  const penaltyValue = watch("penalty");

  useEffect(() => {
    if (currentStepData) {
      // Populate from existing penalty object in Redux
      Object.entries(currentStepData).forEach(([key, value]) => {
        setValue(key, value ?? "");
      });
    }
  }, [currentStepData, setValue]);

  const onSubmit = (data) => {
    // If penalty is No, clear other fields
    if (data.penalty === "No") {
      data.penaltyAmount = "";
      data.referenceId = "";
    }
    goNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Penalty Radio */}
      <CardLabel>{t("Penalty")}</CardLabel>
      <Controller
        name="penalty"
        control={control}
        render={(props) => (
          <div style={{ display: "flex", gap: "20px" }}>
            <label>
              <input
                type="radio"
                value="Yes"
                checked={props.value === "Yes"}
                onChange={() => props.onChange("Yes")}
              />{" "}
              Yes
            </label>
            <label>
              <input
                type="radio"
                value="No"
                checked={props.value === "No"}
                onChange={() => props.onChange("No")}
              />{" "}
              No
            </label>
          </div>
        )}
      />

      {/* Penalty Amount */}
      <CardLabel>{t("Penalty Amount")}</CardLabel>
      <Controller
        name="penaltyAmount"
        control={control}
        rules={{
          validate: (val) =>
            penaltyValue === "No" || !!val || t("This field is required"),
        }}
        render={(props) => (
          <TextInput
            value={props.value ?? ""}
            onChange={(e) => props.onChange(e.target.value)}
            disabled={penaltyValue !== "Yes"}
            t={t}
          />
        )}
      />
      {errors.penaltyAmount && (
        <p style={{ color: "red" }}>{errors.penaltyAmount.message}</p>
      )}

      {/* Reference ID */}
      <CardLabel>{t("Reference ID")}</CardLabel>
      <Controller
        name="referenceId"
        control={control}
        rules={{
          validate: (val) =>
            penaltyValue === "No" || !!val || t("This field is required"),
        }}
        render={(props) => (
          <TextInput
            value={props.value ?? ""}
            onChange={(e) => props.onChange(e.target.value)}
            disabled={penaltyValue !== "Yes"}
            t={t}
          />
        )}
      />
      {errors.referenceId && (
        <p style={{ color: "red" }}>{errors.referenceId.message}</p>
      )}

      <ActionBar>
        <SubmitBar
          style={{
            background: "white",
            color: "black",
            border: "1px solid",
            marginRight: "10px",
          }}
          label="Back"
          onSubmit={handleSubmit((data) => {
            if (data.penalty === "No") {
              data.penaltyAmount = "";
              data.referenceId = "";
            }
            onGoBack(data);
          })}
        />
        <SubmitBar label="Next" submit="submit" />
      </ActionBar>
    </form>
  );
};

export default ADSPenalty;
