"use client"

import type React from "react"
import styles from "./category-filter.module.css"
import { translateCategory } from "@/utils/translate"

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className={styles.filterContainer}>
      {categories.map((category) => (
        <button
          key={category}
          className={`${styles.filterButton} ${selectedCategory === category ? styles.active : ""}`}
          onClick={() => onCategoryChange(category)}
        >
          {translateCategory(category)}
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter

