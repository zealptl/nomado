import { useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';

interface UploadedPhoto {
  url: string;
  file: File;
}

interface PhotoUploaderProps {
  onPhotosChange: (urls: string[]) => void;
  maxPhotos?: number;
}

export default function PhotoUploader({ onPhotosChange, maxPhotos = 10 }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { uploading, upload } = useImageUpload();

  async function handleFiles(files: FileList) {
    const newErrors: string[] = [];
    const uploaded: UploadedPhoto[] = [];

    for (const file of Array.from(files)) {
      if (photos.length + uploaded.length >= maxPhotos) break;
      if (file.size > 5 * 1024 * 1024) {
        newErrors.push(`${file.name}: must be 5MB or smaller`);
        continue;
      }
      const url = await upload(file, 'item-photos');
      if (url) {
        uploaded.push({ url, file });
      }
    }

    setErrors(newErrors);
    const next = [...photos, ...uploaded];
    setPhotos(next);
    onPhotosChange(next.map(p => p.url));
  }

  function removePhoto(index: number) {
    const next = photos.filter((_, i) => i !== index);
    setPhotos(next);
    onPhotosChange(next.map(p => p.url));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => e.target.files && handleFiles(e.target.files)}
      />

      {photos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {photos.map((photo, i) => (
            <div key={i} style={{ position: 'relative', width: '72px', height: '72px' }}>
              <img
                src={photo.url}
                alt={`Photo ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(124,106,90,0.2)' }}
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#2C1A0E',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
                aria-label="Remove photo"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < maxPhotos && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            border: '1.5px dashed rgba(124,106,90,0.4)',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.5)',
            color: 'var(--color-text-muted)',
            cursor: uploading ? 'default' : 'pointer',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 150ms ease',
            width: '100%',
            justifyContent: 'center',
          }}
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
        </button>
      )}

      {errors.map((err, i) => (
        <p key={i} style={{ color: 'var(--color-secondary)', fontSize: '12px' }}>{err}</p>
      ))}
    </div>
  );
}
