"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import CategoryFilter from "@/components/category-filter"
import PhotoCard from "@/components/photo-card"
import PhotoModal from "@/components/photo-modal"
import styles from "./page.module.css"

// Инициализация Supabase клиента
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Типы данных
interface Photo {
  id: string
  name: string
  url: string
  category: string
}

export default function Home() {
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Получение списка категорий (buckets)
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase.storage.listBuckets()

        if (error) {
          throw error
        }

        if (data) {
          const bucketNames = data.map((bucket) => bucket.name)
          setCategories(bucketNames)
        }
      } catch (error) {
        console.error("Ошибка при получении категорий:", error)
      }
    }

    fetchCategories()
  }, [])

  // Получение фотографий из всех категорий или выбранной категории
  useEffect(() => {
    async function fetchPhotos() {
      setLoading(true)
      try {
        const allPhotos: Photo[] = []

        // Если выбрана категория "все", получаем фото из всех категорий
        const bucketsToFetch = selectedCategory === "all" ? categories : [selectedCategory]

        // Пропускаем, если нет категорий или если выбрана конкретная категория, которой нет в списке
        if (bucketsToFetch.length === 0 || (selectedCategory !== "all" && !categories.includes(selectedCategory))) {
          setPhotos([])
          setLoading(false)
          return
        }

        // Получаем фото из каждой категории
        for (const bucket of bucketsToFetch) {
          const { data, error } = await supabase.storage.from(bucket).list()

          if (error) {
            console.error(`Ошибка при получении файлов из ${bucket}:`, error)
            continue
          }

          if (data) {
            // Фильтруем только изображения
            const imageFiles = data.filter(
              (file) =>
                !file.id.includes("/") &&
                (file.name.endsWith(".jpg") ||
                  file.name.endsWith(".jpeg") ||
                  file.name.endsWith(".png") ||
                  file.name.endsWith(".gif") ||
                  file.name.endsWith(".svg") ||
                  file.name.endsWith(".webp")),
            )

            // Создаем объекты фотографий
            const bucketPhotos = imageFiles.map((file) => {
              const url = supabase.storage.from(bucket).getPublicUrl(file.name).data.publicUrl
              return {
                id: file.id,
                name: file.name.split(".")[0], // Имя файла без расширения
                url,
                category: bucket,
              }
            })

            allPhotos.push(...bucketPhotos)
          }
        }

        setPhotos(allPhotos)
      } catch (error) {
        console.error("Ошибка при получении фотографий:", error)
      } finally {
        setLoading(false)
      }
    }

    if (categories.length > 0) {
      fetchPhotos()
    }
  }, [categories, selectedCategory])

  // Обработчик изменения категории
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  // Обработчик клика по фотографии
  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo)
    setIsModalOpen(true)
  }

  // Обработчик закрытия модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  // Обработчик скачивания фотографии
  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${photo.name}.${blob.type.split("/")[1]}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Ошибка при скачивании файла:", error)
    }
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Аванпост</h1>

      {/* Фильтр категорий */}
      <CategoryFilter
        categories={["all", ...categories]}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Сетка фотографий */}
      <div className={styles.photoGrid}>
        {loading ? (
          <div className={styles.loading}>Загрузка фотографий...</div>
        ) : photos.length > 0 ? (
          photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} onPhotoClick={handlePhotoClick} onDownload={handleDownload} />
          ))
        ) : (
          <div className={styles.noPhotos}>Фотографии не найдены</div>
        )}
      </div>

      {/* Модальное окно для просмотра фотографии */}
      <PhotoModal photo={selectedPhoto} isOpen={isModalOpen} onClose={handleCloseModal} onDownload={handleDownload} />
    </main>
  )
}

