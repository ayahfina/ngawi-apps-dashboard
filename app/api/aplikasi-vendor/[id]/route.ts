import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { aplikasiVendor, aplikasi, vendor } from '@/db/schema';
import { authenticate, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';

// GET /api/aplikasi-vendor/[id] - Get single aplikasi-vendor relationship
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        const result = await db
            .select({
                id: aplikasiVendor.id,
                idAplikasi: aplikasiVendor.idAplikasi,
                idVendor: aplikasiVendor.idVendor,
                createdAt: aplikasiVendor.createdAt,
                aplikasi: {
                    id: aplikasi.id,
                    nama: aplikasi.nama,
                    deskripsi: aplikasi.deskripsi,
                    status: aplikasi.status,
                    platform: aplikasi.platform,
                    urlAplikasi: aplikasi.urlAplikasi,
                    tahunDibuat: aplikasi.tahunDibuat,
                },
                vendor: {
                    id: vendor.id,
                    namaVendor: vendor.namaVendor,
                    kontak: vendor.kontak,
                    alamat: vendor.alamat,
                },
            })
            .from(aplikasiVendor)
            .innerJoin(aplikasi, eq(aplikasiVendor.idAplikasi, aplikasi.id))
            .innerJoin(vendor, eq(aplikasiVendor.idVendor, vendor.id))
            .where(eq(aplikasiVendor.id, id))
            .limit(1);

        if (result.length === 0) {
            return createErrorResponse('Hubungan aplikasi-vendor tidak ditemukan', 404);
        }

        return createSuccessResponse(result[0]);

    } catch (error) {
        console.error('Error fetching aplikasi-vendor relationship:', error);
        return createErrorResponse('Gagal mengambil data hubungan aplikasi-vendor', 500);
    }
}

// DELETE /api/aplikasi-vendor/[id] - Delete aplikasi-vendor relationship
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authenticate user
        await authenticate(request);

        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        // Check if relationship exists
        const existing = await db
            .select()
            .from(aplikasiVendor)
            .where(eq(aplikasiVendor.id, id))
            .limit(1);

        if (existing.length === 0) {
            return createErrorResponse('Hubungan aplikasi-vendor tidak ditemukan', 404);
        }

        await db.delete(aplikasiVendor).where(eq(aplikasiVendor.id, id));

        return createSuccessResponse(null, 'Hubungan aplikasi-vendor berhasil dihapus');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error deleting aplikasi-vendor relationship:', error);
        return createErrorResponse('Gagal menghapus hubungan aplikasi-vendor', 500);
    }
}