"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { IconPlus, IconEdit, IconTrash, IconEye, IconSearch, IconFilter } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface Aplikasi {
  id: number
  nama: string
  deskripsi: string | null
  status: string | null
  platform: string | null
  urlAplikasi: string | null
  tahunDibuat: number | null
  anggaran: number | null
  idPerangkatDaerah: number | null
  idBahasa: number | null
  idFramework: number | null
  createdAt: string
  updatedAt: string
  perangkatDaerah: {
    id: number
    nama: string
    jenis: string | null
  } | null
  bahasaPemrograman: {
    id: number
    nama: string
  } | null
  framework: {
    id: number
    nama: string
  } | null
}

interface PaginatedResponse {
  data: Aplikasi[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function AplikasiPage() {
  const [applications, setApplications] = useState<PaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState<number | null>(null)

  const fetchApplications = async (page: number = 1, searchQuery: string = "", statusFilter: string = "") => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
      })

      const response = await fetch(`/api/aplikasi?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApplications(data.data)
        }
      } else {
        toast.error("Gagal memuat data aplikasi")
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error("Terjadi kesalahan saat memuat data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications(currentPage, search, status)
  }, [currentPage, search, status])

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/aplikasi/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Aplikasi berhasil dihapus")
        fetchApplications(currentPage, search, status)
      } else {
        const error = await response.json()
        toast.error(error.error || "Gagal menghapus aplikasi")
      }
    } catch (error) {
      console.error("Error deleting application:", error)
      toast.error("Terjadi kesalahan saat menghapus aplikasi")
    } finally {
      setDeleteDialogOpen(false)
      setApplicationToDelete(null)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Aplikasi</h1>
          <p className="text-muted-foreground">
            Kelola semua aplikasi Pemerintah Kabupaten Ngawi
          </p>
        </div>
        <Link href="/dashboard/aplikasi/create">
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Tambah Aplikasi
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter dan Pencarian</CardTitle>
          <CardDescription>
            Cari dan filter aplikasi berdasarkan kriteria tertentu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama aplikasi, deskripsi, atau perangkat daerah..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={status} onValueChange={(value) => {
              setStatus(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="tidak aktif">Tidak Aktif</SelectItem>
                <SelectItem value="pengembangan">Pengembangan</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Aplikasi</CardTitle>
          <CardDescription>
            {applications ? `Menampilkan ${applications.data.length} dari ${applications.pagination.total} aplikasi` : "Memuat data..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : applications && applications.data.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Aplikasi</TableHead>
                      <TableHead>Perangkat Daerah</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Tahun</TableHead>
                      <TableHead>Anggaran</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.data.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getPlatformIcon(app.platform)}</span>
                              <div className="font-medium">{app.nama}</div>
                            </div>
                            {app.deskripsi && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {app.deskripsi}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {app.bahasaPemrograman && (
                                <Badge variant="outline" className="text-xs">
                                  {app.bahasaPemrograman.nama}
                                </Badge>
                              )}
                              {app.framework && (
                                <Badge variant="outline" className="text-xs">
                                  {app.framework.nama}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {app.perangkatDaerah ? (
                            <div>
                              <div className="font-medium">{app.perangkatDaerah.nama}</div>
                              <div className="text-sm text-muted-foreground">
                                {app.perangkatDaerah.jenis}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(app.status)}>
                            {app.status || "Tidak diketahui"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {app.platform || "Tidak diketahui"}
                          </Badge>
                        </TableCell>
                        <TableCell>{app.tahunDibuat || "-"}</TableCell>
                        <TableCell>{formatCurrency(app.anggaran)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/aplikasi/${app.id}`}>
                              <Button variant="outline" size="sm">
                                <IconEye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/aplikasi/${app.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <IconEdit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setApplicationToDelete(app.id)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {applications && applications.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Halaman {applications.pagination.page} dari {applications.pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!applications.pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!applications.pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Tidak ada aplikasi yang ditemukan</p>
              <Link href="/dashboard/aplikasi/create">
                <Button>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Tambah Aplikasi Pertama
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus aplikasi ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => applicationToDelete && handleDelete(applicationToDelete)}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}