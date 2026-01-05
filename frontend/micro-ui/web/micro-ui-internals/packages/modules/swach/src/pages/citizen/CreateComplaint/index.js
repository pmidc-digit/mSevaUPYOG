import React, { useState, useEffect, useMemo, useRef, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Dropdown, Loader } from "@mseva/digit-ui-react-components";
import { useRouteMatch, useHistory } from "react-router-dom";
import { useQueryClient } from "react-query";

import { FormComposer } from "../../../components/FormComposer";
import { createComplaint } from "../../../redux/actions/index";

export const CreateComplaint = ({ parentUrl }) => {
  const cities = Digit.Hooks.swach.useTenants();
  const { t } = useTranslation();

  //const getCities = () => cities?.filter((e) => e.code === Digit.ULBService.getCurrentTenantId()) || [];
  const getCities = () => cities || [];
  const propetyData = localStorage.getItem("swachProperty");
  const [complaintType, setComplaintType] = useState(JSON?.parse(sessionStorage.getItem("complaintType")) || {});
  const [subTypeMenu, setSubTypeMenu] = useState([]);
  const [subType, setSubType] = useState(JSON?.parse(sessionStorage.getItem("subType")) || {});
  const [priorityLevel, setPriorityLevel] = useState(JSON?.parse(sessionStorage.getItem("PriorityLevel")) || {});
  const [pincode, setPincode] = useState("");
  // const [mobileNumber, setMobileNumber] = useState(sessionStorage.getItem("mobileNumber") || "");
  // const [fullName, setFullName] = useState(sessionStorage.getItem("name") || "");
  const userInfo = JSON.parse(localStorage.getItem("user-info"));
  const [mobileNumber, setMobileNumber] = useState(userInfo?.mobileNumber || "");
  const [fullName, setFullName] = useState(userInfo?.name || "");
  const [emailId, setEmail] = useState(sessionStorage.getItem("emailId") || "");
  const [selectedCity, setSelectedCity] = useState(getCities()[0] ? getCities()[0] : null);
  const [propertyId, setPropertyId] = useState("");
  const [description, setDescription] = useState("");
  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    selectedCity?.code,
    "admin",
    {
      enabled: !!selectedCity,
    },
    t
  );
  // const fetchedLocalities = useMemo(() => {
  //   return Digit.Hooks.useBoundaryLocalities(
  //     getCities()[0]?.code,
  //     "admin",
  //     {
  //       enabled: !!getCities()[0],
  //     },
  //     t
  //   );
  // }, [selectedCity]);

  // const [localities, setLocalities] = useState(fetchedLocalities);
  const [selectedLocality, setSelectedLocality] = useState(null);
  const [canSubmit, setSubmitValve] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [property, setPropertyData] = useState(null);
  const [pincodeNotValid, setPincodeNotValid] = useState(false);
  const [params, setParams] = useState({});
  //const tenantId = SessionStorage.getItem("Digit.Citizen.tenantId");
  const tenantId = Digit.UserService.getUser()?.info?.tenantId;
  const tempLocation = useRef(null);
  const [geoLocation, setGeoLocation] = useState({
    //  location:{
    //    latitude: 30.730048,
    //    longitude: 76.765040,
    //  },
    //  val: "",
    //  place: "",
  });
  const imageUploaded = useRef({
    uploadedImages: null,
  });
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newGeoLocation = {
          location: {
            latitude: latitude ? latitude : 30.730048,
            longitude: longitude ? longitude : 76.76504,
          },
          val: "",
          place: "",
        };
        // console.log("newGeoLocation", newGeoLocation);
        setGeoLocation(newGeoLocation);
      },
      (error) => {
        console.error("Error getting location:", error.message);
      }
    );
  }, []);
  const menu = Digit.Hooks.swach.useComplaintTypes({ stateCode: tenantId });
  const SelectGeolocation = Digit?.ComponentRegistryService?.getComponent("SWACHSelectGeolocation");
  const SelectImages = Digit?.ComponentRegistryService?.getComponent("SWACHSelectImages");

  const localities = useMemo(() => {
    return fetchedLocalities;
  }, [selectedCity, fetchedLocalities]);

  const priorityMenu = [
    {
      name: "LOW",
      code: "LOW",
      active: true,
    },
    {
      name: "MEDIUM",
      code: "MEDIUM",
      active: true,
    },
    {
      name: "HIGH",
      code: "HIGH",
      active: true,
    },
  ];
  const dispatch = useDispatch();
  const match = useRouteMatch();
  const history = useHistory();
  const serviceDefinitions = Digit.GetSwachBharatCategories;
  const client = useQueryClient();
  useEffect(() => {
    if (
      complaintType?.key &&
      subType?.key &&
      selectedCity?.code &&
      selectedLocality?.code &&
      (geoLocation?.location?.latitude !== 30.730048 || geoLocation?.location?.longitude !== 76.76504)
    ) {
      setSubmitValve(true);
    } else {
      setSubmitValve(false);
    }
  }, [complaintType, subType, priorityLevel, selectedCity, selectedLocality, geoLocation]);

  // useEffect(() => {
  //   setLocalities(fetchedLocalities);
  // }, [fetchedLocalities]);

  useEffect(() => {
    const city = cities.find((obj) => obj.pincode?.find((item) => item == pincode));
    if (city?.code === getCities()[0]?.code) {
      setPincodeNotValid(false);
      setSelectedCity(city);
      setSelectedLocality(null);
      const __localityList = fetchedLocalities;
      const __filteredLocalities = __localityList.filter((city) => city["pincode"] == pincode);
      // setLocalities(__filteredLocalities);
    } else if (pincode === "" || pincode === null) {
      setPincodeNotValid(false);
      // setLocalities(fetchedLocalities);
    } else {
      setPincodeNotValid(true);
    }
  }, [pincode]);

  useEffect(() => {
    setComplaintType({ name: "SWACHBHARATCATEGORY.SWACHCATEGORY", key: "SwachCategory" });
    selectedType();
  }, []);
  // async function selectedType(value) {
  //   if (value.key !== complaintType.key) {
  //     console.log("selectedType",value)
  //     // if (value.key === "Others") {
  //     //   setSubType({ name: "" });
  //     //   setComplaintType(value);
  //     //   sessionStorage.setItem("complaintType",JSON.stringify(value))
  //     //   setSubTypeMenu([{ key: "Others", name: t("SWACHBHARATCATEGORY.OTHERS") }]);
  //     // } else {
  //       setSubType({ name: "" });
  //       setComplaintType(value);
  //       sessionStorage.setItem("complaintType",JSON.stringify(value))
  //       setSubTypeMenu(await serviceDefinitions.getSubMenu(tenantId, value, t));
  //     // }
  //   }
  // }

  async function selectedType() {
    const value = await serviceDefinitions.getSubMenu(tenantId, { name: "SWACHBHARATCATEGORY.SWACHCATEGORY", key: "SwachCategory" }, t);
    setSubTypeMenu(value);
  }
  async function selectedPriorityLevel(value) {
    sessionStorage.setItem("priorityLevel", JSON.stringify(value));
    setPriorityLevel(value);
    //setPriorityMenu(await serviceDefinitions.getSubMen)
  }

  function selectedSubType(value) {
    sessionStorage.setItem("subType", JSON.stringify(value));
    setSubType(value);
  }

  // city locality logic
  const selectCity = async (city) => {
    // if (selectedCity?.code !== city.code) {}
    setSelectedCity(city);

    return;
  };
  function selectLocality(locality) {
    setSelectedLocality(locality);
  }

  function throttle() {
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  }

  const wrapperSubmit = (data) => {
    if (!canSubmit) return;
    if (!imageUploaded?.current?.uploadedImages) {
      alert("Please Upload Image");
      return;
    }
    setSubmitted(true);
    !submitted && onSubmit(data);
    !submitted && throttle();
  };
  //On SUbmit
  const onSubmit = async (data) => {
    if (!canSubmit) return;
    if (!imageUploaded?.current?.uploadedImages) {
      alert("Please Upload Image");
      return;
    }
    const cityCode = selectedCity.code;
    const city = selectedCity.city.name;
    const district = selectedCity.city.name;
    const region = selectedCity.city.name;
    const localityCode = selectedLocality.code;
    const localityName = selectedLocality.name;
    const landmark = data?.landmark;
    const { key } = subType;
    const complaintType = key;
    //const prioritylevel=priorityLevel.code;
    const mobileNumber = data?.mobileNumber;
    const name = data?.name;
    const emailId = data?.emailId;
    const latitude = geoLocation?.location?.latitude.toString();
    const longitude = geoLocation?.location?.longitude.toString();
    const uploadedImages = imageUploaded?.current?.uploadedImages.map((val) => ({
      documentType: "PHOTO",
      filestoreId: val,
    }));
    const formData = {
      ...data,
      cityCode,
      city,
      district,
      region,
      localityCode,
      localityName,
      landmark,
      complaintType,
      priorityLevel,
      mobileNumber,
      name,
      emailId,
      latitude,
      longitude,
      uploadedImages,
    };
    await dispatch(createComplaint(formData));
    await client.refetchQueries(["fetchInboxData"]);
    localStorage.removeItem("swachProperty");
    // history.push(parentUrl + "/response");
    history.push("/digit-ui/citizen/swach/response");
  };

  const handlePincode = (event) => {
    const { value } = event.target;
    setPincode(value);
    if (!value) {
      setPincodeNotValid(false);
    }
  };
  const handleMobileNumber = (event) => {
    const { value } = event.target;
    setMobileNumber(value);
  };
  const handleName = (event) => {
    const { value } = event.target;
    setFullName(value);
  };
  const handleEmail = (event) => {
    const { value } = event.target;
    setEmail(value);
  };
  const handleDescription = (event) => {
    const { value } = event.target;
    setDescription(value);
  };
  const isPincodeValid = () => !pincodeNotValid;

  const config = [
    {
      head: t("ES_CREATECOMPLAINT_PROVIDE_COMPLAINANT_DETAILS"),
      body: [
        {
          // label: t("ES_CREATECOMPLAINT_MOBILE_NUMBER"),
          label: (
            <>
              {t("ES_CREATECOMPLAINT_MOBILE_NUMBER")} <span className="mandatory-asterisk">*</span>
            </>
          ),
          // isMandatory: true,
          type: "text",
          value: mobileNumber,
          onChange: handleMobileNumber,
          populators: {
            name: "mobileNumber",
            onChange: handleMobileNumber,
            validation: {
              required: true,
              pattern: /^[6-9]\d{9}$/,
            },
            componentInFront: <div className="employee-card-input employee-card-input--front numberdisplay">+91</div>,
            error: t("CORE_COMMON_MOBILE_ERROR"),
          },
        },
        {
          // label: t("ES_CREATECOMPLAINT_COMPLAINT_NAME"),
          // isMandatory: true,
          label: (
            <>
              {t("ES_CREATECOMPLAINT_COMPLAINT_NAME")} <span className="mandatory-asterisk">*</span>
            </>
          ),
          type: "text",
          value: fullName,
          populators: {
            name: "name",
            onChange: handleName,
            validation: {
              required: true,
              pattern: /^[A-Za-z]/,
            },
            error: t("CS_ADDCOMPLAINT_NAME_ERROR"),
          },
        },
        // {
        //   label: t("ES_MAIL_ID"),
        //   isMandatory: false,
        //   type: "text",
        //   value:emailId,
        //   populators: {
        //     name: "emailId",
        //     onChange: handleEmail,
        //     validation: {
        //       //required: true,
        //       pattern: /[A-Za-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
        //     },
        //     error: t("CS_ADDCOMPLAINT_EMAIL_ERROR"),
        //   },
        // },
      ],
    },
    {
      head: t("CS_COMPLAINT_DETAILS_COMPLAINT_DETAILS"),
      body: [
        // {
        //   label: t("CS_COMPLAINT_DETAILS_COMPLAINT_TYPE"),
        //   isMandatory: true,
        //   type: "dropdown",
        //   populators: <Dropdown option={menu} optionKey="name" id="complaintType" selected={complaintType} select={selectedType} />,
        // },
        {
          // label: t("CS_COMPLAINT_DETAILS_COMPLAINT_SUBTYPE"),
          // isMandatory: true,
          label: (
            <>
              {t("CS_COMPLAINT_DETAILS_COMPLAINT_SUBTYPE")} <span className="mandatory-asterisk">*</span>
            </>
          ),
          type: "dropdown",
          menu: { ...subTypeMenu },
          populators: <Dropdown option={subTypeMenu} optionKey="name" id="complaintSubType" selected={subType} select={selectedSubType} />,
        },
        // {
        //  label: t("CS_COMPLAINT_DETAILS_COMPLAINT_PRIORITY_LEVEL"),
        //     isMandatory: false,
        //     type: "dropdown",
        //     populators: <Dropdown option={priorityMenu} optionKey="name" id="priorityLevel" selected={priorityLevel} select={selectedPriorityLevel} />,

        // },
        {
          //label: t("WS_COMMON_PROPERTY_DETAILS"),
          isEditConnection: true,
          isCreateConnection: true,
          isModifyConnection: true,
          isEditByConfigConnection: true,
          isProperty: subType?.key?.includes("Property") ? true : false,
          // component: "",
          // key: "cpt",
          // type: "component",
          // "body": [
          //     {
          //         "component": "CPTPropertySearchNSummary",
          //         "withoutLabel": true,
          //         "key": "cpt",
          //         "type": "component",
          //         "hideInCitizen": true
          //     }
          // ]
        },
      ],
    },
    {
      head: t("CS_ADDCOMPLAINT_LOCATION"),
      body: [
        // {
        //   label: t("CORE_COMMON_PINCODE"),
        //   type: "text",
        //   populators: {
        //     name: "pincode",
        //   //  validation: { pattern: /^[1-9][0-9]{5}$/, validate: isPincodeValid },
        //     //error: t("CORE_COMMON_PINCODE_INVALID"),
        //     onChange: handlePincode,
        //   },
        // },
        {
          // label: t("CS_COMPLAINT_DETAILS_CITY"),
          // isMandatory: true,
          label: (
            <>
              {t("CS_COMPLAINT_DETAILS_CITY")} <span className="mandatory-asterisk">*</span>
            </>
          ),
          type: "dropdown",
          populators: <Dropdown isMandatory selected={selectedCity} option={getCities()} id="city" select={selectCity} optionKey="i18nKey" t={t} />,
        },
        {
          // label: t("CS_CREATECOMPLAINT_MOHALLA"),
          // isMandatory: true,
          label: (
            <>
              {t("CS_CREATECOMPLAINT_MOHALLA")} <span className="mandatory-asterisk">*</span>
            </>
          ),
          type: "dropdown",
          dependency: selectedCity && localities ? true : false,
          populators: (
            <Dropdown isMandatory selected={selectedLocality} optionKey="i18nkey" id="locality" option={localities} select={selectLocality} t={t} />
          ),
        },
        {
          label: t("CS_COMPLAINT_DETAILS_LANDMARK"),
          type: "textarea",
          populators: {
            name: "landmark",
          },
        },

        {
          label: t("CS_COMPLAINT_DETAILS_ADDITIONAL_DETAILS"),
          type: "textarea",
          onChange: handleDescription,
          value: description,
          populators: {
            name: "description",
            onChange: handleDescription,
          },
        },

        {
          label: t("CS_COMPLAINT_DETAILS_GEO_LOCATION"),
          type: "component",
          key: "geoLocator",
          withoutLabel: true,
          component: (props) => (
            <div>
              <SelectGeolocation
                t={t}
                onSelect={() => {
                  // if (tempLocation?.current?.location?.longitude !== 76.765040 && tempLocation?.current?.location?.latitude !== 30.730048) {
                  setGeoLocation(tempLocation.current);
                  // } else {
                  //  alert("Please select a location, before next");
                  // }
                }}
                value={geoLocation}
                onChange={(val, location, place) => {
                  // setTempLocation({val, location, place});
                  tempLocation.current = { val, location, place };
                }}
              />
              {geoLocation?.place?.length > 0 ? (
                <div className="font-Weigth-bold">
                  {t("CS_COMPLAINT_DETAILS_SELECTED_LOCATION") + ": " + geoLocation?.place + "," + geoLocation?.val}
                </div>
              ) : (
                <div className="font-Weigth-bold">{t("CS_COMPLAINT_DETAILS_NO_LOCATION_SELECTED")}</div>
              )}
            </div>
          ),
        },
      ],
    },
    {
      head: t("CS_COMPLAINT_DETAILS_UPLOAD_IMAGES"),
      body: [
        {
          // label: t("CS_COMPLAINT_DETAILS_UPLOAD_IMAGES_TEXT"),
          type: "component",
          key: "imageSelector",
          withoutLabel: true,
          component: (props) => (
            <SelectImages
              value={imageUploaded.current}
              onSelect={(val) => {
                // setImageUploaded(val);
                imageUploaded.current = { ...val };
              }}
              tenantId={selectCity ? selectedCity.code : "pb"}
            />
          ),
        },
      ],
    },
  ];
  useEffect(() => {
    if (propetyData !== "undefined" && propetyData !== null) {
      let data = JSON.parse(propetyData);
      setPropertyData(data);
      setPropertyId(data?.propertyId);
    }
  }, []);
  useEffect(() => {
    if (property !== "undefined" && property !== null) {
      let data = property;

      setPincode(data?.address?.pincode || "");

      let b = localities.filter((item) => {
        return item.code === data?.address?.locality?.code;
      });
      setSelectedLocality(b?.[0]);
      setDescription(data?.propertyId);
      // console.log("swachProperty", localities, data?.propertyId, data);
    }
  }, [propertyId]);
  return (
    <div className="employeeCard">
      <FormComposer
        heading={t("ES_CREATECOMPLAINT_NEW_COMPLAINT")}
        config={config}
        onSubmit={wrapperSubmit}
        isDisabled={!canSubmit && !submitted && !imageUploaded?.current?.uploadedImages}
        label={t("CS_ADDCOMPLAINT_ADDITIONAL_DETAILS_SUBMIT_COMPLAINT")}
      />
    </div>
  );
};
