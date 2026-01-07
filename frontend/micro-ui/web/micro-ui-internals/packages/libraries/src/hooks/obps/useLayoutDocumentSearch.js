import { useQuery, useQueryClient } from "react-query";

const useLayoutDocumentSearch = (data1 = {}, config = {}) => {
  const client = useQueryClient();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenant = Digit.ULBService.getStateId();
  
  console.log("useLayoutDocumentSearch - data1:", data1);
  let filesArray = [];
  if(data1?.value?.workflowDocs) {
    filesArray = data1?.value?.workflowDocs?.map((ob) => (ob?.documentAttachment || ob?.documentUid || ob?.filestoreId));
    // Filter out empty/null values
    filesArray = filesArray.filter(f => f);
  }
  
  console.log("useLayoutDocumentSearch - filesArray:", filesArray);
  
  const { isLoading, error, data } = useQuery(
    [`nocDocuments-${JSON.stringify(filesArray)}`, filesArray], 
    () => Digit.UploadServices.Filefetch(filesArray, tenant),
    {
      enabled: filesArray.length > 0,
      ...config
    }
  );
  
  console.log("useLayoutDocumentSearch - API response:", data);
  
  // Build pdfFiles map: fileStoreId -> url
  const pdfFiles = {};
  if (data?.data?.fileStoreIds) {
    data.data.fileStoreIds.forEach(file => {
      if (file?.id && file?.url) {
        pdfFiles[file.id] = file.url;
      }
    });
  }
  
  console.log("useLayoutDocumentSearch - pdfFiles map:", pdfFiles);
  
  return { isLoading, error, data: { pdfFiles }, revalidate: () => client.invalidateQueries([`nocDocuments-${JSON.stringify(filesArray)}`, filesArray]) };
};

export default useLayoutDocumentSearch;
