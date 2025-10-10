const express = require("express");
const insights = require("./src/modules/insights");

const app = express();
app.use(express.json());
app.use("/insights", insights);

const PORT = 5050;
app.listen(PORT, () => console.log(`Insights sandbox on :${PORT}`));
