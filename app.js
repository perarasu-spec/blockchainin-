// ================================
// AGRICHAIN BLOCKCHAIN APPLICATION
// ================================

// IMPORTANT:
// Replace this with your deployed Solidity contract address.
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";

const CONTRACT_ABI = [
    "function createProduct(string,string,string,string) returns (uint256)",
    "function addMovement(uint256,string,string,string)",
    "function getProduct(uint256) view returns (uint256,string,string,string,string,uint256)",
    "function getHistoryLength(uint256) view returns (uint256)",
    "function getMovement(uint256,uint256) view returns (string,string,string,uint256)"
];

let provider;
let signer;
let contract;

// ================================
// CONNECT METAMASK
// ================================
async function connectWallet() {
    try {
        if (!window.ethereum) {
            alert("MetaMask is not installed. Please install MetaMask.");
            return;
        }

        if (CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS") {
            alert("First deploy SupplyChain.sol and put the contract address in app.js.");
            return;
        }

        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();

        const address = await signer.getAddress();

        contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
        );

        document.getElementById("walletStatus").innerText =
            "Connected: " + address;

        document.getElementById("connectWallet").innerText =
            "Wallet Connected";

    } catch (error) {
        console.error(error);
        alert("Failed to connect wallet.");
    }
}

// ================================
// CREATE PRODUCT
// ================================
document.getElementById("productForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!contract) {
        alert("Please connect MetaMask first.");
        return;
    }

    const name = document.getElementById("productName").value;
    const cropType = document.getElementById("cropType").value;
    const farmer = document.getElementById("farmerName").value;
    const location = document.getElementById("farmLocation").value;
    const status = document.getElementById("createStatus");

    status.innerText = "Sending transaction to blockchain...";

    try {
        const transaction = await contract.createProduct(
            name,
            cropType,
            farmer,
            location
        );

        status.innerText = "Waiting for blockchain confirmation...";

        const receipt = await transaction.wait();

        status.innerText =
            "Product successfully registered! Transaction: " + receipt.hash;

        document.getElementById("productForm").reset();

    } catch (error) {
        console.error(error);
        status.innerText = "Transaction failed.";
    }
});

// ================================
// ADD SUPPLY CHAIN MOVEMENT
// ================================
document.getElementById("movementForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!contract) {
        alert("Please connect MetaMask first.");
        return;
    }

    const productId = document.getElementById("movementProductId").value;
    const stage = document.getElementById("stage").value;
    const person = document.getElementById("movementPerson").value;
    const location = document.getElementById("movementLocation").value;
    const status = document.getElementById("movementStatus");

    status.innerText = "Sending record to blockchain...";

    try {
        const transaction = await contract.addMovement(
            productId,
            stage,
            person,
            location
        );

        status.innerText = "Waiting for confirmation...";

        await transaction.wait();

        status.innerText =
            "Supply-chain record successfully added!";

        document.getElementById("movementForm").reset();

    } catch (error) {
        console.error(error);
        status.innerText = "Failed to add record.";
    }
});

// ================================
// TRACK PRODUCT
// ================================
async function trackProduct() {
    if (!contract) {
        alert("Please connect MetaMask first.");
        return;
    }

    const productId = document.getElementById("searchProductId").value;

    if (!productId) {
        alert("Enter a Product ID.");
        return;
    }

    try {
        const product = await contract.getProduct(productId);

        const result = document.getElementById("productResult");

        result.innerHTML = `
            <div class="productInfo">
                <h2>🌾 Product Information</h2>
                <p><strong>Product ID:</strong> ${product[0]}</p>
                <p><strong>Name:</strong> ${product[1]}</p>
                <p><strong>Crop Type:</strong> ${product[2]}</p>
                <p><strong>Farmer:</strong> ${product[3]}</p>
                <p><strong>Origin:</strong> ${product[4]}</p>
            </div>
        `;

        await displayHistory(productId);
        generateQRCode(productId);

    } catch (error) {
        console.error(error);

        document.getElementById("productResult").innerHTML =
            "<p>Product not found.</p>";

        document.getElementById("history").innerHTML = "";
        document.getElementById("qrcode").innerHTML = "";
    }
}

// ================================
// DISPLAY PRODUCT HISTORY
// ================================
async function displayHistory(productId) {
    const historyContainer = document.getElementById("history");

    historyContainer.innerHTML = "<h2>🚚 Supply Chain Journey</h2>";

    const timeline = document.createElement("div");
    timeline.className = "timeline";

    const count = await contract.getHistoryLength(productId);

    for (let i = 0; i < count; i++) {
        const movement = await contract.getMovement(productId, i);

        const stage = movement[0];
        const person = movement[1];
        const location = movement[2];
        const timestamp = Number(movement[3]);

        const date = new Date(timestamp * 1000);

        const item = document.createElement("div");
        item.className = "timelineItem";

        item.innerHTML = `
            <h3>${stage}</h3>
            <p><strong>Person / Organization:</strong> ${person}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Date:</strong> ${date.toLocaleString()}</p>
        `;

        timeline.appendChild(item);
    }

    historyContainer.appendChild(timeline);
}

// ================================
// GENERATE QR CODE
// ================================
function generateQRCode(productId) {
    const qrContainer = document.getElementById("qrcode");

    qrContainer.innerHTML = "";

    const trackingURL =
        window.location.href.split("?")[0] +
        "?product=" +
        productId;

    new QRCode(qrContainer, {
        text: trackingURL,
        width: 180,
        height: 180
    });
}
