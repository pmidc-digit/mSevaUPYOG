package org.egov.rl.calculator.service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.egov.common.contract.request.RequestInfo;
import org.egov.rl.calculator.repository.DemandRepository;
import org.egov.rl.calculator.web.models.demand.Demand;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BatchDemanService {
	
	@Autowired
	private DemandRepository demandRepository;
	
	
    public <T> List<List<Demand>> partition(List<Demand> list, int batchSize) {
        if (batchSize <= 0) throw new IllegalArgumentException("batchSize must be > 0");

        int size = list.size();
        int numberOfBatches = (size + batchSize - 1) / batchSize;

        return IntStream.range(0, numberOfBatches)
                .mapToObj(batchIndex -> {
                    int start = batchIndex * batchSize;
                    int end = Math.min(start + batchSize, size);
                    return list.subList(start, end);
                })
                .collect(Collectors.toList());
    }    

    
    public void batchRun(List<Demand> list, int batchSize,RequestInfo requestInfo) {
        List<Demand> data = IntStream.rangeClosed(0, (list.size()-1)).boxed().map(a->list.get(a)).collect(Collectors.toList());
        List<List<Demand>> batches = partition(data, 5);
        batches.forEach(demands->{
        	demandRepository.saveDemand(requestInfo, demands);
        });
    }
    

}
