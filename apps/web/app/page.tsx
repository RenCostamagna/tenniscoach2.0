import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, Video, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">TennisCoach AI</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analiza tus golpes de tenis con inteligencia artificial. Obtén feedback biomecánico
            instantáneo y consejos personalizados de tu entrenador virtual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          <div className="flex flex-col items-center space-y-3 p-6 bg-white rounded-lg shadow-sm border">
            <Video className="w-12 h-12 text-green-600" />
            <h3 className="font-semibold text-lg">Sube tu video</h3>
            <p className="text-sm text-gray-600 text-center">
              Graba o sube un video de tu golpe (máx. 15s)
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 p-6 bg-white rounded-lg shadow-sm border">
            <Activity className="w-12 h-12 text-green-600" />
            <h3 className="font-semibold text-lg">Análisis biomecánico</h3>
            <p className="text-sm text-gray-600 text-center">
              Detección de pose y cálculo de ángulos articulares
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 p-6 bg-white rounded-lg shadow-sm border">
            <MessageSquare className="w-12 h-12 text-green-600" />
            <h3 className="font-semibold text-lg">Feedback IA</h3>
            <p className="text-sm text-gray-600 text-center">
              Recibe consejos personalizados y ejercicios prácticos
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Link href="/upload">
            <Button size="lg" className="text-lg px-8 py-6">
              Comenzar análisis
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
