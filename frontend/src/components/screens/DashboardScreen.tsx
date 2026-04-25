import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Activity, Trophy, Clock, Zap } from 'lucide-react';

const data = [
  { name: 'Mon', reps: 40, energy: 2400 },
  { name: 'Tue', reps: 30, energy: 1398 },
  { name: 'Wed', reps: 20, energy: 9800 },
  { name: 'Thu', reps: 27, energy: 3908 },
  { name: 'Fri', reps: 18, energy: 4800 },
  { name: 'Sat', reps: 23, energy: 3800 },
  { name: 'Sun', reps: 34, energy: 4300 },
];

export function DashboardScreen() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      <h1 className="text-3xl audiowide-regular text-cyan-400 mb-8">PROGRESS DASHBOARD</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reps', value: '1,284', icon: Activity, color: 'text-cyan-400' },
          { label: 'Win Rate', value: '68%', icon: Trophy, color: 'text-yellow-400' },
          { label: 'Active Time', value: '12.4h', icon: Clock, color: 'text-purple-400' },
          { label: 'Avg Intensity', value: '8.2', icon: Zap, color: 'text-orange-400' },
        ].map((stat, i) => (
          <Card key={i} className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-300">WEEKLY REP VOLUME</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorReps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#00f2ff' }}
                />
                <Area type="monotone" dataKey="reps" stroke="#00f2ff" fillOpacity={1} fill="url(#colorReps)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Energy Burn Chart */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-300">INTENSITY TREND</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Bar dataKey="energy" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Motivational Quote */}
      <div className="p-8 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-3xl border border-cyan-500/10 text-center">
        <p className="text-xl italic text-cyan-100 opacity-80">
          "The distance between who you are and who you want to be is only separated by what you do."
        </p>
        <p className="mt-2 text-xs uppercase tracking-widest text-cyan-400">— FORGEBOT MENTOR</p>
      </div>
    </div>
  );
}
