                export const citizenConfig =
                [
                    {
                    "head": "ES_TITILE_OWNER_DETAILS",
                    "stepNumber": 1,
                    "body": [
                        // {
                        //     "route":"info",
                        //     "component":"PTRServiceDoc",
                        //     "nextStep": "owners",
                        //     "key": "Documents"
                        // },

                        
                        {
                        "route": "owners",
                        "component": "PTRCitizenDetails",
                        "withoutLabel": true,
                        "key": "ownerss",
                        "type": "component",
                        "nextStep": "pet-details",
                        "hideInEmployee": true,
                        "isMandatory": true,
                        },
                    ],
                    },

                    {
                    "head": "ES_TITILE_PET_DETAILS",
                    "stepNumber": 2,
                    "body": [
                        {
                        "route": "pet-details",
                        "component": "PTRCitizenPet",
                        "withoutLabel": true,
                        "key": "pets",
                        "type": "component",
                        "isMandatory": true,
                        "hideInEmployee": true,
                        "nextStep": "documents",
                        },
                    ],
                    },
                    
                    // {
                    // "head": "PTR_LOCATION_DETAILS",
                    // "body": 
                    // [
                    //     {
                    //     "route": "pincode",
                    //     "component": "PTRSelectPincode",
                    //     "texts": {
                            
                    //         "submitBarLabel": "PTR_COMMON_NEXT",
                    //         "skipText": "CORE_COMMON_SKIP_CONTINUE",
                    //     },
                    //     "withoutLabel": true,
                    //     "key": "address",
                    //     "nextStep": "address",
                    //     "type": "component",
                    //     },

                    //     {
                    //     "route": "address",
                    //     "component": "PTRSelectAddress",
                    //     "withoutLabel": true,
                    //     "texts": {
                            
                    //         "submitBarLabel": "PTR_COMMON_NEXT",
                    //     },
                    //     "key": "address",
                    //     "nextStep": "street",
                    //     "isMandatory": true,
                    //     "type": "component",
                    //     },

                    //     {
                    //     "type": "component",
                    //     "route": "street",
                    //     "component": "PTRCitizenAddress",
                    //     "key": "address",
                    //     "withoutLabel": true,
                    //     "texts": {
                    //         "submitBarLabel": "PTR_COMMON_NEXT",
                    //     },
                    //     "nextStep": "documents",
                    //     },

                        
                    // ],
                    // },
                        
                
                    {
                    "head": "ES_TITILE_DOCUMENT_DETAILS",
                    "stepNumber": 3,
                    "body": [
                        {
                            "route": "documents",
                            "component": "PTRSelectProofIdentity",
                            "withoutLabel": true,
                            "key": "documents",
                            "type": "component",
                            "nextStep":null,
                            
                        }
                    ],
                    },

                    {
                    "head": "ES_TITILE_AUMMARY_DETAILS",
                    "stepNumber": 4,
                    "body": [
                        {
                            "route": "summary",
                            "component": "PTRSummary",
                            "withoutLabel": true,
                            "key": "summary",
                            "type": "component",
                            "nextStep":null,
                            
                        }
                    ],
                    },
                ];