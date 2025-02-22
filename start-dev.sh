#!/bin/bash

echo "🚀 Iniciando el entorno de desarrollo..."

# Función para verificar si un comando existe
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Verificar que Node.js esté instalado
if ! command_exists node; then
  echo "❌ Node.js no está instalado. Por favor, instálalo desde https://nodejs.org"
  exit 1
fi

# Verificar que npm esté instalado
if ! command_exists npm; then
  echo "❌ npm no está instalado. Por favor, instala Node.js desde https://nodejs.org"
  exit 1
fi

# Obtener la IP local
if command_exists ipconfig; then
  # Windows
  LOCAL_IP=$(ipconfig | grep -i "IPv4" | head -1 | awk '{print $NF}')
elif command_exists ifconfig; then
  # Mac/Linux
  LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
else
  LOCAL_IP="localhost"
fi

echo "📦 Instalando dependencias del backend..."
cd backend
npm install

echo "🔧 Verificando archivo .env del backend..."
if [ ! -f .env ]; then
  echo "PORT=3001" > .env
  echo "NODE_ENV=development" >> .env
fi

echo "🚀 Iniciando el servidor backend..."
npm run dev &
BACKEND_PID=$!

# Esperar a que el backend esté listo
echo "⏳ Esperando a que el backend esté listo..."
sleep 5

echo "📦 Instalando dependencias del frontend..."
cd ..
npm install

echo "🔧 Verificando archivo .env.local del frontend..."
if [ ! -f .env.local ]; then
  echo "VITE_API_URL=http://localhost:3001/api" > .env.local
fi

echo "🚀 Iniciando el servidor frontend..."
# Iniciar servidor principal
npm run dev &
FRONTEND_PID=$!

# Iniciar servidor para desarrollo móvil
echo "🚀 Iniciando servidor para desarrollo móvil..."
VITE_PORT=5174 npm run dev -- --port 5174 --host &
MOBILE_PID=$!

# Mostrar URLs de acceso
echo "
🌐 Accede a la aplicación en:

   Desktop: http://localhost:5173
   
   Móvil (desde tu celular): http://$LOCAL_IP:5174
   
   DevTools Móvil: http://localhost:5173 
                   (Presiona F12 -> Click en ícono de móvil)

📱 Para probar en tu celular:
   1. Conéctate a la misma red WiFi que esta computadora
   2. Abre http://$LOCAL_IP:5174 en tu celular
   3. Usa los códigos de prueba: PRUEBA1, PRUEBA2 o PRUEBA3
"

# Función para manejar el cierre
cleanup() {
  echo "🛑 Deteniendo servidores..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  kill $MOBILE_PID
  exit 0
}

# Configurar el manejador de señales
trap cleanup SIGINT SIGTERM

# Mantener el script corriendo
wait 