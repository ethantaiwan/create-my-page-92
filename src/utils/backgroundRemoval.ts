import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 512;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  // Always resize to MAX_IMAGE_DIMENSION to ensure compatibility
  if (width > height) {
    height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
    width = MAX_IMAGE_DIMENSION;
  } else {
    width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
    height = MAX_IMAGE_DIMENSION;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);
  return true;
}

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    
    // Use a more reliable segmentation model
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'wasm',
    });
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image and draw it to canvas
    resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image resized to: ${canvas.width}x${canvas.height}`);
    
    // Get image data as ImageData for better processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log('Image converted to ImageData');
    
    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
    const result = await segmenter(canvas);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask to create transparency (combine segmentation + color-threshold)
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = outputImageData.data;

    const totalPixels = outputCanvas.width * outputCanvas.height;
    const alphaMask = new Float32Array(totalPixels).fill(1);

    // 1) Segmentation-driven background removal
    for (const segment of result) {
      if (
        segment.label === 'wall' || segment.label === 'building' || segment.label === 'floor' ||
        segment.label === 'ceiling' || segment.label === 'road' || segment.label === 'sidewalk' ||
        segment.label === 'screen' || segment.label === 'poster' || segment.label === 'windowpane' ||
        segment.label === 'screen door'
      ) {
        const maskData = (segment.mask?.data as unknown as ArrayLike<number>);
        for (let i = 0; i < (maskData as any).length; i++) {
          // Reduce alpha where model predicts background (higher mask value = stronger)
          alphaMask[i] = Math.min(alphaMask[i], 1 - maskData[i]);
        }
      }
    }

    // 2) Color-threshold removal for near-white backgrounds
    for (let i = 0; i < totalPixels; i++) {
      const r = data[i * 4 + 0];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      const maxc = Math.max(r, g, b);
      const minc = Math.min(r, g, b);
      const avg = (r + g + b) / 3;
      const spread = maxc - minc;

      // Hard remove pure/near pure white
      if (avg > 245 && spread < 15) {
        alphaMask[i] = 0;
        continue;
      }
      // Soft fade for light gray/white
      if (avg > 225 && spread < 20) {
        const t = Math.min(1, Math.max(0, (avg - 225) / 30)); // 0..1
        alphaMask[i] = Math.min(alphaMask[i], 1 - 0.85 * t);
      }
    }

    // Apply combined alpha
    for (let i = 0; i < totalPixels; i++) {
      data[i * 4 + 3] = Math.round(255 * Math.max(0, Math.min(1, alphaMask[i])));
    }

    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('Background removal completed successfully');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const loadImageFromUrl = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
};
