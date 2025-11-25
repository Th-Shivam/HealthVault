import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ViewRecord = () => {
    const [records, setRecords] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [grantId, setGrantId] = useState(null);
    const [doctorEmail, setDoctorEmail] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecords = async () => {
            const token = localStorage.getItem('doctorToken');

            if (!token) {
                toast.error('Access denied. Please verify your credentials.');
                navigate('/doctor-portal');
                return;
            }

            try {
                const response = await fetch('/api/get-records', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch records');
                }

                setRecords(data.records || []);
                setGrantId(data.grant_id);
                setDoctorEmail(data.doctor_email);
                if (data.records && data.records.length > 0) {
                    setSelectedRecord(data.records[0]);
                }
            } catch (error) {
                console.error('Error fetching records:', error);
                toast.error(error.message || 'Failed to load records');
                // Clear invalid token
                localStorage.removeItem('doctorToken');
                setTimeout(() => navigate('/doctor-portal'), 2000);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, [navigate]);

    // Log access when a record is selected
    useEffect(() => {
        const logAccess = async () => {
            if (!selectedRecord || !grantId) return;

            try {
                await fetch('/api/log-access', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        grant_id: grantId,
                        doctor_id: doctorEmail,
                        record_id: selectedRecord.id
                    })
                });
                console.log('logged');
            } catch (error) {
                console.error('Error logging access:', error);
            }
        };

        logAccess();
    }, [selectedRecord, grantId, doctorEmail]);

    const handleLogout = () => {
        localStorage.removeItem('doctorToken');
        toast.success('Logged out successfully');
        navigate('/doctor-portal');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-gray-500">Loading records...</div>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Records Available</h2>
                <p className="text-gray-600 mb-6">You don't have access to any records at this time.</p>
                <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Back to Portal
                </button>
            </div>
        );
    }

    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'Unknown date';
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 py-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {records.length} record{records.length !== 1 ? 's' : ''} available
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Records List */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">Available Records</h3>
                        </div>
                        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                            {records.map((record) => (
                                <button
                                    key={record.id}
                                    onClick={() => setSelectedRecord(record)}
                                    className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors ${selectedRecord?.id === record.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                                        }`}
                                >
                                    <h4 className="text-sm font-medium text-gray-900">{record.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(record.uploaded_at)}
                                    </p>
                                    {record.description && (
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{record.description}</p>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Record Viewer */}
                {selectedRecord && (
                    <div className="lg:col-span-2 space-y-4">
                        {/* Record Details */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {selectedRecord.title}
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                    Uploaded on {formatDate(selectedRecord.uploaded_at)}
                                </p>
                                {selectedRecord.description && (
                                    <p className="mt-2 text-sm text-gray-700">
                                        {selectedRecord.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* PDF Viewer */}
                        <div className="bg-white shadow sm:rounded-lg overflow-hidden h-[600px]">
                            <iframe
                                src={selectedRecord.file_url}
                                className="w-full h-full border-0"
                                title={`PDF Viewer - ${selectedRecord.title}`}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong.</h2>
                    <p className="text-gray-600 mb-4">Please try refreshing the page.</p>
                    <pre className="text-xs text-left bg-gray-100 p-4 rounded overflow-auto max-w-2xl mx-auto">
                        {this.state.error?.toString()}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

const ViewRecordWithBoundary = () => (
    <ErrorBoundary>
        <ViewRecord />
    </ErrorBoundary>
);

export default ViewRecordWithBoundary;
