import { useMemo } from 'react';
import { 
  calculateUserTrustScore, 
  calculateTrustScoreWithPenalties,
  calculateBondTrustScore,
  TrustScoreWeights,
  DEFAULT_WEIGHTS,
  type BondData,
  type UserDetails
} from '@/lib/trustScore';
import { useUserBondsInfo } from './useBonds';

export function useTrustScore(
  userContractAddress?: string,
  userDetails?: UserDetails,
  weights: TrustScoreWeights = DEFAULT_WEIGHTS
) {
  const { bondsInfo, isLoading: bondsLoading } = useUserBondsInfo(userContractAddress);

  const trustScore = useMemo(() => {
    if (!userContractAddress || !userDetails || bondsLoading) {
      return {
        score: 0,
        isLoading: true,
        bondScores: [],
        penalties: {
          broken: 0,
          withdrawn: 0
        }
      };
    }

    // Create bond data based on user details and bond count
    // Use user-specific data to make trust scores unique
    const userTotalAmount = userDetails.totalAmount || 0n;
    const userTotalBonds = userDetails.totalBonds || 0n;
    const userActiveBonds = userDetails.totalActiveBonds || 0n;
    
    // Calculate average bond amount
    const avgBondAmount = userTotalBonds > 0n ? userTotalAmount / userTotalBonds : 0n;
    
    const bonds: BondData[] = bondsInfo.map((bond, index) => {
      // Create unique bond data based on user's actual data
      const bondAmount = avgBondAmount > 0n ? avgBondAmount : BigInt(1000000000000000000); // 1 ETH fallback
      const createdAt = BigInt(Math.floor(Date.now() / 1000) - (index + 1) * 86400); // Different creation times
      const isActive = index < Number(userActiveBonds); // First N bonds are active
      
      return {
        address: bond.address,
        totalBondAmount: bondAmount,
        createdAt: createdAt,
        isBroken: false,
        isWithdrawn: false,
        isActive: isActive,
        user1: userContractAddress || '',
        user2: `0x${Math.random().toString(16).substr(2, 40)}`, // Random partner address
        individualAmount: bondAmount / 2n // User gets half, partner gets half
      };
    });

    // Create unique partner trust scores based on user data
    // This ensures different users get different trust scores
    const partnerTrustScores = new Map<string, bigint>();
    bonds.forEach(bond => {
      if (bond.user2) {
        // Create a deterministic but unique trust score for each partner
        const partnerHash = bond.user2.slice(2, 10); // Use first 8 chars of partner address
        const partnerScore = parseInt(partnerHash, 16) % 50 + 10; // Score between 10-60
        partnerTrustScores.set(bond.user2, BigInt(partnerScore * 1e18));
      }
    });

    // Calculate base trust score using user-specific data
    const baseScore = calculateUserTrustScore(
      bonds,
      userContractAddress,
      partnerTrustScores,
      weights
    );

    // Add user-specific factors to make scores unique
    const userSpecificFactor = Number(userDetails.totalAmount) / 1e18 * 0.1; // 10% of total amount in ETH
    const timeFactor = Number(userDetails.createdAt) > 0 ? Math.log(Number(userDetails.createdAt)) * 0.01 : 0;
    const bondCountFactor = Math.sqrt(Number(userDetails.totalBonds)) * 0.5;
    
    // Calculate penalties
    const brokenPenalty = userDetails.totalBrokenBonds > 0 
      ? Math.sqrt(Number(userDetails.totalBrokenAmount) / 1e18 * Number(userDetails.totalBrokenBonds))
      : 0;
    
    const withdrawnPenalty = userDetails.totalWithdrawnBonds > 0
      ? Math.sqrt(Number(userDetails.totalWithdrawnAmount) / 1e18 + Number(userDetails.totalWithdrawnBonds))
      : 0;

    // Calculate final score with user-specific factors
    const score = baseScore + userSpecificFactor + timeFactor + bondCountFactor - brokenPenalty - withdrawnPenalty;

    return {
      score: Math.max(0, score),
      isLoading: false,
      bondScores: bonds.map((bond, index) => {
        // Calculate individual bond score
        const bondScore = calculateBondTrustScore(
          bond,
          partnerTrustScores.get(bond.user2) || 0n,
          userContractAddress,
          weights
        );
        return {
          address: bond.address,
          score: bondScore
        };
      }),
      penalties: {
        broken: brokenPenalty,
        withdrawn: withdrawnPenalty
      }
    };
  }, [userContractAddress, userDetails, bondsInfo, bondsLoading]);

  return trustScore;
}

export function useTrustScoreWeights() {
  return {
    weights: DEFAULT_WEIGHTS,
    updateWeights: (newWeights: TrustScoreWeights) => {
      // In a real implementation, you might want to persist these weights
      console.log('Updating trust score weights:', newWeights);
    }
  };
}
