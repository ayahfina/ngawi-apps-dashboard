CREATE TABLE "perangkat_daerah" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(255) NOT NULL,
	"jenis" varchar(100),
	"alamat" text,
	"kepala_dinas" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bahasa_pemrograman" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "framework" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aplikasi" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(255) NOT NULL,
	"deskripsi" text,
	"status" varchar(50),
	"platform" varchar(50),
	"url_aplikasi" text,
	"tahun_dibuat" integer,
	"anggaran" bigint,
	"id_perangkat_daerah" integer,
	"id_bahasa" integer,
	"id_framework" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pic" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(255) NOT NULL,
	"jabatan" varchar(255),
	"kontak" varchar(100),
	"id_aplikasi" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_vendor" varchar(255) NOT NULL,
	"kontak" varchar(100),
	"alamat" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aplikasi_vendor" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_aplikasi" integer,
	"id_vendor" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "bahasa_pemrograman_nama_unique" ON "bahasa_pemrograman" ("nama");
--> statement-breakpoint
CREATE UNIQUE INDEX "framework_nama_unique" ON "framework" ("nama");
--> statement-breakpoint
CREATE INDEX "perangkat_daerah_nama_idx" ON "perangkat_daerah" ("nama");
--> statement-breakpoint
CREATE INDEX "bahasa_pemrograman_nama_idx" ON "bahasa_pemrograman" ("nama");
--> statement-breakpoint
CREATE INDEX "framework_nama_idx" ON "framework" ("nama");
--> statement-breakpoint
CREATE INDEX "aplikasi_nama_idx" ON "aplikasi" ("nama");
--> statement-breakpoint
CREATE INDEX "aplikasi_status_idx" ON "aplikasi" ("status");
--> statement-breakpoint
CREATE INDEX "aplikasi_perangkat_daerah_idx" ON "aplikasi" ("id_perangkat_daerah");
--> statement-breakpoint
CREATE INDEX "pic_aplikasi_idx" ON "pic" ("id_aplikasi");
--> statement-breakpoint
CREATE INDEX "pic_nama_idx" ON "pic" ("nama");
--> statement-breakpoint
CREATE INDEX "vendor_nama_vendor_idx" ON "vendor" ("nama_vendor");
--> statement-breakpoint
CREATE INDEX "aplikasi_vendor_unique_idx" ON "aplikasi_vendor" ("id_aplikasi", "id_vendor");
--> statement-breakpoint
ALTER TABLE "aplikasi" ADD CONSTRAINT "aplikasi_id_perangkat_daerah_perangkat_daerah_id_fk" FOREIGN KEY ("id_perangkat_daerah") REFERENCES "perangkat_daerah"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "aplikasi" ADD CONSTRAINT "aplikasi_id_bahasa_bahasa_pemrograman_id_fk" FOREIGN KEY ("id_bahasa") REFERENCES "bahasa_pemrograman"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "aplikasi" ADD CONSTRAINT "aplikasi_id_framework_framework_id_fk" FOREIGN KEY ("id_framework") REFERENCES "framework"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "pic" ADD CONSTRAINT "pic_id_aplikasi_aplikasi_id_fk" FOREIGN KEY ("id_aplikasi") REFERENCES "aplikasi"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "aplikasi_vendor" ADD CONSTRAINT "aplikasi_vendor_id_aplikasi_aplikasi_id_fk" FOREIGN KEY ("id_aplikasi") REFERENCES "aplikasi"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "aplikasi_vendor" ADD CONSTRAINT "aplikasi_vendor_id_vendor_vendor_id_fk" FOREIGN KEY ("id_vendor") REFERENCES "vendor"("id") ON DELETE cascade ON UPDATE no action;