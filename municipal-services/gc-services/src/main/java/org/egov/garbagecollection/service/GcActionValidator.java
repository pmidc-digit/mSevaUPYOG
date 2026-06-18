package org.egov.garbagecollection.service;

import org.egov.garbagecollection.web.models.ValidatorResult;
import org.egov.garbagecollection.web.models.GarbageConnectionRequest;

public interface GcActionValidator {

	ValidatorResult validate(GarbageConnectionRequest garbageConnectionRequest, int reqType);

}
