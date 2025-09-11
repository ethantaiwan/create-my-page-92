import logoImage from "@/assets/evo-logo-clean.png";

const Header = () => {
  return (
    <header className="bg-header-bg text-step-text py-4 px-6" style={{ background: 'var(--header-bg)' }}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img 
            src={logoImage} 
            alt="EVO Video Script Generator" 
            className="h-8 w-auto"
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