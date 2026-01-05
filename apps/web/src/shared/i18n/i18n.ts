import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enTranslation from "../locales/en.json";
import viTranslation from "../locales/vi.json";

const resources = {
	en: { translation: enTranslation },
	vi: { translation: viTranslation },
};

const currentLanguage = localStorage.getItem("i18nextLng") || "vi";

i18n
	.use(initReactI18next)
	.use(LanguageDetector)
	.init({
		resources,
		lng: currentLanguage,
		fallbackLng: "vi",
		detection: {
			order: ["navigator", "localStorage", "cookie"],
			caches: ["localStorage", "cookie"],
		},
		interpolation: {
			escapeValue: false,
		},
	})
	.then(() => {
		i18n.changeLanguage(currentLanguage);
	});

export default i18n;
