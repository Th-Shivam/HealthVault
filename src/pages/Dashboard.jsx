import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);
    const [grants, setGrants] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
            } else {
                setUser(user);
                // Fetch records for this user
                fetchRecords(user.id);
                fetchGrants(user.id);
            }
            setLoading(false);
        };

        getUser();
    }, [navigate]);

    const fetchRecords = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('records')
                .select('*')
                .eq('patient_id', userId)
                .order('uploaded_at', { ascending: false });

            if (error) {
                console.error('Error fetching records:', error);
            } else {
                setRecords(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchGrants = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('grants')
                .select('*')
                .eq('patient_id', userId)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching grants:', error);
            } else {
                setGrants(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleRevokeAccess = async (grantId) => {
        try {
            const response = await fetch('/api/revoke-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_id: grantId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to revoke access');
            }

            toast.success('Access revoked successfully');
            // Remove the grant from the UI
            setGrants(grants.filter(g => g.id !== grantId));
        } catch (error) {
            console.error('Error revoking access:', error);
            toast.error(error.message || 'Failed to revoke access');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome, <span className="text-indigo-600">{user?.email}</span>
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Manage your health records securely.
                    </p>
                </div>

                {/* Actions Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Upload Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <h3 className="ml-3 text-lg font-medium text-gray-900">Upload Record</h3>
                        </div>
                        <p className="text-gray-500 mb-4">
                            Securely upload and store your medical reports, prescriptions, and test results.
                        </p>
                        <Link
                            to="/upload-record"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Upload Record
                        </Link>
                    </div>

                    {/* Share Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </div>
                            <h3 className="ml-3 text-lg font-medium text-gray-900">Share with Doctor</h3>
                        </div>
                        <p className="text-gray-500 mb-4">
                            Grant temporary access to your records via OTP or QR code.
                        </p>
                        <Link
                            to="/share-record"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Share Record
                        </Link>
                    </div>
                </div>

                {/* Recent Records Section */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Recent Records
                        </h3>
                    </div>
                    <div className="p-6">
                        {records.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No records</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by creating a new record.</p>
                                <div className="mt-6">
                                    <Link
                                        to="/upload-record"
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Upload Record
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            /* Records Grid */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {records.map((record) => (
                                    <div
                                        key={record.id}
                                        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                    >
                                        <div className="p-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                {record.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 mb-4">
                                                Uploaded on {new Date(record.uploaded_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            {record.description && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                    {record.description}
                                                </p>
                                            )}
                                            <Link
                                                to="/share-record"
                                                state={{ recordId: record.id }}
                                                className="inline-flex items-center justify-center w-full px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Share Record
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Grants Section */}
                {grants.length > 0 && (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                                Active Access Grants
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Doctors who currently have access to your records
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {grants.map((grant) => (
                                    <div
                                        key={grant.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {grant.doctor_email || 'QR Code Access'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Granted on {new Date(grant.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {Array.isArray(grant.records) ? `${grant.records.length} record(s) shared` : 'Records shared'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRevokeAccess(grant.id)}
                                            className="ml-4 inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Revoke Access
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
