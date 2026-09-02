package org.egov.dx.web.models;

import java.util.ArrayList;
import java.util.List;

import com.thoughtworks.xstream.annotations.XStreamAlias;
import com.thoughtworks.xstream.annotations.XStreamImplicit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
@XStreamAlias("Persons")
public class Persons {

    @XStreamImplicit(itemFieldName = "Person")
    private List<Person> person;

    public void addPerson(Person p) {
        if (this.person == null) {
            this.person = new ArrayList<>();
        }
        this.person.add(p);
    }
}
