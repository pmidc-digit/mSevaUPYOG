import React, { use, useEffect, useState } from "react";
import { TextInput, CardLabel, Dropdown, TextArea, ActionBar, SubmitBar, LabelFieldPair, UploadFile } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { Loader } from "../components/Loader";
import { parse, format } from "date-fns";

const CHBCitizenSecond = ({ onGoBack, goNext, currentStepData, t }) => {
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");
  const isCitizen = window.location.href.includes("citizen");

  const [loader, setLoader] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    getValues,
    watch,
  } = useForm({
    defaultValues: {
      shouldUnregister: false,
      halls: [{ startDate: "", endDate: "", startTime: "", endTime: "" }], // predefine index 0
    },
  });

  const onSubmit = (data) => {
    console.log("data", data);
    return;
    goNext(payload);
  };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          {/* SELECT_HALL_NAME */}
          <div>
            <CardLabel>
              {t("GARBAGE_COLLECTION")} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <Controller
              control={control}
              name={"siteId"}
              rules={{ required: t("HALL_NAME_REQ") }}
              render={(props) => (
                <Dropdown
                  style={{ marginBottom: 0 }}
                  className="form-field"
                  select={(e) => {
                    props.onChange(e);
                  }}
                  selected={props.value}
                  option={[]}
                  optionKey="name"
                  t={t}
                />
              )}
            />
            {errors.siteId && <p style={{ color: "red" }}>{errors.siteId.message}</p>}
          </div>
        </div>

        <ActionBar>
          <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />

          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>

      {loader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default CHBCitizenSecond;
