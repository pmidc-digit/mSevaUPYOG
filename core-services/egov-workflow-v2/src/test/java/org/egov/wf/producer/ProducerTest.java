package org.egov.wf.producer;

import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.apache.kafka.common.TopicPartition;
import org.egov.tracer.kafka.CustomKafkaTemplate;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.support.SendResult;
import org.springframework.test.context.ContextConfiguration;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.concurrent.CompletableFuture;




@ExtendWith(MockitoExtension.class)
class ProducerTest {
    @Mock(name = "customKafkaTemplate")
    private CustomKafkaTemplate<String, Object> customKafkaTemplate;

    @InjectMocks
    private Producer producer;


    @Test
    void testPush() {

            SendResult<String, Object> sendResult = mock(SendResult.class);

            when(this.customKafkaTemplate.send(anyString(), any()))
                    .thenReturn(sendResult);

            this.producer.push("Topic", "Value");

            verify(this.customKafkaTemplate).send(anyString(), any());
        
       
    }


    @Test
    void testPush2() {
    	 SendResult<String, Object> sendResult = mock(SendResult.class);

         when(this.customKafkaTemplate.send(anyString(), any()))
                 .thenReturn(sendResult);

         this.producer.push("Topic", "Value");

         verify(this.customKafkaTemplate).send(anyString(), any());
    }
}

