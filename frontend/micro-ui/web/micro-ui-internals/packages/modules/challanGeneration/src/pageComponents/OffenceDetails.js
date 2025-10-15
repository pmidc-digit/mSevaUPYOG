import React, { use, useEffect, useState } from "react";
import { TextInput, CardLabel, Dropdown, TextArea, ActionBar, SubmitBar, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { Loader } from "../components/Loader";
import { parse, format } from "date-fns";

const OffenceDetails = ({ onGoBack, goNext, currentStepData, t }) => {
  const [loader, setLoader] = useState(false);

  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      shouldUnregister: false,
      // halls: [{ startDate: "", endDate: "", startTime: "", endTime: "" }], // predefine index 0
    },
  });

  const onSubmit = (data) => {
    goNext(data);
    // console.log("data==??", data);
    // const userInfo = Digit.UserService.getUser()?.info || {};
    // const now = Date.now();

    // // Map booking slots from hall details
    // const bookingSlotDetails = data?.slots?.map((slot) => {
    //   // find hall info for this slot
    //   const hallInfo = CHBHallCode?.CHB?.HallCode?.find((h) => h.HallCode === slot.hallCode);
    //   // parse from dd-MM-yyyy → format to yyyy-MM-dd
    //   const formattedDate = slot?.bookingDate ? format(parse(slot.bookingDate, "dd-MM-yyyy", new Date()), "yyyy-MM-dd") : null;

    //   return {
    //     bookingDate: formattedDate,
    //     bookingEndDate: formattedDate,
    //     bookingFromTime: slot?.fromTime || "13:47",
    //     bookingToTime: slot?.toTime || "14:54",
    //     hallCode: slot?.hallCode,
    //     status: "INITIATE",
    //     capacity: hallInfo?.capacity || null,
    //   };
    // });

    // const payload = {
    //   hallsBookingApplication: {
    //     tenantId,
    //     bookingStatus: "INITIATED",
    //     applicationDate: now,
    //     communityHallCode: getHallDetails?.[0]?.communityHallId || "",
    //     communityHallName: data?.siteId?.name,
    //     purpose: {
    //       purpose: data?.purpose?.code,
    //     },
    //     specialCategory: { category: data?.specialCategory?.code },
    //     purposeDescription: data?.purposeDescription,
    //     bookingSlotDetails,
    //     owners: [
    //       {
    //         name: userInfo?.name,
    //         mobileNumber: userInfo?.mobileNumber,
    //         emailId: userInfo?.emailId,
    //         type: userInfo?.type,
    //       },
    //     ],
    //     workflow: {
    //       action: "INITIATE",
    //       businessService: "CommunityHallBooking",
    //       moduleName: "CommunityHallModule",
    //     },
    //   },
    // };
    // console.log("payload", payload);
    // // return;
    // goNext(payload);
  };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {t("CHB_PURPOSE_DESCRIPTION")} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"purposeDescription"}
                defaultValue=""
                rules={{
                  required: t("CHB_PURPOSE_DESCRIPTION_REQUIRED"),
                  minLength: { value: 5, message: t("CHB_PURPOSE_DESCRIPTION_REQUIRED_MIN") },
                }}
                render={(props) => (
                  <TextArea
                    style={{ marginBottom: 0 }}
                    type={"textarea"}
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
              {errors.purposeDescription && <p style={{ color: "red" }}>{errors.purposeDescription.message}</p>}
            </div>
          </LabelFieldPair>
        </div>
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>
      {loader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default OffenceDetails;
