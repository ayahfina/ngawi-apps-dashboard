"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { IconArrowLeft, IconSave } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ComboboxWithCreate } from "@/components/ui/combobox-with-create"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"

interface PerangkatDaerah {
  id: number
  nama: string
  jenis: string | null
}

interface BahasaPemrograman {
  id: number
  nama: string
}

interface Framework {
  id: number
  nama: string
}

interface AplikasiDetail {
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
}

export default function EditAplikasiPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [perangkatDaerahList, setPerangkatDaerahList] = useState<PerangkatDaerah[]>([])
  const [bahasaList, setBahasaList] = useState<BahasaPemrograman[]>([])
  const [frameworkList, setFrameworkList] = useState<Framework[]>([])

  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    status: "",
    platform: "",
    urlAplikasi: "",
    tahunDibuat: "",
    anggaran: "",
    idPerangkatDaerah: "",
    idBahasa: "",
    idFramework: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load current application data
        const appResponse = await fetch(`/api/aplikasi/${params.id}`)
        if (appResponse.ok) {
          const appData = await appResponse.json()
          if (appData.success) {
            const app = appData.data
            setFormData({
              nama: app.nama || "",
              deskripsi: app.deskripsi || "",
              status: app.status || "",
              platform: app.platform || "",
              urlAplikasi: app.urlAplikasi || "",
              tahunDibuat: app.tahunDibuat?.toString() || "",
              anggaran: app.anggaran?.toString() || "",
              idPerangkatDaerah: app.idPerangkatDaerah?.toString() || "",
              idBahasa: app.idBahasa?.toString() || "",
              idFramework: app.idFramework?.toString() || "",
            })
          }
        } else if (appResponse.status === 404) {
          toast.error("Aplikasi tidak ditemukan")
          router.push("/dashboard/aplikasi")
          return
        }

        // Load dropdown data
        const [perangkatRes, bahasaRes, frameworkRes] = await Promise.all([
          fetch("/api/perangkat-daerah?limit=100"),
          fetch("/api/bahasa-pemrograman?limit=100"),
          fetch("/api/framework?limit=100"),
        ])

        if (perangkatRes.ok) {
          const perangkatData = await perangkatRes.json()
          if (perangkatData.success) {
            setPerangkatDaerahList(perangkatData.data.data || [])
          }
        }

        if (bahasaRes.ok) {
          const bahasaData = await bahasaRes.json()
          if (bahasaData.success) {
            setBahasaList(bahasaData.data.data || [])
          }
        }

        if (frameworkRes.ok) {
          const frameworkData = await frameworkRes.json()
          if (frameworkData.success) {
            setFrameworkList(frameworkData.data.data || [])
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Gagal memuat data")
      } finally {
        setInitialLoading(false)
      }
    }

    if (params.id) {
      loadData()
    }
  }, [params.id, router, refreshKey])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama aplikasi wajib diisi"
    }

    if (formData.urlAplikasi && !isValidUrl(formData.urlAplikasi)) {
      newErrors.urlAplikasi = "URL tidak valid"
    }

    if (formData.tahunDibuat && (isNaN(Number(formData.tahunDibuat)) || Number(formData.tahunDibuat) < 1990 || Number(formData.tahunDibuat) > new Date().getFullYear() + 1)) {
      newErrors.tahunDibuat = "Tahun tidak valid"
    }

    if (formData.anggaran && (isNaN(Number(formData.anggaran)) || Number(formData.anggaran) < 0)) {
      newErrors.anggaran = "Anggaran harus berupa angka positif"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string: string) => {
    if (!string) return true
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Periksa kembali input Anda")
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        tahunDibuat: formData.tahunDibuat ? Number(formData.tahunDibuat) : null,
        anggaran: formData.anggaran ? Number(formData.anggaran) : null,
        idPerangkatDaerah: formData.idPerangkatDaerah ? Number(formData.idPerangkatDaerah) : null,
        idBahasa: formData.idBahasa ? Number(formData.idBahasa) : null,
        idFramework: formData.idFramework ? Number(formData.idFramework) : null,
      }

      const response = await fetch(`/api/aplikasi/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("Aplikasi berhasil diperbarui")
        router.push(`/dashboard/aplikasi/${data.data.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || "Gagal memperbarui aplikasi")
      }
    } catch (error) {
      console.error("Error updating application:", error)
      toast.error("Terjadi kesalahan saat memperbarui aplikasi")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/aplikasi/${params.id}`}>
          <Button variant="outline" size="sm">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Aplikasi</h1>
          <p className="text-muted-foreground">
            Perbarui informasi aplikasi yang ada
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informasi Dasar */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>
                Informasi umum tentang aplikasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Aplikasi *</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => handleInputChange("nama", e.target.value)}
                    placeholder="Masukkan nama aplikasi"
                    className={errors.nama ? "border-red-500" : ""}
                  />
                  {errors.nama && (
                    <p className="text-sm text-red-500">{errors.nama}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urlAplikasi">URL Aplikasi</Label>
                  <Input
                    id="urlAplikasi"
                    value={formData.urlAplikasi}
                    onChange={(e) => handleInputChange("urlAplikasi", e.target.value)}
                    placeholder="https://contoh.com"
                    className={errors.urlAplikasi ? "border-red-500" : ""}
                  />
                  {errors.urlAplikasi && (
                    <p className="text-sm text-red-500">{errors.urlAplikasi}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => handleInputChange("deskripsi", e.target.value)}
                  placeholder="Deskripsikan fungsi dan fitur aplikasi"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Klasifikasi */}
          <Card>
            <CardHeader>
              <CardTitle>Klasifikasi</CardTitle>
              <CardDescription>
                Kategori dan status aplikasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Pilih Status</SelectItem>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="tidak aktif">Tidak Aktif</SelectItem>
                    <SelectItem value="pengembangan">Pengembangan</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => handleInputChange("platform", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Pilih Platform</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tahunDibuat">Tahun Dibuat</Label>
                  <Input
                    id="tahunDibuat"
                    type="number"
                    value={formData.tahunDibuat}
                    onChange={(e) => handleInputChange("tahunDibuat", e.target.value)}
                    placeholder="2024"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    className={errors.tahunDibuat ? "border-red-500" : ""}
                  />
                  {errors.tahunDibuat && (
                    <p className="text-sm text-red-500">{errors.tahunDibuat}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anggaran">Anggaran (IDR)</Label>
                  <Input
                    id="anggaran"
                    type="number"
                    value={formData.anggaran}
                    onChange={(e) => handleInputChange("anggaran", e.target.value)}
                    placeholder="100000000"
                    min="0"
                    className={errors.anggaran ? "border-red-500" : ""}
                  />
                  {errors.anggaran && (
                    <p className="text-sm text-red-500">{errors.anggaran}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Relasi */}
          <Card>
            <CardHeader>
              <CardTitle>Relasi</CardTitle>
              <CardDescription>
                Hubungkan aplikasi dengan entitas terkait
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idPerangkatDaerah">Perangkat Daerah</Label>
                <ComboboxWithCreate
                  options={perangkatDaerahList.map((pd) => ({
                    value: pd.id.toString(),
                    label: pd.nama,
                    description: pd.jenis || undefined,
                  }))}
                  value={formData.idPerangkatDaerah}
                  onChange={(value) => handleInputChange("idPerangkatDaerah", value)}
                  placeholder="Pilih perangkat daerah"
                  emptyMessage="Tidak ada perangkat daerah ditemukan."
                  createDialogTitle="Perangkat Daerah"
                  createDialogDescription="Tambah perangkat daerah baru"
                  createApiEndpoint="/api/perangkat-daerah"
                  createFields={[
                    {
                      name: "nama",
                      label: "Nama Perangkat Daerah",
                      type: "text",
                      placeholder: "Masukkan nama perangkat daerah",
                      required: true,
                    },
                    {
                      name: "jenis",
                      label: "Jenis",
                      type: "text",
                      placeholder: "Dinas, Badan, Kantor, dll",
                    },
                    {
                      name: "alamat",
                      label: "Alamat",
                      type: "textarea",
                      placeholder: "Masukkan alamat lengkap",
                    },
                    {
                      name: "kepalaDinas",
                      label: "Kepala Dinas",
                      type: "text",
                      placeholder: "Nama kepala dinan",
                    },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idBahasa">Bahasa Pemrograman</Label>
                <ComboboxWithCreate
                  options={bahasaList.map((bahasa) => ({
                    value: bahasa.id.toString(),
                    label: bahasa.nama,
                  }))}
                  value={formData.idBahasa}
                  onChange={(value) => handleInputChange("idBahasa", value)}
                  placeholder="Pilih bahasa pemrograman"
                  emptyMessage="Tidak ada bahasa pemrograman ditemukan."
                  createDialogTitle="Bahasa Pemrograman"
                  createDialogDescription="Tambah bahasa pemrograman baru"
                  createApiEndpoint="/api/bahasa-pemrograman"
                  createFields={[
                    {
                      name: "nama",
                      label: "Nama Bahasa Pemrograman",
                      type: "text",
                      placeholder: "JavaScript, Python, PHP, dll",
                      required: true,
                    },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idFramework">Framework</Label>
                <ComboboxWithCreate
                  options={frameworkList.map((framework) => ({
                    value: framework.id.toString(),
                    label: framework.nama,
                  }))}
                  value={formData.idFramework}
                  onChange={(value) => handleInputChange("idFramework", value)}
                  placeholder="Pilih framework"
                  emptyMessage="Tidak ada framework ditemukan."
                  createDialogTitle="Framework"
                  createDialogDescription="Tambah framework baru"
                  createApiEndpoint="/api/framework"
                  createFields={[
                    {
                      name: "nama",
                      label: "Nama Framework",
                      type: "text",
                      placeholder: "React, Laravel, Django, dll",
                      required: true,
                    },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href={`/dashboard/aplikasi/${params.id}`}>
            <Button variant="outline" type="button">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <IconSave className="mr-2 h-4 w-4" />
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  )
}