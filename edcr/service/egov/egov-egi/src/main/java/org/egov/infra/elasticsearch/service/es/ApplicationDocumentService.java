/*
 * eGov SmartCity eGovernance suite is licensed under the GNU GPL v3.
 */
package org.egov.infra.elasticsearch.service.es;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.apache.commons.lang3.StringUtils;
import org.egov.infra.config.mapper.BeanMapperConfiguration;
import org.egov.infra.elasticsearch.entity.ApplicationIndex;
import org.egov.infra.elasticsearch.entity.bean.ApplicationDetails;
import org.egov.infra.elasticsearch.entity.bean.ApplicationIndexRequest;
import org.egov.infra.elasticsearch.entity.bean.ApplicationIndexResponse;
import org.egov.infra.elasticsearch.entity.bean.ApplicationInfo;
import org.egov.infra.elasticsearch.entity.bean.ServiceDetails;
import org.egov.infra.elasticsearch.entity.bean.ServiceGroupDetails;
import org.egov.infra.elasticsearch.entity.bean.ServiceGroupTrend;
import org.egov.infra.elasticsearch.entity.bean.SourceTrend;
import org.egov.infra.elasticsearch.entity.bean.Trend;
import org.egov.infra.elasticsearch.entity.es.ApplicationDocument;
import org.egov.infra.elasticsearch.repository.es.ApplicationDocumentRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Application dashboard service for Spring Data Elasticsearch 6 / Elasticsearch 9.
 *
 * <p>The former implementation depended on the removed TransportClient,
 * ElasticsearchTemplate and Elasticsearch 2 aggregation types. Repository access now
 * uses the current Spring Data Elasticsearch client stack and the result shaping is
 * expressed with Java 21 collection operations.</p>
 */
@Service
@Transactional(readOnly = true)
public class ApplicationDocumentService {

    private static final String SOURCE_SYSTEM = "SYSTEM";
    private static final String SOURCE_ONLINE = "ONLINE";
    private static final String SOURCE_MEESEVA = "MEESEVA";
    private static final String SOURCE_CSC = "CSC";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final ZoneId DEFAULT_ZONE = ZoneId.systemDefault();

    private final ApplicationDocumentRepository applicationDocumentRepository;
    private final BeanMapperConfiguration beanMapperConfiguration;

    public ApplicationDocumentService(@Lazy ApplicationDocumentRepository applicationDocumentRepository,
            BeanMapperConfiguration beanMapperConfiguration) {
        this.applicationDocumentRepository = applicationDocumentRepository;
        this.beanMapperConfiguration = beanMapperConfiguration;
    }

    @Transactional
    public ApplicationDocument createOrUpdateApplicationDocument(ApplicationIndex applicationIndex) {
        return applicationDocumentRepository.save(beanMapperConfiguration.map(applicationIndex, ApplicationDocument.class));
    }

    public ApplicationIndexResponse findAllApplications(ApplicationIndexRequest request) {
        List<ApplicationDocument> documents = findDocuments(request);
        ApplicationIndexResponse response = new ApplicationIndexResponse();
        response.setTotalReceived(documents.size());
        response.setTotalClosed(count(documents, ApplicationDocumentService::isClosed));
        response.setTotalOpen(count(documents, document -> !isClosed(document)));

        LocalDate today = LocalDate.now();
        response.setTodaysReceived(count(documents, document -> today.equals(toLocalDate(document.getApplicationDate()))));
        response.setTodaysClosed(count(documents, document -> isClosed(document)
                && today.equals(toLocalDate(document.getApplicationDate()))));
        response.setTrend(toTrends(documents));
        response.setDetails(toAnalysisDetails(documents, request));
        return response;
    }

