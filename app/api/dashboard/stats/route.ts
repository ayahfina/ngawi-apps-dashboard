import { NextRequest, NextResponse } from 'next/server';
import { eq, sql, desc, and } from 'drizzle-orm';
import { db } from '@/db';
import { aplikasi, perangkatDaerah, pic, vendor, bahasaPemrograman, framework } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
    try {
        // Total aplikasi
        const totalAplikasiResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(aplikasi);

        // Aplikasi by status
        const aplikasiByStatusResult = await db
            .select({
                status: aplikasi.status,
                count: sql<number>`count(*)`,
            })
            .from(aplikasi)
            .groupBy(aplikasi.status);

        // Aplikasi by platform
        const aplikasiByPlatformResult = await db
            .select({
                platform: aplikasi.platform,
                count: sql<number>`count(*)`,
            })
            .from(aplikasi)
            .groupBy(aplikasi.platform);

        // Perangkat daerah with aplikasi count
        const perangkatDaerahWithAppsResult = await db
            .select({
                id: perangkatDaerah.id,
                nama: perangkatDaerah.nama,
                jenis: perangkatDaerah.jenis,
                aplikasiCount: sql<number>`count(${aplikasi.id})`,
            })
            .from(perangkatDaerah)
            .leftJoin(aplikasi, eq(perangkatDaerah.id, aplikasi.idPerangkatDaerah))
            .groupBy(perangkatDaerah.id)
            .orderBy(sql`count(${aplikasi.id}) desc`)
            .limit(10);

        // Total perangkat daerah
        const totalPerangkatDaerahResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(perangkatDaerah);

        // Perangkat daerah with at least one aplikasi
        const perangkatDaerahWithApps = await db
            .select({
                id: perangkatDaerah.id,
                count: sql<number>`count(${aplikasi.id})`
            })
            .from(perangkatDaerah)
            .innerJoin(aplikasi, eq(perangkatDaerah.id, aplikasi.idPerangkatDaerah))
            .groupBy(perangkatDaerah.id);

        const totalPerangkatDaerahWithApps = perangkatDaerahWithApps.length;

        // Total PIC
        const totalPicResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(pic);

        // Total Vendor
        const totalVendorResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(vendor);

        // Total Bahasa Pemrograman
        const totalBahasaResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(bahasaPemrograman);

        // Total Framework
        const totalFrameworkResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(framework);

        // Popular programming languages
        const popularBahasaResult = await db
            .select({
                id: bahasaPemrograman.id,
                nama: bahasaPemrograman.nama,
                count: sql<number>`count(${aplikasi.id})`,
            })
            .from(bahasaPemrograman)
            .leftJoin(aplikasi, eq(bahasaPemrograman.id, aplikasi.idBahasa))
            .groupBy(bahasaPemrograman.id)
            .orderBy(sql`count(${aplikasi.id}) desc`)
            .limit(10);

        // Popular frameworks
        const popularFrameworkResult = await db
            .select({
                id: framework.id,
                nama: framework.nama,
                count: sql<number>`count(${aplikasi.id})`,
            })
            .from(framework)
            .leftJoin(aplikasi, eq(framework.id, aplikasi.idFramework))
            .groupBy(framework.id)
            .orderBy(sql`count(${aplikasi.id}) desc`)
            .limit(10);

        // Recent applications (last 5)
        const recentAplikasiResult = await db
            .select({
                id: aplikasi.id,
                nama: aplikasi.nama,
                status: aplikasi.status,
                platform: aplikasi.platform,
                createdAt: aplikasi.createdAt,
                perangkatDaerah: perangkatDaerah.nama,
            })
            .from(aplikasi)
            .leftJoin(perangkatDaerah, eq(aplikasi.idPerangkatDaerah, perangkatDaerah.id))
            .orderBy(desc(aplikasi.createdAt))
            .limit(5);

        // Calculate total anggaran (budget)
        const totalAnggaranResult = await db
            .select({
                total: sql<number>`sum(${aplikasi.anggaran})`
            })
            .from(aplikasi);

        // Build response
        const stats = {
            summary: {
                totalAplikasi: totalAplikasiResult[0].count,
                totalPerangkatDaerah: totalPerangkatDaerahResult[0].count,
                totalPerangkatDaerahWithApps,
                totalPic: totalPicResult[0].count,
                totalVendor: totalVendorResult[0].count,
                totalBahasaPemrograman: totalBahasaResult[0].count,
                totalFramework: totalFrameworkResult[0].count,
                totalAnggaran: totalAnggaranResult[0].total || 0,
            },
            aplikasiByStatus: aplikasiByStatusResult.map(item => ({
                ...item,
                percentage: totalAplikasiResult[0].count > 0
                    ? Math.round((item.count / totalAplikasiResult[0].count) * 100)
                    : 0,
            })),
            aplikasiByPlatform: aplikasiByPlatformResult.map(item => ({
                ...item,
                percentage: totalAplikasiResult[0].count > 0
                    ? Math.round((item.count / totalAplikasiResult[0].count) * 100)
                    : 0,
            })),
            topPerangkatDaerah: perangkatDaerahWithAppsResult,
            popularBahasa: popularBahasaResult,
            popularFramework: popularFrameworkResult,
            recentAplikasi: recentAplikasiResult,
        };

        return createSuccessResponse(stats);

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return createErrorResponse('Gagal mengambil data statistik dashboard', 500);
    }
}