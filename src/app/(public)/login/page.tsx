'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/cotizador';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Credenciales inválidas. Verifica tu email y contraseña.'
          : authError.message
      );
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <Image
          src="/images/logo.svg"
          alt="AMAROT"
          width={180}
          height={60}
          className="mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-[#1E3A8A]">
          Sistema de Cotización
        </h1>
        <p className="text-gray-500 mt-2">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition-all"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Ingresando...
            </span>
          ) : (
            'Ingresar'
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Sistema interno de AMAROT Perú</p>
        <p className="mt-1">
          ¿Problemas para acceder?{' '}
          <a
            href="mailto:amarot.servicios@gmail.com"
            className="text-[#1E3A8A] hover:underline"
          >
            Contactar soporte
          </a>
        </p>
      </div>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 animate-pulse">
      <div className="text-center mb-8">
        <div className="h-12 bg-gray-200 rounded w-44 mx-auto mb-4" />
        <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2" />
        <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
      </div>
      <div className="space-y-6">
        <div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
        <div className="h-12 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full mx-4">
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
