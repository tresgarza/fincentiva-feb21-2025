import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Navigate, useNavigate } from 'react-router-dom';
import ButtonGradient from "./assets/svg/ButtonGradient";
import Benefits from "./components/Benefits";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProductLinkForm from "./components/ProductLinkForm";
import CreditAmountForm from "./components/CreditAmountForm";
import FinancingOptions from "./components/FinancingOptions";
import { getProductInfo } from "./services/api";
import { AnimatePresence, motion } from 'framer-motion';
import Login from "./pages/Login";

const Home = () => {
  const navigate = useNavigate();
  const [productData, setProductData] = useState(null);
  const [showFinancingOptions, setShowFinancingOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [activeForm, setActiveForm] = useState('product');
  const [monthlyIncome, setMonthlyIncome] = useState(null);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // Verificar si hay datos de la compañía en localStorage
    const storedCompanyData = localStorage.getItem('companyData');
    if (!storedCompanyData) {
      navigate('/login');
    } else {
      setCompanyData(JSON.parse(storedCompanyData));
    }
  }, [navigate]);

  // Exponer setActiveForm globalmente
  useEffect(() => {
    window.setActiveForm = (formType) => {
      setActiveForm(formType);
      setTimeout(() => {
        const element = document.getElementById('get-started');
        if (element) {
          const offset = element.offsetTop - 100;
          window.scrollTo({
            top: offset,
            behavior: 'smooth'
          });
        }
      }, 100);
    };

    return () => {
      delete window.setActiveForm;
    };
  }, []);

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
      setShowLoader(false);
      setIsLoading(false);
    }
  };

  const handlePlanSelection = (planId) => {
    console.log("Selected plan:", planId);
  };

  const handleBack = () => {
    setShowFinancingOptions(false);
    setProductData(null);
    setError(null);
  };

  if (!companyData) {
    return null;
  }

  return (
    <>
      <div className="pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden">
        <Header />
        <Hero />
        
        <section className="container mx-auto px-4 py-4">
          {error && (
            <div className="max-w-[40rem] mx-auto mb-4">
              <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg">
                {error}
              </div>
            </div>
          )}
          
          <div className="w-full max-w-[1400px] mx-auto" id="get-started">
            {/* Loader Global */}
            <AnimatePresence>
              {showLoader && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 flex items-center justify-center z-50 bg-n-8/90 backdrop-blur-sm"
                >
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-[#33FF57] rounded-full animate-spin border-t-transparent"></div>
                    <div className="w-16 h-16 border-4 border-[#40E0D0] rounded-full animate-spin-slow absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-t-transparent"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 bg-[#33FF57] rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="absolute mt-32 text-n-1 text-lg font-medium">
                    <div className="flex items-center gap-2">
                      <span className="animate-pulse">Calculando tus opciones de financiamiento</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#33FF57] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-[#33FF57] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-[#33FF57] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Contenido Principal */}
            <div className="relative">
              {/* Formularios */}
              {!showFinancingOptions && (
                <>
                  {activeForm === 'product' ? (
                    <ProductLinkForm
                      onSubmit={handleProductSubmit}
                      isLoading={isLoading}
                      company={companyData}
                      showLoader={showLoader}
                    />
                  ) : (
                    <CreditAmountForm
                      onSubmit={handleAmountSubmit}
                      isLoading={isLoading}
                      company={companyData}
                      showLoader={showLoader}
                    />
                  )}
                </>
              )}

              {/* Opciones de Financiamiento */}
              {showFinancingOptions && (
                <div>
                  <FinancingOptions
                    product={productData}
                    company={{...companyData, monthly_income: monthlyIncome}}
                    onSelectPlan={handlePlanSelection}
                    onBack={handleBack}
                    onLoaded={() => {
                      setShowLoader(false);
                      setIsLoading(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Benefits y Footer */}
        {!showFinancingOptions && <Benefits />}
        <Footer />
      </div>

      <ButtonGradient />
    </>
  );
};

// Create router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/inicio",
    element: <Home />
  }
]);

// Export the RouterProvider component with our router configuration
export default function AppWrapper() {
  return <RouterProvider router={router} />;
}
