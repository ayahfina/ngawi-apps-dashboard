import {
    pgTable,
    serial,
    varchar,
    text,
    integer,
    bigint,
    timestamp,
    index
} from "drizzle-orm/pg-core";

// Perangkat Daerah (Government Agencies)
export const perangkatDaerah = pgTable("perangkat_daerah", {
    id: serial("id").primaryKey(),
    nama: varchar("nama", { length: 255 }).notNull(),
    jenis: varchar("jenis", { length: 100 }),
    alamat: text("alamat"),
    kepalaDinas: varchar("kepala_dinas", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    namaIndex: index("perangkat_daerah_nama_idx").on(table.nama),
}));

// Bahasa Pemrograman (Programming Languages)
export const bahasaPemrograman = pgTable("bahasa_pemrograman", {
    id: serial("id").primaryKey(),
    nama: varchar("nama", { length: 100 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    namaIndex: index("bahasa_pemrograman_nama_idx").on(table.nama),
}));

// Framework
export const framework = pgTable("framework", {
    id: serial("id").primaryKey(),
    nama: varchar("nama", { length: 100 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    namaIndex: index("framework_nama_idx").on(table.nama),
}));

// Aplikasi (Applications)
export const aplikasi = pgTable("aplikasi", {
    id: serial("id").primaryKey(),
    nama: varchar("nama", { length: 255 }).notNull(),
    deskripsi: text("deskripsi"),
    status: varchar("status", { length: 50 }), // aktif, tidak aktif, pengembangan, dll
    platform: varchar("platform", { length: 50 }), // web, mobile, desktop, dll
    urlAplikasi: text("url_aplikasi"),
    tahunDibuat: integer("tahun_dibuat"),
    anggaran: bigint("anggaran"),
    idPerangkatDaerah: integer("id_perangkat_daerah").references(() => perangkatDaerah.id, { onDelete: "set null" }),
    idBahasa: integer("id_bahasa").references(() => bahasaPemrograman.id, { onDelete: "set null" }),
    idFramework: integer("id_framework").references(() => framework.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    namaIndex: index("aplikasi_nama_idx").on(table.nama),
    statusIndex: index("aplikasi_status_idx").on(table.status),
    perangkatDaerahIndex: index("aplikasi_perangkat_daerah_idx").on(table.idPerangkatDaerah),
}));

// PIC (Person In Charge)
export const pic = pgTable("pic", {
    id: serial("id").primaryKey(),
    nama: varchar("nama", { length: 255 }).notNull(),
    jabatan: varchar("jabatan", { length: 255 }),
    kontak: varchar("kontak", { length: 100 }),
    idAplikasi: integer("id_aplikasi").references(() => aplikasi.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    aplikasiIndex: index("pic_aplikasi_idx").on(table.idAplikasi),
    namaIndex: index("pic_nama_idx").on(table.nama),
}));

// Vendor
export const vendor = pgTable("vendor", {
    id: serial("id").primaryKey(),
    namaVendor: varchar("nama_vendor", { length: 255 }).notNull(),
    kontak: varchar("kontak", { length: 100 }),
    alamat: text("alamat"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    namaVendorIndex: index("vendor_nama_vendor_idx").on(table.namaVendor),
}));

// Aplikasi Vendor (Many-to-Many Relationship)
export const aplikasiVendor = pgTable("aplikasi_vendor", {
    id: serial("id").primaryKey(),
    idAplikasi: integer("id_aplikasi").references(() => aplikasi.id, { onDelete: "cascade" }),
    idVendor: integer("id_vendor").references(() => vendor.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    aplikasiVendorUnique: index("aplikasi_vendor_unique_idx").on(table.idAplikasi, table.idVendor),
}));

// Export types for TypeScript
export type PerangkatDaerah = typeof perangkatDaerah.$inferSelect;
export type NewPerangkatDaerah = typeof perangkatDaerah.$inferInsert;

export type BahasaPemrograman = typeof bahasaPemrograman.$inferSelect;
export type NewBahasaPemrograman = typeof bahasaPemrograman.$inferInsert;

export type Framework = typeof framework.$inferSelect;
export type NewFramework = typeof framework.$inferInsert;

export type Aplikasi = typeof aplikasi.$inferSelect;
export type NewAplikasi = typeof aplikasi.$inferInsert;

export type Pic = typeof pic.$inferSelect;
export type NewPic = typeof pic.$inferInsert;

export type Vendor = typeof vendor.$inferSelect;
export type NewVendor = typeof vendor.$inferInsert;

export type AplikasiVendor = typeof aplikasiVendor.$inferSelect;
export type NewAplikasiVendor = typeof aplikasiVendor.$inferInsert;