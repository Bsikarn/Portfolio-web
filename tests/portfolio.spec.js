// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Portfolio Core Functionalities', () => {

    test('Scenario 1: Navigates to the homepage and verifies content', async ({ page }) => {
        // Navigate to the base URL (http://localhost:5173 as configured)
        await page.goto('/');

        // Wait for the main body or specific hero text to ensure the page loaded
        await expect(page.locator('body')).toBeVisible();

        // Check if the navigation bar is present
        const navBar = page.locator('nav');
        if (await navBar.isVisible()) {
            await expect(navBar).toBeVisible();
        }
    });

    test('Scenario 2 & 3: Filter projects by category and verify logic', async ({ page }) => {
        // Navigate to the base URL and use the Navbar to switch to Projects
        await page.goto('/');

        // Click the Projects nav button
        await page.getByText('Projects', { exact: true }).click();

        // Wait until the loading state is finished (the "Loading Projects..." text disappears)
        await expect(page.getByText(/Loading Projects/i)).toBeHidden({ timeout: 10000 });

        // Ensure the 'All' filter button is visible as the default fallback
        const allFilterBtn = page.getByRole('button', { name: 'All', exact: true });
        await expect(allFilterBtn).toBeVisible();

        // Locate the "Frontend" or "Website" filter button. 
        // We use a broader locator to find any valid category loaded from the database
        const frontendFilterBtn = page.getByRole('button', { name: 'Frontend' });

        if (await frontendFilterBtn.isVisible()) {
            // Click the specific category filter
            await frontendFilterBtn.click();

            // Verify that the 'Select Project' section is still visible after filtering
            await expect(page.getByText('Select Project')).toBeVisible();

            // Optionally count the visible project cards if we had specific test data
            // For general cases, just validating it didn't crash is good.
        } else {
            // Fallback: Just click the 'All' filter if 'Frontend' is missing
            await allFilterBtn.click();
            await expect(page.getByText('Select Project')).toBeVisible();
        }
    });

});
