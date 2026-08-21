import React, { useState, useEffect } from "react";
import { Header, ResponseComposer, Card, KeyNote, SubmitBar, SearchField, TextInput, CardLabelError } from "@mseva/digit-ui-react-components";
import PropTypes from "prop-types";
import Axios from "axios";
import { useHistory, Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Loader } from "../../../components/Loader";
import ChallanTable from "./ChallanTable";

const MyChallanResult = ({ template, header, actionButtonLabel, initialStates = {} }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const userInfo = Digit.UserService.getUser();
  const tenantId = localStorage.getItem("CITIZEN.CITY");
  const [filters, setFilters] = useState(null);
  const [loader, setLoader] = useState(false);
  const [getChallanData, setChallanData] = useState();
  const [pageSize, setPageSize] = useState(initialStates.pageSize || 10);
  const [pageOffset, setPageOffset] = useState(initialStates.pageOffset || 0);
  const [sortParams, setSortParams] = useState(initialStates.sortParams || [{ id: "createdTime", desc: false }]);
  const [searchParams, setSearchParams] = useState(initialStates.searchParams || {});
  const [getFilter, setFilter] = useState();

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setFilters((prev) => ({
      ...prev,
      limit: Number(prev.limit) + pageSize // Load next 5 items only
    }));
  };
  const fetchNextPage = () => {
    setPageOffset((prev) => prev + pageSize);

    // setFilters((prev) => ({
    //   ...prev,
    //   // offset: prev.offset + 5, // 🔹 Add 5 more each click
    //   offset: Number(prev.offset) + pageOffset, // Load next 5 items only
    // }));
  };
  const fetchPrevPage = () => setPageOffset((prev) => prev - pageSize);
  const fetchLastPage = () => setPageOffset(data?.totalCount ? Math.ceil(data.totalCount / 10) * 10 - pageSize : 0);
  const fetchFirstPage = () => setPageOffset(0);

  const { control, handleSubmit, setValue, formState, watch, register, reset } = useForm({
    defaultValues: {}
  });

  let filter = window.location.href.split("/").pop();
  let t1;
  let off;
  if (!isNaN(parseInt(filter))) {
    off = filter;
    t1 = parseInt(filter) + 50;
  } else {
    t1 = 4;
  }

  let initialFilters = !isNaN(parseInt(filter)) ?
  { limit: "50", sortOrder: "ASC", sortBy: "createdTime", offset: off, tenantId } :
  { limit: "10", sortOrder: "ASC", sortBy: "createdTime", offset: "0", tenantId };

  // useEffect(() => {
  //   setFilters(initialFilters);
  // }, [filter, tenantId]);

  const fetchChallans = async () => {
    setLoader(true);
    try {
      const responseData = await Digit.ChallanGenerationService.search({ tenantId, filters });
      setChallanData(responseData);
      setLoader(false);
    } catch (error) {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (filters) fetchChallans();
  }, [filters]);

  const onSubmit = (data) => {
    if (data?.applicationNo)
    setFilters({ limit: "10", sortOrder: "ASC", sortBy: "createdTime", offset: "0", tenantId, challanNo: data?.applicationNo });
    if (data?.mobileNumber)
    setFilters({ limit: "10", sortOrder: "ASC", sortBy: "createdTime", offset: "0", tenantId, mobileNumber: data?.mobileNumber });
  };

  return (
    <div className="mychallan-custom">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="search-form-wrapper challan-generation-style-cf34b98518">
          {/* <form onSubmit={handleSubmit(onSubmit)}> */}
          <SearchField>
            <label>{t("Challan Number")}</label>
            <TextInput name="applicationNo" inputRef={register({})} />
          </SearchField>

          <SearchField className="challan-generation-style-6eab5e7808">
            <label>{t("BPA_APPLICANT_MOBILE_NO_LABEL")}</label>
            <TextInput
              name="mobileNumber"
              inputRef={register({
                minLength: {
                  value: 10,
                  message: t("CORE_COMMON_MOBILE_ERROR")
                },
                maxLength: {
                  value: 10,
                  message: t("CORE_COMMON_MOBILE_ERROR")
                },
                pattern: {
                  value: /[6789][0-9]{9}/,
                  //type: "tel",
                  message: t("CORE_COMMON_MOBILE_ERROR")
                }
              })}
              type="number"
              componentInFront={<div className="employee-card-input employee-card-input--front">+91</div>}
              //maxlength={10}
            />
            <CardLabelError>{formState?.errors?.["mobileNumber"]?.message}</CardLabelError>
          </SearchField>

          <SearchField className="submit">
            <SubmitBar label={t("ES_COMMON_SEARCH")} submit />
            <p

              onClick={() => {
                reset({
                  applicationNo: "",
                  mobileNumber: ""
                });
                // previousPage();
              }} className="challan-generation-style-3343fd6464">

              {t(`ES_COMMON_CLEAR_ALL`)}
            </p>
          </SearchField>
          {/* </form> */}
        </div>
      </form>
      <div>
        {header &&
        <Header>
            {t(header)} ({getChallanData?.challans?.length})
          </Header>
        }

        {getChallanData?.challans?.length &&
        <ChallanTable
        // onFilterChange={handleFilterChange}
        // searchFields={getSearchFields()}
        // onSearch={handleFilterChange}
        // onSort={handleSort}
        onNextPage={fetchNextPage}
        onPrevPage={fetchPrevPage}
        onLastPage={fetchLastPage}
        onFirstPage={fetchFirstPage}
        // currentPage={Math.floor(pageOffset / pageSize)}
        // pageSizeLimit={pageSize}
        onPageSizeChange={handlePageSizeChange}
        data={getChallanData?.challans} />

        }
      </div>
      {loader && <Loader page={true} />}
    </div>);

};

MyChallanResult.propTypes = {
  template: PropTypes.any,
  header: PropTypes.string,
  actionButtonLabel: PropTypes.string
};

MyChallanResult.defaultProps = {
  template: [],
  header: null,
  actionButtonLabel: null
};

export default MyChallanResult;
