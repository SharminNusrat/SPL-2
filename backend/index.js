const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const technicianManageRoutes = require('./routes/technicianManageRoutes');
const { processTicketQueue } = require('./controllers/ticketController'); 

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

app.use(express.urlencoded({ extended: true })); 
app.use('/uploads', express.static('uploads'));
app.use('/api/user', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/technicians', technicianManageRoutes);
app.get('/', (req, res) => {
    res.send('Hiii!');
})


setInterval(processTicketQueue, 5 * 60 * 1000);
console.log('Ticket queue processor scheduled to run every 5 minutes');

app.listen(port, (req, res) => {
    console.log(`Server is running at http://localhost:${port}`);
});