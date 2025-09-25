// Removed ethers import as we're using native BigInt

// Trust Score Calculation based on Game Theory Formulation
// Based on the formulas from the provided document

export interface BondData {
  address: string;
  totalBondAmount: bigint;
  createdAt: bigint;
  isBroken: boolean;
  isWithdrawn: boolean;
  isActive: boolean;
  user1: string;
  user2: string;
  individualAmount: bigint;
}

export interface UserDetails {
  userAddress: string;
  trustScore: bigint;
  totalBonds: bigint;
  totalAmount: bigint;
  totalWithdrawnBonds: bigint;
  totalBrokenBonds: bigint;
  totalActiveBonds: bigint;
  totalWithdrawnAmount: bigint;
  totalBrokenAmount: bigint;
  createdAt: bigint;
}

export interface TrustScoreWeights {
  w1: number; // TVL weight
  w2: number; // Time weight  
  w3: number; // Partner reputation weight
}

// Default weights (should sum to 1)
export const DEFAULT_WEIGHTS: TrustScoreWeights = {
  w1: 0.3, // 30% for TVL
  w2: 0.2, // 20% for time
  w3: 0.5  // 50% for partner reputation
};

/**
 * Calculate trust score for a single bond
 * Formula: T_bond = w₁ * ln(1 + X + Y) + w₂ * sqrt(t) + w₃ * (T_partner / 100 * Y / (X + Y))
 */
export function calculateBondTrustScore(
  bond: BondData,
  partnerTrustScore: bigint,
  userContractAddress: string,
  weights: TrustScoreWeights = DEFAULT_WEIGHTS
): number {
  const X = Number(bond.individualAmount) / 1e18; // User's stake in ETH
  const Y = Number(bond.totalBondAmount - bond.individualAmount) / 1e18; // Partner's stake in ETH
  const TVL = X + Y; // Total Value Locked
  
  // Time component: bond duration in days
  const currentTime = Math.floor(Date.now() / 1000);
  const bondTime = Number(bond.createdAt);
  const timeInDays = (currentTime - bondTime) / (24 * 60 * 60); // Convert to days
  const t = Math.max(1, timeInDays); // Minimum 1 day
  
  // Partner trust score (0-100 scale)
  const T_partner = Number(partnerTrustScore) / 1e18; // Convert from wei
  
  // Calculate components
  const tvlComponent = weights.w1 * Math.log(1 + TVL);
  const timeComponent = weights.w2 * Math.sqrt(t);
  const partnerComponent = weights.w3 * (T_partner / 100) * (Y / TVL);
  
  return tvlComponent + timeComponent + partnerComponent;
}

/**
 * Calculate aggregate trust score for a user
 * Formula: T_user = (sum_{i=1}^{n} T_bond^i) * sqrt(n)
 */
export function calculateUserTrustScore(
  bonds: BondData[],
  userContractAddress: string,
  partnerTrustScores: Map<string, bigint> = new Map(),
  weights: TrustScoreWeights = DEFAULT_WEIGHTS
): number {
  if (bonds.length === 0) return 0;
  
  let totalBondScore = 0;
  
  for (const bond of bonds) {
    // Determine partner address
    const partnerAddress = bond.user1 === userContractAddress ? bond.user2 : bond.user1;
    const partnerTrustScore = partnerTrustScores.get(partnerAddress) || 0n;
    
    // Calculate bond trust score
    const bondScore = calculateBondTrustScore(bond, partnerTrustScore, userContractAddress, weights);
    totalBondScore += bondScore;
  }
  
  // Apply diversity bonus: multiply by sqrt(n)
  const diversityBonus = Math.sqrt(bonds.length);
  
  return totalBondScore * diversityBonus;
}

/**
 * Calculate penalty for breaking a bond
 * Formula: T_new = T_current - (T_bond + sqrt(TVL_bond * Bonds Broken))
 */
export function calculateBreakingPenalty(
  currentTrustScore: number,
  bond: BondData,
  totalBrokenBonds: number
): number {
  const TVL = Number(bond.totalBondAmount) / 1e18;
  const penalty = Math.sqrt(TVL * totalBrokenBonds);
  
  return currentTrustScore - penalty;
}

/**
 * Calculate penalty for withdrawing a bond
 * Formula: T_new = T_current + T_bond - sqrt(TVL_bond + Bonds Withdrawn)
 */
export function calculateWithdrawPenalty(
  currentTrustScore: number,
  bond: BondData,
  bondTrustScore: number,
  totalWithdrawnBonds: number
): number {
  const TVL = Number(bond.totalBondAmount) / 1e18;
  const penalty = Math.sqrt(TVL + totalWithdrawnBonds);
  
  return currentTrustScore + bondTrustScore - penalty;
}

/**
 * Get partner trust score from user details
 */
export function getPartnerTrustScore(partnerUserDetails: UserDetails): bigint {
  return partnerUserDetails.trustScore;
}

/**
 * Calculate trust score with penalties applied
 */
export function calculateTrustScoreWithPenalties(
  userDetails: UserDetails,
  bonds: BondData[],
  userContractAddress: string,
  partnerTrustScores: Map<string, bigint> = new Map(),
  weights: TrustScoreWeights = DEFAULT_WEIGHTS
): number {
  // Calculate base trust score
  const baseScore = calculateUserTrustScore(bonds, userContractAddress, partnerTrustScores, weights);
  
  // Apply penalties for broken bonds
  const brokenPenalty = userDetails.totalBrokenBonds > 0 
    ? Math.sqrt(Number(userDetails.totalBrokenAmount) / 1e18 * Number(userDetails.totalBrokenBonds))
    : 0;
  
  // Apply penalties for withdrawn bonds  
  const withdrawnPenalty = userDetails.totalWithdrawnBonds > 0
    ? Math.sqrt(Number(userDetails.totalWithdrawnAmount) / 1e18 + Number(userDetails.totalWithdrawnBonds))
    : 0;
  
  return Math.max(0, baseScore - brokenPenalty - withdrawnPenalty);
}
