import { socials } from "../constants";
import Section from "./Section";
import logoBuro from "../assets/logos/logo_buro.png";
import logoCondusef from "../assets/logos/logo_condusef.png";
import logoCNBV from "../assets/logos/Logo_CNBV.png";
import { FaFileAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer id="footer" className="py-10 bg-n-8 border-t border-n-6">
      <div className="container mx-auto px-4">
        {/* Sección de Reguladores */}
        <div className="mb-12">
          <h4 className="text-lg font-semibold text-n-1 mb-6 text-center whitespace-normal">
            Instituciones que nos Regulan, Califican y Reconocen:
          </h4>
          <div className="flex justify-center gap-8 mb-8">
            <a 
              href="https://www.buro.gob.mx/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:bg-white/10 transition-colors"
            >
              <img src={logoBuro} alt="Logo Buró de Entidades Financieras" className="h-12 object-contain" />
            </a>
            <a 
              href="https://www.condusef.gob.mx/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:bg-white/10 transition-colors"
            >
              <img src={logoCondusef} alt="Logo CONDUSEF" className="h-12 object-contain" />
            </a>
            <a 
              href="https://www.gob.mx/cnbv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:bg-white/10 transition-colors"
            >
              <img src={logoCNBV} alt="Logo CNBV" className="h-12 object-contain" />
            </a>
          </div>
        </div>

        {/* Información Legal */}
        <div className="max-w-4xl mx-auto text-center space-y-6 text-sm text-n-4">
          <p>
            Financiera Incentiva, S.A.P.I. de C.V., SOFOM, E.N.R., está constituido y operando con carácter de SOFOM E.N.R. para lo cual no requiere autorización de la Secretaría de Hacienda y Crédito Público, y está sujeto a la supervisión de la Comisión Nacional Bancaria y de Valores, únicamente para lo dispuesto en el art. 56 de la Ley General de Organizaciones y Actividades Auxiliares de Crédito.
          </p>
          
          <p>
            El Buró de Entidades Financieras contiene información de Financiera Incentiva, S.A.P.I. de C.V., SOFOM, E.N.R., sobre nuestro desempeño frente a los usuarios por la prestación de productos y servicios.
            Te invitamos a consultarlo en la página{" "}
            <a 
              href="https://www.buro.gob.mx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#33FF57] hover:underline"
            >
              https://www.buro.gob.mx
            </a>
            {" "}o nuestra página de internet{" "}
            <a 
              href="https://fincentiva.com.mx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#33FF57] hover:underline"
            >
              https://fincentiva.com.mx
            </a>
          </p>

          <div className="flex items-center justify-center gap-2 text-n-3">
            <span>Titular de la UNE</span>
            <span className="text-n-1">|</span>
            <span>Adolfo Medina Figueroa</span>
            <span className="text-n-1">|</span>
            <a 
              href="mailto:amedina@fincentiva.com.mx"
              className="text-[#33FF57] hover:underline"
            >
              amedina@fincentiva.com.mx
            </a>
          </div>
        </div>

        {/* Copyright y enlaces legales */}
        <div className="mt-8 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
            <a 
              href="/docs/aviso-privacidad.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-n-7 hover:bg-n-6 text-n-1 rounded-lg transition-colors"
            >
              <FaFileAlt className="text-[#33FF57]" />
              <span>Aviso de Privacidad</span>
            </a>
          </div>
          <p className="text-sm text-n-4">© {new Date().getFullYear()} Financiera Incentiva. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
