import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre from "hardhat";
  
  describe("TokenB", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployDefaultFixture() {

      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await hre.ethers.getSigners();
  
      const TokenB = await hre.ethers.getContractFactory("TokenB");
      const tokenB = await TokenB.deploy(owner);

      return {tokenB,owner, otherAccount };
    }

        describe("Deployment", function () {
      it("Owner balance with 100000000000000000000000 Token B", async function () {
        const { tokenB, owner, otherAccount } = await loadFixture(deployDefaultFixture);
        expect((await tokenB.balanceOf(owner))).to.equal(100000000000000000000000n);
      });


    });
  });
  