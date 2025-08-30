'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

interface Member {
  id: string;
  user: {
    name: string;
    email: string;
  };
  cardNumber: string;
  points: number;
  tier: string;
  status: string;
  phoneNumber?: string;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [pointsToAward, setPointsToAward] = useState("");
  const [description, setDescription] = useState("");
  const [awarding, setAwarding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session) {
      fetchMembers();
    }
  }, [session, isPending, router]);

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/admin/members");
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAwardPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !pointsToAward || !description) return;

    setAwarding(true);
    try {
      const response = await fetch("/api/points/award", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          membershipId: selectedMember.id,
          points: parseInt(pointsToAward),
          description,
          referenceId: `admin-award-${Date.now()}`,
        }),
      });

      if (response.ok) {
        setPointsToAward("");
        setDescription("");
        setSelectedMember(null);
        fetchMembers(); // Refresh the members list
        alert("Points awarded successfully!");
      } else {
        alert("Failed to award points");
      }
    } catch (error) {
      console.error("Award points error:", error);
      alert("Failed to award points");
    } finally {
      setAwarding(false);
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage Feel Restaurant memberships</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Members List */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Members</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {members.length > 0 ? (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedMember?.id === member.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-900">{member.user.name}</div>
                          <div className="text-sm text-gray-600">{member.user.email}</div>
                          <div className="text-sm text-gray-500">Card: {member.cardNumber}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-orange-600">{member.points} pts</div>
                          <div className="text-sm text-gray-500 capitalize">{member.tier}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">No members found</div>
                )}
              </div>
            </div>
          </div>

          {/* Point Management */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Award Points</h2>
            </div>
            <div className="p-6">
              {selectedMember ? (
                <form onSubmit={handleAwardPoints} className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold">{selectedMember.user.name}</div>
                    <div className="text-sm text-gray-600">{selectedMember.user.email}</div>
                    <div className="text-sm font-medium text-orange-600">
                      Current Points: {selectedMember.points}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                      Points to Award
                    </label>
                    <input
                      id="points"
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      value={pointsToAward}
                      onChange={(e) => setPointsToAward(e.target.value)}
                      placeholder="Enter points amount"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      id="description"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Purchase reward, Bonus points"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={awarding}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {awarding ? "Awarding..." : "Award Points"}
                  </button>
                </form>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Select a member to award points
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-blue-600">{members.length}</div>
            <div className="text-gray-600">Total Members</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-green-600">
              {members.filter(m => m.status === "active").length}
            </div>
            <div className="text-gray-600">Active Members</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-orange-600">
              {members.reduce((sum, m) => sum + m.points, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Total Points</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-purple-600">
              {members.filter(m => m.tier === "gold" || m.tier === "platinum").length}
            </div>
            <div className="text-gray-600">Premium Members</div>
          </div>
        </div>
      </div>
    </div>
  );
}