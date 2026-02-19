const fs = require("fs");
const path = require("path");

function findArtifact() {
  const contractsDir = path.join(__dirname, "..", "artifacts", "contracts");
  // Source file on disk is NuvyraHubMarketplace.sol; contract name is NuvyraHubMarketplace.
  const candidates = [
    path.join(contractsDir, "NuvyraHubMarketplace.sol", "NuvyraHubMarketplace.json"),
    path.join(contractsDir, "NuvyraHubMarketplace.sol", "NuvyraHubMarketplace.json"),
    path.join(contractsDir, "NuvyraHubMarketplace.sol", "NuvyraHubMarketplace.json"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  if (!fs.existsSync(contractsDir)) return null;

  for (const entry of fs.readdirSync(contractsDir)) {
    const dir = path.join(contractsDir, entry);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".json") || file.endsWith(".dbg.json")) continue;
      const artifactPath = path.join(dir, file);
      try {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        if (artifact.contractName === "NuvyraHubMarketplace") return artifactPath;
      } catch {
        // skip unreadable artifacts
      }
    }
  }

  return null;
}

async function main() {
  const artifactPath = findArtifact();

  if (!artifactPath) {
    throw new Error("Compile contracts first: npm run compile");
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const sharedDir = path.join(__dirname, "..", "..", "shared");
  fs.mkdirSync(sharedDir, { recursive: true });

  const abiOut = {
    contractName: "NuvyraHubMarketplace",
    abi: artifact.abi,
  };

  fs.writeFileSync(
    path.join(sharedDir, "NuvyraHubMarketplace.abi.json"),
    JSON.stringify(abiOut, null, 2),
  );

  const targets = [
    path.join(__dirname, "..", "..", "project", "backend", "src", "abi"),
    path.join(__dirname, "..", "..", "project", "src", "abi"),
    path.join(__dirname, "..", "..", "mypackage", "src", "abi"),
  ];

  for (const dir of targets) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "NuvyraHubMarketplace.json"),
      JSON.stringify(abiOut, null, 2),
    );
  }

  console.log("Exported ABI from", path.relative(path.join(__dirname, ".."), artifactPath));
  console.log("Exported ABI to shared/, project/backend/src/abi, project/src/abi, mypackage/src/abi");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
