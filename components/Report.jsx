"use client";
import { MantineProvider } from "@mantine/core";
import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

export const description = "A linear line chart";

const chartConfig = {
  ticket_count: {
    label: "Ticket",
    color: "#1f78ff",
  },
};

const pieChartConfig = {
  "ปวดหัวเป็นไข้": {
    label: "ปวดหัวเป็นไข้",
    color: "#37AFE1",
  },
  "ปวดท้อง": {
    label: "ปวดท้อง",
    color: "#4CC9FE",
  },
  "ท้องเสีย": {
    label: "ท้องเสีย",
    color: "#F5F4B3",
  },
  "ปวดรอบเดือน": {
    label: "ปวดรอบเดือน",
    color: "#4A628A",
  },
  "เป็นหวัด": {
    label: "เป็นหวัด",
    color: "#7AB2D3",
  },
  "ปวดฟัน": {
    label: "ปวดฟัน",
    color: "#B9E5E8",
  },
  "เป็นแผล": {
    label: "เป็นแผล",
    color: "#433878",
  },
  "เป็นลม": {
    label: "เป็นลม",
    color: "#7E60BF",
  },
  "ตาเจ็บ": {
    label: "ตาเจ็บ",
    color: "#E4B1F0",
  },
  "ผื่นคัน": {
    label: "ผื่นคัน",
    color: "#FEEE91",
  },
  "นอนพัก": {
    label: "นอนพัก",
    color: "#C4E1F6",
  },
};

