import React, { Fragment, useState, useEffect, useMemo } from "react";
import { TextInput, Dropdown, CheckBox, Toast } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";

const CitizenDetails = ({ formData, setFormData, errors, setErrors, stateCode, Otp, setGetOtp, setUser }) => {
  const { data: cities, isLoading } = Digit.Hooks.useTenants();
  const [showToast, setShowToast] = useState(null);
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  // const defaultCity = cities?.filter((ulb) => tenantId === ulb?.code);
  const defaultCity = useMemo(() => cities?.filter((ulb) => tenantId === ulb?.code), [cities, tenantId]);

  useEffect(() => {
    if (defaultCity && defaultCity.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        city: defaultCity[0],
      }));
    }
  }, [defaultCity]);

  const { data: Menu } = Digit.Hooks.pt.useGenderMDMS(stateCode, "common-masters", "GenderType");

  const menu = useMemo(() => {
    return (
      Menu?.map((genderDetails) => ({
        i18nKey: `PT_COMMON_GENDER_${genderDetails.code}`,
        code: genderDetails.code,
        value: genderDetails.code,
      })) || []
    );
  }, [Menu]);

  // Menu &&
  //   Menu.map((genderDetails) => {
  //     menu.push({ i18nKey: `PT_COMMON_GENDER_${genderDetails.code}`, code: `${genderDetails.code}`, value: `${genderDetails.code}` });
  //   });

  const closeToast = () => {
    setShowToast(null);
  };
  const genderList = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];
  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDropdownChange = (name, event) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: event,
    }));
  };
  const handleDropdownChangeNew = (name, event) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: event.target.value,
    }));
  };
  const getOtp = () => {
    const payload = {
      otp: {
        name: formData.name,
        permanentCity: formData.city.code,
        tenantId: `${stateCode}`,
        mobileNumber: formData.mobile,
        type: "register",
      },
    };
    try {
      Digit.UserService.sendOtp(payload, stateCode).then((response) => {
        if (response?.isSuccessful === true) {
          setGetOtp(true);
        } else {
          setShowToast({ key: true, isError: true, label: `${response}` });
          setGetOtp(false);
        }
      });
    } catch (err) {
      setGetOtp(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile number is invalid";

    if (!formData.city) newErrors.city = "City is required";

    return newErrors;
  };

  const handleFetchDetails = () => {
    const newErrors = validateForm();
    setErrors(newErrors);

    // let newErrors = {};
    // if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    // else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile number is invalid";
    // if (!formData.city) newErrors.city = "City is required";
    // setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const data = {
        userName: formData?.mobile,
        tenantId: (formData?.city?.code).split(".")[0],
      };

      const filters = {
        tenantId: (formData?.city?.code).split(".")[0],
      };

      Digit.Surveys.userSearch(data, filters)
        .then((response) => {
          setUser(response?.user?.[0]);
          console.log("response=====", response?.user?.[0]);
          console.log("response", response.user[0]?.emailId);

          if ((response?.responseInfo?.status === "200" || response?.responseInfo?.status === "201") && response?.user.length > 0) {
            // setCitizenFound(true)
            console.log("coming here na");
            // const formattedDate = format(parseISO(response.user[0]?.dob), "dd/MM/yyyy");
            setFormData((prevData) => ({
              ...prevData,
              citizenFound: true,
              name: response.user[0]?.name,
              ["email"]: response.user[0]?.emailId,
              ["gender"]: response.user[0]?.gender,
              ["dob"]: response.user[0]?.dob,
              register: false,
              // "city": response.user[0]?.permanentCity,
              user: response.user[0],
            }));
          } else {
            console.log("not here");
            setFormData((prevData) => ({
              ...prevData,
              citizenFound: false,
            }));
            // setCitizenFound(false)
            setShowToast({ key: true, isError: true, label: `CITIZEN NOT FOUND FOR THE GIVEN DETAILS` });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  useEffect(() => {
    console.log("UPDATED formData", formData);
  }, [formData]);

  return (
    <div style={{ border: "2px solid #ccc", padding: "15px", borderRadius: "4px" }}>
      <h2>Citizen Details</h2>
      <div style={{ border: "1px solid #ccc" }}></div>
      <h3>
        Mobile Number <span style={{ color: "red" }}>*</span>
      </h3>
      <input
        type="text"
        name="mobile"
        value={formData.mobile}
        onChange={handleFieldChange}
        placeholder="Enter Mobile Number"
        required
        maxLength={10}
      />
      {errors.mobile && <span className="error">{errors.mobile}</span>}
      <h3>City</h3>
      <Dropdown
        required={true}
        id="city"
        name="city"
        option={cities}
        className="cityCss"
        select={(e) => handleDropdownChange("city", e)}
        placeholder={"Select City"}
        optionKey="i18nKey"
        t={t}
        disable={tenantId === "pb.punjab" ? false : true}
        selected={tenantId === "pb.punjab" ? formData?.city : defaultCity?.[0]}
        // selected={formData.city || null}
      />
      {errors.city && <span className="error">{errors.city}</span>}
      <label onClick={handleFetchDetails}>Fetch Details</label>

      {formData.citizenFound === false && (
        <div style={{ display: "flex", flexDirection: "row", columnGap: "10px" }}>
          <h3>Do you want to register?</h3>
          <label
            style={{ backgroundColor: "green" }}
            onClick={() => {
              setFormData((prevData) => ({
                ...prevData,
                register: true,
              }));
            }}
          >
            Yes
          </label>
          <label
            style={{ backgroundColor: "red" }}
            onClick={() => {
              setFormData((prevData) => ({
                ...prevData,
                ["register"]: false,
              }));
            }}
          >
            No
          </label>
        </div>
      )}
      {(formData.register === true || formData.citizenFound === true) && (
        <>
          <h3>Citizen Name</h3>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleFieldChange}
            placeholder="Citizen Name"
            readOnly={formData.citizenFound}
            // required
            maxLength={100}
          />
          {errors.name && <span className="error">{errors.name}</span>}

          <h3>Citizen Gender</h3>
          {/* <Dropdown
            style={{ width: "100%" }}
            className="form-field"
            selected={formData?.gender}
            defaultValue={formData?.gender}
            option={menu}
            select={(e) => handleDropdownChange("gender", e)}
            value={formData?.gender}
            optionKey="code"
            t={t}
            name="gender"
            id="gender"
          />     */}
          <select id="dropdown" value={formData?.gender} onChange={(e) => handleDropdownChangeNew("gender", e)}>
            <option value="">--Please choose an option--</option>
            {menu.map((option, index) => (
              <option key={index} value={option.value}>
                {option.value}
              </option>
            ))}
          </select>
          {errors.gender && <span className="error">{errors.gender}</span>}

          <h3>Citizen Email</h3>
          <input
            type="email"
            id="emailInput"
            name="email"
            value={formData.email}
            onChange={handleFieldChange}
            placeholder="Citizen Email"
            defaultValue={formData.email}
            // required
            // maxLength={100}
          />
          {errors.email && <span className="error">{errors.email}</span>}
          <h3>Citizen Date of Birth</h3>

          <input name="dob" type="date" onChange={handleDateChange} defaultValue={formData.dob} value={formData.dob} />
          {errors.dob && <span className="error">{errors.dob}</span>}

          {formData.register === true && <label onClick={() => getOtp()}>Get OTP</label>}
        </>
      )}
      {Otp === true ? (
        <>
          <h3 style={{ marginTop: "20px" }}>OTP</h3>
          <input
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleFieldChange}
            placeholder="Enter Otp"
            // required
          />
          {errors.otp && <span className="error">{errors.otp}</span>}
        </>
      ) : null}

      {/* <h3>Date of Birth</h3>
      <TextInput name="dob" value={formData.dob} type="date" onChange={handleFieldChange} style={{ height: "100" }} />
      {errors.dob && <span className="error">{errors.dob}</span>}
     

      <h3>Father/Husband Name</h3>
      <input
        type="text"
        name="relationName"
        value={formData.relationName}
        onChange={handleFieldChange}
        placeholder="Father/Husband Name"
       
      />
      {errors.relationName && <span className="error">{errors.relationName}</span>}
      <h3>Relation</h3>
      <Dropdown
        required={true}
      
        id="relation"
        name="relation"
        option={relationList}
        select={(e) => handleDropdownChange("relation", e)}
        placeholder={"Select Relation"}
        optionKey="label"
        selected={formData.relation || null}
      />
      {errors.relation && <span className="error">{errors.relation}</span>}
      <h3>Correspondance Address</h3>
      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleFieldChange}
        placeholder="Address"
       
      />
      {errors.address && <span className="error">{errors.address}</span>}
      <h3>Email</h3>
      <input
        type="text"
        name="email"
        value={formData.email}
        onChange={handleFieldChange}
        placeholder="Email"
       
      />
      {errors.email && <span className="error">{errors.email}</span>} */}
      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn="true" />}
    </div>
  );
};

export default CitizenDetails;
