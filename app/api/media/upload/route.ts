import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE || '5242880'); // 5MB
    const allowedTypes = (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/webp').split(',');

    const urls: string[] = [];
    const thumbnails: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} not allowed` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` },
          { status: 400 }
        );
      }

      const buffer = await file.arrayBuffer();
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const filename = `${randomUUID()}.jpg`;

      // Create directories
      const uploadDir = join(process.cwd(), 'public', 'uploads', year.toString(), month);
      const thumbDir = join(process.cwd(), 'public', 'uploads', 'thumbs');
      
      await mkdir(uploadDir, { recursive: true });
      await mkdir(thumbDir, { recursive: true });

      // Process image with Sharp
      const processedImage = await sharp(Buffer.from(buffer))
        .jpeg({ quality: 85 })
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();

      // Create thumbnail
      const thumbnail = await sharp(Buffer.from(buffer))
        .jpeg({ quality: 80 })
        .resize(200, 200, { fit: 'cover' })
        .toBuffer();

      // Save files
      const filePath = join(uploadDir, filename);
      const thumbPath = join(thumbDir, filename);

      await writeFile(filePath, processedImage);
      await writeFile(thumbPath, thumbnail);

      // Generate URLs
      const url = `/uploads/${year}/${month}/${filename}`;
      const thumbUrl = `/uploads/thumbs/${filename}`;

      urls.push(url);
      thumbnails.push(thumbUrl);
    }

    return NextResponse.json({
      urls,
      thumbnails,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
