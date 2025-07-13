import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/axios';
import './AdminDashboard.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal.jsx'; // Import the Modal

// Initial state for forms to easily reset them
const initialCourseState = { title: '', code: '', lecturer_id: '' };
const initialUserState = { name: '', email: '', password: '', role: 'student' };

const AdminDashboard = () => {
  // State for data
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [lecturers, setLecturers] = useState([]);

  // State for UI control
  const [activeTab, setActiveTab] = useState('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentItem, setCurrentItem] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      const [usersRes, coursesRes, reviewsRes, lecturersRes] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/courses'),
        axios.get('/admin/reviews'),
        axios.get('/admin/users/lecturers')
      ]);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
      setReviews(reviewsRes.data);
      setLecturers(lecturersRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group reviews by course title for the "Reviews" tab
  const reviewsByCourse = useMemo(() => {
    return reviews.reduce((acc, review) => {
      const title = review.course_title;
      if (!acc[title]) {
        acc[title] = [];
      }
      acc[title].push(review);
      return acc;
    }, {});
  }, [reviews]);

  // --- Modal Control ---
  const openModal = (mode, item = null) => {
    setModalMode(mode);
    setCurrentItem(item || (activeTab === 'users' ? initialUserState : initialCourseState));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  // --- Form Handling ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({ ...currentItem, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = activeTab === 'users' ? '/admin/users' : '/admin/courses';
    const id = modalMode === 'edit' ? currentItem.id : '';

    try {
      if (modalMode === 'add') {
        await axios.post(endpoint, currentItem);
      } else {
        // For user updates, we need to handle the password field correctly
        const updateData = { ...currentItem };
        if (activeTab === 'users' && !updateData.password) {
          delete updateData.password; // Don't send empty password
        }
        await axios.put(`${endpoint}/${id}`, updateData);
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Failed to save data:', error.response?.data?.detail || error.message);
      alert(`Error: ${error.response?.data?.detail || 'Could not save data'}`);
    }
  };

  // --- Delete Logic ---
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      await axios.delete(`/admin/${type}s/${id}`);
      fetchData();
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
    }
  };

  // --- Render Logic ---
  const renderUserForm = () => (
    <form onSubmit={handleSubmit}>
      <input name="name" value={currentItem?.name || ''} onChange={handleInputChange} placeholder="Name" required />
      <input name="email" type="email" value={currentItem?.email || ''} onChange={handleInputChange} placeholder="Email" required />
      <input name="password" type="password" onChange={handleInputChange} placeholder={modalMode === 'edit' ? "New Password (optional)" : "Password"} required={modalMode === 'add'} />
      <select name="role" value={currentItem?.role || 'student'} onChange={handleInputChange}>
        <option value="student">Student</option>
        <option value="lecturer">Lecturer</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Save User</button>
    </form>
  );

  const renderCourseForm = () => (
    <form onSubmit={handleSubmit}>
      <input name="title" value={currentItem?.title || ''} onChange={handleInputChange} placeholder="Course Title" required />
      <input name="code" value={currentItem?.code || ''} onChange={handleInputChange} placeholder="Course Code" required />
      <select name="lecturer_id" value={currentItem?.lecturer_id || ''} onChange={handleInputChange} required>
        <option value="" disabled>Select a Lecturer</option>
        {lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>
      <button type="submit">Save Course</button>
    </form>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <>
            <div className="section-header">
              <h3>All Users</h3>
              <button className="btn-primary" onClick={() => openModal('add')}>+ Add User</button>
            </div>
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => openModal('edit', user)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete('user', user.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );
      case 'courses':
        return (
          <>
            <div className="section-header">
              <h3>All Courses</h3>
              <button className="btn-primary" onClick={() => openModal('add')}>+ Add Course</button>
            </div>
            <table>
               <thead><tr><th>ID</th><th>Title</th><th>Code</th><th>Lecturer</th><th>Actions</th></tr></thead>
              <tbody>
                {courses.map(course => {
                  const lecturerName = lecturers.find(l => l.id === course.lecturer_id)?.name || 'N/A';
                  return (
                    <tr key={course.id}>
                      <td>{course.id}</td><td>{course.title}</td><td>{course.code}</td><td>{lecturerName}</td>
                      <td className="actions">
                        <button className="btn-edit" onClick={() => openModal('edit', course)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete('course', course.id)}>Delete</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        );
      case 'reviews':
        return (
          <div>
            <h3>Reviews by Course</h3>
            {Object.keys(reviewsByCourse).length > 0 ? (
              Object.entries(reviewsByCourse).map(([title, courseReviews]) => (
                <div key={title} className="course-review-group">
                  <h4>{title} ({courseReviews.length} reviews)</h4>
                  <ul>
                    {courseReviews.map(review => (
                      <li key={review.id}>
                        <p>"{review.text}" - <em>by {review.student_name}</em></p>
                        <button className="btn-delete" onClick={() => handleDelete('review', review.id)}>Delete</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : <p>No reviews found.</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <h1>Admin Dashboard</h1>

        <div className="tabs">
          <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
          <button className={`tab ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>Courses</button>
          <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
        </div>

        <div className="tab-content">
          {renderTabContent()}
        </div>

        <Modal show={isModalOpen} onClose={closeModal} title={`${modalMode === 'add' ? 'Add' : 'Edit'} ${activeTab.slice(0, -1)}`}>
          {activeTab === 'users' ? renderUserForm() : renderCourseForm()}
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;