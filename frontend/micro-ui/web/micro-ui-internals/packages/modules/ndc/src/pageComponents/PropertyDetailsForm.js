import React, { useState, useEffect, useMemo, useCallback, useRef, use } from "react";
import {
  CardLabel,
  LabelFieldPair,
  Dropdown,
  TextInput,
  LinkButton,
  CardLabelError,
  MobileNumber,
  DatePicker,
  Loader,
  Toast,
  DeleteIcon
} from "@mseva/digit-ui-react-components";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import _, { add, first, last, set } from "lodash";
import { useLocation } from "react-router-dom";
import isUndefined from "lodash/isUndefined";
import { useQuery } from "react-query";

export const PropertyDetailsForm = ({ config, onSelect, userType, formData, formState, clearErrors }) => {
  const {
    control,
    formState: localFormState,
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm();
  const { t } = useTranslation();
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");

  const [showToast, setShowToast] = useState(null);
  // const [error, setError] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBillData, setSelectedBillData] = useState({})
  const propertyId = formData?.cpt?.details?.propertyId;

  const [propertyDetails, setPropertyDetails] = useState(formData?.PropertyDetails || {});
  const { isLoading: waterConnectionLoading, data: waterConnectionData, error: waterConnectionError } = Digit.Hooks.ws.useSearchWS({
    tenantId,
    filters: {
      searchType: "CONNECTION",
      propertyId: propertyId,
    },
    config: {
      enabled: !!propertyId, // ✅ Only run if propertyId is defined
    },
    bussinessService: "WS",
    t,
  });

  const { isLoading: sewerageConnectionLoading, data: sewerageConnectionData, error: sewerageConnectionError } = Digit.Hooks.ws.useSearchWS({
    tenantId,
    filters: {
      searchType: "CONNECTION",
      propertyId: propertyId,
    },
    config: {
      enabled: !!propertyId, // ✅ Only run if propertyId is defined
    },
    bussinessService: "SW",
    t,
  });

  useEffect(() => {
    console.log("cptDetails in PropertyDetails Page", formData?.cpt?.details);
  
    const owner = formData?.cpt?.details?.owners?.[0];
    const fullName = owner?.name?.split(" ");
    const firstName = fullName?.[0];
    const lastName = fullName?.[fullName.length - 1];
    const email = owner?.email;
    const mobileNumber = owner?.mobileNumber;
    const address = owner?.permanentAddress;
  
    const combinedObject = {};
    if (firstName) combinedObject.firstName = firstName;
    if (lastName) combinedObject.lastName = lastName;
    if (email) combinedObject.email = email;
    if (mobileNumber) combinedObject.mobileNumber = mobileNumber;
    if (address) combinedObject.address = address;

    setPropertyDetails((prev) => {
      return {
        ...prev,
        ...combinedObject
      }
    })
  
    console.log("Filtered cptDetails in PropertyDetails Page", combinedObject);
  }, [formData?.cpt?.details]);

  console.log("PropertyDetails: ", propertyDetails);
  

  useEffect(() => {
    // console.log("BillDataForW&S", waterConnectionBillData, sewerageConnectionBillData)
    if(!formData?.PropertyDetails?.waterConnection?.length>0){
    setPropertyDetails((prev) => {
      const waterConnection = waterConnectionData?.map((item) => ({ connectionNo: item?.connectionNo, isEdit: false, billData: {}, isLoading: false }));

      return {
        ...prev,
        waterConnection: waterConnection,
      };
    });
  }
  }, [waterConnectionData, waterConnectionLoading]);

  useEffect(() => {
    if(!formData?.PropertyDetails?.sewerageConnection?.length>0){
    setPropertyDetails((prev) => {
      const sewerageConnection = sewerageConnectionData?.map((item) => ({ connectionNo: item?.connectionNo, isEdit: false, billData: {},isLoading: false }));

      return {
        ...prev,
        sewerageConnection: sewerageConnection,
      };
    });
  }
  }, [sewerageConnectionData, sewerageConnectionLoading]);

  useEffect(() => {
    onSelect("PropertyDetails", propertyDetails, config);
    console.log("PropertyDetailsValue", propertyDetails);
  }, [propertyDetails]);

  function addWaterConnection() {
    setPropertyDetails((prev) => ({
      ...prev,
      waterConnection: [...(prev.waterConnection || []), { connectionNo: "", isEdit: true }],
    }));
  }

  function addSewerageConnection() {
    setPropertyDetails((prev) => ({
      ...prev,
      sewerageConnection: [...(prev.sewerageConnection || []), { connectionNo: "", isEdit: true }],
    }));
  }

  async function fetchBill(bussinessService, consumercodes, index){

    if(bussinessService === "WS"){
      const updated = [...propertyDetails.waterConnection];
      updated[index].isLoading = true;
      setPropertyDetails((prev) => ({
        ...prev,
        waterConnection: updated
      }))
    }else if(bussinessService === "SW"){
      const updated = [...propertyDetails.sewerageConnection];
      updated[index].isLoading = true;
      setPropertyDetails((prev) => ({
        ...prev,
        sewerageConnection: updated
      }))
    }

    const result = await Digit.PaymentService.fetchBill(tenantId, {
      businessService: bussinessService,
      consumerCode: consumercodes,
    })

    if(result?.Bill?.length > 0){
      if(result?.Bill[0]?.totalAmount>0){
        setShowToast({ error: true, label: t("Dues Found. Please Pay") });
      }else{
        setShowToast({ error: false, label: t("No Dues Found") })
      }
      if(bussinessService === "WS"){
        const updated = [...propertyDetails.waterConnection];
        updated[index].billData = result?.Bill[0];
        updated[index].isLoading = false;
        setPropertyDetails((prev) => ({
          ...prev,
          waterConnection: updated
        }))
      }else if(bussinessService === "SW"){
        const updated = [...propertyDetails.sewerageConnection];
        updated[index].billData = result?.Bill[0];
        updated[index].isLoading = false;
        setPropertyDetails((prev) => ({
          ...prev,
          sewerageConnection: updated
        }))
      }
    }else if(result?.Bill){
      setShowToast({ error: true, label: t("No Bills Found For this consumer number") })
      if(bussinessService === "WS"){
        const updated = [...propertyDetails.waterConnection];
        updated[index].isLoading = false;
        setPropertyDetails((prev) => ({
          ...prev,
          waterConnection: updated
        }))
      }else if(bussinessService === "SW"){
        const updated = [...propertyDetails.sewerageConnection];
        updated[index].isLoading = false;
        setPropertyDetails((prev) => ({
          ...prev,
          sewerageConnection: updated
        }))
      }
      // setError(t("No Bills Found For this consumer number"));
    }else{
      setShowToast({ error: true, label: t("Invalid Consumer Number") })
      if(bussinessService === "WS"){
        const updated = [...propertyDetails.waterConnection];
        updated[index].isLoading = false;
        setPropertyDetails((prev) => ({
          ...prev,
          waterConnection: updated
        }))
      }else if(bussinessService === "SW"){
        const updated = [...propertyDetails.sewerageConnection];
        updated[index].isLoading = false;
        setPropertyDetails((prev) => ({
          ...prev,
          sewerageConnection: updated
        }))
      }
      // setError(t("Invalid Consumer Number"));
    }

  }

  const closeToast = () => {
    setShowToast(null);
    // setError("");
  };

  function redirectToPayBill(billData, index, isEdit){
    const userType = window.location.href.includes("employee") ? "employee" : "citizen";
    
    let service
    if(billData?.businessService === "WS"){
      service = "WATER"
    }else{
      service = "SEWERAGE"
    }
    
    const payUrl = "https://sdc-uat.lgpunjab.gov.in"+`/${userType}/wns/viewBill?connectionNumber=${billData?.consumerCode}&tenantId=${billData?.tenantId}&service=${service}`;
    window.open(payUrl, "_blank");
    
    if(billData?.businessService === "WS"){
      const updated = [...propertyDetails.waterConnection];
      updated[index] = { connectionNo: billData?.consumerCode, isEdit: isEdit, billData: {}, isLoading: false }
      setPropertyDetails((prev) => ({
        ...prev,
        waterConnection: updated
      }))
    }else if(billData?.businessService === "SW"){
      const updated = [...propertyDetails.sewerageConnection];
      updated[index] = { connectionNo: billData?.consumerCode, isEdit: isEdit, billData: {}, isLoading: false }
      setPropertyDetails((prev) => ({
        ...prev,
        sewerageConnection: updated
      }))
    }
  }

  const PayWSBillModal = Digit?.ComponentRegistryService?.getComponent("PayWSBillModal");


  return (
    <div style={{ marginBottom: "16px" }}>
      {formData?.cpt?.details && (
        <div>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("NDC_WATER_CONNECTION")} * `}</CardLabel>
            {waterConnectionLoading? <Loader />:<div className="field" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {propertyDetails?.waterConnection?.map((item, index) => (
                <div key={index} style={{ display: "flex", flexDirection: "row" }}>
                  <Controller
                    key={index}
                    control={control}
                    name={`waterConnection[${index}]`}
                    defaultValue={item.connectionNo}
                    render={(props) => (
                      <TextInput
                        value={item.connectionNo}
                        onChange={(e) => {
                          // Update local state
                          const updated = [...propertyDetails.waterConnection];
                          updated[index] = { connectionNo: "", isEdit: true, billData: {}, isLoading: false }
                          updated[index].connectionNo = e.target.value;
                          setPropertyDetails((prev) => ({
                            ...prev,
                            waterConnection: updated,
                          }));
                          // Update react-hook-form
                          props.onChange(e.target.value);
                        }}
                        disabled={!item.isEdit}
                        onBlur={props.onBlur}
                      />
                    )}
                  />

                  {item.isLoading? <Loader /> :<div>
                  {item?.connectionNo && !item?.billData?.id && <button className="submit-bar" type="button" style={{ color: "white" }} onClick={() => {
                    fetchBill("WS",item.connectionNo, index)
                  }}>
                    {`${t("Check Status")}`}
                  </button>}

                  {item?.connectionNo && item?.billData?.totalAmount>0 && <button className="submit-bar" type="button" style={{ color: "white" }} onClick={() => {
                    // setSelectedBillData(item?.billData);
                    // setShowPayModal(true);
                    redirectToPayBill(item?.billData, index, item.isEdit)
                  }}>
                    {`${t("PAY")}`}
                  </button>}
                  

                  {item?.isEdit && <button onClick={() => {
                    let updated = [...propertyDetails.waterConnection];
                    updated.splice(index, 1);
                    setPropertyDetails((prev) => {
                      return {
                      ...prev,
                      waterConnection: updated,
                    }})
                  }
                    }>
                    <DeleteIcon className="delete" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
                  </button>}
                  </div>}
                </div>
              ))}
            </div>}
          </LabelFieldPair>

          <button
            className="submit-bar"
            type="button"
            style={{ color: "white" }}
            onClick={() => {
              addWaterConnection();
            }}
          >
            {`${t("ADD WATER")}`}
          </button>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("NDC_SEWERAGE_CONNECTION")} * `}</CardLabel>
            {sewerageConnectionLoading?<Loader /> :<div className="field" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {propertyDetails?.sewerageConnection?.map((item, index) => (
                <div key={index} style={{ display: "flex", flexDirection: "row" }}>
                  <Controller
                    key={index}
                    control={control}
                    name={`sewerageConnection[${index}]`}
                    defaultValue={item.connectionNo}
                    render={(field) => (
                      <TextInput
                        value={item.connectionNo}
                        onChange={(e) => {
                          // Update local state
                          const updated = [...propertyDetails.sewerageConnection];
                          updated[index] = { connectionNo: "", isEdit: true, billData: {}, isLoading: false }
                          updated[index].connectionNo = e.target.value;
                          setPropertyDetails((prev) => ({
                            ...prev,
                            sewerageConnection: updated,
                          }));

                          // Update react-hook-form
                          field.onChange(e.target.value);
                        }}
                        disabled={!item.isEdit}
                        onBlur={field.onBlur}
                      />
                    )}
                  />

                  {item.isLoading? <Loader /> :<div>
                  {item?.connectionNo && !item?.billData?.id && <button className="submit-bar" type="button" style={{ color: "white" }} onClick={() => {
                    fetchBill("SW",item.connectionNo, index, item.isEdit)
                  }}>
                    {`${t("Check Status")}`}
                  </button>}

                  {item?.connectionNo && item?.billData?.totalAmount>0 && <button className="submit-bar" type="button" style={{ color: "white" }} onClick={() => {
                    // setSelectedBillData(item?.billData);
                    // setShowPayModal(true);
                    redirectToPayBill(item?.billData, index, )
                  }}>
                    {`${t("PAY")}`}
                  </button>}
                  


                  {item?.isEdit && <button onClick={() => {
                    let updated = [...propertyDetails.sewerageConnection];
                    updated.splice(index, 1);
                    setPropertyDetails((prev) => {
                      return {
                      ...prev,
                      sewerageConnection: updated,
                    }})
                  }}>
                    <DeleteIcon className="delete" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
                  </button>}
                  </div>}
                </div>
              ))}
            </div>}
          </LabelFieldPair>

          <button
            className="submit-bar"
            type="button"
            style={{ color: "white" }}
            onClick={() => {
              addSewerageConnection();
            }}
          >
            {`${t("ADD Sewerage")}`}
          </button>
        

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("NDC_FIRST_NAME")} * `}</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name={"firstName"}
            defaultValue={propertyDetails?.firstName || ""}
            rules={{ required: t("REQUIRED_FIELD"), validate: { pattern: (val) => (/^[-@.\/#&+\w\s]*$/.test(val) ? true : t("INVALID_NAME")) } }}
            render={(props) => (
              <TextInput
                value={propertyDetails?.firstName || ""}
                onChange={(e) => {
                  setPropertyDetails((prev) => ({ ...prev, firstName: e.target.value }));
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  // setFocusIndex({ index: -1 });
                  props.onBlur(e);
                }}
              />
            )}
          />
        </div>
      </LabelFieldPair>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("NDC_LAST_NAME")} * `}</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name={"lastName"}
            defaultValue={propertyDetails?.lastName || ""}
            rules={{ required: t("REQUIRED_FIELD"), validate: { pattern: (val) => (/^[-@.\/#&+\w\s]*$/.test(val) ? true : t("INVALID_NAME")) } }}
            render={(props) => (
              <TextInput
                value={propertyDetails?.lastName || ""}
                onChange={(e) => {
                  setPropertyDetails((prev) => ({ ...prev, lastName: e.target.value }));
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  // setFocusIndex({ index: -1 });
                  props.onBlur(e);
                }}
              />
            )}
          />
        </div>
      </LabelFieldPair>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("NDC_EMAIL")} * `}</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name={"email"}
            defaultValue={propertyDetails?.email || ""}
            render={(props) => (
              <TextInput
                value={propertyDetails?.email}
                onChange={(e) => {
                  setPropertyDetails((prev) => ({ ...prev, email: e.target.value }));
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  // setFocusIndex({ index: -1 });
                  props.onBlur(e);
                }}
              />
            )}
          />
        </div>
      </LabelFieldPair>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("NDC_MOBILE_NUMBER")} * `}</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name={"mobileNumber"}
            defaultValue={propertyDetails?.mobileNumber || ""}
            render={(props) => (
              <TextInput
                value={propertyDetails?.mobileNumber}
                onChange={(e) => {
                  setPropertyDetails((prev) => ({ ...prev, mobileNumber: e.target.value }));
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  // setFocusIndex({ index: -1 });
                  props.onBlur(e);
                }}
              />
            )}
          />
        </div>
      </LabelFieldPair>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("NDC_ADDRESS")} * `}</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name={"address"}
            defaultValue={propertyDetails?.address || ""}
            render={(props) => (
              <TextInput
                value={propertyDetails?.address}
                onChange={(e) => {
                  setPropertyDetails((prev) => ({ ...prev, address: e.target.value }));
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  // setFocusIndex({ index: -1 });
                  props.onBlur(e);
                }}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      </div>
      )}
      {showToast && <Toast isDleteBtn={true} error={showToast?.error} label={showToast?.label} onClose={closeToast} />}
      {showPayModal && <PayWSBillModal setShowToast={() => {setShowPayModal(false); setSelectedBillData({})}} billData={selectedBillData} />}
    </div>
  );
};
