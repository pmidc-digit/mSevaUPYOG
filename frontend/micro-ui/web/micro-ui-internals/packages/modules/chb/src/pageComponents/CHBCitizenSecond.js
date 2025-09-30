import React, { useEffect, useState } from "react";
import { TextInput, CardLabel, Dropdown, TextArea, ActionBar, SubmitBar, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

const Breed_Type = [{ i18nKey: `PTR_GENDER`, code: `123`, name: `test` }];

const CHBCitizenSecond = ({ onGoBack, goNext, currentStepData, t }) => {
  const [getHallDetails, setHallDetails] = useState([]);

  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");

  const { control, handleSubmit, setValue } = useForm();

  const { data: CHBLocations = [], isLoading: CHBLocationLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "Location" }]);

  const { data: CHBDetails = [], isLoading: CHBLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "CommunityHalls" }]);
  const { data: CHBPurpose = [], isLoading: CHBPurposeLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "Purpose" }]);
  const { data: SpecialCategory = [], isLoading: CHBSpecialCategoryLoading } = Digit.Hooks.useCustomMDMS("pb", "CHB", [{ name: "SpecialCategory" }]);

  const onSubmit = async (data) => {
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
        specialCategory: data?.specialCategory?.code,
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
    // goNext(data);
    return;
    const response = await Digit.CHBServices.create(payload);
    console.log("response===", response);
    goNext(data);
  };

  useEffect(() => {
    console.log("getHallDetails", getHallDetails);
    console.log("SpecialCategory", SpecialCategory);
  }, [getHallDetails, SpecialCategory]);

  useEffect(() => {
    const formattedData = currentStepData?.venueDetails;
    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);

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

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <CardLabel>
            Search By site id <span style={{ color: "red" }}>*</span>
          </CardLabel>
          <Controller
            control={control}
            name={"siteId"}
            render={(props) => (
              <Dropdown
                className="form-field"
                select={(e) => {
                  props.onChange;
                  fiterHalls(e);
                }}
                selected={props.value}
                option={CHBLocations?.CHB?.Location}
                optionKey="name"
              />
            )}
          />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: "20px" }}>
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
                    <Controller
                      control={control}
                      name={`halls.${idx}.startDate`}
                      render={(props) => (
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]} // disable past dates
                          style={{ flex: 1, padding: "6px 8px", fontSize: 12, borderRadius: 4, border: "1px solid #ddd" }}
                          onChange={(e) => {
                            props.onChange(e.target.value);
                            updateHall(idx, { startDate: e.target.value });
                          }}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name={`halls.${idx}.startTime`}
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
                  </div>

                  <div style={{ height: 8 }} />

                  <div style={{ fontSize: 11, color: "#666" }}>End</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Controller
                      control={control}
                      name={`halls.${idx}.endDate`}
                      render={(props) => (
                        <input
                          type="date"
                          min={getHallDetails[idx]?.startDate || new Date().toISOString().split("T")[0]} // disable before startDate
                          style={{ flex: 1, padding: "6px 8px", fontSize: 12, borderRadius: 4, border: "1px solid #ddd" }}
                          value={props.value || ""}
                          onChange={(e) => {
                            props.onChange(e.target.value);
                            updateHall(idx, { endDate: e.target.value });
                          }}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name={`halls.${idx}.endTime`}
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
                  </div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Hint: Pick Date & Time (Min: Tomorrow)</div>
                </div>
              </div>
            ))}
          </div>

          <CardLabel>
            {t("Purpose")} <span style={{ color: "red" }}>*</span>
          </CardLabel>
          <Controller
            control={control}
            name={"purpose"}
            render={(props) => (
              <Dropdown className="form-field" select={props.onChange} selected={props.value} option={CHBPurpose?.CHB?.Purpose} optionKey="name" />
            )}
          />

          <CardLabel>
            {t("Special Category")} <span style={{ color: "red" }}>*</span>
          </CardLabel>
          <Controller
            control={control}
            name={"specialCategory"}
            render={(props) => (
              <Dropdown
                className="form-field"
                select={props.onChange}
                selected={props.value}
                option={SpecialCategory?.CHB?.SpecialCategory}
                optionKey="name"
              />
            )}
          />

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {t("Purpose Description")} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"purposeDescription"}
                render={(props) => (
                  <TextArea
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
