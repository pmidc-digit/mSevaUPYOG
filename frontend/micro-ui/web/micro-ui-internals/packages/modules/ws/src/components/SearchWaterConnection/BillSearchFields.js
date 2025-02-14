import React, { Fragment, useState, useEffect } from "react";
import { Controller, useWatch } from "react-hook-form";
import { TextInput, SubmitBar, SearchField, Localities, Dropdown,Loader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
const BillSearchFields = ({ register, control, reset, tenantId, t, setValue, OnresData,handleResSubmit,onSearch }) => {
  //const { t } = useTranslation();
  const [connectionType, setConnectionType] = useState("");
  const tenant = Digit.ULBService.getCurrentTenantId();
  const [locality, setLocality] = useState("");
  const [batch, setBatch] = useState([])
  const [batchValue, setBatchValue] = useState("")
  const [batchLocalityValue, setBatchLocalityValue] = useState("");
  const [connectionValue, setConnectionValue] = useState("")
  const [generatedBill, setGeneratedBill] = useState("")
  const [enableLocality,setEnableLocality]=useState(false)

  console.log("res data 3", OnresData)
  console.log("handle Res data 2",handleResSubmit)

  function selectLocality(value) {
    console.log("register, control", register, tenant)
    setValue('locality', value);
    setValue('tenantId', tenant);
    setLocality(value);
  }
  console.log(locality)
  function selectConnectionType(value) {
    console.log("register, control", register, tenant)
    setValue('locality', value);
    setValue('tenantId', tenant);
    setConnectionValue(value);
  }

  function selectBatch(value) {
    setBatchValue(value)
  }
  function selectBatchLocality(value) {
    setBatchLocalityValue(value)
  }
  function selectConnectionType(value) {
    setConnectionValue(value)
  }
  console.log("connection value", connectionValue)
  console.log("Locality value", locality)
  async function generateBill() {
    console.log("in generate bill")
    const payload = {
      BillScheduler: {

        transactionType: connectionValue?.code,
        status: "INITIATED",
        locality: enableLocality===false? batchLocalityValue?.code:locality?.code,
        billingcycleStartdate: 0,
        billingcycleEnddate: 0,
        isBatch: enableLocality===false?true:false,
        isGroup: false,
        tenantId: tenant
      }
    }
    Digit.WSService.wsGenerateBill(payload)
      .then((response) => {
        console.log("response", response)
        console.log("response", response?.billScheduler)
        if (response?.ResponseInfo?.status === "200 OK"|| response?.ResponseInfo?.status === "201 OK"||response?.ResponseInfo?.status === "successful") {
          if(response.billScheduler.length===0){
            alert("Water Bill not generated")
            return;
          }
          setGeneratedBill(response?.billScheduler)
          OnresData(response?.billScheduler)
          handleResSubmit(OnresData)
          alert("Bill generated")
        }
        else{
         // alert(response?.Errors?.message)
          console.log(response?.Errors?.message)
          onSearch({ key: true, label:response?.Errors?.message});
        }

      })
      .catch((err) => {
      //   OnresData( [
      //     {
      //         "transactionType": "Bill Generation",
      //         "locality": "SC5",
      //         "billingcycleStartdate": 1696118400000,
      //         "billingcycleEnddate": 1704047399000,
      //         "status": "INITIATED",
      //         "isBatch": false,
      //         "auditDetails": {
      //             "createdBy": "9056392a-3525-4fcd-97f4-13703652bede",
      //             "lastModifiedBy": "9056392a-3525-4fcd-97f4-13703652bede",
      //             "createdTime": 1737524820936,
      //             "lastModifiedTime": 1737524820936
      //         },
      //         "tenantId": "pb.testing",
      //         "group": null,
      //         "grup": null,
      //         "id": "ccfadb3a-ce72-4eb0-b193-cf18f546c05f"
      //     }
      // ])
      //     handleResSubmit(OnresData)
     // alert(err)
      onSearch({ key: true, label:err});
        console.log("Error in Digit.HRMSService.ssoAuthenticateUser: ", err.response);

      });

  }
  console.log("set genertared bill", generatedBill)
  async function batchType() {
    // const tenantId = Digit.SessionStorage.get("User")?.info?.tenantId;
    // console.log("tenant id",tenantId)
    const payload = {
      // hierarchyTypeCode:"REVENUE",
      // boundaryType:"Block",
      tenantId: tenant
    }
    Digit.LocationService.getRevenueBlocks(payload)
      .then((response) => {
        console.log("response", response)
        if (response?.ResponseInfo.status === "200 OK") {
          setBatch(response.TenantBoundary[0]?.boundary)
        }
        // else {
        //   setIsLoading(false);
        //   setShowToast(response.message);
        //   setTimeout(closeToast, 5000);
        // }
      })
      .catch((err) => {
        // setIsLoading(false);
      
        console.log("Error in Digit.HRMSService.ssoAuthenticateUser: ", err.response);
        // setShowToast(err?.response?.data?.Errors?.[0]?.message || "Something went wrong");
        // setTimeout(closeToast, 5000);
      });
  };


  // useEffect(() => {
  //   batchType()
  // }, [])
  console.log("Batch List", batch)

  const connectionTypeList = [
    { name: 'Sewerage', code: 'SW' },
    { name: 'Water', code: 'WS' }

  ]
  const batchLocality = [
    { name: 'Batch', code: 'b' },
    { name: 'Locality', code: 'l' },
  ]
  const [tenantLocalties,setTenantLocalities]=useState()

 let {data:tenantlocalties,isLoading}=Digit.Hooks.useBoundaryLocalities(tenantId, "revenue", { enabled: true}, t);

  //const { data: tenantlocalties, isLoading }=Digit.Hooks.useBoundaryLocalities(tenantId, "revenue", { enabled: false}, t);
  useEffect(() => {
   if(batchLocalityValue.code==='b'){
    setEnableLocality(false)
    setLocality("")
    batchType()
   
    setTenantLocalities([])
    
   }
   else if(batchLocalityValue.code==='l'){
    setEnableLocality(true)
    setBatchValue("")
    setTenantLocalities(tenantlocalties)
   }
  }, [batchLocalityValue])
 // let { tenantlocalties}=  Digit.Hooks.useBoundaryLocalities(tenantId, "revenue", { enabled: enabled}, t);
 
    // if (isLoading && !false) {
    //   return <Loader />;
    // }
 
  return (
    <>
      <SearchField>
        <label>Connection Type</label>
        <Dropdown
          selected={connectionValue}
          select={selectConnectionType}
          option={connectionTypeList}
          // optionCardStyles={{ height: "600px", overflow: "auto", zIndex: "10" }}
          optionKey="name"


        />
      </SearchField>
      <SearchField>
        <label>Select Batch or Locality</label>
        <Dropdown
          selected={batchLocalityValue}
          select={selectBatchLocality}
          option={batchLocality}
          // optionCardStyles={{ height: "600px", overflow: "auto", zIndex: "10" }}
          optionKey="name"


        />
      </SearchField>
      <SearchField>
        <label>{t("WS_SEARCH_LOCALITY_LABEL")}</label>
        {/* <Controller
          name="locality"
          defaultValue={null}
          control={control}
          inputRef={register({})}
          render={(props) => (
            <Localities
              selectLocality={selectLocality}
              tenantId={tenant}
              boundaryType="revenue"
              keepNull={false}
              optionCardStyles={{ height: "600px", overflow: "auto", zIndex: "10" }}
              selected={locality}

              //disable={!city?.code}
              disableLoader={false}
            />
          )}
        /> */}

         <Dropdown
              option={tenantLocalties}
              keepNull={ false}
              selected={locality}
              select={selectLocality}
              optionCardStyles={{ height: "600px", overflow: "auto", zIndex: "10" }}
              optionKey="i18nkey"
             // style={style}
             // disable={!tenantlocalties?.length || !city?.code}
            />

      </SearchField>
      <SearchField>
        <label>Batch</label>
        <Dropdown
          //keepNull={false}
          selected={batchValue}
          select={selectBatch}
          option={batch}
          optionKey="name"
          optionCardStyles={{ height: "600px", overflow: "auto", zIndex: "10" }}
          //optionKey="i18nkey"
          disable={!batch?.length || false}

        />
      </SearchField>
      <SearchField>
        <label>Group</label>
        <Dropdown
          //  selected={connectionType}
          //  select={selectConnectionType}
          option={connectionTypeList}
          // optionCardStyles={{ height: "600px", overflow: "auto", zIndex: "10" }}
          optionKey="i18nkey"


        />
      </SearchField>


      <SearchField>

        <SubmitBar
          className="ws-search-button"
          //  style={{border:'1px solid grey', display:'block',backgroundColor:'grey',height:'50%',width:'80%',textAlign:"center",marginTop:'8%',color:'white'}} 
          label="Search" submit />
      </SearchField>
      <SearchField>

        <button
          // style="color: white;"
          style={{ color: 'white' }}
          className="ws-button"
          onClick={() => {
            generateBill()
          }}
          //  style={{border:'1px solid grey', display:'block',backgroundColor:'grey',height:'50%',width:'80%',textAlign:"center",marginTop:'8%',color:'white'}} 
          label="Generate Bill" submit >
          Generate Bill
        </button>
      </SearchField>


      <SearchField>

      </SearchField>
      {/* <SearchField >
    
        {/* <SubmitBar label={t("WS_SEARCH_CONNECTION_SEARCH_BUTTON")} submit /> */}
      {/*        
      </SearchField>  */}
    </>
  );
};
export default BillSearchFields;
