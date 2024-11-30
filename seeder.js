const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Load models
const Mission = require('./models/Mission');
const Incident = require('./models/Incident');
const Report = require('./models/Report');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Read JSON files
const missions = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/missions.json`, 'utf-8')
);

const incidents = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/incidents.json`, 'utf-8')
);

const reports = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/reports.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
    try {
        await Mission.create(missions);
        await Incident.create(incidents);
        await Report.create(reports);
        console.log('Data Imported...');
    } catch (err) {
        console.error(err);
    }
};

// Delete data
const deleteData = async () => {
    try {
        await Mission.deleteMany();
        await Incident.deleteMany();
        await Report.deleteMany();
        console.log('Data Destroyed...');
    } catch (err) {
        console.error(err);
    }
};

if (process.argv[2] === '-i') {
    importData().then(() => process.exit());
} else if (process.argv[2] === '-d') {
    deleteData().then(() => process.exit());
}

module.exports = { importData, deleteData };