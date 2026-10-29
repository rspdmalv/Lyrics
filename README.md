# StageLyrics — Teleprompter Musical para Ensayos

StageLyrics es una aplicación web pensada para salas de ensayo y directos con bandas musicales. Permite proyectar la letra en un televisor o monitor externo (vía HDMI) con desplazamiento automático fluido tipo créditos de cine, fondo negro puro de alto contraste y control ágil de velocidad y tempo en BPM.

---

## 🚀 Cómo ejecutar localmente en tu computador

### 1. Requisitos previos
- Tener instalado **Node.js** (versión 18 o superior recomendada). Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
- Git instalado (opcional, para clonar).

### 2. Pasos de instalación y arranque

Abre tu terminal (PowerShell, Git Bash o Terminal de macOS/Linux) y ejecuta:

```bash
# 1. Navega a la carpeta del proyecto
cd stagelyrics

# 2. Instala todas las dependencias
npm install

# 3. Inicia el servidor de desarrollo local
npm run dev
```

Una vez que arranque, verás en la terminal un enlace como este:
```
  VITE v8.x.x  ready in 250 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Abre **`http://localhost:3000/`** en Google Chrome, Microsoft Edge, Brave, Safari o Firefox.

---

## 📺 Cómo usarlo en tu local de ensayo con Televisor (HDMI)

1. **Conecta el televisor:** Conecta tu laptop al televisor mediante cable HDMI.
2. **Extender pantalla:**
   - En **Windows**: Presiona `Win + P` y elige **Extender**.
   - En **Mac**: Ve a **Ajustes del Sistema > Pantallas > Usar como pantalla extendida**.
3. **Lanzar la letra:**
   - En tu laptop, introduce la letra, título, tonalidad y BPM.
   - Pulsa el botón amarillo **INICIAR LETRA**.
   - Se abrirá una nueva pestaña/ventana con la letra corriendo automáticamente.
4. **Mover al TV y Pantalla Completa:**
   - Arrastra esa ventana hacia el televisor.
   - Presiona la tecla **`F`** (o el botón de pantalla completa) para que ocupe todo el televisor con fondo negro puro.
   - Puedes controlar la velocidad con **`+`** / **`-`** o pausar con la **Barra Espaciadora**.

---

## ☁️ Cómo desplegar a VERCEL (Paso a Paso)

Puedes desplegar StageLyrics en Vercel gratis en menos de 3 minutos:

### Opción A: Desde GitHub (Recomendada)

1. **Sube tu proyecto a un repositorio de GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: StageLyrics teleprompter v1.0"
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/stagelyrics.git
   git push -u origin main
   ```

2. **Inicia sesión en Vercel:**
   - Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.

3. **Importar el proyecto:**
   - Haz clic en el botón azul **"Add New..." > "Project"**.
   - Selecciona tu repositorio `stagelyrics` y haz clic en **"Import"**.

4. **Configuración del proyecto (Vercel la detecta sola):**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Haz clic en "Deploy":**
   - En 30 segundos tu aplicación estará publicada con certificado HTTPS gratuito en una URL como:
     `https://stagelyrics.vercel.app`

---

### Opción B: Usando Vercel CLI (Desde la terminal)

Si prefieres desplegar directamente desde tu terminal sin abrir la web:

```bash
# 1. Instala el CLI de Vercel si no lo tienes
npm i -g vercel

# 2. Inicia sesión
vercel login

# 3. Despliega a producción
vercel --prod
```

¡Listo! Vercel te dará una URL pública que podrás abrir desde cualquier computador en la sala de ensayo.
