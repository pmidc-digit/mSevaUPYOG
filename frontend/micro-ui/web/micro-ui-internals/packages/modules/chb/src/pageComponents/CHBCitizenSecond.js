import React, { use, useEffect, useState } from "react";
import { TextInput, CardLabel, Dropdown, TextArea, ActionBar, SubmitBar, LabelFieldPair, UploadFile } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { Loader } from "../components/Loader";
import { parse, format } from "date-fns";

const CHBCitizenSecond = ({ onGoBack, goNext, currentStepData, t }) => {
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");
  const isCitizen = window.location.href.includes("citizen");
  const [getHallDetails, setHallDetails] = useState([]);
  const [getHallCodes, setHallCodes] = useState([]);
  const [getSlots, setSlots] = useState([]);
  const [loader, setLoader] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState(null);

  console.log("tenantId", tenantId);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    getValues,
    watch,
    trigger,
  } = useForm({
    defaultValues: {
      shouldUnregister: false,
      halls: [{ startDate: "", endDate: "", startTime: "", endTime: "" }], // predefine index 0
    },
  });

  const { data: CHBLocations = [], isLoading: CHBLocationLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [{ name: "Location" }]);
  const { data: CHBDetails = [], isLoading: CHBLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [{ name: "CommunityHalls" }]);
  const { data: CHBPurpose = [], isLoading: CHBPurposeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [{ name: "Purpose" }]);
  const { data: SpecialCategory = [], isLoading: CHBSpecialCategoryLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [
    { name: "SpecialCategory" },
  ]);
  const { data: CHBHallCode = [], isLoading: CHBHallCodeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [{ name: "HallCode" }]);
  const { data: CHBReason = [], isLoading: CHBReasonLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [{ name: "DiscountReason" }]);
  const { data: CHBCalculationType = [], isLoading: CHBCalcLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [{ name: "CalculationType" }]);

  const fiterHalls = (selected) => {
    const filteredHalls = CHBDetails?.CHB?.CommunityHalls?.filter((hall) => hall.locationCode === selected?.code) || [];
    setHallDetails(filteredHalls);
    const hallInfo = CHBHallCode?.CHB?.HallCode;
    const getHallCodesData = hallInfo?.filter((item) => item?.communityHallId == selected?.communityHallId);
    setHallCodes(getHallCodesData);
  };

  const slotsSearch = async (data) => {
    setLoader(true);

    const payload = {
      tenantId: tenantId,
      communityHallCode: data.communityHallId,
      hallCode: data?.HallCode,
      bookingStartDate: getValues()?.startDate,
      bookingEndDate: getValues()?.endDate,
      isTimerRequired: false,
    };
    try {
      const response = await Digit.CHBServices.slot_search({ filters: payload });

      setLoader(false);
      setSlots(response?.hallSlotAvailabiltityDetails);
      setShowInfo(true);
      return response;
    } catch (error) {
      console.log("error", error);
      setLoader(false);
    }
  };

  const onSubmit = (data) => {
    const userInfo = Digit.UserService.getUser()?.info || {};
    const now = Date.now();

    const additionalDetails = {
      // disImage: isCitizenDeclared, // ✅ always include this
      ...(data?.reason && { reason: data.reason }),
      ...(data?.discountAmount && { discountAmount: data.discountAmount }),
    };

    // Map booking slots from hall details
    const bookingSlotDetails = data?.slots?.map((slot) => {
      // find hall info for this slot
      const hallInfo = CHBHallCode?.CHB?.HallCode?.find((h) => h.HallCode === slot.hallCode);
      // parse from dd-MM-yyyy → format to yyyy-MM-dd
      const formattedDate = slot?.bookingDate ? format(parse(slot.bookingDate, "dd-MM-yyyy", new Date()), "yyyy-MM-dd") : null;

      return {
        bookingDate: formattedDate,
        bookingEndDate: formattedDate,
        bookingFromTime: slot?.fromTime || "00:00",
        bookingToTime: slot?.toTime || "23:59",
        hallCode: slot?.hallCode,
        status: "INITIATE",
        capacity: hallInfo?.capacity || null,
      };
    });

    // extract amount
    const match = CHBCalculationType.CHB.CalculationType?.find((item) => Object.keys(item).includes(getHallDetails?.[0]?.communityHallId));

    const amount = match?.[getHallDetails?.[0]?.communityHallId]?.[0]?.amount || null;
    const slotCount = Array.isArray(bookingSlotDetails) ? bookingSlotDetails.length : 0;

    // Convert amount to number safely
    const numericAmount = Number(amount) || 0;

    // Calculate final amount safely
    const finalAmount = numericAmount * slotCount;
    // console.log("purpose", purpose);
    const payload = {
      hallsBookingApplication: {
        tenantId,
        ...(additionalDetails && { additionalDetails }),
        bookingStatus: "INITIATED",
        applicationDate: now,
        communityHallCode: getHallDetails?.[0]?.communityHallId || "",
        communityHallName: data?.siteId?.name,
        purpose: {
          purpose: data?.purpose,
        },
        amount: finalAmount,
        specialCategory: { category: data?.specialCategory?.code },
        purposeDescription: data?.purposeDescription,
        bookingSlotDetails,
        owners: [
          {
            name: userInfo?.name,
            mobileNumber: userInfo?.mobileNumber,
            emailId: userInfo?.emailId,
            type: userInfo?.type,
          },
        ],
        workflow: {
          action: "INITIATE",
          businessService: "CommunityHallBooking",
          moduleName: "CommunityHallModule",
        },
      },
    };
    console.log("finalpayload", payload);
    goNext(payload);
  };

  useEffect(() => {
    const formattedData = currentStepData?.ownerDetails?.hallsBookingApplication;
    console.log("formattedData", formattedData);
    // Restore siteId and trigger hall filtering
    if (formattedData) {
      const communityHallsOptions = CHBLocations.CHB.CommunityHalls || [];
      const purposeOptions = CHBPurpose.CHB.Purpose || [];
      const specialCategoryOptions = SpecialCategory.CHB.SpecialCategory || [];
      const hallCodeOptions = CHBHallCode?.CHB?.HallCode;
      const discReasonOptions = CHBReason?.CHB?.DiscountReason;

      const selectedCommHall = communityHallsOptions?.find((item) => item?.communityHallId == formattedData?.communityHallCode);
      const selectedPurpose = purposeOptions?.find((item) => item?.code == formattedData?.purpose?.purpose?.code);
      const selectedSpecialCat = specialCategoryOptions?.find((item) => item?.code == formattedData?.specialCategory?.category);
      const selectHallCode = hallCodeOptions?.find((item) => item?.HallCode == formattedData?.bookingSlotDetails?.[0]?.hallCode);
      const selectReason = discReasonOptions?.find((item) => item?.reasonName == formattedData?.additionalDetails?.reason);

      setValue("siteId", selectedCommHall || null);
      setValue("hallCode", selectHallCode || null);
      setValue("startDate", formattedData?.bookingSlotDetails?.[0]?.bookingDate);
      setValue("endDate", formattedData?.bookingSlotDetails.at(-1)?.bookingEndDate);
      setShowInfo(true);
      fiterHalls(selectedCommHall);

      // call api to get the slots
      // slotsSearch(selectHallCode);

      slotsSearch(selectHallCode).then((response) => {
        const slotsData = response?.hallSlotAvailabiltityDetails || [];
        setSlots(slotsData);
        // Now set form value
        setValue("slots", slotsData);
      });

      setValue("purpose", selectedPurpose || null);
      setValue("specialCategory", selectedSpecialCat || null);
      setValue("purposeDescription", formattedData.purposeDescription || "");
      setValue("discountAmount", formattedData?.additionalDetails?.discountAmount || "");
      setValue("reason", formattedData?.additionalDetails?.reason || "");
      // disImage
    }
  }, [currentStepData, setValue]);

  const startDate = watch("startDate");

  return (
    <React.Fragment>
      <form className="employeeCard" onSubmit={handleSubmit(onSubmit)}>
        <div className="card">
          {/* SELECT_HALL_NAME */}
          <div className="label-field-pair">
            <CardLabel>
              {t("SELECT_HALL_NAME")} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field" style={{ width: "100%" }}>
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
                      fiterHalls(e);
                      // Reset dependent fields properly
                      setValue("hallCode", null);
                      setValue("startDate", "");
                      setValue("endDate", "");
                      setSlots([]); // also clear any previous slots
                      setShowInfo(false); // hide extra info until hallCode re-selected
                    }}
                    selected={props.value}
                    option={CHBLocations?.CHB?.CommunityHalls}
                    optionKey="name"
                  />
                )}
              />
              {errors.siteId && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.siteId.message}</p>}
            </div>
          </div>

          {/* SELECT_DATE */}
          <div className="label-field-pair" style={{ marginTop: "20px" }}>
            <CardLabel>
              {t("SELECT_DATE")} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field" style={{ width: "100%" }}>
              <Controller
                control={control}
                name={"startDate"}
                rules={{ required: t("START_DATE_REQ") }}
                render={(props) => (
                  <TextInput
                    style={{ marginBottom: 0 }}
                    type={"date"}
                    className="form-field"
                    value={props.value}
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                      setValue("endDate", "");
                      // reset({ endDate: "" });
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />
              {errors.startDate && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.startDate.message}</p>}
            </div>
          </div>

          {/* SELECT End DATE */}
          <div className="label-field-pair" style={{ marginTop: "20px" }}>
            <CardLabel>
              {t("SELECT_END_DATE")} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field" style={{ width: "100%" }}>
              <Controller
                control={control}
                name={"endDate"}
                // rules={{ required: t("END_DATE_REQ") }}
                rules={{
                  required: t("END_DATE_REQ"),
                  validate: (value) => {
                    if (!value || !startDate) return true;

                    const start = new Date(startDate);
                    const end = new Date(value);
                    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

                    if (daysDiff > 5) {
                      return t("END_DATE_MAX_5_DAYS");
                    }

                    return true;
                  },
                }}
                render={(props) => (
                  <TextInput
                    style={{ marginBottom: 0 }}
                    type={"date"}
                    className="form-field"
                    value={props.value}
                    min={
                      startDate
                        ? new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                    }
                    // max={startDate ? new Date(new Date(startDate).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : null}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                      trigger("endDate");
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disabled={!startDate}
                  />
                )}
              />
              {errors.endDate && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.endDate.message}</p>}
            </div>
          </div>

          {/* HALL_CODE */}
          <div className="label-field-pair" style={{ marginTop: "20px" }}>
            <CardLabel>
              {t("HALL_CODE")} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field" style={{ width: "100%" }}>
              <Controller
                control={control}
                name={"hallCode"}
                rules={{ required: t("HALL_CODE_REQ") }}
                render={(props) => (
                  <Dropdown
                    style={{ marginBottom: 0 }}
                    className="form-field"
                    select={(e) => {
                      props.onChange(e);
                      slotsSearch(e);
                    }}
                    selected={props.value}
                    option={getHallCodes}
                    optionKey="HallCode"
                    disable={errors.endDate || errors.startDate}
                  />
                )}
              />
              {errors.hallCode && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.hallCode.message}</p>}
            </div>
          </div>

          {/* AVAILABLE_SLOTS */}
          {getSlots?.length > 0 && (
            <div className="label-field-pair" style={{ marginTop: "20px", marginBottom: "20px" }}>
              <CardLabel>
                {t("AVAILABLE_SLOTS")} <span style={{ color: "red" }}>*</span>
              </CardLabel>
              <div className="form-field" style={{ width: "100%" }}>
                <Controller
                  control={control}
                  name="slots"
                  rules={{
                    validate: (value) => {
                      if (!value || value.length === 0) {
                        return t("PLEASE_SELECT_AT_LEAST_ONE_SLOT");
                      }
                      return true;
                    },
                  }}
                  render={(field) => (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "16px",
                        width: "100%",
                      }}
                    >
                    {getSlots?.map((slot, idx) => {
                      const slotKey = `${slot.hallCode}-${slot.bookingDate}-${slot.fromTime || ""}-${slot.toTime || ""}`;
                      const isChecked = field.value?.some(
                        (s) =>
                          s.hallCode === slot.hallCode &&
                          s.bookingDate === slot.bookingDate &&
                          s.fromTime === slot.fromTime &&
                          s.toTime === slot.toTime
                      );
                      const isAvailable = slot.slotStaus?.toLowerCase() === "available";

                      return (
                        <label
                          key={slotKey}
                          style={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "12px",
                            backgroundColor: isAvailable ? "#e6ffed" : "#ffe6e6",
                            cursor: isAvailable ? "pointer" : "not-allowed",
                            opacity: isAvailable ? 1 : 0.6,
                            // display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          {/* <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={!isAvailable}
                            onChange={(e) => {
                              if (!isAvailable) return;
                              if (e.target.checked) {
                                field.onChange([...(field.value || []), slot]);
                              } else {
                                field.onChange(
                                  (field.value || []).filter(
                                    (s) =>
                                      !(
                                        s.hallCode === slot.hallCode &&
                                        s.bookingDate === slot.bookingDate &&
                                        s.fromTime === slot.fromTime &&
                                        s.toTime === slot.toTime
                                      )
                                  )
                                );
                              }
                            }}
                          /> */}
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={!isAvailable}
                            onChange={(e) => {
                              if (!isAvailable) return;

                              let updatedSlots = [...(field.value || [])];

                              if (e.target.checked) {
                                // Add clicked slot
                                updatedSlots.push(slot);

                                // Sort slots by date and time for consistent order
                                const sortedSlots = [...getSlots].sort(
                                  (a, b) =>
                                    new Date(a.bookingDate) - new Date(b.bookingDate) || (a.fromTime || "00:00").localeCompare(b.fromTime || "00:00")
                                );

                                // Get indexes of selected slots
                                const allSelectedKeys = updatedSlots.map((s) => `${s.hallCode}-${s.bookingDate}-${s.fromTime}-${s.toTime}`);

                                const firstIndex = sortedSlots.findIndex(
                                  (s) => `${s.hallCode}-${s.bookingDate}-${s.fromTime}-${s.toTime}` === allSelectedKeys[0]
                                );
                                const lastIndex = sortedSlots.findIndex(
                                  (s) => `${s.hallCode}-${s.bookingDate}-${s.fromTime}-${s.toTime}` === allSelectedKeys[allSelectedKeys.length - 1]
                                );

                                // Automatically select all slots between first and last
                                const minIndex = Math.min(firstIndex, lastIndex);
                                const maxIndex = Math.max(firstIndex, lastIndex);

                                const continuousSlots = sortedSlots
                                  .slice(minIndex, maxIndex + 1)
                                  .filter((s) => s.slotStaus?.toLowerCase() === "available");

                                field.onChange(continuousSlots);
                              } else {
                                // Uncheck → remove that slot only
                                updatedSlots = updatedSlots.filter(
                                  (s) =>
                                    !(
                                      s.hallCode === slot.hallCode &&
                                      s.bookingDate === slot.bookingDate &&
                                      s.fromTime === slot.fromTime &&
                                      s.toTime === slot.toTime
                                    )
                                );
                                field.onChange(updatedSlots);
                              }
                            }}
                          />
                          <span style={{ marginLeft: "10px" }}>
                            {slot.bookingDate} ({slot.hallCode}) –{" "}
                            <span
                              style={{
                                color: slot.slotStaus === "AVAILABLE" ? "green" : "red",
                                fontWeight: "bold",
                              }}
                            >
                              {slot.slotStaus ? slot.slotStaus.charAt(0).toUpperCase() + slot.slotStaus.slice(1).toLowerCase() : ""}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
                {errors.slots && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.slots.message}</p>}
              </div>
            </div>
          )}

          <div style={{ display: showInfo ? "block" : "none" }}>
            {/* CHB_PURPOSE */}
            <div className="label-field-pair" style={{ marginTop: "20px" }}>
              <CardLabel>
                {t("CHB_PURPOSE")} <span style={{ color: "red" }}>*</span>
              </CardLabel>
              <div className="form-field" style={{ width: "100%" }}>
                <Controller
                  control={control}
                  name={"purpose"}
                  defaultValue={null}
                  rules={{ required: t("CHB_PURPOSE_REQUIRED") }}
                  render={(props) => (
                    <Dropdown
                      style={{ marginBottom: 0 }}
                      className="form-field"
                      select={props.onChange}
                      selected={props.value}
                      option={CHBPurpose?.CHB?.Purpose}
                      optionKey="name"
                    />
                  )}
                />
                {errors.purpose && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.purpose.message}</p>}
              </div>
            </div>

            {/* CHB_SPECIAL_CATEGORY */}
            <div className="label-field-pair" style={{ marginTop: "20px" }}>
              <CardLabel>
                {t("CHB_SPECIAL_CATEGORY")} <span style={{ color: "red" }}>*</span>
              </CardLabel>
              <div className="form-field" style={{ width: "100%" }}>
                <Controller
                  control={control}
                  name={"specialCategory"}
                  defaultValue={null}
                  rules={{ required: t("CHB_SPECIAL_CATEGORY_REQUIRED") }}
                  render={(props) => (
                    <Dropdown
                      style={{ marginBottom: 0 }}
                      className="form-field"
                      select={props.onChange}
                      selected={props.value}
                      option={SpecialCategory?.CHB?.SpecialCategory}
                      optionKey="name"
                    />
                  )}
                />
                {errors.specialCategory && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.specialCategory.message}</p>}
              </div>
            </div>

            {/* CHB_PURPOSE_DESCRIPTION */}
            <div className="label-field-pair" style={{ marginTop: "20px" }}>
              <CardLabel>
                {t("CHB_PURPOSE_DESCRIPTION")} <span style={{ color: "red" }}>*</span>
              </CardLabel>
              <div className="form-field" style={{ width: "100%" }}>
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
                      style={{ marginBottom: 0, marginTop: 0 }}
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
                {errors.purposeDescription && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.purposeDescription.message}</p>}
              </div>
            </div>

            {!isCitizen && (
              <React.Fragment>
                {/* Discount Amount */}
                <div style={{ marginBottom: "20px", width: "100%" }}>
                  <CardLabel>{`${t("CHB_DISCOUNT_AMOUNT")}`}</CardLabel>
                  <Controller
                    control={control}
                    name="discountAmount"
                    render={(props) => (
                      <TextInput
                        type="number"
                        style={{ marginBottom: 0, width: "100%" }}
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
                </div>

                {/* Discount Reason */}
                <div style={{ marginBottom: "20px", width: "100%" }}>
                  <CardLabel>{t("CHB_DISCOUNT_REASON")}</CardLabel>
                  <Controller
                    control={control}
                    name="reason"
                    render={(props) => (
                      <TextInput
                        type="text"
                        style={{ marginBottom: 0, width: "100%" }}
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
                  {/* <Controller
                    control={control}
                    name={"reason"}
                    defaultValue={null}
                    render={(props) => (
                      <Dropdown
                        t={t}
                        style={{ marginBottom: 0 }}
                        className="form-field"
                        select={props.onChange}
                        selected={props.value}
                        option={CHBReason?.CHB?.DiscountReason}
                        optionKey="reasonName"
                      />
                    )}
                  /> */}
                </div>
              </React.Fragment>
            )}
          </div>
        </div>

        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>

      {(CHBCalcLoading ||
        CHBReasonLoading ||
        CHBLocationLoading ||
        CHBLoading ||
        CHBPurposeLoading ||
        CHBSpecialCategoryLoading ||
        CHBHallCodeLoading ||
        loader) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default CHBCitizenSecond;
