// Ubah angka ini untuk switch versi: 1 = Table, 3 = Card split-layout (terbaru)
const VERSION = 3

import AdminKaryawanPageV1 from './AdminKaryawanPage.v1'
import AdminKaryawanPageV3 from './AdminKaryawanPage.v3'

const pages: Record<number, React.ComponentType> = {
  1: AdminKaryawanPageV1,
  3: AdminKaryawanPageV3,
}

const Page = pages[VERSION] || AdminKaryawanPageV3

export default function AdminKaryawanPage() {
  return <Page />
}
