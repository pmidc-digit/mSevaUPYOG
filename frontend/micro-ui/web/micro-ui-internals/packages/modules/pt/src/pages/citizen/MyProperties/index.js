import { Card, CardSubHeader, CardText, Header, Loader, SubmitBar } from "@mseva/digit-ui-react-components";
import React ,{useState,useEffect}from "react";
import { useTranslation } from "react-i18next";
import { Link , useParams} from "react-router-dom";
import MyProperty from "./my-properties";
import { propertyCardBodyStyle } from "../../../utils";

export const MyProperties = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();
  const user = Digit.UserService.getUser().userInfo;
  const { id: applicationNumber } = useParams();
  console.log("propertyId",applicationNumber)
  // let filter = window.location.href.split("/").pop();
  // let t1;
  // let off;
  // if (!isNaN(parseInt(filter))) {
  //   off = filter;
  //   t1 = parseInt(filter) + 50;
  // } else {
  //   t1 = 4;
  // }
  // let filter1 = !isNaN(parseInt(filter))
  //   ? { limit: "50", sortOrder: "ASC", sortBy: "createdTime", offset: off, tenantId ,status:"ACTIVE,INACTIVE"}
  //   : { limit: "4", sortOrder: "ASC", sortBy: "createdTime", offset: "0",mobileNumber:user?.mobileNumber, tenantId,status:"ACTIVE,INACTIVE" };
  // const { isLoading, isError, error, data } = Digit.Hooks.pt.usePropertySearchNew({ filters: filter1,searchedFrom:"myPropertyCitizen" }, { filters: filter1 });

  // if (isLoading) {
  //   return <Loader />;
  // }
const [applicationsList,setApplicationsList]=useState([])
  useEffect(()=>{
    try{
       let filters={propertyIds: applicationNumber}  
      Digit.PTService.search({tenantId: tenantId,filters:filters}).then((response) => {
       console.log("response",response)
       if(response?.Properties?.length>0){
        setApplicationsList(response.Properties)
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
  },[]);

 // const { Properties: applicationsList } = data || {};

  return (
    <React.Fragment>
      <Header>{`${t("PT_MY_PROPERTIES_HEADER")} ${applicationsList ? `(${applicationsList.length})` : ""}`}</Header>
      <div>
        {applicationsList?.length > 0 &&
          applicationsList.map((application, index) => (
            <div key={index}>
              <MyProperty application={application} />
            </div>
          ))}
        {!applicationsList?.length > 0 && <p style={{ marginLeft: "16px", marginTop: "16px" }}>{t("PT_NO_PROP_FOUND_MSG")}</p>}

        {applicationsList?.length !== 0 && (
          <div>
            <p style={{ marginLeft: "16px", marginTop: "16px" }}>
              <span className="link">{<Link to={`/digit-ui/citizen/pt/property/my-properties/${t1}`}>{t("PT_LOAD_MORE_MSG")}</Link>}</span>
            </p>
          </div>
        )}
      </div>
      <p style={{ marginLeft: "16px", marginTop: "16px" }}>
        {t("PT_TEXT_NOT_ABLE_TO_FIND_THE_APPLICATION")}{" "}
        <span className="link" style={{ display: "block" }}>
          <Link to="/digit-ui/citizen/pt/property/new-application/info">{t("PT_COMMON_CLICK_HERE_TO_REGISTER_NEW_PROPERTY")}</Link>
        </span>
      </p>
    </React.Fragment>
  );
};
