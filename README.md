# Face Pixelation Censor

A minimal web application built with React and Vite that detects faces in images using face-api.js and applies pixelation censorship to protect privacy.

## Features

- 📤 **Image Upload**: Drag-and-drop or click to upload images
- 🔍 **Face Detection**: Client-side face detection using face-api.js (tiny_face_detector)
- 🎨 **Pixelation Censor**: Apply configurable pixelation to detected faces
- ⚙️ **Adjustable Pixel Size**: Slider to control the pixelation intensity (5-30px)
- 💾 **Download**: Download the censored image

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Download face-api.js models:**
   
   The app requires face-api.js models to be placed in the `public/models` directory. Run the provided script:
   
   ```bash
   npm run download-models
   ```
   
   Or manually download the models:
   ```bash
   mkdir -p public/models
   cd public/models
   curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/tiny_face_detector/tiny_face_detector_model-weights_manifest.json
   curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/tiny_face_detector/tiny_face_detector_model-shard1
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   
   Navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Usage

1. **Upload an image**: Drag and drop an image onto the upload area or click to select a file
2. **Detect faces**: Click the "Detect Faces" button to scan for faces in the image
3. **Adjust pixelation**: Use the slider to adjust the pixel size (higher values = more pixelation)
4. **Download**: Click the "Download Censored Image" button to save the processed image

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

```bash
npm run preview
```

## Technologies Used

- **React** - UI framework
- **Vite** - Build tool and dev server
- **face-api.js** - Face detection library
- **Canvas API** - Image processing and pixelation

## Browser Compatibility

This app requires a modern browser with support for:
- ES6+ JavaScript
- Canvas API
- File API
- Drag and Drop API

## Notes

- All face detection and image processing happens client-side in your browser
- No images are uploaded to any server
- The app uses the lightweight `tiny_face_detector` model for fast detection
- For better accuracy, you could switch to other face-api.js models (requires downloading additional model files)

