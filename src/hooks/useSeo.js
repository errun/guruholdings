import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ensureMetaTag = (attribute, value) => {
  let element = document.head.querySelector(`meta[${attribute}="${value}"]`)
  let existed = true

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, value)
    document.head.appendChild(element)
    existed = false
  }

  return { element, existed }
}

const ensureLinkTag = (rel) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`)
  let existed = true

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
    existed = false
  }

  return { element, existed }
}

export const useSeo = (config) => {
  const location = useLocation()

  useEffect(() => {
    if (!config) return undefined

    const { title, description, keywords, structuredData, openGraph } = config
    const cleanups = []

    const { canonicalUrl, currentUrl } = (() => {
      if (typeof window === 'undefined') {
        return { canonicalUrl: '', currentUrl: '' }
      }

      const origin = window.location.origin
      const canonicalPath = location.pathname.endsWith('/') && location.pathname !== '/'
        ? location.pathname.slice(0, -1)
        : location.pathname || '/'
      const canonical = `${origin}${canonicalPath}`
      const current = `${canonical}${location.search || ''}${location.hash || ''}`
      return { canonicalUrl: canonical, currentUrl: current }
    })()

    if (title) {
      const previousTitle = document.title
      document.title = title
      cleanups.push(() => {
        document.title = previousTitle
      })
    }

    const updateMetaTag = (attribute, value, content) => {
      if (!content) return

      const { element, existed } = ensureMetaTag(attribute, value)
      const previousContent = element.getAttribute('content')
      element.setAttribute('content', content)

      cleanups.push(() => {
        if (existed) {
          if (previousContent !== null) {
            element.setAttribute('content', previousContent)
          } else {
            element.removeAttribute('content')
          }
        } else {
          element.remove()
        }
      })
    }

    if (description) {
      updateMetaTag('name', 'description', description)
    }

    if (keywords) {
      updateMetaTag('name', 'keywords', keywords)
    }

    const ogConfig = {
      type: 'website',
      title,
      description,
      url: currentUrl,
      ...(openGraph || {})
    }

    Object.entries(ogConfig).forEach(([key, value]) => {
      if (value) {
        updateMetaTag('property', `og:${key}`, value)
      }
    })

    updateMetaTag('name', 'twitter:card', 'summary_large_image')
    if (title) {
      updateMetaTag('name', 'twitter:title', title)
    }
    if (description) {
      updateMetaTag('name', 'twitter:description', description)
    }

    if (canonicalUrl) {
      const { element, existed } = ensureLinkTag('canonical')
      const previousHref = element.getAttribute('href')
      element.setAttribute('href', canonicalUrl)

      cleanups.push(() => {
        if (existed) {
          if (previousHref !== null) {
            element.setAttribute('href', previousHref)
          } else {
            element.removeAttribute('href')
          }
        } else {
          element.remove()
        }
      })
    }

    if (structuredData) {
      const data = typeof structuredData === 'function'
        ? structuredData({ canonicalUrl })
        : structuredData

      if (data) {
        const script = document.createElement('script')
        script.setAttribute('type', 'application/ld+json')
        script.setAttribute('data-seo', 'structured-data')
        script.text = JSON.stringify(data)
        document.head.appendChild(script)

        cleanups.push(() => {
          script.remove()
        })
      }
    }

    return () => {
      while (cleanups.length > 0) {
        const cleanup = cleanups.pop()
        cleanup()
      }
    }
  }, [config, location.pathname, location.search, location.hash])
}

export default useSeo
