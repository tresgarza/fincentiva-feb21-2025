#!/bin/bash

# Script para instalar las dependencias necesarias para el manejo de enlaces acortados

echo "Instalando dependencias para manejar enlaces acortados de Amazon..."

# Instalar node-fetch v2 (compatible con require/import)
npm install node-fetch@2.6.7

# Instalar axios para solicitudes HTTP alternativas
npm install axios@0.27.2

echo "Instalación completada. Puedes probar la resolución de enlaces acortados ejecutando:"
echo "node src/test-amazon-shortened-url.js" 