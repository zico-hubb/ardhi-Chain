import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "constants/contract";

export async function signAmount(amount: string, signer: ethers.Signer): Promise<string> {
    const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
            ["address", "uint"],
            [CONTRACT_ADDRESS, ethers.parseEther(amount)]
        )
    );
    const signedMessage = await signer.signMessage(ethers.getBytes(messageHash));
    return signedMessage;
}