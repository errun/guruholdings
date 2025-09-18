import { useState } from 'react'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

const SubscribeForm = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [message, setMessage] = useState('')

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setStatus('error')
      setMessage('请输入邮箱地址')
      return
    }

    if (!validateEmail(email)) {
      setStatus('error')
      setMessage('请输入有效的邮箱地址')
      return
    }

    setStatus('loading')
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 在实际应用中，这里会调用真实的订阅API
      // 现在我们只是将邮箱存储到localStorage作为演示
      const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]')
      
      if (subscribers.includes(email)) {
        setStatus('error')
        setMessage('该邮箱已经订阅过了')
        return
      }
      
      subscribers.push(email)
      localStorage.setItem('subscribers', JSON.stringify(subscribers))
      
      setStatus('success')
      setMessage('订阅成功！我们会在每季度更新时通知您。')
      setEmail('')
      
      // 3秒后重置状态
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
      
    } catch (error) {
      setStatus('error')
      setMessage('订阅失败，请稍后重试')
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border border-blue-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        订阅持仓更新
      </h2>
      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
        每季度13F报告发布后，我们会第一时间为您分析持仓变化，
        并通过邮件发送详细的投资简报。
      </p>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="flex space-x-4 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="输入您的邮箱地址"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={status === 'loading'}
          />
          <button 
            type="submit"
            disabled={status === 'loading'}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            {status === 'loading' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>订阅中...</span>
              </>
            ) : (
              <span>订阅</span>
            )}
          </button>
        </div>
        
        {/* 状态消息 */}
        {message && (
          <div className={`flex items-center justify-center space-x-2 p-3 rounded-lg ${
            status === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
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
        我们承诺不会发送垃圾邮件，您可以随时取消订阅。
      </p>
      
      {/* 订阅统计 */}
      <div className="mt-6 pt-4 border-t border-blue-200">
        <SubscriberCount />
      </div>
    </div>
  )
}

const SubscriberCount = () => {
  const [count, setCount] = useState(0)

  useState(() => {
    const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]')
    setCount(subscribers.length)
  }, [])

  return (
    <div className="text-sm text-gray-600">
      <span className="font-medium text-blue-600">{count}</span> 位投资者已订阅
    </div>
  )
}

export default SubscribeForm
