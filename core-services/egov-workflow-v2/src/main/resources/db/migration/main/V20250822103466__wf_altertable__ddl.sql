ALTER TABLE IF EXISTS public.eg_wf_assignee_v2
    ADD COLUMN IF NOT EXISTS is_current boolean DEFAULT true;