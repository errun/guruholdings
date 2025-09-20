import { useEffect, useState } from 'react'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../context/LanguageContext.jsx'

const STORAGE_KEY = 'subscribers'

const readSubscribersSafely = () => {
  if (typeof window === 'undefined') {
    return { subscribers: [], error: new Error('localStorage is unavailable') }
  }

  let storage

  try {
    storage = window.localStorage
  } catch (error) {
    return { subscribers: [], error }
  }

  if (typeof storage === 'undefined' || storage === null) {
    return { subscribers: [], error: new Error('localStorage is unavailable') }
  }

  try {
    const stored = storage.getItem(STORAGE_KEY)

    if (!stored) {
      return { subscribers: [], error: null }
    }

    const parsed = JSON.parse(stored)

    if (Array.isArray(parsed)) {
      return { subscribers: parsed, error: null }
    }

    return { subscribers: [], error: new Error('Stored subscribers value is not an array') }
  } catch (error) {
    return { subscribers: [], error }
  }
}

const persistSubscribersSafely = (subscribers) => {
  if (typeof window === 'undefined') {
    return { success: false, error: new Error('localStorage is unavailable') }
  }

  let storage

  try {
    storage = window.localStorage
  } catch (error) {
    return { success: false, error }
  }

  if (typeof storage === 'undefined' || storage === null) {
    return { success: false, error: new Error('localStorage is unavailable') }
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(subscribers))
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error }
  }
}

const SubscribeForm = () => {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [subscriberCount, setSubscriberCount] = useState(0)

  useEffect(() => {
    const { subscribers, error } = readSubscribersSafely()

    if (error) {
      console.warn('[subscribe] Unable to read subscribers from storage', error)
    }

    setSubscriberCount(subscribers.length)
  }, [])

  const validateEmail = (value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      setStatus('error')
      setMessage(t('subscribe.messages.required'))
      return
    }

    if (!validateEmail(email)) {
      setStatus('error')
      setMessage(t('subscribe.messages.invalid'))
      return
    }

    setStatus('loading')

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const { subscribers, error: readError } = readSubscribersSafely()

      if (readError) {
        console.warn('[subscribe] Unable to read subscribers from storage', readError)
        setStatus('error')
        setMessage(t('subscribe.messages.storageUnavailable'))
        return
      }

      if (subscribers.includes(email)) {
        setStatus('error')
        setMessage(t('subscribe.messages.exists'))
        return
      }

      const nextSubscribers = [...subscribers, email]
      const { success: persistSuccess, error: persistError } = persistSubscribersSafely(nextSubscribers)

      if (!persistSuccess) {
        console.warn('[subscribe] Unable to persist subscribers to storage', persistError)
        setStatus('error')
        setMessage(t('subscribe.messages.storageUnavailable'))
        return
      }

      setStatus('success')
      setMessage(t('subscribe.messages.success'))
      setEmail('')
      setSubscriberCount(nextSubscribers.length)

      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch {
      setStatus('error')
      setMessage(t('subscribe.messages.failure'))
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border border-blue-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {t('subscribe.title')}
      </h2>
      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
        {t('subscribe.description')}
      </p>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4 space-y-4 sm:space-y-0">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('subscribe.placeholder')}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {status === 'loading' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{t('subscribe.buttonLoading')}</span>
              </>
            ) : (
              <span>{t('subscribe.button')}</span>
            )}
          </button>
        </div>

        {message && (
          <div
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg ${
              status === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {status === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5" />
            )}
            <span className="text-sm">{message}</span>
          </div>
        )}
      </form>

      <p className="text-xs text-gray-500 mt-4">
        {t('subscribe.promise')}
      </p>

      <div className="mt-6 pt-4 border-t border-blue-200">
        <SubscriberCount count={subscriberCount} />
      </div>
    </div>
  )
}

const SubscriberCount = ({ count }) => {
  const { t } = useLanguage()

  return (
    <div className="text-sm text-gray-600">
      {t('subscribe.subscriberCount', { count })}
    </div>
  )
}

export default SubscribeForm
