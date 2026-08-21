import React, { useState, useEffect, useMemo } from "react";
import { Header, Card, KeyNote, SubmitBar, SearchField, TextInput, CardLabelError } from "@mseva/digit-ui-react-components";
import PropTypes from "prop-types";
import { useHistory, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { Loader } from "../../../components/Loader";
import GarbageTable from "./GarbageTable";

const SearchApplications = ({ template, header, actionButtonLabel, initialStates = {} }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const userInfo = Digit.UserService.getUser();
  const tenantId = localStorage.getItem("CITIZEN.CITY");
  const { control, handleSubmit, setValue, formState, watch, register, reset } = useForm({
    defaultValues: {},
  });
  const [loader, setLoader] = useState(false);
  const [getChallanData, setChallanData] = useState([]);
  const [filters, setFilters] = useState(null);
  const [getCount, setCount] = useState();
  const [pageSize, setPageSize] = useState(initialStates.pageSize || 10);
  const [pageOffset, setPageOffset] = useState(initialStates.pageOffset || 0);
  const [sortParams, setSortParams] = useState(initialStates.sortParams || [{ id: "createdTime", desc: false }]);
  const [searchParams, setSearchParams] = useState(initialStates.searchParams || {});
  const [getFilter, setFilter] = useState();

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setFilters((prev) => ({
      ...prev,
      limit: Number(prev.limit) + pageSize, // Load next 5 items only
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

  let filter = window.location.href.split("/").pop();
  let t1;
  let off;
  if (!isNaN(parseInt(filter))) {
    off = filter;
    t1 = parseInt(filter) + 50;
  } else {
    t1 = 4;
  }

  let initialFilters = !isNaN(parseInt(filter))
    ? { limit: "50", sortOrder: "ASC", sortBy: "createdTime", offset: off, tenantId }
    : { limit: "10", sortOrder: "ASC", sortBy: "createdTime", offset: "0", tenantId };

  // useEffect(() => {
  //   setFilters(initialFilters);
  // }, [filter, tenantId]);

  const fetchChallans = async () => {
    setLoader(true);
    try {
      const responseData = await Digit.GCService.search({ tenantId, filters });
      setCount(responseData?.TotalCount);
      setChallanData(responseData?.GarbageConnection);
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
      setFilters({ limit: "10", sortOrder: "ASC", sortBy: "createdTime", offset: "0", tenantId, applicationNumber: data?.applicationNo });
    if (data?.mobileNumber)
      setFilters({ limit: "10", sortOrder: "ASC", sortBy: "createdTime", offset: "0", tenantId, mobileNumber: data?.mobileNumber });
  };

  return (
    <div className="gc-style-d265a6b9b9 gc-citizen-search-applications">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="search-form-wrapper gc-style-833eb1014a gc-citizen-search-applications__filters">
          {/* <form onSubmit={handleSubmit(onSubmit)}> */}
          <SearchField className="gc-citizen-search-applications__field">
            <label>{t("Application Number")}</label>
            <TextInput name="applicationNo" inputRef={register({})} />
          </SearchField>

          <SearchField className="gc-style-ba30f188c7 gc-citizen-search-applications__field">
            <label>{t("BPA_APPLICANT_MOBILE_NO_LABEL")}</label>
            <TextInput
              name="mobileNumber"
              inputRef={register({
                minLength: {
                  value: 10,
                  message: t("CORE_COMMON_MOBILE_ERROR"),
                },
                maxLength: {
                  value: 10,
                  message: t("CORE_COMMON_MOBILE_ERROR"),
                },
                pattern: {
                  value: /[6789][0-9]{9}/,
                  //type: "tel",
                  message: t("CORE_COMMON_MOBILE_ERROR"),
                },
              })}
              type="number"
              componentInFront={<div className="employee-card-input employee-card-input--front">+91</div>}
              //maxlength={10}
            />
            <CardLabelError>{formState?.errors?.["mobileNumber"]?.message}</CardLabelError>
          </SearchField>

          <SearchField className="submit gc-citizen-search-applications__submit">
            <SubmitBar label={t("ES_COMMON_SEARCH")} submit />
            <p
              className="gc-style-ef7a9dfbd9"
              onClick={() => {
                reset({
                  applicationNo: "",
                  mobileNumber: "",
                });
                // previousPage();
              }}
            >
              {t(`ES_COMMON_CLEAR_ALL`)}
            </p>
          </SearchField>
          {/* </form> */}
        </div>
      </form>
      <div className="gc-citizen-search-applications__results">
        {header && (
          <Header className="gc-style-c937f3b834">
            {t(header)} ({getChallanData?.length})
          </Header>
        )}

        {getChallanData?.length > 0 && (
          <GarbageTable
            onNextPage={fetchNextPage}
            onPrevPage={fetchPrevPage}
            onLastPage={fetchLastPage}
            onFirstPage={fetchFirstPage}
            // currentPage={Math.floor(pageOffset / pageSize)}
            // pageSizeLimit={pageSize}
            onPageSizeChange={handlePageSizeChange}
            data={getChallanData}
          />
        )}
      </div>
      {loader && <Loader page={true} />}
    </div>
  );
};

SearchApplications.propTypes = {
  template: PropTypes.any,
  header: PropTypes.string,
  actionButtonLabel: PropTypes.string,
};

SearchApplications.defaultProps = {
  template: [],
  header: null,
  actionButtonLabel: null,
};

export default SearchApplications;
