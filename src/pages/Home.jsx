import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="relative isolate pt-14">
            {/* Background Effects */}
            <div
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                aria-hidden="true"
            >
                <div
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                />
            </div>

            <div className="py-24 sm:py-32 lg:pb-40">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            HealthVault – Your Secure Digital Health Locker
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Store, manage and share medical records with full control. Secure, encrypted, and accessible whenever you need it.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                to="/signup"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Get Started
                            </Link>
                            <Link to="/doctor-portal" className="text-sm font-semibold leading-6 text-gray-900">
                                Doctor Portal <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Feature Cards */}
                    <div className="mt-16 flow-root sm:mt-24">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                            {/* Card 1 */}
                            <div className="relative flex flex-col gap-6 rounded-2xl bg-white/60 p-8 shadow-lg ring-1 ring-gray-900/5 backdrop-blur-sm hover:bg-white/80 transition-all">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold leading-8 text-gray-900">Encrypted Storage</h3>
                                    <p className="mt-2 text-base leading-7 text-gray-600">
                                        Your medical records are encrypted and stored securely. Only you have the key to access them.
                                    </p>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="relative flex flex-col gap-6 rounded-2xl bg-white/60 p-8 shadow-lg ring-1 ring-gray-900/5 backdrop-blur-sm hover:bg-white/80 transition-all">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold leading-8 text-gray-900">Share via OTP/QR</h3>
                                    <p className="mt-2 text-base leading-7 text-gray-600">
                                        Instantly share records with doctors using secure one-time passwords or QR codes.
                                    </p>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="relative flex flex-col gap-6 rounded-2xl bg-white/60 p-8 shadow-lg ring-1 ring-gray-900/5 backdrop-blur-sm hover:bg-white/80 transition-all">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold leading-8 text-gray-900">Full Access Control</h3>
                                    <p className="mt-2 text-base leading-7 text-gray-600">
                                        You decide who sees what. Revoke access to your records at any time with a single click.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Background Effect */}
            <div
                className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
                aria-hidden="true"
            >
                <div
                    className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                />
            </div>
        </div>
    );
};

export default Home;
