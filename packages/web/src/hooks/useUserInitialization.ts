import { useAccount } from "wagmi";
import { useHasUserContract, useCreateUser, useGetUserContract } from "./useUserFactory";
import { useUserDetails } from "./useUser";
import { useEffect, useState } from "react";

export function useUserInitialization() {
  const { address } = useAccount();
  const [userContractAddress, setUserContractAddress] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Check if user has a contract
  const { data: hasUserContract, isLoading: checkingUser } = useHasUserContract(address);
  
  // Get user contract address if exists
  const { data: contractAddress } = useGetUserContract(address);
  
  // Create user contract
  const { createUser, isPending: isCreating, isConfirmed: isCreated } = useCreateUser();
  
  // Get user details once contract is available
  const { data: userDetails, isLoading: loadingDetails } = useUserDetails(userContractAddress || undefined);

  useEffect(() => {
    if (contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000") {
      setUserContractAddress(contractAddress as `0x${string}`);
      setIsInitialized(true);
    }
  }, [contractAddress]);

  useEffect(() => {
    if (isCreated) {
      // Refetch user contract address after creation
      window.location.reload(); // Simple refresh to get new contract address
    }
  }, [isCreated]);

  const initializeUser = async () => {
    if (!address) return;
    
    setIsInitializing(true);
    try {
      await createUser(address);
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const shouldCreateUser = hasUserContract === false && !isCreating && !isInitialized;

  return {
    userContractAddress,
    userDetails,
    isInitialized,
    isInitializing: isInitializing || isCreating,
    shouldCreateUser,
    initializeUser,
    isLoading: checkingUser || loadingDetails,
  };
}
