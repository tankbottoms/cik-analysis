import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
	test('has correct title', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/Historical Stock Data/);
	});

	test('displays main heading', async ({ page }) => {
		await page.goto('/');
		const heading = page.locator('h1');
		await expect(heading).toContainText('Historical Stock Data Analysis');
	});

	test('shows quick stats section', async ({ page }) => {
		await page.goto('/');
		const statsSection = page.locator('h2:has-text("Quick Stats")');
		await expect(statsSection).toBeVisible();
	});

	test('has navigation links', async ({ page }) => {
		await page.goto('/');
		const navHome = page.locator('nav a:has-text("Home")');
		const navStockAnalysis = page.locator('nav a:has-text("Stock Analysis")');

		await expect(navHome).toBeVisible();
		await expect(navStockAnalysis).toBeVisible();
	});

	test('theme toggle works', async ({ page }) => {
		await page.goto('/');

		// Get initial theme
		const html = page.locator('html');
		const initialTheme = await html.getAttribute('data-theme');

		// Click theme toggle
		const themeButton = page.locator('button[aria-label="Toggle theme"]');
		await themeButton.click();

		// Check theme changed
		const newTheme = await html.getAttribute('data-theme');
		expect(newTheme).not.toBe(initialTheme);
	});

	test('navigates to stock analysis page', async ({ page }) => {
		await page.goto('/');

		// Click Stock Analysis link
		await page.click('nav a:has-text("Stock Analysis")');

		// Should be on stock analysis page
		await expect(page).toHaveURL('/visualizations/stock-analysis');
		await expect(page.locator('h1')).toContainText('Stock Analysis');
	});
});

test.describe('Stock Analysis Page', () => {
	test('displays entity cards when data is available', async ({ page }) => {
		await page.goto('/visualizations/stock-analysis');

		// Check for either entity cards or the "no data" message
		const hasCards = await page.locator('.section-box.featured').count();
		const hasNoDataMessage = await page.locator('.callout').count();

		expect(hasCards > 0 || hasNoDataMessage > 0).toBeTruthy();
	});

	test('has back link to home', async ({ page }) => {
		await page.goto('/visualizations/stock-analysis');

		const backLink = page.locator('.back-link');
		await expect(backLink).toBeVisible();
		await expect(backLink).toContainText('Back to Home');
	});

	test('comparison table has correct headers', async ({ page }) => {
		await page.goto('/visualizations/stock-analysis');

		// Only check if comparison table exists (it won't if no data)
		const table = page.locator('table');
		const tableCount = await table.count();

		if (tableCount > 0) {
			const headers = page.locator('th');
			const headerTexts = await headers.allTextContents();

			// Check for expected headers
			expect(headerTexts.some((h) => h.includes('CIK'))).toBeTruthy();
			expect(headerTexts.some((h) => h.includes('Ticker'))).toBeTruthy();
		}
	});
});

test.describe('Entity Detail Page', () => {
	test('displays entity information or no-data message', async ({ page }) => {
		// Use a known CIK that should exist
		await page.goto('/visualizations/stock-analysis/CIK0000878146');

		// Should have either stock data or a callout message
		const hasMetrics = await page.locator('h2:has-text("Key Metrics")').count();
		const hasCallout = await page.locator('.callout').count();

		expect(hasMetrics > 0 || hasCallout > 0).toBeTruthy();
	});

	test('has back link to stock analysis', async ({ page }) => {
		await page.goto('/visualizations/stock-analysis/CIK0000878146');

		const backLink = page.locator('.back-link');
		await expect(backLink).toBeVisible();
		await expect(backLink).toContainText('Back to Stock Analysis');
	});
});

test.describe('Responsive Design', () => {
	test('mobile layout works', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		// Navigation should still be visible
		const nav = page.locator('nav');
		await expect(nav).toBeVisible();

		// Content should be readable
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
	});

	test('tablet layout works', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/');

		// Page should render correctly
		await expect(page.locator('.page-wrapper')).toBeVisible();
	});
});

test.describe('Accessibility', () => {
	test('page has proper heading hierarchy', async ({ page }) => {
		await page.goto('/');

		// Should have exactly one h1
		const h1Count = await page.locator('h1').count();
		expect(h1Count).toBe(1);

		// h2s should exist
		const h2Count = await page.locator('h2').count();
		expect(h2Count).toBeGreaterThan(0);
	});

	test('interactive elements are keyboard accessible', async ({ page }) => {
		await page.goto('/');

		// Tab to theme toggle button
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');

		// Should be able to activate with Enter
		const focused = await page.locator(':focus');
		const tagName = await focused.evaluate((el) => el.tagName);

		// Either a link or button should be focused
		expect(['A', 'BUTTON'].includes(tagName)).toBeTruthy();
	});
});
