import { useState, useEffect } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Benefits from "../components/Benefits";
import Footer from "../components/Footer";
import ButtonGradient from "../assets/svg/ButtonGradient";
import { getProductInfo } from "../services/api";
import { getUserData } from "../utils/auth";

const Home = () => {
  const [companyData, setCompanyData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [showFinancingOptions, setShowFinancingOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeForm, setActiveForm] = useState('product');
  const [monthlyIncome, setMonthlyIncome] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Cargar datos de la empresa desde el utility
    if (!isInitialized) {
      const userData = getUserData();
      if (userData) {
        setCompanyData(userData);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handleProductSubmit = async (productLink, income, monthlyIncome) => {
    setIsLoading(true);
    setShowLoader(true);
    setError(null);
    
    try {
      const data = await getProductInfo(productLink);
      setProductData(data);
      setMonthlyIncome(income);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowFinancingOptions(true);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching product data:", err);
    } finally {
      setShowLoader(false);
      setIsLoading(false);
    }
  };

  const handleAmountSubmit = async (amount, income) => {
    setIsLoading(true);
    setShowLoader(true);
    setError(null);
    
    try {
      setMonthlyIncome(income);
      const simulatedProduct = {
        title: "Crédito en Efectivo",
        price: amount,
        features: ["Financiamiento directo", "Disponibilidad inmediata"]
      };
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProductData(simulatedProduct);
      setShowFinancingOptions(true);
    } catch (err) {
      setError(err.message);
      console.error("Error processing amount:", err);
    } finally {
      setShowLoader(false);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Primero hacemos el scroll suave hacia arriba
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Después de un pequeño delay, actualizamos los estados
    setTimeout(() => {
      setShowFinancingOptions(false);
      setProductData(null);
      setError(null);
    }, 100);
  };

  // Mostrar un indicador de carga mientras se inicializa
  if (!isInitialized || !companyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-n-8">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-n-1 border-t-[#33FF57] rounded-full animate-spin"></div>
          <p className="mt-2 text-n-1">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-n-8">
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
      <div className="relative z-10">
        <Header />
        <Hero 
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          showFinancingOptions={showFinancingOptions}
          handleProductSubmit={handleProductSubmit}
          handleAmountSubmit={handleAmountSubmit}
          isLoading={isLoading}
          companyData={companyData}
          showLoader={showLoader}
          productData={productData}
          monthlyIncome={monthlyIncome}
          handleBack={handleBack}
          setShowLoader={setShowLoader}
          setIsLoading={setIsLoading}
        />
        <div className="mt-8">
          {!showFinancingOptions && <Benefits />}
        </div>
        <Footer />
        <ButtonGradient />
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

export default Home; 