package org.egov.infra.elasticsearch.service.es;

import org.apache.commons.lang3.StringUtils;
import org.egov.infra.config.mapper.BeanMapperConfiguration;
import org.egov.infra.elasticsearch.entity.ApplicationIndex;
import org.egov.infra.elasticsearch.entity.bean.ApplicationIndexRequest;
import org.egov.infra.elasticsearch.entity.bean.ApplicationIndexResponse;
import org.egov.infra.elasticsearch.entity.bean.ApplicationInfo;
import org.egov.infra.elasticsearch.entity.bean.ServiceGroupDetails;
import org.egov.infra.elasticsearch.entity.bean.ServiceGroupTrend;
import org.egov.infra.elasticsearch.entity.bean.SourceTrend;
import org.egov.infra.elasticsearch.entity.bean.Trend;
import org.egov.infra.elasticsearch.entity.es.ApplicationDocument;
import org.egov.infra.elasticsearch.repository.es.ApplicationDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/** Spring Data Elasticsearch 6 implementation without the removed transport-client API. */
@Service
@Transactional(readOnly = true)
public class ApplicationDocumentService {
    private final ApplicationDocumentRepository repository;

    @Autowired
    private BeanMapperConfiguration mapper;

    @Autowired
    public ApplicationDocumentService(ApplicationDocumentRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ApplicationDocument createOrUpdateApplicationDocument(ApplicationIndex index) {
        return repository.save(mapper.map(index, ApplicationDocument.class));
    }

    public ApplicationIndexResponse findAllApplications(ApplicationIndexRequest request) {
        List<ApplicationDocument> documents = matchingDocuments(request);
        ApplicationIndexResponse response = new ApplicationIndexResponse();
        response.setTotalReceived(documents.size());
        response.setTotalClosed(documents.stream().filter(this::isClosed).count());
        response.setTotalOpen(documents.stream().filter(document -> !isClosed(document)).count());
        response.setTotalBeyondSLA(documents.stream().filter(this::isBeyondSla).count());
        response.setTotalWithinSLA(documents.stream().filter(document -> !isBeyondSla(document)).count());
        response.setOpenBeyondSLA(documents.stream().filter(document -> !isClosed(document) && isBeyondSla(document)).count());
        response.setClosedBeyondSLA(documents.stream().filter(document -> isClosed(document) && isBeyondSla(document)).count());
        response.setTotalCsc(countChannel(documents, "CSC"));
        response.setTotalMeeseva(countChannel(documents, "MEESEVA"));
        response.setTotalOnline(countChannel(documents, "ONLINE"));
        response.setTotalUlb(countChannel(documents, "SYSTEM"));
        response.setTotalOthers(documents.size() - response.getTotalCsc() - response.getTotalMeeseva()
                - response.getTotalOnline() - response.getTotalUlb());
        response.setTrend(buildTrends(documents));
        response.setServiceGroupTrend(buildServiceGroupTrends(documents));
        response.setSourceTrend(buildSourceTrends(documents));
        return response;
    }

    public ApplicationIndexResponse findServiceGroupWiseApplications(ApplicationIndexRequest request) {
        return findAllApplications(request);
    }

    public List<ServiceGroupTrend> getMonthwiseServiceGroupApplicationTrends(ApplicationIndexRequest request) {
        return buildServiceGroupTrends(matchingDocuments(request));
    }

    public ApplicationIndexResponse findSourceWiseApplicationDetails(ApplicationIndexRequest request) {
        return findAllApplications(request);
    }

    public List<SourceTrend> getMonthwiseSourceApplicationTrends(ApplicationIndexRequest request) {
        return buildSourceTrends(matchingDocuments(request));
    }

    public List<Trend> getMonthwiseApplicationTrends(ApplicationIndexRequest request) {
        return buildTrends(matchingDocuments(request));
    }

    public ApplicationIndexResponse findServiceWiseDetails(ApplicationIndexRequest request) {
        return findAllApplications(request);
    }

    public List<ApplicationInfo> getApplicationInfo(ApplicationIndexRequest request) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        List<ApplicationInfo> result = new ArrayList<>();
        for (ApplicationDocument document : matchingDocuments(request)) {
            ApplicationInfo info = new ApplicationInfo();
            info.setAppDate(document.getApplicationDate() == null ? null : formatter.format(document.getApplicationDate()));
            info.setAppNo(document.getApplicationNumber());
            info.setService(document.getApplicationType());
            info.setServiceGroup(document.getModuleName());
            info.setApplicantName(document.getApplicantName());
            info.setApplicantAddress(document.getApplicantAddress());
            info.setAppStatus(document.getStatus());
            info.setSource(document.getChannel());
            info.setSla(document.getSla() == null ? 0 : document.getSla());
            info.setAge(document.getElapsedDays() == null ? 0 : document.getElapsedDays());
            info.setUlbName(document.getCityName());
            info.setCityCode(document.getCityCode());
            info.setUrl(document.getUrl());
            result.add(info);
        }
        return result;
    }

