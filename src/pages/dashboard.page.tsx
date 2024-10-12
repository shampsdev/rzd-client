"use client";

import { useEffect, useRef, useState } from "react";
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
  time: number;
  ram_usage: number;
  cpu_usage: number;
  total_memory: number;
  available_memory: number;
  thread_count: number;
  open_files: number;
  process_uptime: number;
}

export const DashboardPage = () => {
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [time, setTime] = useState(0);
  const timeRef = useRef(0); // Use a ref to keep track of time

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getServerHealth();
        const newHealthData: HealthData = {
          time: timeRef.current, // Use time from ref
          ram_usage: (data.ram_usage / data.total_memory) * 100,
          cpu_usage: data.cpu_usage,
          total_memory: data.total_memory,
          available_memory: data.available_memory,
          thread_count: data.thread_count,
          open_files: data.open_files,
          process_uptime: data.process_uptime,
        };

        setHealthData((prev) => {
          if (prev.length >= 20) {
            return [...prev.slice(1), newHealthData];
          } else {
            return [...prev, newHealthData];
          }
        });

        // Increment time using the ref
        timeRef.current += 1;
        setTime(timeRef.current); // Force a re-render by updating state
      } catch (error) {
        console.error("Error fetching health data", error);
      }
    };

    const pollData = async () => {
      while (true) {
        await fetchData();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    };

    pollData();
  }, []);

  if (healthData.length === 0) {
    return (
      <div className='w-full pt-[20%] flex flex-col items-center justify-center'>
        Loading...
      </div>
    );
  }

  const latestData = healthData[healthData.length - 1];

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
              {latestData.ram_usage.toFixed(2)}%
            </div>
            <Progress
              value={latestData.ram_usage}
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
              {latestData.cpu_usage.toFixed(2)}%
            </div>
            <Progress
              value={latestData.cpu_usage}
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
              {formatBytes(latestData.available_memory * 1024 * 1024 * 1024)}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              of {formatBytes(latestData.total_memory * 1024 * 1024 * 1024)}{" "}
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
              {formatSeconds(latestData.process_uptime)}
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
                <LineChart data={healthData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='time'
                    tickFormatter={(value) => `${value}s`}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='ram_usage'
                    stroke='#82ca9d'
                    name='RAM Usage'
                  />
                  <Line
                    type='monotone'
                    dataKey='cpu_usage'
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
            <div className='text-2xl font-bold'>{latestData.thread_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Open Files</CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{latestData.open_files}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
