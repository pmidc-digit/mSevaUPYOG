package digit.models.coremodels;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Document {
    @JsonProperty("id")
    private String id ;

    @JsonProperty("documentType")
    private String documentType ;

    @JsonProperty("fileStore")
    private String fileStore ;

    @JsonProperty("documentUid")
    private String documentUid ;

    @JsonProperty("additionalDetails")
    private Object additionalDetails ;

}
