import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { framework, aplikasi } from '@/db/schema';
import { authenticate, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { frameworkUpdateSchema } from '@/lib/validations';

// GET /api/framework/[id] - Get single framework
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        const result = await db
            .select({
                ...framework,
                aplikasiCount: sql<number>`count(${aplikasi.id})`
            })
            .from(framework)
            .leftJoin(aplikasi, eq(framework.id, aplikasi.idFramework))
            .where(eq(framework.id, id))
            .groupBy(framework.id)
            .limit(1);

        if (result.length === 0) {
            return createErrorResponse('Framework tidak ditemukan', 404);
        }

        return createSuccessResponse(result[0]);

    } catch (error) {
        console.error('Error fetching framework:', error);
        return createErrorResponse('Gagal mengambil data framework', 500);
    }
}

// PUT /api/framework/[id] - Update framework
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authenticate user
        await authenticate(request);

        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        const body = await request.json();
        const validatedData = frameworkUpdateSchema.parse(body);

        // Check if framework exists
        const existing = await db
            .select()
            .from(framework)
            .where(eq(framework.id, id))
            .limit(1);

        if (existing.length === 0) {
            return createErrorResponse('Framework tidak ditemukan', 404);
        }

        // Check if new nama already exists (if nama is being updated)
        if (validatedData.nama) {
            const namaExists = await db
                .select()
                .from(framework)
                .where(eq(framework.nama, validatedData.nama))
                .limit(1);

            if (namaExists.length > 0 && namaExists[0].id !== id) {
                return createErrorResponse('Framework dengan nama tersebut sudah ada', 400);
            }
        }

        const result = await db
            .update(framework)
            .set({
                ...validatedData,
                updatedAt: new Date(),
            })
            .where(eq(framework.id, id))
            .returning();

        return createSuccessResponse(result[0], 'Framework berhasil diperbarui');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error updating framework:', error);
        return createErrorResponse('Gagal memperbarui framework', 500);
    }
}

// DELETE /api/framework/[id] - Delete framework
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authenticate user
        await authenticate(request);

        const id = parseInt(params.id);

        if (isNaN(id)) {
            return createErrorResponse('ID tidak valid', 400);
        }

        // Check if framework exists
        const existing = await db
            .select()
            .from(framework)
            .where(eq(framework.id, id))
            .limit(1);

        if (existing.length === 0) {
            return createErrorResponse('Framework tidak ditemukan', 404);
        }

        // Check if there are related applications
        const relatedApps = await db
            .select({ count: sql<number>`count(*)` })
            .from(aplikasi)
            .where(eq(aplikasi.idFramework, id));

        if (relatedApps[0].count > 0) {
            return createErrorResponse('Tidak dapat menghapus framework yang digunakan oleh aplikasi', 400);
        }

        await db.delete(framework).where(eq(framework.id, id));

        return createSuccessResponse(null, 'Framework berhasil dihapus');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error deleting framework:', error);
        return createErrorResponse('Gagal menghapus framework', 500);
    }
}