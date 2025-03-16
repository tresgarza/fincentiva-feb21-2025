import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { disablePageScroll, enablePageScroll } from "scroll-lock";
import { HambugerMenu } from "./design/Header";
import MenuSvg from "../assets/svg/MenuSvg";
import { FaSignOutAlt } from "react-icons/fa";
import { getCompanyAdvisor } from "../services/supabaseServices";

const Header = () => {
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

  // Obtener los datos del usuario para mostrar en el header
  const companyData = JSON.parse(localStorage.getItem('companyData') || '{}');
  const userName = companyData?.user_data?.firstName 
    ? `${companyData.user_data.firstName} ${companyData.user_data.lastName || ''}`
    : '';

  // Cargar el advisor de la empresa al iniciar
  useEffect(() => {
    const loadAdvisor = async () => {
      if (companyData && companyData.id) {
        console.log('Cargando datos del asesor para:', companyData.name);
        
        // Si la empresa ya tiene el teléfono del asesor, usamos ese
        if (companyData.advisor_phone) {
          setAdvisorData({ phone: companyData.advisor_phone });
          return;
        }
        
        try {
          const result = await getCompanyAdvisor(companyData.id);
          
          if (result.success && result.data) {
            setAdvisorData(result.data);
            console.log('Asesor obtenido:', result.data);
          } else {
            console.warn('No se pudo obtener el asesor para la empresa');
          }
        } catch (error) {
          console.error('Error al cargar el asesor:', error);
        }
      }
    };

    loadAdvisor();
  }, []);

  const handleClick = (e) => {
    if (openNavigation) {
      enablePageScroll();
      setOpenNavigation(false);
    }

    // Si el enlace es interno (comienza con #), prevenir comportamiento por defecto
    if (e.target.getAttribute('href')?.startsWith('#')) {
      e.preventDefault();
      const targetId = e.target.getAttribute('href').slice(1);
      
      // Si es "contact", abrir WhatsApp
      if (targetId === "contact") {
        openWhatsAppContact();
        return;
      }
      
      const element = document.getElementById(targetId);
      if (element) {
        const offset = element.offsetTop - 100;
        window.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
      }
    }
  };

  const openWhatsAppContact = () => {
    // Determinar el número de teléfono del asesor
    let phoneNumber = '5218116364522'; // Número por defecto - Diego Garza
    
    // Verificamos la información del teléfono
    console.log('Verificando teléfono del asesor para empresa:', companyData.name);
    console.log('Teléfono guardado en la empresa:', companyData.advisor_phone);
    
    // Usar directamente el teléfono de la empresa si está disponible
    if (companyData.advisor_phone) {
      // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
      const cleanPhone = companyData.advisor_phone.replace(/\D/g, '');
      
      // Asegurarse de que tiene el formato correcto para WhatsApp
      if (cleanPhone.startsWith('52')) {
        phoneNumber = cleanPhone;
      } else if (cleanPhone.length === 10) {
        phoneNumber = `52${cleanPhone}`;
      } else {
        phoneNumber = `52${cleanPhone}`;
      }
      
      console.log('Usando número de teléfono del asesor asignado a la empresa:', phoneNumber);
    } else if (advisorData && advisorData.phone) {
      // Como respaldo, usar el teléfono del asesor obtenido de la consulta
      const cleanPhone = advisorData.phone.replace(/\D/g, '');
      
      if (cleanPhone.startsWith('52')) {
        phoneNumber = cleanPhone;
      } else if (cleanPhone.length === 10) {
        phoneNumber = `52${cleanPhone}`;
      } else {
        phoneNumber = `52${cleanPhone}`;
      }
      
      console.log('Usando número de teléfono del asesor obtenido por consulta:', phoneNumber);
    } else {
      console.warn('No se encontró teléfono del asesor, usando número por defecto o específico');
      
      // Mapeo de códigos de empresa a números de teléfono como último respaldo
      const companyCodeToPhoneMap = {
        'CAD0227': '5218113800021', // Alexis Medina - CADTONER
        'CAR5799': '5218211110095', // Angelica Elizondo - Taquería "Tía Carmen"
        'TRA5976': '5218211110095', // Angelica Elizondo - Transportes
        'PRE2030': '5218211110095', // Angelica Elizondo - Presidencia
        'RAQ3329': '5218211110095', // Angelica Elizondo - Doña Raquel
        'CAR9424': '5218117919076', // Edgar Benavides - Cartotec
        'GSL9775': '5218116364522',  // Diego Garza - Industrias GSL
        'HOW1234': '5218120007707'   // Sofía Esparza - Grupo Hower
      };
      
      // Buscar por código de empresa como último respaldo
      if (companyData.employee_code && companyCodeToPhoneMap[companyData.employee_code]) {
        phoneNumber = companyCodeToPhoneMap[companyData.employee_code];
        console.log('Usando número específico para código de empresa:', companyData.employee_code, phoneNumber);
      } else {
        // Si todo lo demás falla, intentamos buscar coincidencias parciales en el nombre de la empresa
        const companyNameKeywords = {
          'Hower': '5218120007707',   // Sofía Esparza
          'Sofia': '5218120007707',   // Sofía Esparza
          'Carmen': '5218211110095',  // Angelica Elizondo
          'CADTONER': '5218113800021' // Alexis Medina
        };
        
        for (const keyword in companyNameKeywords) {
          if (companyData.name && companyData.name.includes(keyword)) {
            phoneNumber = companyNameKeywords[keyword];
            console.log('Coincidencia por palabra clave en nombre:', keyword, phoneNumber);
            break;
          }
        }
      }
    }

    // Generar mensaje personalizado
    const message = generateContactMessage();
    
    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Abrir WhatsApp en una nueva pestaña
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const generateContactMessage = () => {
    // Obtener datos del usuario y empresa
    const userData = companyData.user_data || {};
    const userName = userData.firstName ? `${userData.firstName} ${userData.lastName || ''}` : 'un colaborador';
    const companyName = companyData.name || 'mi empresa';
    
    return `Hola, soy ${userName} y trabajo en ${companyName}. Los contacto a través de la plataforma de crédito vía nómina de Fincentiva para hacer una consulta.`;
  };

  const handleLogout = () => {
    // Eliminar los datos de la empresa del localStorage
    localStorage.removeItem('companyData');
    // Redirigir a la página de login
    navigate('/login');
  };

  const navigation = [
    {
      id: "0",
      title: "Cómo Utilizar",
      url: "#hero",
    },
    {
      id: "1",
      title: "Beneficios",
      url: "#benefits",
    },
    {
      id: "2",
      title: "Contacto",
      url: "#contact", // Cambiado de "#footer" a "#contact" para nuestro manejador personalizado
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
          className="block w-[10rem] mr-12"
          onClick={handleClick}
        >
          <h1 className="text-xl font-bold text-white">FINCENTIVA</h1>
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
        {userName && (
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden md:block text-n-1 text-sm">{userName}</span>
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
          className={`${userName ? 'mr-4' : 'ml-auto'} lg:hidden`}
        >
          <MenuSvg openNavigation={openNavigation} />
        </button>
      </div>
    </div>
  );
};

export default Header;
