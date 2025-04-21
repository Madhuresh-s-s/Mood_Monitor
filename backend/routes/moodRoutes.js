const express = require('express');
const router = express.Router();
const Mood = require('../models/mood');
const authmiddleware = require('../middleware/authMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:userid',authMiddleware, async(req, res)=>{
    const {mood, description} = req.body;
    if(!mood){
        return res.status(400).json({message:"mood is required"});
    }
    try{
        const newmood = new Mood({
            userId: req.params.userid,
            date: new Date(),
            mood : mood,
            description: description
        });
        const savedmood = await newmood.save();
        res.status(201).json(savedmood);
    }catch(error){
        console.error("Error saving mood:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get all mood entries for a specific user
router.get('/:userId', authmiddleware, async (req, res) => {
    try {
        if(req.user.userId !== req.params.userId){
            return res.status(403).json({message : "Access Denied!"});
        }
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        
        const moods = await Mood.find({
            userId: req.params.userId, // Ensure this matches the model field name
            date: { $gte: monthStart, $lte: today }
        }).sort({ date: 1 });

        // If no moods exist, return an empty array
        if (!moods || moods.length === 0) {
            return res.json([]); 
        }

        res.json(moods);
    } catch (error) {
        console.error("Error fetching moods:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Update a mood entry
// router.put('/:id', async (req, res) => {
//     try {
//         const updatedMood = await Mood.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true }
//         );
//         res.json(updatedMood);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// // Delete a mood entry
// router.delete('/:id', async (req, res) => {
//     try {
//         await Mood.findByIdAndDelete(req.params.id);
//         res.json({ message: 'Mood deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

module.exports = router;

