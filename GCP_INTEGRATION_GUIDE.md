# GCP Integration Guide for VideoVault MVP

This guide provides step-by-step instructions for integrating Google Cloud Platform services with your VideoVault application.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Next.js API    │    │   GCP Services  │
│                 │    │                  │    │                 │
│ • Web App       │───▶│ • Upload Route   │───▶│ • Cloud Storage │
│ • Mobile App    │    │ • Video API      │    │ • Firestore     │
│                 │    │ • Auth Middleware│    │ • Cloud Run     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Setup

### 1. GCP Project Setup

```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable Required APIs

```bash
# Enable necessary services
gcloud services enable storage.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 3. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create videovault-service \
    --display-name="VideoVault Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:videovault-service@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:videovault-service@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/datastore.user"

# Create and download key
gcloud iam service-accounts keys create ./gcp-key.json \
    --iam-account=videovault-service@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## 📦 Cloud Storage Setup

### Create Storage Bucket

```bash
# Create bucket for video storage
gsutil mb -p YOUR_PROJECT_ID -c STANDARD -l us-central1 gs://videovault-videos

# Set bucket permissions
gsutil iam ch allUsers:objectViewer gs://videovault-videos
```

### Storage Integration Code

Create `src/lib/gcp-storage.ts`:

```typescript
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE,
});

const bucket = storage.bucket(process.env.GCP_STORAGE_BUCKET!);

export async function uploadVideo(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const blob = bucket.file(`videos/${Date.now()}-${fileName}`);
  
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', reject);
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });
    blobStream.end(file);
  });
}

export async function deleteVideo(fileName: string): Promise<void> {
  await bucket.file(fileName).delete();
}
```

## 🔥 Firestore Setup

### Initialize Firestore

```bash
# Initialize Firestore in your project
gcloud firestore databases create --region=us-central1
```

### Firestore Integration Code

Create `src/lib/firestore.ts`:

```typescript
import { Firestore } from '@google-cloud/firestore';

const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE,
});

export interface VideoDocument {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  uploadedAt: Date;
  userId: string;
  duration?: string;
  size: number;
  contentType: string;
}

export async function saveVideo(video: Omit<VideoDocument, 'id'>): Promise<string> {
  const docRef = await firestore.collection('videos').add({
    ...video,
    uploadedAt: new Date(),
  });
  return docRef.id;
}

export async function getVideos(userId: string): Promise<VideoDocument[]> {
  const snapshot = await firestore
    .collection('videos')
    .where('userId', '==', userId)
    .orderBy('uploadedAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as VideoDocument[];
}

export async function deleteVideo(videoId: string): Promise<void> {
  await firestore.collection('videos').doc(videoId).delete();
}

export async function updateVideo(
  videoId: string, 
  updates: Partial<VideoDocument>
): Promise<void> {
  await firestore.collection('videos').doc(videoId).update(updates);
}
```

## 🔐 Authentication Setup

### Firebase Auth Integration

```bash
# Install Firebase Admin SDK
npm install firebase-admin
```

Create `src/lib/auth.ts`:

```typescript
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.GCP_PROJECT_ID,
      clientEmail: process.env.GCP_CLIENT_EMAIL,
      privateKey: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function verifyToken(token: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export const auth = admin.auth();
```

## 📝 Updated API Routes

### Enhanced Upload Route

Update `src/app/api/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { uploadVideo } from '@/lib/gcp-storage';
import { saveVideo } from '@/lib/firestore';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await verifyToken(token);

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    
    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Validate file
    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (videoFile.size > 100 * 1024 * 1024) { // 100MB limit
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Convert to buffer
    const buffer = Buffer.from(await videoFile.arrayBuffer());

    // Upload to Cloud Storage
    const videoUrl = await uploadVideo(buffer, videoFile.name, videoFile.type);

    // Save metadata to Firestore
    const videoId = await saveVideo({
      title: videoFile.name.replace(/\.[^/.]+$/, ''),
      url: videoUrl,
      userId: user.uid,
      size: videoFile.size,
      contentType: videoFile.type,
      uploadedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: videoId,
        url: videoUrl,
        title: videoFile.name.replace(/\.[^/.]+$/, ''),
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

### Enhanced Videos Route

Update `src/app/api/videos/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getVideos, deleteVideo as deleteVideoDoc } from '@/lib/firestore';
import { deleteVideo as deleteVideoFile } from '@/lib/gcp-storage';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await verifyToken(token);

    const videos = await getVideos(user.uid);

    return NextResponse.json({
      success: true,
      data: videos,
    });

  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    await verifyToken(token);

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');
    const fileName = searchParams.get('fileName');

    if (!videoId || !fileName) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Delete from storage and database
    await Promise.all([
      deleteVideoFile(fileName),
      deleteVideoDoc(videoId),
    ]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
```

## 🌐 Environment Variables

Create `.env.local`:

```env
# GCP Configuration
GCP_PROJECT_ID=your-project-id
GCP_STORAGE_BUCKET=videovault-videos
GCP_KEY_FILE=./gcp-key.json
GCP_CLIENT_EMAIL=videovault-service@your-project-id.iam.gserviceaccount.com
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📱 Mobile App Integration

Update React Native API calls to include authentication:

```typescript
// src/services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8000/api';

async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem('authToken');
}

export async function uploadVideo(uri: string): Promise<any> {
  const token = await getAuthToken();
  
  const formData = new FormData();
  formData.append('video', {
    uri,
    name: 'video.mp4',
    type: 'video/mp4',
  } as any);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return await response.json();
}

export async function fetchVideos(): Promise<any> {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/videos`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return await response.json();
}
```

## 🚀 Deployment

### Deploy to Cloud Run

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
```

Deploy:

```bash
# Build and deploy
gcloud run deploy videovault-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

## 📊 Monitoring & Analytics

### Set up Cloud Monitoring

```bash
# Enable monitoring
gcloud services enable monitoring.googleapis.com

# Create uptime check
gcloud alpha monitoring uptime create videovault-uptime \
  --display-name="VideoVault API Health Check" \
  --http-check-path="/api/health"
```

### Add Health Check Route

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Authentication Errors**
   ```bash
   # Check service account permissions
   gcloud projects get-iam-policy YOUR_PROJECT_ID
   ```

2. **Storage Upload Failures**
   ```bash
   # Verify bucket permissions
   gsutil iam get gs://videovault-videos
   ```

3. **Firestore Connection Issues**
   ```bash
   # Test Firestore connection
   gcloud firestore databases list
   ```

### Performance Optimization

1. **Enable CDN for Cloud Storage**
   ```bash
   # Enable Cloud CDN
   gcloud compute backend-buckets create videovault-backend \
     --gcs-bucket-name=videovault-videos
   ```

2. **Set up Caching Headers**
   ```typescript
   // In your API routes
   export async function GET() {
     return NextResponse.json(data, {
       headers: {
         'Cache-Control': 'public, max-age=3600',
       },
     });
   }
   ```

## 📈 Scaling Considerations

- **Auto-scaling**: Cloud Run automatically scales based on traffic
- **Database**: Consider Cloud SQL for complex queries
- **CDN**: Use Cloud CDN for global video delivery
- **Caching**: Implement Redis for session management

This integration provides a production-ready foundation for your VideoVault MVP with enterprise-grade scalability and security.
