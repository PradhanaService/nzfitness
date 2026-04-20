# 🚀 Image & Video Optimization - CRITICAL for Fast Loading

## ⚡ Performance Improvements Applied

✅ **Added preload for critical images** (hero background, logo)
✅ **DNS prefetch** for external resources (Tailwind, Google Fonts)
✅ **fetchPriority="high"** on hero and logo images
✅ **decoding="async"** on all images for non-blocking rendering
✅ **preload="none"** on videos (only load when visible via Intersection Observer)
✅ **Lazy loading** on all below-the-fold images
✅ **Video poster placeholders** to prevent layout shift

---

## 🔴 CRITICAL: Image Compression Required

Your images are **TOO LARGE** for web. This is the #1 reason for slow loading.

### Current Issues:
- Images are likely 2-5MB each (uncompressed)
- Videos in MOV format (30-50MB each)
- No WebP/AVIF modern formats

### Required Actions:

#### 1️⃣ **Compress ALL JPG Images** (HIGHEST PRIORITY)

**Use TinyPNG or Squoosh:**

```bash
# Online tools (easiest):
1. Go to: https://tinypng.com/
2. Upload ALL images from /public/images/
3. Download compressed versions
4. Replace original files

# OR use Squoosh (best quality):
https://squoosh.app/
- Quality: 80-85%
- Format: WebP (smaller) or Progressive JPG
```

**Expected Results:**
- Before: 3MB per image
- After: 150-300KB per image
- **90% file size reduction!**

---

#### 2️⃣ **Convert Videos to MP4** (CRITICAL)

Your MOV files are HUGE. Convert to optimized MP4:

```bash
# Using FFmpeg (free tool):

# Install FFmpeg first:
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg

# Then convert each video:
ffmpeg -i gallery-6.mov -c:v libx264 -crf 23 -preset medium -vf "scale=720:-2" -c:a aac -b:a 128k gallery-6.mp4

ffmpeg -i gallery-7.mov -c:v libx264 -crf 23 -preset medium -vf "scale=720:-2" -c:a aac -b:a 128k gallery-7.mp4

ffmpeg -i gallery-8.mov -c:v libx264 -crf 23 -preset medium -vf "scale=720:-2" -c:a aac -b:a 128k gallery-8.mp4

# Explanation:
# -crf 23 = Good quality (lower = better, 18-28 range)
# scale=720:-2 = Resize to 720p width (mobile-friendly)
# -b:a 128k = Audio bitrate (videos are muted anyway, can even remove audio)
```

**For even smaller files (recommended for web):**
```bash
# Remove audio + smaller resolution for web:
ffmpeg -i gallery-6.mov -c:v libx264 -crf 25 -preset medium -vf "scale=640:-2" -an gallery-6.mp4
ffmpeg -i gallery-7.mov -c:v libx264 -crf 25 -preset medium -vf "scale=640:-2" -an gallery-7.mp4
ffmpeg -i gallery-8.mov -c:v libx264 -crf 25 -preset medium -vf "scale=640:-2" -an gallery-8.mp4

# -an = No audio (saves 30% file size)
# scale=640 = Good for mobile
```

**Expected Results:**
- Before: 30-50MB per video
- After: 3-8MB per video
- **80-90% file size reduction!**

**After conversion, update App.tsx:**
```tsx
const videos = [
  '/images/gallery-6.mp4',  // Changed from .mov
  '/images/gallery-7.mp4',  // Changed from .mov
  '/images/gallery-8.mp4'   // Changed from .mov
];
```

---

#### 3️⃣ **Create WebP Versions** (Optional but Recommended)

WebP format is 30% smaller than JPG with same quality:

```bash
# Using online converter:
https://cloudconvert.com/jpg-to-webp

# Or using cwebp tool:
cwebp -q 85 gallery-1.jpg -o gallery-1.webp
cwebp -q 85 gallery-2.jpg -o gallery-2.webp
# ... repeat for all images
```

**Then use picture element for modern browsers:**
```tsx
<picture>
  <source srcSet="/images/gallery-1.webp" type="image/webp" />
  <img src="/images/gallery-1.jpg" alt="Gallery" loading="lazy" decoding="async" />
</picture>
```

---

## 📊 Size Recommendations

| Asset Type | Current Size | Target Size | Format |
|------------|--------------|-------------|---------|
| Hero Image | 3-5MB | 300-500KB | Progressive JPG or WebP |
| Gallery Photos | 2-4MB each | 150-250KB | Progressive JPG or WebP |
| Program Images | 1-3MB | 100-200KB | Progressive JPG or WebP |
| Videos | 30-50MB each | 3-8MB | MP4 (H.264) |
| Logo/Icons | 100-500KB | 20-50KB | PNG or WebP |

---

## 🎯 Compression Settings

### For Photos:
```
Format: Progressive JPG or WebP
Quality: 80-85%
Max Width: 1920px (desktop), 1200px (tablets), 800px (mobile)
Color Space: sRGB
Metadata: Remove EXIF data
```

