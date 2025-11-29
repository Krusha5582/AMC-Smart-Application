// src/data/sampleData.js

const sampleData = {
  zones: [
    {
      id: 1,
      name: "Zone-A",
      lat: 23.0225,
      lng: 72.5714,
      traffic: {
        congestion: 65, // in %
        accidents: 1,
        avgSpeed: 35 // km/h
      },
      waste: 55, // % fill
      streetLights: 2,
      airQuality: 80
    },
    {
      id: 2,
      name: "Zone-B",
      lat: 23.0275,
      lng: 72.5650,
      traffic: {
        congestion: 85,
        accidents: 3,
        avgSpeed: 20
      },
      waste: 90,
      streetLights: 5,
      airQuality: 95
    },
    {
      id: 3,
      name: "Zone-C",
      lat: 23.0150,
      lng: 72.5800,
      traffic: {
        congestion: 45,
        accidents: 0,
        avgSpeed: 40
      },
      waste: 35,
      streetLights: 0,
      airQuality: 60
    },
    {
      id: 4,
      name: "Zone-D",
      lat: 23.0300,
      lng: 72.5750,
      traffic: {
        congestion: 50,
        accidents: 1,
        avgSpeed: 30
      },
      waste: 60,
      streetLights: 1,
      airQuality: 70
    },
    {
      id: 5,
      name: "Zone-E",
      lat: 23.0200,
      lng: 72.5650,
      traffic: {
        congestion: 30,
        accidents: 0,
        avgSpeed: 50
      },
      waste: 40,
      streetLights: 0,
      airQuality: 55
    },
    {
      id: 6,
      name: "Zone-F",
      lat: 23.0250,
      lng: 72.5700,
      traffic: {
        congestion: 75,
        accidents: 2,
        avgSpeed: 25
      },
      waste: 85,
      streetLights: 4,
      airQuality: 90
    },
    {
      id: 7,
      name: "Zone-G",
      lat: 23.0180,
      lng: 72.5780,
      traffic: {
        congestion: 60,
        accidents: 1,
        avgSpeed: 35
      },
      waste: 50,
      streetLights: 3,
      airQuality: 75
    },
    {
      id: 8,
      name: "Zone-H",
      lat: 23.0240,
      lng: 72.5620,
      traffic: {
        congestion: 40,
        accidents: 0,
        avgSpeed: 45
      },
      waste: 30,
      streetLights: 0,
      airQuality: 65
    },
    {
      id: 9,
      name: "Zone-I",
      lat: 23.0190,
      lng: 72.5680,
      traffic: {
        congestion: 55,
        accidents: 1,
        avgSpeed: 32
      },
      waste: 65,
      streetLights: 2,
      airQuality: 78
    },
    {
      id: 10,
      name: "Zone-J",
      lat: 23.0260,
      lng: 72.5720,
      traffic: {
        congestion: 90,
        accidents: 4,
        avgSpeed: 18
      },
      waste: 95,
      streetLights: 6,
      airQuality: 100
    }
  ]
};

export default sampleData;
