import React, { useState, useEffect, useMemo,Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Dropdown, Loader, BackButton } from "@mseva/digit-ui-react-components";
import { useRouteMatch, useHistory, useLocation } from "react-router-dom";
import { useQueryClient } from "react-query";

import { FormComposer } from "../../../components/FormComposer";
import { createComplaint } from "../../../redux/actions/index";

export const CreateComplaint = ({ parentUrl }) => {
   const location = useLocation();
   useEffect(() => {
    sessionStorage.removeItem("complaintType");
    sessionStorage.removeItem("subType");
    sessionStorage.removeItem("PriorityLevel");
    sessionStorage.removeItem("mobileNumber");
    sessionStorage.removeItem("name");
    sessionStorage.removeItem("emailId");
    sessionStorage.removeItem("houseNoAndStreetName");
    sessionStorage.removeItem("landmark");
    sessionStorage.removeItem("description");

     setComplaintType({});
      setSubType({});
      setPriorityLevel({});
      setMobileNumber("");
      setFullName("");
      setEmail("");
      setDescription("");
      setSelectedLocality(null);
      setSubTypeMenu([]);
      setSubmitted(false);
      setSubmitValve(false);
    // Add any other keys you want to clear
  }, [location.pathname]);
  const cities = Digit.Hooks.pgr.useTenants();
  const { t } = useTranslation();

  const getCities = () => cities?.filter((e) => e.code === Digit.ULBService.getCurrentTenantId()) || [];
  const propetyData = localStorage.getItem("pgrProperty");
  const [complaintType, setComplaintType] = useState(JSON?.parse(sessionStorage.getItem("complaintType")) || {});
  const [subTypeMenu, setSubTypeMenu] = useState([]);
  const [subType, setSubType] = useState(JSON?.parse(sessionStorage.getItem("subType")) || {});
  const [priorityLevel, setPriorityLevel] = useState(JSON?.parse(sessionStorage.getItem("PriorityLevel")) || {});
  const [pincode, setPincode] = useState("");
  const [mobileNumber, setMobileNumber] = useState(sessionStorage.getItem("mobileNumber") || "");
  const [fullName, setFullName] = useState(sessionStorage.getItem("name") || "");
  const [emailId, setEmail] = useState(sessionStorage.getItem("emailId") || "");
  const [selectedCity, setSelectedCity] = useState(getCities()[0] ? getCities()[0] : null);
  const [propertyId, setPropertyId] = useState("");
  const [description, setDescription] = useState("");
  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    getCities()[0]?.code,
    "admin",
    {
      enabled: !!getCities()[0],
    },
    t
  );

  const [localities, setLocalities] = useState(fetchedLocalities);
  const [selectedLocality, setSelectedLocality] = useState(null);
  const [canSubmit, setSubmitValve] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [property, setPropertyData] = useState(null);
  const [pincodeNotValid, setPincodeNotValid] = useState(false);
  const [params, setParams] = useState({});
  const tenantId = window.Digit.SessionStorage.get("Employee.tenantId");
  const menu = Digit.Hooks.pgr.useComplaintTypes({ stateCode: tenantId });
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
  const serviceDefinitions = Digit.GetServiceDefinitions;
  const client = useQueryClient();
 

  useEffect(() => {
    if (complaintType?.key && selectedCity?.code && selectedLocality?.code) {
      setSubmitValve(true);
    } else {
      setSubmitValve(false);
    }
  }, [complaintType, selectedCity, selectedLocality]);

  useEffect(() => {
    setLocalities(fetchedLocalities);
  }, [fetchedLocalities]);

  useEffect(() => {
    const city = cities.find((obj) => obj.pincode?.find((item) => item == pincode));
    if (city?.code === getCities()[0]?.code) {
      setPincodeNotValid(false);
      setSelectedCity(city);
      setSelectedLocality(null);
      const __localityList = fetchedLocalities;
      const __filteredLocalities = __localityList?.filter((city) => city["pincode"] == pincode);
      setLocalities(__filteredLocalities);
    } else if (pincode === "" || pincode === null) {
      setPincodeNotValid(false);
      setLocalities(fetchedLocalities);
    } else {
      setPincodeNotValid(true);
    }
  }, [pincode]);

  async function selectedType(value) {
    if (value.key !== complaintType.key) {
      if (value.key === "Others") {
        setSubType({ name: "" });
        setComplaintType(value);
        sessionStorage.setItem("complaintType", JSON.stringify(value));
        setSubTypeMenu([{ key: "Others", name: t("SERVICEDEFS.OTHERS") }]);
      } else {
        setSubType({ name: "" });
        setComplaintType(value);
        sessionStorage.setItem("complaintType", JSON.stringify(value));
        setSubTypeMenu(await serviceDefinitions.getSubMenu(tenantId, value, t));
      }
    }
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
    return;
  };

  function selectLocality(locality) {

    setSelectedLocality(locality);
  }

  const handlePincode = (value) => {
    if (value === undefined || value === null) return;
    const inputValue = typeof value === 'object' && value?.target ? value.target.value : value;
    setPincode(inputValue || "");
    if (!inputValue) {
      setPincodeNotValid(false);
    }
  };
  const handleMobileNumber = (value) => {
    if (value === undefined || value === null) return;
    const inputValue = typeof value === 'object' && value?.target ? value.target.value : value;
    setMobileNumber(inputValue || "");
    sessionStorage.setItem("mobileNumber", inputValue || "");
  };
  const handleName = (value) => {
    if (value === undefined || value === null) return;
    const inputValue = typeof value === 'object' && value?.target ? value.target.value : value;
    setFullName(inputValue || "");
    sessionStorage.setItem("name", inputValue || "");
  };
  const handleEmail = (value) => {
    if (value === undefined || value === null) return;
    const inputValue = typeof value === 'object' && value?.target ? value.target.value : value;
    setEmail(inputValue || "");
    sessionStorage.setItem("emailId", inputValue || "");
  };
  const handleDescription = (value) => {
    if (value === undefined || value === null) return;
    const inputValue = typeof value === 'object' && value?.target ? value.target.value : value;
    setDescription(inputValue || "");
    sessionStorage.setItem("description", inputValue || "");
  };

  const isPincodeValid = () => !pincodeNotValid;

  const config = [
    {
      head: t("ES_CREATECOMPLAINT_PROVIDE_COMPLAINANT_DETAILS"),
      body: [
        {
          label: t("ES_CREATECOMPLAINT_COMPLAINT_NAME"),
          isMandatory: true,
          type: "text",
          populators: {
            name: "name",
            value: fullName,
            placeholder: "Enter Citizen Name",
            onChange: handleName,
            validation: {
              required: true,
              pattern: /^[A-Za-z]/,
            },
            error: t("CS_ADDCOMPLAINT_NAME_ERROR"),
          },
        },
        {
          label: t("ES_CREATECOMPLAINT_MOBILE_NUMBER"),
          isMandatory: true,
          type: "text",
          populators: {
            name: "mobileNumber",
            value: mobileNumber,
            onChange: handleMobileNumber,
            validation: {
              required: true,
              pattern: /^[6-9]\d{9}$/,
            },
            error: t("CORE_COMMON_MOBILE_ERROR"),
            placeholder: t("ES_CREATECOMPLAINT_MOBILE_NUMBER_PLACEHOLDER"),
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
        {
          label: t("CS_COMPLAINT_DETAILS_COMPLAINT_TYPE"),
          isMandatory: true,
          type: "dropdown",
          populators: <Dropdown option={menu} optionKey="name" id="complaintType" selected={complaintType} select={selectedType} placeholder={t("CS_COMPLAINT_DETAILS_SELECT_COMPLAINT_TYPE")} />,
        },
        {
          label: t("CS_COMPLAINT_DETAILS_COMPLAINT_SUBTYPE"),
          isMandatory: true,
          type: "dropdown",
          menu: { ...subTypeMenu },
          populators: <Dropdown option={subTypeMenu} optionKey="name" id="complaintSubType" selected={subType} select={selectedSubType} placeholder={t("CS_COMPLAINT_DETAILS_SELECT_COMPLAINT_SUBTYPE")}/>,
        },
        // {
        //   label: t("CS_COMPLAINT_DETAILS_COMPLAINT_PRIORITY_LEVEL"),
        //   // isMandatory: true,
        //   type: "dropdown",
        //   populators: <Dropdown option={priorityMenu} optionKey="name" id="priorityLevel" selected={priorityLevel} select={selectedPriorityLevel} placeholder={t("CS_COMPLAINT_DETAILS_SELECT_PRIORITY_LEVEL")} />,
        // },
        // {
        //   //label: t("WS_COMMON_PROPERTY_DETAILS"),
        //   isEditConnection: true,
        //   isCreateConnection: true,
        //   isModifyConnection: true,
        //   isEditByConfigConnection: true,
        //   isProperty: subType?.key?.includes("Property") ? true : false,
        //   component: "CPTPropertySearchNSummary",
        //   key: "cpt",
        //   type: "component",
        //   body: [
        //     {
        //       component: "CPTPropertySearchNSummary",
        //       withoutLabel: true,
        //       key: "cpt",
        //       type: "component",
        //       hideInCitizen: true,
        //     },
        //   ],
        // },
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
              freeze={true}
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
          label: t("CS_COMPLAINT_DETAILS_HOUSE_NO_STREET_NAME"),
          type: "text",
          populators: {
            name: "houseNoAndStreetName",
            placeholder:t("CS_HOUSE_NO_STREET_NAME_PLACEHOLDER"),
          },
        },
        {
          label: t("CS_COMPLAINT_DETAILS_LANDMARK"),
          type: "textarea",
          populators: {
            name: "landmark",
            placeholder:t("CS_LANDMARK_PLACEHOLDER"),
          },
        },
      ],
    },
    {
      head: t("CS_COMPLAINT_DETAILS_ADDITIONAL_DETAILS"),
      body: [
        {
          label: t("CS_COMPLAINT_DETAILS_ADDITIONAL_DETAILS"),
          type: "textarea",
          onChange: handleDescription,
          value: description,
          populators: {
            name: "description",
            onChange: handleDescription,
            placeholder:t("CS_ADDITIONAL_DETAILS_PLACEHOLDER"),
          },
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

      let b = localities?.filter((item) => {
        return item.code === data?.address?.locality?.code;
      });
      setSelectedLocality(b?.[0]);
      setDescription(data?.propertyId);

    }
  }, [propertyId]);

  const wrapperSubmit = (data) => {
    if (!canSubmit) return;
    setSubmitted(true);
    !submitted && onSubmit(data);
  };

  //On SUbmit
  const onSubmit = async (data) => {


    if (!canSubmit) return;
    const cityCode = selectedCity.code;
    const city = selectedCity.city.name;
    const district = selectedCity.city.name;
    const region = selectedCity.city.name;
    const localityCode = selectedLocality.code;
    const localityName = selectedLocality.name;
    const landmark = data?.landmark;
    const houseNoAndStreetName = data?.houseNoAndStreetName;
    
    // Use complaintType.key as serviceCode (complaint type key)
    // const serviceCode = complaintType?.key;
     const { key } = subType;
    const complaintType = key;

    const mobileNumber = data?.mobileNumber;
    const name = data?.name;
    const emailId = data?.emailId;

    const formData = {
      ...data,
      cityCode,
      city,
      district,
      region,
      localityCode,
      localityName,
      landmark,
      houseNoAndStreetName,
      complaintType,  // Send the complaint type key as serviceCode
      priorityLevel,
      mobileNumber,
      name,
      emailId,
    };
    await dispatch(createComplaint(formData));
    await client.refetchQueries(["fetchInboxData"]);
    localStorage.removeItem("pgrProperty");
    history.push(parentUrl + "/response");
  };

  return (
    <div className="card">
    {/* {!location.pathname.includes("/response") && <BackButton>{t("CS_COMMON_BACK")}</BackButton>} */}
    <FormComposer
     key={location.pathname} 
      heading={t("ES_CREATECOMPLAINT_NEW_COMPLAINT")}
      config={config}
      onSubmit={wrapperSubmit}
      isDisabled={!canSubmit && !submitted}
      label={t("CS_ADDCOMPLAINT_ADDITIONAL_DETAILS_SUBMIT_COMPLAINT")}
      />
    </div>
  );
};
