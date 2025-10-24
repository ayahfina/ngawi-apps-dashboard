import { z } from 'zod';

// Perangkat Daerah validation
export const perangkatDaerahSchema = z.object({
    nama: z.string().min(1, 'Nama wajib diisi').max(255),
    jenis: z.string().max(100).optional(),
    alamat: z.string().optional(),
    kepalaDinas: z.string().max(255).optional(),
});

export const perangkatDaerahUpdateSchema = perangkatDaerahSchema.partial();

// Bahasa Pemrograman validation
export const bahasaPemrogramanSchema = z.object({
    nama: z.string().min(1, 'Nama bahasa pemrograman wajib diisi').max(100),
});

export const bahasaPemrogramanUpdateSchema = bahasaPemrogramanSchema.partial();

// Framework validation
export const frameworkSchema = z.object({
    nama: z.string().min(1, 'Nama framework wajib diisi').max(100),
});

export const frameworkUpdateSchema = frameworkSchema.partial();

// Aplikasi validation
export const aplikasiSchema = z.object({
    nama: z.string().min(1, 'Nama aplikasi wajib diisi').max(255),
    deskripsi: z.string().optional(),
    status: z.enum(['aktif', 'tidak aktif', 'pengembangan', 'maintenance']).optional(),
    platform: z.enum(['web', 'mobile', 'desktop', 'hybrid']).optional(),
    urlAplikasi: z.string().url('URL tidak valid').optional().or(z.literal('')),
    tahunDibuat: z.coerce.number().min(1990).max(new Date().getFullYear() + 1).optional(),
    anggaran: z.coerce.number().min(0).optional(),
    idPerangkatDaerah: z.coerce.number().positive().optional(),
    idBahasa: z.coerce.number().positive().optional(),
    idFramework: z.coerce.number().positive().optional(),
});

export const aplikasiUpdateSchema = aplikasiSchema.partial();

// PIC validation
export const picSchema = z.object({
    nama: z.string().min(1, 'Nama PIC wajib diisi').max(255),
    jabatan: z.string().max(255).optional(),
    kontak: z.string().max(100).optional(),
    idAplikasi: z.coerce.number().positive(),
});

export const picUpdateSchema = picSchema.partial();

// Vendor validation
export const vendorSchema = z.object({
    namaVendor: z.string().min(1, 'Nama vendor wajib diisi').max(255),
    kontak: z.string().max(100).optional(),
    alamat: z.string().optional(),
});

export const vendorUpdateSchema = vendorSchema.partial();

// Aplikasi Vendor validation
export const aplikasiVendorSchema = z.object({
    idAplikasi: z.coerce.number().positive(),
    idVendor: z.coerce.number().positive(),
});

export const aplikasiVendorUpdateSchema = aplikasiVendorSchema.partial();

// Export all schemas
export const schemas = {
    perangkatDaerah: perangkatDaerahSchema,
    perangkatDaerahUpdate: perangkatDaerahUpdateSchema,
    bahasaPemrograman: bahasaPemrogramanSchema,
    bahasaPemrogramanUpdate: bahasaPemrogramanUpdateSchema,
    framework: frameworkSchema,
    frameworkUpdate: frameworkUpdateSchema,
    aplikasi: aplikasiSchema,
    aplikasiUpdate: aplikasiUpdateSchema,
    pic: picSchema,
    picUpdate: picUpdateSchema,
    vendor: vendorSchema,
    vendorUpdate: vendorUpdateSchema,
    aplikasiVendor: aplikasiVendorSchema,
    aplikasiVendorUpdate: aplikasiVendorUpdateSchema,
};

// Type exports
export type PerangkatDaerahInput = z.infer<typeof perangkatDaerahSchema>;
export type PerangkatDaerahUpdateInput = z.infer<typeof perangkatDaerahUpdateSchema>;
export type BahasaPemrogramanInput = z.infer<typeof bahasaPemrogramanSchema>;
export type BahasaPemrogramanUpdateInput = z.infer<typeof bahasaPemrogramanUpdateSchema>;
export type FrameworkInput = z.infer<typeof frameworkSchema>;
export type FrameworkUpdateInput = z.infer<typeof frameworkUpdateSchema>;
export type AplikasiInput = z.infer<typeof aplikasiSchema>;
export type AplikasiUpdateInput = z.infer<typeof aplikasiUpdateSchema>;
export type PicInput = z.infer<typeof picSchema>;
export type PicUpdateInput = z.infer<typeof picUpdateSchema>;
export type VendorInput = z.infer<typeof vendorSchema>;
export type VendorUpdateInput = z.infer<typeof vendorUpdateSchema>;
export type AplikasiVendorInput = z.infer<typeof aplikasiVendorSchema>;
export type AplikasiVendorUpdateInput = z.infer<typeof aplikasiVendorUpdateSchema>;