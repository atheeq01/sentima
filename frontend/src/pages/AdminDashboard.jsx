import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/adminDashboard.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const initialCourseState = { title: '', code: '', lecturer_id: '' };

const initialUserState = { name: '', email: '', password: '', role: 'student', student_id: '' };

const AdminDashboard = () => {
    
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [lecturers, setLecturers] = useState([]);

    
    const [activeTab, setActiveTab] = useState('users');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); 
    const [currentItem, setCurrentItem] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (['users', 'courses', 'reviews'].includes(hash)) {
            setActiveTab(hash);
        } else {
            setActiveTab('users');
        }
    }, [location]);

    
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
            toast.error("Failed to fetch dashboard data. Please refresh.");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    
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

    
    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item || (activeTab === 'users' ? initialUserState : initialCourseState));
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem({ ...currentItem, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = activeTab === 'users' ? '/admin/users' : '/admin/courses';
        const id = modalMode === 'edit' ? currentItem.id : '';
        const entity = activeTab.slice(0, -1);

        try {
            
            let dataToSend = { ...currentItem };

           
            if (activeTab === 'users' && dataToSend.role !== 'student') {
                delete dataToSend.student_id;
            }

            if (modalMode === 'add') {
                await axios.post(endpoint, dataToSend);
                toast.success(`${entity.charAt(0).toUpperCase() + entity.slice(1)} added successfully!`);
            } else {
                
                const updateData = { ...dataToSend };
                if (activeTab === 'users' && !updateData.password) {
                    delete updateData.password;
                }
                await axios.put(`${endpoint}/${id}`, updateData);
                toast.success(`${entity.charAt(0).toUpperCase() + entity.slice(1)} updated successfully!`);
            }
            fetchData();
            closeModal();
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Could not save data';
            console.error('Failed to save data:', errorMessage);
            toast.error(`Error: ${errorMessage}`);
        }
    };

   
    const handleDelete = async (type, id) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
        try {
            await axios.delete(`/admin/${type}s/${id}`);
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`);
            fetchData();
        } catch (error) {
            console.error(`Failed to delete ${type}:`, error);
            toast.error(`Failed to delete ${type}.`);
        }
    };

    
    const renderUserForm = () => (
        <form onSubmit={handleSubmit} className="modal-form">
            <input name="name" value={currentItem?.name || ''} onChange={handleInputChange} placeholder="Name" required />
            <input name="email" type="email" value={currentItem?.email || ''} onChange={handleInputChange} placeholder="Email" required />
            <input name="password" type="password" onChange={handleInputChange} placeholder={modalMode === 'edit' ? "New Password (optional)" : "Password"} required={modalMode === 'add'} />
            <select name="role" value={currentItem?.role || 'student'} onChange={handleInputChange}>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="admin">Admin</option>
            </select>
            
            
            {currentItem?.role === 'student' && (
                <input
                    name="student_id"
                    value={currentItem?.student_id || ''}
                    onChange={handleInputChange}
                    placeholder="Student ID"
                    required
                />
            )}

            <button type="submit">Save User</button>
        </form>
    );

    const renderCourseForm = () => (
        <form onSubmit={handleSubmit} className="modal-form">
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
                            <h3>All Users ({users.length})</h3>
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
                            <h3>All Courses ({courses.length})</h3>
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
                        <h3>All Reviews ({reviews.length})</h3>
                        {Object.keys(reviewsByCourse).length > 0 ? (
                            Object.entries(reviewsByCourse).map(([title, courseReviews]) => (
                                <div key={title} className="course-review-group">
                                    <h4>{title} ({courseReviews.length} reviews)</h4>
                                    <ul>
                                        {courseReviews.map(review => (
                                            <li key={review.id}>
                                                <p>"{review.text}" - <em>by {review.student_name}</em></p>
                                                <span className={`sentiment-pill sentiment-${review.sentiment}`}>{review.sentiment}</span>
                                                <button className="btn-delete-review" onClick={() => handleDelete('review', review.id)}>Delete</button>
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
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
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
