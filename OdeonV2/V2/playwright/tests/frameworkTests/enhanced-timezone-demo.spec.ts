import { test, expect } from '../../fixtures/test';

test.describe('Enhanced Timezone Support Demo', () => {
  test('demonstrate enhanced timezone configuration', async ({ 
    page, 
    locale, 
    utils 
  }) => {
    // Show how to configure browser with specific timezone
    const localeTimezone = utils.dateTime.getTimezone(locale);
    
    // Navigate to a page where we can test timezone-specific behavior
    await page.goto('https://timeanddate.com/worldclock/');
    await page.waitForLoadState('networkidle');
    
    // Get the page's detected timezone
    const pageTimezone = await page.evaluate(() => {
      return {
        detected: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offset: new Date().getTimezoneOffset(),
        localTime: new Date().toLocaleString()
      };
    });
    
    // Show difference between system and locale timezone
    const now = new Date();
    
    // Time in locale-specific timezone
    const localeTime = now.toLocaleString('en-US', { 
      timeZone: localeTimezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    expect(pageTimezone.detected).toBeTruthy();
  });
  
  test('demonstrate timezone-aware browser context', async ({ browser, locale, utils }) => {
    const localeTimezone = utils.dateTime.getTimezone(locale);
    
    // Create a new browser context with specific timezone
    const context = await browser.newContext({
      timezoneId: localeTimezone,
      locale: locale === 'es' ? 'es-ES' : 'en-US'
    });
    
    const page = await context.newPage();
    
    // Test the timezone in the new context
    const contextTimezone = await page.evaluate(() => {
      return {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        date: new Date().toString(),
        localeString: new Date().toLocaleString(),
        utcOffset: new Date().getTimezoneOffset()
      };
    });
    
    // Test a real-world scenario - checking time on a website
    await page.goto('data:text/html,<html><body><div id="time"></div><script>document.getElementById("time").textContent = new Date().toString();</script></body></html>');
    
    const displayedTime = await page.textContent('#time');

    await context.close();
    
    // Verify the timezone was set correctly
    expect(contextTimezone.timezone).toBe(localeTimezone);
  });
  
  test('test multi-timezone scenario', async ({ browser, locale, utils }) => {
    const timezones = [
      { locale: 'en', timezone: 'America/New_York', name: 'New York' },
      { locale: 'es', timezone: 'Europe/Madrid', name: 'Madrid' },
      { locale: 'en', timezone: 'Asia/Tokyo', name: 'Tokyo' },
      { locale: 'en', timezone: 'Australia/Sydney', name: 'Sydney' }
    ];
    
    interface TimeResult {
      name: string;
      timezone: string;
      time: string;
      hour: number;
    }
    
    const results: TimeResult[] = [];
    
    for (const config of timezones) {
      const context = await browser.newContext({
        timezoneId: config.timezone,
        locale: config.locale === 'es' ? 'es-ES' : 'en-US'
      });
      
      const page = await context.newPage();
      
      const timeInfo = await page.evaluate(() => {
        const now = new Date();
        return {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          time: now.toLocaleString(),
          utcTime: now.toISOString(),
          hour: now.getHours()
        };
      });
      
      results.push({
        name: config.name,
        timezone: config.timezone,
        time: timeInfo.time,
        hour: timeInfo.hour
      });
      
      await context.close();
    }
    
    // Verify we got different times for different timezones
    const uniqueHours = new Set(results.map(r => r.hour));
    expect(uniqueHours.size).toBeGreaterThan(1); // Should have different hours
  });
});
