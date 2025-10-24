import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { pic, aplikasi } from '@/db/schema';
import { authenticate, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { picUpdateSchema } from '@/lib/validations';

// GET /api/pic/[id] - Get single PIC
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        const result = await db
            .select({
                id: pic.id,
                nama: pic.nama,
                jabatan: pic.jabatan,
                kontak: pic.kontak,
                idAplikasi: pic.idAplikasi,
                createdAt: pic.createdAt,
                updatedAt: pic.updatedAt,
                aplikasi: {
                    id: aplikasi.id,
                    nama: aplikasi.nama,
                    status: aplikasi.status,
                    platform: aplikasi.platform,
                },
            })
            .from(pic)
            .leftJoin(aplikasi, eq(pic.idAplikasi, aplikasi.id))
            .where(eq(pic.id, id))
            .limit(1);

        if (result.length === 0) {
            return createErrorResponse('PIC tidak ditemukan', 404);
        }

        return createSuccessResponse(result[0]);

    } catch (error) {
        console.error('Error fetching PIC:', error);
        return createErrorResponse('Gagal mengambil data PIC', 500);
    }
}

// PUT /api/pic/[id] - Update PIC
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authenticate user
        await authenticate(request);

        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        const body = await request.json();
        const validatedData = picUpdateSchema.parse(body);

        // Check if PIC exists
        const existing = await db
            .select()
            .from(pic)
            .where(eq(pic.id, id))
            .limit(1);

        if (existing.length === 0) {
            return createErrorResponse('PIC tidak ditemukan', 404);
        }

        // Validate that the aplikasi exists if idAplikasi is being updated
        if (validatedData.idAplikasi) {
            const aplikasiExists = await db
                .select({ id: aplikasi.id })
                .from(aplikasi)
                .where(eq(aplikasi.id, validatedData.idAplikasi))
                .limit(1);

            if (aplikasiExists.length === 0) {
                return createErrorResponse('Aplikasi tidak ditemukan', 400);
            }
        }

        const result = await db
            .update(pic)
            .set({
                ...validatedData,
                updatedAt: new Date(),
            })
            .where(eq(pic.id, id))
            .returning();

        // Fetch the complete updated record
        const completeResult = await db
            .select({
                id: pic.id,
                nama: pic.nama,
                jabatan: pic.jabatan,
                kontak: pic.kontak,
                idAplikasi: pic.idAplikasi,
                createdAt: pic.createdAt,
                updatedAt: pic.updatedAt,
                aplikasi: {
                    id: aplikasi.id,
                    nama: aplikasi.nama,
                    status: aplikasi.status,
                },
            })
            .from(pic)
            .leftJoin(aplikasi, eq(pic.idAplikasi, aplikasi.id))
            .where(eq(pic.id, result[0].id))
            .limit(1);

        return createSuccessResponse(completeResult[0], 'PIC berhasil diperbarui');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error updating PIC:', error);
        return createErrorResponse('Gagal memperbarui PIC', 500);
    }
}

// DELETE /api/pic/[id] - Delete PIC
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authenticate user
        await authenticate(request);

        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        // Check if PIC exists
        const existing = await db
            .select()
            .from(pic)
            .where(eq(pic.id, id))
            .limit(1);

        if (existing.length === 0) {
            return createErrorResponse('PIC tidak ditemukan', 404);
        }

        await db.delete(pic).where(eq(pic.id, id));

        return createSuccessResponse(null, 'PIC berhasil dihapus');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error deleting PIC:', error);
        return createErrorResponse('Gagal menghapus PIC', 500);
    }
}