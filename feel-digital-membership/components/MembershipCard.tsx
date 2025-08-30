'use client';

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface MembershipCardProps {
  membership: {
    id: string;
    cardNumber: string;
    points: number;
    tier: string;
    status: string;
  };
  user: {
    name: string;
    email: string;
  };
}

export default function MembershipCard({ membership, user }: MembershipCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    generateQRCode();
  }, [membership.id]);

  const generateQRCode = async () => {
    try {
      const qrData = JSON.stringify({
        memberId: membership.id,
        cardNumber: membership.cardNumber,
        type: "feel-membership",
      });
      const url = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error("QR Code generation error:", error);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "bg-gradient-to-r from-orange-400 to-orange-600";
      case "silver":
        return "bg-gradient-to-r from-gray-400 to-gray-600";
      case "gold":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case "platinum":
        return "bg-gradient-to-r from-purple-400 to-purple-600";
      default:
        return "bg-gradient-to-r from-orange-400 to-orange-600";
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "🥉";
      case "silver":
        return "🥈";
      case "gold":
        return "🥇";
      case "platinum":
        return "💎";
      default:
        return "🥉";
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Card Front */}
      <div className={`relative p-6 rounded-xl text-white shadow-2xl ${getTierColor(membership.tier)} mb-4`}>
        <div className="absolute top-4 right-4">
          <span className="text-2xl">{getTierBadge(membership.tier)}</span>
        </div>
        
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Feel Restaurant</h2>
          <p className="text-sm opacity-90">Membership Card</p>
        </div>
        
        <div className="mb-6">
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="text-sm opacity-90 capitalize">{membership.tier} Member</p>
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs opacity-75">Card Number</p>
            <p className="text-lg font-mono">{membership.cardNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-75">Points</p>
            <p className="text-2xl font-bold">{membership.points.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="absolute bottom-2 right-2 opacity-20">
          <div className="w-8 h-8 bg-white rounded-full"></div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Scan to Use</h3>
          {qrCodeUrl ? (
            <div className="flex justify-center">
              <img 
                src={qrCodeUrl} 
                alt="Membership QR Code" 
                className="rounded-lg"
              />
            </div>
          ) : (
            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">Generating QR...</div>
            </div>
          )}
          <p className="text-sm text-gray-600 mt-4">
            Show this QR code when making purchases to earn and redeem points
          </p>
        </div>
      </div>
    </div>
  );
}