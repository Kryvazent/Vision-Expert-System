import { CheckCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useState } from "react";

function DigitalSignature() {

    const [isDrawing, setIsDrawing] = useState(false);
    const [signatureData, setSignatureData] = useState('');

    const handleCanvasMouseDown = (e) => {
        setIsDrawing(true);
        const canvas = e.currentTarget;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const rect = canvas.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        }
    };

    const handleCanvasMouseMove = (e) => {
        if (!isDrawing) return;
        const canvas = e.currentTarget;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.stroke();
        }
    };

    const handleCanvasMouseUp = (e) => {
        setIsDrawing(false);
        const canvas = e.currentTarget;
        setSignatureData(canvas.toDataURL());
    };

    const handleCanvasTouchStart = (e) => {
        e.preventDefault();
        setIsDrawing(true);
        const canvas = e.currentTarget;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            ctx.beginPath();
            ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
        }
    };

    const handleCanvasTouchMove = (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const canvas = e.currentTarget;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
            ctx.stroke();
        }
    };

    const handleCanvasTouchEnd = (e) => {
        e.preventDefault();
        setIsDrawing(false);
        const canvas = e.currentTarget;
        setSignatureData(canvas.toDataURL());
    };

    const clearSignature = () => {
        const canvas = document.getElementById('signatureCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setSignatureData('');
            }
        }
    };

    return (
        <>

            <div>
                <div className="mb-2 font-medium">Sign below:</div>
                <canvas
                    id="signatureCanvas"
                    width={600}
                    height={200}
                    className="border-2 border-gray-300 rounded-lg cursor-crosshair bg-white"
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={() => setIsDrawing(false)}
                    onTouchStart={handleCanvasTouchStart}
                    onTouchMove={handleCanvasTouchMove}
                    onTouchEnd={handleCanvasTouchEnd}
                />
                <div className="mt-2">
                    <Button onClick={clearSignature}>Clear Signature</Button>
                    {signatureData && (
                        <span className="ml-4 text-green-600">
                            <CheckCircleOutlined /> Signature captured
                        </span>
                    )}
                </div>
            </div>

        </>
    )
}

export default DigitalSignature;