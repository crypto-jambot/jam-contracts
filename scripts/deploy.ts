import { ethers } from "hardhat";

async function main() {
    const Arbitrage = await ethers.getContractFactory("Arbitrage");
    const arbitrage = await Arbitrage.deploy(
        process.env.JOSHUA_PUBLIC_WALLET_ADDRESS as string,
        process.env.MAX_PUBLIC_WALLET_ADDRESS as string,
        25
    );
    await arbitrage.deployed();

    console.log(`Deployer: ${await arbitrage.deployer()}`);
    console.log(`Arbitrage deployed to ${arbitrage.address}`);
    console.log(`Owner 1: ${await arbitrage.owner1()}`);
    console.log(`Owner 2: ${await arbitrage.owner2()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
