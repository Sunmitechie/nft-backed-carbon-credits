import {
  Clarinet,
  Tx,
  Chain,
  Account,
} from "https://deno.land/x/clarinet@v1.0.1/index.ts";

Clarinet.test({
  name: "Test minting carbon credit NFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet1 = accounts.get("wallet_1")!;

    // Mint a carbon credit NFT
    let block = chain.mineBlock([
      Tx.contractCall(
        "carbon-credits",
        "mint-carbon-credit",
        ["u1", "u500", `'${wallet1.address}`],
        wallet1.address
      ),
    ]);

    block.receipts[0].result
      .expectOk()
      .expectAscii("Carbon credit NFT minted");
  },
});

Clarinet.test({
  name: "Test transferring carbon credit NFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet1 = accounts.get("wallet_1")!;
    let wallet2 = accounts.get("wallet_2")!;

    // Transfer a carbon credit NFT
    let block = chain.mineBlock([
      Tx.contractCall(
        "carbon-credits",
        "transfer-carbon-credit",
        ["u1", `'${wallet2.address}`],
        wallet1.address
      ),
    ]);

    block.receipts[0].result
      .expectOk()
      .expectAscii("Carbon credit NFT transferred");
  },
});

Clarinet.test({
  name: "Test retiring carbon credit NFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet1 = accounts.get("wallet_1")!;

    // Retire a carbon credit NFT
    let block = chain.mineBlock([
      Tx.contractCall(
        "carbon-credits",
        "retire-carbon-credit",
        ["u1"],
        wallet1.address
      ),
    ]);

    block.receipts[0].result
      .expectOk()
      .expectAscii("Carbon credit NFT retired");
  },
});

Clarinet.test({
  name: "Test unauthorized minting of carbon credit NFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet2 = accounts.get("wallet_2")!;

    // Attempt to mint NFT with unauthorized issuer
    let block = chain.mineBlock([
      Tx.contractCall(
        "carbon-credits",
        "mint-carbon-credit",
        ["u2", "u100", `'${wallet2.address}`],
        wallet2.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(100); // Error u100
  },
});

Clarinet.test({
  name: "Test retiring an already retired NFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet1 = accounts.get("wallet_1")!;

    // Attempt to retire an NFT that is already retired
    let block = chain.mineBlock([
      Tx.contractCall(
        "carbon-credits",
        "retire-carbon-credit",
        ["u1"],
        wallet1.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(103); // Error u103
  },
});

Clarinet.test({
  name: "Test retiring NFT with unauthorized user",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet2 = accounts.get("wallet_2")!;

    // Attempt to retire an NFT by someone other than the issuer
    let block = chain.mineBlock([
      Tx.contractCall(
        "carbon-credits",
        "retire-carbon-credit",
        ["u1"],
        wallet2.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(102); // Error u102
  },
});
