- ! Will need to delete after each test run in beginning sections
- We update the below code in around section 18. can we NOT make it like this from the start?

```js
const deleteMission = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const mission = await Mission.findById(id); // ?
    if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
    }
    await mission.deleteOne();  // ?
    res.status(200).json({ message: "Mission deleted successfully" });
});

```

- Need to update this earlier in section to be right order else the upload section 24 wont work

```js
const mongoose = require("mongoose");
const { connectDb, disconnectDb } = require("../config/db");
const { importData, deleteData } = require('../seeder');

beforeAll(async () => {
    await connectDb();
    await deleteData();
    await importData();
});

afterAll(async () => {
    await deleteData();
    await disconnectDb();
    await mongoose.connection.close();
});

const missionTests = require('./missionTests');
const incidentTests = require('./incidentTests');
const middlewareTests = require('./middlewareTests');
const reportTests = require('./reportTests');

describe("Missions API", () => {
    missionTests();
    incidentTests();
    reportTests(); // ! Right here
    middlewareTests();
});
```

- ! never added a logout or getMe to auth controller, dont i need those?