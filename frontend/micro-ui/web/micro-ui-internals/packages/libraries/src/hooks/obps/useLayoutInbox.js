import React from "react";
import useInbox from "../useInbox";
import { useQueryClient } from "react-query";

const useLayoutInbox = ({ tenantId, filters, config = {} }) => {
  const queryClient = useQueryClient();

  const { filterForm, searchForm, tableForm, getFilter } = filters;
  const { moduleName, businessService, applicationStatus, locality, assignee, businessServiceArray } = filterForm;
  const { mobileNumber, applicationNumber } = searchForm;
  const { sortBy, limit, offset, sortOrder, isCitizenView } = tableForm;
  const user = Digit.UserService.getUser();

  const _filters = {
    tenantId,
    processSearchCriteria: {
      assignee: assignee === "ASSIGNED_TO_ME" ? user?.info?.uuid : "",
      moduleName: "layout-service",
      ...(applicationStatus?.length > 0 ? { status: applicationStatus } : {}),
      businessService: ["Layout_mco_abv", "Layout_mcl_abv", "Layout_mcl_up", "Layout_mcUp"],
    },

    moduleSearchCriteria: {
      ...(mobileNumber ? { mobileNumber } : {}),
      ...(applicationNumber ? { applicationNumber } : {}),
      ...(sortOrder ? { sortOrder } : {}),
      ...(isCitizenView ? { isCitizenView } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(locality?.length > 0 ? { locality: locality.map((item) => item.code.split("_").pop()).join(",") } : {}),
    },
    limit,
    offset,
  };

  const queryKey = ["LAYOUT_INBOX_DATA", tenantId, ...Object.keys(_filters)?.map((e) => _filters?.[e])];

  return useInbox({
    tenantId,
    filters: _filters,
    config: {
      select: (data) => {
        if (!data) {
          return {
            statuses: [],
            table: [],
            totalCount: 0,
            nearingSlaCount: 0,
            revalidate: () => queryClient.invalidateQueries(queryKey),
          };
        }

        const tableData = (data?.items || [])?.map((application) => {
          const submittedOn = Number(application?.businessObject?.layoutDetails?.additionalDetails?.SubmittedOn); // or submissionDate
          const approvalDate = application?.businessObject?.layoutDetails?.additionalDetails?.approvalDate;

          const endDate = approvalDate ? Number(approvalDate) : Date.now();

          return {
            applicationId: application?.businessObject?.applicationNo || application?.businessObject?.applicationNumber,
            date: application?.businessObject?.auditDetails?.createdTime ? Number.parseInt(application.businessObject.auditDetails.createdTime) : 0,
            submissionDate: application?.businessObject?.layoutDetails?.additionalDetails?.SubmittedOn,
            approvalDate: approvalDate,
            businessService: application?.ProcessInstance?.businessService,
            locality: application?.businessObject?.tenantId ? `${application.businessObject.tenantId.toUpperCase().split(".").join("_")}` : "-",
            status: application?.businessObject?.applicationStatus,
            owner: (() => {
              const owner = application?.businessObject?.owners?.[0];
              const isFirm = owner?.additionalDetails?.aplicantType?.code === "FIRM";
              return isFirm ? owner?.additionalDetails?.authorisedPerson : owner?.name;
            })(),
            category: application.businessObject?.layoutDetails?.additionalDetails?.siteDetails?.buildingCategory?.name,
            zone: application.businessObject?.layoutDetails?.additionalDetails?.siteDetails?.zone?.name,
            applicationType: application?.businessObject?.applicationType,
            documents: application?.businessObject?.documents || application?.documents,
            sla: Math.floor((endDate - submittedOn) / (1000 * 60 * 60 * 24)),
          };
        });

        return {
          statuses: data?.statusMap || [],
          table: tableData || [],
          totalCount: data.totalCount || 0,
          nearingSlaCount: data.nearingSlaCount || 0,
          revalidate: () => queryClient.invalidateQueries(queryKey),
        };
      },
      ...config,
    },
  });
};

export default useLayoutInbox;
