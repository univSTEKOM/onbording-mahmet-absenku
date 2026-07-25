// Ubah angka ini untuk switch versi: 1 = Table (lama), 2 = Card (baru)
const VERSION = 2

import AdminKaryawanPageV1 from './AdminKaryawanPage.v1'
import AdminKaryawanPageV2 from './AdminKaryawanPage.v2'

export default function AdminKaryawanPage() {
  return VERSION === 1 ? <AdminKaryawanPageV1 /> : <AdminKaryawanPageV2 />
}
