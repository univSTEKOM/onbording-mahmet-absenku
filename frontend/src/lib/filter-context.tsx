import { createContext, useContext, useState, type ReactNode } from 'react'

interface FilterContextType {
  isFilterOpen: boolean
  setFilterOpen: (open: boolean) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [isFilterOpen, setFilterOpen] = useState(false)

  return (
    <FilterContext.Provider value={{ isFilterOpen, setFilterOpen }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilterContext() {
  const context = useContext(FilterContext)
  if (!context) throw new Error('useFilterContext must be used within FilterProvider')
  return context
}
