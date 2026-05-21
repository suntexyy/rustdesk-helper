const mongoose = require("mongoose");

const dbConnect = async () => {
  const mongoURI = process.env.MONGO_URI;
  const mongoURIFallback = process.env.MONGO_URI_FALLBACK;

  if (!mongoURI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    const connection = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
    return;
  } catch (error) {
    const isSrvLookupFailure =
      typeof error?.message === "string" &&
      error.message.toLowerCase().includes("querysrv");

    if (isSrvLookupFailure && mongoURIFallback) {
      console.warn(
        "⚠️  SRV lookup failed; retrying with MONGO_URI_FALLBACK...",
      );

      const fallbackConnection = await mongoose.connect(mongoURIFallback, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log(
        `✅ MongoDB Connected (fallback): ${fallbackConnection.connection.host}`,
      );
      return;
    }

    if (isSrvLookupFailure && !mongoURIFallback) {
      console.error(
        "❌ SRV DNS lookup failed for MONGO_URI. Add MONGO_URI_FALLBACK with a non-SRV mongodb:// URI.",
      );
    }

    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected");
});

mongoose.connection.on("error", (err) => {
  console.error(`❌ MongoDB error: ${err.message}`);
});

module.exports = dbConnect;
