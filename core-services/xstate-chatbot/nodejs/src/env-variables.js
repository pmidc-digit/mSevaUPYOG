const os = require('os');

const envVariables = {
    serviceId : process.env.NAME || 'xstate-chatbot',
    ver : process.env.VERSION || '0.0.1',

    port: process.env.SERVICE_PORT || 8082,
    contextPath : process.env.CONTEXT_PATH || '/xstate-chatbot',

   whatsAppProvider: process.env.WHATSAPP_PROVIDER || 'ValueFirst',
   //whatsAppProvider: process.env.WHATSAPP_PROVIDER || 'console',

    serviceProvider: process.env.SERVICE_PROVIDER || 'eGov',

    repoProvider: process.env.REPO_PROVIDER || 'PostgreSQL',

    whatsAppBusinessNumber : process.env.WHATSAPP_BUSINESS_NUMBER || '918750975975',

    rootTenantId: process.env.ROOT_TENANTID || 'pb',

    supportedLocales: process.env.SUPPORTED_LOCALES || 'en_IN',

    googleAPIKey: process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDjSk-Bw1OuiOE-5K7jsP6KGN2rbcN7iBk',

    dateFormat: process.env.DATEFORMAT || 'DD/MM/YYYY',
    timeZone: process.env.TIMEZONE || 'Asia/Kolkata',
    msgId: process.env.MSG_ID || '20170310130900',
    avgSessionTime: process.env.AVG_SESSION_TIME || 30,

    paytmWnSLink: process.env.PAYTM_WNS_LINK || 'https://stvending.punjab.gov.in/wsbills/',

    postgresConfig: {
        dbHost: process.env.DB_HOST || 'localhost',
        dbPort: process.env.DB_PORT || '5432',
        dbName: process.env.DB_NAME || 'chat',
        dbUsername: process.env.DB_USER || 'postgres',
        dbPassword: process.env.DB_PASSWORD || 'postgres'
    },

    kafka: {
        kafkaBootstrapServer: process.env.KAFKA_BOOTSTRAP_SERVER || 'localhost:9092',
        chatbotTelemetryTopic: process.env.CHATBOT_TELEMETRY_TOPIC || 'chatbot-telemetry-v2',

        kafkaConsumerEnabled: process.env.KAFKA_CONSUMER_ENABLED || true,
        kafkaConsumerGroupId: process.env.KAFKA_CONSUMER_GROUP_ID || 'xstate-chatbot',
    },

    kaleyra: {
        sendMessageUrl: process.env.KALEYRA_SEND_MESSAGE_URL || 'https://api.kaleyra.io/v1/{{sid}}/messages',
        sid: process.env.KALEYRA_SID || '',
        apikey: process.env.KALEYRA_API_KEY || '',
    },
   
    valueFirstWhatsAppProvider: {
        valueFirstUsername: process.env.VALUEFIRST_USERNAME || 'demo',
        valueFirstPassword: process.env.VALUEFIRST_PASSWORD || 'demo',
        valueFirstURL: process.env.VALUEFIRST_SEND_MESSAGE_URL || 'https://api.myvfirst.com/psms/servlet/psms.JsonEservice',
        valueFirstTokenURL: process.env.VALUEFIRST_TOKEN_URL || 'https://api.myvfirst.com/psms/api/messages/token',
        valuefirstNotificationAssignedTemplateid: process.env.VALUEFIRST_NOTIFICATION_ASSIGNED_TEMPLATEID || '205987,4156319',
        valuefirstNotificationResolvedTemplateid: process.env.VALUEFIRST_NOTIFICATION_RESOLVED_TEMPLATEID || '205989,4156321',
        valuefirstNotificationRejectedTemplateid: process.env.VALUEFIRST_NOTIFICATION_REJECTED_TEMPLATEID || '205991,4156323',
        valuefirstNotificationReassignedTemplateid: process.env.VALUEFIRST_NOTIFICATION_REASSIGNED_TEMPLATEID || '205993,4156325',
        valuefirstNotificationCommentedTemplateid: process.env.VALUEFIRST_NOTIFICATION_COMMENTED_TEMPLATEID || '205995',
        valuefirstNotificationWelcomeTemplateid: process.env.VALUEFIRST_NOTIFICATION_WELCOME_TEMPLATEID || '205999,4156311',
        valuefirstNotificationRootTemplateid: process.env.VALUEFIRST_NOTIFICATION_ROOT_TEMPLATEID || '206001,4156313',
        valuefirstNotificationViewReceptTemplateid: process.env.VALUEFIRST_NOTIFICATION_VIEW_RECEIPT_TEMPLATEID || '3597461,4156327',
        valuefirstNotificationPTBillTemplateid: process.env.VALUEFIRST_NOTIFICATION_PT_BILL_TEMPLATEID || '3595729,4156331',
        valuefirstNotificationWSBillTemplateid: process.env.VALUEFIRST_NOTIFICATION_WS_BILL_TEMPLATEID || '3595727,4156329',
        valuefirstNotificationOwnerBillSuccessTemplateid: process.env.VALUEFIRST_NOTIFICATION_OWNER_BILL_SUCCESS_TEMPLATEID || '3595731,4156489',
        valuefirstNotificationOtherPTBillSuccessTemplateid: process.env.VALUEFIRST_NOTIFICATION_OTHER_PT_BILL_SUCCESS_TEMPLATEID || '3618673,4156315',
        valuefirstNotificationOtherWSBillSuccessTemplateid: process.env.VALUEFIRST_NOTIFICATION_OTHER_WS_BILL_SUCCESS_TEMPLATEID || '3618675,4156317',
        valuefirstNotificationTrackCompliantTemplateid: process.env.VALUEFIRST_NOTIFICATION_TRACK_COMPLAINT_TEMPLATEID || '4052381,4156335',
        valuefirstNotificationLodgeCompliantTemplateid: process.env.VALUEFIRST_NOTIFICATION_LODGE_COMPLAINT_TEMPLATEID || '4052379,4156333',
        valuefirstLoginAuthorizationHeader: process.env.VALUEFIRST_LOGIN_AUTHORIZATION_HEADER || 'Basic bXNldmF1cmJhbndhOjE+PkdpZ3pINCU=',
    },

    egovServices: {
        egovServicesHost: process.env.EGOV_SERVICES_HOST || 'https://mseva.lgpunjab.gov.in/',
        externalHost: process.env.EXTERNAL_HOST || 'https://mseva.lgpunjab.gov.in/',
        //searcherHost: process.env.EGOV_SEARCHER_HOST || "https://mseva.lgpunjab.gov.in/",
        searcherHost: process.env.EGOV_SEARCHER_HOST || "http://egov-searcher.egov:8080/",

        //userServiceHost: process.env.USER_SERVICE_HOST || 'http://egov-user:8080/',
        userServiceHost: process.env.USER_SERVICE_HOST || 'https://mseva.lgpunjab.gov.in/',
        userServiceOAuthPath: process.env.USER_SERVICE_OAUTH_PATH || 'user/oauth/token',
        userServiceCreateCitizenPath: process.env.USER_SERVICE_CREATE_CITIZEN_PATH || 'user/citizen/_create',
        userServiceUpdateProfilePath: process.env.USER_SERVICE_UPDATE_PROFILE_PATH || 'user/profile/_update',
        userServiceCitizenDetailsPath: process.env.USER_SERVICE_CITIZEN_DETAILS_PATH || 'user/_details',

        egovlocalizationhost : process.env.LOCALISATION_SERVICE_HOST || "http://egov-localization:8080/",
        mdmsSearchPath: process.env.MDMS_SEARCH_PATH || 'egov-mdms-service/v1/_search',
        localisationServiceSearchPath: process.env.LOCALISATION_SERVICE_SEARCH_PATH || 'localization/messages/v1/_search',
        billServiceSearchPath: process.env.BILL_SERVICE_SEARCH_PATH || 'billing-service/bill/v2/_fetchbill',
        egovFilestoreServiceUploadEndpoint: process.env.EGOV_FILESTORE_SERVICE_UPLOAD_ENDPOINT || "filestore/v1/files?module=chatbot",
        egovFilestoreServiceDownloadEndpoint: process.env.EGOV_FILESTORE_SERVICE_DOWNLOAD_ENDPOINT || "filestore/v1/files/url",
        urlShortnerEndpoint: process.env.URL_SHORTNER_ENDPOINT || 'egov-url-shortening/shortener',
        collectonServicSearchEndpoint: process.env.COLLECTION_SERVICE_SEARCH_ENDPOINT || 'collection-services/payments/$module/_search',
        pgrCreateEndpoint: process.env.PGR_CREATE_ENDPOINT || 'pgr-services/v2/request/_create',
        pgrSearchEndpoint: process.env.PGR_SEARCH_ENDPOINT || 'pgr-services/v2/request/_search',
        swachCreateEndpoint:process.env.SWACH_CREATE_ENDPOINT || "swach-services/v2/request/_create",
        swachSearchEndpoint:process.env.SWACH_SEARCH_ENDPOINT || "swach-services/v2/request/_search",
        pgrv1CreateEndpoint: process.env.PGR_CREATE_ENDPOINT || 'rainmaker-pgr/v1/requests/_create',
        pgrv1SearchEndpoint: process.env.PGR_SEARCH_ENDPOINT || 'rainmaker-pgr/v1/requests/_search',
        waterConnectionSearch: process.env.WATER_CONNECTION_SEARCH || 'ws-services/wc/_search?searchType=CONNECTION',
        sewerageConnectionSearch: process.env.SEWERAGE_CONNECTION_SEARCH || 'sw-services/swc/_search?searchType=CONNECTION',
        cityFuzzySearch: process.env.CITY_FUZZY_SEARCH || 'nlp-engine/fuzzy/city',
        localityFuzzySearch: process.env.LOCALITY_FUZZY_SEARCH || 'nlp-engine/fuzzy/locality',

        cityExternalWebpagePath: process.env.CITY_EXTERNAL_WEBPAGE_PATH || 'citizen/openlink/whatsapp/city',
        localityExternalWebpagePath: process.env.LOCALITY_EXTERNAL_WEBPAGE_PATH || 'citizen/openlink/whatsapp/locality',
        receiptdownladlink: process.env.RECEIPT_DOWNLOAD_LINK || 'citizen/withoutAuth/egov-common/download-receipt?status=success&consumerCode=$consumercode&tenantId=$tenantId&receiptNumber=$receiptnumber&businessService=$businessservice&smsLink=true&mobileNo=$mobilenumber&channel=whatsapp&redirectNumber=+$whatsAppBussinessNumber&locale=$locale',
        msgpaylink: process.env.MSG_PAY_LINK || 'citizen/withoutAuth/egov-common/pay?consumerCode=$consumercode&tenantId=$tenantId&businessService=$businessservice&redirectNumber=$redirectNumber&channel=whatsapp&locale=$locale',
        wsOpenSearch: process.env.WS_OPEN_SEARCH || 'citizen/withoutAuth/wns/public-search',
        ptOpenSearch: process.env.PT_OPEN_SEARCH || 'citizen/withoutAuth/pt-mutation/public-search',
        attendanceEndpoint: process.env.ATTENDANCE_ENDPOINT || 'swach-services/v2/request/image/_create',
    },

    userService: {
        userServiceHardCodedPassword: process.env.USER_SERVICE_HARDCODED_PASSWORD || '768696',
        userLoginAuthorizationHeader: process.env.USER_LOGIN_AUTHORIZATION_HEADER || 'Basic ZWdvdi11c2VyLWNsaWVudDplZ292LXVzZXItc2VjcmV0',
    },

    pgrUseCase: {
        pgrVersion: process.env.PGR_VERSION || 'v2',
        complaintSearchLimit: process.env.COMPLAINT_SEARCH_LIMIT || 3,
        informationImageFilestoreId: process.env.INFORMATION_IMAGE_FILESTORE_ID ||'5c3a93a0-e501-4b97-aa84-97f9b9b34517',                                            //'16dff22d-06dd-485d-a03d-6d11e8564dff',
        pgrUpdateTopic: process.env.PGR_UPDATE_TOPIC || 'update-pgr-request',
        geoSearch: process.env.GEO_SEARCH || true
    },

    swachUseCase: {
        complaintSearchLimit: process.env.COMPLAINT_SEARCH_LIMIT || 3,
        informationImageFilestoreId: process.env.INFORMATION_IMAGE_FILESTORE_ID || '5c3a93a0-e501-4b97-aa84-97f9b9b34517',                   //'b7285c21-7f6e-4a71-9537-bd4d2c56b34c',
        geoSearch: process.env.GEO_SEARCH || true
    },

    billsAndReceiptsUseCase: {
        billSearchLimit: process.env.BILL_SEARCH_LIMIT || 3,
        receiptSearchLimit: process.env.RECEIPT_SEARCH_LIMIT || 3,

        billSupportedModules: process.env.BILL_SUPPORTED_MODULES || 'WS, PT',

        paymentUpdateTopic: process.env.PAYMENT_UPDATE_TOPIC || 'egov.collection.payment-create',
        pgUpdateTransaction: process.env.PG_UPDATE_TRANSACTION || 'update-pg-txns',
        openSearchImageFilestoreId: process.env.OPEN_SEARCH_IMAGE_FILESTORE_ID || 'bd150c64-2188-44ba-b77e-3030475bddc8'
    },

}

module.exports = envVariables;
