const fs = require('fs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Load models
const Mission = require('./models/Mission');
const Incident = require('./models/Incident');
const Report = require('./models/Report');
const User = require('./models/User');
const { connectDb } = require('./config/db');

connectDb();
const missions = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/missions.json`, 'utf-8')
);

const incidents = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/incidents.json`, 'utf-8')
);

const reports = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/reports.json`, 'utf-8')
);

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/user.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
    try {
        await User.create(users);
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
        await User.deleteMany();
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