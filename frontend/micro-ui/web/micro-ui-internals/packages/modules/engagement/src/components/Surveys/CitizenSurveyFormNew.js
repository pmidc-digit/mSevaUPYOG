import React, { useState, useEffect } from "react";
import { Controller, useFormContext, useForm, get } from "react-hook-form";
import { TextInput, Dropdown, CheckBox, Toast } from "@mseva/digit-ui-react-components";
import CitizenDetails from "./CitizenDetails";

const CitizenSurveyFormNew = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    relationName: "",
    relation: null,
    address: "",
    email: "",
    dob: "",
    section1: {
      checkboxes: [],
      shortText: "",
    },
    section2: {
      multipleChoice: "",
    },
  });
  const { control: controlForm } = useForm({ defaultValues: formData });
  const relationList = [
    { label: "Father", value: "Father" },
    { label: "Husband", value: "Husband" },
  ];

  // useEffect(() => {
  //   const savedData = localStorage.getItem('surveyFormData');
  //   if (savedData) {
  //     setFormData(JSON.parse(savedData));
  //   }
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem('surveyFormData', JSON.stringify(formData));
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
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    else if (!/^[A-Za-z\s]+$/.test(formData.name)) newErrors.name = "Name can only contain alphabets and spaces";
    if (!formData.relationName) newErrors.relationName = "Father/Husband Name is required";
    else if (!/^[A-Za-z\s]+$/.test(formData.relationName)) newErrors.relationName = "Relation Name can only contain alphabets and spaces";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile number is invalid";
    if (!formData.relation) newErrors.relation = "Relation is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.section1.checkboxes.length > 0) newErrors.checkboxes = "This question is required to answer";
    if (!formData.section1.shortText) newErrors.shortText = "This question is required to answer";
    if (!formData.section2.multipleChoice) newErrors.multipleChoice = "This question is required to answer";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
    }
  };

  return (
    <div className="create-survey-page" style={{ background: "white", display: "block", padding: "15px" }}>
      <div className="category-card">
        <h1 style={{ fontWeight: "bold", fontSize: "20px" }}>Survey Title : Citizen Survey</h1>
        <div>
          <h1 style={{ fontWeight: "bold", fontSize: "20px" }}>Survey Description : This is a sample citizen survey</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <CitizenDetails formData={formData} setFormData={setFormData} errors={errors} relationList={relationList} />
          {/* <div style={{border:'2px solid #ccc',padding:'15px',borderRadius:'4px'}}>
          <h2>Citizen Details</h2>
          <div style={{border:'1px solid #ccc'}}></div>
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
              <h3>Mobile Number</h3>
      <input
        type="text"
        name="mobile"
        value={formData.mobile}
      
        onChange={handleFieldChange}
        placeholder="Mobile Number"
        //required
      />
       {errors.mobile && <span className="error">{errors.mobile}</span>}
       <h3>Date of Birth</h3>
       <TextInput name="dob" value={formData.dob} type="date" onChange={handleFieldChange} style={{height:'100'}} />
       {errors.dob && <span className="error">{errors.dob}</span>}
       {/* <Controller
          control={controlForm}
          name="dob"
          // defaultValue={surveyFormState?.fromDate}
          defaultValue={formData.dob}
          onChange={handleFieldChange}
         // rules={{ required: true, validate: !enableEndDateTimeOnly? { isValidFromDate }:null }}
          render={({ onChange, value }) => 
            <TextInput name="dob" value={formData.dob} type="date" onChange={handleFieldChange} 
          // disable={disableInputs}
          //disable={readOnly||false}
          />} */}
          {/* /> */}

          {/* <h3>Father/Husband Name</h3>
      <input
        type="text"
        name="relationName"
        value={formData.relationName}
      
        onChange={handleFieldChange}
        placeholder="Father/Husband Name"
       // required
      />
       {errors.relationName && <span className="error">{errors.relationName}</span>}
<h3>Relation</h3>
  <Dropdown
         required={true}
          // t={t}
          id="relation"
          name="relation"
          option={relationList}
          select={(e)=>handleDropdownChange("relation",e)}
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
       // required
      />
       {errors.address && <span className="error">{errors.address}</span>}
            <h3>Email</h3>
      <input
        type="text"
        name="email"
        value={formData.email}
      
        onChange={handleFieldChange}
        placeholder="Email"
      //  required
      />
       {errors.email && <span className="error">{errors.email}</span>}
        </div> */}
          <div>
            <h2>Section 1</h2>
            <div>
              <h3>What is your feedback?</h3>
              <div>
                {/* <CheckBox

                  key={1}
                  label="Option1"
                  onChange={(e) => handleCheckboxChange('section1', e)}
                  checked={formData.section1.checkboxes.includes('option1')}

                /> */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    value="option1"
                    style={{ width: "20px", height: "20px", marginRight: "10px" }}
                    checked={formData.section1.checkboxes.includes("option1")}
                    onChange={(e) => handleCheckboxChange("section1", e)}
                  />
                  Option 1
                </div>

                {/* <CheckBox

                  key={2}
                  onChange={(e) => handleCheckboxChange('section1', e)}
                  checked={formData.section1.checkboxes.includes('option1')}

                /> */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    value="option2"
                    style={{ width: "20px", height: "20px", marginRight: "10px", color: "#0d43a7" }}
                    checked={formData.section1.checkboxes.includes("option2")}
                    onChange={(e) => handleCheckboxChange("section1", e)}
                  />
                  Option 2
                </div>
                {errors.checkboxes && <span className="error">{errors.checkboxes}</span>}
              </div>
            </div>
            <div>
              <h3>Tell us more about your product quality?</h3>
              <div>
                <input
                  type="text"
                  name="shortText"
                  placeholder="enter here"
                  value={formData.section1.shortText}
                  onChange={(e) => handleInputChange("section1", e)}
                />
                {errors.shortText && <span className="error">{errors.shortText}</span>}
              </div>
            </div>
          </div>
          <div>
            <h2>Section 2</h2>
            <div>
              <h3>Give your rating?</h3>
              <div>
                <select name="multipleChoice" value={formData.section2.multipleChoice} onChange={(e) => handleInputChange("section2", e)}>
                  <option value="">Select an option</option>
                  <option value="choice1">Choice 1</option>
                  <option value="choice2">Choice 2</option>
                </select>
              </div>
              {errors.multipleChoice && <span className="error">{errors.multipleChoice}</span>}
            </div>
          </div>
          <button type="submit">Submit</button>
          <button
            style={{ backgroundColor: "none", marginLeft: "10px" }}
            onClick={() =>
              setFormData({
                name: "",
                mobile: "",
                relationName: "",
                relation: null,
                address: "",
                email: "",
                dob: "",
                section1: {
                  checkboxes: [],
                  shortText: "",
                },
                section2: {
                  multipleChoice: "",
                },
              })
            }
          >
            Reset
          </button>
        </form>
      </div>
    </div>
  );
};

export default CitizenSurveyFormNew;
