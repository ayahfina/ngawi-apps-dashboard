import { db } from './index';
import {
    perangkatDaerah,
    bahasaPemrograman,
    framework,
    aplikasi,
    pic,
    vendor,
    aplikasiVendor,
    type NewPerangkatDaerah,
    type NewBahasaPemrograman,
    type NewFramework,
    type NewAplikasi,
    type NewPic,
    type NewVendor,
    type NewAplikasiVendor,
} from './schema';

async function seed() {
    console.log('🌱 Seeding database...');

    // Insert Perangkat Daerah
    const perangkatDaerahData: NewPerangkatDaerah[] = [
        {
            nama: 'Dinas Komunikasi dan Informatika',
            jenis: 'Dinas',
            alamat: 'Jl. A. Yani No. 45 Ngawi',
            kepalaDinas: 'Dr. Budi Santoso, S.T., M.T.',
        },
        {
            nama: 'Dinas Kependudukan dan Catatan Sipil',
            jenis: 'Dinas',
            alamat: 'Jl. Merdeka No. 12 Ngawi',
            kepalaDinas: 'Drs. Ahmad Wijaya, M.M.',
        },
        {
            nama: 'Badan Perencanaan Pembangunan Daerah',
            jenis: 'Badan',
            alamat: 'Jl. Pangeran Diponegoro No. 8 Ngawi',
            kepalaDinas: 'Ir. Siti Nurjanah, M.M.',
        },
        {
            nama: 'RSUD Dr. Soeroto Ngawi',
            jenis: 'Rumah Sakit',
            alamat: 'Jl. KH. Ahmad Dahlan No. 34 Ngawi',
            kepalaDinas: 'dr. Hari Purnomo, Sp.PD.',
        },
    ];

    const insertedPerangkatDaerah = await db
        .insert(perangkatDaerah)
        .values(perangkatDaerahData)
        .returning();
    console.log(`✅ Inserted ${insertedPerangkatDaerah.length} perangkat daerah`);

    // Insert Bahasa Pemrograman
    const bahasaData: NewBahasaPemrograman[] = [
        { nama: 'JavaScript' },
        { nama: 'TypeScript' },
        { nama: 'Python' },
        { nama: 'PHP' },
        { nama: 'Java' },
        { nama: 'C#' },
        { nama: 'Go' },
        { nama: 'Ruby' },
    ];

    const insertedBahasa = await db
        .insert(bahasaPemrograman)
        .values(bahasaData)
        .returning();
    console.log(`✅ Inserted ${insertedBahasa.length} bahasa pemrograman`);

    // Insert Framework
    const frameworkData: NewFramework[] = [
        { nama: 'React' },
        { nama: 'Next.js' },
        { nama: 'Vue.js' },
        { nama: 'Angular' },
        { nama: 'Laravel' },
        { nama: 'Django' },
        { nama: 'Express.js' },
        { nama: 'Spring Boot' },
        { nama: 'ASP.NET Core' },
    ];

    const insertedFramework = await db
        .insert(framework)
        .values(frameworkData)
        .returning();
    console.log(`✅ Inserted ${insertedFramework.length} framework`);

    // Insert Vendor
    const vendorData: NewVendor[] = [
        {
            namaVendor: 'PT. Teknologi Kreatif Indonesia',
            kontak: 'info@teknologikreatif.id',
            alamat: 'Jl. Sudirman No. 123 Surabaya',
        },
        {
            namaVendor: 'CV. Solusi Digital Nusantara',
            kontak: 'contact@solusidigital.com',
            alamat: 'Jl. Gajah Mada No. 45 Madiun',
        },
        {
            namaVendor: 'PT. Inovasi Masa Depan',
            kontak: 'admin@inovasimasa.id',
            alamat: 'Jl. Pemuda No. 67 Kediri',
        },
    ];

    const insertedVendor = await db
        .insert(vendor)
        .values(vendorData)
        .returning();
    console.log(`✅ Inserted ${insertedVendor.length} vendor`);

    // Insert Aplikasi
    const aplikasiData: NewAplikasi[] = [
        {
            nama: 'Sistem Informasi Manajemen Karyawan',
            deskripsi: 'Aplikasi untuk mengelola data karyawan, kehadiran, dan penggajian',
            status: 'aktif',
            platform: 'web',
            urlAplikasi: 'https://simk.ngawikab.go.id',
            tahunDibuat: 2022,
            anggaran: 250000000,
            idPerangkatDaerah: insertedPerangkatDaerah[0].id,
            idBahasa: insertedBahasa[1].id, // TypeScript
            idFramework: insertedFramework[1].id, // Next.js
        },
        {
            nama: 'E-KTP Ngawi',
            deskripsi: 'Aplikasi pelayanan administrasi kependudukan online',
            status: 'aktif',
            platform: 'web',
            urlAplikasi: 'https://ektp.ngawikab.go.id',
            tahunDibuat: 2023,
            anggaran: 450000000,
            idPerangkatDaerah: insertedPerangkatDaerah[1].id,
            idBahasa: insertedBahasa[3].id, // PHP
            idFramework: insertedFramework[4].id, // Laravel
        },
        {
            nama: 'Sistem Informasi Rumah Sakit',
            deskripsi: 'Aplikasi manajemen rumah sakit terintegrasi',
            status: 'aktif',
            platform: 'web',
            urlAplikasi: 'https://sirs.rsudsoeroto.ngawikab.go.id',
            tahunDibuat: 2021,
            anggaran: 750000000,
            idPerangkatDaerah: insertedPerangkatDaerah[3].id,
            idBahasa: insertedBahasa[2].id, // Python
            idFramework: insertedFramework[5].id, // Django
        },
        {
            nama: 'Aplikasi Pengaduan Masyarakat',
            deskripsi: 'Platform untuk pengaduan dan aspirasi masyarakat',
            status: 'pengembangan',
            platform: 'mobile',
            urlAplikasi: null,
            tahunDibuat: 2024,
            anggaran: 300000000,
            idPerangkatDaerah: insertedPerangkatDaerah[0].id,
            idBahasa: insertedBahasa[0].id, // JavaScript
            idFramework: insertedFramework[2].id, // Vue.js
        },
        {
            nama: 'Sistem Perencanaan Pembangunan',
            deskripsi: 'Aplikasi untuk perencanaan dan monitoring pembangunan daerah',
            status: 'tidak aktif',
            platform: 'web',
            urlAplikasi: 'https://sippd.ngawikab.go.id',
            tahunDibuat: 2020,
            anggaran: 500000000,
            idPerangkatDaerah: insertedPerangkatDaerah[2].id,
            idBahasa: insertedBahasa[1].id, // TypeScript
            idFramework: insertedFramework[0].id, // React
        },
    ];

    const insertedAplikasi = await db
        .insert(aplikasi)
        .values(aplikasiData)
        .returning();
    console.log(`✅ Inserted ${insertedAplikasi.length} aplikasi`);

    // Insert PIC
    const picData: NewPic[] = [
        {
            nama: 'Andi Pratama',
            jabatan: 'Kepala Bidang Teknologi',
            kontak: 'andi.pratama@ngawikab.go.id',
            idAplikasi: insertedAplikasi[0].id,
        },
        {
            nama: 'Rina Susanti',
            jabatan: 'Administrator Sistem',
            kontak: 'rina.susanti@ngawikab.go.id',
            idAplikasi: insertedAplikasi[0].id,
        },
        {
            nama: 'Budi Hartono',
            jabatan: 'Kepala Seksi Kependudukan',
            kontak: 'budi.hartono@ngawikab.go.id',
            idAplikasi: insertedAplikasi[1].id,
        },
        {
            nama: 'Dr. Siti Nurhaliza',
            jabatan: 'Kepala Instalasi IT',
            kontak: 'siti.nurhaliza@rsudsoeroto.ngawikab.go.id',
            idAplikasi: insertedAplikasi[2].id,
        },
        {
            nama: 'Ahmad Fadli',
            jabatan: 'Developer',
            kontak: 'ahmad.fadli@ngawikab.go.id',
            idAplikasi: insertedAplikasi[3].id,
        },
    ];

    const insertedPic = await db
        .insert(pic)
        .values(picData)
        .returning();
    console.log(`✅ Inserted ${insertedPic.length} PIC`);

    // Insert Aplikasi Vendor (Many-to-Many)
    const aplikasiVendorData: NewAplikasiVendor[] = [
        {
            idAplikasi: insertedAplikasi[0].id, // SIMK
            idVendor: insertedVendor[0].id, // PT. Teknologi Kreatif
        },
        {
            idAplikasi: insertedAplikasi[1].id, // E-KTP
            idVendor: insertedVendor[1].id, // CV. Solusi Digital
        },
        {
            idAplikasi: insertedAplikasi[2].id, // SIRS
            idVendor: insertedVendor[2].id, // PT. Inovasi Masa Depan
        },
        {
            idAplikasi: insertedAplikasi[3].id, // Pengaduan Masyarakat
            idVendor: insertedVendor[0].id, // PT. Teknologi Kreatif
        },
        {
            idAplikasi: insertedAplikasi[4].id, // SIPPD
            idVendor: insertedVendor[1].id, // CV. Solusi Digital
        },
    ];

    const insertedAplikasiVendor = await db
        .insert(aplikasiVendor)
        .values(aplikasiVendorData)
        .returning();
    console.log(`✅ Inserted ${insertedAplikasiVendor.length} aplikasi-vendor relationships`);

    console.log('🎉 Database seeded successfully!');
}

seed()
    .catch((error) => {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });