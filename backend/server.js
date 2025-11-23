const app = require('../api/index.js');
const port = 3000;

app.listen(port, () => {
    console.log(`Mock Backend Server running at http://localhost:${port}`);
});
