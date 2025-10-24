import { NextRequest, NextResponse } from 'next/server';
import { eq, like, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { pic, aplikasi } from '@/db/schema';
import { authenticate, createSuccessResponse, createErrorResponse, extractPaginationParams, calculatePagination } from '@/lib/api-utils';
import { picSchema, searchSchema } from '@/lib/validations';

// GET /api/pic - Get all PIC with pagination and search
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const { page, limit, sortBy, sortOrder, search } = searchSchema.parse(Object.fromEntries(searchParams));

        // Build base query with relationship
        let query = db.select({
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
        }).from(pic)
            .leftJoin(aplikasi, eq(pic.idAplikasi, aplikasi.id));

        // Add search filter if provided
        if (search) {
            query = query.where(
                sql`${pic.nama} ILIKE ${'%' + search + '%'} OR ${pic.jabatan} ILIKE ${'%' + search + '%'} OR ${aplikasi.nama} ILIKE ${'%' + search + '%'}`
            );
        }

        // Add sorting
        const sortColumn = pic[sortBy as keyof typeof pic] || pic.nama;
        const orderFunction = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(orderFunction(sortColumn));

        // Get total count
        let countQuery = db.select({ count: sql<number>`count(*)` }).from(pic)
            .leftJoin(aplikasi, eq(pic.idAplikasi, aplikasi.id));

        if (search) {
            countQuery = countQuery.where(
                sql`${pic.nama} ILIKE ${'%' + search + '%'} OR ${pic.jabatan} ILIKE ${'%' + search + '%'} OR ${aplikasi.nama} ILIKE ${'%' + search + '%'}`
            );
        }

        const totalResult = await countQuery.execute();
        const total = totalResult[0].count;

        // Apply pagination
        const offset = (page - 1) * limit;
        query = query.limit(limit).offset(offset);

        const data = await query.execute();

        const response = calculatePagination(data, page, limit, total);
        return createSuccessResponse(response);

    } catch (error) {
        console.error('Error fetching PIC:', error);
        return createErrorResponse('Gagal mengambil data PIC', 500);
    }
}

// POST /api/pic - Create new PIC
export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        await authenticate(request);

        const body = await request.json();
        const validatedData = picSchema.parse(body);

        // Validate that the aplikasi exists
        const aplikasiExists = await db
            .select({ id: aplikasi.id })
            .from(aplikasi)
            .where(eq(aplikasi.id, validatedData.idAplikasi))
            .limit(1);

        if (aplikasiExists.length === 0) {
            return createErrorResponse('Aplikasi tidak ditemukan', 400);
        }

        const result = await db.insert(pic).values({
            ...validatedData,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        // Fetch the complete record with aplikasi info
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

        return createSuccessResponse(completeResult[0], 'PIC berhasil dibuat');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error creating PIC:', error);
        return createErrorResponse('Gagal membuat PIC', 500);
    }
}