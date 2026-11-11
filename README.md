# MiCompañero

Frontend en React + Vite para la comunidad de la clase: registro de estudiantes y listado de compañeros. Consume una API REST externa.

## Funcionalidades

- **Inicio** (`/`): página de bienvenida.
- **Mis compañeros** (`/#/mis-companeros`): lista los usuarios registrados (`GET /users`) con buscador por nombre, email o RUT.
- **Registrarme** (`/#/registrarme`): formulario de registro (`POST /auth/register`); al registrarse guarda `token` y `user` en `localStorage`.

## Instalación

```bash
git clone https://github.com/cayocft/mi-clase-react.git
cd mi-clase-react
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=https://backend-react-fcsl.onrender.com/api-backend
```

## Ejecución

```bash
npm run dev       # desarrollo → http://localhost:5173/
npm run build     # build de producción → dist/
npm run preview   # previsualizar el build
npm run deploy    # publicar en GitHub Pages
```

Deploy: https://cayocft.github.io/mi-clase-react/

## Stack

React 19 · React Router (HashRouter) · Tailwind CSS 4 · Vite 8
