import { SupportedLocale } from '../../config/locales/types';

/**
 * Test data interfaces for different types of content
 */
export interface PersonTestData {
  name: string;
  birthDate?: string;
  birthPlace?: string;
  occupation?: string;
  nationality?: string;
  searchTerms?: string[];
  expectedBiographyKeywords?: string[];
}

export interface LocationTestData {
  name: string;
  country: string;
  population?: number;
  area?: string;
  founded?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  searchTerms?: string[];
  expectedInfoKeywords?: string[];
}

export interface ConceptTestData {
  name: string;
  category: string;
  definition?: string;
  relatedTerms?: string[];
  searchTerms?: string[];
  expectedContentKeywords?: string[];
}

export interface SearchTestData {
  query: string;
  expectedResultCount?: number;
  expectedFirstResult?: string;
  disambiguationExpected?: boolean;
  shouldFindDirectMatch?: boolean;
}

/**
 * Test data structure for a locale
 */
export interface LocaleTestData {
  persons: PersonTestData[];
  locations: LocationTestData[];
  concepts: ConceptTestData[];
  searches: SearchTestData[];
  currencies: {
    validAmounts: string[];
    invalidAmounts: string[];
    conversionTests: Array<{
      amount: string;
      expectedParsed: number;
    }>;
  };
  dates: {
    validDates: string[];
    invalidDates: string[];
    parsingTests: Array<{
      input: string;
      expectedDate: string; // ISO format
    }>;
  };
  numbers: {
    validNumbers: string[];
    invalidNumbers: string[];
    parsingTests: Array<{
      input: string;
      expectedNumber: number;
    }>;
  };
}

/**
 * Test data provider that generates locale-specific test data
 */
