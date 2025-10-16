import { useEffect } from "react";
import { useMutation } from "react-query";
import { ADSServices } from "../../services/elements/ADS";

// Auto-triggering hook for slot_search or update
const useADSSlotSearch = ({ tenantId, type = true, data }) => {
  console.log("data2222", data);
  const mutation = useMutation((payload) => (type ? ADSServices.slot_search(payload, tenantId) : ADSServices.update(payload, tenantId)));

  useEffect(() => {
    if (data) {
      mutation.mutate(data);
    }
  }, [data]);

  return {
    ...mutation,
    data: mutation.data ?? [],
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
    mutate: mutation.mutate,
    isSuccess: mutation.isSuccess,
  };
};

export default useADSSlotSearch;
