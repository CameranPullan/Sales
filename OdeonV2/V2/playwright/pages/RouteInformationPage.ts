import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { SupportedLocale } from '../config/locales/types';

export class RouteInformationPage extends BasePage {
  // Selectors for route information pages (like Route des Grandes Alpes)
  private readonly selectors = {
    routeName: 'h1.firstHeading',
    infobox: '.infobox',
    lengthRow: '.infobox tr:has-text("Length"), .infobox tr:has-text("Longitud"), .infobox tr:has-text("Lunghezza")',
    lengthValue: 'td:last-child',
    routeDescription: '#mw-content-text p',
    routeMap: '.route-map, .mapa-ruta, .mappa-percorso',
    elevationProfile: '.elevation-profile',
    coordinatesInfo: '.geo-dec, .coordinates',
    routeTable: '.wikitable',
    routeImages: '.thumb img',
    routeGallery: '.gallery'
  };

  constructor(page: Page, locale?: SupportedLocale) {
    super(page, locale);
  }

  async getRouteName(): Promise<string> {
    return await this.page.textContent(this.selectors.routeName) || '';
  }

  async getRouteLength(): Promise<string | null> {
    const lengthSelectors = [
      '.infobox tr:has-text("Length") td:last-child',
      '.infobox tr:has-text("Longitud") td:last-child', // Spanish
      '.infobox tr:has-text("Lunghezza") td:last-child' // Italian
    ];

    for (const selector of lengthSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          const text = await element.textContent();
          if (text && text.trim()) {
            return text.trim();
          }
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    return null;
  }

  async hasRouteInformation(): Promise<boolean> {
    return await this.page.locator(this.selectors.infobox).isVisible();
  }

  async getRouteDescription(): Promise<string> {
    const description = await this.page.locator(this.selectors.routeDescription).first().textContent();
    return description || '';
  }

  async hasRouteMap(): Promise<boolean> {
    return await this.page.locator(this.selectors.routeMap).isVisible();
  }

  async getCoordinates(): Promise<string | null> {
    try {
      const coordElement = this.page.locator(this.selectors.coordinatesInfo).first();
      if (await coordElement.isVisible()) {
        return await coordElement.textContent();
      }
    } catch (error) {
      // Coordinates not found
    }
    return null;
  }

  async getRouteImages(): Promise<number> {
    try {
      return await this.page.locator(this.selectors.routeImages).count();
    } catch (error) {
      return 0;
    }
  }

  async hasElevationProfile(): Promise<boolean> {
    return await this.page.locator(this.selectors.elevationProfile).isVisible();
  }

  async extractLengthInKilometers(): Promise<number | null> {
    const lengthText = await this.getRouteLength();
    if (!lengthText) return null;

    // Extract numeric value from text like "678 km" or "678 kilometers"
    const kmMatch = lengthText.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometers|kilómetros|chilometri)/i);
    if (kmMatch) {
      return parseFloat(kmMatch[1]);
    }

    // Extract from miles and convert
    const milesMatch = lengthText.match(/(\d+(?:\.\d+)?)\s*(?:mi|miles|millas|miglia)/i);
    if (milesMatch) {
      return parseFloat(milesMatch[1]) * 1.60934; // Convert miles to km
    }

    return null;
  }

  async validateRouteData(): Promise<{
    hasName: boolean;
    hasLength: boolean;
    hasDescription: boolean;
    hasCoordinates: boolean;
  }> {
    return {
      hasName: (await this.getRouteName()).length > 0,
      hasLength: (await this.getRouteLength()) !== null,
      hasDescription: (await this.getRouteDescription()).length > 0,
      hasCoordinates: (await this.getCoordinates()) !== null
    };
  }

  async waitForRoutePageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.locator(this.selectors.routeName).waitFor({ state: 'visible' });
  }
}
