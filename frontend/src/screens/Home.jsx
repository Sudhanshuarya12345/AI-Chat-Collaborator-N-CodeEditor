import React, { useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/user.context.jsx'
import axios from "../config/axios.js"
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const { user } = useContext(UserContext)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [copied, setCopied] = useState(false)

  const navigate = useNavigate()

  const createProject = async (e) => {
    e.preventDefault()
    if (!projectName.trim()) {
      setError('Project name cannot be empty')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const res = await axios.post('/projects/create', {
        name: projectName.trim()
      })
      
      if (res.data && res.data.project) {
        setProjects(prev => [res.data.project, ...prev])
        setIsModalOpen(false)
        setProjectName('')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.error('Create project error:', err)
      setError(err.response?.data?.message || 'Failed to create project. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  useEffect(() => {
    let interval;
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get('/projects/all');
        if (res.data && res.data.projects) {
          setProjects(res.data.projects);
        }
      } catch (err) {
        setError('Failed to fetch projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
    interval = setInterval(fetchProjects, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredProjects = projects.filter(project => {
    const userId = user._id;
    // Handle both populated and non-populated user objects
    const users = project.users.map(u => (typeof u === 'object' ? u._id : u));
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'all') {
      // All projects where user is a member (owner or collaborator)
      return users.includes(userId) && matchesSearch;
    }
    if (filter === 'owned') {
      // Projects where user is the owner (first in users array)
      return users[0] === userId && matchesSearch;
    }
    if (filter === 'shared') {
      // Projects where user is a collaborator (not owner, but in users)
      return users.includes(userId) && users[0] !== userId && matchesSearch;
    }
    return matchesSearch;
  });

  return (
    <main className='min-h-screen bg-slate-900 p-6'>
      <div className="max-w-7xl mx-auto">
        {/* Header Section with Gradient */}
        <div className="bg-slate-800 rounded-2xl shadow-lg p-8 mb-8 border border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                My Projects
              </h1>
              <p className="text-slate-300 mt-2 flex items-center gap-2">
                <i className='ri-user-3-line'></i>
                Welcome back, {user?.email}
                <span className="text-xs text-slate-400 ml-2 flex items-center gap-1">
                  (ID: {user?._id})
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(user?._id || '')
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1200)
                    }}
                    className="ml-1 px-1 py-0.5 rounded hover:bg-slate-700 transition text-blue-400 border border-slate-700"
                    title={copied ? 'Copied!' : 'Copy ID'}
                  >
                    {copied ? <i className="ri-check-line"></i> : <i className="ri-file-copy-line"></i>}
                  </button>
                </span>
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-0.5"
            >
              <i className='ri-add-line text-xl'></i>
              New Project
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-slate-800 rounded-2xl shadow-lg p-6 mb-8 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-400"
              />
              <i className='ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'></i>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 bg-slate-700 p-1 rounded-xl">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  filter === 'all' 
                    ? 'bg-slate-800 text-blue-400 shadow-sm' 
                    : 'text-slate-300 hover:text-blue-400'
                }`}
              >
                All Projects
              </button>
              <button
                onClick={() => setFilter('owned')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  filter === 'owned' 
                    ? 'bg-slate-800 text-blue-400 shadow-sm' 
                    : 'text-slate-300 hover:text-blue-400'
                }`}
              >
                My Projects
              </button>
              <button
                onClick={() => setFilter('shared')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  filter === 'shared' 
                    ? 'bg-slate-800 text-blue-400 shadow-sm' 
                    : 'text-slate-300 hover:text-blue-400'
                }`}
              >
                Shared with Me
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-300 flex items-center gap-2">
            <i className='ri-error-warning-line text-xl'></i>
            {error}
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-600 mb-4">
              <i className='ri-folder-line text-6xl'></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No projects found</h3>
            <p className="text-slate-400">Create a new project to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate('/project', { state: { project } })}
                className="group bg-slate-800 rounded-xl shadow-lg hover:shadow-blue-500/10 transition-all duration-300 p-6 cursor-pointer border border-slate-700 hover:border-blue-500/30 transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>
                  {project.owner === user._id && (
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full font-medium">
                      Owner
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <i className='ri-user-line'></i>
                    <span className="text-sm">{project.users.length} Collaborators</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <i className='ri-time-line'></i>
                    <span className="text-sm">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-700">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/project', { state: { project } });
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                    >
                      Open Project
                      <i className='ri-arrow-right-line'></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl shadow-lg p-6 w-full max-w-md transform transition-all duration-300 scale-100 border border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-200">Create New Project</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setProjectName('')
                    setError(null)
                  }}
                  className="text-slate-400 hover:text-slate-300 transition p-2 hover:bg-slate-700 rounded-lg"
                >
                  <i className='ri-close-line text-2xl'></i>
                </button>
              </div>

              <form className="space-y-6" onSubmit={createProject}>
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-slate-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="projectName"
                    value={projectName}
                    onChange={(e) => {
                      setProjectName(e.target.value)
                      setError(null)
                    }}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-400 transition"
                    placeholder="Enter project name"
                    required
                    disabled={isCreating}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      setProjectName('')
                      setError(null)
                    }}
                    className="px-4 py-2 text-slate-300 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !projectName.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/20"
                  >
                    {isCreating ? (
                      <span className="flex items-center gap-2">
                        <i className="ri-loader-4-line animate-spin"></i>
                        Creating...
                      </span>
                    ) : (
                      'Create Project'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default Home
