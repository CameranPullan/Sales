import { localeManager } from './locales';

async function globalSetup() {
  // Set locale based on project name if available
  const projectName = process.env.PLAYWRIGHT_PROJECT_NAME;
  if (projectName && ['en', 'es'].includes(projectName)) {
    localeManager.setCurrentLocale(projectName as 'en' | 'es');
  }
}

export default globalSetup;
