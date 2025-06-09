import React, { useEffect, useMemo, useState } from "react";
import { Loader, SubmitBar, Table, Dropdown,SearchField,Card } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useHistory } from "react-router-dom";
import { useForm, FormProvider, Controller } from "react-hook-form";

const ActiveAndOpenSurveys = (props) => {
  const { userType } = props;
  const history = useHistory();
  const { t } = useTranslation();
    const userInfo = Digit.UserService.getUser().info;
    console.log("userinfo",userInfo)
   const ulbs = Digit.SessionStorage.get("ENGAGEMENT_TENANTS");
   let userUlbs = ulbs.filter((ulb) => userInfo?.roles?.some((role) => role?.tenantId === ulb?.code));
  const tenantId = userType.toLowerCase() === "employee" ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY"); //passing static value for testing
 
    if(userUlbs?.length===0 || tenantId==="pb.punjab"){
   
  let adduserUlbs={ i18nKey: `TENANT_TENANTS_${tenantId.replace(".", "_").toUpperCase()}`,code:`${tenantId}`}
   if(tenantId==="pb.punjab"){
    userUlbs=[adduserUlbs,...ulbs]
   }
   else{
   userUlbs=[adduserUlbs]
   }
  }
    const selectedTenat = useMemo(() => {
      if(userUlbs?.length>0 ){
      
      const filtered =  ulbs.filter((item) => item.code === tenantId);
      return filtered;
      }
      else{
        
         const filtered = userUlbs.filter((item) => item.code === tenantId);
      return filtered;
      }
    }, [ulbs]);
   const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(null);
  const [data, setData] = useState([]);
   const searchFormDefaultValues = {
    city: userUlbs?.[0],
     offset: 0,
    limit: 10,
    sortOrder: "DESC"
   }
   const { register, control, handleSubmit, setValue,getValues, reset,formState:{errors},watch } = useForm({
  defaultValues: searchFormDefaultValues,
   });
   const formValues = watch();
   console.log("userUlbs",userUlbs,formValues,ulbs,tenantId)
  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;

  const columns = useMemo(() => {
    return [
      {
        Header: t("Survey Name"),
        accessor: "suveyName",
        //disableSortBy: true,
        Cell: ({ row }) => {
          return (
            <div>
              {/* <Link to={`${parentRoute}/surveys/inbox/details/${row.original["uuid"]}`}> */}
              <span //className="link"
              >
                {row.original.surveyTitle}
              </span>
              {/* </Link> */}
            </div>
          );
        },
      },
      {
        Header: t("EVENTS_START_DATE_LABEL"),
        accessor: "startDate",
        Cell: ({ row }) => (row.original?.startDate ? GetCell(format(new Date(row.original?.startDate), "dd/MM/yyyy")) : ""),
      },
      {
        Header: t("EVENTS_END_DATE_LABEL"),
        accessor: "endDate",
        Cell: ({ row }) => (row.original?.endDate ? GetCell(format(new Date(row.original?.endDate), "dd/MM/yyyy")) : ""),
      },
      {
        Header: t("Fill Survey"),
        accessor: "fillSurvey",
        Cell: ({ row }) => {
          return (
            // <button
            //   onClick={() => handleStartSurvey(row)}
            //   style={{ cursor: "pointer", marginLeft: "20px", border: "1px solid blue", borderRadius: "8px", padding: "4px" }}
            // >
            //   Start Survey
            // </button>
            <SubmitBar
              label={t("Start Survey")}
              onSubmit={() => {
                handleStartSurvey(row.original);
              }}
            />
          );
        },
      },
    ];
  });

  useEffect(() => {
    fetchActiveAndOpenSurveys();
  }, []);
  function fetchActiveAndOpenSurveys() {
    setLoading(true);
    const payload = { tenantId: formValues?.city?.code, active: true, openSurveyFlag: true };
    Digit.Surveys.searchSurvey(payload)
      .then((response) => {
        let tableData = response.Surveys.filter((item) => item.active);
         tableData=tableData.sort((a,b)=> a.auditDetails.lastModifiedTime- b.auditDetails.lastModifiedTime)
        setData(tableData);
        setCount(tableData.length);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Failed to fetch surveys", error);
      });
  }
  console.log("table data",data)

  console.log("userinfo", userInfo);
   
  const handleStartSurvey = (surveyDetails) => {
    console.log("Survey Details: ", surveyDetails);
    // history.push("/digit-ui/employee/engagement/surveys/fill-survey");
    const paths = {
      employee: "/digit-ui/employee/engagement/surveys/fill-citizen-details-survey",
      citizen: "/digit-ui/citizen/engagement/surveys/fill-survey",
    };

    const newPath = paths[userType.toLowerCase()] || "";

    history.push({
      pathname: newPath,
      //  state: { surveyDetails: surveyDetails, ...(userType.toUpperCase()==="CITIZEN" && {userInfo: userInfo})},
      state: { surveyDetails: surveyDetails, userInfo: userInfo, userType: userType },
    });
  };

  return (
    <div>
      {(tenantId==="pb.punjab" && window.location.href.includes("/employee")) ?
       <Card style={{ marginTop: "16px", marginBottom: "16px" ,backgroundColor:"white", maxWidth:"99%"}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
         <h1 style={{fontSize:'20px'}}> Search Surveys </h1>
          </div>
          <hr style={{marginTop:'10px'}}/>
        <form className={"search-form-wrapper rm-mb form-field-flex-one"} onSubmit={handleSubmit(fetchActiveAndOpenSurveys)}>
       <SearchField>
        <label>{t("City")} <span style={{ color: "red" }}>*</span></label>
        <Controller
          rules={{ required: t("REQUIRED_FIELD") }}
          {...register("city")}
          render={(props) => <Dropdown option={userUlbs} optionKey={"i18nKey"} selected={formValues?.city} select={(e) => {props.onChange(e); }} t={t} />}
          name={"city"}
          control={control}
          defaultValue={userUlbs?.[0]}
        />
        {/* <CardLabelError>{searchFormState?.errors?.["tenantIds"]?.message}</CardLabelError> */}
      </SearchField>
        <div className={`form-field`} style={{marginTop:'40px'}}>  <SubmitBar label="Search" submit="submit" onSubmit={fetchActiveAndOpenSurveys} /></div>
      </form>
      </Card>
      : null}
      <Table
        t={t}
        data={data}
        totalRecords={count}
        columns={columns}
        getCellProps={(cellInfo) => {
          return {
            style: {
              minWidth: "300px", //cellInfo.column.Header === t("ES_INBOX_APPLICATION_NO") ? "240px" : "",
              padding: "20px 18px",
              fontSize: "16px",
            },
          };
        }}
        noResultsMessage="No Questions found"
        inboxStyles={{ overflowX: "scroll", overflowY: "hidden" }}
        // onPageSizeChange={onPageSizeChange}
        // currentPage={getValues("offset") / getValues("limit")}
        // onNextPage={nextPage}
        // onPrevPage={previousPage}
        // pageSizeLimit={getValues("limit")}
        // onSort={onSort}
        // disableSort={false}
        // sortParams={[{ id: getValues("sortBy"), desc: getValues("sortOrder") === "DESC" ? true : false }]}
      />
      {loading && <Loader />}
    </div>
  );
};

export default ActiveAndOpenSurveys;
