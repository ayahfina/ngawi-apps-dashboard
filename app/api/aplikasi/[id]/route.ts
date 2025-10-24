import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { aplikasi, perangkatDaerah, bahasaPemrograman, framework, pic, vendor, aplikasiVendor } from '@/db/schema';
import { authenticate, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { aplikasiUpdateSchema } from '@/lib/validations';

// GET /api/aplikasi/[id] - Get single aplikasi with all relationships
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        // Get aplikasi with main relationships
        const aplikasiResult = await db
            .select({
                id: aplikasi.id,
                nama: aplikasi.nama,
                deskripsi: aplikasi.deskripsi,
                status: aplikasi.status,
                platform: aplikasi.platform,
                urlAplikasi: aplikasi.urlAplikasi,
                tahunDibuat: aplikasi.tahunDibuat,
                anggaran: aplikasi.anggaran,
                idPerangkatDaerah: aplikasi.idPerangkatDaerah,
                idBahasa: aplikasi.idBahasa,
                idFramework: aplikasi.idFramework,
                createdAt: aplikasi.createdAt,
                updatedAt: aplikasi.updatedAt,
                perangkatDaerah: {
                    id: perangkatDaerah.id,
                    nama: perangkatDaerah.nama,
                    jenis: perangkatDaerah.jenis,
                    alamat: perangkatDaerah.alamat,
                    kepalaDinas: perangkatDaerah.kepalaDinas,
                },
                bahasaPemrograman: {
                    id: bahasaPemrograman.id,
                    nama: bahasaPemrograman.nama,
                },
                framework: {
                    id: framework.id,
                    nama: framework.nama,
                },
            })
            .from(aplikasi)
            .leftJoin(perangkatDaerah, eq(aplikasi.idPerangkatDaerah, perangkatDaerah.id))
            .leftJoin(bahasaPemrograman, eq(aplikasi.idBahasa, bahasaPemrograman.id))
            .leftJoin(framework, eq(aplikasi.idFramework, framework.id))
            .where(eq(aplikasi.id, id))
            .limit(1);

        if (aplikasiResult.length === 0) {
            return createErrorResponse('Aplikasi tidak ditemukan', 404);
        }

        // Get PIC data
        const picResult = await db
            .select()
            .from(pic)
            .where(eq(pic.idAplikasi, id));

        // Get vendor data
        const vendorResult = await db
            .select({
                id: vendor.id,
                namaVendor: vendor.namaVendor,
                kontak: vendor.kontak,
                alamat: vendor.alamat,
            })
            .from(vendor)
            .innerJoin(aplikasiVendor, eq(vendor.id, aplikasiVendor.idVendor))
            .where(eq(aplikasiVendor.idAplikasi, id));

        const result = {
            ...aplikasiResult[0],
            pic: picResult,
            vendors: vendorResult,
        };

        return createSuccessResponse(result);

    } catch (error) {
        console.error('Error fetching aplikasi:', error);
        return createErrorResponse('Gagal mengambil data aplikasi', 500);
    }
}

// PUT /api/aplikasi/[id] - Update aplikasi
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authenticate user
        await authenticate(request);

        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        const body = await request.json();
        const validatedData = aplikasiUpdateSchema.parse(body);

        // Check if aplikasi exists
        const existing = await db
            .select()
            .from(aplikasi)
            .where(eq(aplikasi.id, id))
            .limit(1);

        if (existing.length === 0) {
            return createErrorResponse('Aplikasi tidak ditemukan', 404);
        }

        // Validate foreign keys if provided
        if (validatedData.idPerangkatDaerah) {
            const perangkatExists = await db
                .select({ id: perangkatDaerah.id })
                .from(perangkatDaerah)
                .where(eq(perangkatDaerah.id, validatedData.idPerangkatDaerah))
                .limit(1);

            if (perangkatExists.length === 0) {
                return createErrorResponse('Perangkat daerah tidak ditemukan', 400);
            }
        }

        if (validatedData.idBahasa) {
            const bahasaExists = await db
                .select({ id: bahasaPemrograman.id })
                .from(bahasaPemrograman)
                .where(eq(bahasaPemrograman.id, validatedData.idBahasa))
                .limit(1);

            if (bahasaExists.length === 0) {
                return createErrorResponse('Bahasa pemrograman tidak ditemukan', 400);
            }
        }

        if (validatedData.idFramework) {
            const frameworkExists = await db
                .select({ id: framework.id })
                .from(framework)
                .where(eq(framework.id, validatedData.idFramework))
                .limit(1);

            if (frameworkExists.length === 0) {
                return createErrorResponse('Framework tidak ditemukan', 400);
            }
        }

        const result = await db
            .update(aplikasi)
            .set({
                ...validatedData,
                updatedAt: new Date(),
            })
            .where(eq(aplikasi.id, id))
            .returning();

        // Fetch the complete updated record
        const completeResult = await db
            .select({
                id: aplikasi.id,
                nama: aplikasi.nama,
                deskripsi: aplikasi.deskripsi,
                status: aplikasi.status,
                platform: aplikasi.platform,
                urlAplikasi: aplikasi.urlAplikasi,
                tahunDibuat: aplikasi.tahunDibuat,
                anggaran: aplikasi.anggaran,
                idPerangkatDaerah: aplikasi.idPerangkatDaerah,
                idBahasa: aplikasi.idBahasa,
                idFramework: aplikasi.idFramework,
                createdAt: aplikasi.createdAt,
                updatedAt: aplikasi.updatedAt,
                perangkatDaerah: {
                    id: perangkatDaerah.id,
                    nama: perangkatDaerah.nama,
                    jenis: perangkatDaerah.jenis,
                },
                bahasaPemrograman: {
                    id: bahasaPemrograman.id,
                    nama: bahasaPemrograman.nama,
                },
                framework: {
                    id: framework.id,
                    nama: framework.nama,
                },
            })
            .from(aplikasi)
            .leftJoin(perangkatDaerah, eq(aplikasi.idPerangkatDaerah, perangkatDaerah.id))
            .leftJoin(bahasaPemrograman, eq(aplikasi.idBahasa, bahasaPemrograman.id))
            .leftJoin(framework, eq(aplikasi.idFramework, framework.id))
            .where(eq(aplikasi.id, result[0].id))
            .limit(1);

        return createSuccessResponse(completeResult[0], 'Aplikasi berhasil diperbarui');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error updating aplikasi:', error);
        return createErrorResponse('Gagal memperbarui aplikasi', 500);
    }
}

// DELETE /api/aplikasi/[id] - Delete aplikasi
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authenticate user
        await authenticate(request);

        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        // Check if aplikasi exists
        const existing = await db
            .select()
            .from(aplikasi)
            .where(eq(aplikasi.id, id))
            .limit(1);

        if (existing.length === 0) {
            return createErrorResponse('Aplikasi tidak ditemukan', 404);
        }

        // Delete related records (cascade will handle most, but we'll be explicit)
        await db.delete(pic).where(eq(pic.idAplikasi, id));
        await db.delete(aplikasiVendor).where(eq(aplikasiVendor.idAplikasi, id));
        await db.delete(aplikasi).where(eq(aplikasi.id, id));

        return createSuccessResponse(null, 'Aplikasi berhasil dihapus');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error deleting aplikasi:', error);
        return createErrorResponse('Gagal menghapus aplikasi', 500);
    }
}