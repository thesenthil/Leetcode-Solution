import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../services/api';
import { getUserIdFromToken } from '../../utils/jwt';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Login failed'));
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (userData, thunkAPI) => {
    try {
      const response = await api.post('/auth/signup', userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Signup failed'));
    }
  }
);

export const hydrateAuth = createAsyncThunk(
  'auth/hydrate',
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    if (!token) return thunkAPI.rejectWithValue('No token');

    const userId = getUserIdFromToken(token);
    if (!userId) {
      localStorage.removeItem('token');
      return thunkAPI.rejectWithValue('Invalid token');
    }

    try {
      const response = await api.get(`/users/${userId}`);
      return { user: response.data.user, token };
    } catch (error) {
      localStorage.removeItem('token');
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Session expired'));
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  isHydrating: !!localStorage.getItem('token'),
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isHydrating = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isHydrating = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isHydrating = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(hydrateAuth.pending, (state) => {
        state.isHydrating = true;
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.isHydrating = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.isHydrating = false;
        state.user = null;
        state.token = null;
      });
  }
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
