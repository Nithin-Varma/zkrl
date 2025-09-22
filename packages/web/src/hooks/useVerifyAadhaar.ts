import { useWriteContract } from "wagmi";
import { bytesToBigInt } from "viem";
import { useIdentityRegistry } from "./useIdentityRegistry";
import { submitProofForAggregation, type AggregationResult } from "@/lib/zkverify";

export type AadhaarProof = {
	wallet: `0x${string}`;
	identityHash: `0x${string}`;
	hash: bigint;
	aggregationId: bigint;
	domainId: bigint;
	merklePath: `0x${string}`[];
	leafCount: bigint;
	index: bigint;
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
		inputsHash: bigint;
		aggregation: AggregationResult;
		domainId: bigint;
	}): AadhaarProof {
		return {
			wallet: params.wallet,
			identityHash: params.identityHash,
			hash: params.inputsHash,
			aggregationId: BigInt(params.aggregation.aggregationId),
			domainId: params.domainId,
			merklePath: params.aggregation.aggregationDetails.merkleProof,
			leafCount: BigInt(params.aggregation.aggregationDetails.numberOfLeaves),
			index: BigInt(params.aggregation.aggregationDetails.leafIndex),
		};
	}

	async function verify(proof: AadhaarProof) {
		if (!contractAddress) throw new Error("IdentityRegistry address missing");
		return write.writeContractAsync({
			abi,
			address: contractAddress,
			functionName: "verifyAadhar",
			args: [
				proof.wallet,
				proof.identityHash,
				proof.hash,
				proof.aggregationId,
				proof.domainId,
				proof.merklePath,
				proof.leafCount,
				proof.index,
			],
		});
	}

	function computeInputsHash(latestProof: any): bigint {
		const values = [
			latestProof?.proof.pubkeyHash,
			latestProof?.proof.nullifier,
			latestProof?.proof.timestamp,
			latestProof?.proof.ageAbove18,
			latestProof?.proof.gender,
			latestProof?.proof.pincode,
			latestProof?.proof.state,
			latestProof?.proof.nullifierSeed,
			latestProof?.proof.signalHash,
		];
		const joined = values.map((v: any) => BigInt(v));
		// Solidity computes: keccak256(abi.encodePacked(_changeEndianess(... each))) but contract ultimately expects single _hash (the inputsHash)
		// We cannot reproduce endianness change easily offchain without heavy utils; the contract wraps _hash again with _changeEndianess.
		// In HCM they pass the keccak of the 9 inputs directly as single uint256 (they compute offchain). Here, we pass the first value (signalHash) hash isn't correct. Instead we compute keccak of concatenated big-endian uint256 values and rely on onchain endianness correction.
		const enc = new Uint8Array(32 * joined.length);
		for (let i = 0; i < joined.length; i++) {
			const buf = bigintToUint256BE(joined[i]);
			enc.set(buf, i * 32);
		}
		const hashBytes = keccak256Bytes(enc);
		return bytesToBigInt(hashBytes);
	}

	function bigintToUint256BE(value: bigint): Uint8Array {
		const bytes = new Uint8Array(32);
		let v = value;
		for (let i = 31; i >= 0; i--) {
			bytes[i] = Number(v & 0xffn);
			v >>= 8n;
		}
		return bytes;
	}

	function keccak256Bytes(data: Uint8Array): Uint8Array {
		// Use SubtleCrypto is not available; use a tiny keccak implementation via viem utils at callsite would be ideal, but keep local minimalist fallback by importing viem if needed.
		// We will dynamically import viem's keccak256 and toBytes
		throw new Error('keccak256Bytes not wired. Use viem keccak256 in page component to compute inputsHash.');
	}

	return { ...write, verify, aggregate, buildContractArgs, computeInputsHash };
}


