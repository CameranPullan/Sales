import { test, expect } from '../../fixtures/test';

test.describe('Timezone Support Investigation', () => {
  test('investigate current timezone support in framework', async ({ 
    page, 
    locale, 
    utils 
  }) => {
    console.log('\n🌍 TIMEZONE SUPPORT INVESTIGATION');
    console.log('================================');
    
    // 1. Check current system timezone
    const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(`🕒 System timezone: ${systemTimezone}`);
    
    // 2. Check locale-specific timezone from framework
    const localeTimezone = utils.dateTime.getTimezone(locale);
    console.log(`🌐 Locale-specific timezone: ${localeTimezone}`);
    
    // 3. Test current date/time formatting
    const now = new Date();
    console.log(`📅 Current date/time: ${now.toISOString()}`);
    console.log(`📍 Formatted for ${locale}: ${utils.dateTime.formatDate(now, locale)}`);
    console.log(`🕐 Time formatted for ${locale}: ${utils.dateTime.formatTime(now, locale)}`);
    
    // 4. Check browser timezone via JavaScript
    await page.goto('data:text/html,<html><body><h1>Timezone Test</h1></body></html>');
    
    const browserTimezone = await page.evaluate(() => {
      return {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offset: new Date().getTimezoneOffset(),
        date: new Date().toString(),
        utcDate: new Date().toUTCString(),
        localeDate: new Date().toLocaleString()
      };
    });
    
    console.log('\n🌐 BROWSER TIMEZONE INFO:');
    console.log(`  Timezone: ${browserTimezone.timezone}`);
    console.log(`  UTC Offset: ${browserTimezone.offset} minutes`);
    console.log(`  Date: ${browserTimezone.date}`);
    console.log(`  UTC Date: ${browserTimezone.utcDate}`);
    console.log(`  Locale Date: ${browserTimezone.localeDate}`);
    
    // 5. Test different timezone scenarios
    console.log('\n⏰ TIMEZONE SCENARIOS:');
    
    // Test date in different timezones
    const testTimezones = [
      'America/New_York',
      'Europe/London', 
      'Europe/Madrid',
      'Asia/Tokyo',
      'Australia/Sydney'
    ];
    
    for (const tz of testTimezones) {
      try {
        const dateInTz = await page.evaluate((timezone) => {
          return new Date().toLocaleString('en-US', { timeZone: timezone });
        }, tz);
        console.log(`  ${tz}: ${dateInTz}`);
      } catch (error) {
        console.log(`  ${tz}: Error - ${error.message}`);
      }
    }
    
    // 6. Check if Playwright config has timezone set
    console.log('\n⚙️ PLAYWRIGHT CONFIGURATION:');
    const config = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages
      };
    });
    console.log(`  User Agent: ${config.userAgent}`);
    console.log(`  Language: ${config.language}`);
    console.log(`  Languages: ${config.languages.join(', ')}`);
    
    // Basic assertions to ensure test passes
    expect(systemTimezone).toBeTruthy();
    expect(localeTimezone).toBeTruthy();
    expect(browserTimezone.timezone).toBeTruthy();
  });
  
  test('test timezone-aware date operations', async ({ 
    locale, 
    utils 
  }) => {
    console.log('\n📅 TIMEZONE-AWARE DATE OPERATIONS');
    console.log('==================================');
    
    // Test the framework's timezone-aware utilities
    const testDate = new Date('2025-09-03T12:00:00Z'); // UTC
    
    console.log(`📅 Test date (UTC): ${testDate.toISOString()}`);
    console.log(`📍 Formatted for ${locale}: ${utils.dateTime.formatDate(testDate, locale)}`);
    console.log(`🕐 Time for ${locale}: ${utils.dateTime.formatTime(testDate, locale)}`);
    
    // Test relative time
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const relativeTime = utils.dateTime.getRelativeTime(yesterday, locale);
    console.log(`⏰ Relative time for ${locale}: ${relativeTime}`);
    
    // Test locale-specific timezone
    const localeTimezone = utils.dateTime.getTimezone(locale);
    console.log(`🌐 Locale timezone: ${localeTimezone}`);
    
    expect(testDate).toBeInstanceOf(Date);
    expect(relativeTime).toBeTruthy();
    expect(localeTimezone).toBeTruthy();
  });
});
