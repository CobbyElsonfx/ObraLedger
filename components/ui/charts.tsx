import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

interface ChartProps {
  data: ChartData;
  title: string;
  description?: string;
  type: 'bar' | 'line' | 'doughnut' | 'pie';
  className?: string;
}

// Simple chart components using CSS and SVG
export function SimpleBarChart({ data, title, description, className = "" }: ChartProps) {
  const maxValue = Math.max(...data.datasets[0].data);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.labels.map((label, index) => {
            const value = data.datasets[0].data[index];
            const percentage = (value / maxValue) * 100;
            
            return (
              <div key={label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function SimpleLineChart({ data, title, description, className = "" }: ChartProps) {
  const maxValue = Math.max(...data.datasets[0].data);
  const minValue = Math.min(...data.datasets[0].data);
  const range = maxValue - minValue;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              points={data.datasets[0].data.map((value, index) => {
                const x = (index / (data.datasets[0].data.length - 1)) * 100;
                const y = 100 - ((value - minValue) / range) * 100;
                return `${x},${y}`;
              }).join(' ')}
            />
            {data.datasets[0].data.map((value, index) => {
              const x = (index / (data.datasets[0].data.length - 1)) * 100;
              const y = 100 - ((value - minValue) / range) * 100;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="rgb(59, 130, 246)"
                />
              );
            })}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
            {data.labels.map((label, index) => (
              <span key={index} className="text-center">
                {label}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SimpleDoughnutChart({ data, title, description, className = "" }: ChartProps) {
  const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
  const colors = [
    'rgb(59, 130, 246)', // blue
    'rgb(16, 185, 129)', // green
    'rgb(245, 158, 11)', // yellow
    'rgb(239, 68, 68)',  // red
    'rgb(139, 92, 246)', // purple
    'rgb(236, 72, 153)', // pink
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {data.datasets[0].data.map((value, index) => {
                const percentage = (value / total) * 100;
                const startAngle = data.datasets[0].data
                  .slice(0, index)
                  .reduce((sum, val) => sum + (val / total) * 360, 0);
                const endAngle = startAngle + (value / total) * 360;
                
                const x1 = 50 + 35 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 50 + 35 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 50 + 35 * Math.cos((endAngle - 90) * Math.PI / 180);
                const y2 = 50 + 35 * Math.sin((endAngle - 90) * Math.PI / 180);
                
                const largeArcFlag = percentage > 50 ? 1 : 0;
                
                return (
                  <path
                    key={index}
                    d={`M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={colors[index % colors.length]}
                  />
                );
              })}
              <circle cx="50" cy="50" r="15" fill="white" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          {data.labels.map((label, index) => {
            const value = data.datasets[0].data[index];
            const percentage = ((value / total) * 100).toFixed(1);
            
            return (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm">{label}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {value} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCard({ 
  title, 
  value, 
  description, 
  trend, 
  icon: Icon,
  className = "" 
}: {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center space-x-1 mt-1">
            <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MetricGrid({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {children}
    </div>
  );
}
