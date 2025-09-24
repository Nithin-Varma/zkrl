import { useWriteContract } from "wagmi";
import { useIdentityRegistry } from "./useIdentityRegistry";
import { submitProofForAggregation, type AggregationResult } from "@/lib/zkverify";

export type AadhaarProof = {
	wallet: `0x${string}`;
	identityHash: `0x${string}`;
	leaf: `0x${string}`;
	aggregationId: Number;
	domainId: Number;
	merklePath: `0x${string}`[];
	leafCount: Number;
	index: Number;
};

export function useVerifyAadhaar() {
	const { address: contractAddress, abi } = useIdentityRegistry();
	const write = useWriteContract();

	async function aggregate(latestProof: any, setStatus?: (s: string) => void): Promise<AggregationResult> {
		return submitProofForAggregation(latestProof, setStatus);
	}

	function buildContractArgs(params: {
		wallet: `0x${string}`;
		identityHash: `0x${string}`;
		aggregation: AggregationResult;
		domainId: Number;
	}): AadhaarProof {
		if (!params.aggregation) {
			throw new Error("aggregation result is missing");
		}
		if (!params.aggregation.aggregationDetails.leaf) {
			throw new Error("leaf is missing from aggregation result");
		}
		return {
			wallet: params.wallet,
			identityHash: params.identityHash,
			leaf: params.aggregation.aggregationDetails.leaf,
			aggregationId: Number(params.aggregation.aggregationId),
			domainId: Number(params.domainId),
			merklePath: params.aggregation.aggregationDetails.merkleProof,
			leafCount: (params.aggregation.aggregationDetails.numberOfLeaves),
			index: (params.aggregation.aggregationDetails.leafIndex),
		};
	}

	async function verify(proof: AadhaarProof) {
		if (!contractAddress) throw new Error("IdentityRegistry address missing");
		console.log("verifying proof", proof);
		return write.writeContractAsync({
			abi,
			address: contractAddress,
			functionName: "verifyAadhar",
			args: [
				proof.wallet,
				proof.identityHash,
				proof.leaf,
				proof.aggregationId as number,
				proof.domainId as number,
				proof.merklePath,
				proof.leafCount as number,
				proof.index as number,
			],
		});
	}

	return { ...write, verify, aggregate, buildContractArgs };
}


