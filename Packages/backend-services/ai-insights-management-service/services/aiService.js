const pool = require('../config/database');
const { analyzeCityData } = require('../models/aiModel');

class AIService {
  // Get zones with all utility data
  async getZonesWithData() {
    try {
      const query = `
        SELECT 
          z.id,
          z.name,
          z.latitude as lat,
          z.longitude as lng,
          z.risk_level,
          COALESCE(AVG(wb.fill_level), 0) as waste,
          COALESCE(COUNT(CASE WHEN sl.status = 'faulty' THEN 1 END), 0) as street_lights,
          50 + (RANDOM() * 50) as air_quality,
          60 + (RANDOM() * 40) as traffic_congestion,
          FLOOR(RANDOM() * 5) as traffic_accidents,
          30 + (RANDOM() * 20) as traffic_avg_speed
        FROM zones z
        LEFT JOIN waste_bins wb ON z.id = wb.zone_id
        LEFT JOIN streetlights sl ON z.id = sl.zone_id
        GROUP BY z.id, z.name, z.latitude, z.longitude, z.risk_level
        ORDER BY z.id
      `;

      const result = await pool.query(query);
      
      return result.rows.map(z => ({
        id: z.id,
        name: z.name,
        lat: parseFloat(z.lat),
        lng: parseFloat(z.lng),
        waste: parseFloat(z.waste),
        streetLights: parseInt(z.street_lights),
        airQuality: parseFloat(z.air_quality),
        traffic: {
          congestion: parseFloat(z.traffic_congestion),
          accidents: parseInt(z.traffic_accidents),
          avgSpeed: parseFloat(z.traffic_avg_speed)
        }
      }));
    } catch (error) {
      console.error('Error fetching zones data:', error);
      throw new Error('Failed to fetch zones data');
    }
  }

  // Perform AI analysis
  async performAnalysis() {
    try {
      // Get current zone data
      const zones = await this.getZonesWithData();
      
      // Run AI analysis
      const analysis = analyzeCityData({ zones });

      // Save analysis to database
      const analysisId = await this.saveAnalysis(analysis);

      // Update zone risk levels
      await this.updateZoneRisks(analysis.insights, zones);

      return {
        ...analysis,
        zones,
        analysisId
      };
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      throw new Error('Failed to perform AI analysis');
    }
  }

  // Save analysis results to database
  async saveAnalysis(analysis) {
    try {
      const query = `
        INSERT INTO ai_analysis (
          timestamp,
          avg_waste,
          avg_traffic,
          total_light_failures,
          avg_complaint_resolution,
          air_quality,
          confidence,
          insights_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;

      const values = [
        new Date(),
        analysis.summary.avgWaste,
        analysis.summary.avgTraffic,
        analysis.summary.totalLightFailures,
        analysis.summary.avgComplaintResolution,
        analysis.summary.airQuality,
        analysis.confidence,
        JSON.stringify(analysis.insights)
      ];

      const result = await pool.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('Error saving analysis:', error);
      throw new Error('Failed to save analysis');
    }
  }

  // Update zone risk levels
  async updateZoneRisks(insights, zones) {
    try {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        for (const insight of insights) {
          const zone = zones.find(z => z.name === insight.zone);
          if (!zone) continue;

          const riskLevel = insight.issues.some(i => i.severity === 'critical') 
            ? 'critical' 
            : insight.issues.some(i => i.severity === 'warning') 
            ? 'warning' 
            : 'good';

          await client.query(
            `UPDATE zones 
             SET risk_level = $1, 
                 last_ai_analysis = NOW(),
                 issues_data = $2,
                 updated_at = NOW()
             WHERE id = $3`,
            [riskLevel, JSON.stringify(insight.issues), zone.id]
          );
        }

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating zone risks:', error);
      throw new Error('Failed to update zone risks');
    }
  }

  // Get historical analysis
  async getHistoricalAnalysis(limit = 30) {
    try {
      const query = `
        SELECT 
          id,
          timestamp,
          avg_waste,
          avg_traffic,
          total_light_failures,
          avg_complaint_resolution,
          air_quality,
          confidence,
          insights_data
        FROM ai_analysis
        ORDER BY timestamp DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching historical analysis:', error);
      throw new Error('Failed to fetch historical analysis');
    }
  }

  // Get zone statistics
  async getZoneStatistics(zoneId) {
    try {
      const query = `
        SELECT 
          z.name,
          z.risk_level,
          z.issues_data,
          z.last_ai_analysis,
          COUNT(DISTINCT aa.id) as analysis_count
        FROM zones z
        LEFT JOIN ai_analysis aa ON aa.insights_data::jsonb @> jsonb_build_array(jsonb_build_object('zone', z.name))
        WHERE z.id = $1
        GROUP BY z.id, z.name, z.risk_level, z.issues_data, z.last_ai_analysis
      `;

      const result = await pool.query(query, [zoneId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching zone statistics:', error);
      throw new Error('Failed to fetch zone statistics');
    }
  }
}

module.exports = new AIService();
