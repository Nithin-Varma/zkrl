"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, TrendingDown, Clock, Users } from "lucide-react";

interface TrustScoreDetailsProps {
  score: number;
  isLoading: boolean;
  penalties: {
    broken: number;
    withdrawn: number;
  };
  bondScores: Array<{
    address: string;
    score: number;
  }>;
}

export function TrustScoreDetails({ 
  score, 
  isLoading, 
  penalties, 
  bondScores 
}: TrustScoreDetailsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Trust Score Details
          </CardTitle>
          <CardDescription>Calculating your trust score...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-sm text-slate-500 mt-2">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreLevel = score >= 50 ? "High" : score >= 20 ? "Medium" : "Low";
  const scoreColor = score >= 50 ? "green" : score >= 20 ? "yellow" : "red";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-500" />
          Trust Score Details
        </CardTitle>
        <CardDescription>
          Calculated using game theory formulas based on your bond activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Score */}
        <div className="text-center">
          <div className="text-4xl font-bold text-slate-900">
            {score.toFixed(2)}
          </div>
          <Badge 
            variant={scoreColor === "green" ? "default" : scoreColor === "yellow" ? "secondary" : "destructive"}
            className="mt-2"
          >
            {scoreLevel} Trust
          </Badge>
        </div>

        {/* Penalties */}
        {(penalties.broken > 0 || penalties.withdrawn > 0) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-700">Penalties Applied</h4>
            <div className="space-y-1">
              {penalties.broken > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2 text-red-500" />
                    <span>Broken Bonds</span>
                  </div>
                  <span className="text-red-600">-{penalties.broken.toFixed(2)}</span>
                </div>
              )}
              {penalties.withdrawn > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2 text-orange-500" />
                    <span>Withdrawn Bonds</span>
                  </div>
                  <span className="text-orange-600">-{penalties.withdrawn.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bond Scores */}
        {bondScores.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-700">Individual Bond Scores</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {bondScores.map((bond, index) => (
                <div key={bond.address} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    <span>Bond {index + 1}</span>
                  </div>
                  <span className="text-blue-600">+{bond.score.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formula Info */}
        <div className="bg-slate-50 rounded-lg p-3">
          <h4 className="text-xs font-medium text-slate-600 mb-2">Calculation Formula</h4>
          <p className="text-xs text-slate-500">
            T_user = (Σ T_bond) × √n - penalties
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Where T_bond = w₁×ln(1+TVL) + w₂×√t + w₃×(T_partner/100×Y/TVL)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