export class TestDataProvider {
  private static readonly testData: Record<SupportedLocale, LocaleTestData> = {
    en: {
      persons: [
        {
          name: 'Jane Austen',
          birthDate: '16 December 1775',
          birthPlace: 'Steventon, Hampshire, England',
          occupation: 'Novelist',
          nationality: 'English',
          searchTerms: ['Jane Austen', 'Austen', 'Pride and Prejudice author'],
          expectedBiographyKeywords: ['novelist', 'english', 'literature', 'regency']
        },
        {
          name: 'Albert Einstein',
          birthDate: '14 March 1879',
          birthPlace: 'Ulm, Kingdom of Württemberg, German Empire',
          occupation: 'Theoretical physicist',
          nationality: 'German-American',
          searchTerms: ['Albert Einstein', 'Einstein', 'relativity theory'],
          expectedBiographyKeywords: ['physicist', 'relativity', 'nobel', 'physics']
        },
        {
          name: 'William Shakespeare',
          birthDate: '26 April 1564',
          birthPlace: 'Stratford-upon-Avon, Warwickshire, England',
          occupation: 'Playwright and poet',
          nationality: 'English',
          searchTerms: ['William Shakespeare', 'Shakespeare', 'Hamlet author'],
          expectedBiographyKeywords: ['playwright', 'poet', 'english', 'literature']
        }
      ],
      locations: [
        {
          name: 'London',
          country: 'United Kingdom',
          population: 8982000,
          area: '1,572 km²',
          searchTerms: ['London', 'London UK', 'British capital'],
          expectedInfoKeywords: ['capital', 'england', 'thames', 'city']
        },
        {
          name: 'New York City',
          country: 'United States',
          population: 8336817,
          area: '778.2 km²',
          searchTerms: ['New York City', 'NYC', 'New York'],
          expectedInfoKeywords: ['city', 'manhattan', 'brooklyn', 'america']
        }
      ],
      concepts: [
        {
          name: 'Quantum physics',
          category: 'Physics',
          searchTerms: ['Quantum physics', 'Quantum mechanics', 'quantum theory'],
          expectedContentKeywords: ['quantum', 'mechanics', 'physics', 'particle']
        },
        {
          name: 'Artificial intelligence',
          category: 'Computer Science',
          searchTerms: ['Artificial intelligence', 'AI', 'machine learning'],
          expectedContentKeywords: ['artificial', 'intelligence', 'machine', 'learning']
        }
      ],
      searches: [
        {
          query: 'Shakespeare',
          expectedResultCount: 10,
          expectedFirstResult: 'William Shakespeare',
          shouldFindDirectMatch: true
        },
        {
          query: 'Python programming',
          disambiguationExpected: true,
          shouldFindDirectMatch: false
        }
      ],
      currencies: {
        validAmounts: ['$1,234.56', '$0.99', '$1,000,000.00'],
        invalidAmounts: ['$abc', '1234', '£50'],
        conversionTests: [
          { amount: '$1,234.56', expectedParsed: 1234.56 },
          { amount: '$0.99', expectedParsed: 0.99 }
        ]
      },
      dates: {
        validDates: ['January 3, 1892', '3 January 1892', 'Jan 3, 1892'],
        invalidDates: ['32 January 1892', 'Invalid date', '13/45/2023'],
        parsingTests: [
          { input: 'January 3, 1892', expectedDate: '1892-01-03' },
          { input: '3 January 1892', expectedDate: '1892-01-03' }
        ]
      },
      numbers: {
        validNumbers: ['1,234,567.89', '1,000', '0.99'],
        invalidNumbers: ['1.234.567', '1,23,4', 'abc'],
        parsingTests: [
          { input: '1,234,567.89', expectedNumber: 1234567.89 },
          { input: '1,000', expectedNumber: 1000 }
        ]
      }
    },
    es: {
      persons: [
        {
          name: 'Miguel de Cervantes',
          birthDate: '29 de septiembre de 1547',
          birthPlace: 'Alcalá de Henares, España',
          occupation: 'Escritor',
          nationality: 'Español',
          searchTerms: ['Miguel de Cervantes', 'Cervantes', 'Don Quijote autor'],
          expectedBiographyKeywords: ['escritor', 'español', 'literatura', 'quijote']
        },
        {
          name: 'Pablo Picasso',
          birthDate: '25 de octubre de 1881',
          birthPlace: 'Málaga, España',
          occupation: 'Pintor',
          nationality: 'Español',
          searchTerms: ['Pablo Picasso', 'Picasso', 'cubismo'],
          expectedBiographyKeywords: ['pintor', 'cubismo', 'arte', 'español']
        },
        {
          name: 'Gabriel García Márquez',
          birthDate: '6 de marzo de 1927',
          birthPlace: 'Aracataca, Colombia',
          occupation: 'Escritor',
          nationality: 'Colombiano',
          searchTerms: ['Gabriel García Márquez', 'García Márquez', 'Cien años soledad'],
          expectedBiographyKeywords: ['escritor', 'realismo', 'mágico', 'nobel']
        }
      ],
      locations: [
        {
          name: 'Madrid',
          country: 'España',
          population: 3223334,
          area: '604,3 km²',
          searchTerms: ['Madrid', 'Madrid España', 'capital española'],
          expectedInfoKeywords: ['capital', 'españa', 'madrid', 'ciudad']
        },
        {
          name: 'Barcelona',
          country: 'España',
          population: 1620343,
          area: '101,4 km²',
          searchTerms: ['Barcelona', 'Barcelona España', 'Barcelona Cataluña'],
          expectedInfoKeywords: ['barcelona', 'cataluña', 'mediterráneo', 'ciudad']
        }
      ],
      concepts: [
        {
          name: 'Física cuántica',
          category: 'Física',
          searchTerms: ['Física cuántica', 'Mecánica cuántica', 'teoría cuántica'],
          expectedContentKeywords: ['física', 'cuántica', 'mecánica', 'partícula']
        },
        {
          name: 'Inteligencia artificial',
          category: 'Informática',
          searchTerms: ['Inteligencia artificial', 'IA', 'aprendizaje automático'],
          expectedContentKeywords: ['inteligencia', 'artificial', 'máquina', 'aprendizaje']
        }
      ],
      searches: [
        {
          query: 'Cervantes',
          expectedResultCount: 10,
          expectedFirstResult: 'Miguel de Cervantes',
          shouldFindDirectMatch: true
        },
        {
          query: 'Python programación',
          disambiguationExpected: true,
          shouldFindDirectMatch: false
        }
      ],
      currencies: {
        validAmounts: ['1.234,56 €', '0,99 €', '1.000.000,00 €'],
        invalidAmounts: ['€abc', '1234', '$50'],
        conversionTests: [
          { amount: '1.234,56 €', expectedParsed: 1234.56 },
          { amount: '0,99 €', expectedParsed: 0.99 }
        ]
      },
      dates: {
        validDates: ['3 de enero de 1892', '3 enero 1892', '3/1/1892'],
        invalidDates: ['32 de enero de 1892', 'Fecha inválida', '45/13/2023'],
        parsingTests: [
          { input: '3 de enero de 1892', expectedDate: '1892-01-03' },
          { input: '3 enero 1892', expectedDate: '1892-01-03' }
        ]
      },
      numbers: {
        validNumbers: ['1.234.567,89', '1.000', '0,99'],
        invalidNumbers: ['1,234,567', '1.23.4', 'abc'],
        parsingTests: [
          { input: '1.234.567,89', expectedNumber: 1234567.89 },
          { input: '1.000', expectedNumber: 1000 }
        ]
      }
    },
    it: {
      persons: [
        {
          name: 'Dante Alighieri',
          birthDate: '1265',
          birthPlace: 'Firenze, Italia',
          occupation: 'Poeta',
          nationality: 'Italiano',
          searchTerms: ['Dante Alighieri', 'Dante', 'Divina Commedia autore'],
          expectedBiographyKeywords: ['poeta', 'italiano', 'letteratura', 'commedia']
        },
        {
          name: 'Leonardo da Vinci',
          birthDate: '15 aprile 1452',
          birthPlace: 'Vinci, Italia',
          occupation: 'Artista',
          nationality: 'Italiano',
          searchTerms: ['Leonardo da Vinci', 'Leonardo', 'Monna Lisa'],
          expectedBiographyKeywords: ['artista', 'rinascimento', 'pittore', 'scienziato']
        },
        {
          name: 'Galileo Galilei',
          birthDate: '15 febbraio 1564',
          birthPlace: 'Pisa, Italia',
          occupation: 'Scienziato',
          nationality: 'Italiano',
          searchTerms: ['Galileo Galilei', 'Galileo', 'telescopio'],
          expectedBiographyKeywords: ['scienziato', 'astronomia', 'fisica', 'telescopio']
        }
      ],
      locations: [
        {
          name: 'Roma',
          country: 'Italia',
          population: 2873494,
          area: '1.287,36 km²',
          searchTerms: ['Roma', 'Roma Italia', 'capitale italiana'],
          expectedInfoKeywords: ['capitale', 'italia', 'roma', 'città']
        },
        {
          name: 'Milano',
          country: 'Italia',
          population: 1395274,
          area: '181,76 km²',
          searchTerms: ['Milano', 'Milano Italia', 'Milano Lombardia'],
          expectedInfoKeywords: ['milano', 'lombardia', 'economia', 'città']
        }
      ],
      concepts: [
        {
          name: 'Fisica quantistica',
          category: 'Fisica',
          searchTerms: ['Fisica quantistica', 'Meccanica quantistica', 'teoria quantistica'],
          expectedContentKeywords: ['fisica', 'quantistica', 'meccanica', 'particella']
        },
        {
          name: 'Intelligenza artificiale',
          category: 'Informatica',
          searchTerms: ['Intelligenza artificiale', 'IA', 'machine learning'],
          expectedContentKeywords: ['intelligenza', 'artificiale', 'macchina', 'apprendimento']
        }
      ],
      searches: [
        {
          query: 'Dante',
          expectedResultCount: 10,
          expectedFirstResult: 'Dante Alighieri',
          shouldFindDirectMatch: true
        },
        {
          query: 'Python programmazione',
          disambiguationExpected: true,
          shouldFindDirectMatch: false
        }
      ],
      currencies: {
        validAmounts: ['€ 1.234,56', '€ 0,99', '€ 1.000.000,00'],
        invalidAmounts: ['€abc', '1234', '$50'],
        conversionTests: [
          { amount: '€ 1.234,56', expectedParsed: 1234.56 },
          { amount: '€ 0,99', expectedParsed: 0.99 }
        ]
      },
      dates: {
        validDates: ['3 gennaio 1892', '3 gen 1892', '3/1/1892'],
        invalidDates: ['32 gennaio 1892', 'Data non valida', '45/13/2023'],
        parsingTests: [
          { input: '3 gennaio 1892', expectedDate: '1892-01-03' },
          { input: '3 gen 1892', expectedDate: '1892-01-03' }
        ]
      },
      numbers: {
        validNumbers: ['1.234.567,89', '1.000', '0,99'],
        invalidNumbers: ['1,234,567', '1.23.4', 'abc'],
        parsingTests: [
          { input: '1.234.567,89', expectedNumber: 1234567.89 },
          { input: '1.000', expectedNumber: 1000 }
        ]
      }
    }
  };

