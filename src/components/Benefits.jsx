import { GrMoney } from "react-icons/gr";
import { BsCalendarCheck, BsShieldCheck } from "react-icons/bs";
import { AiOutlineRise } from "react-icons/ai";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { MdOutlineLocalOffer } from "react-icons/md";
import Typewriter from 'typewriter-effect';
import Section from "./Section";
import { motion } from "framer-motion";

const Benefits = () => {
  const benefitsList = [
    {
      id: "0",
      title: "Simulador Inteligente",
      text: "Calcula instantáneamente tu capacidad de crédito basada en tus ingresos y periodo de pago.",
      iconComponent: <RiMoneyDollarCircleLine className="text-[#33FF57] text-4xl" />,
    },
    {
      id: "1",
      title: "Planes Personalizados",
      text: "Visualiza diferentes opciones de pago y elige el plazo que mejor se ajuste a tu presupuesto.",
      iconComponent: <BsCalendarCheck className="text-[#33FF57] text-4xl" />,
    },
    {
      id: "2",
      title: "Proceso Transparente",
      text: "Sin letras pequeñas. Conoce exactamente cuánto pagarás y todos los detalles de tu plan.",
      iconComponent: <BsShieldCheck className="text-[#33FF57] text-4xl" />,
    },
    {
      id: "3",
      title: "Control Total",
      text: "Nunca excedas tu capacidad de pago. Te mostramos solo los planes que puedes pagar cómodamente.",
      iconComponent: <AiOutlineRise className="text-[#33FF57] text-4xl" />,
    },
    {
      id: "4",
      title: "Solicitud Simple",
      text: "Proceso 100% en línea. Sin papeleos innecesarios ni visitas a sucursales.",
      iconComponent: <GrMoney className="text-[#33FF57] text-4xl" />,
    },
    {
      id: "5",
      title: "Múltiples Opciones",
      text: "Financia productos de tus tiendas favoritas o solicita crédito según tus necesidades.",
      iconComponent: <MdOutlineLocalOffer className="text-[#33FF57] text-4xl" />,
    },
  ];

  return (
    <Section id="benefits" className="py-16 md:py-20 lg:py-28">
      <div className="container relative z-2">
        {/* Title and Subtitle */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#40E0D0] via-[#4DE8B2] to-[#3FD494] inline-block mb-4 min-h-[60px] md:min-h-[70px] lg:min-h-[80px]">
            <Typewriter
              options={{
                strings: [
                  'Beneficios que te Encantan',
                  'Tu Éxito es Nuestra Prioridad',
                  'Crédito Fácil y Rápido',
                  'Soluciones a tu Medida',
                  'El Futuro de las Finanzas'
                ],
                autoStart: true,
                loop: true,
                delay: 50,
                deleteSpeed: 30,
                pauseFor: 2000,
              }}
            />
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-n-4 max-w-3xl mx-auto"
          >
            Descubre por qué miles de personas confían en nosotros para sus necesidades financieras
          </motion.p>
        </div>

        {/* Benefits Grid */}
        <div className="relative grid gap-6 md:gap-8 lg:gap-10 md:grid-cols-2 lg:grid-cols-3">
          {benefitsList.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="relative p-0.5 rounded-[2rem] bg-gradient-to-r from-[#40E0D0] via-[#4DE8B2] to-[#3FD494] overflow-hidden group"
            >
              <div className="relative bg-n-8 rounded-[1.9rem] h-full p-6 md:p-8 transition-colors duration-200 group-hover:bg-n-7">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute top-0 left-1/2 w-[41.6rem] aspect-square -translate-x-1/2 -translate-y-1/2 bg-[#40E0D0] opacity-0 group-hover:opacity-10 blur-[100px] transition-opacity duration-500" />
                </div>
                <div className="relative z-2">
                  <div className="mb-4 flex justify-center transform transition-transform duration-200 group-hover:scale-110">
                    {item.iconComponent}
                  </div>
                  <h3 className="h4 mb-4 text-center text-n-1 group-hover:text-[#33FF57] transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="body-2 text-n-4 text-center group-hover:text-n-3 transition-colors duration-200">
                    {item.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Benefits;
