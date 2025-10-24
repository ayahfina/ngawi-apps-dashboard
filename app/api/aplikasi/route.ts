import { NextRequest, NextResponse } from 'next/server';
import { eq, like, desc, asc, sql, and, or } from 'drizzle-orm';
import { db } from '@/db';
import { aplikasi, perangkatDaerah, bahasaPemrograman, framework } from '@/db/schema';
import { authenticate, createSuccessResponse, createErrorResponse, extractPaginationParams, calculatePagination } from '@/lib/api-utils';
import { aplikasiSchema, statusFilterSchema } from '@/lib/validations';

// GET /api/aplikasi - Get all aplikasi with pagination, search, and filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const { page, limit, sortBy, sortOrder, search, status } = statusFilterSchema.parse(Object.fromEntries(searchParams));

        // Build base query with relationships
        let query = db.select({
            id: aplikasi.id,
            nama: aplikasi.nama,
            deskripsi: aplikasi.deskripsi,
            status: aplikasi.status,
            platform: aplikasi.platform,
            urlAplikasi: aplikasi.urlAplikasi,
            tahunDibuat: aplikasi.tahunDibuat,
            anggaran: aplikasi.anggaran,
            idPerangkatDaerah: aplikasi.idPerangkatDaerah,
            idBahasa: aplikasi.idBahasa,
            idFramework: aplikasi.idFramework,
            createdAt: aplikasi.createdAt,
            updatedAt: aplikasi.updatedAt,
            perangkatDaerah: {
                id: perangkatDaerah.id,
                nama: perangkatDaerah.nama,
                jenis: perangkatDaerah.jenis,
            },
            bahasaPemrograman: {
                id: bahasaPemrograman.id,
                nama: bahasaPemrograman.nama,
            },
            framework: {
                id: framework.id,
                nama: framework.nama,
            },
        }).from(aplikasi)
            .leftJoin(perangkatDaerah, eq(aplikasi.idPerangkatDaerah, perangkatDaerah.id))
            .leftJoin(bahasaPemrograman, eq(aplikasi.idBahasa, bahasaPemrograman.id))
            .leftJoin(framework, eq(aplikasi.idFramework, framework.id));

        // Build conditions
        const conditions = [];

        // Add search filter
        if (search) {
            conditions.push(
                or(
                    like(aplikasi.nama, `%${search}%`),
                    like(aplikasi.deskripsi, `%${search}%`),
                    like(perangkatDaerah.nama, `%${search}%`),
                    like(bahasaPemrograman.nama, `%${search}%`),
                    like(framework.nama, `%${search}%`)
                )
            );
        }

        // Add status filter
        if (status) {
            conditions.push(eq(aplikasi.status, status));
        }

        // Apply conditions
        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        // Add sorting
        const sortColumn = aplikasi[sortBy as keyof typeof aplikasi] || aplikasi.createdAt;
        const orderFunction = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(orderFunction(sortColumn));

        // Get total count
        let countQuery = db.select({ count: sql<number>`count(*)` }).from(aplikasi)
            .leftJoin(perangkatDaerah, eq(aplikasi.idPerangkatDaerah, perangkatDaerah.id))
            .leftJoin(bahasaPemrograman, eq(aplikasi.idBahasa, bahasaPemrograman.id))
            .leftJoin(framework, eq(aplikasi.idFramework, framework.id));

        if (conditions.length > 0) {
            countQuery = countQuery.where(and(...conditions));
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
        console.error('Error fetching aplikasi:', error);
        return createErrorResponse('Gagal mengambil data aplikasi', 500);
    }
}

// POST /api/aplikasi - Create new aplikasi
export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        await authenticate(request);

        const body = await request.json();
        const validatedData = aplikasiSchema.parse(body);

        // Validate foreign keys if provided
        if (validatedData.idPerangkatDaerah) {
            const perangkatExists = await db
                .select({ id: perangkatDaerah.id })
                .from(perangkatDaerah)
                .where(eq(perangkatDaerah.id, validatedData.idPerangkatDaerah))
                .limit(1);

            if (perangkatExists.length === 0) {
                return createErrorResponse('Perangkat daerah tidak ditemukan', 400);
            }
        }

        if (validatedData.idBahasa) {
            const bahasaExists = await db
                .select({ id: bahasaPemrograman.id })
                .from(bahasaPemrograman)
                .where(eq(bahasaPemrograman.id, validatedData.idBahasa))
                .limit(1);

            if (bahasaExists.length === 0) {
                return createErrorResponse('Bahasa pemrograman tidak ditemukan', 400);
            }
        }

        if (validatedData.idFramework) {
            const frameworkExists = await db
                .select({ id: framework.id })
                .from(framework)
                .where(eq(framework.id, validatedData.idFramework))
                .limit(1);

            if (frameworkExists.length === 0) {
                return createErrorResponse('Framework tidak ditemukan', 400);
            }
        }

        const result = await db.insert(aplikasi).values({
            ...validatedData,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        // Fetch the complete record with relationships
        const completeResult = await db
            .select({
                id: aplikasi.id,
                nama: aplikasi.nama,
                deskripsi: aplikasi.deskripsi,
                status: aplikasi.status,
                platform: aplikasi.platform,
                urlAplikasi: aplikasi.urlAplikasi,
                tahunDibuat: aplikasi.tahunDibuat,
                anggaran: aplikasi.anggaran,
                idPerangkatDaerah: aplikasi.idPerangkatDaerah,
                idBahasa: aplikasi.idBahasa,
                idFramework: aplikasi.idFramework,
                createdAt: aplikasi.createdAt,
                updatedAt: aplikasi.updatedAt,
                perangkatDaerah: {
                    id: perangkatDaerah.id,
                    nama: perangkatDaerah.nama,
                    jenis: perangkatDaerah.jenis,
                },
                bahasaPemrograman: {
                    id: bahasaPemrograman.id,
                    nama: bahasaPemrograman.nama,
                },
                framework: {
                    id: framework.id,
                    nama: framework.nama,
                },
            })
            .from(aplikasi)
            .leftJoin(perangkatDaerah, eq(aplikasi.idPerangkatDaerah, perangkatDaerah.id))
            .leftJoin(bahasaPemrograman, eq(aplikasi.idBahasa, bahasaPemrograman.id))
            .leftJoin(framework, eq(aplikasi.idFramework, framework.id))
            .where(eq(aplikasi.id, result[0].id))
            .limit(1);

        return createSuccessResponse(completeResult[0], 'Aplikasi berhasil dibuat');

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return createErrorResponse('Unauthorized', 401);
        }

        console.error('Error creating aplikasi:', error);
        return createErrorResponse('Gagal membuat aplikasi', 500);
    }
}