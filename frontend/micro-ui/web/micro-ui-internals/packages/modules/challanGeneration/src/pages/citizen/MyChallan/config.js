export const config = [
  {
    texts: {
      header: "CS_SEARCH_RESULTS",
      actionButtonLabel: "CS_VIEW_DETAILS",
    },
    labels: [
      {
        label: "CHALLAN_AMOUNT",
        key: "total_due",
        noteStyle: {
          fontSize: "24px",
          fontWeight: "bold",
        },
        notePrefix: "₹ ",
      },
      {
        label: "UC_CHALLAN_NO",
        key: "ChannelNo",
      },
      {
        label: "STATUS",
        key: "status",
      },
      // {
      //   label: "UC_SERVICE_CATEGORY_LABEL",
      //   key: "ServiceCategory",
      // },
      // {
      //   label: "UC_BILLING_PERIOD_LABEL",
      //   key: "BillingPeriod",
      // },
      {
        label: "UC_OWNER_NAME_LABEL",
        key: "OwnerName",
      },
      // {
      //   label: "UC_DUE_DATE",
      //   key: "bil_due__date",
      // },
    ],
  },
];
