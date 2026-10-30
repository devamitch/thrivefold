/**
 * Languages the coach can reply, read aloud and translate in. `code` is the ML Kit translation
 * tag (on-device), `locale` the speech locale for text-to-speech and recognition.
 * Every language ML Kit translation supports on Android is listed; speech depends on the voices
 * installed on the phone.
 */
export interface AppLanguage {
  code: string;
  label: string;
  native: string;
  locale: string;
}

export const LANGUAGES: AppLanguage[] = [
  { code: 'en', label: 'English', native: 'English', locale: 'en-IN' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', locale: 'hi-IN' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', locale: 'bn-IN' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', locale: 'mr-IN' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', locale: 'ta-IN' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', locale: 'te-IN' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', locale: 'gu-IN' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', locale: 'kn-IN' },
  { code: 'ur', label: 'Urdu', native: 'اردو', locale: 'ur-IN' },
  { code: 'zh', label: 'Chinese', native: '中文', locale: 'zh-CN' },
  { code: 'ja', label: 'Japanese', native: '日本語', locale: 'ja-JP' },
  { code: 'ko', label: 'Korean', native: '한국어', locale: 'ko-KR' },
  { code: 'ar', label: 'Arabic', native: 'العربية', locale: 'ar-SA' },
  { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt', locale: 'vi-VN' },
  { code: 'th', label: 'Thai', native: 'ไทย', locale: 'th-TH' },
  { code: 'id', label: 'Indonesian', native: 'Bahasa Indonesia', locale: 'id-ID' },
  { code: 'ms', label: 'Malay', native: 'Bahasa Melayu', locale: 'ms-MY' },
  { code: 'tl', label: 'Tagalog', native: 'Tagalog', locale: 'fil-PH' },
  { code: 'fa', label: 'Persian', native: 'فارسی', locale: 'fa-IR' },
  { code: 'tr', label: 'Turkish', native: 'Türkçe', locale: 'tr-TR' },
  { code: 'he', label: 'Hebrew', native: 'עברית', locale: 'he-IL' },
  { code: 'ru', label: 'Russian', native: 'Русский', locale: 'ru-RU' },
  { code: 'uk', label: 'Ukrainian', native: 'Українська', locale: 'uk-UA' },
  { code: 'es', label: 'Spanish', native: 'Español', locale: 'es-ES' },
  { code: 'pt', label: 'Portuguese', native: 'Português', locale: 'pt-BR' },
  { code: 'fr', label: 'French', native: 'Français', locale: 'fr-FR' },
  { code: 'de', label: 'German', native: 'Deutsch', locale: 'de-DE' },
  { code: 'it', label: 'Italian', native: 'Italiano', locale: 'it-IT' },
  { code: 'nl', label: 'Dutch', native: 'Nederlands', locale: 'nl-NL' },
  { code: 'pl', label: 'Polish', native: 'Polski', locale: 'pl-PL' },
  { code: 'sv', label: 'Swedish', native: 'Svenska', locale: 'sv-SE' },
  { code: 'da', label: 'Danish', native: 'Dansk', locale: 'da-DK' },
  { code: 'no', label: 'Norwegian', native: 'Norsk', locale: 'nb-NO' },
  { code: 'fi', label: 'Finnish', native: 'Suomi', locale: 'fi-FI' },
  { code: 'el', label: 'Greek', native: 'Ελληνικά', locale: 'el-GR' },
  { code: 'cs', label: 'Czech', native: 'Čeština', locale: 'cs-CZ' },
  { code: 'ro', label: 'Romanian', native: 'Română', locale: 'ro-RO' },
  { code: 'hu', label: 'Hungarian', native: 'Magyar', locale: 'hu-HU' },
  { code: 'sw', label: 'Swahili', native: 'Kiswahili', locale: 'sw-KE' },
  { code: 'af', label: 'Afrikaans', native: 'Afrikaans', locale: 'af-ZA' },
];

export const languageOf = (code: string | null | undefined): AppLanguage => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
