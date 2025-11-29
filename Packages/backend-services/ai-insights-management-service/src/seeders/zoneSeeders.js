const pool = require('../config/database');

const seedZones = async () => {
  try {
    console.log('🌱 Starting zone seeding...');

    // Create zones table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS zones (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        risk_level VARCHAR(20) DEFAULT 'good',
        issues_data JSONB,
        last_ai_analysis TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Zones table created/verified');

    // Create AI analysis table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_analysis (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        avg_waste DECIMAL(5, 2),
        avg_traffic DECIMAL(5, 2),
        total_light_failures INTEGER,
        avg_complaint_resolution DECIMAL(5, 2),
        air_quality DECIMAL(5, 2),
        confidence INTEGER,
        insights_data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ AI analysis table created/verified');

    // Insert zones
    const zones = [
      { name: 'Zone-A', lat: 23.0225, lng: 72.5714 },
      { name: 'Zone-B', lat: 23.0275, lng: 72.5650 },
      { name: 'Zone-C', lat: 23.0150, lng: 72.5800 },
      { name: 'Zone-D', lat: 23.0300, lng: 72.5750 },
      { name: 'Zone-E', lat: 23.0200, lng: 72.5650 },
      { name: 'Zone-F', lat: 23.0250, lng: 72.5700 },
      { name: 'Zone-G', lat: 23.0180, lng: 72.5780 },
      { name: 'Zone-H', lat: 23.0240, lng: 72.5620 },
      { name: 'Zone-I', lat: 23.0190, lng: 72.5680 },
      { name: 'Zone-J', lat: 23.0260, lng: 72.5720 }
    ];

    for (const zone of zones) {
      await pool.query(
        `INSERT INTO zones (name, latitude, longitude) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (name) DO NOTHING`,
        [zone.name, zone.lat, zone.lng]
      );
      console.log(`✅ Zone ${zone.name} inserted`);
    }

    console.log('✅ All zones seeded successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding zones:', error);
    process.exit(1);
  }
};

seedZones();
