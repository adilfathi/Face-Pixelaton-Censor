import { useState, useRef, useEffect } from 'react'
import * as faceapi from 'face-api.js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Spinner } from '@/components/ui/spinner'

function App() {
  const [image, setImage] = useState(null)
  const [detections, setDetections] = useState([])
  const [pixelSize, setPixelSize] = useState([10])
  const [censorMethod, setCensorMethod] = useState('pixelation')
  const [processedImage, setProcessedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const dropZoneRef = useRef(null)

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      console.log('🔵 [MODEL LOADING] Starting to load face detection models...')
      try {
        console.log('🔵 [MODEL LOADING] Loading tiny_face_detector model from /models')
        const startTime = performance.now()
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        ])
        
        const loadTime = ((performance.now() - startTime) / 1000).toFixed(2)
        console.log(`✅ [MODEL LOADING] Models loaded successfully in ${loadTime}s`)
        setModelsLoaded(true)
      } catch (error) {
        console.error('❌ [MODEL LOADING] Error loading models:', error)
        alert('Error loading face detection models. Please ensure models are in the public/models directory.')
      }
    }
    loadModels()
  }, [])

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      console.log('📤 [FILE UPLOAD] File selected:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      })
      
      setIsUploading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        console.log('✅ [FILE UPLOAD] Image loaded successfully')
        setImage(e.target.result)
        setDetections([])
        setProcessedImage(null)
        setIsUploading(false)
      }
      reader.onerror = () => {
        console.error('❌ [FILE UPLOAD] Error reading file')
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } else {
      console.warn('⚠️ [FILE UPLOAD] Invalid file type. Expected image file.')
    }
  }

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault()
    console.log('📥 [DRAG & DROP] File dropped')
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Detect faces
  const detectFaces = async () => {
    if (!image || !modelsLoaded) {
      console.warn('⚠️ [FACE DETECTION] Cannot start: image or models not ready')
      return
    }

    console.log('🔍 [FACE DETECTION] Starting face detection process...')
    setIsProcessing(true)
    
    try {
      console.log('🖼️ [FACE DETECTION] Loading image into memory...')
      const img = new Image()
      img.src = image
      
      await new Promise((resolve) => {
        img.onload = () => {
          console.log(`✅ [FACE DETECTION] Image loaded: ${img.width}x${img.height} pixels`)
          resolve()
        }
      })

      console.log('🔍 [FACE DETECTION] Running face detection algorithm...')
      const detectionStartTime = performance.now()
      
      const detections = await faceapi.detectAllFaces(
        img,
        new faceapi.TinyFaceDetectorOptions()
      )

      const detectionTime = ((performance.now() - detectionStartTime) / 1000).toFixed(2)
      console.log(`✅ [FACE DETECTION] Detection completed in ${detectionTime}s`)
      console.log(`📊 [FACE DETECTION] Found ${detections.length} face(s)`)
      
      // Debug: Log first detection structure if available
      if (detections.length > 0) {
        console.log('🔍 [FACE DETECTION] Sample detection structure:', detections[0])
      }

      // Log details for each detected face
      detections.forEach((detection, index) => {
        // Handle different detection object structures
        const box = detection.detection?.box || detection.box
        const score = detection.detection?.score || detection.score
        
        if (box) {
          console.log(`  Face ${index + 1}:`, {
            x: Math.round(box.x),
            y: Math.round(box.y),
            width: Math.round(box.width),
            height: Math.round(box.height),
            confidence: score ? score.toFixed(3) : 'N/A'
          })
        } else {
          console.warn(`  ⚠️ [FACE DETECTION] Face ${index + 1} has invalid structure:`, detection)
        }
      })

      setDetections(detections)
      
      // Process image with pixelation
      console.log('🎨 [PIXELATION] Starting pixelation process...')
      applyPixelation(img, detections)
    } catch (error) {
      console.error('❌ [FACE DETECTION] Error detecting faces:', error)
      alert('Error detecting faces. Please try again.')
    } finally {
      setIsProcessing(false)
      console.log('✅ [FACE DETECTION] Process completed')
    }
  }

  // Apply pixelation to detected faces
  const applyPixelation = (img, faceDetections) => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error('❌ [PIXELATION] Canvas not available')
      return
    }

    console.log(`🎨 [PIXELATION] Setting up canvas: ${img.width}x${img.height}`)
    const pixelationStartTime = performance.now()
    
    const ctx = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height

    // Draw original image
    console.log('🎨 [PIXELATION] Drawing original image to canvas...')
    ctx.drawImage(img, 0, 0)

    // Apply pixelation to each detected face
    const currentPixelSize = pixelSize[0]
    console.log(`🎨 [PIXELATION] Applying pixelation to ${faceDetections.length} face(s) with pixel size: ${currentPixelSize}px`)
    faceDetections.forEach((detection, index) => {
      // Handle different detection object structures
      const box = detection.detection?.box || detection.box
      
      if (!box) {
        console.error(`  ❌ [PIXELATION] Face ${index + 1} has no bounding box. Detection structure:`, detection)
        return
      }

      const x = Math.max(0, Math.round(box.x))
      const y = Math.max(0, Math.round(box.y))
      const width = Math.min(Math.round(box.width), canvas.width - x)
      const height = Math.min(Math.round(box.height), canvas.height - y)

      // Validate dimensions
      if (width <= 0 || height <= 0) {
        console.warn(`  ⚠️ [PIXELATION] Face ${index + 1} has invalid dimensions: ${width}x${height}`)
        return
      }

      console.log(`  🎨 [PIXELATION] Processing face ${index + 1}/${faceDetections.length} at (${x}, ${y}) - ${width}x${height}`)

      // Get face region
      const faceImageData = ctx.getImageData(x, y, width, height)
      
      // Pixelate the face region
      const pixelated = pixelateImageData(faceImageData, currentPixelSize)
      
      // Put pixelated region back
      ctx.putImageData(pixelated, x, y)
      console.log(`  ✅ [PIXELATION] Face ${index + 1} pixelated`)
    })

    const pixelationTime = ((performance.now() - pixelationStartTime) / 1000).toFixed(2)
    console.log(`✅ [PIXELATION] Pixelation completed in ${pixelationTime}s`)

    // Convert canvas to image
    console.log('💾 [PIXELATION] Converting canvas to image blob...')
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      console.log(`✅ [PIXELATION] Processed image ready (${(blob.size / 1024).toFixed(2)} KB)`)
      setProcessedImage(url)
    }, 'image/png')
  }

  // Pixelate image data
  const pixelateImageData = (imageData, pixelSize) => {
    const { width, height, data } = imageData
    const pixelated = new ImageData(width, height)
    const pixelatedData = pixelated.data

    const totalBlocks = Math.ceil(width / pixelSize) * Math.ceil(height / pixelSize)
    let processedBlocks = 0

    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        // Sample color from center of pixel block
        const sampleX = Math.min(x + Math.floor(pixelSize / 2), width - 1)
        const sampleY = Math.min(y + Math.floor(pixelSize / 2), height - 1)
        const sampleIndex = (sampleY * width + sampleX) * 4

        const r = data[sampleIndex]
        const g = data[sampleIndex + 1]
        const b = data[sampleIndex + 2]
        const a = data[sampleIndex + 3]

        // Fill pixel block with sampled color
        for (let py = y; py < y + pixelSize && py < height; py++) {
          for (let px = x; px < x + pixelSize && px < width; px++) {
            const index = (py * width + px) * 4
            pixelatedData[index] = r
            pixelatedData[index + 1] = g
            pixelatedData[index + 2] = b
            pixelatedData[index + 3] = a
          }
        }
        
        processedBlocks++
        // Log progress every 10% of blocks
        if (processedBlocks % Math.max(1, Math.floor(totalBlocks / 10)) === 0) {
          const progress = Math.round((processedBlocks / totalBlocks) * 100)
          console.log(`    🎨 [PIXELATION] Progress: ${progress}% (${processedBlocks}/${totalBlocks} blocks)`)
        }
      }
    }

    return pixelated
  }

  // Re-apply pixelation when pixel size changes
  useEffect(() => {
    if (image && detections.length > 0) {
      console.log(`🔄 [PIXELATION] Re-applying pixelation with new pixel size: ${pixelSize[0]}px`)
      const img = new Image()
      img.src = image
      img.onload = () => {
        applyPixelation(img, detections)
      }
    }
  }, [pixelSize])

  // Download processed image
  const downloadImage = () => {
    if (!processedImage) {
      console.warn('⚠️ [DOWNLOAD] No processed image available')
      return
    }

    console.log('💾 [DOWNLOAD] Initiating download of censored image...')
    const link = document.createElement('a')
    link.download = 'censored-image.png'
    link.href = processedImage
    link.click()
    console.log('✅ [DOWNLOAD] Download started')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-8 sm:h-8">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="hsl(var(--primary))"/>
            </svg>
            <span className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">Face Censor | Privacy Tool</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-4 sm:py-6 lg:py-8 bg-muted/30 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!modelsLoaded && (
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-center gap-2 p-3 sm:p-4 bg-muted rounded-md">
                <Spinner size="sm" className="text-primary" />
                <p className="text-xs sm:text-sm text-muted-foreground">Loading face detection models...</p>
              </div>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
          {/* Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>Select an image to process</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                ref={dropZoneRef}
                className="relative border-2 border-dashed rounded-lg p-6 sm:p-8 lg:p-12 text-center cursor-pointer transition-colors hover:border-primary/50 bg-muted/30 min-h-[200px] sm:min-h-[240px] lg:min-h-[280px] flex items-center justify-center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Spinner size="lg" className="text-primary" />
                    <p className="text-sm text-muted-foreground">Uploading image...</p>
                  </div>
                ) : image ? (
                  <div className="flex justify-center w-full">
                    <img ref={imageRef} src={image} alt="Uploaded" className="max-w-full h-auto max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] rounded-md shadow-md object-contain" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground sm:w-12 sm:h-12">
                      <path d="M19 7v2.99s-1.99.01-2 0V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2.99s2 .01 2 0V17c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-4z" fill="currentColor"/>
                      <path d="M19 5h2v2h-2V5zm-2 0h-2v2h2V5zm2 0h2v2h-2V5z" fill="currentColor"/>
                    </svg>
                    <div className="text-center">
                      <p className="text-sm sm:text-base font-medium text-foreground mb-1">Drag and drop your image here</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="sm:size-default"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
            </CardContent>
          </Card>

          {/* Control Panel Card */}
          {image && (
            <Card>
              <CardHeader>
                <CardTitle>Control Panel</CardTitle>
                <CardDescription>Configure censor settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label htmlFor="censor-method" className="text-sm font-medium">
                    Censor Method
                  </label>
                  <Select value={censorMethod} onValueChange={setCensorMethod}>
                    <SelectTrigger id="censor-method" className="w-full">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pixelation">Pixelation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <label htmlFor="intensity" className="text-sm font-medium">
                      Intensity
                    </label>
                    <span className="text-xs sm:text-sm text-muted-foreground">{pixelSize[0]}px</span>
                  </div>
                  <Slider
                    id="intensity"
                    min={5}
                    max={30}
                    step={1}
                    value={pixelSize}
                    onValueChange={setPixelSize}
                    disabled={detections.length === 0}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <Button
                  onClick={detectFaces}
                  disabled={!modelsLoaded || isProcessing}
                  className="w-full"
                  size="default"
                >
                  {isProcessing ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Apply Censor'
                  )}
                </Button>

                {detections.length > 0 && (
                  <div className="p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-md text-center">
                    <p className="text-xs sm:text-sm font-medium text-primary">
                      {detections.length} face{detections.length !== 1 ? 's' : ''} detected
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Result Card */}
          {processedImage && (
            <Card>
              <CardHeader>
                <CardTitle>Processed Image</CardTitle>
                <CardDescription>Preview and download your censored image</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center w-full">
                  <img src={processedImage} alt="Processed" className="max-w-full h-auto max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] rounded-md shadow-md border object-contain" />
                </div>
                <Button onClick={downloadImage} className="w-full" size="default">
                  Download Image
                </Button>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-center px-4 sm:px-6 lg:px-8">
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Face Censor. All rights reserved.
          </p>
        </div>
      </footer>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default App
