CREATE UNIQUE INDEX IF NOT EXISTS uq_adv_timer_active_slot
ON eg_adv_payment_timer (advertisementId, booking_date, add_type, location, face_area, night_light)
WHERE status = 'ACTIVE';
