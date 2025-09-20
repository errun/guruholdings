const unavailableError = new Error('localStorage is unavailable')

const resolveStorage = () => {
  if (typeof window === 'undefined') {
    return { storage: null, error: unavailableError }
  }

  try {
    return { storage: window.localStorage, error: null }
  } catch (error) {
    return { storage: null, error }
  }
}

export const readStorageValue = (key) => {
  const { storage, error } = resolveStorage()

  if (!storage) {
    return { value: null, error }
  }

  try {
    return { value: storage.getItem(key), error: null }
  } catch (readError) {
    return { value: null, error: readError }
  }
}

export const writeStorageValue = (key, value) => {
  const { storage, error } = resolveStorage()

  if (!storage) {
    return { success: false, error }
  }

  try {
    storage.setItem(key, typeof value === 'string' ? value : String(value))
    return { success: true, error: null }
  } catch (writeError) {
    return { success: false, error: writeError }
  }
}

export const readStorageJSON = (key, fallbackValue) => {
  const { value, error } = readStorageValue(key)

  if (error || value === null) {
    return { value: fallbackValue, error }
  }

  try {
    return { value: JSON.parse(value), error: null }
  } catch (parseError) {
    return { value: fallbackValue, error: parseError }
  }
}

export const writeStorageJSON = (key, data) => {
  try {
    const serialized = JSON.stringify(data)
    return writeStorageValue(key, serialized)
  } catch (stringifyError) {
    return { success: false, error: stringifyError }
  }
}
