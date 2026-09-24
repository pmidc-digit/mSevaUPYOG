const config = require('../../env-variables');
const fetch = require("node-fetch");
const moment = require("moment-timezone");
const localisationService = require('../util/localisation-service');
const dialog = require('../util/dialog');

let supportedServiceForLocality = "{\"TL\" : \"tl-services\",\"FIRENOC\" : \"fireNoc\",\"WS\" : \"ws-services\",\"SW\" : \"sw-services\",\"PT\" : \"PT\",\"BPA\" : \"bpa-services\"}";

class BillService {

  constructor() {
    this.services = [];
    let supportedModules = config.billsAndReceiptsUseCase.billSupportedModules.split(',');
    for (let module of supportedModules) {
      this.services.push(module.trim());
    }
  }

  getSupportedServicesAndMessageBundle() {
    let services = this.services;
    let messageBundle = {
      // WS: {
      //   en_IN: 'Water and Sewerage',
      //   hi_IN: 'पानी और सीवरेज',
      //   pa_IN: 'ਪਾਣੀ ਅਤੇ ਸੀਵਰੇਜ'
      // },
      WS: {
        en_IN: 'Water',
        hi_IN: 'पानी',
        pa_IN: 'ਪਾਣੀ'
      },
      SW: {
        en_IN: 'Sewerage',
        hi_IN: 'सीवरेज',
        pa_IN: 'ਸੀਵਰੇਜ'
      },
      PT: {
        en_IN: 'Property Tax',
        hi_IN: 'संपत्ति कर',
        pa_IN: 'ਜਾਇਦਾਦ ਟੈਕਸ'
      },
      TL: {
        en_IN: 'Trade License Fees',
        hi_IN: 'ट्रेड लाइसेंस शुल्क'
      },
      FIRENOC: {
        en_IN: 'Fire NOC Fees',
        hi_IN: 'फायर एनओसी फीस'
      },
      BPA: {
        en_IN: 'Building Plan Scrutiny Fees',
        hi_IN: 'बिल्डिंग प्लान स्क्रूटनी फीस'
      }
    }

    return { services, messageBundle };
  }


  getSearchOptionsAndMessageBundleForService(service) {
    let messageBundle = {
      mobile: {
        en_IN: 'Search 🔎 using Mobile No.📱',
        hi_IN: 'मोबाइल नंबर 📱का उपयोग करके 🔎खोजें'
      },
      connectionNumber: {
        en_IN: 'Search 🔎 using Connection No.',
        hi_IN: 'कनेक्शन नंबर का उपयोग करके 🔎 खोजें'
      },
      consumerNumber: {
        en_IN: 'Search 🔎 using Consumer Number',
        hi_IN: 'उपभोक्ता नंबर का उपयोग करके 🔎 खोजें'

      },
      propertyId: {
        en_IN: 'Search 🔎 using Property ID',
        hi_IN: 'संपत्ति आईडी का उपयोग करके 🔎 खोजें'

      },
      tlApplicationNumber: {
        en_IN: 'Search 🔎 using Trade License Application Number',
        hi_IN: 'ट्रेड लाइसेंस आवेदन संख्या का उपयोग करके 🔎 खोजें'
      },
      nocApplicationNumber: {
        en_IN: 'Search 🔎 using NOC Application Number',
        hi_IN: 'एनओसी आवेदन संख्या का उपयोग करके 🔎 खोजें'
      },
      bpaApplicationNumber: {
        en_IN: 'Search 🔎 using BPA Application Number',
        hi_IN: 'बिल्डिंग प्लान आवेदन संख्या का उपयोग करके 🔎खोजें'
      }
    }
    let searchOptions = [];
    if (service === 'WS' || service === 'SW') {
      searchOptions = ['connectionNumber'];
    } else if (service === 'PT') {
      searchOptions = ['propertyId'];
    } else if (service === 'TL') {
      searchOptions = ['tlApplicationNumber'];
    } else if (service === 'FIRENOC') {
      searchOptions = ['nocApplicationNumber'];
    } else if (service === 'BPA') {
      searchOptions = ['bpaApplicationNumber'];
    }

    return { searchOptions, messageBundle };
  }

