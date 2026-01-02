import { useQuery, useQueryClient } from "react-query";

/**
 * Robust ADS document search hook.
 * Accepts many shapes for `config`:
 *  - array of docs
 *  - { value: [...] }
 *  - { workflowDocs: [...] }
 *  - { value: { documents: [...] } } (or nested .documents.documents)
 * Falls back to application.documents if present.
 */
const useADSDocumentSearch = ({ application } = {}, config = {}, Code, index) => {
  const client = useQueryClient();
  const tenantId = application?.tenantId || Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const bookingId = application?.bookingId;

  // Normalize docs array from multiple possible shapes
  let candidateDocs = [];

  if (Array.isArray(config)) candidateDocs = config;
  else if (Array.isArray(config?.value)) candidateDocs = config.value;
  else if (Array.isArray(config?.workflowDocs)) candidateDocs = config.workflowDocs;
  else if (Array.isArray(config?.value?.workflowDocs)) candidateDocs = config.value.workflowDocs;
  else if (Array.isArray(config?.documents)) candidateDocs = config.documents;
  else if (Array.isArray(config?.value?.documents)) candidateDocs = config.value.documents;
  else if (Array.isArray(config?.value?.documents?.documents)) candidateDocs = config.value.documents.documents;
  else if (Array.isArray(application?.documents)) candidateDocs = application.documents;
  else candidateDocs = [];

  // Filter docs by Code safely
  const newDocs = Code ? candidateDocs.filter((doc) => doc && doc.documentType === Code) : candidateDocs;

  // Extract fileStoreIds and drop falsy values
  const filesArray = newDocs.map((v) => (v?.fileStoreId || v?.documentUid)).filter(Boolean);

  const queryKey = [`adsDocuments-${bookingId}`, filesArray];

  // Query function: don't call the file service if nothing to fetch
  const queryFn = async () => {
    if (!filesArray.length) return { data: {} }; // consistent fallback shape
    return Digit.UploadServices.Filefetch(filesArray, stateId);
  };

  const { isLoading, error, data } = useQuery(queryKey, queryFn, {
    staleTime: Infinity,
  });

  return {
    isLoading,
    error,
    data: { pdfFiles: data?.data || {} },
    revalidate: () => client.invalidateQueries(queryKey),
  };
};

export default useADSDocumentSearch;
