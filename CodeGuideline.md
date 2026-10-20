# Guía de arquitectura

## Frontend

React 19 + TypeScript estricto, Vite, Tailwind 4 con configuración TypeScript, componentes locales estilo shadcn/ui, Framer Motion, React Router 7, TanStack Query y Zod.

Cada módulo en `src/pages` expone `index.tsx`, `route.tsx`, `service.ts` y `hooks.ts`. Un servicio compartido se reexporta, no se duplica. El detalle utiliza los hooks de proyectos y About/CV utilizan perfil. Administración agrupa sus subrutas, formularios y hooks de mutación.

Las páginas llaman hooks; los servicios utilizan `src/lib/api.ts`. Nunca importar clientes PostgreSQL ni secretos en React. Las mutaciones invalidan las consultas para actualizar header, footer, CV y contenido. Validar entradas con Zod y nuevamente en el servidor.

Usar tokens HSL semánticos en `index.css`, las variantes Button/Badge/Card y foco visible. Excepción intencional: el CV usa una paleta de impresión fija y siempre clara. No usar localStorage para autenticación ni para mensajes: solo idioma y tema. Las animaciones respetan preferencias de movimiento reducido.

Claves de interfaz planas en `public/locales/es.json` (canónica) y `en.json`. Todo contenido editorial del perfil y proyectos tiene `{es,en}`. Los identificadores de categorías y tecnologías permanecen técnicos. No inventar logros, enlaces ni fechas.

## Backend

Django 5.2 LTS + DRF. Los módulos se separan en modelos, serializers, services, views, urls y migrations cuando aplican. Servicios transversales en `apps/core`. El CV se genera a partir del modelo SiteProfile. GitHub y bot no necesitan tablas propias.

Lectura pública limitada a perfil principal, tecnologías y proyectos publicados. Escritura, cargas de archivos y lectura de mensajes solo para staff. Registro público deshabilitado; administrador inicial por comando con entrada oculta. Login por email normalizado y contraseña; cookies de sesión HttpOnly y CSRF obligatorio incluso en POST anónimos. No agregar autenticación básica o tokens en localStorage.

RLS añade defensa en PostgreSQL: las políticas viven en una migración reversible y `DatabaseRoleMiddleware` fija el contexto con SET LOCAL en una transacción. No cambiarlo por variables de sesión persistentes, especialmente con Neon pooling. Nunca usar un rol BYPASSRLS como credencial de runtime. Los comandos de seed establecen explícitamente contexto administrador.

Los mensajes se guardan antes del aviso de email; SMTP es opcional. El rate limit actual usa caché local por proceso: producción con múltiples workers necesita caché compartida y rate limit en el proxy. Las cargas son imágenes con formato y extensión permitidos y límite de tamaño.

Las dependencias Python están fijadas en requirements.txt; las herramientas de PDF y pruebas en requirements-dev.txt. El lockfile de npm se versiona. No versionar .env, bases locales, datos de mensajes, media o entornos virtuales.

## Ramas y validación

`develop` para trabajo, `QA` para validar y `main` para entregas. Ejecutar tests Django, build TypeScript/Vite y pruebas de navegador cuando se cambian flujos. Las pruebas e2e usan base/cuenta independientes. RLS requiere verificación adicional en PostgreSQL con un rol restringido. Revisar ambos PDF renderizados al cambiar su layout.