  getOptionAndExampleMessageBundle(service, searchParamOption) {
    let option, example;

    if (searchParamOption === 'mobile') {
      option = {
        en_IN: 'Mobile Number',
        hi_IN: 'मोबाइल नंबर'
      };
      example = {
        en_IN: 'Do not use +91 or 0 before mobile number.',
        hi_IN: 'मोबाइल नंबर से पहले +91 या 0 का उपयोग न करें।'
      }
    }

    if (searchParamOption === 'consumerNumber') {
      option = {
        en_IN: 'Consumer Number',
        hi_IN: 'उपभोक्ता संख्या'
      };
      example = {
        en_IN: ' ',
        hi_IN: ' '
      }
    }

    if (searchParamOption === 'connectionNumber') {
      option = {
        en_IN: 'Connection No',
        hi_IN: 'कनेक्शन नंबर',
        pa_IN: 'ਕਨੈਕਸ਼ਨ ਨੰਬਰ'
      };
      if (service === 'WS') {
        example = {
          en_IN: '(Connection Number must be in format\nXXXXXXXXXX OR WS/XXX/XX-XX/XXXXX)',
          hi_IN: '(कनेक्शन नंबर XXXXXXXXXX OR WS/XXX/XX-XX/XXXXX प्रारूप में होना चाहिए)',
          pa_IN: '(ਕਨੈਕਸ਼ਨ ਨੰਬਰ XXXXXXXXXX ਜਾਂ WS/XXX/XX-XX/XXXXX ਫਾਰਮੈਟ ਵਿੱਚ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ)'
        };
      }
      if (service === 'SW') {
        example = {
          en_IN: '(Connection Number must be in format\nXXXXXXXXXX OR SW/XXX/XX-XX/XXXXX)',
          hi_IN: '(कनेक्शन नंबर XXXXXXXXXX OR SW/XXX/XX-XX/XXXXX प्रारूप में होना चाहिए)',
          pa_IN: '(ਕਨੈਕਸ਼ਨ ਨੰਬਰ XXXXXXXXXX ਜਾਂ SW/XXX/XX-XX/XXXXX ਫਾਰਮੈਟ ਵਿੱਚ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ)'
        };
      }
    }

    if (searchParamOption === 'propertyId') {
      option = {
        en_IN: 'Property ID',
        hi_IN: 'संपत्ति आईडी'
      };
      example = {
        en_IN: '(Property ID must be in format\nPT-xxxx-xxxxxx)',
        hi_IN: '(संपत्ति आईडी\nPT-xxxx-xxxxxx प्रारूप में होनी चाहिए)',
        pa_IN: '(ਪ੍ਰਾਪਰਟੀ ID ਫਾਰਮੈਟ\nPT-xxxx-xxxxxx ਵਿੱਚ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ)'
      }
    }

    if (searchParamOption === 'tlApplicationNumber') {
      option = {
        en_IN: 'Trade License Application Number',
        hi_IN: 'ट्रेड लाइसेंस आवेदन संख्या'
      };
      example = {
        en_IN: ' ',
        hi_IN: ' '
      }
    }

    if (searchParamOption === 'nocApplicationNumber') {
      option = {
        en_IN: 'Fire Noc Application Number',
        hi_IN: 'फायर एनओसी एप्लीकेशन नंबर'
      };
      example = {
        en_IN: ' ',
        hi_IN: ' '
      }
    }

    if (searchParamOption === 'bpaApplicationNumber') {
      option = {
        en_IN: 'BPA Application Number',
        hi_IN: 'बिल्डिंग प्लान आवेदन संख्या'
      };
      example = {
        en_IN: ' ',
        hi_IN: ' '
      }
    }


    return { option, example };
  }

