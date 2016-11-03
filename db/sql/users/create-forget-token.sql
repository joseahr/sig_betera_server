INSERT INTO public.users_change_password_token
VALUES ('${id_user#}') 
ON CONFLICT ON CONSTRAINT pk_u_change_psswd_tkn DO UPDATE 
SET token = md5(random()::text)
RETURNING token