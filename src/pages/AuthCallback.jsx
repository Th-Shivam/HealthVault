import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the URL hash parameters
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const access_token = hashParams.get('access_token');
                const refresh_token = hashParams.get('refresh_token');
                const type = hashParams.get('type');

                if (access_token && refresh_token) {
                    // Set the session using the tokens
                    const { data, error } = await supabase.auth.setSession({
                        access_token,
                        refresh_token,
                    });

                    if (error) throw error;

                    if (data.session) {
                        toast.success('Email verified successfully! Welcome to HealthVault.');
                        navigate('/dashboard');
                    } else {
                        throw new Error('Failed to establish session');
                    }
                } else if (type === 'recovery') {
                    // Handle password recovery if needed
                    navigate('/reset-password');
                } else {
                    throw new Error('Invalid verification link');
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                setError(error.message);
                toast.error('Email verification failed. Please try again.');
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        handleAuthCallback();
    }, [navigate]);

    if (error) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
                    <div className="mb-4">
                        <svg
                            className="mx-auto h-12 w-12 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-500">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="mb-4">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email...</h2>
                <p className="text-gray-600">Please wait while we confirm your account.</p>
            </div>
        </div>
    );
};

export default AuthCallback;
