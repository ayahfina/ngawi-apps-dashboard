import { NextRequest, NextResponse } from 'next/server';
import { eq, like, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { aplikasiVendor, aplikasi, vendor } from '@/db/schema';
import { authenticate, createSuccessResponse, createErrorResponse, extractPaginationParams, calculatePagination } from '@/lib/api-utils';
import { aplikasiVendorSchema, searchSchema } from '@/lib/validations';

// GET /api/aplikasi-vendor - Get all aplikasi-vendor relationships
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const { page, limit, sortBy, sortOrder, search } = searchSchema.parse(Object.fromEntries(searchParams));

        // Build base query with relationships
        let query = db.select({
            id: aplikasiVendor.id,
            idAplikasi: aplikasiVendor.idAplikasi,
            idVendor: aplikasiVendor.idVendor,
            createdAt: aplikasiVendor.createdAt,
            aplikasi: {
                id: aplikasi.id,
                nama: aplikasi.nama,
                status: aplikasi.status,
                platform: aplikasi.platform,
            },
            vendor: {
                id: vendor.id,
                namaVendor: vendor.namaVendor,
                kontak: vendor.kontak,
            },
        }).from(aplikasiVendor)
            .innerJoin(aplikasi, eq(aplikasiVendor.idAplikasi, aplikasi.id))
            .innerJoin(vendor, eq(aplikasiVendor.idVendor, vendor.id));

        // Add search filter if provided
        if (search) {
            query = query.where(
                sql`${aplikasi.nama} ILIKE ${'%' + search + '%'} OR ${vendor.namaVendor} ILIKE ${'%' + search + '%'}`
            );
        }

        // Add sorting
        const sortColumn = aplikasiVendor[sortBy as keyof typeof aplikasiVendor] || aplikasiVendor.createdAt;
        const orderFunction = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(orderFunction(sortColumn));

        // Get total count
        let countQuery = db.select({ count: sql<number>`count(*)` }).from(aplikasiVendor)
            .innerJoin(aplikasi, eq(aplikasiVendor.idAplikasi, aplikasi.id))
            .innerJoin(vendor, eq(aplikasiVendor.idVendor, vendor.id));

        if (search) {
            countQuery = countQuery.where(
                sql`${aplikasi.nama} ILIKE ${'%' + search + '%'} OR ${vendor.namaVendor} ILIKE ${'%' + search + '%'}`
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
        console.error('Error fetching aplikasi-vendor relationships:', error);
        return createErrorResponse('Gagal mengambil data hubungan aplikasi-vendor', 500);
    }
}

// POST /api/aplikasi-vendor - Create new aplikasi-vendor relationship
export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        await authenticate(request);

        const body = await request.json();
        const validatedData = aplikasiVendorSchema.parse(body);

        // Check if aplikasi exists
        const aplikasiExists = await db
            .select({ id: aplikasi.id })
            .from(aplikasi)
            .where(eq(aplikasi.id, validatedData.idAplikasi))
            .limit(1);

        if (aplikasiExists.length === 0) {
            return createErrorResponse('Aplikasi tidak ditemukan', 400);
        }

        // Check if vendor exists
        const vendorExists = await db
            .select({ id: vendor.id })
            .from(vendor)
            .where(eq(vendor.id, validatedData.idVendor))
            .limit(1);

        if (vendorExists.length === 0) {
            return createErrorResponse('Vendor tidak ditemukan', 400);
        }

        // Check if relationship already exists
        const existingRelationship = await db
            .select()
            .from(aplikasiVendor)
            .where(eq(aplikasiVendor.idAplikasi, validatedData.idAplikasi))
            .where(eq(aplikasiVendor.idVendor, validatedData.idVendor))
            .limit(1);

        if (existingRelationship.length > 0) {
            return createErrorResponse('Hubungan aplikasi-vendor ini sudah ada', 400);
        }

        const result = await db.insert(aplikasiVendor).values({
            ...validatedData,
            createdAt: new Date(),
        }).returning();

        // Fetch the complete record with relationships
        const completeResult = await db
            .select({
                id: aplikasiVendor.id,
                idAplikasi: aplikasiVendor.idAplikasi,
                idVendor: aplikasiVendor.idVendor,
                createdAt: aplikasiVendor.createdAt,
                aplikasi: {
                    id: aplikasi.id,
                    nama: aplikasi.nama,
                    status: aplikasi.status,
                    platform: aplikasi.platform,
                },
                vendor: {
                    id: vendor.id,
                    namaVendor: vendor.namaVendor,
                    kontak: vendor.kontak,
                },
            })
            .from(aplikasiVendor)
            .innerJoin(aplikasi, eq(aplikasiVendor.idAplikasi, aplikasi.id))
            .innerJoin(vendor, eq(aplikasiVendor.idVendor, vendor.id))
            .where(eq(aplikasiVendor.id, result[0].id))
            .limit(1);

        return createSuccessResponse(completeResult[0], 'Hubungan aplikasi-vendor berhasil dibuat');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error creating aplikasi-vendor relationship:', error);
        return createErrorResponse('Gagal membuat hubungan aplikasi-vendor', 500);
    }
}