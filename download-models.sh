#!/bin/bash

# Script to download face-api.js models

echo "Downloading face-api.js models..."

# Create models directory
mkdir -p public/models

# Download tiny_face_detector model files
cd public/models

echo "Downloading tiny_face_detector model..."
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/tiny_face_detector/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/tiny_face_detector/tiny_face_detector_model-shard1

echo "Models downloaded successfully!"
echo "Files are in: public/models/"

