"use client";
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  TimeScale
);

interface WorkSession {
  id: string;
  startedAt: string;
  endedAt: string;
  time: number;
}

interface WorkTimeChartProps {
  sessions: WorkSession[];
  period: string;
}

const WorkTimeChart: React.FC<WorkTimeChartProps> = ({ sessions, period }) => {
  // Group sessions by day for the graph
  const dataByDay: { [date: string]: number } = {};
  sessions.forEach((s) => {
    const day = new Date(s.startedAt).toISOString().slice(0, 10);
    dataByDay[day] = (dataByDay[day] || 0) + s.time;
  });
  const labels = Object.keys(dataByDay).sort();
  const data = labels.map((d) => Number((dataByDay[d] / 3600).toFixed(2))); // hours as numbers

  const chartData = {
    labels,
    datasets: [
      {
        label: "Hours Worked",
        data,
        fill: false,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: (period === "1d" ? "hour" : "day") as
            | "year"
            | "month"
            | "week"
            | "day"
            | "hour"
            | "minute"
            | "second"
            | "quarter"
            | false
            | undefined,
        },
        title: { display: true, text: "Date" },
      },
      y: {
        title: { display: true, text: "Hours Worked" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="w-full h-96">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default WorkTimeChart;
