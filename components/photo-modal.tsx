"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { X, Download } from "lucide-react"
import styles from "./photo-modal.module.css"
import { translateCategory } from "@/utils/translate"

interface Photo {
  id: string
  name: string
  url: string
  category: string
}

interface PhotoModalProps {
  photo: Photo | null
  isOpen: boolean
  onClose: () => void
  onDownload: (photo: Photo) => void
}

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, isOpen, onClose, onDownload }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Блокировка прокрутки страницы при открытом модальном окне
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    // Обработчик клавиши Escape для закрытия модального окна
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    // Обработчик клика вне модального окна для его закрытия
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.body.style.overflow = "auto"
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen || !photo) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{photo.name}</h3>
          <div className={styles.modalActions}>
            <button className={styles.actionButton} onClick={() => onDownload(photo)} aria-label="Скачать фото">
              <Download size={24} />
            </button>
            <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className={styles.modalImageContainer}>
          <Image
            src={photo.url || "/placeholder.svg"}
            alt={photo.name}
            fill
            sizes="(max-width: 768px) 100vw, 80vw"
            className={styles.modalImage}
            priority
          />
        </div>
        <div className={styles.modalFooter}>
          <p className={styles.modalCategory}>{translateCategory(photo.category)}</p>
        </div>
      </div>
    </div>
  )
}

export default PhotoModal

