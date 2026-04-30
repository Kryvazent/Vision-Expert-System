import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { useState } from "react";

function Fingerprint() {

    const [fingerprintCaptured, setFingerprintCaptured] = useState(false);

    const captureFingerprint = () => {
        // Simulate fingerprint capture
        setTimeout(() => {
            setFingerprintCaptured(true);
            message.success('Fingerprint captured successfully!');
        }, 1500);
    };

    return (
        <>

            <div className="text-center">
                <div className="inline-block p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    {!fingerprintCaptured ? (
                        <>
                            <div className="mb-4">
                                <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#d1d5db" strokeWidth="2" />
                                    <path d="M 60,10 C 32.4,10 10,32.4 10,60 C 10,87.6 32.4,110 60,110" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
                                    <circle cx="60" cy="60" r="40" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
                                    <circle cx="60" cy="60" r="30" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
                                    <circle cx="60" cy="60" r="20" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <Button type="primary" size="large" onClick={captureFingerprint}>
                                Capture Fingerprint
                            </Button>
                            <div className="mt-2 text-gray-500 text-sm">
                                Place finger on scanner
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-4">
                                <CheckCircleOutlined style={{ fontSize: 80, color: '#10b981' }} />
                            </div>
                            <div className="text-lg font-semibold text-green-600">
                                Fingerprint Captured Successfully
                            </div>
                            <Button className="mt-4" onClick={() => setFingerprintCaptured(false)}>
                                Recapture
                            </Button>
                        </>
                    )}
                </div>
            </div>

        </>
    )
}

export default Fingerprint;