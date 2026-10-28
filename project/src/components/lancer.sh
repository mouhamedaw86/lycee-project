#!/bin/sh
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Installe Node.js (LTS) : https://nodejs.org"; exit 1; }
npm install
npm run dev:all
