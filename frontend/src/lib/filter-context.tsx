import { createContext, useContext, useState, type ReactNode } from 'react'

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

  return (
    <FilterContext.Provider value={{ isFilterOpen, setFilterOpen }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilterContext() {
  return useContext(FilterContext)
}
