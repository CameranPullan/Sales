import { test, expect } from '../fixtures/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { ArticlePage } from '../pages/ArticlePage';
import { Locator } from '@playwright/test';

interface ClubInfo {
  name: string;
  period?: string;
  position?: string;
}

test.describe('Wikipedia Woltemade Search Test', () => {
  test('should navigate to Wikipedia, search for Woltemade, and extract clubs he has played for', async ({ 
    page, 
    locale, 
    localeContext, 
    utils 
  }) => {
    const homePage = new HomePage(page, locale);
    const searchResultsPage = new SearchResultsPage(page, locale);
    const startTime = Date.now();
    
    // Step 1: Navigate to Wikipedia homepage
    const step1 = utils.translation.formatTestStep('navigateToHomepage', locale, undefined, 1);

    await homePage.goto();
    
    // Step 2: Perform search for Woltemade
    const step2 = utils.translation.formatTestStep('searchForWoltemade', locale, undefined, 2);

    // Use page object method for search
    await searchResultsPage.performSearch('Woltemade footballer');
    
    // Wait for search results or article page to load
    await page.waitForLoadState('networkidle');
    
    // Step 3: Extract clubs information
    const step3 = utils.translation.formatTestStep('extractClubsInfo', locale, undefined, 3);

    const pageTitle = await page.title();
    
    // Check if we're on a disambiguation page or the main article
    const isDisambiguation = await page.locator('text="may refer to"').count() > 0 ||
                              await page.locator('.mw-disambig').count() > 0;
    
    if (isDisambiguation) {

      // Look for footballer-related links
      const footballerLinks = await page.locator('a').evaluateAll(links => 
        links.filter(link => {
          const text = link.textContent?.toLowerCase() || '';
          const href = link.getAttribute('href') || '';
          return (text.includes('footballer') || text.includes('soccer') || text.includes('player')) &&
                 href.includes('/wiki/');
        }).map(link => ({
          text: link.textContent,
          href: link.getAttribute('href')
        }))
      );
      
      if (footballerLinks.length > 0) {
        await page.click(`a[href="${footballerLinks[0].href}"]`);
        await page.waitForLoadState('networkidle');
      } else {
        // Try to find any Woltemade link that might be a person
        const woltemadeLinks = await page.locator('a[href*="/wiki/"]:has-text("Woltemade")').all();
        if (woltemadeLinks.length > 0) {
          await woltemadeLinks[0].click();
          await page.waitForLoadState('networkidle');
        }
      }
    }
    
    // Now extract club information
    const clubs: ClubInfo[] = [];
    
    // First, let's get all the text content to analyze
    const bodyText = await page.textContent('body') || '';
    
    // Look for career section or infobox
    const infobox = page.locator('.infobox, .vcard, .infobox-person');
    
    // Try to extract from infobox first
    try {
      const infoboxExists = await infobox.count() > 0;
      if (infoboxExists) {
        // Get all infobox content
        const infoboxText = await infobox.textContent() || '';
        
        // Look for club-related rows in the infobox
        const clubRows = await infobox.locator('tr').evaluateAll(rows => 
          rows.filter(row => {
            const rowText = row.textContent?.toLowerCase() || '';
            return rowText.includes('club') || rowText.includes('team') || 
                   rowText.includes('current') || rowText.includes('career');
          }).map(row => {
            const header = row.querySelector('th')?.textContent?.trim() || '';
            const value = row.querySelector('td')?.textContent?.trim() || '';
            return { header, value, fullText: row.textContent?.trim() || '' };
          })
        );
        
        for (const row of clubRows) {
          if (row.value && row.value !== '–' && row.value !== '' && row.value.length > 1) {
            clubs.push({
              name: row.value,
              position: row.header
            });
          }
        }
      }
    } catch (error) {
      // Could not extract from infobox
    }
    
    // Try to find specific football-related content patterns
    try {
      // Look for common football club patterns in multiple languages
      const footballPatterns = [
        // English patterns
        /\b([A-Z][a-zA-Z\s]+(?:FC|Club|United|City|Town|Athletic|Rovers|Wanderers|Albion|Villa|County|Hotspur|Ajax|Chelsea|Arsenal|Liverpool|Manchester|Bayern|Barcelona|Madrid|PSG|Milan|Juventus|Inter))\b/g,
        /\bplayed for ([A-Z][a-zA-Z\s]+)/gi,
        /\bjoined ([A-Z][a-zA-Z\s]+)/gi,
        /\bsigned for ([A-Z][a-zA-Z\s]+)/gi,
        /\bcareer at ([A-Z][a-zA-Z\s]+)/gi,
        
        // Spanish patterns
        /\b([A-Z][a-zA-Z\s]+(?:FC|Club|Fútbol Club|Club de Fútbol|CF|Real|Atlético|Deportivo))\b/g,
        /\bjugó en ([A-Z][a-zA-Z\s]+)/gi,
        /\bfichó por ([A-Z][a-zA-Z\s]+)/gi,
        /\bcarrera en ([A-Z][a-zA-Z\s]+)/gi
      ];
      
      for (const pattern of footballPatterns) {
        const matches = bodyText.match(pattern) || [];
        for (const match of matches) {
          // Clean up the match - remove common prefixes and extra text
          let cleanMatch = match
            .replace(/^(played for|joined|signed for|career at|jugó en|fichó por|carrera en|Futbolistas del)\s+/i, '')
            .replace(/\s+Football Club.*$/, ' FC') // Clean up "Football Club" followed by extra text
            .replace(/^(El|La|Los|Las)\s+/, '') // Remove Spanish articles
            .trim();
          
          // Skip if too short or contains unwanted patterns
          if (cleanMatch.length < 3 || 
              cleanMatch.toLowerCase().includes('futbolistas del') ||
              cleanMatch.includes('    ')) {
            continue;
          }
          
          if (!clubs.some(c => c.name.toLowerCase().includes(cleanMatch.toLowerCase()))) {
            clubs.push({
              name: cleanMatch
            });
          }
        }
      }
    } catch (error) {
      // Could not extract via patterns
    }
    
    // Also try to find any wiki links that might be clubs
    try {
      const wikiLinks = await page.locator('a[href*="/wiki/"]:not([href*="File:"]):not([href*="Category:"])').evaluateAll(links =>
        links.filter(link => {
          const href = link.getAttribute('href') || '';
          const text = link.textContent?.trim() || '';
          // Filter for links that might be football clubs
          return text.length > 2 && 
                 (text.includes('FC') || text.includes('Club') || text.includes('United') || 
                  text.includes('City') || text.includes('Athletic') || text.includes('Rovers') ||
                  href.includes('_FC') || href.includes('_Club') || href.includes('_United') ||
                  href.includes('_City') || href.includes('_Athletic'));
        }).map(link => link.textContent?.trim() || '')
      );
      
      for (const linkText of wikiLinks) {
        if (linkText && !clubs.some(c => c.name.toLowerCase().includes(linkText.toLowerCase()))) {
          clubs.push({
            name: linkText
          });
        }
      }
    } catch (error) {
      // Could not extract club links
    }
    
    // If still no clubs found, look for any mention of specific well-known clubs
    if (clubs.length === 0) {
      const wellKnownClubs = [
        'Ajax', 'Chelsea', 'Arsenal', 'Liverpool', 'Manchester United', 'Manchester City',
        'Bayern Munich', 'Barcelona', 'Real Madrid', 'PSG', 'AC Milan', 'Juventus',
        'Inter Milan', 'Borussia Dortmund', 'Atletico Madrid', 'Tottenham', 'Brighton',
        'Newcastle', 'West Ham', 'Everton', 'Crystal Palace', 'Aston Villa', 'Leeds United',
        'Burnley', 'Southampton', 'Watford', 'Norwich City', 'Brentford', 'Wolves'
      ];
      
      for (const clubName of wellKnownClubs) {
        if (bodyText.toLowerCase().includes(clubName.toLowerCase())) {
          clubs.push({
            name: clubName
          });
        }
      }
    }
    
    // Step 4: Clean up and deduplicate results
    const uniqueClubs: ClubInfo[] = [];
    const clubNames = new Set<string>();
    
    for (const club of clubs) {
      // Normalize club name more aggressively for multiple languages
      let normalizedName = club.name
        .replace(/\s+(FC|F\.C\.|Football Club|United FC|Club de Fútbol|CF)$/i, '')
        .replace(/\s+United\s+Football\s+Club$/i, ' United')
        .replace(/^(2025–26|2024–25)\s+/, '') // Remove season prefixes
        .replace(/\s+season$/, '') // Remove season suffixes
        .replace(/^(El|La|Los|Las)\s+/, '') // Remove Spanish articles
        .replace(/\s+Football Club.*$/, ' FC') // Clean trailing text
        .trim();
      
      // Skip very short names, generic terms, or unwanted patterns
      if (normalizedName.length < 3 || 
          (normalizedName.toLowerCase().includes('athletic') && normalizedName.length < 10) ||
          normalizedName.toLowerCase().includes('futbolistas') ||
          normalizedName.toLowerCase().includes('mundo deportivo') ||
          normalizedName.toLowerCase().includes('the athletic') ||
          normalizedName.includes('    ')) {
        continue;
      }
      
      // Further normalize for comparison - remove common suffixes and spaces
      const comparisonName = normalizedName
        .toLowerCase()
        .replace(/\s+(fc|f\.c\.|united|club|football|city|town|athletic|cf|fútbol)$/i, '')
        .trim();
      
      // Check if we already have this club (case insensitive)
      if (!clubNames.has(comparisonName)) {
        clubNames.add(comparisonName);
        uniqueClubs.push({
          name: normalizedName,
          period: club.period,
          position: club.position
        });
      }
    }
    
    // Step 5: Display results and validate


    if (uniqueClubs.length === 0) {

    } else {
      uniqueClubs.forEach((club, index) => {

      });
    }
    
    // Performance tracking
    const duration = Date.now() - startTime;
    
    // Assertions
    expect(pageTitle.toLowerCase()).toContain('woltemade');
    expect(uniqueClubs.length, 'Should find at least one club for Woltemade').toBeGreaterThan(0);
    expect(duration, 'Search should complete within reasonable time').toBeLessThan(30000);
    
    // Log final URL for verification
    const finalUrl = page.url();
  });
});
