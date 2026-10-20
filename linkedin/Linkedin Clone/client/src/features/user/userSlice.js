import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../services/api';

export const getProfile = createAsyncThunk(
  'user/getProfile',
  async (userId, thunkAPI) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to load profile'));
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ userId, userData }, thunkAPI) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to update profile'));
    }
  }
);

export const uploadImage = createAsyncThunk(
  'user/uploadImage',
  async (formData, thunkAPI) => {
    try {
      const response = await api.post('/users/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to upload image'));
    }
  }
);

const initialState = {
  profileUser: null,
  isLoading: false,
  isUploading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profileUser = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profileUser = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profileUser = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(uploadImage.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.isUploading = false;
        state.profileUser = action.payload;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      });
  }
});

export const { clearProfile } = userSlice.actions;
export default userSlice.reducer;
