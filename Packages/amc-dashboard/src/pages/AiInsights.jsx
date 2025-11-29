import React, { useState, useEffect } from "react";
import { 
  RefreshCw, 
  Loader2, 
  AlertTriangle, 
  Activity, 
  Maximize2, 
  Minimize2,
  BarChart3,
  Car,
  Lightbulb,
  Clock,
  Wind,
  MapPin,
  TrendingUp,
  Brain
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { analyzeCityData } from "../utils/aiModel";
import sampleData from "../data/sampleData";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Enhanced custom marker based on AI risk
const createRiskIcon = (color) => {
  const iconSvg = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 13 16 26 16 26s16-13 16-26C32 7.163 24.837 0 16 0z" 
            fill="${color}" 
            stroke="white" 
            stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
    </svg>
  `;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));">${iconSvg}</div>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

const AIInsightsDashboard = () => {
  const [aiOutput, setAiOutput] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError("");
      const result = analyzeCityData(sampleData);
      setAiOutput(result);
      setLastUpdate(new Date());
    } catch (err) {
      console.error(err);
      setError("Failed to fetch AI insights");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
            <Brain className="w-6 h-6 text-blue-400 absolute top-5 left-1/2 transform -translate-x-1/2" />
          </div>
          <p className="text-slate-600 font-medium text-lg">Loading AI insights...</p>
          <p className="text-slate-400 text-sm mt-2">Analyzing city data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <AlertTriangle className="w-16 h-16 text-amber-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Analysis Error</h2>
          <p className="mb-6 text-slate-600">{error}</p>
          <button 
            onClick={() => fetchAIData(true)} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all hover:shadow-lg"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  const summary = aiOutput?.summary || {};
  const insights = aiOutput?.insights || [];

  const zones = sampleData.zones || Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Zone-${String.fromCharCode(65+i)}`,
    lat: 23.0225 + (Math.random() - 0.5) * 0.1,
    lng: 72.5714 + (Math.random() - 0.5) * 0.1,
    risk: ["good","warning","critical"][Math.floor(Math.random()*3)],
  }));

  const getRiskColor = (risk) => {
    switch(risk){
      case "critical": return "#EF4444";
      case "warning": return "#F59E0B";
      default: return "#10B981";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 w-full overflow-x-hidden">
      {/* Custom CSS for map styling and animations */}
      <style jsx>{`
        .stat-card {
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
        }
        .progress-bar {
          transition: width 0.5s ease-in-out;
        }
        .leaflet-container {
          border-radius: 0 0 16px 16px;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 16px;
          font-family: inherit;
        }
        .custom-marker {
          background: none;
          border: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <div className="p-4 md:p-6 lg:p-8 space-y-6 w-full">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg shadow-purple-200 flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                AI Insights Dashboard
              </h1>
            </div>
            <p className="text-slate-600 ml-14">Real-time AI monitoring & predictive analytics</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600">AI Active</span>
            </div>
            <button
              onClick={() => fetchAIData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow font-medium"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Analyzing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 w-full">
          {/* Waste Card */}
          <div className="stat-card bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border border-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-medium">Avg Waste Fill</div>
                  <div className="text-3xl font-bold text-slate-800 mt-1">
                    {(summary.avgWaste ?? 0).toFixed(1)}%
                  </div>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          {/* Traffic Card */}
          <div className="stat-card bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border border-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-200">
                  <Car className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-medium">Traffic Congestion</div>
                  <div className="text-3xl font-bold text-slate-800 mt-1">
                    {(summary.avgTraffic ?? 0).toFixed(1)}%
                  </div>
                </div>
              </div>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          {/* Streetlight Card */}
          <div className="stat-card bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border border-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-200">
                  <Lightbulb className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-medium">Streetlight Failures</div>
                  <div className="text-3xl font-bold text-slate-800 mt-1">
                    {summary.totalLightFailures ?? 0}
                  </div>
                </div>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>

          {/* Resolution Time Card */}
          <div className="stat-card bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border border-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-medium">Resolution Time</div>
                  <div className="text-3xl font-bold text-slate-800 mt-1">
                    {(summary.avgComplaintResolution ?? 0).toFixed(1)} hrs
                  </div>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          {/* Air Quality Card */}
          <div className="stat-card bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border border-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-200">
                  <Wind className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-medium">Air Quality Index</div>
                  <div className="text-3xl font-bold text-slate-800 mt-1">
                    {summary.airQuality ?? 72}
                  </div>
                </div>
              </div>
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Enhanced Map Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100 w-full">
          <div className="p-5 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg shadow-purple-200">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">AI Risk Assessment Map</h2>
                <p className="text-sm text-slate-600">Click markers for AI predictions</p>
              </div>
            </div>
            <button
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              aria-label={isMapExpanded ? "Minimize map" : "Maximize map"}
            >
              {isMapExpanded ? (
                <Minimize2 className="w-5 h-5 text-slate-600" />
              ) : (
                <Maximize2 className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
          
          <div className={`${isMapExpanded ? 'h-[700px]' : 'h-[600px]'} relative w-full`}>
            {/* Legend */}
            <div className="absolute top-4 right-4 z-[1000] bg-white rounded-xl shadow-lg p-4 border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Risk Levels</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">Good ({zones.filter(z => z.risk === 'good').length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">Warning ({zones.filter(z => z.risk === 'warning').length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">Critical ({zones.filter(z => z.risk === 'critical').length})</span>
                </div>
              </div>
            </div>

            <MapContainer
              center={[23.0225, 72.5714]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              attributionControl={true}
              zoomControl={false}
            >
              <ZoomControl position="bottomright" />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Zone markers */}
              {zones.map(zone => {
                const zoneInsight = insights.find(i => i.zone === zone.name);
                return (
                  <Marker 
                    key={zone.id} 
                    position={[zone.lat, zone.lng]} 
                    icon={createRiskIcon(getRiskColor(zone.risk))}
                  >
                    <Popup>
                      <div className="p-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                          <Brain className="w-5 h-5 text-purple-600" />
                          <h3 className="font-bold text-purple-600 text-base">{zone.name}</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Risk Level:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              zone.risk === "critical" 
                                ? 'bg-red-100 text-red-700 border border-red-200' 
                                : zone.risk === "warning" 
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                              {zone.risk}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Predicted Issues:</span>
                            <span className="font-semibold text-slate-700">{zoneInsight?.issues?.length || 0}</span>
                          </div>
                        </div>
                        
                        {(zoneInsight?.issues || []).map((issue, j) => (
                          <div key={j} className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-slate-800">{issue.type}</span>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                issue.severity === "critical" 
                                  ? "bg-red-100 text-red-700 border border-red-200" 
                                  : issue.severity === "warning" 
                                  ? "bg-amber-100 text-amber-700 border border-amber-200" 
                                  : "bg-green-100 text-green-700 border border-green-200"
                              }`}>
                                {issue.severity}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 leading-relaxed">{issue.details}</div>
                          </div>
                        ))}
                        
                        {(!zoneInsight?.issues || zoneInsight.issues.length === 0) && (
                          <div className="mt-3 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                            <p className="text-sm text-emerald-700">No issues predicted</p>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>
        </div>

        {/* Enhanced Zone Insights Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {insights.slice(0, 3).map((insight, idx) => {
            const zone = zones.find(z => z.name === insight.zone);
            const colorMap = {
              good: { bg: "emerald", text: "emerald", icon: "emerald" },
              warning: { bg: "amber", text: "amber", icon: "amber" },
              critical: { bg: "red", text: "red", icon: "red" }
            };
            const colors = colorMap[zone?.risk || 'good'];
            
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-${colors.bg}-50 rounded-lg border border-${colors.bg}-100`}>
                      <Brain className={`w-5 h-5 text-${colors.icon}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{insight.zone}</h3>
                      <span className="text-sm text-slate-500">{insight.issues?.length || 0} predictions</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 max-h-96 overflow-auto pr-2 custom-scrollbar">
                  {(insight.issues || []).map((issue, j) => {
                    const severityColor = issue.severity === "critical" ? "red" : issue.severity === "warning" ? "amber" : colors.bg;
                    
                    return (
                      <div key={j} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 bg-${severityColor}-500 rounded-full`}></div>
                            <span className="font-semibold text-slate-700">{issue.type}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            issue.severity === 'critical' 
                              ? 'bg-red-100 text-red-700 border border-red-200' 
                              : issue.severity === 'warning' 
                              ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                              : `bg-${colors.bg}-100 text-${colors.text}-700 border border-${colors.bg}-200`
                          }`}>
                            {issue.severity}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">{issue.details}</div>
                      </div>
                    );
                  })}
                  {(insight.issues || []).length === 0 && (
                    <div className="text-center py-12">
                      <Brain className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-slate-400 text-sm">No predictions available</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-4 px-6 bg-white rounded-xl shadow-sm border border-slate-100 w-full">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Activity className="w-4 h-4" />
            <span>Last analysis: {lastUpdate.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{zones.length} zones monitored • {insights.reduce((acc, insight) => acc + (insight.issues?.length || 0), 0)} issues detected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsDashboard;
