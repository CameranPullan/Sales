export interface RegionConfig {
  baseUrl: string;
  topMoviesSearchTerm: string;
}

export interface OdeonRegionConfig {
  baseUrl: string;
  searchTerm: string;
  region: string;
  brandName: string;
  language: string;
}

export const regionConfigs: Record<string, RegionConfig> = {
  gb: {
    baseUrl: 'https://en.wikipedia.org',
    topMoviesSearchTerm: 'List of highest-grossing films'
  },
  spain: {
    baseUrl: 'https://es.wikipedia.org',
    topMoviesSearchTerm: 'Lista de películas más taquilleras'
  },
  france: {
    baseUrl: 'https://fr.wikipedia.org',
    topMoviesSearchTerm: 'Liste des films les plus lucratifs'
  }
};

export const odeonRegionConfigs: Record<string, OdeonRegionConfig> = {
  gb: {
    baseUrl: 'https://www.odeon.co.uk',
    searchTerm: 'Fantastic Four',
    region: 'UK',
    brandName: 'odeon',
    language: 'en'
  },
  spain: {
    baseUrl: 'https://www.cinesa.es',
    searchTerm: 'Fantastic Four',
    region: 'Spain',
    brandName: 'cinesa',
    language: 'es'
  },
  italy: {
    baseUrl: 'https://ucicinemas.it',
    searchTerm: 'Fantastic Four',
    region: 'Italy',
    brandName: 'uci',
    language: 'it'
  }
};
