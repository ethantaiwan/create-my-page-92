const Header = () => {
  return (
    <header className="bg-header-bg text-step-text py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400 text-lg font-bold">e</span>
          <span className="text-white text-lg font-bold">v</span>
          <span className="text-yellow-400 text-lg font-bold">o</span>
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