    public ApplicationIndexResponse findServiceGroupWiseApplications(ApplicationIndexRequest request) {
        List<ApplicationDocument> documents = findDocuments(request);
        ApplicationIndexResponse response = new ApplicationIndexResponse();
        response.setServiceGroupDetails(groupCounts(documents, ApplicationDocument::getModuleName).entrySet().stream()
                .map(entry -> serviceGroup(entry.getKey(), entry.getValue(), count(documents,
                        document -> Objects.equals(entry.getKey(), document.getModuleName()) && !isClosed(document))))
                .toList());
        response.setServiceGroupTrend(toServiceGroupTrends(documents));
        return response;
    }

    public List<ServiceGroupTrend> getMonthwiseServiceGroupApplicationTrends(ApplicationIndexRequest request) {
        return toServiceGroupTrends(findDocuments(request));
    }

    public ApplicationIndexResponse findSourceWiseApplicationDetails(ApplicationIndexRequest request) {
        List<ApplicationDocument> documents = findDocuments(request);
        ApplicationIndexResponse response = new ApplicationIndexResponse();
        response.setTotalReceived(documents.size());
        response.setTotalCsc(countChannel(documents, SOURCE_CSC));
        response.setTotalMeeseva(countChannel(documents, SOURCE_MEESEVA));
        response.setTotalOnline(countChannel(documents, SOURCE_ONLINE));
        response.setTotalUlb(countChannel(documents, SOURCE_SYSTEM));
        response.setTotalOthers(count(documents, document -> !isKnownChannel(document.getChannel())));
        response.setSourceTrend(toSourceTrends(documents));
        return response;
    }

    public List<SourceTrend> getMonthwiseSourceApplicationTrends(ApplicationIndexRequest request) {
        return toSourceTrends(findDocuments(request));
    }

    public List<Trend> getMonthwiseApplicationTrends(ApplicationIndexRequest request) {
        return toTrends(findDocuments(request));
    }

    public ApplicationIndexResponse findServiceWiseDetails(ApplicationIndexRequest request) {
        List<ApplicationDocument> documents = findDocuments(request);
        ApplicationIndexResponse response = new ApplicationIndexResponse();
        response.setTotalReceived(documents.size());
        response.setTotalClosed(count(documents, ApplicationDocumentService::isClosed));
        response.setTotalOpen(count(documents, document -> !isClosed(document)));
        response.setTotalBeyondSLA(count(documents, ApplicationDocumentService::isBeyondSla));
        response.setTotalWithinSLA(count(documents, document -> !isBeyondSla(document)));
        response.setOpenBeyondSLA(count(documents, document -> !isClosed(document) && isBeyondSla(document)));
        response.setClosedBeyondSLA(count(documents, document -> isClosed(document) && isBeyondSla(document)));

        response.setServiceDetails(documents.stream().filter(ApplicationDocumentService::isBeyondSla)
                .collect(Collectors.groupingBy(ApplicationDocument::getApplicationType, Collectors.counting()))
                .entrySet().stream().sorted(Map.Entry.<String, Long>comparingByValue().reversed()).limit(5)
                .map(entry -> serviceDetails(entry.getKey(), entry.getValue())).toList());
        return response;
    }