  /**
   * Get all test data for a locale
   */
  static getTestData(locale: SupportedLocale): LocaleTestData {
    return this.testData[locale];
  }

  /**
   * Get random person data for testing
   */
  static getRandomPerson(locale: SupportedLocale): PersonTestData {
    const persons = this.testData[locale].persons;
    return persons[Math.floor(Math.random() * persons.length)];
  }

  /**
   * Get random location data for testing
   */
  static getRandomLocation(locale: SupportedLocale): LocationTestData {
    const locations = this.testData[locale].locations;
    return locations[Math.floor(Math.random() * locations.length)];
  }

  /**
   * Get random concept data for testing
   */
  static getRandomConcept(locale: SupportedLocale): ConceptTestData {
    const concepts = this.testData[locale].concepts;
    return concepts[Math.floor(Math.random() * concepts.length)];
  }

  /**
   * Get random search query for testing
   */
  static getRandomSearchQuery(locale: SupportedLocale): SearchTestData {
    const searches = this.testData[locale].searches;
    return searches[Math.floor(Math.random() * searches.length)];
  }

  /**
   * Generate test data for specific category
   */
  static generateTestData(
    locale: SupportedLocale, 
    type: 'person' | 'location' | 'concept' | 'search',
    count: number = 1
  ): Array<PersonTestData | LocationTestData | ConceptTestData | SearchTestData> {
    const data = this.testData[locale];
    
    switch (type) {
      case 'person':
        return this.getRandomItems(data.persons, count);
      case 'location':
        return this.getRandomItems(data.locations, count);
      case 'concept':
        return this.getRandomItems(data.concepts, count);
      case 'search':
        return this.getRandomItems(data.searches, count);
      default:
        throw new Error(`Unknown test data type: ${type}`);
    }
  }

  /**
   * Get random items from array
   */
  private static getRandomItems<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, items.length));
  }

  /**
   * Validate test data integrity
   */
  static validateTestData(locale: SupportedLocale): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const data = this.testData[locale];

    // Check required fields
    if (!data.persons || data.persons.length === 0) {
      errors.push('Missing person test data');
    }

    if (!data.locations || data.locations.length === 0) {
      errors.push('Missing location test data');
    }

    if (!data.concepts || data.concepts.length === 0) {
      errors.push('Missing concept test data');
    }

    // Validate person data
    data.persons.forEach((person, index) => {
      if (!person.name) {
        errors.push(`Person ${index}: Missing name`);
      }
      if (!person.searchTerms || person.searchTerms.length === 0) {
        errors.push(`Person ${index}: Missing search terms`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
