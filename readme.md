# BannerShare
BannerShare is a small web app that takes a ZIP of HTML5 animation exports and generates a single preview link showing all sizes on one page.

## Local Setup
1. Install deps: `npm install`
2. Start MinIO:
   ```sh
   docker run -d --name bannershare-minio \
     -p 9000:9000 -p 9001:9001 \
     -e MINIO_ROOT_USER=minio \
     -e MINIO_ROOT_PASSWORD=minio123 \
     -v minio-data:/data \
     minio/minio server /data --console-address ":9001"
   ```
3. Create `.env.local` (see `.env.local.example`)
4. Run: `npm run dev`

MinIO endpoints:
- API: `http://localhost:9000`
- Console: `http://localhost:9001`
