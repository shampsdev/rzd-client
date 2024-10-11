"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Cpu, HardDrive, Clock, FileText, Activity } from "lucide-react";
import { getServerHealth } from "@/api/get.health";

interface HealthData {
  ram_usage: number;
  cpu_usage: number;
  total_memory: number;
  available_memory: number;
  thread_count: number;
  open_files: number;
  process_uptime: number;
}

interface ChartData {
  time: number;
  ram: number;
  cpu: number;
}

export const DashboardPage = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getServerHealth();
        setHealthData(data);

        setChartData((prev) => {
          const newData = {
            time: time,
            ram: data.ram_usage * 100,
            cpu: data.cpu_usage * 100,
          };

          if (prev.length >= 20) {
            return [...prev.slice(1), newData];
          } else {
            return [...prev, newData];
          }
        });

        setTime((prevTime) => prevTime + 1);
      } catch (error) {
        console.error("Error fetching health data", error);
      }
    };

    const pollData = async () => {
      while (true) {
        await fetchData();
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    };

    pollData();
  }, [time]);

  if (!healthData) {
    return (
      <div className='w-full pt-[20%] flex flex-col items-center justify-center'>
        Loading...
      </div>
    );
  }

  const formatBytes = (bytes: any) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const formatSeconds = (seconds: any) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };
  return (
    <div className='p-8 min-h-screen'>
      <h1 className='text-3xl font-bold mb-6'>Server Health Dashboard</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>RAM Usage</CardTitle>
            <HardDrive className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {(healthData.ram_usage * 100).toFixed(2)}%
            </div>
            <Progress
              value={healthData.ram_usage * 100}
              className='mt-2'
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>CPU Usage</CardTitle>
            <Cpu className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {(healthData.cpu_usage * 100).toFixed(2)}%
            </div>
            <Progress
              value={healthData.cpu_usage * 100}
              className='mt-2'
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Memory</CardTitle>
            <HardDrive className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatBytes(healthData.available_memory * 1024 * 1024 * 1024)}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              of {formatBytes(healthData.total_memory * 1024 * 1024 * 1024)}{" "}
              Available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Process Uptime
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatSeconds(healthData.process_uptime)}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className='mt-6'>
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                ram: {
                  label: "RAM Usage",
                  color: "hsl(var(--chart-1))",
                },
                cpu: {
                  label: "CPU Usage",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className='h-[300px]'
            >
              <ResponsiveContainer
                width='100%'
                height='100%'
              >
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='time' />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='ram'
                    stroke='#82ca9d'
                    name='RAM Usage'
                  />
                  <Line
                    type='monotone'
                    dataKey='cpu'
                    stroke='#8884d8'
                    name='CPU Usage'
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Thread Count</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{healthData.thread_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Open Files</CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{healthData.open_files}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
