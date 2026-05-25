# Hero Video Setup Guide

The landing page hero section has been upgraded to support a responsive, autoplay video background. Here's how to add the video:

## Video File Requirements

- **Location**: Place video file at `public/hero-driving-students.mp4`
- **Format**: MP4 (H.264 video codec, AAC audio codec)
- **Dimensions**: 1920×1080 minimum (landscape)
- **Duration**: 30-60 seconds recommended (looping autoplay)
- **Audio**: Not needed (video element has `muted` attribute)
- **File Size**: Keep under 5MB for optimal performance
  - For web: Use medium quality (1280×720 or similar)
  - Compress with: `ffmpeg -i input.mp4 -c:v libx264 -crf 28 -c:a aac -b:a 128k output.mp4`

## Current Setup

The video element:
- Auto-loops with `loop` attribute
- Plays without sound with `muted` attribute
- Adapts to mobile with `playsInline` attribute
- Lazy loads with `loading="lazy"`
- Falls back to `/hero_driving_test.png` poster image if video unavailable
- Renders at full video quality with `object-cover`

## Performance Optimizations

1. **Lazy Loading**: Video only loads when section comes into viewport
2. **Poster Image**: Shows placeholder while video loads
3. **Responsive**: Uses CSS `object-cover` for all screen sizes
4. **Graceful Fallback**: Shows static image if video doesn't play

## Browser Support

✅ Works on all modern browsers (Chrome, Firefox, Safari, Edge)
✅ Mobile-optimized with `playsInline` attribute
✅ Fallback image for old browsers

## Testing

Once video is added:
1. Video should autoplay on page load
2. Video should loop continuously
3. Video should have no sound
4. Text overlay should remain readable
5. Mobile responsiveness should work correctly

## Alternative: Using an External Video Service

If you prefer not to host video files locally:
- Replace `<source src="/hero-driving-students.mp4" type="video/mp4" />` with a CDN URL
- Or integrate with Cloudinary, Bunny CDN, or similar service
