import { supabase } from './supabaseClient';

/**
 * Fungsi untuk mengunggah file gambar ke bucket Supabase 
 * dan mengembalikan URL publiknya.
 */
export const uploadImageToSupabase = async (file: File, folder: string = 'originals'): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // 1. Ubah ke huruf kecil sesuai nama asli di Supabase
    const { error: uploadError } = await supabase.storage
      .from('blast_images') 
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false 
      });

    if (uploadError) {
      console.error('Gagal mengunggah gambar ke Supabase:', uploadError.message);
      return null;
    }

    // 2. Ubah ke huruf kecil juga di sini
    const { data } = supabase.storage
      .from('blast_images')
      .getPublicUrl(filePath);

    return data.publicUrl;

  } catch (error) {
    console.error('Terjadi kesalahan internal saat unggah:', error);
    return null;
  }
};