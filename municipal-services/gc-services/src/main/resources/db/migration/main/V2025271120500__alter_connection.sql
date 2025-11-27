
ALTER TABLE eg_gc_connection
    ADD COLUMN property_type VARCHAR(64),
    ADD COLUMN plot_size VARCHAR(64),
    ADD COLUMN location VARCHAR(256),
    ADD COLUMN frequency_of_garbage_collection VARCHAR(64),
    ADD COLUMN type_of_waste VARCHAR(64)



ALTER TABLE public.eg_gc_connection_audit
    ADD COLUMN property_type VARCHAR(64),
    ADD COLUMN plot_size VARCHAR(64),
    ADD COLUMN location VARCHAR(256),
    ADD COLUMN frequency_of_garbage_collection VARCHAR(64),
    ADD COLUMN type_of_waste VARCHAR(64);
