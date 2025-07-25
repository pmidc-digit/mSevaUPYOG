export const gcBillGeneratedResponseConfig = [
  {
    head: "",
    body: [
      {
        //if want to input index in url just pul @0 after route name owner-ship-details@0
        type: "text",

        isMandatory: true,

        texts: {
          header: "Transaction Type",
        },
        key: "transactiontype",
        withoutLabel: true,

        hideInEmployee: true,
      },
    ],
  },
];
