const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/ticketRoutes');

const db = require('./db-config');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const port = process.env.PORT || 8000;
db.connect((err) => {
    if(err) {
        console.log(err);
    } else {
        console.log('MySQL Connected!');
    }
})

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
}));
// app.use(cookieParser);  
app.use(express.urlencoded({ extended: true })); 
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.get('/', (req, res) => {
    res.send('Hiii!');
})

app.listen(port, (req, res) => {
    console.log(`Server is running at http://localhost:${port}`);
});