import mongoose from 'mongoose';

const readingDrillSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Easy', 'Medium'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Memastikan `_id` diubah menjadi `id` saat di-convert ke JSON (agar strukturnya mirip Supabase)
readingDrillSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const ReadingDrill = mongoose.model('ReadingDrill', readingDrillSchema, 'reading_drills');

export default ReadingDrill;