    public List<ApplicationInfo> getApplicationInfo(ApplicationIndexRequest request) {
        return findDocuments(request).stream()
                .sorted(Comparator.comparing(ApplicationDocument::getApplicationDate,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toApplicationInfo)
                .toList();
    }

    private List<ApplicationDocument> findDocuments(ApplicationIndexRequest request) {
        return StreamSupport.stream(applicationDocumentRepository.findAll().spliterator(), false)
                .filter(document -> matches(document, request))
                .toList();
    }

    private boolean matches(ApplicationDocument document, ApplicationIndexRequest request) {
        if (StringUtils.isBlank(document.getApplicationNumber()))
            return false;
        if (!matches(request.getRegion(), document.getRegionName())
                || !matches(request.getDistrict(), document.getDistrictName())
                || !matches(request.getGrade(), document.getCityGrade())
                || !matches(request.getUlbCode(), document.getCityCode())
                || !matches(request.getServiceGroup(), document.getModuleName())
                || !matches(request.getService(), document.getApplicationType())
                || !matches(request.getSource(), document.getChannel())
                || !matches(request.getFunctionaryCode(), document.getOwnerName()))
            return false;

        LocalDate applicationDate = toLocalDate(document.getApplicationDate());
        if (StringUtils.isNotBlank(request.getFromDate()) && (applicationDate == null
                || applicationDate.isBefore(LocalDate.parse(request.getFromDate(), DATE_FORMAT))))
            return false;
        if (StringUtils.isNotBlank(request.getToDate()) && (applicationDate == null
                || applicationDate.isAfter(LocalDate.parse(request.getToDate(), DATE_FORMAT))))
            return false;

        if (StringUtils.isNotBlank(request.getFunctionaryCode()) && StringUtils.isNotBlank(request.getClosed())
                && ("Y".equalsIgnoreCase(request.getClosed()) != isClosed(document)))
            return false;
        return matchesSlaFilter(document, request);
    }

    private boolean matchesSlaFilter(ApplicationDocument document, ApplicationIndexRequest request) {
        if (StringUtils.isBlank(request.getFunctionaryCode()) || StringUtils.isBlank(request.getBeyondSLA()))
            return true;
        int gap = slaGap(document);
        if (!"Y".equalsIgnoreCase(request.getBeyondSLA()))
            return gap <= 0;
        return switch (StringUtils.defaultString(request.getAgeing()).toUpperCase(Locale.ROOT)) {
        case "0-1WDAYS" -> gap >= 1 && gap < 8;
        case "1W-1M" -> gap >= 8 && gap < 31;
        case "1M-3M" -> gap >= 31 && gap < 91;
        case "" -> gap > 0;
        default -> gap >= 91;
        };
    }

    private List<Trend> toTrends(List<ApplicationDocument> documents) {
        return byMonth(documents).entrySet().stream().map(entry -> {
            Trend trend = new Trend();
            trend.setMonth(monthLabel(entry.getKey()));
            trend.setTotalReceived(entry.getValue().size());
            trend.setTotalClosed(count(entry.getValue(), ApplicationDocumentService::isClosed));
            trend.setTotalOpen(count(entry.getValue(), document -> !isClosed(document)));
            return trend;
        }).toList();
    }

    private List<ServiceGroupTrend> toServiceGroupTrends(List<ApplicationDocument> documents) {
        return byMonth(documents).entrySet().stream().map(entry -> {
            ServiceGroupTrend trend = new ServiceGroupTrend();
            trend.setMonth(monthLabel(entry.getKey()));
            trend.setServiceGroupDetails(groupCounts(entry.getValue(), ApplicationDocument::getModuleName).entrySet().stream()
                    .map(group -> serviceGroup(group.getKey(), group.getValue(), 0)).toList());
            return trend;
        }).toList();
    }

    private List<SourceTrend> toSourceTrends(List<ApplicationDocument> documents) {
        return byMonth(documents).entrySet().stream().map(entry -> {
            SourceTrend trend = new SourceTrend();
            trend.setMonth(monthLabel(entry.getKey()));
            trend.setTotalCsc(countChannel(entry.getValue(), SOURCE_CSC));
            trend.setTotalMeeseva(countChannel(entry.getValue(), SOURCE_MEESEVA));
            trend.setTotalOnline(countChannel(entry.getValue(), SOURCE_ONLINE));
            trend.setTotalUlb(countChannel(entry.getValue(), SOURCE_SYSTEM));
            trend.setTotalOthers(count(entry.getValue(), document -> !isKnownChannel(document.getChannel())));
            return trend;
        }).toList();
    }

    private List<ApplicationDetails> toAnalysisDetails(List<ApplicationDocument> documents, ApplicationIndexRequest request) {
        Function<ApplicationDocument, String> classifier = aggregationClassifier(request.getAggregationLevel());
        Map<String, List<ApplicationDocument>> groups = documents.stream()
                .filter(document -> classifier.apply(document) != null)
                .collect(Collectors.groupingBy(classifier, LinkedHashMap::new, Collectors.toList()));
        return groups.entrySet().stream().map(entry -> toApplicationDetails(entry.getKey(), entry.getValue(), request))
                .toList();
    }

    private ApplicationDetails toApplicationDetails(String name, List<ApplicationDocument> documents,
            ApplicationIndexRequest request) {
        ApplicationDocument sample = documents.getFirst();
        ApplicationDetails details = new ApplicationDetails();
        String level = StringUtils.defaultIfBlank(request.getAggregationLevel(), "district").toLowerCase(Locale.ROOT);
        switch (level) {
        case "region" -> details.setRegion(name);
        case "district" -> { details.setDistrict(name); details.setRegion(value(sample.getRegionName())); }
        case "grade" -> details.setGrade(name);
        case "ulb" -> { details.setUlbName(name); details.setUlbCode(value(sample.getCityCode()));
            details.setRegion(value(sample.getRegionName())); details.setDistrict(value(sample.getDistrictName()));
            details.setGrade(value(sample.getCityGrade())); }
        case "module" -> details.setServiceGroup(name);
        case "service" -> { details.setServiceType(name); details.setServiceGroup(value(sample.getModuleName()));
            details.setSlaPeriod(number(sample.getSla())); }
        case "source" -> details.setSource(name);
        case "functionary" -> { details.setFunctionaryName(name); details.setUlbName(value(sample.getCityName()));
            details.setSlaPeriod(number(sample.getSla())); }
        default -> details.setDistrict(name);
        }
        details.setTotalReceived(documents.size());
        details.setTotalClosed(count(documents, ApplicationDocumentService::isClosed));
        details.setTotalOpen(count(documents, document -> !isClosed(document)));
        details.setClosedWithinSLA(count(documents, document -> isClosed(document) && !isBeyondSla(document)));
        details.setClosedBeyondSLA(count(documents, document -> isClosed(document) && isBeyondSla(document)));
        details.setOpenWithinSLA(count(documents, document -> !isClosed(document) && !isBeyondSla(document)));
        details.setOpenBeyondSLA(count(documents, document -> !isClosed(document) && isBeyondSla(document)));
        details.setSlab1beyondSLA(count(documents, document -> slaGap(document) >= 1 && slaGap(document) < 8));
        details.setSlab2beyondSLA(count(documents, document -> slaGap(document) >= 8 && slaGap(document) < 31));
        details.setSlab3beyondSLA(count(documents, document -> slaGap(document) >= 31 && slaGap(document) < 91));
        details.setSlab4beyondSLA(count(documents, document -> slaGap(document) >= 91));
        details.setCscTotal(countChannel(documents, SOURCE_CSC));
        details.setMeesevaTotal(countChannel(documents, SOURCE_MEESEVA));
        details.setOnlineTotal(countChannel(documents, SOURCE_ONLINE));
        details.setUlbTotal(countChannel(documents, SOURCE_SYSTEM));
        details.setOthersTotal(count(documents, document -> !isKnownChannel(document.getChannel())));
        details.setDelayedDays(documents.stream().filter(ApplicationDocumentService::isBeyondSla)
                .mapToLong(ApplicationDocumentService::slaGap).sum());
        return details;
    }

    private Function<ApplicationDocument, String> aggregationClassifier(String aggregationLevel) {
        return switch (StringUtils.defaultIfBlank(aggregationLevel, "district").toLowerCase(Locale.ROOT)) {
        case "region" -> ApplicationDocument::getRegionName;
        case "grade" -> ApplicationDocument::getCityGrade;
        case "ulb" -> ApplicationDocument::getCityName;
        case "module" -> ApplicationDocument::getModuleName;
        case "service" -> ApplicationDocument::getApplicationType;
        case "source" -> ApplicationDocument::getChannel;
        case "functionary" -> ApplicationDocument::getOwnerName;
        default -> ApplicationDocument::getDistrictName;
        };
    }

    private ApplicationInfo toApplicationInfo(ApplicationDocument document) {
        ApplicationInfo info = new ApplicationInfo();
        LocalDate date = toLocalDate(document.getApplicationDate());
        info.setAppDate(date == null ? "" : DATE_FORMAT.format(date));
        info.setAppNo(value(document.getApplicationNumber()));
        info.setService(value(document.getApplicationType()));
        info.setApplicantName(value(document.getApplicantName()));
        info.setApplicantAddress(value(document.getApplicantAddress()));
        info.setAppStatus(value(document.getStatus()));
        info.setSource(value(document.getChannel()));
        info.setSla(number(document.getSla()));
        info.setServiceGroup(value(document.getModuleName()));
        info.setAge(slaGap(document));
        info.setPendingWith(value(document.getOwnerName()));
        info.setUlbName(value(document.getCityName()));
        info.setUrl(value(document.getUrl()));
        info.setCityCode(value(document.getCityCode()));
        return info;
    }

    private static Map<YearMonth, List<ApplicationDocument>> byMonth(List<ApplicationDocument> documents) {
        return documents.stream().filter(document -> document.getApplicationDate() != null)
                .collect(Collectors.groupingBy(document -> YearMonth.from(toLocalDate(document.getApplicationDate())),
                        () -> new java.util.TreeMap<>(), Collectors.toList()));
    }

    private static Map<String, Long> groupCounts(List<ApplicationDocument> documents,
            Function<ApplicationDocument, String> classifier) {
        return documents.stream().map(classifier).filter(Objects::nonNull)
                .collect(Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting()));
    }

