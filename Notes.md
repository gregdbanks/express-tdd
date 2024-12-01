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