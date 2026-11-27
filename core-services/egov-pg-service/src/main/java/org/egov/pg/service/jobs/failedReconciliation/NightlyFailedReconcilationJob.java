package org.egov.pg.service.jobs.failedReconciliation;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.User;
import org.egov.pg.config.AppProperties;
import org.egov.pg.constants.PgConstants;
import org.egov.pg.models.Transaction;
import org.egov.pg.repository.TransactionRepository;
import org.egov.pg.service.TransactionService;
import org.egov.pg.web.models.TransactionCriteria;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Value;

/**
 * Nightly reconciliation for transactions in FAILURE state created in the last 24 hours.
 */
@Component
@Slf4j
public class NightlyFailedReconcilationJob implements Job {

    private static RequestInfo requestInfo;

    @Autowired
    private AppProperties appProperties;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionRepository transactionRepository; 

    @PostConstruct
    public void init() {
        User userInfo = User.builder()
                .uuid(appProperties.getEgovPgReconciliationSystemUserUuid())
                .type("SYSTEM")
                .roles(Collections.emptyList())
                .id(0L)
                .build();

        requestInfo = new RequestInfo();
        requestInfo.setUserInfo(userInfo);
    }

    
@Override
public void execute(JobExecutionContext jobExecutionContext) {

	long endTime = System.currentTimeMillis();
    long startTime = endTime - TimeUnit.HOURS.toMillis(24);
    log.info("========== FAILED TRANSACTION RECONCILIATION STARTED ==========");
    log.info("Start Time: {} ({})",
            startTime, new java.util.Date(startTime));
    log.info("End Time: {} ({})",
            endTime, new java.util.Date(endTime));

    try {

        TransactionCriteria criteria = TransactionCriteria.builder()
                .txnStatus(Transaction.TxnStatusEnum.FAILURE)
                .build();

        List<Transaction> failedTxns =
                transactionRepository.fetchTransactionsByTimeRangeWithStatus(
                        criteria,
                        startTime,
                        endTime
                );

        if (failedTxns == null || failedTxns.isEmpty()) {
            log.warn("No failed transactions found between {} and {}",
                    new java.util.Date(startTime),
                    new java.util.Date(endTime));
            return;
        }

        log.info("Total failed transactions fetched: {}", failedTxns.size());

        int successCount = 0;
        int failureCount = 0;
        int skippedCount = 0;

        for (Transaction txn : failedTxns) {

            try {

                if (txn.getGatewayTxnId() == null
                        || txn.getGatewayTxnId().trim().isEmpty()) {

                    log.warn("Skipping transaction because gatewayTxnId is missing. TxnId: {}",
                            txn.getTxnId());

                    skippedCount++;
                    continue;
                }

                log.info("Reconciling transaction. TxnId: {}, Gateway: {}, GatewayTxnId: {}",
                        txn.getTxnId(),
                        txn.getGateway(),
                        txn.getGatewayTxnId());

                Object response = transactionService.updateTransaction(
                        requestInfo,
                        Collections.singletonMap(
                                PgConstants.PG_TXN_IN_LABEL,
                                txn.getTxnId()
                        )
                );

                log.info("Reconciliation response for TxnId {}: {}",
                        txn.getTxnId(), response);

                successCount++;

            } catch (Exception e) {

                failureCount++;

                log.error("Error reconciling transaction. TxnId: {}, Consumer Code: {}",
                        txn.getTxnId(),
                        txn.getConsumerCode(),
                        e);
            }
        }

        log.info("========== FAILED TRANSACTION RECONCILIATION SUMMARY ==========");
        log.info("Total fetched: {}", failedTxns.size());
        log.info("Successfully processed: {}", successCount);
        log.info("Failed: {}", failureCount);
        log.info("Skipped: {}", skippedCount);

    } catch (Exception e) {

        log.error("Unexpected error during failed transaction reconciliation", e);

    } finally {

        log.info("========== FAILED TRANSACTION RECONCILIATION COMPLETED ==========");
    }
}

}
