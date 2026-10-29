-- One-time PostgreSQL setup for the Task Manager application.
-- Run as a superuser (e.g. the "postgres" user):
--   psql -U postgres -f database/setup.sql
--
-- Tables are NOT created here: the API applies EF Core migrations and seeds sample data on startup.
-- If you change the password below, update ConnectionStrings:DefaultConnection in
-- backend/TaskManager.Api/appsettings.json (or set it via environment variable / user-secrets).

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'taskmanager_user') THEN
        CREATE ROLE taskmanager_user WITH LOGIN PASSWORD 'taskmanager_pass';
    END IF;
END
$$;

SELECT 'CREATE DATABASE taskmanager OWNER taskmanager_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'taskmanager')\gexec

GRANT ALL PRIVILEGES ON DATABASE taskmanager TO taskmanager_user;
