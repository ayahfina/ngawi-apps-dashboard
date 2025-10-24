import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { vendor, aplikasiVendor, aplikasi } from '@/db/schema';
import { authenticate, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { vendorUpdateSchema } from '@/lib/validations';

// GET /api/vendor/[id] - Get single vendor with aplikasi
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        const result = await db
            .select({
                id: vendor.id,
                namaVendor: vendor.namaVendor,
                kontak: vendor.kontak,
                alamat: vendor.alamat,
                createdAt: vendor.createdAt,
                updatedAt: vendor.updatedAt,
            })
            .from(vendor)
            .where(eq(vendor.id, id))
            .limit(1);

        if (result.length === 0) {
            return createErrorResponse('Vendor tidak ditemukan', 404);
        }

        // Get related aplikasi
        const aplikasiResult = await db
            .select({
                id: aplikasi.id,
                nama: aplikasi.nama,
                status: aplikasi.status,
                platform: aplikasi.platform,
                tahunDibuat: aplikasi.tahunDibuat,
            })
            .from(aplikasi)
            .innerJoin(aplikasiVendor, eq(aplikasi.id, aplikasiVendor.idAplikasi))
            .where(eq(aplikasiVendor.idVendor, id));

        const response = {
            ...result[0],
            aplikasi: aplikasiResult,
        };

        return createSuccessResponse(response);

    } catch (error) {
        console.error('Error fetching vendor:', error);
        return createErrorResponse('Gagal mengambil data vendor', 500);
    }
}

// PUT /api/vendor/[id] - Update vendor
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authenticate user
        await authenticate(request);

        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        const body = await request.json();
        const validatedData = vendorUpdateSchema.parse(body);

        // Check if vendor exists
        const existing = await db
            .select()
            .from(vendor)
            .where(eq(vendor.id, id))
            .limit(1);

        if (existing.length === 0) {
            return createErrorResponse('Vendor tidak ditemukan', 404);
        }

        const result = await db
            .update(vendor)
            .set({
                ...validatedData,
                updatedAt: new Date(),
            })
            .where(eq(vendor.id, id))
            .returning();

        return createSuccessResponse(result[0], 'Vendor berhasil diperbarui');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error updating vendor:', error);
        return createErrorResponse('Gagal memperbarui vendor', 500);
    }
}

// DELETE /api/vendor/[id] - Delete vendor
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authenticate user
        await authenticate(request);

        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        // Check if vendor exists
        const existing = await db
            .select()
            .from(vendor)
            .where(eq(vendor.id, id))
            .limit(1);

        if (existing.length === 0) {
            return createErrorResponse('Vendor tidak ditemukan', 404);
        }

        // Check if there are related applications
        const relatedApps = await db
            .select({ count: sql<number>`count(*)` })
            .from(aplikasiVendor)
            .where(eq(aplikasiVendor.idVendor, id));

        if (relatedApps[0].count > 0) {
            return createErrorResponse('Tidak dapat menghapus vendor yang memiliki aplikasi terkait', 400);
        }

        await db.delete(vendor).where(eq(vendor.id, id));

        return createSuccessResponse(null, 'Vendor berhasil dihapus');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error deleting vendor:', error);
        return createErrorResponse('Gagal menghapus vendor', 500);
    }
}