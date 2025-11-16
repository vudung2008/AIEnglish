import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";

export default function MainLayout() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Learn", to: "/learn" },
    { name: "Flashcards", to: "/flashcards" },
    { name: "Test", to: "/test" },
    { name: "Settings", to: "/settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">

      {/* NAVBAR */}
      <nav className="w-full border-b border-gray-300 px-6 py-4 flex items-center justify-between bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <NavLink to="/" className="font-bold text-2xl text-blue-600">
          AIEnglish
        </NavLink>

        {/* Desktop menu */}
        <ul className="hidden md:flex gap-6 font-medium">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `relative pb-1 transition ${isActive
                    ? "text-blue-600 font-semibold after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1.5px] after:bg-blue-400"
                    : "text-gray-700 hover:text-blue-600"
                  }`
                }
              >
                {link.name}
              </NavLink>

            </li>
          ))}
        </ul>

        {/* Hamburger */}
        <button
          className="md:hidden p-2 rounded active:scale-90 transition"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? (
            <span className="text-xl font-bold">✕</span>
          ) : (
            <span className="text-xl font-bold">☰</span>
          )}
        </button>
      </nav>

      {/* MOBILE MENU (overlay) */}
      <div
        className={`
          md:hidden fixed left-0 right-0 top-[64px] 
          bg-white shadow-lg border-b 
          transition-all duration-300 z-40
          ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
        `}
      >
        <ul className="flex flex-col gap-4 px-6 py-4">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `relative pb-1 transition ${isActive
                    ? "text-blue-600 font-semibold after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1.5px] after:bg-blue-400"
                    : "text-gray-700 hover:text-blue-600"
                  }`
                }
              >
                {link.name}
              </NavLink>

            </li>
          ))}
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
