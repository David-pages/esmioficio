import { test, expect } from '@playwright/test';

test.describe('Funcionalidad principal y enrutamiento', () => {

  test('La página principal carga correctamente', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EsMiOficio/);
    await expect(page.locator('h1', { hasText: 'Encuentra profesionales confiables' })).toBeVisible();
  });

  test('La búsqueda interactúa con la URL a través de Search Params', async ({ page }) => {
    await page.goto('/');
    
    // Fill the search query input
    const searchInput = page.getByPlaceholder('Que necesitas? Plomero, albanil, electricista...');
    await searchInput.fill('Plomeria');

    // Select the state
    const selectState = page.locator('select').first();
    await selectState.selectOption({ label: 'Ciudad de México' });

    // Click Buscar
    await page.getByRole('button', { name: 'Buscar profesional' }).first().click();

    await expect(page).toHaveURL(/\/buscar\?q=Plomeria.*&state=cdmx.*$/);

    // Verify Search Results reflect the search state
    await expect(page.locator('h2', { hasText: 'Encuentra profesionales en Ciudad de México' })).toBeVisible();

    // Go back with standard browser API
    await page.goBack();
    await expect(page).toHaveURL(/.*\/$/);
  });

  test('La navegación por categorías muestra profesionales', async ({ page }) => {
    await page.goto('/');
    
    // Haz clic en "Albañil"
    await page.getByText('Albañil', { exact: true }).first().click();
    
    // Verifica URL
    await expect(page).toHaveURL(/\/buscar\?cat=Alba%C3%B1il$/);

    // Verifica que la categoria muestre al menos un perfil accionable,
    // ya sea desde Supabase o desde los datos locales de respaldo.
    await expect(page.getByRole('button', { name: 'Ver Perfil' }).first()).toBeVisible();
  });
});
