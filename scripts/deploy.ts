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

async function deployJamBotV3() {
    const JamBotV3 = await ethers.getContractFactory("JamBotV3");
    const jambotV3 = await JamBotV3.deploy(
        process.env.JOSHUA_PUBLIC_WALLET_ADDRESS as string,
        process.env.MAX_PUBLIC_WALLET_ADDRESS as string,
        25
    );
    await jambotV3.deployed();

    console.log(`Deployer: ${await jambotV3.deployer()}`);
    console.log(`JamBot3 deployed to ${jambotV3.address}`);
    console.log(`Owner 1: ${await jambotV3.owner1()}`);
    console.log(`Owner 2: ${await jambotV3.owner2()}`);
}

// deployArbitrage().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });

// deployJamBot().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });

deployJamBotV3().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
