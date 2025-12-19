"use client";
import { useBondDetails } from "@/hooks/useBond";
import { useAccount } from "wagmi";

interface BondAmountDisplayProps {
  bondAddress: string;
  fallbackAmount?: string;
}

export function BondAmountDisplay({ bondAddress, fallbackAmount = "Loading..." }: BondAmountDisplayProps) {
  const { address } = useAccount();
  const { data: bondDetails, isLoading } = useBondDetails(bondAddress);

  if (isLoading) {
    return <span className="text-xs text-slate-500">Loading...</span>;
  }

  if (!bondDetails) {
    return <span className="text-xs text-slate-500">{fallbackAmount}</span>;
  }

  // Extract the total bond amount from the bond details
  console.log("🔍 BondAmountDisplay - bondDetails:", bondDetails);
  console.log("🔍 BondAmountDisplay - bondDetails type:", typeof bondDetails);
  console.log("🔍 BondAmountDisplay - bondDetails is array:", Array.isArray(bondDetails));
  
  let totalBondAmount;
  
  // Handle both array and object formats
  if (Array.isArray(bondDetails)) {
    // If it's an array, totalBondAmount is at index 3
    totalBondAmount = bondDetails[3];
    console.log("🔍 BondAmountDisplay - Array format, totalBondAmount at index 3:", totalBondAmount);
  } else {
    // If it's an object, access the property directly
    const bond = bondDetails as any;
    totalBondAmount = bond.totalBondAmount;
    console.log("🔍 BondAmountDisplay - Object format, totalBondAmount:", totalBondAmount);
  }
  
  console.log("🔍 BondAmountDisplay - totalBondAmount:", totalBondAmount);
  console.log("🔍 BondAmountDisplay - typeof totalBondAmount:", typeof totalBondAmount);
  
  // Check if totalBondAmount is valid
  if (totalBondAmount === undefined || totalBondAmount === null) {
    console.log("🔍 BondAmountDisplay - totalBondAmount is undefined/null");
    return <span className="text-xs text-slate-500">Amount unavailable</span>;
  }
  
  // Convert to number and check if it's valid
  const amountInEth = Number(totalBondAmount) / 1e18;
  console.log("🔍 BondAmountDisplay - amountInEth:", amountInEth);
  
  if (isNaN(amountInEth)) {
    console.log("🔍 BondAmountDisplay - amountInEth is NaN");
    return <span className="text-xs text-slate-500">Invalid amount</span>;
  }

  return (
    <span className="text-xs text-slate-500">
      {amountInEth.toFixed(6)} ETH
    </span>
  );
}
