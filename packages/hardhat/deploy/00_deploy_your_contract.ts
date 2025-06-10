import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployGroupChat: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("GroupChat", {
    from: deployer,
    args: [deployer], // Передача аргументов в конструктор
    log: true,
    autoMine: true,
  });

  const groupChat = await hre.ethers.getContract<Contract>("GroupChat", deployer);
  console.log("👋 Адрес GroupChat:", groupChat.address);
};

export default deployGroupChat;

deployGroupChat.tags = ["GroupChat"];
