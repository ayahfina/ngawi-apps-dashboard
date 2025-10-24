"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { IconExternalLink, IconPlus, IconClock } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface RecentApplication {
  id: number
  nama: string
  status: string
  platform: string
  createdAt: string
  perangkatDaerah: string | null
}

export function RecentApplications() {
  const [applications, setApplications] = useState<RecentApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentApplications = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setApplications(data.data.recentAplikasi || [])
          }
        }
      } catch (error) {
        console.error('Failed to fetch recent applications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentApplications()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'aktif':
        return 'default'
      case 'tidak aktif':
        return 'destructive'
      case 'pengembangan':
        return 'secondary'
      case 'maintenance':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'web':
        return '🌐'
      case 'mobile':
        return '📱'
      case 'desktop':
        return '🖥️'
      case 'hybrid':
        return '🔄'
      default:
        return '💻'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconClock className="size-5" />
            Aplikasi Terbaru
          </CardTitle>
          <CardDescription>Memuat data aplikasi terbaru...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconClock className="size-5" />
              Aplikasi Terbaru
            </CardTitle>
            <CardDescription>5 aplikasi terakhir yang ditambahkan ke sistem</CardDescription>
          </div>
          <Link href="/dashboard/aplikasi">
            <Button variant="outline" size="sm">
              <IconPlus className="size-4 mr-2" />
              Lihat Semua
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Belum ada aplikasi yang terdaftar</p>
            <Link href="/dashboard/aplikasi/create">
              <Button className="mt-4" variant="outline">
                <IconPlus className="size-4 mr-2" />
                Tambah Aplikasi Pertama
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getPlatformIcon(app.platform)}</span>
                    <Link
                      href={`/dashboard/aplikasi/${app.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {app.nama}
                    </Link>
                    <Link
                      href={`/dashboard/aplikasi/${app.id}`}
                      target="_blank"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <IconExternalLink className="size-4" />
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {app.perangkatDaerah || 'Perangkat Daerah tidak diketahui'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(app.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(app.status)}>
                    {app.status || 'Status tidak diketahui'}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {app.platform || 'Platform tidak diketahui'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}