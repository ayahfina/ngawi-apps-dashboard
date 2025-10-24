import { NextRequest, NextResponse } from 'next/server';
import { eq, like, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { vendor, aplikasiVendor, aplikasi } from '@/db/schema';
import { authenticate, createSuccessResponse, createErrorResponse, extractPaginationParams, calculatePagination } from '@/lib/api-utils';
import { vendorSchema, searchSchema } from '@/lib/validations';

// GET /api/vendor - Get all vendor with pagination and search
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const { page, limit, sortBy, sortOrder, search } = searchSchema.parse(Object.fromEntries(searchParams));

        // Build base query with aplikasi count
        let query = db.select({
            id: vendor.id,
            namaVendor: vendor.namaVendor,
            kontak: vendor.kontak,
            alamat: vendor.alamat,
            createdAt: vendor.createdAt,
            updatedAt: vendor.updatedAt,
            aplikasiCount: sql<number>`count(${aplikasi.id})`,
            aplikasiList: sql<string>`array_agg(${aplikasi.nama})`
        }).from(vendor)
            .leftJoin(aplikasiVendor, eq(vendor.id, aplikasiVendor.idVendor))
            .leftJoin(aplikasi, eq(aplikasiVendor.idAplikasi, aplikasi.id))
            .groupBy(vendor.id);

        // Add search filter if provided
        if (search) {
            query = query.where(
                sql`${vendor.namaVendor} ILIKE ${'%' + search + '%'} OR ${vendor.kontak} ILIKE ${'%' + search + '%'} OR ${aplikasi.nama} ILIKE ${'%' + search + '%'}`
            );
        }

        // Add sorting
        const sortColumn = vendor[sortBy as keyof typeof vendor] || vendor.namaVendor;
        const orderFunction = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(orderFunction(sortColumn));

        // Get total count
        const totalCountQuery = db.select({ count: sql<number>`count(*)` }).from(vendor);
        if (search) {
            totalCountQuery.where(like(vendor.namaVendor, `%${search}%`));
        }
        const totalResult = await totalCountQuery.execute();
        const total = totalResult[0].count;

        // Apply pagination
        const offset = (page - 1) * limit;
        query = query.limit(limit).offset(offset);

        const data = await query.execute();

        // Format the response to handle null arrays
        const formattedData = data.map(item => ({
            ...item,
            aplikasiList: item.aplikasiList || [],
        }));

        const response = calculatePagination(formattedData, page, limit, total);
        return createSuccessResponse(response);

    } catch (error) {
        console.error('Error fetching vendor:', error);
        return createErrorResponse('Gagal mengambil data vendor', 500);
    }
}

// POST /api/vendor - Create new vendor
export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        await authenticate(request);

        const body = await request.json();
        const validatedData = vendorSchema.parse(body);

        const result = await db.insert(vendor).values({
            ...validatedData,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        return createSuccessResponse(result[0], 'Vendor berhasil dibuat');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error creating vendor:', error);
        return createErrorResponse('Gagal membuat vendor', 500);
    }
}