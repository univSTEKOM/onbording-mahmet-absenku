// Ubah angka ini untuk switch versi: 1 = Table, 2 = Card (v2), 3 = Card split-layout (terbaru)
const VERSION = 3

import AdminKaryawanPageV1 from './AdminKaryawanPage.v1'
import AdminKaryawanPageV2 from './AdminKaryawanPage.v2'
import AdminKaryawanPageV3 from './AdminKaryawanPage.v3'

var pages: Record<number, React.ComponentType> = {
  1: AdminKaryawanPageV1,
  2: AdminKaryawanPageV2,
  3: AdminKaryawanPageV3,
}

var Page = pages[VERSION] || AdminKaryawanPageV3

export default function AdminKaryawanPage() {
  return <Page />
}
