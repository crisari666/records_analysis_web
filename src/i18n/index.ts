import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enUsers from './locales/en/users.json';
import enRecords from './locales/en/records.json';
import enProjects from './locales/en/projects.json';
import esAuth from './locales/es/auth.json';
import esDashboard from './locales/es/dashboard.json';
import esUsers from './locales/es/users.json';
import esRecords from './locales/es/records.json';
import esProjects from './locales/es/projects.json';

const resources = {
  en: {
    auth: enAuth,
    dashboard: enDashboard,
    users: enUsers,
    records: enRecords,
    projects: enProjects,
  },
  es: {
    auth: esAuth,
    dashboard: esDashboard,
    users: esUsers,
    records: esRecords,
    projects: esProjects,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    defaultNS: 'common',
  });

export default i18n;
