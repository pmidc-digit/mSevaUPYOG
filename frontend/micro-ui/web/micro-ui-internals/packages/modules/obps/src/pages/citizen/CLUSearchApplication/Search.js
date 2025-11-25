import React, { Fragment, useCallback, useMemo, useEffect, useState, useReducer } from "react";
import { useForm, FormProvider } from "react-hook-form";
import SearchFormFieldsComponent from "./SearchFieldComponent";
import useSearchApplicationTableConfig from "./useTableConfig";
import SearchApplicationMobileView from "./SearchAtom/mobile";
import SearchApplicationDesktopView from "./SearchAtom/desktop";


const SearchApplication = ({ tenantId, t, onSubmit, data, error, isLoading, Count }) => {
  const [showToast, setShowToast] = useState(null);

  const methods = useForm();

  useEffect(() => {
    methods.register("offset", 0);
    methods.register("limit", 10);
    methods.register("sortBy", "createdTime");
    methods.register("sortOrder", "DESC");
  }, [methods.register]);

  const columns = useSearchApplicationTableConfig();

  const isMobile = window.Digit.Utils.browser.isMobile();

  const getRedirectionLink = () => {
    let redirectBS = "obps/clu/inbox/application-overview";
    return redirectBS;
  };


  const propsMobileInboxCards = useMemo(
    () =>
      data?.map((data) => ({
        [t("BPA_APPLICATION_NUMBER_LABEL")]: data?.applicationNo || "-",
        [t("TL_COMMON_TABLE_COL_APP_DATE")]: data?.date || "-",
        [t("PT_COMMON_TABLE_COL_STATUS_LABEL")]: data?.applicationStatus ? t(`${data.applicationStatus}`) : "-",
      })),
    [data]
  );

 

  if (isMobile) return <FormProvider {...methods}><SearchApplicationMobileView {...{SearchFormFieldsComponent, propsMobileInboxCards, isLoading, data, getRedirectionLink, onSubmit}} /></FormProvider>

  return <FormProvider {...methods}><SearchApplicationDesktopView {...{columns, SearchFormFieldsComponent, onSubmit, data, error, isLoading, Count}} /></FormProvider>
};

export default SearchApplication;
