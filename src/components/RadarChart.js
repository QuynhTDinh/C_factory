"use client";

import { ResponsiveContainer, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

export default function RadarChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsRadar cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#e5e5e7" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#86868b', fontSize: 10, fontWeight: 700 }} />
                <Radar
                    name="Candidate"
                    dataKey="user"
                    stroke="#8B1D1D"
                    fill="#8B1D1D"
                    fillOpacity={0.6}
                />
                <Radar
                    name="Industry"
                    dataKey="target"
                    stroke="#005A31"
                    fill="#005A31"
                    fillOpacity={0.1}
                />
            </RechartsRadar>
        </ResponsiveContainer>
    );
}
