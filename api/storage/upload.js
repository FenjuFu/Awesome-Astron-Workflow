import { supabaseAdmin } from '../lib/supabase-admin.js';

const parseBase64 = (base64Data) => {
  if (typeof base64Data !== 'string' || !base64Data.trim()) {
    throw new Error('缺少图片数据');
  }

  return Buffer.from(base64Data, 'base64');
};

const ensureBucketExists = async (bucket) => {
  const { data: bucketData, error } = await supabaseAdmin.storage.getBucket(bucket);

  if (!error && bucketData) {
    return;
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: '5MB',
  });

  if (createError && !createError.message?.includes('already exists')) {
    throw createError;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      bucket = process.env.VITE_SUPABASE_IMAGE_BUCKET || 'activity-images',
      fileName,
      contentType = 'image/png',
      base64Data,
    } = req.body || {};

    if (!fileName) {
      return res.status(400).json({ error: '缺少文件名' });
    }

    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return res.status(500).json({ error: '服务器配置错误：缺少 Supabase 环境变量' });
    }

    await ensureBucketExists(bucket);

    const fileBuffer = parseBase64(base64Data);
    const filePath = `editor-images/${Date.now()}_${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(filePath, fileBuffer, {
      contentType,
      upsert: false,
      cacheControl: '3600',
    });

    if (uploadError) {
      console.error('Supabase upload error details:', uploadError);
      throw new Error(`Supabase 上传失败: ${uploadError.message}`);
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);

    return res.status(200).json({ publicUrl: data.publicUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: error?.message || '图片上传失败' });
  }
}
