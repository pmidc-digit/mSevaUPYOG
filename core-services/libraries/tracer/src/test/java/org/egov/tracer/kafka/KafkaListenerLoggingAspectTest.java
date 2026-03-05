package org.egov.tracer.kafka;

import org.egov.tracer.config.TracerConfiguration;
import org.egov.tracer.config.TracerProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.test.system.CapturedOutput;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;

import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith({SpringExtension.class, OutputCaptureExtension.class})
@ContextConfiguration(classes = {TracerConfiguration.class, TestConfiguration.class})
class KafkaListenerLoggingAspectTest {

    private static final String TEST_CORRELATION_ID = "testCorrelationId";
   

    @Autowired
    private KafkaListenerWithOnlyPayloadAnnotatedHashMap kafkaListenerWithOnlyPayloadAnnotatedHashMap;

    @Autowired
    private KafkaListenerStringPayloadWithTopicHeaderAnnotation kafkaListenerStringPayloadWithTopicHeaderAnnotation;

    @Autowired
    private KafkaListenerWithoutPayloadAnnotationAndWithoutTopicHeaderAnnotation
            kafkaListenerWithoutPayloadAnnotationAndWithoutTopicHeaderAnnotation;

    @Autowired
    private KafkaListenerStringPayloadWithNonTopicHeaderAnnotation
            kafkaListenerStringPayloadWithNonTopicHeaderAnnotation;

    @Autowired
    private TracerProperties tracerProperties;

    @BeforeEach
    public void before() {
       
    }
    

    
    @Test
    public void test_should_retrieve_correlation_id_from_hash_map_payload_and_set_to_context() {
        final HashMap<String, Object> payload = new HashMap<>();
        final HashMap<String, Object> requestInfo = new HashMap<>();
        requestInfo.put("correlationId", TEST_CORRELATION_ID);
        payload.put("RequestInfo", requestInfo);

        kafkaListenerWithOnlyPayloadAnnotatedHashMap.bar(payload);

    }

    @Test
    public void test_should_set_context_with_random_correlation_id_when_hash_map_payload_does_not_have_correlation_id_field() {
        final HashMap<String, Object> payload = new HashMap<>();
        final HashMap<String, Object> requestInfo = new HashMap<>();
        requestInfo.put("foo", "abc");
        payload.put("RequestInfo", requestInfo);

        kafkaListenerWithOnlyPayloadAnnotatedHashMap.bar(payload);

    }

    @Test
    @Disabled
    public void test_simple_log_message_should_mention_topic_name_is_unavailable_when_topic_header_annotation_is_not_present(CapturedOutput output) {
        final HashMap<String, Object> payload = new HashMap<>();
        final HashMap<String, Object> requestInfo = new HashMap<>();
        requestInfo.put("foo", "abc");
        payload.put("RequestInfo", requestInfo);
        when(tracerProperties.isRequestLoggingEnabled()).thenReturn(false);

        kafkaListenerWithOnlyPayloadAnnotatedHashMap.bar(payload);

        assertTrue(output.getOut().contains("Received message from topic: <NOT-AVAILABLE>"));
    }

    @Test
    @Disabled
    public void test_detail_message_should_print_unavailable_topic_name_and_stringified_payload(CapturedOutput output) {
        final HashMap<String, Object> payload = new HashMap<>();
        final HashMap<String, Object> requestInfo = new HashMap<>();
        requestInfo.put("foo", "abc");
        payload.put("RequestInfo", requestInfo);
        when(tracerProperties.isRequestLoggingEnabled()).thenReturn(true);

        kafkaListenerWithOnlyPayloadAnnotatedHashMap.bar(payload);

        final String expectedBody = "{\"RequestInfo\":{\"foo\":\"abc\"}}";
        final String expectedMessage = "Received message from topic: <NOT-AVAILABLE> with body " + expectedBody;
        assertTrue(output.getOut().contains(expectedMessage));
    }

    @Test
    public void test_should_retrieve_correlation_id_from_string_payload_and_set_to_context() {
        final String payload = "{\"RequestInfo\": { \"correlationId\": \"testCorrelationId\"}}";

        kafkaListenerStringPayloadWithTopicHeaderAnnotation.bar(payload, "actualTopic");

    }

    @Test
    public void test_should_set_random_correlation_id_to_context_when_string_payload_does_not_have_correlation_id_field() {
        final String payload = "{\"RequestInfo\": { \"foo\": \"bar\"}}";

        kafkaListenerStringPayloadWithTopicHeaderAnnotation.bar(payload, "actualTopic");

    }

