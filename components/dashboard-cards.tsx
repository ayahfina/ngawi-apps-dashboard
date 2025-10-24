"use client"

import { useEffect, useState } from "react"
import { IconBuilding, IconCode, IconUsers, IconBrandJavascript } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DashboardStats {
  summary: {
    totalAplikasi: number
    totalPerangkatDaerah: number
    totalPerangkatDaerahWithApps: number
    totalPic: number
    totalVendor: number
    totalBahasaPemrograman: number
    totalFramework: number
    totalAnggaran: number
  }
  aplikasiByStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
}

export function DashboardCards() {
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
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <CardDescription>Loading...</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                --
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="px-4 lg:px-6">
        <p className="text-muted-foreground">Gagal memuat data dashboard</p>
      </div>
    )
  }

  const aktifCount = stats.aplikasiByStatus.find(item => item.status === 'aktif')?.count || 0
  const totalApps = stats.summary.totalAplikasi
  const aktifPercentage = totalApps > 0 ? Math.round((aktifCount / totalApps) * 100) : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Aplikasi</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalApps.toLocaleString('id-ID')}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconBrandJavascript className="size-4" />
              {aktifCount} aktif
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {aktifPercentage}% aplikasi aktif
          </div>
          <div className="text-muted-foreground">
            Total aplikasi yang terdaftar di sistem
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Perangkat Daerah</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.summary.totalPerangkatDaerahWithApps.toLocaleString('id-ID')}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconBuilding className="size-4" />
              dari {stats.summary.totalPerangkatDaerah}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.summary.totalPerangkatDaerahWithApps > 0 ? 'Ada aplikasi' : 'Belum ada aplikasi'}
          </div>
          <div className="text-muted-foreground">
            Perangkat daerah yang memiliki aplikasi
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total PIC</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.summary.totalPic.toLocaleString('id-ID')}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="size-4" />
              {stats.summary.totalVendor} vendor
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Person in Charge terdaftar
          </div>
          <div className="text-muted-foreground">
            Total PIC dan vendor yang terlibat
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Anggaran</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats.summary.totalAnggaran)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCode className="size-4" />
              {stats.summary.totalBahasaPemrograman} teknologi
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total investasi aplikasi
          </div>
          <div className="text-muted-foreground">
            {stats.summary.totalFramework} framework digunakan
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}