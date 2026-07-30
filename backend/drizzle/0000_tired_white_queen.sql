CREATE TABLE "absensi" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tanggal" date NOT NULL,
	"check_in" timestamp with time zone,
	"check_out" timestamp with time zone,
	"status" text NOT NULL,
	"main_category" text,
	"sub_category" text,
	"face_verified" boolean DEFAULT false,
	"photos" jsonb DEFAULT '[]',
	"keterangan" text DEFAULT '',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"account_id" text NOT NULL,
	"password" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" text DEFAULT 'karyawan',
	"status" text DEFAULT 'pending',
	"email_verified" boolean DEFAULT false,
	"image" text,
	"jabatan" text,
	"phone" text,
	"alamat" text,
	"face_descriptor" text,
	"rejection_notes" text DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengajuan" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"jenis" text NOT NULL,
	"tanggal_mulai" date NOT NULL,
	"tanggal_selesai" date NOT NULL,
	"alasan" text NOT NULL,
	"status" text DEFAULT 'pending',
	"catatan" text DEFAULT '',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengajuan" ADD CONSTRAINT "pengajuan_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "absensi_user_id_tanggal_idx" ON "absensi" USING btree ("user_id","tanggal");--> statement-breakpoint
CREATE INDEX "absensi_tanggal_status_idx" ON "absensi" USING btree ("tanggal","status");--> statement-breakpoint
CREATE INDEX "pengajuan_user_id_idx" ON "pengajuan" USING btree ("user_id");