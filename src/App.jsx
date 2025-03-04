import { useState, useEffect } from "react";
import ButtonGradient from "./assets/svg/ButtonGradient";
import Benefits from "./components/Benefits";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProductLinkForm from "./components/ProductLinkForm";
import CreditAmountForm from "./components/CreditAmountForm";
import FinancingOptions from "./components/FinancingOptions";
import CompanyAuth from "./components/CompanyAuth";
import { getProductInfo } from "./services/api";
import Typewriter from 'typewriter-effect';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import logoCartotec from './assets/logos/logo_empresa_cartotec.png';
import logoCadtoner from './assets/logos/Logo_empresa_cadtoner.png';
import logoEtimex from './assets/logos/logo_empresa_etimex.png';
import logoFortezza from './assets/logos/logo_empresa_fortezza.png';
import logoPlastypel from './assets/logos/logo_empresa_plastypel.png';
import logoUnoretail from './assets/logos/logo_empresa_unoretail.png';
import logoMatamoros from './assets/logos/logo_empresa_matamoros.png';
import logoLogistorage from './assets/logos/logo_empresa_logistorage.png';
import logoMulligans from './assets/logos/logo_empresa_mulligans.png';
import logoVallealto from './assets/logos/logo_empresa_vallealto.png';
import Login from './pages/Login';
import Home from './pages/Home';
import Plans from './pages/Plans';

const App = () => {
  const [productData, setProductData] = useState(null);
  const [showFinancingOptions, setShowFinancingOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [activeForm, setActiveForm] = useState('product'); // 'product' o 'amount'
  const [monthlyIncome, setMonthlyIncome] = useState(null);
  const [showLoader, setShowLoader] = useState(false);

  // Exponer setActiveForm globalmente
  useEffect(() => {
    window.setActiveForm = (formType) => {
      setActiveForm(formType);
      // Dar tiempo para que el estado se actualice antes de hacer scroll
      setTimeout(() => {
        const element = document.getElementById('get-started');
        if (element) {
          const offset = element.offsetTop - 100; // Ajustar el offset para que quede más arriba
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
      
      // Esperamos a que los datos estén listos
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mostramos las opciones de financiamiento
      setShowFinancingOptions(true);
      
      // El loader se mantendrá hasta que FinancingOptions llame a onLoaded
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
      
      // Esperamos a que los datos estén listos
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Establecemos el producto y mostramos las opciones
      setProductData(simulatedProduct);
      setShowFinancingOptions(true);
      
      // El loader se mantendrá hasta que FinancingOptions llame a onLoaded
    } catch (err) {
      setError(err.message);
      console.error("Error processing amount:", err);
      setShowLoader(false);
      setIsLoading(false);
    }
  };

  const handleCompanyAuthenticated = (company) => {
    setCompanyData(company);
  };

  const handlePlanSelection = (planId) => {
    // TODO: Implement financing application process
    console.log("Selected plan:", planId);
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

  return (
    <>
      <div className="relative overflow-hidden">
        {/* Autenticación de la empresa */}
        {!companyData && (
          <CompanyAuth onAuthenticated={handleCompanyAuthenticated} />
        )}

        {/* Contenido principal */}
        {companyData && (
          <>
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
              handlePlanSelection={handlePlanSelection}
              handleBack={handleBack}
              setShowLoader={setShowLoader}
              setIsLoading={setIsLoading}
            />
            {!showFinancingOptions && <Benefits />}
            <Footer />
          </>
        )}
      </div>

      <ButtonGradient />
    </>
  );
};

// Crear el enrutador con las rutas definidas
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
  },
  {
    path: "/planes",
    element: <Plans />
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

// Componente principal que proporciona el enrutador
const AppWrapper = () => {
  return <RouterProvider router={router} />;
};

export default AppWrapper;
