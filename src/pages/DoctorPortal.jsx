import { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import toast from 'react-hot-toast';

const DoctorPortal = () => {
    const [activeTab, setActiveTab] = useState('otp'); // 'otp' or 'qr'
    const [otp, setOtp] = useState('');
    const [scanResult, setScanResult] = useState(null);

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }
        // Simulate verification
        toast.success(`Verifying OTP: ${otp}`);
        setTimeout(() => {
            toast.success('Access Granted! Redirecting to record...');
        }, 1500);
    };

    const handleScan = (result, error) => {
        if (result) {
            setScanResult(result?.text);
            toast.success('QR Code scanned successfully!');
        }
        if (error) {
            // console.info(error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
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
                        className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'otp'
                                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        onClick={() => setActiveTab('otp')}
                    >
                        Enter OTP
                    </button>
                    <button
                        className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'qr'
                                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
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
                                    className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Verify Access
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="w-full max-w-sm text-center">
                            {!scanResult ? (
                                <div className="relative overflow-hidden rounded-lg bg-black aspect-square">
                                    <QrReader
                                        onResult={handleScan}
                                        constraints={{ facingMode: 'environment' }}
                                        className="w-full h-full"
                                        videoContainerStyle={{ paddingTop: '100%' }}
                                        videoStyle={{ objectFit: 'cover' }}
                                    />
                                    <div className="absolute inset-0 border-2 border-indigo-500 opacity-50 pointer-events-none"></div>
                                    <div className="absolute bottom-4 left-0 right-0 text-white text-xs bg-black/50 py-1">
                                        Align QR code within the frame
                                    </div>
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
