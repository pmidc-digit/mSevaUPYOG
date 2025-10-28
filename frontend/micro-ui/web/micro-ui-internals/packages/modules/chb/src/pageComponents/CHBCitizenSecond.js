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
  const [uploadedFile, setUploadedFile] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

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

  const { data: CHBLocations = [], isLoading: CHBLocationLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [{ name: "Location" }]);
  const { data: CHBDetails = [], isLoading: CHBLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [{ name: "CommunityHalls" }]);
  const { data: CHBPurpose = [], isLoading: CHBPurposeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [{ name: "Purpose" }]);
  const { data: SpecialCategory = [], isLoading: CHBSpecialCategoryLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [
    { name: "SpecialCategory" },
  ]);
  const { data: CHBHallCode = [], isLoading: CHBHallCodeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [{ name: "HallCode" }]);
  const { data: CHBReason = [], isLoading: CHBReasonLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [{ name: "DiscountReason" }]);

  const fiterHalls = (selected) => {
    const filteredHalls = CHBDetails?.CHB?.CommunityHalls?.filter((hall) => hall.locationCode === selected?.code) || [];
    setHallDetails(filteredHalls);
    const hallInfo = CHBHallCode?.CHB?.HallCode;
    const getHallCodesData = hallInfo?.filter((item) => item?.communityHallId == selected?.communityHallId);
    setHallCodes(getHallCodesData);
  };

  const slotsSearch = async (data) => {
    setLoader(true);

    console.log("data", data);
    console.log("getValues", getValues());

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
      return response;
    } catch (error) {
      setLoader(false);
    }
  };

  const onSubmit = (data) => {
    console.log("data==??", data);
    console.log("uploadedFile==??", uploadedFile);
    const userInfo = Digit.UserService.getUser()?.info || {};
    const now = Date.now();

    const additionalDetails = { reason: data?.reason?.reasonName, discount: data?.discount, disImage: uploadedFile };

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

    const payload = {
      hallsBookingApplication: {
        tenantId,
        additionalDetails,
        bookingStatus: "INITIATED",
        applicationDate: now,
        communityHallCode: getHallDetails?.[0]?.communityHallId || "",
        communityHallName: data?.siteId?.name,
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

  function selectfile(e) {
    setFile(e.target.files[0]);
  }

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        if (file.size >= 5242880) {
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
          // if (!formState.errors[config.key]) setFormError(config.key, { type: doc?.code });
        } else {
          setLoader(true);
          try {
            setUploadedFile(null);
            const response = await Digit.UploadServices.Filestorage("CHB", file, Digit.ULBService.getStateId());
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"));
            }
            setLoader(false);
          } catch (err) {
            setLoader(false);
            setError(t("CS_FILE_UPLOAD_ERROR"));
          }
        }
      }
    })();
  }, [file]);

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          {/* SELECT_HALL_NAME */}
          <div>
            <CardLabel>
              {t("SELECT_HALL_NAME")} <span style={{ color: "red" }}>*</span>
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
                    // Reset dependent fields properly
                    setValue("hallCode", null);
                    setValue("startDate", "");
                    setSlots([]); // also clear any previous slots
                    setShowInfo(false); // hide extra info until hallCode re-selected
                  }}
                  selected={props.value}
                  option={CHBLocations?.CHB?.CommunityHalls}
                  optionKey="name"
                />
              )}
            />
            {errors.siteId && <p style={{ color: "red" }}>{errors.siteId.message}</p>}
          </div>

          {/* SELECT_DATE */}
          <LabelFieldPair style={{ marginTop: "20px" }}>
            <CardLabel>
              {t("SELECT_DATE")} <span style={{ color: "red" }}>*</span>
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

          {/* SELECT End DATE */}
          <LabelFieldPair style={{ marginTop: "20px" }}>
            <CardLabel>
              {t("SELECT_END_DATE")} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div style={{ width: "50%" }} className="field">
              <Controller
                control={control}
                name={"endDate"}
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
            </div>
          </LabelFieldPair>

          {/* HALL_CODE */}
          <div style={{ marginTop: "20px" }}>
            <CardLabel>
              {t("HALL_CODE")} <span style={{ color: "red" }}>*</span>
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

          {/* AVAILABLE_SLOTS */}
          {getSlots?.length > 0 && (
            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
              <CardLabel>
                {t("AVAILABLE_SLOTS")} <span style={{ color: "red" }}>*</span>
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
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: "16px",
                      marginTop: "20px",
                      width: "50%",
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
                          <input
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

              {errors.slots && <p style={{ color: "red" }}>{errors.slots.message}</p>}
            </div>
          )}

          <div style={{ display: showInfo ? "block" : "none" }}>
            {/* CHB_PURPOSE */}
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

            {/* CHB_SPECIAL_CATEGORY */}
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
            {!isCitizen && (
              <React.Fragment>
                {/* Discount Amount */}
                <div style={{ marginBottom: "20px", width: "50%" }}>
                  <CardLabel>{`${t("CHB_DISCOUNT_AMOUNT")}`}</CardLabel>
                  <Controller
                    control={control}
                    name="discount"
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
                <div style={{ marginBottom: "20px" }}>
                  <CardLabel>
                    {t("CHB_DISCOUNT_REASON")} <span style={{ color: "red" }}>*</span>
                  </CardLabel>
                  <Controller
                    control={control}
                    name={"reason"}
                    defaultValue={null}
                    render={(props) => (
                      <Dropdown
                        style={{ marginBottom: 0 }}
                        className="form-field"
                        select={props.onChange}
                        selected={props.value}
                        option={CHBReason?.CHB?.DiscountReason}
                        optionKey="reasonName"
                      />
                    )}
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <CardLabel>{t("CHB_REAS_IMAGE")}</CardLabel>
                  <div className="field">
                    <UploadFile
                      onUpload={selectfile}
                      onDelete={() => {
                        setUploadedFile(null);
                      }}
                      // id={id}
                      message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
                      textStyles={{ width: "100%" }}
                      inputStyles={{ width: "280px" }}
                      accept=".pdf, .jpeg, .jpg, .png" //  to accept document of all kind
                      buttonType="button"
                      error={!uploadedFile}
                    />
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>
      {(CHBReasonLoading || CHBLocationLoading || CHBLoading || CHBPurposeLoading || CHBSpecialCategoryLoading || CHBHallCodeLoading || loader) && (
        <Loader page={true} />
      )}
    </React.Fragment>
  );
};

export default CHBCitizenSecond;
