"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import CategoryFilter from "@/components/category-filter";
import PhotoCard from "@/components/photo-card";
import PhotoModal from "@/components/photo-modal";
import styles from "./page.module.css";

// === Инициализация Supabase ===
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Тип данных для одной фотографии
interface Photo {
  id: string;
  name: string;
  url: string;
  category: string;
}

export default function Home() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Состояние для показа/скрытия «бургер-меню» на мобильных
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // === Загрузка списка категорий (бакетов) ===
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) throw error;
        if (data) {
          setCategories(data.map((bucket) => bucket.name));
        }
      } catch (err) {
        console.error("Ошибка при получении категорий:", err);
      }
    }
    fetchCategories();
  }, []);

  // === Загрузка фотографий при изменении списка категорий/фильтра ===
  useEffect(() => {
    async function fetchPhotos() {
      setLoading(true);
      try {
        const allPhotos: Photo[] = [];
        const bucketsToFetch =
          selectedCategory === "all" ? categories : [selectedCategory];

        if (
          bucketsToFetch.length === 0 ||
          (selectedCategory !== "all" && !categories.includes(selectedCategory))
        ) {
          setPhotos([]);
          setLoading(false);
          return;
        }

        for (const bucket of bucketsToFetch) {
          const { data, error } = await supabase.storage.from(bucket).list();
          if (error) {
            console.error(`Ошибка при получении файлов из ${bucket}:`, error);
            continue;
          }
          if (data) {
            const imageFiles = data.filter(
              (file) =>
                !file.id.includes("/") &&
                (file.name.endsWith(".jpg") ||
                  file.name.endsWith(".jpeg") ||
                  file.name.endsWith(".png") ||
                  file.name.endsWith(".gif") ||
                  file.name.endsWith(".svg") ||
                  file.name.endsWith(".webp"))
            );

            const bucketPhotos = imageFiles.map((file) => {
              const url = supabase.storage.from(bucket).getPublicUrl(file.name)
                .data.publicUrl;
              return {
                id: file.id,
                name: file.name.split(".")[0],
                url,
                category: bucket,
              };
            });
            allPhotos.push(...bucketPhotos);
          }
        }

        setPhotos(allPhotos);
      } catch (err) {
        console.error("Ошибка при получении фотографий:", err);
      } finally {
        setLoading(false);
      }
    }

    if (categories.length > 0) {
      fetchPhotos();
    }
  }, [categories, selectedCategory]);

  // === Обработчики ===
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsMenuOpen(false); // Закрываем мобильное меню после выбора
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${photo.name}.${blob.type.split("/")[1]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Ошибка при скачивании файла:", err);
    }
  };

  // Открытие/закрытие мобильного меню при клике на бургер
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Закрываем меню при клике вне его области
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    },
    [isMenuOpen]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <>
      {/* =================================================
          1) Шапка «АВАНПОСТ» + бургер (мобильный ≤ 640px)
         ================================================= */}
      <div className={styles.headerTitle}>
        <h1>АВАНПОСТ</h1>
                     <div className={styles.desktopFilter}>
        <CategoryFilter
          categories={["all", ...categories]}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        </div>
        {/* Бургер-иконка: показывается только на мобилке */}
        <div className={styles.burger} onClick={toggleMenu}>
          ☰
        </div>

        {/* =================================================
             2) Выпадающее меню (мобильный фильтр ≤ 640px)
           ================================================= */}
        {isMenuOpen && (
          <div className={styles.menuDropdown} ref={menuRef}>
            <div className={styles.filterContainer}>
              <CategoryFilter
                categories={["all", ...categories]}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          3) Статичный фильтр (десктоп ≥ 640px)
         ================================================= */}


      {/* =================================================
         4) Основной контент: галерея (фон #f0f0f0)
         ================================================= */}
         
      <main className={styles.main}>

        <div className={styles.photoGrid}>
          {loading ? (
            <div className={styles.loading}>Загрузка фотографий...</div>
          ) : photos.length > 0 ? (
            photos.map((photo) => (
              <div key={photo.id} className={styles.cardWrapper}>
                <PhotoCard
                  photo={photo}
                  onPhotoClick={handlePhotoClick}
                  onDownload={handleDownload}
                />
              </div>
            ))
          ) : (
            <div className={styles.noPhotos}>Фотографии не найдены</div>
          )}
        </div>

        {/* Модальное окно для увеличения/скачивания фото */}
        <PhotoModal
          photo={selectedPhoto}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onDownload={handleDownload}
        />
      </main>
    </>
  );
}
