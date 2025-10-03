import React, { useEffect, useState } from "react";
import { TextInput, CardLabel, Dropdown, TextArea, ActionBar, SubmitBar, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { Loader } from "../components/Loader";

const Breed_Type = [{ i18nKey: `PTR_GENDER`, code: `123`, name: `test` }];

const CHBCitizenSecond = ({ onGoBack, goNext, currentStepData, t }) => {
  const [getHallDetails, setHallDetails] = useState([]);
  const [getHallCodes, setHallCodes] = useState([]);
  const [getSlots, setSlots] = useState([]);
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
      halls: [{ startDate: "", endDate: "", startTime: "", endTime: "" }], // predefine index 0
    },
  });

  const { data: CHBLocations = [], isLoading: CHBLocationLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "Location" }]);
  const { data: CHBDetails = [], isLoading: CHBLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "CommunityHalls" }]);
  const { data: CHBPurpose = [], isLoading: CHBPurposeLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "Purpose" }]);
  const { data: SpecialCategory = [], isLoading: CHBSpecialCategoryLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "SpecialCategory" }]);
  const { data: CHBHallCode = [], isLoading: CHBHallCodeLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "HallCode" }]);

  const fiterHalls = (selected) => {
    console.log("selected", selected);
    const filteredHalls = CHBDetails?.CHB?.CommunityHalls?.filter((hall) => hall.locationCode === selected.code) || [];
    setHallDetails(filteredHalls);
    const hallInfo = CHBHallCode?.CHB?.HallCode;
    const getHallCodesData = hallInfo?.filter((item) => item?.communityHallId == selected?.communityHallId);
    console.log("getHallCodesData", getHallCodesData);
    setHallCodes(getHallCodesData);
  };

  const slotsSearch = async (data) => {
    setLoader(true);
    console.log("data", data);
    console.log("getValues", getValues());

    const payload = {
      tenantId: tenantId,
      communityHallCode: getValues()?.siteId?.code,
      hallCode: data?.HallCode,
      bookingStartDate: getValues()?.startDate,
      bookingEndDate: getValues()?.startDate,
      isTimerRequired: false,
    };
    console.log("payload", payload);
    const response = await Digit.CHBServices.slot_search({ filters: payload });
    setLoader(false);
    setSlots(response?.hallSlotAvailabiltityDetails);
    console.log("res", response?.hallSlotAvailabiltityDetails);
  };

  const updateHall = (idx, updates) => {
    setHallDetails((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], ...updates };
      return updated;
    });
  };

  const onSubmit = (data) => {
    console.log("data===", data);

    const userInfo = Digit.UserService.getUser()?.info || {};
    const now = Date.now();

    // Map booking slots from hall details
    const bookingSlotDetails = getHallDetails?.map((hall, idx) => ({
      bookingDate: data?.halls?.[idx]?.startDate,
      bookingEndDate: data?.halls?.[idx]?.endDate,
      bookingFromTime: data?.halls?.[idx]?.startTime,
      bookingToTime: data?.halls?.[idx]?.endTime,
      hallCode: hall?.code || hall?.communityHallId,
      status: "INITIATE",
      capacity: "50",
    }));

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
    return;
    goNext(payload);
  };

  useEffect(() => {
    const formattedData = currentStepData?.ownerDetails?.hallsBookingApplication;

    // Restore siteId and trigger hall filtering
    if (formattedData) {
      const locationOptions = CHBLocations.CHB.Location || [];
      const purposeOptions = CHBPurpose.CHB.Purpose || [];
      const specialCategoryOptions = SpecialCategory.CHB.SpecialCategory || [];

      const selectedLoc = locationOptions?.find((item) => item.code == formattedData?.bookingSlotDetails?.[0]?.hallCode);
      const selectedPurpose = purposeOptions?.find((item) => item.code == formattedData?.purpose?.purpose);
      const selectedSpecialCat = specialCategoryOptions?.find((item) => item.code == formattedData?.specialCategory?.category);

      fiterHalls(selectedLoc);

      formattedData?.bookingSlotDetails?.forEach((slot, idx) => {
        reset({
          siteId: selectedLoc || null,
          purpose: selectedPurpose || null,
          specialCategory: selectedSpecialCat || null,
          purposeDescription: formattedData.purposeDescription || "",
          halls: [{ startDate: slot.bookingDate, endDate: slot.bookingEndDate, startTime: slot.bookingFromTime, endTime: slot.bookingToTime }],
        });

        // Also sync with hall state
        updateHall(idx, {
          startDate: slot.bookingDate,
          endDate: slot.bookingEndDate,
          startTime: slot.bookingFromTime,
          endTime: slot.bookingToTime,
        });
      });
    }
  }, [currentStepData, setValue]);

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
              rules={{ required: "Hall Name is Required" }}
              render={(props) => (
                <Dropdown
                  style={{ marginBottom: 0 }}
                  className="form-field"
                  select={(e) => {
                    props.onChange(e);
                    fiterHalls(e);
                    // setHallCodes([]);
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
                rules={{ required: "Start Date is Required" }}
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
              rules={{ required: "Hall Code is Required" }}
              render={(props) => (
                <Dropdown
                  style={{ marginBottom: 0 }}
                  className="form-field"
                  select={(e) => {
                    props.onChange(e);
                    slotsSearch(e);
                    // fiterHalls(e);
                  }}
                  selected={props.value}
                  option={getHallCodes}
                  optionKey="HallCode"
                />
              )}
            />
            {errors.hallCode && <p style={{ color: "red" }}>{errors.hallCode.message}</p>}
          </div>

          {/* select slots rows */}
          {getSlots?.length > 0 && (
            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
              <CardLabel>
                {t("Available Slots")} <span style={{ color: "red" }}>*</span>
              </CardLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {getSlots?.map((slot, idx) => (
                  <Controller
                    key={idx}
                    control={control}
                    name={`slots`}
                    render={(field) => {
                      const isChecked = field.value?.some((s) => s.hallCode === slot.hallCode);
                      return (
                        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {getSlots?.length > 0 && (
            <div>
              {" "}
              <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                <CardLabel>
                  {t("CHB_PURPOSE")} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <Controller
                  control={control}
                  name={"purpose"}
                  rules={{ required: "CHB_PURPOSE_REQUIRED" }}
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
                  rules={{ required: "CHB_SPECIAL_CATEGORY_REQUIRED" }}
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
                    rules={{
                      required: "CHB_PURPOSE_DESCRIPTION_REQUIRED",
                      minLength: { value: 5, message: "CHB_PURPOSE_DESCRIPTION_REQUIRED_MIN" },
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
          )}
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
