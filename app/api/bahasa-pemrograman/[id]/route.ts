import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { bahasaPemrograman, aplikasi } from '@/db/schema';
import { authenticate, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { bahasaPemrogramanUpdateSchema } from '@/lib/validations';

// GET /api/bahasa-pemrograman/[id] - Get single bahasa pemrograman
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        const result = await db
            .select({
                ...bahasaPemrograman,
                aplikasiCount: sql<number>`count(${aplikasi.id})`
            })
            .from(bahasaPemrograman)
            .leftJoin(aplikasi, eq(bahasaPemrograman.id, aplikasi.idBahasa))
            .where(eq(bahasaPemrograman.id, id))
            .groupBy(bahasaPemrograman.id)
            .limit(1);

        if (result.length === 0) {
            return createErrorResponse('Bahasa pemrograman tidak ditemukan', 404);
        }

        return createSuccessResponse(result[0]);

    } catch (error) {
        console.error('Error fetching bahasa pemrograman:', error);
        return createErrorResponse('Gagal mengambil data bahasa pemrograman', 500);
    }
}

// PUT /api/bahasa-pemrograman/[id] - Update bahasa pemrograman
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authenticate user
        await authenticate(request);

        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        const body = await request.json();
        const validatedData = bahasaPemrogramanUpdateSchema.parse(body);

        // Check if bahasa pemrograman exists
        const existing = await db
            .select()
            .from(bahasaPemrograman)
            .where(eq(bahasaPemrograman.id, id))
            .limit(1);

        if (existing.length === 0) {
            return createErrorResponse('Bahasa pemrograman tidak ditemukan', 404);
        }

        // Check if new nama already exists (if nama is being updated)
        if (validatedData.nama) {
            const namaExists = await db
                .select()
                .from(bahasaPemrograman)
                .where(eq(bahasaPemrograman.nama, validatedData.nama))
                .limit(1);

            if (namaExists.length > 0 && namaExists[0].id !== id) {
                return createErrorResponse('Bahasa pemrograman dengan nama tersebut sudah ada', 400);
            }
        }

        const result = await db
            .update(bahasaPemrograman)
            .set({
                ...validatedData,
                updatedAt: new Date(),
            })
            .where(eq(bahasaPemrograman.id, id))
            .returning();

        return createSuccessResponse(result[0], 'Bahasa pemrograman berhasil diperbarui');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error updating bahasa pemrograman:', error);
        return createErrorResponse('Gagal memperbarui bahasa pemrograman', 500);
    }
}

// DELETE /api/bahasa-pemrograman/[id] - Delete bahasa pemrograman
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authenticate user
        await authenticate(request);

        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        // Check if bahasa pemrograman exists
        const existing = await db
            .select()
            .from(bahasaPemrograman)
            .where(eq(bahasaPemrograman.id, id))
            .limit(1);

        if (existing.length === 0) {
            return createErrorResponse('Bahasa pemrograman tidak ditemukan', 404);
        }

        // Check if there are related applications
        const relatedApps = await db
            .select({ count: sql<number>`count(*)` })
            .from(aplikasi)
            .where(eq(aplikasi.idBahasa, id));

        if (relatedApps[0].count > 0) {
            return createErrorResponse('Tidak dapat menghapus bahasa pemrograman yang digunakan oleh aplikasi', 400);
        }

        await db.delete(bahasaPemrograman).where(eq(bahasaPemrograman.id, id));

        return createSuccessResponse(null, 'Bahasa pemrograman berhasil dihapus');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error deleting bahasa pemrograman:', error);
        return createErrorResponse('Gagal menghapus bahasa pemrograman', 500);
    }
}