  validateParamInput(service, searchParamOption, paramInput) {
    var state = config.rootTenantId;
    state = state.toUpperCase();

    if (searchParamOption === 'mobile') {
      let regexp = new RegExp('^[0-9]{10}$');
      return regexp.test(paramInput);
    }

    if (searchParamOption === 'consumerNumber' || searchParamOption === 'propertyId' || searchParamOption === 'connectionNumber') {
      // if(service === 'PT'){
      //   let regexp = new RegExp(state+'-PT-\\d{4}-\\d{2}-\\d{2}-\\d+$');
      //   return regexp.test(paramInput);
      // }
      if (service === 'WS' || service === 'SW') {
        //todo
        let regexp = new RegExp('^(WS|SW)/\\d{3}/\\d{4}-\\d{2}/\\d+$');
        return regexp.test(paramInput);
      }
    }


    if (searchParamOption === 'tlApplicationNumber') {
      let regexp = new RegExp(state + '-TL-\\d{4}-\\d{2}-\\d{2}-\\d+$');
      return regexp.test(paramInput);
    }

    if (searchParamOption === 'nocApplicationNumber') {
      let regexp = new RegExp(state + '-FN-\\d{4}-\\d{2}-\\d{2}-\\d+$');
      return regexp.test(paramInput);
    }

    if (searchParamOption === 'bpaApplicationNumber') {
      let regexp = new RegExp(state + '-BP-\\d{4}-\\d{2}-\\d{2}-\\d+$');
      return regexp.test(paramInput);
    }
    return true;
  }


  async prepareBillResult(responseBody, user) {
    let locale = user.locale;
    let results = responseBody.Bill;
    let billLimit = config.billsAndReceiptsUseCase.billSearchLimit;

    if (results.length < billLimit)
      billLimit = results.length;

    var Bills = {};
    Bills['Bills'] = [];
    var count = 0;
    var tenantIdList = [];
    var consumerCodeList = [];
    let localisationServicePrefix = "BILLINGSERVICE_BUSINESSSERVICE_"

    let self = this;
    for (let result of results) {
      if (result.status == 'ACTIVE' && result.totalAmount != 0 && count < billLimit) {
        let dueDate = moment(result.billDetails[result.billDetails.length - 1].expiryDate).tz(config.timeZone).format(config.dateFormat);
        let billDetail = result.billDetails[result.billDetails.length - 1];
        let billFromDate = moment(billDetail.fromPeriod).tz(config.timeZone).format(config.dateFormat);
        let billToDate = moment(billDetail.toPeriod).tz(config.timeZone).format(config.dateFormat);
        let tenantId = result.tenantId;
        let link = await self.getPaymentLink(result.consumerCode, tenantId, result.businessService, locale, user);
        let serviceCode = localisationService.getMessageBundleForCode(localisationServicePrefix + result.businessService.toUpperCase());

        var data = {
          service: dialog.get_message(serviceCode, locale),
          id: result.consumerCode,
          payerName: result.payerName,
          secondaryInfo: 'Ajit Nagar,  Phagwara',
          dueAmount: result.totalAmount,
          dueDate: dueDate,
          billFromDate: billFromDate,
          billToDate: billToDate,
          tenantId: tenantId,
          paymentLink: link,
          businessService: result.businessService
        };

        /*tenantId = "TENANT_TENANTS_" + tenantId.toUpperCase().replace('.','_');
        if(!tenantIdList.includes(tenantId))
          tenantIdList.push(tenantId);

        consumerCodeList.push(result.consumerCode);*/

        Bills['Bills'].push(data);
        count++;
      }
    }
    return Bills['Bills'];

    /*if(Bills['Bills'].length>0){
      var stateLevelCode = "TENANT_TENANTS_"+config.rootTenantId.toUpperCase();
      var businessService = Bills['Bills'][0].businessService;
      tenantIdList.push(stateLevelCode);
      var businessServiceList = ['WS','SW'];
      let cosumerCodeToLocalityMap;
    
      if(businessServiceList.includes(businessService))
        cosumerCodeToLocalityMap = await this.getApplicationNumber(Bills['Bills'], businessService, authToken, locale);
    
      else
        cosumerCodeToLocalityMap = await this.getLocality(consumerCodeList, authToken, businessService, locale);
    
      let localisedMessages = await localisationService.getMessagesForCodesAndTenantId(tenantIdList, config.rootTenantId);

      for(var i=0;i<Bills['Bills'].length;i++){

        if( !(Object.keys(cosumerCodeToLocalityMap).length === 0) && cosumerCodeToLocalityMap[Bills['Bills'][i].id]){
          let tenantIdCode = "TENANT_TENANTS_" + Bills['Bills'][i].tenantId.toUpperCase().replace('.','_');
          Bills['Bills'][i].secondaryInfo = cosumerCodeToLocalityMap[Bills['Bills'][i].id] + ", " + localisedMessages[tenantIdCode][locale];

        }      
        else{
          let tenantIdCode = "TENANT_TENANTS_" + Bills['Bills'][i].tenantId.toUpperCase().replace('.','_');
          Bills['Bills'][i].secondaryInfo = localisedMessages[tenantIdCode][locale] + ", " + localisedMessages[stateLevelCode][locale];
        }
      }

    }*/

  }

