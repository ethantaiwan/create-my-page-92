import { useState, useEffect } from "react";

const Header = () => {
  const [logoUrl, setLogoUrl] = useState<string>("/lovable-uploads/e06228cb-23f5-4a3d-9aef-04e6f75aa289.png");
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processLogo = async () => {
      try {
        setIsProcessing(true);
        console.log('Starting logo processing...');
        
        // Import the background removal function dynamically
        const { removeBackground, loadImageFromUrl } = await import('@/utils/backgroundRemoval');
        
        // Load and process the image
        const imageElement = await loadImageFromUrl("/lovable-uploads/e06228cb-23f5-4a3d-9aef-04e6f75aa289.png");
        console.log('Image loaded, starting background removal...');
        
        const processedBlob = await removeBackground(imageElement);
        const processedUrl = URL.createObjectURL(processedBlob);
        
        console.log('Background removal completed successfully');
        setLogoUrl(processedUrl);
        setIsProcessing(false);
      } catch (error) {
        console.error('Logo processing failed:', error);
        // Keep the original image if processing fails
        setIsProcessing(false);
      }
    };

    processLogo();
  }, []);

  return (
    <header className="bg-header-bg text-step-text py-4 px-6" style={{ background: 'var(--header-bg)' }}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={logoUrl} 
              alt="Anchor Film Logo" 
              className="h-12 w-auto"
              style={{ 
                opacity: isProcessing ? 0.7 : 1,
                transition: 'opacity 0.3s ease'
              }}
            />
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
        <nav>
          <a href="#" className="text-step-text hover:text-yellow-400 transition-colors">
            Home
          </a>
        </nav>
      </div>
    </header>
  );
};

export { Header };