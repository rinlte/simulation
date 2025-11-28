import React, { useState } from 'react';
import { Mountain, Thermometer, Wind } from 'lucide-react';

export default function AltitudeVisualization() {
  const [altitude, setAltitude] = useState(0);
  
  // Calculate oxygen level (100% at sea level, ~33% at Everest peak)
  const oxygenLevel = Math.max(33, 100 - (altitude / 8849) * 67);
  
  // Calculate temperature (15°C at sea level, decreasing ~6.5°C per 1000m)
  const temperature = 15 - (altitude / 1000) * 6.5;
  
  // Character position (0 to 85% to leave room at top)
  const characterPosition = (altitude / 8849) * 75;
  
  // Get zone info
  const getZone = () => {
    if (altitude < 2400) return { name: "Normal", color: "from-green-500 to-green-600" };
    if (altitude < 3700) return { name: "Moderate", color: "from-yellow-500 to-yellow-600" };
    if (altitude < 5500) return { name: "High", color: "from-orange-500 to-orange-600" };
    if (altitude < 8000) return { name: "Very High", color: "from-red-500 to-red-600" };
    return { name: "Death Zone", color: "from-purple-500 to-purple-600" };
  };
  
  const zone = getZone();
  
  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-semibold">Altitude Explorer</h1>
        <p className="text-sm text-gray-400 mt-1">Ground to Mt. Everest Peak</p>
      </div>
      
      {/* Main visualization area */}
      <div className="flex-1 px-6 pb-4 flex flex-col">
        <div className="flex-1 bg-zinc-900 rounded-3xl overflow-hidden relative min-h-[400px]">
          {/* Gradient background based on altitude */}
          <div 
            className="absolute inset-0 transition-all duration-700 ease-out"
            style={{
              background: `linear-gradient(to bottom, 
                rgba(15, 23, 42, ${0.3 + (altitude / 8849) * 0.7}), 
                rgba(30, 41, 59, ${0.2 + (altitude / 8849) * 0.5}))`
            }}
          />
          
          {/* Altitude scale on the right */}
          <div className="absolute right-4 top-12 bottom-16 w-16 flex flex-col justify-between text-xs text-gray-500 font-medium z-10">
            <div className="text-right">8849m</div>
            <div className="text-right">7000m</div>
            <div className="text-right">5500m</div>
            <div className="text-right">4000m</div>
            <div className="text-right">2400m</div>
            <div className="text-right">0m</div>
          </div>
          
          {/* Vertical line indicator */}
          <div className="absolute right-20 top-12 bottom-16 w-0.5 bg-gray-800 z-10" />
          
          {/* Mountain path line */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-t from-gray-600 via-gray-700 to-transparent transition-all duration-700 z-10"
            style={{ height: `${characterPosition}%`, bottom: '64px' }}
          />
          
          {/* Character (climber) - positioned to move along the path */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 transition-all duration-700 ease-out z-30"
            style={{ bottom: `${64 + (characterPosition / 75) * (100 - 80 - 16)}%` }}
          >
            <div className="relative animate-bounce-subtle">
              {/* Simple climber figure */}
              <div className="w-12 h-16 relative">
                {/* Head */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full border-2 border-orange-600 shadow-lg" />
                {/* Body */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg" />
                {/* Backpack */}
                <div className="absolute top-8 left-1/2 transform translate-x-1 w-3 h-5 bg-gradient-to-br from-gray-700 to-gray-800 rounded shadow-lg" />
              </div>
            </div>
          </div>
          
          {/* Current altitude display - stays at top */}
          <div className="absolute top-6 left-6 z-20">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/20 shadow-xl">
              <div className="text-xs text-gray-400">Current Altitude</div>
              <div className="text-2xl font-semibold">{altitude.toFixed(0)}m</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {/* Oxygen */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Wind className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="text-xs text-gray-400 mb-1">Oxygen</div>
            <div className="text-xl font-semibold">{oxygenLevel.toFixed(0)}%</div>
            <div className="mt-2 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-full transition-all duration-700 ease-out"
                style={{ width: `${oxygenLevel}%` }}
              />
            </div>
          </div>
          
          {/* Temperature */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Thermometer className="w-4 h-4 text-orange-400" />
              </div>
            </div>
            <div className="text-xs text-gray-400 mb-1">Temperature</div>
            <div className="text-xl font-semibold">{temperature.toFixed(1)}°C</div>
            <div className="text-xs text-gray-500 mt-1">
              {(temperature * 9/5 + 32).toFixed(0)}°F
            </div>
          </div>
          
          {/* Zone */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Mountain className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <div className="text-xs text-gray-400 mb-1">Zone</div>
            <div className="text-lg font-semibold">{zone.name}</div>
            <div className={`mt-2 bg-gradient-to-r ${zone.color} h-1.5 rounded-full transition-all duration-700`} />
          </div>
        </div>
      </div>
      
      {/* Slider */}
      <div className="px-6 pb-6">
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Adjust Altitude</span>
            <span className="text-xs text-gray-500">{altitude.toFixed(0)}m</span>
          </div>
          <input
            type="range"
            min="0"
            max="8849"
            value={altitude}
            onChange={(e) => setAltitude(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer slider-thumb"
            style={{
              backgroundImage: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${(altitude/8849)*100}%, rgb(39, 39, 42) ${(altitude/8849)*100}%, rgb(39, 39, 42) 100%)`
            }}
          />
        </div>
      </div>
      
      {/* Info card */}
      <div className="px-6 pb-8">
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <div className="text-xs font-medium text-gray-400 mb-2">Effects at this altitude</div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {altitude < 2400 && "Normal conditions. No altitude effects. Safe for extended activity."}
            {altitude >= 2400 && altitude < 3700 && "Mild effects may occur. Some people experience shortness of breath during exertion."}
            {altitude >= 3700 && altitude < 5500 && "Altitude sickness possible. Reduced physical performance and breathing difficulty common."}
            {altitude >= 5500 && altitude < 8000 && "Severe altitude effects. Significant breathing difficulty and high risk of altitude sickness."}
            {altitude >= 8000 && "Death Zone: Oxygen levels too low to sustain human life. Supplemental oxygen required for survival."}
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(to bottom, rgb(96, 165, 250), rgb(59, 130, 246));
          cursor: pointer;
          border: 3px solid rgb(0, 0, 0);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
        }
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(to bottom, rgb(96, 165, 250), rgb(59, 130, 246));
          cursor: pointer;
          border: 3px solid rgb(0, 0, 0);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
