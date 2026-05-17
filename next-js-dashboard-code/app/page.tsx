"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function SensorCard({ title, value, status, color }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-6 flex flex-col gap-2 hover:shadow-lg transition">
      <h2 className="text-sm font-medium text-zinc-500">{title}</h2>
      <p className="text-2xl font-bold text-black dark:text-white">
        {value}
      </p>
      <span className={`text-sm font-semibold ${color}`}>
        {status}
      </span>
    </div>
  );
}

export default function Home() {
  type SensorData = {
    temperature: number;
    humidity: number;
    moisture: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };

  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [predictedCrop, setPredictedCrop] = useState("");
  const [irrigationStatus, setIrrigationStatus] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);

  // 🔥 PUT FIREBASE CODE HERE
  useEffect(() => {
    const cropRef = ref(rtdb, "recommendedCrop/name");
    const irrigationRef = ref(rtdb, "irrigation/irrigation_status");
    const sensorRef = ref(rtdb, "sensorData");

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();

      console.log("RTDB RAW DATA:", data);

      if (!data) {
        setLoading(false);
        return;
      }

      // 🔥 Get latest entry (auto key like -OsiVIGt...)
      const latestKey = Object.keys(data).sort().pop();
      const latest = latestKey ? data[latestKey] : null;

      const lastFiveKeys = Object.keys(data).sort().slice(-7);

      const chart = lastFiveKeys.map((key, index) => ({
        name: `#${index + 1}`,
        temperature: data[key]?.temperature ?? 0,
        moisture: data[key]?.moisture ?? 0,
      }));

      setChartData(chart);

      setSensorData(latest);
      setLoading(false);
    });

    const unsubCrop = onValue(cropRef, (snap) => {
      setPredictedCrop(snap.val() || "");
    });

    const unsubIrrigation = onValue(irrigationRef, (snap) => {
      setIrrigationStatus(snap.val() || "");
    });

    return () => {
      unsubscribe();
      unsubCrop();
      unsubIrrigation();
    };
  }, []);


  const getStatus = (value: any, low: any, high: any) => {
    if (value < low) return "Low";
    if (value <= high) return "Stable";
    return "High";
  };

  const getColor = (value: any, low: any, high: any) => {
    if (value < low) return "text-red-500";
    if (value <= high) return "text-green-500";
    return "text-yellow-500";
  };

  // 🔄 Convert Firebase data → UI cards
  const sensorCards = sensorData
    ? [
        {
          title: "Temperature 🌡️",
          value: `${sensorData?.temperature ?? 0}°C`,
          status: getStatus(sensorData.temperature, 18, 30),
          color:  getColor(sensorData.temperature, 18, 30),
        },
        {
          title: "Humidity 🫧",
          value: `${sensorData.humidity}%`,
          status: getStatus(sensorData.humidity, 30, 70),
          color:  getColor(sensorData.humidity, 30, 70),
        },
        {
          title: "Soil Moisture 💧",
          value: `${sensorData.moisture}%`,
          status: getStatus(sensorData.moisture, 35, 70),
          color:  getColor(sensorData.moisture, 35, 70),
        },
        // {
        //   title: "Light %",
        //   value: `${sensorData.lightPercentage}%`,
        //   status:
        //     sensorData.lightPercentage < 50 ? "Low" : "Good",
        //   color:
        //     sensorData.lightPercentage < 50
        //       ? "text-yellow-500"
        //       : "text-green-500",
        // },
        {
          title: "Nitrogen 🇳",
          value: `${sensorData.nitrogen} mg/kg`,
          status: getStatus(sensorData.nitrogen, 30, 70),
          color:  getColor(sensorData.nitrogen, 30, 70),
        },
        {
          title: "Phosphorus 🇵",
          value: `${sensorData.phosphorus} mg/kg`,
          status: getStatus(sensorData.phosphorus, 20, 60),
          color:  getColor(sensorData.phosphorus, 20, 60),
        },
        {
          title: "Potassium 🇰",
          value: `${sensorData.potassium} mg/kg`,
          status: getStatus(sensorData.potassium, 40, 80),
          color:  getColor(sensorData.potassium, 40, 80),
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading sensor data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Smart Agriculture Dashboard 🌱
        </h1>
        <p className="text-md text-zinc-600 dark:text-zinc-400">
          Real-time IoT Monitoring System (Firebase Live Data)
        </p>
      </header>

      <section>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* LEFT: Sensor Cards */}
          <div className="w-full lg:w-5/12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sensorCards.map((sensor, index) => (
                <SensorCard key={index} {...sensor} />
              ))}
            </div>
          </div>

          {/* RIGHT: Prediction + Irrigation */}
          <div className="w-full lg:w-7/12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Crop Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg transition">
                <div className="font-bold text-gray-500 dark:text-white leading-none">
                  Predicted Crop 🌾
                </div>

                <div className="text-sm leading-normal text-gray-500 mt-0 mb-2">
                  Based on current sensor data
                </div>

                <div className="text-2xl font-bold">
                  {predictedCrop || "N/A"}
                </div>
              </div>

              {/* Irrigation Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg transition">
                <div className="font-bold text-gray-500 dark:text-white mb-2">
                  Irrigation 🚿
                </div>

                <div className="text-2xl font-bold">
                  {irrigationStatus || "N/A"}
                </div>
              </div>

              {/* temperature graph card */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg transition">
                <div className="font-bold text-gray-500 dark:text-white mb-2">
                  Temperature 🌡️
                </div>

                <div>
                  <div className="w-full h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis width={25} />
                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke="#ef4444"
                          strokeWidth={3}
                          dot={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* soil moisture graph card */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg transition">
                <div className="font-bold text-gray-500 dark:text-white mb-2">
                  Soil Moisture 💧
                </div>

                <div>
                  <div className="w-full h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis width={25} />
                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="moisture"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}