package org.egov.investpunjab;

import lombok.extern.slf4j.Slf4j;
import org.egov.tracer.config.TracerConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;
import org.springframework.kafka.annotation.EnableKafka;

@Slf4j
@SpringBootApplication
@EnableKafka
@ComponentScan(basePackages = {"org.egov.investpunjab", "org.egov.tracer"})
@Import({TracerConfiguration.class})
public class InvestPunjabApplication {

    public static void main(String[] args) {
        log.info("Starting InvestPunjabApplication (Invest Punjab Integration Service)...");
        SpringApplication.run(InvestPunjabApplication.class, args);
    }
}
