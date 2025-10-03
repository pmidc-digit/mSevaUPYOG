import React, { use, useEffect, useState } from "react";
import { TextInput, CardLabel, Dropdown, TextArea, ActionBar, SubmitBar, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { Loader } from "../components/Loader";
import { parse, format } from "date-fns";

const CHBCitizenSecond = ({ onGoBack, goNext, currentStepData, t }) => {
  const [getHallDetails, setHallDetails] = useState([]);
  const [getHallCodes, setHallCodes] = useState([]);
  const [getSlots, setSlots] = useState([]);
  const [loader, setLoader] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

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
      halls: [{ startDate: "", endDate: "", startTime: "", endTime: "" }], // predefine index 0
    },
  });

  const { data: CHBLocations = [], isLoading: CHBLocationLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "Location" }]);
  const { data: CHBDetails = [], isLoading: CHBLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "CommunityHalls" }]);
  const { data: CHBPurpose = [], isLoading: CHBPurposeLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "Purpose" }]);
  const { data: SpecialCategory = [], isLoading: CHBSpecialCategoryLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "SpecialCategory" }]);
  const { data: CHBHallCode = [], isLoading: CHBHallCodeLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "HallCode" }]);

  console.log("CHBHallCode", CHBHallCode);

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
      communityHallCode: getValues()?.siteId?.code,
      hallCode: data?.HallCode,
      bookingStartDate: getValues()?.startDate,
      bookingEndDate: getValues()?.startDate,
      isTimerRequired: false,
    };
    try {
      const response = await Digit.CHBServices.slot_search({ filters: payload });
      setLoader(false);
      setSlots(response?.hallSlotAvailabiltityDetails);
      return response;
    } catch (error) {
      setLoader(false);
    }
  };

  const onSubmit = (data) => {
    console.log("data==??", data);
    const userInfo = Digit.UserService.getUser()?.info || {};
    const now = Date.now();

    // Map booking slots from hall details
    const bookingSlotDetails = data?.slots?.map((slot) => {
      // find hall info for this slot
      const hallInfo = CHBHallCode?.CHB?.HallCode?.find((h) => h.HallCode === slot.hallCode);
      // parse from dd-MM-yyyy → format to yyyy-MM-dd
      const formattedDate = slot?.bookingDate ? format(parse(slot.bookingDate, "dd-MM-yyyy", new Date()), "yyyy-MM-dd") : null;

      return {
        bookingDate: formattedDate,
        bookingEndDate: formattedDate,
        bookingFromTime: slot?.fromTime || "13:47",
        bookingToTime: slot?.toTime || "14:54",
        hallCode: slot?.hallCode,
        status: "INITIATE",
        capacity: hallInfo?.capacity || null,
      };
    });

    const payload = {
      hallsBookingApplication: {
        tenantId,
        bookingStatus: "INITIATED",
        applicationDate: now,
        communityHallCode: getHallDetails?.[0]?.communityHallId || "",
        purpose: {
          purpose: data?.purpose?.code,
        },
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
    console.log("payload", payload);
    // return;
    goNext(payload);
  };

  useEffect(() => {
    const formattedData = currentStepData?.ownerDetails?.hallsBookingApplication;

    // Restore siteId and trigger hall filtering
    if (formattedData) {
      const communityHallsOptions = CHBLocations.CHB.CommunityHalls || [];
      const purposeOptions = CHBPurpose.CHB.Purpose || [];
      const specialCategoryOptions = SpecialCategory.CHB.SpecialCategory || [];
      const hallCodeOptions = CHBHallCode?.CHB?.HallCode;

      const selectedCommHall = communityHallsOptions?.find((item) => item?.communityHallId == formattedData?.communityHallCode);
      const selectedPurpose = purposeOptions?.find((item) => item?.code == formattedData?.purpose?.purpose);
      const selectedSpecialCat = specialCategoryOptions?.find((item) => item?.code == formattedData?.specialCategory?.category);
      const selectHallCode = hallCodeOptions?.find((item) => item?.HallCode == formattedData?.bookingSlotDetails?.[0]?.hallCode);

      console.log("formattedData", formattedData);

      setValue("siteId", selectedCommHall || null);
      setValue("hallCode", selectHallCode || null);
      setValue("startDate", formattedData?.bookingSlotDetails?.[0]?.bookingDate);
      setShowInfo(true);
      fiterHalls(selectedCommHall);

      // call api to get the slots
      // slotsSearch(selectHallCode);

      slotsSearch(selectHallCode).then((response) => {
        console.log("response", response);
        const slotsData = response?.hallSlotAvailabiltityDetails || [];
        setSlots(slotsData);
        // Now set form value
        setValue("slots", slotsData);
      });

      setValue("purpose", selectedPurpose || null);
      setValue("specialCategory", selectedSpecialCat || null);
      setValue("purposeDescription", formattedData.purposeDescription || "");
    }
  }, [currentStepData, setValue]);

  useEffect(() => {
    console.log("getSlots", getSlots);
  }, [getSlots]);

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div>
            <CardLabel>
              Select Hall Name <span style={{ color: "red" }}>*</span>
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
                    fiterHalls(e);
                    setValue("hallCode", null);
                  }}
                  selected={props.value}
                  option={CHBLocations?.CHB?.CommunityHalls}
                  optionKey="name"
                />
              )}
            />
            {errors.siteId && <p style={{ color: "red" }}>{errors.siteId.message}</p>}
          </div>

          <LabelFieldPair style={{ marginTop: "20px" }}>
            <CardLabel>
              {t("Select Date")} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div style={{ width: "50%" }} className="field">
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
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />
              {errors.startDate && <p style={{ color: "red" }}>{errors.startDate.message}</p>}
            </div>
          </LabelFieldPair>

          <div style={{ marginTop: "20px" }}>
            <CardLabel>
              Hall Code <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <Controller
              control={control}
              name={"hallCode"}
              rules={{ required: t("HALL_CODE_REQ") }}
              render={(props) => (
                <Dropdown
                  style={{ marginBottom: 0 }}
                  className="form-field"
                  select={(e) => {
                    console.log("e", e);
                    props.onChange(e);
                    slotsSearch(e);
                    setShowInfo(true);
                  }}
                  selected={props.value}
                  option={getHallCodes}
                  optionKey="HallCode"
                />
              )}
            />
            {errors.hallCode && <p style={{ color: "red" }}>{errors.hallCode.message}</p>}
          </div>

          {getSlots?.length > 0 && (
            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
              <CardLabel>
                {t("Available Slots")} <span style={{ color: "red" }}>*</span>
              </CardLabel>

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
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {getSlots?.map((slot, idx) => {
                      const isChecked = field.value?.some((s) => s.hallCode === slot.hallCode);
                      console.log("isChecked", isChecked);
                      console.log("field.value", field);
                      console.log("slot", slot);
                      return (
                        <label key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...(field.value || []), slot]);
                              } else {
                                field.onChange((field.value || []).filter((s) => s.hallCode !== slot.hallCode));
                              }
                            }}
                          />
                          <span>
                            {slot.bookingDate} ({slot.hallCode}) – {slot.slotStaus}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />

              {errors.slots && <p style={{ color: "red" }}>{errors.slots.message}</p>}
            </div>
          )}

          <div style={{ display: showInfo ? "block" : "none" }}>
            {" "}
            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
              <CardLabel>
                {t("CHB_PURPOSE")} <span style={{ color: "red" }}>*</span>
              </CardLabel>
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
              {errors.purpose && <p style={{ color: "red" }}>{errors.purpose.message}</p>}
            </div>
            <div style={{ marginBottom: "20px" }}>
              <CardLabel>
                {t("CHB_SPECIAL_CATEGORY")} <span style={{ color: "red" }}>*</span>
              </CardLabel>
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
              {errors.specialCategory && <p style={{ color: "red" }}>{errors.specialCategory.message}</p>}
            </div>
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
        </div>
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>
      {(CHBLocationLoading || CHBLoading || CHBPurposeLoading || CHBSpecialCategoryLoading || CHBHallCodeLoading || loader) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default CHBCitizenSecond;
