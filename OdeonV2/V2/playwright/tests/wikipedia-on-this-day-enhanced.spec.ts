import { test, expect } from '../fixtures/test';
import { OnThisDayPage, HistoricalEvent } from '../pages/OnThisDayPage';

test.describe('Wikipedia On This Day Tests - Enhanced', () => {
  test('should extract comprehensive On This Day historical events with fallback', async ({ 
    page, 
    locale, 
    localeContext, 
    utils 
  }) => {
    const onThisDayPage = new OnThisDayPage(page, locale);
    const startTime = Date.now();
    
    console.log(`🌍 Testing for locale: ${locale}`);
    console.log('🌐 Navigating to Wikipedia dedicated On This Day page...');
    await onThisDayPage.gotoOnThisDayPage();
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    console.log('📍 Current URL:', page.url());
    
    try {
      // Use the new fallback extraction method
      console.log('📜 Extracting historical events with fallback strategy...');
      const events: HistoricalEvent[] = await onThisDayPage.extractWithFallback();
      
      // Verify we got some events
      expect(events.length).toBeGreaterThan(0);
      console.log(`✅ Successfully extracted ${events.length} historical events`);
      
      // Step 3: Display the events
      const todaysDate = await onThisDayPage.getTodaysDate();
      console.log(`\n🗓️  On This Day (${todaysDate}) - Locale: ${locale}:`);
      console.log('=' .repeat(60));
      
      events.forEach((event, index) => {
        console.log(`\n${index + 1}. Year: ${event.year}`);
        console.log(`   Event: ${event.summary}`);
        if (event.fullText !== event.summary && event.fullText.length < 300) {
          console.log(`   Full Text: ${event.fullText}`);
        }
        console.log('-'.repeat(50));
      });
      
      // Assertions to ensure data quality
      const eventsWithValidYears = events.filter(event => 
        event.year !== 'Unknown' && /^\d{1,4}$/.test(event.year)
      );
      
      console.log(`\n📊 Summary for ${locale}:`);
      console.log(`   Total events: ${events.length}`);
      console.log(`   Events with valid years: ${eventsWithValidYears.length}`);
      console.log(`   Execution time: ${Date.now() - startTime}ms`);
      
      // More lenient assertions for different locales
      expect(events.length).toBeGreaterThan(0);
      
      // Expect events to have meaningful content
      const eventsWithContent = events.filter(event => 
        event.summary.length > 5
      );
      expect(eventsWithContent.length).toBeGreaterThan(0);
      
    } catch (error) {
      console.log(`❌ Error during extraction for ${locale}: ${error}`);
      throw error;
    }
  });

  test('should extract events from Wikipedia with intelligent fallback', async ({ 
    page, 
    locale 
  }) => {
    const onThisDayPage = new OnThisDayPage(page, locale);
    
    console.log(`� Testing fallback mechanism for locale: ${locale}`);
    await onThisDayPage.goto();
    await page.waitForLoadState('networkidle');
    
    const events = await onThisDayPage.extractWithFallback();
    
    expect(events.length).toBeGreaterThan(0);
    console.log(`📜 Extracted ${events.length} events using fallback for ${locale}`);
    
    // Display first event as example
    if (events.length > 0) {
      console.log(`\n🎯 Featured Event for ${locale}:`);
      console.log(`Year: ${events[0].year}`);
      console.log(`Summary: ${events[0].summary.substring(0, 100)}...`);
    }
  });
});
