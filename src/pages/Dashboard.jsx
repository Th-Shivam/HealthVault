import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
            } else {
                setUser(user);
            }
            setLoading(false);
        };

        getUser();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
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

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    to="/upload-record"
                    className="flex items-center justify-center p-6 bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors group"
                >
                    <div className="text-center">
                        <div className="text-white text-lg font-semibold group-hover:scale-105 transition-transform">
                            Upload Medical Record
                        </div>
                        <p className="text-indigo-100 text-sm mt-1">
                            Add new documents to your vault
                        </p>
                    </div>
                </Link>

                <Link
                    to="/share-record"
                    className="flex items-center justify-center p-6 bg-white border-2 border-indigo-600 rounded-lg shadow-lg hover:bg-indigo-50 transition-colors group"
                >
                    <div className="text-center">
                        <div className="text-indigo-600 text-lg font-semibold group-hover:scale-105 transition-transform">
                            Share Record with Doctor
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                            Grant temporary access to providers
                        </p>
                    </div>
                </Link>
            </div>

            {/* Records List Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Uploaded Records
                    </h3>
                </div>
                <div className="p-6">
                    {/* Empty State */}
                    <div className="text-center py-12">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by uploading your first medical record.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/upload-record"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Upload Record
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