    private List<ApplicationDocument> matchingDocuments(ApplicationIndexRequest request) {
        List<ApplicationDocument> result = new ArrayList<>();
        repository.findAll().forEach(document -> {
            if (request == null || matches(request.getRegion(), document.getRegionName())
                    && matches(request.getDistrict(), document.getDistrictName())
                    && matches(request.getGrade(), document.getCityGrade())
                    && matches(request.getUlbCode(), document.getCityCode())
                    && matches(request.getServiceGroup(), document.getModuleName())
                    && matches(request.getService(), document.getApplicationType())
                    && matches(request.getSource(), document.getChannel())) {
                result.add(document);
            }
        });
        return result;
    }

    private boolean matches(String requested, String actual) {
        return StringUtils.isBlank(requested) || StringUtils.equalsIgnoreCase(requested, actual);
    }

    private boolean isClosed(ApplicationDocument document) {
        return Integer.valueOf(1).equals(document.getIsClosed()) || "Y".equalsIgnoreCase(document.getClosed());
    }

    private boolean isBeyondSla(ApplicationDocument document) {
        return document.getSlaGap() != null && document.getSlaGap() > 0;
    }

    private long countChannel(List<ApplicationDocument> documents, String channel) {
        return documents.stream().filter(document -> channel.equalsIgnoreCase(document.getChannel())).count();
    }

    private List<Trend> buildTrends(List<ApplicationDocument> documents) {
        Map<String, List<ApplicationDocument>> byMonth = groupByMonth(documents);
        List<Trend> trends = new ArrayList<>();
        byMonth.forEach((month, monthlyDocuments) -> {
            Trend trend = new Trend();
            populateTrend(trend, month, monthlyDocuments);
            trends.add(trend);
        });
        return trends;
    }

    private List<ServiceGroupTrend> buildServiceGroupTrends(List<ApplicationDocument> documents) {
        List<ServiceGroupTrend> trends = new ArrayList<>();
        groupByMonth(documents).forEach((month, monthlyDocuments) -> {
            ServiceGroupTrend trend = new ServiceGroupTrend();
            populateTrend(trend, month, monthlyDocuments);
            Map<String, List<ApplicationDocument>> groups = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
            monthlyDocuments.forEach(document -> groups.computeIfAbsent(
                    StringUtils.defaultString(document.getModuleName(), "Unknown"), ignored -> new ArrayList<>()).add(document));
            List<ServiceGroupDetails> details = new ArrayList<>();
            groups.forEach((name, groupedDocuments) -> {
                ServiceGroupDetails detail = new ServiceGroupDetails();
                detail.setServiceGroup(name);
                detail.setTotalReceived(groupedDocuments.size());
                detail.setTotalOpen(groupedDocuments.stream().filter(document -> !isClosed(document)).count());
                details.add(detail);
            });
            trend.setServiceGroupDetails(details);
            trends.add(trend);
        });
        return trends;
    }

    private List<SourceTrend> buildSourceTrends(List<ApplicationDocument> documents) {
        List<SourceTrend> trends = new ArrayList<>();
        groupByMonth(documents).forEach((month, monthlyDocuments) -> {
            SourceTrend trend = new SourceTrend();
            populateTrend(trend, month, monthlyDocuments);
            trend.setTotalCsc(countChannel(monthlyDocuments, "CSC"));
            trend.setTotalMeeseva(countChannel(monthlyDocuments, "MEESEVA"));
            trend.setTotalOnline(countChannel(monthlyDocuments, "ONLINE"));
            trend.setTotalUlb(countChannel(monthlyDocuments, "SYSTEM"));
            trend.setTotalOthers(monthlyDocuments.size() - trend.getTotalCsc() - trend.getTotalMeeseva()
                    - trend.getTotalOnline() - trend.getTotalUlb());
            trends.add(trend);
        });
        return trends;
    }

    private Map<String, List<ApplicationDocument>> groupByMonth(List<ApplicationDocument> documents) {
        SimpleDateFormat monthFormatter = new SimpleDateFormat("yyyy-MM");
        List<ApplicationDocument> sorted = new ArrayList<>(documents);
        sorted.sort(Comparator.comparing(ApplicationDocument::getApplicationDate,
                Comparator.nullsLast(Comparator.naturalOrder())));
        Map<String, List<ApplicationDocument>> result = new LinkedHashMap<>();
        sorted.stream().filter(document -> document.getApplicationDate() != null).forEach(document ->
                result.computeIfAbsent(monthFormatter.format(document.getApplicationDate()), ignored -> new ArrayList<>())
                        .add(document));
        return result;
    }

    private void populateTrend(Trend trend, String month, List<ApplicationDocument> documents) {
        trend.setMonth(month);
        trend.setTotalReceived(documents.size());
        trend.setTotalClosed(documents.stream().filter(this::isClosed).count());
        trend.setTotalOpen(documents.stream().filter(document -> !isClosed(document)).count());
    }
}
