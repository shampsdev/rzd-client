import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Cpu, HardDrive, Clock } from 'lucide-react';
import { getServerHealth } from '@/api/get.health';

import { motion } from 'framer-motion'; // Import Framer Motion

import wagon from '../assets/wagon.svg';
import locomotive from '../assets/locomotive.svg';
import rails from '../assets/rails.svg';
import { getStatus, StatusData } from '@/api/get.status';

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
  const [statusData, setStatusData] = useState<StatusData>({
    status: 'processing',
  });
  const [prevStatusData, setPrevStatusData] = useState<StatusData | null>(null);

  const [, setTime] = useState(0);
  const timeRef = useRef(0); // Use a ref to keep track of time
  const wagonWidthRef = useRef(0); // Ref to store wagon width

  const wagonRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = () => {
    if (wagonRef.current) {
      const width = wagonRef.current.getBoundingClientRect().width;
      wagonWidthRef.current = width; // Update the ref directly

      console.log('Wagon width:', width);
    }
  };

  const [deltaX, setDeltaX] = useState(0);
  const [spread, setSpread] = useState(false);

  const move = (n: number) => {
    console.log(n)
    setDeltaX((prevDeltaX) => {
      return prevDeltaX + wagonWidthRef.current * n;
    });
  };

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const healthData = await getServerHealth();
        const newHealthData: HealthData = {
          time: timeRef.current, // Use time from ref
          ram_usage: (healthData.ram_usage / healthData.total_memory) * 100,
          cpu_usage: healthData.cpu_usage,
          total_memory: healthData.total_memory,
          available_memory: healthData.available_memory,
          thread_count: healthData.thread_count,
          open_files: healthData.open_files,
          process_uptime: healthData.process_uptime,
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
        console.error('Error fetching health data', error);
      }
    };

    const fetchStatusData = async () => {
      const newStatusData = await getStatus();
      setStatusData(newStatusData);
    };

    const pollData = async () => {
      while (true) {
        await fetchHealthData();
        await fetchStatusData();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    };

    pollData();
  }, []);

  useEffect(() => {
    if (statusData.result?.audio === prevStatusData?.result?.audio) return;
    if (statusData.result?.label == 4) {
      move(statusData.result.attribute);
    }

    if (statusData.result?.label == 9) {
      setSpread(true);
    }

    if (statusData.result?.label == 16) {
      setSpread(false);
    }

    if (statusData.result?.label == 10) {
      move(-statusData.result.attribute);
    }
    setPrevStatusData(statusData);
  }, [prevStatusData?.result?.audio, statusData]);

  if (healthData.length === 0) {
    return (
      <div className='w-full pt-[20%] flex flex-col items-center justify-center'>
        Loading...
      </div>
    );
  }

  const latestData = healthData[healthData.length - 1];

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const formatSeconds = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  return (
    <>
      <div className='mx-auto px-8 pb-8'>
        <div className='flex justify-around flex-col md:flex-row gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  ram: {
                    label: 'RAM Usage',
                    color: 'hsl(var(--chart-1))',
                  },
                  cpu: {
                    label: 'CPU Usage',
                    color: 'hsl(var(--chart-2))',
                  },
                }}
                className='h-[300px]'
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
              </ChartContainer>
            </CardContent>
          </Card>
          <div className='grid grid-cols-2 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>RAM Usage</CardTitle>
                <HardDrive className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {latestData.ram_usage.toFixed(2)}%
                </div>
                <Progress value={latestData.ram_usage} className='mt-2' />
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
                <Progress value={latestData.cpu_usage} className='mt-2' />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Memory</CardTitle>
                <HardDrive className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {formatBytes(
                    latestData.available_memory * 1024 * 1024 * 1024
                  )}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  of {formatBytes(latestData.total_memory * 1024 * 1024 * 1024)}{' '}
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
        </div>
      </div>
      <div className='h-[3px] mb-2 rounded-full w-36 mx-auto bg-[#B3B3B3]'></div>
      <div className='w-[100vw] flex justify-center relative h-20 overflow-hidden'>
        <img
          className='h-[55%] w-[150vw] object-cover absolute -translate-y-[50%] top-[50%]'
          src={rails}
          alt=''
        />
        <motion.div
          animate={{ x: `${deltaX}px`, y: '-50%' }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className='absolute flex items-center h-full top-[50%]'
          style={{ transform: `translateY(-50%)` }}
        >
          <div className='flex h-full'>
            <motion.img
              animate={{
                padding: `5px`,
                paddingRight: `${spread ? '10px' : '5px'}`,
                paddingLeft: `${spread ? '10px' : '5px'}`,
              }}
              transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              className='h-full w-full object-fill'
              src={wagon}
              ref={wagonRef}
              onLoad={handleImageLoad}
            />
            <motion.img
              animate={{
                padding: `5px`,
                paddingRight: `${spread ? '10px' : '5px'}`,
                paddingLeft: `${spread ? '10px' : '5px'}`,
              }}
              transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              src={wagon}
            />
            <motion.img
              animate={{
                padding: `5px`,
                paddingRight: `${spread ? '10px' : '5px'}`,
                paddingLeft: `${spread ? '10px' : '5px'}`,
              }}
              transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              src={wagon}
            />
            <motion.img
              animate={{
                padding: `5px`,
                paddingRight: `${spread ? '10px' : '5px'}`,
                paddingLeft: `${spread ? '10px' : '5px'}`,
              }}
              transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              src={wagon}
            />
            <motion.img
              animate={{
                padding: `5px`,
                paddingRight: `${spread ? '10px' : '5px'}`,
                paddingLeft: `${spread ? '10px' : '5px'}`,
              }}
              src={locomotive}
            />
          </div>
        </motion.div>
      </div>
      <div className='p-4 flex justify-around m-12 rounded-xl'>
        <Card>
          <CardHeader>
            <CardTitle className='font-thin'>audio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='font-black'>{statusData?.result?.audio}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='font-thin'>text</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='font-black'>{statusData?.result?.text}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='font-thin'>label</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='font-black'>{statusData?.result?.label}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='font-thin'>attribute</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='font-black'>{statusData?.result?.attribute}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
