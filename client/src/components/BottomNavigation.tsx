import React from 'react';
import { useLocation } from 'wouter';

// Erstellen wir direkt eine Komponente für die Navigation ohne Link-Komponente zu verwenden
const NavItem: React.FC<{
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}> = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`bg-transparent border-none nav-btn flex flex-col items-center w-16 py-1 cursor-pointer ${active ? 'text-primary' : 'text-gray-400'}`}
  >
    <i className={`${icon} text-2xl`}></i>
    <span className="text-xs mt-1">{label}</span>
  </button>
);

const BottomNavigation: React.FC = () => {
  const [location, navigate] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl z-10">
      <div className="max-w-xl mx-auto flex justify-around p-3">
        <NavItem
          active={location === '/home'}
          icon={`ri-home-${location === '/home' ? '5-fill' : 'line'}`}
          label="Home"
          onClick={() => navigate('/home')}
        />
        
        <NavItem
          active={location.startsWith('/vocabulary')}
          icon={`ri-book-open-${location.startsWith('/vocabulary') ? 'fill' : 'line'}`}
          label="Lernen"
          onClick={() => navigate('/vocabulary/animals')}
        />
        
        <NavItem
          active={location.startsWith('/gap-fill')}
          icon={`ri-gamepad-${location.startsWith('/gap-fill') ? 'fill' : 'line'}`}
          label="Spiele"
          onClick={() => navigate('/gap-fill/animals')}
        />
        
        <NavItem
          active={false}
          icon="ri-user-line"
          label="Profil"
          onClick={() => {}}
        />
      </div>
    </div>
  );
};

export default BottomNavigation;
