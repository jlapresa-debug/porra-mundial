# La Porra · Mundial 2026

PWA mobile-first para organizar una porra del Mundial 2026 con tus amigos.
Inspirada en [laporrita.es](https://laporrita.es/) con un diseño moderno tipo app nativa.

## Funcionalidades

- 🔐 Login / registro con email o Google (Firebase Auth)
- ⚽ Pronósticos de los 104 partidos del Mundial 2026 (resultado exacto)
- ⭐ Apuestas especiales: campeón, finalista, máximo goleador, mejor jugador, sorpresa
- 👥 Grupos privados con código de invitación
- 🏆 Ranking en tiempo real por grupo
- 💬 Chat en tiempo real dentro de cada grupo (Firebase Realtime Database)
- 📱 Instalable como app (PWA con manifest e iconos)
- 🌙 Diseño oscuro moderno con Tailwind

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** con tema personalizado
- **Firebase** (Auth + Firestore + Realtime Database)
- **PWA** (manifest, theme-color, safe areas iOS)

## Setup en 5 minutos

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear proyecto Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto.
2. Añade una **Web App** y copia la config.
3. Activa:
   - **Authentication** → métodos **Email/Password** y **Google**
   - **Firestore Database** (modo producción)
   - **Realtime Database** (opcional, solo para chat)

### 3. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus valores de Firebase. Para `NEXT_PUBLIC_FIREBASE_DATABASE_URL` usa la URL que aparece en *Realtime Database* (algo como `https://tu-proyecto-default-rtdb.europe-west1.firebasedatabase.app`).

### 4. Desplegar reglas de seguridad

```bash
npm i -g firebase-tools
firebase login
firebase use --add  # selecciona tu proyecto
firebase deploy --only firestore:rules,database
```

(las reglas están en `firestore.rules` y `database.rules.json`)

### 5. Arrancar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). En móvil, conéctate por la IP local de tu equipo (`ifconfig`) para probarlo desde el teléfono.

## Desplegar en producción

### Vercel (recomendado)

```bash
npm i -g vercel
vercel
```

Añade las mismas variables de entorno en *Settings → Environment Variables*.

### Instalar como app en el móvil

- **iOS**: abrir en Safari → compartir → "Añadir a pantalla de inicio".
- **Android**: Chrome mostrará un banner para instalar; o menú → "Instalar app".

## Estructura

```
src/
├── app/                    # Rutas Next.js (App Router)
│   ├── matches/            # Lista y detalle de partidos
│   ├── specials/           # Apuestas especiales
│   ├── groups/             # Crear, unirse y ver grupos privados
│   ├── profile/            # Perfil del usuario
│   ├── login, register/    # Auth
│   └── layout.tsx          # Layout raíz con AuthProvider
├── components/
│   ├── ui/                 # Button, Input, Card primitivos
│   ├── AppShell.tsx        # AuthGate + BottomNav
│   ├── MatchCard.tsx
│   ├── PredictionInput.tsx
│   ├── RankingTable.tsx
│   ├── GroupChat.tsx
│   └── TeamPicker.tsx
├── hooks/
│   ├── useAuth.tsx
│   ├── usePredictions.ts
│   ├── useGroups.ts
│   └── useGroupRanking.ts
└── lib/
    ├── firebase.ts         # Inicialización SDK
    ├── teams.ts            # Las 48 selecciones del Mundial 2026
    ├── matches.ts          # Calendario (mock, sustituir con oficial)
    ├── scoring.ts          # Reglas de puntuación
    └── types.ts
```

## Cómo se calculan los puntos

| Acierto | Puntos |
|---------|--------|
| Resultado exacto | 5 |
| Signo y diferencia de goles | 3 |
| Solo signo (ganador/empate) | 2 |
| Goles de un solo equipo | 1 |
| Campeón | 25 |
| Finalista | 12 |
| Máximo goleador | 15 |
| Mejor jugador | 10 |
| Selección sorpresa | 8 |

Editable en `src/lib/scoring.ts` (constante `DEFAULT_RULES`).

## Próximos pasos sugeridos

- [ ] Cargar el calendario oficial cuando salga del sorteo (FIFA hace draw a finales de 2025)
- [ ] Endpoint admin para introducir resultados reales y recalcular puntos
- [ ] Notificaciones push antes de cada partido (Firebase Cloud Messaging)
- [ ] Compartir invitación con `navigator.share()`
- [ ] Modo claro

## Licencia

MIT
