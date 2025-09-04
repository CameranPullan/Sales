import { test, expect } from '../fixtures/test';
import { OnThisDayPage, HistoricalEvent } from '../pages/OnThisDayPage';

test.describe('Wikipedia On This Day Tests', () => {
  test('should navigate to Wikipedia and extract On This Day historical events', async ({ 
    page, 
    locale, 
    localeContext, 
    utils 
  }) => {
    const onThisDayPage = new OnThisDayPage(page, locale);
    const startTime = Date.now();
    
    // Step 1: Navigate to Wikipedia homepage
    console.log('🌐 Navigating to Wikipedia homepage...');
    await onThisDayPage.goto();
    
    // Verify we're on Wikipedia
    await expect(page).toHaveTitle(/Wikipedia/i);
    console.log('✅ Successfully navigated to Wikipedia');
    
    // Step 2: Find the "On This Day" section
    console.log('🔍 Looking for "On This Day" section...');
    const onThisDayExists = await onThisDayPage.verifyOnThisDaySection();
    expect(onThisDayExists).toBe(true);
    console.log('✅ Found "On This Day" section');
    
    // Step 3: Extract historical events
    console.log('📜 Extracting historical events...');
    const events: HistoricalEvent[] = await onThisDayPage.extractHistoricalEvents();
    
    // Verify we got some events
    expect(events.length).toBeGreaterThan(0);
    console.log(`✅ Successfully extracted ${events.length} historical events`);
    
    // Step 4: Display the events
    const todaysDate = await onThisDayPage.getTodaysDate();
    console.log(`\n🗓️  On This Day (${todaysDate}):`);
    console.log('=' .repeat(50));
    
    events.forEach((event, index) => {
      console.log(`\n${index + 1}. Year: ${event.year}`);
      console.log(`   Event: ${event.summary}`);
      console.log(`   Full Text: ${event.fullText}`);
      console.log('-'.repeat(40));
    });
    
    // Assertions to ensure data quality
    const eventsWithValidYears = events.filter(event => 
      event.year !== 'Unknown' && /^\d{1,4}$/.test(event.year)
    );
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total events: ${events.length}`);
    console.log(`   Events with valid years: ${eventsWithValidYears.length}`);
    console.log(`   Execution time: ${Date.now() - startTime}ms`);
    
    // Expect at least some events to have valid years
    expect(eventsWithValidYears.length).toBeGreaterThan(0);
    
    // Expect events to have meaningful content
    const eventsWithContent = events.filter(event => 
      event.summary.length > 10
    );
    expect(eventsWithContent.length).toBeGreaterThan(0);
  });

  test('should extract and validate specific historical event data', async ({ 
    page, 
    locale 
  }) => {
    const onThisDayPage = new OnThisDayPage(page, locale);
    
    // Navigate and extract events
    await onThisDayPage.goto();
    const events = await onThisDayPage.extractHistoricalEvents();
    
    // Test data validation
    expect(events.length).toBeGreaterThan(0);
    
    // Check first event for proper structure
    const firstEvent = events[0];
    expect(firstEvent).toHaveProperty('year');
    expect(firstEvent).toHaveProperty('summary');
    expect(firstEvent).toHaveProperty('fullText');
    
    // Validate that summaries are not empty
    expect(firstEvent.summary.trim()).not.toBe('');
    expect(firstEvent.fullText.trim()).not.toBe('');
    
    console.log(`\n🎯 Featured Historical Event:`);
    console.log(`Year: ${firstEvent.year}`);
    console.log(`Summary: ${firstEvent.summary}`);
  });

  test('should handle different Wikipedia language versions', async ({ 
    page, 
    locale 
  }) => {
    const onThisDayPage = new OnThisDayPage(page, locale);
    
    console.log(`🌍 Testing On This Day for locale: ${locale}`);
    
    await onThisDayPage.goto();
    
    // Verify the page loads correctly for the current locale
    await expect(page).toHaveURL(/wikipedia\.org/);
    
    // Try to find On This Day section (may not exist in all language versions)
    const sectionExists = await onThisDayPage.verifyOnThisDaySection();
    
    if (sectionExists) {
      console.log('✅ On This Day section found for this locale');
      const events = await onThisDayPage.extractHistoricalEvents();
      console.log(`📜 Extracted ${events.length} events for locale ${locale}`);
      
      // If events found, validate them
      if (events.length > 0) {
        expect(events[0]).toHaveProperty('year');
        expect(events[0]).toHaveProperty('summary');
      }
    } else {
      console.log(`ℹ️  On This Day section not available for locale: ${locale}`);
      // This is not necessarily a failure - some Wikipedia versions may not have this section
    }
  });
});