function Report() {
  const [totalToday, setTotalToday] = useState(0);
  const [totalWeek, setTotalWeek] = useState(0);
  const [totalMonth, setTotalMonth] = useState(0);
  const [totalYear, setTotalYear] = useState(0);
  const [symptomStats, setSymptomStats] = useState([]);
  const [pillStats, setPillStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]); // Added chartData state
  const today = new Date();
  const monthNamesThai = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const currentMonth = monthNamesThai[today.getMonth()];
  const currentYear = today.getFullYear() + 543;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Fetched data:", data);

      const today = new Date();

      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0,
        0
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      );
      const startOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      const totalTodayTickets =
        data.patientRecords?.filter((ticket) => {
          const ticketDate = new Date(ticket.datetime);
          return ticketDate >= startOfDay && ticketDate <= endOfDay;
        }).length || 0;

      const totalWeekTickets =
        data.patientRecords?.filter((ticket) => {
          const ticketDate = new Date(ticket.datetime);
          return ticketDate >= startOfWeek && ticketDate <= endOfDay;
        }).length || 0;

      const totalMonthTickets =
        data.patientRecords?.filter((ticket) => {
          const ticketDate = new Date(ticket.datetime);
          return ticketDate >= startOfMonth && ticketDate <= endOfDay;
        }).length || 0;

      const totalYearTickets =
        data.patientRecords?.filter((ticket) => {
          const ticketDate = new Date(ticket.datetime);
          return ticketDate >= startOfYear && ticketDate <= endOfDay;
        }).length || 0;

      setTotalToday(totalTodayTickets);
      setTotalWeek(totalWeekTickets);
      setTotalMonth(totalMonthTickets);
      setTotalYear(totalYearTickets);
      setSymptomStats(data.symptomStats || []);
      setPillStats(data.pillStats || []);
      setChartData(data.chartData || []); // Set chartData fetched from the backend
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Transform symptomStats data for PieChart
  const pieChartData = symptomStats
    .filter((stat) => stat.symptom_id !== 12)
    .map((stat) => ({
      name: stat.symptom_name,
      value: stat.count,
      fill: pieChartConfig[stat.symptom_name]?.color || "hsl(var(--chart-default))",
    }));

  useEffect(() => {
    console.log("symptomStats:", symptomStats);
    console.log("pieChartData:", pieChartData);
  }, [symptomStats, pieChartData]);

  // Sort and limit the symptomStats to get the top 10 symptoms
  const topSymptoms = symptomStats
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Sort and limit the pillStats to get the top 10 pills
  const topPills = pillStats.sort((a, b) => b.count - a.count).slice(0, 10);
  const customTooltip = ({ payload, label }) => {
    if (payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label bg-white p-2 input-border ">{`${label} ผู้ป่วย ${payload[0].value} คน`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <MantineProvider>
      <div className="bg-gray-100">
        <div className="flex flex-wrap gap-4 justify-center py-4 bg-gray-100">
          <div className="bg-white shadow-md rounded-lg flex flex-col justify-center items-center w-full sm:w-1/4 md:w-1/6 lg:w-1/12 h-full py-2">
            <h3 className="text-xl whitespace-nowrap text-center">
              ผู้ใช้รายวัน
            </h3>
            <div className="text-2xl mt-4">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                totalToday
              )}
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg flex flex-col justify-center items-center w-full sm:w-1/4 md:w-1/6 lg:w-1/12 h-full py-2">
            <h3 className="text-xl whitespace-nowrap text-center">
              ผู้ใช้รายสัปดาห์
            </h3>
            <div className="text-2xl mt-4">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                totalWeek
              )}
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg flex flex-col justify-center items-center w-full sm:w-1/4 md:w-1/6 lg:w-1/12 h-full py-2">
            <h3 className="text-xl whitespace-nowrap text-center">
              ผู้ใช้รายเดือน
            </h3>
            <div className="text-2xl mt-4">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                totalMonth
              )}
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg flex flex-col justify-center items-center w-full sm:w-1/4 md:w-1/6 lg:w-1/12 h-full py-2">
            <h3 className="text-xl whitespace-nowrap text-center">
              ผู้ใช้รายปี
            </h3>
            <div className="text-2xl mt-4">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                totalYear
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap w-full mx-4 gap-4 py-6 bg-gray-100 justify-center pr-10">
          <div className="bg-white w-full sm:w-2/3 md:w-1/2 lg:w-1/3 flex flex-col items-center display-border shadow-inner drop-shadow-md px-4 py-4">
            <Card className="h-full w-full flex flex-col">
              <CardHeader>
                <CardTitle>Bar Chart</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ChartContainer config={chartConfig}>
                  <BarChart width={378} height={213} accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={true} horizontal={false} />
                    <XAxis
                      dataKey="hour"
                      tickLine={true}
                      axisLine={true}
                      tickMargin={8}
                      tickFormatter={(value) => `${value}:00`}
                    />
                    <YAxis
                      tickLine={true}
                      axisLine={true}
                      tickFormatter={(value) => Math.round(value)}
                      allowDecimals={false}
                    />
                    <ChartTooltip cursor={false} content={customTooltip} />
                    <Bar dataKey="record_count" fill="#1f78ff" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                  Trending up by 5.2% this month{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                  Showing total visitors for the last 6 months
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="bg-white w-full sm:w-2/3 md:w-1/2 lg:w-1/3 flex flex-col items-center display-border shadow-inner drop-shadow-md px-4 py-4">
            <Card className="h-full w-full flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>Pie Chart - Legend</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer
                  config={pieChartConfig}
                  className="mx-auto aspect-square max-h-[300px]"
                >
                  <PieChart>
                    <Pie data={pieChartData} dataKey="value" nameKey="name" />
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          <div className="bg-white w-full sm:w-2/3 md:w-1/2 lg:w-1/3 flex flex-col items-center display-border shadow-inner drop-shadow-md px-10 py-4">
            <h3 className="text-xl whitespace-nowrap text-center">
              อาการที่พบ
            </h3>
            <h3 className="text-xl whitespace-nowrap text-center">
              ในเดือน {currentMonth} {currentYear}
            </h3>
            <div className="text-lg mt-2">
              {console.log(symptomStats)}
              {console.log(pieChartData)}
              {symptomStats.length > 0 ? (
                symptomStats
                  .filter((stat) => stat.symptom_id !== 12)
                  .map((stat) => (
                    <div key={stat.symptom_id}>
                      {stat.symptom_name}: {stat.count} คน
                    </div>
                  ))
              ) : (
                <div>No data available</div>
              )}
            </div>
          </div>
          <div className="bg-white w-full sm:w-2/3 md:w-1/2 lg:w-1/3 flex flex-col items-center display-border shadow-inner drop-shadow-md px-10 py-4">
            <h3 className="text-xl whitespace-nowrap text-center">
              ยาที่จ่ายในเดือน
            </h3>
            <h3 className="text-xl whitespace-nowrap text-center">
              {currentMonth} {currentYear}
            </h3>
            <div className="text-lg mt-2">
              {topPills.length > 0 ? (
                (() => {
                  const pillMap = topPills.reduce((acc, stat) => {
                    if (!acc[stat.pill_name]) {
                      acc[stat.pill_name] = 0;
                    }
                    acc[stat.pill_name] += stat.count;
                    return acc;
                  }, {});

                  return Object.entries(pillMap).map(
                    ([pill_name, count], index) => (
                      <div key={index}>
                        {pill_name} {count} ครั้ง
                      </div>
                    )
                  );
                })()
              ) : (
                <div>No data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MantineProvider>
  );
}

export default Report;