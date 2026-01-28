import { Header, Loader, SearchField, SubmitBar, Table, TextInput, Card, Toast } from "@mseva/digit-ui-react-components";
import React, { useState, useMemo, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import PTApplication from "./pt-application";
import { propertyCardBodyStyle } from "../../../utils";
import { property } from "lodash";

export const PTMyApplications = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();
  const user = Digit.UserService.getUser().info;
  const [showToast, setShowToast] = useState(null);
  const [applicationsList, setApplicationsList] = useState([]);

  const searchFormDefaultValues = {
    mobileNumber: "",
    applicationNumber: "",
    propertyId: "",
    offset: 0,
    limit: 10,
    sortOrder: "DESC",
    sortBy: "propertyId",
  };
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: searchFormDefaultValues,
  });

  const formValues = watch();
  useEffect(() => {
    register("offset", 0);
    register("limit", 10);
    register("sortBy", "propertyId");
    register("sortOrder", "DESC");
  }, [register]);
  function onPageSizeChange(e) {
    setValue("limit", Number(e.target.value));
  }
  function nextPage() {
    setValue("offset", getValues("offset") + getValues("limit"));
    handleSubmit(onSubmit)();
  }
  function previousPage() {
    setValue("offset", getValues("offset") - getValues("limit"));
    handleSubmit(onSubmit)();
  }
  const handleReset = () => {
    reset(searchFormDefaultValues);
  };

  const GetCell = (value) => <span className="cell-text">{value}</span>;
  const columns = useMemo(
    () => [
      {
        Header: "Application No",
        disableSortBy: true,
        accessor: (row) => {
          const applicationNumber = row?.acknowldgementNumber;
          return (
            <span className="link">
              <Link
                to={{ pathname: `/digit-ui/citizen/pt/property/application-preview/${applicationNumber}`, state: { propertyId: row?.propertyId } }}
              >
                {applicationNumber}
              </Link>
            </span>
          );
        },
      },
      {
        Header: "Unique Property ID",
        disableSortBy: true,
        accessor: (row) => {
          const propertyId = row?.propertyId;
          return (
            <span className="link">
              <Link to={`/digit-ui/citizen/pt/property/my-property/${propertyId}`}>{propertyId}</Link>
            </span>
            // <span className="cell-text" style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }} onClick={() => downloadPDF(row)}>
            //   {challanNumber}
            // </span>
          );
        },
      },
      {
        Header: "Application Type",
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.creationReason + " Property");
        },
      },
      {
        Header: "Owner Name",
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.owners[0]?.name);
        },
      },

      {
        Header: "Address",
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(
            row?.address?.doorNo +
              "," +
              row?.address?.buildingName +
              "," +
              row?.address?.street +
              "," +
              row?.address?.locality?.name +
              "," +
              row?.address?.city
          );
        },
      },
      {
        Header: "Status",
        disableSortBy: true,
        accessor: (row) => {
          const formattedStatus = row?.status.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
          return (
            <span className="cell-text" style={{ color: "green" }}>
              {formattedStatus}
            </span>
          );
          // return GetCell(row?.applicationStatus);
        },
      },
    ],
    []
  );
  const onSubmit = async () => {
    const filters = { tenantId: tenantId };
    if (formValues?.applicationNumber !== "") {
      filters.acknowledgementIds = formValues.applicationNumber;
    }
    if (formValues?.mobileNumber !== "") {
      filters.mobileNumber = formValues.mobileNumber;
    }
    if (formValues?.propertyId !== "") {
      filters.propertyIds = formValues.propertyId;
    }

    const auth = true;
    try {
      Digit.PTService.applicationsearch({ filters: filters, auth: auth }).then((response) => {
        console.log("response", response);
        if (response?.Properties?.length > 0) {
          setApplicationsList(response.Properties);
        } else {
          setShowToast({ key: true, label: `${response?.Errors?.message}`, error: true });
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  console.log("formvalues", formValues);
  const handleRedirect = () => {
    history.push("/digit-ui/citizen/pt/property/new-application");
  };
  return (
    <React.Fragment>
      <Card style={{ marginTop: "16px", marginBottom: "16px", backgroundColor: "white", maxWidth: "99%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "20px" }}>Search Application </h1>
          <SubmitBar label="Add New Property" onSubmit={handleRedirect} />
        </div>
        <hr style={{ marginTop: "10px" }} />
        <form className={"search-form-wrapper rm-mb form-field-flex-one"} onSubmit={handleSubmit(onSubmit)}>
          <SearchField>
            <label>{t("Application Number")}</label>
            <Controller
              name="applicationNumber"
              {...register("applicationNumber")}
              control={control}
              render={(props) => <TextInput onChange={props.onChange} type="text" value={formValues?.applicationNumber} />}
            />
            {/* <CardLabelError>{searchFormState?.errors?.["title"]?.message}</CardLabelError> */}
          </SearchField>
          <SearchField>
            <label>{t("CORE_COMMON_MOBILE_NUMBER")}</label>
            <Controller
              {...register("mobileNumber", {
                required: "Mobile Number is required",
                pattern: { value: /^[0-9]{10}$/, message: "Invalid mobile number" },
              })}
              render={(props) => <TextInput type="text" onChange={props.onChange} value={formValues?.mobileNumber} />}
              name="mobileNumber"
              control={control}
            />
            {/* <CardLabelError>{searchFormState?.errors?.["title"]?.message}</CardLabelError> */}
          </SearchField>

          <SearchField>
            <label>{t("Unique Property Id")}</label>
            <Controller
              name="propertyId"
              {...register("propertyId")}
              control={control}
              render={(props) => <TextInput onChange={props.onChange} type="text" value={formValues?.propertyId} />}
            />
            {/* <CardLabelError>{searchFormState?.errors?.["title"]?.message}</CardLabelError> */}
          </SearchField>
          <SearchField></SearchField>
          <SearchField></SearchField>
          <SearchField></SearchField>
          <div className={`form-field`} style={{ marginTop: "40px" }}>
            {" "}
            <SubmitBar label="Reset" onSubmit={handleReset} />
          </div>

          <div className={`form-field`} style={{ marginTop: "40px" }}>
            {" "}
            <SubmitBar label="Search" submit="submit" onSubmit={onSubmit} />
          </div>
        </form>
      </Card>
      {applicationsList?.length > 0 && (
        <div
          style={{
            marginLeft: "16px",
            marginRight: "16px",
            marginBottom: "16px",
            width: "99%",
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "48px",
            boxShadow: " 0 0 5px 0 rgba(34, 34, 34, 0.43922)",
          }}
        >
          <Table
            t={t}
            data={applicationsList}
            totalRecords={10}
            columns={columns}
            getCellProps={(cellInfo) => {
              return {
                style: {
                  minWidth: cellInfo.column.Header === t("ES_INBOX_APPLICATION_NO") ? "240px" : "",
                  padding: "20px 18px",
                  fontSize: "16px",
                },
              };
            }}
            onPageSizeChange={onPageSizeChange}
            currentPage={getValues("offset") / getValues("limit")}
            onNextPage={nextPage}
            onPrevPage={previousPage}
            pageSizeLimit={getValues("limit")}
            // onSort={onSort}
            disableSort={false}
            sortParams={[{ id: getValues("sortBy"), desc: getValues("sortOrder") === "DESC" ? true : false }]}
          />
        </div>
      )}

      {/* <span className="link" style={{display:"flex", justifyContent: isMobile ? "center" : "left", paddingBottom:"16px", paddingLeft: "24px", marginTop: "-24px"}}>
        <Link to={"/digit-ui/citizen/pt/property/new-application"}>{t("CPT_REG_NEW_PROPERTY")}</Link>
      </span> */}
      {showToast && (
        <Toast
          error={showToast.error}
          isDleteBtn={true}
          warning={showToast.warning}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
            seterrorShown(false);
          }}
        />
      )}

      {/* // <p style={{ marginLeft: "16px", marginTop: "16px" }}>
      //   {t("PT_TEXT_NOT_ABLE_TO_FIND_THE_APPLICATION")}{" "}
      //   <span className="link" style={{ display: "block" }}>
      //     <Link to="/digit-ui/citizen/pt/property/new-application/info">{t("PT_COMMON_CLICK_HERE_TO_REGISTER_NEW_PROPERTY")}</Link>
      //   </span>
      // </p> */}
    </React.Fragment>
  );
};
