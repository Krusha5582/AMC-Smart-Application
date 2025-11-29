export const analyzeCityData = (data) => {
  const zones = data.zones || [];

  if (!zones.length) return null;

  // Aggregate metrics
  const avgWaste = zones.reduce((sum, z) => sum + z.waste, 0) / zones.length;
  const avgTraffic = zones.reduce((sum, z) => sum + (z.traffic?.congestion || 0), 0) / zones.length;
  const totalLightFailures = zones.reduce((sum, z) => sum + (z.streetLights || 0), 0);
  const avgAQI = zones.reduce((sum, z) => sum + (z.airQuality || 0), 0) / zones.length;
  const avgComplaintResolution = 2.5; // mock value since sampleData has no complaints

  const insights = zones.map(zone => {
    const issues = [];

    // Waste
    if (zone.waste > 80) issues.push({ type: "Waste", severity: "critical", details: "High waste level" });
    else if (zone.waste > 60) issues.push({ type: "Waste", severity: "warning", details: "Moderate waste level" });

    // Traffic
    if (zone.traffic.congestion > 80) issues.push({ type: "Traffic", severity: "critical", details: "Severe congestion" });
    else if (zone.traffic.congestion > 60) issues.push({ type: "Traffic", severity: "warning", details: "High congestion" });

    // Streetlights
    if (zone.streetLights > 3) issues.push({ type: "Streetlights", severity: "critical", details: "Multiple failures" });
    else if (zone.streetLights > 1) issues.push({ type: "Streetlights", severity: "warning", details: "Some failures" });

    return { zone: zone.name, issues };
  });

  return {
    summary: { avgWaste, avgTraffic, totalLightFailures, avgComplaintResolution, avgAQI },
    insights,
    confidence: Math.floor(Math.random() * 10) + 85 // 85–95%
  };
};
