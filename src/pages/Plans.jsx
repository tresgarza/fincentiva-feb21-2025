import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import WarningBanner from '../components/WarningBanner';
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
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <WarningBanner />
        <div className="flex-grow">
          <div className="container mx-auto px-4 py-10">
            <FinancingOptions
              product={productData}
              company={{...companyData, monthly_income: monthlyIncome}}
              onSelectPlan={handlePlanSelection}
              onBack={handleBack}
              onLoaded={() => {}}
            />
          </div>
        </div>
        <Footer />
        <ButtonGradient />
      </div>
    </div>
  );
};

export default Plans; 