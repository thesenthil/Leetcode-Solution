import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../services/api';

export const getConnections = createAsyncThunk(
  'connections/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/connections');
      return response.data.connections;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to load connections'));
    }
  }
);

export const getPendingRequests = createAsyncThunk(
  'connections/getPending',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/connections/pending');
      return response.data.requests;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to load requests'));
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  'connections/sendRequest',
  async (userId, thunkAPI) => {
    try {
      const response = await api.post(`/connections/${userId}/request`);
      return response.data.connection;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to send request'));
    }
  }
);

export const acceptConnectionRequest = createAsyncThunk(
  'connections/accept',
  async (connectionId, thunkAPI) => {
    try {
      const response = await api.put(`/connections/${connectionId}/accept`);
      return response.data.connection;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to accept request'));
    }
  }
);

const connectionSlice = createSlice({
  name: 'connections',
  initialState: {
    connections: [],
    pendingRequests: [],
    isLoading: false,
    isSending: false,
    error: null
  },
  reducers: {
    clearConnectionError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConnections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connections = action.payload;
      })
      .addCase(getConnections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getPendingRequests.fulfilled, (state, action) => {
        state.pendingRequests = action.payload;
      })
      .addCase(sendConnectionRequest.pending, (state) => {
        state.isSending = true;
      })
      .addCase(sendConnectionRequest.fulfilled, (state) => {
        state.isSending = false;
      })
      .addCase(sendConnectionRequest.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload;
      })
      .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
        state.pendingRequests = state.pendingRequests.filter(
          (r) => r._id !== action.payload._id
        );
        state.connections.push(action.payload);
      });
  }
});

export const { clearConnectionError } = connectionSlice.actions;
export default connectionSlice.reducer;
