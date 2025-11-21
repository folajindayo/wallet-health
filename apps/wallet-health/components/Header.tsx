/**
 * Header Component
 */

'use client';

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">Wallet Health</h1>
        <nav className="flex gap-4">
          <a href="/" className="text-gray-700 hover:text-indigo-600">Dashboard</a>
          <a href="/approvals" className="text-gray-700 hover:text-indigo-600">Approvals</a>
        </nav>
      </div>
    </header>
  );
}

