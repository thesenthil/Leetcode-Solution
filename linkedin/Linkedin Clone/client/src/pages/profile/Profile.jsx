import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Camera, UserPlus, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getProfile,
  updateProfile,
  uploadImage,
  clearProfile
} from '../../features/user/userSlice';
import { setUser } from '../../features/auth/authSlice';
import {
  sendConnectionRequest,
  getConnections
} from '../../features/connections/connectionSlice';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profileUser, isLoading, isUploading, error } = useSelector((state) => state.user);
  const { user: loggedInUser } = useSelector((state) => state.auth);
  const { connections, isSending } = useSelector((state) => state.connections);
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    dispatch(getProfile(id));
    dispatch(getConnections());
    return () => dispatch(clearProfile());
  }, [id, dispatch]);

  useEffect(() => {
    if (profileUser) {
      reset({
        firstName: profileUser.firstName || '',
        lastName: profileUser.lastName || '',
        headline: profileUser.headline || ''
      });
    }
  }, [profileUser, reset]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const isOwner = loggedInUser?._id === id;

  const isConnected = connections.some((conn) => {
    const other =
      conn.sender?._id === loggedInUser?._id ? conn.recipient : conn.sender;
    return other?._id === id || other === id;
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profileImage', file);
    dispatch(uploadImage(formData)).then((result) => {
      if (uploadImage.fulfilled.match(result)) {
        dispatch(setUser(result.payload));
        toast.success('Profile photo updated');
      }
    });
  };

  const onSubmit = async (data) => {
    const result = await dispatch(updateProfile({ userId: id, userData: data }));
    if (updateProfile.fulfilled.match(result)) {
      dispatch(setUser(result.payload));
      setIsEditing(false);
      toast.success('Profile updated');
    }
  };

  const handleConnect = () => {
    dispatch(sendConnectionRequest(id)).then((result) => {
      if (sendConnectionRequest.fulfilled.match(result)) {
        toast.success('Connection request sent');
      }
    });
  };

  if (isLoading && !profileUser) {
    return (
      <div className="page-loading">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <EmptyState
        title="User not found"
        description="This profile may have been removed or does not exist."
      />
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-page__content">
        <div className="card profile-header">
          <div className="profile-header__banner" />
          <div className="profile-header__body">
            <div className="profile-header__avatar-wrap">
              <Avatar
                src={profileUser.profileImage}
                firstName={profileUser.firstName}
                lastName={profileUser.lastName}
                size={152}
              />
              {isOwner && (
                <label className="profile-header__camera" htmlFor="profile-image-upload">
                  <Camera size={18} />
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleImageUpload}
                    hidden
                  />
                </label>
              )}
              {isUploading && <span className="profile-header__uploading">Uploading...</span>}
            </div>

            <div className="profile-header__info">
              <h1>{profileUser.firstName} {profileUser.lastName}</h1>
              <p className="profile-header__headline">
                {profileUser.headline || 'Add a headline to tell people what you do'}
              </p>
              {profileUser.connections && (
                <p className="profile-header__connections">
                  {(profileUser.connections || []).length} connections
                </p>
              )}
            </div>

            <div className="profile-header__actions">
              {isOwner && !isEditing && (
                <button type="button" className="btn btn--outline" onClick={() => setIsEditing(true)}>
                  Edit profile
                </button>
              )}
              {!isOwner && !isConnected && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleConnect}
                  disabled={isSending}
                >
                  <UserPlus size={18} />
                  {isSending ? 'Sending...' : 'Connect'}
                </button>
              )}
              {!isOwner && isConnected && (
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => navigate(`/messaging/${id}`)}
                >
                  <MessageCircle size={18} />
                  Message
                </button>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="card profile-edit">
            <h2>Edit profile</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="profile-edit__form">
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="firstName">First name</label>
                  <input id="firstName" {...register('firstName', { required: true })} />
                </div>
                <div className="form-field">
                  <label htmlFor="lastName">Last name</label>
                  <input id="lastName" {...register('lastName', { required: true })} />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="headline">Headline</label>
                <input
                  id="headline"
                  {...register('headline')}
                  placeholder="e.g. Software Engineer at Company"
                  maxLength={220}
                />
              </div>
              <div className="profile-edit__actions">
                <button type="submit" className="btn btn--primary" disabled={isLoading}>
                  Save
                </button>
                <button type="button" className="btn btn--outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card profile-about">
          <h2>About</h2>
          <dl className="profile-about__list">
            <div>
              <dt>Email</dt>
              <dd>{profileUser.email || '—'}</dd>
            </div>
            <div>
              <dt>Email verified</dt>
              <dd>{profileUser.isEmailVerified ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>
                {profileUser.createdAt
                  ? new Date(profileUser.createdAt).toLocaleDateString()
                  : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Profile;
