'use client';

import { useState } from 'react';

export default function TestAuth() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testSignup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: `test${Date.now()}@example.com`,
          password: 'password123'
        }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
    setLoading(false);
  };

  const testGoogleAuth = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 font-heading">Test Authentication</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <button
            onClick={testSignup}
            disabled={loading}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Manual Signup
          </button>
          
          <button
            onClick={testGoogleAuth}
            className="w-full bg-red-500 text-white px-4 py-3 rounded hover:bg-red-600 flex items-center justify-center space-x-2"
          >
            <span>Test Google Auth</span>
          </button>
          
          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {result}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}