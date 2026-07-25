import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delayMs: number): T {
  var [debounced, setDebounced] = useState(value)

  useEffect(function() {
    var id = setTimeout(function() { setDebounced(value) }, delayMs)
    return function() { clearTimeout(id) }
  }, [value, delayMs])

  return debounced
}
