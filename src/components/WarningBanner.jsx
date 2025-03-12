import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiExclamation } from 'react-icons/hi';
import { useLocation } from 'react-router-dom';

const WarningBanner = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // Banner styling for login page (side position)
  if (isLoginPage) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed right-0 top-1/4 z-40 max-w-[280px]"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        >
          <div className="px-2">
            <motion.div
              className="relative overflow-hidden bg-gradient-to-r from-amber-600/80 to-amber-500/80 backdrop-blur-sm text-black border border-amber-400 shadow-lg rounded-l-lg py-3 pl-3 pr-2"
            >
              {/* Pulso de advertencia */}
              <motion.div
                className="absolute top-0 left-0 w-full h-full bg-amber-300/30"
                animate={{ 
                  opacity: [0, 0.3, 0], 
                  scale: [0.85, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "loop",
                  duration: 2.5,
                  ease: "easeInOut"
                }}
              />
              
              <div className="flex flex-col items-start space-y-2">
                <div className="flex-shrink-0 mx-auto">
                  <motion.div
                    className="w-8 h-8 bg-amber-800/80 rounded-full flex items-center justify-center"
                    animate={{ rotate: [0, 5, 0, -5, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "loop",
                      duration: 2.5,
                      ease: "easeInOut" 
                    }}
                  >
                    <HiExclamation className="text-white text-xl" />
                  </motion.div>
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-center text-xs">
                    <strong>IMPORTANTE:</strong> ¡Financiera Incentiva NO solicita dinero o comisiones por adelantado para la evaluación de créditos!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Default banner styling for other pages (top position)
  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-[50px] left-0 w-full z-40 bg-n-8/90 backdrop-blur-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="relative overflow-hidden bg-gradient-to-r from-amber-600/80 to-amber-500/80 backdrop-blur-sm text-black border border-amber-400 shadow-lg rounded-lg py-2"
          >
            {/* Pulso de advertencia */}
            <motion.div
              className="absolute top-0 left-0 w-full h-full bg-amber-300/30"
              animate={{ 
                opacity: [0, 0.3, 0], 
                scale: [0.85, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                repeatType: "loop",
                duration: 2.5,
                ease: "easeInOut"
              }}
            />
            
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <motion.div
                    className="w-8 h-8 bg-amber-800/80 rounded-full flex items-center justify-center"
                    animate={{ rotate: [0, 5, 0, -5, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "loop",
                      duration: 2.5,
                      ease: "easeInOut" 
                    }}
                  >
                    <HiExclamation className="text-white text-xl" />
                  </motion.div>
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-center md:text-left text-sm md:text-base">
                    <strong>IMPORTANTE:</strong> ¡Financiera Incentiva NO solicita dinero o comisiones por adelantado para la evaluación de créditos!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WarningBanner; 