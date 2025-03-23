"use client"

import type React from "react"
import Image from "next/image"
import { Download } from "lucide-react"
import styles from "./photo-card.module.css"
import { translateCategory } from "@/utils/translate"

interface Photo {
  id: string
  name: string
  url: string
  category: string
}

interface PhotoCardProps {
  photo: Photo
  onPhotoClick: (photo: Photo) => void
  onDownload: (photo: Photo) => void
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onPhotoClick, onDownload }) => {
  return (
    <div className={styles.card}>
      <div
        className={styles.imageContainer}
        onClick={() => onPhotoClick(photo)}
        role="button"
        tabIndex={0}
        aria-label={`Открыть фото ${photo.name}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onPhotoClick(photo)
          }
        }}
      >
        <Image
          src={photo.url || "/placeholder.svg"}
          alt={photo.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.image}
        />
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardInfo}>
          <h3 className={styles.photoTitle}>{photo.name}</h3>
          <p className={styles.photoCategory}>{translateCategory(photo.category)}</p>
        </div>
        <button className={styles.downloadButton} onClick={() => onDownload(photo)} aria-label="Скачать фото">
          <Download size={20} />
        </button>
      </div>
    </div>
  )
}

export default PhotoCard

