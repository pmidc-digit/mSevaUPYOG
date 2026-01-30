import React, { use, useEffect, useState } from "react";
import { TextInput, CardLabel, Dropdown, TextArea, ActionBar, SubmitBar, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { Loader } from "../components/Loader";
import { parse, format } from "date-fns";

const OffenceDetails = ({ onGoBack, goNext, currentStepData, t }) => {
  const [loader, setLoader] = useState(false);

  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");

  const { data: categoryData, isLoading: categoryLoading } = Digit.Hooks.useCustomMDMS(tenantId, "Challan", [{ name: "Category" }]);
  const { data: subCategoryData, isLoading: subCategoryLoading } = Digit.Hooks.useCustomMDMS(tenantId, "Challan", [{ name: "SubCategory" }]);
  const { data: OffenceTypeData, isLoading: OffenceTypeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "Challan", [{ name: "OffenceType" }]);

  console.log("categoryData====", categoryData, subCategoryData, OffenceTypeData);

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
          {/* offence type */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {t("CHB_PURPOSE_DESCRIPTION")} <span className="requiredField">*</span>
            </CardLabel>
            <Controller
              control={control}
              name={"offenceType"}
              defaultValue={null}
              // rules={{ required: t("CHALLAN_TYPE_OFFENCE_REQUIRED") }}
              render={(props) => (
                <Dropdown
                 
                  className="form-field"
                  select={props.onChange}
                  selected={props.value}
                  option={OffenceTypeData?.Challan?.OffenceType}
                  optionKey="name"
                  t={t}
                />
              )}
            />
            {errors.offenceType && <p className="requiredField">{errors.offenceType.message}</p>}
          </LabelFieldPair>

          {/* Offence Category */}
          <LabelFieldPair>
            <CardLabel>
              {t("CHALLAN_OFFENCE_CATEGORY")} <span className="requiredField">*</span>
            </CardLabel>
            <Controller
              control={control}
              name={"offenceCategory"}
              defaultValue={null}
              // rules={{ required: t("CHALLAN_OFFENCE_CATEGORY_REQUIRED") }}
              render={(props) => (
                <Dropdown
                 
                  className="form-field"
                  select={props.onChange}
                  selected={props.value}
                  option={categoryData?.Challan?.Category}
                  optionKey="name"
                  t={t}
                />
              )}
            />
            {errors.offenceCategory && <p className="requiredField">{errors.offenceCategory.message}</p>}
          </LabelFieldPair>

          {/* Offence Subcategory */}
          <LabelFieldPair>
            <CardLabel>
              {t("CHALLAN_OFFENCE_SUB_CATEGORY")} <span className="requiredField">*</span>
            </CardLabel>
            <Controller
              control={control}
              name={"offenceSubCategory"}
              defaultValue={null}
              // rules={{ required: t("CHALLAN_OFFENCE_SUB_CATEGORY_REQUIRED") }}
              render={(props) => (
                <Dropdown
                 
                  className="form-field"
                  select={props.onChange}
                  selected={props.value}
                  option={subCategoryData?.Challan?.SubCategory}
                  optionKey="name"
                  t={t}
                />
              )}
            />
            {errors.offenceSubCategory && <p className="requiredField">{errors.offenceSubCategory.message}</p>}
          </LabelFieldPair>

          {/* Challan Amount */}
          <LabelFieldPair className="challan-amount-field" >
            <CardLabel>
              {`${t("CHALLAN_AMOUNT")}`} <span className="requiredField">*</span>
            </CardLabel>
            <Controller
              control={control}
              name="challanAmount"
              // rules={{
              //   required: t("CHALLAN_AMOUNT_REQUIRED"),
              // }}
              render={(props) => (
                <TextInput
                 
                  value={props.value}
                  error={errors?.name?.message}
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
            {errors?.challanAmount && <p className="requiredField">{errors.challanAmount.message}</p>}
          </LabelFieldPair>
        </div>
        <ActionBar>
          <SubmitBar className="submit-bar-back" label="Back" onSubmit={onGoBack} />
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>
      {(loader || categoryLoading || subCategoryLoading || OffenceTypeLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default OffenceDetails;
