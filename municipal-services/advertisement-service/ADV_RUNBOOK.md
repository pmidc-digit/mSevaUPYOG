# Advertisement Service - Comprehensive Production Deployment Runbook

## Document Information
- **Service Name**: Advertisement Service (adv-services)
- **Version**: 1.0.0
- **Created Date**: [Current Date]
- **Last Updated**: [Current Date]
- **Environment**: UAT → Production
- **Maintainer**: [Your Name/Team]
- **Service Port**: 8561
- **Context Path**: /adv-services

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Infrastructure Requirements](#infrastructure-requirements)
3. [Database Configuration](#database-configuration)
4. [Application Configuration](#application-configuration)
5. [MDMS Master Data Requirements](#mdms-master-data-requirements)
6. [External Service Dependencies](#external-service-dependencies)
7. [API Endpoints & Data Flow](#api-endpoints--data-flow)
8. [Business Logic & Calculations](#business-logic--calculations)
9. [Kafka Topics & Message Flow](#kafka-topics--message-flow)
10. [Deployment Steps](#deployment-steps)
11. [Post-Deployment Validation](#post-deployment-validation)
12. [Monitoring & Health Checks](#monitoring--health-checks)
13. [Rollback Procedures](#rollback-procedures)
14. [Troubleshooting Guide](#troubleshooting-guide)
15. [Maintenance & Updates](#maintenance--updates)

---

## Pre-Deployment Checklist

### Code & Build Verification
- [ ] **Code Review Completed**: All changes reviewed and approved
- [ ] **Unit Tests Pass**: All unit tests passing in CI/CD pipeline
- [ ] **Integration Tests Pass**: Integration tests completed successfully
- [ ] **UAT Testing Completed**: User acceptance testing signed off
- [ ] **Performance Testing**: Load testing completed and performance benchmarks met
- [ ] **Security Scan**: Security vulnerability scan completed and issues resolved
- [ ] **Code Quality**: SonarQube/Code quality checks passed
- [ ] **Build Artifact**: JAR file built successfully (advertisement-service-1.0.0.jar)

### Documentation & Communication
- [ ] **Deployment Window**: Production deployment window scheduled and communicated
- [ ] **Stakeholder Notification**: All stakeholders notified of deployment
- [ ] **Rollback Plan**: Rollback procedures documented and team trained
- [ ] **Monitoring Setup**: Production monitoring and alerting configured
- [ ] **Backup Strategy**: Database and application backups scheduled

---

## Infrastructure Requirements

### Server Specifications
- [ ] **Java Version**: OpenJDK 1.8 or Oracle JDK 1.8
- [ ] **Memory**: Minimum 2GB RAM, Recommended 4GB RAM
- [ ] **CPU**: Minimum 2 cores, Recommended 4 cores
- [ ] **Disk Space**: Minimum 10GB free space for logs and temporary files
- [ ] **Operating System**: Linux (Ubuntu 18.04+ or CentOS 7+)

### Network Requirements
- [ ] **Port 8561**: Advertisement service port (configurable)
- [ ] **Firewall Rules**: Configured to allow traffic on service port
- [ ] **Load Balancer**: Configured if using multiple instances
- [ ] **SSL/TLS**: SSL certificates configured for HTTPS endpoints

### External Dependencies
- [ ] **PostgreSQL Database**: Version 10+ with required databases
- [ ] **Kafka**: Version 2.8+ for message queuing
- [ ] **Redis**: For caching (if applicable)
- [ ] **File Storage**: For document storage (if applicable)

---

## Database Configuration

### PostgreSQL Setup
- [ ] **Database Creation**: Create `advService` database
- [ ] **User Creation**: Create database user with appropriate permissions
- [ ] **Connection Pool**: Configure connection pool settings
- [ ] **Backup Strategy**: Automated backup configuration

### Database Migration
- [ ] **Flyway Configuration**: Verify Flyway settings in application.properties
- [ ] **Migration Scripts**: All migration scripts reviewed and tested
- [ ] **Migration Execution**: Run database migrations in correct order
- [ ] **Data Validation**: Verify data integrity after migration

### Migration Scripts (in order):
1. `V20241022180752__adv add table.sql` - Core tables creation
2. `V20241128180852__adv add table.sql` - Additional tables
3. `V20241205180752__adv add draft table.sql` - Draft functionality
4. `V20241712189852__adv alter timer table.sql` - Timer modifications
5. `V20241812189852__adv index.sql` - Database indexes
6. `V20250401187252__adv alter timer.sql` - Timer alterations
7. `V20250701187452__adv alter query timer table.sql` - Query timer updates
8. `V20250801187452__adv alter query timer table.sql` - Additional timer updates
9. `V20250901187452__adv_rename_col_adv_id.sql` - Column renaming
10. `V20250903187452__adv_sequences.sql` - Sequence creation
11. `V202509223187452__adv_owners.sql` - Owner tables
12. `V202509273187452__drop_notnull.sql` - Constraint modifications
13. `V202510013187452__alterpaymenttimer.sql` - Payment timer updates
14. `V202510023187452__alterbooking_table.sql` - Booking table updates
15. `V202510033187452__alterAudit_booking_detail.sql` - Audit table updates

### Database Tables Verification
- [ ] **eg_adv_booking_detail**: Main booking table
- [ ] **eg_adv_booking_detail_audit**: Booking audit table
- [ ] **eg_adv_cart_detail**: Cart details table
- [ ] **eg_adv_cart_detail_audit**: Cart audit table
- [ ] **eg_adv_applicant_detail**: Applicant information table
- [ ] **eg_adv_document_detail**: Document details table
- [ ] **eg_adv_address_detail**: Address details table
- [ ] **seq_adv_booking_id**: Sequence for booking IDs

---

## Application Configuration

### Core Application Settings
- [ ] **Server Port**: Configured to 8561 (or production port)
- [ ] **Context Path**: Set to `/adv-services`
- [ ] **Timezone**: Configured to UTC
- [ ] **Logging Level**: Set to appropriate production level (INFO/WARN)

### Database Configuration
```properties
# Verify these settings match production environment
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.url=jdbc:postgresql://[PROD_DB_HOST]:5432/advService
spring.datasource.username=[PROD_DB_USER]
spring.datasource.password=[PROD_DB_PASSWORD]
```

### Flyway Configuration
```properties
# Verify Flyway settings
spring.flyway.url=jdbc:postgresql://[PROD_DB_HOST]:5432/advService
spring.flyway.user=[PROD_DB_USER]
spring.flyway.password=[PROD_DB_PASSWORD]
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.outOfOrder=true
```

### Kafka Configuration
```properties
# Verify Kafka settings
kafka.config.bootstrap_server_config=[PROD_KAFKA_HOST]:9092
spring.kafka.consumer.group-id=adv-services
```

### External Service URLs
- [ ] **MDMS Service**: `egov.mdms.host=http://[PROD_MDMS_HOST]:8094`
- [ ] **Billing Service**: `egov.billingservice.host=http://[PROD_BILLING_HOST]:8081`
- [ ] **User Service**: `egov.user.host=http://[PROD_USER_HOST]:8001`
- [ ] **ID Generation**: `egov.idgen.host=http://[PROD_IDGEN_HOST]:8095/`
- [ ] **Workflow Service**: `egov.workflow.host=https://[PROD_WORKFLOW_HOST]`
- [ ] **Localization Service**: `egov.localization.host=https://[PROD_LOCALIZATION_HOST]`
- [ ] **Encryption Service**: `egov.enc.host=http://[PROD_ENC_HOST]:1234`
- [ ] **URL Shortener**: `egov.url.shortner.host=https://[PROD_URL_SHORTENER_HOST]`

---

## MDMS Master Data Requirements

### Advertisement Module Master Data
The service requires the following master data to be configured in MDMS under the **Advertisement** module:

#### 1. AdType Master
- [ ] **Master Name**: `AdType`
- [ ] **Purpose**: Advertisement types (e.g., Billboard, Digital, Print, etc.)
- [ ] **Required Fields**: `code`, `name`, `active`
- [ ] **Sample Data**: 
  ```json
  {
    "code": "BILLBOARD",
    "name": "Billboard Advertisement",
    "active": true
  }
  ```

#### 2. Location Master
- [ ] **Master Name**: `Location`
- [ ] **Purpose**: Advertisement locations/zones
- [ ] **Required Fields**: `code`, `name`, `active`
- [ ] **Sample Data**:
  ```json
  {
    "code": "CITY_CENTER",
    "name": "City Center",
    "active": true
  }
  ```

#### 3. Advertisements Master
- [ ] **Master Name**: `Advertisements`
- [ ] **Purpose**: Advertisement configurations with pricing
- [ ] **Required Fields**: `id`, `feeType`, `amount`, `taxApplicable`, `active`
- [ ] **Sample Data**:
  ```json
  {
    "id": 1,
    "feeType": "BOOKING_FEES",
    "amount": 1000.00,
    "taxApplicable": true,
    "active": true
  }
  ```

#### 4. TaxAmount Master
- [ ] **Master Name**: `TaxAmount`
- [ ] **Purpose**: Tax rates for different fee types
- [ ] **Required Fields**: `feeType`, `rate`
- [ ] **Sample Data**:
  ```json
  {
    "feeType": "CGST",
    "rate": 9.0
  }
  ```

#### 5. ServiceCharge Master
- [ ] **Master Name**: `ServiceCharge`
- [ ] **Purpose**: Service charge configuration
- [ ] **Required Fields**: `feeType`, `rate`, `active`
- [ ] **Sample Data**:
  ```json
  {
    "feeType": "SERVICE_CHARGE",
    "rate": 2.0,
    "active": true
  }
  ```

#### 6. SecurityDeposit Master
- [ ] **Master Name**: `SecurityDeposit`
- [ ] **Purpose**: Security deposit configuration
- [ ] **Required Fields**: `feeType`, `rate`, `active`
- [ ] **Sample Data**:
  ```json
  {
    "feeType": "SECURITY_DEPOSIT",
    "rate": 10.0,
    "active": true
  }
  ```

#### 7. PenaltyFee Master
- [ ] **Master Name**: `PenaltyFee`
- [ ] **Purpose**: Penalty fee configuration for late payments
- [ ] **Required Fields**: `feeType`, `rate`, `active`
- [ ] **Sample Data**:
  ```json
  {
    "feeType": "PENALTY_FEE",
    "rate": 1.0,
    "active": true
  }
  ```

#### 8. InterestAmount Master
- [ ] **Master Name**: `InterestAmount`
- [ ] **Purpose**: Interest calculation for overdue amounts
- [ ] **Required Fields**: `feeType`, `rate`, `active`
- [ ] **Sample Data**:
  ```json
  {
    "feeType": "INTEREST_AMOUNT",
    "rate": 0.5,
    "active": true
  }
  ```

### BillingService Module Master Data

#### 1. TaxHeadMaster
- [ ] **Master Name**: `TaxHeadMaster`
- [ ] **Purpose**: Tax head configurations for billing
- [ ] **Required Fields**: `code`, `name`, `service`, `active`
- [ ] **Sample Data**:
  ```json
  {
    "code": "ADV_BOOKING_FEES",
    "name": "Advertisement Booking Fees",
    "service": "adv-services",
    "active": true
  }
  ```

### Common-Masters Module
- [ ] **Module Name**: `common-masters`
- [ ] **Purpose**: Common master data shared across services
- [ ] **Note**: Currently no specific masters required, but module must be accessible

---

## External Service Dependencies

### 1. MDMS Service
- [ ] **Host**: `egov.mdms.host=http://[PROD_MDMS_HOST]:8094`
- [ ] **Search Endpoint**: `/egov-mdms-service/v1/_search`
- [ ] **Required Modules**: `Advertisement`, `BillingService`, `common-masters`
- [ ] **Health Check**: Verify MDMS search endpoint responds
- [ ] **Data Validation**: Ensure all required master data is present

### 2. Billing Service
- [ ] **Host**: `egov.billingservice.host=http://[PROD_BILLING_HOST]:8081`
- [ ] **Endpoints**:
  - [ ] `/billing-service/taxheads/_search` - Tax head search
  - [ ] `/billing-service/taxperiods/_search` - Tax period search
  - [ ] `/billing-service/demand/_create` - Demand creation
  - [ ] `/billing-service/demand/_update` - Demand update
  - [ ] `/billing-service/demand/_search` - Demand search
  - [ ] `/billing-service/bill/v2/_fetchbill` - Bill generation
- [ ] **Health Check**: Verify all billing endpoints respond
- [ ] **Business Service**: `adv-services` must be configured

### 3. User Service
- [ ] **Host**: `egov.user.host=http://[PROD_USER_HOST]:8001`
- [ ] **Context Path**: `/user/users`
- [ ] **Endpoints**:
  - [ ] `/_createnovalidate` - User creation
  - [ ] `/user/_search` - User search
  - [ ] `/_updatenovalidate` - User update
- [ ] **Health Check**: Verify user service endpoints respond
- [ ] **Role Configuration**: `CITIZEN` role must be available

### 4. ID Generation Service
- [ ] **Host**: `egov.idgen.host=http://[PROD_IDGEN_HOST]:8095/`
- [ ] **Path**: `egov-idgen/id/_generate`
- [ ] **ID Format**: `PB-ADV-[CITY.CODE]-[seq_adv_booking_id]`
- [ ] **Health Check**: Verify ID generation endpoint responds
- [ ] **Sequence**: `seq_adv_booking_id` must be configured

### 5. Workflow Service
- [ ] **Host**: `egov.workflow.host=https://[PROD_WORKFLOW_HOST]`
- [ ] **Endpoints**:
  - [ ] `/egov-workflow-v2/egov-wf/process/_transition` - Workflow transition
  - [ ] `/egov-workflow-v2/egov-wf/businessservice/_search` - Business service search
  - [ ] `/egov-workflow-v2/egov-wf/process/_search` - Process search
- [ ] **Business Service**: `ADV` must be configured
- [ ] **Health Check**: Verify workflow endpoints respond

### 6. Localization Service
- [ ] **Host**: `egov.localization.host=https://[PROD_LOCALIZATION_HOST]`
- [ ] **Work Directory**: `/localization/messages/v1`
- [ ] **Context Path**: `/localization/messages/v1`
- [ ] **Search Endpoint**: `/_search`
- [ ] **State Level**: `true`
- [ ] **Health Check**: Verify localization endpoints respond

### 7. Encryption Service
- [ ] **Host**: `egov.enc.host=http://[PROD_ENC_HOST]:1234`
- [ ] **Endpoints**:
  - [ ] `/egov-enc-service/crypto/v1/_encrypt` - Data encryption
  - [ ] `/egov-enc-service/crypto/v1/_decrypt` - Data decryption
- [ ] **Health Check**: Verify encryption endpoints respond
- [ ] **ABAC**: `adv.decryption.abac.enabled=false` (configurable)

### 8. URL Shortener Service
- [ ] **Host**: `egov.url.shortner.host=https://[PROD_URL_SHORTENER_HOST]`
- [ ] **Endpoint**: `/egov-url-shortening/shortener`
- [ ] **Health Check**: Verify URL shortener endpoint responds

### 9. HRMS Service
- [ ] **Host**: `egov.hrms.host=https://[PROD_HRMS_HOST]:8090`
- [ ] **Search Endpoint**: `/egov-hrms/employees/_search`
- [ ] **Health Check**: Verify HRMS endpoint responds

---

## API Endpoints & Data Flow

### 1. Advertisement Booking Creation
- [ ] **Endpoint**: `POST /adv-services/booking/v1/_create`
- [ ] **Purpose**: Create new advertisement booking
- [ ] **Data Flow**:
  1. Validate request using `AdvertisementValidationService`
  2. Fetch MDMS data using `MdmsUtil.mDMSCall()`
  3. Validate MDMS data using `MDMSValidator`
  4. Enrich request using `EnrichmentService`
  5. Encrypt PII data using `ADVEncryptionService`
  6. Create user using `UserService`
  7. Process workflow if enabled
  8. Create demand using `DemandService`
  9. Save booking using `BookingRepository`
  10. Send notifications using `ADVNotificationService`

### 2. Advertisement Booking Search
- [ ] **Endpoint**: `POST /adv-services/booking/v1/_search`
- [ ] **Purpose**: Search advertisement bookings
- [ ] **Data Flow**:
  1. Validate search criteria
  2. Fetch bookings from database
  3. Enrich with user details
  4. Return paginated results

### 3. Advertisement Slot Availability
- [ ] **Endpoint**: `POST /adv-services/booking/v1/_slot-search`
- [ ] **Purpose**: Check advertisement slot availability
- [ ] **Data Flow**:
  1. Fetch advertisements from MDMS
  2. Check booking conflicts
  3. Set slot booked flags
  4. Return availability details

### 4. Advertisement Booking Update
- [ ] **Endpoint**: `POST /adv-services/booking/v1/_update`
- [ ] **Purpose**: Update advertisement booking
- [ ] **Data Flow**:
  1. Validate update request
  2. Enrich update data
  3. Update booking in database
  4. Update audit trail

### 5. Demand Estimation
- [ ] **Endpoint**: `POST /adv-services/booking/v1/_estimate`
- [ ] **Purpose**: Estimate advertisement booking cost
- [ ] **Data Flow**:
  1. Create temporary booking request
  2. Calculate demand using `CalculationService`
  3. Return estimated amounts

### 6. Draft Management
- [ ] **Endpoint**: `POST /adv-services/booking/_deletedraft`
- [ ] **Purpose**: Delete draft advertisement
- [ ] **Data Flow**:
  1. Validate draft ID
  2. Delete draft from database
  3. Return success response

### 7. Demand Update
- [ ] **Endpoint**: `POST /adv-services/booking/_updatedemand`
- [ ] **Purpose**: Update demand information
- [ ] **Data Flow**:
  1. Search existing demands
  2. Update demand details
  3. Return updated demand

---

## Business Logic & Calculations

### 1. Demand Calculation Logic
- [ ] **Base Amount**: Retrieved from MDMS `Advertisements` master
- [ ] **Booking Days**: Calculated from cart details
- [ ] **Taxable Fees**: Multiplied by booking days
- [ ] **Fixed Fees**: Applied as-is (e.g., Security Deposit)
- [ ] **Tax Calculation**: Applied on taxable amount
- [ ] **Additional Fees**:
  - [ ] Service Charge (taxable)
  - [ ] Security Deposit (non-taxable)
  - [ ] Penalty Fee (non-taxable, after booking ends)
  - [ ] Interest Amount (non-taxable, after booking ends)

### 2. Fee Calculation Formula
```
Total Amount = (Base Amount × Booking Days) + Additional Fees
Tax Amount = Total Taxable Amount × Tax Rate / 100
Final Amount = Total Amount + Tax Amount
```

### 3. Security Deposit Refund Logic
- [ ] **Full Refund**: If booking hasn't ended
- [ ] **Partial Refund**: If booking ended, deduct penalty fees
- [ ] **No Refund**: If penalty exceeds security deposit

### 4. Payment Timer Configuration
- [ ] **Timer Duration**: `adv.payment.timer=1800000` (30 minutes)
- [ ] **Purpose**: Auto-cancel bookings if payment not completed
- [ ] **Implementation**: `PaymentTimerService`

### 5. Workflow Integration
- [ ] **Business Service**: `ADV`
- [ ] **Module Name**: `Advertisement`
- [ ] **Status Transitions**: Handled by `WorkflowIntegrator`
- [ ] **Actions**: Submit, Approve, Reject, etc.

---

## Kafka Topics & Message Flow

### 1. Persister Topics
- [ ] **save-advertisement-booking**: Save booking data to database
- [ ] **update-advertisement-booking**: Update booking data
- [ ] **create-draft-advertisement**: Create draft advertisement
- [ ] **update-draft-advertisement**: Update draft advertisement
- [ ] **delete-draft-advertisement**: Delete draft advertisement

### 2. Notification Topics
- [ ] **egov.core.notification.sms**: SMS notifications
- [ ] **egov.core.notification.email**: Email notifications
- [ ] **persist-user-events-async**: User event persistence

### 3. Payment Topics
- [ ] **egov.collection.payment-create**: Payment creation notifications
- [ ] **save-pg-txns**: Payment gateway transaction save
- [ ] **update-pg-txns**: Payment gateway transaction update

### 4. Consumer Configuration
- [ ] **Group ID**: `adv-services`
- [ ] **Auto Commit**: `true`
- [ ] **Auto Commit Interval**: `100ms`
- [ ] **Session Timeout**: `15000ms`
- [ ] **Auto Offset Reset**: `earliest`

### 5. Producer Configuration
- [ ] **Retries**: `0`
- [ ] **Batch Size**: `16384`
- [ ] **Linger MS**: `1`
- [ ] **Buffer Memory**: `33554432`

---

## Deployment Steps

### 1. Pre-Deployment
- [ ] **Stop Current Service**: Gracefully stop existing service instance
- [ ] **Backup Database**: Create full database backup
- [ ] **Backup Application**: Backup current application files
- [ ] **Verify Dependencies**: Ensure all external services are running

### 2. Database Migration
- [ ] **Run Flyway Migrations**: Execute database migration scripts
- [ ] **Verify Migration**: Check migration status and logs
- [ ] **Data Validation**: Verify data integrity after migration

### 3. Application Deployment
- [ ] **Deploy JAR File**: Copy new JAR file to production server
- [ ] **Update Configuration**: Update application.properties for production
- [ ] **Set Environment Variables**: Configure production environment variables
- [ ] **Set File Permissions**: Ensure proper file permissions

### 4. Service Startup
- [ ] **Start Service**: Start the advertisement service
- [ ] **Verify Startup**: Check application logs for successful startup
- [ ] **Health Check**: Verify service health endpoint
- [ ] **Port Binding**: Confirm service is listening on correct port

### 5. Load Balancer Configuration
- [ ] **Update Load Balancer**: Add new instance to load balancer
- [ ] **Health Check**: Configure load balancer health checks
- [ ] **Traffic Routing**: Verify traffic routing to new instance

---

## Post-Deployment Validation

### Functional Testing
- [ ] **API Endpoints**: Test all REST API endpoints
- [ ] **Database Operations**: Verify CRUD operations
- [ ] **Kafka Integration**: Test message publishing and consumption
- [ ] **External Service Integration**: Test integration with all external services
- [ ] **Authentication**: Verify user authentication and authorization
- [ ] **File Upload**: Test document upload functionality
- [ ] **Payment Integration**: Test payment processing
- [ ] **Notification**: Test SMS and email notifications

### Performance Testing
- [ ] **Response Time**: Verify API response times are within acceptable limits
- [ ] **Throughput**: Test service under expected load
- [ ] **Memory Usage**: Monitor memory consumption
- [ ] **Database Performance**: Verify database query performance
- [ ] **Kafka Performance**: Test message processing performance

### Business Logic Testing
- [ ] **Advertisement Booking**: Test complete booking workflow
- [ ] **Draft Management**: Test draft creation, update, and deletion
- [ ] **Payment Processing**: Test payment workflow
- [ ] **Workflow Integration**: Test business process workflows
- [ ] **Document Management**: Test document upload and retrieval
- [ ] **Notification Flow**: Test notification triggers and delivery
- [ ] **Demand Calculation**: Test fee calculation logic
- [ ] **Tax Calculation**: Test tax computation
- [ ] **Security Deposit**: Test refund calculations
- [ ] **Penalty Calculation**: Test penalty fee logic
- [ ] **Interest Calculation**: Test interest amount logic
- [ ] **Slot Availability**: Test slot booking conflicts
- [ ] **User Creation**: Test user management
- [ ] **Data Encryption**: Test PII data encryption/decryption
- [ ] **ID Generation**: Test booking number generation
- [ ] **Audit Trail**: Test audit logging

---

## Monitoring & Health Checks

### Application Monitoring
- [ ] **Log Monitoring**: Configure log aggregation and monitoring
- [ ] **Metrics Collection**: Set up application metrics collection
- [ ] **Error Tracking**: Configure error tracking and alerting
- [ ] **Performance Monitoring**: Set up performance monitoring

### Health Check Endpoints
- [ ] **Service Health**: `/adv-services/health`
- [ ] **Database Health**: Verify database connectivity
- [ ] **Kafka Health**: Verify Kafka connectivity
- [ ] **External Services**: Monitor external service connectivity
- [ ] **MDMS Health**: Verify MDMS service connectivity
- [ ] **Billing Service Health**: Verify billing service connectivity
- [ ] **User Service Health**: Verify user service connectivity
- [ ] **ID Generation Health**: Verify ID generation service connectivity
- [ ] **Workflow Health**: Verify workflow service connectivity
- [ ] **Localization Health**: Verify localization service connectivity
- [ ] **Encryption Health**: Verify encryption service connectivity
- [ ] **URL Shortener Health**: Verify URL shortener service connectivity
- [ ] **HRMS Health**: Verify HRMS service connectivity

### Alerting Configuration
- [ ] **Service Down**: Alert when service is not responding
- [ ] **High Error Rate**: Alert on high error rates
- [ ] **High Response Time**: Alert on slow response times
- [ ] **Database Issues**: Alert on database connectivity issues
- [ ] **Kafka Issues**: Alert on Kafka connectivity issues
- [ ] **External Service Issues**: Alert on external service failures
- [ ] **MDMS Data Issues**: Alert on MDMS data unavailability
- [ ] **Billing Service Issues**: Alert on billing service failures
- [ ] **User Service Issues**: Alert on user service failures
- [ ] **ID Generation Issues**: Alert on ID generation failures
- [ ] **Workflow Issues**: Alert on workflow service failures
- [ ] **Payment Timer Issues**: Alert on payment timer failures
- [ ] **Encryption Issues**: Alert on encryption/decryption failures
- [ ] **Notification Issues**: Alert on notification delivery failures
- [ ] **Demand Calculation Issues**: Alert on calculation errors
- [ ] **Tax Calculation Issues**: Alert on tax computation errors

### Log Management
- [ ] **Log Level**: Set appropriate log level for production
- [ ] **Log Rotation**: Configure log rotation
- [ ] **Log Aggregation**: Set up centralized log collection
- [ ] **Log Analysis**: Configure log analysis and alerting

---

## Rollback Procedures

### Immediate Rollback (Service Only)
- [ ] **Stop New Service**: Stop the newly deployed service
- [ ] **Start Previous Service**: Start the previous version
- [ ] **Verify Rollback**: Confirm service is working correctly
- [ ] **Update Load Balancer**: Remove new instance from load balancer

### Database Rollback (If Required)
- [ ] **Stop Service**: Stop the advertisement service
- [ ] **Restore Database**: Restore database from backup
- [ ] **Verify Data**: Verify data integrity after restore
- [ ] **Start Service**: Start the previous service version

### Complete Rollback
- [ ] **Stop All Services**: Stop all related services
- [ ] **Restore Database**: Restore complete database backup
- [ ] **Restore Application**: Restore previous application version
- [ ] **Start Services**: Start all services in correct order
- [ ] **Verify System**: Verify complete system functionality

---

## Troubleshooting Guide

### Common Issues

#### Service Won't Start
- [ ] **Check Logs**: Review application startup logs
- [ ] **Verify Configuration**: Check application.properties
- [ ] **Check Dependencies**: Verify all external services are running
- [ ] **Check Port**: Ensure port 8561 is available
- [ ] **Check Java Version**: Verify correct Java version
- [ ] **Check Memory**: Verify sufficient memory allocation
- [ ] **Check Disk Space**: Verify sufficient disk space

#### Database Connection Issues
- [ ] **Check Database**: Verify PostgreSQL is running
- [ ] **Check Credentials**: Verify database credentials
- [ ] **Check Network**: Verify network connectivity
- [ ] **Check Firewall**: Verify firewall rules
- [ ] **Check Migration**: Verify Flyway migrations completed
- [ ] **Check Tables**: Verify all required tables exist
- [ ] **Check Sequences**: Verify sequences are created

#### Kafka Connection Issues
- [ ] **Check Kafka**: Verify Kafka is running
- [ ] **Check Topics**: Verify required topics exist
- [ ] **Check Configuration**: Verify Kafka configuration
- [ ] **Check Network**: Verify network connectivity
- [ ] **Check Consumer Group**: Verify consumer group configuration
- [ ] **Check Producer Config**: Verify producer configuration

#### External Service Issues
- [ ] **Check Service Status**: Verify external service is running
- [ ] **Check URLs**: Verify service URLs are correct
- [ ] **Check Authentication**: Verify authentication credentials
- [ ] **Check Network**: Verify network connectivity
- [ ] **Check SSL Certificates**: Verify SSL certificates if using HTTPS
- [ ] **Check Timeout Settings**: Verify timeout configurations

#### MDMS Data Issues
- [ ] **Check MDMS Service**: Verify MDMS service is running
- [ ] **Check Master Data**: Verify all required master data is present
- [ ] **Check Module Configuration**: Verify Advertisement module is configured
- [ ] **Check Tenant Data**: Verify tenant-specific data is available
- [ ] **Check Data Format**: Verify master data format is correct

#### Billing Service Issues
- [ ] **Check Billing Service**: Verify billing service is running
- [ ] **Check Business Service**: Verify 'adv-services' business service is configured
- [ ] **Check Tax Heads**: Verify tax heads are configured
- [ ] **Check Tax Periods**: Verify tax periods are configured
- [ ] **Check Demand Creation**: Verify demand creation is working

#### User Service Issues
- [ ] **Check User Service**: Verify user service is running
- [ ] **Check Role Configuration**: Verify CITIZEN role is available
- [ ] **Check User Creation**: Verify user creation is working
- [ ] **Check User Search**: Verify user search is working
- [ ] **Check User Update**: Verify user update is working

#### ID Generation Issues
- [ ] **Check ID Generation Service**: Verify ID generation service is running
- [ ] **Check ID Format**: Verify ID format is configured correctly
- [ ] **Check Sequence**: Verify sequence is created and working
- [ ] **Check ID Generation**: Verify ID generation is working

#### Workflow Issues
- [ ] **Check Workflow Service**: Verify workflow service is running
- [ ] **Check Business Service**: Verify 'ADV' business service is configured
- [ ] **Check Workflow States**: Verify workflow states are configured
- [ ] **Check Workflow Actions**: Verify workflow actions are configured

#### Calculation Issues
- [ ] **Check Fee Calculation**: Verify fee calculation logic
- [ ] **Check Tax Calculation**: Verify tax calculation logic
- [ ] **Check Additional Fees**: Verify additional fee calculations
- [ ] **Check Refund Logic**: Verify security deposit refund logic

#### Notification Issues
- [ ] **Check Notification Service**: Verify notification service is running
- [ ] **Check SMS Configuration**: Verify SMS configuration
- [ ] **Check Email Configuration**: Verify email configuration
- [ ] **Check Notification Templates**: Verify notification templates
- [ ] **Check Kafka Topics**: Verify notification topics exist

#### Encryption Issues
- [ ] **Check Encryption Service**: Verify encryption service is running
- [ ] **Check Encryption Keys**: Verify encryption keys are configured
- [ ] **Check PII Data**: Verify PII data encryption/decryption
- [ ] **Check ABAC Configuration**: Verify ABAC configuration

### Performance Issues
- [ ] **Check Memory**: Monitor memory usage
- [ ] **Check CPU**: Monitor CPU usage
- [ ] **Check Database**: Monitor database performance
- [ ] **Check Network**: Monitor network latency
- [ ] **Check Logs**: Review application logs for errors

### Log Analysis
- [ ] **Error Logs**: Review error logs for issues
- [ ] **Performance Logs**: Review performance logs
- [ ] **Access Logs**: Review access logs for patterns
- [ ] **Kafka Logs**: Review Kafka consumer/producer logs

---

## Maintenance & Updates

### Regular Maintenance Tasks
- [ ] **Log Cleanup**: Regular log file cleanup
- [ ] **Database Maintenance**: Regular database maintenance
- [ ] **Security Updates**: Apply security patches
- [ ] **Performance Monitoring**: Regular performance reviews
- [ ] **Backup Verification**: Verify backup integrity

### Update Procedures
- [ ] **Code Updates**: Follow standard deployment procedures
- [ ] **Configuration Updates**: Update configuration files
- [ ] **Database Updates**: Run database migrations
- [ ] **Dependency Updates**: Update external dependencies
- [ ] **Documentation Updates**: Update this runbook

### Monitoring & Reporting
- [ ] **Daily Health Checks**: Daily service health verification
- [ ] **Weekly Performance Review**: Weekly performance analysis
- [ ] **Monthly Security Review**: Monthly security assessment
- [ ] **Quarterly Capacity Planning**: Quarterly capacity assessment

---

## Contact Information

### Team Contacts
- **Development Team**: [Development Team Contact]
- **DevOps Team**: [DevOps Team Contact]
- **Database Team**: [Database Team Contact]
- **Infrastructure Team**: [Infrastructure Team Contact]

### Escalation Procedures
1. **Level 1**: Development Team
2. **Level 2**: DevOps Team Lead
3. **Level 3**: Technical Manager
4. **Level 4**: Project Manager

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| [Date] | 1.0.0 | Initial runbook creation | [Author] |
| [Date] | 1.0.1 | Updated configuration details | [Author] |
| [Date] | 1.0.2 | Added troubleshooting section | [Author] |

---

## Appendix

### A. Configuration Templates
- [ ] **application.properties template**
- [ ] **Docker configuration template**
- [ ] **Kubernetes configuration template**
- [ ] **MDMS master data templates**
- [ ] **Kafka topic configuration templates**
- [ ] **Database migration templates**

### B. Scripts
- [ ] **Deployment script**
- [ ] **Health check script**
- [ ] **Backup script**
- [ ] **Rollback script**
- [ ] **MDMS data validation script**
- [ ] **Database migration script**
- [ ] **Kafka topic creation script**
- [ ] **Service dependency check script**

### C. Documentation Links
- [ ] **API Documentation**
- [ ] **Database Schema Documentation**
- [ ] **External Service Documentation**
- [ ] **Monitoring Dashboard Links**
- [ ] **MDMS Master Data Documentation**
- [ ] **Business Logic Documentation**
- [ ] **Calculation Logic Documentation**
- [ ] **Workflow Documentation**

### D. Master Data Configuration
- [ ] **Advertisement Module Master Data**
- [ ] **BillingService Module Master Data**
- [ ] **Common-Masters Module Configuration**
- [ ] **Tax Head Master Configuration**
- [ ] **Fee Calculation Configuration**
- [ ] **Workflow Configuration**

### E. Service Dependencies
- [ ] **MDMS Service Configuration**
- [ ] **Billing Service Configuration**
- [ ] **User Service Configuration**
- [ ] **ID Generation Service Configuration**
- [ ] **Workflow Service Configuration**
- [ ] **Localization Service Configuration**
- [ ] **Encryption Service Configuration**
- [ ] **URL Shortener Service Configuration**
- [ ] **HRMS Service Configuration**

### F. Business Logic
- [ ] **Demand Calculation Logic**
- [ ] **Tax Calculation Logic**
- [ ] **Fee Calculation Logic**
- [ ] **Security Deposit Refund Logic**
- [ ] **Penalty Calculation Logic**
- [ ] **Interest Calculation Logic**
- [ ] **Payment Timer Logic**
- [ ] **Workflow Integration Logic**

---

**Note**: This runbook should be reviewed and updated regularly to reflect any changes in the service configuration, dependencies, or deployment procedures. All team members should be familiar with this document and trained on the procedures outlined herein.
