import React ,{Fragment, useState}from "react";
import { TextInput, Dropdown, CheckBox, Toast } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { format, parseISO } from 'date-fns';
const CitizenDetails = ({ formData, setFormData, errors, setErrors,stateCode,Otp,setGetOtp }) => {
  const { data: cities, isLoading } = Digit.Hooks.useTenants();
  const [showToast, setShowToast] = useState(null);
    const { t } = useTranslation();
  console.log("cities",cities)
  let menu = [];
  const { data: Menu } = Digit.Hooks.pt.useGenderMDMS(stateCode, "common-masters", "GenderType");
  Menu &&
    Menu.map((genderDetails) => {
      menu.push({ i18nKey: `PT_COMMON_GENDER_${genderDetails.code}`, code: `${genderDetails.code}`, value: `${genderDetails.code}` });
    });
  const closeToast = () => {
    setShowToast(null);
  };
  const genderList=[
    {label:"Male",value:"Male"},
    {label:"Female",value:"Female"},
    {label:"Other",value:"Other"},

  ]
  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    console.log("date e",event)
    console.log("date value", event.target);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleDateChange = (event) => {
    const { name, value } = event.target;
    console.log("date e",event)
    console.log("date value", event.target);
    if (value) {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();

      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }

      if (age < 15 || age > 100) {
          alert('Age must be between 15 and 100 years.');
      } else {
         // setError('');
         setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      }
  } else {
    //  setError('');
 
  }
    
  };
  const handleDropdownChange = (name, event) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: event,
    }));
  };
  const getOtp =()=>{
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
      Digit.UserService.sendOtp(payload, stateCode)
      .then((response) => {
        console.log(response)
       if(response?.isSuccessful===true){
   setGetOtp(true)
       }
       else{
        setShowToast({ key: true, isError: true, label: `${response}` });
        setGetOtp(false)
       }
      })
    } catch (err) {
      console.log(err);
      setGetOtp(false)
    }
   
  }

  const handleFetchDetails = () => {
    let newErrors={};
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile number is invalid";
    if (!formData.city) newErrors.city = "City is required";
   setErrors(newErrors)
   console.log("errors",newErrors.mobile)
   if(newErrors?.mobile===undefined && newErrors?.city===undefined){
    const data = {
      userName: formData?.mobile,
      tenantId: (formData?.city?.code).split(".")[0],
    };
    const filters = {
      tenantId: (formData?.city?.code).split(".")[0],
    };

    Digit.Surveys.userSearch(data, filters)
      .then((response) => {
        console.log("response", response);
      
        if ((response?.responseInfo?.status === "200" || response?.responseInfo?.status === "201") && response?.user.length>0) {
        // setCitizenFound(true)
        const formattedDate = format(parseISO(response.user[0]?.dob), 'dd/MM/yyyy');
         setFormData((prevData) => ({
          ...prevData,
          "citizenFound": true,
          "name": response.user[0]?.name,
          ["email"]:response.user[0]?.email,
          ["gender"]: response.user[0]?.gender,
          ["dob"]:response.user[0]?.dob,
          "register": false,
          // "city": response.user[0]?.permanentCity,
          "user": response.user[0],
        }));
   

          
        } else {
          setFormData((prevData) => ({
            ...prevData,
            "citizenFound": false
           
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

  return (
    <div style={{ border: "2px solid #ccc", padding: "15px", borderRadius: "4px" }}>
      <h2>Citizen Details</h2>
      <div style={{ border: "1px solid #ccc" }}></div>
      <h3>Mobile Number <span style={{ color: "red" }}>*</span></h3>
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
        selected={formData.city || null}
      />
      {errors.city && <span className="error">{errors.city}</span>}
      <label onClick={handleFetchDetails}>Fetch Details</label>
     
      {formData.citizenFound===false && 
      <div style={{display:"flex",flexDirection:"row",columnGap:'10px'}}>
      <h3>Do you want to register?</h3>
      <label style={{backgroundColor:"green"}} 
      onClick={()=>{
        setFormData((prevData) => ({
          ...prevData,
          "register": true,
        }));
      }

      }>Yes</label>
      <label  style={{backgroundColor:"red"}} onClick={()=>
      {
               setFormData((prevData) => ({
                ...prevData,
                ["register"]: false,
              }));
            }
        }>No</label>
      </div>
      }
      {(formData.register === true || formData.citizenFound === true) &&(
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
        <Dropdown
                         style={{ width: "100%" }}
                         className="form-field"
                         selected={formData?.gender}
                        
                         option={menu}
                         select={(e)=>handleDropdownChange("gender", e)}
                         value={formData?.gender}
                         optionKey="code"
                         t={t}
                         name="gender"
                         id="gender"
                       />      {errors.gender && <span className="error">{errors.gender}</span>}

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
     <input name="dob" type="date" onChange={handleDateChange} defaultValue={formData.dob} value={formData.dob}/>
     {errors.dob && <span className="error">{errors.dob}</span>}
     {formData.register === true && ( <label  onClick={()=>getOtp()}>Get OTP</label> )}
    </>
      )}
      {Otp===true ?
      <>
      <h3 style={{marginTop:'20px'}}>OTP</h3>
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
      :
      null}
    
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
