import React, { useEffect, useState } from "react";
import { TextInput, CardLabel, Dropdown, TextArea, ActionBar, SubmitBar, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

const Breed_Type = [{ i18nKey: `PTR_GENDER`, code: `123`, name: `test` }];

const CHBCitizenSecond = ({ onGoBack, goNext, currentStepData, t }) => {
  const [getHallDetails, setHallDetails] = useState([]);

  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const { data: CHBLocations = [], isLoading: CHBLocationLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "Location" }]);
  const { data: CHBDetails = [], isLoading: CHBLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "CommunityHalls" }]);
  const { data: CHBPurpose = [], isLoading: CHBPurposeLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "Purpose" }]);
  const { data: SpecialCategory = [], isLoading: CHBSpecialCategoryLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "SpecialCategory" }]);

  const fiterHalls = (selected) => {
    const filteredHalls = CHBDetails?.CHB?.CommunityHalls?.filter((hall) => hall.locationCode === selected.code) || [];
    setHallDetails(filteredHalls);
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

    console.log("getHallDetails", getHallDetails);

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
    goNext(payload);
  };

  useEffect(() => {
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
          <div>
            <CardLabel>
              Search By site id <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <Controller
              control={control}
              name={"siteId"}
              rules={{ required: "Site Selection is Required" }}
              render={(props) => (
                <Dropdown
                  style={{ marginBottom: 0 }}
                  className="form-field"
                  select={(e) => {
                    props.onChange(e);
                    fiterHalls(e);
                  }}
                  selected={props.value}
                  option={CHBLocations?.CHB?.Location}
                  optionKey="name"
                />
              )}
            />
            {errors.siteId && <p style={{ color: "red" }}>{errors.siteId.message}</p>}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: "20px", marginTop: "20px" }}>
            {getHallDetails?.map((ad, idx) => (
              <div
                key={idx}
                style={{
                  width: 280,
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 8,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {/* title & meta */}
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: "1.1" }}>{ad.name}</div>
                  <div style={{ marginTop: 6, fontSize: 12, color: "#666", display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 8px" }}>
                    <div style={{ fontWeight: 600 }}>Type:</div>
                    <div>{ad.type}</div>

                    <div style={{ fontWeight: 600 }}>Contact Details:</div>
                    <div>{ad.contactDetails}</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 11, color: "#666" }}>Start</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div>
                      <Controller
                        control={control}
                        name={`halls.${idx}.startDate`}
                        rules={{ required: "Start Date is Required" }}
                        render={(props) => (
                          <input
                            type="date"
                            min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                            style={{ flex: 1, padding: "6px 8px", fontSize: 12, borderRadius: 4, border: "1px solid #ddd" }}
                            onChange={(e) => {
                              props.onChange(e.target.value);
                              updateHall(idx, { startDate: e.target.value });
                            }}
                          />
                        )}
                      />
                      {errors.halls?.[idx]?.startDate && <p style={{ color: "red", fontSize: 11 }}>{errors.halls[idx].startDate.message}</p>}
                    </div>

                    <div>
                      <Controller
                        control={control}
                        name={`halls.${idx}.startTime`}
                        rules={{ required: "Start Time is Required" }}
                        render={(props) => (
                          <input
                            type="time"
                            style={{ width: 100, padding: "6px 8px", fontSize: 12, borderRadius: 4, border: "1px solid #ddd" }}
                            value={props.value || ""}
                            onChange={(e) => {
                              props.onChange(e.target.value);
                              updateHall(idx, { startTime: e.target.value });
                            }}
                          />
                        )}
                      />
                      {errors.halls?.[idx]?.startTime && <p style={{ color: "red", fontSize: 11 }}>{errors.halls[idx].startTime.message}</p>}
                    </div>
                  </div>

                  <div style={{ height: 8 }} />

                  <div style={{ fontSize: 11, color: "#666" }}>End</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div>
                      <Controller
                        control={control}
                        name={`halls.${idx}.endDate`}
                        rules={{ required: "End Date is Required" }}
                        render={(props) => (
                          <input
                            type="date"
                            // min={getHallDetails[idx]?.startDate || new Date().toISOString().split("T")[0]} // disable before startDate
                            min={
                              getHallDetails[idx]?.startDate
                                ? new Date(new Date(getHallDetails[idx].startDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                                : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                            } // disable before startDate
                            style={{ flex: 1, padding: "6px 8px", fontSize: 12, borderRadius: 4, border: "1px solid #ddd" }}
                            value={props.value || ""}
                            onChange={(e) => {
                              props.onChange(e.target.value);
                              updateHall(idx, { endDate: e.target.value });
                            }}
                          />
                        )}
                      />
                      {errors.halls?.[idx]?.endDate && <p style={{ color: "red", fontSize: 11 }}>{errors.halls[idx].endDate.message}</p>}
                    </div>

                    <div>
                      <Controller
                        control={control}
                        name={`halls.${idx}.endTime`}
                        rules={{ required: "End Time is Required" }}
                        render={(props) => (
                          <input
                            type="time"
                            style={{ width: 100, padding: "6px 8px", fontSize: 12, borderRadius: 4, border: "1px solid #ddd" }}
                            onChange={(e) => {
                              props.onChange(e.target.value);
                              updateHall(idx, { endTime: e.target.value });
                            }}
                          />
                        )}
                      />

                      {errors.halls?.[idx]?.endTime && <p style={{ color: "red", fontSize: 11 }}>{errors.halls[idx].endTime.message}</p>}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Hint: Pick Date & Time (Min: Tomorrow)</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "20px" }}>
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
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>
    </React.Fragment>
  );
};

export default CHBCitizenSecond;
