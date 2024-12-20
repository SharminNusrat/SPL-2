const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const db = require('./db-config');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const port = 3000;

db.connect((err) => {
    if(err) {
        console.log(err);
    } else {
        console.log('MySQL Connected!');
    }
})

app.use(express.json());
app.use(cors());
// app.use(cookieParser);   
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Hiii!');
})

app.listen(port, (req, res) => {
    console.log(`Server is running at http://localhost:${port}`);
});