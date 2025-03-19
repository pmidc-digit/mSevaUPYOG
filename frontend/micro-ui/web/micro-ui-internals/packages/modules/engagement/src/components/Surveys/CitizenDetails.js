import React ,{Fragment, useState}from "react";
import { TextInput, Dropdown, CheckBox, Toast } from "@mseva/digit-ui-react-components";
const CitizenDetails = ({ formData, setFormData, errors, citizenFound,setRegister,register,stateCode,Otp,setGetOtp }) => {
  const { data: cities, isLoading } = Digit.Hooks.useTenants();
  const [showToast, setShowToast] = useState(null);
  console.log("cities",cities)
  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    console.log("date value", event.target);
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
        placeholder="Mobile Number"
        required
      />
      {errors.mobile && <span className="error">{errors.mobile}</span>}
      {citizenFound===false && 
      <div style={{display:"flex",flexDirection:"row",columnGap:'10px'}}>
      <h3>Do you want to register?</h3>
      <label style={{backgroundColor:"green"}} onClick={()=>setRegister(true)}>Yes</label>
      <label  style={{backgroundColor:"red"}} onClick={()=>setRegister(false)}>No</label>
      </div>
      }
      {register === true &&(
        <>
      <h3>Name</h3>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleFieldChange}
        placeholder="Citizen Name"
        // required
      />
      {errors.name && <span className="error">{errors.name}</span>}
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
        selected={formData.city || null}
      />
      {errors.city && <span className="error">{errors.city}</span>}
      <label  onClick={()=>getOtp()}>Get OTP</label>
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
