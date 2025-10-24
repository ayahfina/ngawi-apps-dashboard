"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

interface DashboardStats {
  aplikasiByStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
  aplikasiByPlatform: Array<{
    platform: string
    count: number
    percentage: number
  }>
  topPerangkatDaerah: Array<{
    id: number
    nama: string
    jenis: string
    aplikasiCount: number
  }>
  popularBahasa: Array<{
    id: number
    nama: string
    count: number
  }>
  popularFramework: Array<{
    id: number
    nama: string
    count: number
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function DashboardCharts() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setStats(data.data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex items-center justify-center h-64 border rounded-lg">
          <p className="text-muted-foreground">Loading charts...</p>
        </div>
        <div className="flex items-center justify-center h-64 border rounded-lg">
          <p className="text-muted-foreground">Loading charts...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <p className="text-muted-foreground">Gagal memuat data grafik</p>
      </div>
    )
  }

  // Transform data for charts
  const statusData = stats.aplikasiByStatus.map(item => ({
    name: item.status || 'Tidak diketahui',
    value: item.count,
    percentage: item.percentage
  }))

  const platformData = stats.aplikasiByPlatform.map(item => ({
    name: item.platform || 'Tidak diketahui',
    value: item.count,
    percentage: item.percentage
  }))

  const perangkatDaerahData = stats.topPerangkatDaerah.slice(0, 5).map(item => ({
    name: item.nama.length > 20 ? item.nama.substring(0, 20) + '...' : item.nama,
    value: item.aplikasiCount,
    fullName: item.nama
  }))

  const bahasaData = stats.popularBahasa.slice(0, 5).map(item => ({
    name: item.nama,
    value: item.count
  }))

  const frameworkData = stats.popularFramework.slice(0, 5).map(item => ({
    name: item.nama,
    value: item.count
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Chart */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Status Aplikasi</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Chart */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Platform Aplikasi</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={platformData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded shadow-lg">
                      <p className="font-semibold">{payload[0].payload.name}</p>
                      <p className="text-sm">Jumlah: {payload[0].value}</p>
                      <p className="text-sm">Persentase: {payload[0].payload.percentage}%</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="value" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Perangkat Daerah */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Top 5 Perangkat Daerah</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={perangkatDaerahData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={120} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded shadow-lg">
                      <p className="font-semibold">{payload[0].payload.fullName}</p>
                      <p className="text-sm">Jumlah Aplikasi: {payload[0].value}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="value" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Technology Stack */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Teknologi Populer</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Bahasa Pemrograman</h4>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={bahasaData}>
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Framework</h4>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={frameworkData}>
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}