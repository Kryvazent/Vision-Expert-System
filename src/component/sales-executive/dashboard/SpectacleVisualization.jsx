export const SpectacleVisualization = ({ prescription }) => {
    
  // Helper function to create degree markings around bottom semi-circle
  const createDegreeMarkings = (centerX, centerY, radius) => {
    const markings = [];
    // Degrees from 0 to 180 in steps of 10
    const steps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180];
    
    for (let i = 0; i < steps.length; i++) {
      const angle = steps[i];
      // Start from bottom-left (180°) going to bottom-right (0°)
      const radian = ((180 - angle) * Math.PI) / 180;
      
      // Inner point (on the lens)
      const x1 = centerX + radius * Math.cos(radian);
      const y1 = centerY + radius * Math.sin(radian);
      
      // Outer point (tick mark)
      const tickLength = angle % 10 === 0 ? 15 : 10;
      const x2 = centerX + (radius + tickLength) * Math.cos(radian);
      const y2 = centerY + (radius + tickLength) * Math.sin(radian);
      
      // Text position
      const textX = centerX + (radius + 25) * Math.cos(radian);
      const textY = centerY + (radius + 25) * Math.sin(radian);
      
      markings.push(
        <g key={`mark-${angle}`}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeWidth="2" />
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontWeight="600"
            fill="#000"
          >
            {angle}
          </text>
        </g>
      );
    }
    return markings;
  };

  return (
    <div className="py-4 px-6 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-4xl font-bold mb-1" style={{ letterSpacing: '2px' }}>Vision Expert</h1>
        <p className="text-sm mb-2">Hot Line: 0113 658 659</p>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-sm font-semibold">Prescription No.</span>
          <span className="border border-gray-400 px-3 py-1 font-mono font-bold">{prescription.id}</span>
        </div>
        <p className="text-sm mb-1 font-medium">Optometrist: {prescription.optometrist}</p>
        <h2 className="text-xl font-bold">THE PRESCRIPTION</h2>
      </div>

      {/* Spectacle Diagrams */}
      <div className="flex justify-center items-center mb-6">
        <svg width="700" height="240" viewBox="0 0 700 240" className="max-w-full">
          {/* Left Lens (R - Right Eye) */}
          <g>
            <text x="180" y="30" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#000">R</text>
            <circle cx="180" cy="120" r="75" fill="#d1d5db" stroke="#000" strokeWidth="3" />
            {createDegreeMarkings(180, 120, 75)}
          </g>

          {/* Bridge - More realistic design */}
          <path 
            d="M 255 115 Q 270 110, 285 110 L 415 110 Q 430 110, 445 115" 
            stroke="#000" 
            strokeWidth="3" 
            fill="none"
          />
          <path 
            d="M 255 125 Q 270 130, 285 130 L 415 130 Q 430 130, 445 125" 
            stroke="#000" 
            strokeWidth="3" 
            fill="none"
          />

          {/* Right Lens (L - Left Eye) */}
          <g>
            <text x="520" y="30" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#000">L</text>
            <circle cx="520" cy="120" r="75" fill="#d1d5db" stroke="#000" strokeWidth="3" />
            {createDegreeMarkings(520, 120, 75)}
          </g>
        </svg>
      </div>

      {/* Warning Text */}
      <div className="text-center text-xs mb-4 px-4">
        <p className="font-semibold">NOT TO BE DESTROYED - TO BE BROUGHT UP AT NEXT EXAMINATION FOR GLASSES</p>
      </div>

      {/* Prescription Table */}
      <div className="mb-6">
        <table className="w-full border-2 border-black" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr className="border-2 border-black">
              <th className="border-2 border-black p-2 w-32 text-xs bg-gray-200"></th>
              <th className="border-2 border-black p-2 text-xs font-bold bg-gray-200">SPH.</th>
              <th className="border-2 border-black p-2 text-xs font-bold bg-gray-200">CYL.</th>
              <th className="border-2 border-black p-2 text-xs font-bold bg-gray-200">AXIS</th>
              <th className="border-2 border-black p-2 text-xs font-bold bg-gray-200">SPH.</th>
              <th className="border-2 border-black p-2 text-xs font-bold bg-gray-200">CYL.</th>
              <th className="border-2 border-black p-2 text-xs font-bold bg-gray-200">AXIS</th>
            </tr>
          </thead>
          <tbody>
            {/* Distance Row */}
            <tr className="border-2 border-black h-16">
              <td className="border-2 border-black p-2 text-xs font-semibold bg-gray-200 align-middle text-center">
                DISTANCE
              </td>
              <td className="border-2 border-black p-2 text-center font-bold text-base bg-gray-100">{prescription.rightEye.sphere}</td>
              <td className="border-2 border-black p-2 text-center font-bold text-base bg-gray-100">{prescription.rightEye.cylinder}</td>
              <td className="border-2 border-black p-2 text-center font-bold text-base bg-gray-100">{prescription.rightEye.axis}</td>
              <td className="border-2 border-black p-2 text-center font-bold text-base bg-gray-100">{prescription.leftEye.sphere}</td>
              <td className="border-2 border-black p-2 text-center font-bold text-base bg-gray-100">{prescription.leftEye.cylinder}</td>
              <td className="border-2 border-black p-2 text-center font-bold text-base bg-gray-100">{prescription.leftEye.axis}</td>
            </tr>
            {/* Reading Row */}
            <tr className="border-2 border-black h-16">
              <td className="border-2 border-black p-2 text-xs font-semibold bg-gray-200 align-middle text-center">
                READING
              </td>
              <td className="border-2 border-black p-2 text-center font-bold text-base bg-gray-100">{prescription.rightEye.add !== '0.00' ? prescription.rightEye.add : ''}</td>
              <td className="border-2 border-black p-2 bg-gray-100"></td>
              <td className="border-2 border-black p-2 bg-gray-100"></td>
              <td className="border-2 border-black p-2 text-center font-bold text-base bg-gray-100">{prescription.leftEye.add !== '0.00' ? prescription.leftEye.add : ''}</td>
              <td className="border-2 border-black p-2 bg-gray-100"></td>
              <td className="border-2 border-black p-2 bg-gray-100"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PD */}
      <div className="mb-4 text-center">
        <span className="text-sm font-semibold">PD (Pupillary Distance): </span>
        <span className="text-lg font-bold">{prescription.pd} mm</span>
      </div>

      {/* Remarks Section */}
      <div className="mb-6">
        <p className="text-sm font-semibold mb-2">REMARKS</p>
        <div className="border-b border-dotted border-gray-600 mb-2 pb-2 min-h-7.5">
          {prescription.notes}
        </div>
        <div className="border-b border-dotted border-gray-600 mb-2 pb-2 min-h-7.5"></div>
        <div className="border-b border-dotted border-gray-600 mb-2 pb-2 min-h-7.5"></div>
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-2 gap-8 mb-4">
        <div>
          <div className="mb-3">
            <span className="text-sm font-semibold">Name</span>
            <div className="border-b border-dotted border-gray-600 mt-1 pb-1 font-medium">{prescription.customerName}</div>
          </div>
          <div className="mb-3">
            <span className="text-sm font-semibold">Age</span>
            <div className="border-b border-dotted border-gray-600 mt-1 pb-1"></div>
          </div>
          <div>
            <span className="text-sm font-semibold">Date</span>
            <div className="border-b border-dotted border-gray-600 mt-1 pb-1">{prescription.date}</div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full text-center p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-semibold text-blue-900 mb-1">System Generated Prescription</p>
            <p className="text-xs text-blue-700">This prescription is electronically generated and validated by Vision Expert System. No physical signature required.</p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-xs text-gray-600 mt-6 pt-4 border-t border-gray-300">
        <p>Generated by Vision Expert System | Optometrist: {prescription.optometrist}</p>
      </div>
    </div>
  );
};