package org.egov.rl.calculator.util;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
@Getter
@Setter
public class Configurations {

	// MDMS
	@Value("${egov.mdms.host}")
	private String mdmsHost;

	@Value("${egov.mdms.search.endpoint}")
	private String mdmsEndpoint;

	// billing service
	@Value("${egov.billingservice.host}")
	private String billingServiceHost;

	@Value("${egov.taxhead.search.endpoint}")
	private String taxheadsSearchEndpoint;

	@Value("${egov.taxperiod.search.endpoint}")
	private String taxPeriodSearchEndpoint;

	@Value("${egov.demand.create.endpoint}")
	private String demandCreateEndPoint;

	@Value("${egov.demand.update.endpoint}")
	private String demandUpdateEndPoint;

	@Value("${egov.demand.search.endpoint}")
	private String demandSearchEndPoint;

	@Value("${egov.bill.gen.endpoint}")
	private String billGenEndPoint;

	@Value("${egov.collectionservice.host}")
	private String collectionServiceHost;

	@Value("${egov.receipt.search.endpoint}")
	private String ReceiptSearchEndpoint;

	@Value("${egov.payment.search.endpoint}")
	private String PaymentSearchEndpoint;

	@Value("${egov.bill.search.endpoint}")
	private String billSearchEndPoint;

	@Value("${state.level.tenant.id}")
	private String stateLevelTenantId;
	@Value("${kafka.topics.notification.sms}")
	private String smsNotifTopic;
	@Value("${egov.localization.host}")
	private String localizationServiceHost;
	@Value("${egov.localization.context.path}")
	private String localizationContextPath;
	@Value("${egov.localization.search.endpoint}")
	private String localizationSearchEndpoint;

}
