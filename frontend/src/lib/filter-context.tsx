import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface FilterContextType {
  isFilterOpen: boolean
  setFilterOpen: (open: boolean) => void
}

const FilterContext = createContext<FilterContextType>({
  isFilterOpen: false,
  setFilterOpen: () => {},
})

export function FilterProvider({ children }: { children: ReactNode }) {
  const [isFilterOpen, setFilterOpen] = useState(false)

  const value = useMemo(() => ({ isFilterOpen, setFilterOpen }), [isFilterOpen])

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilterContext() {
  return useContext(FilterContext)
}
