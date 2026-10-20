# Conectar Neon cuando tengas la cuenta

1. Crear un proyecto PostgreSQL en Neon y conservar la URL del propietario solo para migraciones. No pegar credenciales en chats ni versionarlas.
2. Ejecutar las migraciones con esa URL, usando una variable temporal o una configuración local privada. El archivo `backend/.env` tiene prioridad; no dejar allí la URL del propietario al servir la aplicación.
3. Crear desde el SQL editor un rol `portfolio_app` con LOGIN, sin SUPERUSER ni BYPASSRLS. Definir su contraseña en Neon; el siguiente SQL omite intencionalmente toda contraseña:

```sql
CREATE ROLE portfolio_app LOGIN NOSUPERUSER NOBYPASSRLS;
GRANT CONNECT ON DATABASE neondb TO portfolio_app;
GRANT USAGE ON SCHEMA public TO portfolio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO portfolio_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO portfolio_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO portfolio_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO portfolio_app;
```

Cambiar `neondb` si la base tiene otro nombre. La aplicación necesita tablas de sesiones y autenticación; el acceso de visitantes pasa exclusivamente por Django, nunca por SQL público. Mantener esa credencial solo en el servidor.

4. Poner la URL del rol restringido en `DATABASE_URL` de `backend/.env`, con `sslmode=require`; puede usarse el hostname `-pooler`. Crear un secreto propio, hosts y orígenes válidos. No añadir prefijo VITE a ningún secreto.
5. Ejecutar `check_database_role`, `seed_portfolio` y `create_portfolio_admin`. El seed establece `app.is_admin=true` dentro de una transacción y no pisa cambios existentes.
6. Comprobar manualmente RLS con el rol restringido:

```sql
BEGIN;
SELECT set_config('app.is_admin', 'false', true);
SELECT * FROM projects_project WHERE published = false; -- cero filas
SELECT * FROM contact_contactmessage; -- cero filas
SELECT set_config('app.is_admin', 'true', true);
SELECT count(*) FROM projects_project; -- incluye borradores
ROLLBACK;
```

También probar INSERT/UPDATE/DELETE anónimos y las relaciones de tecnologías. Una conexión con `neondb_owner`, SUPERUSER o BYPASSRLS no verifica el aislamiento real. `check_database_role` debe fallar con esos roles.

7. Tras cada migración hecha por el propietario, comprobar grants y políticas. Los entornos develop y QA deben tener bases o branches de Neon separadas; los nombres de las ramas Git no crean ramas en Neon automáticamente.

RLS está escrita en migraciones, pero no se ejecuta en SQLite. Esta entrega local no incluye cuenta Neon, buckets cloud, proveedor de email ni recursos pagos.
