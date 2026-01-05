import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Dropdown, Loader } from "@mseva/digit-ui-react-components";
import { useRouteMatch, useHistory,useLocation } from "react-router-dom";
import { useQueryClient } from "react-query";

import { FormComposer } from "../../../components/FormComposer";
import { createComplaint } from "../../../redux/actions/index";

export const CreateComplaint = ({ parentUrl }) => {

   const location = useLocation();
  
  // Add this useEffect at the top, after all your state declarations
  useEffect(() => {
    // Clear sessionStorage
    sessionStorage.removeItem("complaintType");
    sessionStorage.removeItem("subType");
    sessionStorage.removeItem("PriorityLevel");
    
    // Reset all local state to ensure blank form
    setComplaintType({});
    setSubType({});
    setPriorityLevel({});
    setSelectedLocality(null);
    setPincode("");
    setDescription("");
    setSubTypeMenu([]);
    setSubmitted(false);
    setSubmitValve(false);
    setPincodeNotValid(false);
    
    // Reset geolocation to default
    setGeoLocation({
      location: {
        latitude: 30.730048,
        longitude: 76.76504,
      },
      val: "",
      place: "",
    });
    
    // Reset image upload ref
    imageUploaded.current = {
      uploadedImages: null,
    };
    
    // Reset city to first city (optional - depends on your UX preference)
    setSelectedCity(getCities()[0] || null);
    
  }, [location.pathname]);

  const cities = Digit.Hooks.pgr.useTenants();
  const { t } = useTranslation();

  //const getCities = () => cities?.filter((e) => e.code === Digit.ULBService.getCurrentTenantId()) || [];
  const getCities = () => cities || [];
  const propetyData=localStorage.getItem("pgrProperty") 
  const [complaintType, setComplaintType] = useState(JSON?.parse(sessionStorage.getItem("complaintType")) || {});
  const [subTypeMenu, setSubTypeMenu] = useState([]);
  const [subType, setSubType] = useState(JSON?.parse(sessionStorage.getItem("subType")) || {});
 const [priorityLevel, setPriorityLevel]=useState(JSON?.parse(sessionStorage.getItem("PriorityLevel"))||{})
  const [pincode, setPincode] = useState("");
  //const [mobileNumber, setMobileNumber] = useState(sessionStorage.getItem("mobileNumber") || "");
  //const [fullName, setFullName] = useState(sessionStorage.getItem("name") || "");
 // const [emailId, setEmail] = useState(sessionStorage.getItem("emailId") || "");
  const [selectedCity, setSelectedCity] = useState(getCities()[0] ? getCities()[0] : null);
const [propertyId, setPropertyId]= useState("")
const [description, setDescription] = useState("")
  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    selectedCity?.code,
    "admin",
    {
      enabled: !! selectedCity
    },
    t
  );

 // const [localities, setLocalities] = useState(fetchedLocalities);
  const [selectedLocality, setSelectedLocality] = useState(null);
  const [canSubmit, setSubmitValve] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [property,setPropertyData]=useState(null)
  const [pincodeNotValid, setPincodeNotValid] = useState(false);
  const [params, setParams] = useState({});
  //const tenantId = window.Digit.SessionStorage.get("Employee.tenantId");
  const tenantId = Digit.UserService.getUser()?.info?.tenantId;
  const menu = Digit.Hooks.pgr.useComplaintTypes({ stateCode: tenantId });
  const tempLocation = useRef(null);
  const [geoLocation, setGeoLocation] = useState({});

  const SelectGeolocation = Digit?.ComponentRegistryService?.getComponent("PGRSelectGeolocation");
  const SelectImages = Digit?.ComponentRegistryService?.getComponent("PGRSelectImages");
  
  const localities = useMemo(() => {
      return fetchedLocalities;
  }, [selectedCity, fetchedLocalities]);

  const  priorityMenu= 
  [
    {
      "name": "LOW",
      "code": "LOW",
      "active": true
    },
    {
      "name": "MEDIUM",
      "code": "MEDIUM",
      "active": true
    },
    {
      "name": "HIGH",
      "code": "HIGH",
      "active": true
    }

   ]
  const dispatch = useDispatch();
  const match = useRouteMatch();
  const history = useHistory();
  const serviceDefinitions = Digit.GetServiceDefinitions;
  const client = useQueryClient();
  useEffect(() => {
    if (complaintType?.key && subType?.key && selectedCity?.code && selectedLocality?.code) {
      setSubmitValve(true);
    } else {
      setSubmitValve(false);
    }
  }, [complaintType,subType, selectedCity, selectedLocality, geoLocation]);
 
  // useEffect(() => {
  //   setLocalities(fetchedLocalities);
  // }, [fetchedLocalities]);

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
          setGeoLocation(newGeoLocation);
        },
        (error) => {
          console.error("Error getting location:", error.message);
        }
      );
    }, []);

  useEffect(() => {
    const city = cities.find((obj) => obj.pincode?.find((item) => item == pincode));
    if (city?.code === getCities()[0]?.code) {
      setPincodeNotValid(false);
      setSelectedCity(city);
      setSelectedLocality(null);
      const __localityList = fetchedLocalities;
     // const __filteredLocalities = __localityList.filter((city) => city["pincode"] == pincode);
     // setLocalities(__filteredLocalities);
    } else if (pincode === "" || pincode === null) {
      setPincodeNotValid(false);
     // setLocalities(fetchedLocalities);
    } else {
      setPincodeNotValid(true);
    }
  }, [pincode]);

  async function selectedType(value) {
    if (value.key !== complaintType.key) {
      if (value.key === "Others") {
        setSubType({ name: "" });
        setComplaintType(value);
        sessionStorage.setItem("complaintType",JSON.stringify(value))
        setSubTypeMenu([{ key: "Others", name: t("SERVICEDEFS.OTHERS") }]);
      } else {
        setSubType({ name: "" });
        setComplaintType(value);
        sessionStorage.setItem("complaintType",JSON.stringify(value))
        setSubTypeMenu(await serviceDefinitions.getSubMenu(tenantId, value, t));
      }
    }
  }
  async function selectedPriorityLevel(value){
    sessionStorage.setItem("priorityLevel", JSON.stringify(value))
    setPriorityLevel(value);
    //setPriorityMenu(await serviceDefinitions.getSubMen)
  }

  function selectedSubType(value) {
    sessionStorage.setItem("subType",JSON.stringify(value));
    setSubType(value);
  }

  // city locality logic
  const selectCity = async (city) => {
    // if (selectedCity?.code !== city.code) {}
    setSelectedCity(city);
    setSelectedLocality(null);
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
    const emailId=data?.emailId;
    const latitude = geoLocation?.location?.latitude.toString();
    const longitude = geoLocation?.location?.longitude.toString();
    const uploadedImages = imageUploaded?.current?.uploadedImages.map((val) => ({
      documentType: "PHOTO",
      filestoreId: val,
    }));
    const formData = { ...data, cityCode, city, district, region, localityCode, localityName, landmark, complaintType, priorityLevel, mobileNumber, name,emailId, latitude, longitude, uploadedImages,};
    await dispatch(createComplaint(formData));
    await client.refetchQueries(["fetchInboxData"]);
    localStorage.removeItem("pgrProperty");
    history.push(`/digit-ui/citizen/pgr/response`);
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
    // {
    //   head: t("ES_CREATECOMPLAINT_PROVIDE_COMPLAINANT_DETAILS"),
    //   body: [
    //     {
    //       label: t("ES_CREATECOMPLAINT_MOBILE_NUMBER"),
    //       isMandatory: true,
    //       type: "text",
    //       value:mobileNumber,
    //       onChange: handleMobileNumber,
    //       populators: {
    //         name: "mobileNumber",
    //         onChange: handleMobileNumber,
    //         validation: {
    //           required: true,
    //           pattern: /^[6-9]\d{9}$/,  
    //         },
    //         componentInFront: <div className="employee-card-input employee-card-input--front">+91</div>,
    //         error: t("CORE_COMMON_MOBILE_ERROR"),
    //       },
    //     },
    //     {
    //       label: t("ES_CREATECOMPLAINT_COMPLAINT_NAME"),
    //       isMandatory: true,
    //       type: "text",
    //       value:fullName,
    //       populators: {
    //         name: "name",
    //         onChange: handleName,
    //         validation: {
    //           required: true,
    //           pattern: /^[A-Za-z]/,
    //         },
    //         error: t("CS_ADDCOMPLAINT_NAME_ERROR"),
    //       },
    //     },
    //     {
    //       label: t("ES_MAIL_ID"),
    //       isMandatory: false,
    //       type: "text",
    //       value:emailId,
    //       populators: {
    //         name: "emailId",
    //         onChange: handleEmail,
    //         validation: {
    //           //required: true,
    //           pattern: /[A-Za-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
    //         },
    //         error: t("CS_ADDCOMPLAINT_EMAIL_ERROR"),
    //       },
    //     },
    //   ],
    // },
    {
      // head: t("CS_COMPLAINT_DETAILS_COMPLAINT_DETAILS"),
      body: [
        {
          label: t("CS_ADDCOMPLAINT_COMPLAINT_TYPE"),
          isMandatory: true,
          type: "dropdown",
          populators: <Dropdown option={menu} optionKey="name" id="complaintType" selected={complaintType} select={selectedType} placeholder={t("CS_COMPLAINT_DETAILS_SELECT_COMPLAINT_TYPE")} />,
        },
        {
          label: t("CS_COMPLAINT_DETAILS_COMPLAINT_SUBTYPE"),
          isMandatory: true,
          type: "dropdown",
          menu: { ...subTypeMenu },
          populators: <Dropdown option={subTypeMenu} optionKey="name" id="complaintSubType" selected={subType} select={selectedSubType} placeholder={t("CS_COMPLAINT_DETAILS_SELECT_COMPLAINT_SUBTYPE")} />,
        },
        // {
          
        //  label: t("CS_COMPLAINT_DETAILS_COMPLAINT_PRIORITY_LEVEL"),
        //     isMandatory: true,
        //     type: "dropdown",
        //     populators: <Dropdown option={priorityMenu} optionKey="name" id="priorityLevel" selected={priorityLevel} select={selectedPriorityLevel} />,
          
        // },
        // {
        //   //label: t("WS_COMMON_PROPERTY_DETAILS"),
        //   "isEditConnection": true,
        //   "isCreateConnection": true,
        //   "isModifyConnection": true,
        //   "isEditByConfigConnection": true,
        //   "isProperty":subType?.key?.includes("Property")?true:false,
        //   component: "CPTPropertySearchNSummary",
        //   key: "cpt",
        //   type: "component",
        //   "body": [
        //       {
        //           "component": "CPTPropertySearchNSummary",
        //           "withoutLabel": true,
        //           "key": "cpt",
        //           "type": "component",
        //           "hideInCitizen": true
        //       }
        //   ]
        // }
     
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
          label: t("CS_COMPLAINT_DETAILS_CITY"),
          isMandatory: true,
          type: "dropdown",
          populators: (
            <Dropdown
              isMandatory
              selected={selectedCity}
              // freeze={true}
              option={getCities()}
              id="city"
              select={selectCity}
              optionKey="i18nKey"
              t={t}
            />
          ),
        },
        {
          label: t("CS_CREATECOMPLAINT_MOHALLA"),
          type: "dropdown",
          isMandatory: true,
          dependency: selectedCity && localities ? true : false,
          populators: (
            <Dropdown isMandatory selected={selectedLocality} optionKey="i18nkey" id="locality" option={localities} select={selectLocality} t={t} placeholder={t("CS_CREATECOMPLAINT_CHOOSE_LOCALITY_MOHALLA")} />
          ),
        },
        {
          label: t("ES_NEW_APPLICATION_STREET_NAME"),
          type: "textarea",
          populators: {
            name: "streetName",
            placeholder: t("CS_HOUSE_NO_STREET_NAME_PLACEHOLDER"),
          },
        },
        {
          label: t("CS_COMPLAINT_DETAILS_LANDMARK"),
          type: "textarea",
          populators: {
            name: "landmark",
            placeholder: t("CS_LANDMARK_PLACEHOLDER"),
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
                <div className="font-Weigth-bold">{t("CS_COMPLAINT_DETAILS_SELECTED_LOCATION") + ": " + geoLocation?.place + "," + geoLocation?.val}</div>
              ) : (
                <div className="font-Weigth-bold">{t("CS_COMPLAINT_DETAILS_NO_LOCATION_SELECTED")}</div>
              )}
            </div>
          ),
       },
      ],
    },
    {
      head: t("CS_COMPLAINT_DETAILS_ADDITIONAL_DETAILS"),
      body: [
        {
          //label: t("CS_COMPLAINT_DETAILS_ADDITIONAL_DETAILS"),
          type: "textarea",
          onChange: handleDescription,
          value:description,
          populators: {
            name: "description",
            placeholder: t("CS_ADDITIONAL_DETAILS_PLACEHOLDER"),
            onChange: handleDescription,
          },
        },
      ],
    },
    {
      head: t("CS_COMPLAINT_DETAILS_UPLOAD_IMAGES"),
      body: [
        {
          //label: t("CS_COMPLAINT_DETAILS_UPLOAD_IMAGES_TEXT"),
          type: "component",
          key: "imageSelector",
          isMandatory: true,
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
    useEffect(()=>{
      if(propetyData !== "undefined"   && propetyData !== null)
      {
       let data =JSON.parse(propetyData)
       setPropertyData(data)
        setPropertyId(data?.propertyId)
      }
    },[])
  useEffect(()=>{
    if(property !== "undefined" && property !== null )
    {
      let data =property
     
      setPincode(data?.address?.pincode || "")
      
      let b= localities.filter((item)=>{
        return item.code === data?.address?.locality?.code
      })
      setSelectedLocality(b?.[0])
      setDescription(data?.propertyId)
    }
   
  },[propertyId])
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