import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Briefcase, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  getJobs,
  createJob,
  applyForJob,
  deleteJob,
  setSelectedJob,
  clearSelectedJob
} from '../../features/jobs/jobSlice';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const JOB_TYPES = [
  { value: '', label: 'All types' },
  { value: 'fulltime', label: 'Full-time' },
  { value: 'parttime', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' }
];

const Jobs = () => {
  const dispatch = useDispatch();
  const { jobs, selectedJob, isLoading, isApplying, hasMore, currentPage, error } =
    useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({ search: '', location: '', type: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    dispatch(getJobs({ page: 1 }));
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleFilter = (e) => {
    e.preventDefault();
    dispatch(getJobs({ page: 1, ...filters }));
  };

  const handleSelectJob = (job) => {
    dispatch(setSelectedJob(job));
  };

  const hasApplied = (job) =>
    (job.applicants || []).some(
      (a) => a.user === user?._id || a.user?._id === user?._id
    );

  const handleApply = (jobId) => {
    dispatch(applyForJob(jobId)).then((result) => {
      if (applyForJob.fulfilled.match(result)) {
        toast.success('Application submitted!');
        dispatch(getJobs({ page: 1, ...filters }));
      }
    });
  };

  const onCreateJob = async (data) => {
    const skills = data.skills
      ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const result = await dispatch(
      createJob({ ...data, skills })
    );
    if (createJob.fulfilled.match(result)) {
      toast.success('Job posted!');
      reset();
      setShowCreateForm(false);
    }
  };

  const handleDelete = (jobId) => {
    dispatch(deleteJob(jobId));
    toast.success('Job deleted');
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      dispatch(getJobs({ page: currentPage + 1, ...filters }));
    }
  };

  const formatJobType = (type) =>
    JOB_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div className="jobs-page">
      <div className="jobs-page__layout">
        <div className="jobs-page__list">
          <div className="card jobs-filters">
            <form onSubmit={handleFilter} className="jobs-filters__form">
              <input
                type="text"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <button type="submit" className="btn btn--primary btn--sm">Search</button>
            </form>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus size={16} />
              Post a job
            </button>
          </div>

          {showCreateForm && (
            <div className="card jobs-create">
              <h3>Post a new job</h3>
              <form onSubmit={handleSubmit(onCreateJob)} className="jobs-create__form">
                <input {...register('title', { required: true })} placeholder="Job title *" />
                <input {...register('company', { required: true })} placeholder="Company *" />
                <input {...register('location', { required: true })} placeholder="Location *" />
                <select {...register('type', { required: true })} defaultValue="fulltime">
                  {JOB_TYPES.filter((t) => t.value).map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <textarea
                  {...register('description', { required: true })}
                  placeholder="Job description *"
                  rows={4}
                />
                <input {...register('skills')} placeholder="Skills (comma-separated)" />
                <div className="jobs-create__actions">
                  <button type="submit" className="btn btn--primary btn--sm">Post job</button>
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {isLoading && jobs.length === 0 && (
            <div className="page-loading"><LoadingSpinner /></div>
          )}

          {jobs.map((job) => (
            <button
              key={job._id}
              type="button"
              className={`card job-card ${selectedJob?._id === job._id ? 'job-card--active' : ''}`}
              onClick={() => handleSelectJob(job)}
            >
              <h3>{job.title}</h3>
              <p className="job-card__company">{job.company}</p>
              <div className="job-card__meta">
                <span><MapPin size={14} /> {job.location}</span>
                <span><Briefcase size={14} /> {formatJobType(job.type)}</span>
              </div>
              {hasApplied(job) && <span className="job-card__applied">Applied</span>}
            </button>
          ))}

          {hasMore && jobs.length > 0 && (
            <button type="button" className="btn btn--outline btn--full" onClick={loadMore} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load more jobs'}
            </button>
          )}

          {!isLoading && jobs.length === 0 && (
            <EmptyState title="No jobs found" description="Try adjusting your search filters." />
          )}
        </div>

        <div className="jobs-page__detail">
          {selectedJob ? (
            <div className="card job-detail">
              <div className="job-detail__header">
                <div>
                  <h2>{selectedJob.title}</h2>
                  <p className="job-detail__company">{selectedJob.company}</p>
                  <div className="job-detail__meta">
                    <span><MapPin size={16} /> {selectedJob.location}</span>
                    <span><Briefcase size={16} /> {formatJobType(selectedJob.type)}</span>
                  </div>
                </div>
                {selectedJob.postedBy?._id === user?._id && (
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => handleDelete(selectedJob._id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
              </div>

              {selectedJob.postedBy && (
                <div className="job-detail__poster">
                  <Avatar
                    src={selectedJob.postedBy.profileImage}
                    firstName={selectedJob.postedBy.firstName}
                    lastName={selectedJob.postedBy.lastName}
                    size={40}
                  />
                  <span>
                    Posted by {selectedJob.postedBy.firstName} {selectedJob.postedBy.lastName}
                  </span>
                </div>
              )}

              <div className="job-detail__section">
                <h3>About the job</h3>
                <p>{selectedJob.description}</p>
              </div>

              {selectedJob.skills?.length > 0 && (
                <div className="job-detail__section">
                  <h3>Skills</h3>
                  <div className="job-detail__skills">
                    {selectedJob.skills.map((skill) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.postedBy?._id !== user?._id && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => handleApply(selectedJob._id)}
                  disabled={isApplying || hasApplied(selectedJob)}
                >
                  {hasApplied(selectedJob)
                    ? 'Already applied'
                    : isApplying
                      ? 'Applying...'
                      : 'Apply now'}
                </button>
              )}

              <button type="button" className="btn btn--ghost hide-desktop" onClick={() => dispatch(clearSelectedJob())}>
                Close
              </button>
            </div>
          ) : (
            <div className="card job-detail job-detail--empty hide-mobile">
              <EmptyState
                title="Select a job"
                description="Choose a job from the list to view details and apply."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
