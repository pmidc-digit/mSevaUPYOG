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
    for(let module of supportedModules) {
      this.services.push(module.trim());
    }
  }

  getSupportedServicesAndMessageBundle() {
    let services = this.services;
    let messageBundle = {
      WS: {
        en_IN: 'Water and Sewerage',
        hi_IN: 'पानी और सीवरेज',
        pa_IN: 'ਪਾਣੀ ਅਤੇ ਸੀਵਰੇਜ'
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
    if(service === 'WS') {
      searchOptions = [ 'connectionNumber'];
    } else if(service === 'PT') {
      searchOptions = [ 'propertyId'];
    } else if(service === 'TL') {
      searchOptions = [ 'tlApplicationNumber' ];
    } else if(service === 'FIRENOC') {
      searchOptions = [ 'nocApplicationNumber' ];
    } else if(service === 'BPA') {
      searchOptions = [ 'bpaApplicationNumber' ];
    }

    return { searchOptions, messageBundle };
  }

  getOptionAndExampleMessageBundle(service, searchParamOption) {
    let option,example;

    if(searchParamOption === 'mobile'){
      option = {
        en_IN: 'Mobile Number',
        hi_IN: 'मोबाइल नंबर'
      };
      example = {
        en_IN: 'Do not use +91 or 0 before mobile number.',
        hi_IN: 'मोबाइल नंबर से पहले +91 या 0 का उपयोग न करें।'
      }
    }

    if(searchParamOption === 'consumerNumber'){
      option = {
        en_IN: 'Consumer Number',
        hi_IN: 'उपभोक्ता संख्या'
      };
      example = {
        en_IN: ' ',
        hi_IN: ' '
      }
    }

    if(searchParamOption === 'connectionNumber'){
      option = {
        en_IN: 'Connection No',
        hi_IN: 'कनेक्शन नंबर'
      };
      example = {
       en_IN: '(Connection Number must be in format\nXXXXXXXXXX OR WS/XXX/XX-XX/XXXXX)',
       hi_IN: '(कनेक्शन नंबर nXXXXXXXXXX OR WS/XXX/XX-XX/XXXXX प्रारूप में होना चाहिए)'
      }
    }

    if(searchParamOption === 'propertyId'){
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

    if(searchParamOption === 'tlApplicationNumber'){
      option = {
        en_IN: 'Trade License Application Number',
        hi_IN: 'ट्रेड लाइसेंस आवेदन संख्या'
      };
      example = {
       en_IN: ' ',
       hi_IN: ' '
      }
    }

    if(searchParamOption === 'nocApplicationNumber'){
      option = {
        en_IN: 'Fire Noc Application Number',
        hi_IN: 'फायर एनओसी एप्लीकेशन नंबर'
      };
      example = {
       en_IN: ' ',
       hi_IN: ' '
      }
    }

    if(searchParamOption === 'bpaApplicationNumber'){
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
    var state=config.rootTenantId;
    state=state.toUpperCase();

    if(searchParamOption === 'mobile') {
      let regexp = new RegExp('^[0-9]{10}$');
      return regexp.test(paramInput);
    }

    if(searchParamOption === 'consumerNumber' || searchParamOption === 'propertyId' || searchParamOption === 'connectionNumber'){
        // if(service === 'PT'){
        //   let regexp = new RegExp(state+'-PT-\\d{4}-\\d{2}-\\d{2}-\\d+$');
        //   return regexp.test(paramInput);
        // }
        if(service === 'WS'){
          //todo
          let regexp = new RegExp('^(WS|SW)/\\d{3}/\\d{4}-\\d{2}/\\d+$');
          return regexp.test(paramInput);
        }
    }
    

    if(searchParamOption === 'tlApplicationNumber'){
        let regexp = new RegExp(state+'-TL-\\d{4}-\\d{2}-\\d{2}-\\d+$');
        return regexp.test(paramInput);
    }

    if(searchParamOption === 'nocApplicationNumber'){
      let regexp = new RegExp(state+'-FN-\\d{4}-\\d{2}-\\d{2}-\\d+$');
      return regexp.test(paramInput);
    }

    if(searchParamOption === 'bpaApplicationNumber'){
      let regexp = new RegExp(state+'-BP-\\d{4}-\\d{2}-\\d{2}-\\d+$');
      return regexp.test(paramInput);
    }
    return true;
  }


  async prepareBillResult(responseBody, user){
    let locale = user.locale;
    let results=responseBody.Bill;
    let billLimit = config.billsAndReceiptsUseCase.billSearchLimit;

    if(results.length < billLimit)
      billLimit = results.length;

    var Bills = {};
    Bills['Bills'] = [];
    var count =0;
    var tenantIdList=[];
    var consumerCodeList = [];
    let localisationServicePrefix = "BILLINGSERVICE_BUSINESSSERVICE_"

    let self = this;
    for(let result of results){
      if(result.status=='ACTIVE' && result.totalAmount!=0 && count<billLimit){
        let dueDate = moment(result.billDetails[result.billDetails.length-1].expiryDate).tz(config.timeZone).format(config.dateFormat);
        let fromMonth = new Date(result.billDetails[result.billDetails.length-1].fromPeriod).toLocaleString('en-IN', { month: 'short' });
        let toMonth = new Date(result.billDetails[result.billDetails.length-1].toPeriod).toLocaleDateString('en-IN', { month: 'short' });
        let fromBillYear = new Date(result.billDetails[result.billDetails.length-1].fromPeriod).getFullYear();
        let toBillYear = new Date(result.billDetails[result.billDetails.length-1].toPeriod).getFullYear();
        let billPeriod = fromMonth+" "+fromBillYear+"-"+toMonth+" "+toBillYear;
        let tenantId= result.tenantId;
        let link = await self.getPaymentLink(result.consumerCode,tenantId,result.businessService,locale, user);
        let serviceCode = localisationService.getMessageBundleForCode(localisationServicePrefix + result.businessService.toUpperCase());

        var data={
          service: dialog.get_message(serviceCode,locale),
          id: result.consumerCode,
          payerName: result.payerName,
          secondaryInfo: 'Ajit Nagar,  Phagwara', //to do
          dueAmount: result.totalAmount,
          dueDate: dueDate,
          period: billPeriod,
          tenantId: tenantId,
          paymentLink: link,
          businessService: result.businessService
        };
        
        /*tenantId = "TENANT_TENANTS_" + tenantId.toUpperCase().replace('.','_');
        if(!tenantIdList.includes(tenantId))
          tenantIdList.push(tenantId);

        consumerCodeList.push(result.consumerCode);*/

        Bills['Bills'].push(data);
        count = count + 1;
      } 
    }

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
    
    return Bills['Bills'];  
  }

  async searchBillsForUser(user) {
    const requestBody = {
      RequestInfo: { authToken: user.authToken }
    };
  
    let billUrl = config.egovServices.egovServicesHost + config.egovServices.billServiceSearchPath;
    billUrl += `?tenantId=${config.rootTenantId}`;
  
    if (user.paramOption && user.paramInput != null) {
      if (user.paramOption === 'mobile') {
        billUrl += `&mobileNumber=${user.paramInput}`;
      } else if (
        ['consumerNumber', 'tlApplicationNumber', 'nocApplicationNumber', 'bpaApplicationNumber', 'connectionNumber', 'propertyId'].includes(user.paramOption)
      ) {
        billUrl += `&consumerCode=${user.paramInput}`;
      }
      billUrl += `&businessService=${user.service}`;
    } else {
      billUrl += `&mobileNumber=${user.mobileNumber}`;
    }
  
    const options = {
      method: 'POST',
      origin: '*',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    };
  
    try {
      const response = await fetch(billUrl, options);
  
      if (!response.ok) {
        console.error(`Bill search failed. Status: ${response.status}`, await response.text());
        return { totalBills: 0, pendingBills: undefined };
      }
  
      const responseBody = await response.json();
      const results = await this.prepareBillResult(responseBody, user);
      const totalBillSize = responseBody.Bill?.length || 0;
      const pendingBillSize = results?.length || 0;
  
      if (totalBillSize === 0) {
        return { totalBills: 0, pendingBills: undefined };
      } else if (pendingBillSize === 0) {
        return { totalBills: totalBillSize, pendingBills: undefined };
      } else {
        return { totalBills: pendingBillSize, pendingBills: results };
      }
  
    } catch (error) {
      console.error('Exception occurred during bill search:', error);
      return { totalBills: 0, pendingBills: undefined };
    }
  }
}
module.exports = new BillService();
