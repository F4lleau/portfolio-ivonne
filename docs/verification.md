# Verificación local · 19 de octubre de 2026

- Django system check: sin incidencias.
- Migraciones: aplicadas en SQLite; makemigrations --check --dry-run sin cambios pendientes.
- Django: 21 pruebas aprobadas, incluyendo permisos, CSRF, login, borradores, filtros, mensajes, CV actualizado, importación GitHub idempotente y galería protegida.
- Playwright + Chrome: 3 pruebas aprobadas. Verifican navegación, idioma, tema, filtros persistidos en URL, PDF, asistente, contacto guardado, lectura desde admin, edición de proyecto y responsive móvil sin desborde horizontal.
- TypeScript + Vite: build de producción aprobado, con bundles separados para React, datos y animación.
- npm audit: cero vulnerabilidades reportadas en dependencias instaladas.
- pip check: sin dependencias incompatibles.
- PDF ES/EN: dos páginas A4 cada uno, renderizados e inspeccionados visualmente.
- Fuente: formateada con Prettier y Black.

## Límites de esta verificación

Se utilizó SQLite por decisión de la usuaria. Las migraciones de RLS están escritas para PostgreSQL, pero no se verificaron en Neon ni en otro PostgreSQL. La importación de GitHub tiene pruebas con respuestas controladas; la disponibilidad real depende de GitHub y sus límites de API. No se configuró SMTP ni almacenamiento cloud. Docker/Compose y CI están preparados, pero no se ejecutaron en servicios remotos.

Los servidores de prueba usan una base aislada y una contraseña aleatoria de pruebas. La base local real no incluye cuenta admin hasta que la usuaria ejecute create_portfolio_admin. No se creó un repositorio remoto, un despliegue web ni una cuenta Neon. La publicación en GitHub queda para la etapa siguiente solicitada.
