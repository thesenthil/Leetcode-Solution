import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../services/api';

export const getFeedPosts = createAsyncThunk(
  'posts/getFeed',
  async (page = 1, thunkAPI) => {
    try {
      const response = await api.get(`/posts?page=${page}&limit=10`);
      return { ...response.data, page };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to load posts'));
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/create',
  async (postData, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('content', postData.content);
      if (postData.image) {
        formData.append('image', postData.image);
      }

      const response = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.post;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to create post'));
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/like',
  async (postId, thunkAPI) => {
    try {
      const response = await api.put(`/posts/${postId}/like`);
      return { postId, ...response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to like post'));
    }
  }
);

export const addComment = createAsyncThunk(
  'posts/comment',
  async ({ postId, text }, thunkAPI) => {
    try {
      const response = await api.post(`/posts/${postId}/comment`, { text });
      return { postId, comments: response.data.comments };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to add comment'));
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (postId, thunkAPI) => {
    try {
      await api.delete(`/posts/${postId}`);
      return postId;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Failed to delete post'));
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    isLoading: false,
    isCreating: false,
    error: null,
    hasMore: true,
    currentPage: 1
  },
  reducers: {
    resetFeed: (state) => {
      state.posts = [];
      state.currentPage = 1;
      state.hasMore = true;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeedPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeedPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { posts, pagination, page } = action.payload;
        if (page === 1) {
          state.posts = posts;
        } else {
          state.posts = [...state.posts, ...posts];
        }
        state.hasMore = pagination.hasMore;
        state.currentPage = pagination.currentPage;
      })
      .addCase(getFeedPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createPost.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isCreating = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          post.likes = action.payload.likes;
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          post.comments = action.payload.comments;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p._id !== action.payload);
      });
  }
});

export const { resetFeed } = postSlice.actions;
export default postSlice.reducer;