  async searchBillsForUser(user) {

    let requestBody = {
      RequestInfo: {
        // authToken: user.authToken
      }
    };

    let billUrl =
      config.egovServices.egovServicesHost +
      config.egovServices.billServiceSearchPath;

    billUrl = billUrl + '?tenantId=' + config.rootTenantId;

    if (user.hasOwnProperty('paramOption') && user.paramOption != null) {

      if (user.paramOption == 'mobile')
        billUrl += '&mobileNumber=' + user.paramInput;

      if (
        user.paramOption == 'consumerNumber' ||
        user.paramOption == 'tlApplicationNumber' ||
        user.paramOption == 'nocApplicationNumber' ||
        user.paramOption == 'bpaApplicationNumber' ||
        user.paramOption == 'connectionNumber' ||
        user.paramOption == 'propertyId'
      ) {
        billUrl += '&consumerCode=' + user.paramInput;
      }

      billUrl += '&businessService=' + user.service;

    } else {

      billUrl += '&mobileNumber=' + user.mobileNumber;

    }

    let options = {
      method: 'POST',
      origin: '*',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    };

    let response = await fetch(billUrl, options);

    let responseBody = await response.json();

    // console.log(
    //   'Bill search response:',
    //   JSON.stringify(responseBody)
    // );

    let totalBillSize = 0;
    let pendingBillSize = 0;
    let results = [];

    if (response.status === 201) {

      try {
        // console.log(
        //     'Before prepareBillResult:',
        //     user.service,
        //     user.paramInput
        // );

        results = await this.prepareBillResult(
          responseBody,
          user
        );

        // console.log(
        //     'After prepareBillResult:',
        //     JSON.stringify(results, null, 2)
        // );

        totalBillSize = responseBody.Bill
          ? responseBody.Bill.length
          : 0;

        pendingBillSize = results.length;

      } catch (error) {
        console.error(
          'ERROR inside prepareBillResult:',
          error
        );

        console.error(
          'ERROR stack:',
          error.stack
        );

        return {
          totalBills: 0,
          pendingBills: undefined
        };
      }
    } else {

      // console.error(
      //   'Bill search failed. HTTP status:',
      //   response.status
      // );

      return {
        totalBills: 0,
        pendingBills: undefined
      };
    }

    if (totalBillSize == 0) {

      return {
        totalBills: 0,
        pendingBills: undefined
      };

    } else if (pendingBillSize == 0) {

      return {
        totalBills: 2,
        pendingBills: undefined
      };

    } else {

      return {
        pendingBills: results,
        totalBills: pendingBillSize
      };
    }
  }

  async fetchBillsForUser(user, service) {
    let billSupportedBussinessService;

    if (service) {
      if (service === 'WS')
        billSupportedBussinessService = ['WS'];
      if (service === 'SW')
        billSupportedBussinessService = ['SW'];
      if (service === 'PT')
        billSupportedBussinessService = ['PT'];
      if (service === 'BPA')
        billSupportedBussinessService = ['BPA.LOW_RISK_PERMIT_FEE', 'BPA.NC_APP_FEE', 'BPA.NC_SAN_FEE', 'BPA.NC_OC_APP_FEE', 'BPA.NC_OC_SAN_FEE'];
    }
    else
      billSupportedBussinessService = ['WS', 'SW', 'PT', 'TL', 'FIRENOC', 'BPA.LOW_RISK_PERMIT_FEE', 'BPA.NC_APP_FEE', 'BPA.NC_SAN_FEE', 'BPA.NC_OC_APP_FEE', 'BPA.NC_OC_SAN_FEE'];

    let billResults = {
      pendingBills: [],
      totalBills: 0
    };

    let self = this;

    for (let service of billSupportedBussinessService) {
      user.service = service;

      let results;

      if ((service === 'WS' || service === 'SW') &&
        (!user.hasOwnProperty('paramOption') || user.paramOption == null ||
          user.paramOption === 'mobile')) {

        results = await self.searchBillsForWaterSewerageByMobile(
          user,
          service
        );

      } else {

        if (!user.hasOwnProperty('paramOption') || user.paramOption == null) {
          user.paramOption = 'mobile';
          user.paramInput = user.mobileNumber;
        }

        results = await self.searchBillsForUser(user);
      }
      if (results.totalBills != 0 && results.pendingBills) {
        billResults.pendingBills = billResults.pendingBills.concat(results.pendingBills);
        billResults.totalBills = billResults.totalBills + results.totalBills;
      }
    }

    if (billResults.totalBills === 0 || billResults.pendingBills.length === 0) {
      return {
        totalBills: 0,
        pendingBills: undefined
      }

    }

    let finalResult = [];
    let billLimit = config.billsAndReceiptsUseCase.billSearchLimit;

    if (billResults.pendingBills.length < billLimit)
      billLimit = billResults.pendingBills.length;

    for (var i = 0; i < billLimit; i++)
      finalResult = finalResult.concat(billResults.pendingBills[i]);


    return {
      pendingBills: finalResult,      // Pending bills exist
      totalBills: billLimit
    }
  }

