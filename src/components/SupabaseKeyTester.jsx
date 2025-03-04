import { useState, useEffect } from 'react';
import { testSupabaseDirectly } from '../utils/testSupabaseConnection';
import { motion } from 'framer-motion';

/**
 * Componente para probar y depurar la clave API de Supabase
 * Solo para uso en desarrollo, no incluir en producción
 */
const SupabaseKeyTester = () => {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [keyMasked, setKeyMasked] = useState(true);

  const handleTestKey = async () => {
    if (!key.trim()) {
      setResult({
        success: false,
        error: 'Por favor, ingresa una clave para probar'
      });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const testResult = await testSupabaseDirectly(key);
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        error: `Error en la prueba: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const toggleKeyMask = () => {
    setKeyMasked(!keyMasked);
  };

  // Ocultar el componente en producción
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.log('Este componente no debe usarse en producción');
    }
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleVisibility}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          title="Herramienta de depuración de Supabase"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl w-96 max-w-[calc(100vw-2rem)]"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Depurador de Supabase</h3>
        <button
          onClick={toggleVisibility}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <label htmlFor="supabase-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
            Clave API de Supabase
          </label>
          <button 
            onClick={toggleKeyMask} 
            className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400"
          >
            {keyMasked ? 'Mostrar' : 'Ocultar'}
          </button>
        </div>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type={keyMasked ? "password" : "text"}
            name="supabase-key"
            id="supabase-key"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="eyJ..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Obtén esta clave desde el panel de Supabase → Settings → API
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleTestKey}
          disabled={loading}
          className={`
            px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          `}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Probando...
            </span>
          ) : 'Probar conexión'}
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`mt-4 p-3 rounded-md text-sm ${
            result.success 
              ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-400' 
              : 'bg-red-50 text-red-800 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-400'
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {result.success ? (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className="font-medium">
                {result.success ? 'Conexión exitosa' : 'Error al conectar'}
              </h3>
              <div className="mt-2">
                {result.success ? (
                  <p>La clave API es válida y funciona correctamente.</p>
                ) : (
                  <p>{result.error || 'Ocurrió un error desconocido'}</p>
                )}
              </div>
              {result.status && (
                <p className="mt-1">
                  <span className="font-medium">Estado HTTP:</span> {result.status}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <p>
          Nota: Esta herramienta es solo para fines de depuración y no debe estar accesible en producción.
        </p>
      </div>
    </motion.div>
  );
};

export default SupabaseKeyTester; 