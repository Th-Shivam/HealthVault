import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';

const DoctorPortal = () => {
    const [activeTab, setActiveTab] = useState('otp'); // 'otp' or 'qr'
    const [otp, setOtp] = useState('');
    const [doctorEmail, setDoctorEmail] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const navigate = useNavigate();
    const html5QrCodeRef = useRef(null);
    const scannerElementId = 'qr-reader';

    // Initialize QR Scanner
    useEffect(() => {
        if (activeTab === 'qr' && !isScanning) {
            startScanner();
        }

        return () => {
            stopScanner();
        };
    }, [activeTab]);

    const startScanner = async () => {
        if (html5QrCodeRef.current || isScanning) return;

        try {
            const html5QrCode = new Html5Qrcode(scannerElementId);
            html5QrCodeRef.current = html5QrCode;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            };

            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                onScanSuccess,
                onScanError
            );
            setIsScanning(true);
        } catch (err) {
            console.error('Failed to start scanner:', err);
            toast.error('Failed to access camera. Please check permissions.');
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current && isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
                html5QrCodeRef.current = null;
                setIsScanning(false);
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
    };

    const onScanSuccess = (decodedText) => {
        if (scanResult) return; // Prevent multiple scans
        handleQrVerification(decodedText);
    };

    const onScanError = (errorMessage) => {
        // Normal scanning errors, can be ignored
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }
        if (!doctorEmail) {
            toast.error('Please enter your email address');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    doctor_email: doctorEmail,
                    otp: otp
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid OTP');
            }

            // Save token to localStorage
            localStorage.setItem('doctorToken', data.token);
            toast.success('Access Granted! Redirecting to records...');

            // Redirect to view-records
            setTimeout(() => {
                navigate('/doctor/view');
            }, 1000);
        } catch (error) {
            console.error('Verification error:', error);
            toast.error(error.message || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleQrVerification = async (qr_token) => {
        setScanResult(qr_token);
        toast.success('QR Code scanned! Verifying...');
        stopScanner();

        setLoading(true);

        try {
            const response = await fetch('/api/verify-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    qr_token: qr_token
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid QR code');
            }

            // Save token to localStorage
            localStorage.setItem('doctorToken', data.token);
            toast.success('Access Granted! Redirecting to records...');

            // Redirect to view-records
            setTimeout(() => {
                navigate('/doctor/view');
            }, 1000);
        } catch (error) {
            console.error('QR Verification error:', error);
            toast.error(error.message || 'Failed to verify QR code');
            setScanResult(null);
            // Restart scanner
            setTimeout(() => startScanner(), 1000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Doctor Portal
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Access patient records via OTP or QR Code
                </p>
            </div>

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex - 1 py - 4 text - sm font - medium text - center transition - colors ${activeTab === 'otp'
                            ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            } `}
                        onClick={() => setActiveTab('otp')}
                    >
                        Enter OTP
                    </button>
                    <button
                        className={`flex - 1 py - 4 text - sm font - medium text - center transition - colors ${activeTab === 'qr'
                            ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            } `}
                        onClick={() => setActiveTab('qr')}
                    >
                        Scan QR Code
                    </button>
                </div>

                <div className="p-8 min-h-[400px] flex items-center justify-center">
                    {activeTab === 'otp' ? (
                        <div className="w-full max-w-sm">
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div>
                                    <label htmlFor="doctorEmail" className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="doctorEmail"
                                        name="doctorEmail"
                                        className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        placeholder="doctor@hospital.com"
                                        value={doctorEmail}
                                        onChange={(e) => setDoctorEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 text-center mb-4">
                                        Enter the 6-digit OTP provided by the patient
                                    </label>
                                    <input
                                        type="text"
                                        id="otp"
                                        name="otp"
                                        maxLength={6}
                                        className="block w-full text-center text-2xl tracking-[0.5em] rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Verifying...' : 'Verify Access'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="w-full max-w-sm text-center">
                            {!scanResult ? (
                                <div className="space-y-4">
                                    <div id={scannerElementId} className="relative overflow-hidden rounded-lg bg-gray-900" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
                                    <p className="text-sm text-gray-500">
                                        📷 Position the QR code within the camera view
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                                        <p className="font-medium">QR Code Scanned!</p>
                                        <p className="text-xs mt-1 break-all">{scanResult}</p>
                                    </div>
                                    <button
                                        onClick={() => setScanResult(null)}
                                        className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                                    >
                                        Scan Another
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorPortal;
