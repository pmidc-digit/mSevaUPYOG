import React, { useState, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Loader, Toast } from "@mseva/digit-ui-react-components";

const Search = ({ path }) => {
  const [isBothCallsFinished, setIsBothCallFinished] = useState(true);
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [payload, setPayload] = useState({});
  const Search = Digit.ComponentRegistryService.getComponent("WSSearchApplication");
  const applicationTypes = ["NEW_WATER_CONNECTION", "NEW_SEWERAGE_CONNECTION", "MODIFY_WATER_CONNECTION", "MODIFY_SEWERAGE_CONNECTION"];
  // const [businessServ, setBusinessServ] = useState("");
  const getUrlPathName = window.location.pathname;
  const checkPathName = getUrlPathName.includes("water/search-application");
  const businessServ = checkPathName ? "WS" : "SW";
  const [showToast, setShowToast] = useState(null);
  const [table,setTable]=useState([])
  let arr=[]
  let count=[]
  function onSubmit(_data) {
    console.log("data in application inbox",_data);
    if(_data.applicationNumber==="" && _data.connectionNumber==="" && _data.mobileNumber==="" && !_data.applicationType && !_data.applicationStatus && !_data.fromDate && !_data.toDate ){
      setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return 
    }
    const payload={
      isConnectionSearch:true
    }
    if(_data.connectionNumber!==""){
      payload.connectionNumber=_data.connectionNumber
    }
    if(_data.applicationNumber!==""){
      payload.applicationNumber=_data.applicationNumber
    }
    if(_data.mobileNumber!==""){
      payload.mobileNumber=_data.mobileNumber
    }
    if(_data.applicationType!==undefined){
      payload.applicationType=_data.applicationType?.code
    }
    if(_data.applicationStatus!==undefined){
      payload.applicationStatus=_data.applicationStatus?.code
    }
    if(_data.fromDate!==undefined){
      payload.fromDate=_data.fromDate
    }
    if(_data.toDate!==undefined){
      payload.toDate=_data.toDate
    }
  
       //sewerage search
       Digit.WSService.wsInboxSearch(payload)

       .then((response) => {
         console.log("response", response)
         console.log("response", response?.SewerageConnections)
         if (response?.ResponseInfo?.status === "200 OK" || response?.ResponseInfo?.status === "201 OK" || response?.ResponseInfo?.status === "successful") {
           if ((response?.SewerageConnections)?.length===0) {
             alert("No Records found");
           
            //  return;
           }
        else{
          count=response?.TotalCount
           response?.SewerageConnections.forEach((item) => {
            let res={}
           res.connectionNo=item?.connectionNo;
           res.applicationNo=item?.applicationNo
           res.applicationType=item?.applicationType 
           res.mobileNumber=item?.connectionHolders?.mobileNumber || ""
           res.applicationStatus=item?.applicationStatus ||""
           res.ownerName=item?.connectionHolders?.name ||""
           res.address=item?.connectionHolders?.correspondenceAddress || ""
          
           console.log("res",res)
           arr.push(res)
           })

           console.log("arr",arr)
           setTable(arr)
          // onSearchData(response?.Bills)
 
           alert("Bill generated")
          }
         }
         else {
           // alert(response?.Errors?.message)
           console.log(response?.Errors?.message)
           //onSearch({ key: true, label: response?.Errors?.message });
         }
 
       })
       .catch((err) => {
 
         //onSearch({ key: true, label: err });
         console.log("Error in Digit.HRMSService.ssoAuthenticateUser: ", err.response);
 
       });
 
 
       //water search
 
       Digit.WSService.wsInboxWaterSearch(payload)
 
       .then((response) => {
         console.log("response", response)
         console.log("response", response?.WaterConnection)
         if (response?.ResponseInfo?.status === "200 OK" || response?.ResponseInfo?.status === "201 OK" || response?.ResponseInfo?.status === "successful") {
           if ((response?.WaterConnection)?.length===0) {
             alert("No Records found")
             return;
           }
 
          // onSearchData(response?.Bills)
          response.WaterConnection.forEach((item) => {
            let res={}
           res.connectionNo=item?.connectionNo;
           res.applicationNo=item?.applicationNo
           res.applicationType=item?.applicationType 
           res.mobileNumber=item?.connectionHolders?.mobileNumber || ""
           res.applicationStatus=item?.applicationStatus ||""
           res.ownerName=item?.connectionHolders?.[0]?.name ||""
           res.address=item?.connectionHolders?.correspondenceAddress || ""
          
         
           arr.push(res)
           })
           console.log("arr",arr)
           setTable(arr)
           alert("Bill generated")
         }
         else {
           // alert(response?.Errors?.message)
           console.log(response?.Errors?.message)
           //onSearch({ key: true, label: response?.Errors?.message });
         }
 
       })
       .catch((err) => {
 
         //onSearch({ key: true, label: err });
         console.log("Error in Digit.HRMSService.ssoAuthenticateUser: ", err.response);
 
       });

     //  setTable(arr)
    // const index = applicationTypes.indexOf(_data.applicationType?.code);
    // var fromDate = new Date(_data?.fromDate);
    // fromDate?.setSeconds(fromDate?.getSeconds() - 19800);
    // var toDate = new Date(_data?.toDate);
    // toDate?.setSeconds(toDate?.getSeconds() + 86399 - 19800);
    // const data = {
    //   ..._data,
    //   ...(_data.toDate ? { toDate: toDate?.getTime() } : {}),
    //   ...(_data.fromDate ? { fromDate: fromDate?.getTime() } : {}),
    // };
    // setPayload(
    //   Object.keys(data)
    //     .filter((k) => data[k])
    //     .reduce((acc, key) => ({ ...acc, [key]: typeof data[key] === "object" ? data[key].code : data[key] }), {})
    // );
  }
 console.log("table",table)
  const config = {
    enabled: !!(payload && Object.keys(payload).length > 0),
  };

  const result = Digit.Hooks.ws.useSearchWS({ tenantId, filters: payload, config, bussinessService: businessServ, t ,shortAddress:true });

  const isMobile = window.Digit.Utils.browser.isMobile();

  if (result?.isLoading && isMobile) {
    return <Loader />
  }

  const getData = () => {
    if (result?.data?.length == 0 ) {
      return { display: "ES_COMMON_NO_DATA" }
    } else if (result?.data?.length > 0) {
      return result?.data
    } else {
      return [];
    }
  }

  // const isResultsOk = () => {
  //   return result?.data?.length > 0 ? true : false;
  // }
  const isResultsOk = () => {
    return table?.length > 0 ? true : false;
  }


  return (
    <Fragment>
      <Search
        t={t}
        tenantId={tenantId}
        onSubmit={onSubmit}
        data={table}
        count={count}
        resultOk={isResultsOk()}
        businessService={businessServ}
        isLoading={result?.isLoading}
      />
      {showToast && (
        <Toast
          error={showToast.error}
          warning={showToast.warning}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
        />
      )}
    </Fragment>
  );
};

export default Search;
