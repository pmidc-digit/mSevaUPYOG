export const useAdvanceDetails = (props, t) => {
  const advanceConfig = [
    {
      head: "Advance Payment",
      headId: "paymentInfo",
      body: [
        {
          label: "Advance Amount",
          isMandatory: true,
          type: "number",
          populators: {
            name: "advanceAmount",
            componentInFront: "₹",
            placeholder: t("CS_COMMON_PAYMENT_AMOUNT"),
            min: "1",
            step: "1",
            validation: {
              required: true,
              min: 1,
            },
            error: "ES_ERROR_REQUIRED",
          },
        },
      ],
    },
  ];

  return { advanceConfig };
};
