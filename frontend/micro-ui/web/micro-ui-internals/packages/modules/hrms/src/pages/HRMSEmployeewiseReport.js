import React, { useEffect, useState } from "react";
import { Dropdown, Table, SearchForm, Header, SearchField, SubmitBar, Loader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

const HRMSEmployeewiseReport = () => {
  const {
    getValues,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      ulb: null,
    },
  });

  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const { data: data = {} } = Digit.Hooks.hrms.useHrmsMDMS(tenantId, "egov-hrms", "HRMSRolesandDesignation") || {};
  const [ulbOptions, setUlbOptions] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [searchParams, setSearchParams] = useState(null);

  useEffect(() => {
    const ulbs = (data?.MdmsRes?.tenant?.tenants || [])
      .filter((city) => city.code !== stateId)
      .map((city) => {
        return { ...city, i18text: Digit.Utils.locale.getCityLocale(city.code) };
      });
    setUlbOptions(ulbs);
  }, [data, stateId]);

  // Loading comes from the query itself, so a failed or repeated search cannot leave the spinner on
  const { data: ReportsData, isLoading: isLoadingReportsData, isError: isReportError } = Digit.Hooks.reports.useReportMeta.fetchReportData1(
    "rainmaker-hrms",
    "HRMSEmployeewiseReport",
    stateId,
    [
      {
        name: "ulb",
        input: searchParams?.ulb?.code || "",
      },
    ],
    {
      enabled: !!searchParams?.ulb?.code,
    }
  );

  useEffect(() => {
    if (ReportsData?.reportHeader && ReportsData?.reportData) {
      const reportColumns = ReportsData.reportHeader.map((item) => {
        return { ...item, Header: item.label, accessor: item.name };
      });
      const columnNames = reportColumns.map((item) => item.name);
      const rows = ReportsData.reportData.map((row) => {
        const rowData = {};
        columnNames.forEach((columnName, i) => {
          rowData[columnName] = row[i];
        });
        return rowData;
      });
      setColumns(reportColumns);
      setTableData(rows);
    } else {
      setColumns([]);
      setTableData([]);
    }
  }, [ReportsData]);

  const handleSearch = (values) => {
    // Form validation may not run for this handler, so the ULB is checked again here
    if (!values?.ulb?.code) return;
    setSearchParams(values);
  };

  const handleReset = () => {
    reset();
    setSearchParams(null);
    setTableData([]);
  };

  const loading = !!searchParams && isLoadingReportsData;

  return (
    <div>
      <Header>{t("HR_HRMS_EMPLOYEE_REPORT_HEADING")}</Header>
      <SearchForm onSubmit={handleSearch} handleSubmit={handleSubmit}>
        <SearchField>
          <Dropdown
            placeholder={t("ULB")}
            option={ulbOptions}
            selected={getValues().ulb}
            select={(value) => setValue("ulb", value, { shouldValidate: true })}
            optionKey="i18text"
            t={t}
            {...register("ulb", { required: "ULB is required" })}
          />
          {errors.ulb && <span>{errors.ulb.message}</span>}
        </SearchField>
        <div className="pt-search-action">
          <SearchField className="pt-search-action-reset">
            <p onClick={() => handleReset()}>{t(`ES_COMMON_CLEAR_ALL`)}</p>
          </SearchField>
          <SearchField className="pt-search-action-submit">
            <SubmitBar label={t("ES_COMMON_SEARCH")} submit />
          </SearchField>
        </div>
      </SearchForm>
      {loading ? (
        <Loader />
      ) : isReportError ? (
        <div className="hrms-emp-mapping__no-data">
          <p>{t("COMMON_TABLE_NO_RECORD_FOUND")}</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          {tableData.length > 0 && (
            <Table
              t={t}
              data={tableData}
              columns={columns}
              getCellProps={(cellInfo) => {
                return {
                  style: {
                    padding: "20px 18px",
                    fontSize: "16px",
                  },
                };
              }}
              manualPagination={false}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default HRMSEmployeewiseReport;
