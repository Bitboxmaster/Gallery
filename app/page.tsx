"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import CategoryFilter from "@/components/category-filter";
import PhotoCard from "@/components/photo-card";
import PhotoModal from "@/components/photo-modal";
import styles from "./page.module.css";
import Link from 'next/link';
import Head from 'next/head'


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
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Получаем список бакетов с сервера
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/list-buckets");
        const data = await res.json();
        // Используем только имена бакетов
        setCategories((data.buckets || []).map((b: { Name: string }) => b.Name));
      } catch (e) {
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  // Загружаем фотографии при изменении выбранной категории или списка категорий
  useEffect(() => {
    async function fetchPhotos() {
      setLoading(true);
      try {
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

        let allPhotos: Photo[] = [];
        for (const bucket of bucketsToFetch) {
          const res = await fetch(`/api/list-photos?bucket=${bucket}`);
          const json = await res.json();
          if (json.files) allPhotos.push(...json.files);
        }
        setPhotos(allPhotos);
      } catch (err) {
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    }

    if (categories.length > 0) {
      fetchPhotos();
    }
  }, [categories, selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsMenuOpen(false);
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

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

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
            <Head>
        <link rel="icon" href="/favicon.ico" />
        {/* Или .png или .svg, если используете другой формат */}
      </Head>
      <div className={styles.headerTitle}>
        <h1><Link href="https://avanpost.su/" target="_blank" rel="noopener noreferrer" className={styles.H1}>АВАНПОСТ</Link></h1>
        <div className={styles.desktopFilter}>
          <CategoryFilter
            categories={["all", ...categories]}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          {/* <div className={styles.contacts}>
            <div>8 800 101 57-96</div>
            <div>+7 (3952) 96-07-96</div>
            <div>Пн.–Сб. 9:00–21:00</div>


          </div> */}
        </div>
        <div className={styles.burger} onClick={toggleMenu}>
          ☰
        </div>
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