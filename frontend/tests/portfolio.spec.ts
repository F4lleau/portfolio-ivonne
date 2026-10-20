import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
mkdirSync('../tmp/screenshots', { recursive: true });
test('public navigation, languages, theme, URL filters and assistant', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Ivonne Falleau.' })).toBeVisible();
  await page.screenshot({ path: '../tmp/screenshots/home-dark.png', fullPage: true });
  await page.getByLabel('Idioma').selectOption('en');
  await expect(page.getByRole('link', { name: 'View projects', exact: true })).toBeVisible();
  await page.getByLabel('Toggle light/dark theme').click();
  await expect(page.locator('html')).not.toHaveClass('dark');
  await page.screenshot({ path: '../tmp/screenshots/home-light.png', fullPage: true });
  await page.getByRole('link', { name: 'View projects', exact: true }).click();
  await page.getByLabel('Technologies', { exact: true }).selectOption({ label: 'Python' });
  await expect(page).toHaveURL(/tech=python/);
  await page.reload();
  await expect(page.getByLabel('Technologies', { exact: true })).toHaveValue('python');
  await page.goto('/cv');
  await expect(page.locator('.cv-document')).toContainText('BDO');
  await expect(page.locator('.cv-document')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  const pdf = await page.request.get('/api/cv/en/');
  expect(pdf.headers()['content-type']).toContain('application/pdf');
  expect((await pdf.body()).subarray(0, 4).toString()).toBe('%PDF');
  await page.getByRole('button', { name: 'Portfolio assistant', exact: true }).click();
  await page.getByRole('button', { name: 'Any projects with Python?' }).click();
  await expect(page.locator('.bot-messages')).toContainText('No matching published projects yet');
  expect(errors).toEqual([]);
});
test('contact persists, admin reads it and private routes require login', async ({ page }) => {
  await page.goto('/admin/messages');
  await expect(page).toHaveURL(/admin\/login/);
  await page.goto('/contact');
  await page.getByLabel('Nombre', { exact: true }).fill('E2E Portfolio Visitor');
  await page.getByLabel('Email', { exact: true }).fill('portfolio-test@example.com');
  await page
    .getByLabel('Contame tu idea')
    .fill('Consulta de prueba para verificar que el mensaje se guarde.');
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();
  await expect(page.getByRole('status')).toContainText('Tu mensaje quedó guardado');
  await page.goto('/admin/login');
  await page.getByLabel('Email', { exact: true }).fill('ivonnefalleau@gmail.com');
  await page.getByLabel('Contraseña').fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible();
  await page.getByRole('link', { name: 'Mensajes', exact: true }).click();
  await expect(page.locator('.message-card').first()).toContainText('E2E Portfolio Visitor');
  await page.getByRole('button', { name: 'Marcar leído' }).first().click();
  await expect(page.getByRole('button', { name: 'Marcar sin leer' }).first()).toBeVisible();
  await page.screenshot({ path: '../tmp/screenshots/admin-messages.png', fullPage: true });
  await page.getByRole('link', { name: 'Proyectos', exact: true }).last().click();
  await expect(page.locator('.admin-list-row')).toHaveCount(4);
  await page.locator('.admin-list-row').first().getByRole('link', { name: 'Editar' }).click();
  await expect(page.getByLabel('Slug', { exact: true })).toHaveValue('plataforma-ia');
  await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Cambios guardados');
});
test('mobile layout, navigation and keyboard access', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Ivonne Falleau.' })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy();
  await page.screenshot({ path: '../tmp/screenshots/home-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.getByRole('link', { name: 'Sobre mí', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tecnología con mirada humana.' })).toBeVisible();
  await page.goto('/missing');
  await expect(page.getByRole('heading', { name: 'Esta página todavía no existe.' })).toBeVisible();
});
