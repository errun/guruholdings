import { useState } from 'react'
import { DocumentTextIcon, CalendarIcon, ArrowTopRightOnSquareIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../context/LanguageContext.jsx'
import { buffettLetters } from '../data/buffett-letters.js'

const ShareholderLetters = () => {
  const { t, localizeText } = useLanguage()
  const [expandedLetter, setExpandedLetter] = useState(null)
  const [showAll, setShowAll] = useState(false)

  // 默认显示最近3年的信件，点击"查看更多"显示全部
  const displayedLetters = showAll ? buffettLetters : buffettLetters.slice(0, 3)

  const toggleExpanded = (year) => {
    setExpandedLetter(expandedLetter === year ? null : year)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(t('common.locale'), {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
      <div className="flex items-center mb-6">
        <DocumentTextIcon className="w-8 h-8 text-blue-600 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('shareholderLetters.title')}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('shareholderLetters.subtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {displayedLetters.map((letter) => (
          <div
            key={letter.year}
            className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div
              className="p-6 cursor-pointer"
              onClick={() => toggleExpanded(letter.year)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {letter.year}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {formatDate(letter.publishDate)}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {localizeText(letter.title)}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {localizeText(letter.summary)}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <a
                    href={letter.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-1" />
                    {t('shareholderLetters.readLetter')}
                  </a>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    {expandedLetter === letter.year ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {expandedLetter === letter.year && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {t('shareholderLetters.keyHighlights')}
                  </h4>
                  <ul className="space-y-2">
                    {letter.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                        <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                        <span>{localizeText(highlight)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {buffettLetters.length > 3 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
          >
            {showAll ? (
              <>
                <ChevronUpIcon className="w-4 h-4 mr-1" />
                {t('shareholderLetters.showLess')}
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4 mr-1" />
                {t('shareholderLetters.showMore')}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default ShareholderLetters
