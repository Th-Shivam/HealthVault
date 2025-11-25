import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiPost } from '../lib/api';

const ViewRecord = () => {
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [records, setRecords] = useState([]);
    const [grantInfo, setGrantInfo] = useState({ grant_id: null, doctor_email: null });
    const [selectedRecord, setSelectedRecord] = useState(null); // For modal
    const [viewingUrl, setViewingUrl] = useState(null); // Signed URL for viewing

    // Helper: Get signed URL - backend now provides this directly
    const getSignedUrl = async (record) => {
        // Backend now always returns signed_url field
        return record.signed_url || record.file_url;
    };

    // Fetch Records
    const fetchRecords = useCallback(async (retryCount = 0) => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('doctorToken');
        if (!token) {
            toast.error('Please verify OTP or scan QR first');
            navigate('/doctor-portal');
            return;
        }

        console.debug('Fetching records... Token present.');

        try {
            // Using apiPost helper which handles auth headers
            // Note: Backend supports POST now
            const data = await apiPost('/api/get-records', {});

            console.debug('API get-records response:', data);
            console.debug('Records received:', data.records?.length || 0);

            if (data.success) {
                setRecords(data.records || []);
                setGrantInfo({
                    grant_id: data.grant_id,
                    doctor_email: data.doctor_email
                });
            } else {
                throw new Error(data.error || 'Failed to fetch records');
            }

        } catch (err) {
            console.error('Fetch error:', err);

            // Exponential backoff for 5xx errors
            if (retryCount < 2 && err.message.includes('50')) {
                const delay = Math.pow(2, retryCount) * 1000;
                console.debug(`Retrying in ${delay}ms...`);
                setTimeout(() => fetchRecords(retryCount + 1), delay);
                return;
            }

            if (err.message.includes('401') || err.message.includes('403')) {
                localStorage.removeItem('doctorToken');
                toast.error('Session expired — verify again');
                navigate('/doctor-portal');
            } else {
                setError(err.message || 'Unable to fetch records');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    // Handle View Record
    const handleView = async (record) => {
        console.debug('Opening record:', record.id);

        // Log access
        if (grantInfo.grant_id) {
            apiPost('/api/log-access', {
                grant_id: grantInfo.grant_id,
                doctor_id: grantInfo.doctor_email,
                record_id: record.id
            }).catch(e => console.error('Log access error:', e));
        }

        const url = await getSignedUrl(record);
        if (url) {
            setViewingUrl(url);
            setSelectedRecord(record);
        }
    };

    // Handle Download
    const handleDownload = async (record) => {
        const url = await getSignedUrl(record);
        if (url) {
            window.open(url, '_blank');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('doctorToken');
        navigate('/doctor-portal');
        toast.success('Logged out');
    };

    // --- RENDER ---

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading records...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Records</h3>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={() => fetchRecords()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Retry
                    </button>
                    <div className="mt-4">
                        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
                            Back to Portal
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Breadcrumb */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-4">
                                <li>
                                    <Link to="/doctor-portal" className="text-gray-400 hover:text-gray-500">
                                        Doctor Portal
                                    </Link>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                        </svg>
                                        <span className="ml-4 text-sm font-medium text-gray-500">Records</span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                        <div className="flex items-center space-x-4">
                            {grantInfo.doctor_email && (
                                <span className="text-sm text-gray-500 hidden sm:block">
                                    Accessing as: {grantInfo.doctor_email}
                                </span>
                            )}
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {records.length === 0 ? (
                    // Empty State
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                        <img
                            src="/mnt/data/A_digital_vector_graphic_features_the_logo_and_wor.png"
                            alt="No records"
                            className="mx-auto h-48 w-auto opacity-50 mb-6"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/400x300?text=No+Records'; // Fallback
                            }}
                        />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No shared records available</h3>
                        <p className="mt-1 text-sm text-gray-500">The patient hasn't shared any records yet.</p>
                        <div className="mt-6">
                            <Link
                                to="/doctor-portal"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Scan Another Patient
                            </Link>
                        </div>
                    </div>
                ) : (
                    // Records Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {records.map((record) => (
                            <div key={record.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Read-only
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(record.uploaded_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 truncate" title={record.title}>
                                        {record.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2 h-10">
                                        {record.description || 'No description provided.'}
                                    </p>
                                    <div className="mt-5 flex space-x-3">
                                        <button
                                            onClick={() => handleView(record)}
                                            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            aria-label={`View ${record.title}`}
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDownload(record)}
                                            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            aria-label={`Download ${record.title}`}
                                        >
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* View Modal */}
            {selectedRecord && viewingUrl && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedRecord(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {selectedRecord.title}
                                    </h3>
                                    <button
                                        onClick={() => setSelectedRecord(null)}
                                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <span className="sr-only">Close</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="mt-2 h-[70vh] bg-gray-100 rounded flex items-center justify-center overflow-auto">
                                    {(selectedRecord.signed_url?.toLowerCase().endsWith('.pdf') ||
                                        selectedRecord.file_url?.toLowerCase().endsWith('.pdf') ||
                                        viewingUrl?.toLowerCase().includes('.pdf')) ? (
                                        <iframe
                                            src={viewingUrl}
                                            className="w-full h-full border-0"
                                            title="Document Viewer"
                                        />
                                    ) : (
                                        <img
                                            src={viewingUrl}
                                            alt={selectedRecord.title}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => handleDownload(selectedRecord)}
                                >
                                    Download
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setSelectedRecord(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewRecord;
