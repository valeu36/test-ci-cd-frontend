import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "@/services/i18n/en";

// Imported once for its side effect, from main.tsx and src/test/setup.ts.
void i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: { en: { translation: en } },
  interpolation: { escapeValue: false }, // React already escapes
});

export default i18n;
