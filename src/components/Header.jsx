import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { disablePageScroll, enablePageScroll } from "scroll-lock";
import { HambugerMenu } from "./design/Header";
import MenuSvg from "../assets/svg/MenuSvg";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import { getCompanyAdvisor } from "../services/supabaseServices";
import logo from "../assets/logos/fincentiva-logo.png";

const Header = ({ userData, companyData }) => {
  const pathname = useLocation();
  const navigate = useNavigate();
  const [openNavigation, setOpenNavigation] = useState(false);
  const [advisorData, setAdvisorData] = useState(null);

  const toggleNavigation = () => {
    if (openNavigation) {
      setOpenNavigation(false);
      enablePageScroll();
    } else {
      setOpenNavigation(true);
      disablePageScroll();
    }
  };

  // Si no se proporcionaron datos de compañía/usuario, intentar obtenerlos de localStorage
  const storedCompanyData = !companyData ? JSON.parse(localStorage.getItem('companyData') || '{}') : companyData;
  const storedUserData = !userData ? storedCompanyData?.user_data : userData;

  // Obtener nombre completo del usuario
  const getFullName = () => {
    if (!storedUserData) return '';
    
    const firstName = storedUserData.first_name || storedUserData.firstName || '';
    const paternalSurname = storedUserData.paternal_surname || '';
    const maternalSurname = storedUserData.maternal_surname || '';
    const lastName = storedUserData.lastName || '';

    // Si tenemos el formato de nombre completamente separado
    if (firstName && (paternalSurname || maternalSurname)) {
      return `${firstName} ${paternalSurname} ${maternalSurname}`.trim();
    }
    
    // Si tenemos el formato simplificado
    return `${firstName} ${lastName}`.trim();
  };

  const userName = getFullName();

  // Cargar advisorData
  useEffect(() => {
    const loadAdvisorData = async () => {
      if (storedCompanyData && storedCompanyData.id) {
        try {
          const advisor = await getCompanyAdvisor(storedCompanyData.id);
          setAdvisorData(advisor);
        } catch (error) {
          console.error("Error al cargar datos del asesor:", error);
        }
      }
    };

    loadAdvisorData();
  }, [storedCompanyData]);

  const handleClick = (e) => {
      e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    
    if (href === "#home" || href === "#hero") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      const element = document.querySelector(href);
      const offset = 50;
      if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }

    if (openNavigation) {
      setOpenNavigation(false);
      enablePageScroll();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('companyData');
    navigate('/login');
  };

  const navigation = [
    {
      id: "0",
      title: "Inicio",
      url: "#hero",
    },
    {
      id: "1",
      title: "Beneficios",
      url: "#benefits",
    },
    {
      id: "2",
      title: "Productos",
      url: "#products",
    },
    {
      id: "3",
      title: "Contacto",
      url: "#contact",
    }
  ];

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 border-b border-n-6 lg:bg-n-8/90 lg:backdrop-blur-sm ${
        openNavigation ? "bg-n-8" : "bg-n-8/90 backdrop-blur-sm"
      }`}
    >
      <div className="flex items-center px-4 lg:px-6 max-lg:py-2 h-[50px]">
        <a 
          href="#hero" 
          className="block w-[12rem] mr-12"
          onClick={handleClick}
        >
          <img src={logo} alt="FINCENTIVA" className="h-[40px] w-auto" />
        </a>

        <nav
          className={`${
            openNavigation ? "flex" : "hidden"
          } fixed top-[4rem] left-0 right-0 bottom-0 bg-n-8 lg:static lg:flex lg:bg-transparent`}
        >
          <div className="relative z-2 flex flex-col items-center justify-center m-auto lg:flex-row lg:justify-start">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={item.url}
                onClick={(e) => {
                  handleClick(e);
                  item.onClick?.();
                }}
                className={`block relative font-code text-xl uppercase text-n-1 transition-colors hover:text-[#33FF57] ${
                  item.onlyMobile && "lg:hidden"
                } px-6 py-4 md:py-6 lg:mr-0.25 lg:text-sm lg:font-semibold ${
                  item.url === pathname.hash
                    ? "z-2 lg:text-n-1"
                    : "lg:text-n-1/50"
                } lg:leading-5 lg:hover:text-[#33FF57]`}
              >
                {item.title}
              </a>
            ))}
          </div>

          <HambugerMenu />
        </nav>

        {/* Mostrar nombre de usuario y botón de logout */}
        {storedUserData && (
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <span className="bg-n-7 p-1 rounded-full">
                <FaUser className="text-[#33FF57] text-sm" />
              </span>
              <span className="text-n-1 text-sm font-medium">{userName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-n-7 hover:bg-n-6 text-n-1 px-3 py-1.5 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <FaSignOutAlt className="text-[#33FF57]" />
              <span className="hidden md:block">Salir</span>
            </button>
          </div>
        )}

        <button
          onClick={toggleNavigation}
          className={`${storedUserData ? 'mr-4' : 'ml-auto'} lg:hidden`}
        >
          <MenuSvg openNavigation={openNavigation} />
        </button>
      </div>
    </div>
  );
};

export default Header;
