const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,                    // removes extra spaces
      maxlength: [50, 'First name cannot exceed 50 characters']
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,                  // no two users same email
      lowercase: true,               // store as lowercase always
      trim: true
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false                  // NEVER return password in queries
    },

    headline: {
      type: String,
      default: '',
      maxlength: [220, 'Headline too long']
    },

    profileImage: {
      type: String,
      default: ''                    // Cloudinary URL later
    },

    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'                  // reference to other User documents
      }
    ],

    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: null
    },
    emailVerificationExpiry: {
      type: Date,
      default: null
    },
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetExpiry: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true                 // auto adds createdAt, updatedAt
  }
  
);

// ─── MIDDLEWARE: Hash password before saving ───────────────────────────────

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── METHOD: Compare entered password with hashed password ────────────────

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
