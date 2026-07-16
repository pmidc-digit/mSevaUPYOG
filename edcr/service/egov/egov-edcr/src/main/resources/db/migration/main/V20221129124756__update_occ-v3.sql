-- inactive the un-used occ in db
UPDATE egbpa_occupancy SET isactive=false where code in ('C','J','K','M');