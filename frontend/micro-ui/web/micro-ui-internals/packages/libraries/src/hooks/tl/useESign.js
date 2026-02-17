import { useMutation } from "react-query";

const useESign = () => {
  const eSignMutation = useMutation({
    mutationFn: async (eSignPayload) => {


      // eSignPayload should be: { fileStoreId, tenantId }
      const { fileStoreId, tenantId } = eSignPayload;
      if (!fileStoreId || !tenantId) {
        throw new Error('fileStoreId and tenantId are required for eSign.');
      }

      const formData = new FormData();
      formData.append('file', fileStoreId); // If backend expects actual file, pass File object instead
      formData.append('tenantid', tenantId);

      const response = await fetch('/egov-esign/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Send cookies (JSESSIONID)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`eSign upload failed with status: ${response.status}. Response: ${errorText.substring(0, 200)}...`);
      }

      const responseData = await response.text();
      
      if (responseData.trim().startsWith('<')) {
        throw new Error('eSign API returned HTML instead of JSON. The endpoint may not be available or configured properly.');
      }
      
      let eSignData;
      try {
        eSignData = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
      } catch (parseError) {
        throw new Error('Invalid JSON response from eSign service');
      }
      
      if (!eSignData.eSignRequest || !eSignData.aspTxnID) {
        throw new Error('Invalid response from eSign service');
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://es-staging.cdac.in/esignlevel2/2.1/form/signdoc';
      form.style.display = 'none';

      const fields = {
        eSignRequest: eSignData.eSignRequest,
        aspTxnID: eSignData.aspTxnID,
        'Content-Type': eSignData.contentType || 'application/xml'
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      setTimeout(() => {
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
      }, 1000);

      
      return {
        success: true,
        message: 'eSign process initiated successfully',
        transactionId: eSignData.aspTxnID
      };
    },
    onError: (error) => {
    }
  });

  return {
    mutate: eSignMutation.mutate,
    isLoading: eSignMutation.isLoading,
    error: eSignMutation.error,
    isSuccess: eSignMutation.isSuccess,
    reset: eSignMutation.reset,
    data: eSignMutation.data
  };
};

export default useESign;