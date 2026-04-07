import React, { useState } from "react";
import SearchFields from "./SearchFields";
import ResultsTable from "./ResultsTable";
import { useTranslation } from "react-i18next";
import { LoaderNew } from "../LoaderNew";

/**
 * GlobalSearchApplication Component
 * Simple search component with 3 fields: Application Number, Tenant ID, Service Type
 */
const GlobalSearchApplication = ({ error = null }) => {
    const { t } = useTranslation();
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [validationError, setValidationError] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSizeLimit, setPageSizeLimit] = useState(10);
    const [searchLoading, setSearchLoading] = useState(false);
    const [formData, setFormData] = useState({
        applicationNo: "",
        name: "",
        mobileNumber: "",
        tenantId: "",
        applicationType: "",
        serviceType: "",
        fromDate: "",
        toDate: "",
        status: "",
    });
    const { data: cities, isLoading } = Digit.Hooks.useTenants();

    // Tenant options  
    const tenantOptions = cities?.map((city) => ({ ...city, displayName: t(city.i18nKey) })) || [];

    // Pagination handlers
    const performSearch = async (offset = 0, limit = pageSizeLimit) => {
        // Validation: Check if at least one search field is provided
        if (!formData?.tenantId?.code && !formData.serviceType?.code) {
            setValidationError("Please provide Location and Service Type to search.");
            setShowResults(false);
            return;
        }

        setValidationError("");
        setSearchLoading(true);

        // Build filters object with pagination parameters
        const filters = {
            limit: limit,
            offset: offset,
        };

        // Add filters only if they have values
        if (formData.applicationNo) filters.applicationNo = formData.applicationNo;
        if (formData.name) filters.name = formData.name;
        if (formData.mobileNumber) filters.mobileNumber = formData.mobileNumber;
        if (formData.applicationType?.code) filters.applicationType = formData.applicationType.code;
        if (formData.status?.code) filters.status = formData.status.code;
        if (formData.fromDate) filters.fromDate = new Date(formData.fromDate).getTime();
        if (formData.toDate) filters.toDate = new Date(formData.toDate).getTime();

        console.log("Search Filters with Pagination:", filters);

        if (formData.serviceType?.code === "BPA" || formData.serviceType?.code === "BPA_OC") {
            try {
                const tenantId = formData?.tenantId?.code || formData?.tenantId;
                const response = await Digit.OBPSService.BPASearch(tenantId, filters);

                // Format the response data for display in table
                const formattedData = response?.BPA?.map((item) => ({
                    applicationNo: item?.applicationNo || "-",
                    tenantId: item?.landInfo?.address?.city || "-",
                    status: item?.status ? t(item?.status) : "-",
                    serviceType: formData.serviceType?.i18nKey ? t(formData.serviceType.i18nKey) : "-",
                    createdDate: item?.auditDetails?.createdTime ? new Date(item.auditDetails.createdTime).toLocaleString() : "-",
                    serviceTypeCode: item?.serviceType || "-",
                    ownerName: item?.landInfo?.owners?.[0]?.name || "-",
                    businessService: item?.businessService || "BPA",
                })) || [];

                setSearchResults(formattedData);
                setTotalRecords(response?.Count || 0);
                setCurrentPage(offset / limit);
                setShowResults(true);
                console.log("BPA Search Response:", response?.BPA, "Total Count:", response?.Count);
            } catch (err) {
                const errorMessage = err?.response?.data?.Errors?.[0]?.message || err?.message || "Error searching applications. Please try again.";
                setValidationError(errorMessage);
                console.error("BPA Search Error:", err);
                setShowResults(false);
            } finally {
                setSearchLoading(false);
            }
        }else if (formData.serviceType?.code === "NOC") {
            try {
                const tenantId = formData?.tenantId?.code || formData?.tenantId;
                const response = await Digit.OBPSService.NOCSearch(tenantId, filters);

                // Format the response data for display in table
                const formattedData = response?.Noc?.map((item) => {
                    return ({
                    applicationNo: item?.applicationNo || "-",
                    tenantId: item?.nocDetails?.additionalDetails?.siteDetails?.ulbName || item?.nocDetails?.additionalDetails?.siteDetails?.district || item?.tenantId || "-",
                    status: item?.status ? t(item?.status) : "-",
                    serviceType: formData.serviceType?.i18nKey ? t(formData.serviceType.i18nKey) : "-",
                    createdDate: item?.auditDetails?.createdTime ? new Date(item.auditDetails.createdTime).toLocaleString() : "-",
                    ownerName: item?.owners?.[0]?.name || "-",
                    businessService: item?.nocDetails?.additionalDetails?.businessService || item?.businessService || "NOC",
                })}) || [];

                console.log("NOCformattedData",formattedData, response)

                setSearchResults(formattedData);
                setTotalRecords(response?.Count || 0);
                setCurrentPage(offset / limit);
                setShowResults(true);
                console.log("NOC Search Response:", response?.NOC, "Total Count:", response?.Count);
            } catch (err) {
                const errorMessage = err?.response?.data?.Errors?.[0]?.message || err?.message || "Error searching applications. Please try again.";
                setValidationError(errorMessage);
                console.error("NOC Search Error:", err);
                setShowResults(false);
            } finally {
                setSearchLoading(false);
            }
        }else if(formData.serviceType?.code === "CLU"){
            try {
                const tenantId = formData?.tenantId?.code || formData?.tenantId;
                const response = await Digit.OBPSService.CLUSearch({ filters: filters, tenantId, config: {} });

                // Format the response data for display in table
                const formattedData = response?.Clu?.map((item) => ({
                    applicationNo: item?.applicationNo || "-",
                    tenantId: item?.cluDetails?.additionalDetails?.siteDetails?.district || item?.cluDetails?.additionalDetails?.siteDetails?.ulbName || item?.tenantId || "-",
                    status: item?.applicationStatus ? t(`BPA_STATUS_${item?.applicationStatus}`) : "-",
                    serviceType: formData.serviceType?.i18nKey ? t(formData.serviceType.i18nKey) : "-",
                    createdDate: item?.auditDetails?.createdTime ? new Date(item.auditDetails.createdTime).toLocaleString() : "-",
                    ownerName: item?.cluDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.ownerOrFirmName || item?.cluDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.name || "-",
                    businessService: item?.cluDetails?.additionalDetails?.businessService || "CLU",
                })) || [];

                setSearchResults(formattedData);
                setTotalRecords(response?.count || 0);
                setCurrentPage(offset / limit);
                setShowResults(true);
                console.log("CLU Search Response:", response?.Clu, "Total Count:", response?.count);
            } catch (err) {
                const errorMessage = err?.response?.data?.Errors?.[0]?.message || err?.message || "Error searching applications. Please try again.";
                setValidationError(errorMessage);
                console.error("CLU Search Error:", err);
                setShowResults(false);
            } finally {
                setSearchLoading(false);
            }
        }else if(formData.serviceType?.code === "LAYOUT"){
            try {
                const tenantId = formData?.tenantId?.code || formData?.tenantId;
                const response = await Digit.OBPSService.LayoutSearch(tenantId, {}, filters);

                // Format the response data for display in table
                const formattedData = response?.Layout?.map((item) => ({
                    applicationNo: item?.applicationNo || "-",
                    tenantId: item?.layoutDetails?.additionalDetails?.siteDetails?.zone?.name || item?.layoutDetails?.additionalDetails?.siteDetails?.district || item?.tenantId || "-",
                    status: item?.applicationStatus ? t(`WF_LAYOUT_${item?.applicationStatus}`) : "-",
                    serviceType: formData.serviceType?.i18nKey ? t(formData.serviceType.i18nKey) : "-",
                    createdDate: item?.auditDetails?.createdTime ? new Date(item.auditDetails.createdTime).toLocaleString() : "-",
                    ownerName: item?.owners?.[0]?.name || item?.layoutDetails?.additionalDetails?.applicationDetails?.applicantOwnerOrFirmName || "-",
                    businessService: item?.layoutDetails?.additionalDetails?.businessService || "LAYOUT",
                })) || [];

                setSearchResults(formattedData);
                setTotalRecords(response?.count || 0);
                setCurrentPage(offset / limit);
                setShowResults(true);
                console.log("Layout Search Response:", response?.Layout, "Total Count:", response?.count);
            } catch (err) {
                const errorMessage = err?.response?.data?.Errors?.[0]?.message || err?.message || "Error searching applications. Please try again.";
                setValidationError(errorMessage);
                console.error("Layout Search Error:", err);
                setShowResults(false);
            } finally {
                setSearchLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCurrentPage(0);
        await performSearch(0, pageSizeLimit);
    };

    const handleNextPage = async () => {
        const nextOffset = (currentPage + 1) * pageSizeLimit;
        await performSearch(nextOffset, pageSizeLimit);
    };

    const handlePreviousPage = async () => {
        const prevOffset = Math.max(0, (currentPage - 1) * pageSizeLimit);
        await performSearch(prevOffset, pageSizeLimit);
    };

    const handleFirstPage = async () => {
        await performSearch(0, pageSizeLimit);
    };

    const handleLastPage = async () => {
        const lastOffset = Math.ceil(totalRecords / pageSizeLimit) * pageSizeLimit - pageSizeLimit;
        await performSearch(Math.max(0, lastOffset), pageSizeLimit);
    };

    const handlePageSizeChange = async (e) => {
        const newPageSize = Number(e.target.value);
        setPageSizeLimit(newPageSize);
        setCurrentPage(0);
        // Pass the new page size directly to performSearch
        await performSearch(0, newPageSize);
    };

    const handleClearAll = () => {
        setFormData({
            applicationNo: "",
            name: "",
            mobileNumber: "",
            tenantId: "",
            applicationType: "",
            serviceType: "",
            fromDate: "",
            toDate: "",
            status: "",
        });
        setValidationError("");
        setShowResults(false);
        setCurrentPage(0);
        setTotalRecords(0);
    };

    const handleFieldChange = (fieldName, value) => {
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
        // Clear validation error when user starts typing
        if (validationError) {
            setValidationError("");
        }
    };

    const isMobile = window?.Digit?.Utils?.browser?.isMobile?.() || false;

    if (isLoading) {
        return <LoaderNew page={true} />;
    }

    return (
        <div className="global-search-container">
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="search-form">
                <SearchFields
                    formData={formData}
                    onFieldChange={handleFieldChange}
                    onClearAll={handleClearAll}
                    isMobile={isMobile}
                    tenantOptions={tenantOptions}
                    t={t}
                />
            </form>

            {/* Error Message */}
            {(validationError || error) && (
                <div style={{ padding: "12px", marginTop: "16px", backgroundColor: "#fee", color: "#c33", borderRadius: "4px" }}>
                    {validationError || error}
                </div>
            )}

            {/* Results */}
            {showResults && (
                <div style={{ marginTop: "24px" }}>
                    <ResultsTable 
                        data={searchResults} 
                        isLoading={searchLoading} 
                        isMobile={isMobile} 
                        t={t}
                        currentPage={currentPage}
                        totalRecords={totalRecords}
                        pageSizeLimit={pageSizeLimit}
                        onNextPage={handleNextPage}
                        onPrevPage={handlePreviousPage}
                        onFirstPage={handleFirstPage}
                        onLastPage={handleLastPage}
                        onPageSizeChange={handlePageSizeChange}
                        tenantId={formData.tenantId}
                    />
                </div>
            )}
        </div>
    );
};

export default GlobalSearchApplication;
