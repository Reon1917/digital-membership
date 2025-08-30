'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  isActive: boolean;
}

interface Membership {
  id: string;
  points: number;
}

export default function RewardsPage() {
  const { data: session, isPending } = useSession();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session) {
      fetchData();
    }
  }, [session, isPending, router]);

  const fetchData = async () => {
    try {
      const [rewardsResponse, membershipResponse] = await Promise.all([
        fetch("/api/rewards"),
        fetch("/api/membership"),
      ]);

      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        setRewards(rewardsData.rewards || []);
      }

      if (membershipResponse.ok) {
        const membershipData = await membershipResponse.json();
        setMembership(membershipData.membership);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (!membership || membership.points < reward.pointsCost) {
      alert("Insufficient points!");
      return;
    }

    setRedeeming(reward.id);
    try {
      const response = await fetch("/api/points/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          membershipId: membership.id,
          points: reward.pointsCost,
          description: `Redeemed: ${reward.name}`,
          referenceId: `reward-${reward.id}-${Date.now()}`,
        }),
      });

      if (response.ok) {
        alert(`Successfully redeemed: ${reward.name}!`);
        fetchData(); // Refresh data
      } else {
        alert("Failed to redeem reward");
      }
    } catch (error) {
      console.error("Redemption error:", error);
      alert("Failed to redeem reward");
    } finally {
      setRedeeming(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "beverages":
        return "☕";
      case "food":
        return "🍽️";
      case "discount":
        return "💰";
      default:
        return "🎁";
    }
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rewards</h1>
            <p className="text-gray-600">Redeem your points for amazing rewards</p>
          </div>
          <div className="flex gap-4">
            {membership && (
              <div className="bg-orange-100 px-4 py-2 rounded-lg">
                <div className="text-sm text-orange-800">Your Points</div>
                <div className="text-xl font-bold text-orange-900">
                  {membership.points.toLocaleString()}
                </div>
              </div>
            )}
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.length > 0 ? (
            rewards.map((reward) => {
              const canAfford = membership && membership.points >= reward.pointsCost;
              const isRedeeming = redeeming === reward.id;

              return (
                <div key={reward.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{getCategoryIcon(reward.category)}</div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          {reward.pointsCost}
                        </div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {reward.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {reward.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {reward.category}
                      </span>
                      
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford || isRedeeming}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          canAfford && !isRedeeming
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {isRedeeming 
                          ? "Redeeming..." 
                          : canAfford 
                          ? "Redeem" 
                          : "Need More Points"
                        }
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-8">
              <div className="text-gray-500 mb-4">No rewards available</div>
              <button
                onClick={async () => {
                  try {
                    await fetch("/api/rewards/seed", { method: "POST" });
                    fetchData();
                  } catch (error) {
                    console.error("Seed error:", error);
                  }
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Seed Rewards
              </button>
            </div>
          )}
        </div>

        {/* Points Balance Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Earn Points</h2>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">🍽️</div>
              <div className="font-semibold">Dine with Us</div>
              <div className="text-sm text-gray-600">1 point per 100 THB spent</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">🎉</div>
              <div className="font-semibold">Special Events</div>
              <div className="text-sm text-gray-600">Bonus points on special occasions</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">📱</div>
              <div className="font-semibold">Social Sharing</div>
              <div className="text-sm text-gray-600">Share your experience for extra points</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}