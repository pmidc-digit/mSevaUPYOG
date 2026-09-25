const config = require('../../env-variables'),
    fetch = require('node-fetch');

class LocalisationService {

    async init() {
        try {
          this.messages = {}
          this.supportedLocales = config.supportedLocales.split(',');
          for(let i = 0; i < this.supportedLocales.length; i++) {
              this.supportedLocales[i] = this.supportedLocales[i].trim();
          }
          this.supportedLocales.forEach(async (locale, index) => {
              try {
                let codeToMessages = {};
                let messages = await this.fetchMessagesForLocale(locale, config.rootTenantId);
                if (messages) {
                  messages.forEach((record, index) => {
                      const code =  record['code'];
                      const message = record['message'];
                      codeToMessages[code] = message;
                  });
                  this.messages[locale] = codeToMessages;
                }
              } catch (localeError) {
                console.error(`Error initializing messages for locale ${locale}:`, localeError.message);
              }
          });
        } catch (error) {
          console.error('Error initializing localization service:', error.message);
        }
    }

    getMessageForCode(code, locale) {
        return this.messages[locale][code];
    }

    getMessageBundleForCode(code) {
        var messageBundle = {};
        for(var locale in this.messages) {
            messageBundle[locale] = this.messages[locale][code];
        }
        return messageBundle;
    }

    async getMessagesForCodesAndTenantId(codes, tenantId) {
        try {
          let messageBundle = {};
          for(let code of codes) {
              messageBundle[code] = {}
          }
          for(let locale of this.supportedLocales) {
              try {
                let codeToMessages = {};
                let messages = await this.fetchMessagesForLocale(locale, tenantId);
                if (messages) {
                  messages.forEach((record, index) => {
                      const code =  record['code'];
                      const message = record['message'];
                      codeToMessages[code] = message;
                  });
                  for(let code of codes) {
                      messageBundle[code][locale] = codeToMessages[code];
                  }
                }
              } catch (localeError) {
                console.error(`Error fetching messages for locale ${locale}:`, localeError.message);
              }
          }
          return messageBundle;
        } catch (error) {
          console.error('Error in getMessagesForCodesAndTenantId:', error.message);
          throw error;
        }
    }

    async fetchMessagesForLocale(locale, tenantId) {
        try {
          var url = config.egovServices.egovlocalizationhost + config.egovServices.localisationServiceSearchPath + '?tenantId=' + tenantId + '&locale=' + locale;
          var options = {
              method: 'POST'
          }
          const response = await fetch(url, options);
          if (!response.ok) {
            console.error(`Localization API error for locale ${locale}: ${response.status} ${response.statusText}`);
            return [];
          }
          const data = await response.json();
          return data['messages'] || [];
        } catch (error) {
          console.error(`Error fetching messages for locale ${locale}:`, error.message);
          return [];
        }
    }

}

const localisationService = new LocalisationService();
localisationService.init();

module.exports = localisationService;