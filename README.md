# TennisCoach AI

Una aplicación web que analiza videos cortos de golpes de tenis y proporciona feedback técnico personalizado utilizando inteligencia artificial.

## 🎯 Características

- **Análisis de video**: Sube o graba videos cortos (máx. 15s) de tus golpes de tenis
- **Detección de pose**: Análisis biomecánico automático usando MediaPipe/MoveNet
- **Feedback IA**: Consejos técnicos personalizados generados por GPT-4o
- **Chat con Coach**: Conversación interactiva con un entrenador virtual
- **Métricas biomecánicas**: Visualización de ángulos articulares, rotación del torso y más

## 🛠️ Stack Técnico

- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS
- **UI Components**: shadcn/ui + Radix UI
- **Visión por computadora**: MediaPipe Pose / MoveNet (placeholder para implementación futura)
- **IA Conversacional**: OpenAI API (GPT-4o)
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Code Quality**: ESLint + Prettier + Husky

## 📁 Estructura del Proyecto

```
tenniscoach2.0/
├── apps/
│   └── web/                    # Next.js app
│       ├── app/
│       │   ├── api/
│       │   │   ├── analyze/    # Video analysis endpoint
│       │   │   ├── coach/      # AI feedback endpoint
│       │   │   └── chat/       # Chat endpoint
│       │   ├── upload/         # Upload page
│       │   ├── results/        # Results page
│       │   └── chat/           # Chat page
│       ├── components/
│       │   ├── ui/             # shadcn/ui components
│       │   ├── VideoUploader.tsx
│       │   ├── PoseOverlay.tsx
│       │   └── CoachFeedbackCard.tsx
│       ├── lib/
│       │   └── pose/
│       │       ├── angles.ts       # Biomechanical calculations
│       │       └── mockAnalysis.ts # Mock data for testing
│       └── types/
│           └── pose.ts         # TypeScript types & Zod schemas
├── packages/                   # Shared packages (future)
└── vitest.config.ts
```

## 🚀 Getting Started

### Prerequisitos

- Node.js >= 18
- pnpm >= 8
- FFmpeg (requerido para análisis de video)
  - **Windows**: Descargar de [ffmpeg.org](https://ffmpeg.org/download.html) y agregar al PATH
  - **macOS**: `brew install ffmpeg`
  - **Linux**: `sudo apt-get install ffmpeg`

### Instalación

1. Clonar el repositorio:

```bash
git clone <repository-url>
cd tenniscoach2.0
```

2. Instalar dependencias:

```bash
pnpm install
```

3. Configurar variables de entorno:

```bash
cp apps/web/.env.example apps/web/.env
```

Editar `apps/web/.env` y agregar tu API key de OpenAI:

```env
OPENAI_API_KEY=sk-...
```

4. Inicializar Husky:

```bash
pnpm prepare
```

### Desarrollo

Ejecutar el servidor de desarrollo:

```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia el servidor de desarrollo

# Build
pnpm build        # Construye la aplicación para producción
pnpm start        # Inicia el servidor de producción

# Testing
pnpm test         # Ejecuta tests unitarios con Vitest
pnpm test:ui      # Abre la UI de Vitest
pnpm e2e          # Ejecuta tests e2e con Playwright

# Code Quality
pnpm lint         # Ejecuta ESLint
pnpm lint:fix     # Corrige problemas de ESLint automáticamente
pnpm format       # Formatea código con Prettier
pnpm format:check # Verifica formateo sin modificar archivos
```

## 🔄 Flujo de la Aplicación

1. **Upload** (`/upload`): El usuario sube un video de su golpe
2. **Análisis**: El video se procesa frame por frame
   - Detección de pose (landmarks)
   - Cálculo de ángulos biomecánicos
3. **Feedback IA** (`/results`): Se genera feedback técnico personalizado
   - Resumen del análisis
   - Observaciones priorizadas
   - Ejercicios prácticos recomendados
4. **Chat** (`/chat`): Conversación interactiva con el Coach IA

## 🧪 Testing

### Tests Unitarios

Los tests unitarios están escritos con Vitest y cubren la lógica de cálculo biomecánico:

```bash
pnpm test
```

Tests de ejemplo:

- `apps/web/lib/pose/__tests__/angles.test.ts`: Tests de cálculo de ángulos

### Tests E2E

Los tests end-to-end están escritos con Playwright:

```bash
pnpm e2e
```

## 📝 API Endpoints

### POST `/api/analyze`

Analiza un video y retorna datos biomecánicos.

**Request:**

- `video`: File (multipart/form-data)

**Response:**

```typescript
{
  success: boolean;
  data: VideoAnalysis;
  message?: string;
}
```

### POST `/api/coach`

Genera feedback técnico basado en el análisis.

**Request:**

```typescript
{
  analysis: VideoAnalysis;
}
```

**Response:**

```typescript
{
  success: boolean;
  data: CoachFeedback;
}
```

### POST `/api/chat`

Procesa mensajes del chat con el Coach IA.

**Request:**

```typescript
{
  session: ChatSession;
  message: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    message: ChatMessage;
  }
}
```

## 🔮 Implementación Futura

### ✅ Detección de Pose Real (IMPLEMENTADO)

La aplicación ahora incluye detección de pose real usando **MoveNet** de TensorFlow.js:

- ✅ Procesamiento de video con FFmpeg
- ✅ Extracción de frames automática
- ✅ Detección de pose con MoveNet Lightning (modelo rápido)
- ✅ Cálculo de ángulos biomecánicos en tiempo real
- ✅ Análisis completo de video en el endpoint `/api/analyze`

**Archivos implementados:**

- [lib/pose/videoProcessor.ts](apps/web/lib/pose/videoProcessor.ts) - Extracción de frames
- [lib/pose/poseDetector.ts](apps/web/lib/pose/poseDetector.ts) - Detección con MoveNet
- [lib/pose/realAnalysis.ts](apps/web/lib/pose/realAnalysis.ts) - Análisis completo

**Nota:** Requiere FFmpeg instalado en el sistema (ver Prerequisitos)

### Almacenamiento en la Nube

Integrar Supabase o Cloudinary para persistir videos:

```typescript
// lib/storage/supabase.ts
import { createClient } from "@supabase/supabase-js";

export async function uploadVideo(file: File) {
  const supabase = createClient(url, key);
  const { data, error } = await supabase.storage
    .from("videos")
    .upload(`${userId}/${fileName}`, file);
}
```

## 🤝 Contribuir

Este proyecto usa Conventional Commits:

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `docs:` Cambios en documentación

## 📄 Licencia

MIT

## 🙋 Soporte

Para preguntas o issues, por favor abrir un issue en el repositorio.

---

**Nota**: Esta es una versión base funcional lista para iterar. Los datos de pose son mock y requieren implementación de MediaPipe/MoveNet para análisis real.
