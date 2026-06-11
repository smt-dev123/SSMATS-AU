import { Button } from '@radix-ui/themes'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { useState, useEffect } from 'react'
import { FaPrint } from 'react-icons/fa'

const PDFDownload = ({
  document,
  fileName,
}: {
  document: any
  fileName: string
}) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <span className="bg-green-400 text-white px-4 py-1 rounded cursor-not-allowed opacity-70">
        កំពុងរៀបចំ...
      </span>
    )
  }

  return (
    <PDFDownloadLink document={document} fileName={fileName}>
      {({ loading }: { loading: boolean }) => (
        <Button variant="soft" color="violet" style={{ cursor: 'pointer' }}>
          <FaPrint />
          {loading ? 'កំពុងរៀបចំ...' : 'ទាញយកជា PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}

export default PDFDownload
// import { Button } from '@radix-ui/themes'
// import { PDFDownloadLink } from '@react-pdf/renderer'
// import { FaFileAlt } from 'react-icons/fa'

// const PDFDownload = ({
//   document,
//   fileName,
// }: {
//   document: any
//   fileName: string
// }) => {
//   return (
//     <PDFDownloadLink document={document} fileName={fileName}>
//       {({ loading }: { loading: boolean }) => (
//         <Button variant="soft" color="green">
//           <FaFileAlt />
//           {loading ? 'កំពុងរៀបចំ...' : 'ទាញយកជា PDF'}
//         </Button>
//       )}
//     </PDFDownloadLink>
//   )
// }

// export default PDFDownload
