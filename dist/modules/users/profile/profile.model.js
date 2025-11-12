import mongoose from 'mongoose';
const profileSchema = new mongoose.Schema({
    bio: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});
export const ProfileModel = mongoose.model('Profile', profileSchema);
//# sourceMappingURL=profile.model.js.map