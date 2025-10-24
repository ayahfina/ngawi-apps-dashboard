import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { perangkatDaerah, aplikasi } from '@/db/schema';
import { authenticate, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { perangkatDaerahUpdateSchema } from '@/lib/validations';

// GET /api/perangkat-daerah/[id] - Get single perangkat daerah
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        const result = await db
            .select({
                ...perangkatDaerah,
                aplikasiCount: sql<number>`count(${aplikasi.id})`
            })
            .from(perangkatDaerah)
            .leftJoin(aplikasi, eq(perangkatDaerah.id, aplikasi.idPerangkatDaerah))
            .where(eq(perangkatDaerah.id, id))
            .groupBy(perangkatDaerah.id)
            .limit(1);

        if (result.length === 0) {
            return createErrorResponse('Perangkat daerah tidak ditemukan', 404);
        }

        return createSuccessResponse(result[0]);

    } catch (error) {
        console.error('Error fetching perangkat daerah:', error);
        return createErrorResponse('Gagal mengambil data perangkat daerah', 500);
    }
}

// PUT /api/perangkat-daerah/[id] - Update perangkat daerah
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authenticate user
        await authenticate(request);

        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        const body = await request.json();
        const validatedData = perangkatDaerahUpdateSchema.parse(body);

        // Check if perangkat daerah exists
        const existing = await db
            .select()
            .from(perangkatDaerah)
            .where(eq(perangkatDaerah.id, id))
            .limit(1);

        if (existing.length === 0) {
            return createErrorResponse('Perangkat daerah tidak ditemukan', 404);
        }

        const result = await db
            .update(perangkatDaerah)
            .set({
                ...validatedData,
                updatedAt: new Date(),
            })
            .where(eq(perangkatDaerah.id, id))
            .returning();

        return createSuccessResponse(result[0], 'Perangkat daerah berhasil diperbarui');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error updating perangkat daerah:', error);
        return createErrorResponse('Gagal memperbarui perangkat daerah', 500);
    }
}

// DELETE /api/perangkat-daerah/[id] - Delete perangkat daerah
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authenticate user
        await authenticate(request);

        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        // Check if perangkat daerah exists
        const existing = await db
            .select()
            .from(perangkatDaerah)
            .where(eq(perangkatDaerah.id, id))
            .limit(1);

        if (existing.length === 0) {
            return createErrorResponse('Perangkat daerah tidak ditemukan', 404);
        }

        // Check if there are related applications
        const relatedApps = await db
            .select({ count: sql<number>`count(*)` })
            .from(aplikasi)
            .where(eq(aplikasi.idPerangkatDaerah, id));

        if (relatedApps[0].count > 0) {
            return createErrorResponse('Tidak dapat menghapus perangkat daerah yang memiliki aplikasi terkait', 400);
        }

        await db.delete(perangkatDaerah).where(eq(perangkatDaerah.id, id));

        return createSuccessResponse(null, 'Perangkat daerah berhasil dihapus');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error deleting perangkat daerah:', error);
        return createErrorResponse('Gagal menghapus perangkat daerah', 500);
    }
}