export interface PageSelectors {
  // Common elements across all pages
  common: {
    logo: string;
    mainNavigation: string;
    footer: string;
    searchInput: string;
    searchButton: string;
    languageSelector: string;
  };
  
  // Homepage specific selectors
  homePage: {
    featuredArticle: string;
    featuredArticleLink: string;
    featuredImage: string;
    newsSection: string;
    onThisDaySection: string;
    mainPageLink: string;
  };
  
  // Article page selectors
  articlePage: {
    title: string;
    content: string;
    infobox: {
      container: string;
      birthDate: string;
      birthPlace: string;
      deathDate: string;
      nationality: string;
      occupation: string;
    };
    categories: string;
    references: string;
    editButton: string;
    talkPageLink: string;
  };
  
  // Search results page selectors
  searchResults: {
    container: string;
    resultItem: string;
    resultTitle: string;
    resultSnippet: string;
    noResults: string;
    didYouMean: string;
    pagination: string;
  };
  
  // Special pages selectors
  specialPages: {
    recentChanges: string;
    randomArticle: string;
    help: string;
    aboutPage: string;
  };
}

export interface Translations {
  // Generic page elements that could appear on any page
  common: {
    logo: string;
    search: string;
    menu: string;
    navigation: string;
    footer: string;
    header: string;
    loading: string;
    error: string;
  };
  
  // Homepage specific content
  homePage: {
    title: string;
    featuredContent: {
      article: string;
      image: string;
      news: string;
      onThisDay: string;
    };
    sections: {
      mainPage: string;
      community: string;
      help: string;
    };
  };
  
  // Search functionality
  search: {
    placeholder: string;
    button: string;
    results: string;
    noResults: string;
    suggestions: string;
  };
  
  // Article page elements
  article: {
    title: string;
    content: string;
    infobox: {
      born: string;
      died: string;
      nationality: string;
      occupation: string;
      knownFor: string;
    };
    categories: string;
    references: string;
    externalLinks: string;
  };
  
  // Generic assertions that can be reused
  assertions: {
    // Visibility assertions
    visibility: {
      elementVisible: string;
      elementHidden: string;
      pageLoaded: string;
    };
    
    // Content assertions
    content: {
      textPresent: string;
      textNotPresent: string;
      titleCorrect: string;
      linkWorking: string;
    };
    
    // Action assertions
    actions: {
      navigationSuccessful: string;
      searchSuccessful: string;
      formSubmitted: string;
      clickSuccessful: string;
    };
    
    // Data validation
    data: {
      dateValid: string;
      numberValid: string;
      emailValid: string;
      urlValid: string;
    };
  };
  
  // Test data that can be used across different test scenarios
  testData: {
    // Sample search terms for different categories
    searchTerms: {
      people: {
        authors: string[];
        scientists: string[];
        politicians: string[];
        artists: string[];
      };
      places: {
        countries: string[];
        cities: string[];
        landmarks: string[];
      };
      concepts: {
        science: string[];
        history: string[];
        technology: string[];
      };
    };
    
    // Expected content patterns
    expectedContent: {
      // Patterns for different types of pages
      personPage: {
        infoboxPresent: string;
        birthDatePattern: string;
        nationalityPattern: string;
      };
      locationPage: {
        coordinatesPresent: string;
        populationPattern: string;
        areaPattern: string;
      };
      conceptPage: {
        definitionPresent: string;
        categoriesPresent: string;
      };
    };
  };
  
  // Error messages and validation text
  errors: {
    pageNotFound: string;
    searchFailed: string;
    elementNotFound: string;
    timeout: string;
    connectionError: string;
  };
}

export interface FormattingRules {
  dateFormat: string;
  currencySymbol: string;
  currencyFormat: string;
  decimalSeparator: string;
  thousandsSeparator: string;
  locale: string;
}

export interface LocaleConfig {
  baseUrl: string;
  language: string;
  region: string;
  selectors: PageSelectors;
  translations: Translations;
  formatting: FormattingRules;
}

export type SupportedLocale = 'en' | 'es';
