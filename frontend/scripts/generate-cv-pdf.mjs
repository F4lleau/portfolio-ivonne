import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../../', import.meta.url));
const python =
  process.env.PYTHON ||
  resolve(root, process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python');
const result = spawnSync(python, ['manage.py', 'generate_cv'], {
  cwd: resolve(root, 'backend'),
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
