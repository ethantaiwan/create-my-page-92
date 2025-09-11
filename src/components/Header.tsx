import { useState } from "react";
import { LogoProcessor } from "./LogoProcessor";

const Header = () => {
  const [logoUrl, setLogoUrl] = useState<string>("/lovable-uploads/cd4ff61f-2167-4420-bf2c-eab3fa899ab9.png");

  return (
    <header className="bg-header-bg text-step-text py-4 px-6" style={{ background: 'var(--header-bg)' }}>
      <LogoProcessor onLogoReady={setLogoUrl} />
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img 
            src={logoUrl} 
            alt="Anchor Film Logo" 
            className="h-12 w-auto"
          />
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