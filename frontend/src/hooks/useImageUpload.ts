import { useState } from 'react';
import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface UseImageUploadResult {
  uploading: boolean;
  error: string | null;
  upload: (file: File, bucket: string, path?: string) => Promise<string | null>;
}

export function useImageUpload(): UseImageUploadResult {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File, bucket: string, path?: string): Promise<string | null> {
    setError(null);

    if (file.size > MAX_FILE_SIZE) {
      setError('File must be 5MB or smaller');
      return null;
    }

    const ext = file.name.split('.').pop() ?? 'jpg';
    const filePath = path ?? `${crypto.randomUUID()}.${ext}`;

    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        return null;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  return { uploading, error, upload };
}
