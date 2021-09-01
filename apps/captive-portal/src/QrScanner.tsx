import * as React from "react"
import QrScanner from "qr-scanner"
import QrScannerWorkerPath from "!!file-loader!../../../node_modules/qr-scanner/qr-scanner-worker.min.js"
QrScanner.WORKER_PATH = QrScannerWorkerPath

type Scanner = {
  start: () => void
  stop: () => void
}

const QrScannerComponent: React.FC<{
  onError: (error: string) => void
  onScan: (code: string) => void
  onReady: (scanner: Scanner) => void
}> = ({ onError, onReady, onScan }) => {
  const videoRef = React.useRef()
  let scanner
  React.useEffect(() => {
    scanner = new QrScanner(videoRef.current, onScan, onError)
    onReady(scanner)
  }, [])

  return <video ref={videoRef} />
}

export default QrScannerComponent
export { Scanner }