  async fetchBillsForParam(user, service, paramOption, paramInput) {
    user.service = service;
    user.paramOption = paramOption;
    user.paramInput = paramInput;

    let billsForUser;
    if (service === 'WS' || service === 'BPA')
      billsForUser = await this.fetchBillsForUser(user, service);
    else
      billsForUser = await this.searchBillsForUser(user);

    return billsForUser.pendingBills;
  }

  async getShortenedURL(finalPath) {
    var url = config.egovServices.egovServicesHost + config.egovServices.urlShortnerEndpoint;
    var request = {};
    request.url = finalPath;
    var options = {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    }
    let response = await fetch(url, options);
    let data = await response.text();
    return data;
  }

  async getPaymentLink(consumerCode, tenantId, businessService, locale, user) {
    // if (businessService === 'WS') {
    //       return 'https://billpay.setu.co/1272707270496486911/biller-form/PMC000000PUN01';
    //   }

    //   if (businessService === 'SW') {
    //       return 'https://billpay.setu.co/1272707270496486911/biller-form/PUNJ00000PUNYS';
    //   }

    //   // Keep existing payment-link logic for other services
    var UIHost = config.egovServices.externalHost;
    var paymentPath = config.egovServices.msgpaylink;

    paymentPath = paymentPath.replace(/\$consumercode/g, consumerCode);
    paymentPath = paymentPath.replace(/\$tenantId/g, tenantId);
    paymentPath = paymentPath.replace(/\$businessservice/g, businessService);
    paymentPath = paymentPath.replace(
      /\$redirectNumber/g,
      "+" + config.whatsAppBusinessNumber
    );
    paymentPath = paymentPath.replace(/\$locale/g, locale);
    paymentPath = paymentPath.replace(/\$name/g, user.name);
    paymentPath = paymentPath.replace(/\$mobileNumber/g, user.mobileNumber);

    var finalPath = UIHost + paymentPath;

    var link = await this.getShortenedURL(finalPath);

    return link;
  }

  async getLocality(consumerCodes, authToken, businessService, locale) {

    let supportedService = JSON.parse(supportedServiceForLocality);
    businessService = supportedService[businessService];

    if (!businessService)
      businessService = supportedService["BPA"];


    let requestBody = {
      RequestInfo: {
        authToken: authToken
      },
      searchCriteria: {
        referenceNumber: consumerCodes,
        limit: 5000,
        offset: 0
      }
    };

    let locationUrl = config.egovServices.searcherHost + 'egov-searcher/locality/' + businessService + '/_get';

    let options = {
      method: 'POST',
      origin: '*',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }

    let response = await fetch(locationUrl, options);
    let localitySearchResults;

    if (response.status === 200) {
      localitySearchResults = await response.json();
    } else {
      console.error('Error in fetching the Locality data');
      return undefined;
    }

    let localities = [];
    for (let result of localitySearchResults.Localities) {
      if (!localities.includes(result.locality))
        localities.push(result.locality);
    }

    let localitiesLocalisationCodes = [];
    for (let locality of localities) {
      let localisationCode = 'admin.locality.' + locality;
      localitiesLocalisationCodes.push(localisationCode);
    }

    let localisedMessages = await localisationService.getMessagesForCodesAndTenantId(localitiesLocalisationCodes, config.rootTenantId);

    let messageBundle = {};
    for (let result of localitySearchResults.Localities) {
      let localisationCode = 'admin.locality.' + result.locality;
      messageBundle[result.referencenumber] = localisedMessages[localisationCode][locale];
    }

    return messageBundle;

  }