### For Videos:
```
Format: MP4 (H.264 codec)
Resolution: 720p (1280x720) or 640p (640x360)
Frame Rate: 30fps
Bitrate: 1-2 Mbps
Audio: Remove (videos are muted)
```

---

## 🚀 Additional Optimizations

### 1. **Add Responsive Images** (Optional)

Create multiple sizes for different devices:

```bash
# Create 3 sizes of each image:
# Small (mobile): 640px
# Medium (tablet): 1024px
# Large (desktop): 1920px

# Example:
magick gallery-1.jpg -resize 640x gallery-1-sm.jpg
magick gallery-1.jpg -resize 1024x gallery-1-md.jpg
magick gallery-1.jpg -resize 1920x gallery-1-lg.jpg
```

**Then use srcset:**
```tsx
<img 
  src="/images/gallery-1-lg.jpg"
  srcSet="
    /images/gallery-1-sm.jpg 640w,
    /images/gallery-1-md.jpg 1024w,
    /images/gallery-1-lg.jpg 1920w
  "
  sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
  alt="Gallery"
  loading="lazy"
  decoding="async"
/>
```

### 2. **Use CDN for Images** (Highly Recommended)

Upload images to:
- **Cloudinary** (free tier: 25GB storage)
- **ImageKit** (free tier: 20GB storage)
- **Cloudflare Images** ($5/month)

Benefits:
- Automatic compression
- Automatic WebP/AVIF conversion
- Global CDN (faster worldwide)
- Image resizing on-the-fly

**Example with Cloudinary:**
```tsx
// Instead of:
src="/images/gallery-1.jpg"

// Use:
src="https://res.cloudinary.com/your-cloud/image/upload/f_auto,q_auto,w_800/gallery-1.jpg"
// f_auto = auto format (WebP for modern browsers)
// q_auto = auto quality
// w_800 = resize to 800px
```

### 3. **Enable Gzip/Brotli Compression**

Add to your hosting configuration (Vercel/Netlify does this automatically):

**For Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript image/svg+xml;
```

**For Vercel (add vercel.json):**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 📈 Performance Testing

After compression, test your site:

1. **Google PageSpeed Insights**: https://pagespeed.web.dev/
   - Target: 90+ score
   
2. **GTmetrix**: https://gtmetrix.com/
   - Target: A grade
   
3. **WebPageTest**: https://www.webpagetest.org/
   - Target: <2s load time

---

## ✅ Optimization Checklist

- [ ] Compress all JPG images to 80-85% quality
- [ ] Convert HEIC files to JPG (gallery-4, gallery-5)
- [ ] Convert MOV videos to MP4 with H.264
- [ ] Resize images to max 1920px width
- [ ] Remove EXIF metadata from images
- [ ] Create WebP versions (optional)
- [ ] Update video paths in App.tsx to .mp4
- [ ] Test on slow 3G connection
- [ ] Verify PageSpeed score >90

---

## 🔧 Quick Compression Script

Save this as `optimize.sh` and run it:

```bash
#!/bin/bash
# Requires: imagemagick, ffmpeg

echo "Optimizing images..."
for img in public/images/*.jpg; do
  magick "$img" -quality 85 -strip -resize 1920x\> "$img"
done

echo "Converting videos..."
for video in public/images/*.mov; do
  output="${video%.mov}.mp4"
  ffmpeg -i "$video" -c:v libx264 -crf 23 -vf "scale=720:-2" -an "$output"
done

echo "Done! ✅"
```

**Run with:**
```bash
chmod +x optimize.sh
./optimize.sh
```

---

## 💡 Why This Matters

| Issue | Impact | Solution |
|-------|--------|----------|
| Large images (3-5MB) | 10-20s load time on 4G | Compress to 300KB = 2s load |
| Large videos (30MB+) | 30-60s load on mobile | Convert to MP4 = 5-10s load |
| No lazy loading | Load all at once = slow | Lazy load = instant first paint |
| No compression | High bandwidth cost | Compress = save 90% bandwidth |

---

## 🎯 Expected Performance Gains

**Before Optimization:**
- Initial Load: 8-15 seconds
- Total Page Size: 150-300MB
- PageSpeed Score: 30-50

**After Optimization:**
- Initial Load: 1-3 seconds ⚡
- Total Page Size: 10-20MB 💾
- PageSpeed Score: 85-95 🎯

**That's 80-90% faster!** 🚀

---

## 📞 Need Help?

If you need help with image/video compression:
1. Send files to a compression service
2. Use online tools (no installation needed)
3. Contact developer: vzhnu.me

---

## 🔥 Most Important Actions (Do First)

1. **Compress images with TinyPNG** ← 5 minutes, huge impact
2. **Convert videos to MP4** ← 10 minutes, massive improvement
3. **Test on mobile device** ← Verify speed improvement

These 3 actions alone will make your site **5-10x faster!**
