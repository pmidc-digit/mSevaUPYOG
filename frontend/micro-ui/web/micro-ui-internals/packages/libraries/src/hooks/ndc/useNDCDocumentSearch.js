import { useQuery, useQueryClient } from "react-query";

const useNDCDocumentSearch = (data1 = {}, config = {}) => {
  const client = useQueryClient();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenant = Digit.ULBService.getStateId();
  
  let filesArray = [];
  if(data1?.value?.workflowDocs) filesArray = data1?.value?.workflowDocs?.map(ob => ob?.documentAttachment)
//   if (data1?.value?.owners?.documents["OwnerPhotoProof"]?.fileStoreId) filesArray.push(data1.value.owners.documents["OwnerPhotoProof"].fileStoreId);
//   if (data1?.value?.owners?.documents["ProofOfIdentity"]?.fileStoreId) filesArray.push(data1.value.owners.documents["ProofOfIdentity"].fileStoreId);
//   if (data1?.value?.owners?.documents["ProofOfOwnership"]?.fileStoreId) filesArray.push(data1.value.owners.documents["ProofOfOwnership"].fileStoreId);
  
  const { isLoading, error, data } = useQuery([`ndcDocuments-${1}`, filesArray], () => Digit.UploadServices.Filefetch(filesArray, tenant));
  return { isLoading, error, data: { pdfFiles: data?.data }, revalidate: () => client.invalidateQueries([`ndcDocuments-${1}`, filesArray]) };
};

export default useNDCDocumentSearch;
