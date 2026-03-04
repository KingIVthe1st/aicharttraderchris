import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const Chart = () => {
  const data = [
    { time: '09:00', price: 1220 },
    { time: '09:30', price: 1225 },
    { time: '10:00', price: 1218 },
    { time: '10:30', price: 1230 },
    { time: '11:00', price: 1228 },
    { time: '11:30', price: 1235 },
    { time: '12:00', price: 1240 },
    { time: '12:30', price: 1238 },
    { time: '13:00', price: 1245 },
    { time: '13:30', price: 1250 },
    { time: '14:00', price: 1248 },
    { time: '14:30', price: 1255 },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-white/10 rounded-lg p-3 shadow-lg">
          <p className="text-xs text-white/60 mb-1">{payload[0].payload.time}</p>
          <p className="text-sm font-semibold text-white">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1EAEDB" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            stroke="#ffffff20"
            tick={{ fill: '#ffffff60', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            stroke="#ffffff20"
            tick={{ fill: '#ffffff60', fontSize: 12 }}
            tickLine={false}
            domain={['dataMin - 10', 'dataMax + 10']}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={1245}
            stroke="#10B981"
            strokeDasharray="3 3"
            label={{ value: 'Entry', position: 'right', fill: '#10B981', fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#1EAEDB' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
