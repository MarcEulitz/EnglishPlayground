import React from 'react';
import { useLocation, Link } from 'wouter';

const BottomNavigation: React.FC = () => {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl z-10">
      <div className="max-w-xl mx-auto flex justify-around p-3">
        <Link href="/home">
          <a className={`nav-btn flex flex-col items-center w-16 py-1 ${location === '/home' ? 'text-primary' : 'text-gray-400'}`}>
            <i className={`ri-home-${location === '/home' ? '5-fill' : 'line'} text-2xl`}></i>
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/vocabulary/animals">
          <a className={`nav-btn flex flex-col items-center w-16 py-1 ${location.startsWith('/vocabulary') ? 'text-primary' : 'text-gray-400'}`}>
            <i className={`ri-book-open-${location.startsWith('/vocabulary') ? 'fill' : 'line'} text-2xl`}></i>
            <span className="text-xs mt-1">Lernen</span>
          </a>
        </Link>
        <Link href="/gap-fill/animals">
          <a className={`nav-btn flex flex-col items-center w-16 py-1 ${location.startsWith('/gap-fill') ? 'text-primary' : 'text-gray-400'}`}>
            <i className={`ri-gamepad-${location.startsWith('/gap-fill') ? 'fill' : 'line'} text-2xl`}></i>
            <span className="text-xs mt-1">Spiele</span>
          </a>
        </Link>
        <button className="nav-btn flex flex-col items-center w-16 py-1 text-gray-400">
          <i className="ri-user-line text-2xl"></i>
          <span className="text-xs mt-1">Profil</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;
