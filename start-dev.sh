#!/bin/bash

# Iniciar el backend
cd backend
npm install
npm run dev &

# Esperar a que el backend esté listo
sleep 5

# Iniciar el frontend
cd ..
npm install
npm run dev 