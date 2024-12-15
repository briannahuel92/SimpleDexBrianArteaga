import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre from "hardhat";
  
  describe("TokenA", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployDefaultFixture() {

      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await hre.ethers.getSigners();
  
      const TokenA = await hre.ethers.getContractFactory("TokenA");
      const tokenA = await TokenA.deploy(owner);

      return {tokenA,owner, otherAccount };
    }

        describe("Deployment", function () {
      it("Owner balance with 100000000000000000000000 Token A", async function () {
        const { tokenA, owner, otherAccount } = await loadFixture(deployDefaultFixture);
        expect((await tokenA.balanceOf(owner))).to.equal(100000000000000000000000n);
      });


    });
  });
  