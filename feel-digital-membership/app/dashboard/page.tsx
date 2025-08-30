'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import MembershipCard from "@/components/MembershipCard";

interface Membership {
  id: string;
  cardNumber: string;
  points: number;
  tier: string;
  status: string;
  phoneNumber?: string;
}

interface Transaction {
  id: string;
  type: "earn" | "redeem" | "adjust";
  points: number;
  description: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session) {
      fetchMembership();
      fetchTransactions();
    }
  }, [session, isPending, router]);

  const fetchMembership = async () => {
    try {
      const response = await fetch("/api/membership");
      if (response.ok) {
        const data = await response.json();
        setMembership(data.membership);
      }
    } catch (error) {
      console.error("Failed to fetch membership:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions");
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user.name}!</h1>
            <p className="text-gray-600">Manage your Feel Restaurant membership</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/rewards")}
              className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              View Rewards
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Admin Panel
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Membership Card */}
        <div className="mb-8">
          {membership ? (
            <MembershipCard 
              membership={membership} 
              user={session.user} 
            />
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-gray-500 mb-4">No membership found</div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Refresh
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {membership && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-2xl font-bold text-orange-600">{membership.points.toLocaleString()}</div>
              <div className="text-gray-600">Total Points</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-2xl font-bold text-purple-600 capitalize">{membership.tier}</div>
              <div className="text-gray-600">Membership Tier</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-2xl font-bold text-green-600">{transactions.length}</div>
              <div className="text-gray-600">Transactions</div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{transaction.description}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === "earn" 
                      ? "text-green-600" 
                      : transaction.type === "redeem" 
                      ? "text-red-600" 
                      : "text-blue-600"
                  }`}>
                    {transaction.type === "earn" ? "+" : "-"}{transaction.points} pts
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No transactions yet. Start earning points by making purchases!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}