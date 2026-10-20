# Portfolio · Ivonne Falleau

Portfolio bilingüe con React 19 + TypeScript y API Python/Django. Proyecto local en el escritorio; rama de trabajo `develop`, rama `QA` y rama `main`. La publicación remota se hace después de revisar el contenido.

## Arranque en Windows

Requisitos: Python 3.12+, Node 20.19+ y Git. Desde esta carpeta:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements-dev.txt
cd frontend
npm ci
cd ..
Copy-Item backend/.env.example backend/.env
# Cambiar SECRET_KEY por un secreto aleatorio local. No versionar .env.
.\.venv\Scripts\python.exe backend/manage.py migrate
.\.venv\Scripts\python.exe backend/manage.py seed_portfolio
.\.venv\Scripts\python.exe backend/manage.py create_portfolio_admin
.\.venv\Scripts\python.exe backend/manage.py generate_cv
```

La instalación realizada ya tiene `.venv`, dependencias, una clave local aleatoria, migraciones, SQLite y datos iniciales. **Falta que definas tu contraseña** ejecutando `create_portfolio_admin`: pide y confirma la clave sin mostrarla. No hay registro público ni claves por defecto. La cuenta utiliza el email `ADMIN_EMAIL` de `backend/.env`.

Terminal 1 (raíz):

```powershell
.\.venv\Scripts\python.exe backend/manage.py runserver 127.0.0.1:8000
```

Terminal 2:

```powershell
cd frontend
npm run dev
```

Abrir **http://127.0.0.1:5173**. Panel: **http://127.0.0.1:5173/admin**. Usar siempre el mismo host (127.0.0.1 o localhost) para las cookies. Vite reenvía `/api` y `/media` a Django; no se necesita CORS abierto.

## Contenido

- Inicio, proyectos, filtros compartibles por URL, casos de estudio, sobre mí, CV, contacto y 404.
- Modo oscuro/claro e idioma ES/EN persistidos en el navegador. Textos de interfaz en `frontend/public/locales`; contenido bilingüe en JSON de PostgreSQL.
- Perfil, experiencia, formación, idiomas y habilidades se guardan en la base. El panel los edita, incluidos los datos del CV; los campos estructurados tienen editor JSON con validación.
- Cuatro casos extraídos del CV, **todos en borrador**, y 41 tecnologías. No se inventaron demos, repositorios, métricas ni capturas. Revisar el estado de la diplomatura UNSTA antes de publicar el CV.
- Contacto con validación, CSRF, límite de envíos y honeypot. Los mensajes se guardan en la base; el email de aviso se activa al configurar SMTP. Un fallo de SMTP no elimina el mensaje.
- Panel: proyectos, tecnologías, perfil/CV, mensajes, portadas, galerías con texto alternativo y repositorios públicos de GitHub.
- Importación de GitHub desde el usuario de la URL de Perfil, con paginación. Importa **como borrador**, evita duplicados y verifica el identificador contra GitHub. El token opcional vive solo en Django.
- Para publicar un proyecto, completar contenido ES/EN y seleccionar 3–6 tecnologías. Las portadas se suben después de guardar el proyecto: JPEG, PNG o WebP hasta 5 MB.

## El asistente

La versión inicial es un **buscador guiado**, sin modelo generativo, API de pago ni envío de datos a terceros. Detecta tecnologías, busca exclusivamente en proyectos publicados y muestra enlaces con resumen y resultado. También orienta al CV y al contacto. Con los cuatro borradores iniciales no afirmará que existan proyectos públicos con Python.

Para una segunda versión recomiendo búsqueda híbrida + un LLM opcional, consultado desde Django. Se debe conservar el filtro `published`, citar cada caso, limitar las respuestas al contenido recuperado y mostrar una respuesta de “no tengo información” cuando falte evidencia. Nunca incluir mensajes de contacto ni borradores en el índice. La implementación actual está aislada en `backend/apps/assistant/services.py` para poder sustituirla sin cambiar las páginas.

## CV y PDF

Los botones de `/cv` descargan PDF generados por Django **con los datos actuales del perfil**. Imprimir también refleja los datos actuales. Los dos archivos A4 de `frontend/public/cv/` son instantáneas ES/EN de dos páginas. Para regenerarlas:

```powershell
cd frontend
npm run cv:pdf
# También: pnpm cv:pdf, si usás pnpm.
```

El script no requiere un servidor abierto: lee la base configurada y llama al generador Python. El encabezado y contenido proceden de la base. Los datos iniciales se basan en el CV proporcionado; Inglés B1 según la solicitud. No se asumió que los trabajos corporativos tengan repositorios públicos.

## Neon, RLS y archivos

Por tu elección, el proyecto corre localmente con **SQLite**. No se creó ni conectó una cuenta de Neon. Para activarlo, ver `docs/neon.md`.

Neon aporta PostgreSQL. Esta arquitectura usa **Django Auth** (sesiones HttpOnly, CSRF y email/clave), permisos de staff y RLS de PostgreSQL. Los archivos usan almacenamiento local persistente o un servicio compatible con S3 mediante `django-storages`. No usa Enter Cloud ni Supabase, ni supone que las interfaces de autenticación o buckets de otro proveedor existan en Neon.

Las migraciones habilitan y fuerzan RLS en las tablas públicas, relaciones y galería de proyectos. El middleware fija `app.is_admin` dentro de cada transacción; el rol se limpia al terminar y es compatible con pooling. No hay conexión directa a la base desde React. Las políticas de RLS requieren un rol de ejecución sin SUPERUSER/BYPASSRLS; verificación: `manage.py check_database_role`. **RLS está implementado, pero aún no se verificó contra un PostgreSQL real.** SQLite no ejecuta esas políticas; los permisos de API sí se prueban localmente.

Los archivos locales de desarrollo viven en `backend/media/` (ignorado por Git). Producción debe usar un volumen persistente o S3 con lectura pública de los recursos elegidos y credenciales privadas del backend. No hay recursos cloud provisionados.

## Verificación

```powershell
.\.venv\Scripts\python.exe backend/manage.py check
.\.venv\Scripts\python.exe backend/manage.py test apps.projects
cd frontend
npm run build
npm audit
npm run test:e2e
```

Las pruebas de navegador usan Chrome instalado y levantan sus propios servidores en 5174/8001. Crean una base independiente en `tmp/e2e.sqlite3` y una contraseña aleatoria en memoria; **no modifican tu base local ni tu cuenta administradora**. Para CI Linux, instalar Chrome mediante Playwright (ver workflow). `config.e2e` es exclusivamente para pruebas, nunca producción.

## Git y publicación

Trabajar sobre `develop`. Promover cambios a `QA` después de las pruebas y a `main` al aprobar una entrega. Las ramas son locales hasta crear el repositorio remoto.

```powershell
git switch develop
# Crear un repositorio vacío portfolio-ivonne en GitHub, sin README adicional.
git remote add origin https://github.com/F4lleau/portfolio-ivonne.git
git push -u origin develop
git push origin QA main
```

Publicar en GitHub comparte el código; **no publica Django ni conecta Neon**. Para un sitio en LinkedIn hace falta un despliegue HTTPS (y configurar el dominio y la imagen social en `index.html`). `docs/deployment.md` explica el contenedor y los servicios. El CV y los datos de contacto incluidos serán públicos cuando publiques el código; `.env`, mensajes, SQLite, portadas subidas y cuentas no se suben.

## Estructura

- `frontend/src/pages/<módulo>/`: página, ruta, servicio y hooks. About/CV reutilizan el servicio central de perfil; detalle reutiliza proyectos.
- `frontend/src/pages/admin/`: panel, formularios y servicios de administración.
- `frontend/src/components/`: layout, portfolio y componentes shadcn/ui locales (Button, Badge, Card).
- `frontend/src/lib/`: cliente HTTP, esquemas Zod, tema/idioma y utilidades.
- `backend/apps/`: módulos de perfiles, proyectos, tecnologías, contacto, autenticación, GitHub y asistente.
- `backend/seed_data.json`: datos iniciales; el seed es idempotente y no sobrescribe cambios del panel.
- `docs/`: Neon y despliegue. `CodeGuideline.md`: reglas de arquitectura.
