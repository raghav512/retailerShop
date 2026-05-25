import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resources } from "./resources";

// Initialize i18n synchronously first with default language
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v3",
    fallbackLng: "en",
    lng: "en", // Set default language explicitly
    resources,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Disable suspense to avoid loading issues
    },
  });

// Then load saved language asynchronously
AsyncStorage.getItem("APP_LANGUAGE")
  .then((lang) => {
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
  })
  .catch((error) => {
    console.log("Language load error:", error);
  });

export default i18n;
