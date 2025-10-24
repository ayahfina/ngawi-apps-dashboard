"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { IconArrowLeft, IconEdit, IconTrash, IconExternalLink, IconUser, IconBuildingStore, IconCalendar, IconMoney } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface AplikasiDetail {
  id: number
  nama: string
  deskripsi: string | null
  status: string | null
  platform: string | null
  urlAplikasi: string | null
  tahunDibuat: number | null
  anggaran: number | null
  createdAt: string
  updatedAt: string
  perangkatDaerah: {
    id: number
    nama: string
    jenis: string | null
    alamat: string | null
    kepalaDinas: string | null
  } | null
  bahasaPemrograman: {
    id: number
    nama: string
  } | null
  framework: {
    id: number
    nama: string
  } | null
  pic: Array<{
    id: number
    nama: string
    jabatan: string | null
    kontak: string | null
  }>
  vendors: Array<{
    id: number
    namaVendor: string
    kontak: string | null
    alamat: string | null
  }>
}

export default function AplikasiDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<AplikasiDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/aplikasi/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setApplication(data.data)
          }
        } else if (response.status === 404) {
          toast.error("Aplikasi tidak ditemukan")
          router.push("/dashboard/aplikasi")
        } else {
          toast.error("Gagal memuat data aplikasi")
        }
      } catch (error) {
        console.error("Error fetching application:", error)
        toast.error("Terjadi kesalahan saat memuat data")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchApplication()
    }
  }, [params.id, router])

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/aplikasi/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Aplikasi berhasil dihapus")
        router.push("/dashboard/aplikasi")
      } else {
        const error = await response.json()
        toast.error(error.error || "Gagal menghapus aplikasi")
      }
    } catch (error) {
      console.error("Error deleting application:", error)
      toast.error("Terjadi kesalahan saat menghapus aplikasi")
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const getStatusVariant = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "aktif":
        return "default"
      case "tidak aktif":
        return "destructive"
      case "pengembangan":
        return "secondary"
      case "maintenance":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "-"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPlatformIcon = (platform: string | null) => {
    switch (platform?.toLowerCase()) {
      case "web":
        return "🌐"
      case "mobile":
        return "📱"
      case "desktop":
        return "🖥️"
      case "hybrid":
        return "🔄"
      default:
        return "💻"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/aplikasi">
            <Button variant="outline" size="sm">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
            <p className="text-muted-foreground">Memuat data aplikasi</p>
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/aplikasi">
            <Button variant="outline" size="sm">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aplikasi Tidak Ditemukan</h1>
            <p className="text-muted-foreground">Aplikasi yang Anda cari tidak ditemukan</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/aplikasi">
            <Button variant="outline" size="sm">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getPlatformIcon(application.platform)}</span>
              <h1 className="text-3xl font-bold tracking-tight">{application.nama}</h1>
            </div>
            <p className="text-muted-foreground">
              Detail informasi aplikasi Pemerintah Kabupaten Ngawi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/aplikasi/${application.id}/edit`}>
            <Button variant="outline">
              <IconEdit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Informasi Umum */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Umum</CardTitle>
              <CardDescription>Informasi dasar tentang aplikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(application.status)}>
                      {application.status || "Tidak diketahui"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Platform</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {application.platform || "Tidak diketahui"}
                    </Badge>
                  </div>
                </div>
              </div>

              {application.deskripsi && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                  <p className="mt-1 text-sm">{application.deskripsi}</p>
                </div>
              )}

              {application.urlAplikasi && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">URL Aplikasi</label>
                  <div className="mt-1">
                    <Link
                      href={application.urlAplikasi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {application.urlAplikasi}
                      <IconExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {application.tahunDibuat && (
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tahun Dibuat</label>
                      <p className="text-sm">{application.tahunDibuat}</p>
                    </div>
                  </div>
                )}
                {application.anggaran && (
                  <div className="flex items-center gap-2">
                    <IconMoney className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Anggaran</label>
                      <p className="text-sm">{formatCurrency(application.anggaran)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Teknologi */}
          <Card>
            <CardHeader>
              <CardTitle>Teknologi</CardTitle>
              <CardDescription>Stack teknologi yang digunakan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {application.bahasaPemrograman && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bahasa Pemrograman</label>
                    <div className="mt-1">
                      <Badge variant="outline">{application.bahasaPemrograman.nama}</Badge>
                    </div>
                  </div>
                )}
                {application.framework && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Framework</label>
                    <div className="mt-1">
                      <Badge variant="outline">{application.framework.nama}</Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Perangkat Daerah */}
          {application.perangkatDaerah && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconBuildingStore className="h-5 w-5" />
                  Perangkat Daerah
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="font-medium">{application.perangkatDaerah.nama}</p>
                    <p className="text-sm text-muted-foreground">{application.perangkatDaerah.jenis}</p>
                  </div>
                  {application.perangkatDaerah.kepalaDinas && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Kepala Dinas</label>
                      <p className="text-sm">{application.perangkatDaerah.kepalaDinas}</p>
                    </div>
                  )}
                  {application.perangkatDaerah.alamat && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Alamat</label>
                      <p className="text-sm">{application.perangkatDaerah.alamat}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* PIC */}
          {application.pic.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconUser className="h-5 w-5" />
                  Person In Charge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {application.pic.map((pic) => (
                    <div key={pic.id} className="border rounded-lg p-3">
                      <p className="font-medium">{pic.nama}</p>
                      {pic.jabatan && (
                        <p className="text-sm text-muted-foreground">{pic.jabatan}</p>
                      )}
                      {pic.kontak && (
                        <p className="text-sm text-blue-600">{pic.kontak}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vendor */}
          {application.vendors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Vendor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {application.vendors.map((vendor) => (
                    <div key={vendor.id} className="border rounded-lg p-3">
                      <p className="font-medium">{vendor.namaVendor}</p>
                      {vendor.kontak && (
                        <p className="text-sm text-blue-600">{vendor.kontak}</p>
                      )}
                      {vendor.alamat && (
                        <p className="text-sm text-muted-foreground">{vendor.alamat}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <label className="text-muted-foreground">Dibuat pada</label>
                  <p>{formatDate(application.createdAt)}</p>
                </div>
                <div>
                  <label className="text-muted-foreground">Diperbarui pada</label>
                  <p>{formatDate(application.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus aplikasi "{application.nama}"? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}