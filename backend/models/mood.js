const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required : true
    },
    date:{
        type: Date,
        required: true
    },
    mood : {
        type : String, 
        required : true,
        enum : ['happy', 'sad', 'excited', 'angry', 'relaxed', 'stressed', 'neutral']
    },
    description : {
        type : String,
        required : true
    }
});

const Mood = mongoose.model('Mood', MoodSchema);
module.exports = Mood;