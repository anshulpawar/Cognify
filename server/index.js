const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Main progress route
app.use('/api/progress', require('./routes/progress'));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Analytics backend running at http://localhost:${PORT}`);
});