  async getApplicationNumber(Bills, businessService, authToken, locale) {

    let requestBody = {
      RequestInfo: {
        authToken: authToken
      }
    };

    let options = {
      method: 'POST',
      origin: '*',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }


    let applicationNumbersList = [];
    let consumerCodeToApplicationMapping = {};

    for (let bill of Bills) {
      let url = config.egovServices.externalHost;
      if (businessService === 'WS') {
        url = url + config.egovServices.waterConnectionSearch;
      }
      if (businessService === 'SW') {
        url = url + config.egovServices.sewerageConnectionSearch;
      }

      url = url + '&tenantId=' + bill.tenantId;
      url = url + '&connectionNumber=' + bill.id;
      let response = await fetch(url, options);
      let searchResults;

      if (response.status === 200) {
        searchResults = await response.json();
        let applicationNumber;
        if (businessService === 'WS') {
          applicationNumber = searchResults.WaterConnection[0].applicationNo
          applicationNumbersList.push(applicationNumber);
        }
        if (businessService === 'SW') {
          applicationNumber = searchResults.SewerageConnections[0].applicationNo
          applicationNumbersList.push(applicationNumber);
        }
        consumerCodeToApplicationMapping[applicationNumber] = bill.id;
      }
    }

    let cosumerCodeToLocalityMap = await this.getLocality(applicationNumbersList, authToken, businessService, locale);

    let messageBundle = {};
    for (var i = 0; i < applicationNumbersList.length; i++) {
      let applicationNo = applicationNumbersList[i];
      if (!(Object.keys(cosumerCodeToLocalityMap).length === 0) && cosumerCodeToLocalityMap[applicationNo])
        messageBundle[consumerCodeToApplicationMapping[applicationNo]] = cosumerCodeToLocalityMap[applicationNo];
    }

    return messageBundle;
  }

  async getOpenSearchLink(service, name, mobileNumber, locale) {
    var UIHost = config.egovServices.externalHost;
    var paymentPath;
    if (service == 'WS')
      paymentPath = config.egovServices.wsOpenSearch;
    else
      paymentPath = config.egovServices.ptOpenSearch;

    paymentPath = paymentPath.replace(/\$name/g, name);
    paymentPath = paymentPath.replace(/\$mobileNumber/g, mobileNumber);
    paymentPath = paymentPath.replace(/\$locale/g, locale);

    var finalPath = UIHost + paymentPath;
    var link = await this.getShortenedURL(finalPath);
    return link;
  }

  async searchWSConnectionsByMobile(user, businessService) {
    let baseUrl = config.egovServices.egovServicesHost;

    let searchPath;

    if (businessService === 'WS') {
      searchPath = config.egovServices.waterConnectionSearch;
    } else if (businessService === 'SW') {
      searchPath = config.egovServices.sewerageConnectionSearch;
    } else {
      // console.error('Invalid business service:', businessService);
      return [];
    }

    let billUrl = baseUrl + searchPath;

    billUrl += '&mobileNumber=' + encodeURIComponent(user.mobileNumber);
    billUrl += '&locality=';
    billUrl += '&tenantId=' + encodeURIComponent(config.rootTenantId);
    billUrl += '&transactionType=' + businessService;

    // Make sure searchType=CONNECTION is present.
    if (billUrl.indexOf('searchType=CONNECTION') === -1) {
      billUrl += '&searchType=CONNECTION';
    }

    let requestBody = {
      RequestInfo: {
        apiId: 'Rainmaker',
        ver: '.01',
        action: '_search',
        did: '1',
        key: '',
        msgId: '20170310130900|' + (user.locale || 'en_IN'),
        requesterId: '',
        // authToken: null
      }
    };

    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify(requestBody)
    };

    // console.log(
    //     'Searching ' + businessService +
    //     ' connections using mobile:',
    //     user.mobileNumber
    // );

    // console.log('WS/SW connection search URL:', billUrl);

    let response;

    try {
      response = await fetch(billUrl, options);
    } catch (error) {
      console.error(
        'Exception while searching ' + businessService + ' connections:',
        error
      );
      return [];
    }

