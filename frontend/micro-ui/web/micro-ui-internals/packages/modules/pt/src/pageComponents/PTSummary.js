import React, { Fragment } from "react";
import { Card, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { useLocation ,useHistory} from "react-router-dom";
import { useDispatch } from "react-redux";
import { SET_PtNewApplication } from "../redux/actions/PTNewApplicationActions";
const PTSummary = ({ formData, t}) => {
  console.log("form data in summary component", formData);
  const { pathname: url } = useLocation();
    const history = useHistory();
    const dispatch=useDispatch()
  const mutateScreen = url.includes("/property-mutate/");
  const onEdit = (step) =>{
    console.log("on edit step",step)
    if(step==="PersonalDetails"){
      // history.push({pathname:"/digit-ui/citizen/pt/property/edit-step-one",state:{config:{ head: "Personal Details",
      //   stepLabel: "Property Address",//"HR_EMPLOYEE_DETAILS_STEP_LABEL",
      //   stepNumber: 1,
      //   isStepEnabled: true,
      //   body: [
      //     {
      //         "route": "map",
      //         "component": "PTSelectGeolocation",
      //         "nextStep": "pincode",
      //         "hideInEmployee": true,
      //         "key": "address",
      //         "texts": {
      //             "header": "PT_GEOLOCATON_HEADER",
      //             "cardText": "PT_GEOLOCATION_TEXT",
      //             "nextText": "PT_COMMON_NEXT",
      //             "skipAndContinueText": "CORE_COMMON_SKIP_CONTINUE"
      //         }
      //     },
      //     {
      //         "route": "pincode",
      //         "component": "PTSelectPincode",
      //         "texts": {
      //             "headerCaption": "PT_PROPERTY_LOCATION_CAPTION",
      //             "header": "PT_PINCODE_LABEL",
      //             "cardText": "PT_PINCODE_TEXT",
      //             "submitBarLabel": "PT_COMMON_NEXT",
      //             "skipText": "CORE_COMMON_SKIP_CONTINUE"
      //         },
      //         "withoutLabel": true,
      //         "key": "address",
      //         "nextStep": "address",
      //         "type": "component"
      //     },
      //     {
      //         "route": "address",
      //         "component": "PTSelectAddress",
      //         "withoutLabel": true,
      //         "texts": {
      //             "headerCaption": "PT_PROPERTY_LOCATION_CAPTION",
      //             "header": "CS_FILE_APPLICATION_PROPERTY_LOCATION_ADDRESS_TEXT",
      //             "cardText": "CS_FILE_APPLICATION_PROPERTY_LOCATION_CITY_MOHALLA_TEXT",
      //             "submitBarLabel": "PT_COMMON_NEXT"
      //         },
      //         "key": "address",
      //         "nextStep": "street",
      //         "isMandatory": true,
      //         "type": "component"
      //     },
      //     {
      //         "type": "component",
      //         "route": "street",
      //         "component": "PTSelectStreet",
      //         "key": "address",
      //         "withoutLabel": true,
      //         "texts": {
      //             "headerCaption": "PT_PROPERTY_LOCATION_CAPTION",
      //             "header": "CS_FILE_APPLICATION_PROPERTY_LOCATION_ADDRESS_TEXT",
      //             "cardText": "PT_STREET_TEXT",
      //             "submitBarLabel": "PT_COMMON_NEXT"
      //         },
      //         "nextStep": "landmark"
      //     },
      //     {
      //         "type": "component",
      //         "route": "landmark",
      //         "component": "PTSelectLandmark",
      //         "withoutLabel": true,
      //         "texts": {
      //             "headerCaption": "PT_PROPERTY_LOCATION_CAPTION",
      //             "header": "CS_FILE_APPLICATION_PROPERTY_LOCATION_PROVIDE_LANDMARK_TITLE",
      //             "cardText": "CS_FILE_APPLICATION_PROPERTY_LOCATION_PROVIDE_LANDMARK_TEXT",
      //             "submitBarLabel": "PT_COMMON_NEXT",
      //             "skipText": "CORE_COMMON_SKIP_CONTINUE"
      //         },
      //         "key": "address",
      //         "nextStep": "proof",
      //         "hideInEmployee": true
      //     },
      //     {
      //         "type": "component",
      //         "route": "proof",
      //         "component": "Proof",
      //         "withoutLabel": true,
      //         "texts": {
      //             "headerCaption": "PT_PROPERTY_LOCATION_CAPTION",
      //             "header": "PT_PROOF_OF_ADDRESS_HEADER",
      //             "cardText": "",
      //             "nextText": "PT_COMMONS_NEXT",
      //             "submitBarLabel": "PT_COMMONS_NEXT"
      //         },
      //         "key": "address",
      //         "nextStep": "owner-ship-details@0",
      //         "hideInEmployee": true
      //     }
      // ],
      //   type: "component",
      //   component: "PTNewFormStepOneCitizen",
      //   key: "PersonalDetails",
      //   withoutLabel: true,
      //   texts: {
      //     submitBarLabel: "Next",
      //   }}}})
      history.push({pathname:"/digit-ui/citizen/pt/property/edit-step-form",state:{edit:true,currentStepNumber:1}})
    }
   }
  return (
    <>
      {mutateScreen ? (
        <div className="application-summary">
          {/* <h2>{t("Transferor Details")}</h2> */}
        

          {/* Ownership Category Section */}
          {/* <div className="summary-section">
            <div className="section-header">
              <h3>{t("Ownership Category")}</h3>
            </div>
            <div className="section-content">
              <LabelFieldPair>
                <CardLabel>{t("Ownership Category")}</CardLabel>
                <div>{formData?.TransferorDetails?.ownershipCategory?.label || "NA"}</div>
              </LabelFieldPair>
            </div>
          </div> */}

          {/* Owners Section */}
          {/* <div className="summary-section">
            <div className="section-header">
              <h3>{t("Owner Details")}</h3>
            </div>
            <div className="section-content">
              {formData?.TransferorDetails?.owners?.map((owner, index) => (
                <div key={index}>
                  <LabelFieldPair>
                    <CardLabel>{t("Name")}</CardLabel>
                    <div>{owner.name || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Mobile Number")}</CardLabel>
                    <div>{owner.mobileNumber || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Guardian Name")}</CardLabel>
                    <div>{owner.fatherOrHusbandName || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Email ID")}</CardLabel>
                    <div>{owner.emailId || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Gender")}</CardLabel>
                    <div>{owner.gender?.i18nKey || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Correspondence Address")}</CardLabel>
                    <div>{owner.correspondenceAddress || "NA"}</div>
                  </LabelFieldPair>
                </div>
              ))}
            </div>
          </div> */}

          {/* Additional Details Section */}
          {/* <div className="summary-section">
            <div className="section-header">
              <h3>{t("Additional Details")}</h3>
            </div>
            <div className="section-content">
              <LabelFieldPair>
                <CardLabel>{t("Document Number")}</CardLabel>
                <div>{formData?.TransferorDetails?.additionalDetails?.documentNumber || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Document Value")}</CardLabel>
                <div>{formData?.TransferorDetails?.additionalDetails?.documentValue || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Document Date")}</CardLabel>
                <div>{formData?.TransferorDetails?.additionalDetails?.documentDate || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Reason for Transfer")}</CardLabel>
                <div>{formData?.TransferorDetails?.additionalDetails?.reasonForTransfer?.name || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Market Value")}</CardLabel>
                <div>{formData?.TransferorDetails?.additionalDetails?.marketValue || "NA"}</div>
              </LabelFieldPair>
            </div>
          </div> */}

          {/* Document Details Section */}
          {/* <div className="summary-section">
            <div className="section-header">
              <h3>{t("Document Details")}</h3>
            </div>
            <div className="section-content">
              {formData?.TransferorDetails?.DocuementDetails?.documents?.documents?.map((doc, index) => (
                <LabelFieldPair key={index}>
                  <CardLabel>{t("Document Type")}</CardLabel>
                  <div>{doc.documentType || "NA"}</div>
                </LabelFieldPair>
              ))}
            </div>
          </div> */}

          {/* Remarks Section */}
          {/* <div className="summary-section">
            <div className="section-header">
              <h3>{t("Remarks")}</h3>
            </div>
            <div className="section-content">
              <LabelFieldPair>
                <CardLabel>{t("Remarks")}</CardLabel>
                <div>{formData?.TransferorDetails?.remarks || "NA"}</div>
              </LabelFieldPair>
            </div>
          </div> */}
        </div>
      ) : (
        <div className="application-summary">
          <h2 style={{fontSize:'20px',fontWeight:'bold'}}>{t("Application Summary")}</h2>

          {/* Property Address Section */}
          <Card className="summary-section" style={{padding:'2px'}}>
            <div className="section-header">
              <h3>{t("Property Address")}</h3>
              <label type="button"
            //  style={{display:'flex',padding:'2px',border:'2px solid blue'}}
               onClick={() => 
                //onEdit("PersonalDetails")
                
                 dispatch(SET_PtNewApplication(1))
                }>{t("EDIT")}</label>
            </div>
            <div className="section-content">
              <LabelFieldPair>
                <CardLabel>{t("City")}</CardLabel>
                <div>{formData?.PersonalDetails?.address?.city?.name || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Door/House No.")}</CardLabel>
                <div>{formData?.PersonalDetails?.address?.doorNo || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Colony Name")}</CardLabel>
                <div>{formData?.PersonalDetails?.address?.buildingName || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Street Name")}</CardLabel>
                <div>{formData?.PersonalDetails?.address?.street || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Mohalla")}</CardLabel>
                <div>{formData?.PersonalDetails?.address?.locality?.code || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Pincode")}</CardLabel>
                <div>{formData?.PersonalDetails?.address?.pincode || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Existing Property ID")}</CardLabel>
                <div>{formData?.PersonalDetails?.existingPropertyId || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Survey Id/UID")}</CardLabel>
                <div>{formData?.PersonalDetails?.surveyId || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Year of creation of Property")}</CardLabel>
                <div>{formData?.PersonalDetails?.yearOfCreation?.value || "NA"}</div>
              </LabelFieldPair>
            </div>
          </Card>

          {/* Property Details Section */}
          <div className="summary-section">
            <div className="section-header">
              <h3>{t("Property Details")}</h3>
              <label onClick={() =>
                //  onEdit("PropertyDetails")
                dispatch(SET_PtNewApplication(2))
                 }>{t("EDIT")}</label>
            </div>
            <div className="section-content">
              <LabelFieldPair>
                <CardLabel>{t("Property Usage Type")}</CardLabel>
                <div>{formData?.PropertyDetails?.usageCategoryMajor?.i18nKey || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Type of Building")}</CardLabel>
                <div>{formData?.PropertyDetails?.PropertyType?.i18nKey || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Plot Size(sq yards)")}</CardLabel>
                <div>{formData?.PropertyDetails?.landarea || "NA"} sq yards</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("No of Floor")}</CardLabel>
                <div>{formData?.PropertyDetails?.noOfFloors || "NA"}</div>
              </LabelFieldPair>
              {window.location.href.includes("/citizen")?null:
              <LabelFieldPair>
                <CardLabel>{t("Vasika No")}</CardLabel>
                <div>{formData?.PropertyDetails?.vasikaDetails?.vasikaNo || "NA"}</div>
              </LabelFieldPair>   
              }
               {window.location.href.includes("/citizen")?null:
              <LabelFieldPair>
                <CardLabel>{t("Vasika Date")}</CardLabel>
                <div>{formData?.PropertyDetails?.vasikaDetails?.vasikaDate || "NA"}</div>
              </LabelFieldPair>}
              {window.location.href.includes("/citizen")?null:
              <LabelFieldPair>
                <CardLabel>{t("Allotment No")}</CardLabel>
                <div>{formData?.PropertyDetails?.allottmentDetails?.allotmentNo || "NA"}</div>
              </LabelFieldPair>
}
{window.location.href.includes("/citizen")?null:
              <LabelFieldPair>
                <CardLabel>{t("Allotment Date")}</CardLabel>
                <div>{formData?.PropertyDetails?.allottmentDetails?.allotmentDate || "NA"}</div>
              </LabelFieldPair>
}
              <LabelFieldPair>
                <CardLabel>{t("Business Name")}</CardLabel>
                <div>{formData?.PropertyDetails?.businessName?.businessName || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Remarks")}</CardLabel>
                <div>{formData?.PropertyDetails?.remarks || "NA"}</div>
              </LabelFieldPair>
            </div>
          </div>

          {/* Owner Details Section */}
          <div className="summary-section">
            <div className="section-header">
              <h3>{t("Owner Details")}</h3>
              <label onClick={() => 
                // onEdit("ownerShipDetails")
                dispatch(SET_PtNewApplication(3))
                }>{t("EDIT")}</label>
            </div>
            <div className="section-content">
              {((formData?.ownerShipDetails?.ownershipCategory?.code)==="INSTITUTIONALPRIVATE"||(formData?.ownerShipDetails?.ownershipCategory?.code)==="INSTITUTIONALGOVERNMENT") &&
                <>
                     {formData?.ownerShipDetails?.owners?.map((owner, index) => (
                <div key={index}>
                  <LabelFieldPair>
                    <CardLabel>{t("Name of Institution")}</CardLabel>
                    <div>{owner.institution?.name || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Designation")}</CardLabel>
                    <div>{owner.designation || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Type of Institution")}</CardLabel>
                    <div>{formData?.ownerShipDetails?.ownershipCategory?.label || "NA"}</div>
                  </LabelFieldPair>
                 
                  <LabelFieldPair>
                    <CardLabel>{t("Telephone No")}</CardLabel>
                    <div>{owner.altContactNumber || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Name of Authorized person")}</CardLabel>
                    <div>{owner.name || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("MOBILE NO")}</CardLabel>
                    <div>{owner.mobileNumber || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("EMAIL ID")}</CardLabel>
                    <div>{owner.emailId || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Ownership Percentage")}</CardLabel>
                    <div>{owner?.ownershipPercentage || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Correspondence Address")}</CardLabel>
                    <div>{owner.correspondenceAddress || "NA"}</div>
                  </LabelFieldPair>
                </div>
              ))}
                </>
              }
               {((formData?.ownerShipDetails?.ownershipCategory?.code)==="INDIVIDUAL.SINGLEOWNER" ||(formData?.ownerShipDetails?.ownershipCategory?.code)==="INDIVIDUAL.MULTIPLEOWNERS") &&
               <>
                  {formData?.ownerShipDetails?.owners?.map((owner, index) => (
                <div key={index}>
                  <LabelFieldPair>
                    <CardLabel>{t("Name")}</CardLabel>
                    <div>{owner.name || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("GUARDIAN NAME")}</CardLabel>
                    <div>{owner.fatherOrHusbandName || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Gender")}</CardLabel>
                    <div>{owner.gender?.value || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Ownership Type")}</CardLabel>
                    <div>{formData?.ownerShipDetails?.ownershipCategory?.label || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("MOBILE NO")}</CardLabel>
                    <div>{owner.mobileNumber || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("EMAIL ID")}</CardLabel>
                    <div>{owner.emailId || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Ownership Percentage")}</CardLabel>
                    <div>{owner.ownershipPercentage || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Category")}</CardLabel>
                    <div>{owner.ownerType?.code || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Correspondence Address")}</CardLabel>
                    <div>{owner.correspondenceAddress || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Document Type")}</CardLabel>
                    <div>{owner.documents?.documentType?.i18nKey || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair>
                    <CardLabel>{t("Ownership Document ID")}</CardLabel>
                    <div>{owner.documents?.documentUid || "NA"}</div>
                  </LabelFieldPair>
                </div>
              ))}
               </>
               }
            </div>
          </div>

          {/* Documents Section */}
          <div className="summary-section">
            <div className="section-header">
              <h3>{t("Documents")}</h3>
              <label onClick={() =>
                //  onEdit("DocummentDetails")
                dispatch(SET_PtNewApplication(4))
                 }>{t("EDIT")}</label>
            </div>
            <div className="section-content">
              {formData?.DocummentDetails?.documents?.documents?.map((doc, index) => (
                <LabelFieldPair key={index}>
                  <CardLabel>{t("Document")}</CardLabel>
                  <div>{doc.documentType || "NA"}</div>
                </LabelFieldPair>
              ))}
            </div>
          </div>
        </div>
      
      )}
    </>
    // <div className="application-summary">
    //   <h2>{t("Application Summary")}</h2>

    //   {/* Property Address Section */}
    //   <div className="summary-section">
    //     <div className="section-header">
    //       <h3>{t("Property Address")}</h3>
    //       <button onClick={() => onEdit("PersonalDetails")}>{t("EDIT")}</button>
    //     </div>
    //     <div className="section-content">
    //       <LabelFieldPair>
    //         <CardLabel>{t("City")}</CardLabel>
    //         <div>{formData?.PersonalDetails?.address?.city?.name || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Door/House No.")}</CardLabel>
    //         <div>{formData?.PersonalDetails?.address?.doorNo || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Colony Name")}</CardLabel>
    //         <div>{formData?.PersonalDetails?.address?.buildingName || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Street Name")}</CardLabel>
    //         <div>{formData?.PersonalDetails?.address?.street || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Mohalla")}</CardLabel>
    //         <div>{formData?.PersonalDetails?.address?.locality?.code || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Pincode")}</CardLabel>
    //         <div>{formData?.PersonalDetails?.address?.pincode || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Existing Property ID")}</CardLabel>
    //         <div>{formData?.PersonalDetails?.existingPropertyId || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Survey Id/UID")}</CardLabel>
    //         <div>{formData?.PersonalDetails?.surveyId || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Year of creation of Property")}</CardLabel>
    //         <div>{formData?.PersonalDetails?.yearOfCreation?.value || "NA"}</div>
    //       </LabelFieldPair>
    //     </div>
    //   </div>

    //   {/* Property Details Section */}
    //   <div className="summary-section">
    //     <div className="section-header">
    //       <h3>{t("Property Details")}</h3>
    //       <button onClick={() => onEdit("PropertyDetails")}>{t("EDIT")}</button>
    //     </div>
    //     <div className="section-content">
    //       <LabelFieldPair>
    //         <CardLabel>{t("Property Usage Type")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.usageCategoryMajor?.i18nKey || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Type of Building")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.PropertyType?.i18nKey || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Plot Size(sq yards)")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.landarea || "NA"} sq yards</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("No of Floor")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.noOfFloors || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Vasika No")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.vasikaDetails?.vasikaNo || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Vasika Date")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.vasikaDetails?.vasikaDate || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Allotment No")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.allottmentDetails?.allotmentNo || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Allotment Date")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.allottmentDetails?.allotmentDate || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Business Name")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.businessName || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Remarks")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.remarks || "NA"}</div>
    //       </LabelFieldPair>
    //     </div>
    //   </div>

    //   {/* Owner Details Section */}
    //   <div className="summary-section">
    //     <div className="section-header">
    //       <h3>{t("Owner Details")}</h3>
    //       <button onClick={() => onEdit("ownerShipDetails")}>{t("EDIT")}</button>
    //     </div>
    //     <div className="section-content">
    //       {formData?.ownerShipDetails?.owners?.map((owner, index) => (
    //         <div key={index}>
    //           <LabelFieldPair>
    //             <CardLabel>{t("Name")}</CardLabel>
    //             <div>{owner.name || "NA"}</div>
    //           </LabelFieldPair>
    //           <LabelFieldPair>
    //             <CardLabel>{t("GUARDIAN NAME")}</CardLabel>
    //             <div>{owner.fatherOrHusbandName || "NA"}</div>
    //           </LabelFieldPair>
    //           <LabelFieldPair>
    //             <CardLabel>{t("Gender")}</CardLabel>
    //             <div>{owner.gender?.i18nKey || "NA"}</div>
    //           </LabelFieldPair>
    //           <LabelFieldPair>
    //             <CardLabel>{t("Type of Ownership")}</CardLabel>
    //             <div>{formData?.ownerShipDetails?.ownershipCategory?.label || "NA"}</div>
    //           </LabelFieldPair>
    //           <LabelFieldPair>
    //             <CardLabel>{t("MOBILE NO")}</CardLabel>
    //             <div>{owner.mobileNumber || "NA"}</div>
    //           </LabelFieldPair>
    //           <LabelFieldPair>
    //             <CardLabel>{t("EMAIL ID")}</CardLabel>
    //             <div>{owner.emailId || "NA"}</div>
    //           </LabelFieldPair>
    //           <LabelFieldPair>
    //             <CardLabel>{t("Correspondence Address")}</CardLabel>
    //             <div>{owner.correspondenceAddress || "NA"}</div>
    //           </LabelFieldPair>
    //         </div>
    //       ))}
    //     </div>
    //   </div>

    //   {/* Documents Section */}
    //   <div className="summary-section">
    //     <div className="section-header">
    //       <h3>{t("Documents")}</h3>
    //       <button onClick={() => onEdit("DocummentDetails")}>{t("EDIT")}</button>
    //     </div>
    //     <div className="section-content">
    //       {formData?.DocummentDetails?.documents?.documents?.map((doc, index) => (
    //         <LabelFieldPair key={index}>
    //           <CardLabel>{t("Document")}</CardLabel>
    //           <div>{doc.documentType || "NA"}</div>
    //         </LabelFieldPair>
    //       ))}
    //     </div>
    //   </div>
    // </div>
  );
};

export default PTSummary;
