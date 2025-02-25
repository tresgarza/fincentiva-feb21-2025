import { motion } from "framer-motion";

import SectionSvg from "../assets/svg/SectionSvg";

const Section = ({
  className,
  id,
  crosses,
  crossesOffset,
  customPaddings,
  children,
}) => {
  return (
    <div
      id={id}
      className={`
        relative 
        ${customPaddings || `py-2 lg:py-2 xl:py-2`} 
        ${className || ""}
      `}
    >
      {children}
    </div>
  );
};

export default Section;
