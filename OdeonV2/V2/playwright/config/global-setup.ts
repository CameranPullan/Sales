import { localeManager } from './locales';

async function globalSetup() {
  // Set locale based on project name if available
  const projectName = process.env.PLAYWRIGHT_PROJECT_NAME;
  if (projectName && ['en', 'es'].includes(projectName)) {
    localeManager.setCurrentLocale(projectName as 'en' | 'es');
  }
  
  console.log(`🌍 Running tests with locale: ${localeManager.getCurrentLocale()}`);
  console.log(`📍 Base URL: ${localeManager.getBaseUrl()}`);
}

export default globalSetup;
