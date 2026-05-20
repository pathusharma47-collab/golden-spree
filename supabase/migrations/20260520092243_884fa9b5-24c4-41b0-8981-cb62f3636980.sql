
REVOKE EXECUTE ON FUNCTION public.process_investment(text, numeric, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.process_withdrawal(numeric, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
