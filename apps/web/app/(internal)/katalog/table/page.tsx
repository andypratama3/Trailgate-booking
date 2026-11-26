"use client";
import { Button, DataTable, type DataTableColumn } from "@trailgate/ui";
import { KatalogNav } from "../_components/nav";
import { StateBlock } from "../_components/state-block";

interface BookingRow {
  id: string;
  nama: string;
  tanggal: string;
  status: string;
}

const ROWS: BookingRow[] = [
  { id: "TG-2026-0001", nama: "Pak Joko (8)", tanggal: "24 Nov 2026", status: "Lunas" },
  { id: "TG-2026-0002", nama: "Tim Rinjani (5)", tanggal: "25 Nov 2026", status: "Menunggu konfirmasi" },
  { id: "TG-2026-0003", nama: "Mas Dimas (2)", tanggal: "26 Nov 2026", status: "Menahan kuota" },
];

const COLUMNS: DataTableColumn<BookingRow>[] = [
  { id: "id", header: "Booking", cell: (r) => <span className="font-medium">{r.id}</span>, primary: true },
  { id: "nama", header: "Rombongan", cell: (r) => r.nama },
  { id: "tanggal", header: "Tanggal", cell: (r) => r.tanggal },
  { id: "status", header: "Status", cell: (r) => r.status },
];

export default function KatalogTablePage() {
  return (
    <div className="flex flex-col gap-6">
      <KatalogNav current="/katalog/table" />
      <h1 className="text-2xl font-semibold text-fg">DataTable</h1>
      <p className="text-base text-fg-muted">
        Tabel data dasar — versi penuh (kolom kaku, export, paginasi) = T-186.
      </p>

      <StateBlock title="Default" description="Header scope=col semantik.">
        <DataTable columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} caption="Daftar booking jalur A" />
      </StateBlock>

      <StateBlock title="Loading" description="aria-busy + skeleton baris + role=status.">
        <DataTable columns={COLUMNS} rows={[]} rowKey={(r) => r.id} caption="Daftar booking" loading />
      </StateBlock>

      <StateBlock title="Empty" description="Baris kosong → pesan dalam tbody.">
        <DataTable columns={COLUMNS} rows={[]} rowKey={(r) => r.id} caption="Daftar booking" emptyMessage="Belum ada booking yang terdaftar." />
      </StateBlock>

      <StateBlock title="Error" description="role=alert + Coba lagi.">
        <DataTable
          columns={COLUMNS}
          rows={[]}
          rowKey={(r) => r.id}
          caption="Daftar booking"
          error="Daftar booking tidak bisa dimuat."
          onRetry={() => undefined}
        />
      </StateBlock>

      <StateBlock title="Aksi per baris">
        <DataTable
          columns={COLUMNS}
          rows={ROWS.slice(0, 2)}
          rowKey={(r) => r.id}
          caption="Daftar booking dengan aksi"
          actions={() => <Button size="sm" variant="outline">Detail</Button>}
        />
      </StateBlock>
    </div>
  );
}
