import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import postReducer from '../features/posts/postSlice';
import userReducer from '../features/user/userSlice';
import connectionReducer from '../features/connections/connectionSlice';
import jobReducer from '../features/jobs/jobSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    user: userReducer,
    connections: connectionReducer,
    jobs: jobReducer
  }
});

export default store;
