import { EditIcon, Header, LinkLabel, Loader, Modal ,Card,CardSectionHeader,StatusTable,Row} from "@mseva/digit-ui-react-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams,useLocation } from "react-router-dom";
import PropertyDocuments from "../../../../../templates/ApplicationDetails/components/PropertyDocuments";
import PropertyOwners from "../../../../../templates/ApplicationDetails/components/PropertyOwners";
import PropertyFloors from "../../../../../templates/ApplicationDetails/components/PropertyFloors";
import DocumentsPreview from "../../../../../templates/ApplicationDetails/components/DocumentsPreview";
import PropertyEstimates from "../../../../../templates/ApplicationDetails/components/PropertyEstimates";
import PropertyOwnerHistory from "./propertyOwnerHistory";
export const PropertyApplicationDetails = () => {
      const { t } = useTranslation();
      const tenantId = Digit.ULBService.getCurrentTenantId();
      const { id:applicationNumber } = useParams(); 
      const location = useLocation();
      const propertyId = location?.state?.propertyId
      const [appDetailsToShow, setAppDetailsToShow] = useState({});
     const [applicationData, setApplicationData] = useState([])
      console.log("tenantId",tenantId)
      useEffect(() =>{
        try{
       let filters={
        acknowledgementIds: applicationNumber,
        tenantId: tenantId
       }
       const auth =true
            Digit.PTService.applicationsearch({filters:filters,auth:auth}).then((response) => {
             console.log("response",response)
             if(response?.Properties?.length>0){
             setApplicationData(response.Properties)
             }
            //  else{
            //   setShowToast({ key: true, label: `${response?.Errors?.message}`,error:true });
            //  }
            })
          }
          catch(error)
          {
            console.log(error);
          }
      },[]
      )
     // let { isLoading, isError, data: applicationDetails, error } = Digit.Hooks.pt.useApplicationDetail(t, "pb.testing", applicationNumber);
     
     let { isLoading, isError, data: applicationDetails, error } = Digit.Hooks.pt.useApplicationDetail(t, tenantId, propertyId);
     console.log("applicationDetails",applicationDetails)
     const getTranslatedValues = (dataValue, isNotTranslated) => {
        if (dataValue) {
          return !isNotTranslated ? t(dataValue) : dataValue;
        } else {
          return t("NA");
        }
      };
     const getTextValue = (value) => {
        if (value?.skip) return value.value;
        else if (value?.isUnit) return value?.value ? `${getTranslatedValues(value?.value, value?.isNotTranslated)} ${t(value?.isUnit)}` : t("N/A");
        else return value?.value ? getTranslatedValues(value?.value, value?.isNotTranslated) : t("N/A");
      };
      console.log("application Data",applicationData)
  return (
    <Card style={{ position: "relative" }} className={"employeeCard-override"}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <CardSectionHeader>Property Application</CardSectionHeader>
      <h1 style={{fontSize:'18px',border:'1px solid grey',padding:'8px',backgroundColor:'grey',color:'white'}}>Application No: {applicationNumber}</h1>
      </div>
      <hr style={{marginTop:'10px'}}/>
      {applicationDetails?.applicationDetails?.map((detail, index) => (
       <React.Fragment key={index}>
         <div>
         <CardSectionHeader style={{ marginBottom: "16px", marginTop: "32px", fontSize: "24px" }}>
         {t(detail.title)}
         {detail?.Component ? <detail.Component /> : null}
         </CardSectionHeader>
         {detail?.isTable && (
              <table style={{ tableLayout: "fixed", width: "100%", borderCollapse: "collapse" }}>
                <tr style={{ textAlign: "left" }}>
                  {detail?.headers.map((header) => (
                    <th style={{ padding: "10px", paddingLeft: "0px" }}>{t(header)}</th>
                  ))}
                </tr>

                {detail?.tableRows.map((row, index) => {
                  if (index === detail?.tableRows.length - 1) {
                    return (
                      <>
                        <hr style={{ width: "370%", marginTop: "15px" }} className="underline" />
                        <tr>
                          {row.map((element) => (
                            <td style={{ textAlign: "left" }}>{t(element)}</td>
                          ))}
                        </tr>
                      </>
                    );
                  }
                  return (
                    <tr>
                      {row.map((element) => (
                        <td style={{ paddingTop: "20px", textAlign: "left" }}>{t(element)}</td>
                      ))}
                    </tr>
                  );
                })}
              </table>
            )}
              <StatusTable style={{}}>
              {detail?.title &&
                !detail?.title.includes("NOC") &&
                detail?.values?.map((value, index) => {
                  if (value.map === true && value.value !== "N/A") {
                    return (
                      
                      <Row
                        labelStyle={{ wordBreak: "break-all" }}
                        textStyle={{ wordBreak: "break-all" }}
                        key={t(value.title)}
                        label={t(value.title)}
                        text={<img src={t(value.value)} alt="" privacy={value?.privacy} />}
                      />
                    );
                  }
                
               
              
                      if(value.title!=="PT_PROPERTY_PTUID" ){
                        return (
                          <div>
                        <Row
                          key={t(value.title)}
                          label={t(value.title)}
                          text={getTextValue(value)}
                          last={index === detail?.values?.length - 1}
                          caption={value.caption}
                          className="border-none"
                          /* privacy object set to the Row Component */
                          privacy={value?.privacy}
                          // TODO, Later will move to classes
                          rowContainerStyle={{}}
                          labelStyle={{ wordBreak: "break-all" }}
                          textStyle={{ wordBreak: "break-all" }}
                        />
                      
                       
                      {/* {value.title === "PT_TOTAL_DUES" ? <ArrearSummary bill={fetchBillData.Bill?.[0]} /> : ""} */}
                   </div>
                        )
                      }
                  
                 })}
            </StatusTable>
         </div>
         {detail?.belowComponent && <detail.belowComponent />}
           {detail?.additionalDetails?.floors && <PropertyFloors floors={detail?.additionalDetails?.floors} />}
             {detail?.additionalDetails?.owners && <PropertyOwners owners={detail?.additionalDetails?.owners} />}
              {detail?.additionalDetails?.documentsWithUrl && <DocumentsPreview documents={detail?.additionalDetails?.documentsWithUrl} />}
             {detail?.additionalDetails?.documents && <PropertyDocuments documents={detail?.additionalDetails?.documents} />}
                {detail?.additionalDetails?.taxHeadEstimatesCalculation && (
                         <PropertyEstimates taxHeadEstimatesCalculation={detail?.additionalDetails?.taxHeadEstimatesCalculation} />
                       )}
       </React.Fragment>
      ))}
      
    </Card> 
    // <ApplicationDetailsTemplate
    //     applicationDetails={appDetailsToShow}
    //     isLoading={isLoading}
    //     isDataLoading={isLoading}
    //     applicationData={appDetailsToShow?.applicationData}
    //     mutate={null}
    //     workflowDetails={appDetailsToShow?.applicationData?.status === "ACTIVE" ? workflowDetails : {}}
    //     businessService="PT"
    //     showToast={showToast}
    //     setShowToast={setShowToast}
    //     closeToast={closeToast}
    //     showTimeLine={false}
    //     timelineStatusPrefix={"ES_PT_COMMON_STATUS_"}
    //     forcedActionPrefix={"WF_EMPLOYEE_PT.CREATE"}
    //   />
  )
}
