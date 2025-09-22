export type AggregationResult = {
	txHash: string;
	aggregationDetails: {
		merkleProof: `0x${string}`[];
		numberOfLeaves: number;
		leafIndex: number;
	};
	aggregationId: number;
};

const API_URL = 'https://relayer-api.horizenlabs.io/api/v1';

export async function submitProofForAggregation(latestProof: any, setStatus?: (s: string) => void): Promise<AggregationResult> {
	if (!latestProof?.proof) throw new Error('Missing proof');
	const apiKey = process.env.NEXT_PUBLIC_ZKV_API_KEY;
	if (!apiKey) throw new Error('Missing NEXT_PUBLIC_ZKV_API_KEY');

	const params = {
		proofType: 'groth16',
		vkRegistered: true,
		chainId: 845320009,
		proofOptions: {
			library: 'snarkjs',
			curve: 'bn128',
		},
		proofData: {
			proof: latestProof.proof.groth16Proof,
			publicSignals: [
				latestProof.proof.pubkeyHash,
				latestProof.proof.nullifier,
				latestProof.proof.timestamp,
				latestProof.proof.ageAbove18,
				latestProof.proof.gender,
				latestProof.proof.pincode,
				latestProof.proof.state,
				latestProof.proof.nullifierSeed,
				latestProof.proof.signalHash,
			],
			vk: '0x0b692be7b498a34664f07464866c2948b3ba925657185e5f2323be452bfd6722',
		},
	} as const;

	setStatus?.('Submitting proof to relayer...');
	const submitResp = await fetch(`${API_URL}/submit-proof/${apiKey}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(params),
	});
	if (!submitResp.ok) throw new Error(`Submit failed: ${submitResp.status}`);
	const submitJson = await submitResp.json();

	setStatus?.('Proof submitted, waiting for aggregation...');
	while (true) {
		const statusResp = await fetch(`${API_URL}/job-status/${apiKey}/${submitJson.jobId}`);
		if (!statusResp.ok) throw new Error(`Status failed: ${statusResp.status}`);
		const statusJson = await statusResp.json();
		const currentStatus = statusJson.status as string;
		setStatus?.(`Job status: ${currentStatus}`);
		if (currentStatus === 'Aggregated') {
			const txHash = `https://zkverify-testnet.subscan.io/extrinsic/${statusJson.txHash}`;
			return {
				txHash,
				aggregationDetails: statusJson.aggregationDetails,
				aggregationId: statusJson.aggregationId,
			};
		}
		await new Promise((r) => setTimeout(r, 5000));
	}
}
