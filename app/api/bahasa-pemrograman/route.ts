import { NextRequest, NextResponse } from 'next/server';
import { eq, like, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { bahasaPemrograman, aplikasi } from '@/db/schema';
import { authenticate, createSuccessResponse, createErrorResponse, extractPaginationParams, calculatePagination } from '@/lib/api-utils';
import { bahasaPemrogramanSchema, searchSchema } from '@/lib/validations';

// GET /api/bahasa-pemrograman - Get all bahasa pemrograman with pagination and search
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const { page, limit, sortBy, sortOrder, search } = searchSchema.parse(Object.fromEntries(searchParams));

        // Build base query
        let query = db.select({
            ...bahasaPemrograman,
            aplikasiCount: sql<number>`count(${aplikasi.id})`
        }).from(bahasaPemrograman)
            .leftJoin(aplikasi, eq(bahasaPemrograman.id, aplikasi.idBahasa))
            .groupBy(bahasaPemrograman.id);

        // Add search filter if provided
        if (search) {
            query = query.where(like(bahasaPemrograman.nama, `%${search}%`));
        }

        // Add sorting
        const sortColumn = bahasaPemrograman[sortBy as keyof typeof bahasaPemrograman] || bahasaPemrograman.nama;
        const orderFunction = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(orderFunction(sortColumn));

        // Get total count
        const totalCountQuery = db.select({ count: sql<number>`count(*)` }).from(bahasaPemrograman);
        if (search) {
            totalCountQuery.where(like(bahasaPemrograman.nama, `%${search}%`));
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
        console.error('Error fetching bahasa pemrograman:', error);
        return createErrorResponse('Gagal mengambil data bahasa pemrograman', 500);
    }
}

// POST /api/bahasa-pemrograman - Create new bahasa pemrograman
export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        await authenticate(request);

        const body = await request.json();
        const validatedData = bahasaPemrogramanSchema.parse(body);

        // Check if nama already exists
        const existing = await db
            .select()
            .from(bahasaPemrograman)
            .where(eq(bahasaPemrograman.nama, validatedData.nama))
            .limit(1);

        if (existing.length > 0) {
            return createErrorResponse('Bahasa pemrograman dengan nama tersebut sudah ada', 400);
        }

        const result = await db.insert(bahasaPemrograman).values({
            ...validatedData,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        return createSuccessResponse(result[0], 'Bahasa pemrograman berhasil dibuat');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error creating bahasa pemrograman:', error);
        return createErrorResponse('Gagal membuat bahasa pemrograman', 500);
    }
}