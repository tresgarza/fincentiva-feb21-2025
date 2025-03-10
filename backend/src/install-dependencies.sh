#!/bin/bash

# Script para instalar las dependencias necesarias para el manejo de enlaces acortados

echo "Instalando dependencias para el manejo de enlaces acortados de Amazon..."

# Instalar node-fetch para usar en el script de prueba y para el manejo de fetch en Node.js
npm install node-fetch@2.6.7

echo "Instalación completada."
echo "Puedes probar la resolución de enlaces acortados ejecutando: node src/test-amazon-shortened-url.js" 