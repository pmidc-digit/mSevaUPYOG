import React, { useState, useEffect } from "react";
import { Controller, useFormContext, useForm } from "react-hook-form";
import { TextInput, Dropdown, CheckBox, Toast } from "@mseva/digit-ui-react-components";
import CitizenDetails from "../../../components/Surveys/CitizenDetails";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
const FillSurvey = ({ stateCode }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const location = useLocation();
  const [getUser, setUser] = useState();
  console.log("loca", location.state.surveyDetails);
  const surveyDetails = location.state?.surveyDetails || {};
  console.log("surv det", surveyDetails);

  const userInfo = Digit.UserService.getUser()?.info || {};

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [showToast, setShowToast] = useState(null);
  //const [citizenFound, setCitizenFound]=useState(null)
  const [register, setRegister] = useState(null);
  const [Otp, setGetOtp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    dob: "",
    gender: "",
    city: "",
    otp: "",
    citizenFound: null,
    register: null,
    user: null,
    // relationName: "",
    // relation: null,
    // address: "",
    // email: "",
    // dob: "",
  });

  const relationList = [
    { label: "Father", value: "Father" },
    { label: "Husband", value: "Husband" },
  ];

  // useEffect(() => {
  //   const savedData = localStorage.getItem("surveyFormCitizenData");
  //   if (savedData) {
  //     setFormData(JSON.parse(savedData));
  //   }
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem("surveyFormCitizenData", JSON.stringify(formData));
  // }, [formData]);

  const handleCheckboxChange = (section, event) => {
    const { value, checked } = event.target;
    setFormData((prevData) => {
      const newCheckboxes = checked ? [...prevData[section].checkboxes, value] : prevData[section].checkboxes.filter((item) => item !== value);
      return { ...prevData, [section]: { ...prevData[section], checkboxes: newCheckboxes } };
    });
  };

  const handleInputChange = (section, event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [section]: { ...prevData[section], [name]: value },
    }));
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    console.log("date value", event.target);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  console.log("formData", formData);
  const handleDropdownChange = (name, event) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: event,
    }));
  };
  const [errors, setErrors] = useState({});

  function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  const validateForm = () => {
    const newErrors = {};
    // if (!formData.name) newErrors.name = "Name is required";
    // else if (!/^[A-Za-z\s]+$/.test(formData.name)) newErrors.name = "Name can only contain alphabets and spaces";
    // if (!formData.relationName) newErrors.relationName = "Father/Husband Name is required";
    // else if (!/^[A-Za-z\s]+$/.test(formData.relationName)) newErrors.relationName = "Relation Name can only contain alphabets and spaces";
    // if (!formData.email) newErrors.email = "Email is required";
    // else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile number is invalid";
    if (!formData.city) newErrors.city = "City is required";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invlid Email";

    if (!formData.gender) newErrors.gender = "Gender is required";

    const age = calculateAge(formData.dob); // Assume calculateAge is a function that calculates age from dob

    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    else if (age < 15 || age > 100) newErrors.dob = "Age must be between 15 and 100 years";
    // if (!formData.relation) newErrors.relation = "Relation is required";
    // if (!formData.address) newErrors.address = "Address is required";
    // if (!formData.dob) newErrors.dob = "Date of Birth is required";
    // if (!formData.section1.checkboxes.length > 0) newErrors.checkboxes = 'This question is required to answer';
    // if (!formData.section1.shortText) newErrors.shortText = 'This question is required to answer';
    // if (!formData.section2.multipleChoice) newErrors.multipleChoice = 'This question is required to answer';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validateRegisterForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    else if (!/^[A-Za-z\s]+$/.test(formData.name)) newErrors.name = "Name can only contain alphabets and spaces";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invlid Email";

    if (!formData.gender) newErrors.gender = "Gender is required";

    const age = calculateAge(formData.dob); // Assume calculateAge is a function that calculates age from dob

    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    else if (age < 15 || age > 100) newErrors.dob = "Age must be between 15 and 100 years";

    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile number is invalid";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.otp) newErrors.otp = "Otp is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleNext = () => {
    const data = {
      userName: formData?.mobile,
      tenantId: tenantId.split(".")[0],
    };
    const filters = {
      tenantId: tenantId.split(".")[0],
    };

    Digit.Surveys.userSearch(data, filters)
      .then((response) => {
        console.log("response", response);

        if ((response?.responseInfo?.status === "200" || response?.responseInfo?.status === "201") && response?.user.length > 0) {
          setFormData((prevData) => ({
            ...prevData,
            ["citizenFound"]: true,
            ["email"]: response.user?.email,
            ["gender"]: response.user?.gender,
            ["dob"]: response.user?.dob,
          }));

          // setCitizenFound(true)
          history.push("/digit-ui/employee/engagement/surveys/fill-survey", {
            citizenFill: true,
            citizenData: formData,
            userInfo: response.user[0],
            surveyDetails: surveyDetails,
          });
        } else {
          setFormData((prevData) => ({
            ...prevData,
            ["citizenFound"]: false,
          }));
          // setCitizenFound(false)
          setShowToast({ key: true, isError: true, label: `CITIZEN NOT FOUND FOR THE GIVEN DETAILS` });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleRegisterNext = () => {
    let payload = {
      name: formData.name,
      username: formData.mobile,
      otpReference: formData.otp,
      tenantId: `${stateCode}`,
      permanentCity: formData.city.code,
    };
    try {
      Digit.UserService.registerUser(payload, stateCode).then((response) => {
        if (response?.UserRequest !== null || response?.UserRequest !== undefined) {
          history.push("/digit-ui/employee/engagement/surveys/fill-survey", {
            citizenFill: true,
            citizenData: formData,
            userInfo: response.UserRequest,
            surveyDetails: surveyDetails,
          });
        }
        console.log("res", response);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.citizenFound === null) {
      setShowToast({ key: true, isError: true, label: `PLEASE CLICK ON FETCH DETAILS BUTTON` });
      return;
    }
    const proceed = formData.register === true ? validateRegisterForm() : formData.citizenFound === true ? validateForm() : null;
    if (proceed) {
      console.log("Form submitted:", formData);
      console.log("reg", formData.register, formData.citizenFound);

      console.log("getUser", getUser);

      const existingUser = formData.user;

      if ((formData.register === false || formData.register === null) && formData.citizenFound === true) {
        const isEmailChanged = formData.email && formData.email !== existingUser?.emailId;
        const isGenderChanged = formData.gender && formData.gender !== existingUser?.gender;
        const isDobChanged = formData.dob && formData.dob !== existingUser?.dob;

        // Only call API if something has changed
        if (isEmailChanged || isGenderChanged || isDobChanged) {
          const requestData = {
            ...getUser,
            ...(isEmailChanged && { emailId: formData.email }),
            ...(isGenderChanged && { gender: formData.gender }),
            ...(isDobChanged && { dob: formData.dob }),
          };
          try {
            const { responseInfo, user } = await Digit.UserService.updateUser(requestData, getUser?.tenantId);
            console.log("User updated:", user);
          } catch (error) {
            console.error("Error updating user:", error);
            setShowToast({ key: true, isError: true, label: "FAILED TO UPDATE USER INFORMATION" });
            return;
          }
        } else {
          console.log("No user info changed. Skipping API call.");
        }

        console.log("formData", formData);

        history.push("/digit-ui/employee/engagement/surveys/fill-survey", {
          citizenFill: true,
          citizenData: formData,
          userInfo: formData.user,
          surveyDetails: surveyDetails,
          userType: location.state?.userType,
        });
      } else {
        handleRegisterNext();
      }
    }
  };
  const closeToast = () => {
    setShowToast(null);
  };
  return (
    <div className="create-survey-page" style={{ background: "white", display: "block", padding: "15px" }}>
      <div className="category-card">
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "black" }}>
            Survey Name: <span style={{ fontWeight: "normal", color: "black" }}>{surveyDetails.surveyTitle}</span>
          </h2>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "black" }}>
            Survey Description: <span style={{ fontWeight: "normal", color: "black" }}>{surveyDetails.surveyDescription}</span>
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <CitizenDetails
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            stateCode={stateCode}
            Otp={Otp}
            setGetOtp={setGetOtp}
            city={formData?.city}
            getUser={getUser}
            setUser={setUser}
          />
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "10px", flexDirection: "row", marginTop: "10px" }}>
            <button type="submit">Next</button>
            <button
              style={{ backgroundColor: "none" }}
              onClick={() =>
                setFormData({
                  name: "",
                  mobile: "",
                  email: "",
                  dob: "",
                  gender: "",
                  city: "",
                  otp: "",
                  citizenFound: null,
                  register: null,
                  user: null,
                })
              }
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn="true" />}
    </div>
  );
};

export default FillSurvey;
