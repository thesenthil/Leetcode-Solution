import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../services/api';

export const getJobs = createAsyncThunk(
  'jobs/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const query = new URLSearchParams();
      if (params.location) query.append('location', params.location);
      if (params.type) query.append('type', params.type);
      if (params.search) query.append('search', params.search);
      if (params.page) query.append('page', params.page);
      query.append('limit', params.limit || 10);

      const response = await api.get(`/jobs?${query.toString()}`);
      return { ...response.data, page: params.page || 1 };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to load jobs'));
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/create',
  async (jobData, thunkAPI) => {
    try {
      const response = await api.post('/jobs', jobData);
      return response.data.job;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to create job'));
    }
  }
);

export const applyForJob = createAsyncThunk(
  'jobs/apply',
  async (jobId, thunkAPI) => {
    try {
      await api.post(`/jobs/${jobId}/apply`);
      return jobId;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to apply'));
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/delete',
  async (jobId, thunkAPI) => {
    try {
      await api.delete(`/jobs/${jobId}`);
      return jobId;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to delete job'));
    }
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    selectedJob: null,
    isLoading: false,
    isApplying: false,
    error: null,
    hasMore: true,
    currentPage: 1
  },
  reducers: {
    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
    },
    clearSelectedJob: (state) => {
      state.selectedJob = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        const { jobs, pagination, page } = action.payload;
        if (page === 1) {
          state.jobs = jobs;
        } else {
          state.jobs = [...state.jobs, ...jobs];
        }
        state.hasMore = pagination.hasMore;
        state.currentPage = pagination.currentPage;
      })
      .addCase(getJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
      })
      .addCase(applyForJob.pending, (state) => {
        state.isApplying = true;
      })
      .addCase(applyForJob.fulfilled, (state, action) => {
        state.isApplying = false;
        const job = state.jobs.find((j) => j._id === action.payload);
        if (job && state.selectedJob?._id === action.payload) {
          state.selectedJob = { ...job, applied: true };
        }
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.isApplying = false;
        state.error = action.payload;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((j) => j._id !== action.payload);
        if (state.selectedJob?._id === action.payload) {
          state.selectedJob = null;
        }
      });
  }
});

export const { setSelectedJob, clearSelectedJob } = jobSlice.actions;
export default jobSlice.reducer;
