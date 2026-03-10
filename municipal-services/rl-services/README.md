# Rent And Lease Service (rl-services)

Rent And Lease Service stores property in registry on top of which municipal activities like rent and lease can be performed. keeps tracks of the properties and the taxes paid for them.

### DB UML Diagram

NA

### Service Dependencies

- User Service (user)
- ID Gen. Service (ID-GEN)
- Rent And Lease Tax Calculator Service (rl-calculator)
- MDM Service (MDMS)
- Location Service (Location)
- Localisation Service (localisation)

### Swagger API Contract

https://editor.swagger.io/?url=https://raw.githubusercontent.com/upyog/UPYOG/master/municipal-services/docs/property-services/property-services.yml#!/

## Service Details

Creates allotment for rent and lease on existing proeprties.

### API Details

- Rent And Lease - The property set of API's can be used to rent and lease properties.
- Calculator - The calculator APIs can be used to assess a payment remender and pay tax for them.

### Kafka Consumers

- save.rl.allotment.topic=save-rl-allotment 
- update.rl.allotment.topic=update-rl-allotment

### Kafka Producers

- save.rl.allotment.topic=save-rl-allotment\n
- update.rl.allotment.topic=update-rl-allotment
