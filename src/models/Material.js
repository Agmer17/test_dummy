import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  folder_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  user_id: {
    type: String, // Menggunakan String untuk UUID dari Supabase Auth
    required: true
  },
  type: {
    type: String,
    enum: ['gdrive', 'canva', 'youtube', 'link'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  is_shared: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Material = mongoose.model('Material', materialSchema, 'materials');

export default Material;
