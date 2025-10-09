import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Info, ExternalLink, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

const EarthquakeMap = ({ 
  earthquakes = [], 
  title = "Earthquake Activity Map", 
  subtitle = "Recent Seismic Events",
  isExpanded = false,
  onToggle = () => {},
  headerClassName = "",
  contentClassName = ""
}) => {
  const [selectedEarthquake, setSelectedEarthquake] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!isExpanded) return;

    let leafletScript = null;
    let leafletCss = null;

    const initializeMap = () => {
      if (window.L && mapRef.current && !mapInstanceRef.current && earthquakes.length > 0) {
        const avgLat = earthquakes.reduce((sum, eq) => sum + parseFloat(eq.latitude), 0) / earthquakes.length;
        const avgLng = earthquakes.reduce((sum, eq) => sum + parseFloat(eq.longitude), 0) / earthquakes.length;
        
        const map = window.L.map(mapRef.current).setView([avgLat, avgLng], 8);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;

        earthquakes.forEach((eq) => {
          const mag = parseFloat(eq.magnitude);
          const lat = parseFloat(eq.latitude);
          const lng = parseFloat(eq.longitude);
          const depth = parseInt(eq.depth);
          const cleanLocation = eq.location.replace(/\n\s*/g, ' ').trim();
          
          const color = getMagnitudeColor(mag);
          const size = 20 + mag * 5;
          
          const icon = window.L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">${mag}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          const marker = window.L.marker([lat, lng], { icon }).addTo(map);

          marker.bindPopup(`
            <div style="font-family: sans-serif;">
              <strong style="font-size: 14px; color: #1f2937;">Magnitude ${mag}</strong><br/>
              <span style="color: #6b7280; font-size: 12px;">${eq.dateTime}</span><br/>
              <span style="color: #4b5563; font-size: 12px;">${cleanLocation}</span><br/>
              <span style="color: #6b7280; font-size: 11px;">Depth: ${depth} km</span><br/>
              ${eq.detailLink ? `<a href="${eq.detailLink}" target="_blank" style="color: #2563eb; font-size: 11px; text-decoration: underline;">View Details</a>` : ''}
            </div>
          `);

          marker.on('click', () => {
            setSelectedEarthquake(eq);
            const eqIndex = earthquakes.indexOf(eq);
            setExpandedItems(prev => new Set(prev).add(eqIndex));
          });
        });

        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }
    };

    if (!document.querySelector('link[href*="leaflet"]')) {
      leafletCss = document.createElement('link');
      leafletCss.rel = 'stylesheet';
      leafletCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(leafletCss);
    }

    if (!window.L) {
      leafletScript = document.createElement('script');
      leafletScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      leafletScript.async = true;
      leafletScript.onload = initializeMap;
      document.body.appendChild(leafletScript);
    } else {
      initializeMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isExpanded, earthquakes]);

  useEffect(() => {
    if (mapInstanceRef.current && isExpanded) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 300);
    }
  }, [isSidebarCollapsed, isExpanded]);

  const getMagnitudeColor = (mag) => {
    if (mag >= 3.0) return '#ef4444';
    if (mag >= 2.0) return '#f97316';
    if (mag >= 1.5) return '#eab308';
    return '#22c55e';
  };

  const handleEarthquakeClick = (eq, idx) => {
    setSelectedEarthquake(eq);
    if (mapInstanceRef.current) {
      const lat = parseFloat(eq.latitude);
      const lng = parseFloat(eq.longitude);
      mapInstanceRef.current.setView([lat, lng], 10);
    }
  };

  const toggleItemAccordion = (idx, e) => {
    e.stopPropagation();
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="w-full border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Accordion Header */}
      <div 
        onClick={onToggle}
        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${headerClassName}`}
      >
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{earthquakes.length} events</span>
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-gray-600" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-600" />
          )}
        </div>
      </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div className={`border-t ${contentClassName}`}>
          <div className="flex h-[600px] overflow-hidden relative">
            {/* Sidebar Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-r-lg p-2 z-[1001] hover:bg-gray-100 transition-colors"
              style={{ left: isSidebarCollapsed ? '0' : '320px' }}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-5 h-5 text-gray-600" /> : <ChevronLeft className="w-5 h-5 text-gray-600" />}
            </button>

            {/* Sidebar */}
            <div 
              className={`bg-gray-50 border-r overflow-y-auto transition-all duration-300 ${
                isSidebarCollapsed ? 'w-0 opacity-0' : 'w-80 opacity-100'
              }`}
            >
              <div className="p-4 bg-gray-100 border-b sticky top-0 z-10">
                <h3 className="text-lg font-semibold text-gray-800">Recent Earthquakes</h3>
                <p className="text-sm text-gray-600">{earthquakes.length} events recorded</p>
              </div>
              
              <div className="divide-y">
                {earthquakes.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No earthquake data available
                  </div>
                ) : (
                  earthquakes.map((eq, idx) => {
                    const mag = parseFloat(eq.magnitude);
                    const depth = parseInt(eq.depth);
                    const cleanLocation = eq.location.replace(/\n\s*/g, ' ').trim();
                    const isItemExpanded = expandedItems.has(idx);
                    
                    return (
                      <div
                        key={idx}
                        className={`transition-colors ${
                          selectedEarthquake === eq ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                      >
                        <div
                          onClick={() => handleEarthquakeClick(eq, idx)}
                          className="p-4 cursor-pointer hover:bg-blue-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="px-2 py-1 rounded text-white text-xs font-bold"
                                  style={{ backgroundColor: getMagnitudeColor(mag) }}
                                >
                                  M {mag}
                                </span>
                                <span className="text-xs text-gray-500">{eq.dateTime.split(' - ')[1]}</span>
                              </div>
                              <p className="text-sm text-gray-700 font-medium">{cleanLocation}</p>
                            </div>
                            <button
                              onClick={(e) => toggleItemAccordion(idx, e)}
                              className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {isItemExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          </div>
                        </div>

                        {isItemExpanded && (
                          <div className="px-4 pb-4 bg-white border-t">
                            <div className="space-y-2 pt-3">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-600 font-medium">Date & Time:</span>
                                <span className="text-gray-800">{eq.dateTime}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-600 font-medium">Depth:</span>
                                <span className="text-gray-800">{depth} km</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-600 font-medium">Coordinates:</span>
                                <span className="text-gray-800">{eq.latitude}, {eq.longitude}</span>
                              </div>
                              <div className="flex items-start gap-2 text-sm">
                                <span className="text-gray-600 font-medium">Location:</span>
                                <span className="text-gray-800 flex-1">{cleanLocation}</span>
                              </div>
                              {eq.detailLink && (
                                <a 
                                  href={eq.detailLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline mt-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  View Full Details
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative bg-gray-100">
              <div ref={mapRef} className="w-full h-full"></div>
              
              {/* Legend */}
              <div className="absolute bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 z-[1000]">
                <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Magnitude Scale
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-gray-700">&lt; 1.5</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-700">1.5 - 2.0</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    <span className="text-gray-700">2.0 - 3.0</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-gray-700">≥ 3.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarthquakeMap;
