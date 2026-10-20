import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const python =
  process.env.PYTHON ||
  resolve(root, process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python');
const cwd = resolve(root, 'backend');
mkdirSync(resolve(root, 'tmp'), { recursive: true });
for (const args of [
  ['migrate'],
  ['flush', '--noinput'],
  ['seed_portfolio'],
  [
    'shell',
    '-c',
    "import os; from django.contrib.auth import get_user_model; from django.conf import settings; u,_=get_user_model().objects.get_or_create(username=settings.ADMIN_EMAIL,defaults={'email':settings.ADMIN_EMAIL}); u.is_staff=True; u.is_superuser=True; u.set_password(os.environ['E2E_ADMIN_PASSWORD']); u.save()",
  ],
]) {
  const r = spawnSync(python, ['manage.py', ...args, '--settings=config.e2e'], {
    cwd,
    stdio: 'inherit',
  });
  if (r.status !== 0) process.exit(r.status || 1);
}
const server = spawn(
  python,
  ['manage.py', 'runserver', '127.0.0.1:8001', '--noreload', '--settings=config.e2e'],
  { cwd, stdio: 'inherit' },
);
process.on('SIGTERM', () => server.kill());
process.on('SIGINT', () => server.kill());
server.on('exit', (code) => process.exit(code || 0));
