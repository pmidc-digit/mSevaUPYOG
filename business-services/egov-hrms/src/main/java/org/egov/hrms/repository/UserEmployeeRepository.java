
package org.egov.hrms.repository;

import org.egov.hrms.model.UserEmployee;
import org.egov.hrms.repository.UserEmployeeRowMapper;
import org.egov.hrms.web.contract.UserEmployeeSearchCriteria;

import java.util.List;

public interface UserEmployeeRepository {

    void save(UserEmployee userEmployee);

    void saveAll(List<UserEmployee> userEmployees); // optional batch insert

    List<UserEmployee> search(UserEmployeeSearchCriteria criteria);
}
