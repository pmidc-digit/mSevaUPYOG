package org.egov.tracer;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;
import org.apache.kafka.clients.consumer.Consumer;
import org.springframework.kafka.listener.MessageListenerContainer;


@Component
@Slf4j
public class KafkaConsumerErrorHandler extends DefaultErrorHandler {

    @Autowired
    private ExceptionAdvise exceptionAdvise;

    @Value("${tracer.errorsPublish}")
    private boolean sendErrorsToKafka;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean handleOne(
            Exception thrownException,
            ConsumerRecord<?, ?> record,
            Consumer<?, ?> consumer,
            MessageListenerContainer container) {

        if (sendErrorsToKafka) {
            log.error("Error while processing record: {}",
                    ObjectUtils.nullSafeToString(record),
                    thrownException);

            String body = null;

            try {
                if (record != null && record.value() != null) {
                    body = objectMapper.writeValueAsString(record.value());
                }
            } catch (Exception ex) {
                log.error("KafkaConsumerErrorHandler cannot parse JSON data: {}", ex.getMessage());
            }

            if (record != null) {
                exceptionAdvise.sendErrorMessage(
                        body,
                        thrownException,
                        record.topic(),
                        null,
                        false
                );
            }
        }

        // IMPORTANT: let DefaultErrorHandler continue its normal behavior
        return super.handleOne(thrownException, record, consumer, container);
    }
}

