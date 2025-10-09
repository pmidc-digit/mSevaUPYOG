ALTER TABLE eg_chb_booking_detail
    ADD COLUMN community_hall_name character varying(64);


ALTER TABLE eg_chb_booking_detail_audit
    ADD COLUMN community_hall_name character varying(64);

-- ALTER TABLE eg_chb_booking_detail_init
--     ADD COLUMN community_hall_name character varying(64);