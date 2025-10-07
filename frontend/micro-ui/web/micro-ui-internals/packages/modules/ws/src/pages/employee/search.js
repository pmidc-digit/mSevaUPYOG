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
  const [sewerageResults, setSewerageResults] = useState([]);
  const [waterResults, setWaterResults] = useState([]);
  const [completedCalls, setCompletedCalls] = useState(0);
  let arr=[]
  let count=[]
  
  // useEffect to trigger Property API call when both searches complete
  React.useEffect(() => {
    if (completedCalls === 2) {
      callPropertyAPIAndMergeData(sewerageResults, waterResults);
    }
  }, [completedCalls, sewerageResults, waterResults]);
  
  // Function to call Property API after both WS/SW calls complete
  const callPropertyAPIAndMergeData = async (sewerageData, waterData) => {
    const allConnections = [...sewerageData, ...waterData];
    let allPropertyIds = [];
    
    // Collect all propertyIds
    allConnections.forEach(item => {
      if (item.propertyId && !allPropertyIds.includes(item.propertyId)) {
        allPropertyIds.push(item.propertyId);
      }
    });
    
    if (allPropertyIds.length > 0) {
      try {
        // Call Property API to get owner details
        const propertyResponse = await Digit.PTService.search({
          tenantId: tenantId,
          filters: { propertyIds: allPropertyIds.join(',') },
          auth: true
        });
        
        // Merge property data with connection data
        const propertiesData = propertyResponse?.Properties || [];
        const finalResults = [];
        
        allConnections.forEach(connection => {
          const matchingProperty = propertiesData.find(prop => prop.propertyId === connection.propertyId);
          
          if (matchingProperty) {
            // Use property owners data (complete information)
            const activeOwners = matchingProperty.owners?.filter(owner => owner.active) || [];
            const ownerNames = activeOwners.map(owner => owner.name).join(', ');
            const ownerMobile = activeOwners[0]?.mobileNumber || "";
            const ownerAddress = `${matchingProperty.address?.doorNo || ''}, ${matchingProperty.address?.street || ''}, ${matchingProperty.address?.locality?.name || ''}, ${matchingProperty.address?.city || ''}`.replace(/^,\s*|,\s*$/g, '');
            
            finalResults.push({
              ...connection,
              ownerName: ownerNames || connection.ownerName,
              mobileNumber: ownerMobile || connection.mobileNumber,
              address: ownerAddress || connection.address
            });
          } else {
            // Keep original connection data if no property match
            finalResults.push(connection);
          }
        });
        
        // Update table with complete data
        setTable(finalResults);
        
        // No alerts here - let the Search component handle display
        
      } catch (error) {
        // Still show connection data even if property API fails
        setTable(allConnections);
      }
    } else {
      // No property IDs found, show connection data only
      setTable(allConnections);
    }
  };
  function onSubmit(_data) {
    if(_data.applicationNumber==="" && _data.connectionNumber==="" && _data.mobileNumber==="" && !_data.applicationType && !_data.applicationStatus && !_data.fromDate && !_data.toDate ){
      setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return 
    }
    
    // Reset state for new search
    setSewerageResults([]);
    setWaterResults([]);
    setCompletedCalls(0);
    setTable([]);
    
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
         const currentSewerageResults = [];
         if (response?.ResponseInfo?.status === "200 OK" || response?.ResponseInfo?.status === "201 OK" || response?.ResponseInfo?.status === "successful") {
           response?.SewerageConnections?.forEach((item) => {
            let res={}
           res.connectionNo=item?.connectionNo;
           res.applicationNo=item?.applicationNo
           res.applicationType=item?.applicationType 
           res.mobileNumber=item?.connectionHolders?.mobileNumber || ""
           res.applicationStatus=item?.applicationStatus ||""
           res.ownerName=item?.connectionHolders?.name ||""
           res.address=item?.connectionHolders?.correspondenceAddress || ""
           res.propertyId=item?.propertyId || "" // Add propertyId for Property API call
          
           currentSewerageResults.push(res)
           })
         }
         
         setSewerageResults(currentSewerageResults);
         setCompletedCalls(prev => prev + 1);
 
       })
       .catch((err) => {
         setSewerageResults([]);
         setCompletedCalls(prev => prev + 1);
       });
 
 
       //water search
 
       Digit.WSService.wsInboxWaterSearch(payload)
 
       .then((response) => {
         const currentWaterResults = [];
         if (response?.ResponseInfo?.status === "200 OK" || response?.ResponseInfo?.status === "201 OK" || response?.ResponseInfo?.status === "successful") {
          response?.WaterConnection?.forEach((item) => {
            let res={}
           res.connectionNo=item?.connectionNo;
           res.applicationNo=item?.applicationNo
           res.applicationType=item?.applicationType 
           res.mobileNumber=item?.connectionHolders?.[0]?.mobileNumber || ""
           res.applicationStatus=item?.applicationStatus ||""
           res.ownerName=item?.connectionHolders?.[0]?.name ||""
           res.address=item?.connectionHolders?.[0]?.correspondenceAddress || ""
           res.propertyId=item?.propertyId || "" // Add propertyId for Property API call
          
           currentWaterResults.push(res)
           })
         }    
         setWaterResults(currentWaterResults);
         setCompletedCalls(prev => prev + 1);
 
       })
       .catch((err) => {
         setWaterResults([]);
         setCompletedCalls(prev => prev + 1);
       });
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
  const config = {
    enabled: false, // Disable the hook since we're using manual API calls
  };

  const result = Digit.Hooks.ws.useSearchWS({ tenantId, filters: payload, config, bussinessService: businessServ, t ,shortAddress:true });

  const isMobile = window.Digit.Utils.browser.isMobile();

  if (result?.isLoading && isMobile) {
    return <Loader />
  }

  const getData = () => {
    if (table?.length == 0 ) {
      return { display: "ES_COMMON_NO_DATA" }
    } else if (table?.length > 0) {
      return table
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
        data={getData()}
        count={table?.length || 0}
        resultOk={isResultsOk()}
        businessService={businessServ}
        isLoading={false}
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
