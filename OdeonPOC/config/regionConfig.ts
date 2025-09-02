export interface RegionConfig {
  baseUrl: string;
  topMoviesSearchTerm: string;
}

export const regionConfigs: Record<string, RegionConfig> = {
  gb: {
    baseUrl: 'https://en.wikipedia.org',
    topMoviesSearchTerm: 'List of highest-grossing films'
  },
  spain: {
    baseUrl: 'https://es.wikipedia.org',
    topMoviesSearchTerm: 'Lista de películas más taquilleras'
  }
};
