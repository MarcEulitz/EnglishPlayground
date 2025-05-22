import React from 'react';
import { useLocation } from 'wouter';

const BottomNavigation: React.FC = () => {
  const [location, navigate] = useLocation();

  // Custom navigation handler to avoid nesting <a> tags
  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl z-10">
      <div className="max-w-xl mx-auto flex justify-around p-3">
        <div 
          onClick={() => handleNavigation('/home')}
          className={`nav-btn flex flex-col items-center w-16 py-1 cursor-pointer ${location === '/home' ? 'text-primary' : 'text-gray-400'}`}
        >
          <i className={`ri-home-${location === '/home' ? '5-fill' : 'line'} text-2xl`}></i>
          <span className="text-xs mt-1">Home</span>
        </div>
        
        <div 
          onClick={() => handleNavigation('/vocabulary/animals')}
          className={`nav-btn flex flex-col items-center w-16 py-1 cursor-pointer ${location.startsWith('/vocabulary') ? 'text-primary' : 'text-gray-400'}`}
        >
          <i className={`ri-book-open-${location.startsWith('/vocabulary') ? 'fill' : 'line'} text-2xl`}></i>
          <span className="text-xs mt-1">Lernen</span>
        </div>
        
        <div 
          onClick={() => handleNavigation('/gap-fill/animals')}
          className={`nav-btn flex flex-col items-center w-16 py-1 cursor-pointer ${location.startsWith('/gap-fill') ? 'text-primary' : 'text-gray-400'}`}
        >
          <i className={`ri-gamepad-${location.startsWith('/gap-fill') ? 'fill' : 'line'} text-2xl`}></i>
          <span className="text-xs mt-1">Spiele</span>
        </div>
        
        <div className="nav-btn flex flex-col items-center w-16 py-1 text-gray-400 cursor-pointer">
          <i className="ri-user-line text-2xl"></i>
          <span className="text-xs mt-1">Profil</span>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
