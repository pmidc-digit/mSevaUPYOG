package org.egov.infra.mdms.repository;

import java.util.List;
import java.util.Map;

public interface MdmsDataRepository {
    List<Map<String, Object>> searchAll();
}
