import { test, expect } from '../fixtures/test';

test.describe('Enhanced Timezone Support Demo', () => {
  test('demonstrate enhanced timezone configuration', async ({ 
    page, 
    locale, 
    utils 
  }) => {
    console.log('\n🌍 ENHANCED TIMEZONE SUPPORT DEMO');
    console.log('==================================');
    
    // Show how to configure browser with specific timezone
    const localeTimezone = utils.dateTime.getTimezone(locale);
    console.log(`🌐 Target timezone for ${locale}: ${localeTimezone}`);
    
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
    
    console.log('\n🕐 CURRENT PAGE TIMEZONE INFO:');
    console.log(`  Detected: ${pageTimezone.detected}`);
    console.log(`  Offset: ${pageTimezone.offset} minutes`);
    console.log(`  Local time: ${pageTimezone.localTime}`);
    
    // Show difference between system and locale timezone
    console.log('\n⏰ TIMEZONE COMPARISON:');
    const now = new Date();
    
    // Current system time
    console.log(`  System time: ${now.toLocaleString()}`);
    
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
    console.log(`  ${locale} timezone (${localeTimezone}): ${localeTime}`);
    
    expect(pageTimezone.detected).toBeTruthy();
  });
  
  test('demonstrate timezone-aware browser context', async ({ browser, locale, utils }) => {
    console.log('\n🌍 TIMEZONE-AWARE BROWSER CONTEXT');
    console.log('==================================');
    
    const localeTimezone = utils.dateTime.getTimezone(locale);
    console.log(`🎯 Setting browser timezone to: ${localeTimezone}`);
    
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
    
    console.log('\n✅ TIMEZONE-CONFIGURED CONTEXT:');
    console.log(`  Timezone: ${contextTimezone.timezone}`);
    console.log(`  Date: ${contextTimezone.date}`);
    console.log(`  Locale string: ${contextTimezone.localeString}`);
    console.log(`  UTC offset: ${contextTimezone.utcOffset} minutes`);
    
    // Test a real-world scenario - checking time on a website
    await page.goto('data:text/html,<html><body><div id="time"></div><script>document.getElementById("time").textContent = new Date().toString();</script></body></html>');
    
    const displayedTime = await page.textContent('#time');
    console.log(`  Displayed time: ${displayedTime}`);
    
    await context.close();
    
    // Verify the timezone was set correctly
    expect(contextTimezone.timezone).toBe(localeTimezone);
  });
  
  test('test multi-timezone scenario', async ({ browser, locale, utils }) => {
    console.log('\n🌍 MULTI-TIMEZONE SCENARIO TEST');
    console.log('===============================');
    
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
      
      console.log(`  ${config.name} (${config.timezone}): ${timeInfo.time}`);
      
      await context.close();
    }
    
    console.log('\n📊 TIMEZONE RESULTS SUMMARY:');
    results.forEach(result => {
      console.log(`  ${result.name}: ${result.time} (Hour: ${result.hour})`);
    });
    
    // Verify we got different times for different timezones
    const uniqueHours = new Set(results.map(r => r.hour));
    expect(uniqueHours.size).toBeGreaterThan(1); // Should have different hours
  });
});
