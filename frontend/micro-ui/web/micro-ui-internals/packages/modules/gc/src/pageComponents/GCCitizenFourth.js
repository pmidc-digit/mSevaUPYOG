import React, { useEffect } from "react";
import { TextInput, CardLabel, Dropdown, TextArea, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

const Breed_Type = [{ i18nKey: `PTR_GENDER`, code: `123`, name: `test` }];

const GCCitizenFourth = ({ onGoBack, goNext, currentStepData, t }) => {
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
          <div style={{ marginTop: "20px" }}>
            <Controller
              control={control}
              name="paymentReminders"
              render={(field) => (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <input
                    value={field.value}
                    type="checkbox"
                    id="paymentReminders"
                    checked={field.value || false} // checkbox uses `checked`
                    onChange={(e) => field.onChange(e.target.checked)} // get boolean
                    onBlur={field.onBlur}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label htmlFor="paymentReminders" style={{ fontSize: "14px", lineHeight: "1.5", cursor: "pointer" }}>
                    {t("Payment_Reminders")}
                  </label>
                </div>
              )}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <Controller
              control={control}
              name="overdueNotices"
              render={(field) => (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <input
                    value={field.value}
                    type="checkbox"
                    id="overdueNotices"
                    checked={field.value || false} // checkbox uses `checked`
                    onChange={(e) => field.onChange(e.target.checked)} // get boolean
                    onBlur={field.onBlur}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label htmlFor="overdueNotices" style={{ fontSize: "14px", lineHeight: "1.5", cursor: "pointer" }}>
                    {t("Overdue_Notices")}
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

export default GCCitizenFourth;
