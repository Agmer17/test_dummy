import mongoose from 'mongoose';

const userReadingProgressSchema = new mongoose.Schema({
  user_id: {
    type: String, // String karena UUID dari Supabase Auth
    required: true
  },
  drill_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReadingDrill',
    required: true
  },
  wpm: {
    type: Number,
    required: true
  },
  success: {
    type: Boolean,
    required: true
  },
  completed_at: {
    type: Date,
    default: Date.now
  }
});

userReadingProgressSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const UserReadingProgress = mongoose.model('UserReadingProgress', userReadingProgressSchema, 'user_reading_progress');

export default UserReadingProgress;
