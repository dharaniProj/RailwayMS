require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employee'));
app.use('/api/announcements', require('./routes/announcement'));
app.use('/api/salary', require('./routes/salary'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/leaves', require('./routes/leave'));
app.use('/api/transfers', require('./routes/transfer'));
app.use('/api/documents', require('./routes/document'));
// app.use('/api/salary', require('./routes/salary'));
// app.use('/api/work', require('./routes/work'));
// app.use('/api/documents', require('./routes/documents'));

app.get('/', (req, res) => {
    res.send('Railway Management System API');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