    @Test
    @Disabled
    public void test_should_print_detailed_log_with_stringified_body_and_topic_name(CapturedOutput output) {
        final String payload = "{\"RequestInfo\": { \"foo\": \"bar\"}}";
        when(tracerProperties.isRequestLoggingEnabled()).thenReturn(true);
        kafkaListenerStringPayloadWithTopicHeaderAnnotation.bar(payload, "actualTopic");

        final String expectedMessage = "Received message from topic: actualTopic with body " + payload;
        assertTrue(output.getOut().contains(expectedMessage));
    }

    @Test
    @Disabled
    public void test_should_set_random_correlation_id_when_payload_parameter_is_not_annotated() {
        final HashMap<String, Object> payload = new HashMap<>();
        final HashMap<String, Object> requestInfo = new HashMap<>();
        requestInfo.put("foo", "abc");
        payload.put("RequestInfo", requestInfo);

        kafkaListenerWithoutPayloadAnnotationAndWithoutTopicHeaderAnnotation.bar(payload);

    }

    @Test
    @Disabled
    public void test_should_print_detailed_log_with_unavailable_body_and_unavailable_topic_name(CapturedOutput output) {
        final HashMap<String, Object> payload = new HashMap<>();
        final HashMap<String, Object> requestInfo = new HashMap<>();
        requestInfo.put("foo", "abc");
        payload.put("RequestInfo", requestInfo);

        kafkaListenerWithoutPayloadAnnotationAndWithoutTopicHeaderAnnotation.bar(payload);

        final String expectedMessage = "Received message from topic: <NOT-AVAILABLE> with body <NOT-AVAILABLE>";
        assertTrue(output.getOut().contains(expectedMessage));
    }

    @Test
    @Disabled
    public void test_should_print_detailed_log_with_stringified_body_and_unavailable_topic_name(CapturedOutput output) {
        final String payload = "{\"RequestInfo\": { \"foo\": \"bar\"}}";
        when(tracerProperties.isRequestLoggingEnabled()).thenReturn(true);

        kafkaListenerStringPayloadWithNonTopicHeaderAnnotation.bar(payload, 3);

        final String expectedMessage = "Received message from topic: <NOT-AVAILABLE> with body " + payload;
        assertTrue(output.getOut().contains(expectedMessage));
    }

}

@Configuration
class TestConfiguration {

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return mock(KafkaTemplate.class);
    }

    @Bean
    public KafkaListenerWithOnlyPayloadAnnotatedHashMap kafkaListenerWithOnlyHashMapPayload() {
        return new KafkaListenerWithOnlyPayloadAnnotatedHashMap();
    }

    @Bean
    public io.micrometer.tracing.Tracer micrometerTracer() {
        return mock(io.micrometer.tracing.Tracer.class);
    }
    
    @Bean
    public KafkaListenerStringPayloadWithTopicHeaderAnnotation kafkaListenerStringPayloadWithAnnotation() {
        return new KafkaListenerStringPayloadWithTopicHeaderAnnotation();
    }

    
    @Bean
    public KafkaListenerWithoutPayloadAnnotationAndWithoutTopicHeaderAnnotation
    kafkaListenerWithPayloadNotHavingPayloadAnnotation() {
        return new KafkaListenerWithoutPayloadAnnotationAndWithoutTopicHeaderAnnotation();
    }

    @Bean
    public KafkaListenerStringPayloadWithNonTopicHeaderAnnotation
    kafkaListenerStringPayloadWithNonTopicHeaderAnnotation() {
        return new KafkaListenerStringPayloadWithNonTopicHeaderAnnotation();
    }

    @Bean
    public TracerProperties tracerProperties() {
        final TracerProperties tracerProperties = mock(TracerProperties.class);
        when(tracerProperties.isRequestLoggingEnabled()).thenReturn(true);
        return tracerProperties;
    }
}

class KafkaListenerWithOnlyPayloadAnnotatedHashMap {

    @KafkaListener(topics = "${my.topics1}")
    public void bar(@Payload HashMap<String, Object> payload) {

    }
}

class KafkaListenerStringPayloadWithTopicHeaderAnnotation {

    @KafkaListener(topics = "${my.topics2}")
    public void bar(@Payload String payload, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {

    }
}

class KafkaListenerWithoutPayloadAnnotationAndWithoutTopicHeaderAnnotation {

    @KafkaListener(topics = "${my.topics1}")
    public void bar(HashMap<String, Object> payload) {

    }
}

class KafkaListenerStringPayloadWithNonTopicHeaderAnnotation {

    @KafkaListener(topics = "${my.topics2}")
    public void bar(@Payload String payload, @Header(KafkaHeaders.RECEIVED_PARTITION) int partition) {

    }
}

