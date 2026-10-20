# Despliegue después de la revisión local

La API requiere un host que ejecute Python (contenedor o servicio compatible). El frontend necesita servir Vite dist y reenviar /api al backend. GitHub Pages por sí solo no ejecuta Django ni almacena los mensajes.

Se incluye Docker Compose con nginx y Gunicorn. Configurar `backend/.env` con `DEBUG=false`, un SECRET_KEY aleatorio, DATABASE_URL de Neon con rol restringido, ALLOWED_HOSTS y CSRF_TRUSTED_ORIGINS=https://tu-dominio. Configurar TLS en el proxy de entrada. Activar TRUST_PROXY_HEADERS=true solamente detrás de un proxy TLS confiable que sobrescriba X-Forwarded-Proto y bloquee el acceso directo a nginx. El nginx incluido conserva ese esquema hacia Django. Sin proxy TLS todavía, mantener DEBUG=true solo en local para probar HTTP; producción exige HTTPS.

```sh
docker compose build
docker compose run --rm backend python manage.py migrate
docker compose run --rm backend python manage.py seed_portfolio
docker compose run --rm backend python manage.py create_portfolio_admin
docker compose run --rm backend python manage.py collectstatic --noinput
docker compose up -d
```

Para migrar con propietario y ejecutar con rol restringido, seguir docs/neon.md antes de arrancar el servicio. No usar config.e2e. No usar SQLite en una instalación pública con varios workers.

Los contenedores están preparados; no fueron ejecutados en esta entrega. El puerto de nginx es 8080 y debe estar detrás de HTTPS. nginx sirve los archivos locales desde volúmenes persistentes. Alternativamente configurar las variables AWS_* para S3 compatible: bucket público solo para portadas/fotos, claves privadas de escritura solo en Django. La existencia de la base Neon no crea almacenamiento de archivos automáticamente.

Configurar SMTP para los avisos de contacto. Con varios workers usar caché compartida para throttling y limitación adicional en el proxy. Revisar `manage.py check --deploy` con la configuración real. Hacer backup de PostgreSQL y archivos.

Para LinkedIn, reemplazar el dominio de ejemplo por el dominio real y generar una imagen PNG 1200×630 para `og:image` (la referencia SVG local no tiene compatibilidad universal en redes). Añadir URL absoluta a og:image, og:url y canonical. No se anuncia una URL pública hasta completar el despliegue HTTPS.
