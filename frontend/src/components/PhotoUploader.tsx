import { useRef, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useImageUpload } from '../hooks/useImageUpload'

interface UploadedPhoto {
  url: string
  file: File
}

interface PhotoUploaderProps {
  onPhotosChange: (urls: string[]) => void
  maxPhotos?: number
}

export default function PhotoUploader({ onPhotosChange, maxPhotos = 10 }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const { uploading, upload } = useImageUpload()

  async function handleFiles(files: FileList) {
    const newErrors: string[] = []
    const uploaded: UploadedPhoto[] = []

    for (const file of Array.from(files)) {
      if (photos.length + uploaded.length >= maxPhotos) break
      if (file.size > 5 * 1024 * 1024) {
        newErrors.push(`${file.name}: must be 5MB or smaller`)
        continue
      }
      const url = await upload(file, 'item-photos')
      if (url) {
        uploaded.push({ url, file })
      }
    }

    setErrors(newErrors)
    const next = [...photos, ...uploaded]
    setPhotos(next)
    onPhotosChange(next.map(p => p.url))
  }

  function removePhoto(index: number) {
    const next = photos.filter((_, i) => i !== index)
    setPhotos(next)
    onPhotosChange(next.map(p => p.url))
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => e.target.files && handleFiles(e.target.files)}
      />

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((photo, i) => (
            <div key={i} className="relative w-[72px] h-[72px]">
              <img
                src={photo.url}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground text-background border-0 cursor-pointer flex items-center justify-center p-0 hover:bg-foreground/80 transition-colors"
                aria-label="Remove photo"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < maxPhotos && (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-dashed gap-2 text-muted-foreground hover:text-foreground"
        >
          {uploading ? (
            <>
              <ImageIcon size={16} />
              Uploading…
            </>
          ) : (
            <>
              <Upload size={16} />
              Add Photos
            </>
          )}
        </Button>
      )}

      {errors.map((err, i) => (
        <p key={i} className="text-destructive text-xs">{err}</p>
      ))}
    </div>
  )
}
