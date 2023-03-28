import { ethers } from "hardhat";

async function deployArbitrage() {
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

async function deployJamBot() {
    const JamBot = await ethers.getContractFactory("JamBot");
    const jambot = await JamBot.deploy(
        process.env.JOSHUA_PUBLIC_WALLET_ADDRESS as string,
        process.env.MAX_PUBLIC_WALLET_ADDRESS as string,
        25
    );
    await jambot.deployed();

    console.log(`Deployer: ${await jambot.deployer()}`);
    console.log(`JamBot deployed to ${jambot.address}`);
    console.log(`Owner 1: ${await jambot.owner1()}`);
    console.log(`Owner 2: ${await jambot.owner2()}`);
}

// deployArbitrage().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });

deployJamBot().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
