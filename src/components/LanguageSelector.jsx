import { useLanguage } from '../context/LanguageContext.jsx'

const LanguageSelector = () => {
  const { language, changeLanguage, t } = useLanguage()

  const handleChange = (event) => {
    changeLanguage(event.target.value)
  }

  return (
    <label className="flex items-center space-x-2 text-sm text-gray-600">
      <span className="hidden sm:inline text-gray-500">🌐</span>
      <select
        value={language}
        onChange={handleChange}
        className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
        aria-label="Language selector"
      >
        <option value="en">{t('common.languageNames.en')}</option>
        <option value="zh">{t('common.languageNames.zh')}</option>
      </select>
    </label>
  )
}

export default LanguageSelector
