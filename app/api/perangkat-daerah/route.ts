import { NextRequest, NextResponse } from 'next/server';
import { eq, like, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { perangkatDaerah } from '@/db/schema';
import { authenticate, createSuccessResponse, createErrorResponse, extractPaginationParams, calculatePagination } from '@/lib/api-utils';
import { perangkatDaerahSchema, perangkatDaerahUpdateSchema, searchSchema } from '@/lib/validations';

// GET /api/perangkat-daerah - Get all perangkat daerah with pagination and search
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const { page, limit, sortBy, sortOrder, search } = searchSchema.parse(Object.fromEntries(searchParams));

        // Build base query
        let query = db.select().from(perangkatDaerah);

        // Add search filter if provided
        if (search) {
            query = query.where(
                sql`${perangkatDaerah.nama} ILIKE ${'%' + search + '%'} OR ${perangkatDaerah.jenis} ILIKE ${'%' + search + '%'}`
            );
        }

        // Add sorting
        const sortColumn = perangkatDaerah[sortBy as keyof typeof perangkatDaerah] || perangkatDaerah.createdAt;
        const orderFunction = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(orderFunction(sortColumn));

        // Get total count
        const totalCountQuery = db.select({ count: sql<number>`count(*)` }).from(perangkatDaerah);
        if (search) {
            totalCountQuery.where(
                sql`${perangkatDaerah.nama} ILIKE ${'%' + search + '%'} OR ${perangkatDaerah.jenis} ILIKE ${'%' + search + '%'}`
            );
        }
        const totalResult = await totalCountQuery.execute();
        const total = totalResult[0].count;

        // Apply pagination
        const offset = (page - 1) * limit;
        query = query.limit(limit).offset(offset);

        const data = await query.execute();

        const response = calculatePagination(data, page, limit, total);
        return createSuccessResponse(response);

    } catch (error) {
        console.error('Error fetching perangkat daerah:', error);
        return createErrorResponse('Gagal mengambil data perangkat daerah', 500);
    }
}

// POST /api/perangkat-daerah - Create new perangkat daerah
export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        await authenticate(request);

        const body = await request.json();
        const validatedData = perangkatDaerahSchema.parse(body);

        const result = await db.insert(perangkatDaerah).values({
            ...validatedData,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        return createSuccessResponse(result[0], 'Perangkat daerah berhasil dibuat');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error creating perangkat daerah:', error);
        return createErrorResponse('Gagal membuat perangkat daerah', 500);
    }
}