import { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthContainer = ({ onAuthenticated }) => {
  const [mode, setMode] = useState('login');
  const [initialCompanyCode, setInitialCompanyCode] = useState('');
  
  const switchToRegister = (companyCode = '') => {
    setInitialCompanyCode(companyCode);
    setMode('register');
  };
  
  const switchToLogin = () => {
    setMode('login');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-20 md:pt-4 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-n-8 via-n-8/95 to-n-8/90 z-0" />
        
        {/* Animated Circles */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#33FF57]/10 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#40E0D0]/10 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-[#4DE8B2]/10 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(51,255,87,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(51,255,87,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-[1200px] w-full mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#33FF57] mb-4">
            Fincentiva
          </h1>
          <p className="text-n-3 text-lg max-w-2xl mx-auto">
            Plataforma empresarial de financiamiento que permite
            adquirir productos y servicios con facilidades de pago
          </p>
        </div>

        {/* Authentication Component */}
        {mode === 'login' ? (
          <Login 
            onAuthenticated={onAuthenticated}
            switchToRegister={switchToRegister}
          />
        ) : (
          <Register 
            onAuthenticated={onAuthenticated}
            switchToLogin={switchToLogin}
            initialCompanyCode={initialCompanyCode}
          />
        )}
      </div>

      {/* Add styles for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AuthContainer; 