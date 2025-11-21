/**
 * Home Page
 */

'use client';

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Secure Your Crypto Wallet
          </h1>
          <p className="text-xl text-gray-600">
            Monitor security threats and manage token approvals
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-bold mb-2">Security Score</h3>
            <p className="text-gray-600">Get your wallet security score</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold mb-2">Threat Detection</h3>
            <p className="text-gray-600">Real-time threat monitoring</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-lg font-bold mb-2">Manage Approvals</h3>
            <p className="text-gray-600">Revoke unused token approvals</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
