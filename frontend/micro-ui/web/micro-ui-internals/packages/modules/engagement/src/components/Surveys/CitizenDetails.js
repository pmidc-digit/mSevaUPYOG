import React from 'react'
import {TextInput, Dropdown, CheckBox ,Toast} from '@mseva/digit-ui-react-components';
const CitizenDetails = ({formData, setFormData,errors,relationList}) => {
    const handleFieldChange = (event) => {
        const { name, value } = event.target;
        console.log("date value",event.target)
        setFormData((prevData) => ({
          ...prevData,
           [name]: value 
        }));
      };
      const handleDropdownChange=(name,event)=>{
        setFormData((prevData) => ({
          ...prevData,
           [name]: event 
        }));
      }
  return (
        <div style={{border:'2px solid #ccc',padding:'15px',borderRadius:'4px'}}>
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
          
                <h3>Father/Husband Name</h3>
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
           </div>
  )
}

export default CitizenDetails