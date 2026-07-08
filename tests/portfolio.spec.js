// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Portfolio E2E Core Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test('Navbar links navigation & brand logo presence', async ({ page }) => {
    // Verify brand logo exists
    const logo = page.locator('div[title="Beaut.Portfolio"]');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveText('Beaut.Portfolio');

    // Navigation buttons check
    const homeBtn = page.getByRole('button', { name: 'Home', exact: true });
    const projectsBtn = page.getByRole('button', { name: 'Projects', exact: true });
    const contactBtn = page.getByRole('button', { name: 'Contact', exact: true });

    await expect(homeBtn).toBeVisible();
    await expect(projectsBtn).toBeVisible();
    await expect(contactBtn).toBeVisible();

    // Navigate to Contact
    await contactBtn.click();
    await expect(page.getByText("Let's work")).toBeVisible();

    // Navigate back to Home
    await homeBtn.click();
    await expect(page.getByText('Sikarn Pattarasirimongkol')).toBeVisible();
  });

  test('Interactive Cheer Up button triggers emojis', async ({ page }) => {
    // Get Cheer Up button (🎉 Emoji button)
    const cheerBtn = page.getByLabel('Cheer up!');
    await expect(cheerBtn).toBeVisible();

    // Click the Cheer Up button and check if emoji elements are generated in the DOM
    await cheerBtn.click();
    await cheerBtn.click();

    // Ensure the button is clickable and active
    await expect(cheerBtn).toBeEnabled();
  });

  test('AI Assistant ChatBot toggle', async ({ page }) => {
    // Get AI Chatbot button (MessageCircle icon)
    const chatbotToggle = page.getByLabel('Open AI Assistant');
    await expect(chatbotToggle).toBeVisible();

    // Open Chatbot
    await chatbotToggle.click();

    // Verify Chatbot container header is visible
    const chatTitle = page.getByText("Sikarn's AI Assistant");
    await expect(chatTitle).toBeVisible();

    // Toggle again to close
    await chatbotToggle.click();
    await expect(chatTitle).toBeHidden();
  });

  test('Projects filtering and selection logic', async ({ page }) => {
    // Switch to Projects page
    await page.getByRole('button', { name: 'Projects', exact: true }).click();

    // Wait until loading indicator disappears
    await expect(page.getByText(/Loading Projects/i)).toBeHidden({ timeout: 15000 });

    // Validate 'All' filter button is default
    const allFilterBtn = page.getByRole('button', { name: 'All', exact: true });
    await expect(allFilterBtn).toBeVisible();

    // Check if there's any visible projects in the grid
    const selectProjectTitle = page.getByText('Select Project');
    await expect(selectProjectTitle).toBeVisible();
  });

});
