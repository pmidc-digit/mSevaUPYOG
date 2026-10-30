package digit.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Message {

    @NotNull
    @Size(max = 256)
    @JsonProperty("code")
    private String code;

    @NotNull
    @Size(max = 1024)
    @JsonProperty("message")
    private String message;

    @NotNull
    @Size(max = 64)
    @JsonProperty("module")
    private String module;

    @NotNull
    @Size(max = 10)
    @JsonProperty("locale")
    private String locale;
}
