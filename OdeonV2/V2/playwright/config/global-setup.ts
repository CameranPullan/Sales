import { localeManager } from './locales';

async function globalSetup() {
  // Set locale based on project name if available
  const projectName = process.env.PLAYWRIGHT_PROJECT_NAME;
  if (projectName && ['en', 'es', 'it'].includes(projectName)) {
    localeManager.setCurrentLocale(projectName as 'en' | 'es' | 'it');
  }
}

export default globalSetup;
