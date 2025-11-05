"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowLeft, Clock, Percent, Zap } from "lucide-react"
import Link from "next/link"

const membershipFeatures = [
  {
    icon: Clock,
    title: "Reservas anticipadas",
    description: "Acceso prioritario a reservas",
  },
  {
    icon: Percent,
    title: "Descuentos exclusivos",
    description: "Ahorra en cada pedido",
  },
  {
    icon: Zap,
    title: "Entrega prioritaria",
    description: "Recibe tu pedido más rápido",
  },
]

const plans = [
  {
    name: "Plan Básico",
    duration: "6 días",
    price: "$15.000",
    description: "Perfecto para probar nuestros beneficios",
    popular: false,
  },
  {
    name: "Plan Estándar",
    duration: "15 días",
    price: "$25.000",
    description: "La opción más equilibrada",
    popular: true,
  },
  {
    name: "Plan Premium",
    duration: "30 días",
    price: "$35.000",
    description: "Máximo ahorro y beneficios",
    popular: false,
  },
]

export function MembershipPlans() {
  const handlePurchase = (planName: string) => {
    // Redirigir al formulario de compra con el plan seleccionado
    window.location.href = `/checkout?plan=${encodeURIComponent(planName)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 text-balance">Elige tu Membresía</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto text-pretty">
            Accede a beneficios exclusivos y disfruta de una experiencia premium
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {membershipFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all ${
                plan.popular ? "border-purple-500 border-2 scale-105" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold px-4 py-1 rounded-full shadow-lg">
                    Más Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">COP / {plan.duration}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-700">Reservas anticipadas con prioridad</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-700">Descuentos exclusivos en todos los pedidos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-700">Modo de priorización de entrega</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-700">Recibe tu pedido lo más rápido posible</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-700">Válido por {plan.duration}</span>
                  </li>
                </ul>
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  onClick={() => handlePurchase(plan.name)}
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                  size="lg"
                >
                  Adquirir Membresía
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <Link href="/">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 bg-white/80 backdrop-blur-sm border-gray-300 text-gray-900 hover:bg-white shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
