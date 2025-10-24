import { NextRequest, NextResponse } from 'next/server';
import { eq, like, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { framework, aplikasi } from '@/db/schema';
import { authenticate, createSuccessResponse, createErrorResponse, extractPaginationParams, calculatePagination } from '@/lib/api-utils';
import { frameworkSchema, searchSchema } from '@/lib/validations';

// GET /api/framework - Get all framework with pagination and search
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const { page, limit, sortBy, sortOrder, search } = searchSchema.parse(Object.fromEntries(searchParams));

        // Build base query
        let query = db.select({
            ...framework,
            aplikasiCount: sql<number>`count(${aplikasi.id})`
        }).from(framework)
            .leftJoin(aplikasi, eq(framework.id, aplikasi.idFramework))
            .groupBy(framework.id);

        // Add search filter if provided
        if (search) {
            query = query.where(like(framework.nama, `%${search}%`));
        }

        // Add sorting
        const sortColumn = framework[sortBy as keyof typeof framework] || framework.nama;
        const orderFunction = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(orderFunction(sortColumn));

        // Get total count
        const totalCountQuery = db.select({ count: sql<number>`count(*)` }).from(framework);
        if (search) {
            totalCountQuery.where(like(framework.nama, `%${search}%`));
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
        console.error('Error fetching framework:', error);
        return createErrorResponse('Gagal mengambil data framework', 500);
    }
}

// POST /api/framework - Create new framework
export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        await authenticate(request);

        const body = await request.json();
        const validatedData = frameworkSchema.parse(body);

        // Check if nama already exists
        const existing = await db
            .select()
            .from(framework)
            .where(eq(framework.nama, validatedData.nama))
            .limit(1);

        if (existing.length > 0) {
            return createErrorResponse('Framework dengan nama tersebut sudah ada', 400);
        }

        const result = await db.insert(framework).values({
            ...validatedData,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        return createSuccessResponse(result[0], 'Framework berhasil dibuat');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error creating framework:', error);
        return createErrorResponse('Gagal membuat framework', 500);
    }
}