    // console.log(
    //     businessService + ' connection search response status:',
    //     response.status
    // );

    if (response.status !== 200) {
      // let errorBody = await response.text();

      // console.error(
      //     'Error fetching ' + businessService + ' connections.'
      // );
      // console.error('Status:', response.status);
      // console.error('Response:', errorBody);

      return [];
    }

    let responseBody = await response.json();

    // console.log(
    //     businessService + ' connection search response:',
    //     JSON.stringify(responseBody, null, 2)
    // );

    let connections;

    if (businessService === 'WS') {
      connections = responseBody.WaterConnection || [];
    } else {
      connections = responseBody.SewerageConnections || [];
    }

    console.log(
      businessService + ' connections found:',
      connections.length
    );

    return connections;
  }

  async searchBillsForWaterSewerageByMobile(user, businessService) {

    // console.log(
    //   'Searching bills for',
    //   businessService,
    //   'using mobile:',
    //   user.mobileNumber
    // );

    // 1. Find WS/SW connections using mobile number
    let connections = await this.searchWSConnectionsByMobile(
      user,
      businessService
    );

    if (!connections || connections.length === 0) {
      // console.log(
      //   'No ' + businessService +
      //   ' connections found for mobile:',
      //   user.mobileNumber
      // );

      return {
        totalBills: 0,
        pendingBills: undefined
      };
    }

    // 2. Extract unique connection numbers
    let connectionNumbers = [];

    for (let connection of connections) {

      if (
        connection.connectionNo &&
        !connectionNumbers.includes(connection.connectionNo)
      ) {
        connectionNumbers.push(connection.connectionNo);
      }
    }

    // console.log(
    //   businessService + ' connection numbers:',
    //   connectionNumbers
    // );

    if (connectionNumbers.length === 0) {
      // console.log(
      //   'Connections were returned but connectionNo was missing.'
      // );

      return {
        totalBills: 0,
        pendingBills: undefined
      };
    }

    // 3. Fetch bills for every connection
    let billResults = {
      pendingBills: [],
      totalBills: 0
    };

    for (let connectionNumber of connectionNumbers) {

      // console.log(
      //   'Fetching bill for',
      //   businessService,
      //   'connection:',
      //   connectionNumber
      // );

      let connectionUser = Object.assign({}, user);

      connectionUser.service = businessService;
      connectionUser.paramOption = 'connectionNumber';
      connectionUser.paramInput = connectionNumber;

      let result = await this.searchBillsForUser(connectionUser);

      if (
        result &&
        result.totalBills !== 0 &&
        result.pendingBills
      ) {

        // Handle both old structure and WS/SW Bills structure
        for (let pendingBill of result.pendingBills) {

          if (
            pendingBill.Bills &&
            Array.isArray(pendingBill.Bills)
          ) {
            // WS/SW nested structure
            billResults.pendingBills =
              billResults.pendingBills.concat(
                pendingBill.Bills
              );
          } else {
            // Existing structure for other services
            billResults.pendingBills.push(
              pendingBill
            );
          }
        }

        billResults.totalBills += result.totalBills;

        // console.log(
        //   'Bills found for',
        //   connectionNumber,
        //   ':',
        //   result.pendingBills.length
        // );
      } else {
        // console.log(
        //   'No pending bill for connection:',
        //   connectionNumber
        // );
      }
    }

    // 4. No bills
    if (
      billResults.totalBills === 0 ||
      billResults.pendingBills.length === 0
    ) {
      // console.log(
      //   'No pending bills found for',
      //   businessService,
      //   'mobile:',
      //   user.mobileNumber
      // );

      return {
        totalBills: 0,
        pendingBills: undefined
      };
    }

    // 5. Apply bill limit
    let billLimit =
      config.billsAndReceiptsUseCase.billSearchLimit;

    billLimit = Math.min(
      billLimit,
      billResults.pendingBills.length
    );

    let finalResult =
      billResults.pendingBills.slice(0, billLimit);

    // console.log(
    //   'Final',
    //   businessService,
    //   'bills:',
    //   JSON.stringify(finalResult, null, 2)
    // );

    return {
      pendingBills: finalResult,
      totalBills: billLimit
    };
  }

}
module.exports = new BillService();