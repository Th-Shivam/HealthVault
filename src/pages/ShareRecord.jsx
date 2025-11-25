import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import QRCode from "react-qr-code";

const ShareRecord = () => {
    const [selectedRecord, setSelectedRecord] = useState('');
    const [doctorEmail, setDoctorEmail] = useState('');
    const [shareMethod, setShareMethod] = useState('otp'); // 'otp' or 'qr'
    const [generatedContent, setGeneratedContent] = useState(null);
    const [records, setRecords] = useState([]);
    const [patientId, setPatientId] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
            } else {
                setPatientId(user.id);
                fetchRecords(user.id);
            }
        };
        fetchUser();
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

    const handleGenerate = async () => {
        if (!selectedRecord) {
            toast.error('Please select a record to share');
            return;
        }
        if (!doctorEmail) {
            toast.error('Please enter the doctor\'s email');
            return;
        }

        setLoading(true);

        try {
            if (shareMethod === 'otp') {
                const response = await fetch('/api/generate-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        patient_id: patientId,
                        doctor_email: doctorEmail,
                        record_ids: [selectedRecord]
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to generate OTP');
                }

                setGeneratedContent({ type: 'otp', value: data.otp });
                toast.success('OTP generated successfully');
            } else {
                // QR code generation
                const response = await fetch('/api/generate-qr', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        patient_id: patientId,
                        record_ids: [selectedRecord]
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to generate QR code');
                }

                setGeneratedContent({ type: 'qr', value: data.qr_token });
                toast.success('QR Code generated successfully');
            }
        } catch (error) {
            console.error('Error generating:', error);
            toast.error(error.message || 'Failed to generate');
        } finally {
            setLoading(false);
        }
    };

    const copyOTP = () => {
        if (generatedContent?.type === 'otp') {
            navigator.clipboard.writeText(generatedContent.value.toString());
            toast.success('OTP copied to clipboard!');
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Share Record
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Securely share your medical records with healthcare providers.
                    </p>
                </div>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8 space-y-8">

                    {/* Record Selection */}
                    <div>
                        <label htmlFor="record" className="block text-sm font-medium leading-6 text-gray-900">
                            Select Record
                        </label>
                        <select
                            id="record"
                            name="record"
                            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={selectedRecord}
                            onChange={(e) => {
                                setSelectedRecord(e.target.value);
                                setGeneratedContent(null);
                            }}
                        >
                            <option value="">Select a record...</option>
                            {records.map((record) => (
                                <option key={record.id} value={record.id}>
                                    {record.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Doctor Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                            Doctor's Email
                        </label>
                        <div className="mt-2">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="doctor@hospital.com"
                                value={doctorEmail}
                                onChange={(e) => {
                                    setDoctorEmail(e.target.value);
                                    setGeneratedContent(null);
                                }}
                            />
                        </div>
                    </div>

                    {/* Share Method Toggle */}
                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                            Share Method
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShareMethod('otp');
                                    setGeneratedContent(null);
                                }}
                                className={`flex items - center justify - center px - 4 py - 3 border rounded - lg text - sm font - medium transition - colors ${shareMethod === 'otp'
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    } `}
                            >
                                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Share via OTP
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShareMethod('qr');
                                    setGeneratedContent(null);
                                }}
                                className={`flex items - center justify - center px - 4 py - 3 border rounded - lg text - sm font - medium transition - colors ${shareMethod === 'qr'
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    } `}
                            >
                                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h-4v-2h4v-4H6v4H4v-4h2v-2h4V9H6V7h4v2h2v2h2v2h2v2h2v-2h-2V9h2V7h-4V5H5v6h6v6h2v4H9v-4H5v-2h6v-2h2v-2h2v2h2z" />
                                </svg>
                                Share via QR
                            </button>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="pt-4">
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Generating...' : (shareMethod === 'otp' ? 'Generate OTP' : 'Generate QR Code')}
                        </button>
                    </div>

                    {/* Result Area */}
                    {generatedContent && (
                        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center animate-fade-in">
                            {generatedContent.type === 'otp' ? (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">One-Time Password</h3>
                                    <div className="text-4xl font-bold text-gray-900 tracking-widest">
                                        {generatedContent.value}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Share this code with your doctor. It expires in 15 minutes.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={copyOTP}
                                        className="mt-4 inline-flex items-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy OTP
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-4">Scan QR Code</h3>
                                    <div className="mx-auto w-64 h-64 bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
                                        <QRCode
                                            value={generatedContent.value}
                                            size={224}
                                            level="H"
                                        />
                                    </div>
                                    <p className="mt-4 text-xs text-gray-500">
                                        Ask your doctor to scan this code to access the record. It expires in 15 minutes.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareRecord;
