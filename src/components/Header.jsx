import { useState } from "react";
import { useLocation } from "react-router-dom";
import { disablePageScroll, enablePageScroll } from "scroll-lock";
import { HambugerMenu } from "./design/Header";
import MenuSvg from "../assets/svg/MenuSvg";

const Header = () => {
  const pathname = useLocation();
  const [openNavigation, setOpenNavigation] = useState(false);

  const toggleNavigation = () => {
    if (openNavigation) {
      setOpenNavigation(false);
      enablePageScroll();
    } else {
      setOpenNavigation(true);
      disablePageScroll();
    }
  };

  const handleClick = (e) => {
    if (openNavigation) {
      enablePageScroll();
      setOpenNavigation(false);
    }

    // Si el enlace es interno (comienza con #), prevenir comportamiento por defecto
    if (e.target.getAttribute('href')?.startsWith('#')) {
      e.preventDefault();
      const targetId = e.target.getAttribute('href').slice(1);
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
      url: "#footer",
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

        <button
          onClick={toggleNavigation}
          className="ml-auto lg:hidden"
        >
          <MenuSvg openNavigation={openNavigation} />
        </button>
      </div>
    </div>
  );
};

export default Header;
