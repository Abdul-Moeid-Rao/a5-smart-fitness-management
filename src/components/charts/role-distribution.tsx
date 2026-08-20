"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

export interface DistributionItem {
  role: string;
  count: number;
}

const COLORS: Record<string, string> = {
  admin: "#2563eb",
  trainer: "#0ea5e9",
  user: "#93c5fd",
};

interface RoleDistributionProps {
  data: DistributionItem[];
  height?: number;
}

export function RoleDistribution({ data, height = 260 }: RoleDistributionProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="role"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell key={entry.role} fill={COLORS[entry.role] ?? "#94a3b8"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
          formatter={(value, name) => [`${value} users`, name]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-xs capitalize text-slate-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
