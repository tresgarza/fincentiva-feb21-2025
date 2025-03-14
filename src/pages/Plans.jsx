import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FinancingOptions from '../components/FinancingOptions';
import ButtonGradient from '../assets/svg/ButtonGradient';

const Plans = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productData, monthlyIncome, companyData } = location.state || {};

  useEffect(() => {
    // Verificar que tengamos todos los datos necesarios
    if (!productData || !monthlyIncome || !companyData) {
      navigate('/inicio');
    }
  }, [productData, monthlyIncome, companyData, navigate]);

  // Añadir efecto para hacer scroll al inicio cuando se cargan los planes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const handleBack = () => {
    navigate('/inicio');
  };

  const handlePlanSelection = (planId) => {
    // Implementar lógica de selección de plan
    console.log("Selected plan:", planId);
  };

  if (!productData || !monthlyIncome || !companyData) {
    return null; // O un componente de carga
  }

  return (
    <div className="relative min-h-screen bg-n-8">
      <Header />
      <div className="container mx-auto px-4 pt-[100px]">
        <FinancingOptions
          product={productData}
          company={{
            ...companyData, 
            monthly_income: monthlyIncome,
            // Asegurar que existe una tasa de comisión por defecto
            commission_rate: companyData.commission_rate || 5 
          }}
          onSelectPlan={handlePlanSelection}
          onBack={handleBack}
          onLoaded={() => {}}
        />
      </div>
      <Footer />
      <ButtonGradient />
    </div>
  );
};

export default Plans; 