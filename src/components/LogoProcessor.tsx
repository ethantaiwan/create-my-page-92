import { useEffect, useState } from 'react';
import { removeBackground, loadImageFromUrl } from '@/utils/backgroundRemoval';

interface LogoProcessorProps {
  onLogoReady: (logoUrl: string) => void;
}

const LogoProcessor = ({ onLogoReady }: LogoProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processLogo = async () => {
      try {
        setIsProcessing(true);
        console.log('Loading original logo...');
        
        // Load the original image
        const originalLogoUrl = "/lovable-uploads/evo.png";
        const imageElement = await loadImageFromUrl(originalLogoUrl);
        console.log('Image loaded successfully');
        
        // Remove background
        console.log('Removing background...');
        const processedBlob = await removeBackground(imageElement);
        
        // Create object URL for the processed image
        const processedUrl = URL.createObjectURL(processedBlob);
        onLogoReady(processedUrl);
        
        console.log('Logo processing completed');
        setIsProcessing(false);
      } catch (err) {
        console.error('Error processing logo:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fallback to original image
        onLogoReady("/lovable-uploads/evo.png");
        setIsProcessing(false);
      }
    };

    processLogo();
  }, [onLogoReady]);

  if (error) {
    console.warn('Logo processing failed, using original:', error);
  }

  return null; // This component doesn't render anything
};

export { LogoProcessor };
