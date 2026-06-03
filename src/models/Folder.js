import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user_id: {
    type: String, // Menggunakan String untuk UUID dari Supabase Auth
    required: true
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  color: {
    type: String,
    default: 'blue'
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

const Folder = mongoose.model('Folder', folderSchema, 'folders');

export default Folder;
