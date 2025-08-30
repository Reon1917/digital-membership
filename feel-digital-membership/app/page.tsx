'use client';

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Feel Restaurant
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Digital Membership Card System - Chiang Mai
          </p>
          <div className="text-6xl mb-8">🍽️</div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Join Our Membership
              </h2>
              <p className="text-gray-600 mb-6">
                Earn points with every visit, unlock exclusive rewards, and enjoy special perks as a Feel Restaurant member.
              </p>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Earn 1 point per 100 THB spent
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Redeem points for free food & drinks
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Digital membership card with QR code
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Tier-based benefits (Bronze, Silver, Gold, Platinum)
                </li>
              </ul>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-8 rounded-xl mb-6">
                <div className="text-4xl mb-2">💳</div>
                <div className="text-xl font-bold">Digital Card</div>
                <div className="text-sm opacity-90">Scan to earn & redeem</div>
              </div>
              <div className="space-y-4">
                <Link
                  href="/register"
                  className="block w-full py-3 px-6 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="block w-full py-3 px-6 border-2 border-orange-600 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-3">☕</div>
            <h3 className="font-bold text-gray-900 mb-2">Free Coffee</h3>
            <p className="text-gray-600 text-sm">Start earning from 100 points</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-3">🍽️</div>
            <h3 className="font-bold text-gray-900 mb-2">Free Meals</h3>
            <p className="text-gray-600 text-sm">Redeem points for main courses</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-bold text-gray-900 mb-2">Discounts</h3>
            <p className="text-gray-600 text-sm">Up to 20% off your total bill</p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Located in the heart of Chiang Mai • Authentic Thai cuisine with modern flair
          </p>
        </div>
      </div>
    </div>
  );
}
