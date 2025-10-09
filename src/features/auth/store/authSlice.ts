import type { PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice } from '../../../app/createAppSlice';
import type { AppThunk } from '../../../app/types';
import { AuthState, LoginCredentials, User } from '../types';
import { authService } from '../services/authService';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,
};

export const authSlice = createAppSlice({
  name: 'auth',
  initialState,
  reducers: create => ({
    clearError: create.reducer(state => {
      state.error = null;
    }),
    setUser: create.reducer((state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    }),
    logout: create.reducer(state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }),
    loginAsync: create.asyncThunk(
      async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
          const response = await authService.login(credentials);
          return response;
        } catch (error: any) {
          // Handle API error responses
          const errorMessage = error?.response?.data?.message || 
                              error?.response?.data?.error || 
                              error?.message || 
                              'Login failed';
          return rejectWithValue(errorMessage);
        }
      },
      {
        pending: state => {
          state.isLoading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        },
      }
    ),
    // logoutAsync: create.asyncThunk(
    //   async (_, { rejectWithValue }) => {
    //     try {
    //       await authService.logout();
    //     } catch (error) {
    //       return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
    //     }
    //   },
    //   {
    //     pending: state => {
    //       state.isLoading = true;
    //     },
    //     fulfilled: state => {
    //       state.isLoading = false;
    //       state.user = null;
    //       state.token = null;
    //       state.isAuthenticated = false;
    //       state.error = null;
    //     },
    //     rejected: (state, action) => {
    //       state.isLoading = false;
    //       state.error = action.payload as string;
    //     },
    //   }
    // ),
    // getCurrentUserAsync: create.asyncThunk(
    //   async (_, { rejectWithValue }) => {
    //     try {
    //       const user = await authService.getCurrentUser();
    //       if (!user) {
    //         throw new Error('No user found');
    //       }
    //       return user;
    //     } catch (error) {
    //       return rejectWithValue(error instanceof Error ? error.message : 'Failed to get current user');
    //     }
    //   },
    //   {
    //     pending: state => {
    //       state.isLoading = true;
    //     },
    //     fulfilled: (state, action) => {
    //       state.isLoading = false;
    //       state.user = action.payload;
    //       state.isAuthenticated = true;
    //       state.error = null;
    //     },
    //     rejected: (state, action) => {
    //       state.isLoading = false;
    //       state.error = action.payload as string;
    //       state.isAuthenticated = false;
    //       state.user = null;
    //       state.token = null;
    //     },
    //   }
    // ),
  }),
  selectors: {
    selectUser: auth => auth.user,
    selectToken: auth => auth.token,
    selectIsAuthenticated: auth => auth.isAuthenticated,
    selectIsLoading: auth => auth.isLoading,
    selectError: auth => auth.error,
  },
});

// Action creators are generated for each case reducer function.
export const { clearError, setUser, logout, loginAsync } = authSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectUser, selectToken, selectIsAuthenticated, selectIsLoading, selectError } = authSlice.selectors;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const loginIfNotAuthenticated =
//   (credentials: LoginCredentials): AppThunk =>
//   (dispatch, getState) => {
//     const isAuthenticated = selectIsAuthenticated(getState());

//     if (!isAuthenticated) {
//       dispatch(loginAsync(credentials));
//     }
//   };