    private static ServiceGroupDetails serviceGroup(String name, long received, long open) {
        ServiceGroupDetails details = new ServiceGroupDetails();
        details.setServiceGroup(name);
        details.setTotalReceived(received);
        details.setTotalOpen(open);
        return details;
    }

    private static ServiceDetails serviceDetails(String name, long beyondSla) {
        ServiceDetails details = new ServiceDetails();
        details.setServiceName(name);
        details.setBeyondSLA(beyondSla);
        return details;
    }

    private static long count(List<ApplicationDocument> documents, Predicate<ApplicationDocument> predicate) {
        return documents.stream().filter(predicate).count();
    }

    private static long countChannel(List<ApplicationDocument> documents, String channel) {
        return count(documents, document -> channel.equalsIgnoreCase(value(document.getChannel())));
    }

    private static boolean isKnownChannel(String channel) {
        return SOURCE_CSC.equalsIgnoreCase(value(channel)) || SOURCE_MEESEVA.equalsIgnoreCase(value(channel))
                || SOURCE_ONLINE.equalsIgnoreCase(value(channel)) || SOURCE_SYSTEM.equalsIgnoreCase(value(channel));
    }

    private static boolean isClosed(ApplicationDocument document) {
        return Integer.valueOf(1).equals(document.getIsClosed()) || "Y".equalsIgnoreCase(document.getClosed());
    }

    private static boolean isBeyondSla(ApplicationDocument document) {
        return slaGap(document) > 0;
    }

    private static int slaGap(ApplicationDocument document) {
        Integer elapsedDays = document.getElapsedDays();
        Integer sla = document.getSla();
        return elapsedDays == null || sla == null ? 0 : elapsedDays - sla;
    }

    private static boolean matches(String requested, String actual) {
        return StringUtils.isBlank(requested) || requested.equalsIgnoreCase(value(actual));
    }

    private static LocalDate toLocalDate(Date date) {
        return date == null ? null : date.toInstant().atZone(DEFAULT_ZONE).toLocalDate();
    }

    private static String monthLabel(YearMonth month) {
        return month.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + month.getYear();
    }

    private static int number(Integer value) {
        return value == null ? 0 : value;
    }

    private static String value(String value) {
        return StringUtils.defaultString(value);
    }
}
