import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Benefits from "../components/Benefits";
import Footer from "../components/Footer";
import ButtonGradient from "../assets/svg/ButtonGradient";
import { getProductInfo } from "../services/api";

const Home = () => {
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [showFinancingOptions, setShowFinancingOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeForm, setActiveForm] = useState('product');
  const [monthlyIncome, setMonthlyIncome] = useState(null);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // Verificar autenticación al cargar la página
    const storedCompanyData = localStorage.getItem('companyData');
    if (!storedCompanyData) {
      navigate('/login');
    } else {
      const parsedData = JSON.parse(storedCompanyData);
      setCompanyData(parsedData);
      setUserData(parsedData.user_data);
    }
  }, [navigate]);

  const handleProductSubmit = async (productLink, income, monthlyIncome) => {
    setIsLoading(true);
    setShowLoader(true);
    setError(null);
    
    try {
      const data = await getProductInfo(productLink);
      setProductData(data);
      setMonthlyIncome(income);
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/planes', { 
        state: { 
          productData: data, 
          monthlyIncome: income,
          companyData: companyData,
          userData: userData
        } 
      });
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
        title: "Crédito Personal",
        price: amount,
        features: ["Financiamiento directo", "Disponibilidad inmediata"]
      };
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/planes', { 
        state: { 
          productData: simulatedProduct, 
          monthlyIncome: income,
          companyData: companyData,
          userData: userData
        } 
      });
    } catch (err) {
      setError(err.message);
      console.error("Error processing amount:", err);
    } finally {
      setShowLoader(false);
      setIsLoading(false);
    }
  };

  const handlePlanSelection = (planId) => {
    // Implementar lógica de selección de plan
    console.log("Selected plan:", planId);
  };
  
  const handleBack = () => {
    setShowFinancingOptions(false);
    setProductData(null);
  };
  
  const handleFinancingOptionsLoaded = () => {
    setShowLoader(false);
    setIsLoading(false);
  };

  // Función para obtener el nombre completo del usuario
  const getFullName = () => {
    if (!userData) return '';
    
    const firstName = userData.first_name || userData.firstName || '';
    const paternalSurname = userData.paternal_surname || '';
    const maternalSurname = userData.maternal_surname || '';
    const lastName = userData.lastName || '';
    
    // Si tenemos el formato de nombre completamente separado
    if (firstName && (paternalSurname || maternalSurname)) {
      return `${firstName} ${paternalSurname} ${maternalSurname}`.trim();
    }
    
    // Si tenemos el formato simplificado
    return `${firstName} ${lastName}`.trim();
  };

  if (!companyData) {
    return null;
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
        <Header userData={userData} companyData={companyData} />
        
        <div className="pt-[80px]"> {/* Reducido el espacio para el header y banner amarillo */}
          {/* User Welcome Banner - Movido aquí para que aparezca después del banner amarillo */}
          {userData && (
            <div className="bg-gradient-to-r from-[#33FF57]/20 to-[#40E0D0]/20 backdrop-blur-sm border border-[#33FF57]/30 rounded-lg mx-4 md:mx-8 mb-2 p-4 text-center">
              <h2 className="text-lg md:text-xl font-medium">
                Bienvenido(a), <span className="font-bold text-[#33FF57]">{getFullName()}</span>
              </h2>
              <p className="text-sm text-n-3">
                Empresa: <span className="text-n-1">{companyData.name}</span> | 
                Teléfono: <span className="text-n-1">{userData.phone}</span>
              </p>
            </div>
          )}
          
          <Hero 
            activeForm={activeForm}
            setActiveForm={setActiveForm}
            showFinancingOptions={showFinancingOptions}
            handleProductSubmit={handleProductSubmit}
            handleAmountSubmit={handleAmountSubmit}
            isLoading={isLoading}
            companyData={companyData}
            userData={userData}
            showLoader={showLoader}
            productData={productData}
            monthlyIncome={monthlyIncome}
            handlePlanSelection={handlePlanSelection}
            handleBack={handleBack}
            handleFinancingOptionsLoaded={handleFinancingOptionsLoaded}
          />
          {!productData && <Benefits />}
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